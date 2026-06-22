import styles from '../InsightsPage.module.css';

type MetricCardProps = {
  label: string;
  value: string | number;
  detail: string;
};

export default function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className={styles.metricCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}
