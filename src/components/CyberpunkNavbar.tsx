import React, { useState } from 'react';
import { User } from '../types';
import { Shield, ChevronDown, User as UserIcon, LogOut, Settings, Flame, Sun, Moon, Zap } from 'lucide-react';

interface NavbarProps {
  user: User;
  lightMode?: boolean;
  setLightMode?: (mode: boolean) => void;
  onLogout?: () => void;
  activeView?: string;
  onNavigate?: (view: string) => void;
}

export default function CyberpunkNavbar({ user, lightMode, setLightMode, onLogout, activeView = 'arcade', onNavigate }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="stemios-hud h-[64px] flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
      {/* LEFT: Logo & Identity */}
      <div className="flex items-center gap-6">
        <div className="flex items-center">
          <img 
            src="https://muids.mahidol.ac.th/wp-content/uploads/2026/07/logo-muids-scaled-300x77.png" 
            alt="MUIDS Logo" 
            className={`h-8 w-auto object-contain transition-all duration-300 ${lightMode ? 'brightness-0 opacity-80' : ''}`} 
          />
        </div>
        
        <div className="h-6 w-[1px] bg-[var(--line-2)]"></div>
        
        <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-widest text-[var(--muted)]">
          <div className="relative group">
            <button 
              className={`flex items-center gap-1 transition-colors ${(activeView === 'arcade' || activeView === 'ai-foundations') ? 'text-[var(--amber)] font-bold' : 'hover:text-[var(--amber)]'}`}
            >
              Courses <ChevronDown size={14} className="opacity-70" />
            </button>
            <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-[var(--paper-2)] border border-[var(--line)] rounded-md shadow-lg overflow-hidden flex flex-col py-1">
                <button 
                  onClick={() => onNavigate && onNavigate('arcade')} 
                  className={`w-full text-left px-4 py-2 hover:bg-[var(--surface)] transition-colors ${activeView === 'arcade' ? 'text-[var(--amber)] font-bold' : 'text-[var(--ink)]'}`}
                >
                  All Courses
                </button>
                <button 
                  onClick={() => onNavigate && onNavigate('ai-foundations')} 
                  className={`w-full text-left px-4 py-2 hover:bg-[var(--surface)] transition-colors ${activeView === 'ai-foundations' ? 'text-[var(--amber)] font-bold' : 'text-[var(--ink)]'}`}
                >
                  AI Foundations
                </button>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('badges')} 
            className={`transition-colors ${activeView === 'badges' ? 'text-[var(--amber)] font-bold' : 'hover:text-[var(--amber)]'}`}
          >
            Milestones
          </button>
          <button className="hover:text-[var(--amber)] transition-colors">Resources</button>
          {user.role === 'teacher' && (
            <button
              onClick={() => onNavigate && onNavigate('classroom')}
              className={`transition-colors flex items-center gap-1 ${activeView === 'classroom' ? 'text-[#06B6D4] font-bold' : 'hover:text-[#06B6D4] text-[var(--muted)]'}`}
            >
              Classroom
            </button>
          )}
          {user.isAdmin && (
            <button
              onClick={() => onNavigate && onNavigate('lesson-builder')}
              className={`transition-colors flex items-center gap-1 ${activeView === 'lesson-builder' ? 'text-[#06B6D4] font-bold' : 'hover:text-[#06B6D4] text-[var(--muted)]'}`}
            >
              <Zap size={14} /> Lesson Builder
            </button>
          )}
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
