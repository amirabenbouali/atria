import { useEffect, useMemo, useState } from 'react';
import { useCalendarStore } from '../../../features/calendar/store/calendar.store';
import { useIntentionsStore } from '../../../features/intentions';
import { useReflectionsStore } from '../../../features/reflections';
import { useSettingsStore } from '../../../features/settings/store/settings.store';
import { buildTodayViewModel } from '../utils/todayDashboard';

function getCurrentMinuteDate() {
  const date = new Date();
  date.setSeconds(0, 0);
  return date;
}

export function useTodayDashboard() {
  const [now, setNow] = useState(() => getCurrentMinuteDate());
  const sourceEvents = useCalendarStore((state) => state.events);
  const intentions = useIntentionsStore((state) => state.intentions);
  const reflectionsByDate = useReflectionsStore((state) => state.reflections);
  const preferences = useSettingsStore((state) => state.preferences);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(getCurrentMinuteDate()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const reflections = useMemo(() => Object.values(reflectionsByDate), [reflectionsByDate]);
  const viewModel = useMemo(
    () =>
      buildTodayViewModel({
        now,
        calendarItems: sourceEvents,
        intentions,
        energyProfile: preferences.energyProfile,
        reflections,
        weekStartsOnMonday: preferences.weekStartsOnMonday,
      }),
    [intentions, now, preferences.energyProfile, preferences.weekStartsOnMonday, reflections, sourceEvents],
  );

  return {
    now,
    sourceEvents,
    viewModel,
  };
}
