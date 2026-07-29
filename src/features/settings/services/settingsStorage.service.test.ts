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

    const preferences = readStoredSettingsPreferences();

    expect(preferences).toMatchObject({
      schemaVersion: 2,
      calendar: {
        weekStartsOn: 'sunday',
      },
      planningDefaults: {
        defaultItemType: 'task',
        defaultCategory: 'Health',
        defaultView: 'today',
      },
      appearance: {
        atmosphere: 'dawn',
        accent: 'rose',
        workspaceMode: 'balanced',
      },
      onboarding: {
        hasCompleted: false,
        version: 1,
      },
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
      calendar: {
        weekStartsOn: 'sunday',
      },
      planningDefaults: {
        defaultCategory: 'Finance',
      },
      onboarding: {
        hasCompleted: false,
      },
      energyProfile: {
        morning: { energy: 4, preferredQualities: ['creative'] },
        afternoon: { energy: 5, preferredQualities: [] },
      },
    });
  });

  it('accepts current onboarding completion and supported themes', async () => {
    installLocalStorageMock(JSON.stringify({
      themeId: 'blue-hour',
      hasCompletedOnboarding: true,
      onboardingVersion: 1,
    }));
    const { readStoredSettingsPreferences } = await import('./settingsStorage.service');

    expect(readStoredSettingsPreferences()).toMatchObject({
      appearance: {
        atmosphere: 'daylight',
      },
      onboarding: {
        hasCompleted: true,
        version: 1,
      },
    });
  });

  it('normalizes malformed observatory settings without crashing', async () => {
    installLocalStorageMock(JSON.stringify({
      schemaVersion: 2,
      profile: {
        displayName: '   ',
        roleOrFocus: '  Portfolio demo  ',
        avatarStyle: 'photo',
      },
      appearance: {
        atmosphere: 'bad',
        accent: 'radioactive',
        workspaceMode: 'planner',
      },
      calendar: {
        weekStartsOn: 'sunday',
        timeFormat: '13-hour',
        defaultEventDurationMinutes: 15,
        showWeekends: false,
      },
      notifications: {
        inAppDailyOverview: false,
        quietHoursEnabled: true,
        quietHoursStart: 'bad',
        quietHoursEnd: '22:30',
      },
    }));
    const { readStoredSettingsPreferences } = await import('./settingsStorage.service');

    expect(readStoredSettingsPreferences()).toMatchObject({
      profile: {
        displayName: 'Atria user',
        roleOrFocus: 'Portfolio demo',
        avatarStyle: 'symbol',
      },
      appearance: {
        atmosphere: 'dawn',
        accent: 'rose',
        workspaceMode: 'planner',
      },
      calendar: {
        weekStartsOn: 'sunday',
        timeFormat: '24-hour',
        defaultEventDurationMinutes: 60,
        showWeekends: false,
      },
      notifications: {
        inAppDailyOverview: false,
        quietHoursEnabled: true,
        quietHoursStart: '21:00',
        quietHoursEnd: '22:30',
      },
    });
  });
});
