import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CalendarDays, EyeOff, Lightbulb, RotateCcw } from 'lucide-react';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import { getWeekLabel } from '../../features/calendar/utils/calendarDates';
import { useResetDemoWorkspace } from '../../features/demo/hooks/useResetDemoWorkspace';
import {
  generateGentleInsights,
  getGentleInsightRange,
  getInsightPeriodSummary,
  insightRangeOptions,
} from '../../features/insights';
import type { GentleInsight, InsightRangeKey } from '../../features/insights';
import { useIntentionsStore } from '../../features/intentions/store/intentions.store';
import { useReflectionsStore } from '../../features/reflections';
import { useSettingsStore } from '../../features/settings/store/settings.store';
import { useDefaultCalendarModalPreset } from '../../features/settings/hooks/useDefaultCalendarModalPreset';
import { useWeekStartsOnMonday } from '../../features/settings/hooks/useWeekStartsOnMonday';
import { routes } from '../../app/routes';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import SelectControl from '../../shared/components/SelectControl/SelectControl';
import Toast from '../../shared/components/Toast/Toast';
import AtriaBadge from '../../shared/ui/AtriaBadge';
import AtriaCapsule from '../../shared/ui/AtriaCapsule';
import AtriaIcon from '../../shared/ui/AtriaIcon';
import GlassPanel from '../../shared/ui/GlassPanel/GlassPanel';
import styles from './InsightsPage.module.css';

const confidenceLabels: Record<GentleInsight['confidence'], string> = {
  emerging: 'Early pattern',
  supported: 'Supported pattern',
  strong: 'Consistent pattern',
};

const categoryLabels: Record<GentleInsight['category'], string> = {
  focus: 'Focus',
  intentions: 'Intentions',
  load: 'Calendar load',
  recovery: 'Recovery',
  energy: 'Energy',
  reflection: 'Reflection',
};

function formatMetric(insight: GentleInsight) {
  if (!insight.supportingMetric) {
    return undefined;
  }

  const { value, unit, label } = insight.supportingMetric;
  const valueLabel = unit === 'hours' ? `${value}h` : unit === 'percent' ? `${value}%` : `${value}`;
  return `${valueLabel} ${label ?? unit}`;
}

function getRouteForCategory(category: GentleInsight['category']) {
  if (category === 'intentions') {
    return routes.intentions;
  }

  if (category === 'reflection' || category === 'energy') {
    return routes.memories;
  }

  if (category === 'recovery') {
    return routes.today;
  }

  return routes.calendar;
}

function InsightCard({
  insight,
  onDismiss,
}: {
  insight: GentleInsight;
  onDismiss: (id: string) => void;
}) {
  const navigate = useNavigate();
  const metric = formatMetric(insight);
  const evidencePreview = insight.evidence.slice(0, 3);

  return (
    <article className={styles.insightCard}>
      <header className={styles.insightHeader}>
        <div className={styles.insightLabels}>
          <AtriaBadge label={categoryLabels[insight.category]} tone={insight.category === 'focus' ? 'violet' : 'rose'} />
          <AtriaCapsule label={confidenceLabels[insight.confidence]} tone="neutral" />
        </div>
        <button type="button" onClick={() => onDismiss(insight.id)} aria-label={`Dismiss insight: ${insight.title}`}>
          <EyeOff size={15} aria-hidden="true" />
        </button>
      </header>
      <div className={styles.insightBody}>
        <h2>{insight.title}</h2>
        <p>{insight.summary}</p>
      </div>
      <div className={styles.evidenceLine}>
        {metric ? <strong>{metric}</strong> : null}
        <span>Based on {insight.evidenceCount} evidence point{insight.evidenceCount === 1 ? '' : 's'}</span>
      </div>
      {evidencePreview.length ? (
        <details className={styles.evidenceDetails}>
          <summary>Why am I seeing this?</summary>
          <ul>
            {evidencePreview.map((evidence) => (
              <li key={`${evidence.type}-${evidence.sourceId ?? evidence.dateKey ?? evidence.label}`}>
                <span>{evidence.dateKey ?? evidence.type}</span>
                <strong>{evidence.label ?? evidence.type}</strong>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <button className={styles.deepLink} type="button" onClick={() => navigate(getRouteForCategory(insight.category))}>
        Open related area
      </button>
    </article>
  );
}

export default function InsightsPage() {
  const [rangeKey, setRangeKey] = useState<InsightRangeKey>('last-14');
  const [dismissedInsightIds, setDismissedInsightIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const sourceEvents = useCalendarStore((state) => state.events);
  const selectedWeekDate = useCalendarStore((state) => state.selectedWeekDate);
  const isAddEventModalOpen = useCalendarStore((state) => state.isAddEventModalOpen);
  const editingEventId = useCalendarStore((state) => state.editingEventId);
  const modalPreset = useCalendarStore((state) => state.modalPreset);
  const openAddEventModal = useCalendarStore((state) => state.openAddEventModal);
  const closeAddEventModal = useCalendarStore((state) => state.closeAddEventModal);
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPreviousWeek = useCalendarStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useCalendarStore((state) => state.goToNextWeek);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const intentions = useIntentionsStore((state) => state.intentions);
  const reflectionsByDate = useReflectionsStore((state) => state.reflections);
  const preferences = useSettingsStore((state) => state.preferences);
  const weekStartsOnMonday = useWeekStartsOnMonday();
  const createDefaultPreset = useDefaultCalendarModalPreset();
  const resetDemoWorkspace = useResetDemoWorkspace();
  const now = useMemo(() => new Date(), []);
  const range = useMemo(() => getGentleInsightRange(rangeKey, now), [now, rangeKey]);
  const reflections = useMemo(() => Object.values(reflectionsByDate), [reflectionsByDate]);
  const insights = useMemo(
    () =>
      generateGentleInsights({
        calendarItems: sourceEvents,
        intentions,
        reflections,
        energyProfile: preferences.energyProfile,
        rangeStart: range.rangeStart,
        rangeEnd: range.rangeEnd,
        now,
        weekStartsOnMonday,
      }),
    [intentions, now, preferences.energyProfile, range.rangeEnd, range.rangeStart, reflections, sourceEvents, weekStartsOnMonday],
  );
  const periodSummary = useMemo(
    () =>
      getInsightPeriodSummary({
        calendarItems: sourceEvents,
        intentions,
        reflections,
        energyProfile: preferences.energyProfile,
        rangeStart: range.rangeStart,
        rangeEnd: range.rangeEnd,
        now,
        weekStartsOnMonday,
      }),
    [intentions, now, preferences.energyProfile, range.rangeEnd, range.rangeStart, reflections, sourceEvents, weekStartsOnMonday],
  );
  const visibleInsights = insights.filter((insight) => !dismissedInsightIds.includes(insight.id));
  const editingEvent = sourceEvents.find((event) => event.id === editingEventId) ?? null;
  const completedEvents = sourceEvents.filter((event) => event.completed).length;

  const handleResetDemoData = () => {
    resetDemoWorkspace();
    setDismissedInsightIds([]);
    setToastMessage('Demo insights restored');
  };

  return (
    <AppLayout
      totalEvents={sourceEvents.length}
      completedEvents={completedEvents}
      weekLabel={getWeekLabel(selectedWeekDate, weekStartsOnMonday)}
      topbarEyebrow="Gentle Insights"
      topbarTitle="Insights"
      showWeekControls={false}
      onGoToToday={goToToday}
      onGoToPreviousWeek={goToPreviousWeek}
      onGoToNextWeek={goToNextWeek}
      onCreateEvent={() => openAddEventModal(createDefaultPreset())}
      onResetDemoData={handleResetDemoData}
    >
      <GlassPanel className={styles.insightsShell}>
        <section className={styles.heroPanel}>
          <div>
            <p className="eyebrow">Observed, not judged</p>
            <h1>Insights</h1>
            <span>Gentle observations based on the time and reflections you have recorded.</span>
          </div>
          <SelectControl
            icon={BookOpen}
            aria-label="Insight time range"
            value={rangeKey}
            onChange={(event) => {
              setRangeKey(event.target.value as InsightRangeKey);
              setDismissedInsightIds([]);
            }}
          >
            {insightRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectControl>
        </section>

        <section className={styles.summaryGrid} aria-label="Period summary">
          <article><strong>{periodSummary.observedDays}</strong><span>observed days</span></article>
          <article><strong>{periodSummary.focusSessions}</strong><span>focus sessions</span></article>
          <article><strong>{periodSummary.completedIntentions}</strong><span>completed intentions</span></article>
          <article><strong>{periodSummary.reflectedDays}</strong><span>reflected days</span></article>
        </section>

        {visibleInsights.length ? (
          <>
            <div className={styles.partialNote}>
              <span>{visibleInsights.length} observation{visibleInsights.length === 1 ? '' : 's'} meet the current evidence threshold.</span>
              {dismissedInsightIds.length ? (
                <button type="button" onClick={() => setDismissedInsightIds([])}>
                  <RotateCcw size={14} aria-hidden="true" /> Restore dismissed
                </button>
              ) : null}
            </div>
            <section className={styles.insightList} aria-label="Gentle insights">
              {visibleInsights.map((insight) => (
                <InsightCard
                  insight={insight}
                  key={insight.id}
                  onDismiss={(id) => setDismissedInsightIds((ids) => [...ids, id])}
                />
              ))}
            </section>
          </>
        ) : (
          <section className={styles.emptyPanel}>
            <AtriaIcon icon={Lightbulb} tone="rose" size="lg" shell glow />
            <strong>There is not enough recent information for a useful pattern yet.</strong>
            <p>A few more planned sessions, completed intentions, or reflections will make this page more meaningful.</p>
            <div>
              <button type="button" onClick={() => navigate(routes.intentions)}>Open Intentions</button>
              <button type="button" onClick={() => navigate(routes.today)}>Open Today</button>
              <button type="button" onClick={() => navigate(routes.calendar)}>Open Calendar</button>
            </div>
          </section>
        )}
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
