import { useCallback, useEffect, useState } from 'react';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import WeeklyCalendar from '../../features/calendar/components/WeeklyCalendar/WeeklyCalendar';
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import Toast from '../../shared/components/Toast/Toast';

export default function CalendarPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { events, selectedWeekDate, weekLabel, totalEventCount, completedEventCount } = useCalendarEvents();
  const isAddEventModalOpen = useCalendarStore((state) => state.isAddEventModalOpen);
  const editingEventId = useCalendarStore((state) => state.editingEventId);
  const modalPreset = useCalendarStore((state) => state.modalPreset);
  const openAddEventModal = useCalendarStore((state) => state.openAddEventModal);
  const openEditEventModal = useCalendarStore((state) => state.openEditEventModal);
  const closeAddEventModal = useCalendarStore((state) => state.closeAddEventModal);
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPreviousWeek = useCalendarStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useCalendarStore((state) => state.goToNextWeek);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const duplicateEvent = useCalendarStore((state) => state.duplicateEvent);
  const copyEventToTomorrow = useCalendarStore((state) => state.copyEventToTomorrow);
  const copyEventToNextWeek = useCalendarStore((state) => state.copyEventToNextWeek);
  const moveCalendarItem = useCalendarStore((state) => state.moveCalendarItem);
  const moveTask = useCalendarStore((state) => state.moveTask);
  const resetDemoData = useCalendarStore((state) => state.resetDemoData);
  const deleteEvent = useCalendarStore((state) => state.deleteEvent);
  const toggleEventComplete = useCalendarStore((state) => state.toggleEventComplete);
  const editingEvent = events.find((event) => event.id === editingEventId) ?? null;

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
    resetDemoData();
    setToastMessage('Demo week restored');
  }, [resetDemoData]);

  return (
    <AppLayout
      totalEvents={totalEventCount}
      completedEvents={completedEventCount}
      weekLabel={weekLabel}
      onGoToToday={goToToday}
      onGoToPreviousWeek={goToPreviousWeek}
      onGoToNextWeek={goToNextWeek}
      onCreateEvent={openAddEventModal}
      onResetDemoData={handleResetDemoData}
    >
      <WeeklyCalendar
        events={events}
        selectedWeekDate={selectedWeekDate}
        onCreateItem={openAddEventModal}
        onEdit={openEditEventModal}
        onDuplicate={handleDuplicate}
        onCopyToTomorrow={handleCopyToTomorrow}
        onCopyToNextWeek={handleCopyToNextWeek}
        onMoveCalendarItem={moveCalendarItem}
        onMoveTask={moveTask}
        onDelete={deleteEvent}
        onToggleComplete={toggleEventComplete}
      />
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
