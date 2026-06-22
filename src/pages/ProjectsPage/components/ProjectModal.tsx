import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import { eventCategories } from '../../../features/calendar/constants/calendar.constants';
import type { EventCategory } from '../../../features/calendar/types/calendar.types';
import { useGoalsStore } from '../../../features/goals/store/goals.store';
import type { Project, ProjectDraft } from '../../../features/projects/types/projects.types';
import Button from '../../../shared/components/Button/Button';
import Modal from '../../../shared/components/Modal/Modal';
import styles from '../ProjectsPage.module.css';

type ProjectModalProps = {
  isOpen: boolean;
  editingProject: Project | null;
  onClose: () => void;
  onAddProject: (project: ProjectDraft) => void;
  onUpdateProject: (id: string, project: ProjectDraft) => void;
};

const initialFormState: ProjectDraft = {
  title: '',
  description: '',
  category: 'Work',
  goalId: '',
  targetDate: '',
};

export default function ProjectModal({
  isOpen,
  editingProject,
  onClose,
  onAddProject,
  onUpdateProject,
}: ProjectModalProps) {
  const [formState, setFormState] = useState<ProjectDraft>(initialFormState);
  const [error, setError] = useState('');
  const goals = useGoalsStore((state) => state.goals);
  const activeGoals = useMemo(() => goals.filter((goal) => goal.status === 'active'), [goals]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormState(editingProject ? {
      title: editingProject.title,
      description: editingProject.description,
      category: editingProject.category,
      goalId: editingProject.goalId ?? '',
      targetDate: editingProject.targetDate ?? '',
    } : initialFormState);
    setError('');
  }, [editingProject, isOpen]);

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

  const updateField = (field: keyof ProjectDraft, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.title.trim()) {
      setError('Give this project a title.');
      return;
    }

    const draft = {
      ...formState,
      title: formState.title.trim(),
      description: formState.description.trim(),
      goalId: formState.goalId || undefined,
      targetDate: formState.targetDate || undefined,
    };

    if (editingProject) {
      onUpdateProject(editingProject.id, draft);
    } else {
      onAddProject(draft);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <Modal labelledBy="project-modal-title" onClose={onClose}>
          <form className={styles.projectModal} onSubmit={handleSubmit}>
            <header>
              <p className="eyebrow">Workstream</p>
              <h2 id="project-modal-title">{editingProject ? 'Edit Project' : 'New Project'}</h2>
              <span>Connect a goal to a real body of scheduled work.</span>
            </header>

            <label>
              <span>Title</span>
              <input
                autoFocus
                value={formState.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Build launch system"
              />
            </label>

            <label>
              <span>Description</span>
              <textarea
                value={formState.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Define the workstream and its outcome."
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
                <span>Linked goal</span>
                <select value={formState.goalId ?? ''} onChange={(event) => updateField('goalId', event.target.value)}>
                  <option value="">No goal</option>
                  {activeGoals.map((goal) => (
                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              <span>Target date</span>
              <input
                type="date"
                value={formState.targetDate ?? ''}
                onChange={(event) => updateField('targetDate', event.target.value)}
              />
            </label>

            {error ? <p className={styles.formError}>{error}</p> : null}

            <footer>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProject ? 'Save Changes' : 'Create Project'}
              </Button>
            </footer>
          </form>
        </Modal>
      ) : null}
    </AnimatePresence>
  );
}
