import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { BriefcaseBusiness, Folder, RefreshCw, Target } from 'lucide-react';
import Button from '../../../../shared/components/Button/Button';
import Modal from '../../../../shared/components/Modal/Modal';
import SelectControl from '../../../../shared/components/SelectControl/SelectControl';
import { useGoalsStore } from '../../../goals/store/goals.store';
import { useProjectsStore } from '../../../projects/store/projects.store';
import {
  eventCategories,
} from '../../constants/calendar.constants';
import { useEventForm } from '../../hooks/useEventForm';
import type {
  CalendarEvent,
  CalendarEventDraft,
  CalendarItemType,
  CalendarModalPreset,
  CalendarRecurrence,
  EventCategory,
} from '../../types/calendar.types';
import styles from './AddEventModal.module.css';

type AddEventModalProps = {
  isOpen: boolean;
  selectedWeekDate: Date;
  modalPreset?: CalendarModalPreset | null;
  editingEvent?: CalendarEvent | null;
  onClose: () => void;
  onAddEvent: (event: CalendarEventDraft) => void;
  onUpdateEvent: (id: string, event: CalendarEventDraft) => void;
};

const titleId = 'add-event-title';

export default function AddEventModal({
  isOpen,
  selectedWeekDate,
  modalPreset,
  editingEvent,
  onClose,
  onAddEvent,
  onUpdateEvent,
}: AddEventModalProps) {
  const isEditing = Boolean(editingEvent);
  const {
    values,
    errors,
    handleSubmit,
    updateCategory,
    updateField,
    updateItemType,
    updateProject,
  } = useEventForm({
    isOpen,
    editingEvent,
    modalPreset,
    selectedWeekDate,
    onSubmit: (eventDraft) => {
      if (editingEvent) {
        onUpdateEvent(editingEvent.id, eventDraft);
        return;
      }

      onAddEvent(eventDraft);
    },
  });
  const goals = useGoalsStore((state) => state.goals);
  const activeGoals = useMemo(() => goals.filter((goal) => goal.status === 'active'), [goals]);
  const projects = useProjectsStore((state) => state.projects);
  const activeProjects = useMemo(() => projects.filter((project) => project.status === 'active'), [projects]);
  const itemLabel = values.itemType === 'task' ? 'Task' : 'Event';

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

  return (
    <AnimatePresence>
      {isOpen ? (
        <Modal labelledBy={titleId} onClose={onClose}>
          <div className={styles.modalHeader}>
            <div>
              <p className="eyebrow">{isEditing ? 'Refine Signal' : 'New Signal'}</p>
              <h2 id={titleId}>{isEditing ? `Edit ${itemLabel}` : `New ${itemLabel}`}</h2>
            </div>
            <Button variant="icon" onClick={onClose} aria-label="Close modal">
              ×
            </Button>
          </div>

          <form onSubmit={handleSubmit} className={styles.eventForm}>
            <div className={styles.segmentedControl} aria-label="Item type">
              {(['event', 'task'] as CalendarItemType[]).map((itemType) => (
                <button
                  className={values.itemType === itemType ? styles.activeSegment : styles.segment}
                  key={itemType}
                  type="button"
                  onClick={() => updateItemType(itemType)}
                >
                  {itemType === 'event' ? 'Event' : 'Task'}
                </button>
              ))}
            </div>

            <label>
              Title
              <input
                value={values.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Launch planning"
                aria-invalid={Boolean(errors.title)}
                autoFocus
              />
              {errors.title ? <span className={styles.fieldError}>{errors.title}</span> : null}
            </label>

            <div className={styles.formRow}>
              <label>
                Date
                <input
                  type="date"
                  value={values.date}
                  onChange={(event) => updateField('date', event.target.value)}
                  aria-invalid={Boolean(errors.date)}
                />
                {errors.date ? <span className={styles.fieldError}>{errors.date}</span> : null}
              </label>
              {values.itemType === 'event' ? (
                <label>
                  Start time
                  <input
                    type="time"
                    value={values.startTime}
                    onChange={(event) => updateField('startTime', event.target.value)}
                    aria-invalid={Boolean(errors.startTime)}
                  />
                  {errors.startTime ? <span className={styles.fieldError}>{errors.startTime}</span> : null}
                </label>
              ) : null}
            </div>

            <div className={values.itemType === 'event' ? styles.formRow : styles.formRowSingle}>
              {values.itemType === 'event' ? (
                <label>
                  End time
                  <input
                    type="time"
                    value={values.endTime}
                    onChange={(event) => updateField('endTime', event.target.value)}
                    aria-invalid={Boolean(errors.endTime)}
                  />
                  {errors.endTime ? <span className={styles.fieldError}>{errors.endTime}</span> : null}
                </label>
              ) : null}
              <label>
                Accent
                <span className={styles.accentControl}>
                  <span
                    className={styles.accentSwatch}
                    style={{ background: values.accentColor }}
                    aria-hidden="true"
                  />
                  <span className={styles.accentValue}>{values.accentColor}</span>
                  <span className={styles.accentChevron} aria-hidden="true">⌄</span>
                  <input
                    type="color"
                    value={values.accentColor}
                    onChange={(event) => updateField('accentColor', event.target.value)}
                    aria-label="Event accent colour"
                  />
                </span>
              </label>
            </div>

            <label>
              Category
              <SelectControl
                icon={BriefcaseBusiness}
                value={values.category}
                onChange={(event) => updateCategory(event.target.value as EventCategory)}
              >
                {eventCategories.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </SelectControl>
            </label>

            {values.itemType === 'task' ? (
              <div className={styles.formRow}>
                <label>
                  Linked Goal
                  <SelectControl icon={Target} value={values.goalId} onChange={(event) => updateField('goalId', event.target.value)}>
                    <option value="">No goal</option>
                    {activeGoals.map((goal) => (
                      <option key={goal.id} value={goal.id}>{goal.title}</option>
                    ))}
                  </SelectControl>
                </label>
                <label>
                  Linked Project
                  <SelectControl
                    icon={Folder}
                    value={values.projectId}
                    onChange={(event) => {
                      const project = activeProjects.find((item) => item.id === event.target.value);
                      updateProject(event.target.value, project?.goalId);
                    }}
                  >
                    <option value="">No project</option>
                    {activeProjects.map((project) => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))}
                  </SelectControl>
                </label>
              </div>
            ) : null}

            <div className={values.recurrence === 'none' ? styles.formRowSingle : styles.formRow}>
              <label>
                Repeat
                <SelectControl
                  icon={RefreshCw}
                  value={values.recurrence}
                  onChange={(event) => updateField('recurrence', event.target.value as CalendarRecurrence)}
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </SelectControl>
              </label>

              {values.recurrence !== 'none' ? (
                <label>
                  Repeat until
                  <input
                    type="date"
                    value={values.recurrenceEndDate}
                    onChange={(event) => updateField('recurrenceEndDate', event.target.value)}
                    aria-invalid={Boolean(errors.recurrenceEndDate)}
                  />
                  {errors.recurrenceEndDate ? (
                    <span className={styles.fieldError}>{errors.recurrenceEndDate}</span>
                  ) : null}
                </label>
              ) : null}
            </div>

            {values.recurrence !== 'none' ? (
              <p className={styles.formHint}>
                Recurring items appear automatically in matching weeks. Editing or deleting updates the whole series.
              </p>
            ) : null}

            <label>
              Description
              <textarea
                value={values.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Add notes, context, or a short plan..."
                rows={4}
              />
            </label>

            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">{isEditing ? 'Save Changes' : `Create ${itemLabel}`}</Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </AnimatePresence>
  );
}
