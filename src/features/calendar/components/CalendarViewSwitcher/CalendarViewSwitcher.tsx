import type { CalendarView } from '../../types/calendar.types';
import styles from './CalendarViewSwitcher.module.css';

type CalendarViewSwitcherProps = {
  activeView: CalendarView;
  onChangeView: (view: CalendarView) => void;
};

const calendarViews: Array<{ label: string; value: CalendarView }> = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

export default function CalendarViewSwitcher({
  activeView,
  onChangeView,
}: CalendarViewSwitcherProps) {
  return (
    <div className={styles.viewSwitcher} aria-label="Calendar view">
      {calendarViews.map((view) => (
        <button
          className={activeView === view.value ? styles.activeView : undefined}
          key={view.value}
          type="button"
          aria-pressed={activeView === view.value}
          onClick={() => onChangeView(view.value)}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
