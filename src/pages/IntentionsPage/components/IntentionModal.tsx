import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { BatteryMedium, CalendarDays, Clock3, Flag, Sunrise, X } from 'lucide-react';
import Button from '../../../shared/components/Button/Button';
import Modal from '../../../shared/components/Modal/Modal';
import SelectControl from '../../../shared/components/SelectControl/SelectControl';
import AtriaIcon from '../../../shared/ui/AtriaIcon';
import { parseIntentionInput } from '../../../features/intentions';
import type {
  Intention,
  IntentionDraft,
  IntentionPriority,
  IntentionValidationErrors,
} from '../../../features/intentions';
import {
  hasIntentionValidationErrors,
  validateIntentionDraft,
} from '../../../features/intentions';
import { useSettingsStore } from '../../../features/settings/store/settings.store';
import type {
  EnergyRequirement,
  PreferredTimeOfDay,
} from '../../../features/timeQuality';
import { getEnergyCompatibilityNote } from '../../../features/timeQuality';
import styles from '../IntentionsPage.module.css';

type IntentionFormValues = {
  title: string;
  description: string;
  desiredOutcome: string;
  estimatedMinutes: string;
  deadline: string;
  priority: IntentionPriority;
  energyRequired: '' | EnergyRequirement;
  preferredTimeOfDay: '' | PreferredTimeOfDay;
};

type IntentionModalProps = {
  isOpen: boolean;
  editingIntention?: Intention | null;
  onClose: () => void;
  onAddIntention: (draft: IntentionDraft) => Intention | null;
  onUpdateIntention: (id: string, draft: IntentionDraft) => Intention | null;
  onSaved: (intention: Intention, mode: 'create' | 'edit') => void;
};

const titleId = 'intention-modal-title';

function getInitialValues(intention?: Intention | null): IntentionFormValues {
  return {
    title: intention?.title ?? '',
    description: intention?.description ?? '',
    desiredOutcome: intention?.desiredOutcome ?? '',
    estimatedMinutes: intention?.estimatedMinutes ? String(intention.estimatedMinutes) : '',
    deadline: intention?.deadline ?? '',
    priority: intention?.priority ?? 'medium',
    energyRequired: intention?.energyRequired ?? '',
    preferredTimeOfDay: intention?.preferredTimeOfDay ?? '',
  };
}

function getDraftFromValues(values: IntentionFormValues): IntentionDraft {
  return {
    title: values.title,
    description: values.description || undefined,
    desiredOutcome: values.desiredOutcome || undefined,
    estimatedMinutes: values.estimatedMinutes ? Number(values.estimatedMinutes) : undefined,
    deadline: values.deadline || undefined,
    priority: values.priority,
    energyRequired: values.energyRequired || undefined,
    preferredTimeOfDay: values.preferredTimeOfDay || undefined,
  };
}

function getFormErrors(values: IntentionFormValues) {
  const draft = getDraftFromValues(values);
  const errors = validateIntentionDraft(draft);

  if (values.estimatedMinutes && !Number.isFinite(Number(values.estimatedMinutes))) {
    errors.estimatedMinutes = 'Estimated duration must be a positive number.';
  }

  return errors;
}

export default function IntentionModal({
  isOpen,
  editingIntention,
  onClose,
  onAddIntention,
  onUpdateIntention,
  onSaved,
}: IntentionModalProps) {
  const isEditing = Boolean(editingIntention);
  const [quickInput, setQuickInput] = useState('');
  const [values, setValues] = useState<IntentionFormValues>(() => getInitialValues(editingIntention));
  const [errors, setErrors] = useState<IntentionValidationErrors>({});
  const energyProfile = useSettingsStore((state) => state.preferences.energyProfile);
  const parsedInput = useMemo(() => parseIntentionInput(quickInput, new Date()), [quickInput]);
  const energyContextNote = getEnergyCompatibilityNote(
    values.preferredTimeOfDay || undefined,
    values.energyRequired || undefined,
    energyProfile,
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setQuickInput('');
    setValues(getInitialValues(editingIntention));
    setErrors({});
  }, [editingIntention, isOpen]);

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

  const updateField = <Field extends keyof IntentionFormValues>(field: Field, value: IntentionFormValues[Field]) => {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };

  const applyQuickCapture = () => {
    if (!parsedInput.title) {
      setErrors({ title: 'Add a short intention first.' });
      return;
    }

    setValues((currentValues) => ({
      ...currentValues,
      title: parsedInput.title,
      deadline: parsedInput.deadline ?? currentValues.deadline,
      estimatedMinutes: parsedInput.estimatedMinutes ? String(parsedInput.estimatedMinutes) : currentValues.estimatedMinutes,
      preferredTimeOfDay: parsedInput.preferredTimeOfDay ?? currentValues.preferredTimeOfDay,
      priority: parsedInput.priority ?? currentValues.priority,
    }));
    setErrors({});
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = getFormErrors(values);
    setErrors(nextErrors);

    if (hasIntentionValidationErrors(nextErrors)) {
      return;
    }

    const draft = getDraftFromValues(values);
    const savedIntention = editingIntention
      ? onUpdateIntention(editingIntention.id, draft)
      : onAddIntention(draft);

    if (savedIntention) {
      onSaved(savedIntention, editingIntention ? 'edit' : 'create');
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <Modal labelledBy={titleId} onClose={onClose}>
          <div className={styles.modalHeader}>
            <div>
              <p className="eyebrow">{isEditing ? 'Refine Intention' : 'Intention Inbox'}</p>
              <h2 id={titleId}>{isEditing ? 'Edit intention' : 'New intention'}</h2>
            </div>
            <Button variant="icon" onClick={onClose} aria-label="Close intention modal">
              <AtriaIcon icon={X} tone="rose" size="sm" />
            </Button>
          </div>

          <form className={styles.intentionForm} onSubmit={handleSubmit}>
            {!isEditing ? (
              <section className={styles.quickCapture} aria-label="Quick capture">
                <label>
                  Quick capture
                  <textarea
                    value={quickInput}
                    onChange={(event) => setQuickInput(event.target.value)}
                    placeholder="finish the dashboard this week for 90 minutes"
                    rows={3}
                  />
                </label>
                <div className={styles.quickPreview}>
                  <span>{parsedInput.detectedParts.length > 0 ? parsedInput.detectedParts.join(' · ') : 'No structured hints detected yet'}</span>
                  <Button variant="secondary" onClick={applyQuickCapture}>
                    Use details
                  </Button>
                </div>
              </section>
            ) : null}

            <label>
              Title
              <input
                value={values.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Make progress on the portfolio"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'intention-title-error' : undefined}
                autoFocus
              />
              {errors.title ? <span className={styles.fieldError} id="intention-title-error">{errors.title}</span> : null}
            </label>

            <label>
              Desired outcome
              <input
                value={values.desiredOutcome}
                onChange={(event) => updateField('desiredOutcome', event.target.value)}
                placeholder="Know what the next useful step is"
              />
            </label>

            <label>
              Description
              <textarea
                value={values.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Add context without turning it into a task yet..."
                rows={3}
              />
            </label>

            <div className={styles.formGrid}>
              <label>
                Deadline
                <input
                  type="date"
                  value={values.deadline}
                  onChange={(event) => updateField('deadline', event.target.value)}
                  aria-invalid={Boolean(errors.deadline)}
                  aria-describedby={errors.deadline ? 'intention-deadline-error' : undefined}
                />
                {errors.deadline ? <span className={styles.fieldError} id="intention-deadline-error">{errors.deadline}</span> : null}
              </label>

              <label>
                Estimated minutes
                <input
                  min="1"
                  type="number"
                  value={values.estimatedMinutes}
                  onChange={(event) => updateField('estimatedMinutes', event.target.value)}
                  placeholder="90"
                  aria-invalid={Boolean(errors.estimatedMinutes)}
                  aria-describedby={errors.estimatedMinutes ? 'intention-duration-error' : undefined}
                />
                {errors.estimatedMinutes ? <span className={styles.fieldError} id="intention-duration-error">{errors.estimatedMinutes}</span> : null}
              </label>
            </div>

            <div className={styles.formGrid}>
              <label>
                Priority
                <SelectControl icon={Flag} value={values.priority} onChange={(event) => updateField('priority', event.target.value as IntentionPriority)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </SelectControl>
              </label>

              <label>
                Energy required
                <span className={styles.fieldHint}>How much capacity does this usually need?</span>
                <SelectControl icon={BatteryMedium} value={values.energyRequired} onChange={(event) => updateField('energyRequired', event.target.value as '' | EnergyRequirement)}>
                  <option value="">Not sure</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </SelectControl>
              </label>
            </div>

            <div className={styles.formGrid}>
              <label>
                Preferred time
                <span className={styles.fieldHint}>When would you ideally work on this?</span>
                <SelectControl icon={Sunrise} value={values.preferredTimeOfDay} onChange={(event) => updateField('preferredTimeOfDay', event.target.value as '' | PreferredTimeOfDay)}>
                  <option value="">Any time</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="any">Any</option>
                </SelectControl>
              </label>

              <div className={styles.formNote}>
                <AtriaIcon icon={CalendarDays} tone="mauve" size="sm" shell />
                <span>Intentions stay here until you choose when they belong.</span>
              </div>
            </div>

            {energyContextNote ? (
              <p className={styles.energyNote}>{energyContextNote}</p>
            ) : null}

            <footer className={styles.modalActions}>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">{isEditing ? 'Save intention' : 'Create intention'}</Button>
            </footer>
          </form>
        </Modal>
      ) : null}
    </AnimatePresence>
  );
}
