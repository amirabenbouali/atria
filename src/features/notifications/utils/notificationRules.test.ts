import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../../calendar/types/calendar.types';
import type { NotificationPreferences } from '../../settings/types/settings.types';
import { buildAtriaNotifications, isWithinQuietHours } from './notificationRules';

const notificationPreferences: NotificationPreferences = {
  inAppDailyOverview: true,
  inAppReflectionPrompt: true,
  inAppWeeklySummary: true,
  quietHoursEnabled: false,
  quietHoursStart: '21:00',
  quietHoursEnd: '08:00',
};

function event(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    id: 'event-1',
    itemType: 'event',
    title: 'Design review',
    date: '2026-07-29',
    startTime: '10:00',
    endTime: '11:00',
    category: 'Work',
    description: '',
    accentColor: '#f39bbc',
    completed: false,
    recurrence: 'none',
    recurringCompletions: {},
    createdAt: '2026-07-29T08:00:00.000Z',
    updatedAt: '2026-07-29T08:00:00.000Z',
    ...overrides,
  } as CalendarEvent;
}

describe('notification rules', () => {
  it('detects quiet hours that cross midnight', () => {
    const preferences = {
      ...notificationPreferences,
      quietHoursEnabled: true,
      quietHoursStart: '21:00',
      quietHoursEnd: '08:00',
    };

    expect(isWithinQuietHours(new Date('2026-07-29T22:00:00'), preferences)).toBe(true);
    expect(isWithinQuietHours(new Date('2026-07-29T07:30:00'), preferences)).toBe(true);
    expect(isWithinQuietHours(new Date('2026-07-29T12:00:00'), preferences)).toBe(false);
  });

  it('builds local prompts from today calendar items', () => {
    const notifications = buildAtriaNotifications({
      items: [
        event({ id: 'next-event', startTime: '10:00', endTime: '11:00' }),
        event({
          id: 'task-1',
          itemType: 'task',
          title: 'Draft release notes',
          order: 0,
        }),
        event({
          id: 'task-2',
          itemType: 'task',
          title: 'Review QA list',
          order: 1,
        }),
        event({
          id: 'task-3',
          itemType: 'task',
          title: 'Send project update',
          order: 2,
        }),
      ],
      preferences: notificationPreferences,
      weekStartsOnMonday: true,
      dismissedIds: [],
      now: new Date('2026-07-29T09:30:00'),
    });

    expect(notifications.map((notification) => notification.kind)).toEqual([
      'daily-overview',
      'upcoming-event',
      'open-tasks',
    ]);
  });

  it('filters dismissed notifications', () => {
    const notifications = buildAtriaNotifications({
      items: [event({ id: 'next-event', startTime: '10:00', endTime: '11:00' })],
      preferences: notificationPreferences,
      weekStartsOnMonday: true,
      dismissedIds: ['daily-overview:2026-07-29'],
      now: new Date('2026-07-29T09:30:00'),
    });

    expect(notifications.some((notification) => notification.kind === 'daily-overview')).toBe(false);
    expect(notifications.some((notification) => notification.kind === 'upcoming-event')).toBe(true);
  });
});
