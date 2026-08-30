export interface ProjectFile {
  path: string;
  content: string;
  folder?: string;
  isFolder?: boolean;
}

export interface TerminalLine {
  type: 'command' | 'output' | 'error' | 'success';
  text: string;
  time?: string;
}

export interface TerminalSession {
  id: string;
  name: string; // e.g., "dev", "test", "build", "bash"
  status: 'idle' | 'running' | 'completed' | 'error';
  command?: string; // e.g. "npm run dev", "npm run test"
  history: TerminalLine[];
  createdAt: string;
  autoScroll?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface GeneratedImageAsset {
  id: string;
  name: string;
  prompt: string;
  url: string;
  timestamp: string;
}

export interface Generated3DAsset {
  id: string;
  name: string;
  prompt: string;
  objText: string;
  timestamp: string;
}

export interface VersionHistoryItem {
  id: string;
  timestamp: string;
  description: string;
  files: Record<string, string>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Memory fields
  firstPrompt?: string;
  lastPrompt?: string;
  intent?: string;
  language?: string;
  generatedFiles?: string[];
  generatedImages?: string[];
  generated3D?: string[];
  attachments?: string[];
  projectLink?: string;
  favorite?: boolean;
  folder?: string;
  tags?: string[];
  summary?: string;
  messageCount?: number;
  
  // Status & UI fields
  status?: 'ready' | 'answering' | 'generating_image' | 'generating_code' | 'generating_3d' | 'indexing' | 'thinking' | 'error' | 'syncing' | 'paused';
  unread?: boolean;
  category?: 'code' | 'image' | '3d' | 'learning' | 'debug' | 'planning' | 'general';
  workspace?: string;
  workspaceConfig?: Record<string, any>;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'midnight' | 'ocean' | 'forest' | 'blue' | 'pink' | 'white';
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  editorFont: 'JetBrains Mono' | 'Fira Code' | 'Source Code Pro' | 'Inter';
  cursorStyle: 'line' | 'block' | 'underline';
  sidebarWidth: 'compact' | 'normal' | 'wide';
  windowLayout: 'default' | 'reversed';
  animationLevel: 'full' | 'reduced' | 'none';
  uiScale: '90%' | '100%' | '110%';
  roundedCorners: 'none' | 'sm' | 'md' | 'lg';
  transparency: boolean;
  comfortMode: 'compact' | 'comfortable' | 'large' | 'accessibility';
  workspaceMode?: 'auto' | 'mobile' | 'desktop';
  responseAnimation?: 'instant' | 'typewriter' | 'wordStream' | 'lineReveal' | 'fadeUp' | 'slideUp' | 'smartStreaming';
  animationSpeed?: 'slow' | 'normal' | 'fast';
  streamingCursor?: boolean;
  cursorTheme?: 'default' | 'forge' | 'terminal' | 'minimal' | 'classic' | 'professional' | 'cyber' | 'disabled';
  cursorSize?: 'small' | 'medium' | 'large';
  cursorEffect?: 'none' | 'fade' | 'glow' | 'pulse' | 'trail';
  developerMode?: boolean;
  hasChosenWorkspace?: boolean;
  dontAskWorkspaceSuggestion?: boolean;
  keyboardShortcuts?: Record<string, string>;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: string; // e.g., 'Website', 'Python App', 'Discord Bot', 'Unity Game', etc.
  files: Record<string, string>; // path -> content
  chatHistory: ChatMessage[];
  generatedImages: GeneratedImageAsset[];
  generated3D: Generated3DAsset[];
  selectedModelId: string;
  selectedTabPath: string | null;
  openTabs: string[];
  terminalHistory: TerminalLine[];
  terminalSessions?: TerminalSession[];
  activeTerminalSessionId?: string;
  folders?: string[]; // list of explicitly created folder paths
  dailyUsage: {
    chats: number;
    codeGen: number;
    imageGen: number;
    model3D: number;
    debugRequests: number;
    analysis: number;
  };
  versionHistory?: VersionHistoryItem[];
}

export interface AIModel {
  id: string;
  name: string;
  purpose: string;
  provider: string;
  description: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export interface DailyLimits {
  chats: number;
  codeGen: number;
  imageGen: number;
  model3D: number;
  analysis: number;
  debugRequests: number;
}
