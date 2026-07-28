import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadReflections, saveReflections } from '../services/reflectionsStorage.service';
import {
  isReflectionDate,
  normalizeReflections,
  upsertReflectionDraft,
} from './reflectionValidation';

function installLocalStorageMock(initialValue: string | null) {
  const store = new Map<string, string>();

  if (initialValue !== null) {
    store.set('atria-reflections', initialValue);
  }

  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
  });

  return store;
}

describe('reflection validation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts valid YYYY-MM-DD date keys and rejects impossible dates', () => {
    expect(isReflectionDate('2026-07-29')).toBe(true);
    expect(isReflectionDate('2026-02-31')).toBe(false);
    expect(isReflectionDate('29-07-2026')).toBe(false);
  });

  it('accepts mood and energy values from 1 to 5', () => {
    const reflection = upsertReflectionDraft(
      { date: '2026-07-29', energy: 5, mood: 1 },
      undefined,
      '2026-07-29T20:00:00.000Z',
    );

    expect(reflection).toMatchObject({ energy: 5, mood: 1 });
    expect(normalizeReflections([{ date: '2026-07-29', energy: 6, mood: 0 }])['2026-07-29']).not.toHaveProperty('energy');
  });

  it('removes empty optional strings and invalid photo URLs', () => {
    const reflection = upsertReflectionDraft(
      {
        date: '2026-07-29',
        note: '   ',
        highlight: '  A quiet win  ',
        photoUrl: 'javascript:alert(1)',
      },
      undefined,
      '2026-07-29T20:00:00.000Z',
    );

    expect(reflection).toMatchObject({ highlight: 'A quiet win' });
    expect(reflection).not.toHaveProperty('note');
    expect(reflection).not.toHaveProperty('photoUrl');
  });

  it('safely normalizes malformed persisted records', () => {
    const reflections = normalizeReflections([
      null,
      { date: 'not-a-date', note: 'Nope' },
      { date: '2026-07-29', note: '  Good day  ', photoUrl: 'https://example.com/photo.jpg' },
    ]);

    expect(Object.keys(reflections)).toEqual(['2026-07-29']);
    expect(reflections['2026-07-29']).toMatchObject({
      note: 'Good day',
      photoUrl: 'https://example.com/photo.jpg',
    });
  });

  it('enforces one reflection per date using the newest updatedAt', () => {
    const reflections = normalizeReflections([
      {
        date: '2026-07-29',
        note: 'Earlier',
        updatedAt: '2026-07-29T18:00:00.000Z',
      },
      {
        date: '2026-07-29',
        note: 'Later',
        updatedAt: '2026-07-29T20:00:00.000Z',
      },
    ]);

    expect(Object.keys(reflections)).toHaveLength(1);
    expect(reflections['2026-07-29'].note).toBe('Later');
  });

  it('preserves createdAt during an update', () => {
    const updatedReflection = upsertReflectionDraft(
      { date: '2026-07-29', note: 'Updated note' },
      {
        date: '2026-07-29',
        note: 'Original note',
        createdAt: '2026-07-29T08:00:00.000Z',
        updatedAt: '2026-07-29T08:00:00.000Z',
      },
      '2026-07-29T21:00:00.000Z',
    );

    expect(updatedReflection?.createdAt).toBe('2026-07-29T08:00:00.000Z');
    expect(updatedReflection?.updatedAt).toBe('2026-07-29T21:00:00.000Z');
  });

  it('handles malformed LocalStorage JSON without throwing', () => {
    installLocalStorageMock('{not valid json');

    expect(() => loadReflections()).not.toThrow();
    expect(loadReflections()).toEqual({});
  });

  it('persists a versioned reflections shape', () => {
    const store = installLocalStorageMock(null);
    const reflection = upsertReflectionDraft(
      { date: '2026-07-29', note: 'A steady day' },
      undefined,
      '2026-07-29T20:00:00.000Z',
    );

    saveReflections(reflection ? { [reflection.date]: reflection } : {});

    expect(JSON.parse(store.get('atria-reflections') ?? '')).toMatchObject({
      version: 1,
      reflections: [{ date: '2026-07-29', note: 'A steady day' }],
    });
  });
});
