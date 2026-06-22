import { eventCategories } from '../../calendar/constants/calendar.constants';
import type { EventCategory } from '../../calendar/types/calendar.types';
import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from '../../../shared/services/localStorage.service';
import type { Project, ProjectStatus } from '../types/projects.types';

const projectsStorageKey = 'atria-projects';
const projectStatuses: ProjectStatus[] = ['active', 'completed', 'archived'];

type StoredProject = Partial<Project>;

function normalizeCategory(category: unknown): EventCategory {
  return eventCategories.includes(category as EventCategory) ? category as EventCategory : 'Work';
}

function normalizeStatus(status: unknown): ProjectStatus {
  return projectStatuses.includes(status as ProjectStatus) ? status as ProjectStatus : 'active';
}

function normalizeProject(project: StoredProject): Project {
  const timestamp = new Date().toISOString();

  return {
    id: project.id ?? crypto.randomUUID(),
    title: typeof project.title === 'string' && project.title.trim() ? project.title : 'Untitled project',
    description: typeof project.description === 'string' ? project.description : '',
    category: normalizeCategory(project.category),
    goalId: typeof project.goalId === 'string' && project.goalId ? project.goalId : undefined,
    status: normalizeStatus(project.status),
    targetDate: typeof project.targetDate === 'string' && project.targetDate ? project.targetDate : undefined,
    createdAt: project.createdAt ?? timestamp,
    updatedAt: project.updatedAt ?? timestamp,
  };
}

export function readStoredProjects() {
  const storedProjects = readJsonFromLocalStorage<StoredProject[]>(projectsStorageKey, []);

  if (!Array.isArray(storedProjects)) {
    return [];
  }

  return storedProjects.map(normalizeProject);
}

export function writeStoredProjects(projects: Project[]) {
  writeJsonToLocalStorage(projectsStorageKey, projects);
}
