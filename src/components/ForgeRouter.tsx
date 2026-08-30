import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import VisitingPage from '../pages/VisitingPage';
import HomePage from '../pages/HomePage';
import ChatPage from '../pages/ChatPage';
import StudioPage from '../pages/StudioPage';
import SettingsPage from '../pages/SettingsPage';
import HelpPage from '../pages/HelpPage';
import { colors } from '../styles/design-tokens';

type PageType = 'visiting' | 'home' | 'chat' | 'studio' | 'settings' | 'help';

interface ForgeRouterProps {
  initialPage?: PageType;
  isAuthenticated?: boolean;
}

export default function ForgeRouter({ 
  initialPage = 'visiting',
  isAuthenticated = false 
}: ForgeRouterProps) {
  const [currentPage, setCurrentPage] = useState<PageType>(initialPage);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(isAuthenticated);

  // Handle page navigation
  const navigateToPage = (page: string) => {
    const pageMap: Record<string, PageType> = {
      'visiting': 'visiting',
      'home': 'home',
      'chat': 'chat',
      'studio': 'studio',
      'settings': 'settings',
      'help': 'help',
    };
    
    const targetPage = pageMap[page.toLowerCase()];
    if (targetPage) {
      setCurrentPage(targetPage);
    }
  };

  // Handle authentication
  const handleAuthentication = (authenticated: boolean) => {
    setIsAuthenticatedState(authenticated);
    if (authenticated) {
      setCurrentPage('home');
    } else {
      setCurrentPage('visiting');
    }
  };

  // Handle project opening
  const handleOpenProject = (projectId: string) => {
    console.log('Opening project:', projectId);
    setCurrentPage('studio');
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: colors.background.base,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <AnimatePresence mode="wait">
        {currentPage === 'visiting' && (
          <VisitingPage 
            key="visiting"
            onStartBuilding={() => {
              handleAuthentication(true);
              setCurrentPage('home');
            }}
          />
        )}

        {currentPage === 'home' && (
          <HomePage 
            key="home"
            onNavigateToPage={navigateToPage}
            onOpenProject={handleOpenProject}
          />
        )}

        {currentPage === 'chat' && (
          <ChatPage 
            key="chat"
            onNavigateToPage={navigateToPage}
            onOpenProjectView={() => setCurrentPage('studio')}
          />
        )}

        {currentPage === 'studio' && (
          <StudioPage 
            key="studio"
            onNavigateToPage={navigateToPage}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsPage 
            key="settings"
            onNavigateToPage={navigateToPage}
          />
        )}

        {currentPage === 'help' && (
          <HelpPage 
            key="help"
            onNavigateToPage={navigateToPage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Export a hook for using the router in child components
export function useForgeRouter() {
  // This would typically use React Context, but for simplicity we're passing props
  return {
    navigateToPage: (page: string) => {
      console.log('Navigate to:', page);
      // In a real implementation, this would use context
    },
    currentPage: 'home',
  };
}
