import {
  calendarStorageKey,
  categoryColors,
  defaultEventCategory,
  eventCategories,
} from '../constants/calendar.constants';
import type { CalendarEvent, EventCategory } from '../types/calendar.types';
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

function normalizeStoredEvent(event: StoredCalendarEvent): CalendarEvent {
  const category = normalizeCategory(event.category);
  const startTime = event.startTime ?? event.time ?? '09:00';
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
    endTime: event.endTime ?? getFallbackEndTime(startTime),
  };
}

export function readStoredCalendarEvents() {
  const taskOrderByDate = new Map<string, number>();

  return readJsonFromLocalStorage<StoredCalendarEvent[]>(calendarStorageKey, []).map((event) => {
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
