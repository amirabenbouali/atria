import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../../calendar/types/calendar.types';
import type { Intention } from '../../intentions/types/intentions.types';
import type { DailyReflection } from '../../reflections';
import { buildMemoryTimeline } from './memoryTimeline';

const today = new Date('2026-07-29T12:00:00');
const rangeStart = new Date('2026-07-01T00:00:00');
const rangeEnd = new Date('2026-07-31T23:59:59');

function event(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    id: 'event-1',
    itemType: 'event',
    title: 'Portfolio review',
    date: '2026-07-21',
    startTime: '10:00',
    endTime: '11:00',
    category: 'Work',
    description: 'Review launch story',
    accentColor: '#f6a6be',
    completed: false,
    recurrence: 'none',
    recurringCompletions: {},
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
    ...overrides,
  } as CalendarEvent;
}

function intention(overrides: Partial<Intention>): Intention {
  return {
    id: 'intention-1',
    title: 'Ship the portfolio cut',
    description: 'Wrap the core narrative',
    desiredOutcome: 'A clear launch-ready case study',
    priority: 'high',
    status: 'completed',
    completedAt: '2026-07-22T17:30:00.000Z',
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-22T17:30:00.000Z',
    ...overrides,
  };
}

function reflection(overrides: Partial<DailyReflection>): DailyReflection {
  return {
    date: '2026-07-23',
    energy: 4,
    mood: 5,
    highlight: 'Finished the first polished demo path',
    note: 'The app finally felt calm enough to show.',
    createdAt: '2026-07-23T19:00:00.000Z',
    updatedAt: '2026-07-23T19:00:00.000Z',
    ...overrides,
  };
}

function build(overrides: Partial<Parameters<typeof buildMemoryTimeline>[0]> = {}) {
  return buildMemoryTimeline({
    calendarItems: [],
    intentions: [],
    reflections: [],
    rangeStart,
    rangeEnd,
    today,
    weekStartsOnMonday: true,
    ...overrides,
  });
}

function daysFromTimeline(timeline: ReturnType<typeof buildMemoryTimeline>) {
  return timeline.flatMap((week) => week.days);
}

describe('buildMemoryTimeline date inclusion', () => {
  it('includes past events, focus sessions, completed intentions, and reflection-only days', () => {
    const timeline = build({
      calendarItems: [
        event({ id: 'event-1', title: 'Past design review', date: '2026-07-20' }),
        event({
          id: 'focus-1',
          title: 'Focus on architecture',
          date: '2026-07-21',
          source: 'planning-suggestion',
          focusSession: { intentionId: 'intention-1' },
        }),
      ],
      intentions: [intention({ id: 'intention-1', title: 'Complete architecture pass' })],
      reflections: [reflection({ date: '2026-07-24' })],
    });

    const days = daysFromTimeline(timeline);

    expect(days.map((day) => day.dateKey)).toEqual(['2026-07-24', '2026-07-22', '2026-07-21', '2026-07-20']);
    expect(days.find((day) => day.dateKey === '2026-07-21')?.items[0]).toMatchObject({
      type: 'focus-session',
      intentionTitle: 'Complete architecture pass',
    });
    expect(days.find((day) => day.dateKey === '2026-07-22')?.items[0]).toMatchObject({
      type: 'completed-intention',
      desiredOutcome: 'A clear launch-ready case study',
    });
    expect(days.find((day) => day.dateKey === '2026-07-24')?.reflection?.highlight).toBe(
      'Finished the first polished demo path',
    );
  });

  it('excludes empty days, future days, and today unless today has a reflection', () => {
    const timeline = build({
      calendarItems: [
        event({ id: 'today-event', date: '2026-07-29', title: 'Today review' }),
        event({ id: 'future-event', date: '2026-07-30', title: 'Future review' }),
      ],
      intentions: [
        intention({ id: 'today-intention', title: 'Finish today', completedAt: '2026-07-29T10:00:00.000Z' }),
      ],
    });

    expect(daysFromTimeline(timeline)).toHaveLength(0);

    const withTodayReflection = build({
      calendarItems: [event({ id: 'today-event', date: '2026-07-29', title: 'Today review' })],
      reflections: [reflection({ date: '2026-07-29', highlight: 'Captured today' })],
    });

    expect(daysFromTimeline(withTodayReflection).map((day) => day.dateKey)).toEqual(['2026-07-29']);
  });
});

describe('buildMemoryTimeline recurrence and grouping', () => {
  it('expands recurring occurrences only inside the requested range with stable occurrence ids', () => {
    const timeline = build({
      rangeStart: new Date('2026-07-10T00:00:00'),
      rangeEnd: new Date('2026-07-20T23:59:59'),
      calendarItems: [
        event({
          id: 'weekly-review',
          date: '2026-07-01',
          recurrence: 'weekly',
          recurrenceEndDate: '2026-07-31',
        }),
      ],
    });

    const items = daysFromTimeline(timeline).flatMap((day) => day.items);

    expect(daysFromTimeline(timeline).map((day) => day.dateKey)).toEqual(['2026-07-15']);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('weekly-review__occurs__2026-07-15');
  });

  it('groups days by configured week and sorts weeks and days newest first', () => {
    const timeline = build({
      calendarItems: [
        event({ id: 'older', date: '2026-07-06', title: 'Older event' }),
        event({ id: 'newer', date: '2026-07-21', title: 'Newer event' }),
      ],
    });

    expect(timeline.map((week) => week.weekStart)).toEqual(['2026-07-20', '2026-07-06']);
    expect(timeline[0].days.map((day) => day.dateKey)).toEqual(['2026-07-21']);
  });

  it('assigns crossing-midnight events to their source start date', () => {
    const timeline = build({
      calendarItems: [event({ date: '2026-07-18', startTime: '23:30', endTime: '00:30' })],
    });

    expect(daysFromTimeline(timeline).map((day) => day.dateKey)).toEqual(['2026-07-18']);
    expect(daysFromTimeline(timeline)[0].items[0].durationMinutes).toBeUndefined();
  });
});

describe('buildMemoryTimeline completed intentions', () => {
  it('uses completedAt and ignores active, paused, scheduled, and malformed completions safely', () => {
    const timeline = build({
      intentions: [
        intention({ id: 'done', title: 'Done', completedAt: '2026-07-12T13:15:00.000Z' }),
        intention({ id: 'active', status: 'active', completedAt: '2026-07-12T13:15:00.000Z' }),
        intention({ id: 'paused', status: 'paused', completedAt: '2026-07-12T13:15:00.000Z' }),
        intention({ id: 'scheduled', status: 'scheduled', completedAt: '2026-07-12T13:15:00.000Z' }),
        intention({ id: 'bad-date', completedAt: 'not-a-date' }),
      ],
    });

    const items = daysFromTimeline(timeline).flatMap((day) => day.items);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: 'completed-intention-done', title: 'Done' });
  });
});

describe('buildMemoryTimeline reflections, search, filters, and sorting', () => {
  it('keeps reflection fields and searches text case-insensitively without mutating input', () => {
    const sourceReflections = [reflection({ date: '2026-07-11', highlight: 'Quiet Win', note: 'Dashboard clarity' })];
    const sourceEvents = [event({ id: 'event-search', title: 'Calendar polish', date: '2026-07-11' })];
    const timeline = build({
      calendarItems: sourceEvents,
      reflections: sourceReflections,
      searchQuery: 'dashboard',
    });

    expect(daysFromTimeline(timeline)[0]).toMatchObject({
      highlight: 'Quiet Win',
      reflection: { note: 'Dashboard clarity', energy: 4, mood: 5 },
    });
    expect(sourceReflections[0].highlight).toBe('Quiet Win');
    expect(sourceEvents[0].title).toBe('Calendar polish');
    expect(daysFromTimeline(build({ calendarItems: sourceEvents, reflections: sourceReflections, searchQuery: '' }))).toHaveLength(1);
  });

  it('filters reflections, events, focus sessions, completed intentions, and highlights deterministically', () => {
    const input = {
      calendarItems: [
        event({ id: 'event-day', date: '2026-07-10' }),
        event({ id: 'focus-day', date: '2026-07-11', source: 'planning-suggestion', focusSession: { intentionId: 'done' } }),
      ],
      intentions: [intention({ id: 'done', completedAt: '2026-07-12T10:00:00.000Z' })],
      reflections: [
        reflection({ date: '2026-07-13', highlight: 'A highlight' }),
        reflection({ date: '2026-07-14', highlight: undefined, note: 'Only a note' }),
      ],
    };

    expect(daysFromTimeline(build({ ...input, filters: ['events'] })).map((day) => day.dateKey)).toEqual(['2026-07-10']);
    expect(daysFromTimeline(build({ ...input, filters: ['focus-sessions'] })).map((day) => day.dateKey)).toEqual(['2026-07-11']);
    expect(daysFromTimeline(build({ ...input, filters: ['completed-intentions'] })).map((day) => day.dateKey)).toEqual(['2026-07-12']);
    expect(daysFromTimeline(build({ ...input, filters: ['reflections'] })).map((day) => day.dateKey)).toEqual(['2026-07-14', '2026-07-13']);
    expect(daysFromTimeline(build({ ...input, filters: ['highlights'] })).map((day) => day.dateKey)).toEqual(['2026-07-13']);
    expect(daysFromTimeline(build({ ...input, filters: ['events'], searchQuery: 'portfolio' }))).toHaveLength(1);
  });

  it('sorts timed items chronologically and completed intentions after timed items', () => {
    const timeline = build({
      calendarItems: [
        event({ id: 'late', date: '2026-07-09', title: 'Late', startTime: '16:00' }),
        event({ id: 'early', date: '2026-07-09', title: 'Early', startTime: '09:00' }),
      ],
      intentions: [intention({ id: 'done', completedAt: '2026-07-09T08:00:00.000Z' })],
    });

    expect(daysFromTimeline(timeline)[0].items.map((item) => item.title)).toEqual([
      'Early',
      'Late',
      'Ship the portfolio cut',
    ]);
  });
});

describe('buildMemoryTimeline range behaviour', () => {
  it('returns an empty result for invalid or wholly future ranges', () => {
    expect(build({ rangeStart: new Date('2026-08-01'), rangeEnd: new Date('2026-08-31') })).toEqual([]);
    expect(build({ rangeStart: new Date('2026-07-20'), rangeEnd: new Date('2026-07-01') })).toEqual([]);
  });
});
