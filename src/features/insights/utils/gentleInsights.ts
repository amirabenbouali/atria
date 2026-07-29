import {
  addDays,
  differenceInCalendarDays,
  differenceInMinutes,
  format,
  isAfter,
  isBefore,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns';
import type { CalendarEvent } from '../../calendar/types/calendar.types';
import { getMinutesFromTime } from '../../calendar/utils/calendarTime';
import type { Intention } from '../../intentions';
import { getPlanningOccurrencesForRange, getAvailableGaps } from '../../planning/utils/availability';
import type { DailyReflection } from '../../reflections';
import type { DayPeriod, EnergyProfile } from '../../timeQuality';
import { getDayPeriodForDate } from '../../timeQuality';
import type {
  GentleInsight,
  InsightCategory,
  InsightConfidence,
  InsightEvidence,
  InsightPeriodSummary,
  InsightRangeKey,
} from '../types/gentleInsights.types';

export type GentleInsightsConfig = {
  maxInsights: number;
  maxPerCategory: number;
  focusMinimumSessions: number;
  focusMinimumDays: number;
  focusLeadingMinimumSessions: number;
  focusLeadingMargin: number;
  focusShortSessionMinutes: number;
  focusShortSessionRatio: number;
  intentionsMinimumSignals: number;
  stalledIntentionDays: number;
  loadMinimumObservedDays: number;
  loadMinimumTimedDays: number;
  heavyDayMinutes: number;
  openGapMinutes: number;
  backToBackGapMinutes: number;
  recoveryMinimumObservedDays: number;
  recoveryMinimumLabelledDays: number;
  reflectionMinimumDays: number;
  energyMinimumDays: number;
};

export type GenerateGentleInsightsInput = {
  calendarItems: CalendarEvent[];
  intentions: Intention[];
  reflections: DailyReflection[];
  energyProfile: EnergyProfile;
  rangeStart: Date;
  rangeEnd: Date;
  now: Date;
  config?: Partial<GentleInsightsConfig>;
  weekStartsOnMonday?: boolean;
};

type TimedOccurrence = CalendarEvent & {
  itemType: 'event';
  startTime: string;
  endTime: string;
  durationMinutes: number;
  period: DayPeriod;
};

type InsightCandidate = GentleInsight & {
  rank: number;
  family: string;
};

export const gentleInsightThresholds: GentleInsightsConfig = {
  maxInsights: 5,
  maxPerCategory: 2,
  focusMinimumSessions: 3,
  focusMinimumDays: 2,
  focusLeadingMinimumSessions: 3,
  focusLeadingMargin: 2,
  focusShortSessionMinutes: 30,
  focusShortSessionRatio: 0.5,
  intentionsMinimumSignals: 2,
  stalledIntentionDays: 7,
  loadMinimumObservedDays: 5,
  loadMinimumTimedDays: 3,
  heavyDayMinutes: 7 * 60,
  openGapMinutes: 90,
  backToBackGapMinutes: 15,
  recoveryMinimumObservedDays: 5,
  recoveryMinimumLabelledDays: 2,
  reflectionMinimumDays: 4,
  energyMinimumDays: 4,
};

export const insightRangeOptions: Array<{ label: string; value: InsightRangeKey; days: number }> = [
  { label: 'Last 7 days', value: 'last-7', days: 7 },
  { label: 'Last 14 days', value: 'last-14', days: 14 },
  { label: 'Last 30 days', value: 'last-30', days: 30 },
];

export function getGentleInsightRange(range: InsightRangeKey, now: Date) {
  const days = insightRangeOptions.find((option) => option.value === range)?.days ?? 14;
  const rangeEnd = startOfDay(now);

  return {
    rangeStart: addDays(rangeEnd, -(days - 1)),
    rangeEnd,
  };
}

function formatDateKey(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function parseDate(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

function getDaysInRange(rangeStart: Date, rangeEnd: Date) {
  if (isAfter(rangeStart, rangeEnd)) {
    return [];
  }

  const dayCount = differenceInCalendarDays(rangeEnd, rangeStart) + 1;
  return Array.from({ length: dayCount }, (_, index) => addDays(startOfDay(rangeStart), index));
}

function isTimedEvent(item: CalendarEvent): item is TimedOccurrence {
  if (item.itemType !== 'event' || !item.startTime || !item.endTime) {
    return false;
  }

  const durationMinutes = getMinutesFromTime(item.endTime) - getMinutesFromTime(item.startTime);
  return durationMinutes > 0;
}

function toTimedOccurrence(item: CalendarEvent): TimedOccurrence | null {
  if (!isTimedEvent(item)) {
    return null;
  }

  const durationMinutes = getMinutesFromTime(item.endTime) - getMinutesFromTime(item.startTime);
  const startDate = parseISO(`${item.date}T${item.startTime}`);

  return {
    ...item,
    durationMinutes,
    period: getDayPeriodForDate(startDate),
  };
}

function isFocusSession(item: CalendarEvent) {
  return item.source === 'planning-suggestion' || Boolean(item.focusSession?.intentionId);
}

function isRecoveryLabelled(item: CalendarEvent) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  return /\b(recovery|recover|rest|restore|reflection)\b/.test(text);
}

function getConfidence(evidenceCount: number, minimum: number, strongAt = minimum * 2): InsightConfidence {
  if (evidenceCount >= strongAt) {
    return 'strong';
  }

  if (evidenceCount > minimum) {
    return 'supported';
  }

  return 'emerging';
}

function getMedian(values: number[]) {
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length === 0) {
    return 0;
  }

  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }

  return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function uniqueDateCount(items: Array<{ date: string }>) {
  return new Set(items.map((item) => item.date)).size;
}

function createInsight(input: {
  category: InsightCategory;
  code: string;
  key: string;
  title: string;
  summary: string;
  confidence: InsightConfidence;
  evidence: InsightEvidence[];
  rangeStart: string;
  rangeEnd: string;
  metric?: GentleInsight['supportingMetric'];
  rank: number;
  family: string;
}): InsightCandidate {
  return {
    id: `${input.code}:${input.key}:${input.rangeStart}:${input.rangeEnd}`,
    category: input.category,
    title: input.title,
    summary: input.summary,
    confidence: input.confidence,
    evidenceCount: input.evidence.length,
    evidence: input.evidence,
    periodStart: input.rangeStart,
    periodEnd: input.rangeEnd,
    observationCode: input.code,
    supportingMetric: input.metric,
    rank: input.rank,
    family: input.family,
  };
}

function getEvidence(items: Array<{ id: string; date: string; title: string }>, type: InsightEvidence['type']): InsightEvidence[] {
  return items.map((item) => ({
    type,
    sourceId: item.id,
    dateKey: item.date,
    label: item.title,
  }));
}

function deriveFocusInsights(
  focusSessions: TimedOccurrence[],
  intentions: Intention[],
  rangeStart: string,
  rangeEnd: string,
  config: GentleInsightsConfig,
): InsightCandidate[] {
  if (focusSessions.length < config.focusMinimumSessions || uniqueDateCount(focusSessions) < config.focusMinimumDays) {
    return [];
  }

  const candidates: InsightCandidate[] = [];
  const periodCounts = {
    morning: focusSessions.filter((item) => item.period === 'morning').length,
    afternoon: focusSessions.filter((item) => item.period === 'afternoon').length,
    evening: focusSessions.filter((item) => item.period === 'evening').length,
  };
  const [leadingPeriod, leadingCount] = Object.entries(periodCounts).sort((a, b) => b[1] - a[1])[0] as [DayPeriod, number];
  const secondCount = Object.values(periodCounts).sort((a, b) => b - a)[1] ?? 0;

  if (leadingCount >= config.focusLeadingMinimumSessions && leadingCount - secondCount >= config.focusLeadingMargin) {
    candidates.push(createInsight({
      category: 'focus',
      code: 'focus-most-common-period',
      key: leadingPeriod,
      title: 'Focus has a recent time shape',
      summary: `Most recent focus sessions were scheduled in the ${leadingPeriod}.`,
      confidence: getConfidence(leadingCount, config.focusLeadingMinimumSessions, config.focusLeadingMinimumSessions + 3),
      evidence: getEvidence(focusSessions.filter((item) => item.period === leadingPeriod), 'focus-session'),
      rangeStart,
      rangeEnd,
      metric: { value: leadingCount, unit: 'sessions', label: `${leadingCount} of ${focusSessions.length} sessions` },
      rank: 82 + leadingCount,
      family: 'focus-period',
    }));
  }

  const medianDuration = getMedian(focusSessions.map((item) => item.durationMinutes));
  candidates.push(createInsight({
    category: 'focus',
    code: 'focus-average-duration',
    key: `${medianDuration}`,
    title: 'Focus blocks have a typical length',
    summary: `Recent focus sessions were usually around ${medianDuration} minutes. Median is used so one long block does not dominate the observation.`,
    confidence: getConfidence(focusSessions.length, config.focusMinimumSessions, 8),
    evidence: getEvidence(focusSessions, 'focus-session'),
    rangeStart,
    rangeEnd,
    metric: { value: medianDuration, unit: 'minutes', label: 'median session' },
    rank: 68 + focusSessions.length,
    family: 'focus-duration',
  }));

  const focusDays = uniqueDateCount(focusSessions);
  candidates.push(createInsight({
    category: 'focus',
    code: 'focus-consistency',
    key: `${focusDays}`,
    title: 'Focus time appeared on separate days',
    summary: `Focus time appeared on ${focusDays} separate days in this period.`,
    confidence: getConfidence(focusDays, config.focusMinimumDays, 5),
    evidence: Array.from(new Set(focusSessions.map((item) => item.date))).map((dateKey) => ({
      type: 'daily-summary',
      dateKey,
      label: 'Focus day',
    })),
    rangeStart,
    rangeEnd,
    metric: { value: focusDays, unit: 'days', label: 'days with focus' },
    rank: 62 + focusDays,
    family: 'focus-consistency',
  }));

  const shortSessions = focusSessions.filter((item) => item.durationMinutes < config.focusShortSessionMinutes);
  if (focusSessions.length >= 4 && shortSessions.length / focusSessions.length >= config.focusShortSessionRatio) {
    candidates.push(createInsight({
      category: 'focus',
      code: 'focus-fragmentation',
      key: 'short-sessions',
      title: 'Some focus blocks were brief',
      summary: `Several focus sessions were shorter than ${config.focusShortSessionMinutes} minutes.`,
      confidence: getConfidence(shortSessions.length, 2, 5),
      evidence: getEvidence(shortSessions, 'focus-session'),
      rangeStart,
      rangeEnd,
      metric: { value: shortSessions.length, unit: 'sessions', label: `${shortSessions.length} short sessions` },
      rank: 58 + shortSessions.length,
      family: 'focus-duration',
    }));
  }

  const completedIntentionsWithFocus = intentions.filter((intention) => (
    intention.status === 'completed' &&
    focusSessions.some((session) => session.focusSession?.intentionId === intention.id)
  ));

  if (completedIntentionsWithFocus.length >= 2) {
    candidates.push(createInsight({
      category: 'focus',
      code: 'focus-completion-link',
      key: 'completed-linked',
      title: 'Completed intentions had scheduled focus',
      summary: `${completedIntentionsWithFocus.length} completed intentions had scheduled focus time in the same recent period. This is a link in the data, not a claim of cause.`,
      confidence: getConfidence(completedIntentionsWithFocus.length, 2, 4),
      evidence: getEvidence(completedIntentionsWithFocus.map((item) => ({
        id: item.id,
        title: item.title,
        date: item.completedAt ? formatDateKey(parseISO(item.completedAt)) : rangeEnd,
      })), 'intention'),
      rangeStart,
      rangeEnd,
      metric: { value: completedIntentionsWithFocus.length, unit: 'intentions', label: 'linked completions' },
      rank: 72 + completedIntentionsWithFocus.length,
      family: 'focus-completion',
    }));
  }

  return candidates;
}

function deriveIntentionInsights(
  intentions: Intention[],
  focusSessions: TimedOccurrence[],
  rangeStartDate: Date,
  rangeEndDate: Date,
  now: Date,
  rangeStart: string,
  rangeEnd: string,
  config: GentleInsightsConfig,
): InsightCandidate[] {
  const completedIntentions = intentions.filter((intention) => {
    const completedAt = parseDate(intention.completedAt);
    return intention.status === 'completed' && completedAt && !isBefore(completedAt, rangeStartDate) && !isAfter(completedAt, rangeEndDate);
  });
  const candidates: InsightCandidate[] = [];

  if (completedIntentions.length >= config.intentionsMinimumSignals) {
    candidates.push(createInsight({
      category: 'intentions',
      code: 'intentions-completed',
      key: 'completed',
      title: 'Intentions moved to complete',
      summary: `You completed ${completedIntentions.length} intentions in this period.`,
      confidence: getConfidence(completedIntentions.length, config.intentionsMinimumSignals, 5),
      evidence: getEvidence(completedIntentions.map((item) => ({
        id: item.id,
        title: item.title,
        date: item.completedAt ? formatDateKey(parseISO(item.completedAt)) : rangeEnd,
      })), 'intention'),
      rangeStart,
      rangeEnd,
      metric: { value: completedIntentions.length, unit: 'intentions', label: 'completed' },
      rank: 76 + completedIntentions.length,
      family: 'intention-completion',
    }));
  }

  const activeIntentions = intentions.filter((intention) => intention.status === 'active');
  const activeWithFocus = activeIntentions.filter((intention) =>
    focusSessions.some((session) => session.focusSession?.intentionId === intention.id),
  );

  if (activeWithFocus.length >= config.intentionsMinimumSignals) {
    candidates.push(createInsight({
      category: 'intentions',
      code: 'intentions-planned',
      key: 'planned',
      title: 'Some active intentions have time attached',
      summary: `${activeWithFocus.length} active intentions currently have recent focus time planned or recorded.`,
      confidence: getConfidence(activeWithFocus.length, config.intentionsMinimumSignals, 5),
      evidence: getEvidence(activeWithFocus.map((item) => ({ id: item.id, title: item.title, date: rangeEnd })), 'intention'),
      rangeStart,
      rangeEnd,
      metric: { value: activeWithFocus.length, unit: 'intentions', label: 'with focus time' },
      rank: 66 + activeWithFocus.length,
      family: 'intention-planning',
    }));
  }

  const staleDate = addDays(now, -config.stalledIntentionDays);
  const activeWithoutRecentFocus = activeIntentions.filter((intention) => {
    const createdAt = parseDate(intention.createdAt);
    const updatedAt = parseDate(intention.updatedAt);
    const hasLinkedFocus = focusSessions.some((session) => session.focusSession?.intentionId === intention.id);

    return Boolean(
      createdAt &&
      !isAfter(createdAt, staleDate) &&
      (!updatedAt || !isAfter(updatedAt, staleDate)) &&
      !hasLinkedFocus,
    );
  });

  if (activeWithoutRecentFocus.length >= config.intentionsMinimumSignals) {
    candidates.push(createInsight({
      category: 'intentions',
      code: 'intentions-stalled',
      key: 'without-recent-focus',
      title: 'Some active intentions have not had time attached recently',
      summary: `${activeWithoutRecentFocus.length} active intentions have no linked focus session in this period and have not changed recently.`,
      confidence: 'emerging',
      evidence: getEvidence(activeWithoutRecentFocus.map((item) => ({ id: item.id, title: item.title, date: rangeEnd })), 'intention'),
      rangeStart,
      rangeEnd,
      metric: { value: activeWithoutRecentFocus.length, unit: 'intentions', label: 'without recent focus' },
      rank: 60 + activeWithoutRecentFocus.length,
      family: 'intention-structure',
    }));
  }

  const withoutDuration = activeIntentions.filter((intention) => !intention.estimatedMinutes);
  if (withoutDuration.length >= 3) {
    candidates.push(createInsight({
      category: 'intentions',
      code: 'intentions-without-duration',
      key: 'duration',
      title: 'Some intentions do not yet have a duration',
      summary: `${withoutDuration.length} active intentions do not yet have an estimated duration.`,
      confidence: getConfidence(withoutDuration.length, 3, 6),
      evidence: getEvidence(withoutDuration.map((item) => ({ id: item.id, title: item.title, date: rangeEnd })), 'intention'),
      rangeStart,
      rangeEnd,
      metric: { value: withoutDuration.length, unit: 'intentions', label: 'without duration' },
      rank: 48 + withoutDuration.length,
      family: 'intention-structure',
    }));
  }

  return candidates;
}

function getDailyMinutes(items: TimedOccurrence[]) {
  const minutesByDate = new Map<string, number>();
  items.forEach((item) => {
    minutesByDate.set(item.date, (minutesByDate.get(item.date) ?? 0) + item.durationMinutes);
  });
  return minutesByDate;
}

function getBackToBackDays(items: TimedOccurrence[], config: GentleInsightsConfig) {
  const byDate = new Map<string, TimedOccurrence[]>();
  items.forEach((item) => byDate.set(item.date, [...(byDate.get(item.date) ?? []), item]));

  return Array.from(byDate.entries()).flatMap(([dateKey, dateItems]) => {
    const sorted = [...dateItems].sort((first, second) => first.startTime.localeCompare(second.startTime));
    const hasBackToBack = sorted.some((item, index) => {
      const next = sorted[index + 1];
      return next ? getMinutesFromTime(next.startTime) - getMinutesFromTime(item.endTime) <= config.backToBackGapMinutes : false;
    });

    return hasBackToBack ? [dateKey] : [];
  });
}

function deriveLoadInsights(
  timedItems: TimedOccurrence[],
  days: Date[],
  energyProfile: EnergyProfile,
  rangeStartDate: Date,
  rangeEndDate: Date,
  rangeStart: string,
  rangeEnd: string,
  config: GentleInsightsConfig,
): InsightCandidate[] {
  const timedDays = uniqueDateCount(timedItems);
  if (days.length < config.loadMinimumObservedDays || timedDays < config.loadMinimumTimedDays) {
    return [];
  }

  const candidates: InsightCandidate[] = [];
  const minutesByDate = getDailyMinutes(timedItems);
  const heavyDays = Array.from(minutesByDate.entries()).filter(([, minutes]) => minutes >= config.heavyDayMinutes);

  if (heavyDays.length >= 2) {
    candidates.push(createInsight({
      category: 'load',
      code: 'load-heavy-days',
      key: 'heavy',
      title: 'Some days carried a full calendar load',
      summary: `${heavyDays.length} observed days had at least ${Math.round(config.heavyDayMinutes / 60)} hours of timed commitments.`,
      confidence: getConfidence(heavyDays.length, 2, 4),
      evidence: heavyDays.map(([dateKey, minutes]) => ({ type: 'daily-summary', dateKey, value: minutes, label: 'Full day' })),
      rangeStart,
      rangeEnd,
      metric: { value: heavyDays.length, unit: 'days', label: 'full days' },
      rank: 72 + heavyDays.length,
      family: 'load-density',
    }));
  }

  const gaps = getAvailableGaps({
    calendarItems: timedItems,
    rangeStart: rangeStartDate,
    rangeEnd: addDays(rangeEndDate, 1),
    energyProfile,
  });
  const openDays = new Set(gaps.filter((gap) => gap.durationMinutes >= config.openGapMinutes).map((gap) => formatDateKey(parseISO(gap.start))));

  if (openDays.size >= 3) {
    candidates.push(createInsight({
      category: 'load',
      code: 'load-open-days',
      key: 'open',
      title: 'Some days kept meaningful open space',
      summary: `Your calendar had at least one ${config.openGapMinutes}-minute open block on ${openDays.size} days.`,
      confidence: getConfidence(openDays.size, 3, 7),
      evidence: Array.from(openDays).map((dateKey) => ({ type: 'daily-summary', dateKey, label: 'Open block' })),
      rangeStart,
      rangeEnd,
      metric: { value: openDays.size, unit: 'days', label: 'with open blocks' },
      rank: 64 + openDays.size,
      family: 'load-openness',
    }));
  }

  const backToBackDays = getBackToBackDays(timedItems, config);
  if (backToBackDays.length >= 2) {
    candidates.push(createInsight({
      category: 'load',
      code: 'load-back-to-back',
      key: 'adjacent',
      title: 'Back-to-back commitments appeared on a few days',
      summary: `Commitments with ${config.backToBackGapMinutes} minutes or less between them appeared on ${backToBackDays.length} days.`,
      confidence: getConfidence(backToBackDays.length, 2, 4),
      evidence: backToBackDays.map((dateKey) => ({ type: 'daily-summary', dateKey, label: 'Back-to-back day' })),
      rangeStart,
      rangeEnd,
      metric: { value: backToBackDays.length, unit: 'days', label: 'back-to-back days' },
      rank: 62 + backToBackDays.length,
      family: 'load-density',
    }));
  }

  return candidates;
}

function deriveRecoveryInsights(
  timedItems: TimedOccurrence[],
  days: Date[],
  rangeStart: string,
  rangeEnd: string,
  config: GentleInsightsConfig,
): InsightCandidate[] {
  if (days.length < config.recoveryMinimumObservedDays) {
    return [];
  }

  const recoveryItems = timedItems.filter(isRecoveryLabelled);
  const recoveryDays = Array.from(new Set(recoveryItems.map((item) => item.date)));

  if (recoveryDays.length >= config.recoveryMinimumLabelledDays) {
    return [
      createInsight({
        category: 'recovery',
        code: 'recovery-labelled-days',
        key: 'labelled',
        title: 'Recovery time was explicitly labelled',
        summary: `Recovery-labelled time appeared on ${recoveryDays.length} days in this period.`,
        confidence: getConfidence(recoveryDays.length, config.recoveryMinimumLabelledDays, 5),
        evidence: getEvidence(recoveryItems, 'calendar-item'),
        rangeStart,
        rangeEnd,
        metric: { value: recoveryDays.length, unit: 'days', label: 'labelled days' },
        rank: 70 + recoveryDays.length,
        family: 'recovery-presence',
      }),
    ];
  }

  if (timedItems.length >= 3) {
    return [
      createInsight({
        category: 'recovery',
        code: 'recovery-missing',
        key: 'none-labelled',
        title: 'No recovery-labelled blocks appeared',
        summary: 'No calendar blocks were labelled as recovery in this period. Empty calendar space is not counted as recovery.',
        confidence: 'emerging',
        evidence: days.map((day) => ({ type: 'daily-summary', dateKey: formatDateKey(day), label: 'Observed day' })),
        rangeStart,
        rangeEnd,
        metric: { value: 0, unit: 'days', label: 'labelled recovery days' },
        rank: 44,
        family: 'recovery-presence',
      }),
    ];
  }

  return [];
}

function deriveReflectionInsights(
  reflections: DailyReflection[],
  energyProfile: EnergyProfile,
  rangeStart: string,
  rangeEnd: string,
  config: GentleInsightsConfig,
): InsightCandidate[] {
  const validReflections = reflections.filter((reflection) => parseDate(reflection.date));
  const candidates: InsightCandidate[] = [];

  if (validReflections.length >= config.reflectionMinimumDays) {
    const highlights = validReflections.filter((reflection) => reflection.highlight);
    candidates.push(createInsight({
      category: 'reflection',
      code: 'reflection-coverage',
      key: 'recorded',
      title: 'Reflections are part of the recent record',
      summary: `You recorded reflections on ${validReflections.length} days in this period${highlights.length ? `, including ${highlights.length} highlights` : ''}.`,
      confidence: getConfidence(validReflections.length, config.reflectionMinimumDays, 8),
      evidence: validReflections.map((reflection) => ({ type: 'reflection', dateKey: reflection.date, sourceId: reflection.date, label: reflection.highlight ?? 'Reflection' })),
      rangeStart,
      rangeEnd,
      metric: { value: validReflections.length, unit: 'days', label: 'reflected days' },
      rank: 56 + validReflections.length,
      family: 'reflection-coverage',
    }));
  }

  const energyReflections = validReflections.filter((reflection) => typeof reflection.energy === 'number');
  if (energyReflections.length < config.energyMinimumDays) {
    return candidates;
  }

  const comparisons = energyReflections.map((reflection) => {
    const timestamp = parseDate(reflection.updatedAt) ?? parseISO(`${reflection.date}T20:00`);
    const period = getDayPeriodForDate(timestamp);
    const expectedEnergy = energyProfile[period].energy;
    const difference = (reflection.energy ?? expectedEnergy) - expectedEnergy;

    return {
      reflection,
      period,
      expectedEnergy,
      difference,
      aligned: Math.abs(difference) <= 1,
      lower: difference <= -2,
      higher: difference >= 2,
    };
  });
  const aligned = comparisons.filter((item) => item.aligned);
  const lower = comparisons.filter((item) => item.lower);
  const higher = comparisons.filter((item) => item.higher);
  const majority = Math.ceil(comparisons.length * 0.6);

  if (aligned.length >= majority) {
    candidates.push(createInsight({
      category: 'energy',
      code: 'energy-profile-aligned',
      key: 'aligned',
      title: 'Reflected energy broadly matched settings',
      summary: `Reflected energy was within one point of the expected setting on ${aligned.length} of ${comparisons.length} reflected days.`,
      confidence: getConfidence(aligned.length, config.energyMinimumDays, 7),
      evidence: aligned.map((item) => ({ type: 'reflection', dateKey: item.reflection.date, sourceId: item.reflection.date, value: item.reflection.energy, label: `${item.period} setting ${item.expectedEnergy}` })),
      rangeStart,
      rangeEnd,
      metric: { value: Math.round((aligned.length / comparisons.length) * 100), unit: 'percent', label: 'broadly aligned' },
      rank: 74 + aligned.length,
      family: 'energy-comparison',
    }));
  } else if (lower.length >= majority) {
    candidates.push(createInsight({
      category: 'energy',
      code: 'energy-profile-lower-than-reflection',
      key: 'lower',
      title: 'Reflected energy was often below settings',
      summary: `Recorded energy was at least two points lower than the expected setting on ${lower.length} of ${comparisons.length} reflected days.`,
      confidence: getConfidence(lower.length, config.energyMinimumDays, 7),
      evidence: lower.map((item) => ({ type: 'reflection', dateKey: item.reflection.date, sourceId: item.reflection.date, value: item.reflection.energy, label: `${item.period} setting ${item.expectedEnergy}` })),
      rangeStart,
      rangeEnd,
      metric: { value: lower.length, unit: 'days', label: 'lower than setting' },
      rank: 70 + lower.length,
      family: 'energy-comparison',
    }));
  } else if (higher.length >= majority) {
    candidates.push(createInsight({
      category: 'energy',
      code: 'energy-profile-higher-than-reflection',
      key: 'higher',
      title: 'Reflected energy was often above settings',
      summary: `Recorded energy was at least two points higher than the expected setting on ${higher.length} of ${comparisons.length} reflected days.`,
      confidence: getConfidence(higher.length, config.energyMinimumDays, 7),
      evidence: higher.map((item) => ({ type: 'reflection', dateKey: item.reflection.date, sourceId: item.reflection.date, value: item.reflection.energy, label: `${item.period} setting ${item.expectedEnergy}` })),
      rangeStart,
      rangeEnd,
      metric: { value: higher.length, unit: 'days', label: 'higher than setting' },
      rank: 70 + higher.length,
      family: 'energy-comparison',
    }));
  }

  return candidates;
}

export function deriveInsightCandidates(input: GenerateGentleInsightsInput): InsightCandidate[] {
  const config = { ...gentleInsightThresholds, ...input.config };
  const rangeStartDate = startOfDay(input.rangeStart);
  const rangeEndDate = startOfDay(isAfter(input.rangeEnd, input.now) ? input.now : input.rangeEnd);

  if (isAfter(rangeStartDate, rangeEndDate)) {
    return [];
  }

  const rangeStart = formatDateKey(rangeStartDate);
  const rangeEnd = formatDateKey(rangeEndDate);
  const occurrences = getPlanningOccurrencesForRange(
    input.calendarItems,
    rangeStartDate,
    rangeEndDate,
    input.weekStartsOnMonday,
  );
  const timedItems = occurrences.flatMap((item) => {
    const timedItem = toTimedOccurrence(item);
    return timedItem ? [timedItem] : [];
  });
  const focusSessions = timedItems.filter(isFocusSession);
  const rangeReflections = input.reflections.filter((reflection) => {
    const date = parseDate(reflection.date);
    return date && !isBefore(date, rangeStartDate) && !isAfter(date, rangeEndDate);
  });
  const days = getDaysInRange(rangeStartDate, rangeEndDate);

  return [
    ...deriveFocusInsights(focusSessions, input.intentions, rangeStart, rangeEnd, config),
    ...deriveIntentionInsights(input.intentions, focusSessions, rangeStartDate, rangeEndDate, input.now, rangeStart, rangeEnd, config),
    ...deriveLoadInsights(timedItems, days, input.energyProfile, rangeStartDate, rangeEndDate, rangeStart, rangeEnd, config),
    ...deriveRecoveryInsights(timedItems, days, rangeStart, rangeEnd, config),
    ...deriveReflectionInsights(rangeReflections, input.energyProfile, rangeStart, rangeEnd, config),
  ];
}

export function resolveInsightConflicts(candidates: InsightCandidate[]) {
  const byFamily = new Map<string, InsightCandidate>();

  candidates.forEach((candidate) => {
    const existing = byFamily.get(candidate.family);
    if (!existing || candidate.rank > existing.rank || (candidate.rank === existing.rank && candidate.id.localeCompare(existing.id) < 0)) {
      byFamily.set(candidate.family, candidate);
    }
  });

  return Array.from(byFamily.values());
}

function confidenceWeight(confidence: InsightConfidence) {
  if (confidence === 'strong') {
    return 3;
  }

  if (confidence === 'supported') {
    return 2;
  }

  return 1;
}

export function rankInsightCandidates(candidates: InsightCandidate[], config: GentleInsightsConfig = gentleInsightThresholds) {
  const sorted = [...candidates].sort((first, second) => {
    const confidenceSort = confidenceWeight(second.confidence) - confidenceWeight(first.confidence);
    if (confidenceSort !== 0) {
      return confidenceSort;
    }

    return second.rank - first.rank || first.id.localeCompare(second.id);
  });
  const categoryCounts = new Map<InsightCategory, number>();
  const selected: InsightCandidate[] = [];

  sorted.forEach((candidate) => {
    const currentCategoryCount = categoryCounts.get(candidate.category) ?? 0;
    if (selected.length >= config.maxInsights || currentCategoryCount >= config.maxPerCategory) {
      return;
    }

    selected.push(candidate);
    categoryCounts.set(candidate.category, currentCategoryCount + 1);
  });

  return selected;
}

export function generateGentleInsights(input: GenerateGentleInsightsInput): GentleInsight[] {
  const config = { ...gentleInsightThresholds, ...input.config };
  return rankInsightCandidates(resolveInsightConflicts(deriveInsightCandidates(input)), config).map(({ rank: _rank, family: _family, ...insight }) => insight);
}

export function getInsightPeriodSummary(input: GenerateGentleInsightsInput): InsightPeriodSummary {
  const rangeStartDate = startOfDay(input.rangeStart);
  const rangeEndDate = startOfDay(isAfter(input.rangeEnd, input.now) ? input.now : input.rangeEnd);

  if (isAfter(rangeStartDate, rangeEndDate)) {
    return {
      observedDays: 0,
      timedDays: 0,
      focusSessions: 0,
      completedIntentions: 0,
      reflectedDays: 0,
    };
  }

  const occurrences = getPlanningOccurrencesForRange(input.calendarItems, rangeStartDate, rangeEndDate, input.weekStartsOnMonday);
  const timedItems = occurrences.flatMap((item) => {
    const timedItem = toTimedOccurrence(item);
    return timedItem ? [timedItem] : [];
  });
  const completedIntentions = input.intentions.filter((intention) => {
    const completedAt = parseDate(intention.completedAt);
    return intention.status === 'completed' && completedAt && !isBefore(completedAt, rangeStartDate) && !isAfter(completedAt, rangeEndDate);
  });
  const reflectedDays = new Set(input.reflections.filter((reflection) => {
    const date = parseDate(reflection.date);
    return date && !isBefore(date, rangeStartDate) && !isAfter(date, rangeEndDate);
  }).map((reflection) => reflection.date));

  return {
    observedDays: getDaysInRange(rangeStartDate, rangeEndDate).length,
    timedDays: uniqueDateCount(timedItems),
    focusSessions: timedItems.filter(isFocusSession).length,
    completedIntentions: completedIntentions.length,
    reflectedDays: reflectedDays.size,
  };
}
