import type { EventCategory } from '../../calendar/types/calendar.types';

export type ProjectStatus = 'active' | 'completed' | 'archived';
export type ProjectStage = 'shape' | 'build' | 'ship' | 'maintain';
export type ProjectImpact = 'low' | 'medium' | 'high';
export type ProjectComplexity = 'simple' | 'layered' | 'deep';

export type Project = {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  goalId?: string;
  stage: ProjectStage;
  impact: ProjectImpact;
  complexity: ProjectComplexity;
  status: ProjectStatus;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDraft = {
  title: string;
  description: string;
  category: EventCategory;
  goalId?: string;
  stage: ProjectStage;
  impact: ProjectImpact;
  complexity: ProjectComplexity;
  targetDate?: string;
};
