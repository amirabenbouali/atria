import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import { useDefaultCalendarModalPreset } from '../../features/settings/hooks/useDefaultCalendarModalPreset';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import Toast from '../../shared/components/Toast/Toast';
import GlassPanel from '../../shared/ui/GlassPanel/GlassPanel';
import CategoryBreakdown from './components/CategoryBreakdown';
import DailyFocusCard from './components/DailyFocusCard';
import TodayHeroCard from './components/TodayHeroCard';
import TodayTasks from './components/TodayTasks';
import TodayTimeline from './components/TodayTimeline';
import { useTodayDashboard } from './hooks/useTodayDashboard';
import styles from './TodayPage.module.css';

export default function TodayPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { sourceEvents, selectedWeekDate, weekLabel, totalEventCount, completedEventCount } = useCalendarEvents();
  const {
    todayIsoDate,
    todayLabel,
    scheduledEvents,
    flexibleTasks,
    categoryProgress,
    completedCount,
    totalCount,
    progress,
    dailyFocus,
  } = useTodayDashboard();
  const createDefaultPreset = useDefaultCalendarModalPreset();
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
  const resetDemoData = useCalendarStore((state) => state.resetDemoData);
  const toggleEventComplete = useCalendarStore((state) => state.toggleEventComplete);
  const updateDailyFocus = useCalendarStore((state) => state.updateDailyFocus);
  const editingEvent = sourceEvents.find((event) => event.id === editingEventId) ?? null;

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const handleResetDemoData = useCallback(() => {
    resetDemoData();
    setToastMessage('Demo week restored');
  }, [resetDemoData]);

  const handleSaveFocus = useCallback((focus: string) => {
    updateDailyFocus(todayIsoDate, focus);
    setToastMessage('Daily focus saved');
  }, [todayIsoDate, updateDailyFocus]);

  return (
    <AppLayout
      totalEvents={totalEventCount}
      completedEvents={completedEventCount}
      weekLabel={weekLabel}
      topbarEyebrow="Daily Command"
      topbarTitle={`Today · ${format(new Date(), 'EEEE')}`}
      showWeekControls={false}
      onGoToToday={goToToday}
      onGoToPreviousWeek={goToPreviousWeek}
      onGoToNextWeek={goToNextWeek}
      onCreateEvent={() => openAddEventModal(createDefaultPreset({ date: todayIsoDate }))}
      onResetDemoData={handleResetDemoData}
    >
      <GlassPanel className={styles.todayShell}>
        <TodayHeroCard
          todayLabel={todayLabel}
          progress={progress}
          completedCount={completedCount}
          totalCount={totalCount}
        />

        <div className={styles.quickActions}>
          <button type="button" onClick={() => openAddEventModal({ itemType: 'event', date: todayIsoDate })}>
            + Event
          </button>
          <button type="button" onClick={() => openAddEventModal({ itemType: 'task', date: todayIsoDate })}>
            + Task
          </button>
        </div>

        <div className={styles.dashboardGrid}>
          <div className={styles.primaryColumn}>
            <TodayTimeline
              events={scheduledEvents}
              onEdit={openEditEventModal}
              onToggleComplete={toggleEventComplete}
            />
            <TodayTasks
              tasks={flexibleTasks}
              onEdit={openEditEventModal}
              onToggleComplete={toggleEventComplete}
            />
          </div>

          <aside className={styles.sideColumn}>
            <DailyFocusCard focus={dailyFocus} onSave={handleSaveFocus} />
            <CategoryBreakdown categories={categoryProgress} />
          </aside>
        </div>
      </GlassPanel>

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
