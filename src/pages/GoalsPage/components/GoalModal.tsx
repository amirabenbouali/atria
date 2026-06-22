import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import { eventCategories } from '../../../features/calendar/constants/calendar.constants';
import type { EventCategory } from '../../../features/calendar/types/calendar.types';
import type { Goal, GoalDraft } from '../../../features/goals/types/goals.types';
import Button from '../../../shared/components/Button/Button';
import Modal from '../../../shared/components/Modal/Modal';
import styles from '../GoalsPage.module.css';

type GoalModalProps = {
  isOpen: boolean;
  editingGoal: Goal | null;
  onClose: () => void;
  onAddGoal: (goal: GoalDraft) => void;
  onUpdateGoal: (id: string, goal: GoalDraft) => void;
};

const initialFormState: GoalDraft = {
  title: '',
  description: '',
  category: 'Work',
  targetDate: '',
};

export default function GoalModal({
  isOpen,
  editingGoal,
  onClose,
  onAddGoal,
  onUpdateGoal,
}: GoalModalProps) {
  const [formState, setFormState] = useState<GoalDraft>(initialFormState);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormState(editingGoal ? {
      title: editingGoal.title,
      description: editingGoal.description,
      category: editingGoal.category,
      targetDate: editingGoal.targetDate ?? '',
    } : initialFormState);
    setError('');
  }, [editingGoal, isOpen]);

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

  const updateField = (field: keyof GoalDraft, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.title.trim()) {
      setError('Give this goal a title.');
      return;
    }

    const draft = {
      ...formState,
      title: formState.title.trim(),
      description: formState.description.trim(),
      targetDate: formState.targetDate || undefined,
    };

    if (editingGoal) {
      onUpdateGoal(editingGoal.id, draft);
    } else {
      onAddGoal(draft);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <Modal labelledBy="goal-modal-title" onClose={onClose}>
          <form className={styles.goalModal} onSubmit={handleSubmit}>
            <header>
              <p className="eyebrow">Long Range</p>
              <h2 id="goal-modal-title">{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
              <span>Keep the objective clear. Schedule the work later.</span>
            </header>

            <label>
              <span>Title</span>
              <input
                autoFocus
                value={formState.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Launch portfolio case study"
              />
            </label>

            <label>
              <span>Description</span>
              <textarea
                value={formState.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Define the outcome and why it matters."
              />
            </label>

            <div className={styles.modalGrid}>
              <label>
                <span>Category</span>
                <select
                  value={formState.category}
                  onChange={(event) => updateField('category', event.target.value as EventCategory)}
                >
                  {eventCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Target date</span>
                <input
                  type="date"
                  value={formState.targetDate ?? ''}
                  onChange={(event) => updateField('targetDate', event.target.value)}
                />
              </label>
            </div>

            {error ? <p className={styles.formError}>{error}</p> : null}

            <footer>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingGoal ? 'Save Changes' : 'Create Goal'}
              </Button>
            </footer>
          </form>
        </Modal>
      ) : null}
    </AnimatePresence>
  );
}
