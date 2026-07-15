import React, { useState, useEffect } from 'react';
import { CONFIG_FLAGS } from './types';
import CyberpunkNavbar from './components/CyberpunkNavbar';
import STEMArcade from './components/STEMArcade';
import TeacherDashboard from './components/TeacherDashboard';
import AvatarCustomizer from './components/AvatarCustomizer';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { useUser } from './hooks/useUser';
import { LogIn, Rocket } from 'lucide-react';

export default function App() {
  const [magnifier, setMagnifier] = useState(1);
  const [dyslexic, setDyslexic] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { user: currentUser, loading: userLoading } = useUser(firebaseUser);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setFirebaseUser(user);
        setAccessToken(token);
      },
      () => {
        setFirebaseUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setFirebaseUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setFirebaseUser(null);
    setAccessToken(null);
  };

  useEffect(() => {
    if (lightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [lightMode]);

  // Admin Live-Editing Logic
  const showBetaGuardedFeatures = currentUser?.isAdmin && CONFIG_FLAGS.adminBetaOverride;

  if (userLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--paper)] text-[var(--ink)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Rocket className="w-12 h-12 text-[var(--amber)] animate-bounce" />
          <p className="font-mono text-sm uppercase tracking-widest">Initializing Systems...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser || !currentUser) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--paper)] text-[var(--ink)] p-6 text-center">
        <div className="max-w-md w-full space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter ledger-title">
              Ledger <span className="highlight-made">&amp;</span> Proof
            </h1>
            <p className="text-[var(--ink-soft)] font-medium">The STEM Arcade of the Future.</p>
          </div>

          <div className="p-8 bg-[var(--paper-2)] border border-[var(--line)] rounded-2xl shadow-xl space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-[var(--amber-tint)] flex items-center justify-center text-[var(--amber)]">
                <Rocket className="w-10 h-10" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Welcome Back, Cadet</h2>
              <p className="text-sm text-[var(--muted)]">Sign in to sync your Stemios, track your streaks, and access the curriculum.</p>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-[var(--amber)] text-[var(--paper)] font-bold py-3 px-6 rounded-xl hover:bg-[var(--amber-bright)] transition-all transform active:scale-95 disabled:opacity-50"
            >
              <LogIn className="w-5 h-5" />
              {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
            </button>
          </div>

          <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-mono">
            Encrypted & Secure • Powered by Firebase
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`h-screen w-screen flex flex-col overflow-hidden transition-all ${dyslexic ? 'opendyslexic-mode' : 'font-sans'}`} 
      style={{ fontSize: `${magnifier}rem` }}
    >
      <CyberpunkNavbar
        user={currentUser}
        lightMode={lightMode}
        setLightMode={setLightMode}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col overflow-hidden overflow-y-auto">
        
        {/* Dynamic Authentication Routing */}
        {currentUser.role === 'student' && <STEMArcade user={currentUser} />}
        {currentUser.role === 'teacher' && <TeacherDashboard user={currentUser} accessToken={accessToken} />}

        {/* Admin Beta Features */}
        {showBetaGuardedFeatures && (
          <div className="absolute inset-0 z-50 pointer-events-none p-4">
            <div className="pointer-events-auto bg-[var(--paper-2)] border border-[var(--amber)]/30 p-6 rounded-2xl shadow-2xl relative max-w-4xl mx-auto mt-20 max-h-[80vh] overflow-y-auto backdrop-blur-xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--paper)] border border-[var(--amber)] text-[var(--amber)] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                Admin Beta Override Active
              </div>
              <AvatarCustomizer user={currentUser} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
