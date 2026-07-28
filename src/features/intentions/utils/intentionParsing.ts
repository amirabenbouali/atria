import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  getDay,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday,
  nextSunday,
} from 'date-fns';
import type { PreferredTimeOfDay } from '../../timeQuality';
import type { IntentionPriority } from '../types/intentions.types';

export type ParsedIntentionInput = {
  title: string;
  deadline?: string;
  estimatedMinutes?: number;
  preferredTimeOfDay?: PreferredTimeOfDay;
  priority?: IntentionPriority;
  detectedParts: string[];
};

const weekdayParsers = {
  monday: nextMonday,
  tuesday: nextTuesday,
  wednesday: nextWednesday,
  thursday: nextThursday,
  friday: nextFriday,
  saturday: nextSaturday,
  sunday: nextSunday,
} as const;

function formatDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function getUpcomingWeekday(referenceDate: Date, weekday: keyof typeof weekdayParsers, forceNext = false) {
  const targetDay = Object.keys(weekdayParsers).indexOf(weekday) + 1;
  const currentDay = getDay(referenceDate) === 0 ? 7 : getDay(referenceDate);
  const dayDelta = targetDay >= currentDay ? targetDay - currentDay : targetDay - currentDay + 7;

  if (!forceNext && dayDelta === 0) {
    return referenceDate;
  }

  if (!forceNext) {
    return addDays(referenceDate, dayDelta);
  }

  return weekdayParsers[weekday](referenceDate);
}

function removePhrase(input: string, phrase: string) {
  const nextInput = input.replace(phrase, ' ').replace(/\s+/g, ' ').trim();
  return nextInput.length >= 3 ? nextInput : input.trim();
}

function detectDeadline(input: string, referenceDate: Date) {
  const lowerInput = input.toLowerCase();

  if (/\btoday\b/.test(lowerInput)) {
    return { deadline: formatDate(referenceDate), phrase: 'today' };
  }

  if (/\btomorrow\b/.test(lowerInput)) {
    return { deadline: formatDate(addDays(referenceDate, 1)), phrase: 'tomorrow' };
  }

  if (/\bthis weekend\b/.test(lowerInput)) {
    return { deadline: formatDate(getUpcomingWeekday(referenceDate, 'sunday')), phrase: 'this weekend' };
  }

  if (/\bthis week\b/.test(lowerInput)) {
    return { deadline: formatDate(endOfWeek(referenceDate, { weekStartsOn: 1 })), phrase: 'this week' };
  }

  if (/\bnext week\b/.test(lowerInput)) {
    return { deadline: formatDate(endOfWeek(addWeeks(referenceDate, 1), { weekStartsOn: 1 })), phrase: 'next week' };
  }

  const weekdayPattern = /\b(?:before|by)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;
  const weekdayMatch = input.match(weekdayPattern);

  if (weekdayMatch?.[1]) {
    const weekday = weekdayMatch[1].toLowerCase() as keyof typeof weekdayParsers;
    return {
      deadline: formatDate(getUpcomingWeekday(referenceDate, weekday)),
      phrase: weekdayMatch[0],
    };
  }

  const nextWeekdayPattern = /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;
  const nextWeekdayMatch = input.match(nextWeekdayPattern);

  if (nextWeekdayMatch?.[1]) {
    const weekday = nextWeekdayMatch[1].toLowerCase() as keyof typeof weekdayParsers;
    return {
      deadline: formatDate(getUpcomingWeekday(referenceDate, weekday, true)),
      phrase: nextWeekdayMatch[0],
    };
  }

  return undefined;
}

function detectDuration(input: string) {
  const halfHourMatch = input.match(/\bhalf an hour\b/i);

  if (halfHourMatch) {
    return { estimatedMinutes: 30, phrase: halfHourMatch[0] };
  }

  const durationMatch = input.match(/\bfor\s+(\d+(?:\.\d+)?)\s*(minute|minutes|hour|hours)\b/i);

  if (!durationMatch?.[1] || !durationMatch[2]) {
    return undefined;
  }

  const amount = Number(durationMatch[1]);

  if (!Number.isFinite(amount) || amount <= 0) {
    return undefined;
  }

  return {
    estimatedMinutes: Math.round(durationMatch[2].toLowerCase().startsWith('hour') ? amount * 60 : amount),
    phrase: durationMatch[0],
  };
}

function detectPreferredTime(input: string) {
  const timePatterns: Array<{ phrase: RegExp; preferredTimeOfDay: PreferredTimeOfDay; label: string }> = [
    { phrase: /\bin the morning\b/i, preferredTimeOfDay: 'morning', label: 'in the morning' },
    { phrase: /\bthis afternoon\b/i, preferredTimeOfDay: 'afternoon', label: 'this afternoon' },
    { phrase: /\bin the afternoon\b/i, preferredTimeOfDay: 'afternoon', label: 'in the afternoon' },
    { phrase: /\bin the evening\b/i, preferredTimeOfDay: 'evening', label: 'in the evening' },
    { phrase: /\btonight\b/i, preferredTimeOfDay: 'evening', label: 'tonight' },
  ];

  const detectedTime = timePatterns.find(({ phrase }) => phrase.test(input));

  if (!detectedTime) {
    return undefined;
  }

  return {
    preferredTimeOfDay: detectedTime.preferredTimeOfDay,
    phrase: detectedTime.label,
  };
}

function detectPriority(input: string) {
  if (/\blow priority\b/i.test(input)) {
    return { priority: 'low' as IntentionPriority, phrase: 'low priority' };
  }

  if (/\b(urgent|important)\b/i.test(input)) {
    const phrase = input.match(/\b(urgent|important)\b/i)?.[0] ?? 'important';
    return { priority: 'high' as IntentionPriority, phrase };
  }

  return undefined;
}

export function parseIntentionInput(input: string, referenceDate = new Date()): ParsedIntentionInput {
  let title = input.trim().replace(/\s+/g, ' ');
  const detectedParts: string[] = [];

  if (!title) {
    return { title: '', detectedParts };
  }

  const deadline = detectDeadline(title, referenceDate);
  const duration = detectDuration(title);
  const preferredTime = detectPreferredTime(title);
  const priority = detectPriority(title);

  [deadline, duration, preferredTime, priority].forEach((detectedPart) => {
    if (!detectedPart) {
      return;
    }

    detectedParts.push(detectedPart.phrase);
    title = removePhrase(title, detectedPart.phrase);
  });

  return {
    title,
    ...(deadline?.deadline ? { deadline: deadline.deadline } : {}),
    ...(duration?.estimatedMinutes ? { estimatedMinutes: duration.estimatedMinutes } : {}),
    ...(preferredTime?.preferredTimeOfDay ? { preferredTimeOfDay: preferredTime.preferredTimeOfDay } : {}),
    ...(priority?.priority ? { priority: priority.priority } : {}),
    detectedParts,
  };
}
