import { create } from 'zustand';
import {
  currentOnboardingVersion,
  defaultSettingsPreferences,
  readStoredSettingsPreferences,
  writeStoredSettingsPreferences,
} from '../services/settingsStorage.service';
import type { SettingsPreferences } from '../types/settings.types';
import type { DayPeriod, EnergyLevel, TimeQuality } from '../../timeQuality';
import {
  defaultEnergyProfile,
  isEnergyLevel,
  normalizeEnergyProfile,
} from '../../timeQuality';

type SettingsState = {
  preferences: SettingsPreferences;
  updatePreferences: (preferences: Partial<SettingsPreferences>) => void;
  completeOnboarding: () => void;
  resetPreferences: () => void;
  setEnergyForPeriod: (period: DayPeriod, energy: EnergyLevel) => void;
  setPreferredQualitiesForPeriod: (period: DayPeriod, qualities: TimeQuality[]) => void;
  resetEnergyProfile: () => void;
};

function persistPreferences(preferences: SettingsPreferences) {
  writeStoredSettingsPreferences(preferences);
  return preferences;
}

function areQualitiesEqual(first: TimeQuality[], second: TimeQuality[]) {
  return first.length === second.length && first.every((quality, index) => quality === second[index]);
}

function areEnergyProfilesEqual(first: SettingsPreferences['energyProfile'], second: SettingsPreferences['energyProfile']) {
  return (['morning', 'afternoon', 'evening'] as DayPeriod[]).every(
    (period) =>
      first[period].energy === second[period].energy &&
      areQualitiesEqual(first[period].preferredQualities, second[period].preferredQualities),
  );
}

export const useSettingsStore = create<SettingsState>((set) => ({
  preferences: readStoredSettingsPreferences(),
  updatePreferences: (nextPreferences) =>
    set((state) => ({
      preferences: persistPreferences({
        ...state.preferences,
        ...nextPreferences,
      }),
    })),
  completeOnboarding: () =>
    set((state) => ({
      preferences: persistPreferences({
        ...state.preferences,
        hasCompletedOnboarding: true,
        onboardingVersion: currentOnboardingVersion,
      }),
    })),
  resetPreferences: () =>
    set({
      preferences: persistPreferences(defaultSettingsPreferences),
    }),
  setEnergyForPeriod: (period, energy) => {
    if (!isEnergyLevel(energy)) {
      return;
    }

    set((state) => {
      if (state.preferences.energyProfile[period].energy === energy) {
        return state;
      }

      return {
        preferences: persistPreferences({
          ...state.preferences,
          energyProfile: {
            ...state.preferences.energyProfile,
            [period]: {
              ...state.preferences.energyProfile[period],
              energy,
            },
          },
        }),
      };
    });
  },
  setPreferredQualitiesForPeriod: (period, qualities) =>
    set((state) => {
      const normalizedProfile = normalizeEnergyProfile({
        ...state.preferences.energyProfile,
        [period]: {
          ...state.preferences.energyProfile[period],
          preferredQualities: qualities,
        },
      });
      const currentQualities = state.preferences.energyProfile[period].preferredQualities;
      const nextQualities = normalizedProfile[period].preferredQualities;

      if (areQualitiesEqual(currentQualities, nextQualities)) {
        return state;
      }

      return {
        preferences: persistPreferences({
          ...state.preferences,
          energyProfile: normalizedProfile,
        }),
      };
    }),
  resetEnergyProfile: () =>
    set((state) => {
      if (areEnergyProfilesEqual(state.preferences.energyProfile, defaultEnergyProfile)) {
        return state;
      }

      return {
        preferences: persistPreferences({
          ...state.preferences,
          energyProfile: defaultEnergyProfile,
        }),
      };
    }),
}));
