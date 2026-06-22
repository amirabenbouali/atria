import { useMemo } from 'react';
import { useCalendarEvents } from '../../../features/calendar/hooks/useCalendarEvents';
import { getCurrentWeekDays } from '../../../features/calendar/utils/calendarDates';
import { useProjectsStore } from '../../../features/projects/store/projects.store';
import { getProjectInsights } from '../../../features/projects/utils/projectInsights';
import {
  getCategoryInsights,
  getDailyRhythmInsights,
  getRoutineInsights,
  getWeeklyMetrics,
} from '../utils/insightsAnalytics';

export function useInsightsDashboard() {
  const {
    events,
    sourceEvents,
    selectedWeekDate,
    weekStartsOnMonday,
    weekLabel,
    totalEventCount,
    completedEventCount,
  } = useCalendarEvents();
  const projects = useProjectsStore((state) => state.projects);
  const weekDays = useMemo(
    () => getCurrentWeekDays(selectedWeekDate, weekStartsOnMonday),
    [selectedWeekDate, weekStartsOnMonday],
  );
  const weeklyMetrics = useMemo(() => getWeeklyMetrics(events), [events]);
  const categoryInsights = useMemo(() => getCategoryInsights(events), [events]);
  const dailyRhythm = useMemo(() => getDailyRhythmInsights(events, weekDays), [events, weekDays]);
  const routineInsights = useMemo(() => getRoutineInsights(events), [events]);
  const projectInsights = useMemo(() => getProjectInsights(projects), [projects]);

  return {
    events,
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
  };
}
