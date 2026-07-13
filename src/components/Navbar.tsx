import React from 'react';
import { User as MockUser } from '../types';
import { Settings, ZoomIn, ZoomOut, Type, Coins, Flame, UserCircle, Sun, Moon, BookOpen } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  user: MockUser;
  onUserChange: (id: string) => void;
  magnifier: number;
  setMagnifier: (val: number | ((prev: number) => number)) => void;
  dyslexic: boolean;
  setDyslexic: (val: boolean) => void;
  lightMode: boolean;
  setLightMode: (val: boolean) => void;
  users: MockUser[];
  firebaseUser: FirebaseUser | null;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, onUserChange, magnifier, setMagnifier, dyslexic, setDyslexic, lightMode, setLightMode, users, firebaseUser, onLogin, onLogout }: NavbarProps) {
  return (
    <nav className="h-[56px] border-b border-slate-panel flex items-center justify-between px-5 bg-obsidian z-[100] shrink-0">
      {/* Logo & Identity */}
      <div className="font-heading font-extrabold tracking-tight text-[18px] text-text-main flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg> 
        INTRO TO AI 
      </div>

      {/* Global Controls & Auth State */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          {/* Accessibility Tools */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setLightMode(!lightMode)}
              className="bg-slate-panel hover:bg-slate-700 text-text-main text-[11px] font-bold px-3 py-1.5 rounded transition-colors mr-2 uppercase tracking-widest"
              title="Toggle Theme"
            >
              {lightMode ? 'Dark' : 'Light'}
            </button>
            <button 
              onClick={() => setMagnifier(m => Math.max(0.8, m - 0.1))}
              className="p-1 text-slate-400 hover:text-text-main transition-colors"
              title="Decrease Text Size"
            >
              <ZoomOut size={16} />
            </button>
            <button 
              onClick={() => setMagnifier(m => Math.min(1.5, m + 0.1))}
              className="p-1 text-slate-400 hover:text-text-main transition-colors"
              title="Increase Text Size"
            >
              <ZoomIn size={16} />
            </button>
          </div>
          
          <button 
            onClick={() => setDyslexic(!dyslexic)}
            className={`bg-transparent border border-slate-panel text-text-main px-3 py-1.5 rounded transition-colors flex items-baseline gap-px ${dyslexic ? 'border-cyan-neon text-cyan-neon bg-cyan-neon/10' : 'hover:border-slate-500 hover:bg-slate-panel/30'}`}
            title="Toggle OpenDyslexic Font"
          >
            <span className="text-xs font-medium">A</span>
            <span className="text-sm font-bold">a</span>
          </button>

          {/* Google Auth & Mock Role Selector */}
          <div className="flex items-center gap-4 border-l border-slate-panel pl-4 ml-4">
            {firebaseUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {firebaseUser.photoURL ? (
                    <img src={firebaseUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-panel shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
                  ) : (
                    <div className="w-8 h-8 bg-violet-neon rounded-full flex items-center justify-center font-bold text-sm text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                      {firebaseUser.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button 
                  onClick={onLogout}
                  className="text-xs bg-slate-panel hover:bg-slate-700 text-text-main px-3 py-1.5 rounded transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={onLogin}
                className="gsi-material-button bg-white text-black font-medium text-sm px-4 py-2 rounded shadow flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                Sign in with Google
              </button>
            )}

            {/* Role Switcher for Demo */}
            <div className="relative group ml-2">
              <div className="text-[10px] uppercase text-text-muted cursor-help border border-dashed border-slate-panel px-2 py-1 rounded">
                Mock Role: {user.role}
              </div>
              <select 
                value={user.id} 
                onChange={(e) => onUserChange(e.target.value)}
                className="absolute right-0 top-full mt-1 bg-slate-base border border-slate-panel text-sm text-text-main rounded-md py-1 px-2 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity z-50 w-32"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
