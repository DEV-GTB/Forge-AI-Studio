import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layout, Sparkles, FolderOpen, Settings, Zap, ChevronRight,
  Search, BookOpen, Video, MessageCircle, Mail, Clock,
  ExternalLink, CheckCircle, AlertCircle, Info, Globe,
  Users, FileText, Keyboard, Rocket, HelpCircle,
  ArrowRight, Star, ThumbsUp, Heart, Shield, Eye
} from 'lucide-react';
import { colors, typography, spacing, borderRadius, shadow, animation } from '../styles/design-tokens';

interface HelpPageProps {
  onNavigateToPage?: (page: string) => void;
}

export default function HelpPage({ onNavigateToPage }: HelpPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const helpTopics = [
    { id: 'getting-started', title: 'Getting Started', icon: <Rocket size={24} />, description: 'Quick start guide for new users' },
    { id: 'studio-guide', title: 'Studio Guide', icon: <FolderOpen size={24} />, description: 'Complete workspace tutorial' },
    { id: 'ai-features', title: 'AI Features', icon: <Sparkles size={24} />, description: 'AI-powered development tools' },
    { id: 'projects-files', title: 'Projects & Files', icon: <FileText size={24} />, description: 'Managing your projects' },
    { id: 'account-billing', title: 'Account & Billing', icon: <Users size={24} />, description: 'Account management' },
    { id: 'settings', title: 'Settings', icon: <Settings size={24} />, description: 'Customize your experience' },
    { id: 'shortcuts', title: 'Shortcuts', icon: <Keyboard size={24} />, description: 'Keyboard shortcuts' },
    { id: 'release-notes', title: 'Release Notes', icon: <Info size={24} />, description: 'Latest updates' },
  ];

  const popularArticles = [
    { id: '1', title: 'How to create your first project', views: '12.5K' },
    { id: '2', title: 'Using AI code generation', views: '8.3K' },
    { id: '3', title: 'Setting up your environment', views: '6.7K' },
    { id: '4', title: 'Deploying to production', views: '5.2K' },
  ];

  const resources = [
    { id: 'status', title: 'Status Page', icon: <CheckCircle size={18} />, description: 'System status and uptime' },
    { id: 'community', title: 'Community', icon: <Users size={18} />, description: 'Join our community' },
    { id: 'tutorials', title: 'Video Tutorials', icon: <Video size={18} />, description: 'Watch step-by-step guides' },
  ];

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
          { icon: <Sparkles size={24} />, label: 'Chat', active: false },
          { icon: <FolderOpen size={24} />, label: 'Studio', active: false },
          { icon: <Settings size={24} />, label: 'Settings', active: false },
          { icon: <HelpCircle size={24} />, label: 'Help', active: true },
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

        {/* Forge Pro */}
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

        {/* User */}
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: colors.accent.subtle }}
        >
          <span 
            className="font-medium text-sm"
            style={{ color: colors.accent.primary }}
          >
            JD
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-16 flex overflow-hidden">
        {/* Help Center Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <div 
            className="p-12 text-center"
            style={{ backgroundColor: colors.background.surface }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 
                className="text-4xl font-semibold mb-4"
                style={{ color: colors.text.primary }}
              >
                How can we help you today?
              </h1>
              <p 
                className="text-lg mb-8"
                style={{ color: colors.text.secondary }}
              >
                Search our knowledge base or browse help topics below
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search 
                  size={20} 
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: colors.text.tertiary }}
                />
                <input
                  type="text"
                  placeholder="Search for help articles, guides, and tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-base outline-none"
                  style={{
                    backgroundColor: colors.background.base,
                    border: `1px solid ${colors.border.subtle}`,
                    color: colors.text.primary,
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Browse Help Topics */}
          <div className="p-12">
            <h2 
              className="text-2xl font-semibold mb-8"
              style={{ color: colors.text.primary }}
            >
              Browse Help Topics
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {helpTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-xl cursor-pointer"
                  style={{
                    backgroundColor: colors.background.surface,
                    border: `1px solid ${colors.border.subtle}`,
                  }}
                  whileHover={{ 
                    borderColor: colors.border.focus,
                    backgroundColor: colors.background.elevated,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: colors.accent.subtle }}
                  >
                    <div style={{ color: colors.accent.primary }}>
                      {topic.icon}
                    </div>
                  </div>
                  <h3 
                    className="font-semibold mb-2"
                    style={{ color: colors.text.primary }}
                  >
                    {topic.title}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    {topic.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Still Need Help Section */}
          <div 
            className="p-12"
            style={{ backgroundColor: colors.background.surface }}
          >
            <h2 
              className="text-2xl font-semibold mb-8 text-center"
              style={{ color: colors.text.primary }}
            >
              Still Need Help?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-xl text-center"
                style={{ backgroundColor: colors.background.base }}
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: colors.semantic.success }}
                >
                  <Clock size={32} style={{ color: colors.text.inverse }} />
                </div>
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Fast Response
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: colors.text.secondary }}
                >
                  Get answers within 24 hours
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-xl text-center"
                style={{ backgroundColor: colors.background.base }}
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: colors.accent.primary }}
                >
                  <Users size={32} style={{ color: colors.text.inverse }} />
                </div>
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Human Support
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: colors.text.secondary }}
                >
                  Talk to real experts
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-xl text-center"
                style={{ backgroundColor: colors.background.base }}
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: colors.semantic.info }}
                >
                  <Heart size={32} style={{ color: colors.text.inverse }} />
                </div>
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: colors.text.primary }}
                >
                  We Care
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: colors.text.secondary }}
                >
                  Dedicated to your success
                </p>
              </motion.div>
            </div>

            <div className="text-center mt-8">
              <motion.button
                className="px-8 py-4 rounded-xl font-medium flex items-center gap-2 mx-auto"
                style={{
                  backgroundColor: colors.accent.primary,
                  color: colors.text.inverse,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle size={20} />
                Contact Support
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div 
          className="w-80 p-6 flex flex-col"
          style={{ 
            backgroundColor: colors.background.surface,
            borderLeft: `1px solid ${colors.border.subtle}`,
          }}
        >
          {/* Contact Support */}
          <div 
            className="p-4 rounded-xl mb-6"
            style={{ backgroundColor: colors.background.base }}
          >
            <h3 
              className="text-sm font-medium mb-4"
              style={{ color: colors.text.primary }}
            >
              Contact Support
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={16} style={{ color: colors.text.tertiary }} />
                <div>
                  <div 
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    support@forgeai.studio
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: colors.text.tertiary }}
                  >
                    Response: &lt; 24h
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle size={16} style={{ color: colors.text.tertiary }} />
                <div>
                  <div 
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Live Chat
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: colors.text.tertiary }}
                  >
                    Response: &lt; 5m
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Articles */}
          <div 
            className="p-4 rounded-xl mb-6"
            style={{ backgroundColor: colors.background.base }}
          >
            <h3 
              className="text-sm font-medium mb-4"
              style={{ color: colors.text.primary }}
            >
              Popular Articles
            </h3>
            <div className="space-y-3">
              {popularArticles.map((article) => (
                <motion.button
                  key={article.id}
                  className="w-full text-left p-2 rounded hover:bg-opacity-50"
                  style={{ color: colors.text.secondary }}
                  whileHover={{ backgroundColor: colors.background.elevated }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-sm mb-1">{article.title}</div>
                  <div 
                    className="text-xs flex items-center gap-1"
                    style={{ color: colors.text.tertiary }}
                  >
                    <Eye size={12} />
                    {article.views} views
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div 
            className="p-4 rounded-xl mb-6"
            style={{ backgroundColor: colors.background.base }}
          >
            <h3 
              className="text-sm font-medium mb-4"
              style={{ color: colors.text.primary }}
            >
              Resources
            </h3>
            <div className="space-y-2">
              {resources.map((resource) => (
                <motion.button
                  key={resource.id}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left"
                  style={{ backgroundColor: colors.background.elevated }}
                  whileHover={{ backgroundColor: colors.background.floating }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div style={{ color: colors.accent.primary }}>
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <div 
                      className="text-sm font-medium"
                      style={{ color: colors.text.primary }}
                    >
                      {resource.title}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: colors.text.tertiary }}
                    >
                      {resource.description}
                    </div>
                  </div>
                  <ExternalLink size={14} style={{ color: colors.text.tertiary }} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="mt-auto">
            <div 
              className="p-4 rounded-xl"
              style={{ backgroundColor: colors.background.base }}
            >
              <div className="flex items-center justify-between mb-2">
                <span 
                  className="text-sm font-medium"
                  style={{ color: colors.text.primary }}
                >
                  System Status
                </span>
                <div 
                  className="flex items-center gap-1.5"
                  style={{ color: colors.semantic.success }}
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.semantic.success }}
                  />
                  <span className="text-xs">Operational</span>
                </div>
              </div>
              <div 
                className="text-xs"
                style={{ color: colors.text.tertiary }}
              >
                All systems are running normally
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
