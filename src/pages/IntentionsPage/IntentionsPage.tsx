import { useEffect, useMemo, useState } from 'react';
import { BatteryMedium, CalendarDays, Flag, Search, Sunrise } from 'lucide-react';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import { getEditableCalendarItem } from '../../features/calendar/utils/calendarRecurrence';
import { useResetDemoWorkspace } from '../../features/demo/hooks/useResetDemoWorkspace';
import {
  getFilteredIntentions,
  useIntentionsStore,
  type Intention,
  type IntentionPriority,
  type IntentionStatus,
} from '../../features/intentions';
import SuggestionReviewModal from '../../features/planning/components/SuggestionReviewModal/SuggestionReviewModal';
import {
  getFocusSessionDraft,
  validateAdjustedSuggestion,
  type PlanningSuggestion,
} from '../../features/planning';
import { getFocusSessionCountByIntention } from '../../features/planning/utils/intentionPlanning';
import type {
  IntentionListOptions,
  IntentionPriorityFilter,
  IntentionSortOption,
  IntentionStatusFilter,
  IntentionTimeFilter,
} from '../../features/intentions';
import { useDefaultCalendarModalPreset } from '../../features/settings/hooks/useDefaultCalendarModalPreset';
import { useSettingsStore } from '../../features/settings/store/settings.store';
import type { PreferredTimeOfDay } from '../../features/timeQuality';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import Button from '../../shared/components/Button/Button';
import SelectControl from '../../shared/components/SelectControl/SelectControl';
import Toast from '../../shared/components/Toast/Toast';
import GlassPanel from '../../shared/ui/GlassPanel/GlassPanel';
import IntentionCard from './components/IntentionCard';
import IntentionModal from './components/IntentionModal';
import { useIntentionsPageData } from './hooks/useIntentionsPageData';
import styles from './IntentionsPage.module.css';

const statusOptions: Array<{ label: string; value: IntentionStatusFilter }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Planned', value: 'scheduled' },
  { label: 'Paused', value: 'paused' },
  { label: 'Completed', value: 'completed' },
];

const priorityOptions: Array<{ label: string; value: IntentionPriorityFilter }> = [
  { label: 'All priorities', value: 'all' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const timeOptions: Array<{ label: string; value: IntentionTimeFilter }> = [
  { label: 'Any time', value: 'all' },
  { label: 'Morning', value: 'morning' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Evening', value: 'evening' },
];

const sortOptions: Array<{ label: string; value: IntentionSortOption }> = [
  { label: 'Recently created', value: 'recent' },
  { label: 'Deadline soonest', value: 'deadline' },
  { label: 'Highest priority', value: 'priority' },
  { label: 'Estimated effort', value: 'effort' },
  { label: 'Alphabetical', value: 'alphabetical' },
];

function hasActiveFilters(options: IntentionListOptions) {
  return Boolean(options.search.trim()) ||
    options.status !== 'all' ||
    options.priority !== 'all' ||
    options.preferredTimeOfDay !== 'all';
}

export default function IntentionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IntentionStatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<IntentionPriorityFilter>('all');
  const [timeFilter, setTimeFilter] = useState<IntentionTimeFilter>('all');
  const [sort, setSort] = useState<IntentionSortOption>('recent');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [planningIntentionId, setPlanningIntentionId] = useState<string | null>(null);
  const options = useMemo(
    () => ({
      search,
      status: statusFilter,
      priority: priorityFilter,
      preferredTimeOfDay: timeFilter,
      sort,
    }),
    [priorityFilter, search, sort, statusFilter, timeFilter],
  );
  const {
    sourceEvents,
    selectedWeekDate,
    weekLabel,
    totalEventCount,
    completedEventCount,
    weekStartsOnMonday,
  } = useCalendarEvents();
  const { intentions, visibleIntentions, summary } = useIntentionsPageData(options);
  const isIntentionModalOpen = useIntentionsStore((state) => state.isIntentionModalOpen);
  const editingIntentionId = useIntentionsStore((state) => state.editingIntentionId);
  const openIntentionModal = useIntentionsStore((state) => state.openIntentionModal);
  const openEditIntentionModal = useIntentionsStore((state) => state.openEditIntentionModal);
  const closeIntentionModal = useIntentionsStore((state) => state.closeIntentionModal);
  const addIntention = useIntentionsStore((state) => state.addIntention);
  const updateIntention = useIntentionsStore((state) => state.updateIntention);
  const removeIntention = useIntentionsStore((state) => state.removeIntention);
  const setIntentionStatus = useIntentionsStore((state) => state.setIntentionStatus);
  const createDefaultPreset = useDefaultCalendarModalPreset();
  const isAddEventModalOpen = useCalendarStore((state) => state.isAddEventModalOpen);
  const editingEventId = useCalendarStore((state) => state.editingEventId);
  const modalPreset = useCalendarStore((state) => state.modalPreset);
  const openAddEventModal = useCalendarStore((state) => state.openAddEventModal);
  const closeAddEventModal = useCalendarStore((state) => state.closeAddEventModal);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const addFocusSessionFromSuggestion = useCalendarStore((state) => state.addFocusSessionFromSuggestion);
  const resetDemoWorkspace = useResetDemoWorkspace();
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPreviousWeek = useCalendarStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useCalendarStore((state) => state.goToNextWeek);
  const editingIntention = intentions.find((intention) => intention.id === editingIntentionId) ?? null;
  const planningIntention = intentions.find((intention) => intention.id === planningIntentionId) ?? null;
  const editingEvent = useMemo(() => getEditableCalendarItem(sourceEvents, editingEventId), [editingEventId, sourceEvents]);
  const energyProfile = useSettingsStore((state) => state.preferences.energyProfile);
  const focusSessionCountByIntention = useMemo(
    () => getFocusSessionCountByIntention(sourceEvents),
    [sourceEvents],
  );
  const hasIntentions = intentions.length > 0;
  const filtersActive = hasActiveFilters(options);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setTimeFilter('all');
  };

  const handleSavedIntention = (intention: Intention, mode: 'create' | 'edit') => {
    if (mode === 'create') {
      const isVisible = getFilteredIntentions([...intentions, intention], options).some((item) => item.id === intention.id);
      setToastMessage(isVisible ? 'Intention captured' : 'Intention captured. It may be hidden by filters.');
      return;
    }

    setToastMessage('Intention updated');
  };

  const handleSetStatus = (id: string, status: IntentionStatus) => {
    setIntentionStatus(id, status);
    setToastMessage(
      status === 'scheduled'
        ? 'Marked as planned'
        : status === 'completed'
          ? 'Intention completed'
          : status === 'paused'
            ? 'Intention paused'
            : 'Intention active',
    );
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this intention? This cannot be undone.')) {
      return;
    }

    removeIntention(id);
    setToastMessage('Intention deleted');
  };

  const handleAcceptSuggestion = (suggestion: PlanningSuggestion) => {
    if (!planningIntention) {
      return false;
    }

    if (
      sourceEvents.some(
        (event) => event.itemType === 'event' && event.focusSession?.planningSuggestionId === suggestion.id,
      )
    ) {
      setToastMessage('This focus session is already planned');
      return false;
    }

    const validation = validateAdjustedSuggestion({
      intention: planningIntention,
      calendarItems: sourceEvents,
      energyProfile,
      start: new Date(suggestion.proposedStart),
      end: new Date(suggestion.proposedEnd),
      now: new Date(),
      weekStartsOnMonday,
    });

    if (!validation.isValid) {
      return false;
    }

    addFocusSessionFromSuggestion(getFocusSessionDraft({ intention: planningIntention, suggestion }));

    if (planningIntention.status !== 'scheduled') {
      setIntentionStatus(planningIntention.id, 'scheduled');
    }

    setPlanningIntentionId(null);
    setToastMessage('Focus session planned');
    return true;
  };

  return (
    <AppLayout
      totalEvents={totalEventCount}
      completedEvents={completedEventCount}
      weekLabel={weekLabel}
      topbarEyebrow="Intention Layer"
      topbarTitle="Intentions"
      showWeekControls={false}
      createButtonLabelOverride="New intention"
      onGoToToday={goToToday}
      onGoToPreviousWeek={goToPreviousWeek}
      onGoToNextWeek={goToNextWeek}
      onCreateEvent={openIntentionModal}
      onResetDemoData={() => {
        resetDemoWorkspace();
        setToastMessage('Demo data restored');
      }}
    >
      <GlassPanel className={styles.intentionsShell}>
        <section className={styles.heroPanel}>
          <div>
            <p className="eyebrow">Outcome Inbox</p>
            <h1>Outcomes first, scheduling second.</h1>
            <span>Capture outcomes before deciding when they belong in your calendar.</span>
          </div>
          <Button onClick={openIntentionModal}>New intention</Button>
        </section>

        <section className={styles.summaryGrid} aria-label="Intention summary">
          <div>
            <span>Active</span>
            <strong>{summary.active}</strong>
          </div>
          <div>
            <span>Planned</span>
            <strong>{summary.scheduled}</strong>
          </div>
          <div>
            <span>Completed</span>
            <strong>{summary.completed}</strong>
          </div>
        </section>

        <section className={styles.toolbar} aria-label="Intention filters and sorting">
          <label className={styles.searchControl}>
            <Search aria-hidden="true" size={17} />
            <span>Search intentions</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, description, outcome..."
            />
          </label>
          <SelectControl icon={Flag} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as IntentionStatusFilter)}>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </SelectControl>
          <SelectControl icon={BatteryMedium} value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as IntentionPriority | 'all')}>
            {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </SelectControl>
          <SelectControl icon={Sunrise} value={timeFilter} onChange={(event) => setTimeFilter(event.target.value as PreferredTimeOfDay | 'all')}>
            {timeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </SelectControl>
          <SelectControl icon={CalendarDays} value={sort} onChange={(event) => setSort(event.target.value as IntentionSortOption)}>
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </SelectControl>
        </section>

        {visibleIntentions.length > 0 ? (
          <div className={styles.intentionList}>
            {visibleIntentions.map((intention) => (
              <IntentionCard
                key={intention.id}
                intention={intention}
                onEdit={openEditIntentionModal}
                onSetStatus={handleSetStatus}
                onDelete={handleDelete}
                onFindTime={setPlanningIntentionId}
                plannedSessionCount={focusSessionCountByIntention[intention.id] ?? 0}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className="eyebrow">{hasIntentions ? 'Quiet Filter' : 'Start Lightly'}</p>
            <h2>{hasIntentions ? 'No intentions match these filters.' : 'Start with something you want to move forward.'}</h2>
            <span>
              {hasIntentions
                ? 'Clear the current filters or try a different search.'
                : 'It does not need a time block yet. Just name the outcome.'}
            </span>
            {hasIntentions && filtersActive ? (
              <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>
            ) : (
              <Button onClick={openIntentionModal}>Create an intention</Button>
            )}
          </div>
        )}
      </GlassPanel>

      <IntentionModal
        isOpen={isIntentionModalOpen}
        editingIntention={editingIntention}
        onClose={closeIntentionModal}
        onAddIntention={addIntention}
        onUpdateIntention={updateIntention}
        onSaved={handleSavedIntention}
      />
      <AddEventModal
        isOpen={isAddEventModalOpen}
        selectedWeekDate={selectedWeekDate}
        modalPreset={modalPreset}
        editingEvent={editingEvent}
        onClose={closeAddEventModal}
        onAddEvent={addEvent}
        onUpdateEvent={updateEvent}
      />
      <SuggestionReviewModal
        isOpen={Boolean(planningIntention)}
        intention={planningIntention}
        calendarItems={sourceEvents}
        energyProfile={energyProfile}
        weekStartsOnMonday={weekStartsOnMonday}
        onClose={() => setPlanningIntentionId(null)}
        onAccept={handleAcceptSuggestion}
      />
      <Toast message={toastMessage} />
    </AppLayout>
  );
}
