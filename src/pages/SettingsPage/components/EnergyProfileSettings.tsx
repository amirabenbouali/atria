import { BatteryMedium, RotateCcw } from 'lucide-react';
import type { CSSProperties } from 'react';
import type {
  DayPeriod,
  EnergyLevel,
  EnergyProfile,
  TimeQuality,
} from '../../../features/timeQuality';
import {
  dayPeriods,
  getDayPeriodLabel,
  getEnergyLabel,
  getTimeQualityLabel,
  timeQualities,
} from '../../../features/timeQuality';
import Button from '../../../shared/components/Button/Button';
import SelectControl, { type SelectControlChangeEvent } from '../../../shared/components/SelectControl/SelectControl';
import AtriaIcon from '../../../shared/ui/AtriaIcon';
import styles from '../SettingsPage.module.css';

type EnergyProfileSettingsProps = {
  profile: EnergyProfile;
  onSetEnergy: (period: DayPeriod, energy: EnergyLevel) => void;
  onSetQualities: (period: DayPeriod, qualities: TimeQuality[]) => void;
  onReset: () => void;
};

const energyLevels: EnergyLevel[] = [1, 2, 3, 4, 5];

function toggleQuality(qualities: TimeQuality[], quality: TimeQuality, checked: boolean) {
  if (checked) {
    return Array.from(new Set([...qualities, quality]));
  }

  return qualities.filter((currentQuality) => currentQuality !== quality);
}

export default function EnergyProfileSettings({
  profile,
  onSetEnergy,
  onSetQualities,
  onReset,
}: EnergyProfileSettingsProps) {
  const handleEnergyChange = (period: DayPeriod) => (event: SelectControlChangeEvent) => {
    onSetEnergy(period, Number(event.target.value) as EnergyLevel);
  };

  return (
    <div className={styles.energyProfile}>
      <div className={styles.energyIntro}>
        <span>Set a simple expectation for how much capacity you usually have at different times of day.</span>
        <Button variant="ghost" onClick={onReset} aria-label="Reset daily energy profile">
          <AtriaIcon icon={RotateCcw} tone="rose" size="sm" />
          Reset
        </Button>
      </div>

      <div className={styles.energyStrip} aria-label="Daily energy profile summary">
        {dayPeriods.map((period) => {
          const periodProfile = profile[period];
          return (
            <div
              key={period}
              className={styles.energySegment}
              style={{ '--energy-level': periodProfile.energy } as CSSProperties}
            >
              <span>{getDayPeriodLabel(period)}</span>
              <strong>{getEnergyLabel(periodProfile.energy)}</strong>
              <em>{periodProfile.preferredQualities.map(getTimeQualityLabel).join(', ') || 'No preferred qualities'}</em>
            </div>
          );
        })}
      </div>

      <div className={styles.periodGrid}>
        {dayPeriods.map((period) => {
          const periodProfile = profile[period];
          return (
            <fieldset className={styles.periodCard} key={period}>
              <legend>{getDayPeriodLabel(period)}</legend>
              <label className={styles.energySelectRow}>
                <span>Expected energy</span>
                <SelectControl icon={BatteryMedium} value={periodProfile.energy} onChange={handleEnergyChange(period)}>
                  {energyLevels.map((level) => (
                    <option key={level} value={level}>{getEnergyLabel(level)}</option>
                  ))}
                </SelectControl>
              </label>

              <div className={styles.qualityGrid} aria-label={`${getDayPeriodLabel(period)} preferred qualities`}>
                {timeQualities.map((quality) => (
                  <label className={styles.qualityChip} key={quality}>
                    <input
                      type="checkbox"
                      checked={periodProfile.preferredQualities.includes(quality)}
                      onChange={(event) =>
                        onSetQualities(
                          period,
                          toggleQuality(periodProfile.preferredQualities, quality, event.target.checked),
                        )}
                    />
                    <span>{getTimeQualityLabel(quality)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}
