import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
} & HTMLMotionProps<'button'>;

export default function Button({
  children,
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={cn(styles.button, styles[variant], className)}
      type={type}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
