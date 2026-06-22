import { getMinutesFromTime } from './calendarTime';
import type {
  CalendarEventFormValues,
  CalendarEventValidationErrors,
} from '../types/calendar.types';

export function validateCalendarEvent(values: CalendarEventFormValues) {
  const errors: CalendarEventValidationErrors = {};

  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  }

  if (!values.date) {
    errors.date = 'Date is required.';
  }

  if (values.itemType === 'event' && !values.startTime) {
    errors.startTime = 'Start time is required.';
  }

  if (values.itemType === 'event' && !values.endTime) {
    errors.endTime = 'End time is required.';
  }

  if (
    values.itemType === 'event' &&
    values.startTime &&
    values.endTime &&
    getMinutesFromTime(values.endTime) <= getMinutesFromTime(values.startTime)
  ) {
    errors.endTime = 'End time must be after start time.';
  }

  if (
    values.recurrence !== 'none' &&
    values.recurrenceEndDate &&
    values.date &&
    values.recurrenceEndDate < values.date
  ) {
    errors.recurrenceEndDate = 'End date must be after the start date.';
  }

  return errors;
}

export function hasValidationErrors(errors: CalendarEventValidationErrors) {
  return Object.keys(errors).length > 0;
}
