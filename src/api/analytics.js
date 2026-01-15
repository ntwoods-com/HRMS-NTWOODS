import { callApi } from './client';

/**
 * Get pipeline statistics for candidates
 */
export async function candidatePipelineStats(token) {
  return callApi('CANDIDATE_PIPELINE_STATS', {}, token);
}

/**
 * Get recent activity/audit log
 */
export async function recentActivity(token, options = {}) {
  return callApi('RECENT_ACTIVITY', {
    limit: options.limit || 20,
    entityType: options.entityType || null,
  }, token);
}

/**
 * Get hiring trends data
 */
export async function hiringTrends(token, options = {}) {
  return callApi('HIRING_TRENDS', {
    period: options.period || 'monthly', // daily, weekly, monthly
    dateFrom: options.dateFrom || null,
    dateTo: options.dateTo || null,
  }, token);
}

/**
 * Get SLA compliance metrics
 */
export async function slaCompliance(token) {
  return callApi('SLA_COMPLIANCE_METRICS', {}, token);
}

/**
 * Get source distribution for candidates
 */
export async function sourceDistribution(token, options = {}) {
  return callApi('SOURCE_DISTRIBUTION', {
    dateFrom: options.dateFrom || null,
    dateTo: options.dateTo || null,
  }, token);
}

/**
 * Get dashboard summary metrics
 */
export async function dashboardMetrics(token) {
  return callApi('DASHBOARD_METRICS', {}, token);
}

/**
 * Export analytics report
 */
export async function exportAnalyticsReport(token, options = {}) {
  return callApi('EXPORT_ANALYTICS_REPORT', {
    format: options.format || 'excel', // excel, pdf, csv
    reportType: options.reportType || 'pipeline',
    dateFrom: options.dateFrom || null,
    dateTo: options.dateTo || null,
  }, token);
}
