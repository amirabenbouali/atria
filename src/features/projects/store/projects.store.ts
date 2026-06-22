import { create } from 'zustand';
import { createId } from '../../../shared/utils/id';
import { readStoredProjects, writeStoredProjects } from '../services/projectsStorage.service';
import type { Project, ProjectDraft, ProjectStatus } from '../types/projects.types';
import { createDemoProjects } from '../utils/demoProjectsData';

type ProjectsState = {
  projects: Project[];
  isProjectModalOpen: boolean;
  editingProjectId: string | null;
  openProjectModal: () => void;
  openEditProjectModal: (id: string) => void;
  closeProjectModal: () => void;
  addProject: (project: ProjectDraft) => void;
  updateProject: (id: string, project: ProjectDraft) => void;
  setProjectStatus: (id: string, status: ProjectStatus) => void;
  deleteProject: (id: string) => void;
  resetDemoProjects: () => void;
};

function persistProjects(projects: Project[]) {
  writeStoredProjects(projects);
  return projects;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: readStoredProjects(),
  isProjectModalOpen: false,
  editingProjectId: null,
  openProjectModal: () => set({ isProjectModalOpen: true, editingProjectId: null }),
  openEditProjectModal: (id) => set({ isProjectModalOpen: true, editingProjectId: id }),
  closeProjectModal: () => set({ isProjectModalOpen: false, editingProjectId: null }),
  addProject: (projectDraft) =>
    set((state) => {
      const timestamp = new Date().toISOString();

      return {
        projects: persistProjects([
          ...state.projects,
          {
            ...projectDraft,
            id: createId(),
            status: 'active',
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ]),
        isProjectModalOpen: false,
        editingProjectId: null,
      };
    }),
  updateProject: (id, projectDraft) =>
    set((state) => ({
      projects: persistProjects(
        state.projects.map((project) =>
          project.id === id
            ? { ...project, ...projectDraft, updatedAt: new Date().toISOString() }
            : project,
        ),
      ),
      isProjectModalOpen: false,
      editingProjectId: null,
    })),
  setProjectStatus: (id, status) =>
    set((state) => ({
      projects: persistProjects(
        state.projects.map((project) =>
          project.id === id ? { ...project, status, updatedAt: new Date().toISOString() } : project,
        ),
      ),
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: persistProjects(state.projects.filter((project) => project.id !== id)),
    })),
  resetDemoProjects: () =>
    set({ projects: persistProjects(createDemoProjects()), isProjectModalOpen: false, editingProjectId: null }),
}));
