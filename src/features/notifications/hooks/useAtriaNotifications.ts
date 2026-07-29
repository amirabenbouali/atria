import { useEffect, useMemo, useState } from 'react';
import { useCalendarStore } from '../../calendar/store/calendar.store';
import { useWeekStartsOnMonday } from '../../settings/hooks/useWeekStartsOnMonday';
import { useSettingsStore } from '../../settings/store/settings.store';
import { useNotificationsStore } from '../store/notifications.store';
import { buildAtriaNotifications, isWithinQuietHours } from '../utils/notificationRules';

export function useAtriaNotifications() {
  const calendarItems = useCalendarStore((state) => state.events);
  const notificationPreferences = useSettingsStore((state) => state.preferences.notifications);
  const weekStartsOnMonday = useWeekStartsOnMonday();
  const dismissedIds = useNotificationsStore((state) => state.dismissedIds);
  const dismissNotification = useNotificationsStore((state) => state.dismissNotification);
  const dismissNotifications = useNotificationsStore((state) => state.dismissNotifications);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const notifications = useMemo(
    () => buildAtriaNotifications({
      items: calendarItems,
      preferences: notificationPreferences,
      weekStartsOnMonday,
      dismissedIds,
      now,
    }),
    [calendarItems, dismissedIds, notificationPreferences, now, weekStartsOnMonday],
  );

  return {
    notifications,
    notificationCount: notifications.length,
    quietHoursActive: isWithinQuietHours(now, notificationPreferences),
    dismissNotification,
    dismissAllNotifications: () => dismissNotifications(notifications.map((notification) => notification.id)),
  };
}
