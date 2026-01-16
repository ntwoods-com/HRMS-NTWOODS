import { useContext } from 'react';
import { NotificationsContext } from '../notifications/NotificationsProvider';
import { NotificationType } from '../notifications/notificationsCore';

export { NotificationType };

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (ctx) return ctx;

  // Fallback: app isn't wrapped with NotificationsProvider.
  return {
    notifications: [],
    unreadCount: 0,
    soundEnabled: true,
    volume: 0.5,
    addNotification: () => null,
    markAsRead: () => {},
    markAllAsRead: () => {},
    removeNotification: () => {},
    clearAll: () => {},
    toggleSound: () => {},
    updateVolume: () => {},
    playTestSound: () => {},
    refresh: async () => {},
  };
}

/**
 * Demo notifications for testing
 */
export const DEMO_NOTIFICATIONS = [
  {
    title: 'New candidate applied',
    message: 'Rahul Sharma applied for Software Developer position',
    type: NotificationType.CANDIDATE,
    link: '/dashboard',
  },
  {
    title: 'Interview scheduled',
    message: 'Technical interview scheduled for tomorrow at 10:00 AM',
    type: NotificationType.INTERVIEW,
    link: '/dashboard',
  },
  {
    title: 'Approval required',
    message: '3 candidates are waiting for final approval',
    type: NotificationType.APPROVAL,
    link: '/dashboard',
  },
];

