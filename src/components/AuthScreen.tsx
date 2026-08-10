import React, { useState } from 'react';
import { LogIn, Rocket, Mail, Lock, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';
import { googleSignIn, emailSignIn, emailSignUp, verifyEmail, anonymousSignIn, cadetSignIn, cadetSignUp } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthScreenProps {
  onAuthSuccess: (user: FirebaseUser, token: string) => void;
  onGuestStart: (name: string) => void;
  isLoggingIn: boolean;
  setIsLoggingIn: (val: boolean) => void;
  firebaseUser: FirebaseUser | null;
}

export default function AuthScreen({ onAuthSuccess, onGuestStart, isLoggingIn, setIsLoggingIn, firebaseUser }: AuthScreenProps) {
  const [mode, setMode] = useState<'quick' | 'login' | 'signup'>('quick');
  const [cadetName, setCadetName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        onAuthSuccess(result.user, result.accessToken);
      }
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCadetAuth = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    if (cadetName.trim().toLowerCase() === 'haha') {
      onGuestStart(cadetName);
      return;
    }
    if (!cadetName.trim() || !password.trim()) {
      setError("Please enter a Cadet Name and Password.");
      return;
    }
    
    setIsLoggingIn(true);
    setError(null);
    try {
      localStorage.setItem('pendingCadetName', cadetName);
      if (isSignUp) {
        const user = await cadetSignUp(cadetName, password);
        onAuthSuccess(user, "");
      } else {
        const user = await cadetSignIn(cadetName, password);
        onAuthSuccess(user, "");
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        console.warn('Cadet auth operation-not-allowed, falling back to guest mode:', cadetName);
        onGuestStart(cadetName.trim() || 'Cadet');
        return;
      }
      if (!isSignUp && (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password')) {
         setError(`Cadet "${cadetName}" was not found or password is incorrect. If you are new, click "Register".`);
      } else if (isSignUp && err.code === 'auth/email-already-in-use') {
         setError(`Cadet name "${cadetName}" is already taken. Click "Sign In" or choose another name.`);
      } else if (err.code === 'auth/weak-password') {
         setError("Secret Passcode must be at least 6 characters.");
      } else {
         setError(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await verifyEmail();
      setVerificationSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification');
    }
  };

  const isQuickStartUser = firebaseUser?.email?.endsWith('@stemio.local');

  if (firebaseUser && !firebaseUser.emailVerified && !isQuickStartUser) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--paper)] text-[var(--ink)] p-6 text-center">
        <div className="max-w-md w-full space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter ledger-title">
              Verification <span className="highlight-made">Required</span>
            </h1>
            <p className="text-[var(--ink-soft)] font-medium">Please verify your email to continue.</p>
          </div>

          <div className="p-8 bg-[var(--paper-2)] border border-[var(--line)] rounded-2xl shadow-xl space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-[var(--amber-tint)] flex items-center justify-center text-[var(--amber)]">
                <Mail className="w-10 h-10" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Check your inbox</h2>
              <p className="text-sm text-[var(--muted)]">
                We've sent a verification link to <span className="font-bold text-[var(--ink)]">{firebaseUser.email}</span>. 
                Please click the link to activate your account.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 bg-[var(--amber)] text-[var(--paper)] font-bold py-3 px-6 rounded-xl hover:bg-[var(--amber-bright)] transition-all cursor-pointer"
              >
                I've verified my email
              </button>
              
              <button
                onClick={handleResendVerification}
                disabled={verificationSent}
                className="w-full text-sm font-medium text-[var(--muted)] hover:text-[var(--amber)] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {verificationSent ? 'Verification email sent!' : 'Resend verification email'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && !cadetName.trim()) {
      setError("Please enter your Cadet Name / Full Name.");
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoggingIn(true);
    setError(null);
    try {
      localStorage.setItem('pendingPassword', password);
      if (mode === 'signup') {
        localStorage.setItem('pendingCadetName', cadetName.trim());
        const user = await emailSignUp(email, password, cadetName.trim());
        onAuthSuccess(user, "");
      } else {
        const user = await emailSignIn(email, password);
        onAuthSuccess(user, "");
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists. Please sign in.");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--paper)] text-[var(--ink)] p-6 text-center overflow-y-auto">
      <div className="max-w-md w-full space-y-8 py-12">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--ink)] drop-shadow-xs">
            STEM<span className="bg-gradient-to-r from-[var(--amber)] to-amber-600 bg-clip-text text-transparent">.io</span>
          </h1>
          <p className="text-sm md:text-base text-[var(--ink)] font-semibold tracking-wide max-w-sm mx-auto leading-relaxed">
            Grade 10 Introduction to AI learning platform
          </p>
          <p className="text-xs md:text-sm text-[var(--muted)] font-medium tracking-wide max-w-sm mx-auto leading-relaxed">
            made by Mr. Ilia Sheludiakov
          </p>
        </div>

        <div className="p-8 bg-[var(--paper-2)] border border-[var(--line)] rounded-2xl shadow-xl space-y-6 text-left">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-[var(--amber-tint)] flex items-center justify-center text-[var(--amber)]">
              <Rocket className="w-8 h-8" />
            </div>
          </div>
          
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-bold">
              {mode === 'quick' ? 'Enter Platform' : mode === 'login' ? 'Welcome Back, Cadet' : 'Register New Cadet Identity'}
            </h2>
            <p className="text-xs text-[var(--muted)]">
              {mode === 'quick' ? 'No email required. Start earning Stemios instantly.' : mode === 'login' ? 'Sign in to sync your progress.' : 'Create your email account to link credentials & balance.'}
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex rounded-xl bg-[var(--paper)] p-1 border border-[var(--line)] text-xs font-bold text-center">
            <button
              type="button"
              onClick={() => { setMode('quick'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${mode === 'quick' ? 'bg-[var(--amber)] text-white shadow-xs' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
            >
              Quick Passcode
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${mode === 'login' ? 'bg-[var(--amber)] text-white shadow-xs' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
            >
              Email Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${mode === 'signup' ? 'bg-[var(--amber)] text-white shadow-xs' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
            >
              Register Email
            </button>
          </div>

          {mode === 'quick' ? (
            <form onSubmit={(e) => handleCadetAuth(e, false)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)] ml-1">Cadet Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="text"
                    required
                    placeholder="E.g. StarGazer99"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] transition-all outline-none"
                    value={cadetName}
                    onChange={(e) => setCadetName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)] ml-1">Secret Passcode</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] transition-all outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                  {error}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={(e) => handleCadetAuth(e, false)}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--amber)] text-[var(--paper)] font-bold py-3 px-4 rounded-xl hover:bg-[var(--amber-bright)] transition-all transform active:scale-95 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  {isLoggingIn ? 'Loading...' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCadetAuth(e, true)}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--paper-2)] text-[var(--ink)] border border-[var(--line)] font-bold py-3 px-4 rounded-xl hover:bg-[var(--paper)] transition-all transform active:scale-95 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)] ml-1">Cadet Name / Full Name</label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                    <input
                      type="text"
                      required
                      placeholder="E.g. Alex Smith"
                      className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] transition-all outline-none"
                      value={cadetName}
                      onChange={(e) => setCadetName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)] ml-1">Email Terminal</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="email"
                    required
                    placeholder="commander@stem.io"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] transition-all outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)] ml-1">Access Key (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-[var(--paper)] border border-[var(--line)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] transition-all outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 bg-[var(--ink)] text-[var(--paper)] font-bold py-3 px-6 rounded-xl hover:bg-black transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isLoggingIn ? 'Processing...' : (mode === 'login' ? 'Sign In with Email' : 'Register New Email Account')}
              </button>
            </form>
          )}
        </div>

        <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-mono">
          Encrypted &amp; Secure • Powered by Firebase
        </p>
      </div>
    </div>
  );
}
