/**
 * Role-based Dashboard Widgets
 * Different widgets for different user roles
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/useAuth';
import { 
  UsersIcon, 
  BriefcaseIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  TrendingUpIcon,
  ClockIcon,
  AlertCircleIcon,
  TargetIcon,
  FileTextIcon,
  AwardIcon,
  ActivityIcon,
  BarChartIcon,
} from './Icons';
import { cn } from '../../utils/cn';

// Widget types based on roles
const WIDGET_CONFIGS = {
  admin: [
    { id: 'total-users', type: 'stat', title: 'Total Users', icon: UsersIcon, color: 'blue' },
    { id: 'active-candidates', type: 'stat', title: 'Active Candidates', icon: BriefcaseIcon, color: 'green' },
    { id: 'pending-approvals', type: 'stat', title: 'Pending Approvals', icon: ClockIcon, color: 'orange' },
    { id: 'system-health', type: 'health', title: 'System Health', icon: ActivityIcon, color: 'purple' },
    { id: 'recent-activities', type: 'list', title: 'Recent Activities', icon: BarChartIcon, color: 'indigo' },
    { id: 'alerts', type: 'alerts', title: 'Alerts & Warnings', icon: AlertCircleIcon, color: 'red' },
  ],
  hr: [
    { id: 'active-candidates', type: 'stat', title: 'Active Candidates', icon: UsersIcon, color: 'blue' },
    { id: 'interviews-today', type: 'stat', title: 'Interviews Today', icon: CalendarIcon, color: 'green' },
    { id: 'pending-review', type: 'stat', title: 'Pending Review', icon: ClockIcon, color: 'orange' },
    { id: 'weekly-hires', type: 'stat', title: 'Weekly Hires', icon: CheckCircleIcon, color: 'purple' },
    { id: 'upcoming-interviews', type: 'list', title: 'Upcoming Interviews', icon: CalendarIcon, color: 'indigo' },
    { id: 'performance', type: 'chart', title: 'Hiring Performance', icon: TrendingUpIcon, color: 'teal' },
  ],
  interviewer: [
    { id: 'my-interviews', type: 'stat', title: 'My Interviews', icon: CalendarIcon, color: 'blue' },
    { id: 'pending-feedback', type: 'stat', title: 'Pending Feedback', icon: FileTextIcon, color: 'orange' },
    { id: 'completed-today', type: 'stat', title: 'Completed Today', icon: CheckCircleIcon, color: 'green' },
    { id: 'upcoming', type: 'list', title: 'Upcoming Interviews', icon: CalendarIcon, color: 'indigo' },
  ],
  manager: [
    { id: 'team-openings', type: 'stat', title: 'Team Openings', icon: BriefcaseIcon, color: 'blue' },
    { id: 'candidates-in-pipeline', type: 'stat', title: 'In Pipeline', icon: UsersIcon, color: 'green' },
    { id: 'offers-pending', type: 'stat', title: 'Offers Pending', icon: FileTextIcon, color: 'orange' },
    { id: 'hired-this-month', type: 'stat', title: 'Hired This Month', icon: AwardIcon, color: 'purple' },
    { id: 'sla-status', type: 'sla', title: 'SLA Status', icon: TargetIcon, color: 'teal' },
  ],
  default: [
    { id: 'my-tasks', type: 'stat', title: 'My Tasks', icon: CheckCircleIcon, color: 'blue' },
    { id: 'notifications', type: 'stat', title: 'Notifications', icon: AlertCircleIcon, color: 'orange' },
    { id: 'recent', type: 'list', title: 'Recent Activity', icon: ActivityIcon, color: 'indigo' },
  ],
};

// Stat Widget Component
function StatWidget({ config, value, loading, onClick }) {
  const IconComponent = config.icon;
  
  return (
    <div 
      className={cn('dashboard-widget stat-widget', `color-${config.color}`)}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="widget-icon">
        <IconComponent size={24} />
      </div>
      <div className="widget-content">
        <span className="widget-value">
          {loading ? (
            <span className="widget-skeleton" />
          ) : (
            value ?? '—'
          )}
        </span>
        <span className="widget-title">{config.title}</span>
      </div>
    </div>
  );
}

// List Widget Component
function ListWidget({ config, items = [], loading }) {
  const IconComponent = config.icon;
  
  return (
    <div className={cn('dashboard-widget list-widget', `color-${config.color}`)}>
      <div className="widget-header">
        <IconComponent size={18} />
        <span>{config.title}</span>
      </div>
      <div className="widget-list">
        {loading ? (
          <>
            <div className="widget-list-skeleton" />
            <div className="widget-list-skeleton" />
            <div className="widget-list-skeleton" />
          </>
        ) : items.length === 0 ? (
          <div className="widget-empty">No items</div>
        ) : (
          items.slice(0, 5).map((item, idx) => (
            <div key={idx} className="widget-list-item">
              <span className="item-title">{item.title}</span>
              <span className="item-meta">{item.meta}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Health Widget Component
function HealthWidget({ config, data, loading }) {
  const IconComponent = config.icon;
  const healthPercent = data?.health ?? 100;
  const healthColor = healthPercent > 80 ? 'green' : healthPercent > 50 ? 'yellow' : 'red';
  
  return (
    <div className={cn('dashboard-widget health-widget', `color-${config.color}`)}>
      <div className="widget-header">
        <IconComponent size={18} />
        <span>{config.title}</span>
      </div>
      <div className="health-content">
        {loading ? (
          <div className="widget-skeleton" />
        ) : (
          <>
            <div className={cn('health-circle', `health-${healthColor}`)}>
              <span className="health-percent">{healthPercent}%</span>
            </div>
            <div className="health-stats">
              <div className="health-stat">
                <span className="stat-label">Uptime</span>
                <span className="stat-value">{data?.uptime ?? '99.9%'}</span>
              </div>
              <div className="health-stat">
                <span className="stat-label">API</span>
                <span className="stat-value">{data?.apiStatus ?? 'OK'}</span>
              </div>
              <div className="health-stat">
                <span className="stat-label">DB</span>
                <span className="stat-value">{data?.dbStatus ?? 'OK'}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Alerts Widget Component
function AlertsWidget({ config, alerts = [], loading }) {
  const IconComponent = config.icon;
  
  return (
    <div className={cn('dashboard-widget alerts-widget', `color-${config.color}`)}>
      <div className="widget-header">
        <IconComponent size={18} />
        <span>{config.title}</span>
        {alerts.length > 0 && (
          <span className="alert-count">{alerts.length}</span>
        )}
      </div>
      <div className="alerts-list">
        {loading ? (
          <div className="widget-skeleton" />
        ) : alerts.length === 0 ? (
          <div className="widget-empty success">
            <CheckCircleIcon size={20} />
            <span>All systems normal</span>
          </div>
        ) : (
          alerts.slice(0, 3).map((alert, idx) => (
            <div key={idx} className={cn('alert-item', `severity-${alert.severity}`)}>
              <AlertCircleIcon size={14} />
              <span>{alert.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// SLA Widget Component
function SLAWidget({ config, data, loading }) {
  const IconComponent = config.icon;
  
  return (
    <div className={cn('dashboard-widget sla-widget', `color-${config.color}`)}>
      <div className="widget-header">
        <IconComponent size={18} />
        <span>{config.title}</span>
      </div>
      <div className="sla-content">
        {loading ? (
          <div className="widget-skeleton" />
        ) : (
          <div className="sla-bars">
            {(data?.stages ?? []).map((stage, idx) => (
              <div key={idx} className="sla-bar-item">
                <div className="sla-bar-header">
                  <span>{stage.name}</span>
                  <span>{stage.compliance}%</span>
                </div>
                <div className="sla-bar-track">
                  <div 
                    className={cn('sla-bar-fill', stage.compliance >= 80 ? 'green' : stage.compliance >= 50 ? 'yellow' : 'red')}
                    style={{ width: `${stage.compliance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Chart Widget Component
function ChartWidget({ config, data, loading }) {
  const IconComponent = config.icon;
  
  return (
    <div className={cn('dashboard-widget chart-widget', `color-${config.color}`)}>
      <div className="widget-header">
        <IconComponent size={18} />
        <span>{config.title}</span>
      </div>
      <div className="chart-content">
        {loading ? (
          <div className="widget-skeleton chart-skeleton" />
        ) : (
          <div className="mini-chart">
            {(data?.values ?? [1, 3, 2, 5, 4, 6, 5]).map((val, idx) => (
              <div 
                key={idx} 
                className="chart-bar"
                style={{ height: `${(val / 10) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Widget Renderer
function WidgetRenderer({ config, data, loading, onClick }) {
  switch (config.type) {
    case 'stat':
      return <StatWidget config={config} value={data?.value} loading={loading} onClick={onClick} />;
    case 'list':
      return <ListWidget config={config} items={data?.items} loading={loading} />;
    case 'health':
      return <HealthWidget config={config} data={data} loading={loading} />;
    case 'alerts':
      return <AlertsWidget config={config} alerts={data?.alerts} loading={loading} />;
    case 'sla':
      return <SLAWidget config={config} data={data} loading={loading} />;
    case 'chart':
      return <ChartWidget config={config} data={data} loading={loading} />;
    default:
      return <StatWidget config={config} value={data?.value} loading={loading} onClick={onClick} />;
  }
}

/**
 * Role-based Dashboard Widgets Component
 */
export function DashboardWidgets({ customData = {}, onWidgetClick }) {
  const { me, role } = useAuth();
  const [widgetData, setWidgetData] = useState({});
  const [loading, setLoading] = useState(true);

  // Determine which widgets to show based on role
  const userRole = String(role || me?.role || '').toLowerCase() || 'default';
  const widgets = WIDGET_CONFIGS[userRole] || WIDGET_CONFIGS.default;

  // Load real data from API or show placeholder when no data
  useEffect(() => {
    const loadWidgetData = async () => {
      setLoading(true);
      
      // Small delay for smooth UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Initialize with zeros/empty - real data should come from customData prop
      const initialData = {};
      widgets.forEach(widget => {
        switch (widget.type) {
          case 'stat':
            initialData[widget.id] = { value: 0 };
            break;
          case 'list':
            initialData[widget.id] = { items: [] };
            break;
          case 'health':
            initialData[widget.id] = {
              health: 100,
              uptime: '—',
              apiStatus: '—',
              dbStatus: '—',
            };
            break;
          case 'alerts':
            initialData[widget.id] = { alerts: [] };
            break;
          case 'sla':
            initialData[widget.id] = { stages: [] };
            break;
          case 'chart':
            initialData[widget.id] = { values: [] };
            break;
          default:
            initialData[widget.id] = { value: 0 };
        }
      });
      
      // Merge with any custom/real data passed from parent
      setWidgetData({ ...initialData, ...customData });
      setLoading(false);
    };

    loadWidgetData();
  }, [userRole, customData, widgets]);

  return (
    <div className="dashboard-widgets-grid">
      {widgets.map(widget => (
        <WidgetRenderer
          key={widget.id}
          config={widget}
          data={widgetData[widget.id]}
          loading={loading}
          onClick={() => onWidgetClick?.(widget)}
        />
      ))}
    </div>
  );
}

/**
 * Single Widget Export for custom usage
 */
export { StatWidget, ListWidget, HealthWidget, AlertsWidget, SLAWidget, ChartWidget };
