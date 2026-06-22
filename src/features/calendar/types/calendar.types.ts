export type EventCategory = 'Work' | 'Personal' | 'Fitness' | 'Learning' | 'Health' | 'Finance';

export type CalendarItemType = 'event' | 'task';

type CalendarItemBase = {
  id: string;
  itemType: CalendarItemType;
  title: string;
  date: string;
  category: EventCategory;
  description: string;
  accentColor: string;
  completed: boolean;
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
  | Omit<ScheduledCalendarEvent, 'id' | 'completed' | 'createdAt' | 'updatedAt'>
  | Omit<FlexibleCalendarTask, 'id' | 'completed' | 'createdAt' | 'updatedAt' | 'order'>;

export type CalendarEventFormValues = {
  itemType: CalendarItemType;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: EventCategory;
  description: string;
  accentColor: string;
};

export type CalendarEventValidationErrors = Partial<Record<keyof CalendarEventFormValues, string>>;

export type CalendarModalPreset = {
  itemType?: CalendarItemType;
  date?: string;
};
