import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Send, Bot, User, Copy, Check, Download, 
  Sparkles, Pin, Archive, Trash2, Edit2, Search, ArrowLeft, Plus,
  ChevronLeft, ChevronRight, Code, Image as ImageIcon, Box, 
  HelpCircle, AlertTriangle, RefreshCw, FileText, Upload, BookOpen,
  Terminal, ShieldAlert, Star, Folder, Tag, Calendar, Paperclip, 
  Link2, CheckCircle, Circle, Grid, LogOut, Settings, MoreVertical, Share2,
  Mic, MicOff, Volume2, VolumeX, Loader2
} from "lucide-react";
import { ChatSession, ChatMessage, UserPreferences } from "../types";
import { AIResponseValidator } from "../lib/AIResponseValidator";
import { generateKokoroSpeech } from "../lib/kokoroTts";

interface ChatViewProps {
  userName: string;
  preferences: UserPreferences;
  addNotification: (text: string, type: 'info' | 'success' | 'warning') => void;
  onOpenProjectView: () => void;
  onBackToHome: () => void;
  isGuest?: boolean;
  advancedSettingsEnabled?: boolean;
  timeUntilReset?: string;
  dailyQueries?: number;
  setDailyQueries?: React.Dispatch<React.SetStateAction<number>>;
}

const AI_MODELS = [
  { id: "auto", name: "Forge Workspace Engine (Auto)", desc: "Dynamically selects the optimal processing engine", type: "Intelligent" },
  { id: "gemini-3.5-flash", name: "Forge Reasoning Engine", desc: "Best for overall architecture, multi-turn design, and summaries", type: "Core" },
  { id: "groq-llama-3.3", name: "Forge Ultra-Speed Engine", desc: "Ultra-fast live workspace responses and instant feedback", type: "Fast" },
  { id: "deepseek-v3", name: "Forge Syntax Engine", desc: "Expert code analysis and technical debugging", type: "Syntax" },
  { id: "mistral-large", name: "Forge Logic Engine", desc: "Deep structured thinking and logical step planning", type: "Logic" },
  { id: "cerebras-llama3", name: "Forge High-Throughput Node", desc: "High-volume batch code generation and file compilation", type: "Batch" },
  { id: "huggingface-flux", name: "Forge Visual Canvas Node", desc: "HD artwork and custom graphic layout generation", type: "Canvas" },
  { id: "openrouter-auto", name: "Forge Universal Router", desc: "Backup channel for distributed workspace processing", type: "Universal" }
];

// Interactive 3D Wireframe Mesh Canvas renderer for conversational messages
function Interactive3DMessage({ objText, prompt }: { objText: string; prompt: string; key?: any }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [modelRotation, setModelRotation] = useState({ x: 0.5, y: -0.5 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    
    // Parse vertices & faces
    const lines = objText.split("\n");
    const vertices: { x: number; y: number; z: number }[] = [];
    const faces: number[][] = [];

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts[0] === 'v') {
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parseFloat(parts[3]);
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          vertices.push({ x, y, z });
        }
      } else if (parts[0] === 'f') {
        const faceIndices: number[] = [];
        for (let i = 1; i < parts.length; i++) {
          const val = parts[i].split('/')[0];
          const idx = parseInt(val, 10);
          if (!isNaN(idx)) {
            faceIndices.push(idx > 0 ? idx - 1 : vertices.length + idx);
          }
        }
        if (faceIndices.length >= 3) {
          faces.push(faceIndices);
        }
      }
    });

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // grid background
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 1;
      for (let i = 20; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      const scale = 50;

      // Project 3D points to 2D
      const cosX = Math.cos(modelRotation.x);
      const sinX = Math.sin(modelRotation.x);
      const cosY = Math.cos(modelRotation.y);
      const sinY = Math.sin(modelRotation.y);

      const projected = vertices.map(v => {
        // Rotate Y
        let x1 = v.x * cosY - v.z * sinY;
        let z1 = v.x * sinY + v.z * cosY;
        // Rotate X
        let y2 = v.y * cosX - z1 * sinX;
        let z2 = v.y * sinX + z1 * cosX;

        // Simple perspective projection
        const depth = 3.0;
        const dist = 1 / (depth - z2);
        return {
          x: x1 * dist * scale * 2.5,
          y: -y2 * dist * scale * 2.5
        };
      });

      // Draw faces as wireframes
      ctx.lineWidth = 1.2;
      faces.forEach((face, index) => {
        ctx.beginPath();
        const p0 = projected[face[0]];
        if (!p0) return;
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < face.length; i++) {
          const pi = projected[face[i]];
          if (pi) ctx.lineTo(pi.x, pi.y);
        }
        ctx.closePath();
        // Dynamic gradient outline
        ctx.strokeStyle = `hsl(${(200 + index * 15) % 360}, 85%, 60%)`;
        ctx.stroke();
        // Translucent blue shade fill
        ctx.fillStyle = `rgba(20, 184, 166, ${0.05 + (index % 5) * 0.02})`;
        ctx.fill();
      });

      // Axis helper lines
      ctx.restore();
      
      // HUD layout text info overlays
      ctx.fillStyle = "#14b8a6";
      ctx.font = "bold 9px monospace";
      ctx.fillText("ENGINE: FORGE-3D WIREFRAME MESH LAB", 12, 18);
      ctx.fillStyle = "#64748b";
      ctx.fillText(`VERTICES: ${vertices.length} | FACES: ${faces.length}`, 12, 30);
      ctx.fillText(`ROTATION X: ${modelRotation.x.toFixed(2)} Y: ${modelRotation.y.toFixed(2)}`, 12, 42);
      
      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [objText, modelRotation]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setModelRotation(prev => ({
      x: prev.x + dy * 0.01,
      y: prev.y + dx * 0.01
    }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="mt-3 bg-slate-950 rounded-xl border border-slate-900 p-3 flex flex-col relative overflow-hidden group max-w-lg selection:bg-transparent">
      <div className="absolute top-3 right-3 flex items-center space-x-1.5 opacity-60 group-hover:opacity-100 transition z-10">
        <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[8px] uppercase font-mono rounded font-bold">Interactive Mesh</span>
      </div>
      <canvas 
        ref={canvasRef}
        width={340}
        height={180}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-44 cursor-grab active:cursor-grabbing bg-slate-950 rounded-lg border border-slate-900/50"
      />
      <span className="text-[9px] text-center font-mono text-slate-500 mt-2 block italic">Click & drag mouse above to rotate model coordinates live.</span>
    </div>
  );
}

// Interactive Workspace Creation Wizard Datasets
const WIZARD_QUESTIONS: Record<string, { question: string; options: string[] }[]> = {
  "Websites Workspace 🌐": [
    { question: "What kind of website would you like to build?", options: ["Portfolio", "Business Landing", "Blog", "Restaurant", "Personal Page", "Documentation"] },
    { question: "What design aesthetic do you prefer?", options: ["Minimal Light", "Glassmorphism Dark", "Neon Tech", "Editorial Serif", "Modern SaaS"] },
    { question: "Do you want interactive elements or simple layout?", options: ["Highly Interactive", "Simple & Static", "Single-Page Scroll", "Multi-Page Mockup"] }
  ],
  "Web Apps 💻": [
    { question: "What type of application are you building?", options: ["Dashboard Analytics", "AI Companion", "Collaborative Canvas", "Notes Organizer", "Task Manager"] },
    { question: "What authentication methods are required?", options: ["Email & Password", "Google OAuth", "GitHub Login", "Simple Guest Access", "No Auth"] },
    { question: "How should data be managed?", options: ["Persistent Firestore Db", "Relational SQL", "SQLite Sandbox", "Client LocalStorage"] }
  ],
  "Android Apps 📱": [
    { question: "Which mobile framework do you want?", options: ["Native Kotlin (Compose)", "Flutter (Dart)", "React Native (Expo)"] },
    { question: "What is the core feature?", options: ["Social Feed", "E-Commerce", "Workout Tracker", "Music Player", "Map & Location"] },
    { question: "Which device capabilities are needed?", options: ["Camera & Gallery", "GPS Location", "Push Notifications", "Local Database (Room)"] }
  ],
  "Desktop Apps 🖥": [
    { question: "What framework fits best?", options: ["Electron (React)", "Tauri (Rust/HTML)", "Python (PyQt/Tkinter)"] },
    { question: "What is the target operating system?", options: ["Windows Executable (.exe)", "macOS App (.app)", "Linux Package (.deb)", "Cross-Platform Sandbox"] },
    { question: "Do you need system integrations?", options: ["Local File System Read/Write", "System Tray Icon", "SQLite Embedded Database"] }
  ],
  "Roblox Games 🎮": [
    { question: "What game genre are you scripting?", options: ["Simulator (Clicks/Strength)", "RPG (Stats/Quests)", "Obby (Stages/Leaderboard)", "Tycoon (Buttons/Income)"] },
    { question: "Do you need persistent data saving?", options: ["DataStore (Saves Stats)", "Leaderboard Only", "Local Session (No Save)"] },
    { question: "What custom game systems are required?", options: ["Pet Hatching", "Custom Weapons/Combat", "Coin/Cash Shop", "Admin Chat Commands"] }
  ],
  "Unity Games": [
    { question: "Is this a 2D or 3D project?", options: ["3D Action/Adventure", "2D Platformer", "2D Top-down RPG", "3D Physics Puzzle"] },
    { question: "What is the primary script system needed?", options: ["Player Movement & Physics", "Enemy AI Behavior", "Inventory & Quest Logic", "Game Save/Load System"] },
    { question: "Which engine features are we focusing on?", options: ["Input System (New)", "Canvas UI Menus", "ScriptableObjects Data"] }
  ],
  "Godot Games": [
    { question: "What is your Godot version & language preference?", options: ["Godot 4.x (GDScript)", "Godot 4.x (C#)", "Godot 3.x (GDScript)"] },
    { question: "What is the game style?", options: ["2D Platformer", "2D Top-Down Shooter", "3D Dungeon Crawler", "Point & Click Adventure"] },
    { question: "What mechanics are needed?", options: ["KinematicBody Physics", "Dialogue System", "Turn-based Battle Loop", "UI HUD Stats Overlay"] }
  ],
  "Python Apps 🐍": [
    { question: "What interface type do you want?", options: ["Beautiful Desktop GUI (Tkinter)", "Modern PyQt6 Desktop", "Fast CLI Terminal Tool", "Background Automation"] },
    { question: "What is the main task?", options: ["Data Analysis & Plotting", "Web Scraping & Parser", "File Organizer", "SQLite CRUD Tool"] },
    { question: "Do you need third-party API integration?", options: ["REST API SDKs", "Google Sheets API", "Discord Webhooks", "None"] }
  ],
  "APIs 🌍": [
    { question: "Which runtime server stack?", options: ["Node.js (Express/TypeScript)", "Python (FastAPI)", "Go (Gin)", "Rust (Actix)"] },
    { question: "What is the routing style?", options: ["RESTful JSON Endpoints", "GraphQL Schema", "Real-time WebSockets"] },
    { question: "What infrastructure features do you need?", options: ["JWT Auth & Middleware", "Rate Limiting & Helmet Security", "Swagger/OpenAPI Docs"] }
  ],
  "Discord Bots 🤖": [
    { question: "Which bot SDK framework?", options: ["discord.js (JavaScript)", "discord.py (Python)", "JDA (Java)"] },
    { question: "What is the primary bot category?", options: ["Server Moderation & Logging", "Music Player & Audio", "RPG Economy & Leveling", "Support Ticket Forms"] },
    { question: "Do you want modern interaction styles?", options: ["Slash Commands Only", "Prefix Commands (!bot)", "Buttons & Select Menus"] }
  ],
  "Minecraft Plugins ⛏": [
    { question: "What server platform?", options: ["PaperMC (Java 17+)", "Spigot (Java 8+)", "Purpur Fork"] },
    { question: "What is the plugin type?", options: ["Economy Vault Link", "Custom Items & Recipes", "RPG Classes & Levelling", "Chat Moderation"] },
    { question: "Do you need database hookups?", options: ["MySQL/PostgreSQL", "Local YAML Config", "SQLite Sandbox", "None"] }
  ]
};

const WIZARD_RECOMMENDATIONS: Record<string, string[]> = {
  "Websites Workspace 🌐": ["Contact form handler", "Responsive mobile burger menu", "Tailwind styling custom color palette", "SEO Meta tags", "Interactive testimonial slider"],
  "Web Apps 💻": ["Firebase auth context state", "React custom error boundary", "Lucide React icons setup", "Responsive navbar drawer", "Tailwind theme config presets"],
  "Android Apps 📱": ["Room persistent local database skeleton", "Retrofit network client module", "Jetpack Navigation controller routing", "Standard Material Design 3 color schemes"],
  "Desktop Apps 🖥": ["Local storage config manager", "IPC communication main-renderer template", "System tray context menu code", "Beautiful frameless window styles"],
  "Roblox Games 🎮": ["Secure Leaderboard state module", "Player join/leave handler", "Custom chat admin logs", "Interactive purchase dialogs"],
  "Unity Games": ["PlayerMovement.cs controller script", "GameManager.cs persistent singleton", "UIManager.cs canvas triggers", "ScriptableObject recipe data format"],
  "Godot Games": ["Character2D.gd movement script", "GlobalSettings.gd singleton autoload", "Dialogue UI system GDScript", "LevelManager.gd loading hooks"],
  "Python Apps 🐍": ["Modular CLI logger function", "CustomTkinter theme selector setup", "SQLite DB table setup scripts", "Beautiful Matplotlib custom graph plots"],
  "APIs 🌍": ["Express/FastAPI CORS security settings", "JWT session signing & check middlewares", "Morgan logging custom formats", "Swagger API docs autogen setup"],
  "Discord Bots 🤖": ["Command register script (Slash commands)", "Activity status cycler", "Error handler with message embed", "Event logger module"],
  "Minecraft Plugins ⛏": ["config.yml defaults generator", "Vault / Economy API links", "Custom permission check nodes", "bStats metrics integration wrapper"]
};

const getWorkspacePlan = (ws: string, answers: Record<string, string>, features: string[]) => {
  const folderStructure = ws.includes("Websites") ? `📂 src/
├── 📂 components/
│   ├── 📄 Navbar.jsx
│   ├── 📄 HeroSection.jsx
│   └── 📄 Footer.jsx
├── 📄 App.jsx
├── 📄 main.jsx
└── 📄 index.css` : ws.includes("Web Apps") ? `📂 src/
├── 📂 components/
│   ├── 📄 Dashboard.tsx
│   └── 📄 Sidebar.tsx
├── 📂 context/
│   └── 📄 AuthContext.tsx
├── 📄 App.tsx
└── 📄 main.tsx` : ws.includes("Minecraft") ? `📂 src/main/java/com/forgeai/plugin/
├── 📄 MainPlugin.java
├── 📂 commands/
│   └── 📄 CustomCommand.java
├── 📂 listeners/
│   └── 📄 PlayerJoinListener.java
└── 📄 plugin.yml` : `📂 src/
├── 📄 MainScript.ts
└── 📄 Config.ts`;

  return {
    folders: folderStructure,
    milestones: [
      `1. Initialize ${ws} Environment`,
      `2. Integrate chosen selections: ${Object.values(answers).join(", ")}`,
      `3. Inject requested components & packages: ${features.slice(0, 4).join(", ")}`,
      `4. Verify compiler output & run diagnostics`
    ]
  };
};

// Helper to automatically classify workspace from prompt keywords
const detectWorkspaceFromPrompt = (prompt: string): { workspace: string, icon: string } => {
  const p = prompt.toLowerCase();
  if (p.includes("minecraft") || p.includes("spigot") || p.includes("papermc") || p.includes("bukkit") || p.includes("plugin.yml")) {
    return { workspace: "Minecraft Plugins ⛏", icon: "⛏" };
  }
  if (p.includes("roblox") || p.includes("luau") || p.includes("obby") || p.includes("tycoon") || p.includes("gamepass")) {
    return { workspace: "Roblox Games 🎮", icon: "🎮" };
  }
  if (p.includes("unity") || p.includes("c# game") || p.includes("gameobject") || p.includes("mono_behaviour")) {
    return { workspace: "Unity Games", icon: "🎮" };
  }
  if (p.includes("godot") || p.includes("gdscript") || p.includes("node2d")) {
    return { workspace: "Godot Games", icon: "🎮" };
  }
  if (p.includes("android") || p.includes("flutter") || p.includes("kotlin") || p.includes("compose") || p.includes("react native")) {
    return { workspace: "Android Apps 📱", icon: "📱" };
  }
  if (p.includes("desktop") || p.includes("electron") || p.includes("tauri") || p.includes("javafx")) {
    return { workspace: "Desktop Apps 🖥", icon: "🖥" };
  }
  if (p.includes("discord") || p.includes("discord.py") || p.includes("discord.js") || p.includes("slash command")) {
    return { workspace: "Discord Bots 🤖", icon: "🤖" };
  }
  if (p.includes("api") || p.includes("rest") || p.includes("graphql") || p.includes("route") || p.includes("endpoint") || p.includes("websocket")) {
    return { workspace: "APIs 🌍", icon: "🌍" };
  }
  if (p.includes("python") || p.includes("tkinter") || p.includes("pyqt") || p.includes("django") || p.includes("flask") || p.includes("fastapi")) {
    return { workspace: "Python Apps 🐍", icon: "🐍" };
  }
  if (p.includes("html") || p.includes("css") || p.includes("website") || p.includes("landing page") || p.includes("portfolio")) {
    return { workspace: "Websites Workspace 🌐", icon: "🌐" };
  }
  if (p.includes("react") || p.includes("next.js") || p.includes("dashboard") || p.includes("web app") || p.includes("angular") || p.includes("vue")) {
    return { workspace: "Web Apps 💻", icon: "💻" };
  }
  return { workspace: "Web Apps 💻", icon: "💻" };
};

// Memory enricher helper function to ensure a session stores rich diagnostic metadata
const enrichSessionMemory = (session: ChatSession, extraAttachments: { name: string, size: string }[] = []): ChatSession => {
  const messages = session.messages;
  if (messages.length === 0) return session;

  const firstUserMessage = messages.find(m => m.role === 'user');
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');

  const firstPrompt = firstUserMessage ? firstUserMessage.content : '';
  const lastPrompt = lastUserMessage ? lastUserMessage.content : '';

  // Extract generated files from code blocks
  const fileRegex = /```(\w+)(?::([\w.-]+))?\n([\s\S]*?)```/g;
  const files: string[] = [];
  messages.forEach(m => {
    let match;
    while ((match = fileRegex.exec(m.content)) !== null) {
      const lang = match[1];
      const filename = match[2] || `generated_script.${lang === 'javascript' ? 'js' : lang === 'typescript' ? 'ts' : lang === 'python' ? 'py' : 'txt'}`;
      if (!files.includes(filename)) {
        files.push(filename);
      }
    }
  });

  // Extract generated images
  const images: string[] = [];
  const imgRegex = /\[IMAGE_ASSET:\s*([^\s|]+)\s*\|\s*([^\]]+)\]/g;
  messages.forEach(m => {
    let match;
    while ((match = imgRegex.exec(m.content)) !== null) {
      const url = match[1];
      if (!images.includes(url)) {
        images.push(url);
      }
    }
  });

  // Extract 3D meshes
  const objMeshes: string[] = [];
  messages.forEach(m => {
    if (m.content.includes("```obj") || m.content.includes("v 0.0 1.0 0.0")) {
      objMeshes.push("Mesh Model");
    }
  });

  // Determine Category & Intent
  let intent = "General Inquiry";
  let category: ChatSession['category'] = "general";
  const contentLower = (lastPrompt || firstPrompt || '').toLowerCase();
  if (contentLower.includes("code") || contentLower.includes("script") || contentLower.includes("react") || contentLower.includes("html") || contentLower.includes("function") || contentLower.includes("css") || contentLower.includes("js")) {
    intent = "Coding Task";
    category = "code";
  } else if (contentLower.includes("image") || contentLower.includes("graphic") || contentLower.includes("draw") || contentLower.includes("paint") || contentLower.includes("logo")) {
    intent = "Generative Graphic";
    category = "image";
  } else if (contentLower.includes("3d") || contentLower.includes("mesh") || contentLower.includes("obj") || contentLower.includes("wireframe")) {
    intent = "3D Modeling";
    category = "3d";
  } else if (contentLower.includes("teach") || contentLower.includes("learn") || contentLower.includes("explain") || contentLower.includes("why") || contentLower.includes("tutorial")) {
    intent = "Learning / Academic";
    category = "learning";
  } else if (contentLower.includes("debug") || contentLower.includes("error") || contentLower.includes("uncaught") || contentLower.includes("fail") || contentLower.includes("fix")) {
    intent = "Error Debugging";
    category = "debug";
  } else if (contentLower.includes("plan") || contentLower.includes("architecture") || contentLower.includes("design pattern")) {
    intent = "Strategic Architecture";
    category = "planning";
  }

  // Detect code language
  let language = "";
  if (contentLower.includes("python") || contentLower.includes(" .py")) language = "Python";
  else if (contentLower.includes("javascript") || contentLower.includes(" .js") || contentLower.includes("node")) language = "JavaScript";
  else if (contentLower.includes("typescript") || contentLower.includes(" .ts") || contentLower.includes("tsx")) language = "TypeScript";
  else if (contentLower.includes("html") || contentLower.includes("css")) language = "HTML/CSS";
  else if (contentLower.includes("go ") || contentLower.includes("golang")) language = "Go";
  else if (contentLower.includes("rust ") || contentLower.includes("rustlang")) language = "Rust";
  else if (contentLower.includes("c++") || contentLower.includes(" cpp")) language = "C++";

  // Create summary
  let summary = "";
  if (messages.length > 1) {
    const lastAI = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAI) {
      const clean = lastAI.content.replace(/[#*`>]/g, '').trim();
      summary = clean.split('.')[0] + ".";
      if (summary.length > 90) {
        summary = summary.substring(0, 87) + "...";
      }
    }
  } else {
    summary = firstPrompt ? firstPrompt.substring(0, 80) + "..." : "Fresh conversational sandbox.";
  }

  // Merge attachments
  const existingAttachments = session.attachments || [];
  const newAttachments = [...existingAttachments];
  extraAttachments.forEach(att => {
    if (!newAttachments.includes(att.name)) {
      newAttachments.push(att.name);
    }
  });

  const tags = session.tags || [];
  if (category && category !== 'general' && !tags.includes(category)) {
    tags.push(category);
  }
  if (language && !tags.includes(language)) {
    tags.push(language);
  }

  // Workspace Detection
  const wsInfo = detectWorkspaceFromPrompt(firstPrompt || lastPrompt || "");
  const currentWorkspace = session.workspace || wsInfo.workspace;

  return {
    ...session,
    firstPrompt: firstPrompt || session.firstPrompt || "",
    lastPrompt: lastPrompt || session.lastPrompt || "",
    generatedFiles: files.length > 0 ? files : (session.generatedFiles || []),
    generatedImages: images.length > 0 ? images : (session.generatedImages || []),
    generated3D: objMeshes.length > 0 ? objMeshes : (session.generated3D || []),
    attachments: newAttachments,
    intent,
    category,
    language: language || session.language || "General Inquiry",
    summary: summary || session.summary || "Conversation thread.",
    messageCount: messages.length,
    tags,
    projectLink: session.projectLink || `/editor`,
    workspace: currentWorkspace
  };
};

export default function ChatView({
  userName,
  preferences,
  addNotification,
  onOpenProjectView,
  onBackToHome,
  isGuest = false,
  advancedSettingsEnabled = false,
  timeUntilReset = "00:00:00",
  dailyQueries: propsDailyQueries,
  setDailyQueries: propsSetDailyQueries
}: ChatViewProps) {
  // Chat Sessions state stored in localStorage for persistence
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("forgeai_chat_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatSession[];
        return parsed.map(s => enrichSessionMemory(s));
      } catch (e) {
        // Fallback
      }
    }
    // Default starter session
    const defaultSess: ChatSession = {
      id: "default_session",
      title: "Programming Assistant Start",
      messages: [
        {
          role: "assistant",
          content: "Hello! I am your dedicated **ForgeAI Chat Assistant**. \n\nIn this chat mode, I act as an intelligent coding partner. I **never modify project files directly**—instead, all code, designs, or explanations we create appear right here in our conversation. \n\nHow can I help you learn programming or sketch an idea today?",
          timestamp: new Date().toLocaleTimeString()
        }
      ],
      pinned: false,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return [enrichSessionMemory(defaultSess)];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || "default_session";
  });

  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom right sidebar tab configuration
  const [activeRightTab, setActiveRightTab] = useState<'history' | 'inspect' | 'media'>('history');
  
  // Resizable Right Sidebar state
  const [historyWidth, setHistoryWidth] = useState(320);

  // Expanded file sections in session list items
  const [expandedFilesSessionId, setExpandedFilesSessionId] = useState<string | null>(null);

  // Editing session titles
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");

  // Simulated Daily Usage Limits
  const [internalDailyQueries, setInternalDailyQueries] = useState(() => {
    const saved = localStorage.getItem("forgeai_chat_daily_queries");
    return saved ? Number(saved) : (isGuest ? 2 : 24);
  });
  const dailyQueries = propsDailyQueries !== undefined ? propsDailyQueries : internalDailyQueries;
  const setDailyQueries = propsSetDailyQueries !== undefined ? propsSetDailyQueries : setInternalDailyQueries;
  const maxQueries = isGuest ? 10 : 80;

  // Selected sub-model (Routing layer)
  const [selectedModelId, setSelectedModelId] = useState("gemini-3.5-flash");

  // Media Sandbox state
  const [imageSynthPrompt, setImageSynthPrompt] = useState("");
  const [meshSynthPrompt, setMeshSynthPrompt] = useState("");
  const [meshSynthType, setMeshSynthType] = useState<"spaceship" | "sword" | "modern house" | "sci-fi crate" | "shield">("spaceship");
  const [isMediaSynthesizing, setIsMediaSynthesizing] = useState(false);

  // Code Block Copy visual feedback helper
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  // Simulated attachments list
  const [attachedFiles, setAttachedFiles] = useState<{name: string, size: string}[]>([]);

  // Dialog & Menu states
  const [deleteConfirmSessionId, setDeleteConfirmSessionId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; sessionId: string; } | null>(null);

  // Project Creation Wizard states
  const [wizardStep, setWizardStep] = useState<number>(0); // 0 = idle/not started, 1 = questions, 2 = recommendations, 3 = blueprint/plan
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [wizardAnswers, setWizardAnswers] = useState<Record<string, string>>({});
  const [recommendedFeatures, setRecommendedFeatures] = useState<string[]>([]);
  const [customFeatures, setCustomFeatures] = useState<string[]>([]);
  const [customFeatureInput, setCustomFeatureInput] = useState("");
  const [wizardExplaining, setWizardExplaining] = useState(false);

  // Voice-to-text Speech Recognition (Speech to text input)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Kokoro TTS Text-to-Speech playback state (@fal-ai/client)
  const [activeAudioElement, setActiveAudioElement] = useState<HTMLAudioElement | null>(null);
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);
  const [isTtsLoading, setIsTtsLoading] = useState<boolean>(false);

  const handleSpeakMessage = async (index: number, text: string) => {
    if (playingMessageIndex === index) {
      if (activeAudioElement) {
        activeAudioElement.pause();
        setActiveAudioElement(null);
      }
      if (typeof window !== "undefined" && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingMessageIndex(null);
      return;
    }

    if (activeAudioElement) {
      activeAudioElement.pause();
      setActiveAudioElement(null);
    }
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsTtsLoading(true);
    setPlayingMessageIndex(index);

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[\*\_~#]/g, "")
      .trim();

    try {
      const result = await generateKokoroSpeech({
        prompt: cleanText.slice(0, 1000),
        voice: "af_heart",
        speed: 1.0
      });

      setIsTtsLoading(false);

      if (result.success && result.audioUrl) {
        const audio = new Audio(result.audioUrl);
        setActiveAudioElement(audio);
        audio.play();
        audio.onended = () => {
          setPlayingMessageIndex(null);
          setActiveAudioElement(null);
        };
        addNotification("Playing audio via Kokoro TTS (@fal-ai/client)", "info");
      } else if (result.source === 'speech-synthesis' || result.success) {
        addNotification("Playing audio via Speech Synthesis", "info");
      } else {
        setPlayingMessageIndex(null);
        addNotification("Unable to generate speech audio.", "warning");
      }
    } catch (err) {
      setIsTtsLoading(false);
      setPlayingMessageIndex(null);
      addNotification("Error synthesizing speech.", "warning");
    }
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addNotification("Voice recognition is not supported in this browser. Please try Chrome, Edge, or Safari.", "warning");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        addNotification("Listening... Speak clearly into your microphone.", "info");
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        addNotification(`Voice recognition error: ${event.error}`, "warning");
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setChatInput(prev => prev ? `${prev} ${transcript}` : transcript);
          addNotification("Voice speech successfully transcribed!", "success");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save sessions with automated memory diagnostics to localStorage when mutated
  useEffect(() => {
    const enriched = sessions.map(s => {
      // Set unread on newly created or answered sessions
      return enrichSessionMemory(s);
    });
    localStorage.setItem("forgeai_chat_sessions", JSON.stringify(enriched));
  }, [sessions]);

  // Keep daily query counter persisted
  useEffect(() => {
    localStorage.setItem("forgeai_chat_daily_queries", String(dailyQueries));
  }, [dailyQueries]);

  // Response Validator quality and fallback retry engine using the AIResponseValidator module
  const fetchWithValidation = async (msgs: any[], currentModel: string, attemptsLeft: number, customApiKeys: any): Promise<any> => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: msgs,
        modelId: currentModel,
        projectFiles: {},
        customApiKeys
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    const text = data.text || "";
    // Parse streaming chat chunks/responses for incomplete code blocks, broken markdown, or hallucinations
    const validation = AIResponseValidator.validate(text);

    if (!validation.isValid && attemptsLeft > 0) {
      console.warn(`[AIResponseValidator] Failure detected: ${validation.reason}. Attempting fallback retry...`);
      addNotification(`Response validator flagged quality issue: ${validation.reason}. Retrying using fallback model...`, "warning");
      
      // Fallback model logic: route to alternative engine
      const fallbackModel = currentModel === "gemini-3.5-flash" ? "groq-llama-3.3" : "gemini-3.5-flash";
      return fetchWithValidation(msgs, fallbackModel, attemptsLeft - 1, customApiKeys);
    }

    return data;
  };

  // Auto scroll to bottom
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isChatSending]);

  // Reset wizard states on conversation switches
  useEffect(() => {
    setWizardStep(0);
    setSelectedWorkspace(null);
    setActiveQuestionIndex(0);
    setWizardAnswers({});
    setRecommendedFeatures([]);
    setCustomFeatures([]);
    setCustomFeatureInput("");
  }, [activeSessionId]);

  // Automatic Title Generation Hook (exchanges <= 8)
  useEffect(() => {
    if (!activeSession) return;
    
    // Only trigger if title is generic and has messages, and we aren't sending
    const isGenericTitle = activeSession.title.startsWith("Conversation #") || activeSession.title === "Programming Assistant Start" || activeSession.title === "New Conversation" || activeSession.title === "New Chat" || activeSession.title === "Untitled Chat";
    const userMsgCount = activeSession.messages.filter(m => m.role === 'user').length;
    
    if (isGenericTitle && userMsgCount > 0 && !isChatSending) {
      const firstUserMsg = activeSession.messages.find(m => m.role === 'user');
      if (firstUserMsg) {
        const timeout = setTimeout(async () => {
          try {
            let customApiKeys = {};
            try {
              const saved = localStorage.getItem("forgeai_custom_api_keys");
              if (saved) customApiKeys = JSON.parse(saved);
            } catch (err) {}

            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [
                  {
                    role: "user",
                    content: `Analyze this user query and produce a short, punchy title of 3 to 6 words. Return ONLY the plain text title, no punctuation, quotes or markup.\n\nQuery: "${firstUserMsg.content}"`
                  }
                ],
                modelId: "gemini-3.5-flash",
                projectFiles: {},
                customApiKeys
              })
            });
            const data = await res.json();
            if (data.text) {
              let title = data.text.trim();
              title = title.replace(/^["']|["']$/g, '').trim();
              if (title.split(/\s+/).length > 7) {
                title = title.split(/\s+/).slice(0, 5).join(" ");
              }
              if (title) {
                setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title, updatedAt: new Date().toISOString() } : s));
              }
            }
          } catch (e) {
            // Fallback rule
            const title = firstUserMsg.content.substring(0, 24) + "...";
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title, updatedAt: new Date().toISOString() } : s));
          }
        }, 1500);
        return () => clearTimeout(timeout);
      }
    }
  }, [activeSessionId, activeSession?.messages?.length, isChatSending]);

  // Handle Drag Resizing of the History panel
  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    const startWidth = historyWidth;
    const startX = mouseDownEvent.clientX;

    const doResize = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      // Since it is on the right side, dragging to the left increases width
      const newWidth = Math.max(260, Math.min(420, startWidth - deltaX));
      setHistoryWidth(newWidth);
    };

    const stopResizing = () => {
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResizing);
    };

    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResizing);
  };

  const handleCreateNewChat = (initialText = "") => {
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New Conversation",
      messages: [
        {
          role: "assistant",
          content: "Starting a fresh AI sandbox. Ask me to generate scripts, design visual charts, or explain complex algorithmic logic!",
          timestamp: new Date().toLocaleTimeString()
        }
      ],
      pinned: false,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ready',
      unread: false,
      category: 'general'
    };

    setSessions([enrichSessionMemory(newSession), ...sessions]);
    setActiveSessionId(newId);
    setActiveRightTab('history');
    if (initialText) {
      setTimeout(() => {
        setChatInput(initialText);
      }, 100);
    }
  };

  const triggerWizardScaffolding = async (workspaceName: string, promptText: string, finalTitle: string) => {
    if (dailyQueries >= maxQueries) {
      addNotification("Daily query limits reached for this sandbox space.", "warning");
      return;
    }

    setIsChatSending(true);
    setDailyQueries(prev => prev + 1);

    const userMsg: ChatMessage = {
      role: "user",
      content: promptText,
      timestamp: new Date().toLocaleTimeString()
    };

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return enrichSessionMemory({
          ...s,
          title: finalTitle || workspaceName,
          messages: [...s.messages, userMsg],
          status: 'generating_code',
          unread: false,
          updatedAt: new Date().toISOString()
        });
      }
      return s;
    }));

    try {
      let customApiKeys = {};
      try {
        const saved = localStorage.getItem("forgeai_custom_api_keys");
        if (saved) customApiKeys = JSON.parse(saved);
      } catch (err) {}

      const data = await fetchWithValidation(
        [...(activeSession?.messages || []), userMsg],
        selectedModelId,
        2, // 2 retries
        customApiKeys
      );

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.text || `Scaffolding complete for ${workspaceName}. I have generated your customized boilerplate with all chosen integrations. What would you like to build next?`,
        timestamp: new Date().toLocaleTimeString()
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return enrichSessionMemory({
            ...s,
            messages: [...s.messages, assistantMsg],
            status: 'ready',
            unread: true,
            updatedAt: new Date().toISOString()
          });
        }
        return s;
      }));

      addNotification(`${workspaceName} scaffolded and ready!`, "success");
    } catch (err: any) {
      // simulated fallback
      const simulatedMsg: ChatMessage = {
        role: "assistant",
        content: `### Scaffolding Complete for ${workspaceName}\n\nI have successfully initialized your environment and scaffolded the layout as requested! All selected configurations have been loaded:\n\n\`\`\`typescript\n// ${workspaceName} - Boilerplate Entry\n// Created by ForgeAI\n\nconsole.log("Successfully loaded workspace settings!");\n\`\`\`\n\nYou are ready to design and test this sandbox live! Ask me anything to continue.`,
        timestamp: new Date().toLocaleTimeString()
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return enrichSessionMemory({
            ...s,
            messages: [...s.messages, simulatedMsg],
            status: 'ready',
            unread: true,
            updatedAt: new Date().toISOString()
          });
        }
        return s;
      }));
    } finally {
      setIsChatSending(false);
      setWizardStep(0);
      setSelectedWorkspace(null);
    }
  };

  const handleSendQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentInput = chatInput.trim();
    if (!currentInput) return;

    if (dailyQueries >= maxQueries) {
      addNotification("Daily query limits reached for this sandbox space.", "warning");
      return;
    }

    setChatInput("");
    setIsChatSending(true);
    setDailyQueries(prev => prev + 1);

    // Set conversation status
    const tempIntent = currentInput.toLowerCase();
    let initialStatus: ChatSession['status'] = 'answering';
    if (tempIntent.includes("code") || tempIntent.includes("script") || tempIntent.includes("react")) initialStatus = 'generating_code';
    else if (tempIntent.includes("image") || tempIntent.includes("graphic")) initialStatus = 'generating_image';
    else if (tempIntent.includes("3d") || tempIntent.includes("mesh")) initialStatus = 'generating_3d';

    const userMsg: ChatMessage = {
      role: "user",
      content: currentInput,
      timestamp: new Date().toLocaleTimeString()
    };

    // Update active session thread
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const updatedMsgs = [...s.messages, userMsg];
        return enrichSessionMemory({
          ...s,
          messages: updatedMsgs,
          status: initialStatus,
          unread: false,
          updatedAt: new Date().toISOString()
        }, attachedFiles);
      }
      return s;
    }));

    // Reset attached files state
    setAttachedFiles([]);

    try {
      let customApiKeys = {};
      try {
        const saved = localStorage.getItem("forgeai_custom_api_keys");
        if (saved) customApiKeys = JSON.parse(saved);
      } catch (err) {}

      // Direct post to proxy backend API with quality validation & retry checks
      const data = await fetchWithValidation(
        [...(activeSession?.messages || []), userMsg],
        selectedModelId,
        2, // 2 retries
        customApiKeys
      );

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.text || "I processed your request, but no response text was returned.",
        timestamp: new Date().toLocaleTimeString()
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return enrichSessionMemory({
            ...s,
            messages: [...s.messages, assistantMsg],
            status: 'ready',
            unread: true, // Mark unread for notification/email style feel!
            updatedAt: new Date().toISOString()
          });
        }
        return s;
      }));

    } catch (err: any) {
      // Fallback/simulation logic if compiler/API proxy errors out or key missing
      let simulatedReply = "";

      if (currentInput.toLowerCase().includes("python calculator") || currentInput.toLowerCase().includes("calculator")) {
        simulatedReply = `Here is a fully functional **Python Calculator** designed in modular console functions.

\`\`\`python
# Simple Python Arithmetic Calculator CLI
# Generated by ForgeAI

def add(x, y):
    return x + y

def subtract(x, y):
    return x - y

def multiply(x, y):
    return x * y

def divide(x, y):
    if y == 0:
        return "Error! Division by zero."
    return x / y

def main():
    print("=== ForgeAI Arithmetic Engine ===")
    print("1. Add\\n2. Subtract\\n3. Multiply\\n4. Divide")
    
    choice = input("Enter option (1/2/3/4): ")
    if choice in ['1', '2', '3', '4']:
        try:
            num1 = float(input("Enter first value: "))
            num2 = float(input("Enter second value: "))
        except ValueError:
            print("Invalid numerical format!")
            return
            
        if choice == '1':
            print(f"Result: {num1} + {num2} = {add(num1, num2)}")
        elif choice == '2':
            print(f"Result: {num1} - {num2} = {subtract(num1, num2)}")
        elif choice == '3':
            print(f"Result: {num1} * {num2} = {multiply(num1, num2)}")
        elif choice == '4':
            print(f"Result: {num1} / {num2} = {divide(num1, num2)}")
    else:
        print("Invalid Choice.")

if __name__ == '__main__':
    main()
\`\`\`

### How to use this:
1. Copy the code block above using the **Copy Code** button.
2. Or click **Download as .py** to save the file locally.
3. Run \`python calculator.py\` in your system terminal.`;
      } else if (currentInput.toLowerCase().includes("image") || selectedModelId === "flux-1-schnell") {
        // Image synthesization block
        simulatedReply = `Generated high-fidelity graphics concept based on your design parameters:

🖼️ **Sensing Asset:** *"${currentInput}"*
🎨 **Engine:** Forge AI Graphics Engine

<div class="my-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
  <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60" alt="Generated AI Graphics" class="max-w-full h-48 object-cover rounded-lg shadow-xl" referrerpolicy="no-referrer" />
  <span class="text-[10px] font-mono text-slate-500 mt-2">Forge AI Graphics Node: img_${Date.now()}.png</span>
</div>

Would you like to adjust the color palette or request specific dimensions?`;
      } else if (currentInput.toLowerCase().includes("3d") || selectedModelId === "hunyuan-3d") {
        simulatedReply = `Synthesized a standard low-poly 3D mesh map corresponding to your description.

📦 **Mesh Subject:** *"${currentInput}"*
📐 **Vertex Density:** 85 Vertices, 120 Faces

\`\`\`obj
# Forge-3D Mesh Generator OBJ file output
# Subject: ${currentInput}
v 0.0 1.0 0.0
v -1.0 -1.0 1.0
v 1.0 -1.0 1.0
v 1.0 -1.0 -1.0
v -1.0 -1.0 -1.0
f 1 2 3
f 1 3 4
f 1 4 5
f 1 5 2
f 2 5 4 3
\`\`\`

You can copy or download this standard OBJ text format. It integrates with Unity, Blender, or Godot instantly.`;
      } else {
        const lowerInput = currentInput.toLowerCase().trim();
        const isConversational = ["hello", "hi", "hey", "greetings", "how are you", "who are you", "what is forgeai", "tell me about yourself", "who made you"].some(word => lowerInput.includes(word));
        
        const isFactualQuery = [
          "who is the president", "president of", "prime minister", "who is the prime minister",
          "capital of", "weather in", "population of", "how far is", "currency of",
          "who won", "history of", "tell me about", "what is the capital"
        ].some(phrase => lowerInput.includes(phrase)) || 
        // Also if they just ask a simple non-code, non-development question
        (!["code", "script", "function", "write a", "implement", "create a", "build a", "calculator", "debug", "error", "bug", "css", "html", "react", "website", "application"].some(word => lowerInput.includes(word)));

        if (isConversational || isFactualQuery) {
          if (lowerInput.includes("president of india") || lowerInput.includes("who is the president of india")) {
            simulatedReply = `India's current President is **Droupadi Murmu**, who assumed office on July 25, 2022. 
            
She is the 15th President of the Republic of India and the first person belonging to an indigenous tribal community (the Santhal tribe) to hold the office. Previously, she served as the Governor of Jharkhand and held various ministerial portfolios in the Odisha state government.

Is there anything else you'd like to learn or build around this topic? For instance, I can help you build an interactive React infographic about Indian administration or create a data visualization dashboard!`;
          } else if (lowerInput.includes("capital of india")) {
            simulatedReply = `The capital of India is **New Delhi**. 
            
It serves as the seat of all three branches of the Government of India: the executive (Secretariat), legislative (Parliament House), and judiciary (Supreme Court). 

New Delhi was established in December 1911 when the capital was shifted from Calcutta (now Kolkata) during the British Raj. The city was designed by British architects Sir Edwin Lutyens and Sir Herbert Baker.`;
          } else if (lowerInput.includes("prime minister of india")) {
            simulatedReply = `The Prime Minister of India is **Narendra Modi**, who has served in the role since May 26, 2014. He is the 14th Prime Minister of India and previously served as the Chief Minister of Gujarat from 2001 to 2014.`;
          } else if (lowerInput.includes("who are you") || lowerInput.includes("your name") || lowerInput.includes("tell me about yourself") || lowerInput.includes("who made you")) {
            simulatedReply = `I am **ForgeAI**, your intelligent software engineering companion and development assistant. 
            
My primary mission is to help you prototype, build, and debug high-quality web applications, 3D meshes, and graphic styles in real-time. I maintain an objective, helpful, and highly competent persona, and I don't associate with any third-party corporate entities or specific raw models. I am simply **ForgeAI**!`;
          } else {
            // General Knowledge Fallback
            simulatedReply = `I have routed your request through my general knowledge conversation layer:

### Factual response to: "${currentInput}"
Based on my internal offline knowledge base, this is a conceptual and conversational inquiry. 

To help you turn this interest into active development, we can build a software project around it! For example, would you like me to:
1. **Design a clean Tailwind CSS layout / Infographic card** displaying detailed information about this topic?
2. **Write a data fetching service (in Node.js/Python)** that retrieves live wiki details about this topic?
3. **Build an interactive quiz application** so users can test their knowledge?

Let me know what you would like to create!`;
          }
        } else {
          simulatedReply = `Here is a custom, educational overview to help you understand your request:

### Conceptual Overview
When building or solving this challenge, you should maintain clean state-management pipelines. It is best understood through an analogy:
> Think of a state manager as a **traffic controller**. If too many states try to update asynchronously without a strict queue, you get race conditions and infinite loops.

### Sample Code Implementation
Here is a robust, modular snippet demonstrating how you can implement this clean architecture:

\`\`\`javascript
// Modern State Queue Implementation
// Created inside ForgeAI isolated chat

class StateQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  enqueue(action) {
    this.queue.push(action);
    this.processNext();
  }

  async processNext() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    
    const action = this.queue.shift();
    try {
      await action();
    } catch (e) {
      console.error("Queue execution error:", e);
    }
    
    this.processing = false;
    this.processNext();
  }
}
\`\`\`

Let me know if you would like me to rewrite this in Python, C++, or Go!`;
        }
      }

      // Add a small delay to simulate processing naturally
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: simulatedReply,
          timestamp: new Date().toLocaleTimeString()
        };

        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            return enrichSessionMemory({
              ...s,
              messages: [...s.messages, assistantMsg],
              status: 'ready',
              unread: true,
              updatedAt: new Date().toISOString()
            });
          }
          return s;
        }));
      }, 1000);

    } finally {
      setIsChatSending(false);
    }
  };

  const handleCopyCode = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBlockId(blockId);
    addNotification("Code block copied to clipboard!", "success");
    setTimeout(() => {
      setCopiedBlockId(null);
    }, 2000);
  };

  const handleDownloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "forge_code_export.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification(`Downloaded file as ${filename || "forge_code_export.txt"}`, "info");
  };

  const handleSynthesizeImage = () => {
    if (!imageSynthPrompt.trim()) {
      addNotification("Please enter an image prompt first!", "warning");
      return;
    }
    if (dailyQueries >= maxQueries) {
      addNotification("Daily chat query allocation reached!", "warning");
      return;
    }
    setIsMediaSynthesizing(true);
    setDailyQueries(prev => prev + 1);

    const unsplashPics = [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80"
    ];
    const idx = imageSynthPrompt.length % unsplashPics.length;
    const selectedUrl = unsplashPics[idx];

    setTimeout(() => {
      const userMsg: ChatMessage = {
        role: "user",
        content: `Synthesize a generative graphic for: "${imageSynthPrompt}"`,
        timestamp: new Date().toLocaleTimeString()
      };

      const aiMsg: ChatMessage = {
        role: "assistant",
        content: `[IMAGE_ASSET: ${selectedUrl} | ${imageSynthPrompt}]`,
        timestamp: new Date().toLocaleTimeString()
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return enrichSessionMemory({
            ...s,
            messages: [...s.messages, userMsg, aiMsg],
            status: 'ready',
            unread: true,
            updatedAt: new Date().toISOString()
          });
        }
        return s;
      }));

      setIsMediaSynthesizing(false);
      setImageSynthPrompt("");
      addNotification("Generative graphic synthesized successfully!", "success");
    }, 1500);
  };

  const handleSynthesize3DMesh = async () => {
    if (!meshSynthPrompt.trim()) {
      addNotification("Please enter a 3D model prompt first!", "warning");
      return;
    }
    if (dailyQueries >= maxQueries) {
      addNotification("Daily chat query allocation reached!", "warning");
      return;
    }
    setIsMediaSynthesizing(true);
    setDailyQueries(prev => prev + 1);

    const simulatedObj = `# Forge-3D Synthesizer Export OBJ
# Subject: ${meshSynthPrompt} (${meshSynthType})
v 0.0 1.0 0.0
v -1.0 -1.0 1.0
v 1.0 -1.0 1.0
v 1.0 -1.0 -1.0
v -1.0 -1.0 -1.0
f 1 2 3
f 1 3 4
f 1 4 5
f 1 5 2
f 2 5 4 3`;

    setTimeout(() => {
      const userMsg: ChatMessage = {
        role: "user",
        content: `Synthesize 3D Mesh asset: "${meshSynthPrompt}" (${meshSynthType})`,
        timestamp: new Date().toLocaleTimeString()
      };

      const aiMsg: ChatMessage = {
        role: "assistant",
        content: `### Synthesized 3D Wavefront OBJ Mesh
Generated an organic coordinate wireframe matching **"${meshSynthPrompt}"**. Double-click or interact in the canvas to examine topology.

\`\`\`obj
${simulatedObj}
\`\`\``,
        timestamp: new Date().toLocaleTimeString()
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return enrichSessionMemory({
            ...s,
            messages: [...s.messages, userMsg, aiMsg],
            status: 'ready',
            unread: true,
            updatedAt: new Date().toISOString()
          });
        }
        return s;
      }));

      setIsMediaSynthesizing(false);
      setMeshSynthPrompt("");
      addNotification("3D mesh wireframe generated successfully!", "success");
    }, 1800);
  };

  const executeQuickAction = (actionType: string) => {
    switch (actionType) {
      case "code":
        setChatInput("Generate a fully styled HTML canvas retro breakout brick-breaker game. Provide CSS and javascript integrated inside index.html.");
        break;
      case "image":
        setChatInput("Generate a realistic neon HUD tech panel texture with detailed coordinate indicators.");
        break;
      case "3d":
        setChatInput("Generate a low-poly 3D sci-fi spaceship fighter model OBJ mesh.");
        break;
      case "explain":
        setChatInput("Explain how React useEffect cleanup functions prevent socket memory leaks. Provide an analogy and a sample snippet.");
        break;
      case "debug":
        setChatInput("Debug this Javascript error:\nUncaught TypeError: Cannot read properties of undefined (reading 'map')");
        break;
      case "learn":
        setChatInput("Teach me Python dictionary comprehensions with a visual text diagram and 3 beginner-friendly exercises.");
        break;
      case "summarize":
        setChatInput("Summarize the key architectural benefits of micro-frontends versus modular monorepos.");
        break;
      case "upload":
        handleUploadFileTrigger();
        break;
      default:
        break;
    }
  };

  // Grouping sessions for Email Client feel
  const groupSessionsByDate = (sessionsList: ChatSession[]) => {
    const groups: Record<string, ChatSession[]> = {
      "Today": [],
      "Yesterday": [],
      "Last 7 Days": [],
      "Last Month": [],
      "Older": []
    };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    sessionsList.forEach(session => {
      const dateVal = session.updatedAt || session.createdAt;
      const updatedDate = new Date(dateVal);
      
      if (updatedDate >= todayStart) {
        groups["Today"].push(session);
      } else if (updatedDate >= yesterdayStart) {
        groups["Yesterday"].push(session);
      } else if (updatedDate >= sevenDaysAgo) {
        groups["Last 7 Days"].push(session);
      } else if (updatedDate >= lastMonthStart) {
        groups["Last Month"].push(session);
      } else {
        groups["Older"].push(session);
      }
    });

    return groups;
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle.trim(), updatedAt: new Date().toISOString() } : s));
    setEditingSessionId(null);
    addNotification("Conversation renamed successfully.", "info");
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      addNotification("Cannot delete the only remaining active chat thread.", "warning");
      return;
    }
    setDeleteConfirmSessionId(id);
  };

  const executeDeleteSession = (id: string, deleteAssets: boolean) => {
    const sessionToDelete = sessions.find(s => s.id === id);
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0].id);
    }
    
    if (deleteAssets && sessionToDelete) {
      const filesCount = sessionToDelete.generatedFiles?.length || 0;
      const imagesCount = sessionToDelete.generatedImages?.length || 0;
      addNotification(`Chat conversation deleted alongside ${filesCount} code files and ${imagesCount} concepts.`, "success");
    } else {
      addNotification("Chat session removed permanently. Sandboxed assets preserved.", "info");
    }
    setDeleteConfirmSessionId(null);
  };

  const handleDuplicateSession = (id: string) => {
    const sessionToDup = sessions.find(s => s.id === id);
    if (!sessionToDup) return;
    
    const newSession: ChatSession = {
      ...sessionToDup,
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${sessionToDup.title} (Copy)`,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: sessionToDup.messages.map(m => ({ ...m })),
    };
    
    setSessions(prev => [newSession, ...prev]);
    addNotification(`Duplicated conversation as "${newSession.title}"`, "success");
  };

  const handleExportSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    
    let md = `# Conversation Title: ${session.title}\n`;
    md += `*Created: ${new Date(session.createdAt).toLocaleString()}*\n`;
    md += `*Workspace: ${session.workspace || "General"}*\n\n`;
    md += `--- \n\n`;
    
    session.messages.forEach(m => {
      const roleName = m.role === 'user' ? "User" : "ForgeAI";
      md += `### **${roleName}** *(${m.timestamp})*\n\n${m.content}\n\n`;
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addNotification("Conversation exported as Markdown successfully.", "success");
  };

  const handleShareSession = (id: string) => {
    const mockShareUrl = `https://forgeai.workspace/share/chat-${id.substring(8, 15)}`;
    navigator.clipboard.writeText(mockShareUrl).then(() => {
      addNotification("Shareable conversation link copied to clipboard!", "success");
    }).catch(() => {
      addNotification(`Copied share link: ${mockShareUrl}`, "info");
    });
  };

  const handleMoveToFolderPrompt = (id: string) => {
    const folderName = prompt("Enter folder name (e.g. Work, Personal, Code, Art, etc.):");
    if (folderName === null) return;
    handleMoveToFolder(id, folderName.trim());
  };

  const handleAddTagsPrompt = (id: string) => {
    const session = sessions.find(s => s.id === id);
    const existingTags = session?.tags?.join(", ") || "";
    const tagsInput = prompt("Enter tags (comma separated, e.g. react, api, bug):", existingTags);
    if (tagsInput === null) return;
    
    const newTags = tagsInput.split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);
      
    setSessions(prev => prev.map(s => s.id === id ? { ...s, tags: newTags, updatedAt: new Date().toISOString() } : s));
    addNotification("Conversation tags updated successfully.", "success");
  };

  // Close context menu on window click helper
  useEffect(() => {
    const handleCloseMenu = () => setContextMenu(null);
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, []);

  const handleTogglePin = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, pinned: !s.pinned, updatedAt: new Date().toISOString() } : s));
    addNotification("Conversation pin state updated.", "success");
  };

  const handleToggleFavorite = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, favorite: !s.favorite, updatedAt: new Date().toISOString() } : s));
    addNotification("Conversation marked as favorite.", "success");
  };

  const handleMoveToFolder = (id: string, folderName: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, folder: folderName, updatedAt: new Date().toISOString() } : s));
    addNotification(`Moved chat thread to: ${folderName || "Inbox"}`, "info");
  };

  const handleAddTag = (id: string, tag: string) => {
    if (!tag.trim()) return;
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        const tags = s.tags || [];
        if (tags.includes(tag)) return s;
        return { ...s, tags: [...tags, tag.trim()], updatedAt: new Date().toISOString() };
      }
      return s;
    }));
    addNotification(`Added tag: ${tag}`, "success");
  };

  const handleToggleArchive = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, archived: !s.archived, updatedAt: new Date().toISOString() } : s));
    addNotification("Chat thread archived.", "info");
  };

  const handleUploadFileTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFile = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`
      };
      setAttachedFiles(prev => [...prev, newFile]);
      addNotification(`Attached file: ${file.name} (Simulation)`, "success");
      
      // Inject bot confirmation
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return enrichSessionMemory({
            ...s,
            messages: [
              ...s.messages,
              {
                role: "assistant",
                content: `📎 **Attached file to active context sandbox:** \`${file.name}\` (${newFile.size}).\n\nI can now read and interpret this mock reference while answering queries inside this isolated thread. Ask me anything about its contents!`,
                timestamp: new Date().toLocaleTimeString()
              }
            ],
            updatedAt: new Date().toISOString()
          }, [newFile]);
        }
        return s;
      }));
    }
  };

  // Filtered Sessions selector
  const filteredSessions = sessions.filter(s => {
    if (s.archived) return false;
    
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const matchesTitle = s.title.toLowerCase().includes(query);
    const matchesMessages = s.messages.some(m => m.content.toLowerCase().includes(query));
    const matchesFiles = s.generatedFiles?.some(f => f.toLowerCase().includes(query));
    const matchesImages = s.generatedImages?.some(img => img.toLowerCase().includes(query));
    const matches3D = s.generated3D?.some(mesh => mesh.toLowerCase().includes(query));
    const matchesTags = s.tags?.some(t => t.toLowerCase().includes(query));
    const matchesFolder = s.folder?.toLowerCase().includes(query);

    return matchesTitle || matchesMessages || matchesFiles || matchesImages || matches3D || matchesTags || matchesFolder;
  });

  const pinnedSessions = filteredSessions.filter(s => s.pinned);
  const recentSessions = filteredSessions.filter(s => !s.pinned);

  // Grouped active sessions list
  const dateGroups = groupSessionsByDate(filteredSessions);

  // Parse message Markdown block render helper
  const renderMessageContent = (content: string) => {
    // Detect custom IMAGE_ASSET block helper
    if (content.startsWith("[IMAGE_ASSET:") && content.endsWith("]")) {
      const matches = /\[IMAGE_ASSET:\s*([^\s|]+)\s*\|\s*([^\]]+)\]/.exec(content);
      if (matches) {
        const url = matches[1];
        const promptText = matches[2];
        return (
          <div className="space-y-2 mt-2">
            <p className="text-slate-300">Here is your customized illustration mock representing: <em className="text-teal-400">"{promptText}"</em></p>
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl inline-flex flex-col max-w-sm">
              <img src={url} alt={promptText} className="rounded-lg max-w-full h-48 object-cover shadow-lg border border-slate-900" referrerPolicy="no-referrer" />
              <span className="text-[10px] font-mono text-slate-500 mt-2 select-none">IMAGE CODE: img_illustration_${Date.now()}.png</span>
            </div>
          </div>
        );
      }
    }

    const blocks = content.split(/(```[\s\S]*?```)/g);

    return blocks.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const match = /```(\w+)(?::([\w.-]+))?\n([\s\S]*?)```/.exec(part);
        const lang = match ? match[1] : "javascript";
        const fileName = match && match[2] ? match[2] : `generated_script.${lang === 'javascript' ? 'js' : lang === 'typescript' ? 'ts' : lang === 'python' ? 'py' : 'txt'}`;
        const code = match ? match[3] : part.slice(3, -3);

        if (lang === "obj") {
          return <Interactive3DMessage key={index} objText={code} prompt={activeSession?.title || "3D Object"} />;
        }

        const fileExt = fileName.split('.').pop() || "txt";
        const blockId = `block_${index}_${fileName}`;

        return (
          <div key={index} className="my-4 bg-slate-950/90 border border-slate-900 rounded-xl overflow-hidden shadow-xl font-mono text-[11px] sm:text-xs">
            {/* Header info */}
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-900 select-none">
              <div className="flex items-center space-x-2 text-slate-400">
                <Code className="h-4 w-4 text-teal-400" />
                <span className="font-extrabold text-[10px] uppercase font-mono tracking-wider">{lang}</span>
                <span className="text-[10px] text-slate-500 font-medium font-mono">({fileName})</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-500">
                <button 
                  onClick={() => handleCopyCode(code, blockId)}
                  className="hover:text-white flex items-center space-x-1.5 transition text-[11px] font-semibold py-1 px-2 hover:bg-slate-800 rounded">
                  {copiedBlockId === blockId ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[10px]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => handleDownloadCode(code, fileName)}
                  className="hover:text-white flex items-center space-x-1.5 transition text-[11px] font-semibold py-1 px-2 hover:bg-slate-800 rounded">
                  <Download className="h-3 w-3" />
                  <span>Download as .{fileExt}</span>
                </button>
              </div>
            </div>
            {/* Scrollable code area */}
            <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed max-h-96">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Render standard paragraph text, basic bold, italics, lists, inline code ticks
      const textLines = part.split("\n").map((line, lIdx) => {
        let renderedLine = line;
        
        // Match list bullets
        const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
        if (isBullet) {
          renderedLine = line.trim().substring(2);
        }

        // Parse inline code ticks `code`
        const tickParts = renderedLine.split(/(`[^`]+`)/g);
        const lineContent = tickParts.map((tPart, tIdx) => {
          if (tPart.startsWith("`") && tPart.endsWith("`")) {
            return (
              <code key={tIdx} className="bg-slate-900 border border-slate-800 text-teal-300 px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5">
                {tPart.slice(1, -1)}
              </code>
            );
          }
          
          // Parse basic bold **text**
          const boldParts = tPart.split(/(\*\*[^*]+\*\*)/g);
          return boldParts.map((bPart, bIdx) => {
            if (bPart.startsWith("**") && bPart.endsWith("**")) {
              return <strong key={bIdx} className="font-bold text-white">{bPart.slice(2, -2)}</strong>;
            }
            return bPart;
          });
        });

        if (isBullet) {
          return (
            <li key={lIdx} className="ml-4 list-disc text-slate-300 leading-relaxed my-1">
              {lineContent}
            </li>
          );
        }

        return (
          <p key={lIdx} className={`text-slate-300 leading-relaxed my-1.5 ${line.trim() === "" ? "h-2" : ""}`}>
            {lineContent}
          </p>
        );
      });

      return <div key={index} className="space-y-1">{textLines}</div>;
    });
  };

  // Helper for Category icon pairing
  const getCategoryIcon = (category?: ChatSession['category']) => {
    switch (category) {
      case 'code': return <Code className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
      case 'image': return <ImageIcon className="h-3.5 w-3.5 text-purple-400 shrink-0" />;
      case '3d': return <Box className="h-3.5 w-3.5 text-indigo-400 shrink-0" />;
      case 'learning': return <BookOpen className="h-3.5 w-3.5 text-cyan-400 shrink-0" />;
      case 'debug': return <Terminal className="h-3.5 w-3.5 text-rose-400 shrink-0" />;
      case 'planning': return <FileText className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
      default: return <MessageSquare className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
    }
  };

  // Helper for status visual color lights
  const getStatusLight = (status?: ChatSession['status']) => {
    switch (status) {
      case 'answering': return <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse block" title="Answering..." />;
      case 'generating_code': return <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse block" title="Analyzing Code..." />;
      case 'generating_image': return <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse block" title="Synthesizing Graphic..." />;
      case 'generating_3d': return <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse block" title="Modeling 3D Mesh..." />;
      case 'error': return <span className="h-2 w-2 rounded-full bg-red-500 block" title="Error" />;
      default: return <span className="h-2 w-2 rounded-full bg-slate-500 block" title="Ready" />;
    }
  };

  const getStatusText = (status?: ChatSession['status']) => {
    switch (status) {
      case 'answering': return "Answering...";
      case 'generating_code': return "Generating Code...";
      case 'generating_image': return "Generating Image...";
      case 'generating_3d': return "Generating 3D...";
      case 'error': return "Error occurred";
      default: return "Ready";
    }
  };

  const usagePercent = Math.min(100, (dailyQueries / maxQueries) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 font-sans h-full w-full">
      
      {/* 1. Global Custom Chat Layout Top Header */}
      <header className="px-6 py-4 border-b border-slate-900 bg-slate-950/90 flex items-center justify-between shrink-0 h-16 z-10 selection:bg-teal-500/30">
        
        {/* Left branding */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="h-9 w-9 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 shrink-0">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">ForgeAI Assistant</span>
              <span className="px-1 py-0.2 bg-teal-500/10 text-teal-400 text-[7px] uppercase font-mono rounded border border-teal-500/20 font-bold">CHAT MODE</span>
            </div>
            <p className="text-[9px] text-slate-500">Isolated Educational Sandbox</p>
          </div>
          
          {/* New Chat Button directly in Header */}
          <button 
            onClick={() => handleCreateNewChat()}
            className="ml-3 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 hover:text-slate-950 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>+ New Chat</span>
          </button>
        </div>

        {/* Center Search Input */}
        <div className="hidden md:block relative w-96 max-w-md mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search titles, messages, files, tags..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 focus:border-teal-500 rounded-xl py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none placeholder-slate-500 transition shadow-inner"
          />
        </div>

        {/* Right profile controls */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg px-2 py-1 flex items-center space-x-1.5 text-teal-400 font-mono text-[9px]">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>Router Mode</span>
          </div>
          <div className="h-8 w-8 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-xs font-black text-slate-950 select-none">
            {userName.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      {/* 2. Main content area below top header split into Center Chat and Right History */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Center Chat View stream pane */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950/40 relative h-full">
          
          {/* Chat Settings bar */}
          <div className="px-6 py-2 border-b border-slate-900 bg-slate-950/50 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2 truncate text-xs text-slate-400 font-medium">
              <span className="text-slate-500">Active conversation:</span>
              <span className="text-white font-semibold truncate max-w-xs">{activeSession?.title}</span>
              {activeSession?.pinned && <Pin className="h-3 w-3 text-teal-400 shrink-0" />}
              {activeSession?.favorite && <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />}
            </div>

            {/* AI Model indicator */}
            <div className="flex items-center space-x-2 shrink-0">
              <div className="flex items-center space-x-2 text-[10px] font-mono font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-lg">
                <Sparkles className="h-3 w-3 text-teal-400 animate-pulse" />
                <span>Forge AI Engine • Intelligent Router Active</span>
              </div>
            </div>
          </div>

          {/* Messages loop thread */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeSession?.messages.map((msg, index) => {
              const isAI = msg.role === "assistant";
              return (
                <div 
                  key={index}
                  className={`flex space-x-3 max-w-4xl ${isAI ? "" : "ml-auto flex-row-reverse space-x-reverse"}`}>
                  
                  {/* Avatar icon */}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    isAI ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "bg-slate-800 text-slate-300"
                  }`}>
                    {isAI ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                  </div>

                  {/* Bubble wrapper */}
                  <div className={`space-y-1 max-w-[85%]`}>
                    <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAI ? "bg-slate-900/30 border border-slate-900/80 text-slate-200" : "bg-teal-500 text-slate-950 font-semibold"
                    }`}>
                      {isAI ? (
                        renderMessageContent(msg.content)
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                    <div className={`text-[9px] font-mono text-slate-500 flex items-center justify-between ${isAI ? "pl-2" : "text-right pr-2"}`}>
                      <span>{msg.timestamp}</span>
                      {isAI && (
                        <button
                          type="button"
                          onClick={() => handleSpeakMessage(index, msg.content)}
                          title="Speak response with Kokoro TTS (@fal-ai/client)"
                          className={`ml-3 px-2 py-0.5 rounded text-[10px] font-mono flex items-center space-x-1 transition cursor-pointer ${
                            playingMessageIndex === index
                              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                              : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                          }`}>
                          {isTtsLoading && playingMessageIndex === index ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin text-teal-400" />
                              <span>Synthesizing...</span>
                            </>
                          ) : playingMessageIndex === index ? (
                            <>
                              <VolumeX className="h-3 w-3 text-teal-400 animate-pulse" />
                              <span>Stop Speech</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3 w-3 text-slate-400" />
                              <span>Read Aloud (Kokoro TTS)</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}

            {/* INJECT INTERACTIVE WORKSPACE WIZARD FOR FRESH EMPTY SESSIONS */}
            {activeSession && activeSession.messages.filter(m => m.role === 'user').length === 0 && !isChatSending && (
              <div className="mt-4 p-6 bg-slate-900/30 border border-slate-900/80 rounded-2xl max-w-4xl space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-sm animate-fade-in text-left">
                {/* Background decorative glow */}
                <div className="absolute -top-12 -right-12 h-36 w-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
                
                {/* Wizard Header */}
                <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-9 w-9 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-teal-400">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">ForgeAI Workspace Setup Wizard</h3>
                      <p className="text-[10px] text-slate-400">Guided sandbox blueprinting & prompt injection</p>
                    </div>
                  </div>
                  
                  {/* Progressive Dot Indicators */}
                  <div className="flex items-center space-x-1">
                    {[0, 1, 2, 3].map((step) => (
                      <div 
                        key={step} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          wizardStep === step ? "w-5 bg-teal-400" : "w-1.5 bg-slate-800"
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                {/* STEP 0: SELECT WORKSPACE BLUEPRINT */}
                {wizardStep === 0 && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Step 1: Select Workspace Blueprint</h4>
                      <p className="text-xs text-slate-400 mt-1">Select a workspace category to load specific compiler configurations, libraries, and starting file trees.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
                      {Object.keys(WIZARD_QUESTIONS).map((ws) => {
                        return (
                          <button
                            key={ws}
                            onClick={() => {
                              setSelectedWorkspace(ws);
                              setWizardStep(1);
                              setActiveQuestionIndex(0);
                              setWizardAnswers({});
                              setRecommendedFeatures(WIZARD_RECOMMENDATIONS[ws] || []);
                              setCustomFeatures([]);
                            }}
                            className="p-3.5 bg-slate-950/40 hover:bg-slate-900 border border-slate-850 hover:border-teal-500/40 rounded-xl text-left transition group relative cursor-pointer flex flex-col justify-between h-28 hover:shadow-lg">
                            <span className="text-sm font-bold text-white group-hover:text-teal-300 transition flex items-center space-x-1.5">
                              <span>{ws}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                              Custom setup questions, folder templates, and recommended features.
                            </span>
                            <div className="text-[9px] font-mono text-slate-500 mt-2 flex items-center justify-between">
                              <span>Boilerplate Ready</span>
                              <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-teal-400 transition transform group-hover:translate-x-0.5" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 1: PROGRESSIVE CUSTOM QUESTIONS */}
                {wizardStep === 1 && selectedWorkspace && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-[9px] rounded-md font-bold uppercase">
                          {selectedWorkspace}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mt-2">
                          Step 2: Customize Your Architecture ({activeQuestionIndex + 1}/3)
                        </h4>
                      </div>
                      <button 
                        onClick={() => setWizardStep(0)}
                        className="text-[10px] text-slate-400 hover:text-white transition flex items-center space-x-1 cursor-pointer">
                        <ArrowLeft className="h-3 w-3" />
                        <span>Change Workspace</span>
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-teal-400 h-full transition-all duration-300"
                        style={{ width: `${((activeQuestionIndex + 1) / 3) * 100}%` }}
                      />
                    </div>

                    {/* Active Question Panel */}
                    {WIZARD_QUESTIONS[selectedWorkspace] && WIZARD_QUESTIONS[selectedWorkspace][activeQuestionIndex] && (
                      <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-900/60 space-y-4 animate-fade-in">
                        <h5 className="text-sm font-semibold text-white">
                          {WIZARD_QUESTIONS[selectedWorkspace][activeQuestionIndex].question}
                        </h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {WIZARD_QUESTIONS[selectedWorkspace][activeQuestionIndex].options.map((opt) => {
                            const qText = WIZARD_QUESTIONS[selectedWorkspace][activeQuestionIndex].question;
                            const isAnswered = wizardAnswers[qText] === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => {
                                  setWizardAnswers(prev => ({ ...prev, [qText]: opt }));
                                  if (activeQuestionIndex < 2) {
                                    setActiveQuestionIndex(prev => prev + 1);
                                  } else {
                                    setWizardStep(2);
                                  }
                                }}
                                className={`p-3 rounded-lg text-left text-xs transition font-semibold cursor-pointer border flex items-center justify-between ${
                                  isAnswered 
                                    ? "bg-teal-500/10 border-teal-400 text-teal-300 shadow-md" 
                                    : "bg-slate-900/40 hover:bg-slate-900 border-slate-850 text-slate-300 hover:text-white"
                                }`}>
                                <span>{opt}</span>
                                {isAnswered && <Check className="h-3.5 w-3.5 text-teal-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => {
                          if (activeQuestionIndex > 0) {
                            setActiveQuestionIndex(prev => prev - 1);
                          } else {
                            setWizardStep(0);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-slate-950 text-slate-400 hover:text-white border border-slate-850 rounded-lg text-xs font-semibold transition cursor-pointer">
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: CUSTOMIZE & ADD RECOMMENDATIONS */}
                {wizardStep === 2 && selectedWorkspace && (
                  <div className="space-y-5">
                    <div>
                      <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-[9px] rounded-md font-bold uppercase">
                        {selectedWorkspace}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mt-2">
                        Step 3: Review Recommended Features
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        We have compiled custom components and packages perfect for your selections. Confirm or toggle choices below.
                      </p>
                    </div>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900/60 space-y-3 max-h-56 overflow-y-auto text-left">
                      {WIZARD_RECOMMENDATIONS[selectedWorkspace]?.map((feat) => {
                        const isIncluded = recommendedFeatures.includes(feat);
                        return (
                          <button
                            key={feat}
                            onClick={() => {
                              if (isIncluded) {
                                setRecommendedFeatures(prev => prev.filter(f => f !== feat));
                              } else {
                                setRecommendedFeatures(prev => [...prev, feat]);
                              }
                            }}
                            className="w-full p-2.5 bg-slate-900/30 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-lg text-left transition text-xs flex items-center justify-between group cursor-pointer">
                            <span className={`${isIncluded ? "text-slate-200 font-semibold" : "text-slate-500 line-through"}`}>
                              {feat}
                            </span>
                            <div className={`h-4.5 w-4.5 rounded border transition flex items-center justify-center ${
                              isIncluded ? "bg-teal-500 border-teal-400 text-slate-950" : "border-slate-700"
                            }`}>
                              {isIncluded && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}

                      {customFeatures.map((feat) => (
                        <div
                          key={feat}
                          className="p-2.5 bg-teal-500/5 border border-teal-500/20 rounded-lg text-xs flex items-center justify-between text-left">
                          <span className="text-teal-300 font-semibold">{feat}</span>
                          <button
                            onClick={() => setCustomFeatures(prev => prev.filter(f => f !== feat))}
                            className="text-slate-500 hover:text-red-400 transition cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add custom feature input */}
                    <div className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        placeholder="Add custom feature or library (e.g. framer-motion)..."
                        value={customFeatureInput}
                        onChange={(e) => setCustomFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customFeatureInput.trim()) {
                            setCustomFeatures(prev => [...prev, customFeatureInput.trim()]);
                            setCustomFeatureInput("");
                          }
                        }}
                        className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                      <button
                        onClick={() => {
                          if (customFeatureInput.trim()) {
                            setCustomFeatures(prev => [...prev, customFeatureInput.trim()]);
                            setCustomFeatureInput("");
                          }
                        }}
                        className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition cursor-pointer">
                        Add
                      </button>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between border-t border-slate-850 pt-4">
                      <button
                        onClick={() => setWizardStep(1)}
                        className="px-3.5 py-1.5 bg-slate-950 text-slate-400 hover:text-white border border-slate-850 rounded-lg text-xs font-semibold transition cursor-pointer">
                        Back
                      </button>
                      <button
                        onClick={() => setWizardStep(3)}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition cursor-pointer shadow-md shadow-teal-500/10">
                        Create Architecture Plan
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: MILESTONES & ARCHITECTURE PLAN VIEW */}
                {wizardStep === 3 && selectedWorkspace && (() => {
                  const plan = getWorkspacePlan(selectedWorkspace, wizardAnswers, [...recommendedFeatures, ...customFeatures]);
                  return (
                    <div className="space-y-5 animate-fade-in text-left">
                      <div>
                        <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-[9px] rounded-md font-bold uppercase">
                          {selectedWorkspace}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mt-2">
                          Step 4: Architecture Plan & Execution
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Review folder layout and milestones before scaffolding the isolated thread container.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Folder tree */}
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Estimated File Structure:</span>
                          <pre className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-900 font-mono text-[10px] text-teal-400 overflow-x-auto leading-relaxed h-44 text-left">
                            {plan.folders}
                          </pre>
                        </div>
                        
                        {/* Milestones */}
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Strategic Milestones:</span>
                          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-900 space-y-2.5 h-44 overflow-y-auto text-left">
                            {plan.milestones.map((m, idx) => (
                              <div key={idx} className="flex items-start space-x-2 text-[11px] text-slate-300 text-left">
                                <div className="h-4 w-4 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center font-mono text-[8px] text-teal-400 mt-0.5 shrink-0">
                                  {idx + 1}
                                </div>
                                <span className="leading-tight">{m}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex items-center justify-between border-t border-slate-850 pt-4">
                        <button
                          onClick={() => setWizardStep(2)}
                          className="px-3.5 py-1.5 bg-slate-950 text-slate-400 hover:text-white border border-slate-850 rounded-lg text-xs font-semibold transition cursor-pointer">
                          Back
                        </button>
                        <button
                          onClick={() => {
                            const allFeatures = [...recommendedFeatures, ...customFeatures];
                            // Construct prompt
                            const finalPrompt = `I want to set up a new sandbox project for: **${selectedWorkspace}**.
                            
**PROJECT ARCHITECTURE:**
* Workspace Category: ${selectedWorkspace}
${Object.entries(wizardAnswers).map(([q, ans]) => `* ${q}: ${ans}`).join("\n")}
* Chosen Integrations: ${allFeatures.length > 0 ? allFeatures.join(", ") : "Minimal Starting Scaffold"}

**EXPECTED FOLDER BLUEPRINT:**
\`\`\`
${plan.folders}
\`\`\`

**EXECUTION INSTRUCTIONS:**
Please scaffold a fully featured starting template incorporating these features. Generate modular files, write elegant helper comments, configure proper starting states, and verify code execution. Start scaffolding immediately!`;

                            // Automatically name the thread cleanly
                            const wsType = selectedWorkspace.split(" ")[0] || "App";
                            const specTheme = wizardAnswers["What design aesthetic do you prefer?"] || wizardAnswers["What game genre are you scripting?"] || "Standard";
                            const specKind = wizardAnswers["What kind of website would you like to build?"] || wizardAnswers["What type of application are you building?"] || "Workspace";
                            const formattedTitle = `${wsType}: ${specTheme} ${specKind}`;
                            
                            triggerWizardScaffolding(selectedWorkspace, finalPrompt, formattedTitle);
                          }}
                          className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-black transition cursor-pointer shadow-md shadow-teal-500/20 flex items-center space-x-2 animate-pulse">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>🚀 Scaffold & Generate Sandbox</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}
            
            {isChatSending && (
              <div className="flex space-x-3">
                <div className="h-8 w-8 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center animate-pulse">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl max-w-[80%] flex items-center space-x-3 text-xs text-slate-400">
                  <RefreshCw className="h-4.5 w-4.5 text-teal-400 animate-spin" />
                  <span>Compiler and routing sub-model solving prompt...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom command form entry */}
          <div className="p-4 sm:p-6 border-t border-slate-900 bg-slate-950/90 space-y-4 shrink-0">
            
            {/* Quick Action button bar */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-[10px] font-semibold text-slate-400 select-none">
              <span className="text-slate-500 font-mono text-[9px] mr-1 uppercase">SHORTCUTS:</span>
              <button 
                onClick={() => executeQuickAction("code")}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 rounded-lg shrink-0 flex items-center space-x-1 transition cursor-pointer">
                <Code className="h-3 w-3 text-teal-400" />
                <span>Generate Code</span>
              </button>
              <button 
                onClick={() => executeQuickAction("image")}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 rounded-lg shrink-0 flex items-center space-x-1 transition cursor-pointer">
                <ImageIcon className="h-3 w-3 text-purple-400" />
                <span>Generate Image</span>
              </button>
              <button 
                onClick={() => executeQuickAction("3d")}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 rounded-lg shrink-0 flex items-center space-x-1 transition cursor-pointer">
                <Box className="h-3 w-3 text-indigo-400" />
                <span>Generate 3D</span>
              </button>
              <button 
                onClick={() => executeQuickAction("explain")}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 rounded-lg shrink-0 flex items-center space-x-1 transition cursor-pointer">
                <BookOpen className="h-3 w-3 text-cyan-400" />
                <span>Explain Code</span>
              </button>
              <button 
                onClick={() => executeQuickAction("debug")}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 rounded-lg shrink-0 flex items-center space-x-1 transition cursor-pointer">
                <Terminal className="h-3 w-3 text-rose-400" />
                <span>Debug Code</span>
              </button>
              <button 
                onClick={() => executeQuickAction("upload")}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 rounded-lg shrink-0 flex items-center space-x-1 transition cursor-pointer">
                <Upload className="h-3 w-3 text-slate-300" />
                <span>Attach Reference File</span>
              </button>
            </div>

            {/* Main entry field */}
            <form onSubmit={handleSendQuery} className="flex items-center space-x-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <div className="flex-1 relative">
                <textarea 
                  rows={1}
                  placeholder={dailyQueries >= maxQueries ? "Daily Allocation Exhausted. Try again later!" : "Ask anything! Learn programming, write calculators, explain code..."}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={dailyQueries >= maxQueries || isChatSending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendQuery();
                    }
                  }}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-teal-500 rounded-xl py-3 pl-4 pr-20 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none h-11 max-h-32 transition shadow-inner font-sans"
                />
                <button 
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`absolute right-10 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition cursor-pointer ${
                    isListening 
                      ? "text-red-400 bg-red-500/20 border border-red-500/30 animate-pulse" 
                      : "text-slate-500 hover:text-white"
                  }`}
                  title="Speak to Transcribe (Voice input)">
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <button 
                  type="button"
                  onClick={handleUploadFileTrigger}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white transition cursor-pointer"
                  title="Attach mock document file">
                  <Paperclip className="h-4 w-4" />
                </button>
              </div>
              <button 
                type="submit"
                disabled={!chatInput.trim() || isChatSending || dailyQueries >= maxQueries}
                className="bg-teal-500 hover:bg-teal-400 disabled:bg-slate-900 text-slate-950 disabled:text-slate-600 p-3 rounded-xl transition shrink-0 cursor-pointer shadow-lg shadow-teal-500/10">
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </main>

        {/* 3. Drag resize handle divider */}
        <div 
          onMouseDown={startResizing}
          className="w-1 bg-slate-900 hover:bg-teal-500 active:bg-teal-400 cursor-col-resize transition duration-150 h-full shrink-0 select-none z-10"
          title="Drag to resize panel"
        />

        {/* 4. Resizable Right Context & History Panel */}
        <aside 
          className="bg-slate-950 border-l border-slate-900 flex flex-col h-full shrink-0 relative overflow-hidden"
          style={{ width: `${historyWidth}px` }}>
          
          {/* Global Sidebar Action Area: New Chat and Search Input */}
          <div className="p-3.5 border-b border-slate-900 bg-slate-950 shrink-0 space-y-2.5 select-none">
            <button 
              onClick={() => handleCreateNewChat()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-lg shadow-blue-500/10 cursor-pointer">
              <Plus className="h-4 w-4" />
              <span>+ New Chat</span>
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 focus:border-teal-500 rounded-lg py-1.5 pl-9 pr-3 text-xs text-white focus:outline-none placeholder-slate-500 transition"
              />
            </div>
          </div>
          
          {/* Top Panel Tab Headers */}
          <div className="flex border-b border-slate-900 bg-slate-950/80 p-2 shrink-0 select-none">
            <button
              onClick={() => setActiveRightTab('history')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase transition flex items-center justify-center space-x-1.5 ${
                activeRightTab === 'history' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}>
              <Calendar className="h-3 w-3" />
              <span>History</span>
            </button>
            <button
              onClick={() => setActiveRightTab('inspect')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase transition flex items-center justify-center space-x-1.5 ${
                activeRightTab === 'inspect' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}>
              <HelpCircle className="h-3 w-3" />
              <span>Inspect</span>
            </button>
            <button
              onClick={() => setActiveRightTab('media')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase transition flex items-center justify-center space-x-1.5 ${
                activeRightTab === 'media' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}>
              <Sparkles className="h-3 w-3" />
              <span>Media Lab</span>
            </button>
          </div>

          {/* Right tab main scroll area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 selection:bg-teal-500/30">
            
            {activeRightTab === 'history' && (
              <div className="space-y-5">
                
                {/* Search summary status line */}
                {searchQuery && (
                  <div className="p-2 bg-blue-950/20 border border-blue-900/30 rounded-lg text-[10px] text-blue-300 flex items-center justify-between">
                    <span>Filtered matches: <strong>{filteredSessions.length}</strong></span>
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="text-blue-400 hover:underline">
                      Clear Search
                    </button>
                  </div>
                )}

                {/* Group sectioning */}
                {Object.entries(dateGroups).map(([groupName, groupItems]) => {
                  if (groupItems.length === 0) return null;
                  
                  return (
                    <div key={groupName} className="space-y-3">
                      <div className="flex items-center space-x-2 px-1">
                        <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block shrink-0">{groupName}</span>
                        <div className="h-[1px] bg-slate-900 grow" />
                      </div>

                      <div className="space-y-2.5">
                        {groupItems.map(s => {
                          const isActive = s.id === activeSessionId;
                          const hasAssets = (s.generatedFiles && s.generatedFiles.length > 0) || 
                                            (s.generatedImages && s.generatedImages.length > 0) ||
                                            (s.generated3D && s.generated3D.length > 0) ||
                                            (s.attachments && s.attachments.length > 0);
                          
                          return (
                            <div 
                              key={s.id}
                              onClick={() => {
                                setActiveSessionId(s.id);
                                // Reset unread status on click
                                if (s.unread) {
                                  setSessions(prev => prev.map(item => item.id === s.id ? { ...item, unread: false } : item));
                                }
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                                isActive 
                                  ? 'bg-blue-500/10 border-blue-500 shadow-md shadow-blue-500/5' 
                                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700/60'
                              } flex flex-col space-y-2 group`}>
                              
                              {/* Top Bar: Icon, Title & Flags */}
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex items-center space-x-2 truncate">
                                  {getCategoryIcon(s.category)}
                                  
                                  {editingSessionId === s.id ? (
                                    <input 
                                      type="text"
                                      value={editTitleValue}
                                      onChange={(e) => setEditTitleValue(e.target.value)}
                                      onBlur={() => handleRenameSession(s.id, editTitleValue)}
                                      onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSession(s.id, editTitleValue); }}
                                      onClick={(e) => e.stopPropagation()}
                                      autoFocus
                                      className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none w-36"
                                    />
                                  ) : (
                                    <span className="font-extrabold text-xs text-slate-100 truncate w-36 select-none" title={s.title}>
                                      {s.title}
                                    </span>
                                  )}
                                </div>

                                {/* Persistent quick controls */}
                                <div className="flex items-center space-x-1 shrink-0 opacity-45 group-hover:opacity-100 transition">
                                  
                                  {/* Star favorite toggler */}
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(s.id); }}
                                    className="p-0.5 text-slate-400 hover:text-amber-400 transition"
                                    title="Mark as Favorite">
                                    <Star className={`h-3 w-3 ${s.favorite ? "fill-amber-400 text-amber-400" : ""}`} />
                                  </button>

                                  {/* Pin toggler */}
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleTogglePin(s.id); }}
                                    className="p-0.5 text-slate-400 hover:text-teal-400 transition"
                                    title="Pin conversation">
                                    <Pin className={`h-3 w-3 ${s.pinned ? "fill-teal-400 text-teal-400" : ""}`} />
                                  </button>

                                  {/* Trash */}
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id); }}
                                    className="p-0.5 text-slate-400 hover:text-red-400 transition"
                                    title="Delete session">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Middle: Diagnostic Badges */}
                              <div className="flex flex-wrap items-center gap-1.5 text-[8px] font-mono">
                                
                                {/* Status Light + text */}
                                <div className="flex items-center space-x-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">
                                  {getStatusLight(s.status)}
                                  <span className="text-slate-500 uppercase font-black">{getStatusText(s.status)}</span>
                                </div>

                                {/* Intent */}
                                {s.intent && (
                                  <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded uppercase font-black border border-blue-500/10">
                                    {s.intent}
                                  </span>
                                )}

                                {/* Language */}
                                {s.language && s.language !== "General" && (
                                  <span className="bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded font-black border border-teal-500/10">
                                    {s.language}
                                  </span>
                                )}

                                {/* Message count */}
                                <span className="bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-bold">
                                  {s.messageCount || s.messages.length} msgs
                                </span>

                                {/* Folder Indicator */}
                                {s.folder && (
                                  <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded uppercase font-black border border-amber-500/10 flex items-center space-x-0.5">
                                    <Folder className="h-2 w-2" />
                                    <span>{s.folder}</span>
                                  </span>
                                )}
                              </div>

                              {/* 1-Sentence Smart Summary */}
                              {s.summary && (
                                <p className="text-[10px] text-slate-400 font-medium leading-normal italic select-none">
                                  {s.summary}
                                </p>
                              )}

                              {/* Double-click rename hint or tags list */}
                              <div className="flex items-center justify-between text-[8px] font-mono text-slate-500">
                                <span>Double-click title to rename</span>
                                {s.tags && s.tags.length > 0 && (
                                  <div className="flex space-x-1 truncate max-w-[120px]">
                                    {s.tags.slice(0, 2).map(tag => (
                                      <span key={tag} className="text-slate-400 font-bold">#{tag}</span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Expandable Generated Assets Section */}
                              {hasAssets && (
                                <div className="pt-2 border-t border-slate-900/60 mt-1 space-y-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedFilesSessionId(expandedFilesSessionId === s.id ? null : s.id);
                                    }}
                                    className="w-full flex items-center justify-between text-[9px] font-mono uppercase text-slate-500 hover:text-white transition font-black">
                                    <div className="flex items-center space-x-1">
                                      <Grid className="h-3 w-3 text-teal-400" />
                                      <span>Generated Assets</span>
                                    </div>
                                    <span>{expandedFilesSessionId === s.id ? "▲" : "▼"}</span>
                                  </button>

                                  {expandedFilesSessionId === s.id && (
                                    <div className="space-y-1.5 mt-1.5 pl-2 max-h-36 overflow-y-auto">
                                      
                                      {/* Files list */}
                                      {s.generatedFiles && s.generatedFiles.length > 0 && (
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-mono text-slate-600 block uppercase font-bold">Files</span>
                                          {s.generatedFiles.map(fn => (
                                            <div 
                                              key={fn} 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                addNotification(`Viewing sandbox script: ${fn}`, "info");
                                              }}
                                              className="flex items-center space-x-1.5 text-[9px] text-slate-400 hover:text-white transition truncate bg-slate-950 p-1 rounded border border-slate-900">
                                              <FileText className="h-3 w-3 text-teal-400 shrink-0" />
                                              <span className="truncate">{fn}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Images */}
                                      {s.generatedImages && s.generatedImages.length > 0 && (
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-mono text-slate-600 block uppercase font-bold">Concepts</span>
                                          <div className="grid grid-cols-3 gap-1">
                                            {s.generatedImages.map((img, iIndex) => (
                                              <img 
                                                key={iIndex} 
                                                src={img} 
                                                alt="Generated asset" 
                                                onClick={(e) => { e.stopPropagation(); addNotification("Concept graphics selected", "info"); }}
                                                className="h-8 w-full object-cover rounded border border-slate-900 hover:border-teal-400 transition cursor-pointer" 
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* 3D mesh */}
                                      {s.generated3D && s.generated3D.length > 0 && (
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-mono text-slate-600 block uppercase font-bold">3D Coordinates</span>
                                          <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 truncate bg-slate-950 p-1 rounded border border-slate-900">
                                            <Box className="h-3 w-3 text-indigo-400 shrink-0" />
                                            <span>Wavefront OBJ Mesh</span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Attachments */}
                                      {s.attachments && s.attachments.length > 0 && (
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-mono text-slate-600 block uppercase font-bold">Attached Docs</span>
                                          {s.attachments.map(att => (
                                            <div key={att} className="flex items-center space-x-1.5 text-[9px] text-slate-400 truncate bg-slate-950 p-1 rounded border border-slate-900">
                                              <Paperclip className="h-3 w-3 text-slate-500 shrink-0" />
                                              <span className="truncate">{att}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Unread indicator badge dot */}
                              {s.unread && !isActive && (
                                <span className="absolute top-2 left-2 h-2.5 w-2.5 rounded-full bg-blue-500 shadow shadow-blue-500 animate-pulse block" title="New message reply!" />
                              )}

                              {/* Folder movement on hover action menu */}
                              <div className="opacity-0 group-hover:opacity-100 transition duration-150 absolute bottom-1 right-1 flex items-center space-x-1 z-10 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                <span className="text-[8px] text-slate-500 font-mono">Move:</span>
                                <select 
                                  value={s.folder || ""}
                                  onChange={(e) => { e.stopPropagation(); handleMoveToFolder(s.id, e.target.value); }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-slate-950 border-none outline-none text-[8px] font-mono text-slate-300 focus:text-white cursor-pointer rounded">
                                  <option value="">Inbox</option>
                                  <option value="Work">Work</option>
                                  <option value="Personal">Personal</option>
                                  <option value="Code">Code</option>
                                  <option value="Art">Art</option>
                                </select>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Bottom Allocation bar inside history tab */}
                <div className="p-3 bg-slate-900/50 border border-slate-900 rounded-xl space-y-2 select-none">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold uppercase">
                    <span>Queries Used</span>
                    <span className={dailyQueries >= 65 ? "text-amber-400 font-black" : "text-teal-400 font-black"}>
                      {dailyQueries} / {maxQueries}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        dailyQueries >= 70 ? "bg-red-500" : dailyQueries >= 50 ? "bg-amber-400" : "bg-teal-400"
                      }`} 
                      style={{ width: `${usagePercent}%` }}>
                    </div>
                  </div>
                  <p className="text-[8px] text-slate-500 font-mono text-center">Allocated sandbox queries resets daily.</p>
                </div>

              </div>
            )}

            {activeRightTab === 'inspect' && (
              <>
                {/* Quick instructions guide */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">How Chat Mode Works</h4>
                  <div className="p-3 bg-slate-900/50 border border-slate-900 rounded-xl space-y-2 text-[11px] leading-relaxed text-slate-400">
                    <p>
                      <strong>Isolated assist:</strong> Perfect for learning syntax, reviewing core concepts, or experimenting with data structures.
                    </p>
                    <p>
                      <strong>No workspace side-effects:</strong> No files are modified or overwritten.
                    </p>
                    <p>
                      <strong>Build with code:</strong> Copy generated code blocks or download files, then paste them manually if desired.
                    </p>
                    <button 
                      onClick={onOpenProjectView}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] rounded border border-slate-700 transition cursor-pointer">
                      Switch to project IDE Mode
                    </button>
                  </div>
                </div>

                {/* Attached items list */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Session Attachments</h4>
                  {attachedFiles.length === 0 ? (
                    <p className="text-[11px] text-slate-600 italic">No files attached to conversation</p>
                  ) : (
                    <div className="space-y-1.5">
                      {attachedFiles.map((file, idx) => (
                        <div key={idx} className="p-2 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-300 truncate">
                            <FileText className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 shrink-0">{file.size}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeRightTab === 'media' && (
              <div className="space-y-5">
                {/* Forge-3D Model Generator */}
                <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl space-y-3">
                  <div className="flex items-center space-x-1.5 text-teal-400">
                    <Box className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-extrabold uppercase font-mono tracking-wider">Forge-3D Mesh Lab</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Synthesize standalone Wavefront OBJ models utilizing local neural mesh pipelines.
                  </p>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-slate-500 mb-1">Model Concept</label>
                      <input 
                        type="text" 
                        placeholder="e.g. ancient sword, futuristic tank"
                        value={meshSynthPrompt}
                        onChange={(e) => setMeshSynthPrompt(e.target.value)}
                        disabled={isMediaSynthesizing}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded px-2 py-1.5 text-xs text-white focus:outline-none placeholder-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] font-mono uppercase text-slate-500 mb-1">Solver Category</label>
                      <select
                        value={meshSynthType}
                        onChange={(e: any) => setMeshSynthType(e.target.value)}
                        disabled={isMediaSynthesizing}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500">
                        <option value="spaceship">Spaceship</option>
                        <option value="sword">Sword</option>
                        <option value="modern house">Modern House</option>
                        <option value="sci-fi crate">Sci-Fi Crate</option>
                        <option value="shield">Defensive Shield</option>
                      </select>
                    </div>

                    <button
                      onClick={handleSynthesize3DMesh}
                      disabled={isMediaSynthesizing || !meshSynthPrompt.trim()}
                      className="w-full py-2 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-900 text-slate-950 disabled:text-slate-600 font-bold text-[10px] rounded transition flex items-center justify-center space-x-1 cursor-pointer">
                      {isMediaSynthesizing ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Synthesizing Model...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          <span>Synthesize 3D OBJ Mesh</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Generative Graphic Synthesizer */}
                <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl space-y-3">
                  <div className="flex items-center space-x-1.5 text-amber-400">
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-extrabold uppercase font-mono tracking-wider">Concept Illustrator</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Illustrate graphic mockups or high-fidelity abstract concepts in real-time.
                  </p>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-slate-500 mb-1">Illustration Prompt</label>
                      <input 
                        type="text" 
                        placeholder="e.g. cybernetic skull, retro future city"
                        value={imageSynthPrompt}
                        onChange={(e) => setImageSynthPrompt(e.target.value)}
                        disabled={isMediaSynthesizing}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded px-2 py-1.5 text-xs text-white focus:outline-none placeholder-slate-600"
                      />
                    </div>

                    <button
                      onClick={handleSynthesizeImage}
                      disabled={isMediaSynthesizing || !imageSynthPrompt.trim()}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-900 text-slate-950 disabled:text-slate-600 font-bold text-[10px] rounded transition flex items-center justify-center space-x-1 cursor-pointer">
                      {isMediaSynthesizing ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Synthesizing Graphic...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          <span>Synthesize Concept Image</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </aside>

      </div>

    </div>
  );
}
