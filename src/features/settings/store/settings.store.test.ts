import { afterEach, describe, expect, it, vi } from 'vitest';

function installLocalStorageMock() {
  const store = new Map<string, string>();

  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
  });

  return store;
}

describe('settings store energy profile actions', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('updates one period while preserving the others and unrelated settings', async () => {
    installLocalStorageMock();
    const { useSettingsStore } = await import('./settings.store');
    const before = useSettingsStore.getState().preferences;

    useSettingsStore.getState().setEnergyForPeriod('evening', 5);
    const after = useSettingsStore.getState().preferences;

    expect(after.planningDefaults.defaultView).toBe(before.planningDefaults.defaultView);
    expect(after.energyProfile.evening.energy).toBe(5);
    expect(after.energyProfile.morning).toEqual(before.energyProfile.morning);
    expect(after.energyProfile.afternoon).toEqual(before.energyProfile.afternoon);
  });

  it('updates qualities without mutating the previous state object', async () => {
    installLocalStorageMock();
    const { useSettingsStore } = await import('./settings.store');
    const beforeProfile = useSettingsStore.getState().preferences.energyProfile;

    useSettingsStore.getState().setPreferredQualitiesForPeriod('morning', ['recovery']);
    const afterProfile = useSettingsStore.getState().preferences.energyProfile;

    expect(afterProfile).not.toBe(beforeProfile);
    expect(afterProfile.morning.preferredQualities).toEqual(['recovery']);
    expect(beforeProfile.morning.preferredQualities).toEqual(['deep-focus', 'creative']);
  });

  it('reset restores defaults and keeps unrelated settings', async () => {
    installLocalStorageMock();
    const { useSettingsStore } = await import('./settings.store');

    useSettingsStore.getState().updatePreferences({
      planningDefaults: {
        ...useSettingsStore.getState().preferences.planningDefaults,
        defaultView: 'insights',
      },
    });
    useSettingsStore.getState().setEnergyForPeriod('morning', 1);
    useSettingsStore.getState().resetEnergyProfile();

    expect(useSettingsStore.getState().preferences.planningDefaults.defaultView).toBe('insights');
    expect(useSettingsStore.getState().preferences.energyProfile.morning).toEqual({
      energy: 4,
      preferredQualities: ['deep-focus', 'creative'],
    });
  });

  it('no-op updates do not alter state reference', async () => {
    installLocalStorageMock();
    const { useSettingsStore } = await import('./settings.store');
    const before = useSettingsStore.getState();

    useSettingsStore.getState().setEnergyForPeriod('morning', 4);
    useSettingsStore.getState().setPreferredQualitiesForPeriod('morning', ['deep-focus', 'creative']);
    useSettingsStore.getState().resetEnergyProfile();

    expect(useSettingsStore.getState()).toBe(before);
  });
});
