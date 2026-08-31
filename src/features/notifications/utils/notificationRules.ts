import {
  differenceInMinutes,
  format,
  isSameDay,
  isSameWeek,
  parse,
  parseISO,
} from 'date-fns';
import type { CalendarEvent } from '../../calendar/types/calendar.types';
import { getCurrentWeekDays } from '../../calendar/utils/calendarDates';
import { getVisibleCalendarOccurrencesForDays } from '../../calendar/utils/calendarRecurrence';
import { getFlexibleTasksForDate, getScheduledEventsForDate, sortEventsByTime } from '../../calendar/utils/eventSorting';
import type { NotificationPreferences } from '../../settings/types/settings.types';
import type { AtriaNotification } from '../types/notification.types';

type BuildNotificationsInput = {
  items: CalendarEvent[];
  preferences: NotificationPreferences;
  weekStartsOnMonday: boolean;
  dismissedIds: string[];
  now?: Date;
};

function formatDateKey(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function parseDateTime(date: string, time: string) {
  return parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
}

function timeToMinutes(time: string) {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

export function isWithinQuietHours(now: Date, preferences: NotificationPreferences) {
  if (!preferences.quietHoursEnabled) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = timeToMinutes(preferences.quietHoursStart);
  const endMinutes = timeToMinutes(preferences.quietHoursEnd);

  if (startMinutes === endMinutes) {
    return true;
  }

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

function getTodayOccurrences(items: CalendarEvent[], now: Date) {
  const today = formatDateKey(now);
  return getVisibleCalendarOccurrencesForDays(items, [{
    isoDate: today,
  }]);
}

function getWeekOccurrences(items: CalendarEvent[], now: Date, weekStartsOnMonday: boolean) {
  return getVisibleCalendarOccurrencesForDays(
    items,
    getCurrentWeekDays(now, weekStartsOnMonday),
  );
}

function getUpcomingEvent(todayItems: CalendarEvent[], now: Date) {
  return sortEventsByTime(getScheduledEventsForDate(todayItems, formatDateKey(now)))
    .filter((item) => !item.completed)
    .find((item) => {
      const startsAt = parseDateTime(item.date, item.startTime);
      const minutesUntilStart = differenceInMinutes(startsAt, now);
      return minutesUntilStart >= 0 && minutesUntilStart <= 90;
    });
}

function getNextEventBody(item: CalendarEvent, now: Date) {
  if (item.itemType !== 'event') {
    return '';
  }

  const minutesUntilStart = differenceInMinutes(parseDateTime(item.date, item.startTime), now);

  if (minutesUntilStart <= 5) {
    return `${item.startTime}-${item.endTime} · starting soon`;
  }

  return `${item.startTime}-${item.endTime} · in ${minutesUntilStart} min`;
}

export function buildAtriaNotifications({
  items,
  preferences,
  weekStartsOnMonday,
  dismissedIds,
  now = new Date(),
}: BuildNotificationsInput): AtriaNotification[] {
  const today = formatDateKey(now);
  const dismissed = new Set(dismissedIds);
  const quietHoursActive = isWithinQuietHours(now, preferences);

  if (quietHoursActive) {
    const quietNotification: AtriaNotification = {
      id: `quiet-hours:${today}`,
      kind: 'quiet-hours',
      title: 'Quiet hours are active',
      body: `Atria is holding prompts until ${preferences.quietHoursEnd}.`,
      tone: 'neutral',
      createdForDate: today,
      actionLabel: 'Open settings',
      actionPath: '/settings',
    };

    return dismissed.has(quietNotification.id) ? [] : [quietNotification];
  }

  const todayItems = getTodayOccurrences(items, now);
  const scheduledEvents = getScheduledEventsForDate(todayItems, today);
  const flexibleTasks = getFlexibleTasksForDate(todayItems, today);
  const openTasks = flexibleTasks.filter((item) => !item.completed);
  const completedToday = todayItems.filter((item) => item.completed).length;
  const notifications: AtriaNotification[] = [];

  if (preferences.inAppDailyOverview && todayItems.length > 0) {
    notifications.push({
      id: `daily-overview:${today}`,
      kind: 'daily-overview',
      title: 'Today has shape',
      body: `${scheduledEvents.length} scheduled · ${openTasks.length} open task${openTasks.length === 1 ? '' : 's'} · ${completedToday}/${todayItems.length} complete`,
      tone: 'rose',
      createdForDate: today,
      actionLabel: 'Open today',
      actionPath: '/today',
    });
  }

  const upcomingEvent = getUpcomingEvent(todayItems, now);

  if (upcomingEvent) {
    notifications.push({
      id: `upcoming-event:${upcomingEvent.id}`,
      kind: 'upcoming-event',
      title: upcomingEvent.title,
      body: getNextEventBody(upcomingEvent, now),
      tone: 'mauve',
      createdForDate: today,
      item: upcomingEvent,
      actionLabel: 'Open calendar',
      actionPath: '/calendar',
    });
  }

  if (openTasks.length >= 3) {
    notifications.push({
      id: `open-tasks:${today}`,
      kind: 'open-tasks',
      title: 'Tasks need a pass',
      body: `${openTasks.length} flexible tasks are still open today.`,
      tone: 'violet',
      createdForDate: today,
      actionLabel: 'Open tasks',
      actionPath: '/tasks',
    });
  }

  if (preferences.inAppReflectionPrompt && now.getHours() >= 16 && todayItems.length > 0) {
    notifications.push({
      id: `reflection-prompt:${today}`,
      kind: 'reflection-prompt',
      title: 'Close the loop',
      body: 'Capture a quick reflection while the day is still fresh.',
      tone: 'rose',
      createdForDate: today,
      actionLabel: 'Open today',
      actionPath: '/today',
    });
  }

  if (preferences.inAppWeeklySummary) {
    const weekItems = getWeekOccurrences(items, now, weekStartsOnMonday);
    const weekCompleted = weekItems.filter((item) => item.completed).length;
    const isLateWeek = isSameWeek(now, parseISO(today), { weekStartsOn: weekStartsOnMonday ? 1 : 0 }) && [0, 5, 6].includes(now.getDay());
    const weekStartDate = getCurrentWeekDays(now, weekStartsOnMonday)[0]?.isoDate ?? today;

    if (isLateWeek && weekItems.length > 0) {
      notifications.push({
        id: `weekly-summary:${format(parseISO(weekStartDate), 'yyyy-MM-dd')}`,
        kind: 'weekly-summary',
        title: 'Weekly pulse is ready',
        body: `${weekCompleted}/${weekItems.length} items complete across this orbit.`,
        tone: 'neutral',
        createdForDate: today,
        actionLabel: 'Open insights',
        actionPath: '/insights',
      });
    }
  }

  return notifications.filter((notification) => {
    if (dismissed.has(notification.id)) {
      return false;
    }

    return notification.item ? isSameDay(parseISO(notification.item.date), now) : true;
  });
}
