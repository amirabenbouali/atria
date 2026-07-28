import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadIntentions, saveIntentions } from '../services/intentionsStorage.service';
import type { Intention } from '../types/intentions.types';
import {
  applyIntentionStatus,
  createIntentionFromDraft,
  normalizeIntentions,
  updateIntentionFromDraft,
  validateIntentionDraft,
} from './intentionValidation';

function installLocalStorageMock(initialValue: string | null) {
  const store = new Map<string, string>();

  if (initialValue !== null) {
    store.set('atria-intentions', initialValue);
  }

  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
  });

  return store;
}

describe('intention validation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects empty titles during creation', () => {
    const intention = createIntentionFromDraft({ title: '   ' }, { id: 'intention-1' });

    expect(intention).toBeNull();
    expect(validateIntentionDraft({ title: '' }).title).toBe('Title is required.');
  });

  it('trims title and optional text', () => {
    const intention = createIntentionFromDraft(
      {
        title: '  Finish dashboard  ',
        description: '  Ship the calm version  ',
        desiredOutcome: '  Portfolio-ready flow  ',
      },
      { id: 'intention-1', timestamp: '2026-07-29T09:00:00.000Z' },
    );

    expect(intention).toMatchObject({
      title: 'Finish dashboard',
      description: 'Ship the calm version',
      desiredOutcome: 'Portfolio-ready flow',
    });
  });

  it('rejects invalid estimated durations during creation and repairs persisted ones', () => {
    expect(validateIntentionDraft({ title: 'Plan week', estimatedMinutes: -15 }).estimatedMinutes).toBe(
      'Estimated duration must be a positive number.',
    );

    const [intention] = normalizeIntentions([
      {
        id: 'intention-1',
        title: 'Plan week',
        estimatedMinutes: -15,
      },
    ]);

    expect(intention.estimatedMinutes).toBeUndefined();
  });

  it('applies safe default priority and status for persisted records', () => {
    const [intention] = normalizeIntentions([
      {
        id: 'intention-1',
        title: 'Make progress',
        priority: 'urgent',
        status: 'blocked',
      },
    ]);

    expect(intention.priority).toBe('medium');
    expect(intention.status).toBe('active');
  });

  it('rejects invalid enum values during creation', () => {
    expect(validateIntentionDraft({ title: 'Write', priority: 'urgent' as never }).priority).toBe(
      'Priority is not supported.',
    );
    expect(validateIntentionDraft({ title: 'Write', energyRequired: 'extreme' as never }).energyRequired).toBe(
      'Energy requirement is not supported.',
    );
  });

  it('safely handles malformed persisted records and preserves valid records', () => {
    const intentions = normalizeIntentions([
      null,
      { title: '' },
      { id: 'valid', title: ' Prepare interview ', priority: 'high', status: 'active' },
    ]);

    expect(intentions).toHaveLength(1);
    expect(intentions[0]).toMatchObject({
      id: 'valid',
      title: 'Prepare interview',
      priority: 'high',
      status: 'active',
    });
  });

  it('ensures completed intentions have completedAt', () => {
    const [persistedIntention] = normalizeIntentions([
      {
        id: 'intention-1',
        title: 'Submit application',
        status: 'completed',
        updatedAt: '2026-07-29T12:00:00.000Z',
      },
    ]);

    expect(persistedIntention.completedAt).toBe('2026-07-29T12:00:00.000Z');

    const completed = applyIntentionStatus(
      {
        id: 'intention-2',
        title: 'Finish case study',
        priority: 'medium',
        status: 'active',
        createdAt: '2026-07-29T09:00:00.000Z',
        updatedAt: '2026-07-29T09:00:00.000Z',
      },
      'completed',
      '2026-07-29T17:00:00.000Z',
    );

    expect(completed.completedAt).toBe('2026-07-29T17:00:00.000Z');
  });

  it('preserves createdAt when updating an intention', () => {
    const intention: Intention = {
      id: 'intention-1',
      title: 'Original',
      priority: 'medium',
      status: 'active',
      createdAt: '2026-07-28T09:00:00.000Z',
      updatedAt: '2026-07-28T09:00:00.000Z',
    };

    const updatedIntention = updateIntentionFromDraft(
      intention,
      { title: 'Updated' },
      '2026-07-29T10:00:00.000Z',
    );

    expect(updatedIntention?.createdAt).toBe('2026-07-28T09:00:00.000Z');
    expect(updatedIntention?.updatedAt).toBe('2026-07-29T10:00:00.000Z');
  });

  it('clears optional fields when updating with undefined', () => {
    const intention: Intention = {
      id: 'intention-1',
      title: 'Original',
      description: 'Old description',
      deadline: '2026-08-02',
      priority: 'medium',
      status: 'active',
      createdAt: '2026-07-28T09:00:00.000Z',
      updatedAt: '2026-07-28T09:00:00.000Z',
    };

    const updatedIntention = updateIntentionFromDraft(intention, { title: 'Updated', description: undefined, deadline: undefined });

    expect(updatedIntention).not.toHaveProperty('description');
    expect(updatedIntention).not.toHaveProperty('deadline');
  });

  it('handles malformed LocalStorage JSON without throwing', () => {
    installLocalStorageMock('{not valid json');

    expect(() => loadIntentions()).not.toThrow();
    expect(loadIntentions()).toEqual([]);
  });

  it('persists a versioned intentions shape', () => {
    const store = installLocalStorageMock(null);
    const intention = createIntentionFromDraft({ title: 'Plan launch' }, { id: 'intention-1' });

    saveIntentions(intention ? [intention] : []);

    expect(JSON.parse(store.get('atria-intentions') ?? '')).toMatchObject({
      version: 1,
      intentions: [{ id: 'intention-1', title: 'Plan launch' }],
    });
  });
});
