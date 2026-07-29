import type { FlexibleCalendarTask } from '../../calendar/types/calendar.types';
import type {
  Project,
  ProjectComplexity,
  ProjectImpact,
  ProjectStage,
} from '../types/projects.types';
import type { ProjectProgress } from './projectProgress';

export const projectStageOptions: ProjectStage[] = ['shape', 'build', 'ship', 'maintain'];
export const projectImpactOptions: ProjectImpact[] = ['low', 'medium', 'high'];
export const projectComplexityOptions: ProjectComplexity[] = ['simple', 'layered', 'deep'];

export const projectStageLabels: Record<ProjectStage, string> = {
  shape: 'Shape',
  build: 'Build',
  ship: 'Ship',
  maintain: 'Maintain',
};

export const projectImpactLabels: Record<ProjectImpact, string> = {
  low: 'Low impact',
  medium: 'Medium impact',
  high: 'High impact',
};

export const projectComplexityLabels: Record<ProjectComplexity, string> = {
  simple: 'Simple',
  layered: 'Layered',
  deep: 'Deep',
};

const stageWeights: Record<ProjectStage, number> = {
  shape: 1,
  build: 3,
  ship: 4,
  maintain: 2,
};

const impactWeights: Record<ProjectImpact, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const complexityWeights: Record<ProjectComplexity, number> = {
  simple: 1,
  layered: 2,
  deep: 3,
};

export type ProjectDepth = {
  score: number;
  label: string;
  signal: string;
};

export type GoalDepthSummary = {
  linkedProjectCount: number;
  activeProjectCount: number;
  linkedTaskCount: number;
  completedLinkedTaskCount: number;
  averageProjectProgress: number;
  deepestStage?: ProjectStage;
  label: string;
};

export function getProjectDepth(project: Project, progress: ProjectProgress): ProjectDepth {
  const taskWeight = Math.min(progress.linkedTaskCount, 5);
  const score =
    stageWeights[project.stage] +
    impactWeights[project.impact] +
    complexityWeights[project.complexity] +
    taskWeight;

  if (score >= 12) {
    return {
      score,
      label: 'Deep workstream',
      signal: 'High context, multi-step execution.',
    };
  }

  if (score >= 8) {
    return {
      score,
      label: 'Layered project',
      signal: 'Enough moving parts to keep in view.',
    };
  }

  return {
    score,
    label: 'Light project',
    signal: 'Small surface area, easy to steer.',
  };
}

export function getGoalDepthSummary(
  linkedProjects: Project[],
  linkedTasks: FlexibleCalendarTask[],
  projectProgressById: Record<string, ProjectProgress>,
): GoalDepthSummary {
  const activeProjects = linkedProjects.filter((project) => project.status === 'active');
  const linkedTaskCount = linkedTasks.length;
  const completedLinkedTaskCount = linkedTasks.filter((task) => task.completed).length;
  const projectProgressValues = linkedProjects.map((project) => projectProgressById[project.id]?.percentage ?? 0);
  const averageProjectProgress =
    projectProgressValues.length === 0
      ? 0
      : Math.round(projectProgressValues.reduce((total, value) => total + value, 0) / projectProgressValues.length);
  const deepestProject = [...linkedProjects].sort(
    (first, second) => stageWeights[second.stage] - stageWeights[first.stage],
  )[0];

  const label =
    activeProjects.length >= 3 || linkedTaskCount >= 8
      ? 'Deep goal system'
      : activeProjects.length > 0 || linkedTaskCount > 0
        ? 'Structured goal'
        : 'Open goal';

  return {
    linkedProjectCount: linkedProjects.length,
    activeProjectCount: activeProjects.length,
    linkedTaskCount,
    completedLinkedTaskCount,
    averageProjectProgress,
    deepestStage: deepestProject?.stage,
    label,
  };
}
