import type { EventCategory } from '../types/calendar.types';

export const calendarStorageKey = 'atria-events';

export const calendarStartHour = 6;

export const calendarEndHour = 23;

export const calendarHourHeight = 76;

export const eventCategories: EventCategory[] = [
  'Work',
  'Personal',
  'Fitness',
  'Learning',
  'Health',
  'Finance',
];

export const categoryColors: Record<EventCategory, string> = {
  Work: '#8b5cf6',
  Personal: '#f472b6',
  Fitness: '#34d399',
  Learning: '#38bdf8',
  Health: '#fb7185',
  Finance: '#fbbf24',
};

export const defaultEventCategory: EventCategory = 'Work';
