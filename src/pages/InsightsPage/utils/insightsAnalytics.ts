import { eventCategories } from '../../../features/calendar/constants/calendar.constants';
import type {
  CalendarEvent,
  EventCategory,
  ScheduledCalendarEvent,
} from '../../../features/calendar/types/calendar.types';
import type { WeekDay } from '../../../features/calendar/utils/calendarDates';
import { getMinutesFromTime } from '../../../features/calendar/utils/calendarTime';

export type WeeklyMetrics = {
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
  scheduledEvents: number;
  flexibleTasks: number;
  focusHours: number;
};

export type CategoryInsight = {
  category: EventCategory;
  total: number;
  completed: number;
  completionPercentage: number;
};

export type DailyRhythmInsight = {
  date: string;
  label: string;
  total: number;
  completed: number;
  focusHours: number;
};

export type RoutineInsight = {
  sourceId: string;
  title: string;
  category: EventCategory;
  accentColor: string;
  recurrence: CalendarEvent['recurrence'];
  totalOccurrences: number;
  completedOccurrences: number;
  completionPercentage: number;
};

export function getCompletionPercentage(completed: number, total: number) {
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

export function getEventDurationHours(event: ScheduledCalendarEvent) {
  const durationMinutes = Math.max(0, getMinutesFromTime(event.endTime) - getMinutesFromTime(event.startTime));
  return Number((durationMinutes / 60).toFixed(1));
}

export function getFocusHours(items: CalendarEvent[]) {
  const hours = items.reduce((total, item) => {
    if (item.itemType !== 'event') {
      return total;
    }

    return total + getEventDurationHours(item);
  }, 0);

  return Number(hours.toFixed(1));
}

export function getWeeklyMetrics(items: CalendarEvent[]): WeeklyMetrics {
  const completedItems = items.filter((item) => item.completed).length;

  return {
    totalItems: items.length,
    completedItems,
    completionPercentage: getCompletionPercentage(completedItems, items.length),
    scheduledEvents: items.filter((item) => item.itemType === 'event').length,
    flexibleTasks: items.filter((item) => item.itemType === 'task').length,
    focusHours: getFocusHours(items),
  };
}

export function getCategoryInsights(items: CalendarEvent[]): CategoryInsight[] {
  return eventCategories.map((category) => {
    const categoryItems = items.filter((item) => item.category === category);
    const completed = categoryItems.filter((item) => item.completed).length;

    return {
      category,
      total: categoryItems.length,
      completed,
      completionPercentage: getCompletionPercentage(completed, categoryItems.length),
    };
  });
}

export function getDailyRhythmInsights(
  items: CalendarEvent[],
  weekDays: WeekDay[],
): DailyRhythmInsight[] {
  return weekDays.map((day) => {
    const dayItems = items.filter((item) => item.date === day.isoDate);
    const completed = dayItems.filter((item) => item.completed).length;

    return {
      date: day.isoDate,
      label: day.shortName,
      total: dayItems.length,
      completed,
      focusHours: getFocusHours(dayItems),
    };
  });
}

export function getRoutineInsights(items: CalendarEvent[]): RoutineInsight[] {
  const recurringItems = items.filter((item) => item.recurrence !== 'none');
  const groupedRoutines = new Map<string, CalendarEvent[]>();

  recurringItems.forEach((item) => {
    const sourceId = item.sourceId ?? item.id;
    groupedRoutines.set(sourceId, [...(groupedRoutines.get(sourceId) ?? []), item]);
  });

  return Array.from(groupedRoutines.entries())
    .map(([sourceId, occurrences]) => {
      const firstOccurrence = occurrences[0];
      const completedOccurrences = occurrences.filter((item) => item.completed).length;

      return {
        sourceId,
        title: firstOccurrence.title,
        category: firstOccurrence.category,
        accentColor: firstOccurrence.accentColor,
        recurrence: firstOccurrence.recurrence,
        totalOccurrences: occurrences.length,
        completedOccurrences,
        completionPercentage: getCompletionPercentage(completedOccurrences, occurrences.length),
      };
    })
    .sort((first, second) => second.totalOccurrences - first.totalOccurrences || first.title.localeCompare(second.title));
}
