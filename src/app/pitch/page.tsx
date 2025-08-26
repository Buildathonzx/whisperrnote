'use client';

import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    title: "WhisperRNote",
    subtitle: "AI + Blockchain = Secure Intelligence",
    content: (
      <>
        <div className="w-32 h-32 mx-auto mb-12 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-3xl flex items-center justify-center text-6xl shadow-2xl animate-pulse">
          🤫
        </div>
        
        <div className="grid grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-6xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">85%</div>
            <div className="text-xl opacity-80 mt-2">Data Breaches</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">$4.45M</div>
            <div className="text-xl opacity-80 mt-2">Breach Cost</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">73%</div>
            <div className="text-xl opacity-80 mt-2">Want AI Notes</div>
          </div>
        </div>
        
        <p className="text-2xl opacity-90 max-w-4xl mx-auto mt-16 leading-relaxed">
          No more choosing between <strong>security</strong> and <strong>intelligence</strong>.
        </p>
      </>
    )
  },
  {
    id: 2,
    title: "AI-Native Blockchain Notes",
    subtitle: "Multi-AI × Multi-Chain",
    content: (
      <div className="grid grid-cols-2 gap-12 mt-16">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 transition-all duration-500 hover:scale-105">
          <div className="text-6xl mb-6">🧠</div>
          <div className="text-2xl font-bold mb-4">Multi-AI Engine</div>
          <div className="text-lg opacity-90">GitHub Models, Gemini, auto-failover</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 transition-all duration-500 hover:scale-105">
          <div className="text-6xl mb-6">🔗</div>
          <div className="text-2xl font-bold mb-4">Multi-Chain</div>
          <div className="text-lg opacity-90">ICP, Starknet, Umi, Calimero</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 transition-all duration-500 hover:scale-105">
          <div className="text-6xl mb-6">🛡️</div>
          <div className="text-2xl font-bold mb-4">Zero-Knowledge</div>
          <div className="text-lg opacity-90">AES-256 + WebAuthn passkeys</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 transition-all duration-500 hover:scale-105">
          <div className="text-6xl mb-6">🌐</div>
          <div className="text-2xl font-bold mb-4">Universal Access</div>
          <div className="text-lg opacity-90">Web, mobile, desktop, CLI</div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Perfect Synergy",
    subtitle: "Intelligence Meets Security",
    content: (
      <>
        <div className="flex justify-center items-center my-16 relative">
          <div className="w-56 h-56 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-center text-white shadow-2xl shadow-indigo-500/50 animate-pulse">
            <div className="text-lg">
              🤖<br/>
              <strong>AI Layer</strong><br/>
              Smart Generation<br/>
              Auto-Enhancement
            </div>
          </div>
          
          <div className="absolute w-32 h-2 bg-gradient-to-r from-indigo-500 to-pink-500 shadow-lg animate-pulse"></div>
          
          <div className="w-56 h-56 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center text-center text-white shadow-2xl shadow-pink-500/50 ml-16 animate-pulse">
            <div className="text-lg">
              ⛓️<br/>
              <strong>Blockchain</strong><br/>
              Immutable Storage<br/>
              Crypto Security
            </div>
          </div>
        </div>
        
        <div className="text-center mt-16">
          <div className="text-3xl font-bold mb-8">🎯 Smart + Secure + Decentralized</div>
          <p className="text-xl opacity-90">
            Every AI-generated insight is cryptographically verified and stored across multiple blockchains.
          </p>
        </div>
      </>
    )
  },
  {
    id: 4,
    title: "$135B Market",
    subtitle: "AI + Notes + Blockchain",
    content: (
      <>
        <div className="grid grid-cols-3 gap-8 mt-16 mb-16">
          <div className="text-center">
            <div className="text-6xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">$45B</div>
            <div className="text-xl opacity-80 mt-2">Notes Market</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">$67B</div>
            <div className="text-xl opacity-80 mt-2">AI Software</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">$23B</div>
            <div className="text-xl opacity-80 mt-2">Blockchain</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-2xl font-bold mb-4">🎯 First Mover Advantage</div>
            <div className="text-lg opacity-90">
              • No AI+Blockchain note app exists<br/>
              • Patent-pending architecture<br/>
              • Network effects & data lock-in
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-2xl font-bold mb-4">💰 Revenue Model</div>
            <div className="text-lg opacity-90">
              • Freemium: $0-$49/month<br/>
              • Enterprise white-label<br/>
              • Blockchain token economy
            </div>
          </div>
        </div>
      </>
    )
  },
  {
    id: 5,
    title: "Join the Revolution",
    subtitle: "Shape the Future of Knowledge",
    content: (
      <>
        <div className="w-32 h-32 mx-auto mb-12 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-3xl flex items-center justify-center text-6xl shadow-2xl animate-pulse">
          🤫
        </div>
        
        <div className="grid grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <div className="text-xl font-bold mb-2">Investors</div>
            <div className="text-lg opacity-90">$2M seed round</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
            <div className="text-4xl mb-4">💼</div>
            <div className="text-xl font-bold mb-2">Partners</div>
            <div className="text-lg opacity-90">AI & Blockchain alliances</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
            <div className="text-4xl mb-4">👨‍💻</div>
            <div className="text-xl font-bold mb-2">Talent</div>
            <div className="text-lg opacity-90">World-class team</div>
          </div>
        </div>
        
        <div className="space-x-8">
          <a 
            href="https://whisperrnote.space" 
            className="inline-block bg-gradient-to-r from-pink-500 to-cyan-500 text-white px-12 py-4 rounded-full text-xl font-bold transition-all duration-300 hover:scale-110 hover:shadow-2xl"
          >
            Try Now
          </a>
          <a 
            href="mailto:team@whisperrnote.space" 
            className="inline-block bg-white/20 backdrop-blur-xl border border-white/30 text-white px-12 py-4 rounded-full text-xl font-bold transition-all duration-300 hover:scale-110 hover:bg-white/30"
          >
            Contact Us
          </a>
        </div>
        
        <div className="mt-16 opacity-80">
          <p className="text-xl font-semibold">
            The future of knowledge is <strong>secure</strong>, <strong>intelligent</strong>, and <strong>decentralized</strong>.
          </p>
        </div>
      </>
    )
  }
];

export default function PitchPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        goToSlide(parseInt(e.key) - 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const currentSlideData = slides[currentSlide];

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120,119,198,0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,119,198,0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120,200,255,0.2) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Main Content */}
      <div className={`h-full flex flex-col justify-center items-center p-8 z-10 relative transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="max-w-7xl w-full text-center">
          <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-2xl">
            {currentSlideData.title}
          </h1>
          <p className="text-2xl md:text-3xl opacity-90 mb-8 font-light">
            {currentSlideData.subtitle}
          </p>
          {currentSlideData.content}
        </div>
      </div>
      
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className={`absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-2xl transition-all duration-300 z-20 ${
          currentSlide === 0 
            ? 'opacity-30 cursor-not-allowed' 
            : 'hover:bg-white/30 hover:scale-110 cursor-pointer'
        }`}
      >
        ←
      </button>
      
      <button
        onClick={nextSlide}
        disabled={currentSlide === slides.length - 1}
        className={`absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-2xl transition-all duration-300 z-20 ${
          currentSlide === slides.length - 1 
            ? 'opacity-30 cursor-not-allowed' 
            : 'hover:bg-white/30 hover:scale-110 cursor-pointer'
        }`}
      >
        →
      </button>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75 hover:scale-110'
            }`}
          />
        ))}
      </div>
      
      {/* Slide Counter */}
      <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full px-4 py-2 z-20">
        <span className="text-lg font-semibold">{currentSlide + 1} / {slides.length}</span>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-8 right-8 text-sm opacity-60 z-20">
        <p>Use ← → arrows or 1-5 keys</p>
      </div>
    </div>
  );
}