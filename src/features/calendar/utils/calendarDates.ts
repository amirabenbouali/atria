import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns';

export type WeekDay = {
  key: string;
  name: string;
  shortName: string;
  dateLabel: string;
  isoDate: string;
  isToday: boolean;
};

export function getCurrentWeekDays(referenceDate = new Date()): WeekDay[] {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 });

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index);
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
}

export function getWeekLabel(referenceDate = new Date()) {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const sunday = addDays(monday, 6);

  return `${format(monday, 'd MMM')} - ${format(sunday, 'd MMM yyyy')}`;
}

export function formatInputDate(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}

export function getDateForWeekday(dayName: string, referenceDate = new Date()) {
  return getCurrentWeekDays(referenceDate).find((day) => day.name === dayName)?.isoDate ?? formatInputDate(referenceDate);
}

export function getReadableEventDate(date: string) {
  return format(parseISO(date), 'EEE, d MMM');
}
