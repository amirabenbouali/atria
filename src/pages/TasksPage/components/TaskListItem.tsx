import { Folder, RefreshCw, Target } from 'lucide-react';
import type { FlexibleCalendarTask } from '../../../features/calendar/types/calendar.types';
import Button from '../../../shared/components/Button/Button';
import AtriaCapsule from '../../../shared/ui/AtriaCapsule';
import { CompletedBadge } from '../../../shared/ui/AtriaBadge';
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
        <span className={styles.taskMetaRow}>
          <AtriaCapsule label={task.category} uppercase icon={Target} tone="rose" />
          {task.recurrence !== 'none' ? (
            <AtriaCapsule label={`Repeat ${task.recurrence}`} uppercase icon={RefreshCw} tone="mauve" />
          ) : null}
          {task.completed ? <CompletedBadge /> : null}
        </span>
        <strong>{task.title}</strong>
        {linkedGoalTitle ? <AtriaCapsule label={linkedGoalTitle} icon={Target} tone="violet" uppercase={false} /> : null}
        {linkedProjectTitle ? (
          <AtriaCapsule
            label={`${linkedProjectTitle}${linkedProjectStatus === 'archived' ? ' · archived' : ''}`}
            icon={Folder}
            tone={linkedProjectStatus === 'archived' ? 'neutral' : 'mauve'}
            uppercase={false}
          />
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
