import { differenceInCalendarDays, differenceInMinutes, parseISO, startOfDay } from 'date-fns';
import type { IntentionPriority } from '../../intentions';
import type { EnergyLevel, EnergyRequirement, PreferredTimeOfDay } from '../../timeQuality';
import type {
  CandidateContext,
  CandidateScoreFactor,
  CandidateScore,
  DailyLoad,
  EnergyCompatibility,
  PlanningConfidence,
  SuggestionReasonCode,
  SuggestionWarningCode,
} from '../types/planning.types';

const priorityWeight: Record<IntentionPriority, number> = {
  low: 2,
  medium: 5,
  high: 9,
};

const dailyLoadWeight: Record<DailyLoad, number> = {
  light: 6,
  balanced: 3,
  heavy: -5,
};

function factor(code: string, value: number) {
  return { code, value };
}

export function getEnergyCompatibility(
  requirement: EnergyRequirement | undefined,
  energyLevel: EnergyLevel,
): EnergyCompatibility {
  if (!requirement) {
    return {
      strength: 'acceptable',
      reasonCodes: [],
      warningCodes: [],
    };
  }

  if (requirement === 'low') {
    return energyLevel <= 5
      ? { strength: 'best', reasonCodes: ['matches-energy'], warningCodes: [] }
      : { strength: 'weak', reasonCodes: [], warningCodes: ['low-energy-period'] };
  }

  if (requirement === 'medium') {
    if (energyLevel >= 3) {
      return { strength: 'best', reasonCodes: ['matches-energy'], warningCodes: [] };
    }

    if (energyLevel === 2) {
      return { strength: 'acceptable', reasonCodes: [], warningCodes: [] };
    }

    return { strength: 'weak', reasonCodes: [], warningCodes: ['low-energy-period'] };
  }

  if (energyLevel >= 4) {
    return { strength: 'best', reasonCodes: ['matches-energy'], warningCodes: [] };
  }

  if (energyLevel === 3) {
    return { strength: 'acceptable', reasonCodes: [], warningCodes: [] };
  }

  return { strength: 'weak', reasonCodes: [], warningCodes: ['low-energy-period'] };
}

export function doesPreferredTimeMatch(preferredTimeOfDay: PreferredTimeOfDay | undefined, dayPeriod: string) {
  return !preferredTimeOfDay || preferredTimeOfDay === 'any' || preferredTimeOfDay === dayPeriod;
}

export function getConfidence(score: number): PlanningConfidence {
  if (score >= 62) {
    return 'high';
  }

  if (score >= 42) {
    return 'medium';
  }

  return 'low';
}

function getDeadlineFactors(context: CandidateContext) {
  const factors: CandidateScoreFactor[] = [];
  const reasonCodes: SuggestionReasonCode[] = [];
  const warningCodes: SuggestionWarningCode[] = [];

  if (!context.intention.deadline) {
    return { factors, reasonCodes, warningCodes };
  }

  const candidateStart = parseISO(context.gap.start);
  const deadline = parseISO(context.intention.deadline);
  const daysUntilDeadline = differenceInCalendarDays(startOfDay(deadline), startOfDay(candidateStart));

  if (daysUntilDeadline >= 0) {
    reasonCodes.push('before-deadline');
    factors.push(factor('before-deadline', daysUntilDeadline <= 1 ? 3 : 7));
  }

  if (daysUntilDeadline >= 0 && daysUntilDeadline <= 1) {
    warningCodes.push('close-to-deadline');
    factors.push(factor('close-to-deadline', -3));
  }

  return { factors, reasonCodes, warningCodes };
}

export function scoreCandidate(context: CandidateContext): {
  score: CandidateScore;
  reasonCodes: SuggestionReasonCode[];
  warningCodes: SuggestionWarningCode[];
} {
  const reasons = new Set<SuggestionReasonCode>();
  const warnings = new Set<SuggestionWarningCode>();
  const scoreFactors = [factor('base', 35)];

  if (context.fullEstimateFits) {
    reasons.add('enough-duration');
    scoreFactors.push(factor('enough-duration', 16));
  } else {
    warnings.add('shorter-than-estimate');
    scoreFactors.push(factor('shorter-than-estimate', -14));
  }

  if (context.assumedDuration) {
    reasons.add('assumed-duration');
  }

  if (context.intention.estimatedMinutes && context.intention.estimatedMinutes > 120) {
    warnings.add('long-session');
    scoreFactors.push(factor('long-session', -4));
  }

  const energyCompatibility = getEnergyCompatibility(context.energyRequirement, context.gap.energyLevel);
  energyCompatibility.reasonCodes.forEach((code) => reasons.add(code));
  energyCompatibility.warningCodes.forEach((code) => warnings.add(code));
  scoreFactors.push(
    factor(
      'energy-compatibility',
      energyCompatibility.strength === 'best' ? 14 : energyCompatibility.strength === 'acceptable' ? 4 : -12,
    ),
  );

  if (doesPreferredTimeMatch(context.preferredTimeOfDay, context.gap.dayPeriod)) {
    if (context.preferredTimeOfDay && context.preferredTimeOfDay !== 'any') {
      reasons.add('matches-time-preference');
      scoreFactors.push(factor('matches-time-preference', 12));
    }
  } else {
    warnings.add('outside-preferred-time');
    scoreFactors.push(factor('outside-preferred-time', -10));
  }

  if (context.gap.preferredQualities.includes('recovery')) {
    reasons.add('recovery-preserved');
    scoreFactors.push(factor('recovery-preserved', 2));
  }

  const deadlineScore = getDeadlineFactors(context);
  deadlineScore.reasonCodes.forEach((code) => reasons.add(code));
  deadlineScore.warningCodes.forEach((code) => warnings.add(code));
  scoreFactors.push(...deadlineScore.factors);

  if (context.gap.nearbyEventBefore || context.gap.nearbyEventAfter) {
    warnings.add('near-existing-commitment');
    scoreFactors.push(factor('near-existing-commitment', -3));
  }

  if (context.dailyLoad === 'heavy') {
    warnings.add('heavy-day');
  }
  scoreFactors.push(factor(`daily-load-${context.dailyLoad}`, dailyLoadWeight[context.dailyLoad]));

  if (context.intention.priority === 'high') {
    reasons.add('priority-weight');
  }
  scoreFactors.push(factor(`priority-${context.intention.priority}`, priorityWeight[context.intention.priority]));

  const minutesFromNow = Math.max(0, differenceInMinutes(parseISO(context.gap.start), context.now));
  scoreFactors.push(factor('soonest-suitable-slot', Math.max(-8, 8 - Math.floor(minutesFromNow / 360))));

  if (context.dayIndex === 0) {
    reasons.add('soonest-suitable-slot');
  }

  const total = scoreFactors.reduce((sum, item) => sum + item.value, 0);

  return {
    score: {
      total,
      factors: scoreFactors,
    },
    reasonCodes: Array.from(reasons),
    warningCodes: Array.from(warnings),
  };
}
