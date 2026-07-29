import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import DefaultRoute from './DefaultRoute';
import { routes } from './routes';

const CalendarPage = lazy(() => import('../pages/CalendarPage/CalendarPage'));
const LandingPage = lazy(() => import('../pages/LandingPage/LandingPage'));
const TodayPage = lazy(() => import('../pages/TodayPage/TodayPage'));
const InsightsPage = lazy(() => import('../pages/InsightsPage/InsightsPage'));
const TasksPage = lazy(() => import('../pages/TasksPage/TasksPage'));
const IntentionsPage = lazy(() => import('../pages/IntentionsPage/IntentionsPage'));
const MemoriesPage = lazy(() => import('../pages/MemoriesPage/MemoriesPage'));
const GoalsPage = lazy(() => import('../pages/GoalsPage/GoalsPage'));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage/ProjectsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage/SettingsPage'));

export const router = createBrowserRouter([
  {
    path: routes.root,
    element: <LandingPage />,
  },
  {
    path: routes.workspace,
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
    path: routes.intentions,
    element: <IntentionsPage />,
  },
  {
    path: routes.memories,
    element: <MemoriesPage />,
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
