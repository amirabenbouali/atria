import { useCallback } from 'react';
import { useCalendarStore } from '../../calendar/store/calendar.store';
import { useGoalsStore } from '../../goals/store/goals.store';
import { useIntentionsStore } from '../../intentions/store/intentions.store';
import { useProjectsStore } from '../../projects/store/projects.store';
import { useReflectionsStore } from '../../reflections';
import { useSettingsStore } from '../../settings/store/settings.store';

export function useResetDemoWorkspace() {
  const resetDemoData = useCalendarStore((state) => state.resetDemoData);
  const resetDemoGoals = useGoalsStore((state) => state.resetDemoGoals);
  const resetDemoProjects = useProjectsStore((state) => state.resetDemoProjects);
  const resetDemoIntentions = useIntentionsStore((state) => state.resetDemoIntentions);
  const resetDemoReflections = useReflectionsStore((state) => state.resetDemoReflections);
  const resetEnergyProfile = useSettingsStore((state) => state.resetEnergyProfile);

  return useCallback(() => {
    resetDemoIntentions();
    resetDemoGoals();
    resetDemoProjects();
    resetDemoData();
    resetDemoReflections();
    resetEnergyProfile();
  }, [
    resetDemoData,
    resetDemoGoals,
    resetDemoIntentions,
    resetDemoProjects,
    resetDemoReflections,
    resetEnergyProfile,
  ]);
}
