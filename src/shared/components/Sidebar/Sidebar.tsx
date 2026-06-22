import Button from '../Button/Button';
import GlassPanel from '../../ui/GlassPanel/GlassPanel';
import styles from './Sidebar.module.css';

type SidebarProps = {
  totalEvents: number;
  completedEvents: number;
  onCreateEvent: () => void;
  onResetDemoData: () => void;
};

export default function Sidebar({
  totalEvents,
  completedEvents,
  onCreateEvent,
  onResetDemoData,
}: SidebarProps) {
  const completionRate = totalEvents === 0 ? 0 : Math.round((completedEvents / totalEvents) * 100);
  const navItems = ['Calendar', 'Today', 'Tasks', 'Goals', 'Settings'];

  return (
    <GlassPanel as="aside" className={styles.sidebar}>
      <div className={styles.brandLockup}>
        <div className={styles.brandMark}>A</div>
        <div>
          <p>Atria</p>
          <span>Calendar Command</span>
        </div>
      </div>

      <Button className={styles.sidebarAction} onClick={onCreateEvent}>
        New Event
      </Button>

      <nav className={styles.nav} aria-label="Primary navigation">
        {navItems.map((item) => (
          <button
            className={item === 'Calendar' ? styles.activeNavItem : styles.navItem}
            key={item}
            type="button"
          >
            <span aria-hidden="true">{item.slice(0, 1)}</span>
            {item}
          </button>
        ))}
      </nav>

      <section className={styles.sidebarSection}>
        <p className="sectionLabel">Week Pulse</p>
        <div className={styles.statCard}>
          <span>Total events</span>
          <strong>{totalEvents}</strong>
        </div>
        <div className={styles.statCard}>
          <span>Completed</span>
          <strong>{completedEvents}</strong>
        </div>
        <div className={styles.completionMeter} aria-label={`${completionRate}% completed`}>
          <div style={{ width: `${completionRate}%` }} />
        </div>
      </section>

      <section className={styles.sidebarSection}>
        <p className="sectionLabel">Categories</p>
        <ul className={styles.categoryList}>
          <li><span className={`${styles.dot} ${styles.work}`} />Work</li>
          <li><span className={`${styles.dot} ${styles.personal}`} />Personal</li>
          <li><span className={`${styles.dot} ${styles.fitness}`} />Fitness</li>
          <li><span className={`${styles.dot} ${styles.learning}`} />Learning</li>
          <li><span className={`${styles.dot} ${styles.health}`} />Health</li>
          <li><span className={`${styles.dot} ${styles.finance}`} />Finance</li>
        </ul>
      </section>

      <section className={styles.demoSection}>
        <p className="sectionLabel">Demo</p>
        <button className={styles.demoButton} type="button" onClick={onResetDemoData}>
          Reset demo data
        </button>
      </section>
    </GlassPanel>
  );
}
