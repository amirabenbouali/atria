export const storageFailureEventName = 'atria-storage-failure';

type StorageFailureDetail = {
  key: string;
  operation: 'read' | 'write';
  message: string;
};

function reportStorageFailure(detail: StorageFailureDetail) {
  if (import.meta.env.DEV) {
    console.warn(`[Atria storage] ${detail.operation} failed for ${detail.key}: ${detail.message}`);
  }

  if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent<StorageFailureDetail>(storageFailureEventName, { detail }));
  }
}

export function readJsonFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : fallback;
  } catch (error) {
    reportStorageFailure({
      key,
      operation: 'read',
      message: error instanceof Error ? error.message : 'Unknown read error',
    });
    return fallback;
  }
}

export function writeJsonToLocalStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    reportStorageFailure({
      key,
      operation: 'write',
      message: error instanceof Error ? error.message : 'Unknown write error',
    });
  }
}
