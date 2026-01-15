/**
 * Performance Monitor Component
 * Shows real-time system performance metrics
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CpuIcon,
  ServerIcon,
  DatabaseIcon,
  ActivityIcon,
  ClockIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  RefreshIcon,
} from './Icons';
import { cn } from '../../utils/cn';

// Performance thresholds
const THRESHOLDS = {
  apiLatency: { good: 200, warning: 500 }, // ms
  memory: { good: 70, warning: 85 }, // %
  errorRate: { good: 1, warning: 5 }, // %
};

/**
 * Circular Progress Indicator
 */
function CircularProgress({ value, max = 100, size = 80, strokeWidth = 8, color = 'blue' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min((value / max) * 100, 100);
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="circular-progress">
      <circle
        className="progress-bg"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        className={cn('progress-fill', `color-${color}`)}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="progress-text"
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

/**
 * Sparkline Chart
 */
function Sparkline({ data = [], height = 30, color = 'blue' }) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 100;
  const pointSpacing = width / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * pointSpacing;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className={cn('sparkline', `color-${color}`)} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

/**
 * Metric Card
 */
function MetricCard({ icon: Icon, title, value, unit, trend, trendValue, status, sparkData }) {
  const statusColor = status === 'good' ? 'green' : status === 'warning' ? 'yellow' : status === 'error' ? 'red' : 'gray';

  return (
    <div className={cn('perf-metric-card', `status-${statusColor}`)}>
      <div className="metric-icon">
        <Icon size={20} />
      </div>
      <div className="metric-content">
        <span className="metric-title">{title}</span>
        <div className="metric-value-row">
          <span className="metric-value">{value}</span>
          <span className="metric-unit">{unit}</span>
          {trend && (
            <span className={cn('metric-trend', trend === 'up' ? 'trend-up' : 'trend-down')}>
              <TrendingUpIcon size={12} />
              {trendValue}
            </span>
          )}
        </div>
        {sparkData && (
          <div className="metric-spark">
            <Sparkline data={sparkData} color={statusColor} />
          </div>
        )}
      </div>
      <div className={cn('metric-status-dot', `bg-${statusColor}`)} />
    </div>
  );
}

/**
 * API Endpoint Status
 */
function EndpointStatus({ endpoints = [] }) {
  return (
    <div className="endpoint-status">
      <div className="endpoint-header">
        <ServerIcon size={16} />
        <span>API Endpoints</span>
      </div>
      <div className="endpoint-list">
        {endpoints.map((ep, idx) => (
          <div key={idx} className={cn('endpoint-item', `status-${ep.status}`)}>
            <span className="endpoint-name">{ep.name}</span>
            <span className="endpoint-latency">{ep.latency}ms</span>
            {ep.status === 'ok' ? (
              <CheckCircleIcon size={14} className="status-icon" />
            ) : (
              <AlertCircleIcon size={14} className="status-icon" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Performance Monitor Main Component
 */
export function PerformanceMonitor({ 
  refreshInterval = 5000, 
  compact = false,
  onAlert,
}) {
  const [metrics, setMetrics] = useState({
    apiLatency: 0,
    memory: 0,
    errorRate: 0,
    requestsPerMin: 0,
    activeConnections: 0,
    uptime: '0h',
  });
  const [history, setHistory] = useState({
    apiLatency: [],
    memory: [],
    errorRate: [],
    requestsPerMin: [],
  });
  const [endpoints, setEndpoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  // Determine status based on thresholds
  const getStatus = useCallback((metric, value) => {
    const threshold = THRESHOLDS[metric];
    if (!threshold) return 'good';
    if (value <= threshold.good) return 'good';
    if (value <= threshold.warning) return 'warning';
    return 'error';
  }, []);

  // Fetch metrics (mock data - replace with real API)
  const fetchMetrics = useCallback(async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200));

      // Generate mock metrics
      const newMetrics = {
        apiLatency: Math.floor(50 + Math.random() * 150),
        memory: Math.floor(40 + Math.random() * 40),
        errorRate: Math.random() * 2,
        requestsPerMin: Math.floor(100 + Math.random() * 500),
        activeConnections: Math.floor(10 + Math.random() * 50),
        uptime: '23h 45m',
      };

      // Update history (keep last 20 points)
      setHistory(prev => ({
        apiLatency: [...prev.apiLatency.slice(-19), newMetrics.apiLatency],
        memory: [...prev.memory.slice(-19), newMetrics.memory],
        errorRate: [...prev.errorRate.slice(-19), newMetrics.errorRate],
        requestsPerMin: [...prev.requestsPerMin.slice(-19), newMetrics.requestsPerMin],
      }));

      setMetrics(newMetrics);
      setLastUpdate(new Date());

      // Check for alerts
      const latencyStatus = getStatus('apiLatency', newMetrics.apiLatency);
      const memoryStatus = getStatus('memory', newMetrics.memory);
      const errorStatus = getStatus('errorRate', newMetrics.errorRate);

      if (latencyStatus === 'error' || memoryStatus === 'error' || errorStatus === 'error') {
        onAlert?.({
          type: 'performance',
          severity: 'high',
          message: 'Performance degradation detected',
          metrics: newMetrics,
        });
      }

      // Mock endpoints
      setEndpoints([
        { name: '/api/candidates', latency: Math.floor(30 + Math.random() * 100), status: 'ok' },
        { name: '/api/interviews', latency: Math.floor(40 + Math.random() * 80), status: 'ok' },
        { name: '/api/users', latency: Math.floor(20 + Math.random() * 50), status: 'ok' },
        { name: '/api/analytics', latency: Math.floor(100 + Math.random() * 200), status: 'ok' },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    }
  }, [getStatus, onAlert]);

  // Set up auto-refresh
  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchMetrics, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchMetrics]);

  if (compact) {
    return (
      <div className="perf-monitor-compact">
        <div className="perf-compact-header">
          <ActivityIcon size={16} />
          <span>Performance</span>
          <span className={cn('perf-status-badge', `status-${getStatus('apiLatency', metrics.apiLatency)}`)}>
            {getStatus('apiLatency', metrics.apiLatency) === 'good' ? 'Healthy' : 'Degraded'}
          </span>
        </div>
        <div className="perf-compact-metrics">
          <div className="compact-metric">
            <span className="label">Latency</span>
            <span className="value">{metrics.apiLatency}ms</span>
          </div>
          <div className="compact-metric">
            <span className="label">Memory</span>
            <span className="value">{metrics.memory}%</span>
          </div>
          <div className="compact-metric">
            <span className="label">Errors</span>
            <span className="value">{metrics.errorRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="perf-monitor">
      <div className="perf-monitor-header">
        <div className="perf-title">
          <ActivityIcon size={20} />
          <h3>Performance Monitor</h3>
        </div>
        <div className="perf-actions">
          <button
            className={cn('perf-toggle', autoRefresh && 'active')}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Pause auto-refresh' : 'Enable auto-refresh'}
          >
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button
            className="perf-refresh-btn"
            onClick={fetchMetrics}
            disabled={isLoading}
            title="Refresh now"
          >
            <RefreshIcon size={16} />
          </button>
          {lastUpdate && (
            <span className="perf-last-update">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="perf-metrics-grid">
        <MetricCard
          icon={ClockIcon}
          title="API Latency"
          value={metrics.apiLatency}
          unit="ms"
          status={getStatus('apiLatency', metrics.apiLatency)}
          sparkData={history.apiLatency}
        />
        <MetricCard
          icon={CpuIcon}
          title="Memory Usage"
          value={metrics.memory}
          unit="%"
          status={getStatus('memory', metrics.memory)}
          sparkData={history.memory}
        />
        <MetricCard
          icon={AlertCircleIcon}
          title="Error Rate"
          value={metrics.errorRate.toFixed(2)}
          unit="%"
          status={getStatus('errorRate', metrics.errorRate)}
          sparkData={history.errorRate}
        />
        <MetricCard
          icon={ActivityIcon}
          title="Requests/min"
          value={metrics.requestsPerMin}
          unit="req"
          status="good"
          sparkData={history.requestsPerMin}
        />
      </div>

      <div className="perf-details-row">
        <div className="perf-gauges">
          <div className="gauge-item">
            <CircularProgress
              value={metrics.memory}
              color={getStatus('memory', metrics.memory)}
            />
            <span className="gauge-label">Memory</span>
          </div>
          <div className="gauge-item">
            <CircularProgress
              value={100 - metrics.errorRate * 10}
              color={getStatus('errorRate', metrics.errorRate)}
            />
            <span className="gauge-label">Health</span>
          </div>
        </div>

        <EndpointStatus endpoints={endpoints} />

        <div className="perf-stats">
          <div className="stat-item">
            <DatabaseIcon size={16} />
            <div className="stat-content">
              <span className="stat-value">{metrics.activeConnections}</span>
              <span className="stat-label">Active Connections</span>
            </div>
          </div>
          <div className="stat-item">
            <ServerIcon size={16} />
            <div className="stat-content">
              <span className="stat-value">{metrics.uptime}</span>
              <span className="stat-label">Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Performance Badge for Topbar
 */
export function PerformanceBadge() {
  const [status, setStatus] = useState('good');
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    const checkPerformance = () => {
      const lat = Math.floor(50 + Math.random() * 100);
      setLatency(lat);
      setStatus(lat < 100 ? 'good' : lat < 200 ? 'warning' : 'error');
    };

    checkPerformance();
    const interval = setInterval(checkPerformance, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn('perf-badge', `status-${status}`)} title={`API Latency: ${latency}ms`}>
      <ActivityIcon size={14} />
      <span>{latency}ms</span>
    </div>
  );
}
