import { describe, expect, it } from 'vitest';
import type { Intention } from '../types/intentions.types';
import { getIntentionNextAction } from './intentionNextAction';

const baseIntention: Intention = {
  id: 'intention-1',
  title: 'Finish dashboard',
  priority: 'medium',
  status: 'active',
  createdAt: '2026-07-29T09:00:00.000Z',
  updatedAt: '2026-07-29T09:00:00.000Z',
};

describe('getIntentionNextAction', () => {
  it('suggests defining an outcome when missing', () => {
    expect(getIntentionNextAction(baseIntention)).toBe('Review the desired outcome');
  });

  it('suggests setting duration when missing', () => {
    expect(getIntentionNextAction({ ...baseIntention, desiredOutcome: 'A calmer demo' })).toBe(
      'Estimate how much time this needs',
    );
  });

  it('recognises when an intention is ready for future scheduling', () => {
    expect(
      getIntentionNextAction({
        ...baseIntention,
        desiredOutcome: 'A calmer demo',
        estimatedMinutes: 90,
        deadline: '2026-08-02',
      }),
    ).toBe('Ready for future scheduling');
  });

  it('behaves appropriately for completed and paused intentions', () => {
    expect(getIntentionNextAction({ ...baseIntention, status: 'completed' })).toBe(
      'Captured in your progress history',
    );
    expect(getIntentionNextAction({ ...baseIntention, status: 'paused' })).toBe(
      'Paused until it feels relevant again',
    );
  });
});
