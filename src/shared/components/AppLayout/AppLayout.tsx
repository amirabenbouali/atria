import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import CommandPalette from '../../../features/commandPalette/components/CommandPalette/CommandPalette';
import { useSettingsStore } from '../../../features/settings/store/settings.store';
import Button from '../Button/Button';
import Sidebar from '../Sidebar/Sidebar';
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
  onGoToToday,
  onGoToPreviousWeek,
  onGoToNextWeek,
  onCreateEvent,
  onResetDemoData,
}: AppLayoutProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const defaultItemType = useSettingsStore((state) => state.preferences.defaultItemType);
  const createButtonLabel = createButtonLabelOverride ?? (defaultItemType === 'task' ? 'New Task' : 'New Event');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen((isOpen) => !isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn(styles.appShell, Boolean(contextPanel) && styles.withContext)}>
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

      <main className={styles.mainPanel}>
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
            {showWeekControls ? (
              <>
                <Button variant="icon" onClick={onGoToPreviousWeek} aria-label="Previous week">
                  ‹
                </Button>
                <Button variant="secondary" onClick={onGoToToday}>
                  Today
                </Button>
                <Button variant="icon" onClick={onGoToNextWeek} aria-label="Next week">
                  ›
                </Button>
              </>
            ) : null}
            <Button onClick={onCreateEvent}>{createButtonLabel}</Button>
          </div>
        </GlassPanel>
        {children}
      </main>
      {contextPanel ? <aside className={styles.contextRail}>{contextPanel}</aside> : null}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onResetDemoData={onResetDemoData}
      />
    </div>
  );
}
