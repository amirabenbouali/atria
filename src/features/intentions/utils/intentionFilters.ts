import type {
  Intention,
  IntentionPriority,
  IntentionStatus,
} from '../types/intentions.types';
import type { PreferredTimeOfDay } from '../../timeQuality';

export type IntentionStatusFilter = 'all' | IntentionStatus;
export type IntentionPriorityFilter = 'all' | IntentionPriority;
export type IntentionTimeFilter = 'all' | PreferredTimeOfDay;
export type IntentionSortOption =
  | 'recent'
  | 'deadline'
  | 'priority'
  | 'effort'
  | 'alphabetical';

export type IntentionListOptions = {
  search: string;
  status: IntentionStatusFilter;
  priority: IntentionPriorityFilter;
  preferredTimeOfDay: IntentionTimeFilter;
  sort: IntentionSortOption;
};

const priorityRank: Record<IntentionPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function getSearchText(intention: Intention) {
  return [
    intention.title,
    intention.description ?? '',
    intention.desiredOutcome ?? '',
  ].join(' ').toLowerCase();
}

function getDeadlineSortValue(intention: Intention) {
  return intention.deadline ?? '9999-12-31';
}

function compareBySortOption(sort: IntentionSortOption) {
  return (first: Intention, second: Intention) => {
    if (sort === 'deadline') {
      return getDeadlineSortValue(first).localeCompare(getDeadlineSortValue(second)) ||
        first.createdAt.localeCompare(second.createdAt);
    }

    if (sort === 'priority') {
      return priorityRank[first.priority] - priorityRank[second.priority] ||
        first.createdAt.localeCompare(second.createdAt);
    }

    if (sort === 'effort') {
      return (first.estimatedMinutes ?? Number.MAX_SAFE_INTEGER) -
        (second.estimatedMinutes ?? Number.MAX_SAFE_INTEGER) ||
        first.createdAt.localeCompare(second.createdAt);
    }

    if (sort === 'alphabetical') {
      return first.title.localeCompare(second.title) || first.createdAt.localeCompare(second.createdAt);
    }

    return second.createdAt.localeCompare(first.createdAt) || first.title.localeCompare(second.title);
  };
}

export function getFilteredIntentions(intentions: Intention[], options: IntentionListOptions) {
  const search = options.search.trim().toLowerCase();

  return intentions
    .filter((intention) => !search || getSearchText(intention).includes(search))
    .filter((intention) => options.status === 'all' || intention.status === options.status)
    .filter((intention) => options.priority === 'all' || intention.priority === options.priority)
    .filter(
      (intention) =>
        options.preferredTimeOfDay === 'all' || intention.preferredTimeOfDay === options.preferredTimeOfDay,
    )
    .map((intention, index) => ({ intention, index }))
    .sort((first, second) => compareBySortOption(options.sort)(first.intention, second.intention) || first.index - second.index)
    .map(({ intention }) => intention);
}

export function getIntentionSummary(intentions: Intention[]) {
  return {
    active: intentions.filter((intention) => intention.status === 'active').length,
    scheduled: intentions.filter((intention) => intention.status === 'scheduled').length,
    completed: intentions.filter((intention) => intention.status === 'completed').length,
  };
}
