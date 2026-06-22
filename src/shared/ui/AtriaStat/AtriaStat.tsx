import type { LucideIcon } from 'lucide-react';
import AtriaIcon, { type AtriaIconTone } from '../AtriaIcon';
import styles from './AtriaStat.module.css';

type AtriaStatProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: AtriaIconTone;
  progress?: number;
};

export default function AtriaStat({
  label,
  value,
  icon,
  tone = 'rose',
  progress,
}: AtriaStatProps) {
  return (
    <div className={styles.stat}>
      <div className={styles.topline}>
        <span>{label}</span>
        {icon ? <AtriaIcon icon={icon} tone={tone} size="sm" shell /> : null}
      </div>
      <strong>{value}</strong>
      {typeof progress === 'number' ? (
        <div className={styles.progress} aria-label={`${progress}%`}>
          <span style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} />
        </div>
      ) : null}
    </div>
  );
}
