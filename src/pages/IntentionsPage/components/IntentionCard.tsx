import { format, parseISO } from 'date-fns';
import { BatteryMedium, CalendarDays, Clock3, MoreHorizontal, SearchCheck, Sunrise } from 'lucide-react';
import type { Intention, IntentionStatus } from '../../../features/intentions';
import { getIntentionNextAction } from '../../../features/intentions';
import { getPlannedSessionLabel } from '../../../features/planning/utils/intentionPlanning';
import Button from '../../../shared/components/Button/Button';
import AtriaBadge from '../../../shared/ui/AtriaBadge';
import AtriaCapsule from '../../../shared/ui/AtriaCapsule';
import AtriaIcon from '../../../shared/ui/AtriaIcon';
import styles from '../IntentionsPage.module.css';

type IntentionCardProps = {
  intention: Intention;
  onEdit: (id: string) => void;
  onSetStatus: (id: string, status: IntentionStatus) => void;
  onDelete: (id: string) => void;
  onFindTime: (id: string) => void;
  plannedSessionCount: number;
};

function formatDeadline(deadline?: string) {
  return deadline ? format(parseISO(deadline), 'MMM d') : undefined;
}

function getStatusTone(status: IntentionStatus) {
  if (status === 'completed') {
    return 'success' as const;
  }

  if (status === 'paused') {
    return 'neutral' as const;
  }

  return 'rose' as const;
}

export default function IntentionCard({
  intention,
  onEdit,
  onSetStatus,
  onDelete,
  onFindTime,
  plannedSessionCount,
}: IntentionCardProps) {
  const nextAction = getIntentionNextAction(intention);
  const deadlineLabel = formatDeadline(intention.deadline);
  const canFindTime = intention.status === 'active' || intention.status === 'scheduled';

  return (
    <article className={`${styles.intentionCard} ${styles[intention.status]}`}>
      <div className={styles.cardMain}>
        <div className={styles.cardHeader}>
          <div>
            <AtriaBadge label={intention.status === 'scheduled' ? 'planned' : intention.status} tone={getStatusTone(intention.status)} />
            <h2>{intention.title}</h2>
          </div>

          <details className={styles.actionMenu}>
            <summary aria-label={`Actions for ${intention.title}`}>
              <AtriaIcon icon={MoreHorizontal} tone="rose" size="sm" />
            </summary>
            <div>
              <button type="button" onClick={() => onEdit(intention.id)}>Edit</button>
              {canFindTime ? (
                <button type="button" onClick={() => onFindTime(intention.id)}>Find time</button>
              ) : null}
              {intention.status !== 'active' ? (
                <button type="button" onClick={() => onSetStatus(intention.id, 'active')}>Mark active</button>
              ) : null}
              {intention.status !== 'scheduled' ? (
                <button type="button" onClick={() => onSetStatus(intention.id, 'scheduled')}>Mark as planned</button>
              ) : null}
              {intention.status !== 'paused' ? (
                <button type="button" onClick={() => onSetStatus(intention.id, 'paused')}>Pause</button>
              ) : null}
              {intention.status !== 'completed' ? (
                <button type="button" onClick={() => onSetStatus(intention.id, 'completed')}>Complete</button>
              ) : null}
              <button type="button" onClick={() => onDelete(intention.id)}>Delete</button>
            </div>
          </details>
        </div>

        {intention.desiredOutcome || intention.description ? (
          <p>{intention.desiredOutcome ?? intention.description}</p>
        ) : null}

        <div className={styles.cardMeta}>
          <AtriaCapsule label={intention.priority} tone={intention.priority === 'high' ? 'rose' : intention.priority === 'low' ? 'neutral' : 'mauve'} />
          {deadlineLabel ? <AtriaCapsule label={deadlineLabel} icon={CalendarDays} tone="mauve" uppercase={false} /> : null}
          {intention.estimatedMinutes ? <AtriaCapsule label={`${intention.estimatedMinutes} min`} icon={Clock3} tone="neutral" uppercase={false} /> : null}
          {intention.energyRequired ? <AtriaCapsule label={`${intention.energyRequired} energy`} icon={BatteryMedium} tone="rose" /> : null}
          {intention.preferredTimeOfDay ? <AtriaCapsule label={intention.preferredTimeOfDay} icon={Sunrise} tone="violet" /> : null}
        </div>

        <div className={styles.nextAction}>
          <span>Next</span>
          <strong>{nextAction}</strong>
        </div>

        <div className={styles.nextAction}>
          <span>Schedule</span>
          <strong>{getPlannedSessionLabel(plannedSessionCount)}</strong>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <Button variant="secondary" onClick={() => onEdit(intention.id)}>Edit</Button>
        {canFindTime ? (
          <Button variant="secondary" onClick={() => onFindTime(intention.id)}>
            <SearchCheck size={15} aria-hidden="true" /> Find time
          </Button>
        ) : null}
        {intention.status === 'completed' ? (
          <Button variant="ghost" onClick={() => onSetStatus(intention.id, 'active')}>Reopen</Button>
        ) : (
          <Button variant="ghost" onClick={() => onSetStatus(intention.id, 'completed')}>Complete</Button>
        )}
      </div>
    </article>
  );
}
