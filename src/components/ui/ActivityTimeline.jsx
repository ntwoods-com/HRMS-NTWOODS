import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Activity types with their colors and icons
 */
const ACTIVITY_TYPES = {
  CREATE: { color: 'green', icon: '+', label: 'Created' },
  UPDATE: { color: 'blue', icon: '✎', label: 'Updated' },
  DELETE: { color: 'red', icon: '×', label: 'Deleted' },
  STATUS_CHANGE: { color: 'orange', icon: '→', label: 'Status Changed' },
  COMMENT: { color: 'purple', icon: '💬', label: 'Commented' },
  APPROVAL: { color: 'green', icon: '✓', label: 'Approved' },
  REJECTION: { color: 'red', icon: '✕', label: 'Rejected' },
  INTERVIEW: { color: 'blue', icon: '📅', label: 'Interview' },
  HIRE: { color: 'green', icon: '🎉', label: 'Hired' },
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function ActivityItem({ activity, isLast }) {
  const typeConfig = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.UPDATE;

  return (
    <div className={cn('timeline-item', isLast && 'is-last')}>
      <div className="timeline-marker-container">
        <div className={cn('timeline-marker', typeConfig.color)}>
          <span>{typeConfig.icon}</span>
        </div>
        {!isLast && <div className="timeline-line" />}
      </div>

      <div className="timeline-content">
        <div className="timeline-header">
          <span className="timeline-title">{activity.title || typeConfig.label}</span>
          <span className="timeline-time">{formatDate(activity.timestamp)}</span>
        </div>

        {activity.description && (
          <p className="timeline-description">{activity.description}</p>
        )}

        {activity.metadata && (
          <div className="timeline-metadata">
            {activity.metadata.from && activity.metadata.to && (
              <div className="timeline-change">
                <span className="timeline-change-from">{activity.metadata.from}</span>
                <span className="timeline-change-arrow">→</span>
                <span className="timeline-change-to">{activity.metadata.to}</span>
              </div>
            )}
            {activity.metadata.actor && (
              <span className="timeline-actor">by {activity.metadata.actor}</span>
            )}
          </div>
        )}

        {activity.actions && (
          <div className="timeline-actions">
            {activity.actions.map((action, idx) => (
              <button
                key={idx}
                className="timeline-action-btn"
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityTimeline({ activities = [], maxItems, title = 'Recent Activity', emptyMessage = 'No activity yet' }) {
  const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

  return (
    <div className="activity-timeline">
      {title && <h3 className="timeline-title-header">{title}</h3>}

      {displayActivities.length === 0 ? (
        <div className="timeline-empty">
          <span className="timeline-empty-icon">📋</span>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="timeline-list">
          {displayActivities.map((activity, index) => (
            <ActivityItem
              key={activity.id || index}
              activity={activity}
              isLast={index === displayActivities.length - 1}
            />
          ))}
        </div>
      )}

      {maxItems && activities.length > maxItems && (
        <div className="timeline-footer">
          <button className="timeline-view-all">
            View all activity ({activities.length})
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for sidebars/widgets
 */
export function ActivityWidget({ activities = [], maxItems = 5, onViewAll }) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="activity-widget card">
      <div className="card-header">
        <h3>Recent Activity</h3>
        {onViewAll && (
          <button className="button ghost sm" onClick={onViewAll}>
            View All
          </button>
        )}
      </div>

      <div className="activity-widget-list">
        {displayActivities.length === 0 ? (
          <p className="small" style={{ textAlign: 'center', padding: '16px' }}>
            No recent activity
          </p>
        ) : (
          displayActivities.map((activity, index) => {
            const typeConfig = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.UPDATE;
            return (
              <div key={activity.id || index} className="activity-widget-item">
                <div className={cn('activity-widget-dot', typeConfig.color)} />
                <div className="activity-widget-content">
                  <span className="activity-widget-text">
                    {activity.title || typeConfig.label}
                  </span>
                  <span className="activity-widget-time">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
