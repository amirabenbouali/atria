import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../types/calendar.types';
import { getMonthGridDays } from './calendarDates';
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
