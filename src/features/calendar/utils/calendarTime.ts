import {
  calendarEndHour,
  calendarHourHeight,
  calendarStartHour,
} from '../constants/calendar.constants';

export function getCalendarHours() {
  return Array.from(
    { length: calendarEndHour - calendarStartHour + 1 },
    (_, index) => calendarStartHour + index,
  );
}

export function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function getEventOffset(time: string) {
  const [hours = '0', minutes = '0'] = time.split(':');
  const eventHour = Number(hours);
  const eventMinutes = Number(minutes);
  const minutesFromStart = Math.max(0, (eventHour - calendarStartHour) * 60 + eventMinutes);

  return (minutesFromStart / 60) * calendarHourHeight;
}

export function getMinutesFromTime(time: string) {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

export function formatTimeFromMinutes(totalMinutes: number) {
  const clampedMinutes = Math.max(0, Math.min(24 * 60, totalMinutes));
  const hours = Math.floor(clampedMinutes / 60);
  const minutes = clampedMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function getMovedEventTimeRange(startTime: string, endTime: string, targetHour: number) {
  const durationMinutes = Math.max(30, getMinutesFromTime(endTime) - getMinutesFromTime(startTime));
  const dayStartMinutes = calendarStartHour * 60;
  const dayEndMinutes = (calendarEndHour + 1) * 60;
  const requestedStartMinutes = targetHour * 60;
  const latestStartMinutes = Math.max(dayStartMinutes, dayEndMinutes - durationMinutes);
  const nextStartMinutes = Math.max(dayStartMinutes, Math.min(requestedStartMinutes, latestStartMinutes));

  return {
    startTime: formatTimeFromMinutes(nextStartMinutes),
    endTime: formatTimeFromMinutes(nextStartMinutes + durationMinutes),
  };
}

export function getEventDurationHeight(startTime: string, endTime: string) {
  const durationMinutes = Math.max(30, getMinutesFromTime(endTime) - getMinutesFromTime(startTime));
  return Math.max(74, (durationMinutes / 60) * calendarHourHeight - 8);
}
