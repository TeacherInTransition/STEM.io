import React, { useState, useEffect } from 'react';
import { MOCK_USERS, CONFIG_FLAGS } from './types';
import Navbar from './components/Navbar';
import StudentPortal from './components/StudentPortal';
import TeacherDashboard from './components/TeacherDashboard';
import AvatarCustomizer from './components/AvatarCustomizer';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [activeUserId, setActiveUserId] = useState(MOCK_USERS[0].id);
  const [magnifier, setMagnifier] = useState(1);
  const [dyslexic, setDyslexic] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
  };

  useEffect(() => {
    if (lightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [lightMode]);

  const currentUser = MOCK_USERS.find(u => u.id === activeUserId) || MOCK_USERS[0];

  // Admin Live-Editing Logic
  const showBetaGuardedFeatures = currentUser.isAdmin && CONFIG_FLAGS.adminBetaOverride;

  return (
    <div 
      className={`h-screen w-screen flex flex-col overflow-hidden transition-all ${dyslexic ? 'opendyslexic-mode' : 'font-sans'}`} 
      style={{ fontSize: `${magnifier}rem` }}
    >
      <Navbar
        user={currentUser}
        onUserChange={setActiveUserId}
        magnifier={magnifier}
        setMagnifier={setMagnifier}
        dyslexic={dyslexic}
        setDyslexic={setDyslexic}
        lightMode={lightMode}
        setLightMode={setLightMode}
        users={MOCK_USERS}
        firebaseUser={firebaseUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Dynamic Authentication Routing */}
        {currentUser.role === 'student' && <StudentPortal user={currentUser} />}
        {currentUser.role === 'teacher' && <TeacherDashboard user={currentUser} accessToken={accessToken} />}

        {/* Mock Multiplayer Breakroom Lock/Unlock logic can be inferred. Render Beta Features below */}
        
        {showBetaGuardedFeatures && (
          <div className="absolute inset-0 z-50 pointer-events-none p-4">
            <div className="pointer-events-auto bg-slate-base border border-amber-neon/30 p-6 rounded-2xl shadow-2xl relative max-w-4xl mx-auto mt-20 max-h-[80vh] overflow-y-auto">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-obsidian border border-amber-neon text-amber-neon px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">
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
