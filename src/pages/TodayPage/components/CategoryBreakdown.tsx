import { categoryColors } from '../../../features/calendar/constants/calendar.constants';
import type { CategoryProgress } from '../utils/todayDashboard';
import styles from '../TodayPage.module.css';

type CategoryBreakdownProps = {
  categories: CategoryProgress[];
};

export default function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <section className={styles.panelSection}>
      <div className={styles.sectionHeader}>
        <p className="sectionLabel">Category Pulse</p>
        <strong>{categories.reduce((total, category) => total + category.total, 0)}</strong>
      </div>

      <div className={styles.categoryGrid}>
        {categories.map((category) => (
          <div className={styles.categoryTile} key={category.category}>
            <div>
              <span
                className={styles.categoryDot}
                style={{ background: categoryColors[category.category] }}
              />
              <strong>{category.category}</strong>
            </div>
            <p>{category.completed}/{category.total}</p>
            <div className={styles.categoryMeter} aria-label={`${category.category} ${category.progress}% complete`}>
              <span
                style={{
                  width: `${category.progress}%`,
                  background: categoryColors[category.category],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
