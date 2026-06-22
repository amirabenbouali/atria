import type { ScheduledCalendarEvent } from '../../../features/calendar/types/calendar.types';
import TodayItemCard from './TodayItemCard';
import styles from '../TodayPage.module.css';

type TodayTimelineProps = {
  events: ScheduledCalendarEvent[];
  onEdit: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

export default function TodayTimeline({
  events,
  onEdit,
  onToggleComplete,
}: TodayTimelineProps) {
  return (
    <section className={styles.panelSection}>
      <div className={styles.sectionHeader}>
        <p className="sectionLabel">Scheduled</p>
        <strong>{events.length}</strong>
      </div>

      {events.length > 0 ? (
        <div className={styles.itemStack}>
          {events.map((event) => (
            <TodayItemCard
              item={event}
              key={event.id}
              onEdit={onEdit}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyTile}>
          <span>No fixed blocks</span>
          <strong>Your schedule has room to breathe.</strong>
        </div>
      )}
    </section>
  );
}
