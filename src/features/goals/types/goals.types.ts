import type { EventCategory } from '../../calendar/types/calendar.types';

export type GoalStatus = 'active' | 'completed' | 'archived';

export type Goal = {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  targetDate?: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
};

export type GoalDraft = {
  title: string;
  description: string;
  category: EventCategory;
  targetDate?: string;
};
