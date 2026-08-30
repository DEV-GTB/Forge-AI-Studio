import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Clock, CheckCircle, AlertCircle, 
  MoreVertical, Star, FolderOpen, Settings, User,
  Sparkles, Zap, Layout, Terminal, Play, ArrowRight,
  ChevronRight, Filter, Grid, List
} from 'lucide-react';
import { colors, typography, spacing, borderRadius, shadow, animation } from '../styles/design-tokens';

interface Project {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  buildStatus: 'success' | 'failed' | 'pending';
  testStatus: 'passed' | 'failed' | 'pending';
  preview?: string;
  language: string;
}

interface Activity {
  id: string;
  type: 'forge' | 'user' | 'system';
  message: string;
  timestamp: string;
  icon?: React.ReactNode;
}

interface HomePageProps {
  onNavigateToPage?: (page: string) => void;
  onOpenProject?: (projectId: string) => void;
}

export default function HomePage({ onNavigateToPage, onOpenProject }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const projects: Project[] = [
    {
      id: '1',
      name: 'Football Dashboard',
      description: 'Analytics dashboard with player stats and match history',
      lastModified: '12 minutes ago',
      buildStatus: 'success',
      testStatus: 'passed',
      language: 'TypeScript',
    },
    {
      id: '2',
      name: 'E-Commerce Platform',
      description: 'Full-stack shopping platform with payment integration',
      lastModified: '2 hours ago',
      buildStatus: 'success',
      testStatus: 'passed',
      language: 'Python',
    },
    {
      id: '3',
      name: 'Task Manager API',
      description: 'REST API for task management with authentication',
      lastModified: 'Yesterday',
      buildStatus: 'failed',
      testStatus: 'failed',
      language: 'Node.js',
    },
    {
      id: '4',
      name: 'Portfolio Website',
      description: 'Personal portfolio with project showcase',
      lastModified: '3 days ago',
      buildStatus: 'success',
      testStatus: 'passed',
      language: 'React',
    },
    {
      id: '5',
      name: 'Weather App',
      description: 'Real-time weather application with forecasts',
      lastModified: '1 week ago',
      buildStatus: 'pending',
      testStatus: 'pending',
      language: 'Vue.js',
    },
  ];

  const activities: Activity[] = [
    {
      id: '1',
      type: 'forge',
      message: 'Forge updated authentication flow',
      timestamp: '10 minutes ago',
      icon: <Sparkles size={16} style={{ color: colors.accent.primary }} />,
    },
    {
      id: '2',
      type: 'user',
      message: 'You changed the dashboard layout',
      timestamp: '25 minutes ago',
      icon: <User size={16} style={{ color: colors.text.secondary }} />,
    },
    {
      id: '3',
      type: 'forge',
      message: 'Forge fixed three build errors',
      timestamp: '1 hour ago',
      icon: <CheckCircle size={16} style={{ color: colors.semantic.success }} />,
    },
    {
      id: '4',
      type: 'system',
      message: 'Project deployed successfully',
      timestamp: '2 hours ago',
      icon: <Zap size={16} style={{ color: colors.semantic.info }} />,
    },
  ];

  const quickActions = [
    { icon: <Plus size={20} />, label: 'New Project', action: 'new' },
    { icon: <FolderOpen size={20} />, label: 'Import Project', action: 'import' },
    { icon: <Sparkles size={20} />, label: 'Ask Forge', action: 'ask' },
    { icon: <Layout size={20} />, label: 'Open Workspace', action: 'workspace' },
    { icon: <Terminal size={20} />, label: 'Blueprints', action: 'blueprints' },
    { icon: <Play size={20} />, label: 'Image Studio', action: 'image' },
  ];

  const getStatusIcon = (status: 'success' | 'failed' | 'pending' | 'passed') => {
    switch (status) {
      case 'success':
      case 'passed':
        return <CheckCircle size={14} style={{ color: colors.semantic.success }} />;
      case 'failed':
        return <AlertCircle size={14} style={{ color: colors.semantic.error }} />;
      case 'pending':
        return <Clock size={14} style={{ color: colors.text.tertiary }} />;
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openProject = (projectId: string) => {
    onOpenProject?.(projectId);
    onNavigateToPage?.('studio');
  };

  const handleQuickAction = (action: string) => {
    if (action === 'ask') {
      onNavigateToPage?.('chat');
      return;
    }

    if (action === 'new' || action === 'workspace' || action === 'blueprints' || action === 'image') {
      onNavigateToPage?.('studio');
      return;
    }

    onNavigateToPage?.('home');
  };

  return (
    <div 
      className="min-h-screen"
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

      {/* Top Bar */}
      <div 
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          backgroundColor: colors.background.surface,
          borderBottom: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div className="flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.accent.subtle }}
            >
              <Sparkles size={18} style={{ color: colors.accent.primary }} />
            </div>
            <span 
              className="font-semibold text-lg"
              style={{ color: colors.text.primary }}
            >
              FORGE AI STUDIO
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: colors.text.tertiary }}
              />
              <input
                type="text"
                placeholder="Search projects, files, commands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: colors.background.base,
                  border: `1px solid ${colors.border.subtle}`,
                  color: colors.text.primary,
                }}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <motion.button
              className="p-2 rounded-lg transition-colors"
              style={{ color: colors.text.secondary }}
              whileHover={{ backgroundColor: colors.background.elevated }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings size={20} />
            </motion.button>
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.accent.subtle }}
            >
              <span 
                className="font-medium"
                style={{ color: colors.accent.primary }}
              >
                JD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Left Navigation Rail */}
      <div 
        className="fixed left-0 top-16 bottom-0 w-16 flex flex-col items-center py-6 gap-2"
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
          { icon: <Layout size={24} />, label: 'Home', active: true },
          { icon: <Sparkles size={24} />, label: 'Chat', active: false },
          { icon: <FolderOpen size={24} />, label: 'Studio', active: false },
          { icon: <Settings size={24} />, label: 'Settings', active: false },
        ].map((item) => (
          <motion.button
            key={item.label}
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
        <motion.button
          className="w-12 h-12 rounded-xl flex items-center justify-center relative"
          style={{ backgroundColor: colors.background.elevated }}
          whileHover={{ backgroundColor: colors.background.floating }}
          whileTap={{ scale: 0.95 }}
          title="Forge Pro"
        >
          <Zap size={20} style={{ color: colors.accent.primary }} />
        </motion.button>
      </div>

      {/* Main Area */}
      <div className="flex-1 ml-16 p-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 
            className="text-3xl font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            Welcome back
          </h1>
          <p style={{ color: colors.text.secondary }}>
            Continue where you left off or start something new
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 
            className="text-sm font-medium mb-4 uppercase tracking-wide"
            style={{ color: colors.text.tertiary }}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                onClick={() => handleQuickAction(action.action)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="p-4 rounded-xl text-left"
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
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: colors.accent.subtle }}
                >
                  <div style={{ color: colors.accent.primary }}>
                    {action.icon}
                  </div>
                </div>
                <span 
                  className="text-sm font-medium block"
                  style={{ color: colors.text.primary }}
                >
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Continue Working */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-sm font-medium uppercase tracking-wide"
              style={{ color: colors.text.tertiary }}
            >
              Continue Working
            </h2>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setViewMode('grid')}
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: viewMode === 'grid' ? colors.background.elevated : 'transparent',
                  color: viewMode === 'grid' ? colors.text.primary : colors.text.tertiary,
                }}
                whileHover={{ backgroundColor: colors.background.elevated }}
                whileTap={{ scale: 0.95 }}
              >
                <Grid size={18} />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: viewMode === 'list' ? colors.background.elevated : 'transparent',
                  color: viewMode === 'list' ? colors.text.primary : colors.text.tertiary,
                }}
                whileHover={{ backgroundColor: colors.background.elevated }}
                whileTap={{ scale: 0.95 }}
              >
                <List size={18} />
              </motion.button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.button
                  type="button"
                  key={project.id}
                  onClick={() => openProject(project.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="rounded-xl overflow-hidden text-left w-full"
                  style={{
                    backgroundColor: colors.background.surface,
                    border: `1px solid ${colors.border.subtle}`,
                  }}
                  whileHover={{ 
                    borderColor: colors.border.focus,
                    boxShadow: shadow.lg,
                  }}
                >
                  {/* Preview Area */}
                  <div 
                    className="h-32 relative"
                    style={{ backgroundColor: colors.background.base }}
                  >
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${colors.background.elevated} 0%, ${colors.background.base} 100%)`,
                      }}
                    >
                      <Layout size={32} style={{ color: colors.text.tertiary }} />
                    </div>
                    <div 
                      className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: colors.background.surface,
                        color: colors.text.secondary,
                      }}
                    >
                      {project.language}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 
                      className="font-semibold mb-1"
                      style={{ color: colors.text.primary }}
                    >
                      {project.name}
                    </h3>
                    <p 
                      className="text-sm mb-3 line-clamp-2"
                      style={{ color: colors.text.secondary }}
                    >
                      {project.description}
                    </p>

                    {/* Status Indicators */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(project.buildStatus)}
                        <span 
                          className="text-xs"
                          style={{ color: colors.text.tertiary }}
                        >
                          Build
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(project.testStatus)}
                        <span 
                          className="text-xs"
                          style={{ color: colors.text.tertiary }}
                        >
                          Tests
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
                      <span 
                        className="text-xs"
                        style={{ color: colors.text.tertiary }}
                      >
                        {project.lastModified}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: colors.accent.primary }}>
                        Continue
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{
                    backgroundColor: colors.background.surface,
                    border: `1px solid ${colors.border.subtle}`,
                  }}
                  whileHover={{ 
                    borderColor: colors.border.focus,
                    backgroundColor: colors.background.elevated,
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: colors.background.base }}
                  >
                    <FolderOpen size={20} style={{ color: colors.text.tertiary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-semibold mb-1"
                      style={{ color: colors.text.primary }}
                    >
                      {project.name}
                    </h3>
                    <p 
                      className="text-sm truncate"
                      style={{ color: colors.text.secondary }}
                    >
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(project.buildStatus)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(project.testStatus)}
                    </div>
                    <span 
                      className="text-xs"
                      style={{ color: colors.text.tertiary }}
                    >
                      {project.lastModified}
                    </span>
                    <motion.button
                      onClick={() => openProject(project.id)}
                      className="p-2 rounded-lg"
                      style={{ color: colors.accent.primary }}
                      whileHover={{ backgroundColor: colors.accent.subtle }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronRight size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl"
        >
          <h2 
            className="text-sm font-medium mb-4 uppercase tracking-wide"
            style={{ color: colors.text.tertiary }}
          >
            Recent Activity
          </h2>
          <div 
            className="p-4 rounded-xl space-y-4"
            style={{
              backgroundColor: colors.background.surface,
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: colors.background.base }}
                >
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p 
                    className="text-sm"
                    style={{ color: colors.text.primary }}
                  >
                    {activity.message}
                  </p>
                  <span 
                    className="text-xs"
                    style={{ color: colors.text.tertiary }}
                  >
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Status Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          backgroundColor: colors.background.surface,
          borderTop: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div className="flex items-center justify-between px-6 h-8">
          <div className="flex items-center gap-6">
            <span 
              className="text-xs"
              style={{ color: colors.text.tertiary }}
            >
              main
            </span>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={12} style={{ color: colors.semantic.success }} />
              <span 
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                Build ✓
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={12} style={{ color: colors.semantic.success }} />
              <span 
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                Tests ✓
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span 
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                Problems 0
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.semantic.success }}
              />
              <span 
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                Server ●
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} style={{ color: colors.accent.primary }} />
              <span 
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                Forge ✓ Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
