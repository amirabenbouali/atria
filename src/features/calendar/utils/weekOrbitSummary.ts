import type { CalendarEvent } from '../types/calendar.types';
import { getScheduledEventsForDate, getFlexibleTasksForDate } from './eventSorting';

export function getWeekOrbitDescription(events: CalendarEvent[]) {
  const scheduledEvents = events.filter((event) => event.itemType === 'event');
  const focusBlocks = scheduledEvents.filter((event) => event.source === 'planning-suggestion' || event.focusSession).length;
  const days = Array.from(new Set(events.map((event) => event.date)));
  const openDays = days.filter((date) => getScheduledEventsForDate(events, date).length === 0).length;
  const taskDays = days.filter((date) => getFlexibleTasksForDate(events, date).length > 0).length;

  if (events.length === 0) {
    return 'A quiet week with room to place the first signal.';
  }

  return `${focusBlocks || scheduledEvents.length} focused blocks. ${openDays} open days. ${taskDays} task signals.`;
}
