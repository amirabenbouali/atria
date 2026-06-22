import { categoryColors } from '../../../features/calendar/constants/calendar.constants';
import type { CategoryInsight } from '../utils/insightsAnalytics';
import styles from '../InsightsPage.module.css';

type CategoryBalanceProps = {
  categories: CategoryInsight[];
};

export default function CategoryBalance({ categories }: CategoryBalanceProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeader}>
        <p className="sectionLabel">Category Balance</p>
        <strong>{categories.reduce((total, category) => total + category.total, 0)}</strong>
      </div>

      <div className={styles.categoryStack}>
        {categories.map((category) => (
          <article className={styles.categoryRow} key={category.category}>
            <div className={styles.categoryIdentity}>
              <span
                className={styles.categoryDot}
                style={{ background: categoryColors[category.category] }}
              />
              <strong>{category.category}</strong>
            </div>
            <div className={styles.categoryNumbers}>
              <span>{category.total} items</span>
              <strong>{category.completionPercentage}%</strong>
            </div>
            <div className={styles.categoryBar}>
              <span
                style={{
                  width: `${category.completionPercentage}%`,
                  background: categoryColors[category.category],
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
