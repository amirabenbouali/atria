import { useSettingsStore } from '../store/settings.store';

export function useWeekStartsOnMonday() {
  return useSettingsStore((state) => state.preferences.calendar.weekStartsOn === 'monday');
}
