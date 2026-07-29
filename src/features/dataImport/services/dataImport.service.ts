import { readStoredCalendarEvents, readStoredDailyFocus, writeStoredCalendarEvents, writeStoredDailyFocus } from '../../calendar/services/calendarStorage.service';
import { useCalendarStore } from '../../calendar/store/calendar.store';
import type { CalendarEvent } from '../../calendar/types/calendar.types';
import { readStoredGoals, writeStoredGoals } from '../../goals/services/goalsStorage.service';
import type { Goal } from '../../goals/types/goals.types';
import { loadIntentions, saveIntentions } from '../../intentions/services/intentionsStorage.service';
import type { Intention } from '../../intentions/types/intentions.types';
import { readStoredProjects, writeStoredProjects } from '../../projects/services/projectsStorage.service';
import type { Project } from '../../projects/types/projects.types';
import { loadReflections, saveReflections } from '../../reflections/services/reflectionsStorage.service';
import type { ReflectionsByDate } from '../../reflections/types/reflections.types';
import { useGoalsStore } from '../../goals/store/goals.store';
import { useIntentionsStore } from '../../intentions/store/intentions.store';
import { useProjectsStore } from '../../projects/store/projects.store';
import { useReflectionsStore } from '../../reflections';
import { defaultSettingsPreferences, readStoredSettingsPreferences, writeStoredSettingsPreferences } from '../../settings/services/settingsStorage.service';
import { useSettingsStore } from '../../settings/store/settings.store';
import type { SettingsPreferences } from '../../settings/types/settings.types';
import type { AtriaExport } from '../../dataExport/types/dataExport.types';
import type { AtriaImportResult, AtriaImportSummary } from '../types/dataImport.types';

const supportedImportSchemaVersions = [1];

export class AtriaImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AtriaImportError';
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function parseAtriaImportJson(json: string): Partial<AtriaExport> {
  let payload: unknown;

  try {
    payload = JSON.parse(json);
  } catch {
    throw new AtriaImportError('This file is not valid JSON.');
  }

  const record = asRecord(payload);
  const schemaVersion = Number(record.schemaVersion);

  if (!supportedImportSchemaVersions.includes(schemaVersion)) {
    throw new AtriaImportError('This does not look like a supported Atria backup.');
  }

  return record as Partial<AtriaExport>;
}

function getImportedCalendar(payload: Partial<AtriaExport>) {
  const calendar = asRecord(payload.calendar);

  return {
    events: Array.isArray(calendar.events) ? calendar.events as CalendarEvent[] : [],
    dailyFocusByDate: asRecord(calendar.dailyFocusByDate) as Record<string, string>,
  };
}

function getImportSummary(): AtriaImportSummary {
  const reflections = loadReflections();

  return {
    events: readStoredCalendarEvents().length,
    dailyFocusEntries: Object.keys(readStoredDailyFocus()).length,
    intentions: loadIntentions().length,
    reflections: Object.keys(reflections).length,
    goals: readStoredGoals().length,
    projects: readStoredProjects().length,
  };
}

function hydrateStores() {
  useCalendarStore.getState().hydrate();
  useIntentionsStore.getState().hydrate();
  useReflectionsStore.getState().hydrate();
  useGoalsStore.getState().hydrate();
  useProjectsStore.getState().hydrate();
  useSettingsStore.getState().hydrate();
}

export function importAtriaDataFromJson(json: string, importedAt = new Date()): AtriaImportResult {
  const payload = parseAtriaImportJson(json);
  const calendar = getImportedCalendar(payload);

  writeStoredCalendarEvents(calendar.events);
  writeStoredDailyFocus(calendar.dailyFocusByDate);
  saveIntentions(Array.isArray(payload.intentions) ? payload.intentions as Intention[] : []);
  saveReflections(asRecord(payload.reflections) as ReflectionsByDate);
  writeStoredGoals(Array.isArray(payload.goals) ? payload.goals as Goal[] : []);
  writeStoredProjects(Array.isArray(payload.projects) ? payload.projects as Project[] : []);
  writeStoredSettingsPreferences((payload.settings ?? defaultSettingsPreferences) as SettingsPreferences);

  hydrateStores();

  return {
    importedAt: importedAt.toISOString(),
    appVersion: typeof payload.appVersion === 'string' ? payload.appVersion : undefined,
    schemaVersion: Number(payload.schemaVersion),
    summary: getImportSummary(),
  };
}
