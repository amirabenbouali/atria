import { addDays, endOfMonth, format, isSameDay, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import type { StartOfWeekOptions } from 'date-fns';

export type WeekDay = {
  key: string;
  name: string;
  shortName: string;
  dateLabel: string;
  isoDate: string;
  isToday: boolean;
};

export type CalendarDay = WeekDay & {
  isCurrentMonth?: boolean;
};

export function getWeekStartsOn(weekStartsOnMonday = true): StartOfWeekOptions['weekStartsOn'] {
  return weekStartsOnMonday ? 1 : 0;
}

export function isWeekendDate(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function filterVisibleCalendarDays<Day extends { isoDate: string }>(days: Day[], showWeekends = true): Day[] {
  if (showWeekends) {
    return days;
  }

  return days.filter((day) => !isWeekendDate(parseISO(day.isoDate)));
}

export function getCurrentWeekDays(referenceDate = new Date(), weekStartsOnMonday = true, showWeekends = true): WeekDay[] {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: getWeekStartsOn(weekStartsOnMonday) });

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const name = format(date, 'EEEE');

    return {
      key: name,
      name,
      shortName: format(date, 'EEE'),
      dateLabel: format(date, 'd MMM'),
      isoDate: format(date, 'yyyy-MM-dd'),
      isToday: isSameDay(date, new Date()),
    };
  });

  return filterVisibleCalendarDays(weekDays, showWeekends);
}

export function getCalendarDay(date: Date, isCurrentMonth = true): CalendarDay {
  const name = format(date, 'EEEE');

  return {
    key: format(date, 'yyyy-MM-dd'),
    name,
    shortName: format(date, 'EEE'),
    dateLabel: format(date, 'd MMM'),
    isoDate: format(date, 'yyyy-MM-dd'),
    isToday: isSameDay(date, new Date()),
    isCurrentMonth,
  };
}

export function getMonthGridDays(referenceDate = new Date(), weekStartsOnMonday = true, showWeekends = true): CalendarDay[] {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: getWeekStartsOn(weekStartsOnMonday) });
  const gridEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: getWeekStartsOn(weekStartsOnMonday) }), 6);
  const dayCount = Math.round((gridEnd.getTime() - gridStart.getTime()) / 86_400_000) + 1;

  const monthDays = Array.from({ length: dayCount }, (_, index) => {
    const date = addDays(gridStart, index);
    return getCalendarDay(date, date.getMonth() === referenceDate.getMonth());
  });

  return filterVisibleCalendarDays(monthDays, showWeekends);
}

export function getAdjacentVisibleDate(referenceDate: Date, direction: -1 | 1, showWeekends = true) {
  let nextDate = addDays(referenceDate, direction);

  while (!showWeekends && isWeekendDate(nextDate)) {
    nextDate = addDays(nextDate, direction);
  }

  return nextDate;
}

export function getWeekLabel(referenceDate = new Date(), weekStartsOnMonday = true) {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: getWeekStartsOn(weekStartsOnMonday) });
  const weekEnd = addDays(weekStart, 6);

  return `${format(weekStart, 'd MMM')} - ${format(weekEnd, 'd MMM yyyy')}`;
}

export function getDayLabel(referenceDate = new Date()) {
  return format(referenceDate, 'EEEE, d MMM yyyy');
}

export function getMonthLabel(referenceDate = new Date()) {
  return format(referenceDate, 'MMMM yyyy');
}

export function formatInputDate(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}

export function getDateForWeekday(dayName: string, referenceDate = new Date(), weekStartsOnMonday = true) {
  return getCurrentWeekDays(referenceDate, weekStartsOnMonday).find((day) => day.name === dayName)?.isoDate ?? formatInputDate(referenceDate);
}

export function getReadableEventDate(date: string) {
  return format(parseISO(date), 'EEE, d MMM');
}
