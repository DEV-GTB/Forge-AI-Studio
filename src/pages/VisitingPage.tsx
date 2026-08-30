import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Sparkles, Code, Zap, Shield, Globe, 
  Terminal, Layout, Database, Cpu, Play, ChevronRight,
  Menu, X, Github, Twitter, Linkedin
} from 'lucide-react';
import { colors, typography, spacing, borderRadius, animation, shadow } from '../styles/design-tokens';

interface VisitingPageProps {
  onStartBuilding?: () => void;
}

function AnimatedArrow({ size = 18 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      initial={{ x: 0, scaleX: 1, opacity: 0.98 }}
      whileHover={{ x: 6, scaleX: 1.08, opacity: 1 }}
      whileTap={{ x: 2, scaleX: 0.96, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      style={{ overflow: 'visible', display: 'block' }}
    >
      <motion.path
        d="M4 24H34M26 12L38 24L26 36"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0.8 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}

export default function VisitingPage({ onStartBuilding }: VisitingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeKey, setThemeKey] = useState<'dark' | 'light' | 'midnight' | 'ocean' | 'forest' | 'blue' | 'pink' | 'white'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem('forgeai_selected_theme') as any) || 'dark';
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: containerRef });

  useEffect(() => {
    const syncTheme = () => {
      const nextTheme = (localStorage.getItem('forgeai_selected_theme') as any) || 'dark';
      setThemeKey(nextTheme);
    };

    syncTheme();
    window.addEventListener('storage', syncTheme);
    return () => window.removeEventListener('storage', syncTheme);
  }, []);
  
  const palette = {
    dark: {
      pageBg: '#0b1326',
      panel: '#131b2e',
      panelSoft: '#0f172a',
      border: '#2d3449',
      text: '#dae2fd',
      muted: '#bcc9cd',
      accent: '#4cd7f6',
      accentText: '#003640',
      glow: 'rgba(76,215,246,0.18)',
    },
    blue: {
      pageBg: '#06131f',
      panel: '#0f2237',
      panelSoft: '#10273b',
      border: '#23446a',
      text: '#edf6ff',
      muted: '#c7d8eb',
      accent: '#60a5fa',
      accentText: '#041827',
      glow: 'rgba(96,165,250,0.18)',
    },
    pink: {
      pageBg: '#170d18',
      panel: '#2d1327',
      panelSoft: '#34182e',
      border: '#5d2a49',
      text: '#fff1f8',
      muted: '#f2d1e3',
      accent: '#f472b6',
      accentText: '#2a0b1b',
      glow: 'rgba(244,114,182,0.18)',
    },
    white: {
      pageBg: '#f8fafc',
      panel: '#ffffff',
      panelSoft: '#eef6ff',
      border: '#dfe7ef',
      text: '#0f172a',
      muted: '#475569',
      accent: '#2563eb',
      accentText: '#f8fbff',
      glow: 'rgba(37,99,235,0.14)',
    },
    midnight: {
      pageBg: '#05070d',
      panel: '#101827',
      panelSoft: '#0f172a',
      border: '#273449',
      text: '#eef2ff',
      muted: '#cbd5e1',
      accent: '#8b5cf6',
      accentText: '#f5f3ff',
      glow: 'rgba(139,92,246,0.18)',
    },
    ocean: {
      pageBg: '#061423',
      panel: '#0c2842',
      panelSoft: '#0b2238',
      border: '#1d4f73',
      text: '#eaf7ff',
      muted: '#c8e6f3',
      accent: '#22d3ee',
      accentText: '#042838',
      glow: 'rgba(34,211,238,0.18)',
    },
    forest: {
      pageBg: '#0b120e',
      panel: '#16251d',
      panelSoft: '#1a2d24',
      border: '#2d4b3c',
      text: '#ecfdf5',
      muted: '#cfe8d8',
      accent: '#34d399',
      accentText: '#062b1c',
      glow: 'rgba(52,211,153,0.18)',
    },
    light: {
      pageBg: '#f8fafc',
      panel: '#ffffff',
      panelSoft: '#f1f5f9',
      border: '#dbe2ea',
      text: '#0f172a',
      muted: '#475569',
      accent: '#3b82f6',
      accentText: '#ffffff',
      glow: 'rgba(59,130,246,0.12)',
    }
  }[themeKey] || { pageBg: '#0b1326', panel: '#131b2e', panelSoft: '#0f172a', border: '#2d3449', text: '#dae2fd', muted: '#bcc9cd', accent: '#4cd7f6', accentText: '#003640', glow: 'rgba(76,215,246,0.18)' };

  const themeStyle = {
    backgroundColor: palette.pageBg,
    pageBg: palette.pageBg,
    color: palette.text,
    text: palette.text,
    borderColor: palette.border,
    border: palette.border,
    accent: palette.accent,
    accentText: palette.accentText,
    panel: palette.panel,
    panelSoft: palette.panelSoft,
    muted: palette.muted,
    glow: palette.glow,
  };

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const gridY = useTransform(scrollY, [0, 1000], [0, 100]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (this: HTMLAnchorElement, e: MouseEvent) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', function () {});
      });
    };
  }, []);

  const navItems = [
    { label: 'Platform', href: '#' },
    { label: 'Solutions', href: '#' },
    { label: 'Resources', href: '#' },
    { label: 'Pricing', href: '#' },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: themeStyle.backgroundColor,
        color: themeStyle.text,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <header className="fixed top-0 w-full z-50 border-b backdrop-blur-md" style={{ borderColor: `${themeStyle.border}99`, backgroundColor: `${themeStyle.pageBg || themeStyle.backgroundColor}cc` }}>
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6 md:px-8">
          <div className="flex h-10 items-center">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuALV_T9GseCK2UiieoqsTdT4B_LoAWLwWbgIDHwUmVlWfjZlT0tmTk_KW8WYmXmiWUmZB_57mHYoJLYXgPJYGSqPxHAXZnQ9uYlRvo8lrAhetPrH1LSV7vHNclUKFZ3NCahTLeBPyj_sQQQtm1-foEN-1Y0BvfaZcgXsUGxOuWgpJajnSE6GwKc-EYByMDIqtSqIwZBipW8CgOQnWmJY8tO0250A4XGDAFR8cHvvNzzsYLzJ2IkwHdI8p5jL9A_weVLWw"
              alt="Forge AI Studio Logo"
              className="h-full w-auto object-contain"
            />
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm transition-colors duration-200"
                style={{ color: themeStyle.muted }}
                onMouseEnter={(e) => { e.currentTarget.style.color = themeStyle.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = themeStyle.muted; }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <motion.button
              onClick={onStartBuilding}
              className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] transition-all"
              style={{ background: themeStyle.accent, color: themeStyle.accentText, boxShadow: `0 10px 20px -10px ${themeStyle.glow}` }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign up
            </motion.button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-[1280px] flex-grow flex-col items-center justify-center px-6 pb-10 pt-28 md:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#4cd7f6]/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-[#2d3449]/50 blur-3xl" />
        </div>

        <div className="flex max-w-3xl flex-col items-center text-center">
          <a
            href="#"
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-medium uppercase tracking-[0.05em] transition-colors"
            style={{ background: themeStyle.panel, borderColor: themeStyle.border, color: themeStyle.muted }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = themeStyle.accent; e.currentTarget.style.color = themeStyle.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = themeStyle.border; e.currentTarget.style.color = themeStyle.muted; }}
          >
            Read our launch article
            <span className="inline-flex items-center justify-center" style={{ color: themeStyle.accent }}>
              <AnimatedArrow size={14} />
            </span>
          </a>

          <h1 className="mb-6 flex w-full flex-col items-center text-center font-[Inter] text-[48px] font-bold leading-[1.1] tracking-[-0.04em] md:text-[64px]">
            <span style={{ color: themeStyle.text }}>Build the future</span>
            <span className="hero-title-container mt-2 inline-block h-[1.2em] overflow-hidden" style={{ color: themeStyle.accent }}>
              <span className="rotating-word">amazing</span>
              <span className="rotating-word">new</span>
              <span className="rotating-word">wonderful</span>
              <span className="rotating-word">beautiful</span>
              <span className="rotating-word">smart</span>
            </span>
          </h1>

          <p className="mb-8 max-w-2xl text-[18px] leading-[28px] md:text-[18px]" style={{ color: themeStyle.muted }}>
            Your intelligent workspace for turning ideas into code, solving complex problems, and building faster with AI. Think less about the code. Create more of what matters.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.button
              onClick={onStartBuilding}
              className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold uppercase tracking-[0.05em] transition-all"
              style={{ background: themeStyle.accent, color: themeStyle.accentText, boxShadow: `0 10px 20px -10px ${themeStyle.glow}` }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign up here
              <span className="inline-flex items-center justify-center">
                <AnimatedArrow size={18} />
              </span>
            </motion.button>
          </div>
        </div>
      </main>

      <footer className="w-full border-t py-6" style={{ borderColor: `${themeStyle.border}99`, backgroundColor: themeStyle.panelSoft }}>
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-3 px-6 text-center md:flex-row md:px-8">
          <div className="text-[20px] font-bold" style={{ color: themeStyle.text }}>Forge AI Studio</div>
          <div className="text-sm" style={{ color: themeStyle.muted }}>© 2026 Forge AI Studio. All rights reserved.</div>
          <div className="flex gap-4 text-sm" style={{ color: themeStyle.muted }}>
            <a href="#" onMouseEnter={(e) => { e.currentTarget.style.color = themeStyle.accent; }} onMouseLeave={(e) => { e.currentTarget.style.color = themeStyle.muted; }}>Privacy Policy</a>
            <a href="#" onMouseEnter={(e) => { e.currentTarget.style.color = themeStyle.accent; }} onMouseLeave={(e) => { e.currentTarget.style.color = themeStyle.muted; }}>Terms of Service</a>
            <a href="#" onMouseEnter={(e) => { e.currentTarget.style.color = themeStyle.accent; }} onMouseLeave={(e) => { e.currentTarget.style.color = themeStyle.muted; }}>Security</a>
            <a href="#" onMouseEnter={(e) => { e.currentTarget.style.color = themeStyle.accent; }} onMouseLeave={(e) => { e.currentTarget.style.color = themeStyle.muted; }}>Status</a>
          </div>
        </div>
      </footer>

      <style>{`
        .rotating-word {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          opacity: 0;
          transform: translateY(100%);
          animation: rotateText 10s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }

        .rotating-word:nth-child(1) { animation-delay: 0s; }
        .rotating-word:nth-child(2) { animation-delay: 2s; }
        .rotating-word:nth-child(3) { animation-delay: 4s; }
        .rotating-word:nth-child(4) { animation-delay: 6s; }
        .rotating-word:nth-child(5) { animation-delay: 8s; }

        .hero-title-container {
          position: relative;
          display: block;
          height: 1.2em;
          overflow: hidden;
          width: 100%;
          text-align: center;
        }

        @keyframes rotateText {
          0%, 5% { opacity: 0; transform: translateY(100%); }
          10%, 25% { opacity: 1; transform: translateY(0); }
          30%, 100% { opacity: 0; transform: translateY(-100%); }
        }
      `}</style>
    </div>
  );
}
