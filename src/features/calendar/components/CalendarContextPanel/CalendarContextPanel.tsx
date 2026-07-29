import { format } from 'date-fns';
import { CalendarClock, Check, Circle, Target } from 'lucide-react';
import AtriaCapsule from '../../../../shared/ui/AtriaCapsule';
import AtriaIcon from '../../../../shared/ui/AtriaIcon';
import type { CalendarEvent } from '../../types/calendar.types';
import { getVisibleCalendarOccurrences } from '../../utils/calendarRecurrence';
import { formatInputDate } from '../../utils/calendarDates';
import { getScheduledEventsForDate, getFlexibleTasksForDate, sortEventsByTime, sortTasksByStatus } from '../../utils/eventSorting';
import styles from './CalendarContextPanel.module.css';

type CalendarContextPanelProps = {
  sourceEvents: CalendarEvent[];
  weekEvents: CalendarEvent[];
  weekStartsOnMonday: boolean;
  onToggleComplete: (id: string) => void;
};

function getTodayItems(sourceEvents: CalendarEvent[], weekStartsOnMonday: boolean) {
  const today = new Date();
  const todayDate = formatInputDate(today);
  return getVisibleCalendarOccurrences(sourceEvents, today, weekStartsOnMonday).filter((event) => event.date === todayDate);
}

function getPrimaryFocus(items: CalendarEvent[]) {
  const scheduled = sortEventsByTime(getScheduledEventsForDate(items, formatInputDate()));
  const incompleteTask = sortTasksByStatus(getFlexibleTasksForDate(items, formatInputDate())).find((task) => !task.completed);

  return scheduled[0] ?? incompleteTask ?? null;
}

export default function CalendarContextPanel({
  sourceEvents,
  weekEvents,
  weekStartsOnMonday,
  onToggleComplete,
}: CalendarContextPanelProps) {
  const todayItems = getTodayItems(sourceEvents, weekStartsOnMonday);
  const todayTasks = sortTasksByStatus(getFlexibleTasksForDate(todayItems, formatInputDate())).slice(0, 4);
  const primaryFocus = getPrimaryFocus(todayItems);
  const completedWeekItems = weekEvents.filter((event) => event.completed).length;
  const completionRate = weekEvents.length === 0 ? 0 : Math.round((completedWeekItems / weekEvents.length) * 100);

  return (
    <section className={styles.contextPanel} aria-label="Context panel">
      <header className={styles.panelHeader}>
        <div>
          <h2>Today’s focus</h2>
          <span>{format(new Date(), 'EEEE')}</span>
        </div>
      </header>

      <article className={styles.focusCard}>
        <p>Primary orbit</p>
        {primaryFocus ? (
          <>
            <h3>{primaryFocus.title}</h3>
            {primaryFocus.description ? <span>{primaryFocus.description}</span> : null}
            <div className={styles.capsuleRow}>
              {primaryFocus.itemType === 'event' ? (
                <AtriaCapsule label={`${primaryFocus.startTime}-${primaryFocus.endTime}`} tone="neutral" uppercase={false} />
              ) : null}
              <AtriaCapsule label={primaryFocus.category} tone="rose" />
            </div>
          </>
        ) : (
          <>
            <h3>Open schedule</h3>
            <span>No primary signal has been placed for today.</span>
          </>
        )}
      </article>

      <section className={styles.panelSection}>
        <div className={styles.sectionHeader}>
          <h2>Tasks in orbit</h2>
          <span>{todayTasks.filter((task) => !task.completed).length} remaining</span>
        </div>
        <div className={styles.taskStack}>
          {todayTasks.length ? todayTasks.map((task) => (
            <button
              className={task.completed ? styles.completedTaskRow : styles.taskRow}
              key={task.id}
              type="button"
              onClick={() => onToggleComplete(task.id)}
              aria-label={`${task.completed ? 'Mark incomplete' : 'Mark complete'}: ${task.title}`}
            >
              <AtriaIcon icon={task.completed ? Check : Circle} tone={task.completed ? 'success' : 'neutral'} size="sm" />
              <span>
                <strong>{task.title}</strong>
                <em>{task.category} · Today</em>
              </span>
            </button>
          )) : (
            <div className={styles.emptyTasks}>No loose signals today.</div>
          )}
        </div>
      </section>

      <section className={styles.panelSection}>
        <div className={styles.sectionHeader}>
          <h2>Week pulse</h2>
          <span>{completedWeekItems} of {weekEvents.length}</span>
        </div>
        <div className={styles.progressBlock}>
          <AtriaIcon icon={CalendarClock} tone="rose" size="md" shell />
          <div>
            <strong>{completionRate}%</strong>
            <span>aligned</span>
          </div>
        </div>
        <div className={styles.progressTrack} aria-label={`${completionRate}% weekly orbit aligned`}>
          <span style={{ width: `${completionRate}%` }} />
        </div>
        <AtriaCapsule icon={Target} label="Weekly orbit" tone="violet" />
      </section>
    </section>
  );
}
