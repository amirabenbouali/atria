export type AtriaImportSummary = {
  events: number;
  dailyFocusEntries: number;
  intentions: number;
  reflections: number;
  goals: number;
  projects: number;
};

export type AtriaImportResult = {
  importedAt: string;
  appVersion?: string;
  schemaVersion: number;
  summary: AtriaImportSummary;
};

