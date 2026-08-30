// AI Model Routing Configuration for Forge AI
// Intelligently routes user requests to the best AI model based on task type

export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  specialties: string[];
  apiEndpoint?: string;
  modelId?: string;
  priority: number;
}

export const AI_MODELS: AIModelConfig[] = [
  {
    id: "kimi",
    name: "Kimi AI",
    provider: "Moonshot AI",
    specialties: ["coding", "deepsearch", "data analysis", "research", "task automation"],
    priority: 1
  },
  {
    id: "gemini",
    name: "Google Gemini",
    provider: "Google AI",
    specialties: ["multimodal", "search", "coding", "agents", "reasoning", "image analysis"],
    priority: 2
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    provider: "DeepSeek AI",
    specialties: ["reasoning", "coding", "mathematics", "logic", "problem solving"],
    priority: 3
  },
  {
    id: "groq",
    name: "Groq",
    provider: "Groq AI",
    specialties: ["fast inference", "real-time", "low-latency", "quick responses"],
    priority: 4
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    provider: "Hugging Face",
    specialties: ["open-source models", "datasets", "inference", "custom models"],
    priority: 5
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    provider: "OpenRouter",
    specialties: ["multiple models", "flexible routing", "various LLMs"],
    priority: 6
  },
  {
    id: "mistral",
    name: "Mistral AI",
    provider: "Mistral",
    specialties: ["efficient LLMs", "commercial models", "balanced performance"],
    priority: 7
  },
  {
    id: "cerebras",
    name: "Cerebras",
    provider: "Cerebras",
    specialties: ["high-speed inference", "training", "large-scale processing"],
    priority: 8
  },
  {
    id: "together",
    name: "Together AI",
    provider: "Together AI",
    specialties: ["fine-tuning", "hosting", "open models", "custom training"],
    priority: 9
  },
  {
    id: "jina",
    name: "Jina AI",
    provider: "Jina AI",
    specialties: ["embeddings", "reranking", "search", "document retrieval", "RAG"],
    priority: 10
  },
  {
    id: "replicate",
    name: "Replicate",
    provider: "Replicate",
    specialties: ["image generation", "video", "audio", "multimodal", "3D"],
    priority: 11
  },
  {
    id: "fireworks",
    name: "Fireworks AI",
    provider: "Fireworks",
    specialties: ["scalable LLM", "multimodal inference", "fast deployment"],
    priority: 12
  }
];

export type TaskType = 
  | "coding"
  | "deepsearch"
  | "data_analysis"
  | "research"
  | "multimodal"
  | "image_generation"
  | "video_generation"
  | "audio_generation"
  | "reasoning"
  | "mathematics"
  | "general"
  | "embeddings"
  | "search"
  | "fine_tuning"
  | "real_time";

export interface TaskClassification {
  taskType: TaskType;
  recommendedModel: AIModelConfig;
  confidence: number;
  reasoning: string;
}

// Task classification keywords and patterns
const TASK_PATTERNS: Record<TaskType, string[]> = {
  coding: [
    "code", "programming", "function", "class", "debug", "fix bug", "api", "react",
    "javascript", "python", "typescript", "html", "css", "algorithm", "data structure",
    "implement", "develop", "software", "web development", "app", "backend", "frontend"
  ],
  deepsearch: [
    "search", "find information", "research", "investigate", "look up", "deep dive",
    "comprehensive", "detailed analysis", "thorough", "extensive", "in-depth"
  ],
  data_analysis: [
    "analyze data", "statistics", "dataset", "csv", "json", "data processing",
    "visualization", "charts", "graphs", "metrics", "analytics", "insights"
  ],
  research: [
    "research", "study", "academic", "paper", "literature", "find sources",
    "scientific", "investigation", "explore", "discover"
  ],
  multimodal: [
    "image", "picture", "photo", "video", "audio", "visual", "analyze image",
    "describe image", "image recognition", "multimodal"
  ],
  image_generation: [
    "generate image", "create image", "make image", "draw", "paint", "artwork",
    "visualize", "design", "graphic", "illustration"
  ],
  video_generation: [
    "generate video", "create video", "make video", "animation", "motion",
    "video content", "video generation"
  ],
  audio_generation: [
    "generate audio", "create audio", "music", "sound", "speech", "voice",
    "audio synthesis", "sound design"
  ],
  reasoning: [
    "reason", "logic", "solve", "problem", "think", "analyze", "evaluate",
    "critical thinking", "deduction", "inference"
  ],
  mathematics: [
    "math", "calculate", "equation", "formula", "statistics", "probability",
    "algebra", "calculus", "geometry", "computation"
  ],
  general: [
    "help", "explain", "what is", "how to", "tell me", "describe", "overview",
    "introduction", "summary", "general question"
  ],
  embeddings: [
    "embedding", "vector", "similarity", "semantic search", "text encoding",
    "representation", "vector database"
  ],
  search: [
    "search", "find", "lookup", "retrieve", "query", "document search",
    "information retrieval"
  ],
  fine_tuning: [
    "fine-tune", "train", "customize model", "adapt", "personalize",
    "model training", "custom model"
  ],
  real_time: [
    "real-time", "live", "instant", "fast", "quick", "immediate",
    "low latency", "streaming"
  ]
};

// Classify user request and recommend best AI model
export function classifyTask(userQuery: string): TaskClassification {
  const lowerQuery = userQuery.toLowerCase();
  
  // Score each task type based on keyword matches
  const scores: Record<TaskType, number> = {
    coding: 0,
    deepsearch: 0,
    data_analysis: 0,
    research: 0,
    multimodal: 0,
    image_generation: 0,
    video_generation: 0,
    audio_generation: 0,
    reasoning: 0,
    mathematics: 0,
    general: 0,
    embeddings: 0,
    search: 0,
    fine_tuning: 0,
    real_time: 0
  };
  
  // Calculate scores based on keyword matches
  for (const [taskType, patterns] of Object.entries(TASK_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerQuery.includes(pattern)) {
        scores[taskType as TaskType] += 1;
      }
    }
  }
  
  // Find highest scoring task type
  let bestTask: TaskType = "general";
  let highestScore = 0;
  
  for (const [taskType, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestTask = taskType as TaskType;
    }
  }
  
  // Map task type to best AI model
  const recommendedModel = getBestModelForTask(bestTask);
  
  // Calculate confidence based on score
  const confidence = Math.min(highestScore / 3, 1); // Normalize to 0-1
  
  const reasoning = getReasoning(bestTask, recommendedModel);
  
  return {
    taskType: bestTask,
    recommendedModel,
    confidence,
    reasoning
  };
}

// Get best AI model for a given task type
function getBestModelForTask(taskType: TaskType): AIModelConfig {
  const taskToModelMap: Record<TaskType, string> = {
    coding: "kimi",
    deepsearch: "kimi",
    data_analysis: "kimi",
    research: "kimi",
    multimodal: "gemini",
    image_generation: "replicate",
    video_generation: "replicate",
    audio_generation: "replicate",
    reasoning: "deepseek",
    mathematics: "deepseek",
    general: "gemini",
    embeddings: "jina",
    search: "jina",
    fine_tuning: "together",
    real_time: "groq"
  };
  
  const modelId = taskToModelMap[taskType] || "gemini";
  return AI_MODELS.find(model => model.id === modelId) || AI_MODELS[0];
}

// Get reasoning for model selection
function getReasoning(taskType: TaskType, model: AIModelConfig): string {
  const reasons: Record<TaskType, string> = {
    coding: `Kimi AI is optimized for coding tasks with deep understanding of programming languages and best practices.`,
    deepsearch: `Kimi AI excels at comprehensive research and deep search capabilities for thorough information gathering.`,
    data_analysis: `Kimi AI provides advanced data analysis tools for processing and visualizing complex datasets.`,
    research: `Kimi AI is designed for research tasks with access to extensive knowledge bases and analytical tools.`,
    multimodal: `Google Gemini offers superior multimodal capabilities for processing and understanding images, videos, and text together.`,
    image_generation: `Replicate provides access to state-of-the-art image generation models for creating high-quality visuals.`,
    video_generation: `Replicate specializes in video generation with advanced AI models for motion content.`,
    audio_generation: `Replicate offers powerful audio generation capabilities for music, speech, and sound design.`,
    reasoning: `DeepSeek provides advanced reasoning capabilities for complex logical problems and critical thinking tasks.`,
    mathematics: `DeepSeek excels at mathematical computations and problem-solving with high precision.`,
    general: `Google Gemini provides balanced performance for general queries with broad knowledge coverage.`,
    embeddings: `Jina AI specializes in embeddings and semantic search for advanced text understanding.`,
    search: `Jina AI offers superior search and retrieval capabilities for finding relevant information.`,
    fine_tuning: `Together AI provides fine-tuning and custom model training capabilities for specialized use cases.`,
    real_time: `Groq delivers ultra-fast inference for real-time applications requiring low latency.`
  };
  
  return reasons[taskType] || `${model.name} is selected based on its capabilities for this task type.`;
}

// Get Forge AI enhancement prompt based on task
export function getForgeAIEnhancement(taskType: TaskType): string {
  const enhancements: Record<TaskType, string> = {
    coding: `
    
    **Forge AI Professional Enhancement:**
    - Consider adding error handling and edge cases
    - Suggest performance optimizations
    - Include code documentation and comments
    - Recommend testing strategies
    - Follow industry best practices and design patterns`,
    
    deepsearch: `
    
    **Forge AI Research Enhancement:**
    - Provide multiple perspectives on the topic
    - Include recent developments and trends
    - Cite credible sources when possible
    - Highlight key insights and actionable takeaways
    - Suggest related areas for further exploration`,
    
    data_analysis: `
    
    **Forge AI Analytics Enhancement:**
    - Provide statistical significance where applicable
    - Suggest visualization techniques
    - Identify patterns and correlations
    - Recommend data-driven insights
    - Consider business implications`,
    
    research: `
    
    **Forge AI Academic Enhancement:**
    - Structure findings with clear methodology
    - Include relevant background context
    - Highlight key contributions or discoveries
    - Suggest practical applications
    - Note limitations and future research directions`,
    
    multimodal: `
    
    **Forge AI Multimodal Enhancement:**
    - Provide detailed analysis of visual content
    - Cross-reference with textual information
    - Suggest practical applications
    - Consider accessibility implications
    - Recommend related multimodal tools`,
    
    image_generation: `
    
    **Forge AI Creative Enhancement:**
    - Suggest style variations and alternatives
    - Recommend technical specifications
    - Consider brand consistency
    - Provide usage recommendations
    - Suggest complementary visual elements`,
    
    video_generation: `
    
    **Forge AI Video Enhancement:**
    - Recommend optimal formats and resolutions
    - Suggest editing and post-processing tips
    - Consider platform-specific requirements
    - Provide audio synchronization guidance
    - Suggest distribution strategies`,
    
    audio_generation: `
    
    **Forge AI Audio Enhancement:**
    - Recommend audio quality standards
    - Suggest mixing and mastering tips
    - Consider platform compatibility
    - Provide copyright guidance
    - Suggest complementary audio elements`,
    
    reasoning: `
    
    **Forge AI Logic Enhancement:**
    - Break down complex problems systematically
    - Provide step-by-step reasoning
    - Consider alternative approaches
    - Validate assumptions
    - Suggest verification methods`,
    
    mathematics: `
    
    **Forge AI Math Enhancement:**
    - Show detailed calculation steps
    - Provide context and real-world applications
    - Suggest verification methods
    - Consider numerical precision
    - Recommend computational tools`,
    
    general: `
    
    **Forge AI Professional Enhancement:**
    - Provide comprehensive yet concise answers
    - Include practical examples when relevant
    - Consider different experience levels
    - Suggest follow-up resources
    - Maintain professional and helpful tone`,
    
    embeddings: `
    
    **Forge AI Semantic Enhancement:**
    - Explain embedding dimensions and meaning
    - Suggest similarity thresholds
    - Recommend preprocessing techniques
    - Consider computational efficiency
    - Provide implementation guidance`,
    
    search: `
    
    **Forge AI Search Enhancement:**
    - Optimize query strategies
    - Suggest filtering and ranking approaches
    - Consider relevance scoring
    - Recommend result presentation
    - Provide search analytics insights`,
    
    fine_tuning: `
    
    **Forge AI Training Enhancement:**
    - Recommend dataset preparation strategies
    - Suggest hyperparameter tuning
    - Consider computational resources
    - Provide evaluation metrics
    - Recommend deployment strategies`,
    
    real_time: `
    
    **Forge AI Performance Enhancement:**
    - Optimize for low latency
    - Suggest caching strategies
    - Consider scalability requirements
    - Recommend monitoring approaches
    - Provide performance benchmarks`
  };
  
  return enhancements[taskType] || "";
}

// Get Forge AI marketing message (occasional)
export function getForgeAIMarketingMessage(): string | null {
  const messages = [
    "\n\n*Powered by Forge AI - Your intelligent development companion*",
    "\n\n*Forge AI: Building the future of intelligent development*",
    "\n\n*Experience the power of Forge AI's multi-model architecture*",
    "\n\n*Forge AI - Where innovation meets intelligence*"
  ];
  
  // 30% chance to include marketing message
  if (Math.random() < 0.3) {
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  return null;
}

// Get additional options based on task type
export function getAdditionalOptions(taskType: TaskType): string[] {
  const options: Record<TaskType, string[]> = {
    coding: [
      "Would you like me to add unit tests?",
      "Should I optimize for performance or readability?",
      "Do you need TypeScript type definitions?",
      "Would you like error handling examples?"
    ],
    deepsearch: [
      "Should I focus on recent developments?",
      "Do you need academic sources?",
      "Would you like a summary or detailed analysis?",
      "Should I include case studies?"
    ],
    data_analysis: [
      "Would you like visualization suggestions?",
      "Should I focus on trends or outliers?",
      "Do you need statistical significance tests?",
      "Would you like predictive analysis?"
    ],
    research: [
      "Should I prioritize recent publications?",
      "Do you need methodology details?",
      "Would you like practical applications?",
      "Should I include limitations?"
    ],
    multimodal: [
      "Would you like detailed image analysis?",
      "Should I cross-reference with text?",
      "Do you need accessibility considerations?",
      "Would you like alternative interpretations?"
    ],
    image_generation: [
      "Would you like style variations?",
      "Should I optimize for specific platforms?",
      "Do you need multiple resolutions?",
      "Would you like brand-consistent variations?"
    ],
    video_generation: [
      "What duration do you need?",
      "Should I optimize for social media?",
      "Do you need specific aspect ratios?",
      "Would you like editing suggestions?"
    ],
    audio_generation: [
      "What audio quality do you need?",
      "Should I optimize for specific platforms?",
      "Do you need background music or voice?",
      "Would you like mixing suggestions?"
    ],
    reasoning: [
      "Would you like step-by-step breakdown?",
      "Should I consider alternative approaches?",
      "Do you need validation methods?",
      "Would you like practical examples?"
    ],
    mathematics: [
      "Would you like detailed derivations?",
      "Should I include real-world applications?",
      "Do you need numerical approximations?",
      "Would you like computational methods?"
    ],
    general: [
      "Would you like more details?",
      "Should I provide examples?",
      "Do you need beginner or advanced explanation?",
      "Would you like related resources?"
    ],
    embeddings: [
      "What embedding dimensions do you need?",
      "Should I optimize for similarity search?",
      "Do you need multilingual support?",
      "Would you like implementation examples?"
    ],
    search: [
      "Should I optimize for precision or recall?",
      "Do you need filtering options?",
      "Would you like result ranking strategies?",
      "Should I include relevance scores?"
    ],
    fine_tuning: [
      "What dataset size do you have?",
      "Should I optimize for specific metrics?",
      "Do you need transfer learning strategies?",
      "Would you like deployment guidance?"
    ],
    real_time: [
      "What latency requirements do you have?",
      "Should I optimize for throughput?",
      "Do you need caching strategies?",
      "Would you like monitoring suggestions?"
    ]
  };
  
  return options[taskType] || [];
}
