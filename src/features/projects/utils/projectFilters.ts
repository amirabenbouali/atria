import { isAfter, parseISO } from 'date-fns';
import type { Project, ProjectStatus } from '../types/projects.types';

export type ProjectFilter = ProjectStatus | 'all';

export function getProjectsByStatus(projects: Project[], filter: ProjectFilter) {
  const visibleProjects = filter === 'all' ? projects : projects.filter((project) => project.status === filter);

  return [...visibleProjects].sort((first, second) => {
    if (first.status !== second.status) {
      return first.status === 'active' ? -1 : 1;
    }

    if (first.targetDate && second.targetDate) {
      const firstDate = parseISO(first.targetDate);
      const secondDate = parseISO(second.targetDate);

      if (isAfter(firstDate, secondDate)) {
        return 1;
      }

      if (isAfter(secondDate, firstDate)) {
        return -1;
      }
    }

    if (first.targetDate) {
      return -1;
    }

    if (second.targetDate) {
      return 1;
    }

    return second.updatedAt.localeCompare(first.updatedAt);
  });
}
