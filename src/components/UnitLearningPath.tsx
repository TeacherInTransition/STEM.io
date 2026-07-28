import React, { useEffect, useState } from 'react';
import { ChevronLeft, Box, BookOpen, Target, CheckCircle2, Award, Trophy, Sparkles } from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UnitLearningPathProps {
  unitId: string;
  unitTitle: string;
  onBack: () => void;
  onLessonSelect?: (lessonId: string) => void;
}

export default function UnitLearningPath({ unitId, unitTitle, onBack, onLessonSelect }: UnitLearningPathProps) {
  const [customLessons, setCustomLessons] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'lessons'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lessons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomLessons(lessons);
    }, (error) => {
      console.error("Error fetching custom lessons in UnitLearningPath:", error);
    });
    return () => unsubscribe();
  }, []);

  const latestCustomLesson = customLessons[0];

  // Mock data for levels since we don't have this in the curriculum structure
  const levels = unitId === 'u1' ? [
    {
      id: 1,
      title: "Foundations of AI",
      lessons: [
        { 
          id: latestCustomLesson ? latestCustomLesson.id : 'l1', 
          title: latestCustomLesson ? latestCustomLesson.lessonTitle : 'What is Artificial Intelligence?', 
          status: latestCustomLesson ? 'active' : 'completed', 
          type: 'lesson',
          isCustom: !!latestCustomLesson
        },
        { id: 'l2', title: 'The History of AI', status: 'active', type: 'lesson' },
        { id: 'l3', title: 'Narrow vs General AI', status: 'locked', type: 'lesson' },
        { id: 'l4', title: 'Everyday AI Applications', status: 'locked', type: 'lesson' },
        { id: 'a1', title: 'Level 1 Assessment', status: 'locked', type: 'assessment' },
      ]
    },
    {
      id: 2,
      title: "Machine Learning Basics",
      lessons: [
        { id: 'l5', title: 'How Machines Learn', status: 'locked', type: 'lesson' },
        { id: 'l6', title: 'Supervised Learning', status: 'locked', type: 'lesson' },
        { id: 'l7', title: 'Unsupervised Learning', status: 'locked', type: 'lesson' },
        { id: 'a2', title: 'Level 2 Assessment', status: 'locked', type: 'assessment' },
      ]
    },
    {
      id: 3,
      title: "Deep Learning & Neural Networks",
      lessons: [
        { id: 'l8', title: 'What is a Neural Network?', status: 'locked', type: 'lesson' },
        { id: 'l9', title: 'Deep Learning in Practice', status: 'locked', type: 'lesson' },
        { id: 'a3', title: 'Level 3 Assessment', status: 'locked', type: 'assessment' },
      ]
    },
    {
      id: 4,
      title: "Unit Final",
      isFinal: true,
      lessons: [
        { id: 'f1', title: 'Unit Final Assessment & Project', status: 'locked', type: 'final-project' }
      ]
    }
  ] : [];

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans text-[var(--ink)] transition-colors duration-300">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
        {/* Left Column: Unit Info */}
        <div className="md:w-1/3 shrink-0">
          <button 
            onClick={onBack}
            className="flex items-center text-[var(--muted)] hover:text-[var(--amber)] mb-6 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Arcade
          </button>
          
          <div className="bg-[var(--surface)] p-8 rounded-[24px] border border-[var(--line)] shadow-sm sticky top-12">
            <div className="w-16 h-16 bg-[#F3E8FF] rounded-xl flex items-center justify-center text-[#9333EA] mb-6 shadow-sm">
              <Box size={32} />
            </div>
            
            <h1 className="text-2xl font-bold font-serif mb-3 leading-tight">{unitTitle || 'AI vs ML vs DL'}</h1>
            <p className="text-[var(--muted)] text-sm mb-8 leading-relaxed">
              {unitId === 'u1' ? 'Explore the core concepts of Artificial Intelligence, Machine Learning, and Deep Learning, and understand how they fit together in the modern tech landscape.' : 'Supercharge your programming skills to build interactive projects.'}
            </p>
            
            <div className="flex gap-6 text-sm font-bold text-[var(--ink)]">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[var(--muted)]" />
                {unitId === 'u1' ? '12 Lessons' : '15 Lessons'}
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-[var(--muted)]" />
                {unitId === 'u1' ? '45 Exercises' : '150 Exercises'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Path */}
        <div className="md:w-2/3 py-8 flex flex-col items-center">
          {levels.map((level, levelIdx) => (
            <div key={level.id} className="flex flex-col items-center w-full max-w-md mb-16 relative">
              
              {/* Level Banner */}
              <div className="w-full px-4 mb-8 z-10">
                {!level.isFinal ? (
                  <div className="bg-white border-b-4 border-[#D8B4FE] text-[#9333EA] rounded-3xl p-4 shadow-sm flex flex-col items-center w-full relative">
                    <span className="text-[10px] font-bold tracking-widest uppercase mb-1">Level {level.id}</span>
                    <span className="font-bold text-lg">{level.title}</span>
                  </div>
                ) : (
                  <div className="bg-white border-b-4 border-amber-500 text-amber-600 rounded-3xl p-4 shadow-sm flex flex-col items-center w-full relative">
                    <span className="text-[10px] font-bold tracking-widest uppercase mb-1 opacity-90">Final Stage</span>
                    <span className="font-bold text-lg">{level.title}</span>
                  </div>
                )}
              </div>

              {/* Lessons */}
              <div className="flex flex-col gap-10 relative items-center w-full">
                {level.lessons.map((lesson, lessonIdx) => {
                  const isActive = lesson.status === 'active';
                  const isLocked = lesson.status === 'locked';
                  const isCompleted = lesson.status === 'completed';
                  
                  // Calculate curve offset using a sine wave
                  const offsetAmount = 50;
                  const xOffset = Math.sin((lessonIdx + levelIdx * 3) * 0.8) * offsetAmount;
                  
                  const isLessonCustom = (lesson as any).isCustom;
                  return (
                    <div 
                      key={lesson.id} 
                      onClick={() => {
                        if (isLocked) return;
                        if (onLessonSelect) {
                          onLessonSelect(lesson.id);
                        }
                      }}
                      className={`flex items-center justify-center relative group w-full ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <div className="relative flex items-center justify-center" style={{ transform: `translateX(${xOffset}px)` }}>
                        {/* Icon */}
                        <div className="relative z-10 shrink-0">
                          <div className={`w-[84px] h-[84px] rounded-full flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
                             {/* Outer ring for active/custom state */}
                             {(isActive || isLessonCustom) && (
                               <div className={`absolute inset-[-8px] rounded-full border-4 ${isLessonCustom ? 'border-amber-200 animate-pulse' : 'border-[#E9D5FF]'} opacity-60`}></div>
                             )}
                             
                             {/* Inner circle */}
                             <div className={`${lesson.type === 'final-project' ? 'w-[84px] h-[84px]' : 'w-[72px] h-[72px]'} rounded-full flex items-center justify-center shadow-[0_6px_0_rgba(0,0,0,0.15)] ${
                               isLessonCustom ? 'bg-amber-500 text-white shadow-amber-600' :
                               isActive ? 'bg-[#9333EA] text-white shadow-[#7E22CE]' : 
                               isCompleted ? 'bg-[#F3E8FF] text-[#9333EA] shadow-[#D8B4FE]' : 
                               'bg-[#E5E7EB] text-[#9CA3AF] shadow-[#D1D5DB]'
                             } ${lesson.type === 'final-project' && isLocked ? 'bg-[#FEF3C7] text-[#D97706] shadow-[#FDE68A]' : ''}`}>
                               {isLessonCustom ? <Sparkles size={32} className="text-white" /> :
                                 isCompleted ? <CheckCircle2 size={32} /> : 
                                 lesson.type === 'assessment' ? <Award size={32} className={isActive ? 'text-white' : ''} /> : 
                                 lesson.type === 'final-project' ? <Trophy size={40} className={isActive ? 'text-white' : ''} /> : 
                                 <div className="w-10 h-10 rounded-full border-4 border-current opacity-60"></div>}
                             </div>

                             {/* Custom Lesson Mini-Badge */}
                             {isLessonCustom && (
                               <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1 rounded-full border-2 border-white shadow-md flex items-center justify-center animate-bounce">
                                 <Sparkles size={12} />
                               </div>
                             )}
                          </div>
                        </div>
                        
                        {/* Title - positioned consistently to the right */}
                        <div className="absolute left-full ml-6 w-32 flex flex-col justify-center pointer-events-none">
                          <span className={`font-bold text-sm leading-tight ${isActive || isLessonCustom ? 'text-[var(--ink)] font-extrabold' : 'text-[#9CA3AF]'}`}>
                            {lesson.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
