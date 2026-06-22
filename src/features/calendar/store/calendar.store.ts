import { addWeeks } from 'date-fns';
import { create } from 'zustand';
import {
  readStoredDailyFocus,
  readStoredCalendarEvents,
  writeStoredDailyFocus,
  writeStoredCalendarEvents,
} from '../services/calendarStorage.service';
import type { CalendarEvent, CalendarEventDraft, CalendarModalPreset } from '../types/calendar.types';
import { createId } from '../../../shared/utils/id';
import {
  copyCalendarItem,
  getNextTaskOrder,
  getRelativeDate,
  moveCalendarItem as moveCalendarItemInList,
  reorderTaskWithinDate,
} from '../utils/calendarItems';
import { createDemoCalendarEvents } from '../utils/demoCalendarData';
import { parseOccurrenceId } from '../utils/calendarRecurrence';

type CalendarState = {
  events: CalendarEvent[];
  dailyFocusByDate: Record<string, string>;
  selectedWeekDate: Date;
  isAddEventModalOpen: boolean;
  editingEventId: string | null;
  modalPreset: CalendarModalPreset | null;
  openAddEventModal: (preset?: CalendarModalPreset) => void;
  openEditEventModal: (id: string) => void;
  closeAddEventModal: () => void;
  goToToday: () => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  addEvent: (event: CalendarEventDraft) => void;
  updateEvent: (id: string, event: CalendarEventDraft) => void;
  duplicateEvent: (id: string) => void;
  copyEventToTomorrow: (id: string) => void;
  copyEventToNextWeek: (id: string) => void;
  moveCalendarItem: (id: string, targetDate: string, targetTaskId?: string) => void;
  moveTask: (id: string, direction: 'up' | 'down') => void;
  updateDailyFocus: (date: string, focus: string) => void;
  resetDemoData: () => void;
  clearCalendarData: () => void;
  clearDailyFocusData: () => void;
  deleteEvent: (id: string) => void;
  toggleEventComplete: (id: string) => void;
};

function persistEvents(events: CalendarEvent[]) {
  writeStoredCalendarEvents(events);
  return events;
}

function persistDailyFocus(dailyFocusByDate: Record<string, string>) {
  writeStoredDailyFocus(dailyFocusByDate);
  return dailyFocusByDate;
}

function getSourceActionTarget(id: string) {
  const occurrence = parseOccurrenceId(id);
  return occurrence.isOccurrence ? occurrence : { sourceId: id, occurrenceDate: undefined };
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: readStoredCalendarEvents(),
  dailyFocusByDate: readStoredDailyFocus(),
  selectedWeekDate: new Date(),
  isAddEventModalOpen: false,
  editingEventId: null,
  modalPreset: null,
  openAddEventModal: (preset) =>
    set({ isAddEventModalOpen: true, editingEventId: null, modalPreset: preset ?? null }),
  openEditEventModal: (id) =>
    set({ isAddEventModalOpen: true, editingEventId: getSourceActionTarget(id).sourceId, modalPreset: null }),
  closeAddEventModal: () => set({ isAddEventModalOpen: false, editingEventId: null, modalPreset: null }),
  goToToday: () => set({ selectedWeekDate: new Date() }),
  goToPreviousWeek: () =>
    set((state) => ({ selectedWeekDate: addWeeks(state.selectedWeekDate, -1) })),
  goToNextWeek: () =>
    set((state) => ({ selectedWeekDate: addWeeks(state.selectedWeekDate, 1) })),
  addEvent: (eventDraft) =>
    set((state) => {
      const timestamp = new Date().toISOString();

      const eventWithOrder =
        eventDraft.itemType === 'task'
          ? {
              ...eventDraft,
              order: getNextTaskOrder(state.events, eventDraft.date),
            }
          : eventDraft;

      return {
        events: persistEvents([
          ...state.events,
          {
            ...eventWithOrder,
            id: createId(),
            completed: false,
            recurringCompletions: {},
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ]),
        isAddEventModalOpen: false,
        editingEventId: null,
        modalPreset: null,
      };
    }),
  updateEvent: (id, eventDraft) => {
    const target = getSourceActionTarget(id);
    // MVP limitation: editing a recurring occurrence updates the whole source series.
    return set((state) => ({
      events: persistEvents(
        state.events.map((event) =>
          event.id === target.sourceId
            ? {
                ...event,
                ...eventDraft,
                updatedAt: new Date().toISOString(),
              } as CalendarEvent
            : event,
        ),
      ),
      isAddEventModalOpen: false,
      editingEventId: null,
      modalPreset: null,
    }));
  },
  duplicateEvent: (id) =>
    set((state) => {
      const target = getSourceActionTarget(id);
      const sourceEvent = state.events.find((event) => event.id === target.sourceId);

      if (!sourceEvent) {
        return state;
      }

      const duplicate = copyCalendarItem(sourceEvent, {
        order:
          sourceEvent.itemType === 'task'
            ? getNextTaskOrder(state.events, sourceEvent.date)
            : undefined,
        suffix: 'copy',
      });

      return {
        events: persistEvents([...state.events, duplicate]),
      };
    }),
  copyEventToTomorrow: (id) =>
    set((state) => {
      const target = getSourceActionTarget(id);
      const sourceEvent = state.events.find((event) => event.id === target.sourceId);

      if (!sourceEvent) {
        return state;
      }

      const date = getRelativeDate(target.occurrenceDate ?? sourceEvent.date, 'tomorrow');
      const duplicate = copyCalendarItem(sourceEvent, {
        date,
        order: sourceEvent.itemType === 'task' ? getNextTaskOrder(state.events, date) : undefined,
      });

      return {
        events: persistEvents([...state.events, duplicate]),
      };
    }),
  copyEventToNextWeek: (id) =>
    set((state) => {
      const target = getSourceActionTarget(id);
      const sourceEvent = state.events.find((event) => event.id === target.sourceId);

      if (!sourceEvent) {
        return state;
      }

      const date = getRelativeDate(target.occurrenceDate ?? sourceEvent.date, 'nextWeek');
      const duplicate = copyCalendarItem(sourceEvent, {
        date,
        order: sourceEvent.itemType === 'task' ? getNextTaskOrder(state.events, date) : undefined,
      });

      return {
        events: persistEvents([...state.events, duplicate]),
      };
    }),
  moveCalendarItem: (id, targetDate, targetTaskId) => {
    const target = getSourceActionTarget(id);
    return set((state) => ({
      events: persistEvents(moveCalendarItemInList(state.events, target.sourceId, targetDate, targetTaskId)),
    }));
  },
  moveTask: (id, direction) =>
    set((state) => ({
      events: persistEvents(reorderTaskWithinDate(state.events, id, direction)),
    })),
  updateDailyFocus: (date, focus) =>
    set((state) => ({
      dailyFocusByDate: persistDailyFocus({
        ...state.dailyFocusByDate,
        [date]: focus,
      }),
    })),
  resetDemoData: () =>
    set({
      events: persistEvents(createDemoCalendarEvents()),
      isAddEventModalOpen: false,
      editingEventId: null,
      modalPreset: null,
    }),
  clearCalendarData: () =>
    set({
      events: persistEvents([]),
      isAddEventModalOpen: false,
      editingEventId: null,
      modalPreset: null,
    }),
  clearDailyFocusData: () =>
    set({
      dailyFocusByDate: persistDailyFocus({}),
    }),
  deleteEvent: (id) => {
    const target = getSourceActionTarget(id);
    // MVP limitation: deleting a recurring occurrence deletes the whole source series.
    return set((state) => ({
      events: persistEvents(state.events.filter((event) => event.id !== target.sourceId)),
      editingEventId: state.editingEventId === target.sourceId ? null : state.editingEventId,
      isAddEventModalOpen: state.editingEventId === target.sourceId ? false : state.isAddEventModalOpen,
    }));
  },
  toggleEventComplete: (id) =>
    set((state) => {
      const target = getSourceActionTarget(id);
      const timestamp = new Date().toISOString();

      return {
        events: persistEvents(
          state.events.map((event) => {
            if (event.id !== target.sourceId) {
              return event;
            }

            if (event.recurrence !== 'none' && target.occurrenceDate) {
              return {
                ...event,
                recurringCompletions: {
                  ...event.recurringCompletions,
                  [target.occurrenceDate]: !(event.recurringCompletions[target.occurrenceDate] ?? false),
                },
                updatedAt: timestamp,
              };
            }

            return { ...event, completed: !event.completed, updatedAt: timestamp };
          }),
        ),
      };
    }),
}));
