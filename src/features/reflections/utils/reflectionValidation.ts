import { isIsoTimestamp, isLocalDateKey } from '../../../shared/utils/dateValidation';
import { isEnergyLevel } from '../../timeQuality';
import type {
  DailyReflection,
  DailyReflectionDraft,
  ReflectionsByDate,
} from '../types/reflections.types';

type StoredReflection = Partial<DailyReflection>;

export function isReflectionDate(value: unknown): value is string {
  return isLocalDateKey(value);
}

function trimOptionalText(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function normalizePhotoUrl(value: unknown) {
  const trimmedValue = trimOptionalText(value);

  if (!trimmedValue) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    return ['http:', 'https:'].includes(parsedUrl.protocol) ? parsedUrl.toString() : undefined;
  } catch {
    return undefined;
  }
}

function getValidTimestamp(value: unknown, fallback: string) {
  return isIsoTimestamp(value) ? value : fallback;
}

function withOptionalReflectionFields<T extends Pick<DailyReflection, 'date' | 'createdAt' | 'updatedAt'>>(
  base: T,
  source: {
    energy?: unknown;
    mood?: unknown;
    note?: unknown;
    highlight?: unknown;
    photoUrl?: unknown;
  },
) {
  const note = trimOptionalText(source.note);
  const highlight = trimOptionalText(source.highlight);
  const photoUrl = normalizePhotoUrl(source.photoUrl);

  return {
    ...base,
    ...(isEnergyLevel(source.energy) ? { energy: source.energy } : {}),
    ...(isEnergyLevel(source.mood) ? { mood: source.mood } : {}),
    ...(note ? { note } : {}),
    ...(highlight ? { highlight } : {}),
    ...(photoUrl ? { photoUrl } : {}),
  };
}

export function normalizeReflection(
  value: unknown,
  fallbackTimestamp = new Date().toISOString(),
): DailyReflection | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const reflection = value as StoredReflection;

  if (!isReflectionDate(reflection.date)) {
    return null;
  }

  const createdAt = getValidTimestamp(reflection.createdAt, fallbackTimestamp);

  return withOptionalReflectionFields(
    {
      date: reflection.date,
      createdAt,
      updatedAt: getValidTimestamp(reflection.updatedAt, createdAt),
    },
    reflection,
  );
}

export function normalizeReflections(values: unknown, fallbackTimestamp = new Date().toISOString()): ReflectionsByDate {
  const records = Array.isArray(values)
    ? values
    : values && typeof values === 'object' && !Array.isArray(values)
      ? Object.values(values as Record<string, unknown>)
      : [];

  return records.reduce<ReflectionsByDate>((normalizedReflections, value) => {
    const reflection = normalizeReflection(value, fallbackTimestamp);

    if (!reflection) {
      return normalizedReflections;
    }

    const existingReflection = normalizedReflections[reflection.date];

    if (!existingReflection || reflection.updatedAt >= existingReflection.updatedAt) {
      normalizedReflections[reflection.date] = reflection;
    }

    return normalizedReflections;
  }, {});
}

export function upsertReflectionDraft(
  draft: DailyReflectionDraft,
  existingReflection?: DailyReflection,
  timestamp = new Date().toISOString(),
): DailyReflection | null {
  if (!isReflectionDate(draft.date)) {
    return null;
  }

  return withOptionalReflectionFields(
    {
      date: draft.date,
      createdAt: existingReflection?.createdAt ?? timestamp,
      updatedAt: timestamp,
    },
    draft,
  );
}
