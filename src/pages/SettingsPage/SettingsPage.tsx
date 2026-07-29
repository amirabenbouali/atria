import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Download,
  Eye,
  Gauge,
  LayoutDashboard,
  Palette,
  RotateCcw,
  Sparkles,
  Upload,
  UserRound,
} from 'lucide-react';
import AddEventModal from '../../features/calendar/components/AddEventModal/AddEventModal';
import { eventCategories } from '../../features/calendar/constants/calendar.constants';
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents';
import { useCalendarStore } from '../../features/calendar/store/calendar.store';
import type { CalendarItemType, EventCategory } from '../../features/calendar/types/calendar.types';
import { getEditableCalendarItem } from '../../features/calendar/utils/calendarRecurrence';
import { downloadAtriaExport } from '../../features/dataExport/services/dataExport.service';
import { AtriaImportError, importAtriaDataFromJson } from '../../features/dataImport/services/dataImport.service';
import { useResetDemoWorkspace } from '../../features/demo/hooks/useResetDemoWorkspace';
import { useGoalsStore } from '../../features/goals/store/goals.store';
import { useIntentionsStore } from '../../features/intentions/store/intentions.store';
import { useNotificationsStore } from '../../features/notifications/store/notifications.store';
import { useProjectsStore } from '../../features/projects/store/projects.store';
import { useReflectionsStore } from '../../features/reflections';
import {
  accentDefinitions,
  atmosphereDefinitions,
  getAccentDefinition,
  getAtmosphereDefinition,
  getWorkspaceModeDefinition,
  workspaceModeDefinitions,
} from '../../features/settings/constants/theme.constants';
import { useDefaultCalendarModalPreset } from '../../features/settings/hooks/useDefaultCalendarModalPreset';
import { useWeekStartsOnMonday } from '../../features/settings/hooks/useWeekStartsOnMonday';
import { useSettingsStore } from '../../features/settings/store/settings.store';
import type { DefaultCalendarView, DefaultEventDurationMinutes, DefaultView, TimeFormat } from '../../features/settings/types/settings.types';
import { getSettingsWeeklyStats } from '../../features/settings/utils/settingsWeeklyStats';
import AppLayout from '../../shared/components/AppLayout/AppLayout';
import Button from '../../shared/components/Button/Button';
import SelectControl from '../../shared/components/SelectControl/SelectControl';
import Toast from '../../shared/components/Toast/Toast';
import AtriaCapsule from '../../shared/ui/AtriaCapsule';
import AtriaIcon from '../../shared/ui/AtriaIcon';
import AtriaStat from '../../shared/ui/AtriaStat';
import GlassPanel from '../../shared/ui/GlassPanel/GlassPanel';
import EnergyProfileSettings from './components/EnergyProfileSettings';
import SettingsSection from './components/SettingsSection';
import styles from './SettingsPage.module.css';

function getProfileInitials(displayName: string) {
  return displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A';
}

export default function SettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const {
    sourceEvents,
    selectedWeekDate,
    weekLabel,
    totalEventCount,
    completedEventCount,
  } = useCalendarEvents();
  const intentions = useIntentionsStore((state) => state.intentions);
  const reflectionsByDate = useReflectionsStore((state) => state.reflections);
  const preferences = useSettingsStore((state) => state.preferences);
  const updatePreferences = useSettingsStore((state) => state.updatePreferences);
  const setEnergyForPeriod = useSettingsStore((state) => state.setEnergyForPeriod);
  const setPreferredQualitiesForPeriod = useSettingsStore((state) => state.setPreferredQualitiesForPeriod);
  const resetEnergyProfile = useSettingsStore((state) => state.resetEnergyProfile);
  const resetPreferences = useSettingsStore((state) => state.resetPreferences);
  const resetAppearance = useSettingsStore((state) => state.resetAppearance);
  const resetCalendarBehaviour = useSettingsStore((state) => state.resetCalendarBehaviour);
  const resetNotifications = useSettingsStore((state) => state.resetNotifications);
  const resetNotificationDismissals = useNotificationsStore((state) => state.resetNotifications);
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
  const editingEvent = useMemo(() => getEditableCalendarItem(sourceEvents, editingEventId), [editingEventId, sourceEvents]);
  const activeAtmosphere = getAtmosphereDefinition(preferences.appearance.atmosphere);
  const activeAccent = getAccentDefinition(preferences.appearance.accent);
  const activeMode = getWorkspaceModeDefinition(preferences.appearance.workspaceMode);
  const weekStartsOnMonday = useWeekStartsOnMonday();
  const reflections = useMemo(() => Object.values(reflectionsByDate), [reflectionsByDate]);
  const weeklyStats = useMemo(
    () =>
      getSettingsWeeklyStats({
        calendarItems: sourceEvents,
        intentions,
        reflections,
        weekStartsOnMonday,
      }),
    [intentions, reflections, sourceEvents, weekStartsOnMonday],
  );

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

  const handleImportFile = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!window.confirm('Import this Atria backup? This replaces your current local workspace.')) {
      return;
    }

    try {
      const result = importAtriaDataFromJson(await file.text());
      const { events, intentions: importedIntentions, goals, projects } = result.summary;
      setToastMessage(`Imported ${events} items, ${importedIntentions} intentions, ${goals} goals, and ${projects} projects`);
    } catch (error) {
      setToastMessage(error instanceof AtriaImportError ? error.message : 'Import failed');
    }
  }, []);

  return (
    <AppLayout
      totalEvents={totalEventCount}
      completedEvents={completedEventCount}
      weekLabel={weekLabel}
      topbarEyebrow="Observatory"
      topbarTitle="Your Observatory"
      topbarDescription="Tune Atria around your pace, planning defaults, and local workspace."
      showWeekControls={false}
      onGoToToday={goToToday}
      onGoToPreviousWeek={goToPreviousWeek}
      onGoToNextWeek={goToNextWeek}
      onCreateEvent={() => openAddEventModal(createDefaultPreset())}
      onResetDemoData={() => confirmAction(
        'Reset demo data? This replaces your current calendar, goals, projects, intentions, and reflections.',
        resetDemoWorkspace,
        'Demo data restored',
      )}
    >
      <GlassPanel className={styles.settingsShell}>
        <section className={styles.observatoryHero}>
          <div className={styles.profileOrb} aria-hidden="true">
            {preferences.profile.avatarStyle === 'initials'
              ? getProfileInitials(preferences.profile.displayName)
              : <AtriaIcon icon={Sparkles} tone="rose" size="lg" glow />}
          </div>
          <div>
            <p className="eyebrow">Your Observatory</p>
            <h1>{preferences.profile.displayName}</h1>
            <span>{preferences.profile.roleOrFocus ?? 'A calendar-first personal planning system.'}</span>
          </div>
          <div className={styles.heroCapsules}>
            <AtriaCapsule icon={Palette} label={activeAtmosphere.label} />
            <AtriaCapsule icon={Sparkles} label={activeAccent.label} tone="mauve" />
            <AtriaCapsule icon={Gauge} label={activeMode.label} tone="violet" />
          </div>
        </section>

        <div className={styles.observatoryGrid}>
          <div className={styles.primaryColumn}>
            <SettingsSection eyebrow="Profile" title="Identity">
              <div className={styles.formGrid}>
                <label className={styles.fieldRow}>
                  <span>Name</span>
                  <input
                    value={preferences.profile.displayName}
                    maxLength={36}
                    onChange={(event) => updatePreferences({
                      profile: {
                        ...preferences.profile,
                        displayName: event.target.value.slice(0, 36),
                      },
                    })}
                    onBlur={(event) => updatePreferences({
                      profile: {
                        ...preferences.profile,
                        displayName: event.target.value.trim() || 'Atria user',
                      },
                    })}
                  />
                </label>
                <label className={styles.fieldRow}>
                  <span>Focus</span>
                  <input
                    value={preferences.profile.roleOrFocus ?? ''}
                    maxLength={72}
                    placeholder="What are you planning around?"
                    onChange={(event) => updatePreferences({
                      profile: {
                        ...preferences.profile,
                        roleOrFocus: event.target.value.slice(0, 72),
                      },
                    })}
                    onBlur={(event) => updatePreferences({
                      profile: {
                        ...preferences.profile,
                        roleOrFocus: event.target.value.trim() || undefined,
                      },
                    })}
                  />
                </label>
                <label className={styles.fieldRow}>
                  <span>Avatar</span>
                  <SelectControl
                    icon={UserRound}
                    value={preferences.profile.avatarStyle}
                    onChange={(event) => updatePreferences({
                      profile: {
                        ...preferences.profile,
                        avatarStyle: event.target.value === 'initials' ? 'initials' : 'symbol',
                      },
                    })}
                  >
                    <option value="symbol">Atria symbol</option>
                    <option value="initials">Initials</option>
                  </SelectControl>
                </label>
              </div>
            </SettingsSection>

            <SettingsSection eyebrow="This Week" title="Signal">
              <div className={styles.statsGrid}>
                <AtriaStat icon={Clock3} label="Scheduled" value={`${weeklyStats.scheduledHours}h`} progress={Math.min(100, weeklyStats.scheduledHours * 6)} />
                <AtriaStat icon={Sparkles} label="Focus" value={weeklyStats.focusSessions} tone="violet" progress={Math.min(100, weeklyStats.focusSessions * 18)} />
                <AtriaStat icon={Gauge} label="Intentions" value={weeklyStats.completedIntentions} tone="success" progress={Math.min(100, weeklyStats.completedIntentions * 20)} />
                <AtriaStat icon={Eye} label="Reflected" value={weeklyStats.reflectedDays} tone="mauve" progress={Math.min(100, weeklyStats.reflectedDays * 14)} />
              </div>
            </SettingsSection>

            <SettingsSection eyebrow="Atmosphere" title="Theme and accent">
              <div className={styles.optionGrid}>
                {atmosphereDefinitions.map((atmosphere) => (
                  <button
                    key={atmosphere.id}
                    type="button"
                    className={preferences.appearance.atmosphere === atmosphere.id ? styles.activeOption : styles.optionCard}
                    aria-pressed={preferences.appearance.atmosphere === atmosphere.id}
                    onClick={() => {
                      updatePreferences({
                        appearance: {
                          ...preferences.appearance,
                          atmosphere: atmosphere.id,
                        },
                      });
                      setToastMessage(`${atmosphere.label} atmosphere applied`);
                    }}
                  >
                    <span className={styles.themePreview}>
                      {atmosphere.swatches.map((swatch) => <i key={swatch} style={{ background: swatch }} />)}
                    </span>
                    <strong>{atmosphere.label}</strong>
                    <em>{atmosphere.description}</em>
                  </button>
                ))}
              </div>
              <div className={styles.accentGrid} aria-label="Accent colour">
                {accentDefinitions.map((accent) => (
                  <button
                    key={accent.id}
                    type="button"
                    className={preferences.appearance.accent === accent.id ? styles.activeAccent : styles.accentButton}
                    aria-pressed={preferences.appearance.accent === accent.id}
                    onClick={() => updatePreferences({
                      appearance: {
                        ...preferences.appearance,
                        accent: accent.id,
                      },
                    })}
                  >
                    <span style={{ background: accent.swatch }} />
                    {accent.label}
                  </button>
                ))}
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  resetAppearance();
                  setToastMessage('Appearance reset');
                }}
              >
                Reset appearance
              </Button>
            </SettingsSection>

            <SettingsSection eyebrow="Workspace" title="Mode">
              <div className={styles.modeGrid}>
                {workspaceModeDefinitions.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={preferences.appearance.workspaceMode === mode.id ? styles.activeMode : styles.modeCard}
                    aria-pressed={preferences.appearance.workspaceMode === mode.id}
                    onClick={() => updatePreferences({
                      appearance: {
                        ...preferences.appearance,
                        workspaceMode: mode.id,
                      },
                    })}
                  >
                    <strong>{mode.label}</strong>
                    <span>{mode.description}</span>
                  </button>
                ))}
              </div>
            </SettingsSection>

            <SettingsSection eyebrow="Calendar" title="Behavior">
              <div className={styles.formGrid}>
                <label className={styles.fieldRow}>
                  <span>Week starts</span>
                  <SelectControl
                    icon={CalendarDays}
                    value={preferences.calendar.weekStartsOn}
                    onChange={(event) => updatePreferences({
                      calendar: {
                        ...preferences.calendar,
                        weekStartsOn: event.target.value === 'sunday' ? 'sunday' : 'monday',
                      },
                    })}
                  >
                    <option value="monday">Monday</option>
                    <option value="sunday">Sunday</option>
                  </SelectControl>
                </label>
                <label className={styles.fieldRow}>
                  <span>Clock</span>
                  <SelectControl
                    icon={Clock3}
                    value={preferences.calendar.timeFormat}
                    onChange={(event) => updatePreferences({
                      calendar: {
                        ...preferences.calendar,
                        timeFormat: event.target.value as TimeFormat,
                      },
                    })}
                  >
                    <option value="24-hour">24-hour</option>
                    <option value="12-hour">12-hour</option>
                  </SelectControl>
                </label>
                <label className={styles.fieldRow}>
                  <span>New event length</span>
                  <SelectControl
                    icon={Clock3}
                    value={preferences.calendar.defaultEventDurationMinutes}
                    onChange={(event) => updatePreferences({
                      calendar: {
                        ...preferences.calendar,
                        defaultEventDurationMinutes: Number(event.target.value) as DefaultEventDurationMinutes,
                      },
                    })}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </SelectControl>
                </label>
                <label className={styles.fieldRow}>
                  <span>Calendar view</span>
                  <SelectControl
                    icon={LayoutDashboard}
                    value={preferences.calendar.defaultCalendarView}
                    onChange={(event) => updatePreferences({
                      calendar: {
                        ...preferences.calendar,
                        defaultCalendarView: event.target.value as DefaultCalendarView,
                      },
                    })}
                  >
                    <option value="week">Week</option>
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                  </SelectControl>
                </label>
              </div>
              <div className={styles.toggleGrid}>
                <label className={styles.toggleRow}>
                  <span><strong>Show weekends</strong><em>Display Saturday and Sunday in week and month calendars.</em></span>
                  <input type="checkbox" checked={preferences.calendar.showWeekends} onChange={(event) => updatePreferences({ calendar: { ...preferences.calendar, showWeekends: event.target.checked } })} />
                </label>
                <label className={styles.toggleRow}>
                  <span><strong>Confirm deletes</strong><em>Ask before removing calendar items.</em></span>
                  <input type="checkbox" checked={preferences.calendar.confirmBeforeDeleting} onChange={(event) => updatePreferences({ calendar: { ...preferences.calendar, confirmBeforeDeleting: event.target.checked } })} />
                </label>
                <label className={styles.toggleRow}>
                  <span><strong>Planning buffers</strong><em>Reserve breathing room in suggestion logic.</em></span>
                  <input type="checkbox" checked={preferences.calendar.preservePlanningBuffers} onChange={(event) => updatePreferences({ calendar: { ...preferences.calendar, preservePlanningBuffers: event.target.checked } })} />
                </label>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  resetCalendarBehaviour();
                  setToastMessage('Calendar behavior reset');
                }}
              >
                Reset calendar behavior
              </Button>
            </SettingsSection>

            <SettingsSection eyebrow="Defaults" title="Creation">
              <div className={styles.formGrid}>
                <label className={styles.fieldRow}>
                  <span>Item type</span>
                  <SelectControl
                    icon={CalendarDays}
                    value={preferences.planningDefaults.defaultItemType}
                    onChange={(event) => updatePreferences({
                      planningDefaults: {
                        ...preferences.planningDefaults,
                        defaultItemType: event.target.value as CalendarItemType,
                      },
                    })}
                  >
                    <option value="event">Event</option>
                    <option value="task">Task</option>
                  </SelectControl>
                </label>
                <label className={styles.fieldRow}>
                  <span>Category</span>
                  <SelectControl
                    icon={BriefcaseBusiness}
                    value={preferences.planningDefaults.defaultCategory}
                    onChange={(event) => updatePreferences({
                      planningDefaults: {
                        ...preferences.planningDefaults,
                        defaultCategory: event.target.value as EventCategory,
                      },
                    })}
                  >
                    {eventCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </SelectControl>
                </label>
                <label className={styles.fieldRow}>
                  <span>Home route</span>
                  <SelectControl
                    icon={LayoutDashboard}
                    value={preferences.planningDefaults.defaultView}
                    onChange={(event) => updatePreferences({
                      planningDefaults: {
                        ...preferences.planningDefaults,
                        defaultView: event.target.value as DefaultView,
                      },
                    })}
                  >
                    <option value="calendar">Calendar</option>
                    <option value="today">Today</option>
                    <option value="insights">Insights</option>
                  </SelectControl>
                </label>
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

            <SettingsSection eyebrow="Notifications" title="Local prompts">
              <p className={styles.microcopy}>
                Atria does not enable browser push notifications in this MVP. These settings control the local bell and in-app prompt surfaces.
              </p>
              <div className={styles.toggleGrid}>
                <label className={styles.toggleRow}>
                  <span><strong>Daily overview</strong><em>Show a soft start-of-day prompt in Atria.</em></span>
                  <input type="checkbox" checked={preferences.notifications.inAppDailyOverview} onChange={(event) => updatePreferences({ notifications: { ...preferences.notifications, inAppDailyOverview: event.target.checked } })} />
                </label>
                <label className={styles.toggleRow}>
                  <span><strong>Reflection prompt</strong><em>Remind you to close the loop.</em></span>
                  <input type="checkbox" checked={preferences.notifications.inAppReflectionPrompt} onChange={(event) => updatePreferences({ notifications: { ...preferences.notifications, inAppReflectionPrompt: event.target.checked } })} />
                </label>
                <label className={styles.toggleRow}>
                  <span><strong>Weekly summary</strong><em>Surface the week pulse in-app.</em></span>
                  <input type="checkbox" checked={preferences.notifications.inAppWeeklySummary} onChange={(event) => updatePreferences({ notifications: { ...preferences.notifications, inAppWeeklySummary: event.target.checked } })} />
                </label>
                <label className={styles.toggleRow}>
                  <span><strong>Quiet hours</strong><em>Mute in-app prompt surfaces.</em></span>
                  <input type="checkbox" checked={preferences.notifications.quietHoursEnabled} onChange={(event) => updatePreferences({ notifications: { ...preferences.notifications, quietHoursEnabled: event.target.checked } })} />
                </label>
              </div>
              <div className={styles.formGrid}>
                <label className={styles.fieldRow}>
                  <span>Quiet start</span>
                  <input type="time" value={preferences.notifications.quietHoursStart} onChange={(event) => updatePreferences({ notifications: { ...preferences.notifications, quietHoursStart: event.target.value } })} />
                </label>
                <label className={styles.fieldRow}>
                  <span>Quiet end</span>
                  <input type="time" value={preferences.notifications.quietHoursEnd} onChange={(event) => updatePreferences({ notifications: { ...preferences.notifications, quietHoursEnd: event.target.value } })} />
                </label>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  resetNotifications();
                  resetNotificationDismissals();
                  setToastMessage('Notifications reset');
                }}
              >
                Reset notifications
              </Button>
            </SettingsSection>

            <SettingsSection eyebrow="Local Data" title="Advanced">
              <div className={styles.actionStack}>
                <div><strong>Reset demo data</strong><span>Load a coherent sample workspace for screenshots.</span></div>
                <Button variant="secondary" onClick={() => confirmAction('Reset demo data? This replaces current demo-facing data.', resetDemoWorkspace, 'Demo data restored')}>Reset demo</Button>
              </div>
              <div className={styles.actionStack}>
                <div><strong>Export Atria data</strong><span>Download a local JSON backup. Nothing leaves your device.</span></div>
                <Button variant="secondary" onClick={() => { downloadAtriaExport(); setToastMessage('Data exported'); }}><Download size={16} /> Export</Button>
              </div>
              <div className={styles.actionStack}>
                <div><strong>Import Atria backup</strong><span>Restore a JSON export and replace this local workspace.</span></div>
                <input
                  ref={importInputRef}
                  className={styles.hiddenFileInput}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportFile}
                  aria-label="Choose Atria backup JSON file"
                />
                <Button variant="secondary" onClick={() => importInputRef.current?.click()}><Upload size={16} /> Import</Button>
              </div>
              <div className={styles.actionStack}>
                <div><strong>Reopen onboarding</strong><span>Show the introduction again on your next view.</span></div>
                <Button variant="secondary" onClick={() => { updatePreferences({ onboarding: { ...preferences.onboarding, hasCompleted: false } }); setToastMessage('Onboarding reopened'); }}>Reopen</Button>
              </div>
              <div className={styles.actionStack}>
                <div><strong>Clear all Atria data</strong><span>Reset calendar, goals, projects, intentions, reflections, and settings.</span></div>
                <Button variant="ghost" className={styles.dangerButton} onClick={() => confirmAction('Clear all Atria data and reset settings? This cannot be undone unless you exported a backup.', clearAllData, 'Atria data cleared')}>Clear all</Button>
              </div>
            </SettingsSection>
          </div>

          <aside className={styles.previewColumn} aria-label="Live workspace preview">
            <div className={styles.previewCard}>
              <div className={styles.previewTop}>
                <AtriaIcon icon={Eye} tone="rose" shell glow />
                <span>Live workspace preview</span>
              </div>
              <div className={styles.previewSurface}>
                <div className={styles.previewHeader}>
                  <p className="eyebrow">{activeAtmosphere.label} Orbit</p>
                  <strong>{weekLabel}</strong>
                </div>
                <div className={styles.previewEvent}>
                  <AtriaCapsule label={preferences.planningDefaults.defaultCategory} />
                  <h3>{preferences.planningDefaults.defaultItemType === 'task' ? 'Plan a focused task' : 'Design review'}</h3>
                  <span>
                    {preferences.calendar.timeFormat === '12-hour' ? '9:00 AM' : '09:00'} · {activeMode.label}
                  </span>
                </div>
                <div className={styles.previewMeta}>
                  <AtriaCapsule icon={Bell} label={preferences.notifications.quietHoursEnabled ? 'Quiet hours on' : 'Prompts on'} tone="mauve" />
                  <AtriaCapsule icon={RotateCcw} label={`${preferences.calendar.defaultEventDurationMinutes} min default`} tone="violet" />
                </div>
              </div>
              <div className={styles.previewPalette}>
                {activeAtmosphere.swatches.map((swatch) => <i key={swatch} style={{ background: swatch }} />)}
                <i style={{ background: activeAccent.swatch }} />
              </div>
            </div>
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
      <Toast message={toastMessage} />
    </AppLayout>
  );
}
