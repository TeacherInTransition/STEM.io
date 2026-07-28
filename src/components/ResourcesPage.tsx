import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { 
  Search, Plus, Trash2, CheckCircle2, FileText, Video, ExternalLink, 
  FileSpreadsheet, AlertTriangle, Download, Upload, Database, BookOpen, 
  Sparkles, BookMarked, RefreshCw, Sliders, X, Info, Coins, HelpCircle,
  TrendingUp, Check, ChevronRight, FileCode
} from 'lucide-react';
import { curriculum } from '../curriculumData';
import { aiFoundationsCurriculum } from '../aiFoundationsData';
import { ResourceItem, fetchResourcesFromDb, saveResourcesToDb, awardStemios } from '../lib/firebase';

interface ResourcesPageProps {
  user: User;
}

// Flat list of lessons for dictionary lookup and selection dropdowns
const ALL_LESSONS = [
  ...curriculum.flatMap(s => s.units.map(u => ({ id: u.id, title: u.title, category: s.title }))),
  ...aiFoundationsCurriculum.flatMap(s => s.units.map(u => ({ id: u.id, title: u.title, category: s.title }))),
  { id: 'history-of-ai', title: 'History of AI', category: 'Custom Lessons' },
  { id: 'narrow-vs-general', title: 'Narrow vs General AI', category: 'Custom Lessons' },
  { id: 'python-basics', title: 'Introduction to Python', category: 'Custom Lessons' }
];

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

  // Load resources and student completions on mount
  useEffect(() => {
    loadData();
    // Load student's completed resources from localStorage
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

  // Student marks a resource as opened/completed
  const handleResourceOpen = async (resource: ResourceItem) => {
    // Open in new tab referrer safe
    window.open(resource.url, '_blank', 'noopener,noreferrer');

    // Prevent double completions
    if (completedResources.includes(resource.id)) return;

    // Increment local views count
    setResources(prev => prev.map(r => r.id === resource.id ? { ...r, views: (r.views || 0) + 1 } : r));
    
    const newCompletions = [...completedResources, resource.id];
    setCompletedResources(newCompletions);
    localStorage.setItem(`stemio_completed_resources_${user.id}`, JSON.stringify(newCompletions));

    // Award +5 Stemios for reviewing resource
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

  // Render correct icon depending on type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return <Video className="text-[#EF4444]" size={18} />;
      case 'Document':
        return <FileText className="text-[#3B82F6]" size={18} />;
      case 'Spreadsheet':
        return <FileSpreadsheet className="text-[#10B981]" size={18} />;
      case 'Cheat Sheet':
        return <FileCode className="text-[#F59E0B]" size={18} />;
      default:
        return <ExternalLink className="text-[var(--muted)]" size={18} />;
    }
  };

  // Helper to map Lesson ID to Name
  const getLessonName = (id: string) => {
    const found = ALL_LESSONS.find(l => l.id === id);
    return found ? found.title : `Lesson Reference (${id})`;
  };

  // Filtered resources list for the student
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            res.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'All' || res.type === typeFilter;
      const matchesLesson = lessonFilter === 'All' || res.lessonId === lessonFilter;
      return matchesSearch && matchesType && matchesLesson;
    });
  }, [resources, searchQuery, typeFilter, lessonFilter]);

  // Completion progress percentage
  const completionPercentage = useMemo(() => {
    if (resources.length === 0) return 0;
    const completedCount = resources.filter(r => completedResources.includes(r.id)).length;
    return Math.round((completedCount / resources.length) * 100);
  }, [resources, completedResources]);

  // Interactive Grid Functions for Admin/Teacher
  const handleCellEdit = (index: number, field: keyof ResourceItem, value: any) => {
    setGridRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setIsGridDirty(true);
  };

  const handleAddRow = () => {
    const newRow: ResourceItem = {
      id: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: 'New Lesson Resource',
      type: 'Link',
      url: 'https://',
      lessonId: ALL_LESSONS[0]?.id || 'u1',
      description: 'Add a helpful overview describing this learning asset.',
      views: 0
    };
    setGridRows(prev => [...prev, newRow]);
    setIsGridDirty(true);
  };

  const handleDeleteRow = (index: number) => {
    setGridRows(prev => prev.filter((_, i) => i !== index));
    setIsGridDirty(true);
  };

  const handleRevertChanges = () => {
    setGridRows(JSON.parse(JSON.stringify(resources)));
    setIsGridDirty(false);
    setPasteError(null);
  };

  // Copy paste parsing logic
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
        
        // Split on Tab (default Excel/Google Sheets separator) or comma
        const cells = line.includes('\t') ? line.split('\t') : line.split(',');
        if (cells.length < 2) continue;

        const col0 = cells[0].toLowerCase();
        // Skip header lines
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
        setPasteError('Could not parse any valid rows. Please check instructions.');
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
        alert('🌐 Cloud Database synchronized successfully! All systems are up-to-date.');
      } else {
        alert('Synchronization warning: Changes saved to local browser sandbox.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating database. Sinking back to sandbox storage.');
    } finally {
      setSaving(false);
    }
  };

  // Demo CSV Export
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
    <div className="flex-1 w-full max-w-7xl mx-auto p-6 space-y-6 animate-fadeIn" style={{ backgroundColor: 'transparent' }}>
      
      {/* HUD Floating Reward Toast */}
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
            Reference Sheets & Video Library
          </h1>
          <p className="text-xs text-[var(--muted)] max-w-2xl mt-1 leading-relaxed">
            Boost your understanding of Grade 10 computer engineering topics. Access verified external worksheets, Python syntax cards, interactive spreadsheets, and video explainers. Completing assets awards <strong className="text-[var(--amber)]">+5 Stemios</strong>.
          </p>
        </div>

        {/* User Role Quick Switch Tabs */}
        {(user.isAdmin || user.role === 'teacher') && (
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

      {activeTab === 'browse' ? (
        <>
          {/* STUDENT PROGRESS & QUICK STATS BAR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Completion Progress Card */}
            <div className="bg-[var(--paper-2)] border border-[var(--line-2)] p-4 rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--muted)]">Resource Completion</span>
                <div className="text-xl font-bold text-[var(--ink)] flex items-baseline gap-1">
                  <span>{completionPercentage}%</span>
                  <span className="text-[11px] text-[var(--muted)] font-normal">({resources.filter(r => completedResources.includes(r.id)).length}/{resources.length} read)</span>
                </div>
              </div>
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="var(--line-2)" strokeWidth="4" />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="26" 
                    fill="none" 
                    stroke="var(--amber)" 
                    strokeWidth="4" 
                    strokeDasharray={163.36}
                    strokeDashoffset={163.36 - (163.36 * Math.min(completionPercentage, 100)) / 100}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute font-mono text-xs font-bold text-[var(--amber)]">{completionPercentage}%</div>
              </div>
            </div>

            {/* Reward Potential Tracker */}
            <div className="bg-[var(--paper-2)] border border-[var(--line-2)] p-4 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--muted)]">Active Rewards Remaining</span>
                <div className="text-xl font-bold text-[var(--amber)] flex items-center gap-1.5">
                  <Coins size={18} className="text-[var(--amber)]" />
                  <span>{(resources.length - resources.filter(r => completedResources.includes(r.id)).length) * 5} Stemios</span>
                </div>
              </div>
              <div className="p-3 bg-[var(--amber-tint)] rounded-lg text-[var(--amber)]">
                <Sparkles size={20} />
              </div>
            </div>

            {/* Curriculum Resource Density Card */}
            <div className="bg-[var(--paper-2)] border border-[var(--line-2)] p-4 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--muted)]">Core Integration</span>
                <div className="text-xl font-bold text-[var(--ink)]">
                  <span>Fully MUIDS-Aligned</span>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>

          {/* FILTERS & SEARCH ROW */}
          <div className="flex flex-col md:flex-row gap-4 bg-[var(--paper-2)] border border-[var(--line-2)] p-4 rounded-xl">
            {/* Search */}
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

            {/* Type filter */}
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

            {/* Lesson association filter */}
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
                Try adjusting your text search, clearing filters, or requesting your Course Administrator to upload spreadsheet reference items.
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
                return (
                  <div 
                    key={res.id}
                    id={`resource-card-${res.id}`}
                    className="bg-[var(--paper-2)] border border-[var(--line-2)] hover:border-[var(--amber)]/30 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-[1px] relative group"
                  >
                    <div>
                      {/* Top badges bar */}
                      <div className="flex items-center justify-between mb-3.5 gap-2">
                        <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] px-2.5 py-1 rounded-full">
                          {getResourceIcon(res.type)}
                          <span>{res.type}</span>
                        </span>
                        
                        <span className="text-[10px] font-mono bg-[var(--amber-tint)] text-[var(--amber)] px-2 py-0.5 rounded-md border border-[var(--amber)]/15 font-semibold">
                          {res.lessonId}
                        </span>
                      </div>

                      {/* Main resource details */}
                      <h3 className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--amber)] transition-colors line-clamp-1 mb-1.5">
                        {res.title}
                      </h3>
                      <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3 mb-4 h-[54px]">
                        {res.description}
                      </p>
                    </div>

                    {/* Bottom Action Section */}
                    <div className="border-t border-[var(--line-2)] pt-3.5 mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[var(--muted)] font-mono">
                        Linked: <strong className="text-[var(--ink-soft)] font-normal">{getLessonName(res.lessonId)}</strong>
                      </span>
                      
                      <button
                        onClick={() => handleResourceOpen(res)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
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
                            <ExternalLink size={13} />
                            <span>Study & Earn</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Completed visual badge ribbon */}
                    {isCompleted && (
                      <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-emerald-500 text-white rounded-full border-2 border-[var(--paper-2)]">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SYLLABUS DOCUMENT & GUIDE REFERENCE CARD */}
          <div className="bg-[var(--paper-2)] border border-[var(--line-2)] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--amber-tint)] rounded-xl text-[var(--amber)] shrink-0">
                <FileSpreadsheet size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wide">Course Syllabus & Curriculum Planner</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed max-w-2xl">
                  Review the official MUIDS learning timeline, homework worksheets, grading rubrics, and project guidelines directly.
                </p>
              </div>
            </div>
            <a 
              href="https://docs.google.com/spreadsheets/d/1muids-timeline-2026/edit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full md:w-auto px-5 py-2.5 bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--amber)]/30 rounded-xl text-xs font-bold text-[var(--ink)] hover:text-[var(--amber)] transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              <ExternalLink size={14} />
              <span>Open Master Spreadsheet</span>
            </a>
          </div>
        </>
      ) : (
        /* ADMIN/TEACHER INTERACTIVE GRID SPREADSHEET EDITOR */
        <div className="space-y-6">
          
          {/* Top Admin Tools Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[var(--paper-2)] border border-[var(--line-2)] p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Database className="text-[var(--amber)]" size={18} />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--ink)]">Database Grid Control</h3>
                <p className="text-[10px] text-[var(--muted)] font-mono">
                  {gridRows.length} total rows active • {isGridDirty ? <span className="text-yellow-500 font-bold">Unsaved changes</span> : <span className="text-emerald-500">Synced to Cloud</span>}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-3.5 py-2 bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--amber)]/30 rounded-lg text-xs font-bold text-[var(--ink)] hover:text-[var(--amber)] transition-all flex items-center gap-1.5"
              >
                <Upload size={14} /> Paste Spreadsheet (Excel/CSV)
              </button>
              
              <button
                onClick={handleAddRow}
                className="px-3.5 py-2 bg-[var(--amber-tint)] hover:bg-[var(--amber)]/20 text-[var(--amber)] border border-[var(--amber)]/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Row
              </button>

              <div className="h-6 w-[1px] bg-[var(--line-2)] mx-1"></div>

              {isGridDirty && (
                <>
                  <button
                    onClick={handleRevertChanges}
                    className="px-3.5 py-2 bg-transparent hover:bg-rose-500/10 text-rose-400 border border-transparent hover:border-rose-500/20 rounded-lg text-xs font-bold transition-all"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    {saving ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                    <span>Save Changes</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* SPREADSHEET TABLE GRID CONTAINER */}
          <div className="border border-[var(--line-2)] rounded-xl bg-[var(--paper-2)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
                <thead>
                  <tr className="bg-[var(--paper)] text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] border-b border-[var(--line-2)]">
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3 w-64">Resource Title</th>
                    <th className="p-3 w-36">Type</th>
                    <th className="p-3 w-64">Link URL</th>
                    <th className="p-3 w-48">Linked Lesson</th>
                    <th className="p-3 w-80">Brief Description</th>
                    <th className="p-3 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line-2)] text-xs text-[var(--ink-soft)]">
                  {gridRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-[var(--surface)]/40 transition-colors">
                      {/* Count */}
                      <td className="p-3 text-center font-mono text-[var(--muted)] bg-[var(--paper)]/20">{idx + 1}</td>
                      
                      {/* Title Cell */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.title}
                          onChange={(e) => handleCellEdit(idx, 'title', e.target.value)}
                          className="w-full bg-[var(--surface)] border border-[var(--line)] rounded px-2.5 py-1.5 focus:outline-none focus:border-[var(--amber)] text-xs text-[var(--ink)]"
                        />
                      </td>

                      {/* Type Cell */}
                      <td className="p-2">
                        <select
                          value={row.type}
                          onChange={(e) => handleCellEdit(idx, 'type', e.target.value)}
                          className="w-full bg-[var(--surface)] border border-[var(--line)] rounded px-2 py-1.5 focus:outline-none focus:border-[var(--amber)] text-xs text-[var(--ink)] cursor-pointer"
                        >
                          <option value="Video">Video</option>
                          <option value="Document">Document</option>
                          <option value="Spreadsheet">Spreadsheet</option>
                          <option value="Cheat Sheet">Cheat Sheet</option>
                          <option value="Link">Web Link</option>
                        </select>
                      </td>

                      {/* URL Link Cell */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.url}
                          onChange={(e) => handleCellEdit(idx, 'url', e.target.value)}
                          className="w-full bg-[var(--surface)] border border-[var(--line)] rounded px-2.5 py-1.5 focus:outline-none focus:border-[var(--amber)] text-xs text-[var(--ink)] font-mono"
                        />
                      </td>

                      {/* Linked Lesson ID Cell */}
                      <td className="p-2">
                        <select
                          value={row.lessonId}
                          onChange={(e) => handleCellEdit(idx, 'lessonId', e.target.value)}
                          className="w-full bg-[var(--surface)] border border-[var(--line)] rounded px-2 py-1.5 focus:outline-none focus:border-[var(--amber)] text-xs text-[var(--ink)] cursor-pointer"
                        >
                          {ALL_LESSONS.map(l => (
                            <option key={l.id} value={l.id}>
                              [{l.id}] {l.title.substring(0, 24)}...
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Description Cell */}
                      <td className="p-2">
                        <textarea
                          rows={1}
                          value={row.description}
                          onChange={(e) => handleCellEdit(idx, 'description', e.target.value)}
                          className="w-full bg-[var(--surface)] border border-[var(--line)] rounded px-2.5 py-1.5 focus:outline-none focus:border-[var(--amber)] text-xs text-[var(--ink)] resize-none"
                        />
                      </td>

                      {/* Actions delete row */}
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleDeleteRow(idx)}
                          className="p-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 rounded transition"
                          title="Delete resource row"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {gridRows.length === 0 && (
              <div className="p-8 text-center text-[var(--muted)] font-mono text-xs">
                No spreadsheet rows declared yet. Click "+ Add Row" or "Paste Spreadsheet" to populate.
              </div>
            )}
          </div>

          {/* HINTS GUIDE */}
          <div className="bg-[var(--paper-2)] border border-[var(--line-2)] rounded-xl p-5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--ink)] flex items-center gap-1.5">
              <Info size={14} className="text-[var(--amber)]" />
              <span>How direct spreadsheet editing works</span>
            </h4>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              This grid acts as a real-time, interactive table. Simply click on any input field or dropdown selection to make immediate changes. Changes are saved locally on your client machine as a preview. Once you are satisfied with the curriculum resource map, click <strong>"Save Changes"</strong> to synchronize the database with Google Firestore. All Grade 10 students will instantly see the updated directory!
            </p>
          </div>
        </div>
      )}

      {/* SPREADSHEET BULK IMPORTER MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#0B0F17] border border-[#1F2937] text-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative">
            
            {/* Header */}
            <div className="p-5 border-b border-[#1F2937] flex items-center justify-between bg-[#111827]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[#06B6D4]" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Bulk Import from Google Sheets / Excel</h3>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold text-[#06B6D4] uppercase tracking-wider">Spreadsheet copy-paste format:</span>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Open Google Sheets or Microsoft Excel. Select your cells, copy them (Ctrl+C), and paste them directly in the window below. The importer supports standard TSV (Tab Separated) and CSV formats.
                </p>
              </div>

              {/* Format Columns Definition Box */}
              <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-xl space-y-1">
                <span className="block text-[10px] font-mono text-gray-400 uppercase">Columns Order Expected (5 columns):</span>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono text-[#06B6D4] bg-slate-900/60 p-2 rounded border border-slate-800">
                  <div className="p-1 border-r border-slate-800">Title</div>
                  <div className="p-1 border-r border-slate-800">Type</div>
                  <div className="p-1 border-r border-slate-800">URL Link</div>
                  <div className="p-1 border-r border-slate-800">Lesson ID</div>
                  <div className="p-1">Description</div>
                </div>
                <div className="mt-2 text-[10px] text-gray-400 leading-relaxed">
                  <strong>Type matches:</strong> video, document, spreadsheet, cheat sheet, link.<br />
                  <strong>Lesson ID matches:</strong> u1, u2, u3... (AI Foundations), s1, s2... (Systems), python-basics, etc.
                </div>
              </div>

              {/* Textarea Paste Area */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase">Paste your Spreadsheet Rows here:</label>
                <textarea
                  rows={8}
                  value={bulkPasteText}
                  onChange={(e) => setBulkPasteText(e.target.value)}
                  placeholder="Intro to Neural Networks&#9;Video&#9;https://youtube.com/watch...&#9;u9&#9;Master layers and neurons"
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-xl p-3 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#06B6D4] resize-none"
                />
              </div>

              {pasteError && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle size={15} />
                  <span>{pasteError}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#111827] border-t border-[#1F2937] flex items-center justify-between">
              <button
                onClick={downloadCSVSample}
                className="text-xs text-gray-400 hover:text-white underline font-semibold flex items-center gap-1"
              >
                <Download size={14} /> Download Sample Template
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasteImport}
                  className="px-5 py-2 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-slate-950 font-bold text-xs rounded-xl transition shadow-md"
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
