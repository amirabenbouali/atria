import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Modal from '../../../../shared/components/Modal/Modal';
import Button from '../../../../shared/components/Button/Button';
import { useSettingsStore } from '../../../settings/store/settings.store';
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
  const preferences = useSettingsStore((state) => state.preferences);
  const updatePreferences = useSettingsStore((state) => state.updatePreferences);
  const [displayName, setDisplayName] = useState(preferences.profile.displayName === 'Atria user' ? '' : preferences.profile.displayName);
  const [roleOrFocus, setRoleOrFocus] = useState(preferences.profile.roleOrFocus ?? '');

  const handleComplete = () => {
    updatePreferences({
      profile: {
        ...preferences.profile,
        displayName: displayName.trim() || 'Atria user',
        roleOrFocus: roleOrFocus.trim() || 'Focused planning',
      },
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <Modal labelledBy="onboarding-title" onClose={onClose}>
          <div className={styles.onboarding}>
            <header>
              <p className="eyebrow">First orbit</p>
              <h2 id="onboarding-title">Set up your local workspace</h2>
              <span>Atria stores this workspace on your device. You can export or import a backup from Settings.</span>
            </header>

            <section className={styles.identityCard} aria-label="Workspace identity">
              <label>
                Name
                <input
                  value={displayName}
                  maxLength={36}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Your name"
                />
              </label>
              <label>
                Focus
                <input
                  value={roleOrFocus}
                  maxLength={72}
                  onChange={(event) => setRoleOrFocus(event.target.value)}
                  placeholder="What are you planning around?"
                />
              </label>
            </section>

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
              <Button onClick={handleComplete}>Save and enter</Button>
            </footer>
          </div>
        </Modal>
      ) : null}
    </AnimatePresence>
  );
}
