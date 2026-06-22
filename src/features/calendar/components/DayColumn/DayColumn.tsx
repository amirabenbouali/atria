import { useDroppable } from '@dnd-kit/core';
import type { CalendarEvent, CalendarModalPreset } from '../../types/calendar.types';
import type { WeekDay } from '../../utils/calendarDates';
import { formatHour } from '../../utils/calendarTime';
import { createDayDropId } from '../../utils/calendarDrag';
import {
  getFlexibleTasksForDate,
  getScheduledEventsForDate,
  sortEventsByTime,
  sortTasksByStatus,
} from '../../utils/eventSorting';
import EventCard from '../EventCard/EventCard';
import TaskCard from '../TaskCard/TaskCard';
import styles from './DayColumn.module.css';

type DayColumnProps = {
  day: WeekDay;
  events: CalendarEvent[];
  hours: number[];
  onCreateItem: (preset: CalendarModalPreset) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopyToTomorrow: (id: string) => void;
  onCopyToNextWeek: (id: string) => void;
  onMoveTask: (id: string, direction: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

export default function DayColumn({
  day,
  events,
  hours,
  onCreateItem,
  onEdit,
  onDuplicate,
  onCopyToTomorrow,
  onCopyToNextWeek,
  onMoveTask,
  onDelete,
  onToggleComplete,
}: DayColumnProps) {
  const sortedEvents = sortEventsByTime(getScheduledEventsForDate(events, day.isoDate));
  const sortedTasks = sortTasksByStatus(getFlexibleTasksForDate(events, day.isoDate));
  const { isOver, setNodeRef } = useDroppable({
    id: createDayDropId(day.isoDate),
    data: { date: day.isoDate },
  });

  return (
    <article
      className={`${day.isToday ? styles.todayColumn : styles.dayColumn} ${isOver ? styles.isDropTarget : ''}`}
      ref={setNodeRef}
      aria-label={day.name}
    >
      <header className={styles.dayPlannerHeader}>
        <div className={styles.daySummary}>
          <span>{sortedEvents.length} events</span>
          <span>{sortedTasks.length} tasks</span>
          <span>{events.filter((event) => event.completed).length} done</span>
        </div>
        <div className={styles.quickActions}>
          <button type="button" onClick={() => onCreateItem({ itemType: 'event', date: day.isoDate })}>
            + Event
          </button>
          <button type="button" onClick={() => onCreateItem({ itemType: 'task', date: day.isoDate })}>
            + Task
          </button>
        </div>
      </header>

      <div className={styles.scheduleArea}>
        <div className={styles.hourGrid} aria-hidden="true">
          {hours.map((hour) => (
            <div className={styles.hourLine} key={hour}>
              <span>{formatHour(hour)}</span>
            </div>
          ))}
        </div>

        {sortedEvents.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            stackIndex={index}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onCopyToTomorrow={onCopyToTomorrow}
            onCopyToNextWeek={onCopyToNextWeek}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
          />
        ))}

        {sortedEvents.length === 0 ? (
          <div className={styles.dayEmptyState}>
            <span>Open schedule</span>
            <strong>Time is clear</strong>
          </div>
        ) : null}
      </div>

      <section className={styles.tasksSection} aria-label={`${day.name} tasks`}>
        <div className={styles.tasksHeader}>
          <span>Tasks</span>
          <strong>{sortedTasks.length}</strong>
        </div>

        {sortedTasks.length > 0 ? (
          <div className={styles.taskList}>
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onCopyToTomorrow={onCopyToTomorrow}
                onCopyToNextWeek={onCopyToNextWeek}
                onMoveTask={onMoveTask}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        ) : (
          <div className={styles.tasksEmptyState}>
            <span>Nothing loose today</span>
          </div>
        )}
      </section>
    </article>
  );
}
