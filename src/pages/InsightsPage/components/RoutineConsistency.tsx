import type { RoutineInsight } from '../utils/insightsAnalytics';
import styles from '../InsightsPage.module.css';

type RoutineConsistencyProps = {
  routines: RoutineInsight[];
};

export default function RoutineConsistency({ routines }: RoutineConsistencyProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeader}>
        <p className="sectionLabel">Routine Consistency</p>
        <strong>{routines.length}</strong>
      </div>

      {routines.length > 0 ? (
        <div className={styles.routineStack}>
          {routines.map((routine) => (
            <article className={styles.routineCard} key={routine.sourceId}>
              <div className={styles.routineTopline}>
                <span style={{ background: routine.accentColor }} />
                <div>
                  <strong>{routine.title}</strong>
                  <p>{routine.recurrence} · {routine.category}</p>
                </div>
                <em>{routine.completionPercentage}%</em>
              </div>
              <div className={styles.routineMeter}>
                <span
                  style={{
                    width: `${routine.completionPercentage}%`,
                    background: routine.accentColor,
                  }}
                />
              </div>
              <p>{routine.completedOccurrences}/{routine.totalOccurrences} occurrences complete</p>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyPanel}>
          <span>No recurring routines this week</span>
          <strong>Repeated work will surface here once scheduled.</strong>
        </div>
      )}
    </section>
  );
}
