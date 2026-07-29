import { endOfWeek, isWithinInterval, parseISO, startOfWeek } from 'date-fns';
import type { CalendarEvent } from '../../calendar/types/calendar.types';
import { getWeekStartsOn } from '../../calendar/utils/calendarDates';
import { getVisibleCalendarOccurrences } from '../../calendar/utils/calendarRecurrence';
import type { Intention } from '../../intentions/types/intentions.types';
import type { DailyReflection } from '../../reflections';

export type SettingsWeeklyStats = {
  scheduledHours: number;
  focusSessions: number;
  completedIntentions: number;
  reflectedDays: number;
};

function getMinutesFromTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60) + minutes;
}

function getEventDurationMinutes(event: CalendarEvent) {
  if (event.itemType !== 'event') {
    return 0;
  }

  return Math.max(0, getMinutesFromTime(event.endTime) - getMinutesFromTime(event.startTime));
}

export function getSettingsWeeklyStats({
  calendarItems,
  intentions,
  reflections,
  now = new Date(),
  weekStartsOnMonday = true,
}: {
  calendarItems: CalendarEvent[];
  intentions: Intention[];
  reflections: DailyReflection[];
  now?: Date;
  weekStartsOnMonday?: boolean;
}): SettingsWeeklyStats {
  const weekStart = startOfWeek(now, { weekStartsOn: getWeekStartsOn(weekStartsOnMonday) });
  const weekEnd = endOfWeek(now, { weekStartsOn: getWeekStartsOn(weekStartsOnMonday) });
  const visibleItems = getVisibleCalendarOccurrences(calendarItems, now, weekStartsOnMonday);
  const scheduledMinutes = visibleItems.reduce((total, item) => total + getEventDurationMinutes(item), 0);
  const focusSessions = visibleItems.filter(
    (item) => item.itemType === 'event' && (item.focusSession || item.source === 'planning-suggestion'),
  ).length;
  const completedIntentions = intentions.filter((intention) => {
    if (!intention.completedAt) {
      return false;
    }

    const completedAt = parseISO(intention.completedAt);
    return isWithinInterval(completedAt, { start: weekStart, end: weekEnd });
  }).length;
  const reflectedDays = new Set(
    reflections
      .filter((reflection) => {
        const reflectedAt = parseISO(reflection.date);
        return isWithinInterval(reflectedAt, { start: weekStart, end: weekEnd });
      })
      .map((reflection) => reflection.date),
  ).size;

  return {
    scheduledHours: Math.round((scheduledMinutes / 60) * 10) / 10,
    focusSessions,
    completedIntentions,
    reflectedDays,
  };
}
