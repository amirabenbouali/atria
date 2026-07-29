import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEventHandler,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import AtriaIcon, { type AtriaIconTone } from '../../ui/AtriaIcon';
import { cn } from '../../utils/cn';
import styles from './SelectControl.module.css';

type SelectOption = {
  value: string;
  label: string;
  disabled: boolean;
};

export type SelectControlChangeEvent = {
  target: {
    name?: string;
    value: string;
  };
  currentTarget: {
    name?: string;
    value: string;
  };
};

type MenuPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
};

type SelectControlProps = {
  children: ReactNode;
  icon: LucideIcon;
  tone?: AtriaIconTone;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  onChange?: (event: SelectControlChangeEvent) => void;
  onFocus?: FocusEventHandler<HTMLButtonElement>;
  required?: boolean;
  value?: string | number;
  'aria-label'?: string;
};

function getOptionText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  return Children.toArray(children).map((child) => getOptionText(child)).join('');
}

function getOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>(child)) {
      return [];
    }

    return {
      value: String(child.props.value ?? getOptionText(child.props.children)),
      label: getOptionText(child.props.children),
      disabled: Boolean(child.props.disabled),
    };
  });
}

export default function SelectControl({
  children,
  className,
  disabled,
  icon,
  id,
  name,
  onBlur,
  onChange,
  onFocus,
  required,
  tone = 'rose',
  value,
  'aria-label': ariaLabel,
}: SelectControlProps) {
  const generatedId = useId();
  const listboxId = `${id ?? generatedId}-listbox`;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const options = useMemo(() => getOptions(children), [children]);
  const selectedValue = String(value ?? options[0]?.value ?? '');
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === selectedValue));
  const selectedOption = options[selectedIndex] ?? options[0];
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const updateMenuPosition = () => {
    const trigger = containerRef.current;

    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gap = 8;
    const margin = 12;
    const minimumMenuHeight = 160;
    const spaceBelow = viewportHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const opensAbove = spaceBelow < minimumMenuHeight && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      128,
      Math.min(280, opensAbove ? spaceAbove - gap : spaceBelow - gap),
    );
    const menuWidth = Math.min(rect.width, viewportWidth - (margin * 2));
    const left = Math.min(
      Math.max(margin, rect.left),
      viewportWidth - menuWidth - margin,
    );
    const top = opensAbove
      ? Math.max(margin, rect.top - maxHeight - gap)
      : Math.min(viewportHeight - margin - maxHeight, rect.bottom + gap);

    setMenuPosition({
      left,
      top,
      width: menuWidth,
      maxHeight,
    });
  };

  useEffect(() => {
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        !containerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    updateMenuPosition();

    const handlePositionChange = () => updateMenuPosition();

    window.addEventListener('resize', handlePositionChange);
    window.addEventListener('scroll', handlePositionChange, true);

    return () => {
      window.removeEventListener('resize', handlePositionChange);
      window.removeEventListener('scroll', handlePositionChange, true);
    };
  }, [isOpen]);

  const selectValue = (nextValue: string) => {
    const nextOption = options.find((option) => option.value === nextValue);

    if (!nextOption || nextOption.disabled) {
      return;
    }

    onChange?.({
      target: {
        name,
        value: nextValue,
      },
      currentTarget: {
        name,
        value: nextValue,
      },
    });
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const moveActiveOption = (direction: 1 | -1) => {
    if (!options.length) {
      return;
    }

    setActiveIndex((currentIndex) => {
      let nextIndex = currentIndex;

      for (let step = 0; step < options.length; step += 1) {
        nextIndex = (nextIndex + direction + options.length) % options.length;

        if (!options[nextIndex]?.disabled) {
          return nextIndex;
        }
      }

      return currentIndex;
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      moveActiveOption(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (isOpen) {
        selectValue(options[activeIndex]?.value ?? selectedValue);
        return;
      }

      setIsOpen(true);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  const menuStyle: CSSProperties | undefined = menuPosition
    ? {
      left: menuPosition.left,
      top: menuPosition.top,
      width: menuPosition.width,
      maxHeight: menuPosition.maxHeight,
    }
    : undefined;

  const menu = isOpen && menuPosition
    ? createPortal(
      <div
        className={styles.menu}
        id={listboxId}
        role="listbox"
        aria-activedescendant={`${listboxId}-${options[activeIndex]?.value}`}
        ref={menuRef}
        style={menuStyle}
        tabIndex={-1}
      >
        {options.map((option, index) => {
          const isSelected = option.value === selectedValue;
          const isActive = index === activeIndex;

          return (
            <button
              aria-selected={isSelected}
              className={cn(styles.option, isSelected && styles.selectedOption, isActive && styles.activeOption)}
              disabled={option.disabled}
              id={`${listboxId}-${option.value}`}
              key={option.value}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectValue(option.value)}
              role="option"
              type="button"
            >
              <span>{option.label}</span>
              {isSelected ? <Check size={16} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>,
      document.body,
    )
    : null;

  return (
    <span className={cn(styles.selectShell, isOpen && styles.open, className)} ref={containerRef}>
      <AtriaIcon className={styles.selectIcon} icon={icon} tone={tone} size="sm" shell glow />
      <input
        aria-hidden="true"
        className={styles.hiddenInput}
        name={name}
        required={required}
        tabIndex={-1}
        value={selectedValue}
        readOnly
      />
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={styles.selectButton}
        disabled={disabled}
        id={id}
        onBlur={onBlur}
        onClick={() => setIsOpen((current) => !current)}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        ref={buttonRef}
        type="button"
      >
        <span>{selectedOption?.label ?? 'Select'}</span>
      </button>
      <span className={styles.chevron} aria-hidden="true">⌄</span>
      {menu}
    </span>
  );
}
