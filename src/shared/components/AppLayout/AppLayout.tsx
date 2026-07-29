import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { routes } from '../../../app/routes';
import CommandPalette from '../../../features/commandPalette/components/CommandPalette/CommandPalette';
import NotificationCenter from '../../../features/notifications/components/NotificationCenter/NotificationCenter';
import { useAtriaNotifications } from '../../../features/notifications/hooks/useAtriaNotifications';
import OnboardingModal from '../../../features/onboarding/components/OnboardingModal/OnboardingModal';
import { useSettingsStore } from '../../../features/settings/store/settings.store';
import { storageFailureEventName } from '../../services/localStorage.service';
import Button from '../Button/Button';
import Sidebar from '../Sidebar/Sidebar';
import Toast from '../Toast/Toast';
import GlassPanel from '../../ui/GlassPanel/GlassPanel';
import { cn } from '../../utils/cn';
import styles from './AppLayout.module.css';

type AppLayoutProps = {
  children: ReactNode;
  totalEvents: number;
  completedEvents: number;
  weekLabel: string;
  topbarEyebrow?: string;
  topbarTitle?: string;
  topbarDescription?: string;
  showWeekControls?: boolean;
  contextPanel?: ReactNode;
  createButtonLabelOverride?: string;
  previousLabel?: string;
  nextLabel?: string;
  onGoToToday: () => void;
  onGoToPreviousWeek: () => void;
  onGoToNextWeek: () => void;
  onCreateEvent: () => void;
  onResetDemoData: () => void;
};

export default function AppLayout({
  children,
  totalEvents,
  completedEvents,
  weekLabel,
  topbarEyebrow = 'Weekly Orbit',
  topbarTitle,
  topbarDescription,
  showWeekControls = true,
  contextPanel,
  createButtonLabelOverride,
  previousLabel = 'Previous week',
  nextLabel = 'Next week',
  onGoToToday,
  onGoToPreviousWeek,
  onGoToNextWeek,
  onCreateEvent,
  onResetDemoData,
}: AppLayoutProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const preferences = useSettingsStore((state) => state.preferences);
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);
  const defaultItemType = preferences.planningDefaults.defaultItemType;
  const {
    notifications,
    notificationCount,
    quietHoursActive,
    dismissNotification,
    dismissAllNotifications,
  } = useAtriaNotifications();
  const createButtonLabel = createButtonLabelOverride ?? (defaultItemType === 'task' ? 'New Task' : 'New Event');
  const pageTitle = `${topbarTitle ?? topbarEyebrow} · Atria`;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditableTarget =
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

      if (isEditableTarget) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen((isOpen) => !isOpen);
      }

      if (event.key === 'Escape') {
        setIsNotificationCenterOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  useEffect(() => {
    const handleStorageFailure = () => {
      setStorageWarning('Changes could not be saved locally');
    };

    window.addEventListener(storageFailureEventName, handleStorageFailure);
    return () => window.removeEventListener(storageFailureEventName, handleStorageFailure);
  }, []);

  useEffect(() => {
    if (!storageWarning) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setStorageWarning(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [storageWarning]);

  if (!preferences.account.isSignedIn) {
    return <Navigate replace to={routes.root} />;
  }

  return (
    <div className={cn(styles.appShell, Boolean(contextPanel) && styles.withContext)}>
      <a className={styles.skipLink} href="#atria-main">
        Skip to main content
      </a>
      <div className="aurora auroraOne" />
      <div className="aurora auroraTwo" />
      <div className="aurora auroraThree" />
      <div className="aurora auroraFour" />
      <div className="aurora auroraFive" />

      <Sidebar
        totalEvents={totalEvents}
        completedEvents={completedEvents}
        onResetDemoData={onResetDemoData}
      />

      <main className={styles.mainPanel} id="atria-main" tabIndex={-1}>
        <GlassPanel
          as={motion.header}
          className={styles.topbar}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <div className={styles.weekIdentity}>
            <p className="eyebrow">{topbarEyebrow}</p>
            <h1>{topbarTitle ?? weekLabel}</h1>
            {topbarDescription ? <span>{topbarDescription}</span> : null}
          </div>
          <div className={styles.topbarActions}>
            <Button
              variant="secondary"
              onClick={() => setIsCommandPaletteOpen(true)}
              aria-label="Open command palette"
            >
              Search Atria <span className={styles.shortcutHint}>⌘K</span>
            </Button>
            <Button
              className={styles.notificationButton}
              variant="icon"
              onClick={() => setIsNotificationCenterOpen((isOpen) => !isOpen)}
              aria-label={notificationCount > 0 ? `Open notifications, ${notificationCount} unread` : 'Open notifications'}
              aria-expanded={isNotificationCenterOpen}
            >
              <Bell size={17} aria-hidden="true" />
              {notificationCount > 0 ? <span className={styles.notificationBadge}>{notificationCount}</span> : null}
            </Button>
            {showWeekControls ? (
              <>
                <Button variant="icon" onClick={onGoToPreviousWeek} aria-label={previousLabel}>
                  ‹
                </Button>
                <Button variant="secondary" onClick={onGoToToday}>
                  Today
                </Button>
                <Button variant="icon" onClick={onGoToNextWeek} aria-label={nextLabel}>
                  ›
                </Button>
              </>
            ) : null}
            <Button onClick={onCreateEvent}>{createButtonLabel}</Button>
          </div>
        </GlassPanel>
        <NotificationCenter
          isOpen={isNotificationCenterOpen}
          notifications={notifications}
          quietHoursActive={quietHoursActive}
          onClose={() => setIsNotificationCenterOpen(false)}
          onDismiss={dismissNotification}
          onDismissAll={dismissAllNotifications}
        />
        {children}
      </main>
      {contextPanel ? <aside className={styles.contextRail}>{contextPanel}</aside> : null}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onResetDemoData={onResetDemoData}
      />
      <OnboardingModal
        isOpen={preferences.account.isSignedIn && !preferences.onboarding.hasCompleted}
        onClose={completeOnboarding}
      />
      <Toast message={storageWarning} />
    </div>
  );
}
