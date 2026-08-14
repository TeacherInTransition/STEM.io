import React, { useEffect, useState } from 'react';
import { 
  ChevronLeft, Box, BookOpen, Target, CheckCircle2, Award, Trophy, 
  Sparkles, Shield, Eye, FileText, Layers, Clock, GraduationCap, 
  Brain, HelpCircle, ArrowRight, Copy, Check, Share2, Play
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { aiFoundationsCurriculum } from '../aiFoundationsData';
import { UNIT_1_MASTER_PLAN, MasterLesson } from '../data/unitMasterPlans';
import { User } from '../types';

interface UnitLearningPathProps {
  user?: User;
  unitId: string;
  unitTitle: string;
  onBack: () => void;
  onLessonSelect?: (lessonId: string) => void;
}

export default function UnitLearningPath({ user, unitId, unitTitle, onBack, onLessonSelect }: UnitLearningPathProps) {
  const [customLessons, setCustomLessons] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');

  const isTeacherOrAdmin = !!(user?.isAdmin || user?.role === 'teacher');
  
  // View Mode state: Default to 'full' for Admin/Teacher, 'student' for students
  const [teacherViewMode, setTeacherViewMode] = useState<'full' | 'student'>(isTeacherOrAdmin ? 'full' : 'student');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'lessons'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const lessons = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCustomLessons(lessons);
        try {
          localStorage.setItem('stemio_published_lessons_cache', JSON.stringify(lessons));
        } catch (e) {}
      }, (error) => {
        console.warn("Firestore custom lessons notice in UnitLearningPath (using local cache if quota exceeded):", error?.message || error);
        const cached = localStorage.getItem('stemio_published_lessons_cache');
        if (cached) {
          try {
            setCustomLessons(JSON.parse(cached));
          } catch (e) {}
        }
      });
    } catch (e: any) {
      console.warn("Could not attach custom lessons listener in UnitLearningPath:", e?.message || e);
      const cached = localStorage.getItem('stemio_published_lessons_cache');
      if (cached) {
        try {
          setCustomLessons(JSON.parse(cached));
        } catch (err) {}
      }
    }
    return () => unsubscribe();
  }, []);

  // Lookup unit in AI foundations curriculum if available
  const foundUnit = aiFoundationsCurriculum.flatMap(s => s.units).find(u => u.id.toLowerCase() === unitId.toLowerCase());
  const displayTitle = unitTitle || foundUnit?.title || 'Unit Learning Path';
  const displayConcept = foundUnit?.concept ? `Core Concept: ${foundUnit.concept}. ${foundUnit.activity}` : 'Explore foundational concepts, interactive activities, and real-world applications for Grade 10 STEM mastery.';

  const latestCustomLesson = customLessons[0];

  // Map master plan lessons into levels for the student view
  const masterLessons = UNIT_1_MASTER_PLAN.lessons;

  const handleCopyLesson = (lesson: MasterLesson) => {
    const text = `LESSON ${lesson.lessonNumber}: ${lesson.title}\nConcepts: ${lesson.concepts}\nStandards: ${lesson.standards}\nMath Load: ${lesson.mathLoad}\nWarm-Up (${lesson.warmUp.duration}): ${lesson.warmUp.title} - ${lesson.warmUp.activity}\nDirect Instruction: ${lesson.instructionAndSandbox.directInstruction}\nExit Ticket: ${lesson.exitTicket.prompt}`;
    navigator.clipboard.writeText(text);
    setCopiedId(lesson.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Structured interactive levels for student view
  const levels = [
    {
      id: 1,
      title: "Level 1: Core Concepts & Foundations",
      subtitle: "Probability-driven generation, multimodality, and representation.",
      lessons: masterLessons.slice(0, 3).map(m => ({
        id: m.id,
        title: `Lesson ${m.lessonNumber}: ${m.title}`,
        description: m.description,
        status: 'active' as const,
        type: 'lesson' as const
      }))
    },
    {
      id: 2,
      title: "Level 2: From Logic to Limitations & Applied Auditing",
      subtitle: "Structural logic, hallucinations, and systematic data bias.",
      lessons: masterLessons.slice(3, 6).map(m => ({
        id: m.id,
        title: `Lesson ${m.lessonNumber}: ${m.title}`,
        description: m.description,
        status: 'active' as const,
        type: 'lesson' as const
      }))
    },
    {
      id: 3,
      title: "Level 3: Tactical Prompting & Co-Creation",
      subtitle: "Tactical debugging, systematic prompt design, and collaborative workflows.",
      lessons: masterLessons.slice(6, 9).map(m => ({
        id: m.id,
        title: `Lesson ${m.lessonNumber}: ${m.title}`,
        description: m.description,
        status: 'active' as const,
        type: 'lesson' as const
      }))
    },
    {
      id: 4,
      title: "Level 4: Creative Ethics & Master Alignment",
      subtitle: "Generative determinism, intellectual property, and local societal impacts.",
      isFinal: true,
      lessons: masterLessons.slice(9, 12).map(m => ({
        id: m.id,
        title: `Lesson ${m.lessonNumber}: ${m.title}`,
        description: m.description,
        status: 'active' as const,
        type: 'lesson' as const
      }))
    }
  ];

  const filteredMasterLessons = selectedWeek === 'all' 
    ? masterLessons 
    : masterLessons.filter(l => l.weekNumber === selectedWeek);

  // If user is Admin or Teacher AND teacherViewMode is 'full', show full info master plan
  if (isTeacherOrAdmin && teacherViewMode === 'full') {
    return (
      <div className="min-h-screen p-4 md:p-10 font-sans text-[var(--ink)] bg-[var(--paper)] transition-colors">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Admin / Teacher Control Header */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-[var(--amber)]/40 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="p-2 bg-[var(--surface)] hover:bg-[var(--paper-2)] rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] transition"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[var(--amber)]/20 text-[var(--amber)] border border-[var(--amber)]/40 rounded-full font-mono text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <Shield size={12} /> {user?.isAdmin ? 'Admin Full View' : 'Teacher Full View'}
                  </span>
                  <span className="text-xs text-[var(--muted)] font-mono">Full Info & Master Lesson Plans</span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-[var(--ink)] mt-1">{UNIT_1_MASTER_PLAN.unitTitle}</h1>
              </div>
            </div>

            {/* Toggle View Mode Button */}
            <div className="flex items-center gap-2 bg-[var(--surface)] p-1.5 rounded-2xl border border-[var(--line)] shadow-2xs">
              <button
                onClick={() => setTeacherViewMode('full')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  teacherViewMode === 'full' 
                    ? 'bg-[var(--amber)] text-white shadow-xs' 
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <FileText size={14} /> Full Master Info
              </button>
              <button
                onClick={() => setTeacherViewMode('student')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  teacherViewMode === 'student' 
                    ? 'bg-[var(--amber)] text-white shadow-xs' 
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <Eye size={14} /> Preview Student View
              </button>
            </div>
          </div>

          {/* Unit Overview Metadata Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--surface)] border border-[var(--line)] p-5 rounded-2xl shadow-xs flex items-start gap-3">
              <div className="p-3 bg-amber-500/10 text-[var(--amber)] rounded-xl border border-amber-500/20">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--muted)] block font-bold">Pacing & Structure</span>
                <span className="text-sm font-black text-[var(--ink)]">{UNIT_1_MASTER_PLAN.pacing}</span>
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--line)] p-5 rounded-2xl shadow-xs flex items-start gap-3">
              <div className="p-3 bg-amber-500/10 text-[var(--amber)] rounded-xl border border-amber-500/20">
                <Layers size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--muted)] block font-bold">Skill Tiers</span>
                <span className="text-xs font-bold text-[var(--ink)]">{UNIT_1_MASTER_PLAN.tiers}</span>
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--line)] p-5 rounded-2xl shadow-xs flex items-start gap-3">
              <div className="p-3 bg-amber-500/10 text-[var(--amber)] rounded-xl border border-amber-500/20">
                <GraduationCap size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--muted)] block font-bold">Curriculum Alignment</span>
                <span className="text-xs font-bold text-[var(--ink)]">{UNIT_1_MASTER_PLAN.curriculumAlignment}</span>
              </div>
            </div>
          </div>

          {/* Week Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-4">
            <span className="text-xs font-mono font-bold text-[var(--muted)] uppercase tracking-wider mr-2">Filter Scope:</span>
            <button
              onClick={() => setSelectedWeek('all')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                selectedWeek === 'all' 
                  ? 'bg-[var(--ink)] text-[var(--paper)] shadow-sm' 
                  : 'bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              All 12 Lessons
            </button>
            {[1, 2, 3, 4].map(wk => (
              <button
                key={wk}
                onClick={() => setSelectedWeek(wk)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  selectedWeek === wk 
                    ? 'bg-[var(--amber)] text-white shadow-sm' 
                    : 'bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                Week {wk} (Lessons {((wk - 1) * 3) + 1} - {wk * 3})
              </button>
            ))}
          </div>

          {/* Detailed Master Lesson Plans List */}
          <div className="space-y-6">
            {filteredMasterLessons.map((lesson) => (
              <div 
                key={lesson.id} 
                className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden group hover:border-[var(--amber)]/50 transition-all"
              >
                {/* Lesson Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 bg-[var(--amber)] text-slate-950 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                        Lesson {lesson.lessonNumber}
                      </span>
                      <span className="text-xs font-mono font-bold text-[var(--amber)] bg-[var(--amber)]/10 px-2 py-0.5 rounded-md border border-[var(--amber)]/20">
                        Week {lesson.weekNumber}: {lesson.weekTheme}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--muted)]">
                        Tier Level {lesson.tierLevel}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-[var(--ink)]">{lesson.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyLesson(lesson)}
                      className="px-3 py-1.5 bg-[var(--paper-2)] border border-[var(--line)] hover:bg-[var(--surface)] text-[var(--ink)] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                      title="Copy Lesson Plan Outline"
                    >
                      {copiedId === lesson.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span>{copiedId === lesson.id ? 'Copied!' : 'Copy Plan'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onLessonSelect) onLessonSelect(lesson.id);
                      }}
                      className="px-4 py-1.5 bg-[var(--amber)] text-white font-extrabold text-xs rounded-xl hover:bg-[var(--amber)]/90 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Play size={13} fill="currentColor" />
                      <span>Launch Interactive</span>
                    </button>
                  </div>
                </div>

                {/* Metadata Grid (Concepts, Standards, Math Load) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[var(--paper-2)] p-4 rounded-2xl border border-[var(--line)] text-xs font-mono">
                  <div>
                    <span className="font-bold text-[var(--amber)] uppercase block mb-0.5">Key Concepts</span>
                    <span className="text-[var(--ink)]">{lesson.concepts}</span>
                  </div>
                  <div>
                    <span className="font-bold text-blue-600 dark:text-blue-400 uppercase block mb-0.5">Standards Alignment</span>
                    <span className="text-[var(--ink)]">{lesson.standards}</span>
                  </div>
                  <div>
                    <span className="font-bold text-purple-600 dark:text-purple-400 uppercase block mb-0.5">Math Load</span>
                    <span className="text-[var(--ink)]">{lesson.mathLoad}</span>
                  </div>
                </div>

                {/* Lesson Plan Components (Warm-Up, Instruction, Exit Ticket) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  
                  {/* Warm-Up */}
                  <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--line)] space-y-2">
                    <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                      <span className="font-extrabold text-[var(--ink)] flex items-center gap-1.5">
                        <Clock size={14} className="text-[var(--amber)]" />
                        Warm-Up ({lesson.warmUp.duration})
                      </span>
                    </div>
                    <p className="font-bold text-[var(--ink)]">{lesson.warmUp.title}</p>
                    <p className="text-[var(--muted)] leading-relaxed"><strong className="text-[var(--ink)]">Activity:</strong> {lesson.warmUp.activity}</p>
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-[var(--ink)] mt-2">
                      <strong className="text-[var(--amber)]">Pedagogical Link:</strong> {lesson.warmUp.pedagogicalConnection}
                    </div>
                  </div>

                  {/* Instruction & Sandbox */}
                  <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--line)] space-y-2 md:col-span-1">
                    <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                      <span className="font-extrabold text-[var(--ink)] flex items-center gap-1.5">
                        <Brain size={14} className="text-[var(--amber)]" />
                        Instruction & Sandbox ({lesson.instructionAndSandbox.duration})
                      </span>
                    </div>
                    <p className="font-bold text-[var(--ink)]">{lesson.instructionAndSandbox.title}</p>
                    <p className="text-[var(--muted)] leading-relaxed"><strong className="text-[var(--ink)]">Direct Instruction:</strong> {lesson.instructionAndSandbox.directInstruction}</p>
                    <p className="text-[var(--muted)] leading-relaxed mt-1"><strong className="text-[var(--ink)]">Collaborative Activity:</strong> {lesson.instructionAndSandbox.collaborativeActivity}</p>
                  </div>

                  {/* Exit Ticket */}
                  <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--line)] space-y-2">
                    <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                      <span className="font-extrabold text-[var(--ink)] flex items-center gap-1.5">
                        <HelpCircle size={14} className="text-[var(--amber)]" />
                        Exit Ticket ({lesson.exitTicket.duration})
                      </span>
                    </div>
                    <p className="font-bold text-[var(--ink)]">{lesson.exitTicket.title}</p>
                    <div className="p-3 bg-[var(--paper-2)] border border-[var(--line)] rounded-xl font-mono text-[11px] text-[var(--ink)] italic">
                      {lesson.exitTicket.prompt}
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // STUDENT VERSION VIEW: Displays Unit, Levels, Lessons, and Descriptions only.
  return (
    <div className="min-h-screen p-6 md:p-12 font-sans text-[var(--ink)] transition-colors duration-300 bg-[var(--paper)]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
        
        {/* Left Column: Unit Info */}
        <div className="md:w-1/3 shrink-0">
          <button 
            onClick={onBack}
            className="flex items-center text-[var(--muted)] hover:text-[var(--amber)] mb-6 transition-colors font-bold text-xs uppercase tracking-wider"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Dashboard
          </button>
          
          <div className="bg-[var(--surface)] p-8 rounded-[24px] border border-[var(--line)] shadow-sm sticky top-12 space-y-4">
            <div className="w-16 h-16 bg-[var(--amber-tint)] rounded-2xl flex items-center justify-center text-[var(--amber)] shadow-xs border border-[var(--amber)]/20">
              <Box size={32} />
            </div>
            
            <div>
              <span className="text-[10px] font-mono font-extrabold text-[var(--amber)] uppercase tracking-widest block mb-1">
                Student Curriculum Track
              </span>
              <h1 className="text-2xl font-black mb-2 leading-tight text-[var(--ink)]">{displayTitle}</h1>
            </div>

            <p className="text-[var(--muted)] text-xs leading-relaxed">
              {displayConcept}
            </p>
            
            <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs font-bold text-[var(--ink)]">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[var(--amber)]" />
                <span>12 Student Lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-[var(--amber)]" />
                <span>4 Core Levels</span>
              </div>
            </div>

            {isTeacherOrAdmin && (
              <button
                onClick={() => setTeacherViewMode('full')}
                className="w-full mt-4 py-2 bg-[var(--amber)]/10 border border-[var(--amber)]/30 text-[var(--amber)] hover:bg-[var(--amber)]/20 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Shield size={14} /> Switch to Teacher Full Info
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Student Unit & Levels View */}
        <div className="md:w-2/3 space-y-8">
          {levels.map((level) => (
            <div key={level.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-sm space-y-5">
              
              {/* Level Header */}
              <div className="border-b border-[var(--line)] pb-3">
                <span className="text-[10px] font-mono font-black text-[var(--amber)] uppercase tracking-widest block mb-0.5">
                  Level {level.id}
                </span>
                <h3 className="text-lg font-black text-[var(--ink)]">{level.title}</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">{level.subtitle}</p>
              </div>

              {/* Lessons List in Level */}
              <div className="space-y-3">
                {level.lessons.map((lesson) => (
                  <div 
                    key={lesson.id}
                    onClick={() => {
                      if (onLessonSelect) onLessonSelect(lesson.id);
                    }}
                    className="p-4 bg-[var(--paper-2)] hover:bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--amber)]/50 rounded-2xl transition-all cursor-pointer group flex items-start justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--amber)]"></span>
                        <h4 className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--amber)] transition-colors">
                          {lesson.title}
                        </h4>
                      </div>
                      <p className="text-xs text-[var(--muted)] pl-4 leading-relaxed">
                        {lesson.description}
                      </p>
                    </div>

                    <button 
                      className="shrink-0 px-3 py-1.5 bg-[var(--surface)] group-hover:bg-[var(--amber)] group-hover:text-white border border-[var(--line)] text-[var(--ink)] font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <span>Start</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
