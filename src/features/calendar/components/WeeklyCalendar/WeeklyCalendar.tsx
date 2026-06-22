import { useState } from 'react';
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
import type { CalendarEvent, CalendarModalPreset } from '../../types/calendar.types';
import {
  parseDayDropId,
  parseTaskDropId,
} from '../../utils/calendarDrag';
import DayColumn from '../DayColumn/DayColumn';
import styles from './WeeklyCalendar.module.css';

type WeeklyCalendarProps = {
  events: CalendarEvent[];
  selectedWeekDate: Date;
  weekStartsOnMonday: boolean;
  onCreateItem: (preset: CalendarModalPreset) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopyToTomorrow: (id: string) => void;
  onCopyToNextWeek: (id: string) => void;
  onMoveCalendarItem: (id: string, targetDate: string, targetTaskId?: string) => void;
  onMoveTask: (id: string, direction: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

export default function WeeklyCalendar({
  events,
  selectedWeekDate,
  weekStartsOnMonday,
  onCreateItem,
  onEdit,
  onDuplicate,
  onCopyToTomorrow,
  onCopyToNextWeek,
  onMoveCalendarItem,
  onMoveTask,
  onDelete,
  onToggleComplete,
}: WeeklyCalendarProps) {
  const weekDays = getCurrentWeekDays(selectedWeekDate, weekStartsOnMonday);
  const hours = getCalendarHours();
  const hasItems = events.length > 0;
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
        aria-label="Weekly calendar Monday to Sunday"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
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
