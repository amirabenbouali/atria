import { describe, expect, it } from 'vitest';
import { format } from 'date-fns';
import type { CalendarEvent } from '../../calendar/types/calendar.types';
import type { Intention } from '../../intentions';
import type { DailyReflection } from '../../reflections';
import { defaultEnergyProfile } from '../../timeQuality';
import {
  deriveInsightCandidates,
  generateGentleInsights,
  getGentleInsightRange,
  gentleInsightThresholds,
} from './gentleInsights';

const now = new Date('2026-07-29T12:00:00');
const rangeStart = new Date('2026-07-16T00:00:00');
const rangeEnd = new Date('2026-07-29T00:00:00');

function event(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    id: 'event-1',
    itemType: 'event',
    title: 'Project review',
    date: '2026-07-20',
    startTime: '10:00',
    endTime: '11:00',
    category: 'Work',
    description: '',
    accentColor: '#f6a6be',
    completed: false,
    recurrence: 'none',
    recurringCompletions: {},
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
    ...overrides,
  } as CalendarEvent;
}

function focus(overrides: Partial<CalendarEvent>): CalendarEvent {
  return event({
    id: 'focus-1',
    title: 'Focus block',
    source: 'planning-suggestion',
    focusSession: { intentionId: 'intention-1' },
    ...overrides,
  });
}

function intention(overrides: Partial<Intention>): Intention {
  return {
    id: 'intention-1',
    title: 'Launch portfolio',
    description: '',
    desiredOutcome: 'A clear demo flow',
    priority: 'high',
    status: 'active',
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
    ...overrides,
  };
}

function reflection(overrides: Partial<DailyReflection>): DailyReflection {
  return {
    date: '2026-07-20',
    energy: 4,
    mood: 4,
    highlight: 'Clear day',
    note: 'The work felt calm.',
    createdAt: '2026-07-20T20:00:00.000Z',
    updatedAt: '2026-07-20T20:00:00.000Z',
    ...overrides,
  };
}

function generate(overrides: Partial<Parameters<typeof generateGentleInsights>[0]> = {}) {
  return generateGentleInsights({
    calendarItems: [],
    intentions: [],
    reflections: [],
    energyProfile: defaultEnergyProfile,
    rangeStart,
    rangeEnd,
    now,
    weekStartsOnMonday: true,
    ...overrides,
  });
}

describe('generateGentleInsights thresholds and focus observations', () => {
  it('withholds focus insights below minimum sessions', () => {
    const insights = generate({
      calendarItems: [
        focus({ id: 'focus-1', date: '2026-07-20' }),
        focus({ id: 'focus-2', date: '2026-07-21' }),
      ],
    });

    expect(insights.some((insight) => insight.category === 'focus')).toBe(false);
  });

  it('detects clear morning and afternoon focus patterns but not mixed distributions', () => {
    const morningInsights = deriveInsightCandidates({
      energyProfile: defaultEnergyProfile,
      intentions: [],
      reflections: [],
      rangeStart,
      rangeEnd,
      now,
      calendarItems: [
        focus({ id: 'm1', date: '2026-07-20', startTime: '08:00', endTime: '09:00' }),
        focus({ id: 'm2', date: '2026-07-21', startTime: '09:00', endTime: '10:00' }),
        focus({ id: 'm3', date: '2026-07-22', startTime: '10:00', endTime: '11:00' }),
        focus({ id: 'a1', date: '2026-07-23', startTime: '14:00', endTime: '15:00' }),
      ],
    });
    const afternoonInsights = deriveInsightCandidates({
      energyProfile: defaultEnergyProfile,
      intentions: [],
      reflections: [],
      rangeStart,
      rangeEnd,
      now,
      calendarItems: [
        focus({ id: 'a1', date: '2026-07-20', startTime: '13:00', endTime: '14:00' }),
        focus({ id: 'a2', date: '2026-07-21', startTime: '14:00', endTime: '15:00' }),
        focus({ id: 'a3', date: '2026-07-22', startTime: '15:00', endTime: '16:00' }),
        focus({ id: 'm1', date: '2026-07-23', startTime: '09:00', endTime: '10:00' }),
      ],
    });
    const mixedInsights = deriveInsightCandidates({
      energyProfile: defaultEnergyProfile,
      intentions: [],
      reflections: [],
      rangeStart,
      rangeEnd,
      now,
      calendarItems: [
        focus({ id: 'm1', date: '2026-07-20', startTime: '08:00', endTime: '09:00' }),
        focus({ id: 'm2', date: '2026-07-21', startTime: '09:00', endTime: '10:00' }),
        focus({ id: 'a1', date: '2026-07-22', startTime: '13:00', endTime: '14:00' }),
        focus({ id: 'a2', date: '2026-07-23', startTime: '14:00', endTime: '15:00' }),
      ],
    });

    expect(morningInsights.find((insight) => insight.observationCode === 'focus-most-common-period')?.id).toContain('morning');
    expect(afternoonInsights.find((insight) => insight.observationCode === 'focus-most-common-period')?.id).toContain('afternoon');
    expect(mixedInsights.some((insight) => insight.observationCode === 'focus-most-common-period')).toBe(false);
  });

  it('calculates median duration and detects repeated short sessions without mutating inputs', () => {
    const calendarItems = [
      focus({ id: 'f1', date: '2026-07-20', startTime: '09:00', endTime: '09:20' }),
      focus({ id: 'f2', date: '2026-07-21', startTime: '09:00', endTime: '09:25' }),
      focus({ id: 'f3', date: '2026-07-22', startTime: '09:00', endTime: '09:20' }),
      focus({ id: 'f4', date: '2026-07-23', startTime: '09:00', endTime: '10:30' }),
    ];
    const before = JSON.stringify(calendarItems);
    const insights = deriveInsightCandidates({
      calendarItems,
      intentions: [],
      reflections: [],
      energyProfile: defaultEnergyProfile,
      rangeStart,
      rangeEnd,
      now,
      weekStartsOnMonday: true,
    });

    expect(insights.find((insight) => insight.observationCode === 'focus-average-duration')?.supportingMetric).toMatchObject({
      value: 23,
      unit: 'minutes',
    });
    expect(insights.some((insight) => insight.observationCode === 'focus-fragmentation')).toBe(true);
    expect(JSON.stringify(calendarItems)).toBe(before);
  });
});

describe('generateGentleInsights intentions, load, recovery, and energy', () => {
  it('counts completed intentions and conservatively identifies active intentions without recent focus', () => {
    const insights = generate({
      intentions: [
        intention({ id: 'done-1', status: 'completed', completedAt: '2026-07-18T10:00:00.000Z' }),
        intention({ id: 'done-2', status: 'completed', completedAt: '2026-07-20T10:00:00.000Z' }),
        intention({ id: 'active-old-1', title: 'Old active one', createdAt: '2026-07-01T09:00:00.000Z', updatedAt: '2026-07-01T09:00:00.000Z' }),
        intention({ id: 'active-old-2', title: 'Old active two', createdAt: '2026-07-02T09:00:00.000Z', updatedAt: '2026-07-02T09:00:00.000Z' }),
        intention({ id: 'paused', status: 'paused', createdAt: '2026-07-01T09:00:00.000Z', updatedAt: '2026-07-01T09:00:00.000Z' }),
      ],
    });

    expect(insights.find((insight) => insight.observationCode === 'intentions-completed')?.supportingMetric?.value).toBe(2);
    expect(insights.find((insight) => insight.observationCode === 'intentions-stalled')?.evidenceCount).toBe(2);
  });

  it('detects heavy days, open blocks, and back-to-back commitments within range', () => {
    const calendarItems = [
      event({ id: 'heavy-1a', date: '2026-07-18', startTime: '08:00', endTime: '12:00' }),
      event({ id: 'heavy-1b', date: '2026-07-18', startTime: '12:10', endTime: '16:00' }),
      event({ id: 'heavy-2a', date: '2026-07-19', startTime: '08:00', endTime: '12:00' }),
      event({ id: 'heavy-2b', date: '2026-07-19', startTime: '12:10', endTime: '16:00' }),
      event({ id: 'normal-1', date: '2026-07-20', startTime: '09:00', endTime: '10:00' }),
    ];
    const insights = deriveInsightCandidates({
      calendarItems,
      intentions: [],
      reflections: [],
      energyProfile: defaultEnergyProfile,
      rangeStart,
      rangeEnd,
      now,
      weekStartsOnMonday: true,
    });

    expect(insights.some((insight) => insight.observationCode === 'load-heavy-days')).toBe(true);
    expect(insights.some((insight) => insight.observationCode === 'load-open-days')).toBe(true);
    expect(insights.some((insight) => insight.observationCode === 'load-back-to-back')).toBe(true);
  });

  it('counts explicit recovery labels and does not infer recovery from empty time', () => {
    const withRecovery = generate({
      calendarItems: [
        event({ id: 'rest-1', date: '2026-07-18', title: 'Recovery walk', startTime: '17:00', endTime: '17:30' }),
        event({ id: 'rest-2', date: '2026-07-19', title: 'Restore block', startTime: '18:00', endTime: '18:30' }),
        event({ id: 'work-1', date: '2026-07-20', title: 'Work', startTime: '09:00', endTime: '10:00' }),
      ],
    });
    const withoutRecovery = generate({
      calendarItems: [
        event({ id: 'work-1', date: '2026-07-18', title: 'Work', startTime: '09:00', endTime: '10:00' }),
        event({ id: 'work-2', date: '2026-07-19', title: 'Work', startTime: '09:00', endTime: '10:00' }),
        event({ id: 'work-3', date: '2026-07-20', title: 'Work', startTime: '09:00', endTime: '10:00' }),
      ],
    });

    expect(withRecovery.some((insight) => insight.observationCode === 'recovery-labelled-days')).toBe(true);
    expect(withoutRecovery.some((insight) => insight.observationCode === 'recovery-missing')).toBe(true);
  });

  it('compares reflected energy to expected settings with thresholds', () => {
    const aligned = generate({
      reflections: [18, 19, 20, 21].map((day) => reflection({ date: `2026-07-${day}`, energy: 2, updatedAt: `2026-07-${day}T20:00:00.000Z` })),
    });
    const lower = generate({
      reflections: [18, 19, 20, 21].map((day) => reflection({ date: `2026-07-${day}`, energy: 1, updatedAt: `2026-07-${day}T09:00:00.000Z` })),
    });
    const mixed = generate({
      reflections: [
        reflection({ date: '2026-07-18', energy: 1, updatedAt: '2026-07-18T09:00:00.000Z' }),
        reflection({ date: '2026-07-19', energy: 5, updatedAt: '2026-07-19T20:00:00.000Z' }),
        reflection({ date: '2026-07-20', energy: 3, updatedAt: '2026-07-20T20:00:00.000Z' }),
        reflection({ date: '2026-07-21', energy: 4, updatedAt: '2026-07-21T09:00:00.000Z' }),
      ],
    });

    expect(aligned.some((insight) => insight.observationCode === 'energy-profile-aligned')).toBe(true);
    expect(lower.some((insight) => insight.observationCode === 'energy-profile-lower-than-reflection')).toBe(true);
    expect(mixed.some((insight) => insight.category === 'energy')).toBe(false);
  });
});

describe('generateGentleInsights confidence, ranking, stable ids, range, and immutability', () => {
  it('applies threshold constants and confidence rules', () => {
    expect(gentleInsightThresholds.focusMinimumSessions).toBe(3);

    const emerging = deriveInsightCandidates({
      intentions: [],
      reflections: [],
      energyProfile: defaultEnergyProfile,
      rangeStart,
      rangeEnd,
      now,
      calendarItems: [
        focus({ id: 'f1', date: '2026-07-20' }),
        focus({ id: 'f2', date: '2026-07-21' }),
        focus({ id: 'f3', date: '2026-07-22' }),
      ],
    }).find((insight) => insight.observationCode === 'focus-average-duration');
    const strong = deriveInsightCandidates({
      intentions: [],
      reflections: [],
      energyProfile: defaultEnergyProfile,
      rangeStart,
      rangeEnd,
      now,
      calendarItems: Array.from({ length: 8 }, (_, index) =>
        focus({ id: `f-${index}`, date: `2026-07-${18 + index}`, startTime: '09:00', endTime: '10:00' }),
      ),
    }).find((insight) => insight.observationCode === 'focus-average-duration');

    expect(emerging?.confidence).toBe('emerging');
    expect(strong?.confidence).toBe('strong');
  });

  it('ranks deterministically, caps results, and limits per category', () => {
    const insights = generate({
      calendarItems: [
        ...Array.from({ length: 8 }, (_, index) => focus({ id: `f-${index}`, date: `2026-07-${18 + index}`, startTime: '09:00', endTime: '10:00' })),
        event({ id: 'rest-1', date: '2026-07-18', title: 'Recovery walk', startTime: '17:00', endTime: '17:30' }),
        event({ id: 'rest-2', date: '2026-07-19', title: 'Restore block', startTime: '18:00', endTime: '18:30' }),
      ],
      intentions: [
        intention({ id: 'done-1', status: 'completed', completedAt: '2026-07-18T10:00:00.000Z' }),
        intention({ id: 'done-2', status: 'completed', completedAt: '2026-07-20T10:00:00.000Z' }),
      ],
      reflections: [18, 19, 20, 21].map((day) => reflection({ date: `2026-07-${day}`, energy: 2, updatedAt: `2026-07-${day}T20:00:00.000Z` })),
    });
    const focusCount = insights.filter((insight) => insight.category === 'focus').length;

    expect(insights.length).toBeLessThanOrEqual(5);
    expect(focusCount).toBeLessThanOrEqual(2);
    expect(generate({
      calendarItems: [
        ...Array.from({ length: 8 }, (_, index) => focus({ id: `f-${index}`, date: `2026-07-${18 + index}`, startTime: '09:00', endTime: '10:00' })),
        event({ id: 'rest-1', date: '2026-07-18', title: 'Recovery walk', startTime: '17:00', endTime: '17:30' }),
        event({ id: 'rest-2', date: '2026-07-19', title: 'Restore block', startTime: '18:00', endTime: '18:30' }),
      ],
      intentions: [
        intention({ id: 'done-1', status: 'completed', completedAt: '2026-07-18T10:00:00.000Z' }),
        intention({ id: 'done-2', status: 'completed', completedAt: '2026-07-20T10:00:00.000Z' }),
      ],
      reflections: [18, 19, 20, 21].map((day) => reflection({ date: `2026-07-${day}`, energy: 2, updatedAt: `2026-07-${day}T20:00:00.000Z` })),
    }).map((insight) => insight.id)).toEqual(insights.map((insight) => insight.id));
  });

  it('produces stable ids and changes ids when the range changes', () => {
    const calendarItems = [
      focus({ id: 'f1', date: '2026-07-20' }),
      focus({ id: 'f2', date: '2026-07-21' }),
      focus({ id: 'f3', date: '2026-07-22' }),
    ];
    const first = generate({ calendarItems });
    const second = generate({ calendarItems });
    const shifted = generate({ calendarItems, rangeStart: new Date('2026-07-15') });

    expect(first.map((insight) => insight.id)).toEqual(second.map((insight) => insight.id));
    expect(shifted.map((insight) => insight.id)).not.toEqual(first.map((insight) => insight.id));
  });

  it('clips future data, ignores input before range, handles empty ranges, and does not mutate inputs', () => {
    const calendarItems = [
      focus({ id: 'before', date: '2026-07-01' }),
      focus({ id: 'future', date: '2026-07-30' }),
    ];
    const intentions = [intention({ id: 'done', status: 'completed', completedAt: '2026-07-30T10:00:00.000Z' })];
    const reflections = [reflection({ date: '2026-07-30' })];
    const energyProfile = structuredClone(defaultEnergyProfile);
    const before = JSON.stringify({ calendarItems, intentions, reflections, energyProfile });

    expect(generate({ calendarItems, intentions, reflections, energyProfile })).toEqual([]);
    expect(generate({ calendarItems, rangeStart: new Date('2026-08-02'), rangeEnd: new Date('2026-08-01') })).toEqual([]);
    expect(JSON.stringify({ calendarItems, intentions, reflections, energyProfile })).toBe(before);
  });

  it('keeps recurrence expansion bounded to the requested range', () => {
    const candidates = deriveInsightCandidates({
      calendarItems: [
        focus({
          id: 'daily-focus',
          date: '2026-01-01',
          recurrence: 'daily',
          recurrenceEndDate: '2026-12-31',
        }),
      ],
      intentions: [],
      reflections: [],
      energyProfile: defaultEnergyProfile,
      rangeStart: new Date('2026-07-20'),
      rangeEnd: new Date('2026-07-22'),
      now,
      weekStartsOnMonday: true,
    });

    expect(candidates.find((insight) => insight.observationCode === 'focus-average-duration')?.evidenceCount).toBe(3);
  });

  it('returns supported ranges with explicit local-day starts', () => {
    expect(format(getGentleInsightRange('last-7', now).rangeStart, 'yyyy-MM-dd')).toBe('2026-07-23');
    expect(format(getGentleInsightRange('last-14', now).rangeStart, 'yyyy-MM-dd')).toBe('2026-07-16');
    expect(format(getGentleInsightRange('last-30', now).rangeStart, 'yyyy-MM-dd')).toBe('2026-06-30');
  });
});
