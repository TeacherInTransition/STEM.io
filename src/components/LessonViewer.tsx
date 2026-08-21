import React, { useState, useEffect, useRef } from 'react';
import { db, awardStemios, recordResourceOpen } from '../lib/firebase';
import { User } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, ChevronRight, ChevronLeft, CheckCircle, Maximize2, Minimize2, Sparkles, Lightbulb, Paperclip, FileText, Download, ExternalLink, Video, Globe, Play, X, HelpCircle } from 'lucide-react';
import { UNIT_1_MASTER_PLAN, UPDATED_PROBLEM_SOLVING_AI_QUIZ } from '../data/unitMasterPlans';
import { aiFoundationsCurriculum } from '../aiFoundationsData';

function findStaticLesson(lessonId: string) {
  if (!lessonId) return null;
  const cleanId = lessonId.trim().toLowerCase();

  // 1. Try to find match in UNIT_1_MASTER_PLAN.lessons
  let master = UNIT_1_MASTER_PLAN.lessons.find(m => {
    const mId = m.id.toLowerCase();
    const numStr = String(m.lessonNumber);
    return (
      mId === cleanId ||
      `u1_${mId}` === cleanId ||
      cleanId === `l${numStr}` ||
      cleanId === `u1_l${numStr}` ||
      cleanId === `lesson-${numStr}` ||
      cleanId === `lesson_${numStr}` ||
      cleanId === numStr
    );
  });

  // If lessonId is "u1", "unit1", or "unit-1", default to first master lesson
  if (!master && (cleanId === 'u1' || cleanId === 'unit1' || cleanId === 'unit-1' || cleanId === 'unit_1')) {
    master = UNIT_1_MASTER_PLAN.lessons[0];
  }

  if (master) {
    return {
      id: master.id,
      lessonTitle: `Lesson ${master.lessonNumber}: ${master.title}`,
      subject: "Introduction to Artificial Intelligence",
      grade: "Grade 10",
      pacing: master.instructionAndSandbox?.duration || "50 Minutes",
      concepts: master.concepts,
      standards: master.standards,
      mathLoad: master.mathLoad,
      slides: [
        {
          title: `Warm-Up: ${master.warmUp.title}`,
          content: `${master.warmUp.activity}\n\n💡 Pedagogical Purpose:\n${master.warmUp.pedagogicalConnection}`,
          keyTakeaways: [
            `Duration: ${master.warmUp.duration}`,
            `Focus: Interactive Inquiry & Engagement`
          ]
        },
        {
          title: `Direct Instruction: ${master.instructionAndSandbox.title}`,
          content: master.instructionAndSandbox.directInstruction,
          keyTakeaways: [
            `Concepts: ${master.concepts}`,
            `Standards: ${master.standards}`,
            `Math Complexity: ${master.mathLoad}`
          ]
        },
        {
          title: `Collaborative Sandbox & Application`,
          content: master.instructionAndSandbox.collaborativeActivity,
          keyTakeaways: [
            `Hands-On Sandbox Practice & Exploration`,
            `Teamwork & Interactive Problem Solving`
          ]
        },
        {
          title: `Exit Ticket & Synthesis`,
          content: `${master.exitTicket.title} (${master.exitTicket.duration}):\n\n"${master.exitTicket.prompt}"`,
          keyTakeaways: [
            `Individual Assessment & Reflection`,
            `Mastery Checkpoint`
          ]
        }
      ],
      quiz: UPDATED_PROBLEM_SOLVING_AI_QUIZ
    };
  }

  // 2. Check aiFoundationsCurriculum units
  const allUnits = aiFoundationsCurriculum.flatMap(s => s.units);
  const foundUnit = allUnits.find(u => u.id.toLowerCase() === cleanId || u.title.toLowerCase().includes(cleanId));
  if (foundUnit) {
    return {
      id: foundUnit.id,
      lessonTitle: `Unit ${foundUnit.id.toUpperCase()}: ${foundUnit.title}`,
      subject: "STEM.io AI Foundations",
      grade: "Grade 10",
      pacing: "50 Minutes",
      concepts: foundUnit.concept,
      standards: "CSTA 3A-AP-22, IGCSE 0478",
      mathLoad: "Medium",
      slides: [
        {
          title: `Unit Overview: ${foundUnit.title}`,
          content: `Welcome to Unit ${foundUnit.id.toUpperCase()}: ${foundUnit.title}.\n\nCore Concept: ${foundUnit.concept}\n\nActivity Objective: ${foundUnit.activity}`,
          keyTakeaways: [
            `Tag: ${foundUnit.tags.join(', ')}`,
            `Completion Reward: +${foundUnit.reward} Stemios`
          ]
        },
        {
          title: `Direct Instruction & Core Principles`,
          content: `In this unit, we explore key principles surrounding ${foundUnit.concept}.\n\nUnderstand how algorithm design, dataset structures, and ethical considerations shape real-world AI applications.`,
          keyTakeaways: [
            `Understand ${foundUnit.concept}`,
            `Analyze practical implementations`
          ]
        },
        {
          title: `Interactive Practical Exercise`,
          content: foundUnit.activity,
          keyTakeaways: [
            `Hands-On Sandbox Practice`,
            `Collaborative Problem Solving`
          ]
        },
        {
          title: `Unit Mastery Checkpoint`,
          content: `Reflect on what you have learned in ${foundUnit.title}. How does ${foundUnit.concept} impact modern technology and society?`,
          keyTakeaways: [
            `Self-Assessment`,
            `Synthesis & Feedback`
          ]
        }
      ],
      quiz: [
        {
          question: `What is the core concept of Unit ${foundUnit.id.toUpperCase()}?`,
          options: [
            foundUnit.concept,
            "Unrelated manual spreadsheet entry",
            "Analog telephone routing",
            "Legacy magnetic drive defragmentation"
          ],
          correctAnswer: 0,
          explanation: `Unit ${foundUnit.id.toUpperCase()} centers on ${foundUnit.concept}.`,
          hint: `Look at the unit overview: ${foundUnit.concept}.`
        }
      ]
    };
  }

  // 3. Fallback generic structured lesson template so no lesson ever fails to open
  const formattedTitle = cleanId.replace(/[-_]/g, ' ').toUpperCase();
  return {
    id: lessonId,
    lessonTitle: `STEM.io Interactive Lesson (${formattedTitle})`,
    subject: "Introduction to Artificial Intelligence",
    grade: "Grade 10",
    pacing: "50 Minutes",
    concepts: "AI Problem Solving, Prompt Engineering & Ethics",
    standards: "IGCSE 6.3, IB A.4",
    mathLoad: "Low",
    slides: [
      {
        title: `Introduction: ${formattedTitle}`,
        content: `Welcome to the interactive module for ${formattedTitle}.\n\nIn this lesson, you will explore foundational AI concepts, hands-on prompt testing, and ethical guidelines for modern machine learning systems.`,
        keyTakeaways: [
          `Focus: Grade 10 STEM Curriculum`,
          `Pacing: Interactive Guided Module`
        ]
      },
      {
        title: `Core Principles & Direct Instruction`,
        content: `Generative AI systems process tokens using statistical probabilities. By structuring inputs with explicit context, role constraints, and output formatting, you guide models to produce reliable and accurate answers.`,
        keyTakeaways: [
          `Next-token prediction & probability`,
          `Contextual constraints and ISPO framework`
        ]
      },
      {
        title: `Sandbox Activity & Practical Application`,
        content: `Practice writing and auditing prompts. Test how altering temperature, adding reference constraints, or changing task phrasing alters model performance.`,
        keyTakeaways: [
          `Hands-on prompt iteration`,
          `Critical evaluation of machine outputs`
        ]
      },
      {
        title: `Exit Ticket & Synthesis`,
        content: `Write a short reflection explaining one key takeaway from this module and how human oversight ensures AI reliability.`,
        keyTakeaways: [
          `Individual reflection`,
          `Mastery verification`
        ]
      }
    ],
    quiz: [
      {
        question: `What is a fundamental rule for effective prompt engineering?`,
        options: [
          "Provide explicit task instructions, clear context, and specific output format requirements.",
          "Use vague one-word queries and rely on the AI to guess missing background.",
          "Never double-check facts or citations generated by machine models.",
          "Disable all safety filters and human verification steps."
        ],
        correctAnswer: 0,
        explanation: "Clear context, task constraints, and formatting requirements produce higher quality AI responses.",
        hint: "Select the option that advocates clear context and output specifications."
      }
    ]
  };
}

function MaterialItemCard({ mat, userId, lessonId }: { mat: any; userId?: string; lessonId?: string; key?: any }) {
  const [showPreview, setShowPreview] = useState(false);
  const isFile = mat.type === 'file';
  const isVideo = mat.type === 'video';
  const isLink = mat.type === 'link';

  const handleOpenInteraction = () => {
    if (userId) {
      recordResourceOpen(userId, mat.id || `res_${mat.title}`, lessonId || 'lesson_viewer');
    }
  };

  // Parse Video Embed URL
  let embedUrl = null;
  if (isVideo && mat.url) {
    const ytMatch = mat.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    } else {
      const vmMatch = mat.url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
      if (vmMatch && vmMatch[1]) {
        embedUrl = `https://player.vimeo.com/video/${vmMatch[1]}`;
      }
    }
  }

  // Get Google Docs preview URL or local Base64 / other file preview URL
  const getDocPreviewUrl = (url: string | undefined | null): string | null => {
    if (!url) return null;
    if (url.includes('docs.google.com/document/d/')) {
      return url.replace(/\/edit.*|\/view.*/, '/preview');
    }
    if (url.includes('docs.google.com/spreadsheets/d/')) {
      return url.replace(/\/edit.*|\/view.*/, '/preview?widget=true&headers=false');
    }
    if (url.includes('docs.google.com/presentation/d/')) {
      return url.replace(/\/edit.*|\/view.*/, '/embed?start=false&loop=false&delayms=3000');
    }
    if (url.includes('drive.google.com/file/d/')) {
      return url.replace(/\/view.*/, '/preview');
    }
    return null;
  };

  const previewUrl = getDocPreviewUrl(mat.url);
  const isBase64 = mat.url?.startsWith('data:');
  const isPdf = isBase64 && mat.url?.includes('application/pdf');
  const isImage = isBase64 && mat.url?.includes('image/');

  return (
    <div 
      className="p-5 rounded-2xl bg-[var(--paper-2)] border border-[var(--line)] shadow-xs flex flex-col gap-4 text-left"
      style={{ borderRadius: '12px' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            isFile ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 
            isVideo ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' : 
            'bg-amber-500/15 text-[var(--amber)]'
          }`}>
            {isFile ? <FileText size={18} /> : isVideo ? <Video size={18} /> : <ExternalLink size={18} />}
          </div>
          <div>
            <h5 className="text-sm font-bold text-[var(--ink)]">{mat.title}</h5>
            <p className="text-xs text-[var(--muted)] font-mono mt-0.5 truncate max-w-xs sm:max-w-md">
              {isFile ? (mat.fileName || 'Google Drive File') : mat.url}
            </p>
          </div>
        </div>
        
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
          isFile ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 
          isVideo ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' : 
          'bg-amber-500/15 text-[var(--amber)]'
        }`}>
          {isFile ? 'File Attachment' : isVideo ? 'Video Resource' : 'Web Link'}
        </span>
      </div>

      {/* Render File Interaction (Google Drive / Uploaded File) */}
      {isFile && (
        <div className="space-y-3">
          <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <img 
                src={isBase64 ? "https://cdn-icons-png.flaticon.com/512/2245/2245239.png" : "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"} 
                alt="File" 
                className="w-5 h-5 object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-[var(--ink)] block">
                  {isBase64 ? "Local Offline Resource" : "Google Drive Document"}
                </span>
                <span className="text-[10px] text-[var(--muted)] block">
                  {isBase64 ? `Download and inspect offline file (${mat.fileName || 'document'})` : "Access lesson slides, templates, and spreadsheets online"}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(previewUrl || isPdf || isImage || isBase64) && (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenInteraction();
                    setShowPreview(!showPreview);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[var(--paper)] hover:bg-[var(--surface)] text-[var(--ink)] font-bold text-xs rounded-lg border border-[var(--line)] transition-all text-center cursor-pointer"
                >
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
              )}

              {isBase64 ? (
                <a 
                  href={mat.url}
                  download={mat.fileName || 'download'}
                  onClick={handleOpenInteraction}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all text-center cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download / Open File</span>
                </a>
              ) : (
                <a 
                  href={mat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleOpenInteraction}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--amber)] hover:opacity-90 text-white font-bold text-xs rounded-lg shadow-sm transition-all text-center cursor-pointer"
                >
                  <ExternalLink size={13} />
                  <span>Open Google Drive File</span>
                </a>
              )}
            </div>
          </div>

          {/* Document Preview Area */}
          {showPreview && (
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Document Previewer</span>
                <span className="text-[10px] text-gray-400 font-mono">{mat.fileName || 'External Doc'}</span>
              </div>

              {previewUrl ? (
                <div className="w-full aspect-[4/3] max-h-[500px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <iframe 
                    src={previewUrl} 
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : isPdf ? (
                <div className="w-full aspect-[4/3] max-h-[500px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <iframe 
                    src={mat.url} 
                    className="w-full h-full"
                  ></iframe>
                </div>
              ) : isImage ? (
                <div className="w-full border border-[var(--line)] rounded-lg p-2 bg-[var(--paper-2)] flex items-center justify-center">
                  <img src={mat.url} alt="Document Preview" className="max-h-96 rounded-lg object-contain shadow-2xs" />
                </div>
              ) : (
                /* Interactive educational document simulator */
                <div className="bg-[var(--surface)] p-4 rounded-xl border border-dashed border-[var(--amber)]/40 space-y-3 text-center">
                  <span className="text-2xl">📋</span>
                  <h6 className="text-xs font-bold text-[var(--ink)]">Interactive Document Simulation</h6>
                  <p className="text-[11px] text-[var(--muted)] max-w-md mx-auto">
                    This file ("{mat.fileName}") is an offline resource. We've compiled an interactive educational reading summary for your study arcade below.
                  </p>
                  <div className="bg-[var(--paper-2)] p-3 rounded-lg border border-[var(--line)] text-left space-y-2 mt-2">
                    <div className="flex items-center justify-between border-b border-[var(--line)] pb-1.5">
                      <span className="text-[10px] font-bold text-[var(--amber)]">STEM Worksheet Outline</span>
                      <span className="text-[9px] bg-[var(--amber-tint)] text-[var(--amber)] font-semibold px-2 py-0.5 rounded-full">Grade 10 Practice</span>
                    </div>
                    <div className="space-y-1 text-[var(--muted)] text-[11px]">
                      <p className="font-semibold text-[var(--ink)]">🔬 Key Subject Core Materials:</p>
                      <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px]">
                        <li>Section 1.1: Foundations and Introductory Terminology</li>
                        <li>Section 1.2: Laboratory Safety Protocols & Sandbox Exercises</li>
                        <li>Section 1.3: Empirical Exercises with "+15 Stemios" Checkpoints</li>
                      </ul>
                      <p className="text-[var(--muted)] mt-2 text-[10px]">
                        Click <strong>Download / Open File</strong> above to open the full raw printouts, complete worksheets, and spreadsheets directly on your device.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Render Video Preview */}
      {isVideo && (
        <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--line)] shadow-2xs w-full">
          {embedUrl ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200">
              <iframe 
                src={embedUrl} 
                className="w-full h-full"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          ) : mat.url && (mat.url.endsWith('.mp4') || mat.url.endsWith('.webm')) ? (
            <video src={mat.url} controls className="w-full max-h-64 rounded-lg bg-black" />
          ) : (
            <div className="w-full aspect-video rounded-lg bg-gray-950 border border-gray-800 flex flex-col items-center justify-center p-4 relative group overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop')` }} />
              <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                <div className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-transform group-hover:scale-110 shadow-lg cursor-pointer">
                  <Play size={20} className="fill-white" />
                </div>
                <span className="text-xs font-bold text-white block">Video Source Preview</span>
                <span className="text-[10px] text-gray-400 block max-w-xs truncate">{mat.url}</span>
                <a 
                  href={mat.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Open External Video Player <ExternalLink size={10} />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Render Website URL (Reroute to new tab) */}
      {isLink && (
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#EFF6FF] text-[#2563EB] rounded-lg">
              <Globe size={16} />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-[#111827] block">Interactive Website Resource</span>
              <span className="text-[10px] text-gray-500 block">External reference material, simulator, or article</span>
            </div>
          </div>
          <a 
            href={mat.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B45309] hover:bg-[#92400E] text-white font-bold text-xs rounded-lg shadow-sm transition-all text-center cursor-pointer"
          >
            <span>Visit Resource Website</span>
            <ExternalLink size={13} />
          </a>
        </div>
      )}
    </div>
  );
}

export default function LessonViewer({ lessonId, onBack, user }: { lessonId: string; onBack: () => void; user?: User }) {
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [rewardOutcome, setRewardOutcome] = useState<{ awarded: boolean; amount: number; alreadyCompleted: boolean } | null>(null);
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  const handleOptionSelect = (qIdx: number, optIdx: number, quizList: any[]) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    
    // Auto-advance to next question after 1.2 seconds highlight
    setTimeout(() => {
      if (qIdx < quizList.length - 1) {
        setActiveQuizIndex(prev => Math.min(quizList.length - 1, prev + 1));
      }
    }, 1200);
  };

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const docRef = doc(db, 'lessons', lessonId);
        const docSnap = await getDoc(docRef);
        let loaded: any = null;
        if (docSnap.exists()) {
          loaded = { id: docSnap.id, ...docSnap.data() };
        } else {
          loaded = findStaticLesson(lessonId);
        }

        const clean = (lessonId || '').trim().toLowerCase();
        const isLesson1 = 
          clean === 'u1_l1' || 
          clean === 'l1' || 
          clean === '1' || 
          clean === 'u1' || 
          clean === 'unit1' || 
          clean === 'unit-1' || 
          clean === 'lesson-1' || 
          clean === 'lesson_1' ||
          loaded?.id === 'u1_l1' ||
          loaded?.lessonTitle?.toLowerCase().includes('talking to machines');

        if (loaded) {
          if (!loaded.quiz || loaded.quiz.length === 0) {
            loaded.quiz = UPDATED_PROBLEM_SOLVING_AI_QUIZ;
          }
          setLesson(loaded);
        } else {
          console.error("Lesson not found!");
        }
      } catch (e) {
        console.error("Error fetching lesson:", e);
        const staticLesson = findStaticLesson(lessonId);
        if (staticLesson) {
          staticLesson.quiz = UPDATED_PROBLEM_SOLVING_AI_QUIZ;
          setLesson(staticLesson);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const rawSlides = lesson?.slides || [];
  const slides = rawSlides.map((s: any, idx: number) => ({
    ...s,
    slideNumber: idx + 1
  }));
  const quiz = lesson?.quiz || [];

  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    setCurrentSlide(0);
  }, [lessonId]);

  useEffect(() => {
    if (slides.length > 0 && currentSlide > slides.length) {
      setCurrentSlide(slides.length);
    }
  }, [slides.length, currentSlide]);

  useEffect(() => {
    setImageLoadError(false);
  }, [currentSlide, slides[currentSlide]?.imageUrl]);

  const isVideoUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.includes('youtube.com') ||
      lower.includes('youtu.be') ||
      lower.includes('vimeo.com') ||
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.ogg') ||
      lower.includes('/embed/')
    );
  };

  const getEmbedUrl = (url: string | undefined | null): string | null => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    const vmMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
    if (vmMatch && vmMatch[1]) {
      return `https://player.vimeo.com/video/${vmMatch[1]}`;
    }
    return null;
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if user is typing in form controls
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.code === 'Space') {
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
        }
        setCurrentSlide(prev => Math.min(slides.length, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const toggleFullscreen = async () => {
    if (!slideRef.current) return;
    try {
      if (!document.fullscreenElement) {
        if (slideRef.current.requestFullscreen) {
          await slideRef.current.requestFullscreen();
        } else {
          setIsFullscreen(!isFullscreen);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else {
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      // Fallback if browser iframe policy restricts requestFullscreen
      setIsFullscreen(prev => !prev);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white bg-[#090d16]">Loading lesson...</div>;
  }

  if (!lesson) {
    return <div className="flex items-center justify-center min-h-screen text-white bg-[#090d16]">Lesson not found.</div>;
  }

  // Calculate completion percentage
  const currentStepNumber = Math.min(currentSlide + 1, slides.length);
  const progressPercent = slides.length > 0 ? Math.round((currentStepNumber / slides.length) * 100) : 100;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans">
      <header className="flex items-center justify-between px-6 py-4 bg-[var(--paper-2)] border-b border-[var(--line)] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-[var(--muted)] hover:text-[var(--amber)] transition-colors cursor-pointer" title="Back">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{lesson?.lessonTitle || 'Lesson'}</h1>
            <p className="text-xs text-[var(--muted)] font-mono">
              {slides.length > 0 ? `Slide ${currentStepNumber} of ${slides.length}` : 'Interactive Lesson'}
            </p>
          </div>
        </div>

        {/* Top Header Quick Navigation Buttons */}
        {slides.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              className="px-3.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--surface)] text-xs font-bold disabled:opacity-30 transition-all flex items-center gap-1 cursor-pointer"
              title="Previous Slide"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentSlide < slides.length - 1) {
                  setCurrentSlide(prev => prev + 1);
                } else {
                  const quizElem = document.getElementById('lesson-quiz-section');
                  if (quizElem) {
                    quizElem.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setCurrentSlide(slides.length);
                  }
                }
              }}
              className="px-4 py-1.5 rounded-lg bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Next Slide"
            >
              <span>{currentSlide < slides.length - 1 ? 'Next Slide' : 'Quiz ↓'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-auto p-6 md:p-12 flex flex-col items-center">
        {/* Slide Display Area with Fullscreen capability */}
        {slides.length > 0 && currentSlide < slides.length && (
          <div 
            ref={slideRef}
            className={`w-full max-w-4xl bg-[var(--surface)] rounded-[24px] border border-[var(--line)] p-6 md:p-8 flex flex-col items-center shadow-sm relative transition-all ${
              isFullscreen ? 'fixed inset-0 z-50 max-w-none rounded-none border-none p-8 md:p-12 overflow-y-auto bg-[var(--paper)] justify-between min-h-screen' : ''
            }`}
          >
            {/* Top Slide Control Bar */}
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-[var(--line)]/60 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--amber)] font-mono uppercase tracking-wider bg-[var(--paper-2)] px-2.5 py-1 rounded-md border border-[var(--line)]">
                  Slide {currentSlide + 1} of {slides.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentSlide === 0}
                  onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper-2)] hover:bg-[var(--surface)] text-[var(--ink)] text-xs font-bold transition-all disabled:opacity-30 cursor-pointer"
                  title="Previous Slide"
                >
                  <ChevronLeft size={15} />
                  <span>Prev</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentSlide < slides.length - 1) {
                      setCurrentSlide(prev => prev + 1);
                    } else {
                      const quizElem = document.getElementById('lesson-quiz-section');
                      if (quizElem) {
                        quizElem.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        setCurrentSlide(slides.length);
                      }
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  title="Next Slide"
                >
                  <span>{currentSlide < slides.length - 1 ? 'Next Slide' : 'Go to Quiz ↓'}</span>
                  <ChevronRight size={15} />
                </button>

                {/* Fullscreen Toggle Button specifically for slides */}
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper-2)] hover:bg-[var(--surface)] text-[var(--ink)] text-xs font-semibold transition-colors shadow-sm cursor-pointer ml-1"
                  title={isFullscreen ? "Exit Slide Fullscreen" : "Slide Fullscreen Mode"}
                >
                  {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  <span className="hidden md:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                </button>
              </div>
            </div>

            {/* Left and Right Side Navigation Buttons */}
            <button
              disabled={currentSlide === 0}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(prev => Math.max(0, prev - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 group disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
              title="Previous Slide (←)"
            >
              <div className="px-3 py-2 rounded-full bg-white/95 hover:bg-white text-gray-900 border border-gray-300 flex items-center gap-1 shadow-xl group-hover:scale-105 transition-transform font-bold text-xs">
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Prev</span>
              </div>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (currentSlide < slides.length - 1) {
                  setCurrentSlide(prev => prev + 1);
                } else {
                  const quizElem = document.getElementById('lesson-quiz-section');
                  if (quizElem) {
                    quizElem.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setCurrentSlide(slides.length);
                  }
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 group cursor-pointer"
              title={currentSlide < slides.length - 1 ? "Next Slide (→)" : "Go to Quiz"}
            >
              <div className="px-3.5 py-2 rounded-full bg-[#B45309] hover:bg-[#92400E] text-white border border-amber-600 flex items-center gap-1.5 shadow-xl group-hover:scale-105 transition-transform font-bold text-xs">
                <span>Next</span>
                <ChevronRight size={18} />
              </div>
            </button>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">{slides[currentSlide].title}</h2>
            {slides[currentSlide].imageUrl && !isVideoUrl(slides[currentSlide].imageUrl) && (
              imageLoadError ? (
                <div className="w-full h-64 bg-[#FBF8F2] border border-[#E5E7EB] rounded-xl flex items-center justify-center text-amber-800 flex-col gap-2 p-6 text-center mb-6">
                  <span className="text-2xl">⚠️</span>
                  <span className="font-bold text-sm text-[#111827]">Unable to load slide image</span>
                  <span className="text-xs text-gray-500 max-w-sm">The image link might be incorrect or unavailable. Please contact your instructor.</span>
                  <a href={slides[currentSlide].imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#B45309] font-bold underline mt-1 flex items-center gap-1 hover:text-[#92400E]">
                    Open Image Link in New Tab <ExternalLink size={12} />
                  </a>
                </div>
              ) : (
                <img 
                  src={slides[currentSlide].imageUrl} 
                  alt={slides[currentSlide].title} 
                  onError={() => setImageLoadError(true)}
                  className={`max-w-full h-auto object-contain rounded-xl mb-6 shadow-sm border border-[var(--line)]/50 ${
                    isFullscreen ? 'max-h-[60vh]' : 'max-h-[50vh]'
                  }`}
                />
              )
            )}
            <div className="prose max-w-none text-[var(--muted)] text-lg leading-relaxed text-center mb-6" dangerouslySetInnerHTML={{ __html: slides[currentSlide].content }} />

            {/* If the slide's imageUrl is actually a video URL, render it beautifully here below the content */}
            {slides[currentSlide].imageUrl && isVideoUrl(slides[currentSlide].imageUrl) && (
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-[var(--line)]/50 shadow-md bg-black mb-6 max-h-[55vh]">
                {getEmbedUrl(slides[currentSlide].imageUrl) ? (
                  <iframe 
                    src={getEmbedUrl(slides[currentSlide].imageUrl)!} 
                    className="w-full h-full"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video 
                    src={slides[currentSlide].imageUrl} 
                    controls 
                    className="w-full h-full object-contain" 
                  />
                )}
              </div>
            )}

            {/* Slide Materials / Attachments Section */}
            {slides[currentSlide].materials && slides[currentSlide].materials.length > 0 && (
              <div className="w-full mt-8 pt-8 border-t border-[var(--line)]/60 text-left">
                <h4 className="text-sm font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
                  <Paperclip size={16} className="text-[#B45309]" />
                  <span>Slide Materials & Learning Resources</span>
                </h4>
                <div className="space-y-4">
                  {slides[currentSlide].materials.map((mat: any) => (
                    <MaterialItemCard key={mat.id || mat.title} mat={mat} userId={user?.id} lessonId={lessonId} />
                  ))}
                </div>
              </div>
            )}
                 

            {/* In-Slide Bottom Navigation Controls Bar */}
            <div className="w-full mt-8 pt-5 border-t border-[var(--line)]/60 flex flex-wrap items-center justify-between gap-3">
              <button 
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--paper-2)] hover:bg-[var(--surface)] text-[var(--ink)] rounded-xl border border-[var(--line)] text-sm font-bold disabled:opacity-30 transition-all cursor-pointer shadow-xs"
              >
                <ChevronLeft size={18} />
                <span>Previous Slide</span>
              </button>

              {/* Interactive Slide Indicator Dots */}
              <div className="flex items-center gap-1.5 py-1 px-3 bg-[var(--paper-2)] rounded-full border border-[var(--line)]/50">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === currentSlide ? 'bg-[#B45309] w-6' : 'bg-[var(--line)] hover:bg-gray-400 w-2.5'
                    }`}
                    title={`Jump to Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button 
                type="button"
                onClick={() => {
                  if (currentSlide < slides.length - 1) {
                    setCurrentSlide(prev => prev + 1);
                  } else {
                    const quizElem = document.getElementById('lesson-quiz-section');
                    if (quizElem) {
                      quizElem.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      setCurrentSlide(slides.length);
                    }
                  }
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <span>{currentSlide < slides.length - 1 ? 'Next Slide' : 'Next: Lesson Quiz ↓'}</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {currentSlide === slides.length && (
          <div className="w-full max-w-4xl flex flex-col items-center gap-6 bg-[var(--surface)] p-8 rounded-[24px] border border-[var(--line)] shadow-sm">
            {lesson?.media?.videoUrl && (
              <div className="w-full flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-6 text-center">Video Resource</h2>
                <iframe 
                  src={lesson.media.videoUrl} 
                  className="w-full aspect-video rounded-xl shadow-sm"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            )}
            <div className="text-2xl font-bold flex items-center gap-2 text-[#B45309]">
              <Sparkles size={26} /> All Lesson Slides Completed!
            </div>
            <p className="text-sm text-[var(--muted)] text-center max-w-md">
              Great job going through the material. You can review the slides anytime or continue to the checkpoint quiz below.
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => setCurrentSlide(0)}
                className="px-5 py-2.5 bg-[var(--paper-2)] hover:bg-[var(--surface)] text-[var(--ink)] font-bold text-sm rounded-xl border border-[var(--line)] transition cursor-pointer"
              >
                ↺ Review Slides (Slide 1)
              </button>
              {quiz.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const quizElem = document.getElementById('lesson-quiz-section');
                    if (quizElem) quizElem.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  <span>Take Checkpoint Quiz ↓</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Lesson Check-Up Quiz Section - ALWAYS positioned at the bottom of the center container below the slide */}
        {quiz.length > 0 && (
          <div id="lesson-quiz-section" className="w-full max-w-4xl bg-[var(--surface)] rounded-[24px] border border-[var(--line)] p-6 md:p-8 flex flex-col shadow-sm mt-8">
            {/* Header with Pop-up button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-[var(--amber)]" size={24} />
                  <h2 className="text-xl md:text-2xl font-bold text-[var(--ink)]">
                    Lesson Check-Up Quiz
                  </h2>
                </div>
                <p className="text-xs text-[var(--muted)] font-medium mt-0.5">
                  Check your understanding for this module below
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-1 bg-[var(--paper-2)] border border-[var(--line)] rounded-full text-[var(--muted)]">
                  {quiz.length} {quiz.length === 1 ? 'Question' : 'Questions'}
                </span>
                <button
                  onClick={() => setIsQuizModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--amber)] hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                  title="Open Pop-Up Quiz View"
                >
                  <Maximize2 size={14} />
                  <span>Pop-Up Quiz View</span>
                </button>
              </div>
            </div>

            {/* Questions 1, 2, 3... Tab Selection Bar */}
            <div className="flex items-center gap-2 my-4 overflow-x-auto pb-2 scrollbar-thin">
              <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider shrink-0 mr-1">
                Questions:
              </span>
              {quiz.map((q: any, qIdx: number) => {
                const isSelected = activeQuizIndex === qIdx;
                const userSelectedOpt = selectedAnswers[qIdx];
                const isAnswered = userSelectedOpt !== undefined;
                const targetCorrect = q.correctIndex ?? q.correctAnswer;
                const isCorrect = userSelectedOpt === targetCorrect;

                return (
                  <button
                    key={qIdx}
                    onClick={() => setActiveQuizIndex(qIdx)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--amber)] text-white border-amber-600 shadow-sm'
                        : isAnswered
                        ? isCorrect
                          ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/50'
                          : 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/50'
                        : 'bg-[var(--paper-2)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <span>Question {qIdx + 1}</span>
                    {isAnswered && (
                      <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                        {isCorrect ? '✓' : '✕'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Single Selected Question Box */}
            {quiz[activeQuizIndex] && (
              <div className="w-full bg-[var(--paper-2)] p-5 md:p-6 rounded-2xl border border-[var(--line)] space-y-4 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)] uppercase tracking-wider font-bold">
                  <span>Question {activeQuizIndex + 1} of {quiz.length}</span>
                  {selectedAnswers[activeQuizIndex] !== undefined && (
                    <span className={selectedAnswers[activeQuizIndex] === (quiz[activeQuizIndex].correctIndex ?? quiz[activeQuizIndex].correctAnswer) ? "text-emerald-600 font-bold flex items-center gap-1" : "text-rose-600 font-bold flex items-center gap-1"}>
                      {selectedAnswers[activeQuizIndex] === (quiz[activeQuizIndex].correctIndex ?? quiz[activeQuizIndex].correctAnswer) ? "✓ Correct" : "✕ Incorrect"}
                    </span>
                  )}
                </div>

                <h3 className="text-base md:text-lg font-bold text-[var(--ink)]">
                  {quiz[activeQuizIndex].question}
                </h3>

                <div className="w-full flex flex-col gap-2.5">
                  {(quiz[activeQuizIndex].options || []).map((opt: string, optIdx: number) => {
                    const userSelectedOpt = selectedAnswers[activeQuizIndex];
                    const isQuestionAnswered = userSelectedOpt !== undefined;
                    const isSelected = userSelectedOpt === optIdx;
                    const targetCorrect = quiz[activeQuizIndex].correctIndex ?? quiz[activeQuizIndex].correctAnswer;
                    const isTargetCorrect = optIdx === targetCorrect;

                    let btnStyle = "bg-[var(--surface)] hover:bg-[var(--paper)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--amber)]";
                    let badge = null;

                    if (isQuestionAnswered || submitted) {
                      if (isTargetCorrect) {
                        btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold shadow-md ring-2 ring-emerald-500/30 transition-all duration-300 transform scale-[1.005]";
                        badge = (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs shrink-0 animate-in fade-in">
                            ✓ Correct Choice
                          </span>
                        );
                      } else if (isSelected) {
                        btnStyle = "bg-rose-500/20 border-rose-500 text-rose-900 dark:text-rose-100 font-semibold shadow-xs ring-2 ring-rose-500/30 transition-all duration-300";
                        badge = (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs shrink-0 animate-in fade-in">
                            ✕ Incorrect
                          </span>
                        );
                      } else {
                        btnStyle = "bg-[var(--surface)] text-[var(--muted)] opacity-50 border-[var(--line)]";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={submitted}
                        onClick={() => handleOptionSelect(activeQuizIndex, optIdx, quiz)}
                        className={`w-full py-3.5 px-4 text-left text-sm rounded-xl transition-all border font-medium flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span className="pr-2">{opt}</span>
                        {badge}
                      </button>
                    );
                  })}
                </div>

                {selectedAnswers[activeQuizIndex] !== undefined && quiz[activeQuizIndex].explanation && (
                  <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border transition-all animate-in fade-in duration-300 ${
                    selectedAnswers[activeQuizIndex] === (quiz[activeQuizIndex].correctIndex ?? quiz[activeQuizIndex].correctAnswer)
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  }`}>
                    <Sparkles size={16} className={`shrink-0 mt-0.5 ${selectedAnswers[activeQuizIndex] === (quiz[activeQuizIndex].correctIndex ?? quiz[activeQuizIndex].correctAnswer) ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <div>
                      <strong className="block font-bold mb-0.5">
                        {selectedAnswers[activeQuizIndex] === (quiz[activeQuizIndex].correctIndex ?? quiz[activeQuizIndex].correctAnswer) ? '✓ Correct Explanation:' : '💡 Key Concept to Note:'}
                      </strong>
                      <span>{quiz[activeQuizIndex].explanation}</span>
                    </div>
                  </div>
                )}

                {quiz[activeQuizIndex].hint && (
                  <div className="pt-2 border-t border-[var(--line)]/50">
                    <button
                      type="button"
                      onClick={() => setShowHints(prev => ({ ...prev, [activeQuizIndex]: !prev[activeQuizIndex] }))}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold transition cursor-pointer"
                    >
                      <Lightbulb size={13} />
                      <span>{showHints[activeQuizIndex] ? "Hide Hint" : "Need a hint?"}</span>
                    </button>
                    {showHints[activeQuizIndex] && (
                      <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2 shadow-xs">
                        <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Hint:</strong> {quiz[activeQuizIndex].hint}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Question Navigation Controls inside Card */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]/60">
                  <button
                    disabled={activeQuizIndex === 0}
                    onClick={() => setActiveQuizIndex(prev => Math.max(0, prev - 1))}
                    className="flex items-center gap-1 px-3.5 py-1.5 bg-[var(--surface)] hover:bg-[var(--paper-2)] border border-[var(--line)] rounded-xl text-xs font-bold text-[var(--ink)] disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Previous Question
                  </button>

                  <span className="text-xs font-mono font-bold text-[var(--muted)]">
                    {Object.keys(selectedAnswers).length}/{quiz.length} Answered
                  </span>

                  <button
                    disabled={activeQuizIndex >= quiz.length - 1}
                    onClick={() => setActiveQuizIndex(prev => Math.min(quiz.length - 1, prev + 1))}
                    className="flex items-center gap-1 px-3.5 py-1.5 bg-[var(--surface)] hover:bg-[var(--paper-2)] border border-[var(--line)] rounded-xl text-xs font-bold text-[var(--ink)] disabled:opacity-40 transition cursor-pointer"
                  >
                    Next Question <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Score / Submission Section */}
            <div className="w-full mt-6 pt-4 border-t border-[var(--line)] flex flex-col items-center gap-4">
              {submitted ? (
                <div className="w-full text-center space-y-3">
                  <div className="text-xl font-bold text-[var(--ink)] flex items-center justify-center gap-2">
                    <Sparkles className="text-[var(--amber)]" size={24} />
                    Quiz Result: {score}/{quiz.length} Correct
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {rewardOutcome?.awarded ? (
                      score === quiz.length 
                        ? `Outstanding job! You've mastered this module checkpoint. +${rewardOutcome.amount} Stemios Credited to Your Account Balance!` 
                        : `Good effort! You scored ${score}/${quiz.length}. +${rewardOutcome.amount} Stemios Credited to Your Account Balance!`
                    ) : rewardOutcome?.alreadyCompleted ? (
                      `Quiz completed with ${score}/${quiz.length} correct. (Note: Stemios are awarded only once per quiz. No additional Stemios were added).`
                    ) : (
                      "Review the correct answers above and try again to earn Stemios!"
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setScore(null);
                      setSelectedAnswers({});
                      setShowHints({});
                      setRewardOutcome(null);
                    }}
                    className="px-6 py-2.5 bg-[var(--surface)] hover:bg-[var(--paper-2)] text-[var(--ink)] font-bold text-xs rounded-xl border border-[var(--line)] transition shadow-sm mt-2 cursor-pointer"
                  >
                    Try Quiz Again
                  </button>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    if (Object.keys(selectedAnswers).length < quiz.length) {
                      alert(`Please select an answer for all ${quiz.length} question(s) before submitting!`);
                      return;
                    }
                    let correctCount = 0;
                    quiz.forEach((q: any, idx: number) => {
                      const targetCorrect = q.correctIndex ?? q.correctAnswer;
                      if (selectedAnswers[idx] === targetCorrect) {
                        correctCount++;
                      }
                    });
                    setScore(correctCount);
                    setSubmitted(true);

                    if (correctCount > 0) {
                      const earnedStemios = 50; // flat reward per completed lesson quiz
                      const res = await awardStemios(undefined, lessonId, earnedStemios);
                      setRewardOutcome(res);
                    } else {
                      setRewardOutcome({ awarded: false, amount: 0, alreadyCompleted: false });
                    }
                  }}
                  className="w-full py-3.5 bg-[var(--amber)] hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle size={18} />
                  Submit Quiz Answers
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pop-Up Contained Modal for Questions 1, 2, 3... Selection */}
        {isQuizModalOpen && quiz.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--line)] rounded-[24px] p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-5 relative">
              <button 
                onClick={() => setIsQuizModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-[var(--paper-2)] hover:bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)] transition cursor-pointer"
                title="Close Quiz Pop-Up"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
                <CheckCircle className="text-[var(--amber)]" size={26} />
                <div>
                  <h3 className="text-xl font-bold text-[var(--ink)]">Lesson Check-Up Quiz Pop-Up</h3>
                  <p className="text-xs text-[var(--muted)] font-medium">Interactive Question Selection View</p>
                </div>
              </div>

              {/* Question Tabs in Pop-Up Modal */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider shrink-0 mr-1">
                  Questions:
                </span>
                {quiz.map((q: any, qIdx: number) => {
                  const isSelected = activeQuizIndex === qIdx;
                  const userSelectedOpt = selectedAnswers[qIdx];
                  const isAnswered = userSelectedOpt !== undefined;
                  const targetCorrect = q.correctIndex ?? q.correctAnswer;
                  const isCorrect = userSelectedOpt === targetCorrect;

                  return (
                    <button
                      key={qIdx}
                      onClick={() => setActiveQuizIndex(qIdx)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--amber)] text-white border-amber-600 shadow-sm'
                          : isAnswered
                          ? isCorrect
                            ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/50'
                            : 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/50'
                          : 'bg-[var(--paper-2)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]'
                      }`}
                    >
                      <span>Question {qIdx + 1}</span>
                      {isAnswered && (
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                          {isCorrect ? '✓' : '✕'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Question in Modal */}
              {quiz[activeQuizIndex] && (
                <div className="w-full bg-[var(--paper-2)] p-5 rounded-2xl border border-[var(--line)] space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)] font-bold uppercase">
                    <span>Question {activeQuizIndex + 1} of {quiz.length}</span>
                    {selectedAnswers[activeQuizIndex] !== undefined && (
                      <span className={selectedAnswers[activeQuizIndex] === (quiz[activeQuizIndex].correctIndex ?? quiz[activeQuizIndex].correctAnswer) ? "text-emerald-600 font-bold flex items-center gap-1" : "text-rose-600 font-bold flex items-center gap-1"}>
                        {selectedAnswers[activeQuizIndex] === (quiz[activeQuizIndex].correctIndex ?? quiz[activeQuizIndex].correctAnswer) ? "✓ Correct" : "✕ Incorrect"}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-[var(--ink)]">{quiz[activeQuizIndex].question}</h4>

                  <div className="flex flex-col gap-2">
                    {(quiz[activeQuizIndex].options || []).map((opt: string, optIdx: number) => {
                      const userSelectedOpt = selectedAnswers[activeQuizIndex];
                      const isQuestionAnswered = userSelectedOpt !== undefined;
                      const isSelected = userSelectedOpt === optIdx;
                      const targetCorrect = quiz[activeQuizIndex].correctIndex ?? quiz[activeQuizIndex].correctAnswer;
                      const isTargetCorrect = optIdx === targetCorrect;

                      let btnStyle = "bg-[var(--surface)] hover:bg-[var(--paper)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--amber)]";
                      let badge = null;

                      if (isQuestionAnswered || submitted) {
                        if (isTargetCorrect) {
                          btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold shadow-md ring-2 ring-emerald-500/30 transition-all duration-300 transform scale-[1.005]";
                          badge = (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs shrink-0 animate-in fade-in">
                              ✓ Correct Choice
                            </span>
                          );
                        } else if (isSelected) {
                          btnStyle = "bg-rose-500/20 border-rose-500 text-rose-900 dark:text-rose-100 font-semibold shadow-xs ring-2 ring-rose-500/30 transition-all duration-300";
                          badge = (
                            <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs shrink-0 animate-in fade-in">
                              ✕ Incorrect
                            </span>
                          );
                        } else {
                          btnStyle = "bg-[var(--surface)] text-[var(--muted)] opacity-50 border-[var(--line)]";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={submitted}
                          onClick={() => handleOptionSelect(activeQuizIndex, optIdx, quiz)}
                          className={`w-full py-3.5 px-4 text-left text-sm rounded-xl transition border font-medium flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <span className="pr-2">{opt}</span>
                          {badge}
                        </button>
                      );
                    })}
                  </div>

                  {selectedAnswers[activeQuizIndex] !== undefined && quiz[activeQuizIndex].explanation && (
                    <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border transition-all animate-in fade-in duration-300 ${
                      selectedAnswers[activeQuizIndex] === (quiz[activeQuizIndex].correctIndex ?? quiz[activeQuizIndex].correctAnswer)
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                    }`}>
                      <Sparkles size={16} className={`shrink-0 mt-0.5 ${selectedAnswers[activeQuizIndex] === (quiz[activeQuizIndex].correctIndex ?? quiz[activeQuizIndex].correctAnswer) ? 'text-emerald-600' : 'text-amber-600'}`} />
                      <div>
                        <strong className="block font-bold mb-0.5">
                          {selectedAnswers[activeQuizIndex] === (quiz[activeQuizIndex].correctIndex ?? quiz[activeQuizIndex].correctAnswer) ? '✓ Correct Explanation:' : '💡 Key Concept to Note:'}
                        </strong>
                        <span>{quiz[activeQuizIndex].explanation}</span>
                      </div>
                    </div>
                  )}

                  {quiz[activeQuizIndex].hint && (
                    <div className="pt-2 border-t border-[var(--line)]/50">
                      <button
                        type="button"
                        onClick={() => setShowHints(prev => ({ ...prev, [activeQuizIndex]: !prev[activeQuizIndex] }))}
                        className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:underline font-semibold cursor-pointer"
                      >
                        <Lightbulb size={13} />
                        <span>{showHints[activeQuizIndex] ? "Hide Hint" : "Need a hint?"}</span>
                      </button>
                      {showHints[activeQuizIndex] && (
                        <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                          <strong>Hint:</strong> {quiz[activeQuizIndex].hint}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]/60">
                    <button
                      disabled={activeQuizIndex === 0}
                      onClick={() => setActiveQuizIndex(prev => Math.max(0, prev - 1))}
                      className="px-3.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Prev Question
                    </button>
                    <button
                      disabled={activeQuizIndex >= quiz.length - 1}
                      onClick={() => setActiveQuizIndex(prev => Math.min(quiz.length - 1, prev + 1))}
                      className="px-3.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Next Question <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
                <button
                  onClick={() => setIsQuizModalOpen(false)}
                  className="px-4 py-2 bg-[var(--paper-2)] hover:bg-[var(--paper)] text-[var(--ink)] font-bold text-xs rounded-xl border border-[var(--line)] cursor-pointer"
                >
                  Close Pop-Up
                </button>
                {!submitted && (
                  <button
                    onClick={async () => {
                      if (Object.keys(selectedAnswers).length < quiz.length) {
                        alert(`Please select an answer for all ${quiz.length} question(s) before submitting!`);
                        return;
                      }
                      let correctCount = 0;
                      quiz.forEach((q: any, idx: number) => {
                        const targetCorrect = q.correctIndex ?? q.correctAnswer;
                        if (selectedAnswers[idx] === targetCorrect) {
                          correctCount++;
                        }
                      });
                      setScore(correctCount);
                      setSubmitted(true);
                      if (correctCount > 0) {
                        const earnedStemios = 50; // flat reward per completed lesson quiz
                        const res = await awardStemios(undefined, lessonId, earnedStemios);
                        setRewardOutcome(res);
                      } else {
                        setRewardOutcome({ awarded: false, amount: 0, alreadyCompleted: false });
                      }
                    }}
                    className="px-5 py-2 bg-[var(--amber)] hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle size={15} /> Submit Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lesson Completion Progress Bar and Navigation Controls */}
        <div className="mt-8 w-full max-w-2xl flex flex-col items-center gap-4">
          {/* Completion Progress Bar */}
          <div className="w-full bg-[var(--surface)] p-4 rounded-2xl border border-[var(--line)] shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              <span>Lesson Progress</span>
              <span className="font-mono text-[var(--amber)] font-bold">
                {currentSlide < slides.length 
                  ? `${currentSlide + 1}/${slides.length} slides` 
                  : 'Knowledge Check / Completed'}
              </span>
            </div>
            <div className="w-full bg-[var(--paper-2)] h-3 rounded-full overflow-hidden border border-[var(--line)] p-0.5">
              <div 
                className="bg-gradient-to-r from-amber-500 to-[var(--amber)] h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${currentSlide < slides.length ? progressPercent : 100}%` }}
              ></div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-6">
            <button 
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              className="w-12 h-12 flex items-center justify-center bg-[var(--surface)] hover:bg-[var(--paper-2)] rounded-full border border-[var(--line)] disabled:opacity-40 transition-all shadow-sm active:scale-95"
              title="Previous Slide"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              disabled={currentSlide >= slides.length && (quiz.length === 0 && !lesson?.media?.videoUrl)}
              onClick={() => setCurrentSlide(prev => Math.min(slides.length, prev + 1))}
              className="w-12 h-12 flex items-center justify-center bg-[var(--amber)] hover:bg-amber-600 text-white rounded-full border border-amber-600 disabled:opacity-40 transition-all shadow-sm active:scale-95"
              title="Next Slide"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

