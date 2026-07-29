import { ArrowDown, ArrowUp, Folder, RefreshCw, Target } from 'lucide-react';
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
  orderPosition?: number;
  orderTotal?: number;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onMoveTask: (id: string, direction: 'up' | 'down') => void;
};

export default function TaskListItem({
  task,
  linkedGoalTitle,
  linkedProjectTitle,
  linkedProjectStatus,
  orderPosition = 0,
  orderTotal = 0,
  canMoveUp = true,
  canMoveDown = true,
  onEdit,
  onDelete,
  onToggleComplete,
  onMoveTask,
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
          {orderPosition > 0 && orderTotal > 1 ? (
            <span className={styles.orderBadge}>{orderPosition}/{orderTotal}</span>
          ) : null}
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
        <Button
          variant="ghost"
          className={styles.orderButton}
          disabled={!canMoveUp}
          aria-label={`Move ${task.title} up`}
          onClick={() => onMoveTask(task.id, 'up')}
        >
          <ArrowUp size={14} aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          className={styles.orderButton}
          disabled={!canMoveDown}
          aria-label={`Move ${task.title} down`}
          onClick={() => onMoveTask(task.id, 'down')}
        >
          <ArrowDown size={14} aria-hidden="true" />
        </Button>
        <Button variant="ghost" className={styles.deleteButton} onClick={() => onDelete(task.id)}>
          Delete
        </Button>
      </div>
    </article>
  );
}
