import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ["amazing", "new", "wonderful", "beautiful", "smart"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col font-sans overflow-x-hidden selection:bg-[#4cd7f6]/30">
      <header className="fixed top-0 w-full z-50 bg-[#0b1326]/80 backdrop-blur-md border-b border-[#869397]/20 transition-all duration-200 ease-in-out">
        <div className="flex justify-between items-center px-8 md:px-8 h-16 max-w-[1280px] mx-auto w-full">
          <div className="flex items-center h-10 w-auto">
            <div className="h-10 w-10 bg-gradient-to-tr from-[#4cd7f6] to-[#06b6d4] rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-[#003640]">V</span>
            </div>
            <span className="ml-2 font-bold text-lg text-[#dae2fd]">Forge AI Studio</span>
          </div>

          <nav className="hidden md:flex gap-6">
            <a className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors duration-200" href="#">Platform</a>
            <a className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors duration-200" href="#">Solutions</a>
            <a className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors duration-200" href="#">Resources</a>
            <a className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors duration-200" href="#">Pricing</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onSignIn}
              className="text-[#bcc9cd] hover:text-[#dae2fd] transition-colors"
            >
              Sign in
            </button>
            <button 
              onClick={onGetStarted}
              className="inline-flex items-center justify-center bg-[#4cd7f6] text-[#003640] px-6 py-2 rounded-[0.125rem] font-mono text-xs uppercase hover:shadow-[0_10px_20px_-10px_rgba(76,215,246,0.25)] transition-all"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center px-4 md:px-8 py-8 lg:py-[120px] pt-[120px] max-w-[1280px] mx-auto w-full relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4cd7f6]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#171f33]/50 rounded-full blur-3xl"></div>
        </div>

        <div className="text-center max-w-3xl flex flex-col items-center">
          <a className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#2d3449] bg-[#131b2e] text-[#bcc9cd] font-mono text-xs mb-6 hover:border-[#4cd7f6]/50 hover:text-[#4cd7f6] transition-colors" href="#">
            Read our launch article
            <ArrowRight size={14} />
          </a>

          <h1 className="font-bold text-4xl md:text-6xl mb-6 flex flex-col items-center w-full">
            <span>Build the future</span>
            <span className="relative h-12 overflow-hidden mt-2">
              <span className="text-[#4cd7f6] font-bold absolute transition-all duration-500 ease-in-out"
                style={{ transform: `translateY(${currentWord * -100}%)` }}>
                {words.map((word, index) => (
                  <div key={index} className="h-12 flex items-center justify-center">
                    {word}
                  </div>
                ))}
              </span>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#bcc9cd] mb-8 max-w-2xl">
            Your intelligent workspace for turning ideas into code, solving complex problems, and building faster with AI. Think less about the code. Create more of what matters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onGetStarted}
              className="inline-flex items-center justify-center bg-[#4cd7f6] text-[#003640] px-6 py-2 rounded-[0.125rem] font-mono text-xs uppercase hover:shadow-[0_10px_20px_-10px_rgba(76,215,246,0.25)] transition-all gap-2"
            >
              Sign up here
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 bg-[#060e20] border-t border-[#869397]/10">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-[1280px] mx-auto gap-4 text-sm text-[#4cd7f6]">
          <div className="font-bold text-[#dae2fd]">Forge AI Studio</div>
          <div className="text-[#bcc9cd]">© 2026 Forge AI Studio. All rights reserved.</div>
          <div className="flex gap-4">
            <a className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors" href="#">Privacy Policy</a>
            <a className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors" href="#">Terms of Service</a>
            <a className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors" href="#">Security</a>
            <a className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors" href="#">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}