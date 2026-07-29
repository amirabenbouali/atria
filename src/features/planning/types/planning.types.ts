import type { CalendarEvent } from '../../calendar/types/calendar.types';
import type {
  DayPeriod,
  EnergyLevel,
  EnergyProfile,
  EnergyRequirement,
  PreferredTimeOfDay,
  TimeQuality,
} from '../../timeQuality';
import type { Intention } from '../../intentions';

export type PlanningConfidence = 'low' | 'medium' | 'high';

export type SuggestionReasonCode =
  | 'matches-energy'
  | 'matches-time-preference'
  | 'before-deadline'
  | 'enough-duration'
  | 'priority-weight'
  | 'recovery-preserved'
  | 'soonest-suitable-slot'
  | 'assumed-duration';

export type SuggestionWarningCode =
  | 'shorter-than-estimate'
  | 'outside-preferred-time'
  | 'low-energy-period'
  | 'close-to-deadline'
  | 'limited-availability'
  | 'long-session'
  | 'near-existing-commitment'
  | 'heavy-day'
  | 'after-deadline';

export type CandidateScoreFactor = {
  code: string;
  value: number;
};

export type CandidateScore = {
  total: number;
  factors: CandidateScoreFactor[];
};

export type AvailableGap = {
  start: string;
  end: string;
  durationMinutes: number;
  dayPeriod: DayPeriod;
  energyLevel: EnergyLevel;
  preferredQualities: TimeQuality[];
  nearbyEventBefore?: string;
  nearbyEventAfter?: string;
  containsAllDayCommitment?: boolean;
};

export type PlanningSuggestion = {
  id: string;
  intentionId: string;
  proposedStart: string;
  proposedEnd: string;
  durationMinutes: number;
  score: number;
  confidence: PlanningConfidence;
  reasonCodes: SuggestionReasonCode[];
  warningCodes: SuggestionWarningCode[];
  scoreFactors: CandidateScoreFactor[];
  createdAt: string;
};

export type PlanningConfig = {
  earliestStartMinute: number;
  latestEndMinute: number;
  minimumFocusMinutes: number;
  defaultFocusMinutes: number;
  maximumSingleSessionMinutes: number;
  bufferMinutes: number;
  maxSuggestions: number;
  searchDays: number;
};

export type GeneratePlanningSuggestionsInput = {
  intention: Intention;
  calendarItems: CalendarEvent[];
  energyProfile: EnergyProfile;
  now: Date;
  rangeStart?: Date;
  rangeEnd?: Date;
  config?: Partial<PlanningConfig>;
  weekStartsOnMonday?: boolean;
};

export type AdjustmentValidationInput = {
  intention: Intention;
  calendarItems: CalendarEvent[];
  energyProfile: EnergyProfile;
  start: Date;
  end: Date;
  now: Date;
  config?: Partial<PlanningConfig>;
  weekStartsOnMonday?: boolean;
  ignoreCalendarItemId?: string;
};

export type AdjustmentValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: SuggestionWarningCode[];
};

export type EnergyCompatibility = {
  strength: 'weak' | 'acceptable' | 'best';
  reasonCodes: SuggestionReasonCode[];
  warningCodes: SuggestionWarningCode[];
};

export type DailyLoad = 'light' | 'balanced' | 'heavy';

export type CandidateContext = {
  intention: Intention;
  energyRequirement?: EnergyRequirement;
  preferredTimeOfDay?: PreferredTimeOfDay;
  dailyLoad: DailyLoad;
  gap: AvailableGap;
  assumedDuration: boolean;
  fullEstimateFits: boolean;
  dayIndex: number;
  now: Date;
};
