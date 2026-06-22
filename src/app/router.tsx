import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import DefaultRoute from './DefaultRoute';
import { routes } from './routes';

const CalendarPage = lazy(() => import('../pages/CalendarPage/CalendarPage'));
const TodayPage = lazy(() => import('../pages/TodayPage/TodayPage'));
const InsightsPage = lazy(() => import('../pages/InsightsPage/InsightsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage/SettingsPage'));

export const router = createBrowserRouter([
  {
    path: routes.root,
    element: <DefaultRoute />,
  },
  {
    path: routes.calendar,
    element: <CalendarPage />,
  },
  {
    path: routes.today,
    element: <TodayPage />,
  },
  {
    path: routes.insights,
    element: <InsightsPage />,
  },
  {
    path: routes.settings,
    element: <SettingsPage />,
  },
]);
