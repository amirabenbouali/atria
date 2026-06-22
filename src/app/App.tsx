import { Suspense } from 'react';
import AppProviders from './AppProviders';

export default function App() {
  return (
    <Suspense fallback={null}>
      <AppProviders />
    </Suspense>
  );
}
