import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../../../features/calendar/types/calendar.types';
import type { Intention } from '../../../features/intentions';
import type { DailyReflection } from '../../../features/reflections';
import { defaultEnergyProfile } from '../../../features/timeQuality';
import { buildTodayViewModel } from './todayDashboard';

function event(overrides: Partial<CalendarEvent> & Pick<CalendarEvent, 'id' | 'date'>): CalendarEvent {
  const { id, date, ...rest } = overrides;

  return {
    id,
    itemType: 'event',
    title: 'Calendar block',
    date,
    startTime: '09:00',
    endTime: '10:00',
    category: 'Work',
    description: '',
    accentColor: '#f18db5',
    completed: false,
    recurrence: 'none',
    recurringCompletions: {},
    source: 'manual',
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
    ...rest,
  } as CalendarEvent;
}

function focusSession(overrides: Partial<CalendarEvent> & Pick<CalendarEvent, 'id' | 'date'>): CalendarEvent {
  return event({
    title: 'Focus: Write case study',
    source: 'planning-suggestion',
    focusSession: {
      intentionId: 'focus-intention',
      planningSuggestionId: 'suggestion-1',
    },
    ...overrides,
  });
}

function intention(overrides: Partial<Intention> & Pick<Intention, 'id' | 'title'>): Intention {
  const { id, title, ...rest } = overrides;

  return {
    id,
    title,
    priority: 'medium',
    status: 'active',
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
    ...rest,
  };
}

function build(overrides: Partial<Parameters<typeof buildTodayViewModel>[0]> = {}) {
  return buildTodayViewModel({
    now: new Date('2026-07-29T08:30:00'),
    calendarItems: [],
    intentions: [],
    energyProfile: defaultEnergyProfile,
    reflections: [],
    ...overrides,
  });
}

describe('today view model day state', () => {
  it('derives empty, before-first, during, between, and after-last states', () => {
    expect(build().dayState).toBe('empty');
    expect(build({
      calendarItems: [event({ id: 'later', date: '2026-07-29', startTime: '09:00', endTime: '10:00' })],
    }).dayState).toBe('before-first');
    expect(build({
      now: new Date('2026-07-29T09:15:00'),
      calendarItems: [event({ id: 'now', date: '2026-07-29', startTime: '09:00', endTime: '10:00' })],
    }).dayState).toBe('during-item');
    expect(build({
      now: new Date('2026-07-29T10:30:00'),
      calendarItems: [
        event({ id: 'past', date: '2026-07-29', startTime: '09:00', endTime: '10:00' }),
        event({ id: 'next', date: '2026-07-29', startTime: '11:00', endTime: '12:00' }),
      ],
    }).dayState).toBe('between-items');
    expect(build({
      now: new Date('2026-07-29T12:30:00'),
      calendarItems: [event({ id: 'done', date: '2026-07-29', startTime: '09:00', endTime: '10:00' })],
    }).dayState).toBe('after-last');
  });

  it('handles events crossing midnight', () => {
    const viewModel = build({
      now: new Date('2026-07-29T00:30:00'),
      calendarItems: [event({ id: 'overnight', date: '2026-07-28', startTime: '23:00', endTime: '01:00' })],
    });

    expect(viewModel.currentItem?.id).toBe('overnight');
    expect(viewModel.dayState).toBe('during-item');
  });

  it('expands recurring occurrences for today', () => {
    const viewModel = build({
      calendarItems: [
        event({ id: 'daily', date: '2026-07-28', startTime: '09:00', endTime: '10:00', recurrence: 'daily' }),
      ],
    });

    expect(viewModel.nextItem?.sourceId).toBe('daily');
  });
});

describe('today current and next item selection', () => {
  it('sorts unsorted input and ignores completed active items', () => {
    const items = [
      event({ id: 'later', date: '2026-07-29', startTime: '13:00', endTime: '14:00' }),
      event({ id: 'completed', date: '2026-07-29', startTime: '08:00', endTime: '09:00', completed: true }),
      event({ id: 'first', date: '2026-07-29', startTime: '09:00', endTime: '10:00' }),
    ];
    const originalOrder = items.map((item) => item.id);
    const viewModel = build({ calendarItems: items });

    expect(viewModel.nextItem?.id).toBe('first');
    expect(items.map((item) => item.id)).toEqual(originalOrder);
  });

  it('prioritises focus sessions among overlapping current items', () => {
    const viewModel = build({
      now: new Date('2026-07-29T09:20:00'),
      calendarItems: [
        event({ id: 'meeting', date: '2026-07-29', startTime: '09:00', endTime: '10:30' }),
        focusSession({ id: 'focus', date: '2026-07-29', startTime: '09:15', endTime: '10:15' }),
      ],
    });

    expect(viewModel.currentItem?.id).toBe('focus');
    expect(viewModel.currentItem?.isFocusSession).toBe(true);
  });
});

describe('today primary intention', () => {
  it('uses the intention linked to the current focus session first', () => {
    const viewModel = build({
      now: new Date('2026-07-29T09:20:00'),
      calendarItems: [focusSession({ id: 'focus', date: '2026-07-29', startTime: '09:00', endTime: '10:00' })],
      intentions: [
        intention({ id: 'focus-intention', title: 'Linked focus' }),
        intention({ id: 'deadline', title: 'Deadline today', deadline: '2026-07-29' }),
      ],
    });

    expect(viewModel.primaryIntention?.id).toBe('focus-intention');
  });

  it('falls back to next focus session, deadline today, and nearest high-priority deadline', () => {
    expect(build({
      calendarItems: [focusSession({ id: 'next-focus', date: '2026-07-29', startTime: '10:00', endTime: '11:00' })],
      intentions: [intention({ id: 'focus-intention', title: 'Next linked' })],
    }).primaryIntention?.id).toBe('focus-intention');

    expect(build({
      intentions: [
        intention({ id: 'future', title: 'Future', priority: 'high', deadline: '2026-08-01' }),
        intention({ id: 'today', title: 'Today', deadline: '2026-07-29' }),
      ],
    }).primaryIntention?.id).toBe('today');

    expect(build({
      intentions: [
        intention({ id: 'later', title: 'Later', priority: 'high', deadline: '2026-08-10' }),
        intention({ id: 'soon', title: 'Soon', priority: 'high', deadline: '2026-08-01' }),
      ],
    }).primaryIntention?.id).toBe('soon');
  });

  it('excludes paused, completed, and passed-deadline intentions', () => {
    const viewModel = build({
      intentions: [
        intention({ id: 'paused', title: 'Paused', status: 'paused' }),
        intention({ id: 'completed', title: 'Completed', status: 'completed' }),
        intention({ id: 'past', title: 'Past', deadline: '2026-07-28' }),
      ],
    });

    expect(viewModel.primaryIntention).toBeUndefined();
  });
});

describe('today load, recovery, header, and reflection', () => {
  it('derives open, balanced, and full load states', () => {
    expect(build().overloadState).toBe('open');
    expect(build({
      calendarItems: [event({ id: 'balanced', date: '2026-07-29', startTime: '09:00', endTime: '13:30' })],
    }).overloadState).toBe('balanced');
    expect(build({
      calendarItems: [event({ id: 'full', date: '2026-07-29', startTime: '08:00', endTime: '16:00' })],
    }).overloadState).toBe('full');
  });

  it('detects back-to-back commitments and labelled recovery without treating empty time as recovery', () => {
    const viewModel = build({
      calendarItems: [
        event({ id: 'one', date: '2026-07-29', startTime: '09:00', endTime: '10:00' }),
        event({ id: 'two', date: '2026-07-29', startTime: '10:05', endTime: '11:00' }),
        event({ id: 'recovery', title: 'Recovery walk', date: '2026-07-29', startTime: '17:00', endTime: '17:30', category: 'Health' }),
      ],
    });

    expect(viewModel.overloadObservation).toContain('close together');
    expect(viewModel.recoveryMinutes).toBe(30);
    expect(build().recoveryMinutes).toBe(0);
  });

  it('returns deterministic header messages and existing reflection', () => {
    const reflection: DailyReflection = {
      date: '2026-07-29',
      energy: 4,
      mood: 3,
      highlight: 'Finished a clean planning pass',
      createdAt: '2026-07-29T20:00:00.000Z',
      updatedAt: '2026-07-29T20:00:00.000Z',
    };
    const empty = build();
    const afterLast = build({
      now: new Date('2026-07-29T18:30:00'),
      calendarItems: [event({ id: 'final', date: '2026-07-29', startTime: '17:00', endTime: '18:00' })],
      reflections: [reflection],
    });

    expect(empty.headerMessage).toBe('Your calendar is open today.');
    expect(afterLast.headerMessage).toContain('18:00');
    expect(afterLast.reflection?.highlight).toBe('Finished a clean planning pass');
  });
});
