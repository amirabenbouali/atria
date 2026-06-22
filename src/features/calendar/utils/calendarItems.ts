import { addDays, addWeeks, parseISO, format } from 'date-fns';
import type { CalendarEvent, FlexibleCalendarTask } from '../types/calendar.types';
import { createId } from '../../../shared/utils/id';

export function getNextTaskOrder(events: CalendarEvent[], date: string) {
  const taskOrders = events
    .filter((event): event is FlexibleCalendarTask => event.itemType === 'task' && event.date === date)
    .map((task) => task.order);

  return taskOrders.length > 0 ? Math.max(...taskOrders) + 1 : 0;
}

export function copyCalendarItem(
  item: CalendarEvent,
  options: {
    date?: string;
    order?: number;
    suffix?: string;
  } = {},
): CalendarEvent {
  const timestamp = new Date().toISOString();

  if (item.itemType === 'task') {
    return {
      ...item,
      id: createId(),
      title: options.suffix ? `${item.title} ${options.suffix}` : item.title,
      date: options.date ?? item.date,
      completed: false,
      order: options.order ?? item.order,
      recurringCompletions: {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  return {
    ...item,
    id: createId(),
    title: options.suffix ? `${item.title} ${options.suffix}` : item.title,
    date: options.date ?? item.date,
    completed: false,
    recurringCompletions: {},
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function getRelativeDate(date: string, direction: 'tomorrow' | 'nextWeek') {
  const parsedDate = parseISO(date);
  const nextDate = direction === 'tomorrow' ? addDays(parsedDate, 1) : addWeeks(parsedDate, 1);

  return format(nextDate, 'yyyy-MM-dd');
}

export function reorderTaskWithinDate(
  events: CalendarEvent[],
  taskId: string,
  direction: 'up' | 'down',
) {
  const task = events.find((event): event is FlexibleCalendarTask => event.id === taskId && event.itemType === 'task');

  if (!task) {
    return events;
  }

  const tasksForDay = events
    .filter((event): event is FlexibleCalendarTask => event.itemType === 'task' && event.date === task.date)
    .sort((first, second) => first.order - second.order || first.createdAt.localeCompare(second.createdAt));
  const currentIndex = tasksForDay.findIndex((item) => item.id === taskId);
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= tasksForDay.length) {
    return events;
  }

  const currentTask = tasksForDay[currentIndex];
  const targetTask = tasksForDay[targetIndex];
  const timestamp = new Date().toISOString();

  return events.map((event) => {
    if (event.id === currentTask.id && event.itemType === 'task') {
      return { ...event, order: targetTask.order, updatedAt: timestamp };
    }

    if (event.id === targetTask.id && event.itemType === 'task') {
      return { ...event, order: currentTask.order, updatedAt: timestamp };
    }

    return event;
  });
}

function normalizeTaskOrders(events: CalendarEvent[], date: string) {
  const tasksForDay = events
    .filter((event): event is FlexibleCalendarTask => event.itemType === 'task' && event.date === date)
    .sort((first, second) => {
      const completionSort = Number(first.completed) - Number(second.completed);

      if (completionSort !== 0) {
        return completionSort;
      }

      return first.order - second.order || first.createdAt.localeCompare(second.createdAt);
    });

  return events.map((event) => {
    if (event.itemType !== 'task' || event.date !== date) {
      return event;
    }

    const nextOrder = tasksForDay.findIndex((task) => task.id === event.id);
    return nextOrder >= 0 ? { ...event, order: nextOrder } : event;
  });
}

export function moveCalendarItem(
  events: CalendarEvent[],
  itemId: string,
  targetDate: string,
  targetTaskId?: string,
) {
  const item = events.find((event) => event.id === itemId);

  if (!item) {
    return events;
  }

  const timestamp = new Date().toISOString();

  if (item.itemType === 'event') {
    return events.map((event) =>
      event.id === itemId ? { ...event, date: targetDate, updatedAt: timestamp } : event,
    );
  }

  const targetTasks = events
    .filter(
      (event): event is FlexibleCalendarTask =>
        event.itemType === 'task' &&
        event.date === targetDate &&
        event.id !== itemId &&
        event.completed === item.completed,
    )
    .sort((first, second) => first.order - second.order || first.createdAt.localeCompare(second.createdAt));
  const targetIndex = targetTaskId
    ? targetTasks.findIndex((task) => task.id === targetTaskId)
    : targetTasks.length;
  const insertIndex = targetIndex >= 0 ? targetIndex : targetTasks.length;
  const reorderedTasks = [
    ...targetTasks.slice(0, insertIndex),
    { ...item, date: targetDate, updatedAt: timestamp },
    ...targetTasks.slice(insertIndex),
  ];

  const movedEvents = events.map((event) => {
    if (event.id === itemId && event.itemType === 'task') {
      return {
        ...event,
        date: targetDate,
        order: insertIndex,
        updatedAt: timestamp,
      };
    }

    if (event.itemType === 'task' && event.date === targetDate && event.completed === item.completed) {
      const nextOrder = reorderedTasks.findIndex((task) => task.id === event.id);
      return nextOrder >= 0 ? { ...event, order: nextOrder } : event;
    }

    return event;
  });

  return normalizeTaskOrders(normalizeTaskOrders(movedEvents, item.date), targetDate);
}
