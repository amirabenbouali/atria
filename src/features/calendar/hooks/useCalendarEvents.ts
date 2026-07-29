import { useMemo } from 'react';
import { useWeekStartsOnMonday } from '../../settings/hooks/useWeekStartsOnMonday';
import { useSettingsStore } from '../../settings/store/settings.store';
import { useCalendarStore } from '../store/calendar.store';
import { getWeekLabel } from '../utils/calendarDates';
import { getVisibleCalendarOccurrences } from '../utils/calendarRecurrence';
import { getCompletedEventCount } from '../utils/eventSorting';

export function useCalendarEvents() {
  const events = useCalendarStore((state) => state.events);
  const selectedWeekDate = useCalendarStore((state) => state.selectedWeekDate);
  const weekStartsOnMonday = useWeekStartsOnMonday();
  const showWeekends = useSettingsStore((state) => state.preferences.calendar.showWeekends);
  const visibleEvents = useMemo(
    () => getVisibleCalendarOccurrences(events, selectedWeekDate, weekStartsOnMonday, showWeekends),
    [events, selectedWeekDate, weekStartsOnMonday, showWeekends],
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
    showWeekends,
    weekLabel,
    totalEventCount: visibleEvents.length,
    completedEventCount,
  };
}
