import { useCallback, useEffect, useMemo, useState } from 'react';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import CalendarContextPanel from '../../features/calendar/components/CalendarContextPanel/CalendarContextPanel';
import DayCalendar from '../../features/calendar/components/DayCalendar/DayCalendar';
import MonthCalendar from '../../features/calendar/components/MonthCalendar/MonthCalendar';
import WeeklyCalendar from '../../features/calendar/components/WeeklyCalendar/WeeklyCalendar';
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import type { CalendarView } from '../../features/calendar/types/calendar.types';
import {
  getAdjacentVisibleDate,
  getCalendarDay,
  getDayLabel,
  getMonthGridDays,
  getMonthLabel,
} from '../../features/calendar/utils/calendarDates';
import { getVisibleCalendarOccurrencesForDays } from '../../features/calendar/utils/calendarRecurrence';
import { getWeekOrbitDescription } from '../../features/calendar/utils/weekOrbitSummary';
import { useResetDemoWorkspace } from '../../features/demo/hooks/useResetDemoWorkspace';
import { useDefaultCalendarModalPreset } from '../../features/settings/hooks/useDefaultCalendarModalPreset';
import { useSettingsStore } from '../../features/settings/store/settings.store';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import Toast from '../../shared/components/Toast/Toast';

export default function CalendarPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const {
    events,
    sourceEvents,
    selectedWeekDate,
    weekStartsOnMonday,
    showWeekends,
    weekLabel,
  } = useCalendarEvents();
  const defaultCalendarView = useSettingsStore((state) => state.preferences.calendar.defaultCalendarView);
  const [calendarView, setCalendarView] = useState<CalendarView>(defaultCalendarView);
  const createDefaultPreset = useDefaultCalendarModalPreset();
  const isAddEventModalOpen = useCalendarStore((state) => state.isAddEventModalOpen);
  const editingEventId = useCalendarStore((state) => state.editingEventId);
  const modalPreset = useCalendarStore((state) => state.modalPreset);
  const openAddEventModal = useCalendarStore((state) => state.openAddEventModal);
  const openEditEventModal = useCalendarStore((state) => state.openEditEventModal);
  const closeAddEventModal = useCalendarStore((state) => state.closeAddEventModal);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPreviousWeek = useCalendarStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useCalendarStore((state) => state.goToNextWeek);
  const goToPreviousMonth = useCalendarStore((state) => state.goToPreviousMonth);
  const goToNextMonth = useCalendarStore((state) => state.goToNextMonth);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const duplicateEvent = useCalendarStore((state) => state.duplicateEvent);
  const copyEventToTomorrow = useCalendarStore((state) => state.copyEventToTomorrow);
  const copyEventToNextWeek = useCalendarStore((state) => state.copyEventToNextWeek);
  const moveCalendarItem = useCalendarStore((state) => state.moveCalendarItem);
  const moveTask = useCalendarStore((state) => state.moveTask);
  const resetDemoWorkspace = useResetDemoWorkspace();
  const deleteEvent = useCalendarStore((state) => state.deleteEvent);
  const toggleEventComplete = useCalendarStore((state) => state.toggleEventComplete);
  const confirmBeforeDeleting = useSettingsStore((state) => state.preferences.calendar.confirmBeforeDeleting);
  const editingEvent = sourceEvents.find((event) => event.id === editingEventId) ?? null;
  const dayEvents = useMemo(
    () => getVisibleCalendarOccurrencesForDays(sourceEvents, [getCalendarDay(selectedWeekDate)]),
    [selectedWeekDate, sourceEvents],
  );
  const monthDays = useMemo(
    () => getMonthGridDays(selectedWeekDate, weekStartsOnMonday, showWeekends),
    [selectedWeekDate, weekStartsOnMonday, showWeekends],
  );
  const monthEvents = useMemo(
    () => getVisibleCalendarOccurrencesForDays(sourceEvents, monthDays),
    [monthDays, sourceEvents],
  );
  const visibleCalendarEvents =
    calendarView === 'day' ? dayEvents : calendarView === 'month' ? monthEvents : events;
  const visibleCompletedEventCount = visibleCalendarEvents.filter((event) => event.completed).length;
  const calendarLabel =
    calendarView === 'day'
      ? getDayLabel(selectedWeekDate)
      : calendarView === 'month'
        ? getMonthLabel(selectedWeekDate)
        : weekLabel;
  const navigationLabels = {
    day: ['Previous day', 'Next day'],
    week: ['Previous week', 'Next week'],
    month: ['Previous month', 'Next month'],
  } satisfies Record<CalendarView, [string, string]>;

  useEffect(() => {
    setCalendarView(defaultCalendarView);
  }, [defaultCalendarView]);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const handleDuplicate = useCallback((id: string) => {
    duplicateEvent(id);
    setToastMessage('Copied item');
  }, [duplicateEvent]);

  const handleCopyToTomorrow = useCallback((id: string) => {
    copyEventToTomorrow(id);
    setToastMessage('Copied to tomorrow');
  }, [copyEventToTomorrow]);

  const handleCopyToNextWeek = useCallback((id: string) => {
    copyEventToNextWeek(id);
    setToastMessage('Copied to next week');
  }, [copyEventToNextWeek]);

  const handleResetDemoData = useCallback(() => {
    resetDemoWorkspace();
    setToastMessage('Demo week restored');
  }, [resetDemoWorkspace]);

  const handlePrevious = useCallback(() => {
    if (calendarView === 'day') {
      setSelectedDate(getAdjacentVisibleDate(selectedWeekDate, -1, showWeekends));
      return;
    }

    if (calendarView === 'month') {
      goToPreviousMonth();
      return;
    }

    goToPreviousWeek();
  }, [calendarView, goToPreviousMonth, goToPreviousWeek, selectedWeekDate, setSelectedDate, showWeekends]);

  const handleNext = useCallback(() => {
    if (calendarView === 'day') {
      setSelectedDate(getAdjacentVisibleDate(selectedWeekDate, 1, showWeekends));
      return;
    }

    if (calendarView === 'month') {
      goToNextMonth();
      return;
    }

    goToNextWeek();
  }, [calendarView, goToNextMonth, goToNextWeek, selectedWeekDate, setSelectedDate, showWeekends]);

  const handleDelete = useCallback((id: string) => {
    if (confirmBeforeDeleting && !window.confirm('Delete this calendar item?')) {
      return;
    }

    deleteEvent(id);
  }, [confirmBeforeDeleting, deleteEvent]);

  return (
    <AppLayout
      totalEvents={visibleCalendarEvents.length}
      completedEvents={visibleCompletedEventCount}
      weekLabel={calendarLabel}
      topbarDescription={getWeekOrbitDescription(visibleCalendarEvents)}
      previousLabel={navigationLabels[calendarView][0]}
      nextLabel={navigationLabels[calendarView][1]}
      onGoToToday={goToToday}
      onGoToPreviousWeek={handlePrevious}
      onGoToNextWeek={handleNext}
      onCreateEvent={() => openAddEventModal(createDefaultPreset())}
      onResetDemoData={handleResetDemoData}
      contextPanel={(
        <CalendarContextPanel
          sourceEvents={sourceEvents}
          weekEvents={events}
          weekStartsOnMonday={weekStartsOnMonday}
          onToggleComplete={toggleEventComplete}
        />
      )}
    >
      {calendarView === 'day' ? (
        <DayCalendar
          events={dayEvents}
          selectedDate={selectedWeekDate}
          calendarView={calendarView}
          onChangeView={setCalendarView}
          onCreateItem={openAddEventModal}
          onEdit={openEditEventModal}
          onDuplicate={handleDuplicate}
          onCopyToTomorrow={handleCopyToTomorrow}
          onCopyToNextWeek={handleCopyToNextWeek}
          onMoveCalendarItem={moveCalendarItem}
          onMoveTask={moveTask}
          onDelete={handleDelete}
          onToggleComplete={toggleEventComplete}
        />
      ) : null}
      {calendarView === 'week' ? (
        <WeeklyCalendar
          events={events}
          selectedWeekDate={selectedWeekDate}
          weekStartsOnMonday={weekStartsOnMonday}
          showWeekends={showWeekends}
          calendarView={calendarView}
          onChangeView={setCalendarView}
          onCreateItem={openAddEventModal}
          onEdit={openEditEventModal}
          onDuplicate={handleDuplicate}
          onCopyToTomorrow={handleCopyToTomorrow}
          onCopyToNextWeek={handleCopyToNextWeek}
          onMoveCalendarItem={moveCalendarItem}
          onMoveTask={moveTask}
          onDelete={handleDelete}
          onToggleComplete={toggleEventComplete}
        />
      ) : null}
      {calendarView === 'month' ? (
        <MonthCalendar
          events={monthEvents}
          selectedDate={selectedWeekDate}
          weekStartsOnMonday={weekStartsOnMonday}
          showWeekends={showWeekends}
          calendarView={calendarView}
          onChangeView={setCalendarView}
          onCreateItem={openAddEventModal}
          onEdit={openEditEventModal}
          onDelete={handleDelete}
          onToggleComplete={toggleEventComplete}
        />
      ) : null}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        selectedWeekDate={selectedWeekDate}
        modalPreset={modalPreset}
        editingEvent={editingEvent}
        onClose={closeAddEventModal}
        onAddEvent={addEvent}
        onUpdateEvent={updateEvent}
      />
      <Toast message={toastMessage} />
    </AppLayout>
  );
}
