import { format, parseISO } from 'date-fns';
import type { MemoryWeek } from '../types/memories.types';
import MemoryDayCard from './MemoryDayCard';
import styles from './MemoryWeekGroup.module.css';

type MemoryWeekGroupProps = {
  week: MemoryWeek;
  onOpenCalendar: (dateKey: string) => void;
  onOpenIntentions: () => void;
};

function formatWeekLabel(week: MemoryWeek) {
  return `${format(parseISO(week.weekStart), 'd MMM')} - ${format(parseISO(week.weekEnd), 'd MMM yyyy')}`;
}

export default function MemoryWeekGroup({ week, onOpenCalendar, onOpenIntentions }: MemoryWeekGroupProps) {
  return (
    <section className={styles.weekGroup} aria-labelledby={`memory-week-${week.weekStart}`}>
      <header className={styles.weekHeader}>
        <p className="sectionLabel" id={`memory-week-${week.weekStart}`}>
          {formatWeekLabel(week)}
        </p>
        <span>{week.days.length} day{week.days.length === 1 ? '' : 's'} remembered</span>
      </header>
      <div className={styles.dayStack}>
        {week.days.map((day) => (
          <MemoryDayCard
            day={day}
            key={day.dateKey}
            onOpenCalendar={onOpenCalendar}
            onOpenIntentions={onOpenIntentions}
          />
        ))}
      </div>
    </section>
  );
}
