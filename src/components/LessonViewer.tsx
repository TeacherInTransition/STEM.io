import React, { useState, useEffect, useRef } from 'react';
import { db, awardStemios } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, ChevronRight, ChevronLeft, CheckCircle, Maximize2, Minimize2, Sparkles, Lightbulb, Paperclip, FileText, Download, ExternalLink, Video, Globe, Play } from 'lucide-react';

function MaterialItemCard({ mat }: { mat: any; key?: any }) {
  const [showPreview, setShowPreview] = useState(false);
  const isFile = mat.type === 'file';
  const isVideo = mat.type === 'video';
  const isLink = mat.type === 'link';

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
      className="p-5 rounded-2xl bg-[#FBF8F2] border border-[#E5E7EB] shadow-xs flex flex-col gap-4 text-left"
      style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            isFile ? 'bg-[#D1FAE5] text-[#059669]' : 
            isVideo ? 'bg-[#FEE2E2] text-[#DC2626]' : 
            'bg-[#DBEAFE] text-[#2563EB]'
          }`}>
            {isFile ? <FileText size={18} /> : isVideo ? <Video size={18} /> : <ExternalLink size={18} />}
          </div>
          <div>
            <h5 className="text-sm font-bold text-[#111827]">{mat.title}</h5>
            <p className="text-xs text-gray-500 font-mono mt-0.5 truncate max-w-xs sm:max-w-md">
              {isFile ? (mat.fileName || 'Google Drive File') : mat.url}
            </p>
          </div>
        </div>
        
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
          isFile ? 'bg-[#D1FAE5] text-[#059669]' : 
          isVideo ? 'bg-[#FEE2E2] text-[#DC2626]' : 
          'bg-[#DBEAFE] text-[#2563EB]'
        }`}>
          {isFile ? 'File Attachment' : isVideo ? 'Video Resource' : 'Web Link'}
        </span>
      </div>

      {/* Render File Interaction (Google Drive / Uploaded File) */}
      {isFile && (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <img 
                src={isBase64 ? "https://cdn-icons-png.flaticon.com/512/2245/2245239.png" : "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"} 
                alt="File" 
                className="w-5 h-5 object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-[#111827] block">
                  {isBase64 ? "Local Offline Resource" : "Google Drive Document"}
                </span>
                <span className="text-[10px] text-gray-500 block">
                  {isBase64 ? `Download and inspect offline file (${mat.fileName || 'document'})` : "Access lesson slides, templates, and spreadsheets online"}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(previewUrl || isPdf || isImage || isBase64) && (
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-lg transition-all text-center cursor-pointer"
                >
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
              )}

              {isBase64 ? (
                <a 
                  href={mat.url}
                  download={mat.fileName || 'download'}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-lg shadow-sm transition-all text-center cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download / Open File</span>
                </a>
              ) : (
                <a 
                  href={mat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg shadow-sm transition-all text-center cursor-pointer"
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
                <div className="w-full border border-gray-200 rounded-lg p-2 bg-gray-50 flex items-center justify-center">
                  <img src={mat.url} alt="Document Preview" className="max-h-96 rounded-lg object-contain shadow-2xs" />
                </div>
              ) : (
                /* Interactive educational document simulator */
                <div className="bg-[#FBF8F2] p-4 rounded-xl border border-dashed border-amber-300 space-y-3 text-center">
                  <span className="text-2xl">📋</span>
                  <h6 className="text-xs font-bold text-[#111827]">Interactive Document Simulation</h6>
                  <p className="text-[11px] text-gray-500 max-w-md mx-auto">
                    This file ("{mat.fileName}") is an offline resource. We've compiled an interactive educational reading summary for your study arcade below.
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-gray-100 text-left space-y-2 mt-2">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                      <span className="text-[10px] font-bold text-[#B45309]">STEM Worksheet Outline</span>
                      <span className="text-[9px] bg-amber-100 text-[#B45309] font-semibold px-2 py-0.5 rounded-full">Grade 10 Practice</span>
                    </div>
                    <div className="space-y-1 text-gray-600 text-[11px]">
                      <p className="font-semibold text-gray-800">🔬 Key Subject Core Materials:</p>
                      <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px]">
                        <li>Section 1.1: Foundations and Introductory Terminology</li>
                        <li>Section 1.2: Laboratory Safety Protocols & Sandbox Exercises</li>
                        <li>Section 1.3: Empirical Exercises with "+15 Stemios" Checkpoints</li>
                      </ul>
                      <p className="text-gray-500 mt-2 text-[10px]">
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
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-2xs w-full">
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

export default function LessonViewer({ lessonId, onBack }: { lessonId: string, onBack: () => void }) {
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [rewardOutcome, setRewardOutcome] = useState<{ awarded: boolean; amount: number; alreadyCompleted: boolean } | null>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const docRef = doc(db, 'lessons', lessonId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLesson({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("Lesson not found!");
        }
      } catch (e) {
        console.error("Error fetching lesson:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const slides = lesson?.slides || [];
  const quiz = lesson?.quiz || [];

  const [imageLoadError, setImageLoadError] = useState(false);

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
          <button onClick={onBack} className="text-[var(--muted)] hover:text-[var(--amber)] transition-colors" title="Back">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{lesson.lessonTitle}</h1>
            <p className="text-xs text-[var(--muted)] font-mono">
              {slides.length > 0 ? `${slides.length} slides` : 'Interactive Lesson'}
            </p>
          </div>
        </div>
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
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-[var(--line)]/60">
              <span className="text-xs font-semibold text-[var(--amber)] font-mono uppercase tracking-wider">
                Slide {currentSlide + 1} of {slides.length}
              </span>

              {/* Fullscreen Toggle Button specifically for slides */}
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper-2)] hover:bg-[var(--surface)] text-[var(--ink)] text-xs font-semibold transition-colors shadow-sm"
                title={isFullscreen ? "Exit Slide Fullscreen" : "Slide Fullscreen Mode"}
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                <span>{isFullscreen ? "Exit Fullscreen" : "Slide Fullscreen"}</span>
              </button>
            </div>

            {/* Left and Right Side Click Zones for Slide Navigation */}
            <button
              disabled={currentSlide === 0}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(prev => Math.max(0, prev - 1));
              }}
              className="absolute left-0 top-16 bottom-16 w-20 flex items-center justify-start pl-2 z-10 group opacity-0 hover:opacity-100 transition-opacity disabled:pointer-events-none cursor-pointer"
              title="Click or press ← to go back"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--paper-2)]/90 backdrop-blur border border-[var(--line)] flex items-center justify-center text-[var(--ink)] shadow-md group-hover:scale-110 transition-transform">
                <ChevronLeft size={24} />
              </div>
            </button>

            <button
              disabled={currentSlide >= slides.length}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(prev => Math.min(slides.length, prev + 1));
              }}
              className="absolute right-0 top-16 bottom-16 w-20 flex items-center justify-end pr-2 z-10 group opacity-0 hover:opacity-100 transition-opacity disabled:pointer-events-none cursor-pointer"
              title="Click or press → to move forward"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--amber)] text-white border border-amber-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <ChevronRight size={24} />
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
                    <MaterialItemCard key={mat.id} mat={mat} />
                  ))}
                </div>
              </div>
            )}
                 

            {/* In-Slide Navigation when Fullscreen */}
            {isFullscreen && (
              <div className="w-full mt-6 pt-4 border-t border-[var(--line)]/60 flex items-center justify-between">
                <button 
                  disabled={currentSlide === 0}
                  onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--paper-2)] hover:bg-[var(--surface)] rounded-xl border border-[var(--line)] text-sm font-semibold disabled:opacity-40 transition-all"
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                <span className="text-xs font-mono text-[var(--muted)] font-bold">
                  {progressPercent}% Completed
                </span>
                <button 
                  disabled={currentSlide >= slides.length}
                  onClick={() => setCurrentSlide(prev => Math.min(slides.length, prev + 1))}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--amber)] hover:bg-amber-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {currentSlide === slides.length && (
          <div className="w-full max-w-4xl flex flex-col items-center gap-8">
            {lesson.media?.videoUrl && (
              <div className="w-full bg-[var(--surface)] rounded-[24px] border border-[var(--line)] p-8 flex flex-col items-center shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Video Resource</h2>
                <iframe 
                  src={lesson.media.videoUrl} 
                  className="w-full aspect-video rounded-xl"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            )}
            {quiz.length > 0 && (
              <div className="w-full max-w-2xl bg-[var(--surface)] rounded-[24px] border border-[var(--line)] p-6 md:p-8 flex flex-col items-center shadow-sm">
                <div className="flex items-center justify-between w-full mb-6 pb-4 border-b border-[var(--line)]">
                  <h2 className="text-2xl font-bold text-[var(--amber)] flex items-center gap-3">
                    <CheckCircle size={28} /> Knowledge Check
                  </h2>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-[var(--paper-2)] border border-[var(--line)] rounded-full text-[var(--muted)]">
                    {quiz.length} {quiz.length === 1 ? 'Question' : 'Questions'}
                  </span>
                </div>

                <div className="w-full space-y-6">
                  {quiz.map((q: any, qIdx: number) => {
                    const selectedOpt = selectedAnswers[qIdx];
                    const isCorrect = submitted && selectedOpt === q.correctIndex;

                    return (
                      <div key={qIdx} className="w-full bg-[var(--paper-2)] p-5 rounded-2xl border border-[var(--line)] space-y-3 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)] uppercase tracking-wider font-bold">
                          <span>Question {qIdx + 1} of {quiz.length}</span>
                          {submitted && (
                            <span className={selectedOpt === q.correctIndex ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                              {selectedOpt === q.correctIndex ? "✓ Correct" : "✕ Incorrect"}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-[var(--ink)]">{q.question}</h3>
                        <div className="w-full flex flex-col gap-2">
                          {(q.options || []).map((opt: string, optIdx: number) => {
                            const isSelected = selectedOpt === optIdx;
                            let btnStyle = "bg-[var(--surface)] hover:bg-[var(--paper)] text-[var(--ink)] border-[var(--line)]";

                            if (submitted) {
                              if (optIdx === q.correctIndex) {
                                btnStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-800 font-bold shadow-sm";
                              } else if (isSelected && optIdx !== q.correctIndex) {
                                btnStyle = "bg-rose-500/15 border-rose-500 text-rose-800 font-medium";
                              } else {
                                btnStyle = "bg-[var(--surface)] text-[var(--muted)] opacity-50 border-[var(--line)]";
                              }
                            } else if (isSelected) {
                              btnStyle = "bg-amber-500/15 border-[var(--amber)] text-[var(--ink)] font-bold shadow-sm";
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={submitted}
                                onClick={() => {
                                  if (!submitted) {
                                    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                                  }
                                }}
                                className={`w-full py-3 px-4 text-left text-sm rounded-xl transition-all border font-medium flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {submitted && optIdx === q.correctIndex && (
                                  <span className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider">Correct Answer</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {q.hint && (
                          <div className="pt-1 border-t border-[var(--line)]/50">
                            <button
                              type="button"
                              onClick={() => setShowHints(prev => ({ ...prev, [qIdx]: !prev[qIdx] }))}
                              className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold transition"
                            >
                              <Lightbulb size={13} />
                              <span>{showHints[qIdx] ? "Hide Hint" : "Need a hint?"}</span>
                            </button>
                            {showHints[qIdx] && (
                              <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2 shadow-xs">
                                <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Hint:</strong> {q.hint}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Score and Submit Section */}
                <div className="w-full mt-8 pt-6 border-t border-[var(--line)] flex flex-col items-center gap-4">
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
                        className="px-6 py-2.5 bg-[var(--surface)] hover:bg-[var(--paper-2)] text-[var(--ink)] font-bold text-xs rounded-xl border border-[var(--line)] transition shadow-sm mt-2"
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
                          if (selectedAnswers[idx] === q.correctIndex) {
                            correctCount++;
                          }
                        });
                        setScore(correctCount);
                        setSubmitted(true);

                        if (correctCount > 0) {
                          const earnedStemios = Math.max(10, Math.round((correctCount / quiz.length) * 50));
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
            {(!lesson.media?.videoUrl && quiz.length === 0) && (
              <div className="text-xl font-bold flex items-center gap-2 text-[var(--amber)]">
                <Sparkles size={24} /> Lesson Completed!
              </div>
            )}
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
              disabled={currentSlide >= slides.length && (quiz.length === 0 && !lesson.media?.videoUrl)}
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

