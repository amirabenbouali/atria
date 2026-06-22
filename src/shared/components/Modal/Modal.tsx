import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import GlassPanel from '../../ui/GlassPanel/GlassPanel';
import styles from './Modal.module.css';

type ModalProps = {
  children: ReactNode;
  labelledBy: string;
  onClose: () => void;
};

export default function Modal({ children, labelledBy, onClose }: ModalProps) {
  return (
    <motion.div
      className={styles.backdrop}
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onClose}
    >
      <GlassPanel
        as={motion.div}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </GlassPanel>
    </motion.div>
  );
}
