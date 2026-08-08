import React, { useState, useEffect } from 'react';
import { User } from '../types';
import AvatarRenderer, { AvatarConfig, DEFAULT_AVATAR_CONFIG } from './AvatarRenderer';
import { 
  Shield, ChevronDown, User as UserIcon, LogOut, Settings, Flame, 
  Sun, Moon, Zap, Bell, Coins, Palette, Sparkles, Check, X, Menu,
  ExternalLink, Lightbulb, Shirt, Smile, CheckCircle2, BookOpen, Layers, Trophy
} from 'lucide-react';

interface NavbarProps {
  user: User;
  lightMode?: boolean;
  setLightMode?: (mode: boolean) => void;
  onLogout?: () => void;
  activeView?: string;
  onNavigate?: (view: string) => void;
}

function SnooAvatar({ config, size = 30 }: { config: any, size?: number }) {
  return (
    <div 
      className="relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden border border-amber-500/40 bg-slate-900 shadow-xs" 
      style={{ width: size, height: size }}
    >
      <AvatarRenderer config={config} size={size} showShadow={false} />
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
    </div>
  );
}

export default function CyberpunkNavbar({ user, lightMode, setLightMode, onLogout, activeView = 'arcade', onNavigate }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [avatarConfig, setAvatarConfig] = useState<any>(() => {
    const saved = localStorage.getItem('stemio_avatar_config');
    return saved ? JSON.parse(saved) : DEFAULT_AVATAR_CONFIG;
  });

  useEffect(() => {
    const handleAvatarUpdate = (e: any) => {
      if (e.detail) {
        setAvatarConfig(e.detail);
      }
    };
    window.addEventListener('stemio-avatar-updated', handleAvatarUpdate);
    return () => window.removeEventListener('stemio-avatar-updated', handleAvatarUpdate);
  }, []);

  const saveAvatarConfig = (newConfig: AvatarConfig) => {
    setAvatarConfig(newConfig);
    localStorage.setItem('stemio_avatar_config', JSON.stringify(newConfig));
  };

  const siteUpdates = [
    {
      id: 'update-1',
      title: '💡 Question Hints Feature Added',
      desc: 'You can now click "Need a hint?" on checkpoint quiz questions for guided assistance.',
      time: 'Just now',
      tag: 'New Feature',
      unread: true,
      action: () => onNavigate && onNavigate('arcade')
    },
    {
      id: 'update-2',
      title: '🪙 Stemios Rewards System Updated',
      desc: 'Complete checkpoints to earn Stemios credited directly to your account balance.',
      time: '2 hours ago',
      tag: 'Rewards',
      unread: true,
      action: () => onNavigate && onNavigate('badges')
    },
    {
      id: 'update-3',
      title: '⚡ Custom Lesson Builder Active',
      desc: 'Admins and Teachers can now add questions, hints, and duplicate quiz items easily.',
      time: 'Yesterday',
      tag: 'Platform',
      unread: true,
      action: () => user.isAdmin && onNavigate && onNavigate('lesson-builder')
    }
  ];

  return (
    <>
      <nav className="stemios-hud h-[64px] flex items-center justify-between px-3 md:px-6 shrink-0 transition-colors duration-300 relative z-40">
        {/* LEFT: Logo & Identity */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsNotificationsOpen(false);
              setIsDropdownOpen(false);
            }}
            className="md:hidden p-1.5 rounded-lg text-[var(--ink)] hover:bg-[var(--surface)] transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center cursor-pointer" onClick={() => onNavigate && onNavigate('arcade')}>
            <img 
              src="https://muids.mahidol.ac.th/wp-content/uploads/2026/07/logo-muids-scaled-300x77.png" 
              alt="MUIDS Logo" 
              className={`h-6 sm:h-8 w-auto object-contain transition-all duration-300 ${lightMode ? 'brightness-0 opacity-80' : ''}`} 
            />
          </div>
          
          <div className="hidden md:block h-6 w-[1px] bg-[var(--line-2)]"></div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 font-mono text-[11px] uppercase tracking-widest text-[var(--muted)]">
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
            <button 
              onClick={() => onNavigate && onNavigate('resources')} 
              className={`transition-colors ${activeView === 'resources' ? 'text-[var(--amber)] font-bold' : 'hover:text-[var(--amber)]'}`}
            >
              Resources
            </button>
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

        {/* RIGHT: Reddit-style HUD Container */}
        <div className="flex items-center gap-1 md:gap-2">
          
          {/* 1. Day Streak Capsule - styled like Reddit karma/awards */}
          <div 
            className="flex items-center gap-1 bg-[var(--paper-2)] hover:bg-[var(--surface)] border border-[var(--line)] rounded-full px-3 py-1 h-[34px] text-xs font-bold text-[var(--ink)] transition-all cursor-pointer group"
            title={`${user.streak} Day Active Learning Streak`}
          >
            <Flame size={16} className="text-[#FF4500] group-hover:scale-110 transition-transform fill-[#FF4500]" />
            <span className="font-mono text-xs">{user.streak}d</span>
          </div>

          {/* 2. Amount of Stemios Capsule - styled like Reddit Coins */}
          <div 
            className="flex items-center gap-1 bg-[var(--paper-2)] hover:bg-[var(--surface)] border border-[var(--line)] rounded-full px-3 py-1 h-[34px] text-xs font-bold text-[var(--amber)] transition-all cursor-pointer group"
            title={`${user.stemios.toLocaleString()} Stemios Balance`}
            onClick={() => setShowAvatarModal(true)}
          >
            <Coins size={16} className="text-[var(--amber)] group-hover:rotate-12 transition-transform fill-[var(--amber)]/20" />
            <span className="stemios-wallet font-mono text-xs">{user.stemios.toLocaleString()}</span>
          </div>

          <div className="h-5 w-[1px] bg-[var(--line-2)] mx-1"></div>

          {/* 3. Keep Theme Mode Toggle - Circular button like Reddit Dark Mode Toggle */}
          {setLightMode && (
            <button
              onClick={() => setLightMode(!lightMode)}
              className="flex items-center justify-center w-[34px] h-[34px] rounded-full hover:bg-[var(--surface)] text-[var(--ink)] transition-colors cursor-pointer"
              title="Toggle Theme Mode"
            >
              {lightMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          )}

          {/* 4. Notification Bell (Linked to Site Updates) - Circular button like Reddit Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsDropdownOpen(false);
              }}
              className="relative flex items-center justify-center w-[34px] h-[34px] rounded-full hover:bg-[var(--surface)] text-[var(--ink)] transition-colors cursor-pointer"
              title="Site Updates & Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#FF4500] text-white text-[9px] font-bold px-1 py-0.2 min-w-[14px] h-[14px] flex items-center justify-center rounded-full border border-[var(--paper)] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Site Updates Popover */}
            {isNotificationsOpen && (
              <div className="absolute top-[42px] right-0 w-[320px] sm:w-[360px] bg-[var(--paper-2)] border border-[var(--line)] rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                <div className="p-3.5 border-b border-[var(--line-2)] flex items-center justify-between bg-[var(--paper)]">
                  <div className="flex items-center gap-2">
                    <Bell size={15} className="text-[#FF4500]" />
                    <span className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">Site Updates & News</span>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => setUnreadCount(0)} 
                      className="text-[11px] text-[#FF4500] hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[320px] overflow-y-auto divide-y divide-[var(--line-2)]">
                  {siteUpdates.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        if (item.action) item.action();
                        setIsNotificationsOpen(false);
                      }}
                      className="p-3.5 hover:bg-[var(--surface)] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold bg-[#FF4500]/10 text-[#FF4500] border border-[#FF4500]/30 px-2 py-0.5 rounded-full">
                          {item.tag}
                        </span>
                        <span className="text-[10px] text-[var(--muted)]">{item.time}</span>
                      </div>
                      <h5 className="text-xs font-bold text-[var(--ink)] group-hover:text-[#FF4500] transition-colors mb-1">
                        {item.title}
                      </h5>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-[var(--paper)] border-t border-[var(--line-2)] text-center">
                  <span className="text-[10px] text-[var(--muted)] font-mono">Platform Version v2.5 • All Systems Operational</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-[1px] bg-[var(--line-2)] mx-1"></div>

          {/* 5. Customized Reddit Avatar & User Menu Dropdown */}
          <div className="relative">
            <button 
              className="flex items-center gap-1.5 hover:bg-[var(--surface)] rounded-full p-1 transition-colors cursor-pointer h-[34px] pr-2"
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setIsNotificationsOpen(false);
              }}
            >
              <SnooAvatar config={avatarConfig} size={28} />
              <span className="text-xs font-medium text-[var(--ink)] max-w-[80px] truncate hidden sm:inline-block">{user.name}</span>
              <ChevronDown size={12} className="text-[var(--muted)]" />
            </button>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-[42px] right-0 w-[220px] bg-[var(--paper-2)] border border-[var(--line)] rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                <div className="p-3.5 border-b border-[var(--line-2)] flex items-center gap-3 bg-[var(--paper)]">
                  <SnooAvatar config={avatarConfig} size={36} />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-[var(--ink)] truncate">{user.name}</div>
                    <div className="text-[10px] font-mono text-[#FF4500] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={10} /> {user.role}
                    </div>
                  </div>
                </div>

                <div className="py-1 border-b border-[var(--line-2)]">
                  <button 
                    onClick={() => {
                      if (onNavigate) onNavigate('avatar');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-[var(--ink)] hover:bg-[var(--surface)] flex items-center gap-2 transition-colors font-semibold group cursor-pointer"
                  >
                    <Palette size={15} className="text-[#FF4500] group-hover:scale-110 transition-transform" /> 
                    <span>Customize Avatar</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (onNavigate) onNavigate('avatar');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-[var(--ink)] hover:bg-[var(--surface)] flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Shield size={15} className="text-[var(--muted)] group-hover:text-[#FF4500]" /> Stemios Shop
                    </span>
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Store</span>
                  </button>
                  <button className="w-full text-left px-3.5 py-2.5 text-xs text-[var(--ink)] hover:bg-[var(--surface)] flex items-center justify-between transition-colors group">
                    <span className="flex items-center gap-2">
                      <Zap size={15} className="text-[var(--muted)] group-hover:text-[#FF4500]" /> Global Rank
                    </span>
                    <span className="text-[10px] font-mono text-[var(--green)]">#24</span>
                  </button>
                </div>

                <div className="py-1">
                  <button 
                    className="w-full text-left px-3.5 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                    onClick={onLogout}
                  >
                    <LogOut size={15} className="opacity-80" /> Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[var(--paper-2)] border-b border-[var(--line)] p-4 space-y-2 z-40 animate-fadeIn shadow-xl font-mono text-xs uppercase tracking-wider">
          <div className="font-bold text-[var(--muted)] text-[10px] uppercase tracking-widest pb-1 border-b border-[var(--line-2)] mb-2">
            Navigation Menu
          </div>
          
          <button
            onClick={() => {
              if (onNavigate) onNavigate('arcade');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg font-bold flex items-center justify-between transition-colors ${
              activeView === 'arcade' ? 'bg-[var(--surface)] text-[var(--amber)]' : 'text-[var(--ink)] hover:bg-[var(--surface)]'
            }`}
          >
            <span className="flex items-center gap-2"><BookOpen size={16} /> All Courses</span>
            {activeView === 'arcade' && <CheckCircle2 size={14} className="text-[var(--amber)]" />}
          </button>

          <button
            onClick={() => {
              if (onNavigate) onNavigate('ai-foundations');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg font-bold flex items-center justify-between transition-colors ${
              activeView === 'ai-foundations' ? 'bg-[var(--surface)] text-[var(--amber)]' : 'text-[var(--ink)] hover:bg-[var(--surface)]'
            }`}
          >
            <span className="flex items-center gap-2"><Sparkles size={16} /> AI Foundations</span>
            {activeView === 'ai-foundations' && <CheckCircle2 size={14} className="text-[var(--amber)]" />}
          </button>

          <button
            onClick={() => {
              if (onNavigate) onNavigate('badges');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg font-bold flex items-center justify-between transition-colors ${
              activeView === 'badges' ? 'bg-[var(--surface)] text-[var(--amber)]' : 'text-[var(--ink)] hover:bg-[var(--surface)]'
            }`}
          >
            <span className="flex items-center gap-2"><Trophy size={16} /> Milestones & Rubrics</span>
            {activeView === 'badges' && <CheckCircle2 size={14} className="text-[var(--amber)]" />}
          </button>

          <button
            onClick={() => {
              if (onNavigate) onNavigate('resources');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg font-bold flex items-center justify-between transition-colors ${
              activeView === 'resources' ? 'bg-[var(--surface)] text-[var(--amber)]' : 'text-[var(--ink)] hover:bg-[var(--surface)]'
            }`}
          >
            <span className="flex items-center gap-2"><Layers size={16} /> Resources Directory</span>
            {activeView === 'resources' && <CheckCircle2 size={14} className="text-[var(--amber)]" />}
          </button>

          {user.role === 'teacher' && (
            <button
              onClick={() => {
                if (onNavigate) onNavigate('classroom');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg font-bold flex items-center justify-between transition-colors ${
                activeView === 'classroom' ? 'bg-[var(--surface)] text-[#06B6D4]' : 'text-[var(--ink)] hover:bg-[var(--surface)]'
              }`}
            >
              <span className="flex items-center gap-2"><Shield size={16} /> Classroom</span>
              {activeView === 'classroom' && <CheckCircle2 size={14} className="text-[#06B6D4]" />}
            </button>
          )}

          {user.isAdmin && (
            <button
              onClick={() => {
                if (onNavigate) onNavigate('lesson-builder');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg font-bold flex items-center justify-between transition-colors ${
                activeView === 'lesson-builder' ? 'bg-[var(--surface)] text-[#06B6D4]' : 'text-[var(--ink)] hover:bg-[var(--surface)]'
              }`}
            >
              <span className="flex items-center gap-2"><Zap size={16} /> Lesson Builder</span>
              {activeView === 'lesson-builder' && <CheckCircle2 size={14} className="text-[#06B6D4]" />}
            </button>
          )}
        </div>
      )}

      {/* CUSTOMIZE AVATAR MODAL */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0B0F17] border border-[#1F2937] text-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
            {/* Header */}
            <div className="p-5 border-b border-[#1F2937] flex items-center justify-between bg-[#111827]">
              <div className="flex items-center gap-2">
                <Palette size={18} className="text-[#06B6D4]" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Customize Your Character Avatar</h3>
              </div>
              <button 
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Preview Canvas */}
              <div className="flex flex-col items-center justify-center p-6 bg-[#111827] border border-[#1F2937] rounded-xl relative">
                <SnooAvatar config={avatarConfig} size={96} />
                <span className="mt-3 text-xs font-bold text-gray-300">{user.name}'s Avatar</span>
                <span className="text-[10px] text-[#06B6D4]">Live Character Preview</span>
              </div>

              {/* Head / Skin Color */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Skin / Head Tone</label>
                <div className="flex gap-3">
                  {[
                    { label: 'Light', color: '#FCD5CE' },
                    { label: 'Warm', color: '#FFDFC4' },
                    { label: 'Bronze', color: '#8D5524' },
                    { label: 'Cyber Blue', color: '#38BDF8' },
                    { label: 'Neon Purple', color: '#A855F7' }
                  ].map(item => (
                    <button
                      key={item.color}
                      onClick={() => saveAvatarConfig({ ...avatarConfig, headColor: item.color })}
                      className={`w-9 h-9 rounded-full border-2 transition-transform ${avatarConfig.headColor === item.color ? 'border-amber-400 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: item.color }}
                      title={item.label}
                    />
                  ))}
                </div>
              </div>

              {/* Hairstyle / Headgear */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Hairstyle / Headgear</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'snoo', label: 'Snoo Antenna' },
                    { id: 'spiky', label: 'Spiky Hair' },
                    { id: 'cap', label: 'Baseball Cap' },
                    { id: 'hoodie', label: 'Cyber Hoodie' },
                    { id: 'headphones', label: 'Headphones' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => saveAvatarConfig({ ...avatarConfig, hairStyle: item.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${avatarConfig.hairStyle === item.id ? 'border-[#06B6D4] bg-[#06B6D4]/10 text-[#06B6D4]' : 'border-[#1F2937] text-gray-400 hover:border-gray-600'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessories */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Accessory</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'sunglasses', label: 'Cool Sunglasses' },
                    { id: 'glasses', label: 'Tech Glasses' },
                    { id: 'sparkles', label: 'Star Sparkles' },
                    { id: 'none', label: 'None' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => saveAvatarConfig({ ...avatarConfig, accessory: item.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${avatarConfig.accessory === item.id ? 'border-amber-400 bg-amber-400/10 text-amber-400' : 'border-[#1F2937] text-gray-400 hover:border-gray-600'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shirt Color */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Shirt / Jacket Color</label>
                <div className="flex gap-3">
                  {[
                    { label: 'Cyan', color: '#06B6D4' },
                    { label: 'Emerald', color: '#10B981' },
                    { label: 'Red', color: '#EF4444' },
                    { label: 'Amber', color: '#F59E0B' },
                    { label: 'Indigo', color: '#6366F1' }
                  ].map(item => (
                    <button
                      key={item.color}
                      onClick={() => saveAvatarConfig({ ...avatarConfig, shirtColor: item.color })}
                      className={`w-9 h-9 rounded-full border-2 transition-transform ${avatarConfig.shirtColor === item.color ? 'border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: item.color }}
                      title={item.label}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-[#111827] border-t border-[#1F2937] flex justify-end">
              <button
                onClick={() => setShowAvatarModal(false)}
                className="px-6 py-2 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-slate-950 font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2"
              >
                <CheckCircle2 size={16} /> Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
