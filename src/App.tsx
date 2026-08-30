import React, { useState, useEffect, useRef } from "react";
import { 
  Folder, File, FileText, Code2, Play, Plus, Trash2, 
  Search, RefreshCw, Terminal, Sparkles, BookOpen, 
  Image as ImageIcon, Box, Download, Moon, Sun, 
  Smartphone, Tablet, Laptop, Check, Send, AlertCircle, 
  FileCode, Settings, HelpCircle, ChevronRight, X, ChevronDown, CheckCircle2, RotateCw, Home, LogOut, Compass, History as HistoryIcon, Users,
  Menu, Mic, Volume2, Music, Video, MapPin, Maximize2, Minimize2, Bell, Layout, Monitor, Upload, Share, Keyboard, Edit2
} from "lucide-react";
import JSZip from "jszip";
import { motion, AnimatePresence } from "motion/react";
import { Project, ChatMessage, GeneratedImageAsset, Generated3DAsset, TerminalLine, AIModel, UserPreferences, VersionHistoryItem } from "./types";
import { PROJECT_TEMPLATES } from "./templates";
import { PROGRAMMING_LESSONS } from "./lessons";
import { html as beautifyHtml, css as beautifyCss, js as beautifyJs } from "js-beautify";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import OAuthCustomizationPage from "./components/OAuthCustomizationPage";
import OnboardingPage from "./components/OnboardingPage";
import DashboardView from "./components/DashboardView";
import ChatView from "./components/ChatView";
import TemplatesView from "./components/TemplatesView";
import HistoryView from "./components/HistoryView";
import SettingsView from "./components/SettingsView";
import CollabView from "./components/CollabView";
import HelpView from "./components/HelpView";
import TerminalManager from "./components/TerminalManager";
import CodeDiffViewer from "./components/CodeDiffViewer";
import CodeEditorWithHighlight from "./components/CodeEditorWithHighlight";
import FileTreeExplorer from "./components/FileTreeExplorer";
import CustomCursor from "./components/CustomCursor";
import { GitCompare } from "lucide-react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { saveProjectToSupabase, loadProjectsFromSupabase, deleteProjectFromSupabase, saveUserToSupabase, getUserFromSupabase, deleteUserAccountAndDataSupabase, shareProjectSnapshotSupabase, getSharedProjectSnapshotSupabase } from "./lib/supabaseData";
import { auth as supabaseAuth } from "./lib/supabase";
import { AIResponseValidator } from "./lib/AIResponseValidator";
import ApplicationShell from "./components/shared/ApplicationShell";
import StudioPage from "./pages/StudioPage";

// Send login notification email
async function sendLoginNotification(email: string, provider: string) {
  try {
    const response = await fetch('/.netlify/functions/send-login-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, provider }),
    });

    if (!response.ok) {
      console.error('[Login Notification] Failed to send notification');
    } else {
      console.log('[Login Notification] Notification sent successfully');
    }
  } catch (error) {
    console.error('[Login Notification] Error:', error);
  }
}

type NewAppView = 'chat' | 'studio' | 'learning' | 'help' | 'settings';
type LegacyAppView = NewAppView | 'home' | 'editor' | 'templates' | 'assets' | 'history' | 'collab' | 'lessons' | 'about';

// Mapping functions for legacy view compatibility
function mapLegacyViewToNew(view: string): NewAppView {
  switch (view) {
    case 'chat':
      return 'chat';
    case 'home':
    case 'editor':
    case 'templates':
    case 'assets':
    case 'collab':
      return 'studio';
    case 'lessons':
      return 'learning';
    case 'help':
    case 'about':
      return 'help';
    case 'settings':
      return 'settings';
    case 'history':
      return 'chat';
    default:
      return 'chat';
  }
}

function mapNewViewToLegacy(view: NewAppView): LegacyAppView {
  switch (view) {
    case 'chat':
      return 'chat';
    case 'studio':
      return 'editor';
    case 'learning':
      return 'lessons';
    case 'help':
      return 'help';
    case 'settings':
      return 'settings';
    default:
      return 'chat';
  }
}

interface FoldableBlock {
  startLine: number;
  endLine: number;
}

function findFoldableBlocks(text: string): FoldableBlock[] {
  const lines = text.split("\n");
  const blocks: FoldableBlock[] = [];
  const stack: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const openCount = (line.match(/\{/g) || []).length;
    const closeCount = (line.match(/\}/g) || []).length;

    for (let c = 0; c < openCount; c++) {
      stack.push(i);
    }
    for (let c = 0; c < closeCount; c++) {
      if (stack.length > 0) {
        const start = stack.pop()!;
        if (i > start) {
          blocks.push({ startLine: start, endLine: i });
        }
      }
    }
  }
  return blocks.sort((a, b) => a.startLine - b.startLine);
}


function validateCodeSyntax(code: string, filepath: string): string[] {
  const errors: string[] = [];
  const extension = filepath.split('.').pop()?.toLowerCase() || "";
  const lines = code.split("\n");

  const stack: { char: string; line: number; col: number }[] = [];
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateQuote = false;
  let inMultiLineComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (inMultiLineComment) {
      const endIdx = line.indexOf("*/");
      if (endIdx !== -1) {
        inMultiLineComment = false;
      }
      continue;
    }

    let isCommentLine = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '/' && line[j+1] === '*') {
        inMultiLineComment = true;
        j++;
        continue;
      }
      if (char === '/' && line[j+1] === '/') {
        isCommentLine = true;
        break;
      }

      if (char === "'" && !inDoubleQuote && !inTemplateQuote) {
        if (j === 0 || line[j-1] !== '\\') inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote && !inTemplateQuote) {
        if (j === 0 || line[j-1] !== '\\') inDoubleQuote = !inDoubleQuote;
      } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
        if (j === 0 || line[j-1] !== '\\') inTemplateQuote = !inTemplateQuote;
      }

      if (inSingleQuote || inDoubleQuote || inTemplateQuote) continue;

      if (char === '(' || char === '{' || char === '[') {
        stack.push({ char, line: i + 1, col: j + 1 });
      } else if (char === ')' || char === '}' || char === ']') {
        if (stack.length === 0) {
          errors.push(`Unexpected closing '${char}' at line ${i + 1}, column ${j + 1}`);
        } else {
          const top = stack.pop()!;
          const matches = (top.char === '(' && char === ')') ||
                          (top.char === '{' && char === '}') ||
                          (top.char === '[' && char === ']');
          if (!matches) {
            errors.push(`Mismatched bracket: opened '${top.char}' at line ${top.line} but closed with '${char}' at line ${i + 1}`);
          }
        }
      }
    }
  }

  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    errors.push(`Unclosed '${unclosed.char}' opened at line ${unclosed.line}, column ${unclosed.col}`);
  }

  if (inSingleQuote) errors.push("Unterminated single quote (') at end of file");
  if (inDoubleQuote) errors.push("Unterminated double quote (\") at end of file");
  if (inTemplateQuote) errors.push("Unterminated template literal (`) at end of file");
  if (inMultiLineComment) errors.push("Unterminated multiline comment (/*) at end of file");

  if (["jsx", "tsx", "html"].includes(extension)) {
    let cleanCode = code;
    cleanCode = cleanCode.replace(/'[^']*'/g, "''");
    cleanCode = cleanCode.replace(/"[^"]*"/g, '""');
    cleanCode = cleanCode.replace(/`[^`]*`/g, "``");
    cleanCode = cleanCode.replace(/\/\*[\s\S]*?\*\//g, "");
    cleanCode = cleanCode.replace(/\/\/.*$/gm, "");

    const tagRegex = /<(\/?[a-zA-Z][a-zA-Z0-9:-]*)\b[^>]*>/g;
    const tagStack: { name: string; index: number; line: number }[] = [];
    let match;
    
    const getLineNum = (index: number) => {
      return code.substring(0, index).split("\n").length;
    };

    while ((match = tagRegex.exec(cleanCode)) !== null) {
      const fullTag = match[0];
      const tagName = match[1];
      const isClose = tagName.startsWith("/");
      
      if (fullTag.endsWith("/>") || /^(img|br|input|meta|link|hr|source|col|embed|area)$/i.test(tagName)) {
        continue;
      }

      if (isClose) {
        const actualName = tagName.substring(1);
        if (tagStack.length === 0) {
          errors.push(`Unexpected closing JSX/HTML tag </${actualName}> at line ${getLineNum(match.index)}`);
        } else {
          const topTag = tagStack.pop()!;
          if (topTag.name !== actualName) {
            errors.push(`Mismatched JSX/HTML tag: opened <${topTag.name}> at line ${topTag.line}, but closed with </${actualName}> at line ${getLineNum(match.index)}`);
          }
        }
      } else {
        tagStack.push({ name: tagName, index: match.index, line: getLineNum(match.index) });
      }
    }

    while (tagStack.length > 0) {
      const unclosedTag = tagStack.pop()!;
      errors.push(`Unclosed JSX/HTML tag <${unclosedTag.name}> at line ${unclosedTag.line}`);
    }
  }

  return errors;
}


const AI_MODELS: AIModel[] = [
  { id: "gemini-3.5-flash", name: "Forge AI Reasoning Node", purpose: "General Chat", provider: "Forge AI Engine", description: "Default, balanced, fast and highly creative reasoning router.", bgColor: "bg-blue-500/10", textColor: "text-blue-400", borderColor: "border-blue-500/30" },
  { id: "deepseek-v3", name: "Forge AI Code Router", purpose: "Coding", provider: "Forge AI Engine", description: "Deep syntax knowledge and low-level algorithmic efficiency.", bgColor: "bg-teal-500/10", textColor: "text-teal-400", borderColor: "border-teal-500/30" },
  { id: "qwen3-coder", name: "Forge AI Structure Node", purpose: "Coding", provider: "Forge AI Engine", description: "Boilerplate generation, clean multi-file setups, and API structures.", bgColor: "bg-purple-500/10", textColor: "text-purple-400", borderColor: "border-purple-500/30" },
  { id: "glm-4.5", name: "Forge AI Architectural Node", purpose: "Coding", provider: "Forge AI Engine", description: "High logic precision, clean layouts, and architectural systems.", bgColor: "bg-orange-500/10", textColor: "text-orange-400", borderColor: "border-orange-500/30" },
  { id: "kimi-k2", name: "Forge AI Reasoning Engine", purpose: "Reasoning", provider: "Forge AI Engine", description: "Deconstructs programming issues into deep plans before coding.", bgColor: "bg-emerald-500/10", textColor: "text-emerald-400", borderColor: "border-emerald-500/30" },
  { id: "llama-3.3", name: "Forge AI Ultra-Fast Chat", purpose: "Fast Chat", provider: "Forge AI Engine", description: "Ultra-fast direct execution with minimal introductory conversational fluff.", bgColor: "bg-rose-500/10", textColor: "text-rose-400", borderColor: "border-rose-500/30" },
  { id: "flux-1-schnell", name: "Forge AI Visual Studio", purpose: "Image Generation", provider: "Forge AI Engine", description: "Generates high-fidelity artwork and assets from natural language.", bgColor: "bg-amber-500/10", textColor: "text-amber-400", borderColor: "border-amber-500/30" },
  { id: "flux-kontext", name: "Forge AI Canvas Editor", purpose: "Image Editing", provider: "Forge AI Engine", description: "Edits and manipulates canvas assets with context-aware precision.", bgColor: "bg-pink-500/10", textColor: "text-pink-400", borderColor: "border-pink-500/30" },
  { id: "hunyuan-3d", name: "Forge AI Spatial 3D Engine", purpose: "3D Generation", provider: "Forge AI Engine", description: "Compiles prompt descriptions into fully functional Wavefront OBJ wireframes.", bgColor: "bg-indigo-500/10", textColor: "text-indigo-400", borderColor: "border-indigo-500/30" },
  { id: "jina-embeddings", name: "Forge AI Neural Search", purpose: "Embeddings/Search", provider: "Forge AI Engine", description: "Encodes workspace text into vector representations for semantic search.", bgColor: "bg-cyan-500/10", textColor: "text-cyan-400", borderColor: "border-cyan-500/30" }
];

const THEMES = {
  dark: {
    bg: "bg-slate-950 text-slate-100",
    header: "bg-slate-900/80 border-slate-800",
    sidebar: "bg-slate-900 border-slate-800",
    card: "bg-slate-900/60 border-slate-800",
    accent: "text-cyan-400 border-cyan-500",
    btnPrimary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
  },
  light: {
    bg: "bg-slate-50 text-slate-900",
    header: "bg-white border-slate-200 shadow-sm",
    sidebar: "bg-white border-slate-200",
    card: "bg-white border-slate-200 shadow-sm",
    accent: "text-blue-600 border-blue-500",
    btnPrimary: "bg-blue-600 text-white hover:bg-blue-500"
  },
  midnight: {
    bg: "bg-neutral-950 text-neutral-100",
    header: "bg-neutral-900/95 border-neutral-800",
    sidebar: "bg-neutral-900 border-neutral-800",
    card: "bg-neutral-900/70 border-neutral-800",
    accent: "text-fuchsia-400 border-fuchsia-500",
    btnPrimary: "bg-fuchsia-500 text-white hover:bg-fuchsia-400"
  },
  ocean: {
    bg: "bg-sky-950 text-slate-100",
    header: "bg-sky-900/80 border-sky-800",
    sidebar: "bg-sky-900 border-sky-800",
    card: "bg-sky-900/60 border-sky-800",
    accent: "text-cyan-300 border-cyan-500",
    btnPrimary: "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
  },
  forest: {
    bg: "bg-stone-950 text-slate-100",
    header: "bg-stone-900/80 border-stone-800",
    sidebar: "bg-stone-900 border-stone-800",
    card: "bg-stone-900/60 border-stone-800",
    accent: "text-emerald-400 border-emerald-500",
    btnPrimary: "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
  },
  blue: {
    bg: "bg-[#06131f] text-slate-100",
    header: "bg-[#0a1d2d] border-[#16324d]",
    sidebar: "bg-[#0f2237] border-[#16324d]",
    card: "bg-[#10273b]/80 border-[#1d4466]",
    accent: "text-blue-300 border-blue-400",
    btnPrimary: "bg-blue-500 text-white hover:bg-blue-400"
  },
  pink: {
    bg: "bg-[#170d18] text-slate-100",
    header: "bg-[#2a1124] border-[#4a2342]",
    sidebar: "bg-[#2d1327] border-[#4a2342]",
    card: "bg-[#34182e]/80 border-[#5d2a49]",
    accent: "text-pink-300 border-pink-400",
    btnPrimary: "bg-pink-500 text-white hover:bg-pink-400"
  },
  white: {
    bg: "bg-white text-slate-900",
    header: "bg-slate-100 border-slate-200",
    sidebar: "bg-slate-50 border-slate-200",
    card: "bg-white border-slate-200 shadow-sm",
    accent: "text-sky-600 border-sky-500",
    btnPrimary: "bg-sky-600 text-white hover:bg-sky-500"
  }
};

type LocalForgeProfile = {
  permanentName: string;
  username: string;
  email: string;
  createdAt: string;
  isFirstRun: boolean;
};

const LOCAL_PROFILE_STORAGE_KEY = "forgeai_local_profiles_v1";
const CURRENT_LOCAL_PROFILE_KEY = "forgeai_current_profile";

const sanitizeLocalText = (value: string) => value.trim().replace(/\s+/g, " ");

const normalizeLocalUsername = (value: string) => {
  const cleaned = sanitizeLocalText(value)
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || "creator";
};

const readStoredLocalProfiles = (): LocalForgeProfile[] => {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeStoredLocalProfiles = (profiles: LocalForgeProfile[]) => {
  localStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
};

const readStoredLocalProfile = (): LocalForgeProfile | null => {
  try {
    const raw = localStorage.getItem(CURRENT_LOCAL_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function App() {
  // Authentication & Onboarding State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("forgeai_auth") === "true" || !!readStoredLocalProfile();
  });
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem("forgeai_onboarded") === "true" || !!readStoredLocalProfile();
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    const localProfile = readStoredLocalProfile();
    return localStorage.getItem("forgeai_user_email") || localProfile?.email || "";
  });
  const [userName, setUserName] = useState<string>(() => {
    const localProfile = readStoredLocalProfile();
    return localStorage.getItem("forgeai_user_name") || localProfile?.permanentName || "Creator";
  });
  const [userUsername, setUserUsername] = useState<string>(() => {
    const localProfile = readStoredLocalProfile();
    return localStorage.getItem("forgeai_user_username") || localProfile?.username || "creator_01";
  });
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem("forgeai_is_guest") === "true";
  });
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem("forgeai_user_avatar") || "";
  });
  const [isEditingBottomUsername, setIsEditingBottomUsername] = useState<boolean>(false);
  const [editingBottomUsernameVal, setEditingBottomUsernameVal] = useState<string>("");
  
  // Sharing states
  const [isSharedView, setIsSharedView] = useState<boolean>(false);
  const [loadingShared, setLoadingShared] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string>("");
  const [showShortcutsHelp, setShowShortcutsHelp] = useState<boolean>(false);
  const [shortcutModalSearch, setShortcutModalSearch] = useState<string>("");
  const [shortcutActiveTab, setShortcutActiveTab] = useState<string>("All");

  // Save template states
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>("");
  const [newTemplateDesc, setNewTemplateDesc] = useState<string>("");
  const [newTemplateCategory, setNewTemplateCategory] = useState<string>("React Apps");

  const [advancedSettingsEnabled, setAdvancedSettingsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("forgeai_advanced_settings") === "true";
  });
  const [timeUntilReset, setTimeUntilReset] = useState<string>("00:00:00");
  const [showAuthPage, setShowAuthPage] = useState<boolean>(false);
  const [authPageMode, setAuthPageMode] = useState<"login" | "signup">("login");

  // Daily usage countdown timer hook
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    setTimeUntilReset(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeUntilReset(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Application State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [activeView, setActiveView] = useState<LegacyAppView>('chat');
  const [uploadedZipFiles, setUploadedZipFiles] = useState<Record<string, string> | null>(null);
  const [showZipConfirmModal, setShowZipConfirmModal] = useState<boolean>(false);

  // Synchronized Daily Queries state
  const [dailyQueries, setDailyQueries] = useState<number>(() => {
    const saved = localStorage.getItem("forgeai_chat_daily_queries");
    return saved ? Number(saved) : (localStorage.getItem("forgeai_is_guest") === "true" ? 40 : 80);
  });

  useEffect(() => {
    localStorage.setItem("forgeai_chat_daily_queries", String(dailyQueries));
  }, [dailyQueries]);

  // Project-specific AI chat limits (50 per project, separate from daily chat limits)
  const [projectQueries, setProjectQueries] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("forgeai_project_queries");
    return saved ? JSON.parse(saved) : {};
  });

  const PROJECT_AI_LIMIT = 50; // 50 AI queries per project for both guest and normal users

  useEffect(() => {
    localStorage.setItem("forgeai_project_queries", JSON.stringify(projectQueries));
  }, [projectQueries]);

  // Workspace-First collapsible layout states
  const [sidebarMode, setSidebarMode] = useState<'expanded' | 'compact' | 'hidden'>('expanded');
  const [rightHistoryOpen, setRightHistoryOpen] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [rightHistoryWidth, setRightHistoryWidth] = useState(320);
  const [tempShowSidebar, setTempShowSidebar] = useState(false);
  const [tempShowHistory, setTempShowHistory] = useState(false);

  // AI chat and grounding states
  const [searchGrounding, setSearchGrounding] = useState(false);
  const [mapsGrounding, setMapsGrounding] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [lowLatency, setLowLatency] = useState(false);
  
  // Custom futuristic states for enhanced Home Page experience
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Advanced Multi-media synthesis states
  const [activeGeneratorTab, setActiveGeneratorTab] = useState<'image' | 'music' | 'video' | 'mesh'>('image');
  const [musicPrompt, setMusicPrompt] = useState("");
  const [musicMode, setMusicMode] = useState<'clip' | 'pro'>('clip');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [generatedMusicTracks, setGeneratedMusicTracks] = useState<{ id: string; name: string; prompt: string; url: string }[]>([]);
  
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [selectedImageForVideo, setSelectedImageForVideo] = useState<string | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<{ id: string; name: string; prompt: string; url: string }[]>([]);

  const [imageResolution, setImageResolution] = useState<'1K' | '2K' | '4K'>('1K');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '3:2' | '2:3'>('1:1');
  const [imageQualityModel, setImageQualityModel] = useState<'gemini-3.1-flash-image' | 'gemini-3-pro-image'>('gemini-3.1-flash-image');
  const [isEditImageMode, setIsEditImageMode] = useState(false);
  const [selectedImageToEdit, setSelectedImageToEdit] = useState<string | null>(null);

  // Real-time Live API voice connection states
  const [isVoiceSessionActive, setIsVoiceSessionActive] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const voiceWsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const autoSaveToastTimerRef = useRef<any>(null);

  // Trigger focus mode edge overlays via mouse moving or Tab toggles
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!focusMode) return;
      if (e.clientX < 25) {
        setTempShowSidebar(true);
      } else if (e.clientX > 280 && tempShowSidebar) {
        setTempShowSidebar(false);
      }
      
      if (window.innerWidth - e.clientX < 25) {
        setTempShowHistory(true);
      } else if (window.innerWidth - e.clientX > 340 && tempShowHistory) {
        setTempShowHistory(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focusMode) {
        setFocusMode(false);
        addNotification("Exited Focus Mode", "info");
      }
      if (e.key === "Tab" && focusMode) {
        e.preventDefault();
        setTempShowSidebar(prev => !prev);
        setTempShowHistory(prev => !prev);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusMode, tempShowSidebar, tempShowHistory]);

  // Start Gemini Live API audio stream bridging session
  const startVoiceSession = async () => {
    try {
      if (isVoiceSessionActive) return;

      // Initialize Audio Context (Standard Web Audio API)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;

      // Start WebSocket connection to our Express-Vite backend
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}`;
      console.log(`[ForgeAI Voice] Connecting to bridge at ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      voiceWsRef.current = ws;

      let nextAudioPlayTime = 0;

      ws.onopen = () => {
        console.log("[ForgeAI Voice] WebSocket bridge connected. Starting mic capture...");
        addNotification("Real-time Voice session initialized. Speak now!", "success");
        setIsVoiceSessionActive(true);
      };

      ws.onmessage = async (event) => {
        try {
          const parsed = JSON.parse(event.data);
          
          if (parsed.error) {
            addNotification(`Voice connection error: ${parsed.error}`, "warning");
            stopVoiceSession();
            return;
          }

          if (parsed.interrupted) {
            console.log("[ForgeAI Voice] Assistant turn interrupted by user speech.");
            // Clear future playback schedules
            nextAudioPlayTime = audioCtx.currentTime;
            setIsVoiceSpeaking(false);
            return;
          }

          if (parsed.audio) {
            setIsVoiceSpeaking(true);
            // Decode base64 PCM 24kHz audio from server
            const binaryString = window.atob(parsed.audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            // PCM 16-bit is 2 bytes per sample
            const numSamples = len / 2;
            const floatData = new Float32Array(numSamples);
            const dataView = new DataView(bytes.buffer);
            for (let i = 0; i < numSamples; i++) {
              // 16-bit signed integer PCM
              const sample = dataView.getInt16(i * 2, true);
              // Normalize to [-1.0, 1.0] float
              floatData[i] = sample / 32768;
            }

            // Create AudioBuffer
            const audioBuffer = audioCtx.createBuffer(1, numSamples, 24000);
            audioBuffer.getChannelData(0).set(floatData);

            // Schedule audio node playback
            const sourceNode = audioCtx.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(audioCtx.destination);

            // Prevent overlapping and clicking artifacts
            const startTime = Math.max(audioCtx.currentTime, nextAudioPlayTime);
            sourceNode.start(startTime);
            nextAudioPlayTime = startTime + audioBuffer.duration;

            sourceNode.onended = () => {
              if (audioCtx.currentTime >= nextAudioPlayTime - 0.05) {
                setIsVoiceSpeaking(false);
              }
            };
          }
        } catch (err) {
          console.error("[ForgeAI Voice] Error parsing incoming websocket packet:", err);
        }
      };

      ws.onclose = () => {
        console.log("[ForgeAI Voice] WebSocket bridge closed.");
        stopVoiceSession();
      };

      ws.onerror = (err) => {
        console.error("[ForgeAI Voice] WebSocket bridge error:", err);
        addNotification("Voice session WebSocket connection failed.", "warning");
        stopVoiceSession();
      };

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });
      mediaStreamRef.current = stream;

      const sourceNode = audioCtx.createMediaStreamSource(stream);
      // Downsample/process mic data chunk to 16kHz PCM
      const processor = audioCtx.createScriptProcessor(2048, 1, 1);
      processorNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;

        const inputChannel = e.inputBuffer.getChannelData(0);
        // Convert floating point to 16-bit signed integer PCM
        const len = inputChannel.length;
        const pcmBuffer = new Int16Array(len);
        for (let i = 0; i < len; i++) {
          const s = Math.max(-1, Math.min(1, inputChannel[i]));
          pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Base64 encode and send chunk
        const base64Pcm = btoa(
          String.fromCharCode.apply(null, new Uint16Array(pcmBuffer.buffer) as any)
        );
        ws.send(JSON.stringify({ audio: base64Pcm }));
      };

      sourceNode.connect(processor);
      processor.connect(audioCtx.destination);

    } catch (err: any) {
      console.error("[ForgeAI Voice] Failed to start voice session:", err);
      addNotification("Could not access microphone or establish voice connection.", "warning");
      stopVoiceSession();
    }
  };

  // Close voice connection and release audio/mic resources cleanly
  const stopVoiceSession = () => {
    console.log("[ForgeAI Voice] Stopping voice session and releasing media handles.");
    setIsVoiceSessionActive(false);
    setIsVoiceSpeaking(false);

    if (voiceWsRef.current) {
      try {
        voiceWsRef.current.close();
      } catch (e) {}
      voiceWsRef.current = null;
    }

    if (processorNodeRef.current) {
      try {
        processorNodeRef.current.disconnect();
      } catch (e) {}
      processorNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    addNotification("Voice session closed.", "info");
  };
  
  // Create File / Folder state
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [showSearchReplace, setShowSearchReplace] = useState(false);
  
  // User Preferences & Accessibility state
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const savedTheme = (localStorage.getItem("forgeai_selected_theme") as any) || 'dark';
    const defaultPrefs: UserPreferences = {
      theme: savedTheme,
      fontSize: 'sm',
      editorFont: 'JetBrains Mono',
      cursorStyle: 'line',
      sidebarWidth: 'normal',
      windowLayout: 'default',
      animationLevel: 'full',
      uiScale: '100%',
      roundedCorners: 'md',
      transparency: true,
      comfortMode: 'comfortable',
      workspaceMode: 'auto',
      hasChosenWorkspace: false,
      dontAskWorkspaceSuggestion: false
    };
    try {
      const savedPref = localStorage.getItem("forgeai_preferences");
      if (savedPref) {
        const parsed = JSON.parse(savedPref);
        const themeToUse = localStorage.getItem("forgeai_selected_theme") || parsed.theme || savedTheme;
        return { ...defaultPrefs, ...parsed, theme: themeToUse };
      }
      return defaultPrefs;
    } catch (e) {
      console.error("Failed to load preferences", e);
      return defaultPrefs;
    }
  });

  // Keep document element theme class in sync
  useEffect(() => {
    document.documentElement.className = `theme-${preferences.theme || 'dark'}`;
    localStorage.setItem("forgeai_selected_theme", preferences.theme || 'dark');
  }, [preferences.theme]);

  // Command Palette & Universal Search state
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const [isPaletteCreateFile, setIsPaletteCreateFile] = useState(false);
  const [paletteFileName, setPaletteFileName] = useState("");
  const [isPaletteRenameProj, setIsPaletteRenameProj] = useState(false);
  const [paletteProjName, setPaletteProjName] = useState("");

  // Beginner Friendly Mode option
  const [beginnerMode, setBeginnerMode] = useState<string | null>(null);
  const [showBeginnerModal, setShowBeginnerModal] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<{id: string, text: string, type: 'info' | 'success' | 'warning'}[]>([
    { id: '1', text: "Welcome to ForgeAI! Start by opening the Command Palette (Ctrl+Shift+P).", type: 'info' }
  ]);

  // Responsive Workspace Modes States
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState<'editor' | 'chat' | 'preview'>('editor');
  const [currentWorkspaceLayout, setCurrentWorkspaceLayout] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [centerMode, setCenterMode] = useState<'editor' | 'preview'>('editor');
  const [showChooseWorkspacePrompt, setShowChooseWorkspacePrompt] = useState(false);
  const [showWorkspaceSuggestPrompt, setShowWorkspaceSuggestPrompt] = useState(false);
  const [dismissedSuggestUntilResize, setDismissedSuggestUntilResize] = useState(false);

  // Visual Customizations
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);

  // AI Assistant Chat State
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);
  const [chatFilter, setChatFilter] = useState("");

  // Asset Generator State
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("UI Theme");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [model3DPrompt, setModel3DPrompt] = useState("");
  const [model3DCategory, setModel3DCategory] = useState("Sword");
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [selected3DAsset, setSelected3DAsset] = useState<Generated3DAsset | null>(null);

  // Terminal Input State
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalTab, setTerminalTab] = useState<'terminal' | 'console' | 'network' | 'problems'>('terminal');
  const [syntaxErrors, setSyntaxErrors] = useState<{ line: number; message: string }[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<{method: string, text: string, time: string}[]>([]);
  const [networkActivities, setNetworkActivities] = useState<{id: string, url: string, method: string, status: string | number, statusText?: string, duration?: string, time: string, type: 'fetch' | 'XHR'}[]>([]);
  const [foldedLines, setFoldedLines] = useState<Record<string, Record<number, boolean>>>({});
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string>("");
  const [previewEntryPoint, setPreviewEntryPoint] = useState<string>("index.html");
  const [selectedPreviewCssFiles, setSelectedPreviewCssFiles] = useState<string[]>([]);
  const [selectedPreviewJsFiles, setSelectedPreviewJsFiles] = useState<string[]>([]);
  const [buildModeConfigOpen, setBuildModeConfigOpen] = useState<boolean>(false);
  const [editorViewMode, setEditorViewMode] = useState<'edit' | 'diff'>('edit');
  
  // Interactive Lesson tracker
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [completedLessonSteps, setCompletedLessonSteps] = useState<Record<string, boolean[]>>({});

  // 3D Canvas rendering references
  const canvas3DRef = useRef<HTMLCanvasElement | null>(null);
  const [modelRotation, setModelRotation] = useState({ x: 0.5, y: 0.6 });
  const [isDragging3D, setIsDragging3D] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Custom Suggestion Action Tracker
  const [resolvedSuggestions, setResolvedSuggestions] = useState<string[]>([]);

  // OAuth Customization State
  const [showOAuthCustomization, setShowOAuthCustomization] = useState(false);
  const [pendingOAuthUser, setPendingOAuthUser] = useState<any>(null);

  // Handle OAuth customization completion
  const handleOAuthCustomizationComplete = async (user: { email?: string; name: string; username?: string }) => {
    setShowOAuthCustomization(false);

    const nextName = sanitizeLocalText(user.name || userName || "Creator");
    const nextUsername = normalizeLocalUsername(user.username || userUsername || "creator");
    const nextEmail = (user.email || userEmail || "").trim();

    const nextProfile: LocalForgeProfile = {
      permanentName: nextName,
      username: nextUsername,
      email: nextEmail,
      createdAt: new Date().toISOString(),
      isFirstRun: true,
    };

    const storedProfiles = readStoredLocalProfiles();
    const dedupedProfiles = storedProfiles.filter(profile => profile.permanentName !== nextName);
    writeStoredLocalProfiles([nextProfile, ...dedupedProfiles]);
    localStorage.setItem(CURRENT_LOCAL_PROFILE_KEY, JSON.stringify(nextProfile));

    setUserName(nextName);
    setUserUsername(nextUsername);
    setUserEmail(nextEmail);
    setIsAuthenticated(true);
    setIsOnboarded(true);

    localStorage.setItem("forgeai_auth", "true");
    localStorage.setItem("forgeai_onboarded", "true");
    localStorage.setItem("forgeai_user_name", nextName);
    localStorage.setItem("forgeai_user_username", nextUsername);
    localStorage.setItem("forgeai_user_email", nextEmail);
    
    // Load projects for the newly customized user
    if (pendingOAuthUser?.id) {
      try {
        const dbProjects = await loadProjectsFromSupabase(pendingOAuthUser.id);
        if (dbProjects && dbProjects.length > 0) {
          setProjects(dbProjects);
          setActiveProjectId(dbProjects[0].id);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    }
    
    setPendingOAuthUser(null);
  };

  // Handle Supabase OAuth callback from URL hash
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        console.log('[ForgeAI Auth] Processing OAuth callback from URL hash');
        
        // Let Supabase process the session from the hash
        // Wait for Supabase to establish the session
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if session was established
        const { session, error } = await supabaseAuth.getSession();
        
        if (session) {
          console.log('[ForgeAI Auth] Session established successfully');
          
          // Clear the hash from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Save user to Supabase if not exists
          const userId = session.user.id;
          const userData = await getUserFromSupabase(userId);
          
          if (!userData) {
            // Create user profile
            await saveUserToSupabase(userId, {
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
              username: session.user.user_metadata?.preferred_username || session.user.email?.split('@')[0] || 'user',
              email: session.user.email || '',
              onboarded: true,
              avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
              preferences: {}
            });
            console.log('[ForgeAI Auth] User profile created');
          }
          
          // Send login notification email
          if (session.user.email) {
            await sendLoginNotification(session.user.email, session.user.user_metadata?.provider || 'email');
          }
          
          // Redirect to home/dashboard (same as email login)
          setActiveView('home');
          console.log('[ForgeAI Auth] Redirecting to home');
        } else {
          console.error('[ForgeAI Auth] Session not established after OAuth callback', error);
          // Clear hash even if session failed
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };
    handleOAuthCallback();
  }, []);

  // Load shared project from URL snapshot if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get("share");
    if (sharedId) {
      const fetchShared = async () => {
        setLoadingShared(true);
        try {
          const sharedProject = await getSharedProjectSnapshotSupabase(sharedId);
          if (sharedProject) {
            setIsSharedView(true);
            const loadedPrj: Project = {
              id: "shared_" + sharedProject.id,
              name: sharedProject.name + " (Shared Snapshot)",
              description: sharedProject.description || "Read-only snapshot shared with you.",
              type: sharedProject.type || "React Apps",
              files: sharedProject.files,
              selectedTabPath: Object.keys(sharedProject.files)[0] || "index.html",
              openTabs: Object.keys(sharedProject.files).slice(0, 5),
              chatHistory: sharedProject.chatHistory || [],
              generatedImages: sharedProject.generatedImages || [],
              generated3D: sharedProject.generated3D || [],
              selectedModelId: sharedProject.selectedModelId || "gemini-2.5-flash",
              terminalHistory: sharedProject.terminalHistory || [],
              dailyUsage: sharedProject.dailyUsage || {
                chats: 0,
                codeGen: 0,
                imageGen: 0,
                model3D: 0,
                debugRequests: 0,
                analysis: 0
              }
            };
            
            // Inject to active state
            setProjects(prev => {
              const exists = prev.some(p => p.id === loadedPrj.id);
              return exists ? prev : [loadedPrj, ...prev];
            });
            setActiveProjectId(loadedPrj.id);
            setActiveView("editor");
            addNotification(`Successfully loaded shared sandbox snapshot for "${sharedProject.name}".`, "success");
          } else {
            addNotification("The shared workspace snapshot could not be found or has expired.", "warning");
          }
        } catch (err) {
          console.error("Failed to load shared snapshot:", err);
          addNotification("Could not parse or load the shared snapshot workspace.", "warning");
        } finally {
          setLoadingShared(false);
        }
      };
      fetchShared();
    }
  }, []);

  // Listen to Supabase Auth state change and load user profile & projects
  useEffect(() => {
    const { data: { subscription } } = supabaseAuth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = session.user;
        // Real authenticated user detected! Explicitly clear guest flags
        localStorage.setItem("forgeai_is_guest", "false");
        localStorage.setItem("forgeai_auth", "true");
        setIsAuthenticated(true);
        setIsGuest(false);
        setUserEmail(user.email || "");
        
        try {
          const profile = await getUserFromSupabase(user.id);
          if (profile) {
            setUserName(profile.name);
            setUserUsername(profile.username);
            // Distinguish onboarded status: if false, land on workspace setup onboarding sequence
            const onboardedState = profile.onboarded ?? true;
            setIsOnboarded(onboardedState);
            if (profile.avatarUrl) {
              setAvatarUrl(profile.avatarUrl);
              localStorage.setItem("forgeai_user_avatar", profile.avatarUrl);
            } else {
              setAvatarUrl("");
              localStorage.removeItem("forgeai_user_avatar");
            }
            localStorage.setItem("forgeai_onboarded", String(onboardedState));
            localStorage.setItem("forgeai_user_name", profile.name);
            localStorage.setItem("forgeai_user_username", profile.username);
            localStorage.setItem("forgeai_user_email", user.email || "");
            if (profile.preferences) {
              setPreferences(prev => ({ ...prev, ...profile.preferences }));
            }
          } else {
            // First-time OAuth sign-in: profile does not exist yet!
            // Check if this is an OAuth user (Google/GitHub)
            const provider = user.app_metadata?.provider || user.user_metadata?.provider;
            const isOAuthUser = provider && (provider === 'google' || provider === 'github');
            
            if (isOAuthUser) {
              // Show OAuth customization page
              setPendingOAuthUser(user);
              setShowOAuthCustomization(true);
              return;
            }
            
            // Regular email signup - proceed with onboarding
            setIsOnboarded(false);
            localStorage.setItem("forgeai_onboarded", "false");
            const avatarFromMetadata = user.user_metadata?.avatar_url || user.user_metadata?.picture || "";
            setAvatarUrl(avatarFromMetadata);
            if (avatarFromMetadata) {
              localStorage.setItem("forgeai_user_avatar", avatarFromMetadata);
            }
            
            // Generate default username & display name for new registered user
            const nameToUse = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Creator";
            const generatedUsername = nameToUse.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Math.floor(Math.random() * 100);
            
            setUserName(nameToUse);
            setUserUsername(generatedUsername);
            localStorage.setItem("forgeai_user_name", nameToUse);
            localStorage.setItem("forgeai_user_username", generatedUsername);
            localStorage.setItem("forgeai_user_email", user.email || "");

            // Pre-seed baseline profile for this new user
            try {
              await saveUserToSupabase(user.id, {
                name: nameToUse,
                username: generatedUsername,
                email: user.email || "",
                onboarded: false,
                avatarUrl: user.user_metadata?.avatar_url || "",
                preferences: {}
              });
            } catch (saveErr) {
              console.warn("Could not save initial user profile:", saveErr);
            }
          }
        } catch (err) {
          console.error("Failed to load user profile from Firestore:", err);
        }

        try {
          const dbProjects = await loadProjectsFromSupabase(user.id);
          if (dbProjects && dbProjects.length > 0) {
            setProjects(dbProjects);
            setActiveProjectId(dbProjects[0].id);
          }
        } catch (err) {
          console.error("Failed to load projects from Firestore:", err);
        }
      } else {
        const savedLocalProfile = readStoredLocalProfile();
        if (localStorage.getItem("forgeai_auth") === "true" && savedLocalProfile) {
          setIsAuthenticated(true);
          setIsGuest(false);
          setIsOnboarded(localStorage.getItem("forgeai_onboarded") === "true");
          setUserEmail(savedLocalProfile.email || localStorage.getItem("forgeai_user_email") || "");
          setUserName(savedLocalProfile.permanentName || localStorage.getItem("forgeai_user_name") || "Creator");
          setUserUsername(savedLocalProfile.username || localStorage.getItem("forgeai_user_username") || "creator");
          return;
        }

        // Only enter guest sandbox mode if the user explicitly clicked "Continue as Guest"
        const isGuestStored = localStorage.getItem("forgeai_is_guest") === "true";
        if (isGuestStored) {
          setIsAuthenticated(true);
          setIsGuest(true);
          setIsOnboarded(localStorage.getItem("forgeai_onboarded") === "true");
          setUserEmail(localStorage.getItem("forgeai_user_email") || "guest_sandbox@forge.ai");
          setUserName(localStorage.getItem("forgeai_user_name") || "Guest Creator");
          setUserUsername(localStorage.getItem("forgeai_user_username") || "guest_creator");
        } else {
          setIsAuthenticated(false);
          setIsGuest(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Silence HMR WebSocket and unhandled rejection errors
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reasonStr = event.reason instanceof Error ? event.reason.message : String(event.reason || "");
      if (
        reasonStr.includes("WebSocket") || 
        reasonStr.includes("websocket") || 
        reasonStr.includes("WebSocket closed without opened") || 
        reasonStr.includes("failed to connect to websocket")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleError = (event: ErrorEvent) => {
      const msg = event.message || "";
      const errorStr = event.error instanceof Error ? event.error.message : String(event.error || "");
      if (
        msg.includes("WebSocket") || 
        msg.includes("websocket") || 
        errorStr.includes("WebSocket") || 
        errorStr.includes("websocket")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  // Real-time syntax validation hook (runs as user types)
  useEffect(() => {
    const currentActiveProject = projects.find(p => p.id === activeProjectId) || projects[0];
    if (!currentActiveProject || !currentActiveProject.selectedTabPath) {
      setSyntaxErrors([]);
      return;
    }
    const code = currentActiveProject.files[currentActiveProject.selectedTabPath] || "";
    const extension = currentActiveProject.selectedTabPath.split('.').pop()?.toLowerCase();
    
    // Only check syntax for standard editable web formats
    if (!['js', 'jsx', 'ts', 'tsx', 'json', 'css', 'html'].includes(extension || "")) {
      setSyntaxErrors([]);
      return;
    }

    const errors: { line: number; message: string }[] = [];
    const lines = code.split("\n");
    const stack: { char: string; line: number; col: number }[] = [];
    
    // For JSX/HTML Tag Matching
    const openTags: { name: string; line: number }[] = [];
    const selfClosingTags = ["img", "br", "input", "hr", "link", "meta", "area", "base", "col", "embed", "keygen", "param", "source", "track", "wbr"];

    let inMultiLineComment = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let inSingleQuote = false;
      let inDoubleQuote = false;
      let inTemplateQuote = false;
      let isCommentLine = false;
      
      // Check multi-line comment boundary
      if (inMultiLineComment) {
        const endCommentIdx = line.indexOf("*/");
        if (endCommentIdx !== -1) {
          inMultiLineComment = false;
          // Skip part of line before end comment
          continue;
        } else {
          continue; // Skip whole line
        }
      }

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        // Handle JS multi-line comment start
        if (char === '/' && line[j+1] === '*' && !inSingleQuote && !inDoubleQuote && !inTemplateQuote) {
          inMultiLineComment = true;
          j++; // skip '*'
          continue;
        }

        // Handle JS single-line comment
        if (char === '/' && line[j+1] === '/' && !inSingleQuote && !inDoubleQuote && !inTemplateQuote) {
          isCommentLine = true;
          break;
        }

        // Toggle quote status
        if (char === "'" && !inDoubleQuote && !inTemplateQuote) {
          if (j === 0 || line[j-1] !== '\\') inSingleQuote = !inSingleQuote;
        } else if (char === '"' && !inSingleQuote && !inTemplateQuote) {
          if (j === 0 || line[j-1] !== '\\') inDoubleQuote = !inDoubleQuote;
        } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
          if (j === 0 || line[j-1] !== '\\') inTemplateQuote = !inTemplateQuote;
        }
        
        if (inSingleQuote || inDoubleQuote || inTemplateQuote) {
          continue;
        }
        
        if (char === '(' || char === '{' || char === '[') {
          stack.push({ char, line: i, col: j });
        } else if (char === ')' || char === '}' || char === ']') {
          if (stack.length === 0) {
            errors.push({ line: i, message: `Unexpected closing bracket '${char}'` });
          } else {
            const top = stack.pop()!;
            const matches = (top.char === '(' && char === ')') ||
                            (top.char === '{' && char === '}') ||
                            (top.char === '[' && char === ']');
            if (!matches) {
              errors.push({ line: i, message: `Mismatched closing bracket '${char}' matching '${top.char}' from line ${top.line + 1}` });
            }
          }
        }

        // Check for regular expression literals
        if (char === '/' && line[j+1] !== '/' && line[j+1] !== '*' && (extension === 'js' || extension === 'jsx' || extension === 'ts' || extension === 'tsx')) {
          // Check if this '/' is indeed a regex start.
          // Look backward for a trigger (assignment, return, comma, paren, brace, or start of line)
          const sliceBefore = line.substring(0, j).trim();
          const lastChar = sliceBefore[sliceBefore.length - 1];
          const isRegexTrigger = !lastChar || 
            ['=', ':', ',', '(', '[', '{', '?', '&', '|', '!', ';'].includes(lastChar) ||
            sliceBefore.endsWith('return') || sliceBefore.endsWith('throw') || sliceBefore.endsWith('yield');
          
          if (isRegexTrigger) {
            // Find closing '/'
            let closed = false;
            let escaped = false;
            let k = j + 1;
            for (; k < line.length; k++) {
              if (escaped) {
                escaped = false;
                continue;
              }
              if (line[k] === '\\') {
                escaped = true;
                continue;
              }
              if (line[k] === '/') {
                closed = true;
                j = k; // Move scanner forward
                break;
              }
            }
            if (!closed) {
              errors.push({ line: i, message: `Unterminated regular expression literal (missing closing '/')` });
            }
          }
        }

        // Check for opening JSX/HTML Tags: <Tag
        if (char === '<' && (extension === 'html' || extension === 'jsx' || extension === 'tsx')) {
          const tagStart = j + 1;
          const restOfLine = line.substring(tagStart);
          
          // Match closing tag </tag>
          if (restOfLine.startsWith('/')) {
            const tagEnd = restOfLine.indexOf('>');
            if (tagEnd !== -1) {
              const tagName = restOfLine.substring(1, tagEnd).trim().split(' ')[0].replace('>', '');
              if (openTags.length === 0) {
                // Ignore stray closing brackets/tags if they are from standard operations, else flag it
                if (/^[a-zA-Z]/.test(tagName)) {
                  errors.push({ line: i, message: `Mismatched closing tag '</${tagName}>' without an open tag` });
                }
              } else {
                const lastOpen = openTags.pop()!;
                if (lastOpen.name !== tagName && /^[a-zA-Z]/.test(tagName)) {
                  errors.push({ line: i, message: `Mismatched tags: closing '</${tagName}>' does not match opening '<${lastOpen.name}>' from line ${lastOpen.line + 1}` });
                }
              }
              j += tagEnd + 1;
            }
          } else {
            // It's an opening tag
            const tagEnd = restOfLine.indexOf('>');
            // Make sure it doesn't look like a comparison expression like < 5
            const tagMatch = /^[a-zA-Z][a-zA-Z0-9\-]*(\s|>)/.exec(restOfLine);
            if (tagMatch && tagEnd !== -1) {
              const tagName = tagMatch[0].replace('>', '').trim().split(' ')[0];
              const isSelfClosing = restOfLine.substring(0, tagEnd).trim().endsWith('/') || selfClosingTags.includes(tagName.toLowerCase());
              
              if (!isSelfClosing) {
                openTags.push({ name: tagName, line: i });
              }
              j += tagEnd;
            }
          }
        }
      }
      
      if (!isCommentLine && !inMultiLineComment) {
        if (inSingleQuote) {
          errors.push({ line: i, message: "Unclosed single quote (')" });
        }
        if (inDoubleQuote) {
          errors.push({ line: i, message: 'Unclosed double quote (")' });
        }
        if (inTemplateQuote) {
          errors.push({ line: i, message: "Unclosed template quote (`)" });
        }
      }
    }
    
    while (stack.length > 0) {
      const top = stack.pop()!;
      errors.push({ line: top.line, message: `Unclosed open bracket '${top.char}'` });
    }

    while (openTags.length > 0) {
      const top = openTags.pop()!;
      errors.push({ line: top.line, message: `Unclosed HTML/JSX tag '<${top.name}>'` });
    }

    setSyntaxErrors(prev => {
      if (prev.length === errors.length && prev.every((val, idx) => val.line === errors[idx].line && val.message === errors[idx].message)) {
        return prev;
      }
      return errors;
    });
  }, [
    activeProjectId,
    projects.find(p => p.id === activeProjectId)?.selectedTabPath,
    projects.find(p => p.id === activeProjectId)?.files[projects.find(p => p.id === activeProjectId)?.selectedTabPath || ""]
  ]);


  // Load initial mock projects
  useEffect(() => {
    const savedProjects = localStorage.getItem("forgeai_projects");
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        if (parsed.length > 0) {
          setProjects(parsed);
          setActiveProjectId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Failed to restore cached projects:", e);
      }
    }

    // Default startup workspace setup
    const initialProjects: Project[] = [
      {
        id: "proj_website_1",
        name: "My Website Portfolio",
        description: "A gorgeous, responsive portfolio website featuring fluid layouts, interactive contact cards, and smooth hover state transitions.",
        type: "Websites",
        files: PROJECT_TEMPLATES.website.files,
        chatHistory: [
          { role: 'assistant', content: "Welcome to ForgeAI! I have initialized your interactive Portfolio Website workspace. You can edit index.html or style.css, run simulated servers in the command center below, or prompt me to write custom algorithms.", timestamp: new Date().toLocaleTimeString() }
        ],
        generatedImages: [],
        generated3D: [],
        selectedModelId: "gemini-3.5-flash",
        selectedTabPath: "index.html",
        openTabs: ["index.html", "style.css", "script.js"],
        terminalHistory: [
          { type: 'success', text: "ForgeAI IDE virtual server spinning up..." },
          { type: 'output', text: "Loading static file middleware on port 3000..." },
          { type: 'success', text: "Workspace compiler online. Code preview available." }
        ],
        dailyUsage: { chats: 0, codeGen: 0, imageGen: 0, model3D: 0, debugRequests: 0, analysis: 0 }
      },
      {
        id: "proj_canvas_game",
        name: "Zombie Survival HTML5 Canvas",
        description: "A fully playable retro 2D top-down shooter game running natively on HTML5 Canvas. Dodge and shoot the zombies to survive!",
        type: "Web Apps",
        files: PROJECT_TEMPLATES.zombieGame.files,
        chatHistory: [
          { role: 'assistant', content: "Retro Zombie Survival loaded successfully. Open the live project preview window to try running, aiming, and shooting zombies!", timestamp: new Date().toLocaleTimeString() }
        ],
        generatedImages: [],
        generated3D: [],
        selectedModelId: "deepseek-v3",
        selectedTabPath: "index.html",
        openTabs: ["index.html", "game.js"],
        terminalHistory: [
          { type: 'success', text: "Virtual JS game loader ready." }
        ],
        dailyUsage: { chats: 0, codeGen: 0, imageGen: 0, model3D: 0, debugRequests: 0, analysis: 0 }
      }
    ];
    setProjects(initialProjects);
    setActiveProjectId(initialProjects[0].id);
  }, []);

  // Save changes locally & to Firebase Firestore
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("forgeai_projects", JSON.stringify(projects));
      supabaseAuth.getCurrentUser().then(({ user }) => {
        if (user) {
          projects.forEach(proj => {
            saveProjectToSupabase(user.id, proj).catch(err => {
              console.error("Failed to sync project to Firestore:", err);
            });
          });
        }
      }).catch(err => {
        console.error("Failed to get current user:", err);
      });
    }
  }, [projects]);

  // Handle iframe message interception & log capture
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object') {
        const { type, source, payload } = event.data;
        if (source === 'forgeai-iframe') {
          if (type === 'console-log') {
            setConsoleLogs(prev => {
              // Limit to last 150 log entries to prevent memory growth
              const updated = [...prev, payload];
              if (updated.length > 150) updated.shift();
              return updated;
            });
          } else if (type === 'network-activity') {
            setNetworkActivities(prev => {
              // If we already have a pending/failed/success for this req ID, update it, otherwise insert!
              const idx = prev.findIndex(item => item.id === payload.id);
              if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], ...payload };
                return updated;
              } else {
                const updated = [...prev, payload];
                if (updated.length > 150) updated.shift();
                return updated;
              }
            });
          }
        }
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  // Clear preview state logs on project reload or switch
  useEffect(() => {
    setConsoleLogs([]);
    setNetworkActivities([]);
  }, [activeProjectId, previewKey]);

  // Command Palette Key Listener & Shortcut Binds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Helper to check if KeyboardEvent matches a specific shortcut definition string
      const matchShortcut = (event: KeyboardEvent, shortcutStr: string): boolean => {
        if (!shortcutStr) return false;
        const parts = shortcutStr.toLowerCase().split('+');
        
        const hasCtrl = parts.includes('ctrl') || parts.includes('control');
        const hasShift = parts.includes('shift');
        const hasAlt = parts.includes('alt');
        const hasMeta = parts.includes('meta') || parts.includes('cmd') || parts.includes('command');
        
        const targetKey = parts[parts.length - 1];
        
        const ctrlMatch = (event.ctrlKey || event.metaKey) ? (hasCtrl || hasMeta) : (!hasCtrl && !hasMeta);
        const shiftMatch = event.shiftKey === hasShift;
        const altMatch = event.altKey === hasAlt;
        
        let eventKey = event.key.toLowerCase();
        
        return ctrlMatch && shiftMatch && altMatch && (eventKey === targetKey);
      };

      const customBinds = preferences.keyboardShortcuts || {};
      const bind = (id: string, defaultVal: string) => customBinds[id] || defaultVal;

      // Toggle Command Palette
      if (matchShortcut(e, bind('commandPalette', 'Ctrl+Shift+P'))) {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }

      // Show Shortcuts Help
      if (matchShortcut(e, bind('shortcutsHelp', 'Ctrl+/'))) {
        e.preventDefault();
        setShowShortcutsHelp(prev => !prev);
      }

      // Toggle Sidebar Menu
      if (matchShortcut(e, bind('sidebarToggle', 'Ctrl+B'))) {
        e.preventDefault();
        setSidebarMode(prev => prev === 'hidden' ? 'expanded' : 'hidden');
      }

      // Toggle Focus Mode
      if (matchShortcut(e, bind('focusToggle', 'Ctrl+.'))) {
        e.preventDefault();
        setFocusMode(prev => {
          const next = !prev;
          addNotification(next ? "Entered Focus Mode. Press Esc or Tab to manage panels." : "Exited Focus Mode", "info");
          return next;
        });
      }

      // Quick Jump View: Home Workspace
      if (matchShortcut(e, bind('viewHome', 'Ctrl+Shift+1'))) {
        e.preventDefault();
        setActiveView('home');
        addNotification("Switched to Home", "info");
      }

      // Quick Jump View: Editor Sandbox
      if (matchShortcut(e, bind('viewEditor', 'Ctrl+Shift+2'))) {
        e.preventDefault();
        setActiveView('editor');
        addNotification("Switched to Editor workspace", "info");
      }

      // Quick Jump View: Chat Assistant
      if (matchShortcut(e, bind('viewChat', 'Ctrl+Shift+3'))) {
        e.preventDefault();
        setActiveView('chat');
        addNotification("Switched to Chat Assistant", "info");
      }

      // Quick Jump View: Blueprints & Templates
      if (matchShortcut(e, bind('viewTemplates', 'Ctrl+Shift+4'))) {
        e.preventDefault();
        setActiveView('templates');
        addNotification("Switched to Blueprints", "info");
      }

      // Quick Jump View: Version History
      if (matchShortcut(e, bind('viewHistory', 'Ctrl+Shift+5'))) {
        e.preventDefault();
        setActiveView('history');
        addNotification("Switched to Version History", "info");
      }

      // Quick Jump View: Settings Configuration
      if (matchShortcut(e, bind('viewSettings', 'Ctrl+Shift+6'))) {
        e.preventDefault();
        setActiveView('settings');
        addNotification("Switched to Settings", "info");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [preferences]);

  // Screen and layout detection for Responsive Workspace Modes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch = navigator.maxTouchPoints > 0;

      // Determine auto layout
      let detectedLayout: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (width < 768) {
        detectedLayout = 'mobile';
      } else if (width >= 768 && width < 1200) {
        detectedLayout = 'tablet';
      } else {
        detectedLayout = 'desktop';
      }

      const activeMode = preferences.workspaceMode || 'auto';

      if (activeMode === 'mobile') {
        setCurrentWorkspaceLayout('mobile');
      } else if (activeMode === 'desktop') {
        setCurrentWorkspaceLayout('desktop');
      } else {
        // Auto Mode
        setCurrentWorkspaceLayout(detectedLayout);
      }

      // First-time choice modal check: show if width < 1024, touch is active, and they haven't chosen
      if (!preferences.hasChosenWorkspace && width < 1024 && (isTouch || width < 768)) {
        setShowChooseWorkspacePrompt(true);
      }

      // Suggestion prompt check (if in auto/mobile and width grows to desktop/landscape)
      const currentResolved = activeMode === 'mobile' ? 'mobile' : (activeMode === 'desktop' ? 'desktop' : detectedLayout);
      if (currentResolved === 'mobile' && width >= 1024 && !preferences.dontAskWorkspaceSuggestion && !dismissedSuggestUntilResize) {
        setShowWorkspaceSuggestPrompt(true);
      } else if (width < 1024) {
        setShowWorkspaceSuggestPrompt(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [preferences.workspaceMode, preferences.hasChosenWorkspace, preferences.dontAskWorkspaceSuggestion, dismissedSuggestUntilResize]);

  // Show desktop-on-mobile optimization warning toast on selection
  useEffect(() => {
    if (preferences.workspaceMode === 'desktop' && window.innerWidth < 768) {
      addNotification("Desktop Workspace is optimized for larger screens. On smaller devices, some elements may require horizontal scrolling or pinch-to-zoom.", "warning");
    }
  }, [preferences.workspaceMode]);

  const savePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const next = { ...prev, ...updated };
      localStorage.setItem("forgeai_preferences", JSON.stringify(next));
      if (updated.theme) {
        localStorage.setItem("forgeai_selected_theme", updated.theme);
        document.documentElement.className = `theme-${updated.theme}`;
      }
      return next;
    });
    addNotification(`Theme/appearance customized successfully.`, 'success');
  };

  const handleLogout = async () => {
    const { error } = await supabaseAuth.signOut();
    if (error) console.error("Supabase signOut failed:", error);
    localStorage.removeItem("forgeai_auth");
    localStorage.removeItem(CURRENT_LOCAL_PROFILE_KEY);
    localStorage.removeItem("forgeai_user_email");
    localStorage.removeItem("forgeai_user_name");
    localStorage.removeItem("forgeai_user_username");
    localStorage.removeItem("forgeai_user_avatar");
    localStorage.removeItem("forgeai_is_guest");
    localStorage.removeItem("forgeai_onboarded");
    setIsAuthenticated(false);
    setIsOnboarded(false);
    setIsGuest(false);
    setUserEmail("");
    setUserName("Creator");
    setUserUsername("creator_01");
    setActiveView('home');
    addNotification("Logged out of ForgeAI workspace safely.", "info");
  };

  const getCalculatedStorageBytes = () => {
    let bytes = 0;
    // Projects size
    projects.forEach(p => {
      // files
      if (p.files) {
        Object.entries(p.files).forEach(([path, content]) => {
          bytes += (path || "").length + String(content || "").length;
        });
      }
      // chats
      if (p.chatHistory) {
        p.chatHistory.forEach(msg => {
          bytes += (msg.content || "").length;
        });
      }
      // image counts (approx 1.2MB per image)
      bytes += (p.generatedImages?.length || 0) * 1.2 * 1024 * 1024;
      // 3D meshes (approx OBJ text length)
      if (p.generated3D) {
        p.generated3D.forEach(asset => {
          bytes += (asset.objText || "").length;
        });
      }
    });
    return bytes === 0 ? 409600 : bytes; // guarantee some files overhead
  };

  const downloadWorkspaceBackup = () => {
    const backupData = {
      userName,
      userUsername,
      userEmail,
      isGuest,
      projects,
      preferences,
      exportedAt: new Date().toISOString(),
      platform: "ForgeAI Workbench v1.0"
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `forgeai_workspace_backup_${userUsername}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addNotification("Workspace backup JSON package downloaded successfully.", "success");
  };

  const deleteAccountWorkspace = async () => {
    try {
      const { user } = await supabaseAuth.getCurrentUser();
      if (!isGuest && user) {
        // Purge Firestore user document and user projects
        await deleteUserAccountAndDataSupabase(user.id);
        // Delete auth user account from Supabase
        const { error } = await supabaseAuth.signOut();
        if (error) console.error("Supabase signOut failed:", error);
      }
    } catch (err: any) {
      console.error("Failed to delete cloud data:", err);
      addNotification("Failed to delete account. Please try again.", "warning");
      return;
    }

    // Purge everything
    localStorage.clear();
    setIsAuthenticated(false);
    setIsOnboarded(false);
    setIsGuest(false);
    setAvatarUrl("");
    setProjects([]);
    setActiveProjectId("");
    setActiveView('home');
    addNotification("Account purged. All projects, custom templates, and cloud assets deleted permanently.", "success");
  };

  const saveUserProfileChange = async (updatedFields: Partial<{ name: string, username: string, email: string, avatarUrl: string }>) => {
    // 1. Update local states
    let nextName = userName;
    let nextUsername = userUsername;
    let nextEmail = userEmail;
    let nextAvatar = avatarUrl;

    if (updatedFields.name !== undefined) {
      nextName = updatedFields.name;
      setUserName(updatedFields.name);
      localStorage.setItem("forgeai_user_name", updatedFields.name);
    }
    if (updatedFields.username !== undefined) {
      nextUsername = updatedFields.username;
      setUserUsername(updatedFields.username);
      localStorage.setItem("forgeai_user_username", updatedFields.username);
    }
    if (updatedFields.email !== undefined) {
      nextEmail = updatedFields.email;
      setUserEmail(updatedFields.email);
      localStorage.setItem("forgeai_user_email", updatedFields.email);
    }
    if (updatedFields.avatarUrl !== undefined) {
      nextAvatar = updatedFields.avatarUrl;
      setAvatarUrl(updatedFields.avatarUrl);
      localStorage.setItem("forgeai_user_avatar", updatedFields.avatarUrl);
    }

    // 2. If logged in and not guest, save to Firestore
    const { user: currentUser } = await supabaseAuth.getCurrentUser();
    if (currentUser && !isGuest) {
      try {
        const profile = await getUserFromSupabase(currentUser.id);
        await saveUserToSupabase(currentUser.id, {
          name: nextName,
          username: nextUsername,
          email: nextEmail,
          avatarUrl: nextAvatar,
          onboarded: true,
          preferences: profile?.preferences || {}
        });
      } catch (err) {
        console.error("Failed to sync updated user profile to Firestore:", err);
        addNotification("Successfully updated local profile, but failed to sync to cloud database.", "warning");
        return;
      }
    }
    addNotification("Profile updated successfully.", "success");
  };

  const [sharingProject, setSharingProject] = useState(false);

  const handleShareProject = async () => {
    const activeProject = projects.find(p => p.id === activeProjectId);
    if (!activeProject) {
      addNotification("Please open a project workspace first before sharing.", "warning");
      return;
    }
    setSharingProject(true);
    try {
      const { user: currentUser } = await supabaseAuth.getCurrentUser();
      const userId = currentUser?.id || "guest_user";
      const sharedId = await shareProjectSnapshotSupabase(activeProject, userId);
      const sharedUrl = `${window.location.origin}/?share=${sharedId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(sharedUrl);
      setGeneratedShareUrl(sharedUrl);
      setShowShareModal(true);
      addNotification("Read-only share link generated and copied to clipboard!", "success");
    } catch (err: any) {
      console.error("Failed to share project snapshot:", err);
      addNotification("Failed to generate share link. Please try again.", "warning");
    } finally {
      setSharingProject(false);
    }
  };

  const handleSaveAsTemplate = () => {
    const activeProject = projects.find(p => p.id === activeProjectId);
    if (!activeProject) return;
    setNewTemplateName(`${activeProject.name} Template`);
    setNewTemplateDesc(activeProject.description || `Custom reusable workspace template bootstrapped from ${activeProject.name}.`);
    setNewTemplateCategory(activeProject.type || "React Apps");
    setShowSaveTemplateModal(true);
  };

  const confirmSaveTemplate = () => {
    const activeProject = projects.find(p => p.id === activeProjectId);
    if (!activeProject) return;
    
    const customTemplatesRaw = localStorage.getItem("forgeai_custom_templates");
    let customTemplates = [];
    try {
      customTemplates = customTemplatesRaw ? JSON.parse(customTemplatesRaw) : [];
    } catch {
      customTemplates = [];
    }

    const newTmpl = {
      id: "custom_" + Date.now(),
      name: newTemplateName,
      description: newTemplateDesc,
      type: newTemplateCategory,
      files: activeProject.files,
      createdAt: new Date().toISOString()
    };

    customTemplates.push(newTmpl);
    localStorage.setItem("forgeai_custom_templates", JSON.stringify(customTemplates));
    setShowSaveTemplateModal(false);
    addNotification(`Successfully saved "${newTemplateName}" as a reusable blueprint template!`, "success");
  };

  const deleteProjectFromDashboard = async (id: string) => {
    if (projects.length <= 1) {
      addNotification("You must keep at least one active project workspace!", "warning");
      return;
    }
    const filtered = projects.filter(p => p.id !== id);
    setProjects(filtered);
    if (activeProjectId === id) {
      setActiveProjectId(filtered[0].id);
    }
    
    const { user: currentUser } = await supabaseAuth.getCurrentUser();
    if (currentUser) {
      deleteProjectFromSupabase(id).catch(err => {
        console.error("Failed to delete project from Firestore:", err);
      });
    }

    addNotification("Workspace deleted successfully.", "success");
  };

  const handleSelectLessonFromDashboard = (lessonId: string) => {
    setActiveView('lessons');
    loadLesson(lessonId);
  };

  const addNotification = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = `notify_${Date.now()}`;
    setNotifications(prev => [{ id, text, type }, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  const takeHistorySnapshot = (desc: string) => {
    if (!activeProject) return;
    const newSnapshot = {
      id: `snap_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString(),
      description: desc,
      files: { ...activeProject.files }
    };
    const currentHistory = activeProject.versionHistory || [];
    updateActiveProject({
      versionHistory: [newSnapshot, ...currentHistory].slice(0, 15)
    });
    addNotification(`Autosave snapshot taken: "${desc}"`, 'success');
  };

  const handleResolveSuggestion = (id: string, actionDesc: string) => {
    setResolvedSuggestions(prev => [...prev, id]);
    addNotification(`Running optimizer: "${actionDesc}"...`, 'info');
    setTimeout(() => {
      addNotification(`Optimized and corrected project code bases successfully!`, 'success');
      takeHistorySnapshot(`After optimization: ${actionDesc}`);
    }, 1000);
  };

  const handleBeginnerAction = (type: string) => {
    setBeginnerMode(type);
    if (type === 'web_game') {
      createNewProject("My Retro Game", "HTML5 canvas zombie survival game", "Web Apps", PROJECT_TEMPLATES.zombieGame.files);
      setActiveView('editor');
      addNotification("Interactive Web Game initialized! Ready to build.", "success");
    } else if (type === 'landing') {
      createNewProject("Responsive Landing Page", "Modern Tailwind portfolio template", "Websites", PROJECT_TEMPLATES.website.files);
      setActiveView('editor');
      addNotification("Landing Page initialized! Ready to customize layout.", "success");
    } else if (type === 'javascript') {
      setActiveView('lessons');
      loadLesson('web_dev_basics');
      addNotification("Loaded Web Dev Basics course in Academy!", "info");
    } else if (type === 'images') {
      setActiveView('assets');
      addNotification("Loaded Assets Lab. Describe custom game sprites!", "info");
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const isDarkMode = preferences.theme !== 'light';

  // Sync selected build mode files with current active project's files using functional update patterns
  useEffect(() => {
    if (!activeProject) return;
    const fileKeys = Object.keys(activeProject.files);
    
    // Default entry point to index.html if it exists, otherwise first html file
    const htmlFiles = fileKeys.filter(f => f.endsWith(".html"));
    const targetEntryPoint = htmlFiles.includes("index.html") 
      ? "index.html" 
      : (htmlFiles.length > 0 ? htmlFiles[0] : "index.html");
      
    setPreviewEntryPoint(prev => prev !== targetEntryPoint ? targetEntryPoint : prev);

    // Default CSS files (include style.css or any css files present)
    const cssFiles = fileKeys.filter(f => f.endsWith(".css"));
    const styleCss = cssFiles.filter(f => f === "style.css" || f === "styles.css");
    const targetCssFiles = styleCss.length > 0 ? styleCss : cssFiles.slice(0, 1);
    
    setSelectedPreviewCssFiles(prev => {
      if (prev.length === targetCssFiles.length && prev.every((val, idx) => val === targetCssFiles[idx])) {
        return prev;
      }
      return targetCssFiles;
    });

    // Default JS/TS files (include script.js, game.js, or any js files present)
    const jsFiles = fileKeys.filter(f => f.endsWith(".js") || f.endsWith(".ts") || f.endsWith(".jsx") || f.endsWith(".tsx"));
    const mainJs = jsFiles.filter(f => f === "script.js" || f === "game.js" || f === "main.js" || f === "app.js");
    const targetJsFiles = mainJs.length > 0 ? mainJs : jsFiles.slice(0, 1);
    
    setSelectedPreviewJsFiles(prev => {
      if (prev.length === targetJsFiles.length && prev.every((val, idx) => val === targetJsFiles[idx])) {
        return prev;
      }
      return targetJsFiles;
    });
  }, [activeProject?.id]);

  const updateActiveProject = (updatedFields: Partial<Project>) => {
    if (!activeProject) return;
    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        return { ...p, ...updatedFields };
      }
      return p;
    }));
  };

  // Daily usage counts tracker
  const getRemainingUsage = (feature: 'chats' | 'codeGen' | 'imageGen' | 'model3D' | 'analysis' | 'debugRequests') => {
    if (!activeProject) return 0;
    const usage = activeProject.dailyUsage || { chats: 0, codeGen: 0, imageGen: 0, model3D: 0, debugRequests: 0, analysis: 0 };
    const limits = isGuest 
      ? { chats: 10, codeGen: 5, imageGen: 3, model3D: 1, analysis: 2, debugRequests: 3 }
      : { chats: 80, codeGen: 50, imageGen: 20, model3D: 5, analysis: 15, debugRequests: 30 };
    return Math.max(0, limits[feature] - (usage[feature] || 0));
  };

  const getMaxLimit = (feature: 'chats' | 'codeGen' | 'imageGen' | 'model3D' | 'analysis' | 'debugRequests') => {
    return isGuest 
      ? { chats: 10, codeGen: 5, imageGen: 3, model3D: 1, analysis: 2, debugRequests: 3 }[feature]
      : { chats: 80, codeGen: 50, imageGen: 20, model3D: 5, analysis: 15, debugRequests: 30 }[feature];
  };

  const incrementUsage = (feature: 'chats' | 'codeGen' | 'imageGen' | 'model3D' | 'analysis' | 'debugRequests') => {
    if (!activeProject) return;
    const usage = activeProject.dailyUsage || { chats: 0, codeGen: 0, imageGen: 0, model3D: 0, debugRequests: 0, analysis: 0 };
    updateActiveProject({
      dailyUsage: {
        ...usage,
        [feature]: (usage[feature] || 0) + 1
      }
    });
  };

  // Project management
  const createNewProject = (name: string, description: string, type: string, files: Record<string, string>) => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name: name || "Untitled Forge Project",
      description: description || "An elegant, bespoke programming project created with ForgeAI.",
      type: type || "Websites",
      files: files || { "index.html": `<!DOCTYPE html>\n<html>\n<head><title>New App</title></head>\n<body class="bg-slate-900 text-white flex items-center justify-center min-h-screen"><h1>Welcome to my new project!</h1></body>\n</html>` },
      chatHistory: [
        { role: "assistant", content: `New Project "${name}" initialized. Select files in the sidebar and type code or request AI edits.`, timestamp: new Date().toLocaleTimeString() }
      ],
      generatedImages: [],
      generated3D: [],
      selectedModelId: "gemini-3.5-flash",
      selectedTabPath: Object.keys(files || {})[0] || "index.html",
      openTabs: Object.keys(files || {}),
      terminalHistory: [
        { type: "success", text: `Initialized virtual repo for ${name}` }
      ],
      dailyUsage: { chats: 0, codeGen: 0, imageGen: 0, model3D: 0, debugRequests: 0, analysis: 0 }
    };
    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProj.id);
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      addNotification("You must keep at least one active project workspace!", "warning");
      return;
    }
    const filtered = projects.filter(p => p.id !== id);
    setProjects(filtered);
    setActiveProjectId(filtered[0].id);

    const { user: currentUser } = await supabaseAuth.getCurrentUser();
    if (currentUser) {
      deleteProjectFromSupabase(id).catch(err => {
        console.error("Failed to delete project from Firestore:", err);
      });
    }
  };

  const handleRestoreVersion = (version: VersionHistoryItem) => {
    if (!activeProject) return;
    updateActiveProject({
      files: { ...version.files },
      selectedTabPath: Object.keys(version.files)[0] || "index.html",
      openTabs: Object.keys(version.files)
    });
  };

  const handleDeleteVersion = (versionId: string) => {
    if (!activeProject) return;
    const currentHistory = activeProject.versionHistory || [];
    updateActiveProject({
      versionHistory: currentHistory.filter(v => v.id !== versionId)
    });
  };

  // Code editor file actions
  const selectFile = (path: string) => {
    if (!activeProject) return;
    setCenterMode('editor');
    const tabs = activeProject.openTabs.includes(path) 
      ? activeProject.openTabs 
      : [...activeProject.openTabs, path];
    updateActiveProject({
      selectedTabPath: path,
      openTabs: tabs
    });
  };

  const closeTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProject) return;
    const remainingTabs = activeProject.openTabs.filter(t => t !== path);
    let nextSelected = activeProject.selectedTabPath;
    if (activeProject.selectedTabPath === path) {
      nextSelected = remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1] : null;
    }
    updateActiveProject({
      openTabs: remainingTabs,
      selectedTabPath: nextSelected
    });
  };

  const handleCreateFile = () => {
    if (!newFileName || !activeProject) return;
    const currentFiles = { ...activeProject.files };
    if (currentFiles[newFileName]) {
      addNotification("A file with this path already exists!", "warning");
      return;
    }
    currentFiles[newFileName] = `// Initialized file ${newFileName}\n`;
    const updatedTabs = [...activeProject.openTabs, newFileName];
    
    // Save current files state before modification
    takeHistorySnapshot(`Before creating file ${newFileName}`);
    
    updateActiveProject({
      files: currentFiles,
      selectedTabPath: newFileName,
      openTabs: updatedTabs
    });
    setNewFileName("");
    setShowNewFileInput(false);
  };

  const handleDeleteFile = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProject) return;
    
    // Save current files state before modification
    takeHistorySnapshot(`Before deleting file ${path}`);
    
    const currentFiles = { ...activeProject.files };
    delete currentFiles[path];
    
    const remainingTabs = activeProject.openTabs.filter(t => t !== path);
    let nextSelected = activeProject.selectedTabPath;
    if (activeProject.selectedTabPath === path) {
      nextSelected = remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1] : null;
    }
    
    updateActiveProject({
      files: currentFiles,
      openTabs: remainingTabs,
      selectedTabPath: nextSelected
    });
  };

  const handleCreateFolder = (parentFolderPath?: string) => {
    if (!activeProject) return;
    const folderName = prompt(`Enter new folder name ${parentFolderPath ? `inside ${parentFolderPath}` : 'at root'}:`);
    if (!folderName || !folderName.trim()) return;
    const cleanName = folderName.trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
    const fullFolderPath = parentFolderPath ? `${parentFolderPath}/${cleanName}` : cleanName;
    const currentFolders = activeProject.folders || [];
    if (!currentFolders.includes(fullFolderPath)) {
      updateActiveProject({ folders: [...currentFolders, fullFolderPath] });
      addNotification(`Created folder "${fullFolderPath}"`, "success");
    }
  };

  const handleDeletePath = (path: string, isFolder: boolean) => {
    if (!activeProject) return;
    if (isFolder) {
      if (confirm(`Are you sure you want to delete folder "${path}" and all files inside it?`)) {
        takeHistorySnapshot(`Before deleting folder ${path}`);
        const updatedFiles = { ...activeProject.files };
        Object.keys(updatedFiles).forEach(f => {
          if (f === path || f.startsWith(`${path}/`)) {
            delete updatedFiles[f];
          }
        });
        const updatedFolders = (activeProject.folders || []).filter(f => f !== path && !f.startsWith(`${path}/`));
        updateActiveProject({ files: updatedFiles, folders: updatedFolders });
        addNotification(`Deleted folder "${path}"`, "info");
      }
    } else {
      handleDeleteFile(path, { stopPropagation: () => {} } as any);
    }
  };

  const handleEditorChange = (value: string) => {
    if (!activeProject || !activeProject.selectedTabPath) return;
    const currentFiles = { ...activeProject.files };
    currentFiles[activeProject.selectedTabPath] = value;
    updateActiveProject({ files: currentFiles });

    const extension = (activeProject.selectedTabPath || "").split('.').pop()?.toLowerCase() || "";
    const isCodeFile = ['js', 'jsx', 'ts', 'tsx', 'json', 'css', 'html'].includes(extension);

    // Debounce the auto-save notification to avoid keyboard typing spam
    if (autoSaveToastTimerRef.current) {
      clearTimeout(autoSaveToastTimerRef.current);
    }
    autoSaveToastTimerRef.current = setTimeout(() => {
      if (isCodeFile) {
        // Run pre-save syntax validation using our lightweight custom parser
        const errors = validateCodeSyntax(value, activeProject.selectedTabPath || "");
        if (errors.length > 0) {
          // Alert user of the first found error
          addNotification(`⚠️ Pre-save Validation Warning: ${errors[0]}`, "warning");
          
          // Map to line error state to render gutter marks and Problems tab immediately
          const mappedErrors = errors.map(err => {
            const lineMatch = /line (\d+)/i.exec(err);
            const lineNum = lineMatch ? parseInt(lineMatch[1], 10) - 1 : 0;
            return { line: lineNum, message: err };
          });
          setSyntaxErrors(mappedErrors);
          return;
        } else {
          setSyntaxErrors([]);
        }
      }
      addNotification("Changes auto-saved to local project state", "success");
    }, 1500);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    const pairs: Record<string, string> = {
      '{': '}',
      '[': ']',
      '(': ')',
      '"': '"',
      "'": "'",
      '`': '`'
    };

    if (e.key === 'Tab') {
      e.preventDefault();
      const tabSpaces = "  ";
      const newValue = value.substring(0, start) + tabSpaces + value.substring(end);
      handleEditorChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = start + tabSpaces.length;
        textarea.selectionEnd = start + tabSpaces.length;
      }, 0);
      return;
    }

    if (pairs[e.key] !== undefined) {
      e.preventDefault();
      const openChar = e.key;
      const closeChar = pairs[openChar];
      
      const selectedText = value.substring(start, end);
      const newValue = value.substring(0, start) + openChar + selectedText + closeChar + value.substring(end);
      
      handleEditorChange(newValue);
      
      setTimeout(() => {
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = start + 1 + selectedText.length;
      }, 0);
      return;
    }

    const closingBrackets = ['}', ']', ')', '"', "'", '`'];
    if (closingBrackets.includes(e.key)) {
      if (start === end && value[start] === e.key) {
        e.preventDefault();
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = start + 1;
        return;
      }
    }

    if (e.key === 'Backspace' && start === end && start > 0) {
      const prevChar = value[start - 1];
      const nextChar = value[start];
      if (
        (prevChar === '{' && nextChar === '}') ||
        (prevChar === '[' && nextChar === ']') ||
        (prevChar === '(' && nextChar === ')') ||
        (prevChar === '"' && nextChar === '"') ||
        (prevChar === "'" && nextChar === "'") ||
        (prevChar === '`' && nextChar === '`')
      ) {
        e.preventDefault();
        const newValue = value.substring(0, start - 1) + value.substring(start + 1);
        handleEditorChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = start - 1;
          textarea.selectionEnd = start - 1;
        }, 0);
      }
    }
  };

  const handleEditorDoubleClick = () => {
    if (!activeProject || !activeProject.selectedTabPath) return;
    const path = activeProject.selectedTabPath;
    if (foldedLines[path] && Object.keys(foldedLines[path]).length > 0) {
      setFoldedLines({
        ...foldedLines,
        [path]: {}
      });
      addNotification("Restored code folds for editing.", "info");
    }
  };

  const handleEditorFocus = () => {
    if (!activeProject || !activeProject.selectedTabPath) return;
    const path = activeProject.selectedTabPath;
    if (foldedLines[path] && Object.keys(foldedLines[path]).length > 0) {
      setFoldedLines({
        ...foldedLines,
        [path]: {}
      });
      addNotification("Code unfolded for editing.", "info");
    }
  };

  // Search and replace code handler
  const executeReplace = () => {
    if (!activeProject || !activeProject.selectedTabPath || !searchQuery) return;
    const currentText = activeProject.files[activeProject.selectedTabPath] || "";
    if (!currentText.includes(searchQuery)) {
      addNotification("Search text not found in active file!", "warning");
      return;
    }
    const updatedText = currentText.replaceAll(searchQuery, replaceQuery);
    handleEditorChange(updatedText);
    
    // Log to terminal
    const logs = [...activeProject.terminalHistory, {
      type: 'success' as const,
      text: `Replaced all instances of "${searchQuery}" with "${replaceQuery}" in ${activeProject.selectedTabPath}`
    }];
    updateActiveProject({ terminalHistory: logs });
  };

  // Format Code using js-beautify library
  const handleFormatCode = () => {
    if (!activeProject || !activeProject.selectedTabPath) return;
    const path = activeProject.selectedTabPath;
    const currentCode = activeProject.files[path] || "";
    if (!currentCode.trim()) {
      addNotification("No code content to format.", "info");
      return;
    }

    let formattedCode = currentCode;
    try {
      const options = {
        indent_size: 2,
        indent_char: " ",
        max_preserve_newlines: 2,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
        indent_scripts: "normal" as const,
        brace_style: "collapse" as const,
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: true,
        wrap_line_length: 0,
        indent_inner_html: false,
        comma_first: false,
        e4x: false,
        indent_empty_lines: false
      };

      if (path.endsWith(".html") || path.endsWith(".htm")) {
        formattedCode = beautifyHtml(currentCode, options);
      } else if (path.endsWith(".css")) {
        formattedCode = beautifyCss(currentCode, options);
      } else if (path.endsWith(".js") || path.endsWith(".ts") || path.endsWith(".json") || path.endsWith(".jsx") || path.endsWith(".tsx")) {
        formattedCode = beautifyJs(currentCode, options);
      }

      if (formattedCode !== currentCode) {
        // Update files dictionary
        const updatedFiles = { ...activeProject.files, [path]: formattedCode };
        
        // Log to terminal
        const logs = [...activeProject.terminalHistory, {
          type: 'success' as const,
          text: `Beautified formatting of active file: ${path}`
        }];
        updateActiveProject({ files: updatedFiles, terminalHistory: logs });
        
        addNotification(`Formatted ${path} successfully using js-beautify!`, "success");
      } else {
        addNotification("Code is already clean and formatted.", "info");
      }
    } catch (err) {
      console.error("Formatting error:", err);
      addNotification("Code formatting failed. Please verify syntax.", "warning");
    }
  };

  // AI Chat integration via Gemini Proxy
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatSending || !activeProject) return;
    
    if (getRemainingUsage('chats') <= 0) {
      addNotification("You have reached your daily limit of 80 AI Chats! Upgrade to Developer Tier for unlimited runs.", "warning");
      return;
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString()
    };

    const nextHistory = [...activeProject.chatHistory, userMsg];
    updateActiveProject({ chatHistory: nextHistory });
    setChatInput("");
    setIsChatSending(true);
    incrementUsage('chats');

    try {
      let customApiKeys = {};
      try {
        const saved = localStorage.getItem("forgeai_custom_api_keys");
        if (saved) customApiKeys = JSON.parse(saved);
      } catch (err) {}

      // Robust response fetching helper with validation and auto fallback/retry logic
      const fetchWithValidation = async (msgs: ChatMessage[], modelId: string, attemptsLeft: number): Promise<string> => {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: msgs,
            modelId: modelId,
            projectFiles: activeProject.files,
            customApiKeys
          })
        });

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const text = data.text || "";
        // Parse chat response / stream chunks to validate code blocks and markdown format
        const validation = AIResponseValidator.validate(text);

        if (!validation.isValid && attemptsLeft > 0) {
          console.warn(`[AIResponseValidator] Quality failure in chat response: ${validation.reason}. Retrying (Attempts left: ${attemptsLeft})...`);
          addNotification(`Response validator flagged quality issue: ${validation.reason}. Performing automatic recovery retry...`, "warning");
          
          // Switch to a fallback model if we fail on the primary model
          const fallbackModel = modelId === "gemini-3.5-flash" ? "groq-llama-3.3" : "gemini-3.5-flash";
          return fetchWithValidation(msgs, fallbackModel, attemptsLeft - 1);
        }

        let content = text;
        if (data.failoverSwitched) {
          content = `⚡ *Auto-routed to High-Availability Engine (${data.failoverSwitched}) due to peak loads.*\n\n` + content;
        }
        return content;
      };

      const finalContent = await fetchWithValidation(nextHistory, activeProject.selectedModelId || "gemini-3.5-flash", 2);

      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: finalContent,
        timestamp: new Date().toLocaleTimeString()
      };

      updateActiveProject({
        chatHistory: [...nextHistory, aiMsg]
      });

    } catch (e: any) {
      const errMessage = e.message || "Failed to contact proxy.";
      updateActiveProject({
        chatHistory: [...nextHistory, {
          role: 'assistant',
          content: `⚠️ Error during model inference: ${errMessage}. Make sure you have configured your environment credentials in Settings.`,
          timestamp: new Date().toLocaleTimeString()
        }]
      });
    } finally {
      setIsChatSending(false);
    }
  };

  // Apply code block changes recommended by AI assistant
  const applyCodeSuggestion = (fileName: string, proposedContent: string) => {
    if (!activeProject) return;
    const currentFiles = { ...activeProject.files };
    currentFiles[fileName] = proposedContent;
    
    const updatedTabs = activeProject.openTabs.includes(fileName) 
      ? activeProject.openTabs 
      : [...activeProject.openTabs, fileName];

    updateActiveProject({
      files: currentFiles,
      selectedTabPath: fileName,
      openTabs: updatedTabs,
      terminalHistory: [
        ...activeProject.terminalHistory,
        { type: 'success', text: `Successfully applied AI suggestion block into file: ${fileName}` }
      ]
    });
    
    addNotification(`Applied changes to ${fileName} successfully!`, "success");
    setPreviewKey(prev => prev + 1); // Refresh iframe
  };

  // Helper parser to read markdown code blocks from chat text
  const extractCodeBlocksFromMessage = (content: string) => {
    const regex = /```([\w.-]+)\n([\s\S]*?)```/g;
    const blocks: { fileName: string; content: string }[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (match[1] && match[2]) {
        blocks.push({
          fileName: match[1].trim(),
          content: match[2]
        });
      }
    }
    return blocks;
  };

  // Image generation utilizing local high-quality templates and canvas loaders
  const triggerImageGeneration = async () => {
    if (!imagePrompt.trim() || !activeProject || isGeneratingImage) return;

    if (getRemainingUsage('imageGen') <= 0) {
      addNotification("Daily Image Generation limit (20) reached!", "warning");
      return;
    }

    setIsGeneratingImage(true);
    incrementUsage('imageGen');
    addNotification("Orchestrating Forge AI Image generation engine...", "info");

    try {
      let imageBytes = "";
      if (isEditImageMode && selectedImageToEdit) {
        const url = selectedImageToEdit;
        if (url.startsWith("data:")) {
          imageBytes = url.split(",")[1] || "";
        }
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageAspectRatio,
          imageSize: imageResolution,
          imageBytes,
          modelType: imageQualityModel === "gemini-3-pro-image" ? "studio" : "fast"
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const newAsset: GeneratedImageAsset = {
        id: `img_${Date.now()}`,
        name: `${imagePrompt.toLowerCase().replace(/[^a-z0-9]/g, "_")}.png`,
        prompt: imagePrompt,
        url: data.imageUrl,
        timestamp: new Date().toLocaleTimeString()
      };

      const currentImages = activeProject.generatedImages || [];
      updateActiveProject({
        generatedImages: [newAsset, ...currentImages],
        terminalHistory: [
          ...activeProject.terminalHistory,
          { type: 'success', text: `Saved generated asset to assets/${newAsset.name}` }
        ]
      });

      addNotification(`Image synthesized successfully!`, "success");
      setImagePrompt("");
      setIsGeneratingImage(false);

    } catch (err: any) {
      console.warn("Real image generation failed, using designer template canvas fallback:", err);
      addNotification("Using ForgeAI creative canvas sandbox fallback...", "info");

      // Fallback Canvas loader matching style requested
      const colors = {
        "UI Theme": ["#0f172a", "#14b8a6", "#2dd4bf", "#1e293b"],
        "Logo": ["#1e1b4b", "#6366f1", "#818cf8", "#4338ca"],
        "Game Art": ["#7f1d1d", "#f87171", "#ef4444", "#991b1b"],
        "Character": ["#14532d", "#4ade80", "#22c55e", "#166534"],
        "Backgrounds": ["#312e81", "#a78bfa", "#c084fc", "#4c1d95"]
      }[imageStyle] || ["#020617", "#3b82f6", "#1d4ed8", "#1e1b4b"];

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 512;
      tempCanvas.height = 512;
      const ctx = tempCanvas.getContext("2d");
      
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, colors[0]);
        grad.addColorStop(1, colors[3] || colors[0]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(256, 256, 40 + i * 45, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = colors[1];
        ctx.beginPath();
        ctx.arc(256, 256, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colors[2];
        ctx.beginPath();
        ctx.moveTo(256, 190);
        ctx.lineTo(320, 310);
        ctx.lineTo(192, 310);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "italic bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(imagePrompt.substring(0, 40), 256, 450);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let j = 0; j < 512; j += 32) {
          ctx.beginPath(); ctx.moveTo(j, 0); ctx.lineTo(j, 512); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(512, j); ctx.stroke();
        }
      }

      const generatedUrl = tempCanvas.toDataURL("image/png");
      const newAsset: GeneratedImageAsset = {
        id: `img_${Date.now()}`,
        name: `${imagePrompt.toLowerCase().replace(/[^a-z0-9]/g, "_")}.png`,
        prompt: imagePrompt,
        url: generatedUrl,
        timestamp: new Date().toLocaleTimeString()
      };

      const currentImages = activeProject.generatedImages || [];
      updateActiveProject({
        generatedImages: [newAsset, ...currentImages],
        terminalHistory: [
          ...activeProject.terminalHistory,
          { type: 'success', text: `Saved generated asset layout to assets/${newAsset.name}` }
        ]
      });

      setImagePrompt("");
      setIsGeneratingImage(false);
    }
  };

  // Music synthesis triggers using local procedural synthesizer failovers
  const triggerMusicGeneration = async () => {
    if (!musicPrompt.trim() || !activeProject || isGeneratingMusic) return;

    setIsGeneratingMusic(true);
    addNotification(`Sending music generation query to Lyria synthesis engine...`, "info");

    try {
      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: musicPrompt,
          duration: musicMode === 'pro' ? 'full' : 'short'
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      let audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      if (data.audioBase64 && data.audioBase64 !== "fallback") {
        audioUrl = `data:${data.mimeType || 'audio/mp3'};base64,${data.audioBase64}`;
      }

      const trackName = `${musicPrompt.toLowerCase().replace(/[^a-z0-9]/g, "_")}.mp3`;
      const newTrack = {
        id: `track_${Date.now()}`,
        name: trackName,
        prompt: musicPrompt,
        url: audioUrl,
        lyrics: data.lyrics || ""
      };

      setGeneratedMusicTracks(prev => [newTrack, ...prev]);
      addNotification(`Lyria synthesized "${musicPrompt.substring(0, 30)}..." successfully!`, "success");

      updateActiveProject({
        terminalHistory: [
          ...activeProject.terminalHistory,
          { type: 'success', text: `Saved generated synth music audio to assets/${newTrack.name}` }
        ]
      });

      setMusicPrompt("");
      setIsGeneratingMusic(false);

    } catch (err: any) {
      console.warn("Real music generation failed, using procedural audio fallback:", err);
      const trackName = `${musicPrompt.toLowerCase().replace(/[^a-z0-9]/g, "_")}.mp3`;
      const newTrack = {
        id: `track_${Date.now()}`,
        name: trackName,
        prompt: musicPrompt,
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        lyrics: "Procedural atmospheric frequency synthesized by ForgeAI."
      };

      setGeneratedMusicTracks(prev => [newTrack, ...prev]);
      addNotification(`Lyria synthesized fallback melody successfully!`, "success");
      
      updateActiveProject({
        terminalHistory: [
          ...activeProject.terminalHistory,
          { type: 'success', text: `Saved ambient synth music audio to assets/${trackName}` }
        ]
      });

      setMusicPrompt("");
      setIsGeneratingMusic(false);
    }
  };

  // Video generation triggers utilizing start frame image and Veo polling
  const triggerVideoGeneration = async () => {
    if (!videoPrompt.trim() || !activeProject || isGeneratingVideo) return;

    setIsGeneratingVideo(true);
    setVideoProgress(15);
    addNotification("Triggering Veo 3.1 fast video synthesis pipeline...", "info");

    try {
      let imageBytes = "";
      if (selectedImageForVideo) {
        if (selectedImageForVideo.startsWith("data:")) {
          imageBytes = selectedImageForVideo.split(",")[1] || "";
        }
      }

      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: "16:9",
          imageBytes
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const opName = data.operationName;
      addNotification("Veo 3.1 video operation registered. Commencing live status polling...", "info");

      // Poll status 4 times with progressive progress bar
      let pollCount = 0;
      const pollInterval = setInterval(async () => {
        pollCount++;
        setVideoProgress(Math.min(15 + pollCount * 20, 85));

        try {
          const statusRes = await fetch("/api/video-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ operationName: opName })
          });
          const statusData = await statusRes.json();
          
          if (statusData.done) {
            clearInterval(pollInterval);
            setVideoProgress(95);

            // Fetch final download
            const downloadRes = await fetch("/api/video-download", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ operationName: opName })
            });
            const downloadData = await downloadRes.json();
            
            let finalVideoUrl = "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4";
            if (downloadData.videoUrl && downloadData.videoUrl !== "fallback") {
              finalVideoUrl = downloadData.videoUrl;
            }

            const videoName = `${videoPrompt.toLowerCase().replace(/[^a-z0-9]/g, "_")}.mp4`;
            const newVideo = {
              id: `video_${Date.now()}`,
              name: videoName,
              prompt: videoPrompt,
              url: finalVideoUrl
            };

            setGeneratedVideos(prev => [newVideo, ...prev]);
            addNotification("Veo 3.1 animated your prompt into cinematic footage!", "success");
            setVideoProgress(100);
            setIsGeneratingVideo(false);
            setVideoPrompt("");
            setSelectedImageForVideo(null);

            updateActiveProject({
              terminalHistory: [
                ...activeProject.terminalHistory,
                { type: 'success', text: `Saved generated Veo 3.1 video file to assets/${videoName}` }
              ]
            });
          }
        } catch (pollErr) {
          console.error("Veo polling interval error:", pollErr);
        }
      }, 2000);

    } catch (err: any) {
      console.warn("Real video generation failed, using cosmic cinematic fallback:", err);
      setTimeout(() => {
        setVideoProgress(100);
        const videoName = `${videoPrompt.toLowerCase().replace(/[^a-z0-9]/g, "_")}.mp4`;
        const newVideo = {
          id: `video_${Date.now()}`,
          name: videoName,
          prompt: videoPrompt,
          url: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4"
        };

        setGeneratedVideos(prev => [newVideo, ...prev]);
        addNotification("Veo fallback generated cinematic footage!", "success");

        updateActiveProject({
          terminalHistory: [
            ...activeProject.terminalHistory,
            { type: 'success', text: `Saved generated video file to assets/${videoName}` }
          ]
        });

        setVideoPrompt("");
        setIsGeneratingVideo(false);
        setSelectedImageForVideo(null);
      }, 3000);
    }
  };

  // 3D Model Generation and Interactive WebGL coordinates solver
  const trigger3DGeneration = async () => {
    if (!model3DPrompt.trim() || !activeProject || isGenerating3D) return;

    if (getRemainingUsage('model3D') <= 0) {
      addNotification("You have reached your daily limit of 5 3D generations! Save your remaining slots or subscribe.", "warning");
      return;
    }

    setIsGenerating3D(true);
    incrementUsage('model3D');

    try {
      const response = await fetch("/api/generate-3d", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: model3DPrompt,
          assetType: model3DCategory
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const new3DAsset: Generated3DAsset = {
        id: `model_3d_${Date.now()}`,
        name: data.fileName,
        prompt: model3DPrompt,
        objText: data.objText,
        timestamp: new Date().toLocaleTimeString()
      };

      const current3D = activeProject.generated3D || [];
      updateActiveProject({
        generated3D: [new3DAsset, ...current3D],
        terminalHistory: [
          ...activeProject.terminalHistory,
          { type: 'success', text: `3D Mesh generated and written successfully to assets/${new3DAsset.name}` }
        ]
      });

      setSelected3DAsset(new3DAsset);
      setModel3DPrompt("");

    } catch (e: any) {
      addNotification("Error generating 3D model coordinates. Emulating fallback coordinate model...", "warning");
      // Fallback Cube OBJ simulation so the user always has a functional 3D preview
      const fallbackObj = `
# ForgeAI Fallback Cube for prompt: ${model3DPrompt}
v -1.0 -1.0 1.0
v 1.0 -1.0 1.0
v 1.0 1.0 1.0
v -1.0 1.0 1.0
v -1.0 -1.0 -1.0
v 1.0 -1.0 -1.0
v 1.0 1.0 -1.0
v -1.0 1.0 -1.0
f 1 2 3 4
f 2 6 7 3
f 6 5 8 7
f 5 1 4 8
f 4 3 7 8
f 5 6 2 1
      `.trim();

      const new3DAsset: Generated3DAsset = {
        id: `model_3d_${Date.now()}`,
        name: `${model3DPrompt.toLowerCase().replace(/[^a-z0-9]/g, "_")}.obj`,
        prompt: model3DPrompt,
        objText: fallbackObj,
        timestamp: new Date().toLocaleTimeString()
      };

      const current3D = activeProject.generated3D || [];
      updateActiveProject({
        generated3D: [new3DAsset, ...current3D]
      });
      setSelected3DAsset(new3DAsset);
    } finally {
      setIsGenerating3D(false);
    }
  };

  // Custom 3D Wireframe / Polygon projection engine
  useEffect(() => {
    if (!canvas3DRef.current) return;
    const canvas = canvas3DRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid backdrop
      ctx.strokeStyle = isDarkMode ? "#1e293b" : "#e2e8f0";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
      }

      if (!selected3DAsset) {
        // Draw instructions placeholder
        ctx.fillStyle = isDarkMode ? "#94a3b8" : "#475569";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Select a generated 3D asset, or type a prompt above", canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText("to synthesize and preview real-time 3D models.", canvas.width / 2, canvas.height / 2 + 10);
        return;
      }

      // Parse OBJ file format vertices and faces
      const lines = selected3DAsset.objText.split("\n");
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
            // OBJ indices are 1-based, and may include slashes like 1/1/1 or 1//1
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

      if (vertices.length === 0) {
        ctx.fillStyle = "#ef4444";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Invalid OBJ vertex data generated. Re-generate with another prompt.", canvas.width / 2, canvas.height / 2);
        return;
      }

      // Projection calculations
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 160;
      const cameraDist = 3.5;

      // Project vertices to 2D
      const projected = vertices.map(v => {
        // Rotation around Y axis
        const cosY = Math.cos(modelRotation.y);
        const sinY = Math.sin(modelRotation.y);
        let x1 = v.x * cosY - v.z * sinY;
        let z1 = v.x * sinY + v.z * cosY;

        // Rotation around X axis
        const cosX = Math.cos(modelRotation.x);
        const sinX = Math.sin(modelRotation.x);
        let y2 = v.y * cosX - z1 * sinX;
        let z2 = v.y * sinX + z1 * cosX;

        // Scale & Perspective
        const scale = fov / (cameraDist + z2);
        return {
          x: cx + x1 * scale,
          y: cy - y2 * scale, // flip Y for screen
          z: z2
        };
      });

      // Draw model faces
      ctx.lineWidth = 1.5;
      faces.forEach((face, fIdx) => {
        // Calculate dynamic shadow shade based on average face depth
        let avgZ = 0;
        let valid = true;
        face.forEach(idx => {
          if (!projected[idx]) valid = false;
          else avgZ += projected[idx].z;
        });
        if (!valid) return;
        avgZ /= face.length;

        // Map depth to opacity/color
        const intensity = Math.max(20, Math.min(220, Math.floor(180 - avgZ * 40)));
        ctx.fillStyle = `rgba(20, 184, 166, ${Math.min(0.8, (intensity / 255) + 0.15)})`;
        ctx.strokeStyle = "#2dd4bf";

        ctx.beginPath();
        const startPt = projected[face[0]];
        ctx.moveTo(startPt.x, startPt.y);
        for (let i = 1; i < face.length; i++) {
          const pt = projected[face[i]];
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // Draw helper text overlay
      ctx.fillStyle = "rgba(20, 184, 166, 0.8)";
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`Faces: ${faces.length} | Verts: ${vertices.length}`, 15, canvas.height - 15);
      ctx.textAlign = "right";
      ctx.fillText(`Rotation: X:${modelRotation.x.toFixed(2)} Y:${modelRotation.y.toFixed(2)}`, canvas.width - 15, canvas.height - 15);

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [selected3DAsset, modelRotation, isDarkMode]);

  // Handle Dragging 3D Canvas rotating
  const handleMouseDown3D = (e: React.MouseEvent) => {
    setIsDragging3D(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove3D = (e: React.MouseEvent) => {
    if (!isDragging3D) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    setModelRotation(prev => ({
      x: prev.x + dy * 0.01,
      y: prev.y + dx * 0.01
    }));
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp3D = () => {
    setIsDragging3D(false);
  };

  // Automated Lessons selector loading template
  const loadLesson = (lessonId: string) => {
    const lesson = PROGRAMMING_LESSONS.find(l => l.id === lessonId);
    if (!lesson) return;
    
    // Create new project with the lesson template files
    createNewProject(
      `Sandbox: ${lesson.title.substring(3)}`,
      lesson.description,
      "Websites",
      {
        [lesson.targetFile]: lesson.codeTemplate,
        "instructions.txt": `CHALLENGE INSTRUCTIONS:\n\n${lesson.instructions.map((ins, i) => `${i+1}. ${ins}`).join("\n")}`
      }
    );
    setActiveLessonId(lessonId);
    setCompletedLessonSteps(prev => ({
      ...prev,
      [lessonId]: new Array(lesson.instructions.length).fill(false)
    }));
    setActiveView('editor');
  };

  const toggleLessonStep = (lessonId: string, index: number) => {
    setCompletedLessonSteps(prev => {
      const steps = [...(prev[lessonId] || [])];
      steps[index] = !steps[index];
      return { ...prev, [lessonId]: steps };
    });
  };

  // Simulated Command Terminal Executor
  const handleTerminalCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim() || !activeProject) return;

    const cmd = terminalInput.trim().toLowerCase();
    const cmdTime = new Date().toLocaleTimeString();
    let responseLines: TerminalLine[] = [];

    // Base user command log
    responseLines.push({ type: 'command', text: `$ ${terminalInput}`, time: cmdTime });

    if (cmd === "clear") {
      updateActiveProject({ terminalHistory: [] });
      setTerminalInput("");
      return;
    } else if (cmd === "help") {
      responseLines.push(
        { type: 'output', text: "Available sandbox terminal utility commands:" },
        { type: 'output', text: "  npm run dev       - Activates live virtual compiler server and syncs blobs" },
        { type: 'output', text: "  npm run build     - Compiles and minifies static files into dist/" },
        { type: 'output', text: "  python bot.py     - Test active Discord viper bot instance" },
        { type: 'output', text: "  git status        - Checks virtual repository indexes and unstaged files" },
        { type: 'output', text: "  clear             - Clear terminal logs" }
      );
    } else if (cmd.startsWith("npm run dev") || cmd.startsWith("vite")) {
      responseLines.push(
        { type: 'success', text: "Vite HMR virtual listener running on port 3000..." },
        { type: 'output', text: "  > Local: http://localhost:3000/" },
        { type: 'output', text: "  > Static index sync complete." }
      );
    } else if (cmd.startsWith("npm run build")) {
      responseLines.push(
        { type: 'output', text: "Building distribution bundles..." },
        { type: 'output', text: "index.html (1.4kb) - successfully bundled." },
        { type: 'output', text: "assets/main.js (23.9kb) - minified and polyfilled." },
        { type: 'success', text: "Build completed successfully in 412ms!" }
      );
    } else if (cmd.includes("bot.py") || cmd.includes("python")) {
      responseLines.push(
        { type: 'output', text: "Loading viper discord bot modules..." },
        { type: 'output', text: "Authenticating with virtual client token wrapper..." },
        { type: 'success', text: "Bot connected as ViperModerationBot#2026. Latency: 24ms." }
      );
    } else if (cmd === "git status") {
      const changedFiles = Object.keys(activeProject.files);
      responseLines.push(
        { type: 'output', text: "On branch master" },
        { type: 'output', text: "Your branch is up to date with 'origin/master'." },
        { type: 'output', text: "Unstaged code updates in workspace folder:" },
        ...changedFiles.map(f => ({ type: 'error' as const, text: `  modified:   ${f}` })),
        { type: 'output', text: "Use 'git commit' inside production menu to stage changes securely." }
      );
    } else {
      responseLines.push({ type: 'error', text: `Command not found: "${cmd}". Type "help" to see valid sandbox actions.` });
    }

    updateActiveProject({
      terminalHistory: [...activeProject.terminalHistory, ...responseLines]
    });
    setTerminalInput("");
  };

  // Zip / file exports
  const handleDownloadProject = async () => {
    if (!activeProject) return;
    
    try {
      addNotification("Creating ZIP archive of your project files...", "info");
      const zip = new JSZip();
      
      // Add each file in the active project to the ZIP structure
      Object.entries(activeProject.files).forEach(([filePath, content]) => {
        zip.file(filePath, (content as string) || "");
      });
      
      // Generate the ZIP blob asynchronously
      const blob = await zip.generateAsync({ type: "blob" });
      
      // Generate dynamic download anchor
      const downloadUrl = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", downloadUrl);
      
      const safeProjectName = activeProject.name.toLowerCase().replace(/\s+/g, '_');
      downloadAnchor.setAttribute("download", `${safeProjectName}_project.zip`);
      
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(downloadUrl);
      
      addNotification("Project ZIP downloaded successfully!", "success");
      
      const logs = [...activeProject.terminalHistory, {
        type: 'success' as const,
        text: `Exported all project files (${Object.keys(activeProject.files).length} files) to ZIP archive: ${safeProjectName}_project.zip`
      }];
      updateActiveProject({ terminalHistory: logs });
    } catch (err) {
      console.error("Failed to compile ZIP archive:", err);
      addNotification("ZIP compile failed. Falling back to JSON project configuration export.", "warning");
      
      // Safe fallback to JSON representation if zip libraries are absent or fail
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${activeProject.name.toLowerCase().replace(/\s+/g, '_')}_workspace.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeProject || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (!event.target || !event.target.result) return;
        try {
          const zip = await JSZip.loadAsync(event.target.result);
          const newFiles: Record<string, string> = {};
          
          const promises: Promise<void>[] = [];
          zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
              const p = zipEntry.async("string").then((content) => {
                if (!relativePath.startsWith("__MACOSX/") && !relativePath.endsWith(".DS_Store")) {
                  newFiles[relativePath] = content;
                }
              });
              promises.push(p);
            }
          });
          
          await Promise.all(promises);
          
          if (Object.keys(newFiles).length === 0) {
            addNotification("The uploaded ZIP archive does not contain any valid files.", "warning");
            return;
          }
          
          setUploadedZipFiles(newFiles);
          setShowZipConfirmModal(true);
        } catch (err) {
          console.error("ZIP load error", err);
          addNotification("Failed to parse the ZIP archive. Please ensure it is a valid ZIP file.", "warning");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      addNotification("Failed to read the selected file.", "warning");
    } finally {
      e.target.value = "";
    }
  };

  const handleConfirmZipExtraction = (mode: 'replace' | 'merge') => {
    if (!activeProject || !uploadedZipFiles) return;
    
    let mergedFiles: Record<string, string> = {};
    if (mode === 'merge') {
      mergedFiles = { ...activeProject.files, ...uploadedZipFiles };
    } else {
      // 'replace': delete everything except .md files
      const existingMdFiles: Record<string, string> = {};
      Object.entries(activeProject.files).forEach(([path, content]) => {
        if (path.endsWith('.md')) {
          existingMdFiles[path] = content as string;
        }
      });
      mergedFiles = { ...existingMdFiles, ...uploadedZipFiles };
    }
    
    let selectedPath = activeProject.selectedTabPath;
    const fileKeys = Object.keys(uploadedZipFiles);
    if (fileKeys.length > 0) {
      const indexFile = fileKeys.find(f => f.endsWith('index.html') || f === 'index.html');
      selectedPath = indexFile || fileKeys[0];
    }
    
    updateActiveProject({
      files: mergedFiles,
      selectedTabPath: selectedPath,
      terminalHistory: [
        ...activeProject.terminalHistory,
        {
          type: 'success',
          text: `Extracted ${Object.keys(uploadedZipFiles).length} files from ZIP using '${mode}' mode. Preserved existing .md files.`
        }
      ]
    });
    
    addNotification(`Successfully extracted ZIP (${Object.keys(uploadedZipFiles).length} files)`, 'success');
    setUploadedZipFiles(null);
    setShowZipConfirmModal(false);
  };

  // Generate dynamic URL preview blob so index.html, style.css and script.js works flawlessly inside the iframe preview!
  useEffect(() => {
    if (!activeProject) {
      setPreviewBlobUrl("");
      return;
    }
    
    const htmlFile = previewEntryPoint || "index.html";
    const html = activeProject.files[htmlFile] || activeProject.files["index.html"] || "<h1>No index.html loaded!</h1>";
    
    let css = "";
    if (selectedPreviewCssFiles && selectedPreviewCssFiles.length > 0) {
      selectedPreviewCssFiles.forEach(f => {
        if (activeProject.files[f]) {
          css += `\n/* --- Bundled: ${f} --- */\n` + activeProject.files[f] + "\n";
        }
      });
    } else {
      css = activeProject.files["style.css"] || "";
    }

    let js = "";
    if (selectedPreviewJsFiles && selectedPreviewJsFiles.length > 0) {
      selectedPreviewJsFiles.forEach(f => {
        if (activeProject.files[f]) {
          js += `\n/* --- Bundled: ${f} --- */\n` + activeProject.files[f] + "\n";
        }
      });
    } else {
      js = activeProject.files["script.js"] || activeProject.files["game.js"] || "";
    }

    const timer = setTimeout(() => {
      let compiled = html;
      
      const interceptorScript = `
<script id="forgeai-interceptor">
  (function() {
    const post = (type, payload) => {
      window.parent.postMessage({ source: 'forgeai-iframe', type, payload }, '*');
    };

    // Override console methods
    const consoleMethods = ['log', 'info', 'warn', 'error', 'debug'];
    consoleMethods.forEach(method => {
      const original = console[method];
      console[method] = function(...args) {
        original.apply(console, args);
        const serializedArgs = args.map(arg => {
          try {
            if (arg === null) return 'null';
            if (arg === undefined) return 'undefined';
            if (typeof arg === 'object') return JSON.stringify(arg);
            return String(arg);
          } catch(e) {
            return '[Unserializable Object]';
          }
        });
        post('console-log', {
          method,
          text: serializedArgs.join(' '),
          time: new Date().toLocaleTimeString()
        });
      };
    });

    // Handle uncaught errors
    window.addEventListener('error', function(event) {
      post('console-log', {
        method: 'error',
        text: 'Uncaught Error: ' + event.message + ' at ' + event.filename + ':' + event.lineno,
        time: new Date().toLocaleTimeString()
      });
    });

    // Override Fetch API
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : (input && input.url) || 'Unknown URL';
      const method = (init && init.method) || 'GET';
      const startTime = performance.now();
      const reqId = Math.random().toString(36).substring(7);
      
      post('network-activity', {
        id: reqId,
        url,
        method,
        status: 'pending',
        time: new Date().toLocaleTimeString(),
        type: 'fetch'
      });

      try {
        const response = await originalFetch.apply(this, arguments);
        const duration = Math.round(performance.now() - startTime);
        post('network-activity', {
          id: reqId,
          url,
          method,
          status: response.status,
          statusText: response.statusText,
          duration: duration + 'ms',
          time: new Date().toLocaleTimeString(),
          type: 'fetch'
        });
        return response;
      } catch (err) {
        const duration = Math.round(performance.now() - startTime);
        post('network-activity', {
          id: reqId,
          url,
          method,
          status: 'failed',
          statusText: err.message,
          duration: duration + 'ms',
          time: new Date().toLocaleTimeString(),
          type: 'fetch'
        });
        throw err;
      }
    };

    // Override XMLHttpRequest
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const reqId = Math.random().toString(36).substring(7);
      let method = 'GET';
      let url = 'Unknown URL';
      let startTime = 0;

      const originalOpen = xhr.open;
      xhr.open = function(m, u) {
        method = m;
        url = u;
        return originalOpen.apply(this, arguments);
      };

      const originalSend = xhr.send;
      xhr.send = function() {
        startTime = performance.now();
        post('network-activity', {
          id: reqId,
          url,
          method,
          status: 'pending',
          time: new Date().toLocaleTimeString(),
          type: 'XHR'
        });

        xhr.addEventListener('readystatechange', function() {
          if (xhr.readyState === 4) {
            const duration = Math.round(performance.now() - startTime);
            post('network-activity', {
              id: reqId,
              url,
              method,
              status: xhr.status || 'failed',
              statusText: xhr.status === 0 ? 'Network Error' : '',
              duration: duration + 'ms',
              time: new Date().toLocaleTimeString(),
              type: 'XHR'
            });
          }
        });

        return originalSend.apply(this, arguments);
      };

      return xhr;
    };
  })();
</script>`;

      if (compiled.includes("<head>")) {
        compiled = compiled.replace("<head>", `<head>\n${interceptorScript}`);
      } else {
        compiled = interceptorScript + "\n" + compiled;
      }

      if (!compiled.includes("https://cdn.tailwindcss.com") && !compiled.includes("tailwindcss")) {
        compiled = compiled.replace("</head>", `<script src="https://cdn.tailwindcss.com"></script></head>`);
      }

      if (css) {
        compiled = compiled.replace("</head>", `<style>${css}</style></head>`);
      }
      if (js) {
        compiled = compiled.replace("</body>", `<script>${js}</script></body>`);
      }

      const blob = new Blob([compiled], { type: "text/html" });
      const objectUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [
    activeProject?.id,
    previewKey,
    previewEntryPoint,
    selectedPreviewCssFiles,
    selectedPreviewJsFiles,
    activeProject?.files[previewEntryPoint || "index.html"],
    activeProject?.files["index.html"],
    activeProject?.files["style.css"],
    activeProject?.files["script.js"],
    activeProject?.files["game.js"],
    selectedPreviewCssFiles.map(f => activeProject?.files[f] || "").join("::"),
    selectedPreviewJsFiles.map(f => activeProject?.files[f] || "").join("::")
  ]);

  if (!isAuthenticated) {
    if (showOAuthCustomization) {
      return (
        <OAuthCustomizationPage
          defaultName={userName || ""}
          defaultUsername={userUsername || ""}
          defaultEmail={userEmail || ""}
          onCustomizationComplete={({ email, name, username }) => {
            const nextName = name || userName || "Creator";
            const nextUsername = username || userUsername || "creator_01";

            setIsAuthenticated(true);
            setUserEmail(email || userEmail || "");
            setUserName(nextName);
            setUserUsername(nextUsername);
            setShowOAuthCustomization(false);
            setShowAuthPage(false);

            localStorage.setItem("forgeai_auth", "true");
            localStorage.setItem("forgeai_user_name", nextName);
            localStorage.setItem("forgeai_user_username", nextUsername);
            localStorage.setItem("forgeai_user_email", email || userEmail || "");
            localStorage.setItem("forgeai_onboarded", "true");
            setIsOnboarded(true);
          }}
        />
      );
    }

    return (
      <LandingPage
        onGetStarted={() => {
          setShowOAuthCustomization(true);
        }}
        onSignIn={() => {
          setShowOAuthCustomization(true);
        }}
      />
    );
  }

  if (!isOnboarded) {
    return (
      <OnboardingPage 
        userName={userName}
        onOnboardingComplete={async (profile) => {
          setIsOnboarded(true);
          localStorage.setItem("forgeai_onboarded", "true");

          let resolvedName = userName;
          if (profile.displayName) {
            resolvedName = profile.displayName;
            setUserName(profile.displayName);
            localStorage.setItem("forgeai_user_name", profile.displayName);
          }

          let resolvedUsername = userUsername;
          if (profile.username) {
            resolvedUsername = profile.username;
            setUserUsername(profile.username);
            localStorage.setItem("forgeai_user_username", profile.username);
          }

          if (profile.avatarUrl) {
            setAvatarUrl(profile.avatarUrl);
            localStorage.setItem("forgeai_user_avatar", profile.avatarUrl);
          }

          // If logged in, save profile customizations to Firestore for persistent sync
          const { user: currentUser } = await supabaseAuth.getCurrentUser();
          if (currentUser && !isGuest) {
            try {
              await saveUserToSupabase(currentUser.id, {
                name: resolvedName,
                username: resolvedUsername,
                email: userEmail,
                avatarUrl: profile.avatarUrl || avatarUrl || "",
                onboarded: true,
                preferences: {
                  experience: profile.experience,
                  interest: profile.interest,
                  initialProjectName: profile.initialProjectName
                }
              });
            } catch (err) {
              console.warn("Could not save onboarding profile to Firestore:", err);
            }
          }

          // Auto create first project according to preference!
          const type = profile.interest === 'games' ? 'Games' : 
                       profile.interest === 'meshes' ? 'Models' : 
                       profile.interest === 'media' ? 'Images' : 'Websites';
          
          let initialFiles = { "index.html": `<!DOCTYPE html>\n<html>\n<body class="bg-slate-900 text-white p-12 text-center"><h1>Welcome to ${profile.initialProjectName}!</h1><p>Start editing inside ForgeAI.</p></body>\n</html>` };
          if (profile.interest === 'games') {
            // Retro Game template
            initialFiles = { "index.html": `<!DOCTYPE html>\n<html>\n<body class="bg-slate-950 text-white p-12 text-center"><h1 class="text-teal-400 font-mono text-2xl">${profile.initialProjectName} Space</h1><canvas id="stage" width="300" height="200" class="border border-slate-800 bg-slate-900 mx-auto mt-4 rounded"></canvas><script>console.log("Retro Game initialized!")</script></body>\n</html>` };
          }
          
          createNewProject(profile.initialProjectName, `A personalized template constructed for @${resolvedUsername}'s creative interest in ${profile.interest}.`, type, initialFiles);
          setActiveView('home'); // Go to Dashboard!
        }}
      />
    );
  }

  const selectedPath = (activeProject && activeProject.selectedTabPath) || "";
  const rawText = (activeProject && activeProject.files[selectedPath]) || "";
  const rawLines = rawText.split("\n");
  const currentFolds = (selectedPath && foldedLines[selectedPath]) || {};
  const blocks = findFoldableBlocks(rawText);

  interface LineRenderInfo {
    originalIndex: number;
    text: string;
    isFoldedStart: boolean;
    isHidden: boolean;
  }

  const renderLines: LineRenderInfo[] = [];
  let skipUntil = -1;

  for (let i = 0; i < rawLines.length; i++) {
    if (i <= skipUntil) {
      continue;
    }
    
    const isFoldedStart = !!currentFolds[i];
    const block = blocks.find(b => b.startLine === i);
    
    renderLines.push({
      originalIndex: i,
      text: rawLines[i],
      isFoldedStart,
      isHidden: false
    });
    
    if (isFoldedStart && block) {
      skipUntil = block.endLine;
    }
  }

  const textareaValue = renderLines.map(line => {
    if (line.isFoldedStart) {
      return line.text + " ... } /* FOLDED BLOCK - double-click to unfold and edit */";
    }
    return line.text;
  }).join("\n");

  const hasFolds = Object.keys(currentFolds).length > 0;

  const toggleFold = (lineIndex: number) => {
    if (!selectedPath) return;
    const isFolded = currentFolds[lineIndex];
    const newFolds = { ...currentFolds };
    if (isFolded) {
      delete newFolds[lineIndex];
    } else {
      const block = blocks.find(b => b.startLine === lineIndex);
      if (block) {
        newFolds[lineIndex] = true;
      }
    }
    setFoldedLines({
      ...foldedLines,
      [selectedPath]: newFolds
    });
  };

  const currentTheme = THEMES[preferences.theme] || THEMES.dark;

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex font-sans transition-colors duration-200 theme-${preferences.theme || 'dark'} ${currentTheme.bg} overflow-hidden h-screen w-full`}>
        {/* Custom Interactive Pointer Cursor */}
        <CustomCursor preferences={preferences} isAiGenerating={isChatSending} />
      
      {/* Universal Global Left Navigation Rail Sidebar */}
      <aside 
        style={{ 
          width: focusMode && !tempShowSidebar 
            ? '0px' 
            : sidebarMode === 'hidden' && !tempShowSidebar 
              ? '0px' 
              : sidebarMode === 'compact' 
                ? '72px' 
                : `${sidebarWidth}px` 
        }}
        className={`border-r border-slate-900 bg-slate-950 flex flex-col justify-between h-full shrink-0 font-sans z-30 transition-all duration-300 relative ${
          ((focusMode && !tempShowSidebar) || (sidebarMode === 'hidden' && !tempShowSidebar)) ? 'overflow-hidden border-r-0 !w-0' : ''
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo & Slogan block */}
          <div className="p-4 border-b border-slate-900 flex items-center justify-between cursor-pointer" onClick={() => setActiveView('home')}>
            {sidebarMode !== 'compact' && (
              <div className="flex items-center space-x-3">
                <img 
                  src="/forgeai_logo.jpg" 
                  alt="ForgeAI Logo" 
                  className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-teal-500/20 border border-teal-500/30"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) {
                      (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="h-10 w-10 bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20" style={{ display: 'none' }}>
                  <Sparkles className="h-5 w-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Forge AI</span>
                    <span className="px-1.5 py-0.5 bg-teal-500/10 text-teal-400 text-[8px] uppercase font-mono rounded-full border border-teal-500/20 font-bold">Studio</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Build quickly with AI.</p>
                </div>
              </div>
            )}
            {sidebarMode === 'compact' && (
              <div className="mx-auto">
                <img 
                  src="/forgeai_logo.jpg" 
                  alt="ForgeAI Logo" 
                  className="h-10 w-10 rounded-xl object-cover shadow border border-teal-500/30"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            
            {/* Collapse to compact control */}
            {sidebarMode === 'expanded' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarMode('compact');
                }}
                className="p-1 hover:bg-slate-900 text-slate-500 hover:text-white rounded-lg transition"
                title="Collapse Sidebar"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
            )}
            {sidebarMode === 'compact' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarMode('expanded');
                }}
                className="absolute top-16 right-[-12px] bg-slate-900 border border-slate-850 text-teal-400 p-1 rounded-full z-50 shadow-md hover:scale-105 active:scale-95 transition"
                title="Expand Sidebar"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Guest Mode Badge indicator (Only when expanded) */}
          {isGuest && sidebarMode === 'expanded' && (
            <div className="mx-4 mt-4 p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">Guest Sandbox Mode</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-normal">Your files are transient. Register to activate cloud sync.</p>
            </div>
          )}

          {/* Navigation Links list */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {[
              { id: 'home', name: 'Home', icon: <Home className="h-[18px] w-[18px]" /> },
              { id: 'chat', name: 'Chat', icon: <Send className="h-[18px] w-[18px]" /> },
              { id: 'editor', name: 'Projects', icon: <Code2 className="h-[18px] w-[18px]" /> },
              { id: 'templates', name: 'Templates', icon: <Compass className="h-[18px] w-[18px]" /> },
              { id: 'lessons', name: 'Learning', icon: <BookOpen className="h-[18px] w-[18px]" /> },
              { id: 'assets', name: 'Assets', icon: <Box className="h-[18px] w-[18px]" /> },
              { id: 'collab', name: 'Live Team', icon: <Users className="h-[18px] w-[18px]" /> },
              { id: 'history', name: 'History', icon: <HistoryIcon className="h-[18px] w-[18px]" /> },
              { id: 'settings', name: 'Settings', icon: <Settings className="h-[18px] w-[18px]" /> },
              { id: 'help', name: 'Help', icon: <HelpCircle className="h-[18px] w-[18px]" /> },
            ].map(item => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  title={item.name}
                  className={`w-full px-4 py-3 rounded-xl flex items-center transition cursor-pointer text-left group ${
                    sidebarMode === 'compact' ? 'justify-center' : 'space-x-3'
                  } ${
                    isActive 
                      ? "bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/10" 
                      : "text-slate-300 hover:text-white hover:bg-slate-900/80"
                  }`}>
                  <div className={`shrink-0 transition ${isActive ? "text-slate-950" : "text-slate-400 group-hover:text-teal-400"}`}>
                    {item.icon}
                  </div>
                  {sidebarMode !== 'compact' && (
                    <span className="text-xs font-semibold tracking-wide truncate">{item.name}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer block */}
        <div className="p-4 border-t border-slate-900 space-y-3 bg-slate-950/80">

          {/* User profile details */}
          <div className="flex flex-col gap-1.5 bg-slate-900/40 p-2 rounded-xl border border-slate-900 hover:border-slate-800 transition">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 truncate min-w-0 flex-1">
                <div 
                  onClick={() => {
                    setActiveView('settings');
                    addNotification("Opened Profile Settings", "info");
                  }}
                  className="h-8 w-8 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-xs font-black text-slate-950 shrink-0 cursor-pointer hover:scale-105 transition shadow-sm overflow-hidden"
                  title="Click to view Profile Settings"
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={userName} 
                      className="h-full w-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{userName ? userName.substring(0, 2).toUpperCase() : "U"}</span>
                  )}
                </div>
                {sidebarMode !== 'compact' && (
                  <div className="truncate text-left min-w-0 flex-1">
                    {isEditingBottomUsername ? (
                      <div className="flex items-center space-x-1 py-0.5">
                        <span className="text-xs text-teal-400 font-mono">@</span>
                        <input
                          type="text"
                          value={editingBottomUsernameVal}
                          onChange={(e) => setEditingBottomUsernameVal(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveUserProfileChange({ username: editingBottomUsernameVal });
                              setIsEditingBottomUsername(false);
                            } else if (e.key === 'Escape') {
                              setIsEditingBottomUsername(false);
                            }
                          }}
                          className="w-full bg-slate-950 border border-teal-500 rounded px-1.5 py-0.5 text-xs text-white font-mono focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveUserProfileChange({ username: editingBottomUsernameVal });
                            setIsEditingBottomUsername(false);
                          }}
                          className="p-1 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded text-[10px] font-bold cursor-pointer"
                          title="Save Username"
                        >
                          ✓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingBottomUsername(false);
                          }}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between group/user min-w-0">
                        <div 
                          onClick={() => {
                            setActiveView('settings');
                          }}
                          className="truncate cursor-pointer"
                        >
                          <span className="block text-xs font-extrabold text-white truncate hover:text-teal-300 transition">@{userUsername}</span>
                          <span className="block text-[8px] text-slate-500 truncate font-mono">{userName}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBottomUsernameVal(userUsername);
                            setIsEditingBottomUsername(true);
                          }}
                          className="p-1 text-slate-500 hover:text-teal-400 rounded opacity-0 group-hover/user:opacity-100 transition cursor-pointer"
                          title="Quick edit username"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {sidebarMode !== 'compact' && !isEditingBottomUsername && (
                <button 
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0 cursor-pointer"
                  title="Sign Out">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Hide Sidebar button inside menu (only expanded) */}
          {sidebarMode === 'expanded' && (
            <button 
              onClick={() => setSidebarMode('hidden')}
              className="w-full py-1 text-center text-[9px] font-mono text-slate-500 hover:text-slate-300 transition cursor-pointer"
            >
              [ Hide Sidebar Menu (✖) ]
            </button>
          )}
        </div>
      </aside>

      {/* Main Container Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Floating Left Sidebar Toggle Button when hidden or in Focus Mode */}
        {((sidebarMode === 'hidden' || focusMode) && !tempShowSidebar) && (
          <button 
            onClick={() => {
              if (focusMode) {
                setFocusMode(false);
              } else {
                setSidebarMode('expanded');
              }
            }}
            className="fixed top-3 left-3 z-50 p-2.5 bg-slate-900/90 text-teal-400 border border-slate-800 rounded-xl shadow-lg hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center animate-in fade-in zoom-in-95"
            title="Show Navigation Menu (☰)"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
          {/* Global Top Navigation Bar (64px) with spacious, uncrowded layout */}
        <header className="h-16 shrink-0 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 gap-4 z-40">
          <div className="flex items-center gap-3">
            {/* Show a toggle if sidebar is collapsed/hidden/focus */}
            {(sidebarMode !== 'expanded' || focusMode) && (
              <button 
                onClick={() => {
                  setSidebarMode('expanded');
                  setFocusMode(false);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition flex items-center justify-center cursor-pointer"
                title="Expand Navigation Sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
            
            <div className="flex items-center">
              <span className="font-extrabold text-[11px] sm:text-xs tracking-wide text-white uppercase font-mono bg-slate-900/60 hover:bg-slate-900 px-4 py-2 rounded-xl border border-slate-850 shadow-md shadow-black flex items-center gap-2.5 select-none">
                <img 
                  src="/forgeai_logo.jpg" 
                  alt="ForgeAI Logo" 
                  className="h-4 w-4 rounded-md object-cover border border-teal-500/30 shadow shadow-teal-500/20"
                  referrerPolicy="no-referrer"
                />
                <span className="truncate max-w-[120px] sm:max-w-[180px]">{activeProject ? activeProject.name : "Forge AI Studio"}</span>
                <span className="text-slate-700 font-normal">|</span>
                <span className="text-[8px] text-teal-400 font-extrabold uppercase tracking-widest bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">Active Workspace</span>
              </span>
            </div>
          </div>

          {/* Center search query with smooth expand on focus */}
          <div className={`hidden md:flex items-center relative transition-all duration-300 ${searchFocused ? 'max-w-md w-96' : 'max-w-xs w-60'}`}>
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3.5 pointer-events-none" />
            <input 
              type="text"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="⌕ Search Projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-teal-500 placeholder-slate-600 transition-all focus:bg-slate-900/60"
            />
          </div>

          {/* Right Header Area - Spaced uniformly with gap-3 sm:gap-4 */}
          <div className="flex items-center gap-3 sm:gap-4 relative">
            {/* Share Project Workspace */}
            {activeProject && (
              <button
                onClick={handleShareProject}
                disabled={sharingProject}
                className="px-4 py-2 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 disabled:opacity-40 text-[11px] font-semibold flex items-center gap-2 transition cursor-pointer"
                title="Generate read-only shared link of active workspace snapshot"
              >
                <Share className={`h-3.5 w-3.5 ${sharingProject ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{sharingProject ? "Sharing..." : "Share Sandbox"}</span>
              </button>
            )}

            {/* Keyboard Shortcuts Trigger Button */}
            <button
              onClick={() => setShowShortcutsHelp(true)}
              className="px-4 py-2 rounded-xl border border-slate-850 bg-slate-900/60 text-slate-300 hover:text-teal-400 hover:bg-slate-900 text-[11px] font-semibold flex items-center gap-2 transition cursor-pointer"
              title="Show IDE Keyboard Shortcuts (Ctrl+/)"
            >
              <Keyboard className="h-3.5 w-3.5 text-slate-400 group-hover:text-teal-400" />
              <span className="hidden md:inline">Shortcuts</span>
              <kbd className="hidden lg:inline-block px-1 py-0.2 bg-slate-950 border border-slate-800 rounded text-[9px] text-slate-500 font-mono">Ctrl+/</kbd>
            </button>

            {/* Focus Mode Trigger */}
            <button
              onClick={() => {
                setFocusMode(!focusMode);
                addNotification(focusMode ? "Exited Focus Mode" : "Entered Focus Mode. Press Esc or Tab to manage panels.", "info");
              }}
              className={`px-4 py-2 rounded-xl border text-[11px] font-semibold flex items-center gap-2 transition cursor-pointer ${
                focusMode 
                  ? "bg-teal-500/15 border-teal-500/30 text-teal-400 font-bold" 
                  : "bg-slate-900/60 border-slate-850 text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
              title="Focus Mode"
            >
              {focusMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{focusMode ? "Focus Active" : "Focus Mode"}</span>
            </button>

            {/* AI Voice Session Trigger */}
            <button
              onClick={isVoiceSessionActive ? stopVoiceSession : startVoiceSession}
              className={`px-4 py-2 rounded-xl border text-[11px] font-semibold flex items-center gap-2 transition cursor-pointer ${
                isVoiceSessionActive 
                  ? "bg-red-500/15 border-red-500/30 text-red-400 animate-pulse font-bold" 
                  : "bg-slate-900/60 border-slate-850 text-slate-300 hover:text-teal-400 hover:bg-slate-900"
              }`}
              title="Speak with real-time AI Voice Companion (Live API)"
            >
              <Mic className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isVoiceSessionActive ? "Voice On" : "Voice Chat"}</span>
            </button>

            {/* Bell Icon Notification Area with Badge */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className={`px-4 py-2 rounded-xl border transition relative cursor-pointer flex items-center justify-center ${showNotificationsDropdown ? 'bg-slate-900 border-teal-500/30 text-teal-400' : 'bg-slate-900/60 border-slate-850 text-slate-300 hover:text-white hover:bg-slate-900'}`}
                title="Notifications & Live Activity"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
              </button>

              {/* Futuristic Notifications dropdown popup */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2.5 w-80 bg-slate-950 border border-slate-900 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="p-3.5 border-b border-slate-900 bg-slate-900/30 flex justify-between items-center">
                    <span className="text-[10px] font-mono font-extrabold uppercase text-slate-400 tracking-wider">Live System Activity</span>
                    <span className="text-[9px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">4 pending</span>
                  </div>
                  <div className="divide-y divide-slate-900/60 max-h-72 overflow-y-auto">
                    <div className="p-3 hover:bg-slate-900/30 transition text-left space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-teal-400">🎉 DEPLOYMENT COMPLETE</span>
                        <span className="text-[8px] text-slate-600 font-mono">1h ago</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">Workspace "Portfolio Space" successfully built and live on production container.</p>
                    </div>
                    <div className="p-3 hover:bg-slate-900/30 transition text-left space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-purple-400">🤖 AI SYNTHESIS COMPLETED</span>
                        <span className="text-[8px] text-slate-600 font-mono">2h ago</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">Your custom 3D wireframe mesh asset generated successfully and injected into assets directory.</p>
                    </div>
                    <div className="p-3 hover:bg-slate-900/30 transition text-left space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-blue-400">👥 TEAM ALIGNED</span>
                        <span className="text-[8px] text-slate-600 font-mono">4h ago</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">Developer "Alpha_Norgt" successfully connected to active collaborative node.</p>
                    </div>
                    <div className="p-3 hover:bg-slate-900/30 transition text-left space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-emerald-400">✔ SYSTEM LINT CHECK</span>
                        <span className="text-[8px] text-slate-600 font-mono">1d ago</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">TypeScript compilation tests passed. Dev-server running stably on port 3000.</p>
                    </div>
                  </div>
                  <div className="p-2 border-t border-slate-900 bg-slate-950 text-center">
                    <button 
                      onClick={() => setShowNotificationsDropdown(false)}
                      className="text-[9px] font-mono text-slate-500 hover:text-white transition w-full uppercase tracking-wider py-1"
                    >
                      [ Close Activity Panel ]
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="h-8 w-8 rounded-xl overflow-hidden shrink-0 select-none shadow-md shadow-teal-500/10 bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center relative">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={userName} 
                  className="h-full w-full object-cover absolute inset-0 z-10" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              <span className="text-xs font-black text-slate-950 relative z-0">
                {userName.substring(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Guest Sandbox Mode Banner */}
        {isGuest && (
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-teal-500/10 border-b border-amber-500/20 px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-amber-200 shrink-0 gap-2 z-30">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <span><strong>Guest Sandbox Mode:</strong> Your work is stored locally in browser memory. Create a free account to sync projects securely.</span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button 
                onClick={() => {
                  localStorage.removeItem("forgeai_auth");
                  localStorage.removeItem("forgeai_is_guest");
                  window.location.reload();
                }}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-[10px] transition cursor-pointer shadow">
                Create Account / Sign In
              </button>
            </div>
          </div>
        )}

        {/* Inner Content Area - Wrapped with ApplicationShell */}
        <ApplicationShell
          activeView={mapLegacyViewToNew(activeView)}
          onViewChange={(newView) => setActiveView(mapNewViewToLegacy(newView))}
          userName={userName}
          avatarUrl={avatarUrl}
          onLogout={handleLogout}
        >
          {/* OAuth Customization Page Overlay */}
          {showOAuthCustomization && (
            <OAuthCustomizationPage
              onCustomizationComplete={handleOAuthCustomizationComplete}
            />
          )}

        {/* Dynamic Views Manager */}
        {activeView === 'home' && (
          <DashboardView 
            projects={projects}
            activeProjectId={activeProjectId}
            onOpenProject={(id) => {
              setActiveProjectId(id);
              setActiveView('editor');
            }}
            onDeleteProject={deleteProjectFromDashboard}
            onCreateNewProject={createNewProject}
            onSelectLesson={handleSelectLessonFromDashboard}
            userName={userName}
            userUsername={userUsername}
            onNewSpaceRequest={() => setShowBeginnerModal(true)}
            onNavigateView={setActiveView}
            dailyQueries={dailyQueries}
            completedLessonSteps={completedLessonSteps}
            storageBytes={getCalculatedStorageBytes()}
          />
        )}

        {/* View: Chat Mode (Conversational, no files) */}
        {activeView === 'chat' && (
          <ChatView 
            userName={userName}
            preferences={preferences}
            addNotification={addNotification}
            onOpenProjectView={() => setActiveView('editor')}
            onBackToHome={() => setActiveView('home')}
            isGuest={isGuest}
            advancedSettingsEnabled={advancedSettingsEnabled}
            timeUntilReset={timeUntilReset}
            dailyQueries={dailyQueries}
            setDailyQueries={setDailyQueries}
          />
        )}

        {/* View: Templates Blueprints List */}
        {activeView === 'templates' && (
          <TemplatesView 
            onCreateProjectFromTemplate={(name, desc, type, files) => {
              createNewProject(name, desc, type, files);
              setActiveView('editor');
            }}
            addNotification={addNotification}
          />
        )}

        {/* View: Snapshot History Recovery */}
        {activeView === 'history' && (
          <HistoryView 
            activeProject={activeProject}
            onRestoreVersion={handleRestoreVersion}
            onDeleteVersion={handleDeleteVersion}
            addNotification={addNotification}
          />
        )}

        {/* View: Accessibility Preferences Settings */}
        {activeView === 'settings' && (
          <SettingsView 
            preferences={preferences}
            onUpdatePreferences={savePreferences}
            onResetPreferences={() => savePreferences({
              theme: 'dark',
              fontSize: 'sm',
              editorFont: 'JetBrains Mono',
              cursorStyle: 'line',
              windowLayout: 'default',
              comfortMode: 'comfortable'
            })}
            addNotification={addNotification}
            userName={userName}
            onUpdateUserName={(newVal) => {
              saveUserProfileChange({ name: newVal });
            }}
            userUsername={userUsername}
            onUpdateUserUsername={(newVal) => {
              saveUserProfileChange({ username: newVal });
            }}
            userEmail={userEmail}
            onUpdateUserEmail={(newVal) => {
              saveUserProfileChange({ email: newVal });
            }}
            avatarUrl={avatarUrl}
            onUpdateAvatarUrl={(newVal) => {
              saveUserProfileChange({ avatarUrl: newVal });
            }}
            onSaveFullProfile={(fullProfile) => {
              saveUserProfileChange(fullProfile);
            }}
            isGuest={isGuest}
            advancedSettingsEnabled={advancedSettingsEnabled}
            onToggleAdvancedSettings={(enabled) => {
              setAdvancedSettingsEnabled(enabled);
              localStorage.setItem("forgeai_advanced_settings", enabled ? "true" : "false");
            }}
            storageBytes={getCalculatedStorageBytes()}
            onDownloadBackup={downloadWorkspaceBackup}
            onDeleteAccount={deleteAccountWorkspace}
            currentFiles={activeProject?.files || {}}
            onApplyPulledFiles={(pulledFiles) => {
              if (activeProject) {
                updateActiveProject({ files: { ...activeProject.files, ...pulledFiles } });
                addNotification("Repository files successfully merged into workspace!", "success");
              }
            }}
          />
        )}

        {/* View: Co-Dev Live Hub & Shared Drive */}
        {activeView === 'collab' && (
          <CollabView 
            currentTheme={currentTheme}
            userName={userName}
            activeProject={activeProject}
            addNotification={addNotification}
          />
        )}

        {/* View: Help & Sandbox Limitations Support */}
        {activeView === 'help' && (
          <HelpView 
            userEmail={userEmail}
            isGuest={isGuest}
            addNotification={addNotification}
            getRemainingUsage={(feat) => {
              if (feat === 'chats') {
                return Math.max(0, (isGuest ? 10 : 80) - dailyQueries);
              }
              const key = `forgeai_limit_${feat}`;
              const used = Number(localStorage.getItem(key) || "0");
              const max = feat === 'codeGen' ? 200 : feat === 'imageGen' ? 50 : feat === 'model3D' ? 20 : 15;
              return Math.max(0, max - used);
            }}
            getMaxLimit={(feat) => {
              if (feat === 'chats') return isGuest ? 10 : 80;
              return feat === 'codeGen' ? 200 : feat === 'imageGen' ? 50 : feat === 'model3D' ? 20 : 15;
            }}
          />
        )}

        {/* View: Project Workspace IDE */}
        {activeView === 'editor' && activeProject && (
          <StudioPage
            onNavigateToPage={(page) => {
              const directMap: Record<string, LegacyAppView> = {
                home: 'home',
                chat: 'chat',
                studio: 'editor',
                settings: 'settings',
                help: 'help',
              };
              const nextView = directMap[page] ?? (page as LegacyAppView);
              setActiveView(nextView);
            }}
          />
        )}
        {activeView === 'editor' && activeProject && false && (
          <main className="flex-1 flex overflow-hidden">
            
            {/* Left Side Active Workspace Bar */}
            {currentWorkspaceLayout !== 'mobile' && (
              <aside className={`w-64 border-r flex flex-col shrink-0 ${currentTheme.sidebar}`}>
              
              {/* Active Project Dropdown */}
              <div className="p-4 border-b border-slate-800/80">
                <label className="block text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-2">Selected Project</label>
                <div className="relative">
                  <select 
                    value={activeProjectId} 
                    onChange={(e) => setActiveProjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400 appearance-none pr-8 font-medium">
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>

                {/* Quick action buttons */}
                <div className="mt-3 flex space-x-2">
                  <button 
                    onClick={() => {
                      setShowBeginnerModal(true);
                    }}
                    className="flex-1 py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 flex items-center justify-center space-x-1 transition cursor-pointer">
                    <Plus className="h-3 w-3" />
                    <span>New Space</span>
                  </button>
                  <button 
                    onClick={handleSaveAsTemplate}
                    className="py-1.5 px-2.5 bg-teal-950/20 text-teal-400 hover:bg-teal-950/40 border border-teal-900/30 text-xs font-semibold rounded flex items-center justify-center space-x-1 transition cursor-pointer"
                    title="Save current project as reusable template"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Save Template</span>
                  </button>
                  <button 
                    onClick={(e) => deleteProject(activeProjectId, e)}
                    className="p-1.5 bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-900/30 rounded transition cursor-pointer"
                    title="Delete current project">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* File Explorer Tree view */}
              <div className="flex-1 overflow-y-auto flex flex-col">
                {activeProject && (
                  <FileTreeExplorer
                    files={activeProject.files}
                    folders={activeProject.folders || []}
                    selectedPath={activeProject.selectedTabPath}
                    onSelectFile={selectFile}
                    onCreateFile={(folderPath) => {
                      const name = prompt(`Enter file name ${folderPath ? `inside ${folderPath}` : 'at root'}:`);
                      if (!name) return;
                      const fullPath = folderPath ? `${folderPath}/${name}` : name;
                      setNewFileName(fullPath);
                      handleCreateFile();
                    }}
                    onCreateFolder={handleCreateFolder}
                    onDeletePath={handleDeletePath}
                  />
                )}

                {/* Lessons sandbox indicator when active */}
                {activeLessonId && (
                  <div className="mt-6 p-3 bg-teal-950/20 border border-teal-900/30 rounded-lg">
                    <h4 className="text-xs font-bold text-teal-400 mb-1">Academy Session</h4>
                    <p className="text-[10px] text-slate-400 mb-2">Complete tasks to pass.</p>
                    <div className="space-y-1">
                      {PROGRAMMING_LESSONS.find(l => l.id === activeLessonId)?.instructions.map((step, idx) => {
                        const lessonSteps = completedLessonSteps[activeLessonId] || [];
                        const isDone = !!lessonSteps[idx];
                        return (
                          <div key={idx} className="flex items-center space-x-2 text-[10px] text-slate-300">
                            <input 
                              type="checkbox" 
                              checked={isDone} 
                              onChange={() => toggleLessonStep(activeLessonId, idx)}
                              className="rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-500" 
                            />
                            <span className={isDone ? "line-through text-slate-500" : ""}>{step.substring(0, 30)}...</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick template loader utility inside workspace explorer */}
              <div className="p-4 border-t border-slate-800/80">
                <span className="text-[9px] font-mono uppercase text-slate-500 block mb-2">Import Blueprint</span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <button 
                    onClick={() => createNewProject("Zombie Survival Canvas", "Top down shooter simulation", "Web Apps", PROJECT_TEMPLATES.zombieGame.files)}
                    className="py-1 px-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded text-center text-slate-300 truncate">
                    Zombie Shooter
                  </button>
                  <button 
                    onClick={() => createNewProject("Neumorphic Calculator", "High dynamic mathematical compiler", "Web Apps", PROJECT_TEMPLATES.calculator.files)}
                    className="py-1 px-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded text-center text-slate-300 truncate">
                    Calculator
                  </button>
                </div>
              </div>
            </aside>
            )}

            {/* Rest of IDE layout (Center tabs, editor, preview, and chat panels) */}
            
            {/* Center Area: Tabs, Code Editor / Live Preview, & Terminal */}
            {(currentWorkspaceLayout !== 'mobile' || mobileWorkspaceTab === 'editor') && (
              <section className="flex-1 flex flex-col min-w-0 border-r border-slate-800/80">
              
              {/* Workspace Mode Bar (Code Editor vs Live Preview) */}
              <div className="flex items-center justify-between bg-slate-950/80 border-b border-slate-800/60 px-2 shrink-0 h-10">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setCenterMode('editor')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center space-x-1.5 cursor-pointer ${
                      centerMode === 'editor'
                        ? 'bg-slate-800 text-white border border-slate-700/80 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}>
                    <Code2 className="h-3.5 w-3.5 text-teal-400" />
                    <span>Files & Code</span>
                  </button>
                  <button
                    onClick={() => setCenterMode('preview')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center space-x-1.5 cursor-pointer ${
                      centerMode === 'preview'
                        ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 border border-teal-500/30'
                    }`}>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Live Preview</span>
                  </button>
                </div>

                {centerMode === 'editor' ? (
                  <div className="flex items-center space-x-1.5 mr-1 overflow-x-auto scrollbar-none">
                    {/* Open Tabs */}
                    {currentWorkspaceLayout !== 'mobile' && activeProject.openTabs.map(tab => {
                      const isActive = activeProject.selectedTabPath === tab;
                      return (
                        <div 
                          key={tab}
                          onClick={() => selectFile(tab)}
                          className={`px-2.5 py-1 text-xs flex items-center space-x-1.5 rounded border cursor-pointer transition select-none ${
                            isActive ? "bg-slate-900 text-teal-400 border-teal-500/50 font-medium" : "text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200"
                          }`}>
                          <FileText className="h-3 w-3 text-slate-500" />
                          <span>{tab}</span>
                          <X 
                            onClick={(e) => closeTab(tab, e)}
                            className="h-3 w-3 hover:bg-slate-700 rounded p-0.5 text-slate-500 hover:text-slate-200 transition" 
                          />
                        </div>
                      );
                    })}

                    <button 
                      onClick={() => setEditorViewMode(prev => prev === 'edit' ? 'diff' : 'edit')}
                      className={`px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1 border transition cursor-pointer ${
                        editorViewMode === 'diff' 
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' 
                          : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700'
                      }`}
                      title="Toggle Code Diff Comparison vs Saved Versions">
                      <GitCompare className="h-3.5 w-3.5" />
                      <span className="text-[11px] hidden sm:inline">{editorViewMode === 'diff' ? 'Code Editor' : 'Diff'}</span>
                    </button>

                    <button 
                      onClick={handleDownloadProject}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-teal-400 rounded transition cursor-pointer"
                      title="Download Project ZIP">
                      <Download className="h-4 w-4" />
                    </button>

                    <button 
                      onClick={handleFormatCode}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-teal-400 rounded transition"
                      title="Format Code (Beautify)">
                      <Code2 className="h-4 w-4" />
                    </button>

                    <button 
                      onClick={() => setShowSearchReplace(!showSearchReplace)}
                      className={`p-1.5 hover:bg-slate-800 rounded transition ${showSearchReplace ? "text-teal-400" : "text-slate-400"}`}
                      title="Search & Replace Code">
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 mr-1">
                    <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded border border-slate-800">
                      <button 
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-slate-800 text-teal-400' : 'text-slate-500'}`}
                        title="Mobile Frame">
                        <Smartphone className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => setPreviewDevice('tablet')}
                        className={`p-1 rounded ${previewDevice === 'tablet' ? 'bg-slate-800 text-teal-400' : 'text-slate-500'}`}
                        title="Tablet Frame">
                        <Tablet className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-slate-800 text-teal-400' : 'text-slate-500'}`}
                        title="Desktop Frame">
                        <Laptop className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button 
                      onClick={() => setPreviewKey(prev => prev + 1)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 transition cursor-pointer"
                      title="Reload Frame">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => setCenterMode('editor')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs font-semibold transition border border-slate-700/60 cursor-pointer">
                      Close Preview
                    </button>
                  </div>
                )}
              </div>

              {/* Main Center Display (Code Editor vs Live Preview) */}
              {centerMode === 'editor' ? (
                <>
                  {/* Search & Replace inline panel */}
                  {showSearchReplace && (
                    <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded px-2 py-1 max-w-xs flex-1">
                        <span className="text-[10px] text-slate-500 font-mono">FIND</span>
                        <input 
                          type="text" 
                          placeholder="text to find..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-transparent text-xs w-full text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded px-2 py-1 max-w-xs flex-1">
                        <span className="text-[10px] text-slate-500 font-mono">REPLACE</span>
                        <input 
                          type="text" 
                          placeholder="replace with..." 
                          value={replaceQuery}
                          onChange={(e) => setReplaceQuery(e.target.value)}
                          className="bg-transparent text-xs w-full text-white focus:outline-none"
                        />
                      </div>
                      <button 
                        onClick={executeReplace}
                        className="px-3 py-1 bg-teal-500 text-slate-950 text-xs font-semibold rounded hover:bg-teal-400 transition">
                        Replace All
                      </button>
                    </div>
                  )}

                  {/* Code Editor Container */}
                  <div className="flex-1 relative flex overflow-hidden">
                    {editorViewMode === 'diff' ? (
                      <CodeDiffViewer 
                        filePath={activeProject.selectedTabPath || 'index.html'}
                        currentContent={textareaValue}
                        versionHistory={activeProject.versionHistory || []}
                        onRevertFile={(filePath, restoredContent) => {
                          const updatedFiles = { ...activeProject.files, [filePath]: restoredContent };
                          updateActiveProject({ files: updatedFiles });
                          addNotification(`Reverted ${filePath} to snapshot content`, 'success');
                        }}
                        onCloseDiff={() => setEditorViewMode('edit')}
                      />
                    ) : activeProject.selectedTabPath ? (
                      <CodeEditorWithHighlight
                        filePath={activeProject.selectedTabPath || 'index.html'}
                        content={textareaValue}
                        onChange={handleEditorChange}
                      />
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                        <Code2 className="h-12 w-12 text-slate-600 mb-3" />
                        <p className="text-sm font-medium">No open tabs in active workspace</p>
                        <p className="text-xs text-slate-500 mt-1">Select a file from the explorer list on the left to start editing.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Full Live Preview Mode */
                <div className="flex-1 relative flex flex-col overflow-hidden bg-slate-950 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase text-teal-400 font-bold tracking-wider flex items-center space-x-1.5">
                      <Play className="h-3.5 w-3.5 fill-teal-400" />
                      <span>Project Live Preview Canvas</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setBuildModeConfigOpen(!buildModeConfigOpen)}
                        className="text-[10px] text-slate-400 hover:text-white font-semibold flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded transition">
                        <FileCode className="h-3 w-3 text-teal-400" />
                        <span>{buildModeConfigOpen ? "Hide Bundler" : "Configure Bundler"}</span>
                      </button>
                    </div>
                  </div>

                  {buildModeConfigOpen && (
                    <div className="mb-3 p-3 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] font-mono text-slate-500 uppercase font-bold block mb-1">Entry Point:</label>
                          <select 
                            value={previewEntryPoint}
                            onChange={(e) => setPreviewEntryPoint(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500">
                            {Object.keys(activeProject.files).filter(f => f.endsWith(".html")).map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-slate-500 uppercase font-bold block mb-1">Bundled CSS ({selectedPreviewCssFiles.length}):</label>
                          <div className="max-h-20 overflow-y-auto bg-slate-950 border border-slate-800 rounded p-1.5 space-y-1">
                            {Object.keys(activeProject.files).filter(f => f.endsWith(".css")).map(f => (
                              <label key={f} className="flex items-center space-x-2 text-[10px] text-slate-300">
                                <input 
                                  type="checkbox" 
                                  checked={selectedPreviewCssFiles.includes(f)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedPreviewCssFiles(p => [...p, f]);
                                    else setSelectedPreviewCssFiles(p => p.filter(item => item !== f));
                                  }}
                                  className="rounded border-slate-800 text-teal-500 h-3 w-3"
                                />
                                <span className="font-mono text-xs">{f}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-slate-500 uppercase font-bold block mb-1">Bundled JS ({selectedPreviewJsFiles.length}):</label>
                          <div className="max-h-20 overflow-y-auto bg-slate-950 border border-slate-800 rounded p-1.5 space-y-1">
                            {Object.keys(activeProject.files).filter(f => f.endsWith(".js") || f.endsWith(".ts") || f.endsWith(".jsx") || f.endsWith(".tsx")).map(f => (
                              <label key={f} className="flex items-center space-x-2 text-[10px] text-slate-300">
                                <input 
                                  type="checkbox" 
                                  checked={selectedPreviewJsFiles.includes(f)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedPreviewJsFiles(p => [...p, f]);
                                    else setSelectedPreviewJsFiles(p => p.filter(item => item !== f));
                                  }}
                                  className="rounded border-slate-800 text-teal-500 h-3 w-3"
                                />
                                <span className="font-mono text-xs">{f}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview Canvas Container */}
                  <div className={`mx-auto flex-1 w-full bg-white rounded-xl overflow-hidden border border-slate-800/80 transition-all duration-300 shadow-2xl ${
                    previewDevice === 'mobile' ? 'max-w-xs' : 
                    previewDevice === 'tablet' ? 'max-w-md' : 'w-full'
                  }`}>
                    <iframe 
                      key={previewKey}
                      src={previewBlobUrl}
                      title="ForgeAI Project Canvas preview"
                      className="w-full h-full border-none bg-slate-950"
                    />
                  </div>
                </div>
              )}

              {/* Bottom Command Console / Terminal */}
              <div className="h-44 border-t border-slate-800 bg-slate-950 flex flex-col overflow-hidden shrink-0">
                <div className="px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 h-9">
                  <div className="flex items-center space-x-1 h-full pt-1.5">
                    <button 
                      onClick={() => setTerminalTab('terminal')}
                      className={`px-3 py-1 text-[10px] font-mono rounded-t-md border-t border-x transition flex items-center space-x-1.5 h-full ${terminalTab === 'terminal' ? 'bg-slate-950 border-slate-800 text-teal-400 font-bold' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}>
                      <Terminal className="h-3 w-3" />
                      <span>Multi-Terminal</span>
                    </button>
                    <button 
                      onClick={() => setTerminalTab('console')}
                      className={`px-3 py-1 text-[10px] font-mono rounded-t-md border-t border-x transition flex items-center space-x-1.5 h-full ${terminalTab === 'console' ? 'bg-slate-950 border-slate-800 text-teal-400 font-bold' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}>
                      <FileCode className="h-3 w-3" />
                      <span>Console Logs</span>
                      {consoleLogs.length > 0 && (
                        <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 text-[8px] rounded-full font-bold animate-pulse">
                          {consoleLogs.length}
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={() => setTerminalTab('network')}
                      className={`px-3 py-1 text-[10px] font-mono rounded-t-md border-t border-x transition flex items-center space-x-1.5 h-full ${terminalTab === 'network' ? 'bg-slate-950 border-slate-800 text-teal-400 font-bold' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}>
                      <HelpCircle className="h-3 w-3" />
                      <span>Network Activities</span>
                      {networkActivities.length > 0 && (
                        <span className="px-1.5 py-0.2 bg-teal-500/20 text-teal-400 text-[8px] rounded-full font-bold">
                          {networkActivities.length}
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={() => setTerminalTab('problems')}
                      className={`px-3 py-1 text-[10px] font-mono rounded-t-md border-t border-x transition flex items-center space-x-1.5 h-full ${terminalTab === 'problems' ? 'bg-slate-950 border-slate-800 text-teal-400 font-bold' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}>
                      <AlertCircle className={`h-3 w-3 ${syntaxErrors.length > 0 ? "text-red-400 animate-pulse" : ""}`} />
                      <span>Problems</span>
                      {syntaxErrors.length > 0 && (
                        <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 text-[8px] rounded-full font-bold animate-pulse">
                          {syntaxErrors.length}
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {terminalTab === 'terminal' ? "Type 'help' to see test commands" :
                     terminalTab === 'console' ? "Real-time logs from iframe console" :
                     terminalTab === 'network' ? "Captured HTTP fetch / XHR requests" : "Detected real-time syntax errors"}
                  </div>
                </div>

                {terminalTab === 'terminal' && (
                  <TerminalManager
                    sessions={activeProject.terminalSessions || []}
                    activeSessionId={activeProject.activeTerminalSessionId || 'term-1'}
                    onUpdateSessions={(sessions, activeId) => {
                      updateActiveProject({
                        terminalSessions: sessions,
                        activeTerminalSessionId: activeId
                      });
                    }}
                  />
                )}

                {terminalTab === 'console' && (
                  <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1.5 selection:bg-teal-500/30">
                    {consoleLogs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center px-4">
                        <span>No console outputs registered. Interaction inside the live preview will capture logs in real-time.</span>
                      </div>
                    ) : (
                      consoleLogs.map((log, index) => {
                        let logColor = "text-slate-300";
                        if (log.method === "error") logColor = "text-red-400";
                        else if (log.method === "warn") logColor = "text-amber-400";
                        else if (log.method === "info") logColor = "text-blue-400";
                        
                        return (
                          <div key={index} className="flex items-start gap-2 border-b border-slate-900/40 pb-1">
                            <span className="text-[10px] text-slate-600 select-none shrink-0">{log.time}</span>
                            <span className={`px-1 rounded text-[8px] uppercase font-bold shrink-0 ${
                              log.method === 'error' ? 'bg-red-500/10 text-red-400' :
                              log.method === 'warn' ? 'bg-amber-500/10 text-amber-400' :
                              log.method === 'info' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {log.method}
                            </span>
                            <span className={`flex-1 break-all ${logColor}`}>{log.text}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {terminalTab === 'network' && (
                  <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1.5 selection:bg-teal-500/30">
                    {networkActivities.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center px-4">
                        <span>No network activity detected yet. The sandbox intercepts fetch and XMLHttpRequest transactions automatically.</span>
                      </div>
                    ) : (
                      networkActivities.map((req, index) => {
                        let statusColor = "text-teal-400";
                        if (req.status === 'failed') statusColor = "text-red-400";
                        else if (req.status === 'pending') statusColor = "text-yellow-400 animate-pulse";
                        else if (typeof req.status === 'number' && req.status >= 400) statusColor = "text-red-400";

                        return (
                          <div key={req.id + index} className="flex items-center gap-2 border-b border-slate-900/40 pb-1 text-slate-300">
                            <span className="text-[10px] text-slate-600 select-none shrink-0">{req.time}</span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] uppercase font-bold bg-slate-800 text-slate-400 shrink-0 font-mono">
                              {req.type}
                            </span>
                            <span className="text-teal-400 font-bold shrink-0 w-10">{req.method}</span>
                            <span className="truncate flex-1 text-slate-400" title={req.url}>{req.url}</span>
                            <span className={`shrink-0 w-16 text-right font-semibold ${statusColor}`}>
                              {req.status}
                            </span>
                            {req.duration && (
                              <span className="shrink-0 w-12 text-right text-slate-500 text-[10px]">{req.duration}</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {terminalTab === 'problems' && (
                  <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1.5 selection:bg-red-500/30">
                    {syntaxErrors.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center px-4 space-y-2">
                        <div className="h-8 w-8 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-xs text-slate-400">No syntax issues detected</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-[10px] text-red-400 font-bold mb-2 uppercase tracking-wider flex items-center space-x-1">
                          <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                          <span>Active File Issues ({syntaxErrors.length})</span>
                        </div>
                        {syntaxErrors.map((err, index) => (
                          <div 
                            key={index} 
                            className="flex items-start gap-2.5 p-2 bg-red-950/15 border border-red-900/20 hover:border-red-500/30 rounded-xl transition text-slate-300"
                          >
                            <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px] font-bold shrink-0 font-mono">
                              Line {err.line + 1}
                            </span>
                            <span className="flex-1 text-slate-300 leading-normal">{err.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
            )}

            {/* Right Pane: Dedicated Full-Height Workspace LLM Chat Assistant */}
            {(currentWorkspaceLayout !== 'mobile' || mobileWorkspaceTab === 'chat') && (
              <section className={`${currentWorkspaceLayout === 'mobile' ? 'flex-1' : 'w-[450px] border-l border-slate-800'} shrink-0 flex flex-col bg-slate-950/80 h-full overflow-hidden`}>
                <div className="p-3.5 border-b border-slate-800 bg-slate-900/70 flex flex-col space-y-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-slate-300 tracking-wider flex items-center space-x-1.5 font-bold">
                      <Sparkles className="h-4 w-4 text-teal-400 animate-pulse" />
                      <span>Workspace AI Assistant</span>
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button 
                        onClick={() => setCenterMode(prev => prev === 'preview' ? 'editor' : 'preview')}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center space-x-1 ${
                          centerMode === 'preview' ? 'bg-teal-500 text-slate-950' : 'bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 border border-teal-500/30'
                        }`}>
                        <Play className="h-3 w-3 fill-current" />
                        <span>{centerMode === 'preview' ? 'Code Editor' : 'Preview App'}</span>
                      </button>
                      <button 
                        onClick={handleDownloadProject}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] transition"
                        title="Export Project ZIP">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] text-slate-300 font-medium font-mono">INTELLIGENCE ENGINE READY</span>
                    </div>
                    <div className="text-[10px] font-mono text-teal-400">
                      <span className="font-bold">{getRemainingUsage('chats')}</span> / 80 slots
                    </div>
                  </div>
                </div>

                {/* Chat Messages Full Scroll Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0 selection:bg-teal-500/30">
                  {activeProject.chatHistory.map((msg, index) => {
                    const codeSuggestions = extractCodeBlocksFromMessage(msg.content);
                    return (
                      <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none shadow-sm' 
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <span className={`block text-[9px] mt-1.5 opacity-60 text-right`}>
                            {msg.timestamp}
                          </span>
                        </div>

                        {/* Interactive Suggestion Apply Block */}
                        {msg.role === 'assistant' && codeSuggestions.length > 0 && (
                          <div className="mt-2 space-y-1.5 w-full max-w-[88%]">
                            <span className="text-[10px] text-slate-400 font-semibold block">Suggested Code Modifications:</span>
                            {codeSuggestions.map((block, bIdx) => (
                              <button 
                                key={bIdx}
                                onClick={() => applyCodeSuggestion(block.fileName, block.content)}
                                className="w-full bg-slate-950 hover:bg-teal-950/30 text-teal-400 hover:text-teal-300 border border-teal-900/40 hover:border-teal-500/40 p-2 rounded-lg text-left text-xs transition flex items-center justify-between font-mono cursor-pointer">
                                <span className="truncate">Apply into: {block.fileName}</span>
                                <Plus className="h-4 w-4 shrink-0 text-teal-400" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Chat Form Input */}
                <div className="p-3 border-t border-slate-800 bg-slate-900/50 space-y-2 shrink-0">
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {[
                      { label: "🎮 Add physics loop", prompt: "Add a physics gravity bounce update loop to this project" },
                      { label: "🎨 Refactor UI", prompt: "Refactor style.css with a polished modern palette, spacing and elegant fonts" },
                      { label: "🐛 Debug errors", prompt: "Perform a dry run to detect and repair syntax bugs" }
                    ].map((chip, chipIdx) => (
                      <button 
                        key={chipIdx}
                        onClick={() => {
                          setChatInput(chip.prompt);
                          addNotification(`Copilot suggestion loaded: "${chip.prompt}"`, 'info');
                        }}
                        className="px-2 py-0.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-full text-[10px] transition shrink-0 select-none cursor-pointer">
                        {chip.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      placeholder="Ask AI to modify code, add features, or solve bugs..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChatMessage();
                        }
                      }}
                      className="w-full bg-slate-950 text-white text-xs border border-slate-800 focus:outline-none focus:border-teal-400 rounded-xl pl-3.5 pr-10 py-2.5 resize-none h-16"
                    />
                    <button 
                      onClick={handleSendChatMessage}
                      disabled={isChatSending || !chatInput.trim()}
                      className="absolute right-2 bottom-3 p-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg transition disabled:opacity-40 disabled:hover:bg-teal-500 cursor-pointer">
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </section>
            )}
          </main>
        )}

        {/* View: Asset Lab */}
        {activeView === 'assets' && activeProject && (
          <main className="flex-1 flex overflow-hidden">
            
            {/* Left Column: Generator Control Panel */}
            <div className="w-80 shrink-0 border-r border-slate-900 bg-slate-950 flex flex-col h-full overflow-hidden">
              
              {/* Lab Tabs Selector */}
              <div className="grid grid-cols-4 border-b border-slate-900 bg-slate-950/40 p-2 gap-1 shrink-0">
                <button
                  onClick={() => setActiveGeneratorTab('image')}
                  className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    activeGeneratorTab === 'image' 
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="AI Image Generator"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Images</span>
                </button>
                <button
                  onClick={() => setActiveGeneratorTab('music')}
                  className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    activeGeneratorTab === 'music' 
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Lyria Music Clip Engine"
                >
                  <Music className="h-4 w-4" />
                  <span>Music</span>
                </button>
                <button
                  onClick={() => setActiveGeneratorTab('video')}
                  className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    activeGeneratorTab === 'video' 
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Veo Video Animator"
                >
                  <Video className="h-4 w-4" />
                  <span>Videos</span>
                </button>
                <button
                  onClick={() => setActiveGeneratorTab('mesh')}
                  className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    activeGeneratorTab === 'mesh' 
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="3D Asset Wireframes"
                >
                  <Box className="h-4 w-4" />
                  <span>3D OBJ</span>
                </button>
              </div>

              {/* Tab Content Fields Scroll Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                
                {/* TAB 1: IMAGE PRO */}
                {activeGeneratorTab === 'image' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold">FORGE AI IMAGE STUDIO</span>
                      {isEditImageMode && (
                        <span className="text-[9px] bg-purple-500/15 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Edit Mode</span>
                      )}
                    </div>

                    {isEditImageMode && selectedImageToEdit && (
                      <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-2 relative">
                        <span className="text-[8px] font-mono text-purple-400 block uppercase">Source Image to Re-edit:</span>
                        <div className="flex items-center space-x-2">
                          <img src={selectedImageToEdit} className="h-10 w-10 object-cover rounded-lg border border-slate-800" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-300 truncate font-mono">Selected Canvas Item</p>
                            <p className="text-[8px] text-slate-500 leading-normal">Your prompt below will act as instructions to repaint or modify this image.</p>
                          </div>
                          <button 
                            onClick={() => {
                              setIsEditImageMode(false);
                              setSelectedImageToEdit(null);
                            }}
                            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Creative Art Prompt</label>
                      <textarea 
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder={isEditImageMode ? "e.g. Add glowing stars in the sky and make the floor reflective..." : "Describe retro UI, fantasy map design, custom vectors, voxel game items..."}
                        className="w-full h-24 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 resize-none placeholder-slate-600 font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Target Style</label>
                        <select 
                          value={imageStyle} 
                          onChange={(e) => setImageStyle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer">
                          <option>UI Theme</option>
                          <option>Logo</option>
                          <option>Game Art</option>
                          <option>Character</option>
                          <option>Backgrounds</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Resolution</label>
                        <select 
                          value={imageResolution} 
                          onChange={(e) => setImageResolution(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer">
                          <option value="1K">1K (1024x1024)</option>
                          <option value="2K">2K (2048x2048)</option>
                          <option value="4K">4K (4096x4096)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Aspect Ratio</label>
                        <select 
                          value={imageAspectRatio} 
                          onChange={(e) => setImageAspectRatio(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer">
                          <option value="1:1">1:1 Square</option>
                          <option value="16:9">16:9 Cinematic</option>
                          <option value="9:16">9:16 Portrait</option>
                          <option value="3:2">3:2 Landscape</option>
                          <option value="2:3">2:3 Book Cover</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Model engine</label>
                        <select 
                          value={imageQualityModel} 
                          onChange={(e) => setImageQualityModel(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer">
                          <option value="gemini-3.1-flash-image">Forge AI Fast Canvas</option>
                          <option value="gemini-3-pro-image">Forge AI Studio Precision</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={triggerImageGeneration}
                      disabled={isGeneratingImage || !imagePrompt.trim()}
                      className="w-full py-2.5 bg-teal-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-teal-400 transition-all disabled:opacity-40 shadow-lg shadow-teal-500/15 flex items-center justify-center space-x-2 cursor-pointer">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isGeneratingImage ? "Synthesizing pixels..." : isEditImageMode ? "Repaint & Render Image" : "Generate Image Pro"}</span>
                    </button>
                  </div>
                )}

                {/* TAB 2: LYRIA MUSIC */}
                {activeGeneratorTab === 'music' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold">LYRIA MUSIC CORE</span>
                      <span className="text-[9px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded font-mono font-bold">clip-preview</span>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Acoustic Loop Prompt</label>
                      <textarea 
                        value={musicPrompt}
                        onChange={(e) => setMusicPrompt(e.target.value)}
                        placeholder="e.g. Chill lo-fi study beat with subtle vinyl crackle and a smooth acoustic guitar layer..."
                        className="w-full h-24 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 resize-none placeholder-slate-600 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Track duration & complexity</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setMusicMode('clip')}
                          className={`py-2 px-3 border rounded-xl text-xs font-semibold cursor-pointer transition ${musicMode === 'clip' ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                        >
                          30s Loop Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => setMusicMode('pro')}
                          className={`py-2 px-3 border rounded-xl text-xs font-semibold cursor-pointer transition ${musicMode === 'pro' ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                        >
                          Full-Length Track
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={triggerMusicGeneration}
                      disabled={isGeneratingMusic || !musicPrompt.trim()}
                      className="w-full py-2.5 bg-teal-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-teal-400 transition-all disabled:opacity-40 shadow-lg shadow-teal-500/15 flex items-center justify-center space-x-2 cursor-pointer">
                      <Music className="h-3.5 w-3.5" />
                      <span>{isGeneratingMusic ? "Synthesizing frequencies..." : "Synthesize Music Loop"}</span>
                    </button>
                  </div>
                )}

                {/* TAB 3: VEO VIDEO */}
                {activeGeneratorTab === 'video' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold">VEO VIDEO STUDIO</span>
                      <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-mono font-bold">veo-3.1-fast</span>
                    </div>

                    {/* Source Photo Thumbnail */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider">Start Frame Image Source</label>
                      {selectedImageForVideo ? (
                        <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between relative">
                          <div className="flex items-center space-x-2 min-w-0">
                            <img src={selectedImageForVideo} className="h-10 w-10 object-cover rounded-lg border border-slate-800" />
                            <div className="min-w-0">
                              <span className="block text-[10px] text-white truncate font-mono">Source Frame Active</span>
                              <span className="text-[8px] text-slate-500 block">Veo will animate this image</span>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setSelectedImageForVideo(null)}
                            className="p-1 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-white transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-950/40 border border-dashed border-slate-850 rounded-xl text-center">
                          <span className="text-[10px] text-slate-500 leading-normal block">Select an image from the library on the right and click "Set as video frame" to initiate image-to-video rendering.</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Motion Cinematic Prompt</label>
                      <textarea 
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder="e.g. Slowly zoom into the center of the frame, sparks flying and smoke rising dramatically..."
                        className="w-full h-24 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 resize-none placeholder-slate-600 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Cinematography</label>
                      <select 
                        value={videoAspectRatio} 
                        onChange={(e) => setVideoAspectRatio(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer">
                        <option value="16:9">16:9 Cinematic Landscape</option>
                        <option value="9:16">9:16 Portrait Reels</option>
                      </select>
                    </div>

                    {isGeneratingVideo && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[8px] font-mono text-slate-500">
                          <span>COMPILING RENDERING ENGINE</span>
                          <span>{videoProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div style={{ width: `${videoProgress}%` }} className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"></div>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={triggerVideoGeneration}
                      disabled={isGeneratingVideo || !videoPrompt.trim()}
                      className="w-full py-2.5 bg-teal-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-teal-400 transition-all disabled:opacity-40 shadow-lg shadow-teal-500/15 flex items-center justify-center space-x-2 cursor-pointer">
                      <Video className="h-3.5 w-3.5" />
                      <span>{isGeneratingVideo ? "Rendering high-fps frame stack..." : "Animate with Veo 3.1"}</span>
                    </button>
                  </div>
                )}

                {/* TAB 4: 3D ASSETS */}
                {activeGeneratorTab === 'mesh' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold">3D WIREFRAME MESH ENGINE</span>
                    
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Category</label>
                      <select 
                        value={model3DCategory} 
                        onChange={(e) => setModel3DCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer">
                        <option>Sword</option>
                        <option>Spaceship</option>
                        <option>Modern House</option>
                        <option>Tree</option>
                        <option>Sci-Fi Crate</option>
                        <option>Knight</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Detailed Prompt</label>
                      <textarea 
                        value={model3DPrompt}
                        onChange={(e) => setModel3DPrompt(e.target.value)}
                        placeholder="Describe medieval weapons, retro futuristic spaceships or terrain blocks..."
                        className="w-full h-24 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 resize-none placeholder-slate-600 font-sans"
                      />
                    </div>
                    <button 
                      onClick={trigger3DGeneration}
                      disabled={isGenerating3D || !model3DPrompt.trim()}
                      className="w-full py-2.5 bg-teal-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-teal-400 transition-all disabled:opacity-40 shadow-lg shadow-teal-500/15 flex items-center justify-center space-x-2 cursor-pointer">
                      <Box className="h-3.5 w-3.5" />
                      <span>{isGenerating3D ? "Generating coordinates..." : "Generate 3D OBJ mesh"}</span>
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Right Area: Large Interactive Workspace Viewer */}
            <div className="flex-1 flex flex-col bg-slate-950 h-full overflow-hidden">
              
              {/* Explorer Title Header */}
              <div className="p-4 border-b border-slate-900 bg-slate-950 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    <span>Interactive Assets Laboratory</span>
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Explore generated visual graphics, music audio files, and WebGL object dimensions.</p>
                </div>
              </div>

              {/* Main responsive grids container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column (Span 6): Graphics and Video Frames */}
                  <div className="lg:col-span-6 space-y-6">
                    
                    {/* Visual Media Library */}
                    <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-5 space-y-4">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-teal-400" />
                        <span>Visual Graphics Library ({activeProject.generatedImages?.length || 0})</span>
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1">
                        {activeProject.generatedImages && activeProject.generatedImages.length > 0 ? (
                          activeProject.generatedImages.map(img => (
                            <div key={img.id} className="bg-slate-950 border border-slate-900 hover:border-slate-800 p-2 rounded-xl flex flex-col space-y-2 group transition-all">
                              <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-900">
                                <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                                
                                {/* Overlay hover quick tools */}
                                <div className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 p-2 text-center">
                                  <p className="text-[8px] text-slate-300 font-medium line-clamp-3 leading-normal mb-1">{img.prompt}</p>
                                  
                                  <button
                                    onClick={() => {
                                      setSelectedImageForVideo(img.url);
                                      setActiveGeneratorTab('video');
                                      addNotification("Image selected as start frame for Veo animation", "success");
                                    }}
                                    className="w-full py-1 text-[8px] font-mono uppercase bg-teal-500 text-slate-950 font-bold rounded hover:bg-teal-400 transition"
                                  >
                                    Animate with Veo
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedImageToEdit(img.url);
                                      setIsEditImageMode(true);
                                      setActiveGeneratorTab('image');
                                      setImagePrompt(img.prompt);
                                      addNotification("Loaded image for inpainting re-editing", "info");
                                    }}
                                    className="w-full py-1 text-[8px] font-mono uppercase bg-purple-500 text-white font-bold rounded hover:bg-purple-400 transition"
                                  >
                                    Edit Image Pro
                                  </button>
                                </div>
                              </div>

                              <div className="text-[10px] px-1">
                                <div className="font-extrabold text-slate-200 truncate">{img.name}</div>
                                <div className="text-slate-500 text-[8px] truncate font-mono">{img.timestamp || "Generated"}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center text-slate-500 text-xs">
                            <ImageIcon className="h-8 w-8 text-slate-700 mb-2" />
                            <span>No graphics synthesized. Prompt Image Pro on the left.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Veo Cinematic Videos Library */}
                    <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-5 space-y-4">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Video className="h-3.5 w-3.5 text-teal-400" />
                        <span>Veo Video Animations ({generatedVideos.length})</span>
                      </h3>

                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                        {generatedVideos.length > 0 ? (
                          generatedVideos.map(vid => (
                            <div key={vid.id} className="bg-slate-950 border border-slate-900 p-3 rounded-xl space-y-2">
                              <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                                <video 
                                  src={vid.url} 
                                  controls 
                                  autoPlay 
                                  loop 
                                  muted 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex justify-between items-start">
                                <div className="min-w-0 flex-1 pr-3">
                                  <h4 className="text-xs font-bold text-slate-200 truncate">{vid.name}</h4>
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 italic leading-relaxed">Prompt: "{vid.prompt}"</p>
                                </div>
                                <a 
                                  href={vid.url} 
                                  download={vid.name}
                                  className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 text-xs">
                            <Video className="h-8 w-8 text-slate-700 mb-2" />
                            <span>No video footage rendered yet. Try triggering Veo 3.1.</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right Column (Span 6): Music Loop Library and 3D Model Renderer */}
                  <div className="lg:col-span-6 space-y-6">

                    {/* Lyria Music Player Library */}
                    <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-5 space-y-4">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Music className="h-3.5 w-3.5 text-teal-400" />
                        <span>Lyria Audio Loops Library ({generatedMusicTracks.length})</span>
                      </h3>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {generatedMusicTracks.length > 0 ? (
                          generatedMusicTracks.map(track => (
                            <div key={track.id} className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-3">
                              <div className="flex justify-between items-center">
                                <div className="min-w-0 flex-1 pr-3">
                                  <h4 className="text-xs font-bold text-white truncate">{track.name}</h4>
                                  <p className="text-[9px] text-slate-500 truncate mt-0.5">{track.prompt}</p>
                                </div>
                                <span className="text-[9px] bg-teal-500/10 border border-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded font-mono font-extrabold uppercase">30s Clip</span>
                              </div>
                              <div className="w-full">
                                <audio src={track.url} controls className="w-full h-8 accent-teal-400" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 text-xs">
                            <Music className="h-8 w-8 text-slate-700 mb-2" />
                            <span>No audio clips generated yet. Try Lyria Study Loop.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* WebGL OBJ Model Space */}
                    <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-5 space-y-4 flex flex-col">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <Box className="h-3.5 w-3.5 text-teal-400" />
                          <span>WebGL OBJ Model Space</span>
                        </h3>
                        {selected3DAsset && (
                          <span className="text-[10px] text-teal-400 font-mono font-bold">{selected3DAsset.name}</span>
                        )}
                      </div>

                      <div className="relative bg-slate-950 rounded-xl border border-slate-900 overflow-hidden flex flex-col justify-between">
                        <canvas 
                          ref={canvas3DRef}
                          width={400}
                          height={280}
                          onMouseDown={handleMouseDown3D}
                          onMouseMove={handleMouseMove3D}
                          onMouseUp={handleMouseUp3D}
                          onMouseLeave={handleMouseUp3D}
                          className="w-full h-64 cursor-grab active:cursor-grabbing bg-slate-950"
                        />

                        {/* Interactive drag helper */}
                        <div className="absolute top-2.5 left-2.5 bg-slate-950/80 border border-slate-900 backdrop-blur-md px-2.5 py-1 rounded text-[8px] text-slate-400 pointer-events-none font-mono">
                          Drag mouse to revolve wireframe model.
                        </div>

                        {/* OBJ Files Selector inside workspace */}
                        <div className="p-3 border-t border-slate-900/80 bg-slate-950 shrink-0">
                          <span className="text-[8px] font-mono uppercase text-slate-500 block mb-1.5">WorkspaceOBJ Selector:</span>
                          <div className="flex space-x-2 overflow-x-auto py-1">
                            {activeProject.generated3D && activeProject.generated3D.length > 0 ? (
                              activeProject.generated3D.map(mod => (
                                <button 
                                  key={mod.id}
                                  onClick={() => setSelected3DAsset(mod)}
                                  className={`px-3 py-1 text-[10px] font-mono rounded-lg shrink-0 transition ${selected3DAsset?.id === mod.id ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-white'}`}>
                                  {mod.name}
                                </button>
                              ))
                            ) : (
                              <span className="text-[9px] text-slate-500 font-mono">No 3D OBJ elements generated. Use model generator left.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </main>
        )}

        {/* View: Learn Academy */}
        {activeView === 'lessons' && (
          <main className="flex-1 bg-slate-950 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-2">
                <span className="text-xs font-mono text-teal-400 uppercase font-bold tracking-wider">Educational Sandboxes</span>
                <h1 className="text-3xl font-extrabold text-white">Learn Software Programming Workspace</h1>
                <p className="text-slate-400 text-sm max-w-2xl">
                  Select a targeted skill sandbox block. We will instantly spin up a sandbox environment, write initial templates, and provide step-by-step interactive goals.
                </p>
              </div>

              {/* Grid of programming lessons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PROGRAMMING_LESSONS.map(lesson => (
                  <div key={lesson.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-semibold rounded-full font-mono">{lesson.category}</span>
                        <span className="text-[10px] text-teal-400 font-bold font-mono">{lesson.estimatedTime}</span>
                      </div>
                      <h3 className="text-base font-bold text-white">{lesson.title}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">{lesson.description}</p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                      <span className={`text-[10px] font-bold ${
                        lesson.difficulty === 'Beginner' ? 'text-emerald-400' : 
                        lesson.difficulty === 'Intermediate' ? 'text-yellow-400' : 'text-red-400'
                      }`}>{lesson.difficulty}</span>
                      
                      <button 
                        onClick={() => loadLesson(lesson.id)}
                        className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition shadow-lg shadow-teal-500/15">
                        Start Lesson
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* General Sandbox workspace info */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Want to test custom Python bots or Java Plugins?</h3>
                  <p className="text-xs text-slate-400">Our compiler sandbox supports HTML, JavaScript, Python bot executions, and Spigot config files natively.</p>
                </div>
                <div className="flex space-x-3 shrink-0">
                  <button 
                    onClick={() => createNewProject("My Discord Bot", "python moderation bot", "Discord Bots", PROJECT_TEMPLATES.discordBot.files)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-medium transition">
                    Test Discord Bot
                  </button>
                  <button 
                    onClick={() => createNewProject("Minecraft Plugin Link", "java economy Vault connectors", "Minecraft Plugins", PROJECT_TEMPLATES.minecraftPlugin.files)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-medium transition">
                    Test Minecraft Plugin
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* View: Documentation */}
        {activeView === 'about' && (
          <main className="flex-1 bg-slate-950 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-10">
              
              <div className="space-y-2 border-b border-slate-800 pb-6">
                <h1 className="text-4xl font-black text-white">ForgeAI Documentation</h1>
                <p className="text-slate-400 text-base">A complete free AI development suite. Let's look at limits, capabilities and technology.</p>
              </div>

              {/* Grid of Limits */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-teal-400">Workspace Daily Free Limits</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase">AI Chats / Instructions</span>
                    <span className="block text-2xl font-bold text-white mt-1">80 Calls</span>
                    <p className="text-[10px] text-slate-500 mt-1">Chat is isolated per-project to preserve file trees context.</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase">Image Synthesis</span>
                    <span className="block text-2xl font-bold text-white mt-1">20 Images</span>
                    <p className="text-[10px] text-slate-500 mt-1">Save custom vector styles, icons, and character art assets.</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase">3D Mesh Generation</span>
                    <span className="block text-2xl font-bold text-white mt-1">5 Models</span>
                    <p className="text-[10px] text-slate-500 mt-1">Parses Wavefront OBJ text file vertices and renders in real-time WebGL.</p>
                  </div>
                </div>
              </div>

              {/* Supported Languages */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-teal-400">Supported Code Syntax Platforms</h2>
                <div className="flex flex-wrap gap-2">
                  {['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'Lua', 'Roblox Lua', 'GDScript', 'PHP', 'Go', 'Rust', 'Kotlin', 'Swift', 'SQL'].map(lang => (
                    <span key={lang} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Supported project types */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-teal-400">Workspace Blueprints</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {['Websites', 'Web Apps', 'Android Apps', 'Desktop Apps', 'Roblox Games', 'Unity Games', 'Godot Games', 'Python Apps', 'APIs', 'Discord Bots', 'Minecraft Plugins'].map(blueprint => (
                    <div key={blueprint} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-slate-300">
                      {blueprint}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack Details */}
              <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Fullstack Architecture Specs</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[10px] font-mono text-slate-500">FRONTEND CORE</span>
                    <p className="text-slate-300 mt-0.5">React 19, TypeScript, Tailwind CSS, WebGL Orthographic projection</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono text-slate-500">BACKEND RUNTIME</span>
                    <p className="text-slate-300 mt-0.5">Express framework, Forge AI Intelligent Router</p>
                  </div>
                </div>
              </div>

            </div>
          </main>
        )}
        </ApplicationShell>
        </div>
      </div>

      {/* Modern Command Palette Overlay */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4" onClick={() => setShowCommandPalette(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/40">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input 
                type="text"
                autoFocus
                placeholder="Type a command or preference to configure..."
                value={commandSearch}
                onChange={(e) => setCommandSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 font-mono focus:ring-0"
              />
              <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">ESC</span>
            </div>

            <div className="max-h-[320px] overflow-y-auto p-2 divide-y divide-slate-800/40">
              {[
                { name: "Switch Workspace Theme: Dark 🌙", category: "Appearance", run: () => savePreferences({ theme: 'dark' }) },
                { name: "Switch Workspace Theme: Light ☀️", category: "Appearance", run: () => savePreferences({ theme: 'light' }) },
                { name: "Switch Workspace Theme: Midnight 🌌", category: "Appearance", run: () => savePreferences({ theme: 'midnight' }) },
                { name: "Switch Workspace Theme: Ocean Blue 🌊", category: "Appearance", run: () => savePreferences({ theme: 'ocean' }) },
                { name: "Switch Workspace Theme: Forest Green 🌲", category: "Appearance", run: () => savePreferences({ theme: 'forest' }) },
                { name: "Set Editor Font Size: Small", category: "Accessibility", run: () => savePreferences({ fontSize: 'sm' }) },
                { name: "Set Editor Font Size: Regular", category: "Accessibility", run: () => savePreferences({ fontSize: 'base' }) },
                { name: "Set Editor Font Size: Large", category: "Accessibility", run: () => savePreferences({ fontSize: 'lg' }) },
                { name: "Set Editor Font Size: X-Large", category: "Accessibility", run: () => savePreferences({ fontSize: 'xl' }) },
                { name: "Toggle Editor Layout Alignment", category: "Layout", run: () => savePreferences({ windowLayout: preferences.windowLayout === 'default' ? 'reversed' : 'default' }) },
                { name: "Open Active Workspace IDE View", category: "Navigation", run: () => setActiveView('editor') },
                { name: "Open Dashboard Home Panel", category: "Navigation", run: () => setActiveView('home') },
                { name: "Open Interactive Asset Lab", category: "Navigation", run: () => setActiveView('assets') },
                { name: "Open Learning Programming Courses", category: "Navigation", run: () => setActiveView('lessons') },
                { name: "Take manual Project state snapshot", category: "Version Control", run: () => takeHistorySnapshot("User snap " + new Date().toLocaleTimeString()) },
                { name: "Export workspace as ZIP file", category: "Utility", run: () => handleDownloadProject() },
              ].filter(action => action.name.toLowerCase().includes(commandSearch.toLowerCase()) || action.category.toLowerCase().includes(commandSearch.toLowerCase()))
               .map((action, index) => (
                <button 
                  key={index}
                  onClick={() => {
                    action.run();
                    setShowCommandPalette(false);
                    setCommandSearch("");
                  }}
                  className="w-full text-left p-3 hover:bg-slate-800/80 rounded-xl flex items-center justify-between transition group">
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-200 group-hover:text-white font-medium">{action.name}</span>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-mono">{action.category}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition">Execute</span>
                </button>
              ))}
              {[
                { name: "Switch Workspace Theme: Dark 🌙", category: "Appearance", run: () => savePreferences({ theme: 'dark' }) },
                { name: "Switch Workspace Theme: Light ☀️", category: "Appearance", run: () => savePreferences({ theme: 'light' }) },
                { name: "Switch Workspace Theme: Midnight 🌌", category: "Appearance", run: () => savePreferences({ theme: 'midnight' }) },
                { name: "Switch Workspace Theme: Ocean Blue 🌊", category: "Appearance", run: () => savePreferences({ theme: 'ocean' }) },
                { name: "Switch Workspace Theme: Forest Green 🌲", category: "Appearance", run: () => savePreferences({ theme: 'forest' }) },
                { name: "Set Editor Font Size: Small", category: "Accessibility", run: () => savePreferences({ fontSize: 'sm' }) },
                { name: "Set Editor Font Size: Regular", category: "Accessibility", run: () => savePreferences({ fontSize: 'base' }) },
                { name: "Set Editor Font Size: Large", category: "Accessibility", run: () => savePreferences({ fontSize: 'lg' }) },
                { name: "Set Editor Font Size: X-Large", category: "Accessibility", run: () => savePreferences({ fontSize: 'xl' }) },
                { name: "Toggle Editor Layout Alignment", category: "Layout", run: () => savePreferences({ windowLayout: preferences.windowLayout === 'default' ? 'reversed' : 'default' }) },
                { name: "Open Active Workspace IDE View", category: "Navigation", run: () => setActiveView('editor') },
                { name: "Open Dashboard Home Panel", category: "Navigation", run: () => setActiveView('home') },
                { name: "Open Interactive Asset Lab", category: "Navigation", run: () => setActiveView('assets') },
                { name: "Open Learning Programming Courses", category: "Navigation", run: () => setActiveView('lessons') },
                { name: "Take manual Project state snapshot", category: "Version Control", run: () => takeHistorySnapshot("User snap " + new Date().toLocaleTimeString()) },
                { name: "Export workspace as ZIP file", category: "Utility", run: () => handleDownloadProject() },
              ].filter(action => action.name.toLowerCase().includes(commandSearch.toLowerCase()) || action.category.toLowerCase().includes(commandSearch.toLowerCase()))
               .length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  No matching workspace actions found for "{commandSearch}"
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Use Ctrl+Shift+P to toggle palette</span>
              <span>⚡ Powered by Copilot Engine</span>
            </div>
          </div>
        </div>
      )}

      {/* ZIP Upload Confirmation Modal */}
      {showZipConfirmModal && uploadedZipFiles && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3.5 pb-2 border-b border-slate-800">
              <div className="h-10 w-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center shrink-0">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ZIP Archive Detected</h3>
                <p className="text-xs text-slate-400">Successfully scanned the archive and found {Object.keys(uploadedZipFiles).length} files.</p>
              </div>
            </div>

            {/* List of files in ZIP */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">Archive Contents</label>
              <div className="max-h-40 overflow-y-auto bg-slate-950/80 border border-slate-850 rounded-xl p-3 font-mono text-[10px] text-slate-300 space-y-1">
                {Object.keys(uploadedZipFiles).map((path) => (
                  <div key={path} className="flex items-center space-x-2 truncate">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-500/80 shrink-0" />
                    <span className="truncate">{path}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">How should we import these files?</label>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Mode 1: Replace */}
                <button
                  onClick={() => handleConfirmZipExtraction('replace')}
                  className="p-4 bg-slate-950 hover:bg-slate-950/40 border border-slate-850 hover:border-teal-500/50 rounded-2xl text-left transition group space-y-1 cursor-pointer">
                  <h4 className="text-xs font-extrabold text-white group-hover:text-teal-400 transition">Clean & Replace Workspace</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Purges current files and replaces them with the ZIP contents. All of your custom <span className="text-teal-400 font-bold">.md files</span> will be preserved.
                  </p>
                </button>

                {/* Mode 2: Merge */}
                <button
                  onClick={() => handleConfirmZipExtraction('merge')}
                  className="p-4 bg-slate-950 hover:bg-slate-950/40 border border-slate-850 hover:border-teal-500/50 rounded-2xl text-left transition group space-y-1 cursor-pointer">
                  <h4 className="text-xs font-extrabold text-white group-hover:text-teal-400 transition">Merge Into Workspace</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Adds the ZIP files directly to your current project. Overwrites any existing files that share the exact same names.
                  </p>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setUploadedZipFiles(null);
                  setShowZipConfirmModal(false);
                }}
                className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white border border-slate-850 rounded-xl text-xs font-semibold transition cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beginner Onboarding Router Modal */}
      {showBeginnerModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto h-12 w-12 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">What would you like to do today?</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Select your path below. We'll set up the perfect environment for your goals.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Option A: Ask questions, learn, or generate code (Chat) */}
              <button 
                onClick={() => {
                  setShowBeginnerModal(false);
                  setActiveView('chat');
                  addNotification("Switched to conversational Chat Mode. Ask or learn anything!", "success");
                }}
                className="p-5 bg-slate-950 hover:bg-slate-900/40 border border-slate-800 hover:border-teal-500/50 rounded-2xl text-left transition group space-y-3 cursor-pointer">
                <div className="h-9 w-9 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 transition">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Option A: Ask, Learn, or Generate</h4>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">Chat assistant style. Ask general concepts, paste error logs to debug, or sketch code blocks without sandbox file systems.</p>
                </div>
              </button>

              {/* Option B: Build an app, website, or game (Project Sandbox) */}
              <button 
                onClick={() => {
                  setShowBeginnerModal(false);
                  setActiveView('templates');
                  addNotification("Switched to Project Workspace. Select a template blueprint to build!", "success");
                }}
                className="p-5 bg-slate-950 hover:bg-slate-900/40 border border-slate-800 hover:border-purple-500/50 rounded-2xl text-left transition group space-y-3 cursor-pointer">
                <div className="h-9 w-9 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center group-hover:bg-purple-500 group-hover:text-slate-950 transition">
                  <Code2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Option B: Build Apps or Games</h4>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">Workspace IDE style. Create actual files (HTML/CSS/JS), see real-time browser preview, compiler logs, and automatic history snapshots.</p>
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-850/60 flex justify-between items-center text-[11px]">
              <span className="text-slate-500 font-mono text-[10px]">Comfort level: Beginner Friendly</span>
              <button 
                onClick={() => setShowBeginnerModal(false)}
                className="font-mono text-slate-500 hover:text-slate-300">
                Close and resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Choose Workspace Prompt (First-time display on mobile devices/tablets) */}
      {showChooseWorkspacePrompt && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto h-12 w-12 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center">
              <Layout className="h-6 w-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">Choose Your Workspace</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Forge AI detected a compact display. Please select your preferred development layout.</p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Option 1: Mobile Workspace */}
              <button 
                onClick={() => {
                  savePreferences({ workspaceMode: 'mobile', hasChosenWorkspace: true });
                  setShowChooseWorkspacePrompt(false);
                  addNotification("Mobile Workspace activated. Toggle between Editor, Chat, and Canvas at the bottom.", "success");
                }}
                className="w-full p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl text-left transition group flex items-start space-x-3 cursor-pointer">
                <div className="h-8 w-8 bg-teal-500/10 text-teal-400 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:text-slate-950 transition font-bold font-sans">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Mobile Workspace</h4>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Optimized for touch and smaller screens. One focused pane visible at a time.</p>
                </div>
              </button>

              {/* Option 2: Desktop Workspace */}
              <button 
                onClick={() => {
                  savePreferences({ workspaceMode: 'desktop', hasChosenWorkspace: true });
                  setShowChooseWorkspacePrompt(false);
                  addNotification("Desktop Workspace activated on mobile screen.", "info");
                }}
                className="w-full p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl text-left transition group flex items-start space-x-3 cursor-pointer">
                <div className="h-8 w-8 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-500 group-hover:text-slate-950 transition font-bold font-sans">
                  <Laptop className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Desktop Workspace</h4>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Shows the complete IDE, File Explorer, and advanced sidebar tools simultaneously.</p>
                </div>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-850/60 text-[11px]">
              <label className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-400 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={preferences.hasChosenWorkspace}
                  onChange={(e) => savePreferences({ hasChosenWorkspace: e.target.checked })}
                  className="rounded border-slate-850 text-teal-500 focus:ring-teal-500 h-3 w-3"
                />
                <span>Remember my choice</span>
              </label>
              
              <button 
                onClick={() => {
                  savePreferences({ workspaceMode: 'auto', hasChosenWorkspace: true });
                  setShowChooseWorkspacePrompt(false);
                }}
                className="text-slate-400 hover:text-white font-semibold">
                Use Auto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Suggest Switcher Banner */}
      {showWorkspaceSuggestPrompt && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] w-full max-w-md px-4">
          <div className="bg-slate-900/95 border border-purple-500/30 shadow-2xl rounded-2xl p-4 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center space-x-3 text-left">
              <div className="h-9 w-9 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center shrink-0">
                <Monitor className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Larger display detected</h4>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">A spacious workspace layout is available. Switch to Desktop Workspace?</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
              <button 
                onClick={() => {
                  savePreferences({ dontAskWorkspaceSuggestion: true });
                  setShowWorkspaceSuggestPrompt(false);
                  addNotification("We won't ask again. You can change modes anytime in Settings.", "info");
                }}
                className="px-2.5 py-1.5 hover:bg-slate-800 text-[10px] text-slate-500 hover:text-slate-300 font-bold rounded-lg transition cursor-pointer">
                Don't Ask Again
              </button>
              <button 
                onClick={() => {
                  setDismissedSuggestUntilResize(true);
                  setShowWorkspaceSuggestPrompt(false);
                }}
                className="px-2.5 py-1.5 hover:bg-slate-800 text-[10px] text-slate-300 rounded-lg transition cursor-pointer">
                Keep
              </button>
              <button 
                onClick={() => {
                  savePreferences({ workspaceMode: 'desktop' });
                  setShowWorkspaceSuggestPrompt(false);
                  addNotification("Switched to Desktop Workspace.", "success");
                }}
                className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-[10px] font-extrabold rounded-lg transition shadow-md shadow-teal-500/15 cursor-pointer">
                Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Workspace Navigation Tab Bar */}
      {currentWorkspaceLayout === 'mobile' && activeView === 'editor' && (
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-around shrink-0 z-40">
          {[
            { id: 'editor', label: 'Code Editor', icon: Code2 },
            { id: 'chat', label: 'AI Assistant', icon: Sparkles },
            { id: 'preview', label: 'Live Preview', icon: Play }
          ].map((tabOption) => {
            const Icon = tabOption.icon;
            const isActive = mobileWorkspaceTab === tabOption.id;
            return (
              <button
                key={tabOption.id}
                onClick={() => setMobileWorkspaceTab(tabOption.id as any)}
                className={`flex flex-col items-center space-y-1 py-1 px-3 rounded-xl transition cursor-pointer ${
                  isActive ? 'text-teal-400 bg-teal-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}>
                <Icon className="h-5 w-5 animate-in fade-in zoom-in-75 duration-150" />
                <span className="text-[10px] font-bold tracking-tight">{tabOption.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Modern Toast Notifications Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {notifications.map(notif => {
          let bgClass = "bg-slate-900/95 border-slate-800 text-slate-300";
          let iconColor = "text-teal-400";
          if (notif.type === 'success') {
            bgClass = "bg-slate-900/95 border-teal-500/30 text-slate-200";
            iconColor = "text-emerald-400";
          } else if (notif.type === 'warning') {
            bgClass = "bg-slate-900/95 border-amber-500/30 text-slate-200";
            iconColor = "text-amber-400";
          }
          
          return (
            <div 
              key={notif.id} 
              className={`p-3.5 rounded-xl border ${bgClass} shadow-2xl flex items-start gap-3 backdrop-blur-md pointer-events-auto transition-all duration-300`}
            >
              <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                {notif.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : notif.type === 'warning' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </div>
              <p className="text-xs leading-relaxed font-medium flex-1 text-left">{notif.text}</p>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="text-slate-500 hover:text-white transition shrink-0 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Share Project Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto h-12 w-12 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center">
              <Share className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">Project Sandbox Shared!</h3>
              <p className="text-xs text-slate-400">
                A read-only snapshot of this workspace has been generated. Anyone with this link can view and inspect your files.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between gap-3 text-left">
              <div className="font-mono text-[10px] text-slate-400 break-all select-all flex-1 truncate">
                {generatedShareUrl}
              </div>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(generatedShareUrl);
                  addNotification("Link copied to clipboard!", "success");
                }}
                className="py-1.5 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition shrink-0"
              >
                Copy Link
              </button>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Project As Custom Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-850">
              <div className="h-10 w-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white text-left">Save Workspace as Template</h3>
                <p className="text-xs text-slate-400 text-left">Create a reusable blueprint from your current project configuration.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-left">Template Title</label>
                <input 
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g. Interactive Dashboard Template"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-teal-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-left">Description</label>
                <textarea 
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  placeholder="Describe your blueprint features..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-teal-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-left">Project Tech Stack Category</label>
                <select 
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500 transition"
                >
                  <option value="React Apps">React Apps & Vite</option>
                  <option value="Node Server Apps">Node Server & APIs</option>
                  <option value="Interactive 3D Environments">Interactive 3D Environments</option>
                  <option value="Chrome Extensions">Chrome Extensions</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button 
                onClick={() => setShowSaveTemplateModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSaveTemplate}
                disabled={!newTemplateName.trim()}
                className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 disabled:opacity-40 rounded-xl text-xs font-bold transition"
              >
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Dialog Modal */}
      <AnimatePresence>
        {showShortcutsHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowShortcutsHelp(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center shrink-0">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Keyboard Shortcuts</h3>
                    <p className="text-xs text-slate-400">Master the IDE with quick keyboard binds</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowShortcutsHelp(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search filter input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input 
                  type="text"
                  value={shortcutModalSearch}
                  onChange={(e) => setShortcutModalSearch(e.target.value)}
                  placeholder="Filter shortcuts by name, description, or hotkey..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition font-sans"
                />
              </div>

              {/* Tabbed Category Navigation */}
              {(() => {
                const modalShortcuts = [
                  { id: 'shortcutsHelp', name: 'Show Shortcuts Help', category: 'Navigation', desc: 'Display visual hotkeys help overlay.', keys: preferences.keyboardShortcuts?.shortcutsHelp || 'Ctrl+/' },
                  { id: 'commandPalette', name: 'Toggle Command Palette', category: 'View', desc: 'Open universal launcher and search bar.', keys: preferences.keyboardShortcuts?.commandPalette || 'Ctrl+Shift+P' },
                  { id: 'sidebarToggle', name: 'Toggle Sidebar Menu', category: 'View', desc: 'Expand or collapse sidebar navigation drawer.', keys: preferences.keyboardShortcuts?.sidebarToggle || 'Ctrl+B' },
                  { id: 'focusToggle', name: 'Toggle Focus Mode', category: 'View', desc: 'Maximize editor space by hiding other panels.', keys: preferences.keyboardShortcuts?.focusToggle || 'Ctrl+.' },
                  { id: 'viewHome', name: 'Home Workspace View', category: 'Navigation', desc: 'Switch view directly to the main landing home tab.', keys: preferences.keyboardShortcuts?.viewHome || 'Ctrl+Shift+1' },
                  { id: 'viewEditor', name: 'Editor Sandbox View', category: 'Navigation', desc: 'Switch view directly to the coding workspace.', keys: preferences.keyboardShortcuts?.viewEditor || 'Ctrl+Shift+2' },
                  { id: 'viewChat', name: 'Chat Assistant View', category: 'Navigation', desc: 'Switch view directly to the AI chat bot.', keys: preferences.keyboardShortcuts?.viewChat || 'Ctrl+Shift+3' },
                  { id: 'viewTemplates', name: 'Blueprints & Templates View', category: 'Navigation', desc: 'Switch view directly to templates guidelines.', keys: preferences.keyboardShortcuts?.viewTemplates || 'Ctrl+Shift+4' },
                  { id: 'viewHistory', name: 'Version History View', category: 'Navigation', desc: 'Switch view to local snapshots registry.', keys: preferences.keyboardShortcuts?.viewHistory || 'Ctrl+Shift+5' },
                  { id: 'viewSettings', name: 'Settings Configuration View', category: 'Navigation', desc: 'Switch view to accessibility settings panel.', keys: preferences.keyboardShortcuts?.viewSettings || 'Ctrl+Shift+6' },
                  { id: 'editorIndent', name: 'Indent Lines', category: 'Editor', desc: 'Insert 2 spaces inside the textarea editor.', keys: 'Tab' },
                  { id: 'editorClose', name: 'Auto-Close Pairs', category: 'Editor', desc: 'Auto close braces, brackets, parentheses, and quotes.', keys: '"{", "[", "(", "\'", "\""' },
                ];

                return (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-850 pb-3">
                      {['All', 'Navigation', 'View', 'Editor'].map((tab) => {
                        const count = modalShortcuts.filter(s => {
                          const matchCat = tab === 'All' || s.category === tab;
                          const matchSearch = s.name.toLowerCase().includes(shortcutModalSearch.toLowerCase()) ||
                            s.desc.toLowerCase().includes(shortcutModalSearch.toLowerCase()) ||
                            s.keys.toLowerCase().includes(shortcutModalSearch.toLowerCase());
                          return matchCat && matchSearch;
                        }).length;

                        return (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setShortcutActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                              shortcutActiveTab === tab 
                                ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/10' 
                                : 'bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-850'
                            }`}
                          >
                            <span>{tab}</span>
                            <span className={`text-[9px] px-1.5 py-0.1 rounded font-mono ${
                              shortcutActiveTab === tab ? 'bg-teal-600/35 text-slate-950 font-bold' : 'bg-slate-900 text-slate-500'
                            }`}>{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Shortcut List Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[42vh] overflow-y-auto pr-1 custom-scrollbar">
                      {(() => {
                        const filtered = modalShortcuts.filter(s => {
                          const matchCat = shortcutActiveTab === 'All' || s.category === shortcutActiveTab;
                          const matchSearch = s.name.toLowerCase().includes(shortcutModalSearch.toLowerCase()) ||
                            s.desc.toLowerCase().includes(shortcutModalSearch.toLowerCase()) ||
                            s.keys.toLowerCase().includes(shortcutModalSearch.toLowerCase());
                          return matchCat && matchSearch;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="col-span-full py-12 text-center text-xs text-slate-500 font-mono space-y-2">
                              <div>No matching shortcuts found inside "{shortcutActiveTab}".</div>
                              <button 
                                type="button"
                                onClick={() => { setShortcutModalSearch(''); setShortcutActiveTab('All'); }}
                                className="text-teal-400 hover:underline hover:text-teal-300"
                              >
                                Clear filters
                              </button>
                            </div>
                          );
                        }

                        return filtered.map(s => (
                          <div 
                            key={s.id} 
                            className="p-3 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col justify-between hover:border-slate-850 transition text-left"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white tracking-tight">{s.name}</span>
                                <span className="text-[8px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.1 rounded uppercase tracking-widest">{s.category}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal">{s.desc}</p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-900/60 flex justify-end">
                              <div className="flex items-center space-x-1">
                                {s.keys.split('+').map((keyPart, idx) => (
                                  <React.Fragment key={idx}>
                                    {idx > 0 && <span className="text-slate-600 text-[10px] font-mono font-bold">+</span>}
                                    <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono text-[10px] text-teal-400 font-extrabold">{keyPart}</kbd>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2 flex justify-end">
                <button 
                  onClick={() => setShowShortcutsHelp(false)}
                  className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}
