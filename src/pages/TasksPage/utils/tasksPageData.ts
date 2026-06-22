import { addWeeks, format, isAfter, isBefore, parseISO, startOfDay } from 'date-fns';
import type { CalendarEvent, FlexibleCalendarTask } from '../../../features/calendar/types/calendar.types';
import { getVisibleCalendarOccurrences } from '../../../features/calendar/utils/calendarRecurrence';
import { sortTasksByStatus } from '../../../features/calendar/utils/eventSorting';

export type TaskFilter = 'today' | 'week' | 'upcoming' | 'completed' | 'all';
export type TaskGoalFilter = 'all' | 'none' | string;
export type TaskProjectFilter = 'all' | 'none' | string;

export type TaskGroup = {
  date: string;
  tasks: FlexibleCalendarTask[];
};

function isTask(item: CalendarEvent): item is FlexibleCalendarTask {
  return item.itemType === 'task';
}

function getTodayIsoDate() {
  return format(new Date(), 'yyyy-MM-dd');
}

function getExpandedTasks(items: CalendarEvent[], weekStartsOnMonday: boolean) {
  const referenceDates = Array.from({ length: 8 }, (_, index) => addWeeks(new Date(), index - 1));
  const occurrenceMap = new Map<string, FlexibleCalendarTask>();

  referenceDates.forEach((referenceDate) => {
    getVisibleCalendarOccurrences(items, referenceDate, weekStartsOnMonday)
      .filter(isTask)
      .forEach((task) => occurrenceMap.set(task.id, task));
  });

  return Array.from(occurrenceMap.values());
}

export function getTasksForFilter(
  items: CalendarEvent[],
  filter: TaskFilter,
  goalFilter: TaskGoalFilter,
  projectFilter: TaskProjectFilter,
  selectedWeekDate: Date,
  weekStartsOnMonday: boolean,
) {
  const today = startOfDay(new Date());
  const todayIsoDate = getTodayIsoDate();
  const currentWeekTasks = getVisibleCalendarOccurrences(items, selectedWeekDate, weekStartsOnMonday).filter(isTask);
  const expandedTasks = getExpandedTasks(items, weekStartsOnMonday);

  let filteredTasks: FlexibleCalendarTask[];

  if (filter === 'today') {
    filteredTasks = expandedTasks.filter((task) => task.date === todayIsoDate);
  } else if (filter === 'week') {
    filteredTasks = currentWeekTasks;
  } else if (filter === 'upcoming') {
    filteredTasks = expandedTasks.filter((task) => !task.completed && isAfter(parseISO(task.date), today));
  } else if (filter === 'completed') {
    filteredTasks = expandedTasks.filter((task) => task.completed);
  } else {
    filteredTasks = expandedTasks;
  }

  if (goalFilter === 'all') {
    return filteredTasks;
  }

  if (goalFilter === 'none') {
    filteredTasks = filteredTasks.filter((task) => !task.goalId);
  } else if (goalFilter !== 'all') {
    filteredTasks = filteredTasks.filter((task) => task.goalId === goalFilter);
  }

  if (projectFilter === 'none') {
    return filteredTasks.filter((task) => !task.projectId);
  }

  if (projectFilter !== 'all') {
    return filteredTasks.filter((task) => task.projectId === projectFilter);
  }

  return filteredTasks;
}

export function groupTasksByDate(tasks: FlexibleCalendarTask[]): TaskGroup[] {
  const groupedTasks = new Map<string, FlexibleCalendarTask[]>();

  tasks.forEach((task) => {
    groupedTasks.set(task.date, [...(groupedTasks.get(task.date) ?? []), task]);
  });

  return Array.from(groupedTasks.entries())
    .sort(([firstDate], [secondDate]) => {
      const first = parseISO(firstDate);
      const second = parseISO(secondDate);

      if (isBefore(first, second)) {
        return -1;
      }

      if (isAfter(first, second)) {
        return 1;
      }

      return 0;
    })
    .map(([date, dateTasks]) => ({
      date,
      tasks: sortTasksByStatus(dateTasks),
    }));
}
