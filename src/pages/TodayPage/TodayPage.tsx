import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BatteryMedium, CalendarClock, CalendarDays, CheckCircle2, Clock3, Compass, Moon, Target } from 'lucide-react';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import { useResetDemoWorkspace } from '../../features/demo/hooks/useResetDemoWorkspace';
import { useIntentionsStore } from '../../features/intentions';
import {
  getFocusSessionDraft,
  validateAdjustedSuggestion,
  type PlanningSuggestion,
} from '../../features/planning';
import SuggestionReviewModal from '../../features/planning/components/SuggestionReviewModal/SuggestionReviewModal';
import { useReflectionsStore } from '../../features/reflections';
import type { DailyReflectionDraft } from '../../features/reflections';
import { useDefaultCalendarModalPreset } from '../../features/settings/hooks/useDefaultCalendarModalPreset';
import { useSettingsStore } from '../../features/settings/store/settings.store';
import { getTimeQualityLabel } from '../../features/timeQuality';
import { routes } from '../../app/routes';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import Button from '../../shared/components/Button/Button';
import Toast from '../../shared/components/Toast/Toast';
import AtriaBadge from '../../shared/ui/AtriaBadge';
import AtriaCapsule from '../../shared/ui/AtriaCapsule';
import GlassPanel from '../../shared/ui/GlassPanel/GlassPanel';
import TodayReflectionModal from './components/TodayReflectionModal';
import { getHoursLabel, getMinutesUntil, type TodayItem } from './utils/todayDashboard';
import { useTodayDashboard } from './hooks/useTodayDashboard';
import styles from './TodayPage.module.css';

function getEnergyLabel(energy: number) {
  if (energy >= 4) {
    return 'Higher energy';
  }

  if (energy === 3) {
    return 'Steady energy';
  }

  return 'Lower energy';
}

function getLoadLabel(load: string) {
  if (load === 'heavy') {
    return 'Full';
  }

  if (load === 'balanced') {
    return 'Balanced';
  }

  return 'Open';
}

function getLoadMessage(load: string) {
  if (load === 'heavy') {
    return 'Most of your available day is already scheduled.';
  }

  if (load === 'balanced') {
    return 'Your commitments are spread across the day.';
  }

  return 'There is still meaningful space in your day.';
}

function TimelineRow({
  item,
  onEdit,
  onToggleComplete,
}: {
  item: TodayItem;
  onEdit: (id: string) => void;
  onToggleComplete: (id: string) => void;
}) {
  return (
    <article className={`${styles.timelineRow} ${styles[item.status]} ${item.completed ? styles.completedItem : ''}`}>
      <div className={styles.timelineTime}>
        <strong>{item.startTime}</strong>
        <span>{item.endTime}</span>
      </div>
      <button className={styles.timelineMain} type="button" onClick={() => onEdit(item.sourceId ?? item.id)}>
        <span className={styles.timelineMeta}>
          <AtriaBadge
            label={item.status === 'now' ? 'Now' : item.status === 'next' ? 'Next' : item.status}
            tone={item.status === 'now' ? 'rose' : item.status === 'next' ? 'mauve' : 'neutral'}
          />
          {item.isFocusSession ? <AtriaCapsule label="Focus" icon={Target} tone="rose" /> : null}
          <AtriaCapsule label={item.category} tone="neutral" />
        </span>
        <strong>{item.title}</strong>
      </button>
      <Button variant="ghost" onClick={() => onToggleComplete(item.id)}>
        {item.completed ? 'Undo' : 'Done'}
      </Button>
    </article>
  );
}

export default function TodayPage() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [planningIntentionId, setPlanningIntentionId] = useState<string | null>(null);
  const { sourceEvents, selectedWeekDate, weekLabel, totalEventCount, completedEventCount } = useCalendarEvents();
  const { now, viewModel } = useTodayDashboard();
  const createDefaultPreset = useDefaultCalendarModalPreset();
  const isAddEventModalOpen = useCalendarStore((state) => state.isAddEventModalOpen);
  const editingEventId = useCalendarStore((state) => state.editingEventId);
  const modalPreset = useCalendarStore((state) => state.modalPreset);
  const openAddEventModal = useCalendarStore((state) => state.openAddEventModal);
  const openEditEventModal = useCalendarStore((state) => state.openEditEventModal);
  const closeAddEventModal = useCalendarStore((state) => state.closeAddEventModal);
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPreviousWeek = useCalendarStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useCalendarStore((state) => state.goToNextWeek);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const addFocusSessionFromSuggestion = useCalendarStore((state) => state.addFocusSessionFromSuggestion);
  const resetDemoWorkspace = useResetDemoWorkspace();
  const toggleEventComplete = useCalendarStore((state) => state.toggleEventComplete);
  const intentions = useIntentionsStore((state) => state.intentions);
  const setIntentionStatus = useIntentionsStore((state) => state.setIntentionStatus);
  const upsertReflection = useReflectionsStore((state) => state.upsertReflection);
  const preferences = useSettingsStore((state) => state.preferences);
  const editingEvent = sourceEvents.find((event) => event.id === editingEventId) ?? null;
  const planningIntention = intentions.find((intention) => intention.id === planningIntentionId) ?? null;
  const currentOrNext = viewModel.currentItem ?? viewModel.nextItem;

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const handleResetDemoData = useCallback(() => {
    resetDemoWorkspace();
    setToastMessage('Demo week restored');
  }, [resetDemoWorkspace]);

  const handleSaveReflection = (draft: DailyReflectionDraft) => {
    const reflection = upsertReflection(draft);

    if (!reflection) {
      setToastMessage('Reflection could not be saved');
      return;
    }

    setIsReflectionModalOpen(false);
    setToastMessage('Reflection saved');
  };

  const handleAcceptSuggestion = (suggestion: PlanningSuggestion) => {
    if (!planningIntention) {
      return false;
    }

    const validation = validateAdjustedSuggestion({
      intention: planningIntention,
      calendarItems: sourceEvents,
      energyProfile: preferences.energyProfile,
      start: new Date(suggestion.proposedStart),
      end: new Date(suggestion.proposedEnd),
      now: new Date(),
      weekStartsOnMonday: preferences.weekStartsOnMonday,
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
      topbarEyebrow="Today"
      topbarTitle="Today"
      showWeekControls={false}
      onGoToToday={goToToday}
      onGoToPreviousWeek={goToPreviousWeek}
      onGoToNextWeek={goToNextWeek}
      onCreateEvent={() => openAddEventModal(createDefaultPreset({ date: viewModel.dateKey }))}
      onResetDemoData={handleResetDemoData}
    >
      <GlassPanel className={styles.todayShell}>
        <section className={styles.todayHeader}>
          <div>
            <p className="eyebrow">Daily Shape</p>
            <h1>Today</h1>
            <span>{viewModel.dateLabel}</span>
          </div>
          <p>{viewModel.headerMessage}</p>
        </section>

        <section className={styles.nowCard} aria-labelledby="today-now-heading">
          <div className={styles.sectionTitle}>
            <AtriaCapsule label={viewModel.dayState === 'during-item' ? 'In progress' : 'Current moment'} icon={Compass} tone="rose" />
            <h2 id="today-now-heading">
              {viewModel.currentItem
                ? viewModel.currentItem.title
                : viewModel.nextItem
                  ? 'Free now'
                  : viewModel.dayState === 'after-last'
                    ? 'Your scheduled day is complete'
                    : 'Your calendar is open today'}
            </h2>
          </div>

          {viewModel.currentItem ? (
            <div className={styles.nowDetails}>
              <strong>{getHoursLabel(getMinutesUntil(viewModel.currentItem.end, now))} remaining</strong>
              <span>{viewModel.currentItem.startTime} - {viewModel.currentItem.endTime}</span>
              <div className={styles.metaLine}>
                {viewModel.currentItem.isFocusSession ? <AtriaBadge label="Focus session" tone="rose" /> : null}
                {viewModel.primaryIntention && viewModel.currentItem.linkedIntentionId === viewModel.primaryIntention.id ? (
                  <AtriaCapsule label={viewModel.primaryIntention.title} icon={Target} tone="mauve" uppercase={false} />
                ) : null}
              </div>
            </div>
          ) : viewModel.nextItem ? (
            <div className={styles.nowDetails}>
              <strong>{getHoursLabel(getMinutesUntil(viewModel.nextItem.start, now))} until next</strong>
              <span>{viewModel.nextItem.title} at {viewModel.nextItem.startTime}</span>
              <Button variant="secondary" onClick={() => navigate(routes.calendar)}>View calendar</Button>
            </div>
          ) : (
            <div className={styles.nowDetails}>
              <strong>No timed blocks remain</strong>
              <span>{viewModel.primaryIntention ? viewModel.primaryIntention.title : 'No intention is guiding today yet.'}</span>
              {viewModel.primaryIntention ? (
                <Button variant="secondary" onClick={() => setPlanningIntentionId(viewModel.primaryIntention!.id)}>Find time</Button>
              ) : (
                <Button variant="secondary" onClick={() => navigate(routes.intentions)}>View intentions</Button>
              )}
            </div>
          )}
        </section>

        <div className={styles.todayGrid}>
          <main className={styles.todayMain}>
            <section className={styles.panelSection} aria-labelledby="primary-intention-heading">
              <div className={styles.sectionHeader}>
                <div>
                  <p className="sectionLabel">Gentle Focus</p>
                  <h2 id="primary-intention-heading">Primary intention</h2>
                </div>
              </div>

              {viewModel.primaryIntention ? (
                <article className={styles.primaryIntention}>
                  <AtriaBadge label={viewModel.primaryIntention.status === 'scheduled' ? 'planned' : viewModel.primaryIntention.status} tone="rose" />
                  <h3>{viewModel.primaryIntention.title}</h3>
                  {viewModel.primaryIntention.desiredOutcome ? <p>{viewModel.primaryIntention.desiredOutcome}</p> : null}
                  <div className={styles.metaLine}>
                    {viewModel.primaryIntention.deadline ? <AtriaCapsule label={`Due ${viewModel.primaryIntention.deadline}`} icon={CalendarDays} tone="mauve" uppercase={false} /> : null}
                    {viewModel.primaryIntention.estimatedMinutes ? <AtriaCapsule label={`${viewModel.primaryIntention.estimatedMinutes} min`} icon={Clock3} tone="neutral" uppercase={false} /> : null}
                    {viewModel.primaryIntention.energyRequired ? <AtriaCapsule label={`${viewModel.primaryIntention.energyRequired} energy`} icon={BatteryMedium} tone="rose" /> : null}
                    <AtriaCapsule label={`${viewModel.focusSessions.filter((item) => item.linkedIntentionId === viewModel.primaryIntention?.id).length} focus today`} icon={Target} tone="violet" uppercase={false} />
                  </div>
                  <div className={styles.cardActions}>
                    <Button variant="secondary" onClick={() => navigate(routes.intentions)}>Open intention</Button>
                    <Button onClick={() => setPlanningIntentionId(viewModel.primaryIntention!.id)}>Find time</Button>
                  </div>
                </article>
              ) : (
                <div className={styles.emptyTile}>
                  <span>No intention</span>
                  <strong>No intention is guiding today yet.</strong>
                  <Button variant="secondary" onClick={() => navigate(routes.intentions)}>Create an intention</Button>
                </div>
              )}
            </section>

            <section className={styles.panelSection} aria-labelledby="timeline-heading">
              <div className={styles.sectionHeader}>
                <div>
                  <p className="sectionLabel">Remaining Day</p>
                  <h2 id="timeline-heading">Timeline</h2>
                </div>
                <strong>{viewModel.remainingItems.length}</strong>
              </div>

              {viewModel.remainingItems.length > 0 ? (
                <div className={styles.timelineList}>
                  {viewModel.remainingItems.map((item) => (
                    <TimelineRow
                      item={item}
                      key={item.id}
                      onEdit={openEditEventModal}
                      onToggleComplete={toggleEventComplete}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyTile}>
                  <span>No events</span>
                  <strong>Your calendar is open today.</strong>
                </div>
              )}
            </section>
          </main>

          <aside className={styles.todaySide}>
            <section className={styles.panelSection} aria-labelledby="energy-heading">
              <div className={styles.sectionHeader}>
                <div>
                  <p className="sectionLabel">Expected Capacity</p>
                  <h2 id="energy-heading">Energy</h2>
                </div>
              </div>
              <div className={styles.energyBlock}>
                <strong>{viewModel.currentDayPeriod}</strong>
                <span>{getEnergyLabel(viewModel.expectedEnergy)} · level {viewModel.expectedEnergy}</span>
                <p>{viewModel.preferredQualities.map(getTimeQualityLabel).join(' · ') || 'No preferred qualities set'}</p>
                <em>Based on your Daily energy settings.</em>
              </div>
            </section>

            <section className={styles.panelSection} aria-labelledby="load-heading">
              <div className={styles.sectionHeader}>
                <div>
                  <p className="sectionLabel">Daily Load</p>
                  <h2 id="load-heading">{getLoadLabel(viewModel.dailyLoad)}</h2>
                </div>
                <AtriaCapsule label={getHoursLabel(viewModel.scheduledMinutes)} icon={CalendarClock} tone="mauve" uppercase={false} />
              </div>
              <p className={styles.message}>{getLoadMessage(viewModel.dailyLoad)}</p>
              <p className={styles.message}>{viewModel.overloadObservation}</p>
              <p className={styles.message}>
                {viewModel.recoveryMinutes > 0
                  ? `${viewModel.recoveryMinutes} minutes are labelled for recovery.`
                  : 'No recovery block is labelled today.'}
              </p>
            </section>

            <section className={styles.panelSection} aria-labelledby="reflection-heading">
              <div className={styles.sectionHeader}>
                <div>
                  <p className="sectionLabel">Close The Day</p>
                  <h2 id="reflection-heading">Reflection</h2>
                </div>
                <Moon size={18} aria-hidden="true" />
              </div>
              {viewModel.reflection ? (
                <div className={styles.reflectionSummary}>
                  <div className={styles.metaLine}>
                    {viewModel.reflection.energy ? <AtriaCapsule label={`Energy ${viewModel.reflection.energy}`} tone="rose" /> : null}
                    {viewModel.reflection.mood ? <AtriaCapsule label={`Mood ${viewModel.reflection.mood}`} tone="mauve" /> : null}
                  </div>
                  {viewModel.reflection.highlight ? <strong>{viewModel.reflection.highlight}</strong> : null}
                  {viewModel.reflection.note ? <p>{viewModel.reflection.note}</p> : null}
                  <Button variant="secondary" onClick={() => setIsReflectionModalOpen(true)}>Edit reflection</Button>
                </div>
              ) : (
                <div className={styles.reflectionSummary}>
                  <span>Add a small note when you are ready to close the day.</span>
                  <Button variant={viewModel.dayState === 'after-last' ? 'primary' : 'secondary'} onClick={() => setIsReflectionModalOpen(true)}>
                    <CheckCircle2 size={15} aria-hidden="true" /> Add reflection
                  </Button>
                </div>
              )}
            </section>
          </aside>
        </div>
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
      <SuggestionReviewModal
        isOpen={Boolean(planningIntention)}
        intention={planningIntention}
        calendarItems={sourceEvents}
        energyProfile={preferences.energyProfile}
        weekStartsOnMonday={preferences.weekStartsOnMonday}
        onClose={() => setPlanningIntentionId(null)}
        onAccept={handleAcceptSuggestion}
      />
      <TodayReflectionModal
        isOpen={isReflectionModalOpen}
        date={viewModel.dateKey}
        reflection={viewModel.reflection}
        onClose={() => setIsReflectionModalOpen(false)}
        onSave={handleSaveReflection}
      />
      <Toast message={toastMessage} />
    </AppLayout>
  );
}
