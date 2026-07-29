import { useEffect } from 'react';
import { defaultThemeId, isThemeId } from '../constants/theme.constants';
import { useSettingsStore } from '../store/settings.store';

export function useApplyTheme() {
  const themeId = useSettingsStore((state) => state.preferences.themeId);

  useEffect(() => {
    const nextThemeId = isThemeId(themeId) ? themeId : defaultThemeId;
    document.documentElement.dataset.theme = nextThemeId;
  }, [themeId]);
}
