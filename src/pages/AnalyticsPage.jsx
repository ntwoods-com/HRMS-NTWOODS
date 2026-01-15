import React, { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { BarChart, LineChart, DonutChart, StatCard, ProgressBar } from '../components/ui/AnalyticsChart';
import { ActivityTimeline, ActivityWidget } from '../components/ui/ActivityTimeline';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../auth/useAuth';
import { candidatePipelineStats, recentActivity } from '../api/analytics';

// Demo data for development (replace with API calls)
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
  {
    id: '2',
    type: 'STATUS_CHANGE',
    title: 'Status updated',
    description: 'Interview scheduled for Priya Patel',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    metadata: { from: 'Precall', to: 'Tech Interview', actor: 'HR Manager' },
  },
  {
    id: '3',
    type: 'APPROVAL',
    title: 'Approval granted',
    description: 'Final approval for Amit Kumar',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    metadata: { actor: 'Owner' },
  },
  {
    id: '4',
    type: 'CREATE',
    title: 'New requirement',
    description: 'Senior React Developer position created',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    metadata: { actor: 'EA Team' },
  },
  {
    id: '5',
    type: 'REJECTION',
    title: 'Candidate rejected',
    description: 'Did not meet technical requirements',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    metadata: { actor: 'Tech Lead' },
  },
];

const DEMO_SLA_DATA = [
  { label: 'HR Review', value: 85, max: 100 },
  { label: 'Precall', value: 92, max: 100 },
  { label: 'Tech Interview', value: 78, max: 100 },
  { label: 'Final Interview', value: 95, max: 100 },
  { label: 'Joining', value: 88, max: 100 },
];

export function AnalyticsPage() {
  const { token, role } = useAuth();
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

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Replace with actual API calls
        // const pipelineStats = await candidatePipelineStats(token);
        // const activityData = await recentActivity(token);
        
        // Simulating API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        setStats({
          totalCandidates: 156,
          activeRequirements: 12,
          pendingApprovals: 8,
          thisMonthHires: 5,
        });
        
        setPipelineData(DEMO_PIPELINE_DATA);
        setTrendData(DEMO_TREND_DATA);
        setSourceData(DEMO_SOURCE_DATA);
        setActivities(DEMO_ACTIVITIES);
        setSlaData(DEMO_SLA_DATA);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [token]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <Spinner />
          <p className="small" style={{ marginTop: '16px' }}>Loading analytics...</p>
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

        {/* Stats Cards */}
        <div className="metric-grid" style={{ marginBottom: '24px' }}>
          <StatCard
            title="Total Candidates"
            value={stats.totalCandidates}
            change="+12% from last month"
            changeType="positive"
            icon="👥"
          />
          <StatCard
            title="Active Requirements"
            value={stats.activeRequirements}
            change="+3 this week"
            changeType="positive"
            icon="📋"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            change="Needs attention"
            changeType="neutral"
            icon="⏳"
          />
          <StatCard
            title="This Month Hires"
            value={stats.thisMonthHires}
            change="+2 from last month"
            changeType="positive"
            icon="🎉"
          />
        </div>

        {/* Main Charts Row */}
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

        {/* Second Charts Row */}
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
                  key={index}
                  label={item.label}
                  value={item.value}
                  max={item.max}
                  color={item.value >= 90 ? 'green' : item.value >= 70 ? 'blue' : 'orange'}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="card">
          <ActivityTimeline
            activities={activities}
            title="Recent Activity"
            maxItems={5}
          />
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
