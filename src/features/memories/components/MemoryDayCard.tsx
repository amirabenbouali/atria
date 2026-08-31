import { CalendarDays, CheckCircle2, Clock, Lightbulb, Sparkles } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import AtriaBadge from '../../../shared/ui/AtriaBadge';
import AtriaCapsule from '../../../shared/ui/AtriaCapsule';
import type { MemoryDay, MemoryTimelineItem } from '../types/memories.types';
import styles from './MemoryDayCard.module.css';

type MemoryDayCardProps = {
  day: MemoryDay;
  onOpenCalendar: (dateKey: string) => void;
  onOpenIntentions: () => void;
};

function formatDate(dateKey: string) {
  const parsed = parseISO(dateKey);
  return isValid(parsed) ? format(parsed, 'EEEE, d MMMM') : dateKey;
}

function formatCompletedTime(completedAt?: string) {
  if (!completedAt) {
    return undefined;
  }

  const parsed = parseISO(completedAt);
  return isValid(parsed) ? format(parsed, 'HH:mm') : undefined;
}

function getItemIcon(item: MemoryTimelineItem) {
  if (item.type === 'focus-session') {
    return Sparkles;
  }

  if (item.type === 'completed-intention') {
    return CheckCircle2;
  }

  return CalendarDays;
}

function getItemLabel(item: MemoryTimelineItem) {
  if (item.type === 'focus-session') {
    return 'Focus';
  }

  if (item.type === 'completed-intention') {
    return 'Completed intention';
  }

  return 'Event';
}

function getItemTone(item: MemoryTimelineItem) {
  if (item.type === 'focus-session') {
    return 'violet' as const;
  }

  if (item.type === 'completed-intention') {
    return 'success' as const;
  }

  return 'rose' as const;
}

export default function MemoryDayCard({ day, onOpenCalendar, onOpenIntentions }: MemoryDayCardProps) {
  return (
    <article className={styles.dayCard} aria-label={`Memory for ${formatDate(day.dateKey)}`}>
      <header className={styles.dayHeader}>
        <div>
          <p>{format(parseISO(day.dateKey), 'yyyy')}</p>
          <h3>{formatDate(day.dateKey)}</h3>
        </div>
        <button type="button" onClick={() => onOpenCalendar(day.dateKey)}>
          View day in calendar
        </button>
      </header>

      {day.reflection ? (
        <section className={styles.reflectionBlock} aria-label="Reflection">
          {day.highlight ? <strong>{day.highlight}</strong> : <strong>A reflected day</strong>}
          {day.reflection.note ? <p>{day.reflection.note}</p> : null}
          <div className={styles.reflectionMeta}>
            {day.reflection.energy ? <AtriaCapsule label={`Energy ${day.reflection.energy}`} tone="rose" /> : null}
            {day.reflection.mood ? <AtriaCapsule label={`Mood ${day.reflection.mood}`} tone="mauve" /> : null}
          </div>
        </section>
      ) : null}

      {day.items.length ? (
        <ol className={styles.itemList}>
          {day.items.map((item) => {
            const itemIcon = getItemIcon(item);
            const completedTime = formatCompletedTime(item.completedAt);

            return (
              <li key={item.id} className={styles.memoryItem}>
                <div className={styles.itemTime}>
                  {item.start ? (
                    <>
                      <Clock size={13} aria-hidden="true" />
                      <span>{item.end ? `${item.start}-${item.end}` : item.start}</span>
                    </>
                  ) : completedTime ? (
                    <span>{completedTime}</span>
                  ) : (
                    <span>Done</span>
                  )}
                </div>
                <div className={styles.itemBody}>
                  <div className={styles.itemTopline}>
                    <AtriaBadge label={getItemLabel(item)} icon={itemIcon} tone={getItemTone(item)} />
                    {item.durationMinutes ? <AtriaCapsule label={`${item.durationMinutes} min`} tone="neutral" /> : null}
                    {item.category ? <AtriaCapsule label={item.category} tone="rose" /> : null}
                  </div>
                  <strong>{item.title}</strong>
                  {item.type === 'focus-session' && item.intentionTitle ? (
                    <button type="button" onClick={onOpenIntentions}>
                      <Lightbulb size={14} aria-hidden="true" /> {item.intentionTitle}
                    </button>
                  ) : null}
                  {item.type === 'completed-intention' && item.desiredOutcome ? <p>{item.desiredOutcome}</p> : null}
                  {item.type !== 'completed-intention' && item.description ? <p>{item.description}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}

      <footer className={styles.dayFooter}>
        <span>{day.eventCount} event{day.eventCount === 1 ? '' : 's'}</span>
        <span>{day.focusMinutes} focus min</span>
        <span>{day.completedCount} intention{day.completedCount === 1 ? '' : 's'}</span>
      </footer>
    </article>
  );
}
