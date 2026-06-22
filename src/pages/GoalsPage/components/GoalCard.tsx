import { format, parseISO } from 'date-fns';
import { BriefcaseBusiness, CalendarDays, FolderKanban, RefreshCw } from 'lucide-react';
import { categoryColors } from '../../../features/calendar/constants/calendar.constants';
import type { FlexibleCalendarTask } from '../../../features/calendar/types/calendar.types';
import type { Project } from '../../../features/projects/types/projects.types';
import type { Goal, GoalStatus } from '../../../features/goals/types/goals.types';
import type { GoalProgress } from '../../../features/goals/utils/goalProgress';
import Button from '../../../shared/components/Button/Button';
import AtriaCapsule from '../../../shared/ui/AtriaCapsule';
import AtriaBadge from '../../../shared/ui/AtriaBadge';
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
        <span className={styles.goalMetaRow}>
          <AtriaCapsule label={goal.category} icon={BriefcaseBusiness} tone="rose" />
          <AtriaCapsule label={targetLabel} icon={CalendarDays} tone="mauve" uppercase={false} />
          <AtriaBadge label={goal.status} tone={goal.status === 'completed' ? 'success' : goal.status === 'archived' ? 'neutral' : 'rose'} />
        </span>
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
                  <span className={styles.goalMetaRow}>
                    <AtriaCapsule label={project.status} icon={FolderKanban} tone={project.status === 'archived' ? 'neutral' : 'rose'} />
                    <AtriaCapsule label={project.category} icon={BriefcaseBusiness} tone="mauve" />
                  </span>
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
                  <span className={styles.goalMetaRow}>
                    <AtriaCapsule label={task.date} icon={CalendarDays} tone="mauve" uppercase={false} />
                    {task.recurrence !== 'none' ? (
                      <AtriaCapsule label={`Repeat ${task.recurrence}`} icon={RefreshCw} tone="violet" />
                    ) : null}
                  </span>
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
