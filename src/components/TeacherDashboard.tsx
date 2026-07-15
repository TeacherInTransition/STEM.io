import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { RefreshCw, Link as LinkIcon, Users, CheckCircle, BrainCircuit, Code, ShieldAlert } from 'lucide-react';
import WorkspacePanel from './WorkspacePanel';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function TeacherDashboard({ user, accessToken }: { user: User; accessToken?: string | null }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [published, setPublished] = useState<Record<string, boolean>>({});
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    // Fetch students from Firestore
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const studentList: User[] = [];
      snap.forEach(doc => {
        studentList.push({ id: doc.id, ...doc.data() } as User);
      });
      setStudents(studentList);
    });

    return () => unsubscribe();
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000); // Mock sync delay
  };

  const publishLesson = (unitId: string) => {
    setPublished(prev => ({ ...prev, [unitId]: true }));
  };

  return (
    <article className="flex-1 overflow-y-auto p-6 md:p-10 bg-obsidian text-text-main">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-panel pb-6">
          <div>
            <div className="bg-amber-neon/10 border border-amber-neon text-amber-neon px-3 py-1 rounded-full uppercase font-bold tracking-widest text-[10px] inline-block mb-3">
              Teacher Command Control
            </div>
            <h2 className="text-2xl font-extrabold text-text-main">Classroom Management & Curriculum Matrix</h2>
          </div>
          
          {/* Google Classroom Sync Hub Module */}
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded text-sm font-bold transition-all ${isSyncing ? 'bg-slate-panel text-text-muted cursor-not-allowed' : 'bg-slate-panel text-text-main hover:bg-slate-panel/80 border border-slate-panel'}`}
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing External Roster...' : 'Sync Roster via Google Classroom'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Lesson Publisher List */}
          <section className="lg:col-span-1 space-y-4">
            <h3 className="text-sm uppercase tracking-widest font-bold text-cyan-neon border-b border-slate-panel pb-3 flex items-center gap-2">
              <LinkIcon size={16} /> Curriculum Webhooks
            </h3>
            
            {[
              { id: 'u1', title: 'Unit 1: What is AI?' },
              { id: 'u2', title: 'Unit 2: Prompt Engineering' },
              { id: 'u3', title: 'Unit 3: AI Ethics & Bias' },
            ].map(unit => (
              <div key={unit.id} className="bg-slate-base border border-slate-panel p-4 rounded flex flex-col gap-4">
                <h4 className="font-semibold text-text-main">{unit.title}</h4>
                {published[unit.id] ? (
                  <div className="w-full py-2 bg-emerald-neon/10 border border-emerald-neon/30 text-emerald-neon rounded flex items-center justify-center gap-2 text-xs font-bold">
                    <CheckCircle size={14} /> Stream Active in Classroom
                  </div>
                ) : (
                  <button 
                    onClick={() => publishLesson(unit.id)}
                    className="w-full py-2 bg-border-dim border border-slate-panel text-text-main hover:bg-slate-panel rounded flex items-center justify-center gap-2 text-xs font-bold transition-colors"
                  >
                    <LinkIcon size={14} /> 🔗 Push Lesson to Stream
                  </button>
                )}
              </div>
            ))}
          </section>

          {/* Competency Matrix (Roster Grid) */}
          <section className="lg:col-span-2 bg-slate-base border border-slate-panel rounded flex flex-col overflow-hidden">
            <header className="p-4 border-b border-slate-panel bg-obsidian flex items-center justify-between">
              <h3 className="font-bold text-text-main flex items-center gap-2 text-sm uppercase tracking-widest">
                <Users size={16} className="text-amber-neon" /> 
                Student Competency Matrix
              </h3>
              <span className="text-xs font-mono text-text-muted bg-slate-panel px-2 py-1 rounded">{students.length} ACTIVE</span>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-panel/30 text-[10px] uppercase tracking-widest text-text-muted">
                    <th className="p-4 font-semibold border-b border-slate-panel">Student Identity</th>
                    <th className="p-4 font-semibold border-b border-slate-panel"><div className="flex items-center gap-2"><BrainCircuit size={14}/> Stemios Balance</div></th>
                    <th className="p-4 font-semibold border-b border-slate-panel"><div className="flex items-center gap-2"><CheckCircle size={14}/> Streak</div></th>
                    <th className="p-4 font-semibold border-b border-slate-panel"><div className="flex items-center gap-2"><ShieldAlert size={14}/> Status</div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-panel text-sm text-text-muted">
                  {students.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-panel/20 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-text-main">{s.name}</div>
                        <div className="text-[11px] text-text-muted font-mono mt-0.5">{s.email}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                           <span className="font-mono text-amber-neon font-bold">{s.stemios} S</span>
                           <div className="flex-1 bg-border-dim h-1 rounded-full overflow-hidden max-w-[100px]">
                            <div className="bg-amber-neon h-full" style={{ width: `${Math.min(100, s.stemios / 10)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-neon font-bold">{s.streak}</span>
                          <div className="flex-1 bg-border-dim h-1 rounded-full overflow-hidden max-w-[100px]">
                            <div className="bg-emerald-neon h-full" style={{ width: `${Math.min(100, s.streak * 5)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${s.isAdmin ? 'bg-amber-neon/20 text-amber-neon' : 'bg-slate-panel text-text-muted'}`}>
                          {s.isAdmin ? 'Admin' : 'Regular'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-text-muted italic">
                        No students enrolled in this sector yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Google Workspace Integration Panel */}
          <section className="lg:col-span-3 space-y-4 bg-slate-base border border-slate-panel rounded p-6">
            <h3 className="text-sm uppercase tracking-widest font-bold text-amber-neon flex items-center gap-2">
              Google Workspace Connection
            </h3>
            <WorkspacePanel accessToken={accessToken || null} />
          </section>
          
        </div>
      </div>
    </article>
  );
}
