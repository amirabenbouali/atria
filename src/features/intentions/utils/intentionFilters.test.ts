import { describe, expect, it } from 'vitest';
import type { Intention } from '../types/intentions.types';
import { getFilteredIntentions } from './intentionFilters';

const intentions: Intention[] = [
  {
    id: 'old-high',
    title: 'Prepare interview',
    description: 'Review system design notes',
    desiredOutcome: 'Feel calm by Friday',
    deadline: '2026-08-02',
    estimatedMinutes: 90,
    priority: 'high',
    preferredTimeOfDay: 'morning',
    status: 'active',
    createdAt: '2026-07-20T09:00:00.000Z',
    updatedAt: '2026-07-20T09:00:00.000Z',
  },
  {
    id: 'new-low',
    title: 'Plan restful Sunday',
    priority: 'low',
    status: 'paused',
    createdAt: '2026-07-29T09:00:00.000Z',
    updatedAt: '2026-07-29T09:00:00.000Z',
  },
  {
    id: 'medium',
    title: 'Finish dashboard',
    desiredOutcome: 'Portfolio-ready demo',
    deadline: '2026-07-31',
    estimatedMinutes: 120,
    priority: 'medium',
    preferredTimeOfDay: 'afternoon',
    status: 'scheduled',
    createdAt: '2026-07-24T09:00:00.000Z',
    updatedAt: '2026-07-24T09:00:00.000Z',
  },
];

const defaultOptions = {
  search: '',
  status: 'all' as const,
  priority: 'all' as const,
  preferredTimeOfDay: 'all' as const,
  sort: 'recent' as const,
};

describe('intention filters', () => {
  it('searches title, description, and desired outcome', () => {
    expect(getFilteredIntentions(intentions, { ...defaultOptions, search: 'system design' }).map((item) => item.id)).toEqual(['old-high']);
    expect(getFilteredIntentions(intentions, { ...defaultOptions, search: 'portfolio-ready' }).map((item) => item.id)).toEqual(['medium']);
  });

  it('filters by status and priority', () => {
    expect(getFilteredIntentions(intentions, { ...defaultOptions, status: 'paused' }).map((item) => item.id)).toEqual(['new-low']);
    expect(getFilteredIntentions(intentions, { ...defaultOptions, priority: 'high' }).map((item) => item.id)).toEqual(['old-high']);
  });

  it('sorts deadlines correctly and places missing deadlines last', () => {
    expect(getFilteredIntentions(intentions, { ...defaultOptions, sort: 'deadline' }).map((item) => item.id)).toEqual([
      'medium',
      'old-high',
      'new-low',
    ]);
  });

  it('sorts priorities deterministically', () => {
    expect(getFilteredIntentions(intentions, { ...defaultOptions, sort: 'priority' }).map((item) => item.id)).toEqual([
      'old-high',
      'medium',
      'new-low',
    ]);
  });

  it('does not mutate the original intentions array', () => {
    const originalOrder = intentions.map((intention) => intention.id);

    getFilteredIntentions(intentions, { ...defaultOptions, sort: 'alphabetical' });

    expect(intentions.map((intention) => intention.id)).toEqual(originalOrder);
  });
});
