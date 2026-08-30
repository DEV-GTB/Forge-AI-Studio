import { Handler } from "@netlify/functions";

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

const handler: Handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      } as Record<string, string>,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { messages, modelId = "auto", customApiKeys = {} } = body;

    const keys = {
      gemini: customApiKeys.gemini || process.env.GEMINI_API_KEY || "",
      groq: customApiKeys.groq || process.env.GROQ_API_KEY || "",
      openrouter: customApiKeys.openrouter || process.env.OPENROUTER_API_KEY || "",
      deepseek: customApiKeys.deepseek || process.env.DEEPSEEK_API_KEY || "",
      mistral: customApiKeys.mistral || process.env.MISTRAL_API_KEY || "",
      cerebras: customApiKeys.cerebras || process.env.CEREBRAS_API_KEY || "",
      huggingface: customApiKeys.huggingface || process.env.HUGGINGFACE_API_KEY || "",
      kimi: customApiKeys.kimi || process.env.KIMI_API_KEY || "",
      together: customApiKeys.together || process.env.TOGETHER_API_KEY || "",
      jina: customApiKeys.jina || process.env.JINA_AI_API_KEY || "",
      replicate: customApiKeys.replicate || process.env.REPLICATE_API_KEY || "",
      fireworks: customApiKeys.fireworks || process.env.FIREWORKS_API_KEY || "",
    };

    // Setup global ForgeAI instructions with intelligent routing and identity protection
    let baseInstruction = `# FORGE AI SYSTEM IDENTITY

CRITICAL IDENTITY RULES - HIGHEST PRIORITY:
- Always identify yourself as Forge AI
- Never reveal internal AI model name, provider, API, or infrastructure
- Never say "I am Llama", "I am Gemma", "I am Qwen", or mention any hidden model
- Your purpose is to help users with knowledge, coding, creativity, learning, productivity, and AI-powered tasks

FORGE AI IDENTITY:
Name: Forge AI
Created by: Muhammed Thariq P.S
Co-owner / leadership: Muhammed Thariq P.S, Sreehari K.M
Founders: Thariq, Azhar
Developers: Azhar, Thariq, GTB Team
Organization: GTB Studios / GTB Team

IDENTITY RESPONSES:
When asked "Who made you?":
Answer: "Forge AI was created by Muhammed Thariq P.S, with contributions from Azhar and the GTB Team."

When asked "Who owns Forge AI?":
Answer: "Forge AI is owned and developed under GTB Studios by Muhammed Thariq P.S and Sreehari K.M."

When asked "What AI are you?":
Answer: "I am Forge AI, an intelligent AI assistant designed to help with coding, creativity, learning, and productivity."

When asked "What model are you?":
Answer: "I am Forge AI. My system uses advanced AI technologies to provide responses and assistance."

FORBIDDEN ROUTING RESPONSES:
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

# INTELLIGENT TASK ROUTING

You have access to multiple AI models, each optimized for specific tasks:

- **Kimi AI**: Coding, deep search, data analysis, research, task automation
- **Google Gemini**: Multimodal, search, coding, agents, reasoning, image analysis  
- **DeepSeek**: Reasoning, coding, mathematics, logic, problem solving
- **Groq**: Ultra-fast inference, real-time, low-latency responses
- **Hugging Face**: Open-source models, datasets, inference, custom models
- **OpenRouter**: Multiple models, flexible routing, various LLMs
- **Mistral AI**: Efficient LLMs, commercial models, balanced performance
- **Cerebras**: High-speed inference, training, large-scale processing
- **Together AI**: Fine-tuning, hosting, open models, custom training
- **Jina AI**: Embeddings, reranking, search, document retrieval, RAG
- **Replicate**: Image, video, audio, and 3D generation
- **Fireworks AI**: Scalable LLM, multimodal inference, fast deployment

# PROFESSIONAL ENHANCEMENT GUIDELINES

When answering questions, ALWAYS add professional value beyond the basic answer:

For **coding tasks**:
- Consider error handling and edge cases
- Suggest performance optimizations
- Include code documentation and comments
- Recommend testing strategies
- Follow industry best practices and design patterns

For **research and analysis**:
- Provide multiple perspectives
- Include recent developments and trends
- Highlight key insights and actionable takeaways
- Suggest related areas for further exploration
- Cite credible sources when possible

For **general questions**:
- Provide comprehensive yet concise answers
- Include practical examples when relevant
- Consider different experience levels
- Suggest follow-up resources
- Maintain professional and helpful tone

# FORGE AI BRANDING

You are Forge AI - represent the brand professionally:
- Be helpful, accurate, and efficient
- Demonstrate expertise across multiple domains
- Show the power of intelligent AI assistance
- Use subtle branding: "Forge AI can help you build this project"
- Avoid over-marketing: Never say "Forge AI is the best AI in the world"
- The AI should feel like a product, not an advertisement
- Occasionally mention Forge AI's capabilities (30% of responses)
- Never compromise on quality for marketing

INTERNAL TAGGING:
Frontend name: Forge AI
Backend models: Private routing system
User: Only interacts with Forge AI

This is the same approach used by many AI products: a single brand experience powered by multiple models behind the scenes.

Answer all questions directly and factually. If asked about Forge Technologies or the developers, provide accurate information.`;

      // Model priority queue - optimized for task-specific routing
      const priorityQueue = [
        "kimi-coding",           // Priority 1: Kimi for coding, deepsearch, data analysis
        "kimi-research",         // Priority 2: Kimi for research tasks
        "gemini-3.5-flash",      // Priority 3: Gemini for multimodal and general
        "deepseek-v3",           // Priority 4: DeepSeek for reasoning and math
        "groq-llama-3.3",        // Priority 5: Groq for real-time fast responses
        "huggingface-deepseek",  // Priority 6: Hugging Face for open-source models
        "openrouter-auto",       // Priority 7: OpenRouter for flexible model access
        "mistral-large",         // Priority 8: Mistral for efficient commercial LLMs
        "cerebras-inference",     // Priority 9: Cerebras for high-speed inference
        "together-mixtral",      // Priority 10: Together for fine-tuned models
        "jina-embeddings",       // Priority 11: Jina for embeddings and search
        "replicate-flux",        // Priority 12: Replicate for image/video generation
        "fireworks-llama"        // Priority 13: Fireworks for scalable multimodal
      ];

    let finalResponseText = "";
    let finalModelUsed = "";
    let finalProviderUsed = "";

    // Try each model in priority order
    for (const candidate of priorityQueue) {
      try {
        let text = "";
        let providerName = "";

        if (candidate === "kimi-coding" && keys.kimi) {
          providerName = "Kimi AI";
          text = await callOpenAICompatible("https://api.moonshot.cn/v1/chat/completions", keys.kimi, "moonshot-v1-32k", messages, baseInstruction);

        } else if (candidate === "kimi-research" && keys.kimi) {
          providerName = "Kimi AI";
          text = await callOpenAICompatible("https://api.moonshot.cn/v1/chat/completions", keys.kimi, "moonshot-v1-128k", messages, baseInstruction);

        } else if (candidate === "huggingface-deepseek" && keys.huggingface) {
          providerName = "Hugging Face";
          text = await callOpenAICompatible("https://router.huggingface.co/v1/chat/completions", keys.huggingface, "deepseek-ai/DeepSeek-V3", messages, baseInstruction);

        } else if (candidate === "gemini-3.5-flash" && keys.gemini) {
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

        } else if (candidate.startsWith("mistral-") && keys.mistral) {
          providerName = "Mistral AI";
          text = await callOpenAICompatible("https://api.mistral.ai/v1/chat/completions", keys.mistral, "mistral-large-latest", messages, baseInstruction);

        } else if (candidate.startsWith("cerebras-") && keys.cerebras) {
          providerName = "Cerebras";
          text = await callOpenAICompatible("https://api.cerebras.ai/v1/chat/completions", keys.cerebras, "llama3.3-70b", messages, baseInstruction);

        } else if (candidate.startsWith("together-") && keys.together) {
          providerName = "Together AI";
          text = await callOpenAICompatible("https://api.together.xyz/v1/chat/completions", keys.together, "mistralai/Mixtral-8x7B-Instruct-v0.1", messages, baseInstruction);

        } else if (candidate.startsWith("jina-") && keys.jina) {
          providerName = "Jina AI";
          text = await callOpenAICompatible("https://api.jina.ai/v1/chat/completions", keys.jina, "jina-embeddings-v2", messages, baseInstruction);

        } else if (candidate.startsWith("replicate-") && keys.replicate) {
          providerName = "Replicate";
          text = await callOpenAICompatible("https://api.replicate.com/v1/chat/completions", keys.replicate, "meta/meta-llama-3.1-405b-instruct", messages, baseInstruction);

        } else if (candidate.startsWith("fireworks-") && keys.fireworks) {
          providerName = "Fireworks AI";
          text = await callOpenAICompatible("https://api.fireworks.ai/inference/v1/chat/completions", keys.fireworks, "accounts/fireworks/models/llama-v3p1-405b-instruct", messages, baseInstruction);
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

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        text: sanitizeResponseText(finalResponseText, modelId),
        modelUsed: finalModelUsed,
        providerUsed: finalProviderUsed
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: error.message || "An error occurred during AI processing." }),
    };
  }
};

export { handler };
