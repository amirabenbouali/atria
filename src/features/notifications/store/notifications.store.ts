import { create } from 'zustand';
import {
  readStoredNotificationState,
  writeStoredNotificationState,
} from '../services/notificationStorage.service';

type NotificationsState = {
  dismissedIds: string[];
  dismissNotification: (id: string) => void;
  dismissNotifications: (ids: string[]) => void;
  resetNotifications: () => void;
};

function persistDismissedIds(dismissedIds: string[]) {
  writeStoredNotificationState({ dismissedIds });
  return dismissedIds;
}

const storedState = readStoredNotificationState();

export const useNotificationsStore = create<NotificationsState>((set) => ({
  dismissedIds: storedState.dismissedIds,
  dismissNotification: (id) =>
    set((state) => {
      if (state.dismissedIds.includes(id)) {
        return state;
      }

      return {
        dismissedIds: persistDismissedIds([...state.dismissedIds, id]),
      };
    }),
  dismissNotifications: (ids) =>
    set((state) => {
      const nextIds = Array.from(new Set([...state.dismissedIds, ...ids]));
      return {
        dismissedIds: persistDismissedIds(nextIds),
      };
    }),
  resetNotifications: () =>
    set({
      dismissedIds: persistDismissedIds([]),
    }),
}));
