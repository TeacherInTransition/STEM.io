import fs from 'fs';

let code = fs.readFileSync('src/components/AuthScreen.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { googleSignIn, emailSignIn, emailSignUp, verifyEmail, anonymousSignIn } from '../lib/firebase';",
  "import { googleSignIn, emailSignIn, emailSignUp, verifyEmail, anonymousSignIn, cadetSignIn, cadetSignUp } from '../lib/firebase';"
);

// We need an option to switch between Cadet Sign In and Cadet Sign Up
// We can just try to sign in, and if it fails because user not found, try to sign up!
// Or we can add a toggle.
// "keep cadet name + password in firebase database"

const handleCadetAuthStr = `  const handleCadetAuth = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    if (!cadetName.trim() || !password.trim()) {
      setError("Please enter a Cadet Name and Password.");
      return;
    }
    
    setIsLoggingIn(true);
    setError(null);
    try {
      if (isSignUp) {
        const user = await cadetSignUp(cadetName, password);
        onAuthSuccess(user, "");
      } else {
        const user = await cadetSignIn(cadetName, password);
        onAuthSuccess(user, "");
      }
    } catch (err: any) {
      if (!isSignUp && err.code === 'auth/invalid-credential') {
         setError("Invalid Cadet Name or Password. If you are new, please register.");
      } else if (isSignUp && err.code === 'auth/email-already-in-use') {
         setError("Cadet Name is already taken. Please sign in or choose another name.");
      } else {
         setError(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };`;

// Replace handleAnonymousAuth
const oldAuth = `  const handleAnonymousAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadetName.trim()) {
      setError("Please enter a Cadet Name.");
      return;
    }
    
    // Instead of using Firebase Auth which might be restricted, use local guest mode
    onGuestStart(cadetName);
  };`;

code = code.replace(oldAuth, handleCadetAuthStr);

const oldQuickStartForm = `            <form onSubmit={handleAnonymousAuth} className="space-y-4">
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

              {error && (
                <p className="text-xs text-red-500 font-medium text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 bg-[var(--amber)] text-[var(--paper)] font-bold py-3 px-6 rounded-xl hover:bg-[var(--amber-bright)] transition-all transform active:scale-95 disabled:opacity-50"
              >
                <Rocket className="w-4 h-4" />
                {isLoggingIn ? 'Initializing...' : 'Quick Start'}
              </button>
            </form>`;

const newQuickStartForm = `            <form className="space-y-4">
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
            </form>`;

code = code.replace(oldQuickStartForm, newQuickStartForm);

fs.writeFileSync('src/components/AuthScreen.tsx', code);
console.log('Updated AuthScreen.tsx');
