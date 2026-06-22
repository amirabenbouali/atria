import type { CSSProperties } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import Button from '../../../../shared/components/Button/Button';
import AtriaIcon from '../../../../shared/ui/AtriaIcon';
import { CompletedBadge, RecurringBadge } from '../../../../shared/ui/AtriaBadge';
import { cn } from '../../../../shared/utils/cn';
import type { FlexibleCalendarTask } from '../../types/calendar.types';
import { createTaskDropId } from '../../utils/calendarDrag';
import styles from './TaskCard.module.css';

type TaskCardProps = {
  task: FlexibleCalendarTask;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopyToTomorrow: (id: string) => void;
  onCopyToNextWeek: (id: string) => void;
  onMoveTask: (id: string, direction: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

export default function TaskCard({
  task,
  onEdit,
  onDuplicate,
  onCopyToTomorrow,
  onCopyToNextWeek,
  onMoveTask,
  onDelete,
  onToggleComplete,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef: setDraggableNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: { itemType: 'task' },
  });
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: createTaskDropId(task.id),
    data: { taskId: task.id, date: task.date },
  });
  const setNodeRef = (node: HTMLDivElement | null) => {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  };

  return (
    <motion.div
      className={cn(styles.taskCard, task.completed && styles.isComplete, isOver && styles.isDropTarget)}
      ref={setNodeRef}
      style={{
        '--task-color': task.accentColor,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.42 : undefined,
      } as CSSProperties}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      <div className={styles.taskHeader}>
        <span>{task.category}</span>
        <button
          className={styles.dragHandle}
          type="button"
          aria-label={`Drag ${task.title}`}
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          onClick={(clickEvent) => clickEvent.stopPropagation()}
        >
          <AtriaIcon icon={GripVertical} tone="neutral" size="sm" />
        </button>
        {task.completed ? <CompletedBadge /> : null}
      </div>
      <button className={styles.contentButton} type="button" onClick={() => onEdit(task.id)}>
        <h3>{task.title}</h3>
        {task.recurrence !== 'none' ? <RecurringBadge label={`Repeat ${task.recurrence}`} /> : null}
        {task.description ? <p>{task.description}</p> : null}
      </button>
      <div className={styles.taskActions}>
        <Button
          variant="ghost"
          onClick={(clickEvent) => {
            clickEvent.stopPropagation();
            onToggleComplete(task.id);
          }}
        >
          {task.completed ? 'Undo' : 'Done'}
        </Button>
        <Button
          variant="ghost"
          className={styles.secondaryAction}
          onClick={(clickEvent) => {
            clickEvent.stopPropagation();
            onMoveTask(task.id, 'up');
          }}
        >
          ↑
        </Button>
        <Button
          variant="ghost"
          className={styles.secondaryAction}
          onClick={(clickEvent) => {
            clickEvent.stopPropagation();
            onMoveTask(task.id, 'down');
          }}
        >
          ↓
        </Button>
        <Button
          variant="ghost"
          className={styles.secondaryAction}
          onClick={(clickEvent) => {
            clickEvent.stopPropagation();
            onCopyToTomorrow(task.id);
          }}
        >
          +1d
        </Button>
        <Button
          variant="ghost"
          className={styles.secondaryAction}
          onClick={(clickEvent) => {
            clickEvent.stopPropagation();
            onCopyToNextWeek(task.id);
          }}
        >
          +1w
        </Button>
        <Button
          variant="ghost"
          className={styles.secondaryAction}
          onClick={(clickEvent) => {
            clickEvent.stopPropagation();
            onDuplicate(task.id);
          }}
        >
          Copy
        </Button>
        <Button
          variant="ghost"
          className={styles.deleteButton}
          onClick={(clickEvent) => {
            clickEvent.stopPropagation();
            onDelete(task.id);
          }}
        >
          Delete
        </Button>
      </div>
    </motion.div>
  );
}
