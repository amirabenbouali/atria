import { Archive, Check, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AtriaIcon, { type AtriaIconTone } from '../AtriaIcon';
import { cn } from '../../utils/cn';
import styles from './AtriaBadge.module.css';

type AtriaBadgeProps = {
  label: string;
  icon?: LucideIcon;
  tone?: AtriaIconTone;
  className?: string;
};

export default function AtriaBadge({ label, icon, tone = 'rose', className }: AtriaBadgeProps) {
  return (
    <span className={cn(styles.badge, styles[tone], className)}>
      {icon ? <AtriaIcon icon={icon} tone={tone} size="sm" /> : null}
      {label}
    </span>
  );
}

export function CompletedBadge() {
  return <AtriaBadge label="Completed" icon={Check} tone="success" />;
}

export function RecurringBadge({ label }: { label: string }) {
  return <AtriaBadge label={label} icon={RefreshCw} tone="rose" />;
}

export function ArchivedBadge() {
  return <AtriaBadge label="Archived" icon={Archive} tone="neutral" />;
}
