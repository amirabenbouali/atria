import { AnimatePresence, motion } from 'framer-motion';
import styles from './Toast.module.css';

type ToastProps = {
  message: string | null;
};

export default function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          className={styles.toast}
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          role="status"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
