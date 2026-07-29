import { useEffect } from 'react';
import { useSettingsStore } from '../store/settings.store';

export function useApplyTheme() {
  const appearance = useSettingsStore((state) => state.preferences.appearance);

  useEffect(() => {
    document.documentElement.dataset.atmosphere = appearance.atmosphere;
    document.documentElement.dataset.accent = appearance.accent;
    document.documentElement.dataset.workspaceMode = appearance.workspaceMode;
    document.documentElement.dataset.theme = appearance.atmosphere;
  }, [appearance.accent, appearance.atmosphere, appearance.workspaceMode]);
}
