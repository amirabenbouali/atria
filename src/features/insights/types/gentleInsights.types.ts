export type InsightCategory = 'focus' | 'intentions' | 'load' | 'recovery' | 'energy' | 'reflection';
export type InsightConfidence = 'emerging' | 'supported' | 'strong';

export type InsightEvidenceType =
  | 'calendar-item'
  | 'focus-session'
  | 'intention'
  | 'reflection'
  | 'energy-profile'
  | 'daily-summary';

export type InsightEvidence = {
  type: InsightEvidenceType;
  sourceId?: string;
  dateKey?: string;
  value?: number;
  label?: string;
};

export type GentleInsight = {
  id: string;
  category: InsightCategory;
  title: string;
  summary: string;
  confidence: InsightConfidence;
  evidenceCount: number;
  evidence: InsightEvidence[];
  periodStart: string;
  periodEnd: string;
  observationCode: string;
  supportingMetric?: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'sessions' | 'intentions' | 'percent';
    label?: string;
  };
};

export type InsightRangeKey = 'last-7' | 'last-14' | 'last-30';

export type InsightPeriodSummary = {
  observedDays: number;
  timedDays: number;
  focusSessions: number;
  completedIntentions: number;
  reflectedDays: number;
};
