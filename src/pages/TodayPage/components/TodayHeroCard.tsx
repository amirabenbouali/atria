import { motion } from 'framer-motion';
import styles from '../TodayPage.module.css';

type TodayHeroCardProps = {
  todayLabel: string;
  progress: number;
  completedCount: number;
  totalCount: number;
};

export default function TodayHeroCard({
  todayLabel,
  progress,
  completedCount,
  totalCount,
}: TodayHeroCardProps) {
  return (
    <motion.section
      className={styles.heroCard}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div>
        <p className="eyebrow">Today Signal</p>
        <h2>{todayLabel}</h2>
        <span>Today is structured around your highest-impact tasks.</span>
      </div>

      <div className={styles.progressCluster}>
        <strong>{progress}%</strong>
        <span>{completedCount}/{totalCount} complete</span>
      </div>
    </motion.section>
  );
}
