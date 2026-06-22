import { useMemo } from 'react';
import { useCalendarStore } from '../../../features/calendar/store/calendar.store';
import { useSettingsStore } from '../../../features/settings/store/settings.store';
import { getVisibleCalendarOccurrences } from '../../../features/calendar/utils/calendarRecurrence';
import {
  getCategoryProgress,
  getProgressPercentage,
  getTodayDisplayDate,
  getTodayFlexibleTasks,
  getTodayIsoDate,
  getTodayScheduledEvents,
} from '../utils/todayDashboard';

export function useTodayDashboard() {
  const sourceEvents = useCalendarStore((state) => state.events);
  const dailyFocusByDate = useCalendarStore((state) => state.dailyFocusByDate);
  const weekStartsOnMonday = useSettingsStore((state) => state.preferences.weekStartsOnMonday);
  const todayIsoDate = useMemo(() => getTodayIsoDate(), []);
  const todayLabel = useMemo(() => getTodayDisplayDate(), []);
  const visibleItems = useMemo(
    () =>
      getVisibleCalendarOccurrences(sourceEvents, new Date(), weekStartsOnMonday).filter(
        (item) => item.date === todayIsoDate,
      ),
    [sourceEvents, todayIsoDate, weekStartsOnMonday],
  );
  const scheduledEvents = useMemo(
    () => getTodayScheduledEvents(visibleItems, todayIsoDate),
    [visibleItems, todayIsoDate],
  );
  const flexibleTasks = useMemo(
    () => getTodayFlexibleTasks(visibleItems, todayIsoDate),
    [visibleItems, todayIsoDate],
  );
  const completedCount = useMemo(
    () => visibleItems.filter((item) => item.completed).length,
    [visibleItems],
  );
  const progress = getProgressPercentage(completedCount, visibleItems.length);
  const categoryProgress = useMemo(() => getCategoryProgress(visibleItems), [visibleItems]);

  return {
    todayIsoDate,
    todayLabel,
    visibleItems,
    sourceEvents,
    scheduledEvents,
    flexibleTasks,
    categoryProgress,
    completedCount,
    totalCount: visibleItems.length,
    progress,
    dailyFocus: dailyFocusByDate[todayIsoDate] ?? '',
  };
}
