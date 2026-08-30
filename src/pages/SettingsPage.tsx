import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layout, Sparkles, FolderOpen, Settings, Zap, ChevronRight,
  Search, Palette, Type, Sliders, Monitor, Bell, Shield,
  User, Terminal, Puzzle, MoreVertical, Check, X,
  Sun, Moon, Eye, Grid, Waves, Globe, Download,
  RefreshCw, RotateCcw, Info, Plus, CheckCircle
} from 'lucide-react';
import { colors, typography, spacing, borderRadius, shadow, animation } from '../styles/design-tokens';

interface SettingsPageProps {
  onNavigateToPage?: (page: string) => void;
}

export default function SettingsPage({ onNavigateToPage }: SettingsPageProps) {
  const [selectedSection, setSelectedSection] = useState('appearance');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    { id: 'editor', label: 'Editor', icon: <Type size={18} /> },
    { id: 'ai-behavior', label: 'AI Behavior', icon: <Sparkles size={18} /> },
    { id: 'projects', label: 'Projects', icon: <FolderOpen size={18} /> },
    { id: 'terminal', label: 'Terminal', icon: <Terminal size={18} /> },
    { id: 'extensions', label: 'Extensions', icon: <Puzzle size={18} /> },
    { id: 'account', label: 'Account', icon: <User size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'advanced', label: 'Advanced', icon: <MoreVertical size={18} /> },
  ];

  const themes = [
    { id: 'obsidian', name: 'Obsidian', description: 'Deep dark', selected: true },
    { id: 'nebula', name: 'Nebula', description: 'Dark purple', selected: false },
    { id: 'aurora', name: 'Aurora', description: 'Deep blue', selected: false },
    { id: 'light', name: 'Light', description: 'Clean & bright', selected: false },
    { id: 'solarized', name: 'Solarized', description: 'Soft & warm', selected: false },
  ];

  const accentColors = [
    { color: '#f97316', name: 'Orange' },
    { color: '#3b82f6', name: 'Blue' },
    { color: '#10b981', name: 'Green' },
    { color: '#ef4444', name: 'Red' },
    { color: '#8b5cf6', name: 'Purple' },
    { color: '#ec4899', name: 'Pink' },
  ];

  const fontFamilies = ['Inter', 'JetBrains Mono', 'Fira Code', 'Source Code Pro'];
  const uiDensities = ['Compact', 'Comfortable', 'Spacious'];
  const backgroundStyles = ['Grid', 'Waves', 'Particles', 'Gradient', 'None'];

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
          { icon: <Settings size={24} />, label: 'Settings', active: true },
          { icon: <Info size={24} />, label: 'Help', active: false },
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
      <div className="flex-1 ml-16 flex">
        {/* Settings Sidebar */}
        <div 
          className="w-64 flex flex-col"
          style={{ 
            backgroundColor: colors.background.surface,
            borderRight: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div className="p-6">
            <h1 
              className="text-2xl font-semibold mb-2"
              style={{ color: colors.text.primary }}
            >
              SETTINGS
            </h1>
            <p 
              className="text-sm mb-6"
              style={{ color: colors.text.secondary }}
            >
              Customize your Forge AI Studio experience.
            </p>

            {/* Search */}
            <div className="relative mb-6">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: colors.text.tertiary }}
              />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: colors.background.base,
                  border: `1px solid ${colors.border.subtle}`,
                  color: colors.text.primary,
                }}
              />
            </div>

            {/* Sections */}
            <div className="space-y-1">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left"
                  style={{
                    backgroundColor: selectedSection === section.id 
                      ? colors.accent.subtle 
                      : 'transparent',
                  }}
                  whileHover={{ backgroundColor: colors.background.elevated }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div style={{ color: selectedSection === section.id ? colors.accent.primary : colors.text.secondary }}>
                    {section.icon}
                  </div>
                  <span 
                    className="text-sm"
                    style={{ color: selectedSection === section.id ? colors.text.primary : colors.text.secondary }}
                  >
                    {section.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 flex">
          {/* Main Settings Panel */}
          <div className="flex-1 p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              {selectedSection === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 
                    className="text-xl font-semibold mb-6"
                    style={{ color: colors.text.primary }}
                  >
                    Appearance
                  </h2>

                  {/* Theme */}
                  <div className="mb-8">
                    <h3 
                      className="text-sm font-medium mb-4"
                      style={{ color: colors.text.secondary }}
                    >
                      Theme
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {themes.map((theme) => (
                        <motion.button
                          key={theme.id}
                          className="p-4 rounded-xl text-left"
                          style={{
                            backgroundColor: colors.background.surface,
                            border: theme.selected 
                              ? `2px solid ${colors.accent.primary}` 
                              : `1px solid ${colors.border.subtle}`,
                          }}
                          whileHover={{ borderColor: colors.border.focus }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div 
                            className="w-full h-20 rounded-lg mb-3"
                            style={{ 
                              backgroundColor: theme.id === 'light' 
                                ? '#f5f5f5' 
                                : colors.background.base,
                            }}
                          />
                          <div 
                            className="font-medium text-sm mb-1"
                            style={{ color: colors.text.primary }}
                          >
                            {theme.name}
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: colors.text.tertiary }}
                          >
                            {theme.description}
                          </div>
                          {theme.selected && (
                            <div 
                              className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: colors.accent.primary }}
                            >
                              <Check size={12} style={{ color: colors.text.inverse }} />
                            </div>
                          )}
                        </motion.button>
                      ))}
                      <motion.button
                        className="p-4 rounded-xl text-center border-2 border-dashed"
                        style={{
                          backgroundColor: colors.background.surface,
                          borderColor: colors.border.subtle,
                        }}
                        whileHover={{ borderColor: colors.border.focus }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus size={20} style={{ color: colors.text.tertiary }} />
                        <div 
                          className="text-sm mt-2"
                          style={{ color: colors.text.secondary }}
                        >
                          Custom Theme
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="mb-8">
                    <h3 
                      className="text-sm font-medium mb-4"
                      style={{ color: colors.text.secondary }}
                    >
                      Accent Color
                    </h3>
                    <div className="flex gap-3">
                      {accentColors.map((accent) => (
                        <motion.button
                          key={accent.name}
                          className="w-10 h-10 rounded-full relative"
                          style={{ backgroundColor: accent.color }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {accent.color === colors.accent.primary && (
                            <Check 
                              size={16} 
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                              style={{ color: colors.text.inverse }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="mb-8">
                    <h3 
                      className="text-sm font-medium mb-4"
                      style={{ color: colors.text.secondary }}
                    >
                      Font Family
                    </h3>
                    <select
                      className="w-full px-4 py-3 rounded-lg outline-none"
                      style={{
                        backgroundColor: colors.background.surface,
                        border: `1px solid ${colors.border.subtle}`,
                        color: colors.text.primary,
                      }}
                    >
                      {fontFamilies.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size */}
                  <div className="mb-8">
                    <h3 
                      className="text-sm font-medium mb-4"
                      style={{ color: colors.text.secondary }}
                    >
                      Font Size
                    </h3>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="12"
                        max="20"
                        defaultValue="14"
                        className="flex-1"
                        style={{ accentColor: colors.accent.primary }}
                      />
                      <div 
                        className="px-3 py-2 rounded-lg"
                        style={{ backgroundColor: colors.background.surface }}
                      >
                        <span 
                          className="text-sm font-medium"
                          style={{ color: colors.text.primary }}
                        >
                          14px
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* UI Density */}
                  <div className="mb-8">
                    <h3 
                      className="text-sm font-medium mb-4"
                      style={{ color: colors.text.secondary }}
                    >
                      UI Density
                    </h3>
                    <div className="flex gap-2">
                      {uiDensities.map((density) => (
                        <motion.button
                          key={density}
                          className="flex-1 px-4 py-2 rounded-lg text-sm"
                          style={{
                            backgroundColor: density === 'Comfortable' 
                              ? colors.accent.subtle 
                              : colors.background.surface,
                            border: density === 'Comfortable' 
                              ? `1px solid ${colors.accent.primary}` 
                              : `1px solid ${colors.border.subtle}`,
                            color: density === 'Comfortable' 
                              ? colors.accent.primary 
                              : colors.text.secondary,
                          }}
                          whileHover={{ backgroundColor: colors.background.elevated }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {density}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Animations */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between">
                      <h3 
                        className="text-sm font-medium"
                        style={{ color: colors.text.secondary }}
                      >
                        Animations
                      </h3>
                      <motion.button
                        className="w-12 h-6 rounded-full relative"
                        style={{ backgroundColor: colors.accent.primary }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div 
                          className="absolute right-1 top-1 w-4 h-4 rounded-full"
                          style={{ backgroundColor: colors.text.inverse }}
                        />
                      </motion.button>
                    </div>
                  </div>

                  {/* Background Style */}
                  <div className="mb-8">
                    <h3 
                      className="text-sm font-medium mb-4"
                      style={{ color: colors.text.secondary }}
                    >
                      Background Style
                    </h3>
                    <div className="flex gap-2">
                      {backgroundStyles.map((style) => (
                        <motion.button
                          key={style}
                          className="flex-1 px-4 py-2 rounded-lg text-sm"
                          style={{
                            backgroundColor: style === 'Grid' 
                              ? colors.accent.subtle 
                              : colors.background.surface,
                            border: style === 'Grid' 
                              ? `1px solid ${colors.accent.primary}` 
                              : `1px solid ${colors.border.subtle}`,
                            color: style === 'Grid' 
                              ? colors.accent.primary 
                              : colors.text.secondary,
                          }}
                          whileHover={{ backgroundColor: colors.background.elevated }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {style}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar */}
          <div 
            className="w-80 p-6 flex flex-col"
            style={{ 
              backgroundColor: colors.background.surface,
              borderLeft: `1px solid ${colors.border.subtle}`,
            }}
          >
            {/* Theme Preview */}
            <div 
              className="p-4 rounded-xl mb-6"
              style={{ backgroundColor: colors.background.base }}
            >
              <h3 
                className="text-sm font-medium mb-3"
                style={{ color: colors.text.primary }}
              >
                Theme Preview
              </h3>
              <div 
                className="w-full h-32 rounded-lg mb-3"
                style={{ 
                  backgroundColor: colors.background.surface,
                  border: `1px solid ${colors.border.subtle}`,
                }}
              >
                <div className="p-3">
                  <div 
                    className="w-8 h-8 rounded mb-2"
                    style={{ backgroundColor: colors.accent.subtle }}
                  />
                  <div 
                    className="h-2 rounded mb-1"
                    style={{ backgroundColor: colors.border.subtle, width: '60%' }}
                  />
                  <div 
                    className="h-2 rounded"
                    style={{ backgroundColor: colors.border.subtle, width: '40%' }}
                  />
                </div>
              </div>
              <div 
                className="text-xs mb-3"
                style={{ color: colors.text.secondary }}
              >
                Obsidian theme with orange accent
              </div>
              <motion.button
                className="w-full py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: colors.background.elevated,
                  color: colors.text.secondary,
                  border: `1px solid ${colors.border.subtle}`,
                }}
                whileHover={{ backgroundColor: colors.background.floating }}
                whileTap={{ scale: 0.98 }}
              >
                Preview in Studio
              </motion.button>
            </div>

            {/* About Forge AI Studio */}
            <div 
              className="p-4 rounded-xl mb-6"
              style={{ backgroundColor: colors.background.base }}
            >
              <h3 
                className="text-sm font-medium mb-3"
                style={{ color: colors.text.primary }}
              >
                About Forge AI Studio
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: colors.text.tertiary }}>Version</span>
                  <span style={{ color: colors.text.secondary }}>2.3.1</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.text.tertiary }}>Build</span>
                  <span style={{ color: colors.text.secondary }}>2024.05.20</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.text.tertiary }}>Engine</span>
                  <span style={{ color: colors.text.secondary }}>Forge Core 1.8.4</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.text.tertiary }}>AI Models</span>
                  <span style={{ color: colors.text.secondary }}>Gemini 1.5 Pro</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.text.tertiary }}>License</span>
                  <span style={{ color: colors.text.secondary }}>Pro Plan</span>
                </div>
              </div>
              <motion.button
                className="w-full mt-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                style={{
                  backgroundColor: colors.background.elevated,
                  color: colors.text.secondary,
                  border: `1px solid ${colors.border.subtle}`,
                }}
                whileHover={{ backgroundColor: colors.background.floating }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw size={14} />
                Check for Updates
              </motion.button>
              <div 
                className="text-xs mt-2 text-center"
                style={{ color: colors.text.tertiary }}
              >
                Last checked: 2 hours ago
              </div>
            </div>

            {/* Quick Actions */}
            <div 
              className="p-4 rounded-xl mb-6"
              style={{ backgroundColor: colors.background.base }}
            >
              <h3 
                className="text-sm font-medium mb-3"
                style={{ color: colors.text.primary }}
              >
                Quick Actions
              </h3>
              <div className="space-y-2">
                <motion.button
                  className="w-full py-2 rounded-lg text-sm flex items-center gap-2"
                  style={{
                    backgroundColor: colors.background.elevated,
                    color: colors.text.secondary,
                  }}
                  whileHover={{ backgroundColor: colors.background.floating }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw size={14} />
                  Reset All Settings
                </motion.button>
                <motion.button
                  className="w-full py-2 rounded-lg text-sm flex items-center gap-2"
                  style={{
                    backgroundColor: colors.background.elevated,
                    color: colors.text.secondary,
                  }}
                  whileHover={{ backgroundColor: colors.background.floating }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={14} />
                  Export Settings
                </motion.button>
              </div>
            </div>

            {/* Sync Status */}
            <div className="mt-auto">
              <div 
                className="flex items-center gap-2 text-xs"
                style={{ color: colors.text.tertiary }}
              >
                <CheckCircle size={12} style={{ color: colors.semantic.success }} />
                <span>Your settings are synced</span>
              </div>
              <div 
                className="text-xs mt-1"
                style={{ color: colors.semantic.success }}
              >
                All good!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
