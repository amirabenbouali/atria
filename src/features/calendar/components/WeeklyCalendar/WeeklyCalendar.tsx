import { useState } from 'react';
import type { CSSProperties } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import GlassPanel from '../../../../shared/ui/GlassPanel/GlassPanel';
import { getCurrentWeekDays } from '../../utils/calendarDates';
import { formatHour, getCalendarHours } from '../../utils/calendarTime';
import type { CalendarEvent, CalendarModalPreset, CalendarView } from '../../types/calendar.types';
import {
  parseDayDropId,
  parseHourDropId,
  parseTaskDropId,
} from '../../utils/calendarDrag';
import DayColumn from '../DayColumn/DayColumn';
import CalendarViewSwitcher from '../CalendarViewSwitcher/CalendarViewSwitcher';
import styles from './WeeklyCalendar.module.css';

type WeeklyCalendarProps = {
  events: CalendarEvent[];
  selectedWeekDate: Date;
  weekStartsOnMonday: boolean;
  showWeekends: boolean;
  calendarView: CalendarView;
  onChangeView: (view: CalendarView) => void;
  onCreateItem: (preset: CalendarModalPreset) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopyToTomorrow: (id: string) => void;
  onCopyToNextWeek: (id: string) => void;
  onMoveCalendarItem: (id: string, targetDate: string, targetTaskId?: string) => void;
  onMoveScheduledEventTime: (id: string, targetDate: string, targetHour: number) => void;
  onMoveTask: (id: string, direction: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

export default function WeeklyCalendar({
  events,
  selectedWeekDate,
  weekStartsOnMonday,
  showWeekends,
  calendarView,
  onChangeView,
  onCreateItem,
  onEdit,
  onDuplicate,
  onCopyToTomorrow,
  onCopyToNextWeek,
  onMoveCalendarItem,
  onMoveScheduledEventTime,
  onMoveTask,
  onDelete,
  onToggleComplete,
}: WeeklyCalendarProps) {
  const weekDays = getCurrentWeekDays(selectedWeekDate, weekStartsOnMonday, showWeekends);
  const hours = getCalendarHours();
  const hasItems = events.length > 0;
  const calendarGridMinWidth = weekDays.length * 166;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const activeItem = events.find((event) => event.id === activeItemId) ?? null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItemId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;

    setActiveItemId(null);

    if (!overId) {
      return;
    }

    const targetHour = parseHourDropId(overId);

    if (targetHour) {
      const activeItem = events.find((item) => item.id === activeId);

      if (activeItem?.itemType === 'event') {
        onMoveScheduledEventTime(activeId, targetHour.date, targetHour.hour);
      }

      return;
    }

    const targetDayDate = parseDayDropId(overId);

    if (targetDayDate) {
      onMoveCalendarItem(activeId, targetDayDate);
      return;
    }

    const targetTaskId = parseTaskDropId(overId);
    const targetTask = targetTaskId ? events.find((item) => item.id === targetTaskId) : null;

    if (targetTask?.itemType === 'task') {
      if (activeId === targetTask.id) {
        return;
      }

      onMoveCalendarItem(activeId, targetTask.date, targetTask.id);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveItemId(null)}
    >
      <GlassPanel
        as={motion.section}
        className={styles.calendarShell}
        style={{
          '--calendar-day-count': weekDays.length,
          '--calendar-grid-min-width': `${calendarGridMinWidth}px`,
          '--calendar-total-min-width': `${78 + calendarGridMinWidth}px`,
        } as CSSProperties}
        aria-label={showWeekends ? 'Weekly calendar' : 'Weekday calendar'}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <header className={styles.viewHeader}>
          <div>
            <h2>Week view</h2>
            <p>Designed around time, not boxes.</p>
          </div>
          <CalendarViewSwitcher activeView={calendarView} onChangeView={onChangeView} />
        </header>

        <div className={styles.calendarHeader}>
          <div className={styles.timeHeader}>GMT</div>
          {weekDays.map((day) => (
            <div className={day.isToday ? styles.todayHeaderCell : styles.headerCell} key={day.key}>
              <span>{day.shortName}</span>
              <strong>{day.dateLabel}</strong>
            </div>
          ))}
        </div>

        <div className={styles.calendarBody}>
          <div className={styles.timeRail} aria-hidden="true">
            {hours.map((hour) => (
              <div className={styles.timeSlot} key={hour}>
                {formatHour(hour)}
              </div>
            ))}
          </div>

          <div className={styles.calendarGrid}>
            {weekDays.map((day) => (
              <DayColumn
                key={day.key}
                day={day}
                events={events.filter((event) => event.date === day.isoDate)}
                hours={hours}
                onCreateItem={onCreateItem}
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
        </div>

        {!hasItems ? (
          <div className={styles.emptyState}>
            <p className="eyebrow">A Clear Week</p>
            <h2>Start with one anchor.</h2>
            <span>Add a timed event or a flexible task to shape the week.</span>
          </div>
        ) : null}
      </GlassPanel>

      <DragOverlay>
        {activeItem ? (
          <div className={styles.dragOverlay}>
            <span>{activeItem.itemType === 'event' ? 'Event' : 'Task'}</span>
            <strong>{activeItem.title}</strong>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
