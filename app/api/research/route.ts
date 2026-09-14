import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    console.log("===== RESEARCH API CALLED =====");

    const apiKey = process.env.GEMINI_API_KEY;

    console.log("API KEY STATUS:", apiKey ? "FOUND" : "MISSING");

    if (!apiKey) {
      return Response.json(
        {
          error: "GEMINI_API_KEY is missing from .env.local",
        },
        { status: 500 }
      );
    }

    const { question } = await request.json();

    if (!question?.trim()) {
      return Response.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Analyze this research question and give a clear answer with reasoning:

${question}`,
    });

    console.log("===== GEMINI RESPONSE RECEIVED =====");

    return Response.json({
      answer: response.text,
    });
  } catch (error) {
    console.error("===== GEMINI ERROR =====");
    console.error(error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}