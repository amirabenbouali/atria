import type { CalendarEvent } from '../../calendar/types/calendar.types';

export function getFocusSessionsForIntention(calendarItems: CalendarEvent[], intentionId: string) {
  return calendarItems.filter(
    (item) =>
      item.itemType === 'event' &&
      item.source === 'planning-suggestion' &&
      item.focusSession?.intentionId === intentionId,
  );
}

export function getFocusSessionCountByIntention(calendarItems: CalendarEvent[]) {
  return calendarItems.reduce<Record<string, number>>((counts, item) => {
    if (item.itemType !== 'event' || item.source !== 'planning-suggestion' || !item.focusSession?.intentionId) {
      return counts;
    }

    counts[item.focusSession.intentionId] = (counts[item.focusSession.intentionId] ?? 0) + 1;
    return counts;
  }, {});
}

export function getPlannedSessionLabel(count: number) {
  if (count === 0) {
    return 'Not planned';
  }

  return count === 1 ? '1 focus session planned' : `${count} focus sessions planned`;
}
