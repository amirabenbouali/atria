import { addDays, format, startOfWeek } from 'date-fns';
import type { ReflectionsByDate } from '../types/reflections.types';

function getWeekDate(offset: number) {
  return format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), offset), 'yyyy-MM-dd');
}

export function createDemoReflections(): ReflectionsByDate {
  const timestamp = new Date().toISOString();
  const caseStudyDate = getWeekDate(-8);
  const memoryDate = getWeekDate(-6);

  return {
    [caseStudyDate]: {
      date: caseStudyDate,
      energy: 4,
      mood: 4,
      highlight: 'The portfolio story finally clicked.',
      note: 'Reduced the demo flow to the pieces that actually explain Atria: time, intention, and reflection.',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    [memoryDate]: {
      date: memoryDate,
      energy: 3,
      mood: 5,
      highlight: 'A quieter history layer started to take shape.',
      note: 'The timeline feels better when it reads like remembered days, not a report.',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };
}
