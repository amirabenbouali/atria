import { describe, expect, it } from 'vitest';
import type { CalendarEvent, FlexibleCalendarTask } from '../../calendar/types/calendar.types';
import type { Goal } from '../../goals/types/goals.types';
import type { Intention } from '../../intentions/types/intentions.types';
import type { Project } from '../../projects/types/projects.types';
import {
  searchCalendarItems,
  searchGoals,
  searchIntentions,
  searchProjects,
} from './commandSearch';

const timestamp = '2026-07-29T09:00:00.000Z';

function task(overrides: Partial<FlexibleCalendarTask>): FlexibleCalendarTask {
  return {
    id: 'task-1',
    itemType: 'task',
    title: 'Review screenshots',
    date: '2026-07-29',
    category: 'Work',
    description: '',
    accentColor: '#F6A6BE',
    completed: false,
    recurrence: 'none',
    recurringCompletions: {},
    order: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function goal(overrides: Partial<Goal>): Goal {
  return {
    id: 'goal-1',
    title: 'Launch portfolio',
    description: 'Ship a calmer case study',
    category: 'Work',
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function project(overrides: Partial<Project>): Project {
  return {
    id: 'project-1',
    title: 'Atria case study',
    description: 'Prepare recruiter-ready product narrative',
    category: 'Learning',
    stage: 'ship',
    impact: 'high',
    complexity: 'layered',
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function intention(overrides: Partial<Intention>): Intention {
  return {
    id: 'intention-1',
    title: 'Write portfolio story',
    description: 'Turn product work into a clear narrative',
    desiredOutcome: 'A recruiter can understand the system in two minutes',
    priority: 'high',
    energyRequired: 'high',
    preferredTimeOfDay: 'morning',
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

describe('command palette deep search', () => {
  it('finds calendar tasks through linked goal and project context', () => {
    const linkedGoal = goal({ id: 'goal-launch', title: 'Portfolio launch' });
    const linkedProject = project({ id: 'project-case-study', title: 'Case study polish' });
    const items: CalendarEvent[] = [
      task({
        id: 'linked-task',
        title: 'Tighten copy',
        goalId: linkedGoal.id,
        projectId: linkedProject.id,
      }),
      task({ id: 'unlinked-task', title: 'Buy groceries', category: 'Personal' }),
    ];

    expect(searchCalendarItems(items, 'portfolio polish', {
      goals: [linkedGoal],
      projects: [linkedProject],
    }).map((item) => item.id)).toEqual(['linked-task']);
  });

  it('finds projects through their linked goal text', () => {
    const linkedGoal = goal({ id: 'goal-health', title: 'Health rhythm' });
    const projects = [
      project({ id: 'project-training', title: 'Weekly training plan', goalId: linkedGoal.id }),
      project({ id: 'project-portfolio', title: 'Portfolio release' }),
    ];

    expect(searchProjects(projects, 'health', { goals: [linkedGoal] }).map((item) => item.id)).toEqual([
      'project-training',
    ]);
  });

  it('finds intentions by outcome, energy, and preferred time', () => {
    const intentions = [
      intention({ id: 'deep-morning', desiredOutcome: 'Finish the project architecture' }),
      intention({ id: 'low-evening', title: 'Read notes', energyRequired: 'low', preferredTimeOfDay: 'evening' }),
    ];

    expect(searchIntentions(intentions, 'architecture high morning').map((item) => item.id)).toEqual([
      'deep-morning',
    ]);
  });

  it('finds goals by objective language and status', () => {
    const goals = [
      goal({ id: 'active-launch', title: 'Launch portfolio', status: 'active' }),
      goal({ id: 'archived-finance', title: 'Finance cleanup', status: 'archived' }),
    ];

    expect(searchGoals(goals, 'archived finance').map((item) => item.id)).toEqual(['archived-finance']);
  });
});
