import React, { useState, useEffect } from 'react';
import { CONFIG_FLAGS, User } from './types';
import CyberpunkNavbar from './components/CyberpunkNavbar';
import STEMArcade from './components/STEMArcade';
import AIFoundations from './components/AIFoundations';
import UnitLearningPath from './components/UnitLearningPath';
import LessonViewer from './components/LessonViewer';
import TeacherDashboard from './components/TeacherDashboard';
import AvatarCustomizer from './components/AvatarCustomizer';
import AuthScreen from './components/AuthScreen';
import BadgeShowcase from './components/BadgeShowcase';
import { initAuth, logout } from './lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { useUser } from './hooks/useUser';
import { Rocket, X } from 'lucide-react';
import LessonBuilder from './components/LessonBuilder';
import ResourcesPage from './components/ResourcesPage';

export default function App() {
  const [magnifier, setMagnifier] = useState(1);
  const [dyslexic, setDyslexic] = useState(false);
  const [lightMode, setLightMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('stemio_light_mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [activeView, setActiveView] = useState('arcade');
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showBetaPopup, setShowBetaPopup] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [guestUser, setGuestUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('stemio_guest_user');
    return saved ? JSON.parse(saved) : null;
  });

  const { user: currentUser, loading: userLoading } = useUser(firebaseUser);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setFirebaseUser(user);
        setAccessToken(token || null);
      },
      () => {
        setFirebaseUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleGuestUpdate = (e: any) => {
      setGuestUser(e.detail);
    };
    window.addEventListener('guest-user-updated', handleGuestUpdate);
    return () => window.removeEventListener('guest-user-updated', handleGuestUpdate);
  }, []);

  const handleAuthSuccess = (user: FirebaseUser, token: string) => {
    setFirebaseUser(user);
    setAccessToken(token || null);
  };

  const handleGuestStart = (name: string) => {
    const isHaha = name.trim().toLowerCase() === 'haha';
    const newGuest: User = {
      id: `guest_${Date.now()}`,
      name,
      email: '',
      role: isHaha ? 'teacher' : 'student',
      isAdmin: isHaha,
      stemios: 100,
      streak: 0
    };
    localStorage.setItem('stemio_guest_user', JSON.stringify(newGuest));
    setGuestUser(newGuest);
  };

  const handleLogout = async () => {
    if (guestUser) {
      setGuestUser(null);
      localStorage.removeItem('stemio_guest_user');
    } else {
      await logout();
      setFirebaseUser(null);
      setAccessToken(null);
    }
  };

  useEffect(() => {
    if (lightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('stemio_light_mode', JSON.stringify(lightMode));
  }, [lightMode]);

  const effectiveUser = guestUser || currentUser;

  // Admin Live-Editing Logic
  const showBetaGuardedFeatures = effectiveUser?.isAdmin && CONFIG_FLAGS.adminBetaOverride && showBetaPopup;

  if (userLoading && !guestUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--paper)] text-[var(--ink)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Rocket className="w-12 h-12 text-[var(--amber)] animate-bounce" />
          <p className="font-mono text-sm uppercase tracking-widest">Initializing Systems...</p>
        </div>
      </div>
    );
  }

  const isQuickStartUser = firebaseUser?.email?.endsWith('@stemio.local');

  if (!effectiveUser) {
    return (
      <AuthScreen 
        onAuthSuccess={handleAuthSuccess} 
        onGuestStart={handleGuestStart}
        isLoggingIn={isLoggingIn} 
        setIsLoggingIn={setIsLoggingIn}
        firebaseUser={firebaseUser}
      />
    );
  }

  return (
    <div 
      className={`h-screen w-screen flex flex-col overflow-hidden transition-all ${dyslexic ? 'opendyslexic-mode' : 'font-sans'}`} 
      style={{ fontSize: `${magnifier}rem` }}
    >
      <CyberpunkNavbar
        user={effectiveUser}
        lightMode={lightMode}
        setLightMode={setLightMode}
        onLogout={handleLogout}
        activeView={activeView}
        onNavigate={setActiveView}
      />
      <main className="flex-1 flex flex-col overflow-hidden overflow-y-auto">
        
        {/* Dynamic Authentication Routing */}
        {(activeView === 'unit-path' || activeView === 'arcade' || activeView === 'ai-foundations' || activeView === 'badges' || activeView === 'lesson-viewer') && (
          <>
            {activeView === 'lesson-viewer' && selectedLessonId && (
              <LessonViewer 
                lessonId={selectedLessonId} 
                onBack={() => setActiveView('unit-path')} 
              />
            )}
            {activeView === 'unit-path' && selectedUnit && selectedUnit.customLesson && (
              <LessonViewer 
                lessonId={selectedUnit.id} 
                onBack={() => setActiveView('arcade')} 
              />
            )}
            {activeView === 'unit-path' && selectedUnit && !selectedUnit.customLesson && (
              <UnitLearningPath 
                unitId={selectedUnit.id} 
                unitTitle={selectedUnit.title} 
                onBack={() => {
                  const isAIFoundations = selectedUnit.id.startsWith('u');
                  setActiveView(isAIFoundations ? 'ai-foundations' : 'arcade');
                }} 
                onLessonSelect={(lessonId) => {
                  setSelectedLessonId(lessonId);
                  setActiveView('lesson-viewer');
                }}
              />
            )}
            {activeView === 'arcade' && <STEMArcade user={effectiveUser} onUnitSelect={(unit) => { setSelectedUnit(unit); setActiveView('unit-path'); }} />}
            {activeView === 'ai-foundations' && <AIFoundations user={effectiveUser} onUnitSelect={(unit) => { setSelectedUnit(unit); setActiveView('unit-path'); }} />}
            {activeView === 'badges' && <BadgeShowcase user={effectiveUser} />}
          </>
        )}
        {effectiveUser.role === 'teacher' && activeView === 'classroom' && <TeacherDashboard user={effectiveUser} accessToken={accessToken} />}
        {activeView === 'lesson-builder' && <LessonBuilder user={effectiveUser} onBack={() => setActiveView('arcade')} />}
        {activeView === 'resources' && <ResourcesPage user={effectiveUser} />}
        {activeView === 'avatar' && <AvatarCustomizer user={effectiveUser} />}

        {/* Admin Beta Features */}
        {showBetaGuardedFeatures && (
          <div className="absolute inset-0 z-50 pointer-events-none p-4">
            <div className="pointer-events-auto bg-[var(--paper-2)] border border-[var(--amber)]/30 p-6 rounded-2xl shadow-2xl relative max-w-4xl mx-auto mt-20 max-h-[80vh] overflow-y-auto backdrop-blur-xl">
              <button 
                onClick={() => setShowBetaPopup(false)}
                className="absolute top-4 right-4 text-[var(--amber)] hover:text-[var(--amber)]/70 transition-colors"
                title="Close Admin Panel"
              >
                <X size={24} />
              </button>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--paper)] border border-[var(--amber)] text-[var(--amber)] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                Admin Beta Override Active
              </div>
              <AvatarCustomizer user={effectiveUser} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}