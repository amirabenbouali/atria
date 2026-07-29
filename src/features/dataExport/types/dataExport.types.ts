import type { CalendarEvent } from '../../calendar/types/calendar.types';
import type { Goal } from '../../goals/types/goals.types';
import type { Intention } from '../../intentions/types/intentions.types';
import type { Project } from '../../projects/types/projects.types';
import type { ReflectionsByDate } from '../../reflections';
import type { SettingsPreferences } from '../../settings/types/settings.types';

export type AtriaExport = {
  exportedAt: string;
  appVersion: string;
  schemaVersion: 1;
  calendar: {
    events: CalendarEvent[];
    dailyFocusByDate: Record<string, string>;
  };
  intentions: Intention[];
  reflections: ReflectionsByDate;
  goals: Goal[];
  projects: Project[];
  settings: SettingsPreferences;
};
