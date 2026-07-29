import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMonths, endOfMonth, format, isAfter, parseISO, startOfMonth } from 'date-fns';
import { BookOpen, CalendarDays, Search } from 'lucide-react';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import { formatInputDate, getWeekLabel } from '../../features/calendar/utils/calendarDates';
import { useResetDemoWorkspace } from '../../features/demo/hooks/useResetDemoWorkspace';
import { buildMemoryTimeline, getMemoryMonthRange } from '../../features/memories';
import type { MemoryFilter } from '../../features/memories';
import MemoryWeekGroup from '../../features/memories/components/MemoryWeekGroup';
import { useIntentionsStore } from '../../features/intentions/store/intentions.store';
import { useReflectionsStore } from '../../features/reflections';
import { useWeekStartsOnMonday } from '../../features/settings/hooks/useWeekStartsOnMonday';
import { useDefaultCalendarModalPreset } from '../../features/settings/hooks/useDefaultCalendarModalPreset';
import { routes } from '../../app/routes';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import SelectControl from '../../shared/components/SelectControl/SelectControl';
import Toast from '../../shared/components/Toast/Toast';
import AtriaIcon from '../../shared/ui/AtriaIcon';
import GlassPanel from '../../shared/ui/GlassPanel/GlassPanel';
import styles from './MemoriesPage.module.css';

const filterOptions: Array<{ label: string; value: MemoryFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Reflections', value: 'reflections' },
  { label: 'Events', value: 'events' },
  { label: 'Focus sessions', value: 'focus-sessions' },
  { label: 'Completed intentions', value: 'completed-intentions' },
  { label: 'Highlights only', value: 'highlights' },
];

export default function MemoriesPage() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<MemoryFilter>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const sourceEvents = useCalendarStore((state) => state.events);
  const selectedWeekDate = useCalendarStore((state) => state.selectedWeekDate);
  const isAddEventModalOpen = useCalendarStore((state) => state.isAddEventModalOpen);
  const editingEventId = useCalendarStore((state) => state.editingEventId);
  const modalPreset = useCalendarStore((state) => state.modalPreset);
  const openAddEventModal = useCalendarStore((state) => state.openAddEventModal);
  const closeAddEventModal = useCalendarStore((state) => state.closeAddEventModal);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPreviousWeek = useCalendarStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useCalendarStore((state) => state.goToNextWeek);
  const intentions = useIntentionsStore((state) => state.intentions);
  const reflectionsByDate = useReflectionsStore((state) => state.reflections);
  const weekStartsOnMonday = useWeekStartsOnMonday();
  const createDefaultPreset = useDefaultCalendarModalPreset();
  const resetDemoWorkspace = useResetDemoWorkspace();
  const today = new Date();
  const currentMonth = startOfMonth(today);
  const monthRange = useMemo(() => getMemoryMonthRange(selectedMonth), [selectedMonth]);
  const reflections = useMemo(() => Object.values(reflectionsByDate), [reflectionsByDate]);
  const timeline = useMemo(
    () =>
      buildMemoryTimeline({
        calendarItems: sourceEvents,
        intentions,
        reflections,
        rangeStart: monthRange.rangeStart,
        rangeEnd: monthRange.rangeEnd,
        today,
        filters: [filter],
        searchQuery,
        weekStartsOnMonday,
      }),
    [filter, intentions, monthRange.rangeEnd, monthRange.rangeStart, reflections, searchQuery, sourceEvents, today, weekStartsOnMonday],
  );
  const hasSourceData = sourceEvents.length > 0 || intentions.length > 0 || reflections.length > 0;
  const totalMemoryDays = timeline.reduce((total, week) => total + week.days.length, 0);
  const completedCount = timeline.reduce(
    (total, week) => total + week.days.reduce((dayTotal, day) => dayTotal + day.completedCount, 0),
    0,
  );
  const totalEvents = sourceEvents.length;
  const completedEvents = sourceEvents.filter((event) => event.completed).length;
  const editingEvent = sourceEvents.find((event) => event.id === editingEventId) ?? null;
  const canGoNextMonth = isAfter(currentMonth, startOfMonth(addMonths(selectedMonth, 1))) ||
    format(currentMonth, 'yyyy-MM') === format(addMonths(selectedMonth, 1), 'yyyy-MM');

  const handleResetDemoData = () => {
    resetDemoWorkspace();
    setSelectedMonth(startOfMonth(new Date()));
    setToastMessage('Demo memories restored');
  };

  const clearControls = () => {
    setSearchQuery('');
    setFilter('all');
  };

  const handleOpenCalendar = (dateKey: string) => {
    navigate(routes.calendar, { state: { date: dateKey } });
  };

  const emptyTitle = !hasSourceData
    ? 'Your past days will begin to gather here as you use Atria.'
    : searchQuery.trim()
      ? 'No memories match this search.'
      : filter !== 'all'
        ? 'No days match these filters.'
        : 'Nothing has been captured here yet.';
  const emptyCopy = !hasSourceData
    ? 'Past events, completed intentions, and reflections will appear here.'
    : 'Past events, completed intentions, and reflections will appear here.';

  return (
    <AppLayout
      totalEvents={totalEvents}
      completedEvents={completedEvents}
      weekLabel={getWeekLabel(selectedWeekDate, weekStartsOnMonday)}
      topbarEyebrow="Memory Timeline"
      topbarTitle="Memories"
      showWeekControls={false}
      createButtonLabelOverride="New Event"
      onGoToToday={goToToday}
      onGoToPreviousWeek={goToPreviousWeek}
      onGoToNextWeek={goToNextWeek}
      onCreateEvent={() => openAddEventModal(createDefaultPreset())}
      onResetDemoData={handleResetDemoData}
    >
      <GlassPanel className={styles.memoriesShell}>
        <section className={styles.heroPanel}>
          <div>
            <p className="eyebrow">Private History</p>
            <h1>Memories</h1>
            <span>Revisit the days, moments, and intentions you chose to keep.</span>
          </div>
          <div className={styles.heroMetrics} aria-label="Memory summary">
            <strong>{totalMemoryDays}</strong>
            <span>days in view</span>
            <em>{completedCount} completed intentions</em>
          </div>
        </section>

        <section className={styles.controlsPanel} aria-label="Memory controls">
          <div className={styles.monthControls}>
            <button
              type="button"
              onClick={() => setSelectedMonth((month) => addMonths(month, -1))}
              aria-label="Previous month"
            >
              Previous
            </button>
            <label>
              Month
              <input
                type="month"
                max={format(currentMonth, 'yyyy-MM')}
                value={format(selectedMonth, 'yyyy-MM')}
                onChange={(event) => {
                  const nextMonth = parseISO(`${event.target.value}-01`);
                  setSelectedMonth(startOfMonth(nextMonth));
                }}
              />
            </label>
            <button
              type="button"
              disabled={!canGoNextMonth}
              onClick={() => setSelectedMonth((month) => addMonths(month, 1))}
              aria-label="Next month"
            >
              Next
            </button>
            <button type="button" onClick={() => setSelectedMonth(currentMonth)}>
              Current month
            </button>
          </div>

          <div className={styles.searchControls}>
            <label className={styles.searchField}>
              <span>Search memories</span>
              <AtriaIcon icon={Search} tone="rose" size="sm" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search days, reflections, intentions..."
              />
            </label>
            <SelectControl
              icon={BookOpen}
              aria-label="Memory content filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value as MemoryFilter)}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectControl>
          </div>
        </section>

        <section className={styles.timelinePanel} aria-label={`Memories for ${format(startOfMonth(selectedMonth), 'MMMM yyyy')}`}>
          <header className={styles.timelineHeader}>
            <div>
              <p className="sectionLabel">{format(startOfMonth(selectedMonth), 'MMMM yyyy')}</p>
              <h2>{format(monthRange.rangeStart, 'd MMM')} - {format(endOfMonth(selectedMonth), 'd MMM yyyy')}</h2>
            </div>
            {(searchQuery.trim() || filter !== 'all') ? (
              <button type="button" onClick={clearControls}>
                Clear filters
              </button>
            ) : null}
          </header>

          {timeline.length ? (
            <div className={styles.weekStack}>
              {timeline.map((week) => (
                <MemoryWeekGroup
                  key={week.weekStart}
                  week={week}
                  onOpenCalendar={handleOpenCalendar}
                  onOpenIntentions={() => navigate(routes.intentions)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <AtriaIcon icon={CalendarDays} tone="rose" size="lg" shell glow />
              <strong>{emptyTitle}</strong>
              <p>{emptyCopy}</p>
              {(searchQuery.trim() || filter !== 'all') ? (
                <button type="button" onClick={clearControls}>
                  Clear search
                </button>
              ) : null}
            </div>
          )}
        </section>
      </GlassPanel>

      <AddEventModal
        isOpen={isAddEventModalOpen}
        selectedWeekDate={selectedWeekDate}
        modalPreset={modalPreset}
        editingEvent={editingEvent}
        onClose={closeAddEventModal}
        onAddEvent={addEvent}
        onUpdateEvent={updateEvent}
      />
      <Toast message={toastMessage} />
    </AppLayout>
  );
}
