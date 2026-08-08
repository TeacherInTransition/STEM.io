import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { 
  Search, Plus, Trash2, CheckCircle2, FileText, Video, ExternalLink, 
  FileSpreadsheet, AlertTriangle, Download, Upload, Database, BookOpen, 
  Sparkles, BookMarked, RefreshCw, Sliders, X, Info, Coins, HelpCircle,
  TrendingUp, Check, ChevronRight, FileCode, Edit3, Copy, Layers, Filter,
  FolderPlus, Award, Eye, Target
} from 'lucide-react';
import { curriculum } from '../curriculumData';
import { aiFoundationsCurriculum } from '../aiFoundationsData';
import { ResourceItem, fetchResourcesFromDb, saveResourcesToDb, awardStemios } from '../lib/firebase';
import { calculateLearningMetrics, generateCompetencyRubric } from '../utils/milestonesAndRubrics';
import RubricEvaluationCard from './RubricEvaluationCard';

interface ResourcesPageProps {
  user: User;
}

export interface LessonDef {
  id: string;
  lessonNumber: string;
  title: string;
}

export interface UnitDef {
  unitNumber: string;
  unitTitle: string;
  category: string;
  lessons: LessonDef[];
}

// Master curriculum structure organized strictly by Unit Number & Lessons
export const STRUCTURED_UNITS: UnitDef[] = [
  {
    unitNumber: "Unit 1",
    unitTitle: "Quarter 1: AI Foundations & Ethics",
    category: "AI Foundations",
    lessons: [
      { id: "u1", lessonNumber: "Lesson 1.1", title: "AI vs ML vs DL Hierarchy" },
      { id: "u2", lessonNumber: "Lesson 1.2", title: "Data & Algorithmic Bias" },
      { id: "u3", lessonNumber: "Lesson 1.3", title: "AI Ethics 101 & FAT Framework" },
      { id: "u4", lessonNumber: "Lesson 1.4", title: "Expert Systems & Rule Bases" },
      { id: "history-of-ai", lessonNumber: "Lesson 1.5", title: "History of Artificial Intelligence" },
      { id: "narrow-vs-general", lessonNumber: "Lesson 1.6", title: "Narrow ANI vs General AGI" },
      { id: "f1", lessonNumber: "Lesson 1.7", title: "The AI/ML/DL Nested Box" },
      { id: "f2", lessonNumber: "Lesson 1.8", title: "Bias Auditor Lab Toolkit" }
    ]
  },
  {
    unitNumber: "Unit 2",
    unitTitle: "Quarter 2: Hands-On ML & Vibe Coding",
    category: "Hands-On ML",
    lessons: [
      { id: "u5", lessonNumber: "Lesson 2.1", title: "ML Model Training & Labeled Datasets" },
      { id: "u6", lessonNumber: "Lesson 2.2", title: "Vibe Coding & Prompt Workflows" },
      { id: "u7", lessonNumber: "Lesson 2.3", title: "Classification vs Regression Algorithms" },
      { id: "u8", lessonNumber: "Lesson 2.4", title: "Graphs, Pathfinding & Data Structures" },
      { id: "v1", lessonNumber: "Lesson 2.5", title: "Prompt-to-App Blueprinting" },
      { id: "v2", lessonNumber: "Lesson 2.6", title: "Teachable Vision Box Prototyping" }
    ]
  },
  {
    unitNumber: "Unit 3",
    unitTitle: "Quarter 3: Deep Learning & Neural Networks",
    category: "Deep Learning",
    lessons: [
      { id: "u9", lessonNumber: "Lesson 3.1", title: "Neural Networks & Layer Architecture" },
      { id: "u10", lessonNumber: "Lesson 3.2", title: "Automated Feature Extraction" },
      { id: "u11", lessonNumber: "Lesson 3.3", title: "Introduction to Autonomous AI Agents" },
      { id: "u12", lessonNumber: "Lesson 3.4", title: "Generative AI Text & Image Models" },
      { id: "d1", lessonNumber: "Lesson 3.5", title: "Hidden Layer Adjuster Lab" },
      { id: "d2", lessonNumber: "Lesson 3.6", title: "Perceive-Think-Act Agent Loops" }
    ]
  },
  {
    unitNumber: "Unit 4",
    unitTitle: "Quarter 4: AI Agents Mastery & Gems",
    category: "Agents Mastery",
    lessons: [
      { id: "u13", lessonNumber: "Lesson 4.1", title: "Building & Deploying Custom Gemini Gems" },
      { id: "u14", lessonNumber: "Lesson 4.2", title: "3-Test Agent Iteration & Debugging" },
      { id: "u15", lessonNumber: "Lesson 4.3", title: "Multi-Agent Collaborative Teams" },
      { id: "u16", lessonNumber: "Lesson 4.4", title: "Professional Vibe Coding Agent Pipeline" }
    ]
  },
  {
    unitNumber: "Unit 5",
    unitTitle: "Quarter 5: Synthesis, Exam Prep & Capstone",
    category: "Exam Prep & Capstone",
    lessons: [
      { id: "u17", lessonNumber: "Lesson 5.1", title: "Explainable AI (XAI) & Ethics Deep Dive" },
      { id: "u18", lessonNumber: "Lesson 5.2", title: "IGCSE & IB Syllabus Review Drills" },
      { id: "u19", lessonNumber: "Lesson 5.3", title: "Community Problem Capstone Agent" },
      { id: "u20", lessonNumber: "Lesson 5.4", title: "Final Evidence Exam Portfolio" },
      { id: "cp1", lessonNumber: "Lesson 5.5", title: "3-Test Failure Tracker" },
      { id: "cp2", lessonNumber: "Lesson 5.6", title: "Portfolio Evidence Compactor" }
    ]
  },
  {
    unitNumber: "Unit S1",
    unitTitle: "Computing Systems, Hardware & Protocols",
    category: "Computing Systems",
    lessons: [
      { id: "s1", lessonNumber: "Lesson S1.1", title: "Silicon Race: CPU vs GPU Parallel Architecture" },
      { id: "s2", lessonNumber: "Lesson S1.2", title: "The Packet Tracer Matrix & TCP/IP Routing" }
    ]
  },
  {
    unitNumber: "Unit C1",
    unitTitle: "Cybersecurity & Data Science Literacy",
    category: "Cybersecurity & Data",
    lessons: [
      { id: "c1", lessonNumber: "Lesson C1.1", title: "Phish Detector Simulation & Prompt Defense" },
      { id: "c2", lessonNumber: "Lesson C2.1", title: "The Scatterplot Sleuth & Outlier Cleaning" }
    ]
  },
  {
    unitNumber: "Unit PY1",
    unitTitle: "Python Programming Foundations",
    category: "Programming",
    lessons: [
      { id: "python-basics", lessonNumber: "Lesson PY1.1", title: "Introduction to Python Syntax & Arrays" }
    ]
  }
];

// Flat list of ALL lessons for selection dropdowns
const ALL_LESSONS = STRUCTURED_UNITS.flatMap(u => u.lessons.map(l => ({ id: l.id, title: `${l.lessonNumber}: ${l.title}`, unitNumber: u.unitNumber })));

export default function ResourcesPage({ user }: ResourcesPageProps) {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [lessonFilter, setLessonFilter] = useState<string>('All');
  const [completedResources, setCompletedResources] = useState<string[]>([]);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  // Admin spreadsheet grid state
  const [gridRows, setGridRows] = useState<ResourceItem[]>([]);
  const [isGridDirty, setIsGridDirty] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'admin'>('browse');

  // Unit filter state for the spreadsheet grid
  const [unitFilter, setUnitFilter] = useState<string>('All');

  // Modal / Editor state for link editing or creation
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [modalItem, setModalItem] = useState<{
    id?: string;
    title: string;
    type: 'Video' | 'Document' | 'Spreadsheet' | 'Cheat Sheet' | 'Link';
    url: string;
    lessonId: string;
    description: string;
  }>({
    title: '',
    type: 'Link',
    url: '',
    lessonId: 'u1',
    description: ''
  });

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Load resources and student completions on mount
  useEffect(() => {
    loadData();
    const savedCompletions = localStorage.getItem(`stemio_completed_resources_${user.id}`);
    if (savedCompletions) {
      try {
        setCompletedResources(JSON.parse(savedCompletions));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchResourcesFromDb();
      setResources(data);
      setGridRows(JSON.parse(JSON.stringify(data))); // deep copy
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Safely format external URLs to guarantee valid https protocol
  const formatUrl = (url: string): string => {
    if (!url) return '#';
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  // Student marks a resource as opened/completed
  const handleResourceOpen = async (resource: ResourceItem) => {
    const formatted = formatUrl(resource.url);
    if (formatted && formatted !== '#') {
      try {
        window.open(formatted, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.error('Error opening window:', e);
      }
    }

    if (completedResources.includes(resource.id)) return;

    setResources(prev => prev.map(r => r.id === resource.id ? { ...r, views: (r.views || 0) + 1 } : r));
    
    const newCompletions = [...completedResources, resource.id];
    setCompletedResources(newCompletions);
    localStorage.setItem(`stemio_completed_resources_${user.id}`, JSON.stringify(newCompletions));

    try {
      const result = await awardStemios(user.id, `resource_${resource.id}`, 5);
      if (result.awarded) {
        setRewardMessage(`🎉 Resource Complete! +${result.amount} Stemios credited to your profile!`);
        setTimeout(() => setRewardMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return <Video className="text-[#EF4444]" size={16} />;
      case 'Document':
        return <FileText className="text-[#3B82F6]" size={16} />;
      case 'Spreadsheet':
        return <FileSpreadsheet className="text-[#10B981]" size={16} />;
      case 'Cheat Sheet':
        return <FileCode className="text-[#F59E0B]" size={16} />;
      default:
        return <ExternalLink className="text-[var(--muted)]" size={16} />;
    }
  };

  const getLessonName = (id: string) => {
    const found = ALL_LESSONS.find(l => l.id === id);
    return found ? found.title : `Lesson Reference (${id})`;
  };

  // Filtered resources list for student view
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            res.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'All' || res.type === typeFilter;
      const matchesLesson = lessonFilter === 'All' || res.lessonId === lessonFilter;
      return matchesSearch && matchesType && matchesLesson;
    });
  }, [resources, searchQuery, typeFilter, lessonFilter]);

  const completionPercentage = useMemo(() => {
    if (resources.length === 0) return 0;
    const completedCount = resources.filter(r => completedResources.includes(r.id)).length;
    return Math.round((completedCount / resources.length) * 100);
  }, [resources, completedResources]);

  // Separate Variable: % of resources added/linked to lessons
  const resourcesAddedToLessonsCount = useMemo(() => {
    return resources.filter(r => Boolean(r.lessonId) && r.lessonId !== 'general' && r.lessonId !== 'unassigned').length;
  }, [resources]);

  const resourcesAddedToLessonsPct = useMemo(() => {
    if (resources.length === 0) return 0;
    return Math.round((resourcesAddedToLessonsCount / resources.length) * 100);
  }, [resources, resourcesAddedToLessonsCount]);

  // Learning Metrics & Competency Rubric Evaluation
  const learningMetrics = useMemo(() => {
    return calculateLearningMetrics(
      ['u1-l1', 'u1-l2', 'u2-l1'],
      ['Unit 1'],
      completedResources,
      resources,
      12,
      5
    );
  }, [completedResources, resources]);

  const rubric = useMemo(() => {
    return generateCompetencyRubric(learningMetrics);
  }, [learningMetrics]);

  const [showRubricView, setShowRubricView] = useState(false);

  // Dynamically compute Unit list including any custom unmapped lessons
  const displayUnits = useMemo(() => {
    const definedLessonIds = new Set(STRUCTURED_UNITS.flatMap(u => u.lessons.map(l => l.id)));
    
    // Find any orphan lessonIds in gridRows
    const orphanLessonIds: string[] = Array.from(
      new Set(gridRows.map(r => r.lessonId).filter(id => Boolean(id) && !definedLessonIds.has(id)))
    );

    let unitsList = [...STRUCTURED_UNITS];

    if (orphanLessonIds.length > 0) {
      unitsList.push({
        unitNumber: "Custom Units",
        unitTitle: "Custom & Uncategorized Lesson Resources",
        category: "Custom Lessons",
        lessons: orphanLessonIds.map(id => ({
          id,
          lessonNumber: `Lesson ${id}`,
          title: getLessonName(id)
        }))
      });
    }

    if (unitFilter !== 'All') {
      unitsList = unitsList.filter(u => u.unitNumber === unitFilter);
    }

    return unitsList;
  }, [gridRows, unitFilter]);

  // Open modal to add a new link to a specific lesson cell
  const handleOpenAddForLesson = (lessonId: string) => {
    setModalMode('add');
    setModalItem({
      title: '',
      type: 'Document',
      url: 'https://',
      lessonId,
      description: ''
    });
    setShowLinkModal(true);
  };

  // Open modal to edit an existing link
  const handleOpenEditItem = (item: ResourceItem) => {
    setModalMode('edit');
    setModalItem({
      id: item.id,
      title: item.title,
      type: item.type,
      url: item.url,
      lessonId: item.lessonId,
      description: item.description
    });
    setShowLinkModal(true);
  };

  // Save changes from the Add/Edit Link Modal
  const handleSaveModalItem = () => {
    if (!modalItem.title.trim()) {
      alert('Please enter a valid title for the resource link.');
      return;
    }
    if (!modalItem.url.trim()) {
      alert('Please enter a valid URL link.');
      return;
    }

    if (modalMode === 'add') {
      const newItem: ResourceItem = {
        id: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: modalItem.title.trim(),
        type: modalItem.type,
        url: modalItem.url.trim(),
        lessonId: modalItem.lessonId,
        description: modalItem.description.trim() || 'Lesson resource reference link.',
        views: 0
      };
      setGridRows(prev => [...prev, newItem]);
    } else if (modalMode === 'edit' && modalItem.id) {
      setGridRows(prev => prev.map(item => item.id === modalItem.id ? {
        ...item,
        title: modalItem.title.trim(),
        type: modalItem.type,
        url: modalItem.url.trim(),
        lessonId: modalItem.lessonId,
        description: modalItem.description.trim()
      } : item));
    }

    setIsGridDirty(true);
    setShowLinkModal(false);
  };

  // Quick delete link from cell
  const handleDeleteLink = (id: string) => {
    if (confirm('Are you sure you want to remove this resource link from the lesson?')) {
      setGridRows(prev => prev.filter(item => item.id !== id));
      setIsGridDirty(true);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleRevertChanges = () => {
    setGridRows(JSON.parse(JSON.stringify(resources)));
    setIsGridDirty(false);
    setPasteError(null);
  };

  // Bulk paste parser
  const handlePasteImport = () => {
    if (!bulkPasteText.trim()) {
      setPasteError('Input is empty. Paste data before compiling.');
      return;
    }

    try {
      const lines = bulkPasteText.split('\n');
      const imported: ResourceItem[] = [];
      let skippedHeaders = false;

      for (const line of lines) {
        if (!line.trim()) continue;
        
        const cells = line.includes('\t') ? line.split('\t') : line.split(',');
        if (cells.length < 2) continue;

        const col0 = cells[0].toLowerCase();
        if (!skippedHeaders && (col0.includes('title') || col0.includes('name') || col0.includes('header'))) {
          skippedHeaders = true;
          continue;
        }

        const title = cells[0]?.trim() || 'Untitled Resource';
        let type: any = 'Link';
        const typeStr = (cells[1] || '').trim().toLowerCase();
        if (typeStr.includes('video') || typeStr.includes('youtube')) type = 'Video';
        else if (typeStr.includes('doc') || typeStr.includes('pdf')) type = 'Document';
        else if (typeStr.includes('sheet') || typeStr.includes('excel') || typeStr.includes('spread')) type = 'Spreadsheet';
        else if (typeStr.includes('cheat') || typeStr.includes('code') || typeStr.includes('syntax')) type = 'Cheat Sheet';

        const url = cells[2]?.trim() || 'https://';
        const lessonId = cells[3]?.trim() || 'u1';
        const description = cells[4]?.trim() || 'Sourced spreadsheet asset.';

        imported.push({
          id: `res-import-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          title,
          type,
          url,
          lessonId,
          description,
          views: 0
        });
      }

      if (imported.length === 0) {
        setPasteError('Could not parse any valid rows. Please check format.');
        return;
      }

      setGridRows(prev => [...prev, ...imported]);
      setIsGridDirty(true);
      setShowBulkModal(false);
      setBulkPasteText('');
      setPasteError(null);
    } catch (e: any) {
      setPasteError(`Parser Error: ${e.message}`);
    }
  };

  // Bulk save database changes to Firestore/localStorage
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const success = await saveResourcesToDb(gridRows);
      if (success) {
        setResources(gridRows);
        setIsGridDirty(false);
        alert('🌐 Cloud Database synchronized successfully! All lesson resource links updated.');
      } else {
        alert('Synchronization warning: Changes saved to local browser sandbox.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating database.');
    } finally {
      setSaving(false);
    }
  };

  const downloadCSVSample = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Title,Type,URL,LessonId,Description\n"
      + "Intro to Neural Networks,Video,https://www.youtube.com/watch?v=aircAruvnKk,u9,Mastering Layer structure and weights\n"
      + "Algorithmic Bias Case Study,Spreadsheet,https://docs.google.com/spreadsheets/d/test,u2,Audit datasets for bias in real time\n"
      + "Python Quick Cheat Sheet,Cheat Sheet,https://github.com/syntax,python-basics,Useful loops and arrays cheats";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stemio_resources_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-6 animate-fadeIn" style={{ backgroundColor: 'transparent' }}>
      
      {/* Toast Notification */}
      {rewardMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-white font-mono text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400">
          <Coins size={16} className="text-yellow-300" />
          <span>{rewardMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line-2)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[var(--amber)] font-mono text-xs tracking-wider uppercase font-bold">
            <BookOpen size={14} />
            <span>Learning Resources Directory</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
            Curriculum Resources & Reference Library
          </h1>
          <p className="text-xs text-[var(--muted)] max-w-2xl mt-1 leading-relaxed">
            Access verified external worksheets, Python syntax cards, interactive spreadsheets, and video explainers. Completing assets awards <strong className="text-[var(--amber)]">+5 Stemios</strong>.
          </p>
        </div>

        {/* User Role Quick Switch Tabs */}
        {user.isAdmin && (
          <div className="flex bg-[var(--paper-2)] border border-[var(--line-2)] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'browse' ? 'bg-[var(--surface)] text-[var(--amber)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
            >
              <BookMarked size={14} /> Student View
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'admin' ? 'bg-[var(--surface)] text-[var(--amber)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
            >
              <FileSpreadsheet size={14} /> Spreadsheet Editor
            </button>
          </div>
        )}
      </div>

      {activeTab === 'browse' || !user.isAdmin ? (
        <>
          {/* STUDENT PROGRESS & STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Resource Open Rate */}
            <div className="bg-[var(--paper-2)] border border-[var(--line-2)] p-4 rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--muted)]">Resource Open Rate</span>
                <div className="text-xl font-bold text-[var(--ink)] flex items-baseline gap-1">
                  <span>{completionPercentage}%</span>
                  <span className="text-[11px] text-[var(--muted)] font-normal">({resources.filter(r => completedResources.includes(r.id)).length}/{resources.length} read)</span>
                </div>
              </div>
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="var(--line-2)" strokeWidth="4" />
                  <circle 
                    cx="28" 
                    cy="28" 
                    r="22" 
                    fill="none" 
                    stroke="var(--amber)" 
                    strokeWidth="4" 
                    strokeDasharray={138.23}
                    strokeDashoffset={138.23 - (138.23 * Math.min(completionPercentage, 100)) / 100}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute font-mono text-[11px] font-bold text-[var(--amber)]">{completionPercentage}%</div>
              </div>
            </div>

            {/* 2. Key Variable: % of Resources Added to Lessons */}
            <div className="bg-[var(--paper-2)] border border-[var(--line-2)] p-4 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--muted)]">% Resources in Lessons</span>
                <div className="text-xl font-bold text-[#06B6D4] flex items-baseline gap-1">
                  <span>{resourcesAddedToLessonsPct}%</span>
                  <span className="text-[11px] text-[var(--muted)] font-normal">({resourcesAddedToLessonsCount}/{resources.length} mapped)</span>
                </div>
              </div>
              <div className="p-3 bg-[#06B6D4]/10 rounded-lg text-[#06B6D4]">
                <FolderPlus size={20} />
              </div>
            </div>

            {/* 3. Active Rewards Remaining */}
            <div className="bg-[var(--paper-2)] border border-[var(--line-2)] p-4 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--muted)]">Rewards Available</span>
                <div className="text-xl font-bold text-[var(--amber)] flex items-center gap-1.5">
                  <Coins size={18} className="text-[var(--amber)]" />
                  <span>{(resources.length - resources.filter(r => completedResources.includes(r.id)).length) * 5} Stemios</span>
                </div>
              </div>
              <div className="p-3 bg-[var(--amber-tint)] rounded-lg text-[var(--amber)]">
                <Sparkles size={20} />
              </div>
            </div>

            {/* 4. Curriculum Competency Rating */}
            <div className="bg-[var(--paper-2)] border border-[var(--line-2)] p-4 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--muted)]">Competency Rubric</span>
                <div className="text-sm font-bold text-[#6366F1] flex items-center gap-1">
                  <Award size={16} />
                  <span>{rubric.tierLabel} ({rubric.totalScore}/16 Pts)</span>
                </div>
              </div>
              <button 
                onClick={() => setShowRubricView(!showRubricView)}
                className="px-3 py-1.5 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-xs font-bold rounded-lg transition"
              >
                {showRubricView ? 'Hide Rubric' : 'View Rubric'}
              </button>
            </div>
          </div>

          {/* Competency & Evaluation Rubric Drawer/Card */}
          {showRubricView && (
            <div className="animate-fadeIn">
              <RubricEvaluationCard 
                metrics={learningMetrics} 
                rubric={rubric} 
                title="Curriculum Competency & Evaluation Rubric"
                subtitle="Evaluation framework linked to lesson/unit completion, higher resource open rates, and % of resources added to lessons."
              />
            </div>
          )}

          {/* FILTERS & SEARCH ROW */}
          <div className="flex flex-col md:flex-row gap-4 bg-[var(--paper-2)] border border-[var(--line-2)] p-4 rounded-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <input
                type="text"
                placeholder="Search resources, topics, descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-lg pl-9 pr-4 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--amber)]/50 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)]">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="w-full md:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-lg px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--amber)]/50 transition-colors cursor-pointer"
              >
                <option value="All">All Resource Types</option>
                <option value="Video">🎥 Videos</option>
                <option value="Document">📄 Documents</option>
                <option value="Spreadsheet">📊 Spreadsheets</option>
                <option value="Cheat Sheet">📝 Cheat Sheets</option>
              </select>
            </div>

            <div className="w-full md:w-64">
              <select
                value={lessonFilter}
                onChange={(e) => setLessonFilter(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-lg px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--amber)]/50 transition-colors cursor-pointer"
              >
                <option value="All">All Linked Lessons</option>
                {ALL_LESSONS.map(l => (
                  <option key={l.id} value={l.id}>
                    [{l.id}] {l.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* MAIN RESOURCES GRID */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[var(--paper-2)] border border-[var(--line-2)] rounded-xl">
              <RefreshCw className="w-8 h-8 text-[var(--amber)] animate-spin" />
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">Loading Resources directory...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-[var(--paper-2)] border border-[var(--line-2)] rounded-xl">
              <AlertTriangle className="text-[var(--amber)] mb-3" size={32} />
              <h3 className="text-sm font-bold text-[var(--ink)] uppercase">No matching resources found</h3>
              <p className="text-xs text-[var(--muted)] mt-1.5 max-w-sm">
                Try adjusting your text search, clearing filters, or asking your teacher to upload spreadsheet reference items.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setTypeFilter('All'); setLessonFilter('All'); }}
                className="mt-4 px-4 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-xs font-bold text-[var(--ink)] hover:text-[var(--amber)] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map(res => {
                const isCompleted = completedResources.includes(res.id);
                const targetUrl = formatUrl(res.url);

                return (
                  <div 
                    key={res.id}
                    id={`resource-card-${res.id}`}
                    className="bg-[var(--paper-2)] border border-[var(--line-2)] hover:border-[var(--amber)]/50 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5 gap-2">
                        <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] px-2.5 py-1 rounded-full">
                          {getResourceIcon(res.type)}
                          <span>{res.type}</span>
                        </span>
                        
                        <span className="text-[10px] font-mono bg-[var(--amber-tint)] text-[var(--amber)] px-2 py-0.5 rounded-md border border-[var(--amber)]/15 font-semibold">
                          {res.lessonId}
                        </span>
                      </div>

                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleResourceOpen(res)}
                        className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--amber)] hover:underline transition-colors line-clamp-1 mb-1.5 block cursor-pointer"
                      >
                        {res.title}
                      </a>
                      <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3 mb-4 h-[54px]">
                        {res.description}
                      </p>
                    </div>

                    <div className="border-t border-[var(--line-2)] pt-3.5 mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[var(--muted)] font-mono truncate max-w-[140px]">
                        Linked: <strong className="text-[var(--ink-soft)] font-normal">{getLessonName(res.lessonId)}</strong>
                      </span>
                      
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleResourceOpen(res)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          isCompleted 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-[var(--amber-tint)] hover:bg-[var(--amber)]/20 text-[var(--amber)] border border-[var(--amber)]/20'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Reviewed</span>
                          </>
                        ) : (
                          <>
                            <span>Open Resource</span>
                            <ExternalLink size={13} />
                          </>
                        )}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* REFINED SPREADSHEET EDITOR: UNIT NUMBER -> LESSONS -> RESOURCE LINKS CELL */
        <div className="space-y-6">
          
          {/* Top Control Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--paper-2)] border border-[var(--line-2)] p-4 rounded-xl shadow-xs">
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[var(--amber-tint)] border border-[var(--amber)]/20 rounded-lg text-[var(--amber)]">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-2">
                  <span>Unit & Lesson Spreadsheet Grid</span>
                  <span className="px-2 py-0.5 bg-[var(--surface)] text-[10px] font-mono rounded text-[var(--amber)] border border-[var(--line)]">
                    {gridRows.length} total links
                  </span>
                </h3>
                <p className="text-[11px] text-[var(--muted)] font-mono mt-0.5">
                  Organized by Unit Number & Lessons • {isGridDirty ? <span className="text-amber-500 font-bold">Unsaved Changes Pending</span> : <span className="text-emerald-500 font-semibold">Synced to Cloud</span>}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Unit Filter Selector */}
              <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--line)] px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--ink)]">
                <Filter size={13} className="text-[var(--amber)]" />
                <span className="text-[10px] uppercase text-[var(--muted)] font-mono">Unit Filter:</span>
                <select
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer text-xs font-semibold text-[var(--ink)]"
                >
                  <option value="All">All Units</option>
                  {STRUCTURED_UNITS.map(u => (
                    <option key={u.unitNumber} value={u.unitNumber}>
                      {u.unitNumber}: {u.unitTitle}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setModalMode('add');
                  setModalItem({ title: '', type: 'Document', url: 'https://', lessonId: 'u1', description: '' });
                  setShowLinkModal(true);
                }}
                className="px-3.5 py-2 bg-[var(--amber-tint)] hover:bg-[var(--amber)]/20 text-[var(--amber)] border border-[var(--amber)]/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Add Link
              </button>

              <button
                onClick={() => setShowBulkModal(true)}
                className="px-3.5 py-2 bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--amber)]/30 rounded-lg text-xs font-bold text-[var(--ink)] hover:text-[var(--amber)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={14} /> Paste Spreadsheet
              </button>

              {isGridDirty && (
                <>
                  <button
                    onClick={handleRevertChanges}
                    className="px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {saving ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                    <span>Save Changes</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* MAIN SPREADSHEET TABLE GRID */}
          <div className="border border-[var(--line-2)] rounded-2xl bg-[var(--paper-2)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed min-w-[960px]">
                <thead>
                  <tr className="bg-[var(--paper)] text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] border-b border-[var(--line-2)]">
                    <th className="p-3.5 w-60 font-bold border-r border-[var(--line-2)]">Unit Number & Theme</th>
                    <th className="p-3.5 w-64 font-bold border-r border-[var(--line-2)]">Lessons</th>
                    <th className="p-3.5 font-bold">Resource Links Cell</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line-2)] text-xs text-[var(--ink-soft)]">
                  {displayUnits.map((unit) => {
                    return unit.lessons.map((lesson, lessonIdx) => {
                      const lessonLinks = gridRows.filter(r => r.lessonId === lesson.id);

                      return (
                        <tr key={`${unit.unitNumber}-${lesson.id}`} className="hover:bg-[var(--surface)]/30 transition-colors">
                          
                          {/* CELL 1: UNIT NUMBER (Rowspan representation or clean sticky unit info) */}
                          {lessonIdx === 0 ? (
                            <td 
                              rowSpan={unit.lessons.length} 
                              className="p-4 align-top border-r border-[var(--line-2)] bg-[var(--paper)]/40 space-y-2"
                            >
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--amber-tint)] text-[var(--amber)] border border-[var(--amber)]/20 rounded-md font-mono text-xs font-bold">
                                <Layers size={13} />
                                <span>{unit.unitNumber}</span>
                              </div>
                              <h4 className="text-xs font-bold text-[var(--ink)] leading-snug">
                                {unit.unitTitle}
                              </h4>
                              <span className="block text-[10px] font-mono text-[var(--muted)]">
                                Category: {unit.category}
                              </span>
                              <div className="pt-2 text-[10px] font-mono text-[var(--muted)] border-t border-[var(--line-2)]">
                                {unit.lessons.reduce((acc, l) => acc + gridRows.filter(r => r.lessonId === l.id).length, 0)} total links in unit
                              </div>
                            </td>
                          ) : null}

                          {/* CELL 2: LESSON */}
                          <td className="p-3.5 align-top border-r border-[var(--line-2)] bg-[var(--paper-2)]/50 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[var(--amber)]">
                                {lesson.lessonNumber}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] rounded">
                                {lesson.id}
                              </span>
                            </div>
                            <h5 className="text-xs font-semibold text-[var(--ink)] leading-snug">
                              {lesson.title}
                            </h5>
                          </td>

                          {/* CELL 3: RESOURCE LINKS CELL (Where each lesson has its own cell with resource links!) */}
                          <td className="p-3.5 align-top space-y-2">
                            {lessonLinks.length === 0 ? (
                              <div className="py-2 px-3 border border-dashed border-[var(--line)] rounded-xl text-[11px] text-[var(--muted)] italic flex items-center justify-between">
                                <span>No resource links attached to this lesson yet.</span>
                                <button
                                  onClick={() => handleOpenAddForLesson(lesson.id)}
                                  className="text-[11px] font-bold text-[var(--amber)] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus size={13} /> Add Link
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {lessonLinks.map((item) => (
                                  <div 
                                    key={item.id}
                                    className="p-2.5 bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--amber)]/40 rounded-xl flex items-start justify-between gap-3 transition-all group"
                                  >
                                    <div className="flex items-start gap-2.5 min-w-0">
                                      <div className="p-1.5 bg-[var(--paper-2)] border border-[var(--line)] rounded-lg shrink-0 mt-0.5">
                                        {getResourceIcon(item.type)}
                                      </div>
                                      <div className="min-w-0 space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <h6 className="text-xs font-bold text-[var(--ink)] truncate group-hover:text-[var(--amber)] transition-colors">
                                            {item.title}
                                          </h6>
                                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-[var(--paper-2)] text-[var(--muted)] border border-[var(--line)] rounded">
                                            {item.type}
                                          </span>
                                        </div>
                                        
                                        <a 
                                          href={formatUrl(item.url)} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-[11px] font-mono text-blue-500 hover:underline truncate block max-w-md"
                                        >
                                          {item.url}
                                        </a>

                                        {item.description && (
                                          <p className="text-[10px] text-[var(--muted)] line-clamp-1">
                                            {item.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action buttons inside the cell */}
                                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                      <button
                                        onClick={() => handleCopyUrl(item.url)}
                                        className="p-1.5 text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--paper-2)] hover:bg-[var(--line-2)] rounded transition cursor-pointer"
                                        title="Copy URL"
                                      >
                                        {copiedUrl === item.url ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                      </button>
                                      <button
                                        onClick={() => handleOpenEditItem(item)}
                                        className="p-1.5 text-[var(--amber)] hover:bg-[var(--amber-tint)] rounded transition cursor-pointer"
                                        title="Edit resource link"
                                      >
                                        <Edit3 size={13} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteLink(item.id)}
                                        className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500 rounded transition cursor-pointer"
                                        title="Delete resource link"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                {/* Add Link Button at bottom of cell */}
                                <button
                                  onClick={() => handleOpenAddForLesson(lesson.id)}
                                  className="w-full py-1.5 px-3 border border-dashed border-[var(--amber)]/30 hover:border-[var(--amber)] hover:bg-[var(--amber-tint)]/20 rounded-xl text-[11px] font-bold text-[var(--amber)] transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Plus size={13} /> Add Link to {lesson.lessonNumber}
                                </button>
                              </div>
                            )}
                          </td>

                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Guide Box */}
          <div className="bg-[var(--paper-2)] border border-[var(--line-2)] rounded-xl p-4 flex items-start gap-3 text-xs text-[var(--muted)]">
            <Info size={18} className="text-[var(--amber)] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Refined Cell Spreadsheet Engine:</strong> Each lesson displays its own dedicated resource cell. Click <strong>"+ Add Link"</strong> inside any lesson cell to add external videos, slides, sheets, or code references. Edits update live. Click <strong>"Save Changes"</strong> to publish directly to Grade 10 student portals!
            </p>
          </div>

        </div>
      )}

      {/* ADD / EDIT LINK MODAL DIALOG */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#0B0F17] border border-[#1F2937] text-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
            
            {/* Header */}
            <div className="p-4 border-b border-[#1F2937] flex items-center justify-between bg-[#111827]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[var(--amber)]" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  {modalMode === 'add' ? 'Add Resource Link to Lesson Cell' : 'Edit Resource Link'}
                </h3>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="text-gray-400 hover:text-white transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-5 space-y-4 text-xs">
              
              {/* Lesson Picker */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Target Lesson Cell:</label>
                <select
                  value={modalItem.lessonId}
                  onChange={(e) => setModalItem({ ...modalItem, lessonId: e.target.value })}
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--amber)] cursor-pointer"
                >
                  {ALL_LESSONS.map(l => (
                    <option key={l.id} value={l.id}>
                      [{l.unitNumber}] {l.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Resource Title:</label>
                <input
                  type="text"
                  placeholder="e.g. AI vs ML Venn Diagram Explainer"
                  value={modalItem.title}
                  onChange={(e) => setModalItem({ ...modalItem, title: e.target.value })}
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--amber)]"
                />
              </div>

              {/* Resource Type */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Resource Type:</label>
                <select
                  value={modalItem.type}
                  onChange={(e) => setModalItem({ ...modalItem, type: e.target.value as any })}
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--amber)] cursor-pointer"
                >
                  <option value="Document">📄 Document (PDF/Slides)</option>
                  <option value="Video">🎥 Video (YouTube/Explainer)</option>
                  <option value="Spreadsheet">📊 Spreadsheet (Excel/Google Sheets)</option>
                  <option value="Cheat Sheet">📝 Cheat Sheet (Syntax/Code)</option>
                  <option value="Link">🔗 Web Link (Article/Interactive)</option>
                </select>
              </div>

              {/* Link URL */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Link URL:</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={modalItem.url}
                  onChange={(e) => setModalItem({ ...modalItem, url: e.target.value })}
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[var(--amber)]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Brief Description:</label>
                <textarea
                  rows={2}
                  placeholder="Short summary for Grade 10 students..."
                  value={modalItem.description}
                  onChange={(e) => setModalItem({ ...modalItem, description: e.target.value })}
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--amber)] resize-none"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-[#111827] border-t border-[#1F2937] flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModalItem}
                className="px-5 py-2 bg-[var(--amber)] hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>{modalMode === 'add' ? 'Insert into Cell' : 'Update Link'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SPREADSHEET BULK IMPORTER MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#0B0F17] border border-[#1F2937] text-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative">
            
            <div className="p-5 border-b border-[#1F2937] flex items-center justify-between bg-[#111827]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[var(--amber)]" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Bulk Import Spreadsheet Links</h3>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-white transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold text-[var(--amber)] uppercase tracking-wider">Spreadsheet copy-paste format:</span>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Copy cells from Google Sheets or Excel (Ctrl+C) and paste below. Lines are parsed automatically into lesson cells.
                </p>
              </div>

              <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-xl space-y-1">
                <span className="block text-[10px] font-mono text-gray-400 uppercase">Columns Order Expected (5 columns):</span>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono text-[var(--amber)] bg-slate-900/60 p-2 rounded border border-slate-800">
                  <div className="p-1 border-r border-slate-800">Title</div>
                  <div className="p-1 border-r border-slate-800">Type</div>
                  <div className="p-1 border-r border-slate-800">URL Link</div>
                  <div className="p-1 border-r border-slate-800">Lesson ID</div>
                  <div className="p-1">Description</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase">Paste your Spreadsheet Rows here:</label>
                <textarea
                  rows={8}
                  value={bulkPasteText}
                  onChange={(e) => setBulkPasteText(e.target.value)}
                  placeholder="Intro to Neural Networks&#9;Video&#9;https://youtube.com/watch...&#9;u9&#9;Master layers and neurons"
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-xl p-3 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[var(--amber)] resize-none"
                />
              </div>

              {pasteError && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle size={15} />
                  <span>{pasteError}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#111827] border-t border-[#1F2937] flex items-center justify-between">
              <button
                onClick={downloadCSVSample}
                className="text-xs text-gray-400 hover:text-white underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download size={14} /> Download Sample CSV Template
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasteImport}
                  className="px-5 py-2 bg-[var(--amber)] hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-md cursor-pointer"
                >
                  Parse & Insert Rows
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
