import { format, isValid, parseISO } from 'date-fns';

const localDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isLocalDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !localDatePattern.test(value)) {
    return false;
  }

  const parsedDate = parseISO(value);
  return isValid(parsedDate) && format(parsedDate, 'yyyy-MM-dd') === value;
}

export function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && isValid(parseISO(value));
}

export function getIsoTimestamp(date = new Date()) {
  return date.toISOString();
}
