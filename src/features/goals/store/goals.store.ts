import { create } from 'zustand';
import { createId } from '../../../shared/utils/id';
import { readStoredGoals, writeStoredGoals } from '../services/goalsStorage.service';
import type { Goal, GoalDraft, GoalStatus } from '../types/goals.types';
import { createDemoGoals } from '../utils/demoGoalsData';

type GoalsState = {
  goals: Goal[];
  isGoalModalOpen: boolean;
  editingGoalId: string | null;
  openGoalModal: () => void;
  openEditGoalModal: (id: string) => void;
  closeGoalModal: () => void;
  addGoal: (goal: GoalDraft) => void;
  updateGoal: (id: string, goal: GoalDraft) => void;
  setGoalStatus: (id: string, status: GoalStatus) => void;
  deleteGoal: (id: string) => void;
  resetDemoGoals: () => void;
};

function persistGoals(goals: Goal[]) {
  writeStoredGoals(goals);
  return goals;
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: readStoredGoals(),
  isGoalModalOpen: false,
  editingGoalId: null,
  openGoalModal: () => set({ isGoalModalOpen: true, editingGoalId: null }),
  openEditGoalModal: (id) => set({ isGoalModalOpen: true, editingGoalId: id }),
  closeGoalModal: () => set({ isGoalModalOpen: false, editingGoalId: null }),
  addGoal: (goalDraft) =>
    set((state) => {
      const timestamp = new Date().toISOString();

      return {
        goals: persistGoals([
          ...state.goals,
          {
            ...goalDraft,
            id: createId(),
            status: 'active',
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ]),
        isGoalModalOpen: false,
        editingGoalId: null,
      };
    }),
  updateGoal: (id, goalDraft) =>
    set((state) => ({
      goals: persistGoals(
        state.goals.map((goal) =>
          goal.id === id
            ? {
                ...goal,
                ...goalDraft,
                updatedAt: new Date().toISOString(),
              }
            : goal,
        ),
      ),
      isGoalModalOpen: false,
      editingGoalId: null,
    })),
  setGoalStatus: (id, status) =>
    set((state) => ({
      goals: persistGoals(
        state.goals.map((goal) =>
          goal.id === id ? { ...goal, status, updatedAt: new Date().toISOString() } : goal,
        ),
      ),
    })),
  deleteGoal: (id) =>
    set((state) => ({
      goals: persistGoals(state.goals.filter((goal) => goal.id !== id)),
    })),
  resetDemoGoals: () => set({ goals: persistGoals(createDemoGoals()), isGoalModalOpen: false, editingGoalId: null }),
}));
