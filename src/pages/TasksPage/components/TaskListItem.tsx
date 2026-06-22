import type { FlexibleCalendarTask } from '../../../features/calendar/types/calendar.types';
import Button from '../../../shared/components/Button/Button';
import styles from '../TasksPage.module.css';

type TaskListItemProps = {
  task: FlexibleCalendarTask;
  linkedGoalTitle?: string;
  linkedProjectTitle?: string;
  linkedProjectStatus?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

export default function TaskListItem({
  task,
  linkedGoalTitle,
  linkedProjectTitle,
  linkedProjectStatus,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskListItemProps) {
  return (
    <article className={`${styles.taskItem} ${task.completed ? styles.completedTask : ''}`}>
      <span className={styles.taskAccent} style={{ background: task.accentColor }} />
      <button className={styles.taskContent} type="button" onClick={() => onEdit(task.id)}>
        <span>{task.category}{task.recurrence !== 'none' ? ` · Repeat ${task.recurrence}` : ''}</span>
        <strong>{task.title}</strong>
        {linkedGoalTitle ? <em>Goal · {linkedGoalTitle}</em> : null}
        {linkedProjectTitle ? (
          <em>
            Project · {linkedProjectTitle}
            {linkedProjectStatus === 'archived' ? ' · archived' : ''}
          </em>
        ) : null}
        {task.description ? <p>{task.description}</p> : null}
      </button>
      <div className={styles.taskActions}>
        <Button variant="ghost" onClick={() => onToggleComplete(task.id)}>
          {task.completed ? 'Undo' : 'Done'}
        </Button>
        <Button variant="ghost" className={styles.deleteButton} onClick={() => onDelete(task.id)}>
          Delete
        </Button>
      </div>
    </article>
  );
}
