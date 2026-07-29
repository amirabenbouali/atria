import { useCallback } from 'react';
import type { CalendarModalPreset } from '../../calendar/types/calendar.types';
import { useSettingsStore } from '../store/settings.store';

export function useDefaultCalendarModalPreset() {
  const planningDefaults = useSettingsStore((state) => state.preferences.planningDefaults);

  return useCallback(
    (overrides: CalendarModalPreset = {}): CalendarModalPreset => ({
      itemType: overrides.itemType ?? planningDefaults.defaultItemType,
      category: overrides.category ?? planningDefaults.defaultCategory,
      date: overrides.date,
    }),
    [planningDefaults.defaultCategory, planningDefaults.defaultItemType],
  );
}
