import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import styles from './AtriaIcon.module.css';

export type AtriaIconTone = 'rose' | 'violet' | 'mauve' | 'neutral' | 'success' | 'warning';
export type AtriaIconSize = 'sm' | 'md' | 'lg';

type AtriaIconProps = {
  icon: LucideIcon;
  size?: AtriaIconSize;
  tone?: AtriaIconTone;
  shell?: boolean;
  glow?: boolean;
  label?: string;
  className?: string;
};

export default function AtriaIcon({
  icon: Icon,
  size = 'md',
  tone = 'rose',
  shell = false,
  glow = false,
  label,
  className,
}: AtriaIconProps) {
  const iconNode = (
    <Icon
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={styles.icon}
      strokeWidth={1.8}
    />
  );

  if (!shell) {
    return (
      <span className={cn(styles.bare, styles[size], styles[tone], glow && styles.glow, className)}>
        {iconNode}
      </span>
    );
  }

  return (
    <span className={cn(styles.shell, styles[size], styles[tone], glow && styles.glow, className)}>
      {iconNode}
    </span>
  );
}
