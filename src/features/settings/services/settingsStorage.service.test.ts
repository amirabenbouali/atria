import { afterEach, describe, expect, it, vi } from 'vitest';

function installLocalStorageMock(initialValue: string | null) {
  const store = new Map<string, string>();

  if (initialValue !== null) {
    store.set('atria-settings-preferences', initialValue);
  }

  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
  });

  return store;
}

describe('settings storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('adds default energy profile to older persisted settings', async () => {
    installLocalStorageMock(JSON.stringify({
      weekStartsOnMonday: false,
      defaultItemType: 'task',
      defaultCategory: 'Health',
      defaultView: 'today',
    }));
    const { readStoredSettingsPreferences } = await import('./settingsStorage.service');

    expect(readStoredSettingsPreferences()).toMatchObject({
      weekStartsOnMonday: false,
      defaultItemType: 'task',
      defaultCategory: 'Health',
      defaultView: 'today',
      energyProfile: {
        morning: { energy: 4, preferredQualities: ['deep-focus', 'creative'] },
      },
    });
  });

  it('normalizes malformed nested energy profile values without wiping unrelated settings', async () => {
    installLocalStorageMock(JSON.stringify({
      weekStartsOnMonday: false,
      defaultCategory: 'Finance',
      energyProfile: {
        morning: { energy: 7, preferredQualities: ['creative', 'creative', 'busy'] },
        afternoon: { energy: 5, preferredQualities: [] },
      },
    }));
    const { readStoredSettingsPreferences } = await import('./settingsStorage.service');

    expect(readStoredSettingsPreferences()).toMatchObject({
      weekStartsOnMonday: false,
      defaultCategory: 'Finance',
      energyProfile: {
        morning: { energy: 4, preferredQualities: ['creative'] },
        afternoon: { energy: 5, preferredQualities: [] },
      },
    });
  });
});
