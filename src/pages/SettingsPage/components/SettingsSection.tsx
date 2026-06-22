import type { ReactNode } from 'react';
import styles from '../SettingsPage.module.css';

type SettingsSectionProps = {
  title: string;
  eyebrow: string;
  children: ReactNode;
};

export default function SettingsSection({
  title,
  eyebrow,
  children,
}: SettingsSectionProps) {
  return (
    <section className={styles.settingsSection}>
      <div className={styles.sectionHeader}>
        <p className="sectionLabel">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}
