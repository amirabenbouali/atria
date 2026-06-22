import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';

const CalendarPage = lazy(() => import('../pages/CalendarPage/CalendarPage'));

export const router = createBrowserRouter([
  {
    path: routes.calendar,
    element: <CalendarPage />,
  },
]);
