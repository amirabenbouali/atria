import type { CalendarEvent, FlexibleCalendarTask, ScheduledCalendarEvent } from '../types/calendar.types';

export function sortEventsByTime(events: ScheduledCalendarEvent[]) {
  return [...events].sort((first, second) => first.startTime.localeCompare(second.startTime));
}

export function getCompletedEventCount(events: CalendarEvent[]) {
  return events.filter((event) => event.completed).length;
}

export function getScheduledEventsForDate(events: CalendarEvent[], date: string): ScheduledCalendarEvent[] {
  return events.filter(
    (event): event is ScheduledCalendarEvent => event.date === date && event.itemType === 'event',
  );
}

export function getFlexibleTasksForDate(events: CalendarEvent[], date: string): FlexibleCalendarTask[] {
  return events.filter(
    (event): event is FlexibleCalendarTask => event.date === date && event.itemType === 'task',
  );
}

export function sortTasksByStatus(tasks: FlexibleCalendarTask[]) {
  return [...tasks].sort((first, second) => {
    const completionSort = Number(first.completed) - Number(second.completed);

    if (completionSort !== 0) {
      return completionSort;
    }

    return first.order - second.order || first.createdAt.localeCompare(second.createdAt);
  });
}
