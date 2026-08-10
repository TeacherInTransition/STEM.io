import { Award, Zap, Shield, Star, BookOpen, Layers, Eye, FolderPlus, CheckCircle2, Trophy, Target, Sparkles } from 'lucide-react';

export type MilestoneCategory = 'all' | 'lessons' | 'units' | 'resource_opening' | 'resource_inclusion';

export interface MilestoneDef {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  requirementLabel: string;
  stemiosReward: number;
  iconName: string;
  checkUnlocked: (metrics: LearningMetrics, stemios: number) => boolean;
}

export interface LearningMetrics {
  totalLessons: number;
  completedLessonsCount: number;
  completedLessonsPct: number;
  
  totalUnits: number;
  completedUnitsCount: number;
  completedUnitsPct: number;
  
  totalResources: number;
  openedResourcesCount: number;
  resourceOpenRatePct: number;
  
  // Dedicated variable linked to % of resources added to lessons
  resourcesAddedToLessonsCount: number;
  resourcesAddedToLessonsPct: number;
  lessonsWithResourcesCount: number;
  lessonsWithResourcesPct: number;
}

export interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  category: 'lessons' | 'units' | 'resource_opening' | 'resource_inclusion';
  metricValueText: string;
  currentLevelScore: 1 | 2 | 3 | 4; // 1: Novice, 2: Developing, 3: Proficient, 4: Exemplary
  levels: {
    score: 1 | 2 | 3 | 4;
    label: 'Novice' | 'Developing' | 'Proficient' | 'Exemplary';
    rangeText: string;
    description: string;
  }[];
  recommendation: string;
}

export interface RubricEvaluationResult {
  totalScore: number; // Out of 16
  maxScore: number; // 16
  tierLabel: 'Novice' | 'Developing' | 'Proficient' | 'Exemplary';
  tierColor: string;
  criteria: RubricCriterion[];
  overallFeedback: string;
}

/**
 * Calculates comprehensive metrics including the key variable:
 * % of resources added to lessons (resourcesAddedToLessonsPct)
 */
export function calculateLearningMetrics(
  completedLessonIds: string[] = [],
  completedUnitNumbers: string[] = [],
  completedResourceIds: string[] = [],
  allResourcesList: Array<{ id: string; lessonId?: string }> = [],
  totalLessonsCount: number = 10,
  totalUnitsCount: number = 5
): LearningMetrics {
  const totalResources = allResourcesList.length;
  
  // Opened / Completed resources
  const openedResourcesCount = allResourcesList.filter(r => completedResourceIds.includes(r.id)).length;
  const resourceOpenRatePct = totalResources > 0 ? Math.round((openedResourcesCount / totalResources) * 100) : 0;
  
  // Key Variable: Resources added/linked to specific lessons
  const resourcesAddedToLessonsCount = allResourcesList.filter(
    r => Boolean(r.lessonId) && r.lessonId !== 'general' && r.lessonId !== 'unassigned'
  ).length;
  const resourcesAddedToLessonsPct = totalResources > 0 ? Math.round((resourcesAddedToLessonsCount / totalResources) * 100) : 0;
  
  // Count unique lessons that have at least 1 resource attached
  const uniqueLessonsWithResources = new Set(
    allResourcesList
      .filter(r => Boolean(r.lessonId) && r.lessonId !== 'general')
      .map(r => r.lessonId)
  );
  const lessonsWithResourcesCount = uniqueLessonsWithResources.size;
  const lessonsWithResourcesPct = totalLessonsCount > 0 ? Math.round((lessonsWithResourcesCount / totalLessonsCount) * 100) : 0;

  // Lesson & Unit completion rates
  const completedLessonsCount = completedLessonIds.length;
  const completedLessonsPct = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;
  
  const completedUnitsCount = completedUnitNumbers.length;
  const completedUnitsPct = totalUnitsCount > 0 ? Math.round((completedUnitsCount / totalUnitsCount) * 100) : 0;

  return {
    totalLessons: totalLessonsCount,
    completedLessonsCount,
    completedLessonsPct,
    
    totalUnits: totalUnitsCount,
    completedUnitsCount,
    completedUnitsPct,
    
    totalResources,
    openedResourcesCount,
    resourceOpenRatePct,
    
    resourcesAddedToLessonsCount,
    resourcesAddedToLessonsPct,
    lessonsWithResourcesCount,
    lessonsWithResourcesPct
  };
}

/**
 * Expanded List of Milestones across Lessons, Units, Resource Opening, and Resource Inclusion
 */
export const EXPANDED_MILESTONES: MilestoneDef[] = [
  // 1. Lesson Completion Milestones
  {
    id: 'lesson-pioneer',
    title: 'First Step Learner',
    description: 'Successfully complete your first STEM lesson module.',
    category: 'lessons',
    requirementLabel: '1 Lesson Complete',
    stemiosReward: 10,
    iconName: 'BookOpen',
    checkUnlocked: (m) => m.completedLessonsCount >= 1
  },
  {
    id: 'lesson-adventurer',
    title: 'Lesson Adventurer',
    description: 'Complete 5 interactive lessons across computing electives.',
    category: 'lessons',
    requirementLabel: '5 Lessons Complete',
    stemiosReward: 50,
    iconName: 'Award',
    checkUnlocked: (m) => m.completedLessonsCount >= 5
  },
  {
    id: 'lesson-conqueror',
    title: 'Curriculum Conqueror',
    description: 'Complete 10 or more core lessons in the AI Foundations path.',
    category: 'lessons',
    requirementLabel: '10 Lessons Complete',
    stemiosReward: 150,
    iconName: 'Trophy',
    checkUnlocked: (m) => m.completedLessonsCount >= 10
  },
  {
    id: 'lesson-master',
    title: 'Master Scholar',
    description: 'Achieve 80%+ completion across all available curriculum lessons.',
    category: 'lessons',
    requirementLabel: '80%+ Lesson Completion',
    stemiosReward: 300,
    iconName: 'Sparkles',
    checkUnlocked: (m) => m.completedLessonsPct >= 80
  },

  // 2. Unit Completion Milestones
  {
    id: 'unit-novice',
    title: 'Unit Apprentice',
    description: 'Complete all lessons and quizzes in 1 full learning unit.',
    category: 'units',
    requirementLabel: '1 Unit Mastered',
    stemiosReward: 25,
    iconName: 'Layers',
    checkUnlocked: (m) => m.completedUnitsCount >= 1
  },
  {
    id: 'unit-specialist',
    title: 'Unit Specialist',
    description: 'Master 3 full instructional units with passing assessment scores.',
    category: 'units',
    requirementLabel: '3 Units Mastered',
    stemiosReward: 100,
    iconName: 'Shield',
    checkUnlocked: (m) => m.completedUnitsCount >= 3
  },
  {
    id: 'unit-titan',
    title: 'Full Track Titan',
    description: 'Achieve 100% mastery across all 5 structured STEM curriculum units.',
    category: 'units',
    requirementLabel: 'All Units Mastered',
    stemiosReward: 250,
    iconName: 'Target',
    checkUnlocked: (m) => m.completedUnitsCount >= 5 || m.completedUnitsPct >= 100
  },

  // 3. Higher Rate of Opening Resources Milestones
  {
    id: 'resource-explorer',
    title: 'Resource Explorer',
    description: 'Open at least 5 reference materials or maintain a 25%+ resource opening rate.',
    category: 'resource_opening',
    requirementLabel: '5 Resources Opened / 25%',
    stemiosReward: 30,
    iconName: 'Eye',
    checkUnlocked: (m) => m.openedResourcesCount >= 5 || m.resourceOpenRatePct >= 25
  },
  {
    id: 'knowledge-seeker',
    title: 'Knowledge Seeker',
    description: 'Open at least 10 reference materials and datasets or achieve a 50%+ resource open rate.',
    category: 'resource_opening',
    requirementLabel: '10 Resources Opened / 50%',
    stemiosReward: 75,
    iconName: 'Zap',
    checkUnlocked: (m) => m.openedResourcesCount >= 10 || m.resourceOpenRatePct >= 50
  },
  {
    id: 'research-scholar',
    title: 'Research Scholar',
    description: 'Demonstrate deep inquiry with 15+ resources opened or an 80%+ resource open rate.',
    category: 'resource_opening',
    requirementLabel: '15 Resources Opened / 80%',
    stemiosReward: 150,
    iconName: 'Star',
    checkUnlocked: (m) => m.openedResourcesCount >= 15 || m.resourceOpenRatePct >= 80
  },

  // 4. Resource Inclusion Milestones (% of resources added to lessons)
  {
    id: 'resource-architect',
    title: 'Lesson Architect',
    description: 'Add or attach resources to 25%+ of available curriculum lessons.',
    category: 'resource_inclusion',
    requirementLabel: '25% Resources Added to Lessons',
    stemiosReward: 40,
    iconName: 'FolderPlus',
    checkUnlocked: (m) => m.resourcesAddedToLessonsPct >= 25
  },
  {
    id: 'curriculum-curator',
    title: 'Curriculum Curator',
    description: 'Enrich lessons with resources reaching a 50%+ resource inclusion rate.',
    category: 'resource_inclusion',
    requirementLabel: '50% Resources Added to Lessons',
    stemiosReward: 120,
    iconName: 'FolderPlus',
    checkUnlocked: (m) => m.resourcesAddedToLessonsPct >= 50
  },
  {
    id: 'master-educator',
    title: 'Master Content Curator',
    description: 'Achieve an elite 80%+ rate of resources mapped directly into lesson plans.',
    category: 'resource_inclusion',
    requirementLabel: '80% Resources Added to Lessons',
    stemiosReward: 250,
    iconName: 'Trophy',
    checkUnlocked: (m) => m.resourcesAddedToLessonsPct >= 80
  }
];

/**
 * Generates the Competency & Rubric Matrix based on current learning metrics
 */
export function generateCompetencyRubric(metrics: LearningMetrics): RubricEvaluationResult {
  // Criterion 1: Lesson Progress
  let lessonScore: 1 | 2 | 3 | 4 = 1;
  if (metrics.completedLessonsPct >= 80) lessonScore = 4;
  else if (metrics.completedLessonsPct >= 50) lessonScore = 3;
  else if (metrics.completedLessonsPct >= 25) lessonScore = 2;

  const criterionLesson: RubricCriterion = {
    id: 'rubric-lessons',
    title: 'Lesson Completion Rate',
    description: 'Evaluates progress and completion across interactive STEM lesson modules.',
    category: 'lessons',
    metricValueText: `${metrics.completedLessonsCount} / ${metrics.totalLessons} Completed (${metrics.completedLessonsPct}%)`,
    currentLevelScore: lessonScore,
    levels: [
      { score: 1, label: 'Novice', rangeText: '< 25%', description: 'Initial stage; fewer than 25% of lessons completed.' },
      { score: 2, label: 'Developing', rangeText: '25% - 49%', description: 'Steady progress; 25% to 49% of lessons completed.' },
      { score: 3, label: 'Proficient', rangeText: '50% - 79%', description: 'Strong engagement; 50% to 79% of lessons completed.' },
      { score: 4, label: 'Exemplary', rangeText: '80% - 100%', description: 'Mastery stage; 80% or more lessons completed.' }
    ],
    recommendation: lessonScore < 4 
      ? `Complete ${Math.max(1, Math.ceil(metrics.totalLessons * 0.8) - metrics.completedLessonsCount)} more lesson(s) to reach Exemplary rating!`
      : 'Outstanding! You have reached Exemplary lesson completion.'
  };

  // Criterion 2: Unit Mastery
  let unitScore: 1 | 2 | 3 | 4 = 1;
  if (metrics.completedUnitsCount >= 4 || metrics.completedUnitsPct >= 80) unitScore = 4;
  else if (metrics.completedUnitsCount >= 2 || metrics.completedUnitsPct >= 50) unitScore = 3;
  else if (metrics.completedUnitsCount >= 1 || metrics.completedUnitsPct >= 20) unitScore = 2;

  const criterionUnit: RubricCriterion = {
    id: 'rubric-units',
    title: 'Unit Mastery & Assessment',
    description: 'Measures full unit completion including quiz scores and checkpoint validations.',
    category: 'units',
    metricValueText: `${metrics.completedUnitsCount} / ${metrics.totalUnits} Units Mastered (${metrics.completedUnitsPct}%)`,
    currentLevelScore: unitScore,
    levels: [
      { score: 1, label: 'Novice', rangeText: '0 Units', description: 'No full units completed yet.' },
      { score: 2, label: 'Developing', rangeText: '1 Unit', description: 'Mastered 1 unit and its corresponding quizzes.' },
      { score: 3, label: 'Proficient', rangeText: '2 - 3 Units', description: 'Mastered 2-3 units with high assessment scores.' },
      { score: 4, label: 'Exemplary', rangeText: '4+ Units', description: 'Mastered 4 or more units across computing electives.' }
    ],
    recommendation: unitScore < 4
      ? `Finish unit checkpoint quizzes to unlock the next Unit Mastery level.`
      : 'Exemplary unit mastery achieved across the curriculum!'
  };

  // Criterion 3: Higher Rate of Opening Resources
  let openScore: 1 | 2 | 3 | 4 = 1;
  if (metrics.resourceOpenRatePct >= 80) openScore = 4;
  else if (metrics.resourceOpenRatePct >= 50) openScore = 3;
  else if (metrics.resourceOpenRatePct >= 20) openScore = 2;

  const criterionOpening: RubricCriterion = {
    id: 'rubric-opening',
    title: 'Resource Exploration & Open Rate',
    description: 'Tracks student engagement with reference links, datasets, templates, and cheat sheets.',
    category: 'resource_opening',
    metricValueText: `${metrics.openedResourcesCount} / ${metrics.totalResources} Opened (${metrics.resourceOpenRatePct}% Rate)`,
    currentLevelScore: openScore,
    levels: [
      { score: 1, label: 'Novice', rangeText: '< 20%', description: 'Low exploration rate; under 20% of resource materials opened.' },
      { score: 2, label: 'Developing', rangeText: '20% - 49%', description: 'Moderate inquiry; 20% to 49% of resource materials opened.' },
      { score: 3, label: 'Proficient', rangeText: '50% - 79%', description: 'Active inquiry; 50% to 79% of resource materials opened.' },
      { score: 4, label: 'Exemplary', rangeText: '80% - 100%', description: 'Thorough research; 80% or more resource materials opened.' }
    ],
    recommendation: openScore < 4
      ? `Open ${Math.max(1, Math.ceil(metrics.totalResources * 0.5) - metrics.openedResourcesCount)} more reference material(s) in Resources Page to raise your rate!`
      : 'Superb research habits! High resource open rate confirmed.'
  };

  // Criterion 4: Resource Inclusion (% of resources added to lessons)
  let inclusionScore: 1 | 2 | 3 | 4 = 1;
  if (metrics.resourcesAddedToLessonsPct >= 75) inclusionScore = 4;
  else if (metrics.resourcesAddedToLessonsPct >= 50) inclusionScore = 3;
  else if (metrics.resourcesAddedToLessonsPct >= 25) inclusionScore = 2;

  const criterionInclusion: RubricCriterion = {
    id: 'rubric-inclusion',
    title: 'Resource Curriculum Integration (% Added to Lessons)',
    description: 'Measures the proportion of available resource links mapped directly into specific lesson plans.',
    category: 'resource_inclusion',
    metricValueText: `${metrics.resourcesAddedToLessonsCount} / ${metrics.totalResources} Added to Lessons (${metrics.resourcesAddedToLessonsPct}%)`,
    currentLevelScore: inclusionScore,
    levels: [
      { score: 1, label: 'Novice', rangeText: '< 25%', description: 'Fewer than 25% of resources mapped to specific lessons.' },
      { score: 2, label: 'Developing', rangeText: '25% - 49%', description: '25% to 49% of resources integrated into lesson plans.' },
      { score: 3, label: 'Proficient', rangeText: '50% - 74%', description: '50% to 74% of resources mapped into active lessons.' },
      { score: 4, label: 'Exemplary', rangeText: '75% - 100%', description: '75%+ of resources directly linked to lesson modules.' }
    ],
    recommendation: inclusionScore < 4
      ? `Add resource links to unassigned lessons in Resources Page or Lesson Builder to increase inclusion rate!`
      : 'Top-tier curriculum integration! High percentage of resources added to lessons.'
  };

  const criteria = [criterionLesson, criterionUnit, criterionOpening, criterionInclusion];
  const totalScore = criteria.reduce((sum, c) => sum + c.currentLevelScore, 0);

  let tierLabel: 'Novice' | 'Developing' | 'Proficient' | 'Exemplary' = 'Novice';
  let tierColor = 'text-amber-600 bg-amber-500/10 border-amber-500/30';

  if (totalScore >= 15) {
    tierLabel = 'Exemplary';
    tierColor = 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30';
  } else if (totalScore >= 12) {
    tierLabel = 'Proficient';
    tierColor = 'text-indigo-600 bg-indigo-500/10 border-indigo-500/30';
  } else if (totalScore >= 8) {
    tierLabel = 'Developing';
    tierColor = 'text-cyan-600 bg-cyan-500/10 border-cyan-500/30';
  }

  const overallFeedback = `Current Competency Score: ${totalScore} / 16 Points (${tierLabel} Tier). ${
    tierLabel === 'Exemplary' 
      ? 'Exemplary performance across lesson completion, unit mastery, resource opening rate, and curriculum inclusion!'
      : 'Continue exploring resources and completing unit lessons to elevate your competency tier.'
  }`;

  return {
    totalScore,
    maxScore: 16,
    tierLabel,
    tierColor,
    criteria,
    overallFeedback
  };
}
