import { useCallback, useEffect, useState } from 'react';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import { eventCategories } from '../../features/calendar/constants/calendar.constants';
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import type { CalendarItemType, EventCategory } from '../../features/calendar/types/calendar.types';
import { useResetDemoWorkspace } from '../../features/demo/hooks/useResetDemoWorkspace';
import { useSettingsStore } from '../../features/settings/store/settings.store';
import type { DefaultView } from '../../features/settings/types/settings.types';
import { useDefaultCalendarModalPreset } from '../../features/settings/hooks/useDefaultCalendarModalPreset';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import Button from '../../shared/components/Button/Button';
import Toast from '../../shared/components/Toast/Toast';
import GlassPanel from '../../shared/ui/GlassPanel/GlassPanel';
import SettingsSection from './components/SettingsSection';
import styles from './SettingsPage.module.css';

const paletteSwatches = [
  '#F6A6BE',
  '#D989A6',
  '#9B6C8F',
  '#EBC7D4',
  '#C89BFF',
  '#C8A6A0',
];

export default function SettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const {
    sourceEvents,
    selectedWeekDate,
    weekLabel,
    totalEventCount,
    completedEventCount,
  } = useCalendarEvents();
  const preferences = useSettingsStore((state) => state.preferences);
  const updatePreferences = useSettingsStore((state) => state.updatePreferences);
  const createDefaultPreset = useDefaultCalendarModalPreset();
  const isAddEventModalOpen = useCalendarStore((state) => state.isAddEventModalOpen);
  const editingEventId = useCalendarStore((state) => state.editingEventId);
  const modalPreset = useCalendarStore((state) => state.modalPreset);
  const openAddEventModal = useCalendarStore((state) => state.openAddEventModal);
  const closeAddEventModal = useCalendarStore((state) => state.closeAddEventModal);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const resetDemoWorkspace = useResetDemoWorkspace();
  const clearCalendarData = useCalendarStore((state) => state.clearCalendarData);
  const clearDailyFocusData = useCalendarStore((state) => state.clearDailyFocusData);
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPreviousWeek = useCalendarStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useCalendarStore((state) => state.goToNextWeek);
  const editingEvent = sourceEvents.find((event) => event.id === editingEventId) ?? null;

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const confirmAction = useCallback((message: string, action: () => void, toast: string) => {
    if (!window.confirm(message)) {
      return;
    }

    action();
    setToastMessage(toast);
  }, []);

  return (
    <AppLayout
      totalEvents={totalEventCount}
      completedEvents={completedEventCount}
      weekLabel={weekLabel}
      topbarEyebrow="Control Surface"
      topbarTitle="Settings"
      showWeekControls={false}
      onGoToToday={goToToday}
      onGoToPreviousWeek={goToPreviousWeek}
      onGoToNextWeek={goToNextWeek}
      onCreateEvent={() => openAddEventModal(createDefaultPreset())}
      onResetDemoData={() => confirmAction(
        'Reset demo data? This replaces your current calendar, goals, and projects.',
        resetDemoWorkspace,
        'Demo data restored',
      )}
    >
      <GlassPanel className={styles.settingsShell}>
        <section className={styles.heroPanel}>
          <p className="eyebrow">Soft Rose Glass</p>
          <h1>Atria Settings</h1>
          <span>Preferences, local data, and the current visual system.</span>
        </section>

        <div className={styles.settingsGrid}>
          <SettingsSection eyebrow="Local Data" title="Data controls">
            <div className={styles.actionStack}>
              <div>
                <strong>Reset demo data</strong>
                <span>Restore the curated portfolio sample week.</span>
              </div>
              <Button
                variant="secondary"
                onClick={() => confirmAction(
                  'Reset demo data? This replaces your current calendar, goals, and projects.',
                  resetDemoWorkspace,
                  'Demo data restored',
                )}
              >
                Reset
              </Button>
            </div>

            <div className={styles.actionStack}>
              <div>
                <strong>Clear calendar data</strong>
                <span>Remove every event, task, and recurring series.</span>
              </div>
              <Button
                variant="ghost"
                className={styles.dangerButton}
                onClick={() => confirmAction(
                  'Clear all calendar data? This cannot be undone.',
                  clearCalendarData,
                  'Calendar data cleared',
                )}
              >
                Clear
              </Button>
            </div>

            <div className={styles.actionStack}>
              <div>
                <strong>Clear daily focus</strong>
                <span>Remove saved focus lines from Today.</span>
              </div>
              <Button
                variant="ghost"
                className={styles.dangerButton}
                onClick={() => confirmAction(
                  'Clear all daily focus data? This cannot be undone.',
                  clearDailyFocusData,
                  'Daily focus cleared',
                )}
              >
                Clear
              </Button>
            </div>
          </SettingsSection>

          <SettingsSection eyebrow="Preferences" title="Planning defaults">
            <label className={styles.toggleRow}>
              <span>
                <strong>Week starts on Monday</strong>
                <em>Prepared for future calendar configuration.</em>
              </span>
              <input
                type="checkbox"
                checked={preferences.weekStartsOnMonday}
                onChange={(event) => updatePreferences({ weekStartsOnMonday: event.target.checked })}
              />
            </label>

            <label className={styles.fieldRow}>
              <span>Default item type</span>
              <select
                value={preferences.defaultItemType}
                onChange={(event) => updatePreferences({ defaultItemType: event.target.value as CalendarItemType })}
              >
                <option value="event">Event</option>
                <option value="task">Task</option>
              </select>
            </label>

            <label className={styles.fieldRow}>
              <span>Default category</span>
              <select
                value={preferences.defaultCategory}
                onChange={(event) => updatePreferences({ defaultCategory: event.target.value as EventCategory })}
              >
                {eventCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className={styles.fieldRow}>
              <span>Default view</span>
              <select
                value={preferences.defaultView}
                onChange={(event) => updatePreferences({ defaultView: event.target.value as DefaultView })}
              >
                <option value="calendar">Calendar</option>
                <option value="today">Today</option>
                <option value="insights">Insights</option>
              </select>
            </label>
          </SettingsSection>

          <SettingsSection eyebrow="Appearance" title="Theme">
            <div className={styles.themeCard}>
              <div>
                <strong>Soft Rose Glass</strong>
                <span>Warm black glass, blush gradients, muted mauve accents.</span>
              </div>
              <div className={styles.swatchRow} aria-label="Soft Rose Glass palette">
                {paletteSwatches.map((swatch) => (
                  <span key={swatch} style={{ background: swatch }} />
                ))}
              </div>
            </div>
          </SettingsSection>

          <SettingsSection eyebrow="About" title="Atria">
            <div className={styles.aboutCard}>
              <strong>Atria</strong>
              <span>A calendar-first personal planning system.</span>
              <em>MVP version 0.1.0</em>
            </div>
          </SettingsSection>
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
      <Toast message={toastMessage} />
    </AppLayout>
  );
}
