export const calendarDragType = {
  item: 'calendar-item',
} as const;

export function createDayDropId(date: string) {
  return `day:${date}`;
}

export function createTaskDropId(taskId: string) {
  return `task:${taskId}`;
}

export function createHourDropId(date: string, hour: number) {
  return `hour:${date}:${hour}`;
}

export function parseDayDropId(id: string) {
  return id.startsWith('day:') ? id.slice(4) : null;
}

export function parseTaskDropId(id: string) {
  return id.startsWith('task:') ? id.slice(5) : null;
}

export function parseHourDropId(id: string) {
  if (!id.startsWith('hour:')) {
    return null;
  }

  const [, date, hour] = id.split(':');
  const parsedHour = Number(hour);

  if (!date || !Number.isInteger(parsedHour)) {
    return null;
  }

  return {
    date,
    hour: parsedHour,
  };
}
