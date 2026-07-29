import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/routes';
import { useCalendarStore } from '../../calendar/store/calendar.store';
import { categoryColors } from '../../calendar/constants/calendar.constants';
import { formatInputDate, getCurrentWeekDays } from '../../calendar/utils/calendarDates';
import { useGoalsStore } from '../../goals/store/goals.store';
import { useIntentionsStore } from '../../intentions/store/intentions.store';
import { useProjectsStore } from '../../projects/store/projects.store';
import { useDefaultCalendarModalPreset } from '../../settings/hooks/useDefaultCalendarModalPreset';
import { useWeekStartsOnMonday } from '../../settings/hooks/useWeekStartsOnMonday';
import type { CommandPaletteCommand } from '../types/commandPalette.types';
import {
  filterCommands,
  getCalendarItemBadge,
  searchCalendarItems,
  searchGoals,
  searchIntentions,
  searchProjects,
} from '../utils/commandSearch';

type UseCommandPaletteCommandsOptions = {
  query: string;
  onClose: () => void;
  onResetDemoData: () => void;
};

export function useCommandPaletteCommands({
  query,
  onClose,
  onResetDemoData,
}: UseCommandPaletteCommandsOptions) {
  const navigate = useNavigate();
  const items = useCalendarStore((state) => state.events);
  const selectedWeekDate = useCalendarStore((state) => state.selectedWeekDate);
  const weekStartsOnMonday = useWeekStartsOnMonday();
  const createDefaultPreset = useDefaultCalendarModalPreset();
  const openAddEventModal = useCalendarStore((state) => state.openAddEventModal);
  const openEditEventModal = useCalendarStore((state) => state.openEditEventModal);
  const goals = useGoalsStore((state) => state.goals);
  const openGoalModal = useGoalsStore((state) => state.openGoalModal);
  const openEditGoalModal = useGoalsStore((state) => state.openEditGoalModal);
  const intentions = useIntentionsStore((state) => state.intentions);
  const openIntentionModal = useIntentionsStore((state) => state.openIntentionModal);
  const openEditIntentionModal = useIntentionsStore((state) => state.openEditIntentionModal);
  const projects = useProjectsStore((state) => state.projects);
  const openProjectModal = useProjectsStore((state) => state.openProjectModal);
  const openEditProjectModal = useProjectsStore((state) => state.openEditProjectModal);
  const todayDate = formatInputDate();
  const weekStartDate = getCurrentWeekDays(selectedWeekDate, weekStartsOnMonday)[0]?.isoDate ?? todayDate;
  const goalTitleById = useMemo(
    () => Object.fromEntries(goals.map((goal) => [goal.id, goal.title])),
    [goals],
  );
  const projectTitleById = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project.title])),
    [projects],
  );
  const searchContext = useMemo(() => ({ goals, projects, intentions }), [goals, intentions, projects]);

  const baseCommands = useMemo<CommandPaletteCommand[]>(
    () => [
      {
        id: 'navigate-calendar',
        title: 'Go to Calendar',
        subtitle: 'Open the weekly planning grid',
        type: 'navigation',
        badge: 'Route',
        accentColor: categoryColors.Learning,
        execute: () => {
          navigate(routes.calendar);
          onClose();
        },
      },
      {
        id: 'navigate-today',
        title: 'Go to Today',
        subtitle: 'Open the daily command dashboard',
        type: 'navigation',
        badge: 'Route',
        accentColor: categoryColors.Personal,
        execute: () => {
          navigate(routes.today);
          onClose();
        },
      },
      {
        id: 'navigate-insights',
        title: 'Go to Insights',
        subtitle: 'Open weekly analytics and routines',
        type: 'navigation',
        badge: 'Route',
        accentColor: categoryColors.Finance,
        execute: () => {
          navigate(routes.insights);
          onClose();
        },
      },
      {
        id: 'navigate-tasks',
        title: 'Go to Tasks',
        subtitle: 'Open every flexible task by date',
        type: 'navigation',
        badge: 'Route',
        accentColor: categoryColors.Health,
        execute: () => {
          navigate(routes.tasks);
          onClose();
        },
      },
      {
        id: 'navigate-intentions',
        title: 'Go to Intentions',
        subtitle: 'Open the outcome inbox before scheduling',
        type: 'navigation',
        badge: 'Route',
        accentColor: categoryColors.Personal,
        execute: () => {
          navigate(routes.intentions);
          onClose();
        },
      },
      {
        id: 'navigate-memories',
        title: 'Go to Memories',
        subtitle: 'Revisit past days, reflections, and completed intentions',
        type: 'navigation',
        badge: 'Route',
        accentColor: categoryColors.Personal,
        execute: () => {
          navigate(routes.memories);
          onClose();
        },
      },
      {
        id: 'navigate-goals',
        title: 'Go to Goals',
        subtitle: 'Open long-range objectives',
        type: 'navigation',
        badge: 'Route',
        accentColor: categoryColors.Personal,
        execute: () => {
          navigate(routes.goals);
          onClose();
        },
      },
      {
        id: 'navigate-projects',
        title: 'Go to Projects',
        subtitle: 'Open structured workstreams',
        type: 'navigation',
        badge: 'Route',
        accentColor: categoryColors.Work,
        execute: () => {
          navigate(routes.projects);
          onClose();
        },
      },
      {
        id: 'create-event-today',
        title: 'New event today',
        subtitle: 'Create a scheduled block for today',
        type: 'creation',
        badge: 'Create',
        accentColor: categoryColors.Work,
        execute: () => {
          openAddEventModal(createDefaultPreset({ itemType: 'event', date: todayDate }));
          onClose();
        },
      },
      {
        id: 'create-task-today',
        title: 'New task today',
        subtitle: 'Create a flexible task for today',
        type: 'creation',
        badge: 'Create',
        accentColor: categoryColors.Health,
        execute: () => {
          openAddEventModal(createDefaultPreset({ itemType: 'task', date: todayDate }));
          onClose();
        },
      },
      {
        id: 'create-event-week',
        title: 'New event this week',
        subtitle: 'Create a scheduled block at the start of this week',
        type: 'creation',
        badge: 'Create',
        accentColor: categoryColors.Learning,
        execute: () => {
          openAddEventModal(createDefaultPreset({ itemType: 'event', date: weekStartDate }));
          onClose();
        },
      },
      {
        id: 'create-task-week',
        title: 'New task this week',
        subtitle: 'Create a flexible task at the start of this week',
        type: 'creation',
        badge: 'Create',
        accentColor: categoryColors.Fitness,
        execute: () => {
          openAddEventModal(createDefaultPreset({ itemType: 'task', date: weekStartDate }));
          onClose();
        },
      },
      {
        id: 'create-task',
        title: 'New Task',
        subtitle: 'Create a flexible task for today',
        type: 'creation',
        badge: 'Create',
        accentColor: categoryColors.Health,
        execute: () => {
          openAddEventModal(createDefaultPreset({ itemType: 'task', date: todayDate }));
          onClose();
        },
      },
      {
        id: 'create-intention',
        title: 'Create new intention',
        subtitle: 'Capture an outcome without placing it on the calendar',
        type: 'creation',
        badge: 'Create',
        accentColor: categoryColors.Personal,
        execute: () => {
          navigate(routes.intentions);
          openIntentionModal();
          onClose();
        },
      },
      {
        id: 'create-goal',
        title: 'New Goal',
        subtitle: 'Create a long-range objective',
        type: 'creation',
        badge: 'Create',
        accentColor: categoryColors.Personal,
        execute: () => {
          navigate(routes.goals);
          openGoalModal();
          onClose();
        },
      },
      {
        id: 'create-project',
        title: 'New Project',
        subtitle: 'Create a structured workstream',
        type: 'creation',
        badge: 'Create',
        accentColor: categoryColors.Work,
        execute: () => {
          navigate(routes.projects);
          openProjectModal();
          onClose();
        },
      },
      {
        id: 'create-task-for-goal',
        title: 'New task for goal',
        subtitle: 'Open a task and choose a linked goal',
        type: 'creation',
        badge: 'Create',
        accentColor: categoryColors.Personal,
        execute: () => {
          openAddEventModal(createDefaultPreset({ itemType: 'task', date: todayDate }));
          onClose();
        },
      },
      {
        id: 'create-task-for-project',
        title: 'New task for project',
        subtitle: 'Open a task and choose a linked project',
        type: 'creation',
        badge: 'Create',
        accentColor: categoryColors.Learning,
        execute: () => {
          openAddEventModal(createDefaultPreset({ itemType: 'task', date: todayDate }));
          onClose();
        },
      },
      {
        id: 'reflect-today',
        title: 'Reflect on today',
        subtitle: 'Open Today and add or edit your daily reflection',
        type: 'navigation',
        badge: 'Route',
        accentColor: categoryColors.Personal,
        execute: () => {
          navigate(routes.today);
          onClose();
        },
      },
      {
        id: 'reset-demo-data',
        title: 'Load sample data',
        subtitle: 'Replace current local data with the portfolio-ready demo workspace',
        type: 'system',
        badge: 'System',
        accentColor: categoryColors.Personal,
        execute: () => {
          onResetDemoData();
          onClose();
        },
      },
    ],
    [
      createDefaultPreset,
      navigate,
      onClose,
      onResetDemoData,
      openAddEventModal,
      openGoalModal,
      openIntentionModal,
      openProjectModal,
      todayDate,
      weekStartDate,
    ],
  );

  const calendarCommands = useMemo<CommandPaletteCommand[]>(
    () =>
      searchCalendarItems(items, query, searchContext).map((item) => {
        const linkedGoalTitle = item.itemType === 'task' && item.goalId ? goalTitleById[item.goalId] : undefined;
        const linkedProjectTitle = item.itemType === 'task' && item.projectId ? projectTitleById[item.projectId] : undefined;
        const linkedContext = [linkedGoalTitle, linkedProjectTitle].filter(Boolean).join(' · ');

        return {
          id: `calendar-item-${item.id}`,
          title: item.title,
          subtitle: [
            item.category,
            item.date,
            item.itemType === 'event' ? `${item.startTime}-${item.endTime}` : 'Flexible task',
            linkedContext,
            item.description,
          ].filter(Boolean).join(' · '),
          type: 'calendarItem',
          badge: getCalendarItemBadge(item),
          accentColor: item.accentColor,
          execute: () => {
            openEditEventModal(item.id);
            onClose();
          },
        };
      }),
    [goalTitleById, items, onClose, openEditEventModal, projectTitleById, query, searchContext],
  );

  const goalCommands = useMemo<CommandPaletteCommand[]>(
    () =>
      searchGoals(goals, query).map((goal) => ({
        id: `goal-${goal.id}`,
        title: goal.title,
        subtitle: [goal.category, goal.status, goal.targetDate ? `Target ${goal.targetDate}` : '', goal.description]
          .filter(Boolean)
          .join(' · '),
        type: 'goal',
        badge: 'Goal',
        accentColor: categoryColors[goal.category],
        execute: () => {
          navigate(routes.goals);
          openEditGoalModal(goal.id);
          onClose();
        },
      })),
    [goals, navigate, onClose, openEditGoalModal, query],
  );

  const projectCommands = useMemo<CommandPaletteCommand[]>(
    () =>
      searchProjects(projects, query, searchContext).map((project) => ({
        id: `project-${project.id}`,
        title: project.title,
        subtitle: [
          project.category,
          project.status,
          project.stage,
          project.goalId ? goalTitleById[project.goalId] : '',
          project.description,
        ].filter(Boolean).join(' · '),
        type: 'project',
        badge: 'Project',
        accentColor: categoryColors[project.category],
        execute: () => {
          navigate(routes.projects);
          openEditProjectModal(project.id);
          onClose();
        },
      })),
    [goalTitleById, navigate, onClose, openEditProjectModal, projects, query, searchContext],
  );

  const intentionCommands = useMemo<CommandPaletteCommand[]>(
    () =>
      searchIntentions(intentions, query).map((intention) => ({
        id: `intention-${intention.id}`,
        title: intention.title,
        subtitle: [
          intention.status,
          intention.priority,
          intention.deadline ? `Due ${intention.deadline}` : '',
          intention.desiredOutcome,
          intention.description,
        ].filter(Boolean).join(' · '),
        type: 'intention',
        badge: 'Intention',
        accentColor: categoryColors.Personal,
        execute: () => {
          navigate(routes.intentions);
          openEditIntentionModal(intention.id);
          onClose();
        },
      })),
    [intentions, navigate, onClose, openEditIntentionModal, query],
  );

  return useMemo(
    () => [
      ...filterCommands(baseCommands, query),
      ...calendarCommands,
      ...goalCommands,
      ...projectCommands,
      ...intentionCommands,
    ].slice(0, 14),
    [baseCommands, calendarCommands, goalCommands, intentionCommands, projectCommands, query],
  );
}
