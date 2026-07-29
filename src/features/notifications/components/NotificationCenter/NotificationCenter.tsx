import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CalendarClock, CheckCheck, CircleOff, ListChecks, Moon, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AtriaIcon from '../../../../shared/ui/AtriaIcon';
import type { AtriaNotification } from '../../types/notification.types';
import styles from './NotificationCenter.module.css';

type NotificationCenterProps = {
  isOpen: boolean;
  notifications: AtriaNotification[];
  quietHoursActive: boolean;
  onClose: () => void;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
};

const notificationIcons = {
  'daily-overview': Sparkles,
  'upcoming-event': CalendarClock,
  'open-tasks': ListChecks,
  'reflection-prompt': Moon,
  'weekly-summary': CheckCheck,
  'quiet-hours': CircleOff,
} satisfies Record<AtriaNotification['kind'], typeof Bell>;

export default function NotificationCenter({
  isOpen,
  notifications,
  quietHoursActive,
  onClose,
  onDismiss,
  onDismissAll,
}: NotificationCenterProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.section
          className={styles.panel}
          role="dialog"
          aria-modal="false"
          aria-label="Atria notifications"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <header className={styles.header}>
            <div>
              <p className="eyebrow">Signal</p>
              <h2>Notifications</h2>
            </div>
            <button type="button" aria-label="Close notifications" onClick={onClose}>
              <X size={17} aria-hidden="true" />
            </button>
          </header>

          {quietHoursActive ? (
            <div className={styles.quietNote}>
              <AtriaIcon icon={Moon} tone="neutral" size="sm" shell />
              <span>Quiet hours are active. Only the calmest prompts are shown.</span>
            </div>
          ) : null}

          {notifications.length > 0 ? (
            <>
              <div className={styles.list}>
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.kind];

                  return (
                    <article className={styles.item} key={notification.id} data-tone={notification.tone}>
                      <AtriaIcon icon={Icon} tone={notification.tone === 'warning' ? 'warning' : notification.tone} size="sm" shell glow />
                      <div className={styles.itemContent}>
                        <strong>{notification.title}</strong>
                        <span>{notification.body}</span>
                        {notification.actionPath && notification.actionLabel ? (
                          <Link className={styles.actionLink} to={notification.actionPath} onClick={onClose}>
                            {notification.actionLabel}
                          </Link>
                        ) : null}
                      </div>
                      <button type="button" aria-label={`Dismiss ${notification.title}`} onClick={() => onDismiss(notification.id)}>
                        <X size={15} aria-hidden="true" />
                      </button>
                    </article>
                  );
                })}
              </div>
              <button className={styles.dismissAll} type="button" onClick={onDismissAll}>
                Clear all
              </button>
            </>
          ) : (
            <div className={styles.emptyState}>
              <AtriaIcon icon={Bell} tone="rose" size="lg" shell glow />
              <strong>All quiet</strong>
              <span>No planning signals need attention right now.</span>
            </div>
          )}
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
