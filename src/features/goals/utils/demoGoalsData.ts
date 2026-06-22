import type { Goal } from '../types/goals.types';

export function createDemoGoals(): Goal[] {
  const timestamp = new Date().toISOString();

  return [
    {
      id: 'demo-goal-launch-portfolio',
      title: 'Launch a portfolio-ready planning system',
      description: 'Shape Atria into a polished demo that clearly shows product thinking, interaction design, and architecture.',
      category: 'Learning',
      targetDate: '2026-07-31',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'demo-goal-health-rhythm',
      title: 'Protect a sustainable weekly rhythm',
      description: 'Keep fitness, recovery, and planning habits visible inside the week.',
      category: 'Health',
      targetDate: '2026-08-15',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'demo-goal-financial-clarity',
      title: 'Build cleaner financial visibility',
      description: 'Review the month, keep runway notes current, and reduce planning ambiguity.',
      category: 'Finance',
      status: 'completed',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}
