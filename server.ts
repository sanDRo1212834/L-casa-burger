import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

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
