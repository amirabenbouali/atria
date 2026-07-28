import type { Intention } from '../types/intentions.types';

export function getIntentionNextAction(intention: Intention) {
  if (intention.status === 'completed') {
    return 'Captured in your progress history';
  }

  if (intention.status === 'paused') {
    return 'Paused until it feels relevant again';
  }

  if (!intention.desiredOutcome) {
    return 'Review the desired outcome';
  }

  if (!intention.estimatedMinutes) {
    return 'Estimate how much time this needs';
  }

  if (!intention.deadline) {
    return 'Set a deadline';
  }

  if (intention.status === 'scheduled') {
    return 'Marked as planned';
  }

  return 'Ready for future scheduling';
}
