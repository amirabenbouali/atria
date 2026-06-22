import type { EventCategory } from '../../calendar/types/calendar.types';

export type ProjectStatus = 'active' | 'completed' | 'archived';

export type Project = {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  goalId?: string;
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
  targetDate?: string;
};
