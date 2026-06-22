import type { DailyRhythmInsight } from '../utils/insightsAnalytics';
import styles from '../InsightsPage.module.css';

type DailyRhythmProps = {
  days: DailyRhythmInsight[];
};

export default function DailyRhythm({ days }: DailyRhythmProps) {
  const maxItems = Math.max(...days.map((day) => day.total), 1);
  const maxFocusHours = Math.max(...days.map((day) => day.focusHours), 1);

  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeader}>
        <p className="sectionLabel">Daily Rhythm</p>
        <strong>7D</strong>
      </div>

      <div className={styles.rhythmGrid}>
        {days.map((day) => (
          <article className={styles.rhythmCard} key={day.date}>
            <div>
              <span>{day.label}</span>
              <strong>{day.total}</strong>
            </div>
            <div className={styles.rhythmBars} aria-label={`${day.label} rhythm`}>
              <span style={{ height: `${Math.max(8, (day.total / maxItems) * 100)}%` }} />
              <span style={{ height: `${Math.max(8, (day.focusHours / maxFocusHours) * 100)}%` }} />
            </div>
            <p>{day.completed} done · {day.focusHours}h</p>
          </article>
        ))}
      </div>
    </section>
  );
}
