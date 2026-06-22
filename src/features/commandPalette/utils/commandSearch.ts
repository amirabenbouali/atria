import type { CalendarEvent } from '../../calendar/types/calendar.types';
import type { CommandPaletteCommand } from '../types/commandPalette.types';

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function getCalendarItemSearchText(item: CalendarEvent) {
  return [
    item.title,
    item.description,
    item.category,
    item.date,
    item.itemType,
    item.recurrence,
    item.itemType === 'event' ? item.startTime : '',
    item.itemType === 'event' ? item.endTime : '',
  ]
    .join(' ')
    .toLowerCase();
}

function getCommandSearchText(command: CommandPaletteCommand) {
  return [
    command.title,
    command.subtitle,
    command.badge,
    command.type,
  ]
    .join(' ')
    .toLowerCase();
}

export function searchCalendarItems(items: CalendarEvent[], query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => getCalendarItemSearchText(item).includes(normalizedQuery));
}

export function filterCommands(commands: CommandPaletteCommand[], query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return commands;
  }

  return commands.filter((command) => getCommandSearchText(command).includes(normalizedQuery));
}

export function getCalendarItemBadge(item: CalendarEvent) {
  if (item.recurrence !== 'none') {
    return 'Recurring';
  }

  return item.itemType === 'event' ? 'Event' : 'Task';
}
