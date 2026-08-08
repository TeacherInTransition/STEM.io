import React, { useState } from 'react';
import { RubricEvaluationResult, LearningMetrics } from '../utils/milestonesAndRubrics';
import { Award, BookOpen, Layers, Eye, FolderPlus, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Sparkles, Target } from 'lucide-react';

interface RubricEvaluationCardProps {
  metrics: LearningMetrics;
  rubric: RubricEvaluationResult;
  title?: string;
  subtitle?: string;
}

export default function RubricEvaluationCard({ 
  metrics, 
  rubric, 
  title = "Curriculum Competency & Evaluation Rubric",
  subtitle = "Evaluation framework linked to lesson/unit completion, resource open rate, and % of resources added to lessons."
}: RubricEvaluationCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'lessons' | 'units' | 'resource_opening' | 'resource_inclusion'>('all');

  const filteredCriteria = selectedCategoryFilter === 'all' 
    ? rubric.criteria 
    : rubric.criteria.filter(c => c.category === selectedCategoryFilter);

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#6366F1]/10 text-[#6366F1] rounded-xl">
              <Award size={20} />
            </span>
            <h3 className="text-xl font-bold text-[var(--ink)]">{title}</h3>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Overall Tier Badge */}
          <div className={`px-4 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-2 ${rubric.tierColor}`}>
            <Sparkles size={16} />
            <span>{rubric.tierLabel} Tier ({rubric.totalScore} / {rubric.maxScore} Pts)</span>
          </div>

          <button 
            onClick={() => setExpanded(!expanded)}
            className="p-2 bg-[var(--paper-2)] hover:bg-[var(--line)] border border-[var(--line)] text-[var(--ink)] rounded-xl transition"
            title={expanded ? "Collapse Rubric Matrix" : "Expand Rubric Matrix"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* 4 Metric Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Lesson Completion */}
        <div className="bg-[var(--paper)] border border-[var(--line)] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-[#6366F1]" /> Lessons</span>
            <span>{metrics.completedLessonsPct}%</span>
          </div>
          <div className="text-xl font-black text-[var(--ink)]">{metrics.completedLessonsCount} / {metrics.totalLessons}</div>
          <div className="w-full bg-[var(--line)] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#6366F1] h-full rounded-full transition-all duration-500" style={{ width: `${metrics.completedLessonsPct}%` }}></div>
          </div>
        </div>

        {/* Metric 2: Unit Mastery */}
        <div className="bg-[var(--paper)] border border-[var(--line)] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Layers size={14} className="text-amber-500" /> Units</span>
            <span>{metrics.completedUnitsPct}%</span>
          </div>
          <div className="text-xl font-black text-[var(--ink)]">{metrics.completedUnitsCount} / {metrics.totalUnits}</div>
          <div className="w-full bg-[var(--line)] h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.completedUnitsPct}%` }}></div>
          </div>
        </div>

        {/* Metric 3: Resource Open Rate */}
        <div className="bg-[var(--paper)] border border-[var(--line)] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Eye size={14} className="text-emerald-500" /> Open Rate</span>
            <span>{metrics.resourceOpenRatePct}%</span>
          </div>
          <div className="text-xl font-black text-[var(--ink)]">{metrics.openedResourcesCount} / {metrics.totalResources}</div>
          <div className="w-full bg-[var(--line)] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.resourceOpenRatePct}%` }}></div>
          </div>
        </div>

        {/* Metric 4: Dedicated Variable -> % of Resources Added to Lessons */}
        <div className="bg-gradient-to-br from-[#06B6D4]/10 to-[#6366F1]/10 border border-[#06B6D4]/30 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-extrabold text-[#06B6D4] uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><FolderPlus size={14} /> % Added to Lessons</span>
            <span>{metrics.resourcesAddedToLessonsPct}%</span>
          </div>
          <div className="text-xl font-black text-[var(--ink)]">
            {metrics.resourcesAddedToLessonsCount} / {metrics.totalResources} <span className="text-xs font-semibold text-[var(--muted)]">({metrics.lessonsWithResourcesCount} Lessons)</span>
          </div>
          <div className="w-full bg-[var(--line)] h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#06B6D4] to-[#6366F1] h-full rounded-full transition-all duration-500" style={{ width: `${metrics.resourcesAddedToLessonsPct}%` }}></div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="space-y-6 pt-2">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap border-b border-[var(--line)] pb-3">
            <span className="text-xs font-bold text-[var(--muted)] mr-2 uppercase tracking-wider">Filter Criteria:</span>
            {[
              { id: 'all', label: 'All Criteria' },
              { id: 'lessons', label: 'Lesson Completion' },
              { id: 'units', label: 'Unit Mastery' },
              { id: 'resource_opening', label: 'Resource Open Rate' },
              { id: 'resource_inclusion', label: '% Resources in Lessons' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategoryFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedCategoryFilter === tab.id
                    ? 'bg-[#6366F1] text-white shadow-xs'
                    : 'bg-[var(--paper-2)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Criteria Cards Grid */}
          <div className="space-y-4">
            {filteredCriteria.map((criterion) => (
              <div key={criterion.id} className="bg-[var(--paper)] border border-[var(--line)] rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                      <Target size={16} className="text-[#6366F1]" />
                      <span>{criterion.title}</span>
                    </h4>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{criterion.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-[var(--muted)]">Current:</span>
                    <span className="px-3 py-1 bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/30 text-xs font-extrabold rounded-full">
                      {criterion.metricValueText}
                    </span>
                  </div>
                </div>

                {/* 4 Levels Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {criterion.levels.map((lvl) => {
                    const isCurrent = criterion.currentLevelScore === lvl.score;
                    const isPassed = criterion.currentLevelScore >= lvl.score;

                    return (
                      <div 
                        key={lvl.score}
                        className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-[#6366F1]/10 border-[#6366F1] shadow-xs'
                            : isPassed
                            ? 'bg-[var(--surface)] border-[var(--line)] opacity-80'
                            : 'bg-[var(--paper-2)] border-[var(--line)] opacity-50'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[11px] font-black uppercase ${isCurrent ? 'text-[#6366F1]' : 'text-[var(--muted)]'}`}>
                              Lvl {lvl.score}: {lvl.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] bg-[#6366F1] text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <CheckCircle2 size={10} /> Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-[var(--ink)] mb-1">{lvl.rangeText}</div>
                          <p className="text-[11px] text-[var(--muted)] leading-relaxed">{lvl.description}</p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[var(--line)] text-[10px] font-semibold text-[var(--muted)]">
                          {lvl.score} Point{lvl.score > 1 ? 's' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recommendation Footer */}
                <div className="bg-[var(--paper-2)] border border-[var(--line)] p-3 rounded-lg flex items-start gap-2 text-xs">
                  <AlertCircle size={15} className="text-[#06B6D4] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[var(--ink)] mr-1">Actionable Recommendation:</span>
                    <span className="text-[var(--muted)]">{criterion.recommendation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Feedback Box */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-0.5">Competency System Status</div>
              <div>{rubric.overallFeedback}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
