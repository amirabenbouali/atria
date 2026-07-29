import type { PlanningConfig } from '../types/planning.types';

export const defaultPlanningConfig: PlanningConfig = {
  earliestStartMinute: 7 * 60,
  latestEndMinute: 22 * 60,
  minimumFocusMinutes: 25,
  defaultFocusMinutes: 45,
  maximumSingleSessionMinutes: 120,
  bufferMinutes: 15,
  maxSuggestions: 3,
  searchDays: 7,
};

export function resolvePlanningConfig(config?: Partial<PlanningConfig>): PlanningConfig {
  return {
    ...defaultPlanningConfig,
    ...config,
  };
}
