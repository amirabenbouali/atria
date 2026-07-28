import { describe, expect, it } from 'vitest';
import { parseIntentionInput } from './intentionParsing';

const referenceDate = new Date('2026-07-29T12:00:00.000Z');

describe('parseIntentionInput', () => {
  it('extracts supported relative deadlines', () => {
    expect(parseIntentionInput('finish the dashboard tomorrow', referenceDate).deadline).toBe('2026-07-30');
    expect(parseIntentionInput('prepare before Friday', referenceDate).deadline).toBe('2026-07-31');
    expect(parseIntentionInput('plan next Monday', referenceDate).deadline).toBe('2026-08-03');
  });

  it('extracts supported durations', () => {
    expect(parseIntentionInput('write outline for 30 minutes', referenceDate).estimatedMinutes).toBe(30);
    expect(parseIntentionInput('portfolio review for 1 hour', referenceDate).estimatedMinutes).toBe(60);
    expect(parseIntentionInput('clean inbox half an hour', referenceDate).estimatedMinutes).toBe(30);
  });

  it('extracts preferred time of day', () => {
    expect(parseIntentionInput('draft story in the morning', referenceDate).preferredTimeOfDay).toBe('morning');
    expect(parseIntentionInput('review finances tonight', referenceDate).preferredTimeOfDay).toBe('evening');
  });

  it('preserves a usable title after removing supported phrases', () => {
    expect(parseIntentionInput('urgent prepare interview before Friday for 2 hours', referenceDate)).toMatchObject({
      title: 'prepare interview',
      deadline: '2026-07-31',
      estimatedMinutes: 120,
      priority: 'high',
    });
  });

  it('does not guess unsupported phrases', () => {
    const parsed = parseIntentionInput('finish migration soon-ish', referenceDate);

    expect(parsed.title).toBe('finish migration soon-ish');
    expect(parsed.deadline).toBeUndefined();
    expect(parsed.detectedParts).toEqual([]);
  });

  it('handles empty input safely', () => {
    expect(parseIntentionInput('   ', referenceDate)).toEqual({ title: '', detectedParts: [] });
  });

  it('handles mixed supported phrases deterministically for a fixed reference date', () => {
    expect(parseIntentionInput('important make progress on Ruby this afternoon next week for 90 minutes', referenceDate)).toEqual({
      title: 'make progress on Ruby',
      deadline: '2026-08-09',
      estimatedMinutes: 90,
      preferredTimeOfDay: 'afternoon',
      priority: 'high',
      detectedParts: ['next week', 'for 90 minutes', 'this afternoon', 'important'],
    });
  });
});
