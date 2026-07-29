import { format, parseISO } from 'date-fns';
import type {
  PlanningConfidence,
  PlanningSuggestion,
  SuggestionReasonCode,
  SuggestionWarningCode,
} from '../types/planning.types';

const reasonMessages: Record<SuggestionReasonCode, string> = {
  'matches-energy': 'This matches the energy level in your current settings.',
  'matches-time-preference': 'This matches your preferred time of day.',
  'before-deadline': 'This falls before the current deadline.',
  'enough-duration': 'The full estimated duration fits here.',
  'priority-weight': 'This gives a higher-priority intention earlier attention.',
  'recovery-preserved': 'This keeps a recovery-quality period visible.',
  'soonest-suitable-slot': 'This is one of the earliest suitable open blocks.',
  'assumed-duration': 'Atria used a 45-minute default because no estimate is set.',
};

const warningMessages: Record<SuggestionWarningCode, string> = {
  'shorter-than-estimate': 'This block is shorter than the estimate.',
  'outside-preferred-time': 'This falls outside the preferred time of day.',
  'low-energy-period': 'Your current settings mark this as a lower-energy period.',
  'close-to-deadline': 'This is close to the deadline.',
  'limited-availability': 'Availability is limited in this search window.',
  'long-session': 'This intention may need more than one session.',
  'near-existing-commitment': 'This sits near another calendar commitment.',
  'heavy-day': 'This day already has a heavier timed schedule.',
  'after-deadline': 'This is after the current deadline.',
};

const confidenceLabels: Record<PlanningConfidence, string> = {
  high: 'Strong match',
  medium: 'Reasonable match',
  low: 'Limited match',
};

export function getSuggestionReasonMessage(code: SuggestionReasonCode) {
  return reasonMessages[code];
}

export function getSuggestionWarningMessage(code: SuggestionWarningCode) {
  return warningMessages[code];
}

export function getPlanningConfidenceLabel(confidence: PlanningConfidence) {
  return confidenceLabels[confidence];
}

export function getSuggestionDateLabel(suggestion: PlanningSuggestion) {
  return format(parseISO(suggestion.proposedStart), 'EEEE, MMM d');
}

export function getSuggestionTimeLabel(suggestion: PlanningSuggestion) {
  return `${format(parseISO(suggestion.proposedStart), 'HH:mm')} - ${format(parseISO(suggestion.proposedEnd), 'HH:mm')}`;
}

export function getSuggestionSearchRangeLabel(start: Date, end: Date) {
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;
}
