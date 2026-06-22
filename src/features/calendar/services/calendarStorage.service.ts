import {
  calendarStorageKey,
  categoryColors,
  dailyFocusStorageKey,
  defaultEventCategory,
  eventCategories,
} from '../constants/calendar.constants';
import type { CalendarEvent, CalendarRecurrence, EventCategory } from '../types/calendar.types';
import { getDateForWeekday } from '../utils/calendarDates';
import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from '../../../shared/services/localStorage.service';

type StoredCalendarEvent = Partial<CalendarEvent> & {
  time?: string;
  day?: string;
  color?: string;
  order?: number;
};

const recurrenceOptions: CalendarRecurrence[] = ['none', 'daily', 'weekly', 'monthly'];

const legacyCategoryMap: Record<string, EventCategory> = {
  Focus: 'Work',
  Meeting: 'Work',
  Creative: 'Learning',
  Wellness: 'Health',
  Personal: 'Personal',
};

function normalizeCategory(category: unknown): EventCategory {
  if (typeof category === 'string' && eventCategories.includes(category as EventCategory)) {
    return category as EventCategory;
  }

  if (typeof category === 'string' && legacyCategoryMap[category]) {
    return legacyCategoryMap[category];
  }

  return defaultEventCategory;
}

function getFallbackEndTime(startTime: string) {
  const [hours = '9', minutes = '00'] = startTime.split(':');
  const nextHour = Math.min(Number(hours) + 1, 23);
  return `${String(nextHour).padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

function normalizeTime(time: unknown, fallback: string) {
  return typeof time === 'string' && /^\d{2}:\d{2}$/.test(time) ? time : fallback;
}

function normalizeRecurrence(recurrence: unknown): CalendarRecurrence {
  return recurrenceOptions.includes(recurrence as CalendarRecurrence)
    ? recurrence as CalendarRecurrence
    : 'none';
}

function normalizeCompletionMap(completions: unknown): Record<string, boolean> {
  if (!completions || typeof completions !== 'object' || Array.isArray(completions)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(completions).filter(([, completed]) => typeof completed === 'boolean'),
  );
}

function normalizeStoredEvent(event: StoredCalendarEvent): CalendarEvent {
  const category = normalizeCategory(event.category);
  const startTime = normalizeTime(event.startTime ?? event.time, '09:00');
  const itemType = event.itemType === 'task' ? 'task' : 'event';
  const timestamp = new Date().toISOString();

  const normalizedBase = {
    id: event.id ?? crypto.randomUUID(),
    title: event.title ?? 'Untitled event',
    date: event.date ?? getDateForWeekday(event.day ?? 'Monday'),
    category,
    description: event.description ?? '',
    accentColor: event.accentColor ?? event.color ?? categoryColors[category],
    completed: event.completed ?? false,
    recurrence: normalizeRecurrence(event.recurrence),
    recurrenceEndDate: event.recurrenceEndDate,
    recurringCompletions: normalizeCompletionMap(event.recurringCompletions),
    createdAt: event.createdAt ?? event.updatedAt ?? timestamp,
    updatedAt: event.updatedAt ?? event.createdAt ?? timestamp,
  };

  if (itemType === 'task') {
    return {
      ...normalizedBase,
      itemType: 'task',
      order: typeof event.order === 'number' ? event.order : 0,
    };
  }

  return {
    ...normalizedBase,
    itemType: 'event',
    startTime,
    endTime: normalizeTime(event.endTime, getFallbackEndTime(startTime)),
  };
}

export function readStoredCalendarEvents() {
  const storedEvents = readJsonFromLocalStorage<StoredCalendarEvent[]>(calendarStorageKey, []);
  const taskOrderByDate = new Map<string, number>();

  if (!Array.isArray(storedEvents)) {
    return [];
  }

  return storedEvents.map((event) => {
    const normalizedEvent = normalizeStoredEvent(event);

    if (normalizedEvent.itemType !== 'task') {
      return normalizedEvent;
    }

    const nextOrder = taskOrderByDate.get(normalizedEvent.date) ?? 0;
    taskOrderByDate.set(normalizedEvent.date, nextOrder + 1);

    return {
      ...normalizedEvent,
      order: typeof event.order === 'number' ? event.order : nextOrder,
    };
  });
}

export function writeStoredCalendarEvents(events: CalendarEvent[]) {
  writeJsonToLocalStorage(calendarStorageKey, events);
}

export type StoredDailyFocus = Record<string, string>;

export function readStoredDailyFocus() {
  const storedFocus = readJsonFromLocalStorage<StoredDailyFocus>(dailyFocusStorageKey, {});

  if (!storedFocus || typeof storedFocus !== 'object' || Array.isArray(storedFocus)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(storedFocus).filter(([, focus]) => typeof focus === 'string'),
  );
}

export function writeStoredDailyFocus(dailyFocus: StoredDailyFocus) {
  writeJsonToLocalStorage(dailyFocusStorageKey, dailyFocus);
}
