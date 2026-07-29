import { AnimatePresence } from 'framer-motion';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { DailyReflection, DailyReflectionDraft } from '../../../features/reflections';
import type { EnergyLevel } from '../../../features/timeQuality';
import Button from '../../../shared/components/Button/Button';
import Modal from '../../../shared/components/Modal/Modal';
import styles from '../TodayPage.module.css';

type TodayReflectionModalProps = {
  isOpen: boolean;
  date: string;
  reflection?: DailyReflection;
  onClose: () => void;
  onSave: (draft: DailyReflectionDraft) => void;
};

const titleId = 'today-reflection-title';
const energyLevels: EnergyLevel[] = [1, 2, 3, 4, 5];

function getInitialState(date: string, reflection?: DailyReflection) {
  return {
    date,
    energy: reflection?.energy?.toString() ?? '',
    mood: reflection?.mood?.toString() ?? '',
    highlight: reflection?.highlight ?? '',
    note: reflection?.note ?? '',
  };
}

export default function TodayReflectionModal({
  isOpen,
  date,
  reflection,
  onClose,
  onSave,
}: TodayReflectionModalProps) {
  const [values, setValues] = useState(() => getInitialState(date, reflection));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setValues(getInitialState(date, reflection));
  }, [date, isOpen, reflection]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSave({
      date,
      energy: values.energy ? Number(values.energy) as EnergyLevel : undefined,
      mood: values.mood ? Number(values.mood) as EnergyLevel : undefined,
      highlight: values.highlight,
      note: values.note,
    });
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <Modal labelledBy={titleId} onClose={onClose}>
          <div className={styles.modalHeader}>
            <div>
              <p className="eyebrow">Close The Day</p>
              <h2 id={titleId}>{reflection ? 'Edit reflection' : 'Add reflection'}</h2>
            </div>
            <Button variant="icon" onClick={onClose} aria-label="Close reflection">
              <X size={17} aria-hidden="true" />
            </Button>
          </div>

          <form className={styles.reflectionForm} onSubmit={handleSubmit}>
            <div className={styles.reflectionGrid}>
              <label>
                Energy
                <select
                  value={values.energy}
                  onChange={(event) => setValues((state) => ({ ...state, energy: event.target.value }))}
                >
                  <option value="">Not set</option>
                  {energyLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
              </label>
              <label>
                Mood
                <select
                  value={values.mood}
                  onChange={(event) => setValues((state) => ({ ...state, mood: event.target.value }))}
                >
                  <option value="">Not set</option>
                  {energyLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
              </label>
            </div>

            <label>
              Highlight
              <input
                value={values.highlight}
                onChange={(event) => setValues((state) => ({ ...state, highlight: event.target.value }))}
                placeholder="One small thing worth remembering"
              />
            </label>

            <label>
              Note
              <textarea
                value={values.note}
                onChange={(event) => setValues((state) => ({ ...state, note: event.target.value }))}
                placeholder="A short closing note..."
              />
            </label>

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit">{reflection ? 'Save reflection' : 'Add reflection'}</Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </AnimatePresence>
  );
}
