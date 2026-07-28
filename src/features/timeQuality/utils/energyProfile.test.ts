import { describe, expect, it } from 'vitest';
import {
  defaultEnergyProfile,
  getDayPeriodForDate,
  getEnergyCompatibilityNote,
  getEnergyForDate,
  getPreferredQualitiesForDate,
  normalizeEnergyProfile,
} from './energyProfile';

describe('energy profile utilities', () => {
  it('resolves day periods from local time boundaries', () => {
    expect(getDayPeriodForDate(new Date('2026-07-29T05:00:00'))).toBe('morning');
    expect(getDayPeriodForDate(new Date('2026-07-29T11:59:00'))).toBe('morning');
    expect(getDayPeriodForDate(new Date('2026-07-29T12:00:00'))).toBe('afternoon');
    expect(getDayPeriodForDate(new Date('2026-07-29T16:59:00'))).toBe('afternoon');
    expect(getDayPeriodForDate(new Date('2026-07-29T17:00:00'))).toBe('evening');
    expect(getDayPeriodForDate(new Date('2026-07-29T04:59:00'))).toBe('evening');
  });

  it('returns energy and preferred qualities for a date', () => {
    expect(getEnergyForDate(new Date('2026-07-29T13:00:00'), defaultEnergyProfile)).toBe(3);
    expect(getPreferredQualitiesForDate(new Date('2026-07-29T13:00:00'), defaultEnergyProfile)).toEqual([
      'light-work',
      'social',
    ]);
  });

  it('normalizes energy values and qualities conservatively', () => {
    expect(
      normalizeEnergyProfile({
        morning: {
          energy: 5,
          preferredQualities: ['deep-focus', 'deep-focus', 'invalid', 'creative'],
        },
        afternoon: {
          energy: 9,
          preferredQualities: [],
        },
      }),
    ).toEqual({
      morning: {
        energy: 5,
        preferredQualities: ['deep-focus', 'creative'],
      },
      afternoon: {
        energy: 3,
        preferredQualities: [],
      },
      evening: defaultEnergyProfile.evening,
    });
  });

  it('creates a compatibility note only when a requirement exceeds period energy', () => {
    expect(getEnergyCompatibilityNote('evening', 'high', defaultEnergyProfile)).toBe(
      'Your evening energy is currently set to 2.',
    );
    expect(getEnergyCompatibilityNote('morning', 'high', defaultEnergyProfile)).toBeUndefined();
    expect(getEnergyCompatibilityNote('any', 'high', defaultEnergyProfile)).toBeUndefined();
    expect(getEnergyCompatibilityNote('evening', undefined, defaultEnergyProfile)).toBeUndefined();
  });
});
