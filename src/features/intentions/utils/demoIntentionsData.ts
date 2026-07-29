import { addDays, format, startOfWeek } from 'date-fns';
import type { Intention } from '../types/intentions.types';

function getWeekDate(offset: number) {
  return format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), offset), 'yyyy-MM-dd');
}

function getTimestamp(offset: number, time = '17:30') {
  return `${getWeekDate(offset)}T${time}:00.000Z`;
}

export function createDemoIntentions(): Intention[] {
  const timestamp = new Date().toISOString();

  return [
    {
      id: 'demo-intention-case-study-complete',
      title: 'Finish the case study narrative',
      description: 'Turn the product build into a readable portfolio story.',
      desiredOutcome: 'A polished case study that explains the calendar-first system clearly.',
      priority: 'high',
      energyRequired: 'high',
      preferredTimeOfDay: 'morning',
      status: 'completed',
      completedAt: getTimestamp(-8, '16:45'),
      createdAt: timestamp,
      updatedAt: getTimestamp(-8, '16:45'),
    },
    {
      id: 'demo-intention-memory-foundation',
      title: 'Map the memory timeline foundation',
      description: 'Define what Atria should remember from calendar work and reflection notes.',
      desiredOutcome: 'A calm timeline that feels personal rather than analytical.',
      priority: 'medium',
      energyRequired: 'medium',
      preferredTimeOfDay: 'afternoon',
      status: 'completed',
      completedAt: getTimestamp(-6, '15:20'),
      createdAt: timestamp,
      updatedAt: getTimestamp(-6, '15:20'),
    },
    {
      id: 'demo-intention-launch-portfolio',
      title: 'Prepare the portfolio launch',
      description: 'Keep the walkthrough tight and recruiter-friendly.',
      desiredOutcome: 'A confident demo flow across Calendar, Today, Projects, and Insights.',
      priority: 'high',
      energyRequired: 'high',
      preferredTimeOfDay: 'morning',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}
