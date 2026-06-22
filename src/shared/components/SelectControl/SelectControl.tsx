import type { SelectHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import AtriaIcon, { type AtriaIconTone } from '../../ui/AtriaIcon';
import { cn } from '../../utils/cn';
import styles from './SelectControl.module.css';

type SelectControlProps = {
  icon: LucideIcon;
  tone?: AtriaIconTone;
  className?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export default function SelectControl({
  children,
  className,
  icon,
  tone = 'rose',
  ...props
}: SelectControlProps) {
  return (
    <span className={cn(styles.selectShell, className)}>
      <AtriaIcon className={styles.selectIcon} icon={icon} tone={tone} size="sm" shell glow />
      <select className={styles.select} {...props}>
        {children}
      </select>
      <span className={styles.chevron} aria-hidden="true">⌄</span>
    </span>
  );
}
