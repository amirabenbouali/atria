import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Button from '../Button/Button';
import Sidebar from '../Sidebar/Sidebar';
import GlassPanel from '../../ui/GlassPanel/GlassPanel';
import styles from './AppLayout.module.css';

type AppLayoutProps = {
  children: ReactNode;
  totalEvents: number;
  completedEvents: number;
  weekLabel: string;
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
  onGoToToday,
  onGoToPreviousWeek,
  onGoToNextWeek,
  onCreateEvent,
  onResetDemoData,
}: AppLayoutProps) {
  return (
    <div className={styles.appShell}>
      <div className="aurora auroraOne" />
      <div className="aurora auroraTwo" />
      <div className="aurora auroraThree" />

      <Sidebar
        totalEvents={totalEvents}
        completedEvents={completedEvents}
        onCreateEvent={onCreateEvent}
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
            <p className="eyebrow">Weekly Orbit</p>
            <h1>{weekLabel}</h1>
          </div>
          <div className={styles.topbarActions}>
            <Button variant="icon" onClick={onGoToPreviousWeek} aria-label="Previous week">
              ‹
            </Button>
            <Button variant="secondary" onClick={onGoToToday}>
              Today
            </Button>
            <Button variant="icon" onClick={onGoToNextWeek} aria-label="Next week">
              ›
            </Button>
            <Button onClick={onCreateEvent}>New Event</Button>
          </div>
        </GlassPanel>
        {children}
      </main>
    </div>
  );
}
