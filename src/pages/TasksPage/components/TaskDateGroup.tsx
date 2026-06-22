import { format, parseISO } from 'date-fns';
import TaskListItem from './TaskListItem';
import type { TaskGroup } from '../utils/tasksPageData';
import styles from '../TasksPage.module.css';

type TaskDateGroupProps = {
  group: TaskGroup;
  goalTitleById: Record<string, string>;
  projectTitleById: Record<string, string>;
  projectStatusById: Record<string, string>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

export default function TaskDateGroup({
  group,
  goalTitleById,
  projectTitleById,
  projectStatusById,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskDateGroupProps) {
  const completedCount = group.tasks.filter((task) => task.completed).length;

  return (
    <section className={styles.taskGroup}>
      <header>
        <div>
          <p className="sectionLabel">{format(parseISO(group.date), 'EEEE')}</p>
          <h2>{format(parseISO(group.date), 'MMM d')}</h2>
        </div>
        <strong>{completedCount}/{group.tasks.length}</strong>
      </header>
      <div className={styles.taskStack}>
        {group.tasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            linkedGoalTitle={task.goalId ? goalTitleById[task.goalId] : undefined}
            linkedProjectTitle={task.projectId ? projectTitleById[task.projectId] : undefined}
            linkedProjectStatus={task.projectId ? projectStatusById[task.projectId] : undefined}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>
    </section>
  );
}
