import { describe, expect, it } from 'vitest';
import type { FlexibleCalendarTask } from '../../calendar/types/calendar.types';
import type { Project } from '../types/projects.types';
import { getGoalDepthSummary, getProjectDepth } from './projectDepth';

function project(overrides: Partial<Project>): Project {
  return {
    id: 'project-1',
    title: 'Atria launch',
    description: '',
    category: 'Work',
    stage: 'build',
    impact: 'medium',
    complexity: 'layered',
    status: 'active',
    createdAt: '2026-07-29T10:00:00.000Z',
    updatedAt: '2026-07-29T10:00:00.000Z',
    ...overrides,
  };
}

function task(overrides: Partial<FlexibleCalendarTask>): FlexibleCalendarTask {
  return {
    id: 'task-1',
    itemType: 'task',
    title: 'Polish dashboard',
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

describe('project depth utilities', () => {
  it('labels deep projects from stage, impact, complexity, and task load', () => {
    const depth = getProjectDepth(
      project({ stage: 'ship', impact: 'high', complexity: 'deep' }),
      { linkedTaskCount: 5, completedLinkedTaskCount: 2, percentage: 40 },
    );

    expect(depth.label).toBe('Deep workstream');
    expect(depth.score).toBe(15);
  });

  it('summarizes goal depth from linked projects and tasks', () => {
    const summary = getGoalDepthSummary(
      [
        project({ id: 'project-1', stage: 'shape' }),
        project({ id: 'project-2', stage: 'ship' }),
      ],
      [
        task({ id: 'task-1', completed: true }),
        task({ id: 'task-2', completed: false }),
      ],
      {
        'project-1': { linkedTaskCount: 1, completedLinkedTaskCount: 1, percentage: 100 },
        'project-2': { linkedTaskCount: 1, completedLinkedTaskCount: 0, percentage: 0 },
      },
    );

    expect(summary.label).toBe('Structured goal');
    expect(summary.activeProjectCount).toBe(2);
    expect(summary.linkedTaskCount).toBe(2);
    expect(summary.averageProjectProgress).toBe(50);
    expect(summary.deepestStage).toBe('ship');
  });
});
