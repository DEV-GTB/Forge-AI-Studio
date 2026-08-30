/**
 * Forge AI Studio - Design Tokens
 *
 * Based on the 288-step UI/UX Master Specification
 * Dark-first graphite visual foundation with restrained accent colors
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Background Surfaces (Graphite Foundation)
  background: {
    base: '#0a0a0b',        // Near-black base
    surface: '#111113',     // Graphite panel
    elevated: '#18181b',    // Slightly lighter elevated surface
    floating: '#1f1f23',    // Floating panels/modals
    overlay: 'rgba(0, 0, 0, 0.75)', // Overlay backdrop
  },

  // Text Colors
  text: {
    primary: '#f5f5f5',     // Bright off-white
    secondary: '#a1a1aa',   // Muted gray
    tertiary: '#71717a',    // Dimmed gray
    inverse: '#0a0a0b',    // For text on accent backgrounds
  },

  // Accent Color (Forge Orange - Restrained Primary)
  accent: {
    primary: '#f97316',    // Orange-500 (Forge accent)
    hover: '#fb923c',       // Orange-400
    active: '#ea580c',     // Orange-600
    subtle: 'rgba(249, 115, 22, 0.1)', // Subtle accent background
    border: 'rgba(249, 115, 22, 0.3)', // Accent border
    glow: 'rgba(249, 115, 22, 0.4)',   // Glow effect
  },

  // Semantic Colors
  semantic: {
    success: '#10b981',    // Emerald-500
    warning: '#f59e0b',    // Amber-500
    error: '#ef4444',      // Red-500
    info: '#06b6d4',       // Cyan-500
  },

  // Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',   // Subtle border
    default: 'rgba(255, 255, 255, 0.12)',  // Default border
    strong: 'rgba(255, 255, 255, 0.16)',  // Strong border
    focus: 'rgba(249, 115, 22, 0.5)',     // Focus border (orange)
  },

  // Grid Pattern (Technical Grid)
  grid: {
    color: 'rgba(255, 255, 255, 0.03)',   // Very low contrast
    size: '20px',                         // Grid cell size
  },
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Consolas, Monaco, monospace',
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },

  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line Heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.375rem', // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

// ============================================================================
// SHADOWS
// ============================================================================

export const shadow = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(249, 115, 22, 0.3)',
};

// ============================================================================
// ANIMATION
// ============================================================================

export const animation = {
  // Durations (in milliseconds for motion/react compatibility)
  duration: {
    fast: 150,
    base: 200,
    slow: 300,
    slower: 500,
  },

  // Easing
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Presets
  presets: {
    fadeIn: 'fadeIn 200ms ease-out',
    fadeOut: 'fadeOut 150ms ease-in',
    slideIn: 'slideIn 200ms ease-out',
    slideOut: 'slideOut 150ms ease-in',
    scaleIn: 'scaleIn 200ms ease-out',
    scaleOut: 'scaleOut 150ms ease-in',
  },
};

// ============================================================================
// LAYOUT
// ============================================================================

export const layout = {
  // Navigation Rail
  navigation: {
    collapsedWidth: '56px',   // 48-56px per spec
    expandedWidth: '72px',    // 68-80px per spec
    iconSize: '24px',
  },

  // Content Areas
  content: {
    maxWidth: '1400px',       // Comfortable max width for reading
    maxWidthNarrow: '900px',  // Narrower for focused content
    maxWidthWide: '1600px',  // Wider for Studio workspace
  },

  // Panels
  panel: {
    minWidth: '200px',
    maxWidth: '400px',
    defaultWidth: '280px',
  },

  // Terminal
  terminal: {
    minHeight: '120px',
    maxHeight: '400px',
    defaultHeight: '200px',
  },
};

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  panel: 30,
  overlay: 40,
  modal: 50,
  tooltip: 60,
  notification: 70,
  commandPalette: 80,
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  // Button
  button: {
    height: {
      sm: '32px',
      base: '40px',
      lg: '48px',
    },
    padding: {
      sm: '0.5rem 1rem',
      base: '0.75rem 1.25rem',
      lg: '1rem 1.5rem',
    },
  },

  // Input
  input: {
    height: {
      sm: '32px',
      base: '40px',
      lg: '48px',
    },
    padding: {
      sm: '0.5rem 0.75rem',
      base: '0.625rem 1rem',
      lg: '0.75rem 1.25rem',
    },
  },

  // Card
  card: {
    padding: {
      sm: spacing[4],
      base: spacing[6],
      lg: spacing[8],
    },
  },

  // Message (Chat)
  message: {
    maxWidth: '700px',
    padding: spacing[4],
    borderRadius: borderRadius.lg,
  },

  // Code Block
  codeBlock: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.tight,
    padding: spacing[4],
    borderRadius: borderRadius.md,
  },
};

// ============================================================================
// CSS VARIABLES FOR TAILWIND INTEGRATION
// ============================================================================

export const cssVariables = {
  '--color-bg-base': colors.background.base,
  '--color-bg-surface': colors.background.surface,
  '--color-bg-elevated': colors.background.elevated,
  '--color-bg-floating': colors.background.floating,
  '--color-text-primary': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--color-text-tertiary': colors.text.tertiary,
  '--color-accent-primary': colors.accent.primary,
  '--color-accent-hover': colors.accent.hover,
  '--color-accent-active': colors.accent.active,
  '--color-border-subtle': colors.border.subtle,
  '--color-border-default': colors.border.default,
  '--color-border-focus': colors.border.focus,
  '--font-sans': typography.fontFamily.sans,
  '--font-mono': typography.fontFamily.mono,
  '--nav-collapsed-width': layout.navigation.collapsedWidth,
  '--nav-expanded-width': layout.navigation.expandedWidth,
};

// ============================================================================
// UTILITY CLASSES GENERATOR
// ============================================================================

export const generateUtilityClasses = () => {
  return `
    :root {
      ${Object.entries(cssVariables)
        .map(([key, value]) => `${key}: ${value};`)
        .join('\n      ')}
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: ${typography.fontFamily.sans};
      background-color: ${colors.background.base};
      color: ${colors.text.primary};
      line-height: ${typography.lineHeight.normal};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Technical Grid Background */
    .bg-grid {
      background-image: 
        linear-gradient(${colors.grid.color} 1px, transparent 1px),
        linear-gradient(90deg, ${colors.grid.color} 1px, transparent 1px);
      background-size: ${colors.grid.size} ${colors.grid.size};
    }
    
    /* Focus Styles */
    :focus-visible {
      outline: 2px solid ${colors.accent.primary};
      outline-offset: 2px;
    }
    
    /* Scrollbar Styling */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: ${colors.background.surface};
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${colors.border.strong};
      border-radius: ${borderRadius.full};
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${colors.text.tertiary};
    }
  `;
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadow,
  animation,
  layout,
  zIndex,
  breakpoints,
  components,
  cssVariables,
  generateUtilityClasses,
};
