export const calendarDragType = {
  item: 'calendar-item',
} as const;

export function createDayDropId(date: string) {
  return `day:${date}`;
}

export function createTaskDropId(taskId: string) {
  return `task:${taskId}`;
}

export function parseDayDropId(id: string) {
  return id.startsWith('day:') ? id.slice(4) : null;
}

export function parseTaskDropId(id: string) {
  return id.startsWith('task:') ? id.slice(5) : null;
}
