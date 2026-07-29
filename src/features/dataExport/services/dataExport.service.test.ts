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
}

describe('data export service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('creates a versioned local export payload', async () => {
    installLocalStorageMock();
    const { createAtriaExport } = await import('./dataExport.service');
    const exportedAt = new Date('2026-07-29T10:00:00.000Z');
    const payload = createAtriaExport(exportedAt);

    expect(payload).toMatchObject({
      exportedAt: '2026-07-29T10:00:00.000Z',
      appVersion: '1.0.0-rc.1',
      schemaVersion: 1,
      calendar: {
        events: expect.any(Array),
        dailyFocusByDate: expect.any(Object),
      },
      intentions: expect.any(Array),
      reflections: expect.any(Object),
      settings: expect.any(Object),
    });
  });

  it('uses a readable local-date filename', async () => {
    installLocalStorageMock();
    const { getAtriaExportFilename } = await import('./dataExport.service');

    expect(getAtriaExportFilename(new Date('2026-07-29T10:00:00.000Z'))).toBe('atria-backup-2026-07-29.json');
  });
});
