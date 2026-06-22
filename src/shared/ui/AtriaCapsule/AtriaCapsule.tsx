import type { LucideIcon } from 'lucide-react';
import AtriaIcon, { type AtriaIconTone } from '../AtriaIcon';
import { cn } from '../../utils/cn';
import styles from './AtriaCapsule.module.css';

type AtriaCapsuleProps = {
  label: string;
  icon?: LucideIcon;
  tone?: AtriaIconTone;
  size?: 'sm' | 'md';
  variant?: 'subtle' | 'solid';
  uppercase?: boolean;
  className?: string;
};

export default function AtriaCapsule({
  label,
  icon,
  tone = 'rose',
  size = 'sm',
  variant = 'subtle',
  uppercase = true,
  className,
}: AtriaCapsuleProps) {
  return (
    <span className={cn(styles.capsule, styles[tone], styles[size], styles[variant], uppercase && styles.uppercase, className)}>
      {icon ? <AtriaIcon icon={icon} tone={tone} size="sm" /> : null}
      <span>{label}</span>
    </span>
  );
}
