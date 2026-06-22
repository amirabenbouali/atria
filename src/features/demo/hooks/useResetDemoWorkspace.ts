import { useCallback } from 'react';
import { useCalendarStore } from '../../calendar/store/calendar.store';
import { useGoalsStore } from '../../goals/store/goals.store';
import { useProjectsStore } from '../../projects/store/projects.store';

export function useResetDemoWorkspace() {
  const resetDemoData = useCalendarStore((state) => state.resetDemoData);
  const resetDemoGoals = useGoalsStore((state) => state.resetDemoGoals);
  const resetDemoProjects = useProjectsStore((state) => state.resetDemoProjects);

  return useCallback(() => {
    resetDemoGoals();
    resetDemoProjects();
    resetDemoData();
  }, [resetDemoData, resetDemoGoals, resetDemoProjects]);
}
