import React, { useState } from 'react';
import { Terminal, Code, Cpu, Shield, Zap, Coins, Flame, ChevronRight, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import StudentPortal from './StudentPortal';
import IntroductionToAISimulator from './IntroductionToAISimulator';

const CYBERPUNK_COLORS = [
  '#00FF00', // 1 Neon Green
  '#00FFFF', // 2 Cyan/Aqua
  '#FF00FF', // 3 Magenta/Fuchsia
  '#FF0099', // 4 Hot Pink
  '#FF9900', // 5 Neon Orange
  '#FFFF00', // 6 Cyber Yellow
  '#7DF9FF', // 7 Electric Blue
  '#B026FF', // 8 Neon Purple
  '#FF3300', // 9 Neon Red
  '#39FF14', // 10 Laser Green
];

const ARCADE_GAMES = [
  { id: 1, title: 'AI Matrix Algebra', category: 'Math Engine', color: '#00FFFF', cost: 0, reward: 15, icon: <Code size={24} /> },
  { id: 2, title: 'Neural Network Tuner', category: 'Deep Learning', color: '#FF00FF', cost: 50, reward: 100, icon: <Cpu size={24} /> },
  { id: 3, title: 'Binary Logic Quest', category: 'Logic Core', color: '#FF9900', cost: 0, reward: 25, icon: <Terminal size={24} /> },
  { id: 4, title: 'Cyber Security Breach', category: 'Defense', color: '#39FF14', cost: 20, reward: 60, icon: <Shield size={24} /> },
];

export default function CyberpunkDashboard({ user }: { user: User }) {
  const [activeNode, setActiveNode] = useState(2);
  const [activeSimulator, setActiveSimulator] = useState<number | null>(null);

  if (activeSimulator === 99) {
    return <IntroductionToAISimulator user={user} onBack={() => setActiveSimulator(null)} />;
  }

  if (activeSimulator) {
    return <StudentPortal user={user} onBack={() => setActiveSimulator(null)} />;
  }

  
  return (
    <article className="flex-1 flex overflow-hidden relative bg-[#121214]">
      {/* CENTER COLUMN: Arcade Matrix */}
      <section className="flex-1 bg-[#121214] p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#6366F1] uppercase tracking-widest">
            Arcade Terminal Grid
          </h1>
          <p className="text-[#94A3B8] font-mono text-sm mt-2">
            Select a simulation pod to begin training sequence.
          </p>
        </header>

        {/* Featured Hero Pod: Introduction to AI */}
        <div className="mb-8 bg-gradient-to-r from-[#6366F1]/15 to-[#00FFFF]/10 border border-[#6366F1]/50 rounded-lg p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6366F1]/5 to-transparent h-1/2 w-full animate-pulse pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded">
                  System Onboarding
                </span>
                <span className="text-[10px] font-mono text-[#00AD7C] animate-pulse">
                  ● ACTIVE
                </span>
              </div>
              <h2 className="text-xl font-black text-[#E0E0E6] uppercase tracking-wider">
                Introduction to AI Simulator
              </h2>
              <p className="text-[#94A3B8] text-xs mt-1 max-w-xl font-mono leading-relaxed">
                Deploy the core holographic AI assistant to master basic deep learning models, natural language processing, and neural networks.
              </p>
            </div>
            
            <button 
              onClick={() => setActiveSimulator(99)}
              className="px-5 py-2.5 rounded font-bold uppercase text-xs tracking-widest flex items-center gap-2 transition-all cursor-pointer bg-[#00FFFF] text-[#121214] hover:scale-105 shrink-0"
              style={{ 
                boxShadow: `0 0 15px rgba(0, 255, 255, 0.4)`,
              }}
            >
              <Zap size={14} /> Launch Intro to AI
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ARCADE_GAMES.map((game) => (
            <div 
              key={game.id}
              className="bg-[#161619] border border-[#22252a] rounded-lg overflow-hidden group hover:border-[#6366F1] transition-all duration-300 relative flex flex-col"
            >
              {/* Top Tag */}
              <div className="bg-[#22252a] px-4 py-2 flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
                  {game.category}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B]">
                  ID: {game.id.toString().padStart(4, '0')}
                </span>
              </div>
              
              {/* Center Graphic */}
              <div className="h-40 flex items-center justify-center relative overflow-hidden bg-[#0A0A0B]">
                {/* Grid background effect */}
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'linear-gradient(#22252a 1px, transparent 1px), linear-gradient(90deg, #22252a 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  opacity: 0.3
                }}></div>
                
                <div 
                  className="relative z-10 w-20 h-20 border flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                  style={{ 
                    borderColor: game.color,
                    color: game.color,
                    boxShadow: `inset 0 0 20px ${game.color}40, 0 0 20px ${game.color}40`
                  }}
                >
                  {game.icon}
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 flex-1 flex flex-col justify-between border-t border-[#22252a]">
                <h3 className="text-[#E0E0E6] font-bold text-lg mb-4">{game.title}</h3>
                
                <div className="flex items-center justify-between mb-4">
                  {game.cost > 0 ? (
                    <span className="text-[11px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded">
                      [ Unlock: {game.cost} Stemios ]
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-[#00AD7C] bg-[#00AD7C]/10 px-2 py-1 rounded">
                      [ Payout: +{game.reward} Stemios ]
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => setActiveSimulator(game.id)}
                  className="w-full py-3 px-4 rounded font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
                  style={{ 
                    backgroundColor: `${game.color}20`,
                    color: game.color,
                    border: `1px solid ${game.color}50`
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = game.color;
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.boxShadow = `0 0 15px ${game.color}`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = `${game.color}20`;
                    e.currentTarget.style.color = game.color;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Zap size={14} /> Launch Simulator
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>
    </article>
  );
}
