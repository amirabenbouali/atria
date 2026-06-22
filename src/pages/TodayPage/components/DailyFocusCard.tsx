import { useEffect, useState } from 'react';
import Button from '../../../shared/components/Button/Button';
import styles from '../TodayPage.module.css';

type DailyFocusCardProps = {
  focus: string;
  onSave: (focus: string) => void;
};

export default function DailyFocusCard({ focus, onSave }: DailyFocusCardProps) {
  const [draft, setDraft] = useState(focus);

  useEffect(() => {
    setDraft(focus);
  }, [focus]);

  return (
    <section className={styles.focusCard}>
      <div>
        <p className="sectionLabel">Daily Focus</p>
        <h2>{focus || 'Set the signal for today.'}</h2>
      </div>

      <label>
        <span>Focus line</span>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Protect deep work until noon."
          rows={3}
        />
      </label>

      <Button onClick={() => onSave(draft.trim())}>Save Focus</Button>
    </section>
  );
}
