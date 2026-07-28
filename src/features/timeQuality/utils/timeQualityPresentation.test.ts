import { describe, expect, it } from 'vitest';
import { timeQualities } from './timeQualityGuards';
import { dayPeriods } from './energyProfile';
import {
  getDayPeriodLabel,
  getEnergyLabel,
  getTimeQualityLabel,
} from './timeQualityPresentation';

describe('time quality presentation', () => {
  it('maps energy levels to readable labels', () => {
    expect(getEnergyLabel(1)).toBe('1 - Very low');
    expect(getEnergyLabel(5)).toBe('5 - Very high');
  });

  it('has labels for all day periods', () => {
    expect(dayPeriods.map(getDayPeriodLabel)).toEqual(['Morning', 'Afternoon', 'Evening']);
  });

  it('has labels for all time qualities', () => {
    expect(timeQualities.map(getTimeQualityLabel)).toEqual([
      'Deep focus',
      'Creative',
      'Light work',
      'Social',
      'Recovery',
      'Neutral',
    ]);
  });
});
