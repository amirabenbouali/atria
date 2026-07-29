import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../../calendar/types/calendar.types';
import type { Intention } from '../../intentions';
import { defaultEnergyProfile } from '../../timeQuality';
import { getAvailableGaps, getDailyCommittedMinutes, getDailyLoad } from '../utils/availability';
import { getEnergyCompatibility, scoreCandidate } from '../utils/scoring';
import {
  generatePlanningSuggestions,
  getFocusSessionDraft,
  validateAdjustedSuggestion,
} from './planningSuggestion.service';

const now = new Date('2026-07-29T06:30:00');

function event(overrides: Partial<CalendarEvent> & Pick<CalendarEvent, 'id' | 'date'>): CalendarEvent {
  const { id, date, ...rest } = overrides;

  return {
    id,
    itemType: 'event',
    title: 'Busy',
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

function intention(overrides: Partial<Intention> = {}): Intention {
  return {
    id: 'intention-1',
    title: 'Write case study',
    priority: 'high',
    estimatedMinutes: 60,
    energyRequired: 'high',
    preferredTimeOfDay: 'morning',
    status: 'active',
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
    ...overrides,
  };
}

describe('planning availability', () => {
  it('detects start, middle, and end gaps without mutating input items', () => {
    const items = [
      event({ id: 'one', date: '2026-07-29', startTime: '09:00', endTime: '10:00' }),
      event({ id: 'two', date: '2026-07-29', startTime: '13:00', endTime: '14:00' }),
    ];
    const originalIds = items.map((item) => item.id);
    const gaps = getAvailableGaps({
      calendarItems: items,
      rangeStart: new Date('2026-07-29T07:00:00'),
      rangeEnd: new Date('2026-07-29T22:00:00'),
      energyProfile: defaultEnergyProfile,
    });

    expect(gaps.map((gap) => gap.durationMinutes)).toEqual([120, 180, 480]);
    expect(items.map((item) => item.id)).toEqual(originalIds);
  });

  it('merges overlapping and touching events', () => {
    const gaps = getAvailableGaps({
      calendarItems: [
        event({ id: 'one', date: '2026-07-29', startTime: '09:00', endTime: '10:00' }),
        event({ id: 'two', date: '2026-07-29', startTime: '09:30', endTime: '11:00' }),
        event({ id: 'three', date: '2026-07-29', startTime: '11:00', endTime: '12:00' }),
      ],
      rangeStart: new Date('2026-07-29T07:00:00'),
      rangeEnd: new Date('2026-07-29T13:00:00'),
      energyProfile: defaultEnergyProfile,
    });

    expect(gaps.map((gap) => gap.durationMinutes)).toEqual([120, 60]);
  });

  it('clips events crossing midnight to the scheduling window', () => {
    const gaps = getAvailableGaps({
      calendarItems: [
        event({ id: 'overnight', date: '2026-07-28', startTime: '21:00', endTime: '08:00' }),
      ],
      rangeStart: new Date('2026-07-29T07:00:00'),
      rangeEnd: new Date('2026-07-29T22:00:00'),
      energyProfile: defaultEnergyProfile,
    });

    expect(gaps[0].durationMinutes).toBe(14 * 60);
  });

  it('calculates daily load labels from timed commitments', () => {
    expect(getDailyLoad(getDailyCommittedMinutes([], new Date('2026-07-29T09:00:00')))).toBe('light');
    expect(
      getDailyLoad(
        getDailyCommittedMinutes(
          [event({ id: 'heavy', date: '2026-07-29', startTime: '08:00', endTime: '15:30' })],
          new Date('2026-07-29T09:00:00'),
        ),
      ),
    ).toBe('heavy');
  });
});

describe('planning scoring and compatibility', () => {
  it('maps energy requirements deterministically', () => {
    expect(getEnergyCompatibility('low', 1).strength).toBe('best');
    expect(getEnergyCompatibility('medium', 2).strength).toBe('acceptable');
    expect(getEnergyCompatibility('medium', 1).warningCodes).toContain('low-energy-period');
    expect(getEnergyCompatibility('high', 4).reasonCodes).toContain('matches-energy');
    expect(getEnergyCompatibility('high', 2).strength).toBe('weak');
  });

  it('ranks preferred full-duration matches above weaker shortened matches', () => {
    const strong = scoreCandidate({
      intention: intention(),
      energyRequirement: 'high',
      preferredTimeOfDay: 'morning',
      dailyLoad: 'light',
      gap: {
        start: '2026-07-29T08:00:00.000Z',
        end: '2026-07-29T10:00:00.000Z',
        durationMinutes: 120,
        dayPeriod: 'morning',
        energyLevel: 5,
        preferredQualities: ['deep-focus'],
      },
      assumedDuration: false,
      fullEstimateFits: true,
      dayIndex: 0,
      now,
    });
    const weak = scoreCandidate({
      intention: intention(),
      energyRequirement: 'high',
      preferredTimeOfDay: 'morning',
      dailyLoad: 'heavy',
      gap: {
        start: '2026-07-29T18:00:00.000Z',
        end: '2026-07-29T18:30:00.000Z',
        durationMinutes: 30,
        dayPeriod: 'evening',
        energyLevel: 2,
        preferredQualities: ['recovery'],
      },
      assumedDuration: false,
      fullEstimateFits: false,
      dayIndex: 1,
      now,
    });

    expect(strong.score.total).toBeGreaterThan(weak.score.total);
    expect(strong.score.factors.reduce((total, factor) => total + factor.value, 0)).toBe(strong.score.total);
    expect(weak.warningCodes).toEqual(expect.arrayContaining(['shorter-than-estimate', 'outside-preferred-time', 'low-energy-period']));
  });
});

describe('planning suggestion generation', () => {
  it('returns sorted suggestions capped by the configured maximum', () => {
    const suggestions = generatePlanningSuggestions({
      intention: intention(),
      calendarItems: [
        event({ id: 'busy', date: '2026-07-29', startTime: '09:00', endTime: '10:00' }),
      ],
      energyProfile: defaultEnergyProfile,
      now,
      config: { maxSuggestions: 2 },
    });

    expect(suggestions).toHaveLength(2);
    expect(suggestions[0].score).toBeGreaterThanOrEqual(suggestions[1].score);
    expect(suggestions[0].reasonCodes).toContain('matches-energy');
  });

  it('uses default duration when no estimate is set', () => {
    const [suggestion] = generatePlanningSuggestions({
      intention: intention({ estimatedMinutes: undefined }),
      calendarItems: [],
      energyProfile: defaultEnergyProfile,
      now,
    });

    expect(suggestion.durationMinutes).toBe(45);
    expect(suggestion.reasonCodes).toContain('assumed-duration');
  });

  it('caps long intentions and warns about multiple-session work', () => {
    const [suggestion] = generatePlanningSuggestions({
      intention: intention({ estimatedMinutes: 180 }),
      calendarItems: [],
      energyProfile: defaultEnergyProfile,
      now,
    });

    expect(suggestion.durationMinutes).toBe(120);
    expect(suggestion.warningCodes).toContain('long-session');
  });

  it('excludes candidates after deadlines and passed deadlines', () => {
    expect(
      generatePlanningSuggestions({
        intention: intention({ deadline: '2026-07-28' }),
        calendarItems: [],
        energyProfile: defaultEnergyProfile,
        now,
      }),
    ).toEqual([]);

    const suggestions = generatePlanningSuggestions({
      intention: intention({ deadline: '2026-07-29' }),
      calendarItems: [],
      energyProfile: defaultEnergyProfile,
      now,
    });

    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('returns empty when no valid gaps exist', () => {
    const suggestions = generatePlanningSuggestions({
      intention: intention(),
      calendarItems: [event({ id: 'all-day-busy', date: '2026-07-29', startTime: '07:00', endTime: '22:00' })],
      energyProfile: defaultEnergyProfile,
      now,
      config: { searchDays: 0 },
    });

    expect(suggestions).toEqual([]);
  });
});

describe('planning adjustment and acceptance helpers', () => {
  it('rejects invalid adjustments and accepts valid adjusted blocks', () => {
    const baseInput = {
      intention: intention(),
      calendarItems: [event({ id: 'busy', date: '2026-07-29', startTime: '09:00', endTime: '10:00' })],
      energyProfile: defaultEnergyProfile,
      now,
    };

    expect(
      validateAdjustedSuggestion({
        ...baseInput,
        start: new Date('2026-07-29T09:30:00'),
        end: new Date('2026-07-29T10:30:00'),
      }).isValid,
    ).toBe(false);

    expect(
      validateAdjustedSuggestion({
        ...baseInput,
        start: new Date('2026-07-29T10:15:00'),
        end: new Date('2026-07-29T11:00:00'),
      }).isValid,
    ).toBe(true);
  });

  it('creates a focus session draft linked to the intention and suggestion', () => {
    const [suggestion] = generatePlanningSuggestions({
      intention: intention(),
      calendarItems: [],
      energyProfile: defaultEnergyProfile,
      now,
    });
    const draft = getFocusSessionDraft({ intention: intention(), suggestion });

    expect(draft.itemType).toBe('event');
    expect(draft.source).toBe('planning-suggestion');
    expect(draft.focusSession.intentionId).toBe('intention-1');
    expect(draft.recurrence).toBe('none');
  });
});
