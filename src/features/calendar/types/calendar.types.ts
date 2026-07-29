export type EventCategory = 'Work' | 'Personal' | 'Fitness' | 'Learning' | 'Health' | 'Finance';

export type CalendarItemType = 'event' | 'task';
export type CalendarView = 'day' | 'week' | 'month';
export type CalendarRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type CalendarItemSource = 'manual' | 'planning-suggestion';

export type FocusSessionMetadata = {
  intentionId: string;
  planningSuggestionId?: string;
};

type CalendarItemBase = {
  id: string;
  sourceId?: string;
  occurrenceDate?: string;
  isRecurringOccurrence?: boolean;
  itemType: CalendarItemType;
  title: string;
  date: string;
  category: EventCategory;
  description: string;
  accentColor: string;
  completed: boolean;
  recurrence: CalendarRecurrence;
  recurrenceEndDate?: string;
  recurringCompletions: Record<string, boolean>;
  source?: CalendarItemSource;
  focusSession?: FocusSessionMetadata;
  createdAt: string;
  updatedAt: string;
};

export type ScheduledCalendarEvent = CalendarItemBase & {
  itemType: 'event';
  startTime: string;
  endTime: string;
};

export type FlexibleCalendarTask = CalendarItemBase & {
  itemType: 'task';
  order: number;
  goalId?: string;
  projectId?: string;
  startTime?: string;
  endTime?: string;
};

export type CalendarEvent = ScheduledCalendarEvent | FlexibleCalendarTask;

export type CalendarEventDraft =
  | Omit<
      ScheduledCalendarEvent,
      | 'id'
      | 'sourceId'
      | 'occurrenceDate'
      | 'isRecurringOccurrence'
      | 'completed'
      | 'recurringCompletions'
      | 'source'
      | 'focusSession'
      | 'createdAt'
      | 'updatedAt'
    >
  | Omit<
      FlexibleCalendarTask,
      | 'id'
      | 'sourceId'
      | 'occurrenceDate'
      | 'isRecurringOccurrence'
      | 'completed'
      | 'recurringCompletions'
      | 'source'
      | 'focusSession'
      | 'createdAt'
      | 'updatedAt'
      | 'order'
    >;

export type CalendarFocusSessionDraft = Omit<
  ScheduledCalendarEvent,
  | 'id'
  | 'sourceId'
  | 'occurrenceDate'
  | 'isRecurringOccurrence'
  | 'completed'
  | 'recurringCompletions'
  | 'createdAt'
  | 'updatedAt'
>;

export type CalendarEventFormValues = {
  itemType: CalendarItemType;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: EventCategory;
  description: string;
  accentColor: string;
  goalId: string;
  projectId: string;
  recurrence: CalendarRecurrence;
  recurrenceEndDate: string;
};

export type CalendarEventValidationErrors = Partial<Record<keyof CalendarEventFormValues, string>>;

export type CalendarModalPreset = {
  itemType?: CalendarItemType;
  date?: string;
  category?: EventCategory;
  goalId?: string;
  projectId?: string;
};
