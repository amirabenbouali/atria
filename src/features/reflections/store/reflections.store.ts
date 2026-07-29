import { create } from 'zustand';
import { loadReflections, saveReflections } from '../services/reflectionsStorage.service';
import type {
  DailyReflection,
  DailyReflectionDraft,
  ReflectionsByDate,
} from '../types/reflections.types';
import { createDemoReflections } from '../utils/demoReflectionsData';
import { upsertReflectionDraft } from '../utils/reflectionValidation';

type ReflectionsState = {
  reflections: ReflectionsByDate;
  hydrate: () => void;
  upsertReflection: (draft: DailyReflectionDraft) => DailyReflection | null;
  removeReflection: (date: string) => void;
  getReflectionByDate: (date: string) => DailyReflection | undefined;
  resetDemoReflections: () => void;
  clearReflections: () => void;
};

function persistReflections(reflections: ReflectionsByDate) {
  saveReflections(reflections);
  return reflections;
}

export const useReflectionsStore = create<ReflectionsState>((set, get) => ({
  reflections: loadReflections(),
  hydrate: () => set({ reflections: loadReflections() }),
  upsertReflection: (draft) => {
    const existingReflection = get().reflections[draft.date];
    const reflection = upsertReflectionDraft(draft, existingReflection);

    if (!reflection) {
      return null;
    }

    set((state) => ({
      reflections: persistReflections({
        ...state.reflections,
        [reflection.date]: reflection,
      }),
    }));

    return reflection;
  },
  removeReflection: (date) =>
    set((state) => {
      const { [date]: _removedReflection, ...remainingReflections } = state.reflections;
      return {
        reflections: persistReflections(remainingReflections),
      };
    }),
  getReflectionByDate: (date) => get().reflections[date],
  resetDemoReflections: () => set({ reflections: persistReflections(createDemoReflections()) }),
  clearReflections: () => set({ reflections: persistReflections({}) }),
}));
