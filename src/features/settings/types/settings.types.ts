import type { CalendarItemType, EventCategory } from '../../calendar/types/calendar.types';

export type DefaultView = 'calendar' | 'today' | 'insights';

export type SettingsPreferences = {
  weekStartsOnMonday: boolean;
  defaultItemType: CalendarItemType;
  defaultCategory: EventCategory;
  defaultView: DefaultView;
};
