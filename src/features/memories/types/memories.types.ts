import type { EventCategory } from '../../calendar/types/calendar.types';
import type { DailyReflection } from '../../reflections';
import type { TimeQuality } from '../../timeQuality';

export type MemoryItemType = 'event' | 'focus-session' | 'completed-intention';
export type MemoryFilter = 'all' | 'reflections' | 'events' | 'focus-sessions' | 'completed-intentions' | 'highlights';

export type MemoryTimelineItem = {
  id: string;
  type: MemoryItemType;
  title: string;
  description?: string;
  start?: string;
  end?: string;
  durationMinutes?: number;
  completedAt?: string;
  intentionId?: string;
  intentionTitle?: string;
  desiredOutcome?: string;
  calendarItemId?: string;
  category?: EventCategory;
  timeQuality?: TimeQuality;
};

export type MemoryDay = {
  dateKey: string;
  items: MemoryTimelineItem[];
  reflection?: DailyReflection;
  highlight?: string;
  completedCount: number;
  focusMinutes: number;
  eventCount: number;
  hasMeaningfulContent: boolean;
};

export type MemoryWeek = {
  weekStart: string;
  weekEnd: string;
  days: MemoryDay[];
};
