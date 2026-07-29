import { Suspense } from 'react';
import { useApplyTheme } from '../features/settings/hooks/useApplyTheme';
import AppProviders from './AppProviders';

export default function App() {
  useApplyTheme();

  return (
    <Suspense fallback={null}>
      <AppProviders />
    </Suspense>
  );
}
