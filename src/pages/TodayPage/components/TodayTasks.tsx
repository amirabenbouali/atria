import type { FlexibleCalendarTask } from '../../../features/calendar/types/calendar.types';
import TodayItemCard from './TodayItemCard';
import styles from '../TodayPage.module.css';

type TodayTasksProps = {
  tasks: FlexibleCalendarTask[];
  onEdit: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

export default function TodayTasks({
  tasks,
  onEdit,
  onToggleComplete,
}: TodayTasksProps) {
  return (
    <section className={styles.panelSection}>
      <div className={styles.sectionHeader}>
        <p className="sectionLabel">Flexible Tasks</p>
        <strong>{tasks.length}</strong>
      </div>

      {tasks.length > 0 ? (
        <div className={styles.itemStack}>
          {tasks.map((task) => (
            <TodayItemCard
              item={task}
              key={task.id}
              onEdit={onEdit}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyTile}>
          <span>No loose tasks</span>
          <strong>Nothing is floating outside the timeline.</strong>
        </div>
      )}
    </section>
  );
}
