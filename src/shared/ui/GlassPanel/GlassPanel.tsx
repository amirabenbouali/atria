import { forwardRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './GlassPanel.module.css';

type GlassPanelProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

const GlassPanel = forwardRef<HTMLElement, GlassPanelProps<ElementType>>(function GlassPanel(
  {
    as,
    children,
    className,
    ...props
  },
  ref,
) {
  const Component = as ?? 'div';

  return (
    <Component className={cn(styles.panel, className)} ref={ref} {...props}>
      {children}
    </Component>
  );
});

export default GlassPanel;
