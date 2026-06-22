import { RouterProvider } from 'react-router-dom';
import { router } from './router';

export default function AppProviders() {
  return <RouterProvider router={router} />;
}
