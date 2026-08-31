import {
  addDays,
  differenceInMinutes,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from 'date-fns';
import type { CalendarEvent, EventCategory } from '../../../features/calendar/types/calendar.types';
import { getVisibleCalendarOccurrences } from '../../../features/calendar/utils/calendarRecurrence';
import { getMinutesFromTime } from '../../../features/calendar/utils/calendarTime';
import { eventCategories } from '../../../features/calendar/constants/calendar.constants';
import type { Intention } from '../../../features/intentions';
import type { DailyReflection } from '../../../features/reflections';
import {
  getDayPeriodForDate,
  type DayPeriod,
  type EnergyLevel,
  type EnergyProfile,
  type TimeQuality,
} from '../../../features/timeQuality';
import { getDailyLoad, type DailyLoad } from '../../../features/planning';

export type TodayDayState = 'before-first' | 'during-item' | 'between-items' | 'after-last' | 'empty';
export type TodayOverloadState = 'open' | 'balanced' | 'full';

export type TodayItem = {
  id: string;
  sourceId?: string;
  title: string;
  category: EventCategory;
  start: Date;
  end: Date;
  startTime: string;
  endTime: string;
  completed: boolean;
  isFocusSession: boolean;
  linkedIntentionId?: string;
  status: 'completed' | 'now' | 'next' | 'upcoming';
};

export type TodayViewModel = {
  dateKey: string;
  dateLabel: string;
  headerMessage: string;
  currentItem?: TodayItem;
  nextItem?: TodayItem;
  previousItem?: TodayItem;
  remainingItems: TodayItem[];
  focusSessions: TodayItem[];
  primaryIntention?: Intention;
  expectedEnergy: EnergyLevel;
  currentDayPeriod: DayPeriod;
  preferredQualities: TimeQuality[];
  dailyLoad: DailyLoad;
  overloadState: TodayOverloadState;
  overloadObservation: string;
  scheduledMinutes: number;
  recoveryMinutes: number;
  reflection?: DailyReflection;
  dayState: TodayDayState;
  categoryProgress: CategoryProgress[];
};

export type BuildTodayViewModelInput = {
  now: Date;
  calendarItems: CalendarEvent[];
  intentions: Intention[];
  energyProfile: EnergyProfile;
  reflections: DailyReflection[];
  weekStartsOnMonday?: boolean;
};

export type CategoryProgress = {
  category: EventCategory;
  total: number;
  completed: number;
  progress: number;
};

function getEventInterval(item: CalendarEvent) {
  if (!item.startTime || !item.endTime) {
    return null;
  }

  const start = parseISO(`${item.date}T${item.startTime}:00`);
  const endMinutes = getMinutesFromTime(item.endTime);
  const startMinutes = getMinutesFromTime(item.startTime);
  const end = parseISO(`${item.date}T${item.endTime}:00`);

  return {
    start,
    end: endMinutes <= startMinutes ? addDays(end, 1) : end,
  };
}

function getTodayOccurrences(items: CalendarEvent[], now: Date, weekStartsOnMonday = true) {
  const yesterday = addDays(now, -1);
  const seenIds = new Set<string>();

  return [yesterday, now].flatMap((day) =>
    getVisibleCalendarOccurrences(items, day, weekStartsOnMonday).filter((item) => {
      if (seenIds.has(item.id)) {
        return false;
      }

      seenIds.add(item.id);
      return true;
    }),
  );
}

function isTimedItem(item: CalendarEvent) {
  return item.itemType === 'event' || Boolean(item.startTime && item.endTime);
}

function toTodayItem(item: CalendarEvent, todayStart: Date, todayEnd: Date): TodayItem | null {
  if (!isTimedItem(item)) {
    return null;
  }

  const interval = getEventInterval(item);

  if (!interval || !isBefore(interval.start, todayEnd) || !isAfter(interval.end, todayStart)) {
    return null;
  }

  const start = interval.start < todayStart ? todayStart : interval.start;
  const end = interval.end > todayEnd ? todayEnd : interval.end;

  if (!isBefore(start, end)) {
    return null;
  }

  return {
    id: item.id,
    sourceId: item.sourceId,
    title: item.title,
    category: item.category,
    start,
    end,
    startTime: format(start, 'HH:mm'),
    endTime: format(end, 'HH:mm'),
    completed: item.completed,
    isFocusSession: item.source === 'planning-suggestion' && Boolean(item.focusSession?.intentionId),
    linkedIntentionId: item.focusSession?.intentionId,
    status: 'upcoming',
  };
}

function sortTodayItems(items: TodayItem[]) {
  return [...items].sort((first, second) => {
    const startSort = first.start.getTime() - second.start.getTime();

    if (startSort !== 0) {
      return startSort;
    }

    if (first.isFocusSession !== second.isFocusSession) {
      return first.isFocusSession ? -1 : 1;
    }

    return differenceInMinutes(first.end, first.start) - differenceInMinutes(second.end, second.start);
  });
}

function getCurrentItem(items: TodayItem[], now: Date) {
  const activeItems = items.filter((item) => !item.completed && !isAfter(item.start, now) && isAfter(item.end, now));

  return activeItems.sort((first, second) => {
    if (first.isFocusSession !== second.isFocusSession) {
      return first.isFocusSession ? -1 : 1;
    }

    const startSort = first.start.getTime() - second.start.getTime();

    if (startSort !== 0) {
      return startSort;
    }

    return differenceInMinutes(first.end, now) - differenceInMinutes(second.end, now);
  })[0];
}

function getDayState(items: TodayItem[], now: Date, currentItem?: TodayItem): TodayDayState {
  if (items.length === 0) {
    return 'empty';
  }

  if (currentItem) {
    return 'during-item';
  }

  const firstItem = items[0];
  const finalItem = items.at(-1);

  if (firstItem && isBefore(now, firstItem.start)) {
    return 'before-first';
  }

  if (finalItem && !isBefore(now, finalItem.end)) {
    return 'after-last';
  }

  return 'between-items';
}

function getScheduledMinutes(items: TodayItem[]) {
  return items.reduce((minutes, item) => minutes + differenceInMinutes(item.end, item.start), 0);
}

function isRecoveryItem(item: TodayItem) {
  const text = `${item.title} ${item.category}`.toLowerCase();
  return /\b(recovery|recover|rest|restore|reflection)\b/.test(text);
}

function getRecoveryMinutes(items: TodayItem[]) {
  return items.filter(isRecoveryItem).reduce((minutes, item) => minutes + differenceInMinutes(item.end, item.start), 0);
}

function getOverloadState(dailyLoad: DailyLoad): TodayOverloadState {
  if (dailyLoad === 'light') {
    return 'open';
  }

  if (dailyLoad === 'balanced') {
    return 'balanced';
  }

  return 'full';
}

function getLargestOpenBlockMinutes(items: TodayItem[], now: Date, todayEnd: Date) {
  const futureItems = items.filter((item) => isAfter(item.end, now));
  let cursor = now;
  let largestGap = 0;

  futureItems.forEach((item) => {
    if (isAfter(item.start, cursor)) {
      largestGap = Math.max(largestGap, differenceInMinutes(item.start, cursor));
    }

    if (isAfter(item.end, cursor)) {
      cursor = item.end;
    }
  });

  if (isAfter(todayEnd, cursor)) {
    largestGap = Math.max(largestGap, differenceInMinutes(todayEnd, cursor));
  }

  return largestGap;
}

function hasBackToBackCommitments(items: TodayItem[]) {
  return items.some((item, index) => {
    const nextItem = items[index + 1];
    return nextItem ? differenceInMinutes(nextItem.start, item.end) <= 15 : false;
  });
}

function getOverloadObservation(items: TodayItem[], now: Date, todayEnd: Date) {
  if (hasBackToBackCommitments(items)) {
    return 'Some commitments sit close together today.';
  }

  const largestGap = getLargestOpenBlockMinutes(items, now, todayEnd);

  if (largestGap >= 90) {
    return `You have a ${largestGap}-minute open block later today.`;
  }

  return '';
}

function getHeaderMessage(dayState: TodayDayState, remainingCount: number, dailyLoad: DailyLoad, nextItem?: TodayItem, finalItem?: TodayItem) {
  if (dayState === 'empty') {
    return 'Your calendar is open today.';
  }

  if (dayState === 'during-item') {
    return nextItem ? `One thing is in progress, then ${nextItem.title}.` : 'One thing is in progress now.';
  }

  if (dayState === 'after-last') {
    return finalItem ? `Your final scheduled item ended at ${finalItem.endTime}.` : 'Your scheduled day is complete.';
  }

  if (remainingCount === 0) {
    return 'Nothing else is scheduled.';
  }

  if (remainingCount === 1) {
    return `One commitment remains at ${nextItem?.startTime ?? 'the next open time'}.`;
  }

  if (dailyLoad === 'heavy') {
    return `${remainingCount} commitments remain, and today is fairly full.`;
  }

  return `${remainingCount} commitments remain today.`;
}

function getPrimaryIntention({
  intentions,
  currentItem,
  nextItem,
  todayKey,
}: {
  intentions: Intention[];
  currentItem?: TodayItem;
  nextItem?: TodayItem;
  todayKey: string;
}) {
  const activeIntentions = intentions.filter((intention) => {
    if (intention.status === 'completed' || intention.status === 'paused') {
      return false;
    }

    return !intention.deadline || intention.deadline >= todayKey;
  });
  const byId = new Map(activeIntentions.map((intention) => [intention.id, intention]));

  if (currentItem?.linkedIntentionId && byId.has(currentItem.linkedIntentionId)) {
    return byId.get(currentItem.linkedIntentionId);
  }

  if (nextItem?.linkedIntentionId && byId.has(nextItem.linkedIntentionId)) {
    return byId.get(nextItem.linkedIntentionId);
  }

  const deadlineToday = activeIntentions
    .filter((intention) => intention.deadline === todayKey)
    .sort((first, second) => first.createdAt.localeCompare(second.createdAt))[0];

  if (deadlineToday) {
    return deadlineToday;
  }

  const highPriorityWithDeadline = activeIntentions
    .filter((intention) => intention.priority === 'high' && intention.deadline)
    .sort((first, second) => first.deadline!.localeCompare(second.deadline!) || first.createdAt.localeCompare(second.createdAt))[0];

  if (highPriorityWithDeadline) {
    return highPriorityWithDeadline;
  }

  return activeIntentions
    .filter((intention) => intention.desiredOutcome || intention.description || intention.estimatedMinutes)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))[0];
}

export function getProgressPercentage(completed: number, total: number) {
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

export function getCategoryProgress(items: CalendarEvent[]): CategoryProgress[] {
  return eventCategories.map((category) => {
    const categoryItems = items.filter((item) => item.category === category);
    const completed = categoryItems.filter((item) => item.completed).length;

    return {
      category,
      total: categoryItems.length,
      completed,
      progress: getProgressPercentage(completed, categoryItems.length),
    };
  });
}

export function buildTodayViewModel({
  now,
  calendarItems,
  intentions,
  energyProfile,
  reflections,
  weekStartsOnMonday = true,
}: BuildTodayViewModelInput): TodayViewModel {
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const dateKey = format(now, 'yyyy-MM-dd');
  const todayOccurrences = getTodayOccurrences(calendarItems, now, weekStartsOnMonday);
  const timedItems = sortTodayItems(
    todayOccurrences.flatMap((item) => {
      const todayItem = toTodayItem(item, todayStart, todayEnd);
      return todayItem ? [todayItem] : [];
    }),
  );
  const currentItem = getCurrentItem(timedItems, now);
  const nextItem = timedItems.find((item) => !item.completed && isAfter(item.start, now) && item.id !== currentItem?.id);
  const previousItem = [...timedItems].reverse().find((item) => !isAfter(item.end, now));
  const remainingItems = timedItems
    .filter((item) => item.id === currentItem?.id || isAfter(item.end, now))
    .map((item) => ({
      ...item,
      status:
        item.id === currentItem?.id
          ? 'now'
          : item.id === nextItem?.id
            ? 'next'
            : item.completed
              ? 'completed'
              : 'upcoming',
    } satisfies TodayItem));
  const completedTimedItems = timedItems.filter((item) => item.completed || isBefore(item.end, now));
  const scheduledMinutes = getScheduledMinutes(timedItems);
  const dailyLoad = getDailyLoad(scheduledMinutes);
  const recoveryMinutes = getRecoveryMinutes(timedItems);
  const dayState = getDayState(timedItems, now, currentItem);
  const currentDayPeriod = getDayPeriodForDate(now);
  const primaryIntention = getPrimaryIntention({
    intentions,
    currentItem,
    nextItem,
    todayKey: dateKey,
  });

  return {
    dateKey,
    dateLabel: format(now, 'EEEE, MMMM d'),
    headerMessage: getHeaderMessage(dayState, remainingItems.filter((item) => item.status !== 'completed').length, dailyLoad, nextItem, timedItems.at(-1)),
    currentItem,
    nextItem,
    previousItem,
    remainingItems,
    focusSessions: timedItems.filter((item) => item.isFocusSession),
    primaryIntention,
    expectedEnergy: energyProfile[currentDayPeriod].energy,
    currentDayPeriod,
    preferredQualities: energyProfile[currentDayPeriod].preferredQualities,
    dailyLoad,
    overloadState: getOverloadState(dailyLoad),
    overloadObservation: getOverloadObservation(timedItems, now, todayEnd),
    scheduledMinutes,
    recoveryMinutes,
    reflection: reflections.find((reflection) => reflection.date === dateKey),
    dayState,
    categoryProgress: getCategoryProgress(todayOccurrences.filter((item) => item.date === dateKey)),
  };
}

export function getMinutesUntil(date: Date, now: Date) {
  return Math.max(0, differenceInMinutes(date, now));
}

export function getHoursLabel(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function isToday(date: Date, reference = new Date()) {
  return isSameDay(date, reference);
}
