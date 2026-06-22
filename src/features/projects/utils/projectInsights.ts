import type { Project } from '../types/projects.types';

export type ProjectInsights = {
  activeProjects: number;
  completedProjects: number;
  archivedProjects: number;
  completionRate: number;
};

export function getProjectInsights(projects: Project[]): ProjectInsights {
  const activeProjects = projects.filter((project) => project.status === 'active').length;
  const completedProjects = projects.filter((project) => project.status === 'completed').length;
  const archivedProjects = projects.filter((project) => project.status === 'archived').length;
  const measurableProjects = activeProjects + completedProjects;

  return {
    activeProjects,
    completedProjects,
    archivedProjects,
    completionRate: measurableProjects === 0 ? 0 : Math.round((completedProjects / measurableProjects) * 100),
  };
}
