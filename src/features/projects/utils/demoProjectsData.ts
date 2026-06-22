import type { Project } from '../types/projects.types';

export function createDemoProjects(): Project[] {
  const timestamp = new Date().toISOString();

  return [
    {
      id: 'demo-project-atria-case-study',
      title: 'Atria case study',
      description: 'Turn the product into a clean portfolio narrative with screenshots, feature notes, and a demo flow.',
      category: 'Learning',
      goalId: 'demo-goal-launch-portfolio',
      status: 'active',
      targetDate: '2026-07-12',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'demo-project-launch-ops',
      title: 'Launch operations',
      description: 'Prepare checklist, deployment notes, and a calm walkthrough plan.',
      category: 'Work',
      goalId: 'demo-goal-launch-portfolio',
      status: 'active',
      targetDate: '2026-07-20',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'demo-project-weekly-training',
      title: 'Weekly training rhythm',
      description: 'Keep strength, mobility, and recovery sessions connected to the calendar.',
      category: 'Fitness',
      goalId: 'demo-goal-health-rhythm',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'demo-project-runway-review',
      title: 'Runway review',
      description: 'Summarize financial signals and close the current planning loop.',
      category: 'Finance',
      goalId: 'demo-goal-financial-clarity',
      status: 'completed',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}
