import type {
  DayPeriod,
  EnergyLevel,
  TimeQuality,
} from '../types/timeQuality.types';

export const energyLabels: Record<EnergyLevel, string> = {
  1: 'Very low',
  2: 'Low',
  3: 'Steady',
  4: 'High',
  5: 'Very high',
};

export const timeQualityLabels: Record<TimeQuality, string> = {
  'deep-focus': 'Deep focus',
  creative: 'Creative',
  'light-work': 'Light work',
  social: 'Social',
  recovery: 'Recovery',
  neutral: 'Neutral',
};

export const dayPeriodLabels: Record<DayPeriod, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

export function getEnergyLabel(level: EnergyLevel) {
  return `${level} - ${energyLabels[level]}`;
}

export function getTimeQualityLabel(quality: TimeQuality) {
  return timeQualityLabels[quality];
}

export function getDayPeriodLabel(period: DayPeriod) {
  return dayPeriodLabels[period];
}
