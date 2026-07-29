import {
  addDays,
  addMonths,
  differenceInMinutes,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { CalendarEvent } from '../../calendar/types/calendar.types';
import { createOccurrenceId } from '../../calendar/utils/calendarRecurrence';
import { getWeekStartsOn } from '../../calendar/utils/calendarDates';
import type { Intention } from '../../intentions/types/intentions.types';
import type { DailyReflection } from '../../reflections';
import type {
  MemoryDay,
  MemoryFilter,
  MemoryTimelineItem,
  MemoryWeek,
} from '../types/memories.types';

export type BuildMemoryTimelineInput = {
  calendarItems: CalendarEvent[];
  intentions: Intention[];
  reflections: DailyReflection[];
  rangeStart: Date;
  rangeEnd: Date;
  today: Date;
  filters?: MemoryFilter[];
  searchQuery?: string;
  weekStartsOnMonday?: boolean;
};

export type MemoryMonthRange = {
  rangeStart: Date;
  rangeEnd: Date;
};

const defaultFilters: MemoryFilter[] = ['all'];

function formatDateKey(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function parseDateKey(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

function isWithinDayRange(date: Date, rangeStart: Date, rangeEnd: Date) {
  const day = startOfDay(date);
  return !isBefore(day, startOfDay(rangeStart)) && !isAfter(day, startOfDay(rangeEnd));
}

function getNextOccurrenceDate(date: Date, recurrence: CalendarEvent['recurrence']) {
  if (recurrence === 'daily') {
    return addDays(date, 1);
  }

  if (recurrence === 'weekly') {
    return addDays(date, 7);
  }

  return addMonths(date, 1);
}

function isTimedEvent(item: CalendarEvent): item is CalendarEvent & { startTime: string; endTime: string } {
  return item.itemType === 'event' && Boolean(item.startTime && item.endTime);
}

function getOccurrenceDates(item: CalendarEvent, rangeStart: Date, rangeEnd: Date) {
  const itemDate = parseDateKey(item.date);

  if (!itemDate) {
    return [];
  }

  if (item.recurrence === 'none') {
    return isWithinDayRange(itemDate, rangeStart, rangeEnd) ? [item.date] : [];
  }

  const recurrenceEnd = parseDateKey(item.recurrenceEndDate);
  const boundedEnd = recurrenceEnd && isBefore(recurrenceEnd, rangeEnd) ? recurrenceEnd : rangeEnd;
  const dates: string[] = [];
  let occurrenceDate = itemDate;

  while (!isAfter(occurrenceDate, boundedEnd)) {
    if (!isBefore(occurrenceDate, rangeStart)) {
      dates.push(formatDateKey(occurrenceDate));
    }

    occurrenceDate = getNextOccurrenceDate(occurrenceDate, item.recurrence);
  }

  return dates;
}

function getOccurrenceCompleted(item: CalendarEvent, dateKey: string) {
  if (item.recurrence === 'none') {
    return item.completed;
  }

  return item.recurringCompletions[dateKey] ?? false;
}

function getItemDateTime(dateKey: string, time?: string) {
  const parsed = parseISO(`${dateKey}T${time ?? '00:00'}`);
  return isValid(parsed) ? parsed : null;
}

function createCalendarMemoryItem(
  item: CalendarEvent,
  dateKey: string,
  intentionById: Map<string, Intention>,
): MemoryTimelineItem | null {
  if (!isTimedEvent(item) || !item.title.trim()) {
    return null;
  }

  const startDateTime = getItemDateTime(dateKey, item.startTime);
  const endDateTime = getItemDateTime(dateKey, item.endTime);
  const intention = item.focusSession?.intentionId ? intentionById.get(item.focusSession.intentionId) : undefined;
  const isFocusSession = item.source === 'planning-suggestion' || Boolean(item.focusSession);

  return {
    id: item.recurrence === 'none' ? item.id : createOccurrenceId(item.id, dateKey),
    type: isFocusSession ? 'focus-session' : 'event',
    title: item.title.trim(),
    description: item.description || undefined,
    start: item.startTime,
    end: item.endTime,
    durationMinutes: startDateTime && endDateTime && isAfter(endDateTime, startDateTime)
      ? differenceInMinutes(endDateTime, startDateTime)
      : undefined,
    intentionId: item.focusSession?.intentionId,
    intentionTitle: intention?.title,
    desiredOutcome: intention?.desiredOutcome,
    calendarItemId: item.sourceId ?? item.id,
    category: item.category,
  };
}

function createCompletedIntentionItem(intention: Intention): MemoryTimelineItem | null {
  const completedDate = parseDateKey(intention.completedAt);

  if (intention.status !== 'completed' || !completedDate || !intention.title.trim()) {
    return null;
  }

  return {
    id: `completed-intention-${intention.id}`,
    type: 'completed-intention',
    title: intention.title.trim(),
    description: intention.description,
    completedAt: intention.completedAt,
    intentionId: intention.id,
    intentionTitle: intention.title,
    desiredOutcome: intention.desiredOutcome,
  };
}

function getSearchText(day: MemoryDay) {
  return [
    day.reflection?.highlight,
    day.reflection?.note,
    ...day.items.flatMap((item) => [
      item.title,
      item.description,
      item.intentionTitle,
      item.desiredOutcome,
      item.category,
    ]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function dayMatchesFilters(day: MemoryDay, filters: MemoryFilter[]) {
  if (filters.includes('all') || filters.length === 0) {
    return true;
  }

  return filters.some((filter) => {
    if (filter === 'reflections') {
      return Boolean(day.reflection);
    }

    if (filter === 'events') {
      return day.items.some((item) => item.type === 'event');
    }

    if (filter === 'focus-sessions') {
      return day.items.some((item) => item.type === 'focus-session');
    }

    if (filter === 'completed-intentions') {
      return day.items.some((item) => item.type === 'completed-intention');
    }

    return Boolean(day.highlight);
  });
}

function getItemSortValue(item: MemoryTimelineItem) {
  if (item.start) {
    return item.start;
  }

  if (item.completedAt) {
    const completedAt = parseISO(item.completedAt);
    return isValid(completedAt) ? format(completedAt, 'HH:mm') : '99:99';
  }

  return '99:99';
}

function sortMemoryItems(items: MemoryTimelineItem[]) {
  return [...items].sort((first, second) => {
    if (first.type === 'completed-intention' && second.type !== 'completed-intention') {
      return 1;
    }

    if (first.type !== 'completed-intention' && second.type === 'completed-intention') {
      return -1;
    }

    const timeSort = getItemSortValue(first).localeCompare(getItemSortValue(second));
    return timeSort || first.id.localeCompare(second.id);
  });
}

function addDay(daysByDate: Map<string, MemoryDay>, dateKey: string, partial: Partial<MemoryDay>) {
  const existingDay = daysByDate.get(dateKey) ?? {
    dateKey,
    items: [],
    completedCount: 0,
    focusMinutes: 0,
    eventCount: 0,
    hasMeaningfulContent: false,
  };

  daysByDate.set(dateKey, {
    ...existingDay,
    ...partial,
    items: partial.items ?? existingDay.items,
    hasMeaningfulContent: true,
  });
}

export function getMemoryMonthRange(monthDate: Date): MemoryMonthRange {
  return {
    rangeStart: startOfMonth(monthDate),
    rangeEnd: endOfMonth(monthDate),
  };
}

export function buildMemoryTimeline({
  calendarItems,
  intentions,
  reflections,
  rangeStart,
  rangeEnd,
  today,
  filters = defaultFilters,
  searchQuery = '',
  weekStartsOnMonday = true,
}: BuildMemoryTimelineInput): MemoryWeek[] {
  const todayStart = startOfDay(today);

  if (isAfter(rangeStart, rangeEnd) || isAfter(startOfDay(rangeStart), todayStart)) {
    return [];
  }

  const boundedRangeEnd = isAfter(rangeEnd, todayStart) ? todayStart : rangeEnd;
  const daysByDate = new Map<string, MemoryDay>();
  const intentionById = new Map(intentions.map((intention) => [intention.id, intention]));
  const reflectionDateKeys = new Set(reflections.map((reflection) => reflection.date));
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const activeFilters = filters.length ? filters : defaultFilters;

  calendarItems.forEach((item) => {
    getOccurrenceDates(item, rangeStart, boundedRangeEnd).forEach((dateKey) => {
      const occurrenceDate = parseISO(dateKey);
      const isToday = isSameDay(occurrenceDate, todayStart);
      const isPast = isBefore(occurrenceDate, todayStart);

      if (!isPast && !(isToday && reflectionDateKeys.has(dateKey))) {
        return;
      }

      const memoryItem = createCalendarMemoryItem(item, dateKey, intentionById);

      if (!memoryItem) {
        return;
      }

      const existingDay = daysByDate.get(dateKey);
      addDay(daysByDate, dateKey, {
        items: [...(existingDay?.items ?? []), memoryItem],
      });
    });
  });

  intentions.forEach((intention) => {
    const memoryItem = createCompletedIntentionItem(intention);
    const completedDate = parseDateKey(intention.completedAt);

    if (!memoryItem || !completedDate || !isWithinDayRange(completedDate, rangeStart, boundedRangeEnd)) {
      return;
    }

    const dateKey = formatDateKey(completedDate);

    if (isAfter(startOfDay(completedDate), todayStart) || (isSameDay(completedDate, todayStart) && !reflectionDateKeys.has(dateKey))) {
      return;
    }

    const existingDay = daysByDate.get(dateKey);
    addDay(daysByDate, dateKey, {
      items: [...(existingDay?.items ?? []), memoryItem],
    });
  });

  reflections.forEach((reflection) => {
    const reflectionDate = parseDateKey(reflection.date);

    if (!reflectionDate || !isWithinDayRange(reflectionDate, rangeStart, boundedRangeEnd)) {
      return;
    }

    const dateKey = reflection.date;
    addDay(daysByDate, dateKey, {
      reflection,
      highlight: reflection.highlight,
    });
  });

  const filteredDays = Array.from(daysByDate.values())
    .map((day) => {
      const items = sortMemoryItems(day.items);
      return {
        ...day,
        items,
        completedCount: items.filter((item) => item.type === 'completed-intention').length,
        focusMinutes: items
          .filter((item) => item.type === 'focus-session')
          .reduce((total, item) => total + (item.durationMinutes ?? 0), 0),
        eventCount: items.filter((item) => item.type === 'event').length,
        hasMeaningfulContent: items.length > 0 || Boolean(day.reflection || day.highlight),
      };
    })
    .filter((day) => day.hasMeaningfulContent)
    .filter((day) => dayMatchesFilters(day, activeFilters))
    .filter((day) => !normalizedQuery || getSearchText(day).includes(normalizedQuery))
    .sort((first, second) => second.dateKey.localeCompare(first.dateKey));

  const weeksByStart = new Map<string, MemoryWeek>();

  filteredDays.forEach((day) => {
    const parsedDate = parseISO(day.dateKey);
    const weekStartDate = startOfWeek(parsedDate, { weekStartsOn: getWeekStartsOn(weekStartsOnMonday) });
    const weekStart = formatDateKey(weekStartDate);
    const weekEnd = formatDateKey(addDays(weekStartDate, 6));
    const existingWeek = weeksByStart.get(weekStart);

    weeksByStart.set(weekStart, {
      weekStart,
      weekEnd,
      days: [...(existingWeek?.days ?? []), day].sort((first, second) => second.dateKey.localeCompare(first.dateKey)),
    });
  });

  return Array.from(weeksByStart.values()).sort((first, second) => second.weekStart.localeCompare(first.weekStart));
}
