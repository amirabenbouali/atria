import { isAfter, parseISO } from 'date-fns';
import type { Goal, GoalStatus } from '../types/goals.types';

export type GoalFilter = GoalStatus | 'all';

export function getGoalsByStatus(goals: Goal[], filter: GoalFilter) {
  const visibleGoals = filter === 'all' ? goals : goals.filter((goal) => goal.status === filter);

  return [...visibleGoals].sort((first, second) => {
    if (first.status !== second.status) {
      return first.status === 'active' ? -1 : 1;
    }

    if (first.targetDate && second.targetDate) {
      const firstDate = parseISO(first.targetDate);
      const secondDate = parseISO(second.targetDate);

      if (isAfter(firstDate, secondDate)) {
        return 1;
      }

      if (isAfter(secondDate, firstDate)) {
        return -1;
      }
    }

    if (first.targetDate) {
      return -1;
    }

    if (second.targetDate) {
      return 1;
    }

    return second.updatedAt.localeCompare(first.updatedAt);
  });
}
