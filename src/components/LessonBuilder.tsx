import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Coins, Flame, Wand2, CircleCheck, Play, 
  CloudDownload, Sliders, PlusCircle, Copy, HelpCircle, 
  ArrowLeft, ArrowRight, CloudUpload, Trash2, CheckCircle2, Lightbulb,
  FileText, ExternalLink, Download, Folder, FolderOpen, ChevronRight,
  Search, X, Plus, BookOpen, Video, FileSpreadsheet, FileCode, Globe
} from 'lucide-react';
import { User } from '../types';
import { db, awardStemios, fetchResourcesFromDb, saveResourcesToDb } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const isDocumentUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('drive.google.com') ||
    lower.includes('docs.google.com') ||
    lower.includes('dropbox.com') ||
    lower.includes('onedrive.live.com') ||
    lower.includes('sheets') ||
    lower.includes('slides') ||
    lower.includes('presentation') ||
    lower.includes('document') ||
    lower.endsWith('.pdf') ||
    lower.endsWith('.doc') ||
    lower.endsWith('.docx') ||
    lower.endsWith('.xls') ||
    lower.endsWith('.xlsx') ||
    lower.endsWith('.ppt') ||
    lower.endsWith('.pptx') ||
    lower.endsWith('.txt') ||
    lower.endsWith('.csv') ||
    lower.endsWith('.zip')
  );
};

const isImageUrl = (url: string): boolean => {
  const lower = url.toLowerCase();
  return (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.svg') ||
    lower.startsWith('data:image/') ||
    lower.includes('images.unsplash.com') ||
    lower.includes('placeholder')
  );
};

const getDocumentTitleFromUrl = (url: string): string => {
  const lower = url.toLowerCase();
  if (lower.includes('spreadsheets') || lower.includes('excel') || lower.endsWith('.xls') || lower.endsWith('.xlsx') || lower.endsWith('.csv')) {
    return "Interactive Spreadsheet";
  }
  if (lower.includes('presentation') || lower.includes('slides') || lower.endsWith('.ppt') || lower.endsWith('.pptx')) {
    return "Lesson Presentation Slide";
  }
  if (lower.includes('docs.google.com/document') || lower.endsWith('.pdf') || lower.endsWith('.doc') || lower.endsWith('.docx') || lower.endsWith('.txt')) {
    return "Interactive Study Guide";
  }
  return "Interactive Learning Document";
};

const getDocumentFileNameFromUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const lastPart = pathname.substring(pathname.lastIndexOf('/') + 1);
    if (lastPart && lastPart.includes('.')) {
      return lastPart;
    }
  } catch (e) {}
  if (url.includes('drive.google.com')) return "Google Drive Document";
  if (url.includes('docs.google.com/document')) return "Google Docs Document";
  if (url.includes('docs.google.com/spreadsheets')) return "Google Sheets Spreadsheet";
  if (url.includes('docs.google.com/presentation')) return "Google Slides Presentation";
  return "Linked External File";
};

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
      className="p-5 rounded-2xl bg-[#FBF8F2] border border-[#E5E7EB] shadow-xs flex flex-col gap-4 text-left w-full"
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
            correctIndex: 1,
            hint: "Think about pattern recognition and adjusting outputs based on input data."
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
            correctIndex: 1,
            hint: "It is an Ivy League college located in Hanover, New Hampshire."
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
            correctIndex: 1,
            hint: "ANI performs specific specialized single-domain tasks like Spotify or Netflix recommendations."
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
            correctIndex: 0,
            hint: "Python uses 0-based indexing by default for sequences and range loops."
        }]
    }
  });

  const [jsonPaste, setJsonPaste] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [showCodeOutput, setShowCodeOutput] = useState(false);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [showPreviewHints, setShowPreviewHints] = useState<Record<number, boolean>>({});
  const [viewMode, setViewMode] = useState<'admin' | 'preview'>('admin');
  
  // Materials state for creating slide materials
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState<'link' | 'video' | 'file'>('link');
  const [matUrl, setMatUrl] = useState('');
  const [uploadingMatFile, setUploadingMatFile] = useState(false);
  const [matFileData, setMatFileData] = useState<string | null>(null);
  const [matFileName, setMatFileName] = useState<string | null>(null);

  // Main uploader and resources states
  const [activeSlideUploadMenuOpen, setActiveSlideUploadMenuOpen] = useState<number | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [slideUrlInput, setSlideUrlInput] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);

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
  const [showResourcesDirectory, setShowResourcesDirectory] = useState(false);
  const [resourcesList, setResourcesList] = useState<any[]>([]);
  const [resourceSearch, setResourceSearch] = useState('');
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceType, setNewResourceType] = useState<'Document' | 'Video' | 'Spreadsheet' | 'Cheat Sheet'>('Document');
  const [newResourceDesc, setNewResourceDesc] = useState('');

  useEffect(() => {
    const loadResources = async () => {
      try {
        const data = await fetchResourcesFromDb();
        setResourcesList(data);
      } catch (err) {
        console.error("Error loading resources:", err);
      }
    };
    loadResources();
  }, []);

  const handleAddResourceToExplorer = async () => {
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) {
      alert("Please provide at least a title and a URL link.");
      return;
    }
    const newItem = {
      id: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: newResourceTitle.trim(),
      url: newResourceUrl.trim(),
      type: newResourceType,
      description: newResourceDesc.trim() || "No description provided.",
      lessonId: activeLessonId,
      views: 0
    };

    const updatedList = [...resourcesList, newItem];
    setResourcesList(updatedList);
    
    try {
      await saveResourcesToDb(updatedList);
    } catch (e) {
      console.warn("Could not save to database directly:", e);
    }

    setNewResourceTitle('');
    setNewResourceUrl('');
    setNewResourceDesc('');
    alert("✓ Resource added to directory successfully!");
  };
  
  const activeLesson = lessonCatalog[activeLessonId];
  const activeSlide = activeLesson?.slides[currentSlideIndex];
  
  useEffect(() => {
    setImageLoadError(false);
  }, [currentSlideIndex, activeSlide?.imageUrl]);
  
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
    setSelectedQuizAnswers({});
    setShowPreviewHints({});
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

  const handleUpdateSlide = (field: string, value: any) => {
    setLessonCatalog((prev: any) => {
        const updated = { ...prev };
        updated[activeLessonId].slides[currentSlideIndex][field] = value;
        return updated;
    });
  };

  const handleMaterialFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMatFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setMatFileData(event.target?.result as string);
      setMatFileName(file.name);
      setUploadingMatFile(false);
    };
    reader.onerror = () => {
      alert("Error reading file");
      setUploadingMatFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMaterial = () => {
    if (!matTitle.trim()) {
      alert("Please enter a title for the material.");
      return;
    }
    if (matType === 'link' && !matUrl.trim()) {
      alert("Please enter a URL link.");
      return;
    }
    if (matType === 'video' && !matUrl.trim()) {
      alert("Please enter a Video URL link.");
      return;
    }
    if (matType === 'file' && !matUrl.trim() && (!matFileData || !matFileName)) {
      alert("Please enter a Google Drive link or upload a file first.");
      return;
    }

    let finalUrl = matUrl.trim();
    if (matType === 'file' && !finalUrl) {
      // Generate a realistic mock Google Drive share link based on file name
      const safeName = encodeURIComponent(matFileName || 'document.pdf');
      finalUrl = `https://drive.google.com/file/d/1_mock_drive_${Date.now()}/view?usp=sharing&name=${safeName}`;
    }

    const newMaterial = {
      id: `mat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: matTitle.trim(),
      type: matType,
      url: matFileData || finalUrl,
      fileName: matType === 'file' ? (matFileName || 'Google Drive File') : '',
      fileData: matType === 'file' ? matFileData : ''
    };

    const currentMaterials = activeSlide?.materials || [];
    handleUpdateSlide('materials', [...currentMaterials, newMaterial]);

    // Reset form state
    setMatTitle('');
    setMatUrl('');
    setMatFileData(null);
    setMatFileName(null);
    const fileInput = document.getElementById('material-file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const addQuizQuestion = () => {
    setLessonCatalog((prev: any) => {
      const updated = { ...prev };
      const currentQuiz = updated[activeLessonId].quiz || [];
      updated[activeLessonId].quiz = [
        ...currentQuiz,
        {
          question: `Question ${currentQuiz.length + 1}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: 0,
          hint: ''
        }
      ];
      return updated;
    });
  };

  const deleteQuizQuestion = (qIdx: number) => {
    setLessonCatalog((prev: any) => {
      const updated = { ...prev };
      const currentQuiz = [...(updated[activeLessonId].quiz || [])];
      currentQuiz.splice(qIdx, 1);
      updated[activeLessonId].quiz = currentQuiz;
      return updated;
    });
  };

  const duplicateQuizQuestion = (qIdx: number) => {
    setLessonCatalog((prev: any) => {
      const updated = { ...prev };
      const currentQuiz = [...(updated[activeLessonId].quiz || [])];
      if (currentQuiz[qIdx]) {
        const copy = JSON.parse(JSON.stringify(currentQuiz[qIdx]));
        copy.question = `${copy.question || 'Question'} (Copy)`;
        currentQuiz.splice(qIdx + 1, 0, copy);
      }
      updated[activeLessonId].quiz = currentQuiz;
      return updated;
    });
  };

  const updateQuizQuestion = (qIdx: number, field: string, value: any, optIdx?: number) => {
    setLessonCatalog((prev: any) => {
      const updated = { ...prev };
      const currentQuiz = [...(updated[activeLessonId].quiz || [])];
      if (!currentQuiz[qIdx]) return updated;

      if (field === 'question') {
        currentQuiz[qIdx] = { ...currentQuiz[qIdx], question: value };
      } else if (field === 'hint') {
        currentQuiz[qIdx] = { ...currentQuiz[qIdx], hint: value };
      } else if (field === 'correctIndex') {
        currentQuiz[qIdx] = { ...currentQuiz[qIdx], correctIndex: parseInt(value, 10) };
      } else if (field === 'option' && optIdx !== undefined) {
        const newOpts = [...(currentQuiz[qIdx].options || ['', '', '', ''])];
        newOpts[optIdx] = value;
        currentQuiz[qIdx] = { ...currentQuiz[qIdx], options: newOpts };
      }

      updated[activeLessonId].quiz = currentQuiz;
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

  const evaluateQuiz = async () => {
      const quizList = activeLesson?.quiz || [];
      if (quizList.length === 0) {
          alert("No quiz questions available to evaluate.");
          return;
      }

      let correctCount = 0;
      quizList.forEach((q: any, idx: number) => {
          if (selectedQuizAnswers[idx] === q.correctIndex) {
              correctCount++;
          }
      });

      const total = quizList.length;
      if (Object.keys(selectedQuizAnswers).length < total) {
          alert(`Please answer all ${total} question(s) before submitting verification.`);
          return;
      }

      if (correctCount > 0) {
          const earnedStemios = Math.max(10, Math.round((correctCount / total) * 50));
          const rewardRes = await awardStemios(user?.id, activeLessonId, earnedStemios);
          if (rewardRes.awarded) {
              if (correctCount === total) {
                  alert(`🎉 Perfect Score! All ${correctCount}/${total} questions correct! +${rewardRes.amount} Stemios credited to account balance.`);
              } else {
                  alert(`You scored ${correctCount}/${total} correct. +${rewardRes.amount} Stemios credited to account balance!`);
              }
          } else if (rewardRes.alreadyCompleted) {
              alert(`You scored ${correctCount}/${total} correct. (Note: Stemios are awarded only once per quiz, so no additional Stemios were added).`);
          }
      } else {
          alert(`You scored 0/${total}. Review questions and try again!`);
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
    <div className="flex-1 bg-[var(--paper)] text-[var(--ink)] flex flex-col overflow-hidden">
        {/* HUD Navigation */}
        <header className="h-16 bg-[var(--surface)] border-b border-[var(--line)] flex justify-between items-center px-6 sticky top-0 z-50 backdrop-blur-md">
            <div className="flex items-center gap-3">
                {onBack && (
                    <button 
                        onClick={onBack}
                        className="mr-2 p-2 bg-[var(--paper-2)] hover:bg-[var(--line)] rounded-lg text-[var(--ink)] transition-colors"
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
                    <span className="text-xs text-[var(--muted)] block -mt-1">Interactive Lesson Builder & Presenter</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button onClick={() => setViewMode(viewMode === 'admin' ? 'preview' : 'admin')} className="px-4 py-1.5 bg-[var(--paper-2)] hover:bg-[var(--surface)] text-xs font-semibold rounded-full border border-[var(--line)] text-[var(--ink)] flex items-center gap-2 transition cursor-pointer">
                    <Wand2 size={14} className="text-[#06B6D4]" />
                    <span>Toggle Admin / Preview</span>
                </button>
            </div>
        </header>

        <div className="flex-grow flex h-[calc(100vh-4rem)] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[300px] border-r border-[var(--line)] bg-[var(--paper-2)] flex flex-col justify-between p-4 overflow-y-auto">
                <div className="space-y-6">
                    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 text-center relative overflow-hidden">
                        <span className="text-[10px] text-[#6366F1] tracking-widest font-bold uppercase block mb-1">Level 1 Path</span>
                        <h3 className="text-base font-bold text-[var(--ink)] mb-2">Foundations of AI</h3>
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
                    {/* Presentation File Loader */}
                    <div className="bg-white text-gray-950 border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-50 text-[#6366F1] rounded-xl">
                                <BookOpen size={24} className="shrink-0" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-gray-800">Presentation File Loader</h3>
                                <p className="text-[11px] text-gray-500 leading-normal">Upload a multi-page PDF presentation to automatically generate high-fidelity slides.</p>
                            </div>
                        </div>
                        <div className="shrink-0">
                            {isExtractingPdf ? (
                                <div className="flex items-center gap-2 text-xs font-semibold text-[#6366F1] py-2 px-4 bg-indigo-50 rounded-xl">
                                    <div className="w-4 h-4 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin"></div>
                                    <span>Converting Pages to Slides...</span>
                                </div>
                            ) : (
                                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition shadow-xs">
                                    <CloudUpload size={14} />
                                    <span>Upload PDF Presentation</span>
                                    <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Slide Content Card */}
                    {(!activeLesson?.slides || activeLesson.slides.length === 0) ? (
                        <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] gap-4 shadow-md shrink-0">
                            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
                                <CloudUpload size={48} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">No Presentation Loaded Yet</h3>
                                <p className="text-xs text-gray-500 max-w-sm mt-1 mx-auto leading-relaxed">
                                    Use the Presentation File Loader above to import a PDF, or add a manual slide in the design panel on the right.
                                </p>
                            </div>
                        </div>
                    ) : (
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
                                    
                                    {activeSlide?.imageUrl && !isVideoUrl(activeSlide.imageUrl) ? (
                                        imageLoadError ? (
                                            <div className="w-full h-64 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center justify-center text-amber-800 flex-col gap-2 p-6 text-center">
                                                <span className="text-2xl">⚠️</span>
                                                <span className="font-bold text-sm text-[#111827]">Unable to load slide image</span>
                                                <span className="text-xs text-gray-500 max-w-sm">The URL could be invalid, private, or blocked by security policies. You can edit the URL or upload a local image below.</span>
                                                <a href={activeSlide.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#B45309] font-bold underline mt-1 flex items-center gap-1 hover:text-[#92400E]">
                                                    Test Image Link in New Tab <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="relative group">
                                                <img 
                                                    src={activeSlide.imageUrl} 
                                                    alt="Slide Media" 
                                                    onError={() => setImageLoadError(true)}
                                                    className="w-full max-h-[50vh] object-contain rounded-xl border border-gray-200 bg-gray-50 shadow-sm" 
                                                />
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-full h-64 bg-amber-50/20 border-2 border-dashed border-amber-300 rounded-xl flex items-center justify-center text-gray-400 flex-col gap-2 p-6 text-center">
                                            <span className="text-[#B45309] text-2xl">📝</span>
                                            <span className="font-semibold text-sm text-gray-700">Slide Presentation Card</span>
                                            <span className="text-xs text-gray-500 max-w-sm">
                                                {activeSlide?.imageUrl && isVideoUrl(activeSlide.imageUrl) 
                                                    ? "A video player is attached directly below. You can also upload an image to display above it."
                                                    : "Add an image URL or upload a file using the button below"}
                                            </span>
                                        </div>
                                    )}

                                    {/* EACH SLIDE HAS A DOWN BUTTON FOR UPLOAD (with dropdown choice) */}
                                    <div className="pt-2 border-t border-gray-100 flex flex-col items-center">
                                        {activeSlideUploadMenuOpen === currentSlideIndex ? (
                                            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm animate-fadeIn space-y-3">
                                                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                                    <span className="text-xs font-bold text-gray-700">Choose Media Upload Method</span>
                                                    <button 
                                                        onClick={() => setActiveSlideUploadMenuOpen(null)} 
                                                        className="text-xs text-gray-400 hover:text-gray-600 font-bold"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setUploadMethod('url')}
                                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${uploadMethod === 'url' ? 'bg-[#6366F1] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >
                                                        <Globe size={13} />
                                                        <span>Image URL</span>
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setUploadMethod('file')}
                                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${uploadMethod === 'file' ? 'bg-[#6366F1] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >
                                                        <FileText size={13} />
                                                        <span>Local Image File</span>
                                                    </button>
                                                </div>

                                                {uploadMethod === 'url' ? (
                                                    <div className="space-y-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Paste image URL (https://...)" 
                                                            value={slideUrlInput}
                                                            onChange={(e) => setSlideUrlInput(e.target.value)}
                                                            className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#6366F1]"
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                const trimmed = slideUrlInput.trim();
                                                                if (trimmed) {
                                                                    if (isVideoUrl(trimmed)) {
                                                                        const newMaterial = {
                                                                            id: `mat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                                                            title: "Lesson Video Resource",
                                                                            type: 'video' as const,
                                                                            url: trimmed,
                                                                            fileName: '',
                                                                            fileData: ''
                                                                        };
                                                                        const currentMaterials = activeSlide?.materials || [];
                                                                        handleUpdateSlide('materials', [...currentMaterials, newMaterial]);
                                                                        alert("🎥 We detected a video URL! We have automatically attached it as an Interactive Video Resource below this slide to keep your original slide image intact.");
                                                                    } else if (isDocumentUrl(trimmed)) {
                                                                        const title = getDocumentTitleFromUrl(trimmed);
                                                                        const fileName = getDocumentFileNameFromUrl(trimmed);
                                                                        const newMaterial = {
                                                                            id: `mat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                                                            title: title,
                                                                            type: 'file' as const,
                                                                            url: trimmed,
                                                                            fileName: fileName,
                                                                            fileData: ''
                                                                        };
                                                                        const currentMaterials = activeSlide?.materials || [];
                                                                        handleUpdateSlide('materials', [...currentMaterials, newMaterial]);
                                                                        alert(`📋 We detected a document file URL! We have automatically attached it as "${title}" below this slide to keep your original slide image intact.`);
                                                                    } else if (!isImageUrl(trimmed)) {
                                                                        // Standard website or external resource
                                                                        const newMaterial = {
                                                                            id: `mat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                                                            title: "Interactive Website Resource",
                                                                            type: 'link' as const,
                                                                            url: trimmed,
                                                                            fileName: '',
                                                                            fileData: ''
                                                                        };
                                                                        const currentMaterials = activeSlide?.materials || [];
                                                                        handleUpdateSlide('materials', [...currentMaterials, newMaterial]);
                                                                        alert("🌐 We detected a website link! We have automatically attached it as an Interactive Website Resource below this slide to keep your original slide image intact.");
                                                                    } else {
                                                                        handleUpdateSlide('imageUrl', trimmed);
                                                                    }
                                                                    setActiveSlideUploadMenuOpen(null);
                                                                    setSlideUrlInput('');
                                                                }
                                                            }}
                                                            className="w-full py-2 bg-[#00AD7C] hover:bg-[#00AD7C]/90 text-white text-xs font-bold rounded-lg transition"
                                                        >
                                                            Set Slide Image Link
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <label className="block text-[11px] font-semibold text-gray-500 uppercase">Select local image file from your computer</label>
                                                        <input 
                                                            type="file" 
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onload = (event) => {
                                                                        handleUpdateSlide('imageUrl', event.target?.result as string);
                                                                        setActiveSlideUploadMenuOpen(null);
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                            className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setActiveSlideUploadMenuOpen(currentSlideIndex);
                                                    setUploadMethod('url');
                                                }}
                                                className="px-5 py-2.5 bg-gray-100 hover:bg-[#6366F1] hover:text-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                                                title="Upload media specifically for this slide"
                                            >
                                                <CloudUpload size={15} />
                                                <span>Upload Slide Image</span>
                                                <span className="text-[10px] text-gray-400 font-normal ml-1">URL / File</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* If the slide's imageUrl is actually a video URL, render it beautifully here below the upload button */}
                                    {activeSlide?.imageUrl && isVideoUrl(activeSlide.imageUrl) && (
                                        <div className="w-full aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-md bg-black my-4">
                                            {getEmbedUrl(activeSlide.imageUrl) ? (
                                                <iframe 
                                                    src={getEmbedUrl(activeSlide.imageUrl)!} 
                                                    className="w-full h-full"
                                                    frameBorder="0" 
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                    allowFullScreen
                                                ></iframe>
                                            ) : (
                                                <video 
                                                    src={activeSlide.imageUrl} 
                                                    controls 
                                                    className="w-full h-full object-contain" 
                                                />
                                            )}
                                        </div>
                                    )}

                                    {activeSlide?.content && activeSlide.content !== '<p>Write custom paragraphs here.</p>' && (
                                        <div className="text-base text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100" dangerouslySetInnerHTML={{ __html: activeSlide?.content || '' }} />
                                    )}

                                    {/* Slide materials and resources rendering */}
                                    {activeSlide?.materials && activeSlide.materials.length > 0 && (
                                        <div className="w-full mt-8 pt-8 border-t border-gray-200">
                                            <h4 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
                                                <span className="text-[#B45309]">📎</span>
                                                <span>Slide Materials & Learning Resources</span>
                                            </h4>
                                            <div className="space-y-4">
                                                {activeSlide.materials.map((mat: any) => (
                                                    <MaterialItemCard key={mat.id} mat={mat} />
                                                ))}
                                            </div>
                                        </div>
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
                    )}

                    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-[#6366F1]/20 text-[#6366F1] rounded-lg text-sm">
                                    <HelpCircle size={16} />
                                </span>
                                <h3 className="text-lg font-bold text-white">Lesson Checkpoint Quiz</h3>
                            </div>
                            {activeLesson?.quiz && activeLesson.quiz.length > 0 && (
                                <span className="text-xs bg-[#6366F1]/10 text-[#6366F1] px-2.5 py-1 rounded-full font-bold">
                                    {activeLesson.quiz.length} {activeLesson.quiz.length === 1 ? 'Question' : 'Questions'}
                                </span>
                            )}
                        </div>
                        {activeLesson?.quiz && activeLesson.quiz.length > 0 ? (
                            <div className="space-y-6">
                                {activeLesson.quiz.map((q: any, qIdx: number) => (
                                    <div key={qIdx} className="p-4 bg-gray-900/60 border border-[#1f2937] rounded-xl space-y-3">
                                        <div className="flex justify-between items-center text-xs text-[#06B6D4] font-semibold">
                                            <span>Question {qIdx + 1} of {activeLesson.quiz.length}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-200">{q.question || 'Untitled Question'}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                            {(q.options || []).map((opt: string, optIdx: number) => {
                                                const isSelected = selectedQuizAnswers[qIdx] === optIdx;
                                                return (
                                                    <label 
                                                        key={optIdx} 
                                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition text-xs border ${
                                                            isSelected 
                                                            ? 'bg-[#6366F1]/20 border-[#6366F1] text-white font-bold' 
                                                            : 'bg-gray-900 border-[#1f2937] text-gray-300 hover:border-gray-700'
                                                        }`}
                                                    >
                                                        <input 
                                                            type="radio" 
                                                            name={`preview-quiz-${qIdx}`} 
                                                            value={optIdx} 
                                                            checked={isSelected}
                                                            onChange={() => setSelectedQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                                                            className="accent-[#6366F1] w-3.5 h-3.5" 
                                                        />
                                                        <span>{opt}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        {q.hint && (
                                            <div className="pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPreviewHints(prev => ({ ...prev, [qIdx]: !prev[qIdx] }))}
                                                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition"
                                                >
                                                    <Lightbulb size={13} />
                                                    <span>{showPreviewHints[qIdx] ? "Hide Hint" : "Need a hint?"}</span>
                                                </button>
                                                {showPreviewHints[qIdx] && (
                                                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2 animate-fadeIn">
                                                        <Lightbulb size={14} className="text-amber-400 shrink-0 mt-0.5" />
                                                        <span><strong>Hint:</strong> {q.hint}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button onClick={evaluateQuiz} className="w-full py-2.5 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-bold text-xs rounded-xl transition shadow-md">
                                    Submit Answer Verification
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 italic">No checkpoint quiz included in this elective module yet.</p>
                        )}
                    </div>
                </div>

                {/* Right Workspace: Config Editor */}
                {viewMode === 'admin' && (
                    <div className="w-full lg:w-[500px] border-l border-[#1f2937] bg-gray-950/80 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
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

                                {/* Resource Folder */}
                                <div className="bg-gray-900/60 border border-[#1f2937] rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                                        <Folder size={14} />
                                        <span>Resource Folder</span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 leading-normal">
                                        Open the directory of templates, datasets, worksheets, and cheat sheets for computing electives.
                                    </p>
                                    <button 
                                        type="button"
                                        onClick={() => setShowResourcesDirectory(true)}
                                        className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                                    >
                                        <FolderOpen size={15} />
                                        <span>Open Resources Directory</span>
                                    </button>
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

                                    {/* Slide Materials & Attachments Manager */}
                                    <div className="border-t border-[#1f2937] pt-4 mt-4 space-y-3">
                                        <label className="block text-xs font-bold text-[#06B6D4] uppercase tracking-wider">Slide Materials & Attachments</label>
                                        <p className="text-[10px] text-gray-400 leading-relaxed">Add reference files or links specifically for this slide that students can download/open during the lesson.</p>

                                        {/* Current Materials List */}
                                        <div className="space-y-2">
                                            {(!activeSlide?.materials || activeSlide.materials.length === 0) ? (
                                                <div className="text-[10px] text-gray-500 italic p-2 bg-gray-950 border border-[#1f2937] rounded-lg text-center">
                                                    No materials attached to this slide yet.
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                                    {activeSlide.materials.map((mat: any) => (
                                                        <div key={mat.id} className="flex items-center justify-between p-2 rounded bg-gray-950 border border-[#1f2937] text-xs">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className={mat.type === 'file' ? 'text-[#059669] shrink-0' : mat.type === 'video' ? 'text-[#DC2626] shrink-0' : 'text-[#2563EB] shrink-0'}>
                                                                    {mat.type === 'file' ? <FileText size={12} /> : mat.type === 'video' ? <Video size={12} /> : <ExternalLink size={12} />}
                                                                </span>
                                                                <div className="truncate min-w-0">
                                                                    <span className="font-semibold text-gray-200 block truncate leading-tight">{mat.title}</span>
                                                                    <span className="text-[9px] text-gray-500 block truncate">
                                                                        {mat.type === 'file' ? (mat.fileName || 'Google Drive File') : mat.url}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    const currentMaterials = activeSlide?.materials || [];
                                                                    handleUpdateSlide('materials', currentMaterials.filter((m: any) => m.id !== mat.id));
                                                                }}
                                                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-800 transition shrink-0 ml-1"
                                                                title="Remove material"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Add Material Form */}
                                        <div className="bg-gray-950 border border-[#1f2937] p-3 rounded-lg space-y-3">
                                            <span className="text-[10px] text-[#06B6D4] font-bold uppercase block tracking-wider">Add Slide Material</span>
                                            
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-400 mb-1 uppercase">Material Title</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. Lesson Worksheet, Resource Link" 
                                                    value={matTitle}
                                                    onChange={(e) => setMatTitle(e.target.value)}
                                                    className="w-full bg-gray-900 border border-[#1f2937] rounded p-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-400 mb-1 uppercase">Material Type</label>
                                                <div className="flex bg-gray-900 rounded border border-[#1f2937] p-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setMatType('link')}
                                                        className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${matType === 'link' ? 'bg-[#06B6D4] text-gray-950' : 'text-gray-400 hover:text-white'}`}
                                                    >
                                                        Link URL
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setMatType('video')}
                                                        className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${matType === 'video' ? 'bg-[#06B6D4] text-gray-950' : 'text-gray-400 hover:text-white'}`}
                                                    >
                                                        Video Preview
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setMatType('file')}
                                                        className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${matType === 'file' ? 'bg-[#06B6D4] text-gray-950' : 'text-gray-400 hover:text-white'}`}
                                                    >
                                                        File/Drive
                                                    </button>
                                                </div>
                                            </div>

                                            {matType === 'link' && (
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-gray-400 mb-1 uppercase">External Link URL</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="https://docs.google.com/..." 
                                                        value={matUrl}
                                                        onChange={(e) => setMatUrl(e.target.value)}
                                                        className="w-full bg-gray-900 border border-[#1f2937] rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-[#06B6D4]"
                                                    />
                                                </div>
                                            )}

                                            {matType === 'video' && (
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-gray-400 mb-1 uppercase">Video URL (YouTube or direct MP4)</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="https://www.youtube.com/watch?v=..." 
                                                        value={matUrl}
                                                        onChange={(e) => setMatUrl(e.target.value)}
                                                        className="w-full bg-gray-900 border border-[#1f2937] rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-[#06B6D4]"
                                                    />
                                                </div>
                                            )}

                                            {matType === 'file' && (
                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="block text-[10px] font-semibold text-gray-400 mb-1 uppercase">Google Drive Link (Optional)</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="https://drive.google.com/..." 
                                                            value={matUrl}
                                                            onChange={(e) => setMatUrl(e.target.value)}
                                                            className="w-full bg-gray-900 border border-[#1f2937] rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-[#06B6D4]"
                                                        />
                                                    </div>
                                                    <div className="text-[9px] text-gray-500 font-semibold text-center my-1 uppercase tracking-wider">— Or Upload Local File —</div>
                                                    <div>
                                                        <input 
                                                            type="file" 
                                                            id="material-file-upload"
                                                            onChange={handleMaterialFileUpload}
                                                            className="w-full text-xs text-gray-400 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer"
                                                        />
                                                        {uploadingMatFile && (
                                                            <span className="text-[10px] text-[#06B6D4] animate-pulse mt-1 block">Reading file...</span>
                                                        )}
                                                        {matFileName && (
                                                            <span className="text-[10px] text-emerald-400 mt-1 block truncate">✓ {matFileName}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={handleSaveMaterial}
                                                className="w-full py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 hover:shadow-md cursor-pointer border border-[#B45309]/30"
                                            >
                                                <PlusCircle size={14} />
                                                <span>Attach Material to Slide</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 border-t border-[#1f2937] pt-6">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lesson Checkpoint Quiz Setup</h4>
                                    <button 
                                        type="button"
                                        onClick={addQuizQuestion} 
                                        className="text-xs font-bold bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-gray-950 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
                                    >
                                        <PlusCircle size={14} /> Add Question
                                    </button>
                                </div>

                                {(!activeLesson?.quiz || activeLesson.quiz.length === 0) ? (
                                    <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-xl text-center space-y-2">
                                        <p className="text-xs text-gray-400">No questions added yet.</p>
                                        <button 
                                            type="button"
                                            onClick={addQuizQuestion} 
                                            className="px-3 py-1.5 bg-[#06B6D4]/10 text-[#06B6D4] hover:bg-[#06B6D4]/20 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                                        >
                                            <PlusCircle size={13} /> Add First Question
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activeLesson.quiz.map((q: any, qIdx: number) => (
                                            <div key={qIdx} className="space-y-3 bg-[#111827] border border-[#1f2937] p-4 rounded-xl relative">
                                                <div className="flex justify-between items-center pb-2 border-b border-[#1f2937]">
                                                    <span className="text-xs font-bold text-[#06B6D4] uppercase">Question {qIdx + 1}</span>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            type="button"
                                                            onClick={() => duplicateQuizQuestion(qIdx)}
                                                            className="text-xs text-gray-400 hover:text-cyan-400 transition flex items-center gap-1"
                                                            title="Duplicate Question"
                                                        >
                                                            <Copy size={13} /> Duplicate
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => deleteQuizQuestion(qIdx)}
                                                            className="text-xs text-rose-400 hover:text-rose-300 transition flex items-center gap-1"
                                                            title="Delete Question"
                                                        >
                                                            <Trash2 size={13} /> Remove
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase">Question Text</label>
                                                    <input 
                                                        type="text" 
                                                        value={q.question || ''}
                                                        onChange={(e) => updateQuizQuestion(qIdx, 'question', e.target.value)}
                                                        placeholder="Enter question text..."
                                                        className="w-full bg-gray-900 border border-[#1f2937] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4]" 
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase flex items-center gap-1">
                                                        <Lightbulb size={12} className="text-amber-400" /> Question Hint (Optional)
                                                    </label>
                                                    <input 
                                                        type="text" 
                                                        value={q.hint || ''}
                                                        onChange={(e) => updateQuizQuestion(qIdx, 'hint', e.target.value)}
                                                        placeholder="Enter optional hint for students (e.g. Think about 0-based indexing)..."
                                                        className="w-full bg-gray-900 border border-[#1f2937] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#06B6D4]" 
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <label className="text-[11px] font-semibold text-gray-400 uppercase">Answer Options</label>
                                                        <span className="text-[10px] text-amber-400">Click ✓ to pick correct option</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {[0, 1, 2, 3].map(i => {
                                                            const isCorrect = (q.correctIndex ?? 0) === i;
                                                            return (
                                                                <div key={i} className="flex items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateQuizQuestion(qIdx, 'correctIndex', i)}
                                                                        className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center justify-center shrink-0 ${
                                                                            isCorrect 
                                                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                                                                            : 'bg-gray-900 border-[#1f2937] text-gray-500 hover:text-gray-300'
                                                                        }`}
                                                                        title={isCorrect ? "Correct Answer" : "Click to mark as Correct Answer"}
                                                                    >
                                                                        <CheckCircle2 size={14} />
                                                                    </button>
                                                                    <input 
                                                                        type="text" 
                                                                        value={q.options?.[i] || ''}
                                                                        onChange={(e) => updateQuizQuestion(qIdx, 'option', e.target.value, i)}
                                                                        placeholder={`Option ${String.fromCharCode(65 + i)}`} 
                                                                        className={`flex-1 bg-gray-900 border rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#06B6D4] ${
                                                                            isCorrect ? 'border-emerald-500/60' : 'border-[#1f2937]'
                                                                        }`} 
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-semibold text-gray-400 mb-1 uppercase">Correct Choice</label>
                                                    <select 
                                                        value={q.correctIndex ?? 0}
                                                        onChange={(e) => updateQuizQuestion(qIdx, 'correctIndex', e.target.value)}
                                                        className="w-full bg-gray-900 border border-[#1f2937] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#06B6D4]"
                                                    >
                                                        <option value="0">Option A: {q.options?.[0] || 'Empty'}</option>
                                                        <option value="1">Option B: {q.options?.[1] || 'Empty'}</option>
                                                        <option value="2">Option C: {q.options?.[2] || 'Empty'}</option>
                                                        <option value="3">Option D: {q.options?.[3] || 'Empty'}</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={addQuizQuestion}
                                            className="w-full py-3 bg-[#111827] hover:bg-[#1f2937] border border-dashed border-[#06B6D4]/50 hover:border-[#06B6D4] text-[#06B6D4] font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                                        >
                                            <PlusCircle size={15} />
                                            <span>Add Another Question</span>
                                        </button>
                                    </div>
                                )}
                            </div>                  </div>
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
