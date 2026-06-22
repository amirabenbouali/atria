import { useMemo } from 'react';
import { useCalendarEvents } from '../../../features/calendar/hooks/useCalendarEvents';
import {
  getTasksForFilter,
  groupTasksByDate,
  type TaskFilter,
  type TaskGoalFilter,
  type TaskProjectFilter,
} from '../utils/tasksPageData';

export function useTasksPageData(filter: TaskFilter, goalFilter: TaskGoalFilter, projectFilter: TaskProjectFilter) {
  const {
    events,
    sourceEvents,
    selectedWeekDate,
    weekStartsOnMonday,
    weekLabel,
    totalEventCount,
    completedEventCount,
  } = useCalendarEvents();
  const tasks = useMemo(
    () => getTasksForFilter(sourceEvents, filter, goalFilter, projectFilter, selectedWeekDate, weekStartsOnMonday),
    [filter, goalFilter, projectFilter, selectedWeekDate, sourceEvents, weekStartsOnMonday],
  );
  const taskGroups = useMemo(() => groupTasksByDate(tasks), [tasks]);

  return {
    visibleCalendarItems: events,
    sourceEvents,
    selectedWeekDate,
    weekLabel,
    totalEventCount,
    completedEventCount,
    tasks,
    taskGroups,
  };
}
