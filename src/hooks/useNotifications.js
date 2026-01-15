import { useState, useEffect, useCallback, useRef } from 'react';

const NOTIFICATIONS_KEY = 'ntw_hrms_notifications_v1';
const SOUND_ENABLED_KEY = 'ntw_hrms_sound_enabled';
const POLL_INTERVAL = 60000; // 1 minute

/**
 * Notification types
 */
export const NotificationType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  CANDIDATE: 'candidate',
  INTERVIEW: 'interview',
  APPROVAL: 'approval',
};

/**
 * Notification sounds - base64 encoded short beep sounds
 * These are tiny audio files for instant playback without external dependencies
 */
const NOTIFICATION_SOUNDS = {
  default: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYNJQPQAAAAAAD/+xDEAAPAAADSAAAAAAgAADSAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xDEFgPAAADSAAAAAAgAADSAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xDEJwPAAADSAAAAAAgAADSAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==',
  success: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYZCQ5H5AAAAAAAA//sQxAADwAAA0gAAAAAIAAA0gAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxBYDwAAA0gAAAAAIAAA0gAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxCcDwAAA0gAAAAAIAAA0gAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
  warning: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYbTq0WgAAAAAAD/+xDEAAPAAADSAAAAAAgAADSAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xDEFgPAAADSAAAAAAgAADSAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xDEJwPAAADSAAAAAAgAADSAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==',
  error: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYbhx2KYAAAAAAAA//sQxAADwAAA0gAAAAAIAAA0gAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxBYDwAAA0gAAAAAIAAA0gAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxCcDwAAA0gAAAAAIAAA0gAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
};

/**
 * Get sound for notification type
 */
const getSoundForType = (type) => {
  switch (type) {
    case NotificationType.SUCCESS:
      return NOTIFICATION_SOUNDS.success;
    case NotificationType.WARNING:
    case NotificationType.APPROVAL:
      return NOTIFICATION_SOUNDS.warning;
    case NotificationType.ERROR:
      return NOTIFICATION_SOUNDS.error;
    default:
      return NOTIFICATION_SOUNDS.default;
  }
};

/**
 * Play notification sound
 */
const playNotificationSound = (type = 'default', volume = 0.5) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different notification types
    const frequencies = {
      [NotificationType.INFO]: 800,
      [NotificationType.SUCCESS]: 1000,
      [NotificationType.WARNING]: 600,
      [NotificationType.ERROR]: 400,
      [NotificationType.CANDIDATE]: 900,
      [NotificationType.INTERVIEW]: 850,
      [NotificationType.APPROVAL]: 700,
      default: 800,
    };
    
    oscillator.frequency.value = frequencies[type] || frequencies.default;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    // Fallback to HTML5 Audio if Web Audio API fails
    try {
      const audio = new Audio(getSoundForType(type));
      audio.volume = volume;
      audio.play().catch(() => {});
    } catch {
      // Sound not supported
    }
  }
};

/**
 * Hook for managing notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(SOUND_ENABLED_KEY);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const [volume, setVolume] = useState(0.5);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  // Calculate unread count
  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Persist notifications
  useEffect(() => {
    try {
      // Keep only last 50 notifications
      const toStore = notifications.slice(0, 50);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(toStore));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Persist sound settings
  useEffect(() => {
    try {
      localStorage.setItem(SOUND_ENABLED_KEY, JSON.stringify(soundEnabled));
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  /**
   * Toggle sound on/off
   */
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  /**
   * Update volume (0-1)
   */
  const updateVolume = useCallback((newVolume) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  }, []);

  /**
   * Add a new notification
   */
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false,
      type: NotificationType.INFO,
      ...notification,
    };

    // Play sound if enabled
    if (soundEnabled) {
      playNotificationSound(newNotification.type, volume);
    }

    setNotifications((prev) => [newNotification, ...prev]);
    return newNotification.id;
  }, [soundEnabled, volume]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  /**
   * Remove a notification
   */
  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Simulate fetching notifications (replace with real API call)
   */
  const fetchNotifications = useCallback(async () => {
    // This would be replaced with actual API call
    // const response = await api.getNotifications();
    // setNotifications(response.data);
  }, []);

  // Poll for new notifications
  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchNotifications]);

  return {
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
