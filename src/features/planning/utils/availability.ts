import { addDays, differenceInMinutes, isBefore, parseISO, startOfDay } from 'date-fns';
import type { CalendarEvent } from '../../calendar/types/calendar.types';
import { getVisibleCalendarOccurrences } from '../../calendar/utils/calendarRecurrence';
import { getDayPeriodForDate } from '../../timeQuality';
import type { EnergyProfile } from '../../timeQuality';
import type { AvailableGap, DailyLoad, PlanningConfig } from '../types/planning.types';
import { resolvePlanningConfig } from './planningConfig';
import {
  clipInterval,
  doIntervalsOverlap,
  formatLocalDate,
  getDaysInRange,
  getEventInterval,
  setMinuteOfDay,
} from './planningDateTime';

type BusyInterval = {
  id: string;
  start: Date;
  end: Date;
};

function isTimedBlockingItem(item: CalendarEvent) {
  if (item.itemType === 'event') {
    return true;
  }

  return Boolean(item.startTime && item.endTime);
}

function getBlockingIntervals(items: CalendarEvent[], rangeStart: Date, rangeEnd: Date): BusyInterval[] {
  return items.flatMap((item) => {
    if (!isTimedBlockingItem(item)) {
      return [];
    }

    const startTime = item.startTime;
    const endTime = item.endTime;

    if (!startTime || !endTime) {
      return [];
    }

    const interval = getEventInterval(item.date, startTime, endTime);
    const clipped = clipInterval(interval.start, interval.end, rangeStart, rangeEnd);

    return clipped
      ? [
          {
            id: item.id,
            start: clipped.start,
            end: clipped.end,
          },
        ]
      : [];
  });
}

function mergeBusyIntervals(intervals: BusyInterval[]): BusyInterval[] {
  const sortedIntervals = [...intervals].sort((first, second) => first.start.getTime() - second.start.getTime());

  return sortedIntervals.reduce<BusyInterval[]>((merged, interval) => {
    const previous = merged.at(-1);

    if (!previous || isBefore(previous.end, interval.start)) {
      merged.push({ ...interval });
      return merged;
    }

    if (isBefore(previous.end, interval.end)) {
      previous.end = new Date(interval.end);
      previous.id = interval.id;
    }

    return merged;
  }, []);
}

export function getPlanningOccurrencesForRange(
  items: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date,
  weekStartsOnMonday = true,
) {
  const seenIds = new Set<string>();

  return getDaysInRange(rangeStart, rangeEnd)
    .flatMap((day) => getVisibleCalendarOccurrences(items, day, weekStartsOnMonday))
    .filter((item) => {
      const itemDate = parseISO(item.date);

      if (itemDate < startOfDay(rangeStart) || itemDate > startOfDay(rangeEnd)) {
        return false;
      }

      if (seenIds.has(item.id)) {
        return false;
      }

      seenIds.add(item.id);
      return true;
    });
}

export function getAvailableGaps({
  calendarItems,
  rangeStart,
  rangeEnd,
  energyProfile,
  config,
}: {
  calendarItems: CalendarEvent[];
  rangeStart: Date;
  rangeEnd: Date;
  energyProfile: EnergyProfile;
  config?: Partial<PlanningConfig>;
}): AvailableGap[] {
  const resolvedConfig = resolvePlanningConfig(config);
  const blockingIntervals = mergeBusyIntervals(getBlockingIntervals(calendarItems, rangeStart, rangeEnd));

  return getDaysInRange(rangeStart, rangeEnd).flatMap((day) => {
    const dayStart = setMinuteOfDay(day, resolvedConfig.earliestStartMinute);
    const dayEnd = setMinuteOfDay(day, resolvedConfig.latestEndMinute);
    const clippedDay = clipInterval(dayStart, dayEnd, rangeStart, rangeEnd);

    if (!clippedDay) {
      return [];
    }

    const dayBusyIntervals = blockingIntervals
      .flatMap((interval) => {
        const clipped = clipInterval(interval.start, interval.end, clippedDay.start, clippedDay.end);
        return clipped ? [{ ...interval, start: clipped.start, end: clipped.end }] : [];
      })
      .sort((first, second) => first.start.getTime() - second.start.getTime());

    const gaps: AvailableGap[] = [];
    let cursor = clippedDay.start;
    let previousBusyId: string | undefined;

    dayBusyIntervals.forEach((busyInterval) => {
      if (isBefore(cursor, busyInterval.start)) {
        const dayPeriod = getDayPeriodForDate(cursor);
        gaps.push({
          start: cursor.toISOString(),
          end: busyInterval.start.toISOString(),
          durationMinutes: differenceInMinutes(busyInterval.start, cursor),
          dayPeriod,
          energyLevel: energyProfile[dayPeriod].energy,
          preferredQualities: energyProfile[dayPeriod].preferredQualities,
          nearbyEventBefore: previousBusyId,
          nearbyEventAfter: busyInterval.id,
        });
      }

      if (isBefore(cursor, busyInterval.end)) {
        cursor = busyInterval.end;
      }

      previousBusyId = busyInterval.id;
    });

    if (isBefore(cursor, clippedDay.end)) {
      const dayPeriod = getDayPeriodForDate(cursor);
      gaps.push({
        start: cursor.toISOString(),
        end: clippedDay.end.toISOString(),
        durationMinutes: differenceInMinutes(clippedDay.end, cursor),
        dayPeriod,
        energyLevel: energyProfile[dayPeriod].energy,
        preferredQualities: energyProfile[dayPeriod].preferredQualities,
        nearbyEventBefore: previousBusyId,
      });
    }

    return gaps.filter((gap) => gap.durationMinutes > 0);
  });
}

export function getDailyCommittedMinutes(
  calendarItems: CalendarEvent[],
  day: Date,
  config?: Partial<PlanningConfig>,
) {
  const resolvedConfig = resolvePlanningConfig(config);
  const dayStart = setMinuteOfDay(day, resolvedConfig.earliestStartMinute);
  const dayEnd = setMinuteOfDay(day, resolvedConfig.latestEndMinute);

  return mergeBusyIntervals(getBlockingIntervals(calendarItems, dayStart, dayEnd)).reduce(
    (totalMinutes, interval) => totalMinutes + differenceInMinutes(interval.end, interval.start),
    0,
  );
}

export function getDailyLoad(committedMinutes: number): DailyLoad {
  if (committedMinutes < 4 * 60) {
    return 'light';
  }

  if (committedMinutes < 7 * 60) {
    return 'balanced';
  }

  return 'heavy';
}

export function hasBlockingOverlap(
  calendarItems: CalendarEvent[],
  start: Date,
  end: Date,
  ignoreCalendarItemId?: string,
) {
  const blockingItems = ignoreCalendarItemId
    ? calendarItems.filter((item) => item.id !== ignoreCalendarItemId && item.sourceId !== ignoreCalendarItemId)
    : calendarItems;

  return getBlockingIntervals(blockingItems, startOfDay(start), addDays(startOfDay(end), 1)).some((interval) =>
    doIntervalsOverlap(start, end, interval.start, interval.end),
  );
}

export function getPlanningDateLabel(date: Date) {
  return formatLocalDate(date);
}
