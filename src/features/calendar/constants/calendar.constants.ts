import type { EventCategory } from '../types/calendar.types';

export const calendarStorageKey = 'atria-events';

export const dailyFocusStorageKey = 'atria-daily-focus';

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
  Work: '#C89BFF',
  Personal: '#F6A6BE',
  Fitness: '#F2A7A0',
  Learning: '#D6B4FF',
  Health: '#EBC7D4',
  Finance: '#C8A6A0',
};

export const defaultEventCategory: EventCategory = 'Work';
