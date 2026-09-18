import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';
import styles from './CardMenu.module.css';

export type CardMenuAction = {
  label: string;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

type CardMenuProps = {
  label: string;
  actions: CardMenuAction[];
  className?: string;
};

type MenuPosition = {
  top: number;
  left: number;
};

export default function CardMenu({ label, actions, className }: CardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 168;
    const margin = 8;
    const left = Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - margin);

    setPosition({
      top: rect.bottom + 6,
      left: Math.max(margin, left),
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', () => setIsOpen(false), true);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', () => setIsOpen(false), true);
    };
  }, [isOpen]);

  const menu = isOpen && position
    ? createPortal(
      <div
        className={styles.menu}
        role="menu"
        aria-label={label}
        ref={menuRef}
        style={{ top: position.top, left: position.left }}
      >
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            role="menuitem"
            disabled={action.disabled}
            className={cn(styles.menuItem, action.tone === 'danger' && styles.menuItemDanger)}
            onClick={(event) => {
              event.stopPropagation();
              setIsOpen(false);
              action.onSelect();
            }}
          >
            {action.label}
          </button>
        ))}
      </div>,
      document.body,
    )
    : null;

  return (
    <>
      <button
        className={cn(styles.trigger, className)}
        type="button"
        ref={triggerRef}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((current) => !current);
        }}
      >
        <MoreHorizontal size={14} aria-hidden="true" />
      </button>
      {menu}
    </>
  );
}
