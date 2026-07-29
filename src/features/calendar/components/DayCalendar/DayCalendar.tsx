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
import type { CalendarEvent, CalendarModalPreset, CalendarView } from '../../types/calendar.types';
import { getCalendarDay } from '../../utils/calendarDates';
import { createDayDropId, parseDayDropId, parseTaskDropId } from '../../utils/calendarDrag';
import { getCalendarHours } from '../../utils/calendarTime';
import CalendarViewSwitcher from '../CalendarViewSwitcher/CalendarViewSwitcher';
import DayColumn from '../DayColumn/DayColumn';
import styles from './DayCalendar.module.css';

type DayCalendarProps = {
  events: CalendarEvent[];
  selectedDate: Date;
  calendarView: CalendarView;
  onChangeView: (view: CalendarView) => void;
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

export default function DayCalendar({
  events,
  selectedDate,
  calendarView,
  onChangeView,
  onCreateItem,
  onEdit,
  onDuplicate,
  onCopyToTomorrow,
  onCopyToNextWeek,
  onMoveCalendarItem,
  onMoveTask,
  onDelete,
  onToggleComplete,
}: DayCalendarProps) {
  const day = getCalendarDay(selectedDate);
  const hours = getCalendarHours();
  const dayEvents = events.filter((event) => event.date === day.isoDate);
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

    if (parseDayDropId(overId) === day.isoDate || overId === createDayDropId(day.isoDate)) {
      onMoveCalendarItem(activeId, day.isoDate);
      return;
    }

    const targetTaskId = parseTaskDropId(overId);
    const targetTask = targetTaskId ? events.find((item) => item.id === targetTaskId) : null;

    if (targetTask?.itemType === 'task' && activeId !== targetTask.id) {
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
        className={styles.dayShell}
        aria-label={`Daily calendar for ${day.name}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <header className={styles.viewHeader}>
          <div>
            <h2>Day view</h2>
            <p>{day.dateLabel} · One focused orbit.</p>
          </div>
          <CalendarViewSwitcher activeView={calendarView} onChangeView={onChangeView} />
        </header>

        <div className={styles.dayFrame}>
          <div className={styles.dayHeader}>
            <span>{day.shortName}</span>
            <strong>{day.dateLabel}</strong>
          </div>
          <DayColumn
            day={day}
            events={dayEvents}
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
        </div>
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
