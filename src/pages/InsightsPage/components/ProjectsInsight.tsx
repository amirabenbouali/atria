import type { ProjectInsights as ProjectInsightsData } from '../../../features/projects/utils/projectInsights';
import styles from '../InsightsPage.module.css';

type ProjectsInsightProps = {
  insights: ProjectInsightsData;
};

export default function ProjectsInsight({ insights }: ProjectsInsightProps) {
  const projectStats = [
    { label: 'Active', value: insights.activeProjects },
    { label: 'Completed', value: insights.completedProjects },
    { label: 'Archived', value: insights.archivedProjects },
  ];

  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeader}>
        <div>
          <p className="sectionLabel">Projects</p>
          <h2>Workstream Health</h2>
        </div>
        <strong>{insights.completionRate}%</strong>
      </div>
      <div className={styles.projectInsightGrid}>
        {projectStats.map((stat) => (
          <div className={styles.projectInsightCard} key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
      <div className={styles.projectCompletionTrack} aria-label={`${insights.completionRate}% project completion`}>
        <span style={{ width: `${insights.completionRate}%` }} />
      </div>
    </section>
  );
}
