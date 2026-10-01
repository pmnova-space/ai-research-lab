import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-2.5-flash";
const GROQ_MODEL = "openai/gpt-oss-20b";
const OPENROUTER_MODEL = "openrouter/free";

const researchSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    executiveSummary: { type: "string" },

    agents: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          role: { type: "string" },
          finding: { type: "string" },
          evidence: { type: "string" },
          concern: { type: "string" },
        },
        required: [
          "name",
          "role",
          "finding",
          "evidence",
          "concern",
        ],
      },
    },

    metrics: {
      type: "object",
      properties: {
        evidence: { type: "integer" },
        feasibility: { type: "integer" },
        novelty: { type: "integer" },
        risk: { type: "integer" },
      },
      required: [
        "evidence",
        "feasibility",
        "novelty",
        "risk",
      ],
    },

    futureActions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          priority: { type: "string" },
          action: { type: "string" },
          reason: { type: "string" },
          timeframe: { type: "string" },
        },
        required: [
          "priority",
          "action",
          "reason",
          "timeframe",
        ],
      },
    },

    limitations: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },

  required: [
    "title",
    "executiveSummary",
    "agents",
    "metrics",
    "futureActions",
    "limitations",
  ],
};

function buildPrompt(question: string) {
  return `
You are the coordinator of a five-agent research laboratory.

Research question:
"${question}"

Perform a serious research synthesis.

The five agents are:

1. Explorer — finds relevant facts, discoveries,
prior work and current evidence.

2. Scientist — explains scientific principles
and separates evidence from speculation.

3. Engineer — studies feasibility, technology,
resources, constraints and implementation.

4. Critic — tests assumptions, identifies uncertainty,
risks, missing evidence and counterarguments.

5. Nova — chief scientist who synthesizes the team
into a practical conclusion.

Return ONLY valid JSON matching this structure:

${JSON.stringify(researchSchema)}

Important:
- Do not invent citations, missions, measurements or dates.
- Clearly distinguish established evidence from hypotheses.
- Metrics must be integers from 0 to 100.
- futureActions must contain concrete next research
  or engineering actions.
- Make each agent meaningfully different.
- Keep the answer useful and detailed.
- If the question concerns the Moon, consider lunar
  science, exploration, habitats, resources,
  communications, radiation, dust, power and logistics.
`;
}

function parseJSON(text: string) {
  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  return JSON.parse(cleaned);
}

/* ---------------- GEMINI ---------------- */

async function runGemini(question: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildPrompt(question),

    config: {
      responseMimeType: "application/json",
      responseSchema: researchSchema,

      temperature: 0.3,

      tools: [
        {
          googleSearch: {},
        },
      ],
    },
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  const report = parseJSON(text);

  const chunks =
    response.candidates?.[0]?.groundingMetadata
      ?.groundingChunks ?? [];

  const sources = chunks
    .map((chunk: any) => chunk?.web)
    .filter((web: any) => web?.uri)
    .map((web: any) => ({
      title: web.title || web.uri,
      uri: web.uri,
    }))
    .filter(
      (
        source: { title: string; uri: string },
        index: number,
        array: { title: string; uri: string }[]
      ) =>
        array.findIndex(
          (item) => item.uri === source.uri
        ) === index
    )
    .slice(0, 8);

  return {
    ...report,
    sources,
    model: GEMINI_MODEL,
    provider: "Gemini",
  };
}

/* ---------------- GROQ ---------------- */

async function runGroq(question: string) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },

      body: JSON.stringify({
        model: GROQ_MODEL,

        messages: [
          {
            role: "system",
            content:
              "You are a serious scientific research coordinator. Return ONLY valid JSON matching the requested research schema.",
          },

          {
            role: "user",
            content: buildPrompt(question),
          },
        ],

        temperature: 0.3,

        response_format: {
          type: "json_object",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Groq ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  const text =
    data?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error(
      "Groq returned an empty response."
    );
  }

  const report = parseJSON(text);

  return {
    ...report,
    sources: [],
    model: GROQ_MODEL,
    provider: "Groq",
  };
}

/* ---------------- OPENROUTER ---------------- */

async function runOpenRouter(question: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is missing"
    );
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SITE_URL ||
          "http://localhost:3000",
        "X-Title": "AI Research Lab",
      },

      body: JSON.stringify({
        model: OPENROUTER_MODEL,

        messages: [
          {
            role: "system",
            content:
              "You are a serious scientific research coordinator. Return ONLY valid JSON matching the requested research schema.",
          },

          {
            role: "user",
            content: buildPrompt(question),
          },
        ],

        temperature: 0.3,

        response_format: {
          type: "json_object",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenRouter ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  const text =
    data?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error(
      "OpenRouter returned an empty response."
    );
  }

  const report = parseJSON(text);

  return {
    ...report,
    sources: [],
    model: OPENROUTER_MODEL,
    provider: "OpenRouter",
  };
}

/* ---------------- MAIN API ---------------- */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const question =
      typeof body?.question === "string"
        ? body.question.trim()
        : "";

    if (!question) {
      return Response.json(
        {
          error: "Question is required.",
        },
        {
          status: 400,
        }
      );
    }

    const errors: string[] = [];

    /*
     * PROVIDER 1
     */

    try {
      const result = await runGemini(question);

      return Response.json(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        "GEMINI FAILED:",
        message
      );

      errors.push(
        `Gemini: ${message}`
      );
    }

    /*
     * PROVIDER 2
     */

    try {
      const result = await runGroq(question);

      return Response.json(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        "GROQ FAILED:",
        message
      );

      errors.push(
        `Groq: ${message}`
      );
    }

    /*
     * PROVIDER 3
     */

    try {
      const result =
        await runOpenRouter(question);

      return Response.json(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        "OPENROUTER FAILED:",
        message
      );

      errors.push(
        `OpenRouter: ${message}`
      );
    }

    /*
     * ALL PROVIDERS FAILED
     */

    console.error(
      "===== ALL PROVIDERS FAILED ====="
    );

    console.error(errors);

    return Response.json(
      {
        error:
          "All research providers failed.",
        details: errors,
      },
      {
        status: 503,
      }
    );
  } catch (error) {
    console.error(
      "===== API REQUEST ERROR =====",
      error
    );

    return Response.json(
      {
        error:
          "Unable to process the research request.",
      },
      {
        status: 500,
      }
    );
  }
}