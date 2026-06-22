import { useEffect, useMemo, useState } from 'react';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import { useResetDemoWorkspace } from '../../features/demo/hooks/useResetDemoWorkspace';
import { useGoalsStore } from '../../features/goals/store/goals.store';
import { useProjectsStore } from '../../features/projects/store/projects.store';
import type { GoalStatus } from '../../features/goals/types/goals.types';
import { getGoalsByStatus, type GoalFilter } from '../../features/goals/utils/goalFilters';
import { getGoalProgress, getLinkedTasksForGoal } from '../../features/goals/utils/goalProgress';
import { useDefaultCalendarModalPreset } from '../../features/settings/hooks/useDefaultCalendarModalPreset';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import Toast from '../../shared/components/Toast/Toast';
import GlassPanel from '../../shared/ui/GlassPanel/GlassPanel';
import GoalCard from './components/GoalCard';
import GoalModal from './components/GoalModal';
import styles from './GoalsPage.module.css';

const goalFilters: Array<{ label: string; value: GoalFilter }> = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' },
  { label: 'All', value: 'all' },
];

export default function GoalsPage() {
  const [filter, setFilter] = useState<GoalFilter>('active');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const {
    events: visibleCalendarItems,
    sourceEvents,
    selectedWeekDate,
    weekLabel,
    totalEventCount,
    completedEventCount,
  } = useCalendarEvents();
  const createDefaultPreset = useDefaultCalendarModalPreset();
  const goals = useGoalsStore((state) => state.goals);
  const projects = useProjectsStore((state) => state.projects);
  const isGoalModalOpen = useGoalsStore((state) => state.isGoalModalOpen);
  const editingGoalId = useGoalsStore((state) => state.editingGoalId);
  const openGoalModal = useGoalsStore((state) => state.openGoalModal);
  const openEditGoalModal = useGoalsStore((state) => state.openEditGoalModal);
  const closeGoalModal = useGoalsStore((state) => state.closeGoalModal);
  const addGoal = useGoalsStore((state) => state.addGoal);
  const updateGoal = useGoalsStore((state) => state.updateGoal);
  const setGoalStatus = useGoalsStore((state) => state.setGoalStatus);
  const deleteGoal = useGoalsStore((state) => state.deleteGoal);
  const isAddEventModalOpen = useCalendarStore((state) => state.isAddEventModalOpen);
  const editingEventId = useCalendarStore((state) => state.editingEventId);
  const modalPreset = useCalendarStore((state) => state.modalPreset);
  const openAddEventModal = useCalendarStore((state) => state.openAddEventModal);
  const openEditEventModal = useCalendarStore((state) => state.openEditEventModal);
  const closeAddEventModal = useCalendarStore((state) => state.closeAddEventModal);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const toggleEventComplete = useCalendarStore((state) => state.toggleEventComplete);
  const resetDemoWorkspace = useResetDemoWorkspace();
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPreviousWeek = useCalendarStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useCalendarStore((state) => state.goToNextWeek);
  const visibleGoals = useMemo(() => getGoalsByStatus(goals, filter), [filter, goals]);
  const linkedTasksByGoalId = useMemo(
    () =>
      Object.fromEntries(
        goals.map((goal) => [
          goal.id,
          getLinkedTasksForGoal(sourceEvents, visibleCalendarItems, projects, goal.id),
        ]),
      ),
    [goals, projects, sourceEvents, visibleCalendarItems],
  );
  const goalProgressById = useMemo(
    () =>
      Object.fromEntries(
        goals.map((goal) => [
          goal.id,
          getGoalProgress(linkedTasksByGoalId[goal.id] ?? []),
        ]),
      ),
    [goals, linkedTasksByGoalId],
  );
  const activeGoalCount = goals.filter((goal) => goal.status === 'active').length;
  const completedGoalCount = goals.filter((goal) => goal.status === 'completed').length;
  const editingGoal = goals.find((goal) => goal.id === editingGoalId) ?? null;
  const editingEvent = sourceEvents.find((event) => event.id === editingEventId) ?? null;

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const handleSetGoalStatus = (id: string, status: GoalStatus) => {
    if (status === 'archived' && !window.confirm('Archive this goal? You can still view it from the Archived filter.')) {
      return;
    }

    setGoalStatus(id, status);
    setToastMessage(status === 'completed' ? 'Goal completed' : status === 'archived' ? 'Goal archived' : 'Goal reopened');
  };

  const handleDeleteGoal = (id: string) => {
    if (!window.confirm('Delete this archived goal permanently? This cannot be undone.')) {
      return;
    }

    deleteGoal(id);
    setToastMessage('Goal deleted');
  };

  return (
    <AppLayout
      totalEvents={totalEventCount}
      completedEvents={completedEventCount}
      weekLabel={weekLabel}
      topbarEyebrow="Long Range"
      topbarTitle="Goals"
      showWeekControls={false}
      onGoToToday={goToToday}
      onGoToPreviousWeek={goToPreviousWeek}
      onGoToNextWeek={goToNextWeek}
      onCreateEvent={() => openAddEventModal(createDefaultPreset())}
      onResetDemoData={() => {
        resetDemoWorkspace();
        setToastMessage('Demo data restored');
      }}
    >
      <GlassPanel className={styles.goalsShell}>
        <section className={styles.heroPanel}>
          <p className="eyebrow">Strategic Layer</p>
          <h1>Goals</h1>
          <span>{activeGoalCount} active objectives · {completedGoalCount} completed</span>
          <button type="button" onClick={openGoalModal}>
            + New Goal
          </button>
        </section>

        <div className={styles.filterBar} aria-label="Goal filters">
          {goalFilters.map((option) => (
            <button
              className={filter === option.value ? styles.activeFilter : styles.filterButton}
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {visibleGoals.length > 0 ? (
          <div className={styles.goalGrid}>
            {visibleGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                progress={goalProgressById[goal.id] ?? { linkedTaskCount: 0, completedLinkedTaskCount: 0, percentage: 0 }}
                linkedTasks={linkedTasksByGoalId[goal.id] ?? []}
                linkedProjects={projects.filter((project) => project.goalId === goal.id)}
                isExpanded={expandedGoalId === goal.id}
                onSelect={(id) => setExpandedGoalId((currentId) => (currentId === id ? null : id))}
                onEdit={openEditGoalModal}
                onEditTask={openEditEventModal}
                onToggleTaskComplete={toggleEventComplete}
                onSetStatus={handleSetGoalStatus}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className="eyebrow">No Signal Yet</p>
            <h2>No goals in this lane.</h2>
            <span>Create a long-term objective and let time blocks orbit around it.</span>
          </div>
        )}
      </GlassPanel>

      <GoalModal
        isOpen={isGoalModalOpen}
        editingGoal={editingGoal}
        onClose={closeGoalModal}
        onAddGoal={addGoal}
        onUpdateGoal={updateGoal}
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
