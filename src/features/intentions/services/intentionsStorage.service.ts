import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from '../../../shared/services/localStorage.service';
import type { Intention } from '../types/intentions.types';
import { normalizeIntentions } from '../utils/intentionValidation';

const intentionsStorageKey = 'atria-intentions';
const currentIntentionsStorageVersion = 1;

type PersistedIntentionsState = {
  version: 1;
  intentions: unknown[];
};

function normalizePersistedIntentionsState(value: unknown): Intention[] {
  if (Array.isArray(value)) {
    return normalizeIntentions(value);
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [];
  }

  const persistedState = value as Partial<PersistedIntentionsState>;

  if (persistedState.version !== currentIntentionsStorageVersion) {
    return [];
  }

  return normalizeIntentions(persistedState.intentions);
}

export function loadIntentions() {
  return normalizePersistedIntentionsState(
    readJsonFromLocalStorage<unknown>(intentionsStorageKey, {
      version: currentIntentionsStorageVersion,
      intentions: [],
    }),
  );
}

export function saveIntentions(intentions: Intention[]) {
  writeJsonToLocalStorage<PersistedIntentionsState>(intentionsStorageKey, {
    version: currentIntentionsStorageVersion,
    intentions,
  });
}
