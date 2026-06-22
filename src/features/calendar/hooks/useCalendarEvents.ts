import { useMemo } from 'react';
import { useCalendarStore } from '../store/calendar.store';
import { getWeekLabel } from '../utils/calendarDates';
import { getCompletedEventCount } from '../utils/eventSorting';

export function useCalendarEvents() {
  const events = useCalendarStore((state) => state.events);
  const selectedWeekDate = useCalendarStore((state) => state.selectedWeekDate);
  const completedEventCount = useMemo(() => getCompletedEventCount(events), [events]);
  const weekLabel = useMemo(() => getWeekLabel(selectedWeekDate), [selectedWeekDate]);

  return {
    events,
    selectedWeekDate,
    weekLabel,
    totalEventCount: events.length,
    completedEventCount,
  };
}
