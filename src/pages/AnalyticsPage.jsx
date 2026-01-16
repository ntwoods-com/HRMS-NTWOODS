import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AppLayout } from '../components/layout/AppLayout';
import { BarChart, DonutChart, LineChart, ProgressBar, StatCard } from '../components/ui/AnalyticsChart';
import { ActivityTimeline } from '../components/ui/ActivityTimeline';
import { Spinner } from '../components/ui/Spinner';
import { AwardIcon, ClockIcon, FileTextIcon, UsersIcon } from '../components/ui/Icons';
import { useAuth } from '../auth/useAuth';
import {
  candidatePipelineStats,
  dashboardMetrics,
  hiringTrends,
  recentActivity,
  slaCompliance,
  sourceDistribution,
} from '../api/analytics';

// Demo data for development (used as a fallback when APIs fail)
const DEMO_PIPELINE_DATA = [
  { label: 'HR Review', value: 45, color: 'blue' },
  { label: 'Precall', value: 32, color: 'orange' },
  { label: 'Tech Interview', value: 28, color: 'purple' },
  { label: 'Final', value: 15, color: 'green' },
  { label: 'Joining', value: 8, color: 'blue' },
];

const DEMO_TREND_DATA = [
  { label: 'Jan', value: 12 },
  { label: 'Feb', value: 19 },
  { label: 'Mar', value: 15 },
  { label: 'Apr', value: 25 },
  { label: 'May', value: 22 },
  { label: 'Jun', value: 30 },
  { label: 'Jul', value: 28 },
];

const DEMO_SOURCE_DATA = [
  { label: 'Job Portals', value: 45, color: 'blue' },
  { label: 'Referrals', value: 30, color: 'green' },
  { label: 'Walk-ins', value: 15, color: 'orange' },
  { label: 'Others', value: 10, color: 'gray' },
];

const DEMO_ACTIVITIES = [
  {
    id: '1',
    type: 'HIRE',
    title: 'Candidate hired',
    description: 'Rahul Sharma joined as Software Developer',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: { actor: 'HR Admin' },
  },
];

const DEMO_SLA_DATA = [
  { label: 'HR Review', value: 85, max: 100 },
  { label: 'Precall', value: 92, max: 100 },
  { label: 'Tech Interview', value: 78, max: 100 },
  { label: 'Final Interview', value: 95, max: 100 },
  { label: 'Joining', value: 88, max: 100 },
];

const STAGE_COLOR = {
  SHORTLISTING: 'blue',
  OWNER_APPROVAL: 'purple',
  WALKIN: 'orange',
  FINAL_DECISION: 'green',
  HR_REVIEW: 'blue',
  PRECALL: 'orange',
  PRE_INTERVIEW: 'orange',
  INPERSON_TECH: 'purple',
  EA_TECH: 'purple',
  FINAL_INTERVIEW: 'green',
  FINAL_HOLD: 'orange',
  JOINING: 'blue',
  PROBATION: 'blue',
  HIRED: 'green',
  REJECTED: 'red',
  OTHER: 'gray',
};

function toChartDataFromPipeline_(stages = []) {
  if (!Array.isArray(stages)) return [];
  return stages.map((s) => ({
    label: String(s.label || s.stage || ''),
    value: Number(s.count || 0),
    color: STAGE_COLOR[String(s.stage || '').toUpperCase()] || 'gray',
  }));
}

function toChartDataFromSources_(sources = []) {
  if (!Array.isArray(sources)) return [];
  return sources.map((s) => ({
    label: String(s.label || s.source || 'Other'),
    value: Number(s.count || 0),
    color: String(s.color || 'gray'),
  }));
}

function toChartDataFromTrends_(trends = []) {
  if (!Array.isArray(trends)) return [];
  return trends.map((t) => ({ label: String(t.period || ''), value: Number(t.count || 0) }));
}

function toSlaBars_(metrics = []) {
  if (!Array.isArray(metrics)) return [];
  return metrics.map((m) => ({
    label: String(m.label || m.stage || ''),
    value: Number(m.compliance || 0),
    max: 100,
  }));
}

export function AnalyticsPage() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeRequirements: 0,
    pendingApprovals: 0,
    thisMonthHires: 0,
  });
  const [pipelineData, setPipelineData] = useState(DEMO_PIPELINE_DATA);
  const [trendData, setTrendData] = useState(DEMO_TREND_DATA);
  const [sourceData, setSourceData] = useState(DEMO_SOURCE_DATA);
  const [activities, setActivities] = useState(DEMO_ACTIVITIES);
  const [slaData, setSlaData] = useState(DEMO_SLA_DATA);

  const statCards = useMemo(
    () => [
      {
        title: 'Total Candidates',
        value: stats.totalCandidates,
        change: undefined,
        changeType: 'neutral',
        icon: <UsersIcon size={18} />,
      },
      {
        title: 'Active Requirements',
        value: stats.activeRequirements,
        change: undefined,
        changeType: 'neutral',
        icon: <FileTextIcon size={18} />,
      },
      {
        title: 'Pending Approvals',
        value: stats.pendingApprovals,
        change: undefined,
        changeType: 'neutral',
        icon: <ClockIcon size={18} />,
      },
      {
        title: 'This Month Hires',
        value: stats.thisMonthHires,
        change: undefined,
        changeType: 'neutral',
        icon: <AwardIcon size={18} />,
      },
    ],
    [stats]
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      try {
        const [metricsRes, pipelineRes, sourcesRes, trendsRes, slaRes, activityRes] = await Promise.all([
          dashboardMetrics(token),
          candidatePipelineStats(token),
          sourceDistribution(token),
          hiringTrends(token, { period: 'monthly' }),
          slaCompliance(token),
          recentActivity(token, { limit: 25 }),
        ]);

        if (cancelled) return;

        if (metricsRes) setStats(metricsRes);
        if (pipelineRes?.stages) setPipelineData(toChartDataFromPipeline_(pipelineRes.stages));
        if (sourcesRes?.sources) setSourceData(toChartDataFromSources_(sourcesRes.sources));
        if (trendsRes?.trends) setTrendData(toChartDataFromTrends_(trendsRes.trends));
        if (slaRes?.metrics) setSlaData(toSlaBars_(slaRes.metrics));
        if (activityRes?.activities) setActivities(activityRes.activities);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        toast.error('Failed to load analytics', { id: 'analytics_load' });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <Spinner />
          <p className="small" style={{ marginTop: '16px' }}>
            Loading analytics...
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="analytics-page">
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--gray-900)', margin: 0 }}>
            Analytics Dashboard
          </h1>
          <p className="small">Real-time insights into your hiring pipeline</p>
        </div>

        <div className="metric-grid" style={{ marginBottom: '24px' }}>
          {statCards.map((c) => (
            <StatCard
              key={c.title}
              title={c.title}
              value={c.value}
              change={c.change}
              changeType={c.changeType}
              icon={c.icon}
            />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--gray-900)' }}>
              Candidate Pipeline
            </h3>
            <BarChart data={pipelineData} height={220} />
          </div>

          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--gray-900)' }}>
              Source Distribution
            </h3>
            <DonutChart data={sourceData} size={160} thickness={24} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--gray-900)' }}>
              Hiring Trend
            </h3>
            <LineChart data={trendData} height={180} />
          </div>

          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--gray-900)' }}>
              SLA Compliance
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {slaData.map((item, index) => (
                <ProgressBar
                  key={`${item.label}-${index}`}
                  label={item.label}
                  value={item.value}
                  max={item.max}
                  color={item.value >= 90 ? 'green' : item.value >= 70 ? 'blue' : 'orange'}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <ActivityTimeline activities={activities} title="Recent Activity" maxItems={8} />
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .analytics-page > div[style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          .analytics-page > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}

export default AnalyticsPage;
