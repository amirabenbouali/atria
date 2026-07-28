import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from '../../../shared/services/localStorage.service';
import type { ReflectionsByDate } from '../types/reflections.types';
import { normalizeReflections } from '../utils/reflectionValidation';

const reflectionsStorageKey = 'atria-reflections';
const currentReflectionsStorageVersion = 1;

type PersistedReflectionsState = {
  version: 1;
  reflections: unknown[];
};

function normalizePersistedReflectionsState(value: unknown): ReflectionsByDate {
  if (Array.isArray(value)) {
    return normalizeReflections(value);
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const persistedState = value as Partial<PersistedReflectionsState>;

  if (persistedState.version !== currentReflectionsStorageVersion) {
    return {};
  }

  return normalizeReflections(persistedState.reflections);
}

export function loadReflections() {
  return normalizePersistedReflectionsState(
    readJsonFromLocalStorage<unknown>(reflectionsStorageKey, {
      version: currentReflectionsStorageVersion,
      reflections: [],
    }),
  );
}

export function saveReflections(reflections: ReflectionsByDate) {
  writeJsonToLocalStorage<PersistedReflectionsState>(reflectionsStorageKey, {
    version: currentReflectionsStorageVersion,
    reflections: Object.values(reflections),
  });
}
