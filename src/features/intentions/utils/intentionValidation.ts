import { isIsoTimestamp, isLocalDateKey } from '../../../shared/utils/dateValidation';
import { createId } from '../../../shared/utils/id';
import {
  isEnergyRequirement,
  isPreferredTimeOfDay,
} from '../../timeQuality';
import type {
  Intention,
  IntentionDraft,
  IntentionPriority,
  IntentionStatus,
  IntentionUpdate,
  IntentionValidationErrors,
} from '../types/intentions.types';

export const intentionPriorities: IntentionPriority[] = ['low', 'medium', 'high'];
export const intentionStatuses: IntentionStatus[] = ['active', 'scheduled', 'completed', 'paused'];
export const defaultIntentionPriority: IntentionPriority = 'medium';
export const defaultIntentionStatus: IntentionStatus = 'active';

type StoredIntention = Partial<Intention>;

export function isIntentionPriority(value: unknown): value is IntentionPriority {
  return intentionPriorities.includes(value as IntentionPriority);
}

export function isIntentionStatus(value: unknown): value is IntentionStatus {
  return intentionStatuses.includes(value as IntentionStatus);
}

function trimRequiredText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function trimOptionalText(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function normalizeEstimatedMinutes(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }

  return Math.round(value);
}

export function validateIntentionDraft(draft: IntentionDraft): IntentionValidationErrors {
  const errors: IntentionValidationErrors = {};

  if (!trimRequiredText(draft.title)) {
    errors.title = 'Title is required.';
  }

  if (
    draft.estimatedMinutes !== undefined &&
    (typeof draft.estimatedMinutes !== 'number' || !Number.isFinite(draft.estimatedMinutes) || draft.estimatedMinutes <= 0)
  ) {
    errors.estimatedMinutes = 'Estimated duration must be a positive number.';
  }

  if (draft.deadline !== undefined && draft.deadline !== '' && !isLocalDateKey(draft.deadline)) {
    errors.deadline = 'Deadline must use YYYY-MM-DD.';
  }

  if (draft.priority !== undefined && !isIntentionPriority(draft.priority)) {
    errors.priority = 'Priority is not supported.';
  }

  if (draft.energyRequired !== undefined && !isEnergyRequirement(draft.energyRequired)) {
    errors.energyRequired = 'Energy requirement is not supported.';
  }

  if (draft.preferredTimeOfDay !== undefined && !isPreferredTimeOfDay(draft.preferredTimeOfDay)) {
    errors.preferredTimeOfDay = 'Preferred time is not supported.';
  }

  return errors;
}

export function hasIntentionValidationErrors(errors: IntentionValidationErrors) {
  return Object.keys(errors).length > 0;
}

function getValidTimestamp(value: unknown, fallback: string) {
  return isIsoTimestamp(value) ? value : fallback;
}

function withOptionalFields<T extends Intention | Omit<Intention, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'priority'>>(
  base: T,
  source: {
    description?: unknown;
    desiredOutcome?: unknown;
    estimatedMinutes?: unknown;
    deadline?: unknown;
    energyRequired?: unknown;
    preferredTimeOfDay?: unknown;
  },
) {
  const description = trimOptionalText(source.description);
  const desiredOutcome = trimOptionalText(source.desiredOutcome);
  const estimatedMinutes = normalizeEstimatedMinutes(source.estimatedMinutes);
  const deadline = isLocalDateKey(source.deadline) ? source.deadline : undefined;
  const energyRequired = isEnergyRequirement(source.energyRequired) ? source.energyRequired : undefined;
  const preferredTimeOfDay = isPreferredTimeOfDay(source.preferredTimeOfDay) ? source.preferredTimeOfDay : undefined;

  return {
    ...base,
    ...(description ? { description } : {}),
    ...(desiredOutcome ? { desiredOutcome } : {}),
    ...(estimatedMinutes ? { estimatedMinutes } : {}),
    ...(deadline ? { deadline } : {}),
    ...(energyRequired ? { energyRequired } : {}),
    ...(preferredTimeOfDay ? { preferredTimeOfDay } : {}),
  };
}

export function normalizeIntention(value: unknown, fallbackTimestamp = new Date().toISOString()): Intention | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const intention = value as StoredIntention;
  const title = trimRequiredText(intention.title);

  if (!title) {
    return null;
  }

  const createdAt = getValidTimestamp(intention.createdAt, fallbackTimestamp);
  const updatedAt = getValidTimestamp(intention.updatedAt, createdAt);
  const status = isIntentionStatus(intention.status) ? intention.status : defaultIntentionStatus;
  const priority = isIntentionPriority(intention.priority) ? intention.priority : defaultIntentionPriority;
  const completedAt =
    status === 'completed'
      ? getValidTimestamp(intention.completedAt, updatedAt)
      : undefined;

  return withOptionalFields(
    {
      id: typeof intention.id === 'string' && intention.id.trim() ? intention.id : createId(),
      title,
      priority,
      status,
      createdAt,
      updatedAt,
      ...(completedAt ? { completedAt } : {}),
    },
    intention,
  );
}

export function normalizeIntentions(values: unknown, fallbackTimestamp = new Date().toISOString()) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.flatMap((value) => {
    const intention = normalizeIntention(value, fallbackTimestamp);
    return intention ? [intention] : [];
  });
}

export function createIntentionFromDraft(
  draft: IntentionDraft,
  options: { id: string; timestamp?: string },
): Intention | null {
  const errors = validateIntentionDraft(draft);

  if (hasIntentionValidationErrors(errors)) {
    return null;
  }

  const timestamp = options.timestamp ?? new Date().toISOString();
  const title = trimRequiredText(draft.title);
  const priority = isIntentionPriority(draft.priority) ? draft.priority : defaultIntentionPriority;

  return withOptionalFields(
    {
      id: options.id,
      title,
      priority,
      status: defaultIntentionStatus,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    draft,
  );
}

export function updateIntentionFromDraft(
  intention: Intention,
  draft: IntentionUpdate,
  timestamp = new Date().toISOString(),
): Intention | null {
  const nextDraft: IntentionDraft = {
    title: draft.title ?? intention.title,
    description: draft.description ?? intention.description,
    desiredOutcome: draft.desiredOutcome ?? intention.desiredOutcome,
    estimatedMinutes: draft.estimatedMinutes ?? intention.estimatedMinutes,
    deadline: draft.deadline ?? intention.deadline,
    priority: draft.priority ?? intention.priority,
    energyRequired: draft.energyRequired ?? intention.energyRequired,
    preferredTimeOfDay: draft.preferredTimeOfDay ?? intention.preferredTimeOfDay,
  };
  const errors = validateIntentionDraft(nextDraft);

  if (hasIntentionValidationErrors(errors)) {
    return null;
  }

  return withOptionalFields(
    {
      id: intention.id,
      title: trimRequiredText(nextDraft.title),
      priority: isIntentionPriority(nextDraft.priority) ? nextDraft.priority : defaultIntentionPriority,
      status: intention.status,
      createdAt: intention.createdAt,
      updatedAt: timestamp,
      ...(intention.completedAt ? { completedAt: intention.completedAt } : {}),
    },
    nextDraft,
  );
}

export function applyIntentionStatus(
  intention: Intention,
  status: IntentionStatus,
  timestamp = new Date().toISOString(),
): Intention {
  if (status === 'completed') {
    return {
      ...intention,
      status,
      updatedAt: timestamp,
      completedAt: intention.completedAt ?? timestamp,
    };
  }

  const { completedAt: _completedAt, ...withoutCompletedAt } = intention;
  return {
    ...withoutCompletedAt,
    status,
    updatedAt: timestamp,
  };
}
