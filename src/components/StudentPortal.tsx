import React, { useState } from 'react';
import { User } from '../types';
import TranslationSidebar from './TranslationSidebar';
import { Play, Terminal, Check, Shuffle, CheckCircle2 } from 'lucide-react';

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
  '#00E5FF', // 11 TikTok Lapis
  '#FF0050', // 12 TikTok Red
  '#8A2BE2', // 13 Blue Violet
  '#FF4500', // 14 Orange Red
  '#32CD32', // 15 Lime Green
  '#FF007F', // 16 Rose
  '#00FF7F', // 17 Spring Green
  '#9400D3', // 18 Dark Violet
  '#00FA9A', // 19 Medium Spring Green
  '#FF6347', // 20 Tomato
];

export default function StudentPortal({ user }: { user: User }) {
  const [isTranslationOpen, setTranslationOpen] = useState(false);
  const [activeNode, setActiveNode] = useState(2);

  return (
    <article className="flex-1 grid grid-cols-[80px_1fr_280px] overflow-hidden relative">
      
      {/* Quest Tracker Header - High Density Vertical Layout */}
      <aside className="border-r border-slate-panel flex flex-col items-center py-5 gap-6 bg-slate-panel/20 overflow-y-auto hide-scrollbar">
        {CYBERPUNK_COLORS.map((color, index) => {
          const nodeNum = index + 1;
          const isActive = nodeNum === activeNode;
          const isCompleted = nodeNum < activeNode;
          
          return (
            <React.Fragment key={nodeNum}>
              <div 
                className={`w-[44px] h-[48px] clip-hex flex items-center justify-center cursor-pointer border-2 transition-all duration-300 ${isActive ? 'border-white' : 'border-transparent'} ${!isActive && !isCompleted ? 'opacity-30 hover:opacity-70' : 'opacity-100'}`}
                style={{
                  backgroundColor: isCompleted || isActive ? color : 'var(--color-slate-base)',
                  boxShadow: isActive ? `0 0 15px ${color}` : 'none',
                  color: isCompleted || isActive ? '#000' : 'var(--color-text-main)',
                  fontWeight: isActive ? 'bold' : 'normal'
                }}
                onClick={() => setActiveNode(nodeNum)}
              >
                {isCompleted ? '✓' : nodeNum}
              </div>
              {nodeNum < CYBERPUNK_COLORS.length && (
                <div 
                  className="w-[2px] h-[16px] -mt-6 mb-2" 
                  style={{ backgroundColor: isCompleted ? color : 'var(--color-slate-panel)' }}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </aside>

      {/* Main Central Pane - Workspace */}
      <section className="grid grid-rows-[auto_1fr] bg-obsidian p-5 overflow-hidden">
        <div className="bg-slate-base border border-slate-panel rounded-lg flex flex-col overflow-hidden h-full">
          {/* Workspace Toolbar */}
          <header className="px-5 py-3 border-b border-slate-panel flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-bold flex items-center gap-2" style={{ color: CYBERPUNK_COLORS[activeNode - 1] }}><Terminal size={18} /> NODE {activeNode.toString().padStart(2, '0')}:</span>
              <span className="text-text-main font-semibold">Prompt Sandbox Editor</span>
            </div>
          </header>

          {/* Interactive Editor Area */}
          <div className="flex-1 p-[30px] flex flex-col gap-5 overflow-y-auto">
            <div className="flex-1 grid grid-rows-2 gap-4">
              <div className="bg-bg-code rounded-lg border border-slate-panel p-4 font-mono text-sm relative">
                <div className="absolute top-0 left-0 bg-slate-panel px-3 py-1 rounded-br-lg text-xs text-text-muted">Input Prompt</div>
                <div className="mt-6 text-emerald-neon leading-relaxed">
                  <span className="text-violet-neon">Role:</span> Expert Python Developer<br/><br/>
                  <span className="text-violet-neon">Task:</span> Explain how a 'for loop' works using a simple real-world analogy. Keep it under 3 sentences.<br/><br/>
                  <span className="text-violet-neon">Audience:</span> 10-year-old student.
                </div>
              </div>
              <div className="bg-bg-code-alt rounded-lg border border-slate-panel p-4 font-mono text-sm relative shadow-inner">
                <div className="absolute top-0 left-0 bg-violet-neon/20 px-3 py-1 rounded-br-lg text-xs text-violet-neon border-b border-r border-violet-neon/30">AI Output</div>
                <div className="mt-6 text-text-muted leading-relaxed">
                  Imagine you have a big box of 100 colorful LEGO blocks, and you want to look at every single one. A 'for loop' is like a set of instructions that says, "Pick up a block, look at it, put it in the finished pile, and repeat this *for* every block in the box." It does the exact same action repeatedly until it reaches the end of the items you told it to check!
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                className="text-white border-none py-3 px-6 rounded-md font-bold uppercase cursor-pointer flex items-center gap-2 transition-all hover:scale-105"
                style={{ 
                  backgroundColor: CYBERPUNK_COLORS[activeNode - 1],
                  color: '#000',
                  boxShadow: `0 0 15px ${CYBERPUNK_COLORS[activeNode - 1]}80`
                }}
              >
                <Play size={18} /> RUN SIMULATION
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Right Sidebar */}
      <aside className="border-l border-slate-panel flex flex-col p-5 gap-6 bg-obsidian z-10 overflow-y-auto">
        
        {/* Economy HUD */}
        <div className="bg-gradient-to-br from-slate-base to-obsidian border border-slate-panel rounded-xl p-4">
          <div className="text-[11px] uppercase opacity-50 mb-3 tracking-widest text-text-main">Global Economy HUD</div>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-amber-neon text-white flex items-center justify-center font-bold text-sm shrink-0">S</div>
            <div>
              <div className="font-extrabold text-[18px] text-text-main flex items-baseline gap-1">
                {user.stemios.toLocaleString()} 
                <span className="text-[10px] text-amber-neon">+15%</span>
              </div>
              <div className="text-[10px] opacity-50 text-text-main">Current Stemios Balance</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#EF4444] text-white flex items-center justify-center font-bold text-sm shrink-0">🔥</div>
            <div>
              <div className="font-extrabold text-[18px] text-text-main">{user.streak} Days</div>
              <div className="text-[10px] opacity-50 text-text-main">Continuous Learning Streak</div>
            </div>
          </div>
        </div>


        {/* Translation Trigger */}
        <button 
          onClick={() => setTranslationOpen(true)}
          className="w-full p-3 bg-cyan-neon text-white font-bold border-none rounded-md cursor-pointer uppercase text-xs flex justify-center items-center gap-2"
        >
          <Shuffle size={16} /> [ 🔀 View Lesson Translation ]
        </button>

        {/* Multiplayer Breakroom Locked */}
        <div className="mt-auto">
          <div className="text-[11px] opacity-50 mb-2.5 text-text-main uppercase tracking-wide">Multiplayer Breakroom</div>
          <div className="bg-slate-panel/20 border border-dashed border-slate-panel h-[120px] rounded-lg flex flex-col items-center justify-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-30 text-text-main">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span className="text-[10px] opacity-30 uppercase text-text-main">Locked until Unit 4</span>
          </div>
        </div>
      </aside>

      <TranslationSidebar isOpen={isTranslationOpen} onClose={() => setTranslationOpen(false)} />
    </article>
  );
}
