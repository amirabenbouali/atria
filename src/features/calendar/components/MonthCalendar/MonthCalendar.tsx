import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import Button from '../../../../shared/components/Button/Button';
import GlassPanel from '../../../../shared/ui/GlassPanel/GlassPanel';
import { RecurringBadge } from '../../../../shared/ui/AtriaBadge';
import type { CalendarEvent, CalendarModalPreset, CalendarView } from '../../types/calendar.types';
import { getMonthGridDays } from '../../utils/calendarDates';
import { getFlexibleTasksForDate, getScheduledEventsForDate, sortEventsByTime, sortTasksByStatus } from '../../utils/eventSorting';
import CalendarViewSwitcher from '../CalendarViewSwitcher/CalendarViewSwitcher';
import styles from './MonthCalendar.module.css';

type MonthCalendarProps = {
  events: CalendarEvent[];
  selectedDate: Date;
  weekStartsOnMonday: boolean;
  showWeekends: boolean;
  calendarView: CalendarView;
  onChangeView: (view: CalendarView) => void;
  onCreateItem: (preset: CalendarModalPreset) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

export default function MonthCalendar({
  events,
  selectedDate,
  weekStartsOnMonday,
  showWeekends,
  calendarView,
  onChangeView,
  onCreateItem,
  onEdit,
  onDelete,
  onToggleComplete,
}: MonthCalendarProps) {
  const monthDays = getMonthGridDays(selectedDate, weekStartsOnMonday, showWeekends);
  const weekDayLabels = monthDays.slice(0, showWeekends ? 7 : 5).map((day) => day.shortName);
  const hasItems = events.length > 0;

  return (
    <GlassPanel
      as={motion.section}
      className={styles.monthShell}
      style={{
        '--month-day-count': weekDayLabels.length,
        '--month-grid-min-width': `${weekDayLabels.length * 138}px`,
      } as CSSProperties}
      aria-label="Monthly calendar"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <header className={styles.viewHeader}>
        <div>
          <h2>Month view</h2>
          <p>Scan the shape of the month without leaving your planning system.</p>
        </div>
        <CalendarViewSwitcher activeView={calendarView} onChangeView={onChangeView} />
      </header>

      <div className={styles.monthHeader}>
        {weekDayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className={styles.monthGrid}>
        {monthDays.map((day) => {
          const scheduledEvents = sortEventsByTime(getScheduledEventsForDate(events, day.isoDate));
          const tasks = sortTasksByStatus(getFlexibleTasksForDate(events, day.isoDate));
          const dayItems = [...scheduledEvents, ...tasks];

          return (
            <article
              className={`${styles.monthDay} ${day.isToday ? styles.todayMonthDay : ''} ${!day.isCurrentMonth ? styles.outsideMonthDay : ''}`}
              key={day.isoDate}
              aria-label={day.dateLabel}
            >
              <header className={styles.dayTopline}>
                <div>
                  <span>{day.shortName}</span>
                  <strong>{day.dateLabel}</strong>
                </div>
                <button
                  type="button"
                  aria-label={`Add task on ${day.dateLabel}`}
                  onClick={() => onCreateItem({ itemType: 'task', date: day.isoDate })}
                >
                  <Plus size={15} aria-hidden="true" />
                </button>
              </header>

              {dayItems.length > 0 ? (
                <div className={styles.monthItems}>
                  {dayItems.slice(0, 4).map((item) => (
                    <div
                      className={`${styles.monthItem} ${item.completed ? styles.completedItem : ''}`}
                      key={item.id}
                      style={{ '--item-color': item.accentColor } as CSSProperties}
                    >
                      <button className={styles.itemContent} type="button" onClick={() => onEdit(item.id)}>
                        <span>{item.itemType === 'event' ? `${item.startTime} - ${item.endTime}` : item.category}</span>
                        <strong>{item.title}</strong>
                        {item.recurrence !== 'none' ? <RecurringBadge label={item.recurrence} /> : null}
                      </button>
                      <div className={styles.itemActions}>
                        <button type="button" aria-label={`Toggle ${item.title}`} onClick={() => onToggleComplete(item.id)}>
                          <Check size={14} aria-hidden="true" />
                        </button>
                        <button type="button" aria-label={`Edit ${item.title}`} onClick={() => onEdit(item.id)}>
                          <Pencil size={13} aria-hidden="true" />
                        </button>
                        <button type="button" aria-label={`Delete ${item.title}`} onClick={() => onDelete(item.id)}>
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {dayItems.length > 4 ? (
                    <span className={styles.moreItems}>+{dayItems.length - 4} more</span>
                  ) : null}
                </div>
              ) : (
                <div className={styles.emptyDay}>
                  <span>Open</span>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {!hasItems ? (
        <div className={styles.emptyState}>
          <p className="eyebrow">Open Month</p>
          <h2>Give the month one anchor.</h2>
          <span>Add a recurring routine, project session, or task to start shaping it.</span>
          <Button onClick={() => onCreateItem({ itemType: 'event' })}>New Event</Button>
        </div>
      ) : null}
    </GlassPanel>
  );
}
