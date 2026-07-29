import { afterEach, describe, expect, it, vi } from 'vitest';

function installLocalStorageMock() {
  const store = new Map<string, string>();

  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
    dispatchEvent: vi.fn(),
  });

  return store;
}

describe('data import service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('imports a versioned Atria export and hydrates stores from normalized storage', async () => {
    installLocalStorageMock();
    const { importAtriaDataFromJson } = await import('./dataImport.service');
    const { useCalendarStore } = await import('../../calendar/store/calendar.store');
    const { useGoalsStore } = await import('../../goals/store/goals.store');
    const importedAt = new Date('2026-07-29T12:00:00.000Z');

    const result = importAtriaDataFromJson(JSON.stringify({
      exportedAt: '2026-07-29T10:00:00.000Z',
      appVersion: '1.0.0-rc.1',
      schemaVersion: 1,
      calendar: {
        events: [
          {
            id: 'import-event',
            itemType: 'event',
            title: 'Imported planning block',
            date: '2026-07-29',
            startTime: '10:00',
            endTime: '11:00',
            category: 'Work',
            description: '',
            accentColor: '#F6A6BE',
            completed: false,
            recurrence: 'none',
            recurringCompletions: {},
            createdAt: '2026-07-29T09:00:00.000Z',
            updatedAt: '2026-07-29T09:00:00.000Z',
          },
        ],
        dailyFocusByDate: {
          '2026-07-29': 'Import calmly',
        },
      },
      intentions: [],
      reflections: {},
      goals: [
        {
          id: 'import-goal',
          title: 'Restore backup',
          description: '',
          category: 'Work',
          status: 'active',
          createdAt: '2026-07-29T09:00:00.000Z',
          updatedAt: '2026-07-29T09:00:00.000Z',
        },
      ],
      projects: [],
    }), importedAt);

    expect(result).toMatchObject({
      importedAt: '2026-07-29T12:00:00.000Z',
      schemaVersion: 1,
      summary: {
        events: 1,
        dailyFocusEntries: 1,
        goals: 1,
      },
    });
    expect(useCalendarStore.getState().events[0]?.title).toBe('Imported planning block');
    expect(useCalendarStore.getState().dailyFocusByDate['2026-07-29']).toBe('Import calmly');
    expect(useGoalsStore.getState().goals[0]?.title).toBe('Restore backup');
  });

  it('rejects unsupported import files', async () => {
    installLocalStorageMock();
    const { importAtriaDataFromJson } = await import('./dataImport.service');

    expect(() => importAtriaDataFromJson(JSON.stringify({ schemaVersion: 99 }))).toThrow(
      'This does not look like a supported Atria backup.',
    );
    expect(() => importAtriaDataFromJson('not json')).toThrow('This file is not valid JSON.');
  });
});
