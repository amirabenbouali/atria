import type { CalendarEvent, FlexibleCalendarTask } from '../../calendar/types/calendar.types';
import type { Project } from '../../projects/types/projects.types';

export type GoalProgress = {
  linkedTaskCount: number;
  completedLinkedTaskCount: number;
  percentage: number;
};

export function getLinkedTasksForGoal(
  sourceItems: CalendarEvent[],
  visibleItems: CalendarEvent[],
  projects: Project[],
  goalId: string,
) {
  const taskMap = new Map<string, FlexibleCalendarTask>();
  const projectIdsForGoal = new Set(
    projects.filter((project) => project.goalId === goalId).map((project) => project.id),
  );
  const isTaskLinkedToGoal = (item: CalendarEvent): item is FlexibleCalendarTask =>
    item.itemType === 'task' && (item.goalId === goalId || Boolean(item.projectId && projectIdsForGoal.has(item.projectId)));

  sourceItems
    .filter((item): item is FlexibleCalendarTask => isTaskLinkedToGoal(item) && item.recurrence === 'none')
    .forEach((task) => taskMap.set(task.id, task));

  visibleItems
    .filter((item): item is FlexibleCalendarTask => isTaskLinkedToGoal(item) && item.recurrence !== 'none')
    .forEach((task) => taskMap.set(task.id, task));

  return Array.from(taskMap.values()).sort((first, second) =>
    first.date.localeCompare(second.date) ||
    first.order - second.order ||
    first.createdAt.localeCompare(second.createdAt),
  );
}

export function getGoalProgress(linkedTasks: FlexibleCalendarTask[]): GoalProgress {
  const linkedTaskCount = linkedTasks.length;
  const completedLinkedTaskCount = linkedTasks.filter((task) => task.completed).length;

  return {
    linkedTaskCount,
    completedLinkedTaskCount,
    percentage: linkedTaskCount === 0 ? 0 : Math.round((completedLinkedTaskCount / linkedTaskCount) * 100),
  };
}
