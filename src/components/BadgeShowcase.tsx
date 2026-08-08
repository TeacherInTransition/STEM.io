import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { 
  EXPANDED_MILESTONES, 
  calculateLearningMetrics, 
  generateCompetencyRubric, 
  MilestoneCategory, 
  MilestoneDef 
} from '../utils/milestonesAndRubrics';
import RubricEvaluationCard from './RubricEvaluationCard';
import { Award, Target, Zap, Star, Shield, Lock, CheckCircle2, BookOpen, Layers, Eye, FolderPlus, Trophy, Sparkles } from 'lucide-react';

interface BadgeShowcaseProps {
  user: User;
}

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Award,
  Trophy,
  Sparkles,
  Layers,
  Shield,
  Target,
  Eye,
  Zap,
  Star,
  FolderPlus
};

export default function BadgeShowcase({ user }: BadgeShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<MilestoneCategory>('all');
  const [completedResourceIds, setCompletedResourceIds] = useState<string[]>([]);
  const [allResources, setAllResources] = useState<Array<{ id: string; lessonId?: string }>>([]);

  useEffect(() => {
    // Load student completed resources from localStorage
    try {
      const saved = localStorage.getItem(`stemio_completed_resources_${user.id}`);
      if (saved) {
        setCompletedResourceIds(JSON.parse(saved));
      }
      
      const savedResources = localStorage.getItem('stemio_custom_resources_grid');
      if (savedResources) {
        const parsed = JSON.parse(savedResources);
        setAllResources(parsed.map((r: any) => ({ id: String(r.id), lessonId: r.lessonId })));
      } else {
        // Fallback default sample count
        setAllResources([
          { id: '1', lessonId: 'what-is-ai' },
          { id: '2', lessonId: 'history-of-ai' },
          { id: '3', lessonId: 'narrow-vs-general' },
          { id: '4', lessonId: 'python-basics' },
          { id: '5', lessonId: 'ml-ethics' },
          { id: '6', lessonId: 'vibe-coding' },
          { id: '7', lessonId: 'neural-networks' },
          { id: '8', lessonId: 'general' }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user.id]);

  // Compute live metrics
  // Assume user stemios and completed lessons
  const estimatedCompletedLessons = Math.min(10, Math.max(1, Math.floor(user.stemios / 45)));
  const completedLessonIds = Array.from({ length: estimatedCompletedLessons }, (_, i) => `lesson-${i + 1}`);
  const estimatedCompletedUnits = Math.min(5, Math.floor(user.stemios / 120));
  const completedUnitNumbers = Array.from({ length: estimatedCompletedUnits }, (_, i) => `unit-${i + 1}`);

  const metrics = calculateLearningMetrics(
    completedLessonIds,
    completedUnitNumbers,
    completedResourceIds,
    allResources,
    10,
    5
  );

  const rubric = generateCompetencyRubric(metrics);

  const filteredMilestones = activeCategory === 'all'
    ? EXPANDED_MILESTONES
    : EXPANDED_MILESTONES.filter(m => m.category === activeCategory);

  const unlockedCount = EXPANDED_MILESTONES.filter(m => m.checkUnlocked(metrics, user.stemios)).length;

  return (
    <div className="min-h-screen bg-[var(--paper)] p-3 sm:p-6 md:p-10 font-sans text-[var(--ink)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="text-center md:text-left border-b border-[var(--line)] pb-6">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
            <span className="p-2 bg-[#6366F1]/10 text-[#6366F1] rounded-xl">
              <Trophy size={24} />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#6366F1]">STEM Competency Framework</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-[var(--ink)]">
            Milestones & Competency Rubrics
          </h1>
          <p className="text-[var(--muted)] max-w-2xl text-sm leading-relaxed">
            Track competency ratings across lesson completion, unit mastery, higher resource open rates, and curriculum inclusion (% of resources added to lessons).
          </p>
        </header>

        {/* Competency Evaluation Rubric Component */}
        <RubricEvaluationCard 
          metrics={metrics} 
          rubric={rubric} 
          title="Personal Competency & Evaluation Rubric"
          subtitle="Rubric evaluating lesson completion, unit mastery, resource open rate, and % of resources added to lessons."
        />

        {/* Milestone Category Filter Bar */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--ink)]">
                <Award className="text-amber-500 w-6 h-6" /> Expanded Milestone Showcase
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Unlocked {unlockedCount} of {EXPANDED_MILESTONES.length} milestones across curriculum tracks.
              </p>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All Milestones' },
                { id: 'lessons', label: 'Lessons' },
                { id: 'units', label: 'Units' },
                { id: 'resource_opening', label: 'Resource Opening' },
                { id: 'resource_inclusion', label: '% Resources Added' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as MilestoneCategory)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeCategory === cat.id
                      ? 'bg-[#6366F1] text-white shadow-xs'
                      : 'bg-[var(--paper-2)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Milestones Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMilestones.map((milestone) => {
              const isUnlocked = milestone.checkUnlocked(metrics, user.stemios);
              const IconComponent = ICON_MAP[milestone.iconName] || Award;

              return (
                <div 
                  key={milestone.id}
                  className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 ${
                    isUnlocked 
                      ? 'bg-[var(--surface)] border-amber-500/40 shadow-sm' 
                      : 'bg-[var(--paper-2)] border-[var(--line)] opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      isUnlocked ? 'bg-amber-500/10 text-amber-600' : 'bg-[var(--line)] text-[var(--muted)]'
                    }`}>
                      <IconComponent size={28} strokeWidth={isUnlocked ? 2.5 : 2} />
                    </div>

                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      milestone.category === 'lessons' 
                        ? 'bg-[#6366F1]/10 text-[#6366F1]' 
                        : milestone.category === 'units'
                        ? 'bg-amber-500/10 text-amber-600'
                        : milestone.category === 'resource_opening'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-cyan-500/10 text-cyan-600'
                    }`}>
                      {milestone.category.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className={`font-bold text-base mb-1 ${isUnlocked ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {milestone.title}
                  </h3>

                  <p className="text-xs text-[var(--muted)] mb-4 leading-relaxed flex-grow">
                    {milestone.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-[var(--line)] flex items-center justify-between">
                    {isUnlocked ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">
                        <CheckCircle2 size={14} /> Unlocked (+{milestone.stemiosReward} Stemios)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] bg-[var(--line)]/50 px-3 py-1 rounded-full">
                        <Lock size={14} /> {milestone.requirementLabel}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
