import {
  addDays,
  differenceInMinutes,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
} from 'date-fns';
import type { CalendarEvent } from '../../calendar/types/calendar.types';
import type {
  AdjustmentValidationInput,
  GeneratePlanningSuggestionsInput,
  PlanningSuggestion,
  SuggestionWarningCode,
} from '../types/planning.types';
import {
  getAvailableGaps,
  getDailyCommittedMinutes,
  getDailyLoad,
  getPlanningOccurrencesForRange,
  hasBlockingOverlap,
} from '../utils/availability';
import { addMinutesToDate, formatLocalDate, formatLocalTime, getMinutesIntoDay, getPlanningRange } from '../utils/planningDateTime';
import { resolvePlanningConfig } from '../utils/planningConfig';
import { scoreCandidate } from '../utils/scoring';

function getSearchRange(input: GeneratePlanningSuggestionsInput) {
  const config = resolvePlanningConfig(input.config);
  const defaultRange = getPlanningRange(input.now, config.searchDays, input.intention.deadline);

  return {
    start: input.rangeStart && isAfter(input.rangeStart, input.now) ? input.rangeStart : defaultRange.start,
    end: input.rangeEnd && isBefore(input.rangeEnd, defaultRange.end) ? input.rangeEnd : defaultRange.end,
  };
}

function getTargetDurationMinutes(estimatedMinutes: number | undefined, config = resolvePlanningConfig()) {
  const assumedDuration = !estimatedMinutes;
  const estimate = estimatedMinutes ?? config.defaultFocusMinutes;
  return {
    assumedDuration,
    desiredMinutes: Math.min(estimate, config.maximumSingleSessionMinutes),
    estimatedMinutes: estimate,
  };
}

function getCandidateId(intentionId: string, start: Date, end: Date) {
  return `${intentionId}:${start.toISOString()}:${end.toISOString()}`;
}

function getUsableGapBounds(gapStart: Date, gapEnd: Date, hasBefore: boolean, hasAfter: boolean, bufferMinutes: number) {
  return {
    start: hasBefore ? addMinutesToDate(gapStart, bufferMinutes) : gapStart,
    end: hasAfter ? addMinutesToDate(gapEnd, -bufferMinutes) : gapEnd,
  };
}

export function generatePlanningSuggestions(input: GeneratePlanningSuggestionsInput): PlanningSuggestion[] {
  const config = resolvePlanningConfig(input.config);
  const range = getSearchRange(input);

  if (!isBefore(input.now, range.end)) {
    return [];
  }

  if (input.intention.deadline && isBefore(parseISO(input.intention.deadline), startOfDay(input.now))) {
    return [];
  }

  const occurrences = getPlanningOccurrencesForRange(
    input.calendarItems,
    range.start,
    range.end,
    input.weekStartsOnMonday,
  );
  const gaps = getAvailableGaps({
    calendarItems: occurrences,
    rangeStart: range.start,
    rangeEnd: range.end,
    energyProfile: input.energyProfile,
    config,
  });
  const duration = getTargetDurationMinutes(input.intention.estimatedMinutes, config);
  const seenStarts = new Set<string>();

  return gaps
    .flatMap((gap, index) => {
      const rawGapStart = parseISO(gap.start);
      const rawGapEnd = parseISO(gap.end);
      const usableGap = getUsableGapBounds(
        rawGapStart,
        rawGapEnd,
        Boolean(gap.nearbyEventBefore),
        Boolean(gap.nearbyEventAfter),
        config.bufferMinutes,
      );
      const usableMinutes = differenceInMinutes(usableGap.end, usableGap.start);

      if (usableMinutes < config.minimumFocusMinutes) {
        return [];
      }

      const candidateDuration = Math.min(duration.desiredMinutes, usableMinutes);

      if (candidateDuration < config.minimumFocusMinutes) {
        return [];
      }

      const proposedEnd = addMinutesToDate(usableGap.start, candidateDuration);

      if (input.intention.deadline && isAfter(proposedEnd, addDays(parseISO(input.intention.deadline), 1))) {
        return [];
      }

      const dailyLoad = getDailyLoad(getDailyCommittedMinutes(occurrences, usableGap.start, config));
      const scoredCandidate = scoreCandidate({
        intention: input.intention,
        energyRequirement: input.intention.energyRequired,
        preferredTimeOfDay: input.intention.preferredTimeOfDay,
        dailyLoad,
        gap: {
          ...gap,
          start: usableGap.start.toISOString(),
          end: usableGap.end.toISOString(),
          durationMinutes: usableMinutes,
        },
        assumedDuration: duration.assumedDuration,
        fullEstimateFits: candidateDuration >= duration.estimatedMinutes || duration.estimatedMinutes > config.maximumSingleSessionMinutes,
        dayIndex: index,
        now: input.now,
      });

      return [
        {
          id: getCandidateId(input.intention.id, usableGap.start, proposedEnd),
          intentionId: input.intention.id,
          proposedStart: usableGap.start.toISOString(),
          proposedEnd: proposedEnd.toISOString(),
          durationMinutes: candidateDuration,
          score: scoredCandidate.score.total,
          confidence:
            scoredCandidate.score.total >= 62
              ? 'high'
              : scoredCandidate.score.total >= 42
                ? 'medium'
                : 'low',
          reasonCodes: scoredCandidate.reasonCodes,
          warningCodes: scoredCandidate.warningCodes,
          scoreFactors: scoredCandidate.score.factors,
          createdAt: input.now.toISOString(),
        } satisfies PlanningSuggestion,
      ];
    })
    .filter((suggestion) => {
      const key = `${formatLocalDate(parseISO(suggestion.proposedStart))}-${formatLocalTime(parseISO(suggestion.proposedStart))}`;

      if (seenStarts.has(key)) {
        return false;
      }

      seenStarts.add(key);
      return true;
    })
    .sort((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      return first.proposedStart.localeCompare(second.proposedStart);
    })
    .slice(0, config.maxSuggestions);
}

export function validateAdjustedSuggestion(input: AdjustmentValidationInput) {
  const config = resolvePlanningConfig(input.config);
  const durationMinutes = differenceInMinutes(input.end, input.start);
  const errors: string[] = [];
  const warnings: SuggestionWarningCode[] = [];

  if (!isAfter(input.start, input.now)) {
    errors.push('Start time must be in the future.');
  }

  if (!isAfter(input.end, input.start)) {
    errors.push('End time must be after start time.');
  }

  if (durationMinutes < config.minimumFocusMinutes) {
    errors.push(`Use at least ${config.minimumFocusMinutes} minutes for a focus session.`);
  }

  const startMinutes = getMinutesIntoDay(input.start);
  const endMinutes = getMinutesIntoDay(input.end);

  if (formatLocalDate(input.start) !== formatLocalDate(input.end)) {
    errors.push('Focus sessions cannot cross midnight yet.');
  }

  if (startMinutes < config.earliestStartMinute || endMinutes > config.latestEndMinute) {
    errors.push('Choose a time between 07:00 and 22:00.');
  }

  if (input.intention.deadline && isAfter(input.end, addDays(parseISO(input.intention.deadline), 1))) {
    warnings.push('after-deadline' as const);
  }

  const rangeEnd = addDays(input.end, 1);
  const occurrences = getPlanningOccurrencesForRange(
    input.calendarItems,
    input.start,
    rangeEnd,
    input.weekStartsOnMonday,
  );

  if (hasBlockingOverlap(occurrences, input.start, input.end, input.ignoreCalendarItemId)) {
    errors.push('This overlaps an existing calendar block.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function isSuggestionStillAvailable(input: AdjustmentValidationInput) {
  return validateAdjustedSuggestion(input).isValid;
}

export function getFocusSessionDraft({
  intention,
  suggestion,
}: {
  intention: GeneratePlanningSuggestionsInput['intention'];
  suggestion: PlanningSuggestion;
}) {
  const start = parseISO(suggestion.proposedStart);
  const end = parseISO(suggestion.proposedEnd);

  return {
    itemType: 'event' as const,
    title: `Focus: ${intention.title}`,
    date: formatLocalDate(start),
    startTime: formatLocalTime(start),
    endTime: formatLocalTime(end),
    category: 'Work' as const,
    description: intention.desiredOutcome ?? intention.description ?? '',
    accentColor: '#f18db5',
    recurrence: 'none' as const,
    source: 'planning-suggestion' as const,
    focusSession: {
      intentionId: intention.id,
      planningSuggestionId: suggestion.id,
    },
  };
}
