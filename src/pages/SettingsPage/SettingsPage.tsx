import { useCallback, useEffect, useState } from 'react';
import { BriefcaseBusiness, CalendarDays, LayoutDashboard } from 'lucide-react';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import { eventCategories } from '../../features/calendar/constants/calendar.constants';
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import type { CalendarItemType, EventCategory } from '../../features/calendar/types/calendar.types';
import { downloadAtriaExport } from '../../features/dataExport/services/dataExport.service';
import { useResetDemoWorkspace } from '../../features/demo/hooks/useResetDemoWorkspace';
import { useGoalsStore } from '../../features/goals/store/goals.store';
import { useIntentionsStore } from '../../features/intentions/store/intentions.store';
import { useProjectsStore } from '../../features/projects/store/projects.store';
import { useReflectionsStore } from '../../features/reflections';
import { getThemeDefinition, themeDefinitions } from '../../features/settings/constants/theme.constants';
import { useSettingsStore } from '../../features/settings/store/settings.store';
import type { DefaultView, ThemeId } from '../../features/settings/types/settings.types';
import { useDefaultCalendarModalPreset } from '../../features/settings/hooks/useDefaultCalendarModalPreset';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import Button from '../../shared/components/Button/Button';
import SelectControl from '../../shared/components/SelectControl/SelectControl';
import Toast from '../../shared/components/Toast/Toast';
import GlassPanel from '../../shared/ui/GlassPanel/GlassPanel';
import EnergyProfileSettings from './components/EnergyProfileSettings';
import SettingsSection from './components/SettingsSection';
import styles from './SettingsPage.module.css';

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
  const setEnergyForPeriod = useSettingsStore((state) => state.setEnergyForPeriod);
  const setPreferredQualitiesForPeriod = useSettingsStore((state) => state.setPreferredQualitiesForPeriod);
  const resetEnergyProfile = useSettingsStore((state) => state.resetEnergyProfile);
  const resetPreferences = useSettingsStore((state) => state.resetPreferences);
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
  const clearIntentions = useIntentionsStore((state) => state.clearIntentions);
  const clearReflections = useReflectionsStore((state) => state.clearReflections);
  const clearGoals = useGoalsStore((state) => state.clearGoals);
  const clearProjects = useProjectsStore((state) => state.clearProjects);
  const goToToday = useCalendarStore((state) => state.goToToday);
  const goToPreviousWeek = useCalendarStore((state) => state.goToPreviousWeek);
  const goToNextWeek = useCalendarStore((state) => state.goToNextWeek);
  const editingEvent = sourceEvents.find((event) => event.id === editingEventId) ?? null;
  const activeTheme = getThemeDefinition(preferences.themeId);

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

  const clearAllData = useCallback(() => {
    clearCalendarData();
    clearDailyFocusData();
    clearIntentions();
    clearReflections();
    clearGoals();
    clearProjects();
    resetPreferences();
  }, [
    clearCalendarData,
    clearDailyFocusData,
    clearGoals,
    clearIntentions,
    clearProjects,
    clearReflections,
    resetPreferences,
  ]);

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
          <p className="eyebrow">Release Controls</p>
          <h1>Atria Settings</h1>
          <span>A calm calendar for shaping, understanding, and remembering your time.</span>
        </section>

        <div className={styles.settingsGrid}>
          <SettingsSection eyebrow="Sample Data" title="Demo workspace">
            <div className={styles.actionStack}>
              <div>
                <strong>Load sample data</strong>
                <span>Replace current calendar, goals, projects, intentions, and reflections with a coherent demo set.</span>
              </div>
              <Button
                variant="secondary"
                onClick={() => confirmAction(
                  'Load sample data? This replaces your current calendar, goals, projects, intentions, and reflections.',
                  resetDemoWorkspace,
                  'Sample data loaded',
                )}
              >
                Load sample data
              </Button>
            </div>
          </SettingsSection>

          <SettingsSection eyebrow="Local Data" title="Export and clear">
            <div className={styles.actionStack}>
              <div>
                <strong>Export Atria data</strong>
                <span>Download a local JSON backup. Nothing is sent to a server.</span>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  downloadAtriaExport();
                  setToastMessage('Data exported');
                }}
              >
                Export JSON
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
                <strong>Clear intentions</strong>
                <span>Remove outcomes, statuses, and planning context. Linked focus sessions remain in Calendar.</span>
              </div>
              <Button
                variant="ghost"
                className={styles.dangerButton}
                onClick={() => confirmAction(
                  'Clear all intentions? Existing calendar focus sessions will keep their metadata but missing links will be treated as archived context.',
                  clearIntentions,
                  'Intentions cleared',
                )}
              >
                Clear
              </Button>
            </div>

            <div className={styles.actionStack}>
              <div>
                <strong>Clear reflections</strong>
                <span>Remove daily reflections used by Today, Memories, and Insights.</span>
              </div>
              <Button
                variant="ghost"
                className={styles.dangerButton}
                onClick={() => confirmAction(
                  'Clear all reflections? This cannot be undone.',
                  clearReflections,
                  'Reflections cleared',
                )}
              >
                Clear
              </Button>
            </div>

            <div className={styles.actionStack}>
              <div>
                <strong>Clear all Atria data</strong>
                <span>Reset local data, settings, and onboarding to a fresh first-run state.</span>
              </div>
              <Button
                variant="ghost"
                className={styles.dangerButton}
                onClick={() => confirmAction(
                  'Clear all Atria data and reset settings? This cannot be undone unless you exported a backup.',
                  clearAllData,
                  'Atria data cleared',
                )}
              >
                Clear all
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
              <SelectControl
                icon={CalendarDays}
                value={preferences.defaultItemType}
                onChange={(event) => updatePreferences({ defaultItemType: event.target.value as CalendarItemType })}
              >
                <option value="event">Event</option>
                <option value="task">Task</option>
              </SelectControl>
            </label>

            <label className={styles.fieldRow}>
              <span>Default category</span>
              <SelectControl
                icon={BriefcaseBusiness}
                value={preferences.defaultCategory}
                onChange={(event) => updatePreferences({ defaultCategory: event.target.value as EventCategory })}
              >
                {eventCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </SelectControl>
            </label>

            <label className={styles.fieldRow}>
              <span>Default view</span>
              <SelectControl
                icon={LayoutDashboard}
                value={preferences.defaultView}
                onChange={(event) => updatePreferences({ defaultView: event.target.value as DefaultView })}
              >
                <option value="calendar">Calendar</option>
                <option value="today">Today</option>
                <option value="insights">Insights</option>
              </SelectControl>
            </label>

            <div className={styles.actionStack}>
              <div>
                <strong>Onboarding</strong>
                <span>Reopen the short product introduction on your next view.</span>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  updatePreferences({ hasCompletedOnboarding: false });
                  setToastMessage('Onboarding reopened');
                }}
              >
                Reopen
              </Button>
            </div>
          </SettingsSection>

          <SettingsSection eyebrow="Daily Energy" title="Energy profile">
            <EnergyProfileSettings
              profile={preferences.energyProfile}
              onSetEnergy={setEnergyForPeriod}
              onSetQualities={setPreferredQualitiesForPeriod}
              onReset={() => {
                resetEnergyProfile();
                setToastMessage('Energy profile reset');
              }}
            />
          </SettingsSection>

          <SettingsSection eyebrow="Appearance" title="Theme">
            <div className={styles.themeIntro}>
              <strong>{activeTheme.name}</strong>
              <span>{activeTheme.description}</span>
            </div>

            <div className={styles.themeGrid} aria-label="Theme options">
              {themeDefinitions.map((theme) => {
                const isActive = preferences.themeId === theme.id;

                return (
                  <button
                    className={isActive ? styles.activeThemeOption : styles.themeOption}
                    key={theme.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      updatePreferences({ themeId: theme.id as ThemeId });
                      setToastMessage(`${theme.name} applied`);
                    }}
                  >
                    <span className={styles.themePreview}>
                      {theme.swatches.slice(0, 4).map((swatch) => (
                        <i key={swatch} style={{ background: swatch }} />
                      ))}
                    </span>
                    <span className={styles.themeOptionCopy}>
                      <strong>{theme.name}</strong>
                      <em>{theme.description}</em>
                    </span>
                  </button>
                );
              })}
            </div>
          </SettingsSection>

          <SettingsSection eyebrow="About" title="Atria">
            <div className={styles.aboutCard}>
              <strong>Atria</strong>
              <span>A calm calendar that helps you shape, understand, and remember your time.</span>
              <em>Release candidate 1.0.0-rc.1</em>
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
