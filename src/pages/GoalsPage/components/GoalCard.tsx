import { format, parseISO } from 'date-fns';
import { categoryColors } from '../../../features/calendar/constants/calendar.constants';
import type { FlexibleCalendarTask } from '../../../features/calendar/types/calendar.types';
import type { Project } from '../../../features/projects/types/projects.types';
import type { Goal, GoalStatus } from '../../../features/goals/types/goals.types';
import type { GoalProgress } from '../../../features/goals/utils/goalProgress';
import Button from '../../../shared/components/Button/Button';
import styles from '../GoalsPage.module.css';

type GoalCardProps = {
  goal: Goal;
  progress: GoalProgress;
  linkedTasks: FlexibleCalendarTask[];
  linkedProjects: Project[];
  isExpanded: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onEditTask: (id: string) => void;
  onToggleTaskComplete: (id: string) => void;
  onSetStatus: (id: string, status: GoalStatus) => void;
  onDelete: (id: string) => void;
};

export default function GoalCard({
  goal,
  progress,
  linkedTasks,
  linkedProjects,
  isExpanded,
  onSelect,
  onEdit,
  onEditTask,
  onToggleTaskComplete,
  onSetStatus,
  onDelete,
}: GoalCardProps) {
  const targetLabel = goal.targetDate ? format(parseISO(goal.targetDate), 'MMM d, yyyy') : 'Open target';

  return (
    <article className={`${styles.goalCard} ${styles[goal.status]}`}>
      <div className={styles.goalAccent} style={{ background: categoryColors[goal.category] }} />
      <button className={styles.goalBody} type="button" onClick={() => onSelect(goal.id)}>
        <span>{goal.category} · {targetLabel}</span>
        <strong>{goal.title}</strong>
        {goal.description ? <p>{goal.description}</p> : null}
      </button>
      <div className={styles.goalProgress}>
        <div>
          <span>{progress.completedLinkedTaskCount}/{progress.linkedTaskCount} tasks</span>
          <strong>{progress.percentage}%</strong>
        </div>
        <div className={styles.progressTrack} aria-label={`${progress.percentage}% complete`}>
          <span style={{ width: `${progress.percentage}%` }} />
        </div>
      </div>
      <div className={styles.goalActions}>
        <Button variant="ghost" onClick={() => onEdit(goal.id)}>
          Edit
        </Button>
        {goal.status === 'completed' ? (
          <Button variant="ghost" onClick={() => onSetStatus(goal.id, 'active')}>
            Reopen
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => onSetStatus(goal.id, 'completed')}>
            Complete
          </Button>
        )}
        {goal.status === 'archived' ? (
          <Button variant="ghost" className={styles.archiveButton} onClick={() => onDelete(goal.id)}>
            Delete
          </Button>
        ) : (
          <Button variant="ghost" className={styles.archiveButton} onClick={() => onSetStatus(goal.id, 'archived')}>
            Archive
          </Button>
        )}
      </div>
      {isExpanded ? (
        <div className={styles.linkedTasks}>
          <p className="sectionLabel">Linked projects</p>
          {linkedProjects.length > 0 ? (
            linkedProjects.map((project) => (
              <div
                className={`${styles.linkedTaskRow} ${project.status === 'archived' ? styles.archivedLinkedProject : ''}`}
                key={project.id}
              >
                <div className={styles.linkedProjectIdentity}>
                  <span>{project.status} · {project.category}</span>
                  <strong>{project.title}</strong>
                </div>
                <em>{project.targetDate ?? 'Open'}</em>
              </div>
            ))
          ) : (
            <span className={styles.noLinkedTasks}>No linked projects yet.</span>
          )}
          <p className="sectionLabel">Linked tasks</p>
          {linkedTasks.length > 0 ? (
            linkedTasks.map((task) => (
              <div className={styles.linkedTaskRow} key={task.id}>
                <button type="button" onClick={() => onEditTask(task.id)}>
                  <span>{task.date}{task.recurrence !== 'none' ? ` · Repeat ${task.recurrence}` : ''}</span>
                  <strong>{task.title}</strong>
                </button>
                <Button variant="ghost" onClick={() => onToggleTaskComplete(task.id)}>
                  {task.completed ? 'Undo' : 'Done'}
                </Button>
              </div>
            ))
          ) : (
            <span className={styles.noLinkedTasks}>No linked tasks yet.</span>
          )}
        </div>
      ) : null}
    </article>
  );
}
