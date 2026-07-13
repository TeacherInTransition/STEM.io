import React, { useState } from 'react';
import { User } from '../types';
import { Shirt, Smile, Image as ImageIcon, Sparkles, Lock, Check } from 'lucide-react';

const AVATAR_ITEMS = {
  Base: [
    { id: 'b1', name: 'Standard Human', price: 0, owned: true, premium: false },
    { id: 'b2', name: 'Cybernetic Frame', price: 500, owned: false, premium: false },
  ],
  Apparel: [
    { id: 'a1', name: 'Basic Hoodie', price: 0, owned: true, premium: false },
    { id: 'a2', name: 'Neon Synth Jacket', price: 1200, owned: false, premium: false },
    { id: 'a3', name: 'Holographic Cape', price: 0, owned: false, premium: true }, // Requires real tokens
  ]
};

export default function AvatarCustomizer({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<'Base' | 'Apparel'>('Apparel');
  const [equipped, setEquipped] = useState<{Base: string, Apparel: string}>({ Base: 'b1', Apparel: 'a1' });

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 mb-12">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-neon to-cyan-neon inline-flex items-center gap-2">
          <Sparkles className="text-violet-neon" />
          The Stemios Shop & Character Studio
        </h2>
        <p className="text-text-muted mt-2">Customize your avatar. Earn Stemios by completing quests, or unlock Premium Tier elements.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
        
        {/* Left: Dynamic Rendering Box */}
        <div className="lg:col-span-5 bg-slate-base border border-slate-panel rounded-2xl relative overflow-hidden flex flex-col">
          <div className="absolute top-4 left-4 bg-obsidian/80 backdrop-blur border border-slate-panel px-3 py-1.5 rounded-full text-xs font-bold text-text-main z-10 flex items-center gap-2">
            <span>Level 14</span>
            <div className="w-2 h-2 rounded-full bg-emerald-neon shadow-[0_0_8px_#00AD7C]"></div>
          </div>
          
          <div className="flex-1 flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--color-slate-panel)_0%,_var(--color-obsidian)_100%)]">
            {/* Abstract Placeholder for Avatar Graphic */}
            <div className="relative w-64 h-80 flex flex-col items-center justify-end pb-8">
              {/* Body */}
              <div className={`w-32 h-40 rounded-t-3xl transition-colors duration-500 ${equipped.Apparel === 'a2' ? 'bg-violet-neon shadow-[0_0_30px_rgba(99,102,241,0.4)]' : equipped.Apparel === 'a3' ? 'bg-gradient-to-tr from-amber-neon to-cyan-neon opacity-80' : 'bg-slate-600'}`}></div>
              {/* Head */}
              <div className={`absolute top-16 w-24 h-24 rounded-2xl shadow-xl transition-colors duration-500 ${equipped.Base === 'b2' ? 'bg-cyan-neon border-4 border-obsidian' : 'bg-[#FCD5CE]'}`}></div>
            </div>
          </div>
          
          <div className="h-16 bg-obsidian border-t border-slate-panel flex items-center justify-between px-6">
            <span className="font-mono text-sm text-text-muted">{user.name}'s Avatar</span>
            <button className="text-xs bg-slate-panel hover:bg-slate-700 text-text-main px-3 py-1.5 rounded">Randomize</button>
          </div>
        </div>

        {/* Right: Modular Studio & Tabs */}
        <div className="lg:col-span-7 bg-slate-base border border-slate-panel rounded-2xl flex flex-col overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-panel bg-obsidian">
            {(['Base', 'Apparel'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 font-semibold text-sm transition-all border-b-2 flex justify-center items-center gap-2 ${activeTab === tab ? 'border-violet-neon text-violet-neon bg-violet-neon/5' : 'border-transparent text-text-muted hover:bg-slate-panel hover:text-text-main'}`}
              >
                {tab === 'Base' ? <Smile size={18} /> : <Shirt size={18} />}
                {tab} Styles
              </button>
            ))}
          </div>

          {/* Grid Inventory */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AVATAR_ITEMS[activeTab].map(item => {
                const isEquipped = equipped[activeTab] === item.id;
                
                return (
                  <div 
                    key={item.id} 
                    className={`relative rounded-xl border p-4 flex flex-col items-center justify-between gap-4 transition-all ${isEquipped ? 'border-violet-neon bg-violet-neon/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-slate-panel bg-obsidian hover:border-slate-panel/50'}`}
                  >
                    <div className="w-16 h-16 bg-slate-panel rounded-lg flex items-center justify-center">
                      <ImageIcon className="text-text-muted" size={24} />
                    </div>
                    
                    <div className="text-center w-full">
                      <h4 className="text-sm font-bold text-text-main truncate">{item.name}</h4>
                      
                      <div className="mt-3">
                        {item.owned ? (
                          isEquipped ? (
                            <button className="w-full py-1.5 bg-violet-neon text-white text-xs font-bold rounded flex items-center justify-center gap-1">
                              <Check size={14} /> Equipped
                            </button>
                          ) : (
                            <button 
                              onClick={() => setEquipped(prev => ({...prev, [activeTab]: item.id}))}
                              className="w-full py-1.5 bg-slate-panel hover:bg-slate-panel/80 text-text-main text-xs font-bold rounded transition-colors"
                            >
                              Equip
                            </button>
                          )
                        ) : (
                          item.premium ? (
                            <button className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-amber-700 text-white text-xs font-bold rounded flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                              <Lock size={12} /> Buy Premium
                            </button>
                          ) : (
                            <button className="w-full py-1.5 border border-emerald-neon/50 text-emerald-neon hover:bg-emerald-neon/10 text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors">
                              <Lock size={12} /> {item.price} Stemios
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
