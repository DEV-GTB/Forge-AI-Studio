import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Code2, 
  BookOpen, 
  HelpCircle, 
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { colors, layout, spacing, borderRadius, animation } from '../../styles/design-tokens';

export type NavigationItem = 'chat' | 'studio' | 'learning' | 'help' | 'settings';

interface NavigationRailProps {
  activeView: NavigationItem;
  onViewChange: (view: NavigationItem) => void;
  isCollapsed?: boolean;
  onCollapseToggle?: () => void;
  userName?: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

const navigationItems = [
  { id: 'chat' as NavigationItem, icon: MessageSquare, label: 'Chat' },
  { id: 'studio' as NavigationItem, icon: Code2, label: 'Studio' },
  { id: 'learning' as NavigationItem, icon: BookOpen, label: 'Learning' },
  { id: 'help' as NavigationItem, icon: HelpCircle, label: 'Help' },
  { id: 'settings' as NavigationItem, icon: Settings, label: 'Settings' },
];

export default function NavigationRail({
  activeView,
  onViewChange,
  isCollapsed = false,
  onCollapseToggle,
  userName = 'Creator',
  avatarUrl = '',
  onLogout,
}: NavigationRailProps) {
  const [showAccountPanel, setShowAccountPanel] = useState(false);

  return (
    <>
      <motion.nav
        className="flex flex-col h-full border-r"
        style={{
          width: isCollapsed ? layout.navigation.collapsedWidth : layout.navigation.expandedWidth,
          backgroundColor: colors.background.surface,
          borderColor: colors.border.subtle,
        }}
        initial={false}
        animate={{ width: isCollapsed ? layout.navigation.collapsedWidth : layout.navigation.expandedWidth }}
        transition={{ duration: 200, ease: 'easeInOut' }}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-center p-4 border-b" style={{ borderColor: colors.border.subtle }}>
          <motion.div
            className="flex items-center justify-center"
            animate={{ scale: isCollapsed ? 0.8 : 1 }}
            transition={{ duration: 150 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${colors.accent.primary}, ${colors.accent.active})`,
              }}
            >
              <Code2 size={20} color={colors.text.inverse} />
            </div>
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 150 }}
                className="ml-3 font-semibold"
                style={{ color: colors.text.primary, fontSize: '14px' }}
              >
                Forge AI Studio
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 flex flex-col gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className="relative flex items-center px-4 py-3 mx-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: isActive ? colors.accent.subtle : 'transparent',
                  color: isActive ? colors.accent.primary : colors.text.secondary,
                }}
                whileHover={{ backgroundColor: isActive ? colors.accent.subtle : colors.background.elevated }}
                whileTap={{ scale: 0.98 }}
                title={isCollapsed ? item.label : undefined}
              >
                <motion.div
                  animate={{ scale: isCollapsed ? 1 : 1 }}
                  transition={{ duration: 150 }}
                >
                  <Icon size={layout.navigation.iconSize} />
                </motion.div>

                {/* Active Indicator Pill */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 w-1 h-8 rounded-r-full"
                    style={{ backgroundColor: colors.accent.primary }}
                    layoutId="activeIndicator"
                    initial={false}
                    transition={{ duration: 200, ease: 'easeInOut' }}
                  />
                )}

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 150 }}
                      className="ml-3 font-medium"
                      style={{ fontSize: '14px' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Collapse Toggle */}
        <div className="px-2 pb-2">
          <motion.button
            onClick={onCollapseToggle}
            className="flex items-center justify-center w-full p-2 rounded-lg transition-colors"
            style={{
              color: colors.text.tertiary,
            }}
            whileHover={{ backgroundColor: colors.background.elevated, color: colors.text.secondary }}
            whileTap={{ scale: 0.98 }}
            title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </motion.button>
        </div>

        {/* Profile / Account */}
        <div className="p-2 border-t" style={{ borderColor: colors.border.subtle }}>
          <motion.button
            onClick={() => setShowAccountPanel(!showAccountPanel)}
            className="flex items-center w-full p-2 rounded-lg transition-colors"
            style={{
              color: colors.text.secondary,
            }}
            whileHover={{ backgroundColor: colors.background.elevated }}
            whileTap={{ scale: 0.98 }}
            title="Account"
          >
            {/* Avatar */}
            <motion.div
              className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden"
              style={{
                backgroundColor: colors.accent.primary,
                flexShrink: 0,
              }}
              animate={{ scale: isCollapsed ? 1 : 1 }}
              transition={{ duration: 150 }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <User size={18} color={colors.text.inverse} />
              )}
            </motion.div>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 150 }}
                  className="ml-3 text-left flex-1"
                >
                  <div
                    className="font-medium truncate"
                    style={{ fontSize: '13px', color: colors.text.primary }}
                  >
                    {userName}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: colors.text.tertiary }}
                  >
                    Account
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* Account Panel (Contextual) */}
      <AnimatePresence>
        {showAccountPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAccountPanel(false)}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: colors.background.overlay }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 150 }}
              className="fixed bottom-4 left-4 z-50 w-64 rounded-xl border shadow-xl overflow-hidden"
              style={{
                backgroundColor: colors.background.floating,
                borderColor: colors.border.default,
              }}
            >
              {/* Account Header */}
              <div className="p-4 border-b" style={{ borderColor: colors.border.subtle }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: colors.accent.primary }}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} color={colors.text.inverse} />
                    )}
                  </div>
                  <div>
                    <div
                      className="font-semibold"
                      style={{ color: colors.text.primary, fontSize: '14px' }}
                    >
                      {userName}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: colors.text.tertiary }}
                    >
                      Account Settings
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="p-2">
                <button
                  onClick={() => {
                    onViewChange('settings');
                    setShowAccountPanel(false);
                  }}
                  className="flex items-center w-full p-3 rounded-lg transition-colors text-left"
                  style={{
                    color: colors.text.secondary,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.background.elevated}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Settings size={18} className="mr-3" />
                  <span style={{ fontSize: '14px' }}>Settings</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setShowAccountPanel(false);
                    }}
                    className="flex items-center w-full p-3 rounded-lg transition-colors text-left"
                    style={{
                      color: colors.semantic.error,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.background.elevated}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={18} className="mr-3" />
                    <span style={{ fontSize: '14px' }}>Log Out</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
