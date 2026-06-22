import { format } from 'date-fns';
import { eventCategories } from '../../../features/calendar/constants/calendar.constants';
import type {
  CalendarEvent,
  EventCategory,
  FlexibleCalendarTask,
  ScheduledCalendarEvent,
} from '../../../features/calendar/types/calendar.types';
import {
  getFlexibleTasksForDate,
  getScheduledEventsForDate,
  sortEventsByTime,
  sortTasksByStatus,
} from '../../../features/calendar/utils/eventSorting';

export type CategoryProgress = {
  category: EventCategory;
  total: number;
  completed: number;
  progress: number;
};

export function getTodayIsoDate(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}

export function getTodayDisplayDate(date = new Date()) {
  return format(date, 'EEEE, MMMM d');
}

export function getTodayScheduledEvents(
  events: CalendarEvent[],
  todayIsoDate: string,
): ScheduledCalendarEvent[] {
  return sortEventsByTime(getScheduledEventsForDate(events, todayIsoDate));
}

export function getTodayFlexibleTasks(
  events: CalendarEvent[],
  todayIsoDate: string,
): FlexibleCalendarTask[] {
  return sortTasksByStatus(getFlexibleTasksForDate(events, todayIsoDate));
}

export function getProgressPercentage(completed: number, total: number) {
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

export function getCategoryProgress(items: CalendarEvent[]): CategoryProgress[] {
  return eventCategories.map((category) => {
    const categoryItems = items.filter((item) => item.category === category);
    const completed = categoryItems.filter((item) => item.completed).length;

    return {
      category,
      total: categoryItems.length,
      completed,
      progress: getProgressPercentage(completed, categoryItems.length),
    };
  });
}
