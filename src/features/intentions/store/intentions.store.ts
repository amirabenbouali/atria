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
  isIntentionModalOpen: boolean;
  editingIntentionId: string | null;
  hydrate: () => void;
  openIntentionModal: () => void;
  openEditIntentionModal: (id: string) => void;
  closeIntentionModal: () => void;
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
  isIntentionModalOpen: false,
  editingIntentionId: null,
  hydrate: () => set({ intentions: loadIntentions() }),
  openIntentionModal: () => set({ isIntentionModalOpen: true, editingIntentionId: null }),
  openEditIntentionModal: (id) => set({ isIntentionModalOpen: true, editingIntentionId: id }),
  closeIntentionModal: () => set({ isIntentionModalOpen: false, editingIntentionId: null }),
  addIntention: (draft) => {
    const intention = createIntentionFromDraft(draft, { id: createId() });

    if (!intention) {
      return null;
    }

    set((state) => ({
      intentions: persistIntentions([...state.intentions, intention]),
      isIntentionModalOpen: false,
      editingIntentionId: null,
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
      isIntentionModalOpen: false,
      editingIntentionId: null,
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
