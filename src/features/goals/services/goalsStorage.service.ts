import { eventCategories } from '../../calendar/constants/calendar.constants';
import type { EventCategory } from '../../calendar/types/calendar.types';
import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from '../../../shared/services/localStorage.service';
import type { Goal, GoalStatus } from '../types/goals.types';

const goalsStorageKey = 'atria-goals';
const goalStatuses: GoalStatus[] = ['active', 'completed', 'archived'];

type StoredGoal = Partial<Goal>;

function normalizeCategory(category: unknown): EventCategory {
  return eventCategories.includes(category as EventCategory) ? category as EventCategory : 'Work';
}

function normalizeStatus(status: unknown): GoalStatus {
  return goalStatuses.includes(status as GoalStatus) ? status as GoalStatus : 'active';
}

function normalizeGoal(goal: StoredGoal): Goal {
  const timestamp = new Date().toISOString();

  return {
    id: goal.id ?? crypto.randomUUID(),
    title: typeof goal.title === 'string' && goal.title.trim() ? goal.title : 'Untitled goal',
    description: typeof goal.description === 'string' ? goal.description : '',
    category: normalizeCategory(goal.category),
    targetDate: typeof goal.targetDate === 'string' && goal.targetDate ? goal.targetDate : undefined,
    status: normalizeStatus(goal.status),
    createdAt: goal.createdAt ?? timestamp,
    updatedAt: goal.updatedAt ?? timestamp,
  };
}

export function readStoredGoals() {
  const storedGoals = readJsonFromLocalStorage<StoredGoal[]>(goalsStorageKey, []);

  if (!Array.isArray(storedGoals)) {
    return [];
  }

  return storedGoals.map(normalizeGoal);
}

export function writeStoredGoals(goals: Goal[]) {
  writeJsonToLocalStorage(goalsStorageKey, goals);
}
