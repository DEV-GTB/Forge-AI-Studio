import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Bot, User, Copy, Check, RefreshCw, 
  Sparkles, Plus, History, X, MoreVertical, 
  Paperclip, Mic, Image as ImageIcon, Code, Search,
  Layout, FolderOpen, Settings, Zap, ChevronRight,
  Clock, CheckCircle, AlertCircle, Play, FileText,
  Terminal, Globe, Shield, Cpu
} from 'lucide-react';
import { colors, typography, spacing, borderRadius, shadow, animation } from '../styles/design-tokens';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: string[];
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  category: 'Today' | 'Yesterday' | 'Previous 7 Days';
}

interface RelatedFile {
  name: string;
  size: string;
  language: string;
}

interface ChatPageProps {
  userName?: string;
  onOpenProjectView?: () => void;
  onNavigateToPage?: (page: string) => void;
}

export default function ChatPage({ 
  userName, 
  onOpenProjectView, 
  onNavigateToPage 
}: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const conversations: Conversation[] = [
    {
      id: '1',
      title: 'Build a Python FastAPI Backend',
      preview: 'You: Create a REST API with user authentication and CRUD operations...',
      timestamp: '2 hours ago',
      category: 'Today',
    },
    {
      id: '2',
      title: 'React Component Optimization',
      preview: 'You: Help me optimize this dashboard component for better performance...',
      timestamp: '5 hours ago',
      category: 'Today',
    },
    {
      id: '3',
      title: 'Database Schema Design',
      preview: 'You: Design a database schema for an e-commerce platform...',
      timestamp: 'Yesterday',
      category: 'Yesterday',
    },
    {
      id: '4',
      title: 'API Integration Help',
      preview: 'You: I need help integrating the Stripe payment API...',
      timestamp: '3 days ago',
      category: 'Previous 7 Days',
    },
  ];

  const relatedFiles: RelatedFile[] = [
    { name: 'main.py', size: '2.4 KB', language: 'Python' },
    { name: 'models.py', size: '1.8 KB', language: 'Python' },
    { name: 'auth.py', size: '3.2 KB', language: 'Python' },
    { name: 'schemas.py', size: '1.1 KB', language: 'Python' },
    { name: 'database.py', size: '0.9 KB', language: 'Python' },
  ];

  const aiCapabilities = [
    { name: 'Code Generation', pro: false },
    { name: 'Code Analysis', pro: false },
    { name: 'Documentation', pro: false },
    { name: 'Refactoring', pro: true },
    { name: 'Testing', pro: true },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildFallbackAiReply = (prompt: string) => {
    const lower = prompt.toLowerCase();

    if (lower.includes('project') || lower.includes('app') || lower.includes('website') || lower.includes('build')) {
      return `Forge AI is active and ready to help.\n\nI can structure your project, draft the app files, suggest the best stack, and guide you through the implementation. For a fast start, I recommend:\n\n1. Define the app goal and user flow\n2. Create the main layout and routes\n3. Build the core feature set\n4. Validate responsiveness and logic\n\nIf you want, I can generate a full starter project or help fix an existing one.`;
    }

    if (lower.includes('hello') || lower.includes('hi')) {
      return 'Hello! Forge AI is online and ready to help with coding, UI design, debugging, and project planning.';
    }

    if (lower.includes('error') || lower.includes('bug') || lower.includes('fix')) {
      return 'I can help debug this. Please share the exact error, relevant code, and what you expected to happen. I will trace the likely root cause and suggest a fix.';
    }

    if (lower.includes('react') || lower.includes('typescript') || lower.includes('frontend')) {
      return 'For React or TypeScript, I would keep the app modular: create reusable components, separate state from presentation, validate props, and use small composable functions. I can also generate a concrete component or page structure for your app.';
    }

    return `I understand your request: "${prompt}".\n\nForge AI is working in this project environment and can help with implementation, debugging, design, optimization, and project planning. Share the exact output or code you need, and I will produce the next step clearly and directly.`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          modelId: 'gemini-3.5-flash',
        }),
      });

      if (!response.ok) {
        throw new Error('AI endpoint unavailable');
      }

      const data = await response.json();
      const aiText = data?.text || buildFallbackAiReply(inputValue);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText,
        timestamp: new Date(),
        actions: ['Explain Code', 'Add Tests', 'Optimize', 'Add Docs'],
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: buildFallbackAiReply(inputValue),
        timestamp: new Date(),
        actions: ['Explain Code', 'Add Tests', 'Optimize', 'Add Docs'],
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleAction = (action: string) => {
    console.log('Action clicked:', action);
  };

  return (
    <div 
      className="flex h-screen"
      style={{ 
        backgroundColor: colors.background.base,
        fontFamily: typography.fontFamily.sans,
        color: colors.text.primary,
      }}
    >
      {/* Technical Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${colors.grid.color} 1px, transparent 1px),
            linear-gradient(90deg, ${colors.grid.color} 1px, transparent 1px)
          `,
          backgroundSize: colors.grid.size,
          opacity: 0.3,
        }}
      />

      {/* Left Navigation Rail */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-16 flex flex-col items-center py-6 gap-2 z-50"
        style={{ 
          backgroundColor: colors.background.surface,
          borderRight: `1px solid ${colors.border.subtle}`,
        }}
      >
        {/* Logo */}
        <div className="mb-6">
          <img 
            src="/forgeai_logo.jpg" 
            alt="Forge AI Studio" 
            className="w-10 h-10 rounded-xl object-cover"
          />
        </div>

        {[
          { icon: <Layout size={24} />, label: 'Home', active: false },
          { icon: <Sparkles size={24} />, label: 'Chat', active: true },
          { icon: <FolderOpen size={24} />, label: 'Studio', active: false },
          { icon: <Settings size={24} />, label: 'Settings', active: false },
        ].map((item) => (
          <motion.button
            key={item.label}
            onClick={() => onNavigateToPage?.(item.label.toLowerCase())}
            className="w-12 h-12 rounded-xl flex items-center justify-center relative"
            style={{
              backgroundColor: item.active ? colors.accent.subtle : 'transparent',
            }}
            whileHover={{ backgroundColor: item.active ? colors.accent.subtle : colors.background.elevated }}
            whileTap={{ scale: 0.95 }}
            title={item.label}
          >
            <div style={{ color: item.active ? colors.accent.primary : colors.text.secondary }}>
              {item.icon}
            </div>
            {item.active && (
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r"
                style={{ backgroundColor: colors.accent.primary }}
              />
            )}
          </motion.button>
        ))}

        <div className="flex-1" />

        {/* Forge Pro Section */}
        <div className="w-full px-2 mb-4">
          <motion.button
            className="w-full p-3 rounded-xl flex flex-col items-center gap-1"
            style={{ backgroundColor: colors.background.elevated }}
            whileHover={{ backgroundColor: colors.background.floating }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap size={20} style={{ color: colors.accent.primary }} />
            <span 
              className="text-xs font-medium"
              style={{ color: colors.accent.primary }}
            >
              Pro
            </span>
          </motion.button>
        </div>

        {/* User Section */}
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: colors.accent.subtle }}
        >
          <span 
            className="font-medium text-sm"
            style={{ color: colors.accent.primary }}
          >
            {userName?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
      </div>

      {/* Conversations Panel */}
      <div 
        className="w-80 flex flex-col"
        style={{ 
          backgroundColor: colors.background.surface,
          borderRight: `1px solid ${colors.border.subtle}`,
          marginLeft: '64px',
        }}
      >
        {/* Conversations Header */}
        <div className="p-4" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="font-semibold"
              style={{ color: colors.text.primary }}
            >
              Conversations
            </h2>
            <motion.button
              className="p-2 rounded-lg"
              style={{ color: colors.text.secondary }}
              whileHover={{ backgroundColor: colors.background.elevated }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
            </motion.button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.text.tertiary }}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: colors.background.base,
                border: `1px solid ${colors.border.subtle}`,
                color: colors.text.primary,
              }}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {['Today', 'Yesterday', 'Previous 7 Days'].map((category) => {
            const categoryConversations = conversations.filter(c => c.category === category);
            if (categoryConversations.length === 0) return null;
            
            return (
              <div key={category}>
                <div 
                  className="px-4 py-2 text-xs font-medium uppercase tracking-wide"
                  style={{ color: colors.text.tertiary }}
                >
                  {category}
                </div>
                {categoryConversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className="w-full px-4 py-3 text-left"
                    style={{
                      backgroundColor: selectedConversation === conv.id 
                        ? colors.accent.subtle 
                        : 'transparent',
                      borderLeft: selectedConversation === conv.id 
                        ? `2px solid ${colors.accent.primary}` 
                        : '2px solid transparent',
                    }}
                    whileHover={{ backgroundColor: colors.background.elevated }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 
                      className="text-sm font-medium mb-1"
                      style={{ color: colors.text.primary }}
                    >
                      {conv.title}
                    </h3>
                    <p 
                      className="text-xs truncate"
                      style={{ color: colors.text.secondary }}
                    >
                      {conv.preview}
                    </p>
                    <span 
                      className="text-xs mt-1 block"
                      style={{ color: colors.text.tertiary }}
                    >
                      {conv.timestamp}
                    </span>
                  </motion.button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{ 
            backgroundColor: colors.background.surface,
            borderBottom: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: colors.accent.subtle }}
            >
              <Sparkles size={20} style={{ color: colors.accent.primary }} />
            </div>
            <div>
              <h1 
                className="font-semibold"
                style={{ color: colors.text.primary, fontSize: typography.fontSize.lg }}
              >
                AI CHAT
              </h1>
              <p 
                className="text-xs"
                style={{ color: colors.text.tertiary }}
              >
                Chat with Forge AI - Smarter than ever.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.semantic.success }}
              />
              <span 
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                AI Online
              </span>
            </div>
            <motion.button
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{
                backgroundColor: colors.accent.primary,
                color: colors.text.inverse,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} />
              New Chat
            </motion.button>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: colors.background.base }}
        >
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Empty State */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-16"
              >
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                  style={{ backgroundColor: colors.accent.subtle }}
                >
                  <Sparkles size={32} style={{ color: colors.accent.primary }} />
                </div>
                <h2 
                  className="text-2xl font-semibold mb-3"
                  style={{ color: colors.text.primary }}
                >
                  What can Forge help you build?
                </h2>
                <p 
                  className="text-sm mb-8"
                  style={{ color: colors.text.secondary }}
                >
                  Start a conversation or select a previous conversation
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                  {['Build a website', 'Fix a bug', 'Explain code', 'Create a component'].map((prompt) => (
                    <motion.button
                      key={prompt}
                      onClick={() => setInputValue(prompt)}
                      className="px-4 py-2 rounded-lg text-sm transition-colors"
                      style={{ 
                        backgroundColor: colors.background.surface,
                        borderColor: colors.border.subtle,
                        color: colors.text.secondary,
                        border: '1px solid',
                      }}
                      whileHover={{ 
                        backgroundColor: colors.background.elevated,
                        borderColor: colors.border.focus,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className={`flex gap-4 mb-6 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ 
                      backgroundColor: message.role === 'user' 
                        ? colors.accent.subtle 
                        : colors.background.elevated 
                    }}
                  >
                    {message.role === 'user' ? (
                      <User size={16} style={{ color: colors.accent.primary }} />
                    ) : (
                      <div 
                        className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: colors.accent.primary, color: colors.text.inverse }}
                      >
                        F
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`max-w-2xl ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className="inline-block px-4 py-3 rounded-2xl text-left"
                      style={{ 
                        backgroundColor: message.role === 'user'
                          ? colors.accent.subtle
                          : colors.background.surface,
                        color: colors.text.primary,
                        border: message.role === 'assistant' 
                          ? `1px solid ${colors.border.subtle}` 
                          : 'none',
                      }}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    
                    {/* Message Actions */}
                    <div className="flex items-center gap-2 mt-2">
                      {message.actions?.map((action) => (
                        <motion.button
                          key={action}
                          onClick={() => handleAction(action)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{
                            backgroundColor: colors.background.surface,
                            border: `1px solid ${colors.border.subtle}`,
                            color: colors.text.secondary,
                          }}
                          whileHover={{ 
                            backgroundColor: colors.background.elevated,
                            borderColor: colors.border.focus,
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {action}
                        </motion.button>
                      ))}
                      <motion.button
                        onClick={() => handleCopy(message.content, message.id)}
                        className="p-1 rounded transition-colors"
                        style={{ color: colors.text.tertiary }}
                        whileHover={{ color: colors.text.secondary }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {copiedMessageId === message.id ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 mb-6"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: colors.background.elevated }}
                >
                  <div 
                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: colors.accent.primary, color: colors.text.inverse }}
                  >
                    F
                  </div>
                </div>
                <div
                  className="px-4 py-3 rounded-2xl"
                  style={{ 
                    backgroundColor: colors.background.surface,
                    border: `1px solid ${colors.border.subtle}`,
                  }}
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors.text.tertiary }}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div 
          className="px-6 py-4"
          style={{ 
            backgroundColor: colors.background.surface,
            borderTop: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div
              className="flex items-end gap-3 p-3 rounded-xl"
              style={{ 
                backgroundColor: colors.background.base,
                border: `1px solid ${colors.border.subtle}`,
              }}
            >
              <motion.button
                className="p-2 rounded-lg transition-colors shrink-0"
                style={{ color: colors.text.tertiary }}
                whileHover={{ color: colors.text.secondary, backgroundColor: colors.background.elevated }}
                whileTap={{ scale: 0.95 }}
              >
                <Paperclip size={18} />
              </motion.button>
              
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Forge AI anything..."
                className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed"
                style={{ 
                  color: colors.text.primary,
                  minHeight: '24px',
                  maxHeight: '120px',
                }}
                rows={1}
              />

              <motion.button
                className="p-2 rounded-lg transition-colors shrink-0"
                style={{ color: colors.text.tertiary }}
                whileHover={{ color: colors.text.secondary, backgroundColor: colors.background.elevated }}
                whileTap={{ scale: 0.95 }}
              >
                <ImageIcon size={18} />
              </motion.button>

              <motion.button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-2 rounded-lg transition-colors shrink-0"
                style={{ 
                  color: inputValue.trim() ? colors.accent.primary : colors.text.tertiary,
                  backgroundColor: inputValue.trim() ? colors.accent.subtle : 'transparent',
                }}
                whileHover={inputValue.trim() ? { backgroundColor: colors.accent.glow } : {}}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={18} />
              </motion.button>
            </div>

            <p 
              className="text-xs text-center mt-3"
              style={{ color: colors.text.tertiary }}
            >
              Forge AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>

      {/* Right Context Panel */}
      <div 
        className="w-80 flex flex-col"
        style={{ 
          backgroundColor: colors.background.surface,
          borderLeft: `1px solid ${colors.border.subtle}`,
        }}
      >
        {/* Current Context */}
        <div className="p-4" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
          <h3 
            className="text-xs font-medium uppercase tracking-wide mb-4"
            style={{ color: colors.text.tertiary }}
          >
            Current Context
          </h3>
          
          {/* Active Project */}
          <div 
            className="p-3 rounded-lg mb-4"
            style={{ backgroundColor: colors.background.base }}
          >
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen size={16} style={{ color: colors.accent.primary }} />
              <span 
                className="text-sm font-medium"
                style={{ color: colors.text.primary }}
              >
                Task Manager API
              </span>
            </div>
            <span 
              className="text-xs"
              style={{ color: colors.text.tertiary }}
            >
              /projects/task-manager-api
            </span>
          </div>

          {/* Related Files */}
          <div>
            <h4 
              className="text-xs font-medium mb-2"
              style={{ color: colors.text.secondary }}
            >
              Related Files
            </h4>
            <div className="space-y-1">
              {relatedFiles.map((file) => (
                <div 
                  key={file.name}
                  className="flex items-center justify-between px-2 py-1.5 rounded text-xs"
                  style={{ color: colors.text.secondary }}
                >
                  <span>{file.name}</span>
                  <span 
                    className="text-xs"
                    style={{ color: colors.text.tertiary }}
                  >
                    {file.size}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Capabilities */}
        <div className="p-4" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
          <h3 
            className="text-xs font-medium uppercase tracking-wide mb-3"
            style={{ color: colors.text.tertiary }}
          >
            AI Capabilities
          </h3>
          <div className="space-y-2">
            {aiCapabilities.map((capability) => (
              <div 
                key={capability.name}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ backgroundColor: colors.background.base }}
              >
                <span 
                  className="text-sm"
                  style={{ color: colors.text.secondary }}
                >
                  {capability.name}
                </span>
                {capability.pro && (
                  <span 
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: colors.accent.subtle,
                      color: colors.accent.primary,
                    }}
                  >
                    Pro
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Forge Pro CTA */}
        <div className="p-4 flex-1">
          <div 
            className="h-full p-4 rounded-lg flex flex-col"
            style={{ 
              backgroundColor: colors.background.base,
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap size={20} style={{ color: colors.accent.primary }} />
              <span 
                className="font-semibold"
                style={{ color: colors.text.primary }}
              >
                Try Forge Pro
              </span>
            </div>
            <ul 
              className="text-sm space-y-2 mb-4 flex-1"
              style={{ color: colors.text.secondary }}
            >
              <li className="flex items-center gap-2">
                <CheckCircle size={14} style={{ color: colors.semantic.success }} />
                Unlimited conversations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} style={{ color: colors.semantic.success }} />
                Advanced AI models
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} style={{ color: colors.semantic.success }} />
                Priority support
              </li>
            </ul>
            <motion.button
              className="w-full py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: colors.accent.primary,
                color: colors.text.inverse,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Upgrade Now
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
