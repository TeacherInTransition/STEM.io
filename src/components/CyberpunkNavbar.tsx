import React, { useState } from 'react';
import { User } from '../types';
import { Shield, ChevronDown, User as UserIcon, LogOut, Settings, Flame, Sun, Moon, Zap } from 'lucide-react';

interface NavbarProps {
  user: User;
  lightMode?: boolean;
  setLightMode?: (mode: boolean) => void;
  onLogout?: () => void;
}

export default function CyberpunkNavbar({ user, lightMode, setLightMode, onLogout }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="stemios-hud h-[64px] flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
      {/* LEFT: Logo & Identity */}
      <div className="flex items-center gap-6">
        <div className="ledger-title text-xl font-bold text-[var(--ink)]">
          Ledger <span className="highlight-made">&amp;</span> Proof
        </div>
        
        <div className="h-6 w-[1px] bg-[var(--line-2)]"></div>
        
        <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-widest text-[var(--muted)]">
          <a href="#" className="hover:text-[var(--amber)] transition-colors">Courses</a>
          <a href="#" className="hover:text-[var(--amber)] transition-colors">Play</a>
          <a href="#" className="hover:text-[var(--amber)] transition-colors">Resources</a>
        </div>
      </div>

      {/* RIGHT: Economy HUD Capsule & User */}
      <div className="flex items-center gap-4">
        {setLightMode && (
          <button
            onClick={() => setLightMode(!lightMode)}
            className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--paper)] border border-[var(--line-2)] rounded-full hover:border-[var(--amber)] transition-colors text-[var(--ink)]"
            title="Toggle theme"
          >
            {lightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        )}

        {/* Economy HUD Capsule */}
        <div className="flex items-center bg-[var(--paper)] border border-[var(--line-2)] rounded-full px-3 py-1.5 h-[40px] shadow-sm">
          {/* Flame Streak */}
          <div className="flex items-center gap-1.5 px-3 border-r border-[var(--line)]">
            <Flame size={14} className="text-[#EF4444]" />
            <span className="font-mono text-sm font-bold text-[var(--ink)]">{user.streak}</span>
          </div>
          
          {/* Stemios Balance */}
          <div className="flex items-center gap-2 px-3">
            <div className="w-5 h-5 rounded-full bg-[var(--amber)] flex items-center justify-center text-[var(--paper)] font-black text-[10px]">
              S
            </div>
            <span className="stemios-wallet text-sm font-bold text-[var(--amber)]" style={{ textShadow: '0 0 10px var(--amber-tint-2)' }}>
              {user.stemios.toLocaleString()}
            </span>
          </div>
        </div>
        
        {/* User Dropdown */}
        <div className="relative">
          <button 
            className="flex items-center gap-2 bg-[var(--paper)] border border-[var(--line-2)] rounded-full pl-1.5 pr-3 py-1.5 hover:border-[var(--amber)] transition-colors cursor-pointer h-[40px]"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-6 h-6 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--ink)]">
              <UserIcon size={14} />
            </div>
            <span className="text-xs font-bold text-[var(--ink)]">{user.name}</span>
            <ChevronDown size={14} className="text-[var(--muted)]" />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-[48px] right-0 w-[200px] bg-[var(--paper-2)] border border-[var(--line)] rounded-md shadow-lg overflow-hidden z-50">
              <div className="p-3 border-b border-[var(--line-2)]">
                <div className="text-[10px] uppercase text-[var(--muted)] font-mono tracking-widest mb-1">User ID</div>
                <div className="text-sm text-[var(--ink)] truncate">{user.email || 'USER_9942'}</div>
              </div>
              <div className="py-1 border-b border-[var(--line-2)]">
                <button className="w-full text-left px-3 py-2 text-xs text-[var(--ink)] hover:bg-[var(--surface)] flex items-center justify-between transition-colors group">
                  <span className="flex items-center gap-2">
                    <Shield size={14} className="text-[var(--muted)] group-hover:text-[var(--amber)]" /> Marketplace
                  </span>
                </button>
                <button className="w-full text-left px-3 py-2 text-xs text-[var(--ink)] hover:bg-[var(--surface)] flex items-center justify-between transition-colors group">
                  <span className="flex items-center gap-2">
                    <Zap size={14} className="text-[var(--muted)] group-hover:text-[var(--amber)]" /> Global Rank
                  </span>
                  <span className="text-[10px] font-mono text-[var(--green)]">#24</span>
                </button>
              </div>
              <div className="py-1">
                <button className="w-full text-left px-3 py-2 text-xs text-[var(--ink)] hover:bg-[var(--surface)] flex items-center gap-2 transition-colors">
                  <Settings size={14} className="text-[var(--muted)]" /> Settings
                </button>
                <button 
                  className="w-full text-left px-3 py-2 text-xs text-[var(--ink)] hover:bg-red-500/10 hover:text-red-500 flex items-center gap-2 transition-colors"
                  onClick={onLogout}
                >
                  <LogOut size={14} className="opacity-70" /> Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
