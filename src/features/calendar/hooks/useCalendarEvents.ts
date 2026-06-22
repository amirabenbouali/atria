import { useMemo } from 'react';
import { useSettingsStore } from '../../settings/store/settings.store';
import { useCalendarStore } from '../store/calendar.store';
import { getWeekLabel } from '../utils/calendarDates';
import { getVisibleCalendarOccurrences } from '../utils/calendarRecurrence';
import { getCompletedEventCount } from '../utils/eventSorting';

export function useCalendarEvents() {
  const events = useCalendarStore((state) => state.events);
  const selectedWeekDate = useCalendarStore((state) => state.selectedWeekDate);
  const weekStartsOnMonday = useSettingsStore((state) => state.preferences.weekStartsOnMonday);
  const visibleEvents = useMemo(
    () => getVisibleCalendarOccurrences(events, selectedWeekDate, weekStartsOnMonday),
    [events, selectedWeekDate, weekStartsOnMonday],
  );
  const completedEventCount = useMemo(() => getCompletedEventCount(visibleEvents), [visibleEvents]);
  const weekLabel = useMemo(
    () => getWeekLabel(selectedWeekDate, weekStartsOnMonday),
    [selectedWeekDate, weekStartsOnMonday],
  );

  return {
    events: visibleEvents,
    sourceEvents: events,
    selectedWeekDate,
    weekStartsOnMonday,
    weekLabel,
    totalEventCount: visibleEvents.length,
    completedEventCount,
  };
}
