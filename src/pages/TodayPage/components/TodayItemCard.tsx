import type { CSSProperties } from 'react';
import type { CalendarEvent } from '../../../features/calendar/types/calendar.types';
import Button from '../../../shared/components/Button/Button';
import styles from '../TodayPage.module.css';

type TodayItemCardProps = {
  item: CalendarEvent;
  onEdit: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

export default function TodayItemCard({
  item,
  onEdit,
  onToggleComplete,
}: TodayItemCardProps) {
  const timeLabel = item.itemType === 'event' ? `${item.startTime} - ${item.endTime}` : 'Flexible';

  return (
    <article
      className={`${styles.todayItemCard} ${item.completed ? styles.completedItem : ''}`}
      style={{ '--today-item-color': item.accentColor } as CSSProperties}
    >
      <div className={styles.itemAccent} style={{ background: item.accentColor }} aria-hidden="true" />
      <button className={styles.itemContent} type="button" onClick={() => onEdit(item.id)}>
        <span>{timeLabel} · {item.category}</span>
        <strong>{item.title}</strong>
        {item.description ? <p>{item.description}</p> : null}
        {item.recurrence !== 'none' ? <em>Repeat {item.recurrence}</em> : null}
      </button>
      <Button variant="ghost" onClick={() => onToggleComplete(item.id)}>
        {item.completed ? 'Undo' : 'Done'}
      </Button>
    </article>
  );
}
