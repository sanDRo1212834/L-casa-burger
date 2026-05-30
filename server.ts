import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
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
      if (mensagemCliente === "2" || mensagemCliente.toLowerCase().includes("status")) {
          if (!supabaseClient) {
            return res.json({ "reply": "Banco de dados não configurado. Por favor, contate o restaurante." });
          }
          const { data: pedidos, error } = await supabaseClient
              .from('orders')
              .select('status, id')
              .eq('phone', numeroCliente)
              .order('created_at', { ascending: false })
              .limit(1);

          if (error) throw error;

          if (pedidos && pedidos.length > 0) {
              const strStatus = pedidos[0].status === 'pending' ? 'Pendente' : pedidos[0].status === 'preparing' ? 'Preparo' : pedidos[0].status === 'ready' ? 'Pronto' : 'Entregue';
              return res.json({ "reply": `📋 *Status do Pedido:* O seu pedido está: *${strStatus}* 🍔` });
          } else {
              return res.json({ "reply": "Não encontrei nenhum pedido recente para este número. Faça seu pedido pelo link do cardápio!" });
          }
      }

      return res.json({ "reply": "Sistema La Casa Burguer online!" });

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
