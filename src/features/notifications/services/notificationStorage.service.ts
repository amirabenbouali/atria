import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from '../../../shared/services/localStorage.service';

const notificationsStorageKey = 'atria-notification-state';

type StoredNotificationState = {
  dismissedIds?: unknown;
};

export type NotificationStorageState = {
  dismissedIds: string[];
};

function normalizeNotificationState(value: unknown): NotificationStorageState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { dismissedIds: [] };
  }

  const stored = value as StoredNotificationState;

  return {
    dismissedIds: Array.isArray(stored.dismissedIds)
      ? stored.dismissedIds.filter((id): id is string => typeof id === 'string')
      : [],
  };
}

export function readStoredNotificationState() {
  return normalizeNotificationState(
    readJsonFromLocalStorage<StoredNotificationState>(notificationsStorageKey, { dismissedIds: [] }),
  );
}

export function writeStoredNotificationState(state: NotificationStorageState) {
  writeJsonToLocalStorage(notificationsStorageKey, state);
}
