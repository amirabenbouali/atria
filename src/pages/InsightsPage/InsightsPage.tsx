import { useCallback, useEffect, useState } from 'react';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import { useResetDemoWorkspace } from '../../features/demo/hooks/useResetDemoWorkspace';
import { useDefaultCalendarModalPreset } from '../../features/settings/hooks/useDefaultCalendarModalPreset';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import Toast from '../../shared/components/Toast/Toast';
import GlassPanel from '../../shared/ui/GlassPanel/GlassPanel';
import CategoryBalance from './components/CategoryBalance';
import DailyRhythm from './components/DailyRhythm';
import InsightsHero from './components/InsightsHero';
import ProjectsInsight from './components/ProjectsInsight';
import RoutineConsistency from './components/RoutineConsistency';
import { useInsightsDashboard } from './hooks/useInsightsDashboard';
import styles from './InsightsPage.module.css';

export default function InsightsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const {
    sourceEvents,
    selectedWeekDate,
    weekLabel,
    totalEventCount,
    completedEventCount,
    weeklyMetrics,
    categoryInsights,
    dailyRhythm,
    routineInsights,
    projectInsights,
  } = useInsightsDashboard();
  const createDefaultPreset = useDefaultCalendarModalPreset();
  const hasInsightData =
    weeklyMetrics.totalItems > 0 ||
    projectInsights.activeProjects + projectInsights.completedProjects + projectInsights.archivedProjects > 0;
  const isAddEventModalOpen = useCalendarStore((state) => state.isAddEventModalOpen);
  const editingEventId = useCalendarStore((state) => state.editingEventId);
  const modalPreset = useCalendarStore((state) => state.modalPreset);
  const openAddEventModal = useCalendarStore((state) => state.openAddEventModal);
  const closeAddEventModal = useCalendarStore((state) => state.closeAddEventModal);
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPreviousWeek = useCalendarStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useCalendarStore((state) => state.goToNextWeek);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const resetDemoWorkspace = useResetDemoWorkspace();
  const editingEvent = sourceEvents.find((event) => event.id === editingEventId) ?? null;

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const handleResetDemoData = useCallback(() => {
    resetDemoWorkspace();
    setToastMessage('Demo week restored');
  }, [resetDemoWorkspace]);

  return (
    <AppLayout
      totalEvents={totalEventCount}
      completedEvents={completedEventCount}
      weekLabel={weekLabel}
      topbarEyebrow="Insight Layer"
      topbarTitle="Weekly Intelligence"
      onGoToToday={goToToday}
      onGoToPreviousWeek={goToPreviousWeek}
      onGoToNextWeek={goToNextWeek}
      onCreateEvent={() => openAddEventModal(createDefaultPreset())}
      onResetDemoData={handleResetDemoData}
    >
      <GlassPanel className={styles.insightsShell}>
        <InsightsHero weekLabel={weekLabel} metrics={weeklyMetrics} />

        {!hasInsightData ? (
          <div className={styles.emptyPanel}>
            <span>No planning signal yet</span>
            <strong>Reset demo data or schedule a task to light up Insights.</strong>
          </div>
        ) : null}

        <div className={styles.dashboardGrid}>
          <div className={styles.primaryColumn}>
            <DailyRhythm days={dailyRhythm} />
            <RoutineConsistency routines={routineInsights} />
            <ProjectsInsight insights={projectInsights} />
          </div>
          <aside className={styles.sideColumn}>
            <CategoryBalance categories={categoryInsights} />
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
