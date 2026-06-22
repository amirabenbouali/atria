export type EventCategory = 'Work' | 'Personal' | 'Fitness' | 'Learning' | 'Health' | 'Finance';

export type CalendarItemType = 'event' | 'task';
export type CalendarRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

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
      | 'createdAt'
      | 'updatedAt'
      | 'order'
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
  recurrence: CalendarRecurrence;
  recurrenceEndDate: string;
};

export type CalendarEventValidationErrors = Partial<Record<keyof CalendarEventFormValues, string>>;

export type CalendarModalPreset = {
  itemType?: CalendarItemType;
  date?: string;
  category?: EventCategory;
};
