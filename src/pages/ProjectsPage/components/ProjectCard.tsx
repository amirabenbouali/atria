import { format, parseISO } from 'date-fns';
import { BriefcaseBusiness, CalendarDays, Gauge, Layers3, Target } from 'lucide-react';
import { categoryColors } from '../../../features/calendar/constants/calendar.constants';
import type { Project, ProjectStatus } from '../../../features/projects/types/projects.types';
import type { ProjectProgress } from '../../../features/projects/utils/projectProgress';
import {
  projectComplexityLabels,
  projectImpactLabels,
  projectStageLabels,
  type ProjectDepth,
} from '../../../features/projects/utils/projectDepth';
import Button from '../../../shared/components/Button/Button';
import AtriaCapsule from '../../../shared/ui/AtriaCapsule';
import AtriaBadge from '../../../shared/ui/AtriaBadge';
import styles from '../ProjectsPage.module.css';

type ProjectCardProps = {
  project: Project;
  linkedGoalTitle?: string;
  progress: ProjectProgress;
  depth: ProjectDepth;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onSetStatus: (id: string, status: ProjectStatus) => void;
  onDelete: (id: string) => void;
};

export default function ProjectCard({
  project,
  linkedGoalTitle,
  progress,
  depth,
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
        <span className={styles.projectMetaRow}>
          <AtriaCapsule label={project.category} icon={BriefcaseBusiness} tone="rose" />
          <AtriaCapsule label={targetLabel} icon={CalendarDays} tone="mauve" uppercase={false} />
          <AtriaBadge label={project.status} tone={project.status === 'completed' ? 'success' : project.status === 'archived' ? 'neutral' : 'rose'} />
        </span>
        <strong>{project.title}</strong>
        {linkedGoalTitle ? <AtriaCapsule label={linkedGoalTitle} icon={Target} tone="violet" uppercase={false} /> : null}
        <span className={styles.projectMetaRow}>
          <AtriaCapsule label={projectStageLabels[project.stage]} icon={Layers3} tone="mauve" />
          <AtriaCapsule label={projectImpactLabels[project.impact]} icon={Target} tone="rose" uppercase={false} />
          <AtriaCapsule label={projectComplexityLabels[project.complexity]} icon={Gauge} tone="neutral" />
        </span>
        {project.description ? <p>{project.description}</p> : null}
      </button>
      <div className={styles.depthSignal}>
        <span>{depth.label}</span>
        <strong>{depth.score}</strong>
      </div>
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
