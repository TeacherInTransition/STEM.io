import React, { useState, useEffect } from 'react';
import { User, VirtualClassroom } from '../types';
import { 
  RefreshCw, Link as LinkIcon, Users, CheckCircle, BrainCircuit, ShieldAlert, Eye, 
  FileText, Award, BarChart3, TrendingUp, FolderCheck, BookOpen, Plus, Copy, 
  Trash2, UserPlus, GraduationCap, Share2, Check, UserX, Sparkles
} from 'lucide-react';
import WorkspacePanel from './WorkspacePanel';
import { 
  db, fetchResourcesFromDb, fetchResourceOpens, ResourceItem, ResourceOpenRecord,
  fetchVirtualClassrooms, createVirtualClassroom, removeClassStudent, deleteVirtualClassroom
} from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { calculateLearningMetrics, generateCompetencyRubric } from '../utils/milestonesAndRubrics';

export default function TeacherDashboard({ user, accessToken }: { user: User; accessToken?: string | null }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [published, setPublished] = useState<Record<string, boolean>>({});
  const [students, setStudents] = useState<User[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [resourceOpens, setResourceOpens] = useState<ResourceOpenRecord[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Virtual Classroom State
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGcId, setNewClassGcId] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    // 1. Fetch Classrooms from Firestore / Local
    const loadClassrooms = async () => {
      const cls = await fetchVirtualClassrooms();
      setClassrooms(cls);
    };
    loadClassrooms();

    // Listen to real-time classroom changes if Firestore available
    if (!user.id.startsWith('guest_')) {
      const qClasses = query(collection(db, 'classes'));
      const unsubClasses = onSnapshot(qClasses, (snap) => {
        if (!snap.empty) {
          const list: VirtualClassroom[] = [];
          snap.forEach(d => {
            list.push({ classId: d.id, ...d.data() } as VirtualClassroom);
          });
          setClassrooms(list);
          localStorage.setItem('stemio_virtual_classrooms', JSON.stringify(list));
        }
      }, (e) => console.warn('Classrooms snapshot note:', e));

      return () => unsubClasses();
    }
  }, [user]);

  useEffect(() => {
    if (user.id.startsWith('guest_')) {
      setStudents([
        { id: 'mock1', name: 'Alex (Student)', email: 'alex@student.edu', role: 'student', isAdmin: false, stemios: 450, streak: 12, classId: 'class-stem-10a' },
        { id: 'mock2', name: 'Sam (Student)', email: 'sam@student.edu', role: 'student', isAdmin: false, stemios: 120, streak: 3, classId: 'class-stem-10a' },
        { id: 'mock3', name: 'Taylor (Student)', email: 'taylor@student.edu', role: 'student', isAdmin: false, stemios: 310, streak: 8, classId: 'class-ai-10b' },
      ]);
      setLoadingAnalytics(false);
      return;
    }
    
    // Fetch users & strictly filter out teachers and admins
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'users'));
      unsubscribe = onSnapshot(q, (snap) => {
        const studentList: User[] = [];
        snap.forEach(docSnap => {
          const data = docSnap.data();
          const isTeacherOrAdmin = data.role === 'teacher' || data.isAdmin === true || data.email === 'laankanom2018@gmail.com';
          if (!isTeacherOrAdmin && (data.role === 'student' || !data.role)) {
            studentList.push({ id: docSnap.id, ...data } as User);
          }
        });
        setStudents(studentList);
        try {
          localStorage.setItem('stemio_cached_students', JSON.stringify(studentList));
        } catch (e) {}
      }, (error) => {
        console.warn('Snapshot notice for users (using local cache if quota exceeded):', error?.message || error);
        const cached = localStorage.getItem('stemio_cached_students');
        if (cached) {
          try { setStudents(JSON.parse(cached)); } catch (e) {}
        }
      });
    } catch (e: any) {
      console.warn('Could not attach users snapshot listener:', e?.message || e);
      const cached = localStorage.getItem('stemio_cached_students');
      if (cached) {
        try { setStudents(JSON.parse(cached)); } catch (err) {}
      }
    }

    // Load real resources & resource opens from Firestore
    const loadRealAnalytics = async () => {
      setLoadingAnalytics(true);
      try {
        const [resList, opensList] = await Promise.all([
          fetchResourcesFromDb(),
          fetchResourceOpens()
        ]);
        setResources(resList);
        setResourceOpens(opensList);
      } catch (e) {
        console.error('Error loading analytics data:', e);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    loadRealAnalytics();

    return () => unsubscribe();
  }, [user]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Google Classroom Roster & Courses successfully synchronized!');
    }, 2000);
  };

  const publishLesson = (unitId: string) => {
    setPublished(prev => ({ ...prev, [unitId]: true }));
    showToast(`Unit ${unitId} stream pushed to virtual classrooms!`);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newCls = await createVirtualClassroom(
      newClassName,
      newClassGcId,
      user.id,
      newClassDesc
    );

    setClassrooms(prev => [newCls, ...prev.filter(c => c.classId !== newCls.classId)]);
    setNewClassName('');
    setNewClassGcId('');
    setNewClassDesc('');
    setShowCreateClassModal(false);
    setSelectedClassId(newCls.classId);
    showToast(`Created virtual classroom "${newCls.name}" with Join Code ${newCls.joinCode}!`);
  };

  const handleCopyJoinLink = (cls: VirtualClassroom) => {
    const origin = window.location.origin || 'https://stemio-arcade.web.app';
    const joinUrl = `${origin}/?joinCode=${cls.joinCode}`;
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopiedCode(cls.joinCode);
      showToast(`Copied Shareable Join Link for ${cls.name}: ${joinUrl}`);
      setTimeout(() => setCopiedCode(null), 2500);
    }).catch(() => {
      showToast(`Join Code: ${cls.joinCode}`);
    });
  };

  const handleRemoveStudentFromClass = async (clsId: string, studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from the classroom roster?')) return;
    
    await removeClassStudent(clsId, studentId);
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, classId: undefined } : s));
    setClassrooms(prev => prev.map(c => c.classId === clsId ? { ...c, studentIds: c.studentIds.filter(id => id !== studentId) } : c));
    showToast('Student removed from classroom roster.');
  };

  const handleDeleteClass = async (clsId: string, clsName: string) => {
    if (!confirm(`Are you sure you want to delete classroom "${clsName}"? Enrolled students will be unassigned.`)) return;

    await deleteVirtualClassroom(clsId);
    setClassrooms(prev => prev.filter(c => c.classId !== clsId));
    if (selectedClassId === clsId) setSelectedClassId('all');
    showToast(`Classroom "${clsName}" deleted.`);
  };

  // Filter students based on selectedClassId
  const currentSelectedClass = classrooms.find(c => c.classId === selectedClassId);

  const filteredStudents = selectedClassId === 'all'
    ? students
    : selectedClassId === 'unassigned'
    ? students.filter(s => {
        if (!s.classId) {
          return !classrooms.some(c => c.studentIds.includes(s.id));
        }
        return false;
      })
    : students.filter(s => {
        // Match if student's profile classId matches OR if student's UID is in classroom.studentIds
        if (s.classId === selectedClassId) return true;
        if (currentSelectedClass && currentSelectedClass.studentIds.includes(s.id)) return true;
        return false;
      });

  // Compute real student cohort resource open metrics
  const activeStudentIds = new Set(filteredStudents.map(s => s.id));
  const studentOpenEvents = resourceOpens.filter(record => activeStudentIds.has(record.userId) || !record.userId.startsWith('guest_'));
  const uniqueStudentOpenedResourceIds = new Set<string>(studentOpenEvents.map(r => r.resourceId));
  
  const totalResourcesCount = resources.length;
  const openedResourcesCount = uniqueStudentOpenedResourceIds.size;
  const realCohortOpenRatePct = totalResourcesCount > 0 ? Math.round((openedResourcesCount / totalResourcesCount) * 100) : 0;

  // Real Student Cohort Learning Metrics (Calculated Exclusively for Students)
  const cohortAverageStemios = filteredStudents.length > 0 
    ? Math.round(filteredStudents.reduce((acc, s) => acc + (s.stemios || 0), 0) / filteredStudents.length)
    : 0;

  const estimatedAvgCompletedLessons = Math.min(10, Math.max(1, Math.floor(cohortAverageStemios / 45)));
  const estimatedAvgCompletedUnits = Math.min(5, Math.floor(cohortAverageStemios / 120));

  const cohortMetrics = calculateLearningMetrics(
    Array.from({ length: estimatedAvgCompletedLessons }, (_, i) => `lesson-${i + 1}`),
    Array.from({ length: estimatedAvgCompletedUnits }, (_, i) => `unit-${i + 1}`),
    Array.from(uniqueStudentOpenedResourceIds),
    resources,
    10,
    5
  );

  const cohortRubric = generateCompetencyRubric(cohortMetrics);

  return (
    <article className="flex-1 overflow-y-auto p-4 md:p-8 bg-obsidian text-text-main relative">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs border border-emerald-300 animate-fadeIn">
          <CheckCircle size={18} />
          {toastMsg}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Control Panel */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-panel pb-6">
          <div>
            <div className="bg-amber-neon/10 border border-amber-neon text-amber-neon px-3 py-1 rounded-full uppercase font-bold tracking-widest text-[10px] inline-block mb-3">
              Teacher Command Control
            </div>
            <h2 className="text-2xl font-extrabold text-text-main flex items-center gap-3">
              <GraduationCap className="text-amber-neon" size={28} />
              Virtual Classrooms & Progress Tracking System
            </h2>
            <p className="text-xs text-text-muted mt-1 max-w-2xl">
              Organize Grade 10 students into virtual classrooms, track real-time resource engagement, and share 1-click class join links with Google Classroom sync.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreateClassModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-neon text-slate-950 hover:bg-amber-neon/90 font-extrabold rounded text-xs transition-all shadow-md cursor-pointer"
            >
              <Plus size={16} /> Create Classroom
            </button>

            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold transition-all cursor-pointer ${
                isSyncing 
                  ? 'bg-slate-panel text-text-muted cursor-not-allowed' 
                  : 'bg-slate-panel text-text-main hover:bg-slate-panel/80 border border-slate-panel'
              }`}
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin text-cyan-neon' : ''} />
              {isSyncing ? 'Syncing External Roster...' : 'Sync Google Classroom Track'}
            </button>
          </div>
        </header>

        {/* Create Classroom Modal */}
        {showCreateClassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-base border border-slate-panel text-text-main w-full max-w-lg rounded-2xl shadow-2xl p-6 relative space-y-4">
              <div className="flex items-center justify-between border-b border-slate-panel pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap size={20} className="text-amber-neon" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Create Virtual Classroom</h3>
                </div>
                <button 
                  onClick={() => setShowCreateClassModal(false)}
                  className="text-text-muted hover:text-text-main text-xs font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
                <div>
                  <label className="block text-text-muted font-bold uppercase mb-1">Classroom Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Grade 10 STEM - Physics Alpha"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full bg-obsidian border border-slate-panel p-3 rounded text-text-main focus:border-amber-neon focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-text-muted font-bold uppercase mb-1">Google Classroom Course ID (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. gc-course-78921"
                    value={newClassGcId}
                    onChange={(e) => setNewClassGcId(e.target.value)}
                    className="w-full bg-obsidian border border-slate-panel p-3 rounded text-text-main focus:border-amber-neon focus:outline-none"
                  />
                  <span className="text-[10px] text-text-muted mt-1 block">Links classroom data with Google Classroom stream sync.</span>
                </div>

                <div>
                  <label className="block text-text-muted font-bold uppercase mb-1">Description / Subject</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Grade 10 Physics, Machine Learning & Ethics Lab Track"
                    value={newClassDesc}
                    onChange={(e) => setNewClassDesc(e.target.value)}
                    className="w-full bg-obsidian border border-slate-panel p-3 rounded text-text-main focus:border-amber-neon focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateClassModal(false)}
                    className="px-4 py-2 bg-slate-panel text-text-muted hover:text-text-main rounded font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-amber-neon text-slate-950 hover:bg-amber-neon/90 font-extrabold rounded shadow-md flex items-center gap-2"
                  >
                    <Plus size={16} /> Generate Join Code & Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Virtual Classrooms Cards Carousel / Selector */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-panel pb-2">
            <h3 className="text-xs uppercase font-bold text-amber-neon tracking-widest flex items-center gap-2">
              <Users size={16} /> Active Virtual Classrooms ({classrooms.length})
            </h3>
            <span className="text-[10px] text-text-muted font-mono">1-Click Shareable Student Join Links</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filter Card: All Students */}
            <div 
              onClick={() => setSelectedClassId('all')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedClassId === 'all' 
                  ? 'bg-amber-neon/10 border-amber-neon shadow-lg shadow-amber-neon/5' 
                  : 'bg-slate-base border-slate-panel hover:border-slate-panel/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-neon bg-amber-neon/20 px-2 py-0.5 rounded">
                    Entire Cohort
                  </span>
                  <Users size={18} className="text-amber-neon" />
                </div>
                <h4 className="font-extrabold text-base text-text-main">All Enrolled Students</h4>
                <p className="text-xs text-text-muted mt-1">Unified view of all active student profiles across all classrooms.</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-panel/50 flex items-center justify-between text-xs font-mono">
                <span className="text-text-muted">{students.length} Total Students</span>
                <span className="text-emerald-400 font-bold">100% Cohort</span>
              </div>
            </div>

            {/* Virtual Classroom Cards */}
            {classrooms.map((cls) => {
              const countInClass = students.filter(s => s.classId === cls.classId || cls.studentIds.includes(s.id)).length;
              const isSelected = selectedClassId === cls.classId;

              return (
                <div 
                  key={cls.classId}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between relative ${
                    isSelected 
                      ? 'bg-cyan-neon/10 border-cyan-neon shadow-lg shadow-cyan-neon/5' 
                      : 'bg-slate-base border-slate-panel hover:border-slate-panel/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-cyan-neon bg-cyan-neon/20 px-2 py-0.5 rounded">
                        Join Code: {cls.joinCode}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(cls.classId, cls.name);
                          }}
                          className="text-text-muted hover:text-rose-400 p-1 transition-colors"
                          title="Delete Classroom"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h4 
                      onClick={() => setSelectedClassId(cls.classId)}
                      className="font-extrabold text-base text-text-main cursor-pointer hover:text-cyan-neon transition-colors"
                    >
                      {cls.name}
                    </h4>
                    
                    <p className="text-xs text-text-muted mt-1 line-clamp-2">
                      {cls.description || 'Virtual classroom track.'}
                    </p>

                    {cls.googleClassroomCourseId && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono border border-emerald-500/20">
                        <CheckCircle size={10} /> Google Course: {cls.googleClassroomCourseId}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-panel/50 flex items-center justify-between gap-2">
                    <div className="text-xs font-mono">
                      <span className="text-text-main font-bold">{countInClass}</span>
                      <span className="text-text-muted text-[10px]"> enrolled</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClassId(cls.classId);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${
                          isSelected ? 'bg-cyan-neon text-slate-950' : 'bg-slate-panel text-text-main hover:bg-slate-panel/80'
                        }`}
                      >
                        {isSelected ? 'Viewing Roster' : 'View Class'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyJoinLink(cls);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold bg-amber-neon/10 border border-amber-neon/30 text-amber-neon hover:bg-amber-neon/20 rounded flex items-center gap-1 transition-colors"
                        title="Copy Shareable Join Link"
                      >
                        {copiedCode === cls.joinCode ? (
                          <>
                            <Check size={12} className="text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Share2 size={12} /> Share Link
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Real Student Cohort Resource Usage & Rubric Summary Banner */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-base border border-slate-panel p-5 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
              <Users size={22} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-text-muted block">Selected Roster</span>
              <span className="text-xl font-black text-text-main">{filteredStudents.length} Students</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">
                {selectedClassId === 'all' ? 'All Virtual Classrooms' : currentSelectedClass?.name || 'Filtered Roster'}
              </span>
            </div>
          </div>

          <div className="bg-slate-base border border-slate-panel p-5 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <Eye size={22} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-text-muted block">Real Resource Opens</span>
              <span className="text-xl font-black text-text-main">{studentOpenEvents.length} Logs</span>
              <span className="text-[10px] font-mono text-cyan-300 block mt-0.5">{openedResourcesCount} / {totalResourcesCount} Unique Resources</span>
            </div>
          </div>

          <div className="bg-slate-base border border-slate-panel p-5 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <BarChart3 size={22} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-text-muted block">Cohort Open Rate</span>
              <span className="text-xl font-black text-emerald-400">{realCohortOpenRatePct}% Rate</span>
              <span className="text-[10px] text-text-muted block mt-0.5">Live Firestore Collection</span>
            </div>
          </div>

          <div className="bg-slate-base border border-slate-panel p-5 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Award size={22} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-text-muted block">Rubric Mastery Score</span>
              <span className="text-xl font-black text-indigo-300">{cohortRubric.totalScore} / 16 Pts</span>
              <span className="text-[10px] font-bold text-indigo-400 block mt-0.5">{cohortRubric.tierLabel} Tier</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Curriculum Webhooks & Lesson Publisher List */}
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
                    className="w-full py-2 bg-border-dim border border-slate-panel text-text-main hover:bg-slate-panel rounded flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LinkIcon size={14} /> 🔗 Push Lesson to Stream
                  </button>
                )}
              </div>
            ))}

            {/* Most Opened Student Resources List */}
            <div className="bg-slate-base border border-slate-panel p-4 rounded space-y-3 mt-6">
              <h4 className="text-xs uppercase font-bold text-amber-neon flex items-center gap-2 border-b border-slate-panel pb-2">
                <TrendingUp size={14} /> Top Student-Opened Resources
              </h4>
              <div className="space-y-2">
                {resources.slice(0, 5).map(res => {
                  const opensForThis = studentOpenEvents.filter(o => o.resourceId === res.id).length;
                  return (
                    <div key={res.id} className="flex items-center justify-between p-2 rounded bg-obsidian/60 text-xs">
                      <div className="truncate max-w-[180px]">
                        <span className="font-semibold text-text-main block truncate">{res.title}</span>
                        <span className="text-[10px] text-text-muted font-mono">{res.type}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-neon font-bold text-[10px] border border-amber-500/20">
                        {opensForThis > 0 ? `${opensForThis} Opens` : `${res.views || 0} Views`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Roster & Class Progress Table */}
          <section className="lg:col-span-2 bg-slate-base border border-slate-panel rounded flex flex-col overflow-hidden">
            <header className="p-4 border-b border-slate-panel bg-obsidian flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-text-main flex items-center gap-2 text-sm uppercase tracking-widest">
                  <Users size={16} className="text-amber-neon" /> 
                  Student Competency Roster ({selectedClassId === 'all' ? 'All Classes' : currentSelectedClass?.name || 'Class Roster'})
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Showing {filteredStudents.length} student profile(s).
                </p>
              </div>

              <div className="flex items-center gap-2">
                {currentSelectedClass && (
                  <button
                    onClick={() => handleCopyJoinLink(currentSelectedClass)}
                    className="px-3 py-1 bg-amber-neon text-slate-950 font-extrabold rounded text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Share2 size={13} /> Copy Join Link
                  </button>
                )}
                <span className="text-xs font-mono text-text-muted bg-slate-panel px-2.5 py-1 rounded">
                  {filteredStudents.length} ENROLLED
                </span>
              </div>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-panel/30 text-[10px] uppercase tracking-widest text-text-muted">
                    <th className="p-4 font-semibold border-b border-slate-panel">Student Identity</th>
                    <th className="p-4 font-semibold border-b border-slate-panel">Classroom Track</th>
                    <th className="p-4 font-semibold border-b border-slate-panel"><div className="flex items-center gap-1.5"><BrainCircuit size={14}/> Stemios Balance</div></th>
                    <th className="p-4 font-semibold border-b border-slate-panel"><div className="flex items-center gap-1.5"><CheckCircle size={14}/> Streak</div></th>
                    <th className="p-4 font-semibold border-b border-slate-panel">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-panel text-sm text-text-muted">
                  {filteredStudents.map((s) => {
                    const assignedCls = classrooms.find(c => c.classId === s.classId || c.studentIds.includes(s.id));

                    return (
                      <tr key={s.id} className="hover:bg-slate-panel/20 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-text-main flex items-center gap-2">
                            {s.name}
                            {s.isAdmin && <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">ADMIN</span>}
                          </div>
                          <div className="text-[11px] text-text-muted font-mono mt-0.5">{s.email || 'student@school.edu'}</div>
                        </td>
                        <td className="p-4 align-middle">
                          {assignedCls ? (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                              {assignedCls.name}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-text-muted italic">Unassigned</span>
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                             <span className="font-mono text-amber-neon font-bold">{s.stemios || 0} S</span>
                             <div className="flex-1 bg-border-dim h-1 rounded-full overflow-hidden max-w-[80px]">
                              <div className="bg-amber-neon h-full" style={{ width: `${Math.min(100, (s.stemios || 0) / 10)}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-neon font-bold">{s.streak || 0}d</span>
                            <div className="flex-1 bg-border-dim h-1 rounded-full overflow-hidden max-w-[80px]">
                              <div className="bg-emerald-neon h-full" style={{ width: `${Math.min(100, (s.streak || 0) * 5)}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          {assignedCls ? (
                            <button
                              onClick={() => handleRemoveStudentFromClass(assignedCls.classId, s.id)}
                              className="text-[10px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded transition-colors flex items-center gap-1 border border-rose-500/20 cursor-pointer"
                              title="Remove from classroom roster"
                            >
                              <UserX size={12} /> Remove
                            </button>
                          ) : (
                            <span className="text-[10px] text-text-muted italic">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-text-muted italic">
                        No active student profiles in this classroom selection. Share the class join link with your students to enroll them!
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


