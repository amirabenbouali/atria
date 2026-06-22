import { useEffect, useState } from 'react';
import { Folder, Target } from 'lucide-react';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import { useResetDemoWorkspace } from '../../features/demo/hooks/useResetDemoWorkspace';
import { useGoalsStore } from '../../features/goals/store/goals.store';
import { useProjectsStore } from '../../features/projects/store/projects.store';
import { useDefaultCalendarModalPreset } from '../../features/settings/hooks/useDefaultCalendarModalPreset';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import SelectControl from '../../shared/components/SelectControl/SelectControl';
import Toast from '../../shared/components/Toast/Toast';
import GlassPanel from '../../shared/ui/GlassPanel/GlassPanel';
import TaskDateGroup from './components/TaskDateGroup';
import { useTasksPageData } from './hooks/useTasksPageData';
import type { TaskFilter, TaskGoalFilter, TaskProjectFilter } from './utils/tasksPageData';
import styles from './TasksPage.module.css';

const taskFilters: Array<{ label: string; value: TaskFilter }> = [
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
  { label: 'All', value: 'all' },
];

export default function TasksPage() {
  const [filter, setFilter] = useState<TaskFilter>('today');
  const [goalFilter, setGoalFilter] = useState<TaskGoalFilter>('all');
  const [projectFilter, setProjectFilter] = useState<TaskProjectFilter>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const goals = useGoalsStore((state) => state.goals);
  const projects = useProjectsStore((state) => state.projects);
  const goalTitleById = Object.fromEntries(goals.map((goal) => [goal.id, goal.title]));
  const projectTitleById = Object.fromEntries(projects.map((project) => [project.id, project.title]));
  const projectStatusById = Object.fromEntries(projects.map((project) => [project.id, project.status]));
  const {
    sourceEvents,
    selectedWeekDate,
    weekLabel,
    totalEventCount,
    completedEventCount,
    tasks,
    taskGroups,
  } = useTasksPageData(filter, goalFilter, projectFilter);
  const createDefaultPreset = useDefaultCalendarModalPreset();
  const isAddEventModalOpen = useCalendarStore((state) => state.isAddEventModalOpen);
  const editingEventId = useCalendarStore((state) => state.editingEventId);
  const modalPreset = useCalendarStore((state) => state.modalPreset);
  const openAddEventModal = useCalendarStore((state) => state.openAddEventModal);
  const openEditEventModal = useCalendarStore((state) => state.openEditEventModal);
  const closeAddEventModal = useCalendarStore((state) => state.closeAddEventModal);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const deleteEvent = useCalendarStore((state) => state.deleteEvent);
  const toggleEventComplete = useCalendarStore((state) => state.toggleEventComplete);
  const resetDemoWorkspace = useResetDemoWorkspace();
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPreviousWeek = useCalendarStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useCalendarStore((state) => state.goToNextWeek);
  const editingEvent = sourceEvents.find((event) => event.id === editingEventId) ?? null;

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this task? Recurring tasks are deleted as a full series.')) {
      return;
    }

    deleteEvent(id);
    setToastMessage('Task deleted');
  };

  return (
    <AppLayout
      totalEvents={totalEventCount}
      completedEvents={completedEventCount}
      weekLabel={weekLabel}
      topbarEyebrow="Task Field"
      topbarTitle="Tasks"
      showWeekControls={false}
      onGoToToday={goToToday}
      onGoToPreviousWeek={goToPreviousWeek}
      onGoToNextWeek={goToNextWeek}
      onCreateEvent={() => openAddEventModal(createDefaultPreset({ itemType: 'task' }))}
      onResetDemoData={() => {
        resetDemoWorkspace();
        setToastMessage('Demo data restored');
      }}
    >
      <GlassPanel className={styles.tasksShell}>
        <section className={styles.heroPanel}>
          <p className="eyebrow">Flexible Planning</p>
          <h1>Tasks</h1>
          <span>{tasks.length} task signals in view</span>
          <button type="button" onClick={() => openAddEventModal(createDefaultPreset({ itemType: 'task' }))}>
            + New Task
          </button>
        </section>

        <div className={styles.filterBar} aria-label="Task filters">
          {taskFilters.map((option) => (
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

        <div className={styles.linkFilters}>
          <label className={styles.goalFilter}>
            <span>Goal link</span>
            <SelectControl icon={Target} value={goalFilter} onChange={(event) => setGoalFilter(event.target.value)}>
              <option value="all">All goals</option>
              <option value="none">No goal</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>{goal.title}</option>
              ))}
            </SelectControl>
          </label>

          <label className={styles.goalFilter}>
            <span>Project link</span>
            <SelectControl icon={Folder} value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
              <option value="all">All projects</option>
              <option value="none">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </SelectControl>
          </label>
        </div>

        {taskGroups.length > 0 ? (
          <div className={styles.groupStack}>
            {taskGroups.map((group) => (
              <TaskDateGroup
                key={group.date}
                group={group}
                goalTitleById={goalTitleById}
                projectTitleById={projectTitleById}
                projectStatusById={projectStatusById}
                onEdit={openEditEventModal}
                onDelete={handleDelete}
                onToggleComplete={toggleEventComplete}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className="eyebrow">Clear Field</p>
            <h2>No tasks match this view.</h2>
            <span>Add a flexible task or switch filters.</span>
          </div>
        )}
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
