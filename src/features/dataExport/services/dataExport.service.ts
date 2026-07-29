import { formatInputDate } from '../../calendar/utils/calendarDates';
import { useCalendarStore } from '../../calendar/store/calendar.store';
import { useGoalsStore } from '../../goals/store/goals.store';
import { useIntentionsStore } from '../../intentions/store/intentions.store';
import { useProjectsStore } from '../../projects/store/projects.store';
import { useReflectionsStore } from '../../reflections';
import { useSettingsStore } from '../../settings/store/settings.store';
import type { AtriaExport } from '../types/dataExport.types';

export const atriaExportSchemaVersion = 1;
export const atriaAppVersion = '1.0.0-rc.1';

export function createAtriaExport(exportedAt = new Date()): AtriaExport {
  const calendarState = useCalendarStore.getState();

  return {
    exportedAt: exportedAt.toISOString(),
    appVersion: atriaAppVersion,
    schemaVersion: atriaExportSchemaVersion,
    calendar: {
      events: calendarState.events,
      dailyFocusByDate: calendarState.dailyFocusByDate,
    },
    intentions: useIntentionsStore.getState().intentions,
    reflections: useReflectionsStore.getState().reflections,
    goals: useGoalsStore.getState().goals,
    projects: useProjectsStore.getState().projects,
    settings: useSettingsStore.getState().preferences,
  };
}

export function getAtriaExportFilename(exportedAt = new Date()) {
  return `atria-backup-${formatInputDate(exportedAt)}.json`;
}

export function downloadAtriaExport(exportedAt = new Date()) {
  const payload = createAtriaExport(exportedAt);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = getAtriaExportFilename(exportedAt);
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
