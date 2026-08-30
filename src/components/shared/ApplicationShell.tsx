import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import NavigationRail, { NavigationItem } from './NavigationRail';
import { colors, layout, breakpoints } from '../../styles/design-tokens';

interface ApplicationShellProps {
  activeView: NavigationItem;
  onViewChange: (view: NavigationItem) => void;
  children: React.ReactNode;
  userName?: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

export default function ApplicationShell({
  activeView,
  onViewChange,
  children,
  userName,
  avatarUrl,
  onLogout,
}: ApplicationShellProps) {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < parseInt(breakpoints.lg));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoints.lg]);

  // Auto-collapse navigation on mobile
  useEffect(() => {
    if (isMobile) {
      setIsNavCollapsed(true);
    }
  }, [isMobile]);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        backgroundColor: colors.background.base,
        color: colors.text.primary,
      }}
    >
      {/* Navigation Rail */}
      <NavigationRail
        activeView={activeView}
        onViewChange={onViewChange}
        isCollapsed={isNavCollapsed}
        onCollapseToggle={() => setIsNavCollapsed(!isNavCollapsed)}
        userName={userName}
        avatarUrl={avatarUrl}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <motion.main
        className="flex-1 overflow-hidden relative"
        initial={false}
        animate={{
          marginLeft: isNavCollapsed ? layout.navigation.collapsedWidth : layout.navigation.expandedWidth,
        }}
        transition={{ duration: 200, ease: 'easeInOut' }}
      >
        {/* Content with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 200, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.main>

      {/* Mobile Bottom Navigation (shown on mobile/tablet) */}
      {isMobile && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 border-t lg:hidden"
          style={{
            backgroundColor: colors.background.surface,
            borderColor: colors.border.subtle,
            zIndex: 30,
          }}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 200 }}
        >
          <div className="flex justify-around py-2">
            {[
              { id: 'chat' as NavigationItem, icon: '💬', label: 'Chat' },
              { id: 'studio' as NavigationItem, icon: '⚡', label: 'Studio' },
              { id: 'learning' as NavigationItem, icon: '📚', label: 'Learn' },
              { id: 'help' as NavigationItem, icon: '❓', label: 'Help' },
              { id: 'settings' as NavigationItem, icon: '⚙️', label: 'Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px]"
                style={{
                  color: activeView === item.id ? colors.accent.primary : colors.text.tertiary,
                  backgroundColor: activeView === item.id ? colors.accent.subtle : 'transparent',
                }}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span style={{ fontSize: '11px' }}>{item.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
