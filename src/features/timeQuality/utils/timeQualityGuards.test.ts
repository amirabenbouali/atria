import { describe, expect, it } from 'vitest';
import {
  isEnergyLevel,
  isEnergyRequirement,
  isPreferredTimeOfDay,
  isTimeQuality,
} from './timeQualityGuards';

describe('time quality guards', () => {
  it('accepts valid enum values', () => {
    expect(isEnergyRequirement('high')).toBe(true);
    expect(isPreferredTimeOfDay('morning')).toBe(true);
    expect(isTimeQuality('deep-focus')).toBe(true);
  });

  it('rejects invalid enum values', () => {
    expect(isEnergyRequirement('urgent')).toBe(false);
    expect(isPreferredTimeOfDay('midnight')).toBe(false);
    expect(isTimeQuality('busy')).toBe(false);
  });

  it('accepts energy values from 1 to 5 only', () => {
    expect([1, 2, 3, 4, 5].every(isEnergyLevel)).toBe(true);
    expect(isEnergyLevel(0)).toBe(false);
    expect(isEnergyLevel(6)).toBe(false);
    expect(isEnergyLevel(3.5)).toBe(false);
  });
});
