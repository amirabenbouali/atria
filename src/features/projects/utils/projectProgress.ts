import type { CalendarEvent, FlexibleCalendarTask } from '../../calendar/types/calendar.types';

export type ProjectProgress = {
  linkedTaskCount: number;
  completedLinkedTaskCount: number;
  percentage: number;
};

function isLinkedProjectTask(item: CalendarEvent, projectId: string): item is FlexibleCalendarTask {
  return item.itemType === 'task' && item.projectId === projectId;
}

export function getLinkedTasksForProject(
  sourceItems: CalendarEvent[],
  visibleItems: CalendarEvent[],
  projectId: string,
) {
  const taskMap = new Map<string, FlexibleCalendarTask>();

  sourceItems
    .filter((item): item is FlexibleCalendarTask =>
      isLinkedProjectTask(item, projectId) && item.recurrence === 'none',
    )
    .forEach((task) => taskMap.set(task.id, task));

  visibleItems
    .filter((item): item is FlexibleCalendarTask =>
      isLinkedProjectTask(item, projectId) && item.recurrence !== 'none',
    )
    .forEach((task) => taskMap.set(task.id, task));

  return Array.from(taskMap.values()).sort((first, second) =>
    first.date.localeCompare(second.date) ||
    first.order - second.order ||
    first.createdAt.localeCompare(second.createdAt),
  );
}

export function getProjectProgress(linkedTasks: FlexibleCalendarTask[]): ProjectProgress {
  const linkedTaskCount = linkedTasks.length;
  const completedLinkedTaskCount = linkedTasks.filter((task) => task.completed).length;

  return {
    linkedTaskCount,
    completedLinkedTaskCount,
    percentage: linkedTaskCount === 0 ? 0 : Math.round((completedLinkedTaskCount / linkedTaskCount) * 100),
  };
}
