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
import AtriaIcon from '../../ui/AtriaIcon';
import AtriaStat from '../../ui/AtriaStat';
import GlassPanel from '../../ui/GlassPanel/GlassPanel';
import styles from './Sidebar.module.css';

type SidebarProps = {
  totalEvents: number;
  completedEvents: number;
  onResetDemoData: () => void;
};

export default function Sidebar({
  totalEvents,
  completedEvents,
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
        <div className={styles.brandMark} aria-hidden="true"><span /></div>
        <div>
          <p>Atria</p>
          <span>Calendar command</span>
        </div>
      </div>

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
        <div className={styles.orbitPulseHeader}>
          <p>Weekly orbit</p>
          <span>{completedEvents} / {totalEvents || 0}</span>
        </div>
        <AtriaStat label="Aligned" value={`${completionRate}%`} icon={CalendarDays} tone="rose" progress={completionRate} />
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
