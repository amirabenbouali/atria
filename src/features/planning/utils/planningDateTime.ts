import {
  addDays,
  differenceInMinutes,
  eachDayOfInterval,
  endOfDay,
  format,
  isAfter,
  isBefore,
  max,
  min,
  parseISO,
  startOfDay,
} from 'date-fns';
import { getMinutesFromTime } from '../../calendar/utils/calendarTime';

export function toLocalDateTime(date: string, time: string) {
  return parseISO(`${date}T${time}:00`);
}

export function formatLocalDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function formatLocalTime(date: Date) {
  return format(date, 'HH:mm');
}

export function getMinutesIntoDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function setMinuteOfDay(day: Date, minute: number) {
  const date = startOfDay(day);
  date.setMinutes(minute);
  return date;
}

export function getDaysInRange(rangeStart: Date, rangeEnd: Date) {
  return eachDayOfInterval({
    start: startOfDay(rangeStart),
    end: startOfDay(rangeEnd),
  });
}

export function getPlanningRange(now: Date, searchDays: number, deadline?: string) {
  const start = now;
  const defaultEnd = endOfDay(addDays(startOfDay(now), searchDays));

  if (!deadline) {
    return {
      start,
      end: defaultEnd,
    };
  }

  const deadlineEnd = endOfDay(parseISO(deadline));
  return {
    start,
    end: isBefore(deadlineEnd, defaultEnd) ? deadlineEnd : defaultEnd,
  };
}

export function clipInterval(start: Date, end: Date, clipStart: Date, clipEnd: Date) {
  const clippedStart = max([start, clipStart]);
  const clippedEnd = min([end, clipEnd]);

  if (!isBefore(clippedStart, clippedEnd)) {
    return null;
  }

  return {
    start: clippedStart,
    end: clippedEnd,
    durationMinutes: differenceInMinutes(clippedEnd, clippedStart),
  };
}

export function getEventInterval(date: string, startTime: string, endTime: string) {
  const start = toLocalDateTime(date, startTime);
  const endMinutes = getMinutesFromTime(endTime);
  const startMinutes = getMinutesFromTime(startTime);
  const end = toLocalDateTime(date, endTime);

  return {
    start,
    end: endMinutes <= startMinutes ? addDays(end, 1) : end,
  };
}

export function doIntervalsOverlap(firstStart: Date, firstEnd: Date, secondStart: Date, secondEnd: Date) {
  return isBefore(firstStart, secondEnd) && isAfter(firstEnd, secondStart);
}

export function addMinutesToDate(date: Date, minutes: number) {
  const nextDate = new Date(date);
  nextDate.setMinutes(nextDate.getMinutes() + minutes);
  return nextDate;
}
