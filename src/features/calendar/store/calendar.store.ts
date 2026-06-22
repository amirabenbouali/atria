import { addWeeks, startOfWeek } from 'date-fns';
import { create } from 'zustand';
import {
  readStoredCalendarEvents,
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

type CalendarState = {
  events: CalendarEvent[];
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
  resetDemoData: () => void;
  deleteEvent: (id: string) => void;
  toggleEventComplete: (id: string) => void;
};

function persistEvents(events: CalendarEvent[]) {
  writeStoredCalendarEvents(events);
  return events;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: readStoredCalendarEvents(),
  selectedWeekDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
  isAddEventModalOpen: false,
  editingEventId: null,
  modalPreset: null,
  openAddEventModal: (preset) =>
    set({ isAddEventModalOpen: true, editingEventId: null, modalPreset: preset ?? null }),
  openEditEventModal: (id) => set({ isAddEventModalOpen: true, editingEventId: id, modalPreset: null }),
  closeAddEventModal: () => set({ isAddEventModalOpen: false, editingEventId: null, modalPreset: null }),
  goToToday: () => set({ selectedWeekDate: startOfWeek(new Date(), { weekStartsOn: 1 }) }),
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
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ]),
        isAddEventModalOpen: false,
        editingEventId: null,
        modalPreset: null,
      };
    }),
  updateEvent: (id, eventDraft) =>
    set((state) => ({
      events: persistEvents(
        state.events.map((event) =>
          event.id === id
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
    })),
  duplicateEvent: (id) =>
    set((state) => {
      const sourceEvent = state.events.find((event) => event.id === id);

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
      const sourceEvent = state.events.find((event) => event.id === id);

      if (!sourceEvent) {
        return state;
      }

      const date = getRelativeDate(sourceEvent.date, 'tomorrow');
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
      const sourceEvent = state.events.find((event) => event.id === id);

      if (!sourceEvent) {
        return state;
      }

      const date = getRelativeDate(sourceEvent.date, 'nextWeek');
      const duplicate = copyCalendarItem(sourceEvent, {
        date,
        order: sourceEvent.itemType === 'task' ? getNextTaskOrder(state.events, date) : undefined,
      });

      return {
        events: persistEvents([...state.events, duplicate]),
      };
    }),
  moveCalendarItem: (id, targetDate, targetTaskId) =>
    set((state) => ({
      events: persistEvents(moveCalendarItemInList(state.events, id, targetDate, targetTaskId)),
    })),
  moveTask: (id, direction) =>
    set((state) => ({
      events: persistEvents(reorderTaskWithinDate(state.events, id, direction)),
    })),
  resetDemoData: () =>
    set({
      events: persistEvents(createDemoCalendarEvents()),
      isAddEventModalOpen: false,
      editingEventId: null,
      modalPreset: null,
    }),
  deleteEvent: (id) =>
    set((state) => ({
      events: persistEvents(state.events.filter((event) => event.id !== id)),
      editingEventId: state.editingEventId === id ? null : state.editingEventId,
      isAddEventModalOpen: state.editingEventId === id ? false : state.isAddEventModalOpen,
    })),
  toggleEventComplete: (id) =>
    set((state) => ({
      events: persistEvents(
        state.events.map((event) =>
          event.id === id
            ? { ...event, completed: !event.completed, updatedAt: new Date().toISOString() }
            : event,
        ),
      ),
    })),
}));
