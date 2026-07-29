import { describe, expect, it } from 'vitest';
import { getMovedEventTimeRange } from './calendarTime';

describe('calendar time utilities', () => {
  it('moves an event to a target hour while preserving duration', () => {
    expect(getMovedEventTimeRange('09:30', '11:00', 13)).toEqual({
      startTime: '13:00',
      endTime: '14:30',
    });
  });

  it('clamps late-day drops so the event stays inside the visible calendar day', () => {
    expect(getMovedEventTimeRange('09:00', '11:00', 23)).toEqual({
      startTime: '22:00',
      endTime: '24:00',
    });
  });
});
