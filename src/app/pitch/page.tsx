'use client';

import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    title: "WhisperRNote",
    subtitle: "Revolutionizing Knowledge Management Through AI-Blockchain Synergy",
    content: (
      <>
        <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-2xl flex items-center justify-center text-4xl shadow-2xl">
          🤫
        </div>
        
        <div className="flex justify-around flex-wrap mt-12 mb-8">
          <div className="text-center m-4">
            <div className="text-5xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">85%</div>
            <div className="text-xl opacity-80 mt-2">Data Breaches in 2024</div>
          </div>
          <div className="text-center m-4">
            <div className="text-5xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">$4.45M</div>
            <div className="text-xl opacity-80 mt-2">Average Breach Cost</div>
          </div>
          <div className="text-center m-4">
            <div className="text-5xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">73%</div>
            <div className="text-xl opacity-80 mt-2">Want AI-Powered Notes</div>
          </div>
        </div>
        
        <p className="text-xl opacity-90 max-w-4xl mx-auto mt-8 leading-relaxed">
          Traditional note-taking apps sacrifice either <strong>security</strong> or <strong>intelligence</strong>. 
          We refuse to compromise on either.
        </p>
      </>
    )
  },
  {
    id: 2,
    title: "The First AI-Native Blockchain Note App",
    subtitle: "Where Artificial Intelligence meets Decentralized Security",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
          <div className="text-5xl mb-4">🧠</div>
          <div className="text-2xl font-bold mb-4">Multi-Provider AI Engine</div>
          <div className="text-lg opacity-90 leading-relaxed">
            GitHub Models, Gemini, and more. Automatic failover, load balancing, 
            and intelligent content generation across multiple AI providers.
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
          <div className="text-5xl mb-4">🔗</div>
          <div className="text-2xl font-bold mb-4">Multi-Chain Architecture</div>
          <div className="text-lg opacity-90 leading-relaxed">
            ICP, Starknet, Umi Network, and Calimero integration. 
            Your notes are distributed across multiple blockchain networks.
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
          <div className="text-5xl mb-4">🛡️</div>
          <div className="text-2xl font-bold mb-4">Military-Grade Encryption</div>
          <div className="text-lg opacity-90 leading-relaxed">
            AES-256 encryption, WebAuthn passkeys, and hardware security modules. 
            Zero-knowledge architecture ensures complete privacy.
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
          <div className="text-5xl mb-4">🌐</div>
          <div className="text-2xl font-bold mb-4">Universal Accessibility</div>
          <div className="text-lg opacity-90 leading-relaxed">
            Web, mobile, desktop, CLI, and browser extensions. 
            One seamless experience across every platform.
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "The Perfect Symbiosis",
    subtitle: "AI Intelligence + Blockchain Security = Unprecedented Innovation",
    content: (
      <>
        <div className="flex justify-center items-center my-12 relative">
          <div className="w-48 h-48 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-center text-white shadow-2xl shadow-indigo-500/50">
            <div>
              🤖<br/>
              <strong>AI Layer</strong><br/>
              Smart Generation<br/>
              Auto-Enhancement<br/>
              Context Awareness
            </div>
          </div>
          
          <div className="absolute w-24 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 shadow-lg shadow-white/30"></div>
          
          <div className="w-48 h-48 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center text-center text-white shadow-2xl shadow-pink-500/50 ml-8">
            <div>
              ⛓️<br/>
              <strong>Blockchain Layer</strong><br/>
              Immutable Storage<br/>
              Decentralized Access<br/>
              Cryptographic Security
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-2xl font-bold mb-4">🎯 Smart Content Generation</div>
            <div className="text-lg opacity-90 leading-relaxed">
              AI analyzes your writing patterns and automatically suggests improvements, 
              generates related content, and enhances your thoughts with contextual intelligence.
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-2xl font-bold mb-4">🔐 Cryptographic Verification</div>
            <div className="text-lg opacity-90 leading-relaxed">
              Every AI-generated piece is cryptographically signed and stored on-chain, 
              ensuring authenticity and preventing tampering.
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-2xl font-bold mb-4">🧩 Decentralized Intelligence</div>
            <div className="text-lg opacity-90 leading-relaxed">
              AI models run across distributed networks, ensuring no single point of failure 
              and resistance to censorship or data loss.
            </div>
          </div>
        </div>
      </>
    )
  },
  {
    id: 4,
    title: "Fort Knox-Level Security",
    subtitle: "Your thoughts deserve military-grade protection",
    content: (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-5xl mb-4">🔒</div>
            <div className="text-2xl font-bold mb-4">AES-256 Encryption</div>
            <div className="text-lg opacity-90 leading-relaxed">
              Every note encrypted with quantum-resistant algorithms. 
              Keys are distributed across multiple blockchain networks.
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-5xl mb-4">🔑</div>
            <div className="text-2xl font-bold mb-4">WebAuthn Passkeys</div>
            <div className="text-lg opacity-90 leading-relaxed">
              Passwordless authentication using biometrics and hardware security keys. 
              Phishing-resistant and quantum-safe.
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-5xl mb-4">🌊</div>
            <div className="text-2xl font-bold mb-4">Zero-Knowledge Architecture</div>
            <div className="text-lg opacity-90 leading-relaxed">
              We can't read your notes even if we wanted to. 
              Cryptographic proofs without revealing content.
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-5xl mb-4">🔄</div>
            <div className="text-2xl font-bold mb-4">Multi-Chain Redundancy</div>
            <div className="text-lg opacity-90 leading-relaxed">
              Notes replicated across ICP, Starknet, and Umi networks. 
              Unstoppable availability and disaster recovery.
            </div>
          </div>
        </div>
        
        <div className="mt-12 p-8 bg-white/10 rounded-3xl backdrop-blur-xl">
          <h3 className="text-2xl font-bold mb-4">Security Guarantees</h3>
          <div className="text-lg leading-relaxed">
            ✅ End-to-end encryption with user-controlled keys<br/>
            ✅ Decentralized storage across multiple blockchains<br/>
            ✅ Hardware security module integration<br/>
            ✅ Regular security audits and penetration testing<br/>
            ✅ GDPR and SOC 2 compliance ready
          </div>
        </div>
      </>
    )
  },
  {
    id: 5,
    title: "Cutting-Edge Architecture",
    subtitle: "Built for scale, designed for the future",
    content: (
      <>
        <div className="flex justify-center flex-wrap gap-4 my-8">
          {[
            'Next.js 15', 'TypeScript', 'Tailwind CSS', 'ICP Canisters',
            'Starknet', 'Umi Network', 'Calimero', 'WebAuthn',
            'GitHub Models', 'Google Gemini', 'Flutter', 'Appwrite'
          ].map((tech) => (
            <div key={tech} className="bg-white/15 backdrop-blur-sm rounded-full px-6 py-3 font-semibold border border-white/20">
              {tech}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-2xl font-bold mb-4">🏗️ Microservices Architecture</div>
            <div className="text-lg opacity-90 leading-relaxed">
              Containerized services running on Kubernetes with automatic scaling, 
              health monitoring, and zero-downtime deployments.
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-2xl font-bold mb-4">⚡ Edge Computing</div>
            <div className="text-lg opacity-90 leading-relaxed">
              AI inference at the edge for lightning-fast responses. 
              CDN distribution and regional data compliance.
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-2xl font-bold mb-4">🔄 Real-Time Sync</div>
            <div className="text-lg opacity-90 leading-relaxed">
              WebSocket connections with conflict resolution and offline-first design. 
              Seamless collaboration across all devices.
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-2xl font-bold mb-4">📊 Advanced Analytics</div>
            <div className="text-lg opacity-90 leading-relaxed">
              Privacy-preserving analytics using homomorphic encryption. 
              Insights without compromising user privacy.
            </div>
          </div>
        </div>
      </>
    )
  },
  {
    id: 6,
    title: "Massive Market Opportunity",
    subtitle: "Disrupting a $45B+ Knowledge Management Market",
    content: (
      <>
        <div className="flex justify-around flex-wrap mt-8 mb-12">
          <div className="text-center m-4">
            <div className="text-5xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">$45B</div>
            <div className="text-xl opacity-80 mt-2">Note-Taking Market</div>
          </div>
          <div className="text-center m-4">
            <div className="text-5xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">$67B</div>
            <div className="text-xl opacity-80 mt-2">AI Software Market</div>
          </div>
          <div className="text-center m-4">
            <div className="text-5xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">$23B</div>
            <div className="text-xl opacity-80 mt-2">Blockchain Apps</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-2xl font-bold mb-4">🎯 Target Markets</div>
            <div className="text-lg opacity-90 leading-relaxed">
              <strong>Enterprise:</strong> Fortune 500 companies needing secure knowledge management<br/>
              <strong>Developers:</strong> Technical teams requiring advanced note-taking<br/>
              <strong>Researchers:</strong> Academics and scientists with sensitive data<br/>
              <strong>Content Creators:</strong> Writers, journalists, and thought leaders
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-2xl font-bold mb-4">📈 Revenue Streams</div>
            <div className="text-lg opacity-90 leading-relaxed">
              <strong>Freemium SaaS:</strong> $0/month (Basic) to $49/month (Enterprise)<br/>
              <strong>API Access:</strong> Developer tools and integrations<br/>
              <strong>White Label:</strong> Custom deployments for enterprises<br/>
              <strong>Token Economy:</strong> Blockchain-native monetization
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-2xl font-bold mb-4">🚀 Competitive Advantage</div>
            <div className="text-lg opacity-90 leading-relaxed">
              <strong>First Mover:</strong> No AI+Blockchain note app exists<br/>
              <strong>Patent Pending:</strong> Unique cryptographic architecture<br/>
              <strong>Network Effects:</strong> Multi-chain interoperability<br/>
              <strong>Switching Costs:</strong> Encrypted data lock-in
            </div>
          </div>
        </div>
      </>
    )
  },
  {
    id: 7,
    title: "Join the Revolution",
    subtitle: "Be part of the AI-Blockchain knowledge revolution",
    content: (
      <>
        <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-2xl flex items-center justify-center text-4xl shadow-2xl">
          🤫
        </div>
        
        <div className="my-12">
          <h3 className="text-3xl font-bold mb-8">Ready to Transform Note-Taking Forever?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <div className="text-2xl font-bold mb-4">🚀 For Investors</div>
              <div className="text-lg opacity-90 leading-relaxed">
                Seed funding round: $2M to accelerate development, 
                expand AI partnerships, and scale blockchain infrastructure.
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <div className="text-2xl font-bold mb-4">💼 For Partners</div>
              <div className="text-lg opacity-90 leading-relaxed">
                Strategic partnerships with AI providers, blockchain networks, 
                and enterprise customers. Let's build the future together.
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <div className="text-2xl font-bold mb-4">👨‍💻 For Talent</div>
              <div className="text-lg opacity-90 leading-relaxed">
                Join our world-class team of AI researchers, blockchain engineers, 
                and product visionaries building the next generation of knowledge tools.
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-x-4 mb-12">
          <a 
            href="https://whisperrnote.space" 
            className="inline-block bg-gradient-to-r from-pink-500 to-cyan-500 text-white px-12 py-4 rounded-full text-xl font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            Try WhisperRNote
          </a>
          <a 
            href="mailto:team@whisperrnote.space" 
            className="inline-block bg-gradient-to-r from-pink-500 to-cyan-500 text-white px-12 py-4 rounded-full text-xl font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            Contact Us
          </a>
        </div>
        
        <div className="opacity-80">
          <p className="text-lg mb-4">🌐 whisperrnote.space | 📧 team@whisperrnote.space | 💬 Discord Community</p>
          <p className="text-xl font-semibold">
            <strong>The future of knowledge is secure, intelligent, and decentralized.</strong>
          </p>
        </div>
      </>
    )
  }
];

export default function PitchPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const scrollToSlide = (index: number) => {
    setCurrentSlide(index);
    const slide = document.getElementById(`slide-${index}`);
    slide?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (currentSlide < slides.length - 1) {
          scrollToSlide(currentSlide + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (currentSlide > 0) {
          scrollToSlide(currentSlide - 1);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      slides.forEach((slide, index) => {
        const element = document.getElementById(`slide-${index}`);
        if (element) {
          const slideTop = element.offsetTop;
          const slideBottom = slideTop + element.offsetHeight;
          
          if (scrollPosition >= slideTop && scrollPosition <= slideBottom) {
            setCurrentSlide(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style jsx global>{`
        body {
          overflow-x: hidden;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 text-white overflow-x-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            id={`slide-${index}`}
            className={`min-h-screen flex flex-col justify-center items-center p-8 relative ${
              index % 2 === 1 
                ? 'bg-gradient-to-br from-purple-800 via-indigo-700 to-blue-600' 
                : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800'
            }`}
          >
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
            
            <div className="max-w-7xl w-full text-center z-10 relative">
              <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-2xl">
                {slide.title}
              </h1>
              <p className="text-2xl md:text-3xl opacity-90 mb-12 font-light">
                {slide.subtitle}
              </p>
              {slide.content}
            </div>
          </div>
        ))}
        
        <div className="fixed bottom-8 right-8 z-50 space-y-2">
          {slides.map((_, index) => (
            <div
              key={index}
              onClick={() => scrollToSlide(index)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-white scale-150' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}