import { format, parseISO } from 'date-fns';
import { categoryColors } from '../../../features/calendar/constants/calendar.constants';
import type { Project, ProjectStatus } from '../../../features/projects/types/projects.types';
import type { ProjectProgress } from '../../../features/projects/utils/projectProgress';
import Button from '../../../shared/components/Button/Button';
import styles from '../ProjectsPage.module.css';

type ProjectCardProps = {
  project: Project;
  linkedGoalTitle?: string;
  progress: ProjectProgress;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onSetStatus: (id: string, status: ProjectStatus) => void;
  onDelete: (id: string) => void;
};

export default function ProjectCard({
  project,
  linkedGoalTitle,
  progress,
  onSelect,
  onEdit,
  onSetStatus,
  onDelete,
}: ProjectCardProps) {
  const targetLabel = project.targetDate ? format(parseISO(project.targetDate), 'MMM d, yyyy') : 'Open target';

  return (
    <article className={`${styles.projectCard} ${styles[project.status]}`}>
      <div className={styles.projectAccent} style={{ background: categoryColors[project.category] }} />
      <button className={styles.projectBody} type="button" onClick={() => onSelect(project.id)}>
        <span>{project.category} · {targetLabel}</span>
        <strong>{project.title}</strong>
        {linkedGoalTitle ? <em>Goal · {linkedGoalTitle}</em> : null}
        {project.description ? <p>{project.description}</p> : null}
      </button>
      <div className={styles.projectProgress}>
        <div>
          <span>{progress.completedLinkedTaskCount}/{progress.linkedTaskCount} tasks</span>
          <strong>{progress.percentage}%</strong>
        </div>
        <div className={styles.progressTrack} aria-label={`${progress.percentage}% complete`}>
          <span style={{ width: `${progress.percentage}%` }} />
        </div>
      </div>
      <div className={styles.projectActions}>
        <Button variant="ghost" onClick={() => onEdit(project.id)}>
          Edit
        </Button>
        {project.status === 'completed' ? (
          <Button variant="ghost" onClick={() => onSetStatus(project.id, 'active')}>
            Reopen
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => onSetStatus(project.id, 'completed')}>
            Complete
          </Button>
        )}
        {project.status === 'archived' ? (
          <Button variant="ghost" className={styles.archiveButton} onClick={() => onDelete(project.id)}>
            Delete
          </Button>
        ) : (
          <Button variant="ghost" className={styles.archiveButton} onClick={() => onSetStatus(project.id, 'archived')}>
            Archive
          </Button>
        )}
      </div>
    </article>
  );
}
