import React, { useState } from 'react';
import { User, VirtualClassroom } from '../types';
import { joinClassByCode } from '../lib/firebase';
import { GraduationCap, CheckCircle2, AlertCircle, Sparkles, X, ArrowRight } from 'lucide-react';

interface JoinClassModalProps {
  user: User;
  initialCode?: string;
  onClose: () => void;
  onSuccess?: (classroom: VirtualClassroom) => void;
}

export default function JoinClassModal({ user, initialCode = '', onClose, onSuccess }: JoinClassModalProps) {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinedClass, setJoinedClass] = useState<VirtualClassroom | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await joinClassByCode(code.trim(), user.id, user.name);
      if (result.success && result.classroom) {
        setJoinedClass(result.classroom);
        if (onSuccess) onSuccess(result.classroom);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join classroom. Please check code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[var(--paper-2)] border border-[var(--amber)]/40 text-[var(--ink)] w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        
        {/* Glow Header */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--amber)]/10 rounded-full blur-2xl pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--ink)] transition-colors p-1"
        >
          <X size={20} />
        </button>

        {!joinedClass ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[var(--amber)]/10 text-[var(--amber)] rounded-xl border border-[var(--amber)]/20">
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[var(--ink)]">Join Virtual Classroom</h3>
                <p className="text-xs text-[var(--muted)]">Enter your teacher's 1-click share code to enroll in your class track.</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[var(--muted)] uppercase mb-1">Classroom Join Code or Link</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. STEM10A or STEM-8A3F"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-[var(--paper)] border border-[var(--line)] p-3 rounded-xl text-sm font-mono tracking-wider font-bold text-[var(--ink)] focus:border-[var(--amber)] focus:outline-none uppercase"
                />
                <span className="text-[10px] text-[var(--muted)] mt-1.5 block">
                  Ask your teacher for your section's shareable join code.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className={`px-6 py-2.5 bg-[var(--amber)] text-slate-950 font-extrabold rounded-xl shadow-md flex items-center gap-2 transition-all ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--amber)]/90 cursor-pointer'
                  }`}
                >
                  {loading ? 'Joining Roster...' : 'Enroll in Class'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4 animate-fadeIn">
            <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30 mb-2">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-xl font-extrabold text-[var(--ink)]">
              Welcome to {joinedClass.name}!
            </h3>

            <p className="text-xs text-[var(--muted)] max-w-xs mx-auto">
              You are now officially enrolled in this classroom track. Your progress,Stemios, and milestones will now sync with your section roster.
            </p>

            <div className="p-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl font-mono text-xs text-[var(--amber)] font-bold">
              Join Code: {joinedClass.joinCode}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[var(--amber)] text-slate-950 font-extrabold rounded-xl shadow-lg hover:bg-[var(--amber)]/90 transition-all cursor-pointer"
            >
              Go to Courses & Start Learning
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
