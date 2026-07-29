import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { addMinutes, format, parseISO } from 'date-fns';
import { CalendarClock, Clock3, WandSparkles, X } from 'lucide-react';
import type { CalendarEvent } from '../../../calendar/types/calendar.types';
import type { Intention } from '../../../intentions';
import type { EnergyProfile } from '../../../timeQuality';
import Button from '../../../../shared/components/Button/Button';
import Modal from '../../../../shared/components/Modal/Modal';
import AtriaBadge from '../../../../shared/ui/AtriaBadge';
import AtriaCapsule from '../../../../shared/ui/AtriaCapsule';
import {
  generatePlanningSuggestions,
  validateAdjustedSuggestion,
} from '../../services/planningSuggestion.service';
import type { PlanningSuggestion } from '../../types/planning.types';
import { getPlanningRange, toLocalDateTime } from '../../utils/planningDateTime';
import { resolvePlanningConfig } from '../../utils/planningConfig';
import {
  getPlanningConfidenceLabel,
  getSuggestionDateLabel,
  getSuggestionReasonMessage,
  getSuggestionSearchRangeLabel,
  getSuggestionTimeLabel,
  getSuggestionWarningMessage,
} from '../../utils/planningPresentation';
import styles from './SuggestionReviewModal.module.css';

type SuggestionReviewModalProps = {
  isOpen: boolean;
  intention: Intention | null;
  calendarItems: CalendarEvent[];
  energyProfile: EnergyProfile;
  weekStartsOnMonday: boolean;
  onClose: () => void;
  onAccept: (suggestion: PlanningSuggestion) => boolean;
};

const titleId = 'planning-suggestion-title';

function getInitialAdjustValues(suggestion: PlanningSuggestion | null) {
  if (!suggestion) {
    return {
      date: '',
      startTime: '',
      durationMinutes: 45,
    };
  }

  const start = parseISO(suggestion.proposedStart);

  return {
    date: format(start, 'yyyy-MM-dd'),
    startTime: format(start, 'HH:mm'),
    durationMinutes: suggestion.durationMinutes,
  };
}

function getAdjustedSuggestion(suggestion: PlanningSuggestion, date: string, startTime: string, durationMinutes: number) {
  const proposedStart = toLocalDateTime(date, startTime);
  const proposedEnd = addMinutes(proposedStart, durationMinutes);

  return {
    ...suggestion,
    proposedStart: proposedStart.toISOString(),
    proposedEnd: proposedEnd.toISOString(),
    durationMinutes,
  };
}

export default function SuggestionReviewModal({
  isOpen,
  intention,
  calendarItems,
  energyProfile,
  weekStartsOnMonday,
  onClose,
  onAccept,
}: SuggestionReviewModalProps) {
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustErrors, setAdjustErrors] = useState<string[]>([]);
  const now = useMemo(() => new Date(), [isOpen]);
  const config = resolvePlanningConfig();
  const searchRange = intention
    ? getPlanningRange(now, config.searchDays, intention.deadline)
    : { start: now, end: now };
  const suggestions = useMemo(
    () =>
      intention
        ? generatePlanningSuggestions({
            intention,
            calendarItems,
            energyProfile,
            now,
            weekStartsOnMonday,
          })
        : [],
    [calendarItems, energyProfile, intention, now, weekStartsOnMonday],
  );
  const activeSuggestion = suggestions.find((suggestion) => suggestion.id === activeSuggestionId) ?? suggestions[0] ?? null;
  const [adjustValues, setAdjustValues] = useState(() => getInitialAdjustValues(activeSuggestion));

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

  useEffect(() => {
    if (!isOpen) {
      setActiveSuggestionId(null);
      setIsAdjusting(false);
      setAdjustErrors([]);
      return;
    }

    setActiveSuggestionId(suggestions[0]?.id ?? null);
    setIsAdjusting(false);
    setAdjustErrors([]);
  }, [isOpen, suggestions]);

  useEffect(() => {
    if (!isAdjusting) {
      setAdjustValues(getInitialAdjustValues(activeSuggestion));
    }
  }, [activeSuggestion, isAdjusting]);

  const handleAccept = (suggestion: PlanningSuggestion) => {
    const accepted = onAccept(suggestion);

    if (!accepted) {
      setAdjustErrors(['This time is no longer available. Review the updated suggestions.']);
    }
  };

  const handleAcceptAdjusted = () => {
    if (!intention || !activeSuggestion) {
      return;
    }

    const durationMinutes = Number(adjustValues.durationMinutes);
    const adjustedSuggestion = getAdjustedSuggestion(
      activeSuggestion,
      adjustValues.date,
      adjustValues.startTime,
      durationMinutes,
    );
    const validation = validateAdjustedSuggestion({
      intention,
      calendarItems,
      energyProfile,
      start: parseISO(adjustedSuggestion.proposedStart),
      end: parseISO(adjustedSuggestion.proposedEnd),
      now,
      weekStartsOnMonday,
    });

    if (!validation.isValid) {
      setAdjustErrors(validation.errors);
      return;
    }

    handleAccept({
      ...adjustedSuggestion,
      warningCodes: Array.from(new Set([...adjustedSuggestion.warningCodes, ...validation.warnings])),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && intention ? (
        <Modal labelledBy={titleId} onClose={onClose}>
          <div className={styles.modalHeader}>
            <div>
              <p className="eyebrow">Planning Suggestions</p>
              <h2 id={titleId}>Find time</h2>
            </div>
            <Button variant="icon" onClick={onClose} aria-label="Close planning suggestions">
              <X size={17} aria-hidden="true" />
            </Button>
          </div>

          <section className={styles.summary} aria-label="Planning context">
            <strong>{intention.title}</strong>
            <div className={styles.metaRow}>
              <AtriaCapsule
                icon={Clock3}
                label={intention.estimatedMinutes ? `${intention.estimatedMinutes} min estimate` : '45 min assumed'}
                tone="neutral"
                uppercase={false}
              />
              <AtriaCapsule
                icon={CalendarClock}
                label={`Search ${getSuggestionSearchRangeLabel(searchRange.start, searchRange.end)}`}
                tone="mauve"
                uppercase={false}
              />
              {intention.energyRequired ? (
                <AtriaCapsule label={`${intention.energyRequired} energy`} tone="rose" />
              ) : null}
              {intention.preferredTimeOfDay ? (
                <AtriaCapsule label={intention.preferredTimeOfDay} tone="violet" />
              ) : null}
            </div>
            <span>Atria found these using your calendar, intention details, and energy settings. Nothing changes until you accept a block.</span>
          </section>

          {intention.deadline && parseISO(intention.deadline) < new Date(format(now, 'yyyy-MM-dd')) ? (
            <div className={styles.emptyState}>
              <p className="eyebrow">Deadline Passed</p>
              <h3>This deadline has passed.</h3>
              <span>Update it before finding time.</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className={styles.suggestionList}>
              {suggestions.map((suggestion) => (
                <article
                  className={suggestion.id === activeSuggestion?.id ? styles.activeSuggestionCard : styles.suggestionCard}
                  key={suggestion.id}
                  aria-labelledby={`${suggestion.id}-heading`}
                >
                  <div className={styles.suggestionHeader}>
                    <div>
                      <AtriaBadge label={getPlanningConfidenceLabel(suggestion.confidence)} tone={suggestion.confidence === 'high' ? 'success' : 'rose'} />
                      <h3 id={`${suggestion.id}-heading`}>{getSuggestionDateLabel(suggestion)}</h3>
                      <span>{getSuggestionTimeLabel(suggestion)}</span>
                    </div>
                    <AtriaCapsule label={`${suggestion.durationMinutes} min`} icon={WandSparkles} tone="mauve" uppercase={false} />
                  </div>

                  <ul className={styles.reasonList} aria-label="Reasons this block may fit">
                    {suggestion.reasonCodes.slice(0, 3).map((code) => (
                      <li key={code}>{getSuggestionReasonMessage(code)}</li>
                    ))}
                  </ul>

                  {suggestion.warningCodes.length > 0 ? (
                    <ul className={styles.warningList} aria-label="Warnings for this block">
                      {suggestion.warningCodes.slice(0, 3).map((code) => (
                        <li key={code}>{getSuggestionWarningMessage(code)}</li>
                      ))}
                    </ul>
                  ) : null}

                  <div className={styles.cardActions}>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setActiveSuggestionId(suggestion.id);
                        setIsAdjusting(true);
                        setAdjustErrors([]);
                      }}
                    >
                      Adjust
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveSuggestionId(suggestion.id);
                        handleAccept(suggestion);
                      }}
                    >
                      Accept
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className="eyebrow">No Open Block</p>
              <h3>Atria could not find an open block in the next seven days.</h3>
              <span>Try a shorter estimate, extend the deadline, or review your calendar.</span>
            </div>
          )}

          {isAdjusting && activeSuggestion ? (
            <section className={styles.adjustPanel} aria-label="Adjust proposed block">
              <strong>Adjust before accepting</strong>
              <div className={styles.adjustGrid}>
                <label>
                  Date
                  <input
                    type="date"
                    value={adjustValues.date}
                    onChange={(event) => setAdjustValues((values) => ({ ...values, date: event.target.value }))}
                  />
                </label>
                <label>
                  Start time
                  <input
                    type="time"
                    value={adjustValues.startTime}
                    onChange={(event) => setAdjustValues((values) => ({ ...values, startTime: event.target.value }))}
                  />
                </label>
                <label>
                  Duration
                  <input
                    type="number"
                    min={config.minimumFocusMinutes}
                    step={5}
                    value={adjustValues.durationMinutes}
                    onChange={(event) =>
                      setAdjustValues((values) => ({ ...values, durationMinutes: Number(event.target.value) }))
                    }
                  />
                </label>
              </div>
              {adjustErrors.length > 0 ? (
                <ul className={styles.errorList} aria-live="polite">
                  {adjustErrors.map((error) => <li key={error}>{error}</li>)}
                </ul>
              ) : null}
              <div className={styles.cardActions}>
                <Button variant="secondary" onClick={() => setIsAdjusting(false)}>Cancel adjust</Button>
                <Button onClick={handleAcceptAdjusted}>Accept adjusted</Button>
              </div>
            </section>
          ) : null}

          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={onClose}>Dismiss</Button>
          </div>
        </Modal>
      ) : null}
    </AnimatePresence>
  );
}
