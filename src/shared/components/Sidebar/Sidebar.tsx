import {
  BarChart3,
  CalendarDays,
  CircleDot,
  FolderKanban,
  Settings,
  SquareCheck,
  Target,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { routes } from '../../../app/routes';
import Button from '../Button/Button';
import AtriaIcon from '../../ui/AtriaIcon';
import AtriaStat from '../../ui/AtriaStat';
import GlassPanel from '../../ui/GlassPanel/GlassPanel';
import styles from './Sidebar.module.css';

type SidebarProps = {
  totalEvents: number;
  completedEvents: number;
  createButtonLabel: string;
  onCreateEvent: () => void;
  onResetDemoData: () => void;
};

export default function Sidebar({
  totalEvents,
  completedEvents,
  createButtonLabel,
  onCreateEvent,
  onResetDemoData,
}: SidebarProps) {
  const completionRate = totalEvents === 0 ? 0 : Math.round((completedEvents / totalEvents) * 100);
  const navItems = [
    { label: 'Calendar', path: routes.calendar, icon: CalendarDays },
    { label: 'Today', path: routes.today, icon: CircleDot },
    { label: 'Tasks', path: routes.tasks, icon: SquareCheck },
    { label: 'Goals', path: routes.goals, icon: Target },
    { label: 'Projects', path: routes.projects, icon: FolderKanban },
    { label: 'Insights', path: routes.insights, icon: BarChart3 },
    { label: 'Settings', path: routes.settings, icon: Settings },
  ];

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
        {createButtonLabel}
      </Button>

      <nav className={styles.nav} aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) => (isActive ? styles.activeNavItem : styles.navItem)}
            end
            key={item.label}
            to={item.path}
          >
            <AtriaIcon className={styles.navIcon} icon={item.icon} tone="rose" size="sm" shell glow />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <section className={styles.sidebarSection}>
        <p className="sectionLabel">Week Pulse</p>
        <AtriaStat label="Total items" value={totalEvents} icon={CalendarDays} tone="rose" progress={completionRate} />
        <AtriaStat label="Completed" value={completedEvents} icon={SquareCheck} tone="success" />
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
