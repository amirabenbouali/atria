import { AnimatePresence, motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import type { FlexibleCalendarTask } from '../../../features/calendar/types/calendar.types';
import type { Project } from '../../../features/projects/types/projects.types';
import type { ProjectProgress } from '../../../features/projects/utils/projectProgress';
import Button from '../../../shared/components/Button/Button';
import GlassPanel from '../../../shared/ui/GlassPanel/GlassPanel';
import styles from '../ProjectsPage.module.css';

type ProjectDetailDrawerProps = {
  project: Project | null;
  linkedGoalTitle?: string;
  linkedTasks: FlexibleCalendarTask[];
  progress: ProjectProgress;
  onClose: () => void;
  onEditProject: (id: string) => void;
  onCreateTask: (project: Project) => void;
  onEditTask: (id: string) => void;
  onToggleTaskComplete: (id: string) => void;
};

export default function ProjectDetailDrawer({
  project,
  linkedGoalTitle,
  linkedTasks,
  progress,
  onClose,
  onEditProject,
  onCreateTask,
  onEditTask,
  onToggleTaskComplete,
}: ProjectDetailDrawerProps) {
  const targetLabel = project?.targetDate ? format(parseISO(project.targetDate), 'MMM d, yyyy') : 'Open target';

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          className={styles.drawerLayer}
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <GlassPanel
            as={motion.aside}
            className={styles.projectDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-drawer-title"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className={styles.drawerHeader}>
              <div>
                <p className="eyebrow">Project Detail</p>
                <h2 id="project-drawer-title">{project.title}</h2>
              </div>
              <Button variant="icon" onClick={onClose} aria-label="Close project detail">
                ×
              </Button>
            </header>

            <div className={styles.drawerMeta}>
              <span>{project.category}</span>
              <span>{project.status}</span>
              <span>{targetLabel}</span>
              {linkedGoalTitle ? <span>Goal · {linkedGoalTitle}</span> : <span>No linked goal</span>}
            </div>

            {project.description ? <p className={styles.drawerDescription}>{project.description}</p> : null}

            <section className={styles.drawerProgress}>
              <div>
                <span>Progress</span>
                <strong>{progress.percentage}%</strong>
              </div>
              <div className={styles.progressTrack} aria-label={`${progress.percentage}% complete`}>
                <span style={{ width: `${progress.percentage}%` }} />
              </div>
              <p>{progress.completedLinkedTaskCount}/{progress.linkedTaskCount} linked tasks complete</p>
            </section>

            <div className={styles.drawerActions}>
              <Button variant="secondary" onClick={() => onEditProject(project.id)}>
                Edit Project
              </Button>
              <Button onClick={() => onCreateTask(project)}>
                New Task
              </Button>
            </div>

            <section className={styles.drawerTasks}>
              <div className={styles.drawerSectionHeader}>
                <p className="sectionLabel">Linked tasks</p>
                <strong>{linkedTasks.length}</strong>
              </div>
              {linkedTasks.length > 0 ? (
                linkedTasks.map((task) => (
                  <article className={styles.drawerTaskRow} key={task.id}>
                    <button type="button" onClick={() => onEditTask(task.id)}>
                      <span>{task.date}{task.recurrence !== 'none' ? ` · Repeat ${task.recurrence}` : ''}</span>
                      <strong>{task.title}</strong>
                    </button>
                    <Button variant="ghost" onClick={() => onToggleTaskComplete(task.id)}>
                      {task.completed ? 'Undo' : 'Done'}
                    </Button>
                  </article>
                ))
              ) : (
                <div className={styles.drawerEmpty}>
                  <strong>No linked tasks yet.</strong>
                  <span>Create the first task for this workstream.</span>
                </div>
              )}
            </section>
          </GlassPanel>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
