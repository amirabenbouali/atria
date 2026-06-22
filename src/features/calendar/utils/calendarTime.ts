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

export function getEventDurationHeight(startTime: string, endTime: string) {
  const durationMinutes = Math.max(30, getMinutesFromTime(endTime) - getMinutesFromTime(startTime));
  return Math.max(74, (durationMinutes / 60) * calendarHourHeight - 8);
}
