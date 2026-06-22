import { useEffect, useMemo, useState } from 'react';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import { useResetDemoWorkspace } from '../../features/demo/hooks/useResetDemoWorkspace';
import { useGoalsStore } from '../../features/goals/store/goals.store';
import { useProjectsStore } from '../../features/projects/store/projects.store';
import type { Project, ProjectStatus } from '../../features/projects/types/projects.types';
import { getProjectsByStatus, type ProjectFilter } from '../../features/projects/utils/projectFilters';
import { getLinkedTasksForProject, getProjectProgress } from '../../features/projects/utils/projectProgress';
import { useDefaultCalendarModalPreset } from '../../features/settings/hooks/useDefaultCalendarModalPreset';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import Toast from '../../shared/components/Toast/Toast';
import GlassPanel from '../../shared/ui/GlassPanel/GlassPanel';
import ProjectCard from './components/ProjectCard';
import ProjectDetailDrawer from './components/ProjectDetailDrawer';
import ProjectModal from './components/ProjectModal';
import styles from './ProjectsPage.module.css';

const projectFilters: Array<{ label: string; value: ProjectFilter }> = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' },
  { label: 'All', value: 'all' },
];

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectFilter>('active');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
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
  const isProjectModalOpen = useProjectsStore((state) => state.isProjectModalOpen);
  const editingProjectId = useProjectsStore((state) => state.editingProjectId);
  const openProjectModal = useProjectsStore((state) => state.openProjectModal);
  const openEditProjectModal = useProjectsStore((state) => state.openEditProjectModal);
  const closeProjectModal = useProjectsStore((state) => state.closeProjectModal);
  const addProject = useProjectsStore((state) => state.addProject);
  const updateProject = useProjectsStore((state) => state.updateProject);
  const setProjectStatus = useProjectsStore((state) => state.setProjectStatus);
  const deleteProject = useProjectsStore((state) => state.deleteProject);
  const isAddEventModalOpen = useCalendarStore((state) => state.isAddEventModalOpen);
  const editingEventId = useCalendarStore((state) => state.editingEventId);
  const modalPreset = useCalendarStore((state) => state.modalPreset);
  const openAddEventModal = useCalendarStore((state) => state.openAddEventModal);
  const openEditEventModal = useCalendarStore((state) => state.openEditEventModal);
  const closeAddEventModal = useCalendarStore((state) => state.closeAddEventModal);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const toggleEventComplete = useCalendarStore((state) => state.toggleEventComplete);
  const removeProjectLinks = useCalendarStore((state) => state.removeProjectLinks);
  const resetDemoWorkspace = useResetDemoWorkspace();
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPreviousWeek = useCalendarStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useCalendarStore((state) => state.goToNextWeek);
  const visibleProjects = useMemo(() => getProjectsByStatus(projects, filter), [filter, projects]);
  const activeProjectCount = projects.filter((project) => project.status === 'active').length;
  const completedProjectCount = projects.filter((project) => project.status === 'completed').length;
  const goalTitleById = useMemo(() => Object.fromEntries(goals.map((goal) => [goal.id, goal.title])), [goals]);
  const linkedTasksByProjectId = useMemo(
    () =>
      Object.fromEntries(
        projects.map((project) => [
          project.id,
          getLinkedTasksForProject(sourceEvents, visibleCalendarItems, project.id),
        ]),
      ),
    [projects, sourceEvents, visibleCalendarItems],
  );
  const projectProgressById = useMemo(
    () =>
      Object.fromEntries(
        projects.map((project) => [
          project.id,
          getProjectProgress(linkedTasksByProjectId[project.id] ?? []),
        ]),
      ),
    [linkedTasksByProjectId, projects],
  );
  const editingProject = projects.find((project) => project.id === editingProjectId) ?? null;
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const editingEvent = sourceEvents.find((event) => event.id === editingEventId) ?? null;

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const handleSetProjectStatus = (id: string, status: ProjectStatus) => {
    if (status === 'archived' && !window.confirm('Archive this project? You can still view it from the Archived filter.')) {
      return;
    }

    setProjectStatus(id, status);
    setToastMessage(status === 'completed' ? 'Project completed' : status === 'archived' ? 'Project archived' : 'Project reopened');
  };

  const handleDeleteProject = (id: string) => {
    if (!window.confirm('Delete this archived project permanently? Linked tasks will be unlinked from this project.')) {
      return;
    }

    removeProjectLinks(id);
    deleteProject(id);
    setSelectedProjectId((currentId) => (currentId === id ? null : currentId));
    setToastMessage('Project deleted');
  };

  const handleCreateTaskForProject = (project: Project) => {
    openAddEventModal(createDefaultPreset({
      itemType: 'task',
      projectId: project.id,
      goalId: project.goalId,
    }));
  };

  return (
    <AppLayout
      totalEvents={totalEventCount}
      completedEvents={completedEventCount}
      weekLabel={weekLabel}
      topbarEyebrow="Workstream Layer"
      topbarTitle="Projects"
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
      <GlassPanel className={styles.projectsShell}>
        <section className={styles.heroPanel}>
          <p className="eyebrow">Structured Work</p>
          <h1>Projects</h1>
          <span>{activeProjectCount} active workstreams · {completedProjectCount} completed</span>
          <button type="button" onClick={openProjectModal}>
            + New Project
          </button>
        </section>

        <div className={styles.filterBar} aria-label="Project filters">
          {projectFilters.map((option) => (
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

        {visibleProjects.length > 0 ? (
          <div className={styles.projectGrid}>
            {visibleProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                linkedGoalTitle={project.goalId ? goalTitleById[project.goalId] : undefined}
                progress={projectProgressById[project.id] ?? { linkedTaskCount: 0, completedLinkedTaskCount: 0, percentage: 0 }}
                onSelect={setSelectedProjectId}
                onEdit={openEditProjectModal}
                onSetStatus={handleSetProjectStatus}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className="eyebrow">No Workstreams</p>
            <h2>No projects in this lane.</h2>
            <span>Create a project to bridge a goal into daily tasks.</span>
          </div>
        )}
      </GlassPanel>

      <ProjectDetailDrawer
        project={selectedProject}
        linkedGoalTitle={selectedProject?.goalId ? goalTitleById[selectedProject.goalId] : undefined}
        linkedTasks={selectedProject ? linkedTasksByProjectId[selectedProject.id] ?? [] : []}
        progress={
          selectedProject
            ? projectProgressById[selectedProject.id] ?? { linkedTaskCount: 0, completedLinkedTaskCount: 0, percentage: 0 }
            : { linkedTaskCount: 0, completedLinkedTaskCount: 0, percentage: 0 }
        }
        onClose={() => setSelectedProjectId(null)}
        onEditProject={openEditProjectModal}
        onCreateTask={handleCreateTaskForProject}
        onEditTask={openEditEventModal}
        onToggleTaskComplete={toggleEventComplete}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        editingProject={editingProject}
        onClose={closeProjectModal}
        onAddProject={addProject}
        onUpdateProject={updateProject}
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
