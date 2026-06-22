import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
} from 'date-fns';
import type { CalendarEvent } from '../types/calendar.types';
import { getCurrentWeekDays } from './calendarDates';

const occurrenceSeparator = '__occurs__';

export function createOccurrenceId(itemId: string, date: string) {
  return `${itemId}${occurrenceSeparator}${date}`;
}

export function parseOccurrenceId(id: string) {
  const separatorIndex = id.indexOf(occurrenceSeparator);

  if (separatorIndex < 0) {
    return {
      sourceId: id,
      occurrenceDate: undefined,
      isOccurrence: false,
    };
  }

  const sourceId = id.slice(0, separatorIndex);
  const occurrenceDate = id.slice(separatorIndex + occurrenceSeparator.length);

  return {
    sourceId,
    occurrenceDate,
    isOccurrence: Boolean(sourceId && occurrenceDate),
  };
}

function getNextOccurrenceDate(date: Date, recurrence: CalendarEvent['recurrence']) {
  if (recurrence === 'daily') {
    return addDays(date, 1);
  }

  if (recurrence === 'weekly') {
    return addWeeks(date, 1);
  }

  return addMonths(date, 1);
}

function shouldIncludeDate(item: CalendarEvent, date: Date) {
  const itemDate = parseISO(item.date);

  if (item.recurrence === 'none') {
    return isSameDay(itemDate, date);
  }

  if (isBefore(date, itemDate)) {
    return false;
  }

  if (item.recurrenceEndDate && isAfter(date, parseISO(item.recurrenceEndDate))) {
    return false;
  }

  let occurrenceDate = itemDate;

  while (!isAfter(occurrenceDate, date)) {
    if (isSameDay(occurrenceDate, date)) {
      return true;
    }

    occurrenceDate = getNextOccurrenceDate(occurrenceDate, item.recurrence);
  }

  return false;
}

export function getVisibleCalendarOccurrences(
  items: CalendarEvent[],
  selectedWeekDate: Date,
  weekStartsOnMonday = true,
): CalendarEvent[] {
  const weekDays = getCurrentWeekDays(selectedWeekDate, weekStartsOnMonday);

  return items.flatMap((item) =>
    weekDays.flatMap((day) => {
      const date = parseISO(day.isoDate);

      if (!shouldIncludeDate(item, date)) {
        return [];
      }

      if (item.recurrence === 'none') {
        return [{ ...item, date: day.isoDate, occurrenceDate: day.isoDate, sourceId: item.id }];
      }

      return [
        {
          ...item,
          id: createOccurrenceId(item.id, day.isoDate),
          sourceId: item.id,
          occurrenceDate: day.isoDate,
          isRecurringOccurrence: true,
          date: day.isoDate,
          completed: item.recurringCompletions[day.isoDate] ?? false,
        },
      ];
    }),
  );
}

export function formatOccurrenceDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}
