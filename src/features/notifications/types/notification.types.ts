import type { CalendarEvent } from '../../calendar/types/calendar.types';

export type AtriaNotificationKind =
  | 'daily-overview'
  | 'upcoming-event'
  | 'open-tasks'
  | 'reflection-prompt'
  | 'weekly-summary'
  | 'quiet-hours';

export type AtriaNotificationTone = 'rose' | 'mauve' | 'violet' | 'neutral' | 'warning';

export type AtriaNotification = {
  id: string;
  kind: AtriaNotificationKind;
  title: string;
  body: string;
  tone: AtriaNotificationTone;
  createdForDate: string;
  item?: CalendarEvent;
  actionLabel?: string;
  actionPath?: string;
};
