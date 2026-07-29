import type { CalendarEvent } from '../../calendar/types/calendar.types';
import type { Goal } from '../../goals/types/goals.types';
import type { Intention } from '../../intentions/types/intentions.types';
import type { Project } from '../../projects/types/projects.types';
import type { CommandPaletteCommand } from '../types/commandPalette.types';

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function getSearchTokens(query: string) {
  return normalizeSearchValue(query).split(/\s+/).filter(Boolean);
}

function getSearchText(parts: Array<string | number | undefined>) {
  return parts.filter((part) => part !== undefined && part !== '').join(' ').toLowerCase();
}

function matchesSearchTokens(searchText: string, query: string) {
  const tokens = getSearchTokens(query);

  if (tokens.length === 0) {
    return true;
  }

  return tokens.every((token) => searchText.includes(token));
}

function scoreSearchText(searchText: string, query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return 0;
  }

  if (searchText.startsWith(normalizedQuery)) {
    return 3;
  }

  if (searchText.includes(` ${normalizedQuery}`)) {
    return 2;
  }

  return 1;
}

function sortBySearchScore<T>(items: T[], query: string, getItemSearchText: (item: T) => string) {
  return items
    .map((item, index) => ({
      item,
      index,
      score: scoreSearchText(getItemSearchText(item), query),
    }))
    .sort((first, second) => second.score - first.score || first.index - second.index)
    .map(({ item }) => item);
}

export type CommandPaletteSearchContext = {
  goals?: Goal[];
  projects?: Project[];
  intentions?: Intention[];
};

function getGoalById(goals: Goal[] = [], id?: string) {
  return id ? goals.find((goal) => goal.id === id) : undefined;
}

function getProjectById(projects: Project[] = [], id?: string) {
  return id ? projects.find((project) => project.id === id) : undefined;
}

function getIntentionById(intentions: Intention[] = [], id?: string) {
  return id ? intentions.find((intention) => intention.id === id) : undefined;
}

function getCalendarItemSearchText(item: CalendarEvent, context: CommandPaletteSearchContext = {}) {
  const linkedGoal = item.itemType === 'task' ? getGoalById(context.goals, item.goalId) : undefined;
  const linkedProject = item.itemType === 'task' ? getProjectById(context.projects, item.projectId) : undefined;
  const linkedIntention = getIntentionById(context.intentions, item.focusSession?.intentionId);

  return getSearchText([
    item.title,
    item.description,
    item.category,
    item.date,
    item.itemType,
    item.recurrence,
    item.completed ? 'completed done finished' : 'active incomplete open',
    linkedGoal?.title,
    linkedGoal?.description,
    linkedGoal?.status,
    linkedProject?.title,
    linkedProject?.description,
    linkedProject?.status,
    linkedProject?.stage,
    linkedProject?.impact,
    linkedProject?.complexity,
    linkedIntention?.title,
    linkedIntention?.description,
    linkedIntention?.desiredOutcome,
    linkedIntention?.status,
    linkedIntention?.priority,
    item.itemType === 'event' ? item.startTime : '',
    item.itemType === 'event' ? item.endTime : '',
  ]);
}

function getCommandSearchText(command: CommandPaletteCommand) {
  return getSearchText([
    command.title,
    command.subtitle,
    command.badge,
    command.type,
  ]);
}

function getGoalSearchText(goal: Goal) {
  return getSearchText([
    goal.title,
    goal.description,
    goal.category,
    goal.status,
    goal.targetDate,
    'goal objective outcome',
  ]);
}

function getProjectSearchText(project: Project, context: CommandPaletteSearchContext = {}) {
  const linkedGoal = getGoalById(context.goals, project.goalId);

  return getSearchText([
    project.title,
    project.description,
    project.category,
    project.status,
    project.stage,
    project.impact,
    project.complexity,
    project.targetDate,
    linkedGoal?.title,
    linkedGoal?.description,
    'project workstream milestone',
  ]);
}

function getIntentionSearchText(intention: Intention) {
  return getSearchText([
    intention.title,
    intention.description,
    intention.desiredOutcome,
    intention.deadline,
    intention.priority,
    intention.energyRequired,
    intention.preferredTimeOfDay,
    intention.status,
    intention.estimatedMinutes,
    'intention outcome inbox energy focus',
  ]);
}

export function searchCalendarItems(
  items: CalendarEvent[],
  query: string,
  context: CommandPaletteSearchContext = {},
) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return items;
  }

  const matches = items.filter((item) => matchesSearchTokens(getCalendarItemSearchText(item, context), normalizedQuery));

  return sortBySearchScore(matches, query, (item) => getCalendarItemSearchText(item, context));
}

export function searchGoals(goals: Goal[], query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return [];
  }

  const matches = goals.filter((goal) => matchesSearchTokens(getGoalSearchText(goal), normalizedQuery));

  return sortBySearchScore(matches, query, getGoalSearchText);
}

export function searchProjects(
  projects: Project[],
  query: string,
  context: CommandPaletteSearchContext = {},
) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return [];
  }

  const matches = projects.filter((project) => matchesSearchTokens(getProjectSearchText(project, context), normalizedQuery));

  return sortBySearchScore(matches, query, (project) => getProjectSearchText(project, context));
}

export function searchIntentions(intentions: Intention[], query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return [];
  }

  const matches = intentions.filter((intention) => matchesSearchTokens(getIntentionSearchText(intention), normalizedQuery));

  return sortBySearchScore(matches, query, getIntentionSearchText);
}

export function filterCommands(commands: CommandPaletteCommand[], query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return commands;
  }

  const matches = commands.filter((command) => matchesSearchTokens(getCommandSearchText(command), normalizedQuery));

  return sortBySearchScore(matches, query, getCommandSearchText);
}

export function getCalendarItemBadge(item: CalendarEvent) {
  if (item.recurrence !== 'none') {
    return 'Recurring';
  }

  return item.itemType === 'event' ? 'Event' : 'Task';
}
