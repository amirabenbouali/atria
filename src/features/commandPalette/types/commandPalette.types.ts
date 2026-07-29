export type CommandPaletteCommandType =
  | 'navigation'
  | 'creation'
  | 'calendarItem'
  | 'goal'
  | 'project'
  | 'intention'
  | 'system';

export type CommandPaletteCommand = {
  id: string;
  title: string;
  subtitle: string;
  type: CommandPaletteCommandType;
  badge: string;
  accentColor?: string;
  execute: () => void;
};
