import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  Command,
  FilePlus2,
  Navigation,
  RotateCcw,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import AtriaIcon from '../../../../shared/ui/AtriaIcon';
import AtriaBadge from '../../../../shared/ui/AtriaBadge';
import type { CommandPaletteCommandType } from '../../types/commandPalette.types';
import { useCommandPaletteCommands } from '../../hooks/useCommandPaletteCommands';
import styles from './CommandPalette.module.css';

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
  onResetDemoData: () => void;
};

const titleId = 'command-palette-title';

const commandIcons: Record<CommandPaletteCommandType, LucideIcon> = {
  navigation: Navigation,
  creation: FilePlus2,
  calendarItem: CalendarDays,
  system: RotateCcw,
};

export default function CommandPalette({
  isOpen,
  onClose,
  onResetDemoData,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const commands = useCommandPaletteCommands({ query, onClose, onResetDemoData });
  const activeCommand = commands[activeIndex];

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIndex(0);
      return;
    }

    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (activeIndex > commands.length - 1) {
      setActiveIndex(Math.max(commands.length - 1, 0));
    }
  }, [activeIndex, commands.length]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((currentIndex) => (currentIndex + 1) % Math.max(commands.length, 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((currentIndex) => (currentIndex - 1 + Math.max(commands.length, 1)) % Math.max(commands.length, 1));
      return;
    }

    if (event.key === 'Enter' && activeCommand) {
      event.preventDefault();
      activeCommand.execute();
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.section
            aria-labelledby={titleId}
            aria-modal="true"
            className={styles.palette}
            role="dialog"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onKeyDown={handleKeyDown}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.header}>
              <div>
                <p className="eyebrow">Command Signal</p>
                <h2 id={titleId}>Search Atria</h2>
              </div>
              <span>Esc</span>
            </div>

            <label className={styles.searchBox}>
              <span>Search or command</span>
              <div className={styles.searchField}>
                <AtriaIcon icon={Search} tone="rose" size="sm" glow />
                <input
                  aria-label="Search commands and calendar items"
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Jump, create, or find..."
                />
              </div>
            </label>

            <div className={styles.resultList} role="listbox" aria-label="Command results">
              {commands.length > 0 ? (
                commands.map((command, index) => (
                  <button
                    aria-selected={index === activeIndex}
                    className={index === activeIndex ? styles.activeResult : styles.result}
                    key={command.id}
                    role="option"
                    type="button"
                    onClick={command.execute}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <AtriaIcon
                      className={styles.resultIcon}
                      icon={commandIcons[command.type] ?? Command}
                      tone={command.type === 'system' ? 'warning' : command.type === 'calendarItem' ? 'mauve' : 'rose'}
                      size="sm"
                      shell
                      glow
                    />
                    <span className={styles.resultBody}>
                      <strong>{command.title}</strong>
                      <em>{command.subtitle}</em>
                    </span>
                    <AtriaBadge label={command.badge} tone={command.type === 'system' ? 'warning' : 'rose'} />
                  </button>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <span>No signal found</span>
                  <strong>Try a title, category, route, or date.</strong>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <span>↑↓ Move</span>
              <span>Enter Select</span>
              <span>Cmd/Ctrl K</span>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
