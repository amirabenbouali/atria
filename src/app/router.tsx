import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import DefaultRoute from './DefaultRoute';
import { routes } from './routes';

const CalendarPage = lazy(() => import('../pages/CalendarPage/CalendarPage'));
const TodayPage = lazy(() => import('../pages/TodayPage/TodayPage'));
const InsightsPage = lazy(() => import('../pages/InsightsPage/InsightsPage'));
const TasksPage = lazy(() => import('../pages/TasksPage/TasksPage'));
const GoalsPage = lazy(() => import('../pages/GoalsPage/GoalsPage'));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage/ProjectsPage'));
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
    path: routes.tasks,
    element: <TasksPage />,
  },
  {
    path: routes.goals,
    element: <GoalsPage />,
  },
  {
    path: routes.projects,
    element: <ProjectsPage />,
  },
  {
    path: routes.settings,
    element: <SettingsPage />,
  },
]);
