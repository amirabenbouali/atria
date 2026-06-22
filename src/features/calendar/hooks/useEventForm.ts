import { useEffect, useState, type FormEvent } from 'react';
import { useSettingsStore } from '../../settings/store/settings.store';
import {
  categoryColors,
  defaultEventCategory,
} from '../constants/calendar.constants';
import type {
  CalendarEvent,
  CalendarEventDraft,
  CalendarEventFormValues,
  CalendarEventValidationErrors,
  CalendarItemType,
  CalendarModalPreset,
  EventCategory,
} from '../types/calendar.types';
import { formatInputDate } from '../utils/calendarDates';
import {
  hasValidationErrors,
  validateCalendarEvent,
} from '../utils/eventValidation';

function createInitialFormValues(
  selectedWeekDate: Date,
  preset?: CalendarModalPreset | null,
  defaultCategory: EventCategory = defaultEventCategory,
  defaultItemType: CalendarItemType = 'event',
): CalendarEventFormValues {
  const category = preset?.category ?? defaultCategory;

  return {
    itemType: preset?.itemType ?? defaultItemType,
    title: '',
    date: preset?.date ?? formatInputDate(selectedWeekDate),
    startTime: '09:00',
    endTime: '10:00',
    category,
    description: '',
    accentColor: categoryColors[category],
    recurrence: 'none',
    recurrenceEndDate: '',
  };
}

function getFormValuesFromEvent(event: CalendarEvent): CalendarEventFormValues {
  return {
    itemType: event.itemType,
    title: event.title,
    date: event.date,
    startTime: event.startTime ?? '09:00',
    endTime: event.endTime ?? '10:00',
    category: event.category,
    description: event.description,
    accentColor: event.accentColor,
    recurrence: event.recurrence,
    recurrenceEndDate: event.recurrenceEndDate ?? '',
  };
}

type UseEventFormOptions = {
  isOpen: boolean;
  editingEvent?: CalendarEvent | null;
  modalPreset?: CalendarModalPreset | null;
  selectedWeekDate: Date;
  onSubmit: (event: CalendarEventDraft) => void;
};

export function useEventForm({
  isOpen,
  editingEvent,
  modalPreset,
  selectedWeekDate,
  onSubmit,
}: UseEventFormOptions) {
  const defaultCategory = useSettingsStore((state) => state.preferences.defaultCategory);
  const defaultItemType = useSettingsStore((state) => state.preferences.defaultItemType);
  const [values, setValues] = useState<CalendarEventFormValues>(() =>
    createInitialFormValues(selectedWeekDate, modalPreset, defaultCategory, defaultItemType),
  );
  const [errors, setErrors] = useState<CalendarEventValidationErrors>({});

  useEffect(() => {
    if (isOpen) {
      setValues(
        editingEvent
          ? getFormValuesFromEvent(editingEvent)
          : createInitialFormValues(selectedWeekDate, modalPreset, defaultCategory, defaultItemType),
      );
      setErrors({});
    }
  }, [defaultCategory, defaultItemType, editingEvent, isOpen, modalPreset, selectedWeekDate]);

  const updateField = <Field extends keyof CalendarEventFormValues>(
    field: Field,
    value: CalendarEventFormValues[Field],
  ) => {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };

  const updateCategory = (category: EventCategory) => {
    setValues((currentValues) => ({
      ...currentValues,
      category,
      accentColor: categoryColors[category],
    }));
    setErrors((currentErrors) => ({ ...currentErrors, category: undefined }));
  };

  const updateItemType = (itemType: CalendarItemType) => {
    setValues((currentValues) => ({
      ...currentValues,
      itemType,
    }));
    setErrors({});
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextValues = {
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
    };
    const nextErrors = validateCalendarEvent(nextValues);

    setErrors(nextErrors);

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    if (nextValues.itemType === 'task') {
      onSubmit({
        itemType: 'task',
        title: nextValues.title,
        date: nextValues.date,
        category: nextValues.category,
        description: nextValues.description,
        accentColor: nextValues.accentColor,
        recurrence: nextValues.recurrence,
        recurrenceEndDate: nextValues.recurrenceEndDate || undefined,
      });
      return;
    }

    onSubmit({
      itemType: 'event',
      title: nextValues.title,
      date: nextValues.date,
      startTime: nextValues.startTime,
      endTime: nextValues.endTime,
      category: nextValues.category,
      description: nextValues.description,
      accentColor: nextValues.accentColor,
      recurrence: nextValues.recurrence,
      recurrenceEndDate: nextValues.recurrenceEndDate || undefined,
    });
  };

  return {
    values,
    errors,
    handleSubmit,
    updateCategory,
    updateField,
    updateItemType,
  };
}
