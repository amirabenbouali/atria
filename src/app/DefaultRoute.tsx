import { Navigate } from 'react-router-dom';
import { routes } from './routes';
import { useSettingsStore } from '../features/settings/store/settings.store';

const defaultViewRoutes = {
  calendar: routes.calendar,
  today: routes.today,
  insights: routes.insights,
} as const;

export default function DefaultRoute() {
  const preferences = useSettingsStore((state) => state.preferences);
  const defaultView = preferences.planningDefaults.defaultView;

  if (!preferences.account.isSignedIn) {
    return <Navigate replace to={routes.root} />;
  }

  return <Navigate replace to={defaultViewRoutes[defaultView] ?? routes.calendar} />;
}
