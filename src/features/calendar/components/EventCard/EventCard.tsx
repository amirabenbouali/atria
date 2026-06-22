import type { CSSProperties } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import Button from '../../../../shared/components/Button/Button';
import AtriaIcon from '../../../../shared/ui/AtriaIcon';
import { CompletedBadge, RecurringBadge } from '../../../../shared/ui/AtriaBadge';
import { cn } from '../../../../shared/utils/cn';
import type { ScheduledCalendarEvent } from '../../types/calendar.types';
import { getEventDurationHeight, getEventOffset } from '../../utils/calendarTime';
import styles from './EventCard.module.css';

type EventCardProps = {
  event: ScheduledCalendarEvent;
  stackIndex: number;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopyToTomorrow: (id: string) => void;
  onCopyToNextWeek: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

export default function EventCard({
  event,
  stackIndex,
  onEdit,
  onDuplicate,
  onCopyToTomorrow,
  onCopyToNextWeek,
  onDelete,
  onToggleComplete,
}: EventCardProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: event.id,
    data: { itemType: 'event' },
  });

  return (
    <motion.div
      className={cn(styles.eventCard, event.completed && styles.isComplete)}
      ref={setNodeRef}
      style={{
        '--event-color': event.accentColor,
        top: `${getEventOffset(event.startTime) + (stackIndex % 2) * 8}px`,
        minHeight: `${getEventDurationHeight(event.startTime, event.endTime)}px`,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.42 : undefined,
      } as CSSProperties}
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      <div className={styles.dragRail} aria-hidden="true" />
      <div className={styles.eventContent}>
        <div className={styles.eventMeta}>
          <span>{event.startTime} - {event.endTime}</span>
          <span>{event.category}</span>
        </div>
        <button
          className={styles.dragHandle}
          type="button"
          aria-label={`Drag ${event.title}`}
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          onClick={(clickEvent) => clickEvent.stopPropagation()}
        >
          <AtriaIcon icon={GripVertical} tone="neutral" size="sm" />
        </button>
        <button className={styles.contentButton} type="button" onClick={() => onEdit(event.id)}>
          <h3>{event.title}</h3>
          {event.recurrence !== 'none' ? <RecurringBadge label={`Repeat ${event.recurrence}`} /> : null}
          {event.description ? <p>{event.description}</p> : null}
          {event.completed ? <CompletedBadge /> : null}
        </button>
        <div className={styles.eventActions}>
          <Button
            variant="ghost"
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              onToggleComplete(event.id);
            }}
          >
            {event.completed ? 'Undo' : 'Done'}
          </Button>
          <Button
            variant="ghost"
            className={styles.secondaryAction}
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              onCopyToTomorrow(event.id);
            }}
          >
            +1d
          </Button>
          <Button
            variant="ghost"
            className={styles.secondaryAction}
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              onCopyToNextWeek(event.id);
            }}
          >
            +1w
          </Button>
          <Button
            variant="ghost"
            className={styles.secondaryAction}
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              onDuplicate(event.id);
            }}
          >
            Copy
          </Button>
          <Button
            variant="ghost"
            className={styles.deleteButton}
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              onDelete(event.id);
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
