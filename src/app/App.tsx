import { Suspense } from 'react';
import { useApplyTheme } from '../features/settings/hooks/useApplyTheme';
import ErrorBoundary from './ErrorBoundary';
import AppProviders from './AppProviders';

export default function App() {
  useApplyTheme();

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <AppProviders />
      </Suspense>
    </ErrorBoundary>
  );
}
