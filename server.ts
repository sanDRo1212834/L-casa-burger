import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCkAUN3nyiVNXX_Fdrw4fSrVmewN4rkr_Y";
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API route for Pix validation
  app.post("/api/verify-pix", async (req, res) => {
    try {
      const { image, expectedAmount } = req.body;

      if (!image || !expectedAmount) {
        return res
          .status(400)
          .json({ error: "Missing image or expectedAmount" });
      }

      // Remove the prefix if it's there (e.g. data:image/png;base64,)
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            {
              text: `What is the payment amount on this Pix receipt? Analyze carefully. If it's a valid Pix receipt, confirm if the amount matches EXACTLY: ${expectedAmount}. Return JSON with valid: boolean, amount: number (found in receipt), message: string (reasoning/feedback).`,
            },
            { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              valid: {
                type: Type.BOOLEAN,
                description:
                  "True if it's a valid Pix receipt and the amount matches the expected amount.",
              },
              amount: {
                type: Type.NUMBER,
                description: "The amount found on the receipt.",
              },
              message: {
                type: Type.STRING,
                description: "A brief message explaining the result.",
              },
            },
            required: ["valid", "amount", "message"],
          },
        },
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);

      res.json(result);
    } catch (err: any) {
      console.error("Error verifying pixel:", err);
      res.status(500).json({ error: err.message || "Failed to verify PIX" });
    }
  });

  // Autoresponder webhook
  app.post("/api/autoresponder", async (req, res) => {
    try {
      const data = req.body;
      const numeroCliente = data.phone;
      const arquivoBase64 = data.file;
      const tipoMime = data.mime || "image/jpeg";

      // Initialize Supabase only if configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      
      let supabaseClient = null;
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")) {
        const { createClient } = await import("@supabase/supabase-js");
        supabaseClient = createClient(supabaseUrl, supabaseKey);
      }

      if (arquivoBase64) {
          const ai = getAIClient();
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [
              "Analise este comprovante de PIX. Extraia o valor exato em Reais (R$), o nome do pagador e a data. Responda estritamente no formato: VALOR: R$ XX,XX | PAGADOR: Nome | DATA: DD/MM. Se não for um comprovante, responda apenas: 'Arquivo inválido'.",
              { inlineData: { data: arquivoBase64.replace(/^data:image\/\w+;base64,/, ""), mimeType: tipoMime } }
            ]
          });
          const resultadoLeitura = response.text || "";
          
          if (resultadoLeitura.includes("Arquivo inválido") || resultadoLeitura.toLowerCase().includes("inválido")) {
            return res.json({ "reply": "⚠️ Desculpe, a imagem enviada não parece ser um comprovante de PIX válido. Por favor, envie a foto correta." });
          }

          if (supabaseClient) {
            await supabaseClient
                .from('orders')
                .update({ status: 'preparing' })
                .eq('phone', numeroCliente); 
          }

          return res.json({ 
              "reply": `✅ *Comprovante Recebido!* \n\nO sistema identificou:\n📝 ${resultadoLeitura}\n\nSeu pedido da *La Casa Burguer* foi confirmado e já está na cozinha! 🍔🔥` 
          });
      }

      const mensagemCliente = data.message ? data.message.trim() : "";
      
      let aiResponseText = "Sistema La Casa Burguer online!";

      if (mensagemCliente) {
        if (!supabaseClient) {
          return res.json({ "reply": "Banco de dados não configurado. Por favor, contate o restaurante." });
        }

        const ai = getAIClient();
        
        // Save user message to Supabase
        await supabaseClient.from('chat_messages').insert({
          phone: numeroCliente,
          role: 'user',
          content: mensagemCliente
        });

        // Fetch user's recent orders for context
        const { data: pedidos } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('phone', numeroCliente)
            .order('created_at', { ascending: false })
            .limit(3);

        let orderContext = "O cliente não tem pedidos recentes.";
        if (pedidos && pedidos.length > 0) {
            orderContext = "Pedidos recentes do cliente:\n" + pedidos.map((p: any) => 
                `- Pedido #${p.id.slice(0,4)} | Status: ${p.status} | Total: R$ ${p.total}`
            ).join("\n");
        }

        // Fetch recent chat history
        const { data: chatHistory } = await supabaseClient
            .from('chat_messages')
            .select('role, content')
            .eq('phone', numeroCliente)
            .order('created_at', { ascending: true })
            .limit(10);

        const historyContents = chatHistory ? chatHistory.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        })) : [];

        // Fetch products and categories for context
        const { data: categories } = await supabaseClient
            .from('categories')
            .select('*');
            
        const { data: products } = await supabaseClient
            .from('products')
            .select('*');

        let menuContext = "Cardápio indisponível no momento.";
        if (categories && products) {
            menuContext = "Cardápio La Casa Burguer:\n";
            categories.forEach((cat: any) => {
                menuContext += `\n**${cat.name}**\n`;
                const catProducts = products.filter((p: any) => p.category_id === cat.id);
                catProducts.forEach((p: any) => {
                    menuContext += `- ${p.name} (R$ ${p.price}): ${p.description || 'Sem descrição'}\n`;
                });
            });
        }

        const storeLink = "https://la-casa-burger.netlify.app"; // Ou o link da sua loja no Netlify/vercel etc

        const systemPrompt = `Você é o assistente virtual inteligente da hamburgueria La Casa Burguer.
Seja sempre educado, claro e objetivo. Use emojis amigáveis (🍔, 🍟, 🥤, 😊).
Você deve ajudar o cliente a tirar dúvidas sobre o cardápio, ver o status do seu pedido e guiar o cliente em como fazer um pedido.

**Informações importantes:**
- O link para realizar pedidos é: ${storeLink} (você deve recomendar esse link quando o usuário quiser fazer um pedido).
- Horário de funcionamento: de Quarta a Segunda, das 18:30 às 23:30 (folga nas terças).

**Histórico de pedidos deste cliente:**
${orderContext}

**Cardápio Atualizado:**
${menuContext}

Regras:
1. Se o cliente quiser pedir, indique o link: ${storeLink}
2. Se o cliente perguntar se tem um item, verifique na lista do Cardápio.
3. Responda de maneira concisa para o WhatsApp.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Entendido. Sou o assistente da La Casa Burguer." }] },
                ...historyContents
            ]
        });

        aiResponseText = response.text || "Desculpe, não consegui entender.";

        // Save AI response to Supabase
        await supabaseClient.from('chat_messages').insert({
          phone: numeroCliente,
          role: 'assistant',
          content: aiResponseText
        });
      }

      return res.json({ "reply": aiResponseText });

    } catch (error) {
      console.error("Autoresponder error:", error);
      return res.json({ "reply": "Recebi a mensagem, mas tive um probleminha para consultar o banco de dados agora. Um atendente já vai te ajudar!" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
