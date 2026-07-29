import { addDays, format, startOfWeek } from 'date-fns';
import type { ReflectionsByDate } from '../types/reflections.types';

function getWeekDate(offset: number) {
  return format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), offset), 'yyyy-MM-dd');
}

export function createDemoReflections(): ReflectionsByDate {
  const timestamp = new Date().toISOString();
  const writingDate = getWeekDate(-10);
  const demoDate = getWeekDate(-9);
  const caseStudyDate = getWeekDate(-8);
  const memoryDate = getWeekDate(-6);

  return {
    [writingDate]: {
      date: writingDate,
      energy: 4,
      mood: 4,
      highlight: 'The first real case-study draft landed.',
      note: 'Morning focus felt clean and specific.',
      createdAt: timestamp,
      updatedAt: `${writingDate}T20:00:00.000Z`,
    },
    [demoDate]: {
      date: demoDate,
      energy: 3,
      mood: 4,
      highlight: 'The demo flow became easier to explain.',
      note: 'Less feature listing, more story.',
      createdAt: timestamp,
      updatedAt: `${demoDate}T20:00:00.000Z`,
    },
    [caseStudyDate]: {
      date: caseStudyDate,
      energy: 4,
      mood: 4,
      highlight: 'The portfolio story finally clicked.',
      note: 'Reduced the demo flow to the pieces that actually explain Atria: time, intention, and reflection.',
      createdAt: timestamp,
      updatedAt: `${caseStudyDate}T20:00:00.000Z`,
    },
    [memoryDate]: {
      date: memoryDate,
      energy: 3,
      mood: 5,
      highlight: 'A quieter history layer started to take shape.',
      note: 'The timeline feels better when it reads like remembered days, not a report.',
      createdAt: timestamp,
      updatedAt: `${memoryDate}T20:00:00.000Z`,
    },
  };
}
