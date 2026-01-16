import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

/**
 * Simple bar chart component (no external dependencies)
 */
export function BarChart({ data = [], height = 200, showLabels = true, animated = true }) {
  const [isVisible, setIsVisible] = useState(!animated);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!animated) return;
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [animated]);

  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="chart-container bar-chart" ref={chartRef}>
      <div className="bar-chart-bars" style={{ height }}>
        {data.map((item, index) => {
          const heightPercent = (item.value / maxValue) * 100;
          return (
            <div key={index} className="bar-chart-bar-wrapper">
              <div
                className={cn('bar-chart-bar', item.color || 'blue')}
                style={{
                  height: isVisible ? `${heightPercent}%` : '0%',
                  transitionDelay: `${index * 50}ms`,
                }}
                title={`${item.label}: ${item.value}`}
              >
                {showLabels && item.value > 0 && <span className="bar-chart-value">{item.value}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="bar-chart-labels">
        {data.map((item, index) => (
          <div key={index} className="bar-chart-label" title={item.label}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Simple line chart component
 */
export function LineChart({ data = [], height = 200, showDots = true, showArea = true }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const padding = 20;
  const chartWidth = 100;
  const chartHeight = 100;

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - (item.value / maxValue) * (chartHeight - 2 * padding);
    return { x, y, value: item.value, label: item.label };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

  return (
    <div className="chart-container line-chart" style={{ height }}>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = chartHeight - padding - (percent / 100) * (chartHeight - 2 * padding);
          return (
            <line
              key={percent}
              x1={padding}
              y1={y}
              x2={chartWidth - padding}
              y2={y}
              className="line-chart-grid"
            />
          );
        })}

        {showArea && <path d={areaD} className={cn('line-chart-area', isVisible && 'visible')} />}

        <path d={pathD} className={cn('line-chart-line', isVisible && 'visible')} />

        {showDots &&
          points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="2"
              className={cn('line-chart-dot', isVisible && 'visible')}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <title>{`${point.label}: ${point.value}`}</title>
            </circle>
          ))}
      </svg>

      <div className="line-chart-labels">
        {data.map((item, index) => (
          <div key={index} className="line-chart-label">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Donut/Pie chart component
 */
export function DonutChart({ data = [], size = 160, thickness = 20, showLegend = true }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - thickness / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  const segments = data.map((item) => {
    const percent = total > 0 ? item.value / total : 0;
    const dashLength = percent * circumference;
    const dashOffset = -currentOffset;
    currentOffset += dashLength;

    return {
      ...item,
      percent,
      dashArray: `${dashLength} ${circumference}`,
      dashOffset,
    };
  });

  return (
    <div className="chart-container donut-chart">
      <div className="donut-chart-wrapper">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="donut-chart-bg"
            strokeWidth={thickness}
          />

          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className={cn('donut-chart-segment', segment.color || 'blue', isVisible && 'visible')}
              strokeWidth={thickness}
              strokeDasharray={segment.dashArray}
              strokeDashoffset={segment.dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <title>{`${segment.label}: ${segment.value} (${Math.round(segment.percent * 100)}%)`}</title>
            </circle>
          ))}

          <text x={size / 2} y={size / 2} className="donut-chart-center">
            <tspan x={size / 2} dy="-0.2em" className="donut-chart-total">
              {total}
            </tspan>
            <tspan x={size / 2} dy="1.4em" className="donut-chart-label">
              Total
            </tspan>
          </text>
        </svg>
      </div>

      {showLegend && (
        <div className="donut-chart-legend">
          {segments.map((segment, index) => (
            <div key={index} className="donut-chart-legend-item">
              <span className={cn('donut-chart-legend-dot', segment.color || 'blue')} />
              <span className="donut-chart-legend-label">{segment.label}</span>
              <span className="donut-chart-legend-value">
                {segment.value} ({Math.round(segment.percent * 100)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Stats card with mini chart
 */
export function StatCard({ title, value, change, changeType = 'neutral', sparklineData = [], icon }) {
  const changeIcon = changeType === 'positive' ? '▲' : changeType === 'negative' ? '▼' : '•';

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        {icon && <span className="stat-card-icon">{icon}</span>}
        <span className="stat-card-title">{title}</span>
      </div>

      <div className="stat-card-value">{value}</div>

      {change !== undefined && (
        <div className={cn('stat-card-change', changeType)}>
          <span className="stat-card-change-icon">{changeIcon}</span>
          <span>{change}</span>
        </div>
      )}

      {sparklineData.length > 0 && (
        <div className="stat-card-sparkline">
          <LineChart data={sparklineData} height={40} showDots={false} showArea={false} />
        </div>
      )}
    </div>
  );
}

/**
 * Progress bar component
 */
export function ProgressBar({ value, max = 100, label, color = 'blue', showValue = true, size = 'md' }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('progress-bar', size)}>
      {label && <span className="progress-bar-label">{label}</span>}
      <div className="progress-bar-track">
        <div className={cn('progress-bar-fill', color)} style={{ width: `${percent}%` }} />
      </div>
      {showValue && <span className="progress-bar-value">{Math.round(percent)}%</span>}
    </div>
  );
}

