import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotificationType, playNotificationSound } from './notificationsCore';
import { subscribeNotifications } from './notificationsBus';

const NOTIFICATIONS_KEY = 'ntw_hrms_notifications_v1';
const SOUND_ENABLED_KEY = 'ntw_hrms_sound_enabled';
const VOLUME_KEY = 'ntw_hrms_sound_volume_v1';
const MAX_NOTIFICATIONS = 50;

export const NotificationsContext = createContext(null);

function safeParseJson_(s, fallback) {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

function clamp01_(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0.5;
  return Math.max(0, Math.min(1, x));
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      const parsed = stored ? safeParseJson_(stored, []) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(SOUND_ENABLED_KEY);
      return stored !== null ? !!safeParseJson_(stored, true) : true;
    } catch {
      return true;
    }
  });

  const [volume, setVolume] = useState(() => {
    try {
      const stored = localStorage.getItem(VOLUME_KEY);
      return stored !== null ? clamp01_(safeParseJson_(stored, 0.5)) : 0.5;
    } catch {
      return 0.5;
    }
  });

  const intervalRef = useRef(null);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  useEffect(() => {
    try {
      const toStore = notifications.slice(0, MAX_NOTIFICATIONS);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(toStore));
    } catch {
      // ignore
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_ENABLED_KEY, JSON.stringify(!!soundEnabled));
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(VOLUME_KEY, JSON.stringify(clamp01_(volume)));
    } catch {
      // ignore
    }
  }, [volume]);

  // Sync across tabs/windows.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === NOTIFICATIONS_KEY && typeof e.newValue === 'string') {
        const parsed = safeParseJson_(e.newValue, []);
        if (Array.isArray(parsed)) setNotifications(parsed);
      }
      if (e.key === SOUND_ENABLED_KEY && typeof e.newValue === 'string') {
        setSoundEnabled(!!safeParseJson_(e.newValue, true));
      }
      if (e.key === VOLUME_KEY && typeof e.newValue === 'string') {
        setVolume(clamp01_(safeParseJson_(e.newValue, 0.5)));
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addNotification = useCallback(
    (notification) => {
      const input = notification || {};
      const id = String(input.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
      const createdAt = String(input.createdAt || new Date().toISOString());
      const type = String(input.type || NotificationType.INFO);

      const newNotification = {
        id,
        createdAt,
        read: input.read === true ? true : false,
        type,
        title: String(input.title || ''),
        message: String(input.message || ''),
        link: input.link ? String(input.link) : '',
        meta: input.meta && typeof input.meta === 'object' ? input.meta : undefined,
      };

      if (soundEnabled) {
        playNotificationSound(type, volume);
      }

      setNotifications((prev) => {
        const without = prev.filter((n) => n.id !== id);
        return [newNotification, ...without].slice(0, MAX_NOTIFICATIONS);
      });

      return id;
    },
    [soundEnabled, volume]
  );

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const updateVolume = useCallback((newVolume) => {
    setVolume(clamp01_(newVolume));
  }, []);

  // Placeholder for future server-side notifications.
  const fetchNotifications = useCallback(async () => {}, []);

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = window.setInterval(fetchNotifications, 60000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  // Subscribe to notification bus.
  useEffect(() => subscribeNotifications(addNotification), [addNotification]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      soundEnabled,
      volume,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      toggleSound,
      updateVolume,
      playTestSound: () => playNotificationSound(NotificationType.INFO, volume),
      refresh: fetchNotifications,
    }),
    [
      notifications,
      unreadCount,
      soundEnabled,
      volume,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      toggleSound,
      updateVolume,
      fetchNotifications,
    ]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

