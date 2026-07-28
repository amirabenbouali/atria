import { create } from 'zustand';
import { createId } from '../../../shared/utils/id';
import { loadIntentions, saveIntentions } from '../services/intentionsStorage.service';
import type {
  Intention,
  IntentionDraft,
  IntentionStatus,
  IntentionUpdate,
} from '../types/intentions.types';
import {
  applyIntentionStatus,
  createIntentionFromDraft,
  isIntentionStatus,
  updateIntentionFromDraft,
} from '../utils/intentionValidation';

type IntentionsState = {
  intentions: Intention[];
  hydrate: () => void;
  addIntention: (draft: IntentionDraft) => Intention | null;
  updateIntention: (id: string, draft: IntentionUpdate) => Intention | null;
  removeIntention: (id: string) => void;
  setIntentionStatus: (id: string, status: IntentionStatus) => void;
};

function persistIntentions(intentions: Intention[]) {
  saveIntentions(intentions);
  return intentions;
}

export const useIntentionsStore = create<IntentionsState>((set, get) => ({
  intentions: loadIntentions(),
  hydrate: () => set({ intentions: loadIntentions() }),
  addIntention: (draft) => {
    const intention = createIntentionFromDraft(draft, { id: createId() });

    if (!intention) {
      return null;
    }

    set((state) => ({
      intentions: persistIntentions([...state.intentions, intention]),
    }));

    return intention;
  },
  updateIntention: (id, draft) => {
    const existingIntention = get().intentions.find((intention) => intention.id === id);

    if (!existingIntention) {
      return null;
    }

    const updatedIntention = updateIntentionFromDraft(existingIntention, draft);

    if (!updatedIntention) {
      return null;
    }

    set((state) => ({
      intentions: persistIntentions(
        state.intentions.map((intention) => (intention.id === id ? updatedIntention : intention)),
      ),
    }));

    return updatedIntention;
  },
  removeIntention: (id) =>
    set((state) => ({
      intentions: persistIntentions(state.intentions.filter((intention) => intention.id !== id)),
    })),
  setIntentionStatus: (id, status) => {
    if (!isIntentionStatus(status)) {
      return;
    }

    set((state) => ({
      intentions: persistIntentions(
        state.intentions.map((intention) =>
          intention.id === id ? applyIntentionStatus(intention, status) : intention,
        ),
      ),
    }));
  },
}));
