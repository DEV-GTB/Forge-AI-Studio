import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Bot, User, Copy, Check, RefreshCw, 
  Sparkles, Plus, History, X, MoreVertical, 
  Paperclip, Mic, Image as ImageIcon, Code, Search
} from "lucide-react";
import { colors, spacing, borderRadius, animation, components, typography, layout } from "../../styles/design-tokens";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RedesignedChatViewProps {
  userName: string;
  onOpenProjectView?: () => void;
  isGuest?: boolean;
  dailyQueries?: number;
  setDailyQueries?: React.Dispatch<React.SetStateAction<number>>;
}

const STARTER_PROMPTS = [
  "Create a website for my portfolio",
  "Explain this error in my code",
  "Plan a game development project",
  "Learn React fundamentals",
  "Review and improve my code"
];

export default function RedesignedChatView({
  userName,
  onOpenProjectView,
  isGuest,
  dailyQueries,
  setDailyQueries,
}: RedesignedChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you want to: "${userMessage.content}". Let me help you with that. This is a simulated response for the redesigned chat interface.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleCopy = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleStarterPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Chat Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ 
            backgroundColor: colors.background.surface,
            borderColor: colors.border.subtle,
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
                className="font-semibold text-lg"
                style={{ color: colors.text.primary }}
              >
                Chat
              </h1>
              <p 
                className="text-xs"
                style={{ color: colors.text.tertiary }}
              >
                Ask Forge AI anything
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setShowHistoryDrawer(true)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: colors.text.secondary }}
              whileHover={{ backgroundColor: colors.background.elevated }}
              whileTap={{ scale: 0.95 }}
              title="Chat History"
            >
              <History size={20} />
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
                transition={{ duration: animation.duration.base }}
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
                  What can I help you build?
                </h2>
                <p 
                  className="text-sm mb-8"
                  style={{ color: colors.text.secondary }}
                >
                  Start a conversation or try one of these prompts
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                  {STARTER_PROMPTS.map((prompt) => (
                    <motion.button
                      key={prompt}
                      onClick={() => handleStarterPrompt(prompt)}
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
                  transition={{ duration: animation.duration.base }}
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
                      <Bot size={16} style={{ color: colors.text.secondary }} />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`max-w-2xl ${message.role === 'user' ? 'text-right' : ''}`}
                  >
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
                    <div className="flex items-center gap-2 mt-2 opacity-0 hover:opacity-100 transition-opacity">
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
                  <Bot size={16} style={{ color: colors.text.secondary }} />
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
          className="px-6 py-4 border-t"
          style={{ 
            backgroundColor: colors.background.surface,
            borderColor: colors.border.subtle,
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div
              className="flex items-end gap-3 p-3 rounded-xl transition-all"
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
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-2 rounded-lg transition-colors shrink-0"
                style={{ 
                  color: inputValue.trim() ? colors.accent.primary : colors.text.tertiary,
                  backgroundColor: inputValue.trim() ? colors.accent.subtle : 'transparent',
                }}
                whileHover={inputValue.trim() ? { backgroundColor: colors.accent.subtle } : {}}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={18} />
              </motion.button>
            </div>

            {/* Query Limit Indicator */}
            {isGuest && dailyQueries !== undefined && (
              <div className="flex items-center justify-center mt-3">
                <p 
                  className="text-xs"
                  style={{ color: colors.text.tertiary }}
                >
                  {dailyQueries} / 10 daily queries used
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Drawer */}
      <AnimatePresence>
        {showHistoryDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryDrawer(false)}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 z-50"
              style={{ backgroundColor: colors.background.surface }}
            >
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: colors.border.subtle }}>
                <h3 
                  className="font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Chat History
                </h3>
                <motion.button
                  onClick={() => setShowHistoryDrawer(false)}
                  className="p-1 rounded transition-colors"
                  style={{ color: colors.text.tertiary }}
                  whileHover={{ color: colors.text.secondary }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
              
              <div className="p-4">
                <p 
                  className="text-sm text-center"
                  style={{ color: colors.text.tertiary }}
                >
                  No chat history yet
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
