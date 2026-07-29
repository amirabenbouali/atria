import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../types/calendar.types';
import { getAdjacentVisibleDate, getCurrentWeekDays, getMonthGridDays } from './calendarDates';
import { getVisibleCalendarOccurrencesForDays } from './calendarRecurrence';

function event(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    id: 'item-1',
    itemType: 'event',
    title: 'Weekly planning',
    date: '2026-07-06',
    startTime: '09:00',
    endTime: '10:00',
    category: 'Work',
    description: '',
    accentColor: '#f39bbc',
    completed: false,
    recurrence: 'none',
    recurringCompletions: {},
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
    ...overrides,
  } as CalendarEvent;
}

describe('calendar view mode utilities', () => {
  it('builds a full month grid using the configured first day of week', () => {
    const mondayGrid = getMonthGridDays(new Date('2026-07-15T12:00:00'), true);
    const sundayGrid = getMonthGridDays(new Date('2026-07-15T12:00:00'), false);

    expect(mondayGrid[0]?.isoDate).toBe('2026-06-29');
    expect(sundayGrid[0]?.isoDate).toBe('2026-06-28');
    expect(mondayGrid).toHaveLength(35);
    expect(sundayGrid).toHaveLength(35);
  });

  it('filters weekend columns from week and month grids when weekends are hidden', () => {
    const weekDays = getCurrentWeekDays(new Date('2026-07-29T12:00:00'), true, false);
    const monthDays = getMonthGridDays(new Date('2026-07-15T12:00:00'), true, false);

    expect(weekDays.map((day) => day.shortName)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    expect(monthDays).toHaveLength(25);
    expect(monthDays.every((day) => !['Sat', 'Sun'].includes(day.shortName))).toBe(true);
  });

  it('skips weekends for adjacent day navigation when weekends are hidden', () => {
    expect(getAdjacentVisibleDate(new Date('2026-07-31T12:00:00'), 1, false).toISOString().slice(0, 10)).toBe('2026-08-03');
    expect(getAdjacentVisibleDate(new Date('2026-08-03T12:00:00'), -1, false).toISOString().slice(0, 10)).toBe('2026-07-31');
  });

  it('expands recurring items across arbitrary day ranges without duplicating source items', () => {
    const days = getMonthGridDays(new Date('2026-07-15T12:00:00'), true);
    const occurrences = getVisibleCalendarOccurrencesForDays(
      [
        event({
          id: 'weekly-series',
          recurrence: 'weekly',
          recurringCompletions: {
            '2026-07-20': true,
          },
        }),
        event({
          id: 'one-off',
          title: 'Launch review',
          date: '2026-07-20',
          recurrence: 'none',
        }),
      ],
      days,
    );

    expect(occurrences.filter((item) => item.sourceId === 'weekly-series')).toHaveLength(4);
    expect(occurrences.find((item) => item.id === 'weekly-series__occurs__2026-07-20')?.completed).toBe(true);
    expect(occurrences.filter((item) => item.id === 'one-off')).toHaveLength(1);
  });
});
