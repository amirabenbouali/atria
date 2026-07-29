import { describe, expect, it } from 'vitest';
import type { CalendarEvent, FlexibleCalendarTask } from '../types/calendar.types';
import { reorderTaskWithinDate } from './calendarItems';
import { getTaskOrderMetadata, sortTasksByStatus } from './eventSorting';

function task(overrides: Partial<FlexibleCalendarTask>): FlexibleCalendarTask {
  return {
    id: 'task-1',
    itemType: 'task',
    title: 'Task',
    date: '2026-07-29',
    category: 'Work',
    description: '',
    accentColor: '#f39bbc',
    completed: false,
    recurrence: 'none',
    recurringCompletions: {},
    order: 0,
    createdAt: '2026-07-29T10:00:00.000Z',
    updatedAt: '2026-07-29T10:00:00.000Z',
    ...overrides,
  };
}

describe('task ordering', () => {
  it('reports task position inside its completion lane', () => {
    const tasks = [
      task({ id: 'first', order: 0 }),
      task({ id: 'second', order: 1 }),
      task({ id: 'done', completed: true, order: 0 }),
    ];

    expect(getTaskOrderMetadata(tasks, 'first')).toEqual({
      position: 1,
      total: 2,
      canMoveUp: false,
      canMoveDown: true,
    });
    expect(getTaskOrderMetadata(tasks, 'done')).toEqual({
      position: 1,
      total: 1,
      canMoveUp: false,
      canMoveDown: false,
    });
  });

  it('reorders incomplete tasks without crossing into completed tasks', () => {
    const events: CalendarEvent[] = [
      task({ id: 'first', order: 0 }),
      task({ id: 'second', order: 1 }),
      task({ id: 'done', completed: true, order: 0 }),
    ];
    const reordered = reorderTaskWithinDate(events, 'second', 'up');

    expect(sortTasksByStatus(reordered.filter((event): event is FlexibleCalendarTask => event.itemType === 'task')).map((item) => item.id)).toEqual([
      'second',
      'first',
      'done',
    ]);
  });

  it('reorders completed tasks only within the completed lane', () => {
    const events: CalendarEvent[] = [
      task({ id: 'open', order: 0 }),
      task({ id: 'done-one', completed: true, order: 0 }),
      task({ id: 'done-two', completed: true, order: 1 }),
    ];
    const reordered = reorderTaskWithinDate(events, 'done-two', 'up');

    expect(sortTasksByStatus(reordered.filter((event): event is FlexibleCalendarTask => event.itemType === 'task')).map((item) => item.id)).toEqual([
      'open',
      'done-two',
      'done-one',
    ]);
  });
});
