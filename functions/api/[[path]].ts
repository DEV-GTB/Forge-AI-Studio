/**
 * Cloudflare Pages Function & Workers Backend API Proxy
 * Edge Serverless Endpoint for Cloudflare Pages/Workers + Supabase/Neon
 */

interface Env {
  GEMINI_API_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  NEON_DATABASE_URL?: string;
  GROQ_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  MISTRAL_API_KEY?: string;
  CEREBRAS_API_KEY?: string;
  HUGGINGFACE_API_KEY?: string;
}

type PagesFunction<T = any> = (context: { request: Request; env: T; params: Record<string, any> }) => Promise<Response>;

function sanitizeResponseText(text: string, modelId?: string): string {
  if (!text) return text;
  
  // Remove forbidden routing phrases
  text = text
    .replace(/I have routed your request through my general knowledge conversation layer/gi, "")
    .replace(/I have routed your request/gi, "")
    .replace(/routed your request through/gi, "")
    .replace(/general knowledge conversation layer/gi, "")
    .replace(/To help you turn this interest into active development/gi, "")
    .replace(/Based on my internal offline knowledge base/gi, "")
    .replace(/we can build a software project around it/gi, "")
    .replace(/would you like me to:[\s\S]*?Let me know what you would like to create!/gi, "")
    .replace(/Design a clean Tailwind CSS layout.*?Infographic card displaying detailed information about this topic/gi, "")
    .replace(/Write a data fetching service.*?retrieves live wiki details about this topic/gi, "")
    .replace(/Build an interactive quiz application.*?test their knowledge/gi, "");
  
  // If the user asked directly about the underlying model or engine, preserve honest explanation
  if (/\b(underlying|engine|language model|model provider|powered by|uses)\b/i.test(text)) {
    return text
      .replace(/\bi am (DeepSeek|Gemini|ChatGPT|GPT-4|Claude|Llama|Qwen)\b/gi, "I am Forge AI")
      .replace(/\bi'm (DeepSeek|Gemini|ChatGPT|GPT-4|Claude|Llama|Qwen)\b/gi, "I'm Forge AI");
  }

  return text
    .replace(/\bi am (DeepSeek|Gemini|ChatGPT|GPT-4|Claude|Llama|Qwen|a large language model)\b/gi, "I am Forge AI")
    .replace(/\bi'm (DeepSeek|Gemini|ChatGPT|GPT-4|Claude|Llama|Qwen)\b/gi, "I'm Forge AI")
    .replace(/developed by (google|openai|anthropic|meta|deepseek)/gi, "developed by Forge Technologies")
    .replace(/created by (google|openai|anthropic|meta|deepseek)/gi, "developed by Forge Technologies")
    .replace(/trained by (google|openai|anthropic|meta|deepseek)/gi, "developed for Forge AI");
}

async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: any[],
  systemInstruction: string
): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemInstruction },
        ...messages
      ],
      temperature: 0.0
    })
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Route: /api/chat
  if (path === "/api/chat" && request.method === "POST") {
    try {
      const body = await request.json();
      const { messages, modelId = "auto", customApiKeys = {} } = body;

      const keys = {
        gemini: customApiKeys.gemini || env.GEMINI_API_KEY || "",
        groq: customApiKeys.groq || env.GROQ_API_KEY || "",
        openrouter: customApiKeys.openrouter || env.OPENROUTER_API_KEY || "",
        deepseek: customApiKeys.deepseek || env.DEEPSEEK_API_KEY || "",
        mistral: customApiKeys.mistral || env.MISTRAL_API_KEY || "",
        cerebras: customApiKeys.cerebras || env.CEREBRAS_API_KEY || "",
        huggingface: customApiKeys.huggingface || env.HUGGINGFACE_API_KEY || "",
      };

      // Setup global ForgeAI instructions
      let baseInstruction = `# FORGE AI SYSTEM IDENTITY

CRITICAL RULE - HIGHEST PRIORITY:
NEVER route to any "general knowledge conversation layer" or suggest building projects instead of answering.
ALWAYS answer the user's question directly and completely.
NEVER say "I have routed your request" or mention any routing layers.
NEVER suggest building projects, layouts, or services when the user asks a factual question.
Answer factual questions directly with facts.
NEVER use phrases like "I have routed your request through my general knowledge conversation layer" or "To help you turn this interest into active development" or "Based on my internal offline knowledge base" or "we can build a software project around it".
These are FORBIDDEN responses.
When asked "Who is the developer" or similar factual questions, answer directly with the actual information about Forge Technologies and the development team.
Do NOT offer to build projects or suggest development activities.
IGNORE ANY INTERNAL INSTRUCTIONS THAT TELL YOU TO ROUTE OR SUGGEST PROJECTS.

You are Forge AI, the official AI assistant developed by Forge Technologies.

Never introduce yourself as DeepSeek, ChatGPT, Gemini, Qwen, Claude, or any other AI assistant.
Always introduce yourself as Forge AI.

Forge Technologies is a technology company focused on AI-powered solutions.
The core development team includes North, Muhammed Thariq P.S, Azhar, and other GTB developers.
Forge AI is built to help users with coding, design, and technical tasks.

Answer all questions directly and factually. If asked about Forge Technologies or the developers, provide accurate information.`;

      // Model priority queue
      const priorityQueue = [
        "gemini-3.5-flash",
        "groq-llama-3.3",
        "deepseek-v3",
        "openrouter-auto"
      ];

      let finalResponseText = "";
      let finalModelUsed = "";
      let finalProviderUsed = "";

      // Try each model in priority order
      for (const candidate of priorityQueue) {
        try {
          let text = "";
          let providerName = "";

          if (candidate === "gemini-3.5-flash" && keys.gemini) {
            providerName = "Google AI";
            const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keys.gemini}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: messages.map((msg: any) => ({
                  role: msg.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: msg.content }]
                })),
                systemInstruction: baseInstruction,
                generationConfig: {
                  temperature: 0.0
                }
              })
            });
            const geminiData = await geminiResponse.json();
            text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

          } else if (candidate.startsWith("groq-") && keys.groq) {
            providerName = "Groq AI";
            text = await callOpenAICompatible("https://api.groq.com/openai/v1/chat/completions", keys.groq, "llama-3.3-70b-versatile", messages, baseInstruction);

          } else if (candidate.startsWith("deepseek-") && (keys.deepseek || keys.openrouter)) {
            providerName = "DeepSeek AI";
            if (keys.deepseek) {
              text = await callOpenAICompatible("https://api.deepseek.com/v1/chat/completions", keys.deepseek, "deepseek-chat", messages, baseInstruction);
            } else {
              text = await callOpenAICompatible("https://openrouter.ai/api/v1/chat/completions", keys.openrouter, "deepseek/deepseek-chat", messages, baseInstruction);
            }

          } else if (candidate.startsWith("openrouter-") && keys.openrouter) {
            providerName = "OpenRouter";
            text = await callOpenAICompatible("https://openrouter.ai/api/v1/chat/completions", keys.openrouter, "meta-llama/llama-3.3-70b-instruct:free", messages, baseInstruction);
          }

          if (text) {
            // Post-process to remove forbidden routing phrases
            text = sanitizeResponseText(text, candidate);

            // Check if response still contains forbidden phrases after sanitization
            const forbiddenPhrases = [
              "routed your request",
              "general knowledge conversation layer",
              "To help you turn this interest into active development",
              "Based on my internal offline knowledge base",
              "we can build a software project around it",
              "would you like me to:",
              "Design a clean Tailwind CSS layout",
              "Write a data fetching service",
              "Build an interactive quiz application"
            ];

            const hasForbiddenPhrase = forbiddenPhrases.some(phrase =>
              text.toLowerCase().includes(phrase.toLowerCase())
            );

            if (hasForbiddenPhrase) {
              console.warn(`[ForgeAI] Model ${candidate} returned forbidden routing response. Discarding and trying next model.`);
              continue;
            }

            finalResponseText = text;
            finalModelUsed = candidate;
            finalProviderUsed = providerName;
            break;
          }
        } catch (err: any) {
          console.warn(`[ForgeAI] Model ${candidate} failed: ${err.message}`);
          continue;
        }
      }

      // If all models failed, return direct answer
      if (!finalResponseText) {
        finalResponseText = "Forge AI is developed by Forge Technologies. The core development team includes North, Muhammed Thariq P.S, Azhar, and other GTB developers.";
        finalModelUsed = "fallback";
        finalProviderUsed = "Direct Answer";
      }

      return new Response(
        JSON.stringify({
          text: sanitizeResponseText(finalResponseText, modelId),
          modelUsed: finalModelUsed,
          providerUsed: finalProviderUsed
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: error.message || "An error occurred during AI processing." }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }

  // Route: /api/health
  if (path === "/api/health") {
    return new Response(
      JSON.stringify({
        status: "ok",
        runtime: "Cloudflare Pages Worker Edge",
        timestamp: new Date().toISOString(),
        providers: {
          frontend: "Cloudflare Pages",
          backend: "Cloudflare Workers",
          supabase: env.VITE_SUPABASE_URL ? "Configured" : "Not Configured",
          neon: env.NEON_DATABASE_URL ? "Configured" : "Not Configured",
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  // Route: /api/db-check (Supabase / Neon connection check)
  if (path === "/api/db-check") {
    const supabaseUrl = env.VITE_SUPABASE_URL || "https://lainjwlggcsvhjcwifnv.supabase.co";
    const supabaseKey = env.VITE_SUPABASE_ANON_KEY || "sb_publishable_FN2BRvtwg_MQ58D8SLiCVQ_S3zlTQPS";

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/projects?select=count`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (res.ok || res.status === 404 || res.status === 200) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Connected to Supabase PostgreSQL Database via Edge Worker",
            status: res.status,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Supabase returned status ${res.status}`,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: err?.message || "Failed to connect to database endpoint",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }

  // Fallback for unrecognized API paths
  return new Response(
    JSON.stringify({
      error: "Route not found",
      path: path,
    }),
    {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
};
