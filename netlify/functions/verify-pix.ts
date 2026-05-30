import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCkAUN3nyiVNXX_Fdrw4fSrVmewN4rkr_Y";
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
    });
  }
  return aiClient;
}

export const handler = async (event: any, context: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { image, expectedAmount } = JSON.parse(event.body || "{}");

    if (!image || !expectedAmount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing image or expectedAmount" })
      };
    }

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
              description: "True if it's a valid Pix receipt and the amount matches the expected amount.",
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

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };

  } catch (err: any) {
    console.error("Error verifying pixel:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Failed to verify PIX" })
    };
  }
};
