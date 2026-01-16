import React, { useEffect, useRef, useState } from 'react';
import { useNotifications, NotificationType, DEMO_NOTIFICATIONS } from '../../hooks/useNotifications';
import { cn } from '../../utils/cn';
import {
  BellIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XCircleIcon,
  InfoIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
} from './Icons';

const getTypeColor = (type) => {
  switch (type) {
    case NotificationType.SUCCESS:
      return 'green';
    case NotificationType.WARNING:
      return 'orange';
    case NotificationType.ERROR:
      return 'red';
    case NotificationType.CANDIDATE:
      return 'blue';
    case NotificationType.INTERVIEW:
      return 'purple';
    case NotificationType.APPROVAL:
      return 'orange';
    default:
      return 'gray';
  }
};

const getTypeIcon = (type) => {
  const iconProps = { size: 14 };
  switch (type) {
    case NotificationType.CANDIDATE:
      return <UserIcon {...iconProps} />;
    case NotificationType.INTERVIEW:
      return <CalendarIcon {...iconProps} />;
    case NotificationType.APPROVAL:
      return <CheckCircleIcon {...iconProps} />;
    case NotificationType.SUCCESS:
      return <CheckCircleIcon {...iconProps} />;
    case NotificationType.WARNING:
      return <AlertCircleIcon {...iconProps} />;
    case NotificationType.ERROR:
      return <XCircleIcon {...iconProps} />;
    default:
      return <InfoIcon {...iconProps} />;
  }
};

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    soundEnabled,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    toggleSound,
    playTestSound,
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      window.location.hash = notification.link;
    }
    setIsOpen(false);
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <BellIcon size={20} />
        {unreadCount > 0 && (
          <span className="notification-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>Notifications</h3>
            <div className="notification-dropdown-actions">
              <button
                onClick={() => {
                  toggleSound();
                  if (!soundEnabled) playTestSound();
                }}
                className={cn('notification-action-btn sound-toggle', soundEnabled && 'active')}
                title={soundEnabled ? 'Sound enabled' : 'Sound disabled'}
              >
                {soundEnabled ? <Volume2Icon size={14} /> : <VolumeXIcon size={14} />}
              </button>

              {notifications.length > 0 && (
                <>
                  <button onClick={markAllAsRead} className="notification-action-btn">
                    Mark all read
                  </button>
                  <button onClick={clearAll} className="notification-action-btn danger">
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <span className="notification-empty-icon" aria-hidden="true">
                  <BellIcon size={28} />
                </span>
                <p>No notifications yet</p>
                <button
                  type="button"
                  className="notification-view-all"
                  onClick={() => {
                    for (const n of DEMO_NOTIFICATIONS) addNotification(n);
                  }}
                >
                  Add demo notifications
                </button>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={cn('notification-item', !notification.read && 'unread')}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={cn('notification-icon', getTypeColor(notification.type))}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTimeAgo(notification.createdAt)}</div>
                  </div>
                  <button
                    className="notification-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    aria-label="Remove notification"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="notification-dropdown-footer">
              <button className="notification-view-all">View all ({notifications.length})</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

