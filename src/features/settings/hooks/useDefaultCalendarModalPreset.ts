import { useCallback } from 'react';
import type { CalendarModalPreset } from '../../calendar/types/calendar.types';
import { useSettingsStore } from '../store/settings.store';

export function useDefaultCalendarModalPreset() {
  const preferences = useSettingsStore((state) => state.preferences);

  return useCallback(
    (overrides: CalendarModalPreset = {}): CalendarModalPreset => ({
      itemType: overrides.itemType ?? preferences.defaultItemType,
      category: overrides.category ?? preferences.defaultCategory,
      date: overrides.date,
    }),
    [preferences.defaultCategory, preferences.defaultItemType],
  );
}
