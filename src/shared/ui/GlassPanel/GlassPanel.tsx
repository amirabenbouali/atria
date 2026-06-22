import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './GlassPanel.module.css';

type GlassPanelProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export default function GlassPanel<T extends ElementType = 'div'>({
  as,
  children,
  className,
  ...props
}: GlassPanelProps<T>) {
  const Component = as ?? 'div';

  return (
    <Component className={cn(styles.panel, className)} {...props}>
      {children}
    </Component>
  );
}
