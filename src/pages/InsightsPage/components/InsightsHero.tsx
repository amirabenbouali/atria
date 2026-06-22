import MetricCard from './MetricCard';
import type { WeeklyMetrics } from '../utils/insightsAnalytics';
import styles from '../InsightsPage.module.css';

type InsightsHeroProps = {
  weekLabel: string;
  metrics: WeeklyMetrics;
};

export default function InsightsHero({ weekLabel, metrics }: InsightsHeroProps) {
  return (
    <section className={styles.heroPanel}>
      <div>
        <p className="eyebrow">Weekly Intelligence</p>
        <h2>{weekLabel}</h2>
        <span>Time distribution, completion signal, and routine consistency in one view.</span>
      </div>

      <div className={styles.heroProgress}>
        <strong>{metrics.completionPercentage}%</strong>
        <span>{metrics.completedItems}/{metrics.totalItems} complete</span>
      </div>

      <div className={styles.metricGrid}>
        <MetricCard label="Total" value={metrics.totalItems} detail="items" />
        <MetricCard label="Events" value={metrics.scheduledEvents} detail="scheduled" />
        <MetricCard label="Tasks" value={metrics.flexibleTasks} detail="flexible" />
        <MetricCard label="Focus" value={`${metrics.focusHours}h`} detail="timed blocks" />
      </div>
    </section>
  );
}
