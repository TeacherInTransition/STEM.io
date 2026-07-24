import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Coins, Flame, Wand2, CircleCheck, Play, 
  CloudDownload, Sliders, PlusCircle, Copy, HelpCircle, 
  ArrowLeft, ArrowRight, CloudUpload 
} from 'lucide-react';
import { User } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface LessonBuilderProps {
  user: User;
  onBack?: () => void;
}

export default function LessonBuilder({ user, onBack }: LessonBuilderProps) {
  const [activeLessonId, setActiveLessonId] = useState('history-of-ai');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lessonCatalog, setLessonCatalog] = useState<any>({
    'what-is-ai': {
        lessonTitle: "What is Artificial Intelligence?",
        media: { videoUrl: "https://www.youtube.com/embed/ad79nYk2kEg" },
        slides: [{
            slideNumber: 1,
            title: "Defining the AI Frontier",
            content: "<p>Artificial intelligence is a branch of computer science focused on building smart machines capable of performing tasks that typically require human intelligence.</p><ul><li>🧠 Machine Learning</li><li>🗣️ NLP Processing</li><li>🚗 Robotics & Automation</li></ul>",
            imageUrl: ""
        }],
        quiz: [{
            question: "What core aspect makes computer systems 'intelligent'?",
            options: ["Running faster clock speeds", "Adapting actions based on raw data trends", "Having RGB lighting profiles", "Storing infinitely large files"],
            correctIndex: 1
        }]
    },
    'history-of-ai': {
        lessonTitle: "The History of AI",
        media: { videoUrl: "https://www.youtube.com/embed/2ePf9rue1Ao" },
        slides: [
            {
                slideNumber: 1,
                title: "The Birth of AI (1956)",
                content: "<p>The official birth of Artificial Intelligence can be traced back to the summer of <strong>1956</strong> at the Dartmouth Summer Research Project.</p>",
                imageUrl: ""
            },
            {
                slideNumber: 2,
                title: "The AI Winters",
                content: "<p>When initial promises failed to translate into real products, severe funding cuts followed, resulting in prolonged periods known as <strong>AI Winters</strong>.</p>",
                imageUrl: ""
            }
        ],
        quiz: [{
            question: "What university hosted the summer project where the term AI was coined?",
            options: ["Harvard University", "Dartmouth College", "Stanford University", "Oxford University"],
            correctIndex: 1
        }]
    },
    'narrow-vs-general': {
        lessonTitle: "Narrow vs General AI",
        media: { videoUrl: "" },
        slides: [{
            slideNumber: 1,
            title: "The Narrow Frontier (ANI)",
            content: "<p>Artificial Narrow Intelligence, or <strong>Weak AI</strong>, describes algorithms designed to tackle specific, bounded tasks.</p>",
            imageUrl: ""
        }],
        quiz: [{
            question: "Which of the following is an example of ANI?",
            options: ["An autonomous AI consciousness", "A personalized recommendation algorithm", "A human robot clone", "Universal solver AI"],
            correctIndex: 1
        }]
    },
    'python-basics': {
        lessonTitle: "Introduction to Python",
        media: { videoUrl: "" },
        slides: [{
            slideNumber: 1,
            title: "Getting Started with Python Code",
            content: "<p>Practice running your first block of loop constructs below!</p>",
            imageUrl: "",
            isCodeSlide: true,
            codeSource: "for i in range(1, 6):\n    print(f'Training step: {i}')"
        }],
        quiz: [{
            question: "What is the primary range loop output parameter index?",
            options: ["Index begins at 0", "Index begins at 1", "Index starts at max limit", "Index is randomized"],
            correctIndex: 0
        }]
    }
  });

  const [jsonPaste, setJsonPaste] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [showCodeOutput, setShowCodeOutput] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'admin' | 'preview'>('admin');
  
  const activeLesson = lessonCatalog[activeLessonId];
  const activeSlide = activeLesson?.slides[currentSlideIndex];
  
  if (!user.isAdmin) {
    return (
        <div className="flex items-center justify-center h-full w-full text-[var(--ink)]">
            <h2 className="text-xl font-bold">Access Denied: Admin Privileges Required</h2>
        </div>
    );
  }

  const handleLessonChange = (id: string) => {
    setActiveLessonId(id);
    setCurrentSlideIndex(0);
    setShowCodeOutput(false);
    setSelectedQuizAnswer(null);
  };

  const handleImport = () => {
    if (!jsonPaste.trim()) return;
    try {
        const parsed = JSON.parse(jsonPaste);
        const newId = 'ai-imported-' + Date.now();
        setLessonCatalog((prev: any) => ({
            ...prev,
            [newId]: parsed
        }));
        setActiveLessonId(newId);
        setCurrentSlideIndex(0);
        alert("🚀 Dynamic Lesson Manifest Imported successfully!");
        setJsonPaste('');
    } catch (e) {
        alert("Parsing Failure: Check JSON format guidelines.");
    }
  };

  const handleUpdateLessonMeta = (field: string, value: string) => {
    setLessonCatalog((prev: any) => {
        const updated = { ...prev };
        if (field === 'lessonTitle') {
            updated[activeLessonId].lessonTitle = value;
        } else if (field === 'videoUrl') {
            if (!updated[activeLessonId].media) updated[activeLessonId].media = {};
            updated[activeLessonId].media.videoUrl = value;
        }
        return updated;
    });
  };

  const handleUpdateSlide = (field: string, value: string) => {
    setLessonCatalog((prev: any) => {
        const updated = { ...prev };
        updated[activeLessonId].slides[currentSlideIndex][field] = value;
        return updated;
    });
  };

  const handleUpdateQuiz = (field: string, value: any, index?: number) => {
      setLessonCatalog((prev: any) => {
        const updated = { ...prev };
        if (!updated[activeLessonId].quiz || updated[activeLessonId].quiz.length === 0) {
             updated[activeLessonId].quiz = [{ question: '', options: ['', '', '', ''], correctIndex: 0 }];
        }
        if (field === 'question') {
            updated[activeLessonId].quiz[0].question = value;
        } else if (field === 'options' && index !== undefined) {
             updated[activeLessonId].quiz[0].options[index] = value;
        } else if (field === 'correctIndex') {
             updated[activeLessonId].quiz[0].correctIndex = parseInt(value, 10);
        }
        return updated;
      });
  };

  const addSlide = () => {
    setLessonCatalog((prev: any) => {
        const updated = { ...prev };
        const newSlides = [...updated[activeLessonId].slides];
        newSlides.push({
            slideNumber: newSlides.length + 1,
            title: "New Custom Slide Title",
            content: "<p>Write custom paragraphs here.</p>",
            imageUrl: ""
        });
        updated[activeLessonId] = {
            ...updated[activeLessonId],
            slides: newSlides
        };
        return updated;
    });
    setCurrentSlideIndex(activeLesson.slides.length);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsExtractingPdf(true);
      try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
          
          const numPages = pdf.numPages;
          const newUrls: string[] = [];
          
          for (let i = 1; i <= numPages; i++) {
              const page = await pdf.getPage(i);
              
              // Dynamically scale down to fit within ~800px max width/height
              let unscaledViewport = page.getViewport({ scale: 1.0 });
              let scale = 1.0;
              const maxDim = numPages > 10 ? 400 : 800; // Compress more if many pages
              if (unscaledViewport.width > maxDim || unscaledViewport.height > maxDim) {
                  scale = Math.min(maxDim / unscaledViewport.width, maxDim / unscaledViewport.height);
              }
              const viewport = page.getViewport({ scale });
              
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (!ctx) continue;
              
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              
              await page.render({
                  canvasContext: ctx,
                  viewport: viewport
              }).promise;
              
              // Use webp for better compression
              const dataUrl = canvas.toDataURL('image/webp', numPages > 10 ? 0.3 : 0.6);
              newUrls.push(dataUrl);
          }
          
          setLessonCatalog((prev: any) => {
              const updated = { ...prev };
              const newSlides = newUrls.map((url, i) => ({
                  slideNumber: updated[activeLessonId].slides.length + i + 1,
                  title: `Slide ${updated[activeLessonId].slides.length + i + 1}`,
                  content: '',
                  imageUrl: url
              }));
              updated[activeLessonId].slides = [...updated[activeLessonId].slides, ...newSlides];
              return updated;
          });
          
          setCurrentSlideIndex(activeLesson?.slides.length || 0);
          alert(`Successfully imported ${newUrls.length} slides from PDF!`);
          
          // Reset file input
          e.target.value = '';
      } catch (err: any) {
          console.error(err);
          alert('Failed to parse PDF: ' + (err.message || String(err)));
      } finally {
          setIsExtractingPdf(false);
      }
  };

  const runCode = () => {
      setShowCodeOutput(true);
      setCodeOutput("Output:\\nTraining step: 1\\nTraining step: 2\\nTraining step: 3\\nTraining step: 4\\nTraining step: 5\\n\\nExecution complete with status code: 0");
  };

  const evaluateQuiz = () => {
      if (selectedQuizAnswer === null) {
          alert("Please select an answer choice option first.");
          return;
      }
      if (selectedQuizAnswer === activeLesson.quiz[0].correctIndex) {
          alert("🎉 Correct Answer! +50 Stemios credited to student profile wallet.");
      } else {
          alert("❌ Incorrect choice. Hint: Review slide points and submit again.");
      }
  };

  const exportConfig = () => {
      const jsonText = JSON.stringify(activeLesson, null, 2);
      navigator.clipboard.writeText(jsonText).then(() => {
          alert("Manifest JSON copied cleanly!");
      }).catch(() => {
          alert("Clipboard access failed. Output:\n\n" + jsonText);
      });
  };

  const publishLesson = async () => {
      if (!activeLesson) return;
      setIsPublishing(true);
      try {
          const docData = {
              lessonTitle: activeLesson.lessonTitle || 'Untitled Lesson',
              media: activeLesson.media || {},
              slides: activeLesson.slides || [],
              quiz: activeLesson.quiz || [],
              authorId: user.id
          };
          
          // Estimate size by stringifying
          const estimatedSize = JSON.stringify(docData).length;
          if (estimatedSize > 900000) {
              // Instead of hard-failing, we could attempt to warn them, but for now we'll just throw
              // However, with our new webp compression, this is much less likely to happen.
              throw new Error("Lesson is too large to publish (over 1MB). Please use a smaller PDF or fewer slides.");
          }

          const newDocRef = doc(collection(db, 'lessons'));
          await setDoc(newDocRef, {
              ...docData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
          });
          alert("✅ Lesson successfully published to the Arcade!");
      } catch (err: any) {
          console.error("Failed to publish lesson:", err);
          alert("Failed to publish lesson: " + (err.message || String(err)));
      } finally {
          setIsPublishing(false);
      }
  };

  return (
    <div className="flex-1 bg-[#090d16] text-gray-100 flex flex-col overflow-hidden">
        {/* HUD Navigation */}
        <header className="h-16 bg-gray-900/95 border-b border-[#1f2937] flex justify-between items-center px-6 sticky top-0 z-50 backdrop-blur-md">
            <div className="flex items-center gap-3">
                {onBack && (
                    <button 
                        onClick={onBack}
                        className="mr-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
                        title="Exit Builder"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div className="p-2 bg-gradient-to-tr from-[#6366F1] to-[#06B6D4] rounded-lg text-white">
                    <GraduationCap size={20} />
                </div>
                <div>
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#06B6D4]">Stemio Creator Studio</span>
                    <span className="text-xs text-gray-400 block -mt-1">Interactive Lesson Builder & Presenter</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/40 rounded-full px-4 py-1.5 flex items-center gap-2 text-[#F59E0B] text-xs font-semibold">
                    <Coins size={14} />
                    <span>{user.stemios} Stemios Awarded</span>
                </div>
                <div className="bg-[#6366F1]/10 border border-[#6366F1]/40 rounded-full px-4 py-1.5 flex items-center gap-2 text-[#6366F1] text-xs font-semibold">
                    <Flame size={14} />
                    <span>{user.streak} Days Active 🔥</span>
                </div>
                <button onClick={() => setViewMode(viewMode === 'admin' ? 'preview' : 'admin')} className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-full border border-[#1f2937] flex items-center gap-2 transition">
                    <Wand2 size={14} className="text-[#06B6D4]" />
                    <span>Toggle Admin / Preview</span>
                </button>
            </div>
        </header>

        <div className="flex-grow flex h-[calc(100vh-4rem)] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[300px] border-r border-[#1f2937] bg-gray-950/95 flex flex-col justify-between p-4 overflow-y-auto">
                <div className="space-y-6">
                    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 text-center relative overflow-hidden">
                        <span className="text-[10px] text-[#6366F1] tracking-widest font-bold uppercase block mb-1">Level 1 Path</span>
                        <h3 className="text-base font-bold text-white mb-2">Foundations of AI</h3>
                        <div className="w-20 h-1 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] mx-auto rounded"></div>
                    </div>

                    <div className="space-y-4 relative pl-8 py-2">
                        <div className="absolute left-12 top-0 bottom-0 w-1 bg-[#1f2937] -z-10"></div>
                        
                        <div className="flex items-center gap-4 group cursor-pointer relative" onClick={() => handleLessonChange('what-is-ai')}>
                            <div className="w-10 h-10 rounded-full border-2 border-[#00AD7C] bg-[#00AD7C]/10 text-[#00AD7C] flex items-center justify-center font-bold relative z-10 transition group-hover:scale-105">
                                <CircleCheck size={16} />
                            </div>
                            <div>
                                <span className="text-xs text-[#00AD7C] font-semibold block">Completed</span>
                                <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition">What is AI?</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group cursor-pointer relative" onClick={() => handleLessonChange('history-of-ai')}>
                            <div className="w-10 h-10 rounded-full border-2 border-[#6366F1] bg-[#6366F1] text-white flex items-center justify-center font-bold relative z-10 transition group-hover:scale-105 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                                2
                            </div>
                            <div>
                                <span className="text-xs text-[#6366F1] font-semibold block">Active</span>
                                <p className="text-sm font-bold text-white group-hover:text-[#06B6D4] transition">The History of AI</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group cursor-pointer relative" onClick={() => handleLessonChange('narrow-vs-general')}>
                            <div className="w-10 h-10 rounded-full border-2 border-[#1f2937] bg-gray-900 text-gray-500 flex items-center justify-center font-semibold relative z-10 transition group-hover:scale-105">
                                3
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 font-semibold block">Locked</span>
                                <p className="text-sm font-semibold text-gray-400 group-hover:text-gray-300 transition">Narrow vs General AI</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group cursor-pointer relative" onClick={() => handleLessonChange('python-basics')}>
                            <div className="w-10 h-10 rounded-full border-2 border-[#1f2937] bg-gray-900 text-gray-500 flex items-center justify-center font-semibold relative z-10 transition group-hover:scale-105">
                                P
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 font-semibold block">Coding</span>
                                <p className="text-sm font-semibold text-gray-400 group-hover:text-gray-300 transition">Introduction to Python</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#1f2937] pt-4 mt-4 space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <CloudDownload size={14} className="text-[#06B6D4]" />
                        <span>AI Studio Integration</span>
                    </h4>
                    
                    <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase">Manual Fallback String Paste</label>
                        <textarea 
                            value={jsonPaste} 
                            onChange={(e) => setJsonPaste(e.target.value)} 
                            placeholder="Paste manual JSON here..." 
                            className="w-full h-16 bg-gray-900 border border-[#1f2937] rounded-lg text-xs font-mono p-2 text-gray-300 focus:outline-none focus:border-[#06B6D4]"
                        ></textarea>
                        <button onClick={handleImport} className="w-full py-1.5 bg-gradient-to-r from-[#06B6D4] to-[#6366F1] hover:opacity-90 text-white font-bold text-xs rounded-lg transition">
                            Parse Text Payload
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Stage */}
            <main className="flex-grow flex flex-col lg:flex-row overflow-hidden bg-gray-950/40">
                <div className="flex-grow flex flex-col p-6 overflow-y-auto space-y-6">
                    <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-xl min-h-[480px] max-h-[85vh] flex flex-col relative overflow-hidden shrink-0">
                        <div className="p-8 space-y-6 overflow-y-auto flex-grow custom-scrollbar">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="bg-[#6366F1]/10 text-[#6366F1] text-xs font-bold px-3 py-1 rounded-full uppercase">
                                        Slide {currentSlideIndex + 1} of {activeLesson?.slides.length}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{activeLesson?.lessonTitle}</span>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-gray-800">{activeSlide?.title}</h2>
                                
                                {activeSlide?.imageUrl ? (
                                    <img src={activeSlide.imageUrl} alt="Slide Media" className="w-full max-h-[50vh] object-contain rounded-xl border border-gray-200 bg-gray-50 shadow-sm" />
                                ) : (
                                    <div className="w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 flex-col gap-2">
                                        <span className="font-semibold text-sm">No PowerPoint Slide Image Provided</span>
                                        <span className="text-xs">Add an image URL in the design panel</span>
                                    </div>
                                )}
                                
                                {activeSlide?.content && activeSlide.content !== '<p>Write custom paragraphs here.</p>' && (
                                    <div className="text-base text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100" dangerouslySetInnerHTML={{ __html: activeSlide?.content || '' }} />
                                )}
                            </div>

                            {!activeSlide?.imageUrl && currentSlideIndex === 0 && activeLesson?.media?.videoUrl && (
                                <div className="aspect-video w-full mt-4 rounded-xl overflow-hidden shadow-md">
                                    <iframe className="w-full h-full" src={activeLesson.media.videoUrl} allowFullScreen></iframe>
                                </div>
                            )}

                            {activeSlide?.isCodeSlide && (
                                <div className="border border-gray-200 rounded-xl overflow-hidden bg-slate-50 font-mono mt-6 text-sm">
                                    <div className="bg-slate-200 px-4 py-2 flex justify-between items-center border-b border-gray-200">
                                        <span className="text-xs text-gray-500 font-semibold flex items-center gap-2">
                                            Python REPL Runner
                                        </span>
                                        <button onClick={runCode} className="px-3 py-1 bg-[#00AD7C] hover:bg-[#00AD7C]/90 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition">
                                            <Play size={12} /> Run Code
                                        </button>
                                    </div>
                                    <pre className="p-4 text-gray-800 overflow-x-auto"><code>{activeSlide?.codeSource}</code></pre>
                                    {showCodeOutput && (
                                        <div className="bg-gray-900 text-[#06B6D4] p-3 text-xs border-t border-gray-200 font-mono" dangerouslySetInnerHTML={{ __html: codeOutput.replace(/\n/g, '<br/>') }} />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-100 p-6 bg-gray-50 shrink-0">
                            <button 
                                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                                disabled={currentSlideIndex === 0}
                                className="px-6 py-2.5 bg-[#00AD7C] hover:bg-[#00AD7C]/90 text-white font-bold rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                            >
                                <ArrowLeft size={16} /> Previous
                            </button>
                            <div className="flex gap-1.5">
                                {activeLesson?.slides.map((_: any, idx: number) => (
                                    <div key={idx} className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlideIndex ? 'bg-[#6366F1] w-5' : 'bg-gray-200'}`}></div>
                                ))}
                            </div>
                            <button 
                                onClick={() => setCurrentSlideIndex(Math.min((activeLesson?.slides.length || 1) - 1, currentSlideIndex + 1))}
                                disabled={currentSlideIndex === (activeLesson?.slides.length || 1) - 1}
                                className="px-6 py-2.5 bg-[#00AD7C] hover:bg-[#00AD7C]/90 text-white font-bold rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                            >
                                Next <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="p-1.5 bg-[#6366F1]/20 text-[#6366F1] rounded-lg text-sm">
                                <HelpCircle size={16} />
                            </span>
                            <h3 className="text-lg font-bold text-white">Lesson Checkpoint Quiz</h3>
                        </div>
                        {activeLesson?.quiz && activeLesson.quiz.length > 0 ? (
                            <div className="space-y-4">
                                <p className="text-sm font-semibold text-gray-300">{activeLesson.quiz[0].question}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    {activeLesson.quiz[0].options.map((opt: string, idx: number) => (
                                        <label key={idx} className="flex items-center gap-3 bg-gray-900 border border-[#1f2937] hover:border-[#6366F1] p-3.5 rounded-xl cursor-pointer transition text-sm">
                                            <input 
                                                type="radio" 
                                                name="lesson-quiz" 
                                                value={idx} 
                                                checked={selectedQuizAnswer === idx}
                                                onChange={() => setSelectedQuizAnswer(idx)}
                                                className="accent-[#6366F1] w-4 h-4" 
                                            />
                                            <span className="text-gray-200">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                                <button onClick={evaluateQuiz} className="w-full py-2 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-bold text-xs rounded-xl mt-4 transition">Submit Answer Verification</button>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 italic">No checkpoint quiz included in this elective module yet.</p>
                        )}
                    </div>
                </div>

                {/* Right Workspace: Config Editor */}
                {viewMode === 'admin' && (
                    <div className="w-full lg:w-[480px] border-l border-[#1f2937] bg-gray-950/80 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-[#1f2937] pb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Sliders size={18} className="text-[#6366F1]" />
                                        <span>Design Panel</span>
                                    </h3>
                                    <span className="text-xs text-gray-400">Configure active lesson manifests</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Lesson Title</label>
                                    <input 
                                        type="text" 
                                        value={activeLesson?.lessonTitle || ''} 
                                        onChange={(e) => handleUpdateLessonMeta('lessonTitle', e.target.value)}
                                        className="w-full bg-gray-900 border border-[#1f2937] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#06B6D4]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Media Source Embed (YouTube Video)</label>
                                    <input 
                                        type="text" 
                                        value={activeLesson?.media?.videoUrl || ''} 
                                        onChange={(e) => handleUpdateLessonMeta('videoUrl', e.target.value)}
                                        placeholder="https://www.youtube.com/embed/..." 
                                        className="w-full bg-gray-900 border border-[#1f2937] rounded-lg p-3 text-sm font-mono text-gray-300 focus:outline-none focus:border-[#06B6D4]" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-[#1f2937] pt-6">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Slide Configuration</h4>
                                    <button onClick={addSlide} className="text-xs font-bold text-[#06B6D4] hover:text-[#06B6D4]/80 flex items-center gap-1">
                                        <PlusCircle size={14} /> Add Slide
                                    </button>
                                </div>
                                
                                <div className="space-y-3 bg-[#111827] border border-[#1f2937] p-4 rounded-xl">
                                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#1f2937]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Slide {currentSlideIndex + 1} of {activeLesson?.slides.length}</span>
                                        <button 
                                            onClick={() => {
                                                const currentSlidesCount = activeLesson?.slides.length || 0;
                                                const expectedNewLength = currentSlidesCount <= 1 ? 1 : currentSlidesCount - 1;
                                                let newIndex = currentSlideIndex >= expectedNewLength ? Math.max(0, expectedNewLength - 1) : currentSlideIndex;
                                                
                                                setLessonCatalog((prev: any) => {
                                                    const updated = { ...prev };
                                                    const newSlides = [...updated[activeLessonId].slides];
                                                    newSlides.splice(currentSlideIndex, 1);
                                                    
                                                    // Re-index slide numbers
                                                    newSlides.forEach((slide, idx) => {
                                                        slide.slideNumber = idx + 1;
                                                    });

                                                    if (newSlides.length === 0) {
                                                        newSlides.push({ slideNumber: 1, title: 'New Slide', content: '', imageUrl: '' });
                                                    }
                                                    
                                                    updated[activeLessonId] = {
                                                        ...updated[activeLessonId],
                                                        slides: newSlides
                                                    };
                                                    
                                                    return updated;
                                                });
                                                setCurrentSlideIndex(newIndex);
                                            }}
                                            className="text-xs text-red-400 hover:text-red-300 transition"
                                        >
                                            Delete Slide
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Slide Title</label>
                                        <input 
                                            type="text" 
                                            value={activeSlide?.title || ''} 
                                            onChange={(e) => handleUpdateSlide('title', e.target.value)}
                                            className="w-full bg-gray-900 border border-[#1f2937] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#06B6D4]" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">PowerPoint Slide Image Link</label>
                                        <input 
                                            type="text" 
                                            value={activeSlide?.imageUrl || ''} 
                                            onChange={(e) => handleUpdateSlide('imageUrl', e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-gray-900 border border-[#1f2937] rounded-lg p-2.5 text-xs text-gray-300 focus:outline-none focus:border-[#06B6D4]" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Presenter Notes (Optional)</label>
                                        <textarea 
                                            value={activeSlide?.content || ''} 
                                            onChange={(e) => handleUpdateSlide('content', e.target.value)}
                                            className="w-full h-20 bg-gray-900 border border-[#1f2937] rounded-lg p-2.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-[#06B6D4]"
                                        ></textarea>
                                    </div>
                                </div>
                                
                                <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-xl mt-4">
                                    <label className="block text-xs font-semibold text-[#06B6D4] uppercase mb-1">Bulk PowerPoint Import</label>
                                    <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">Select a PDF file from your computer to automatically generate slides, or paste image URLs below.</p>
                                    
                                    <div className="mb-4 p-3 bg-gray-900 border border-[#1f2937] rounded-lg">
                                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Upload PDF File</label>
                                        {isExtractingPdf ? (
                                            <div className="text-xs text-[#06B6D4] flex items-center gap-2 py-1">
                                                <div className="w-4 h-4 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin"></div>
                                                Extracting slides from PDF, please wait...
                                            </div>
                                        ) : (
                                            <input 
                                                type="file" 
                                                accept=".pdf"
                                                onChange={handlePdfUpload}
                                                className="w-full text-xs text-gray-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#06B6D4] file:text-white hover:file:bg-[#06B6D4]/90 cursor-pointer"
                                            />
                                        )}
                                    </div>

                                    <textarea
                                        id="bulk-import-urls"
                                        placeholder="https://image1.png&#10;https://image2.png"
                                        className="w-full h-24 bg-gray-900 border border-[#1f2937] rounded-lg p-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-[#06B6D4] whitespace-pre"
                                    ></textarea>
                                    <button 
                                        onClick={() => {
                                            const textarea = document.getElementById('bulk-import-urls') as HTMLTextAreaElement;
                                            const urls = textarea.value.split('\n').map(u => u.trim()).filter(Boolean);
                                            if (urls.length > 0) {
                                                setLessonCatalog((prev: any) => {
                                                    const updated = { ...prev };
                                                    const newSlides = urls.map((url, i) => ({
                                                        slideNumber: updated[activeLessonId].slides.length + i + 1,
                                                        title: `Slide ${updated[activeLessonId].slides.length + i + 1}`,
                                                        content: '',
                                                        imageUrl: url
                                                    }));
                                                    updated[activeLessonId].slides = [...updated[activeLessonId].slides, ...newSlides];
                                                    return updated;
                                                });
                                                textarea.value = '';
                                                alert(`Successfully generated ${urls.length} slides!`);
                                            }
                                        }}
                                        className="w-full mt-2 py-2 bg-[#1f2937] hover:bg-[#374151] text-white font-bold text-xs rounded-lg transition border border-[#374151]"
                                    >
                                        Generate Slides from URLs
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-[#1f2937] pt-6">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lesson Checkpoint Quiz Setup</h4>
                                <div className="space-y-3 bg-[#111827] border border-[#1f2937] p-4 rounded-xl">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Active Question</label>
                                        <input 
                                            type="text" 
                                            value={activeLesson?.quiz?.[0]?.question || ''}
                                            onChange={(e) => handleUpdateQuiz('question', e.target.value)}
                                            className="w-full bg-gray-900 border border-[#1f2937] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#06B6D4]" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[0, 1, 2, 3].map(i => (
                                            <input 
                                                key={i}
                                                type="text" 
                                                value={activeLesson?.quiz?.[0]?.options?.[i] || ''}
                                                onChange={(e) => handleUpdateQuiz('options', e.target.value, i)}
                                                placeholder={`Option ${String.fromCharCode(65 + i)}`} 
                                                className="bg-gray-900 border border-[#1f2937] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]" 
                                            />
                                        ))}
                                    </div>
                                    <div>
                                        <select 
                                            value={activeLesson?.quiz?.[0]?.correctIndex ?? 0}
                                            onChange={(e) => handleUpdateQuiz('correctIndex', e.target.value)}
                                            className="w-full bg-gray-900 border border-[#1f2937] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                                        >
                                            <option value="0">Option A</option>
                                            <option value="1">Option B</option>
                                            <option value="2">Option C</option>
                                            <option value="3">Option D</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[#1f2937] pt-4 mt-6 space-y-3">
                            <button 
                                onClick={publishLesson} 
                                disabled={isPublishing}
                                className="w-full py-3 bg-[var(--amber)] hover:bg-[#92400e] text-white font-bold text-sm rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <CloudUpload size={16} />
                                <span>{isPublishing ? 'Publishing...' : 'Publish to Arcade'}</span>
                            </button>
                            <button onClick={exportConfig} className="w-full py-3 bg-[#00AD7C] hover:bg-[#00AD7C]/90 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2">
                                <Copy size={16} />
                                <span>Copy Edited JSON Config</span>
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
}
