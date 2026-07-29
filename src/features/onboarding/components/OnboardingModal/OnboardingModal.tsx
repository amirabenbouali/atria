import { AnimatePresence } from 'framer-motion';
import Modal from '../../../../shared/components/Modal/Modal';
import Button from '../../../../shared/components/Button/Button';
import styles from './OnboardingModal.module.css';

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const onboardingSteps = [
  {
    title: 'Welcome to Atria',
    body: 'A calm place to organise commitments, shape intentions, and remember how your time felt.',
  },
  {
    title: 'Set your day',
    body: 'Add the commitments already in your day and set when you usually have more or less capacity.',
  },
  {
    title: 'Capture an intention',
    body: 'Intentions are outcomes, not fixed appointments. Atria can suggest suitable open time when you are ready.',
  },
  {
    title: 'Keep what mattered',
    body: 'Optional reflections become Memories, and gentle Insights describe patterns only when there is enough evidence.',
  },
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <Modal labelledBy="onboarding-title" onClose={onClose}>
          <div className={styles.onboarding}>
            <header>
              <p className="eyebrow">First orbit</p>
              <h2 id="onboarding-title">Welcome to Atria</h2>
              <span>A calm calendar that helps you shape, understand, and remember your time.</span>
            </header>

            <ol className={styles.stepList}>
              {onboardingSteps.map((step, index) => (
                <li key={step.title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <footer className={styles.actions}>
              <Button variant="secondary" onClick={onClose}>
                Skip for now
              </Button>
              <Button onClick={onClose}>Enter Atria</Button>
            </footer>
          </div>
        </Modal>
      ) : null}
    </AnimatePresence>
  );
}
