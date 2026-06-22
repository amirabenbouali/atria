import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/routes';
import { useCalendarStore } from '../../calendar/store/calendar.store';
import { categoryColors } from '../../calendar/constants/calendar.constants';
import { formatInputDate, getCurrentWeekDays } from '../../calendar/utils/calendarDates';
import { useGoalsStore } from '../../goals/store/goals.store';
import { useProjectsStore } from '../../projects/store/projects.store';
import { useSettingsStore } from '../../settings/store/settings.store';
import { useDefaultCalendarModalPreset } from '../../settings/hooks/useDefaultCalendarModalPreset';
import type { CommandPaletteCommand } from '../types/commandPalette.types';
import { filterCommands, getCalendarItemBadge, searchCalendarItems } from '../utils/commandSearch';

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
  const weekStartsOnMonday = useSettingsStore((state) => state.preferences.weekStartsOnMonday);
  const createDefaultPreset = useDefaultCalendarModalPreset();
  const openAddEventModal = useCalendarStore((state) => state.openAddEventModal);
  const openEditEventModal = useCalendarStore((state) => state.openEditEventModal);
  const openGoalModal = useGoalsStore((state) => state.openGoalModal);
  const openProjectModal = useProjectsStore((state) => state.openProjectModal);
  const todayDate = formatInputDate();
  const weekStartDate = getCurrentWeekDays(selectedWeekDate, weekStartsOnMonday)[0]?.isoDate ?? todayDate;

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
        id: 'open-projects',
        title: 'Open Projects',
        subtitle: 'Inspect project workstreams and linked tasks',
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
        id: 'reset-demo-data',
        title: 'Reset demo data',
        subtitle: 'Restore the portfolio-ready sample week',
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
      openProjectModal,
      todayDate,
      weekStartDate,
    ],
  );

  const calendarCommands = useMemo<CommandPaletteCommand[]>(
    () =>
      searchCalendarItems(items, query).map((item) => ({
        id: `calendar-item-${item.id}`,
        title: item.title,
        subtitle: `${item.category} · ${item.date}${item.description ? ` · ${item.description}` : ''}`,
        type: 'calendarItem',
        badge: getCalendarItemBadge(item),
        accentColor: item.accentColor,
        execute: () => {
          openEditEventModal(item.id);
          onClose();
        },
      })),
    [items, onClose, openEditEventModal, query],
  );

  return useMemo(
    () => [...filterCommands(baseCommands, query), ...calendarCommands].slice(0, 14),
    [baseCommands, calendarCommands, query],
  );
}
