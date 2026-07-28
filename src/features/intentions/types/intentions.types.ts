import type {
  EnergyRequirement,
  PreferredTimeOfDay,
} from '../../timeQuality';

export type IntentionStatus = 'active' | 'scheduled' | 'completed' | 'paused';

export type IntentionPriority = 'low' | 'medium' | 'high';

export type Intention = {
  id: string;
  title: string;
  description?: string;
  desiredOutcome?: string;
  estimatedMinutes?: number;
  deadline?: string;
  priority: IntentionPriority;
  energyRequired?: EnergyRequirement;
  preferredTimeOfDay?: PreferredTimeOfDay;
  status: IntentionStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type IntentionDraft = {
  title: string;
  description?: string;
  desiredOutcome?: string;
  estimatedMinutes?: number;
  deadline?: string;
  priority?: IntentionPriority;
  energyRequired?: EnergyRequirement;
  preferredTimeOfDay?: PreferredTimeOfDay;
};

export type IntentionUpdate = Partial<IntentionDraft>;

export type IntentionValidationErrors = Partial<Record<keyof IntentionDraft, string>>;
