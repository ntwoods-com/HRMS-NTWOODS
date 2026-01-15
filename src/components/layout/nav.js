export function getNavSections() {
  return [
    {
      key: 'core',
      title: 'Core',
      items: [
        { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
        { key: 'tests', label: 'Tests', to: '/tests', icon: 'check-circle', portalKey: 'PORTAL_TESTS', roles: ['ADMIN', 'HR', 'EA', 'ACCOUNTS', 'MIS', 'DEO'], preload: () => import('../../pages/TestsPage.jsx') },
      ],
    },
    {
      key: 'ea',
      title: 'EA',
      items: [
        { key: 'requirements', label: 'Requirements', to: '/requirements', icon: 'file-text', portalKey: 'PORTAL_REQUIREMENTS', roles: ['EA', 'ADMIN'], preload: () => import('../../pages/RequirementsPage.jsx') },
      ],
    },
    {
      key: 'hr',
      title: 'HR Workflow',
      items: [
        { key: 'hrReview', label: 'Requirement Review', to: '/hr/review', icon: 'file-text', portalKey: 'PORTAL_HR_REVIEW', roles: ['HR', 'ADMIN'], preload: () => import('../../pages/HrReviewPage.jsx') },
        { key: 'precall', label: 'Precall', to: '/hr/precall', icon: 'phone', portalKey: 'PORTAL_HR_PRECALL', roles: ['HR', 'ADMIN'], preload: () => import('../../pages/PrecallPage.jsx') },
        { key: 'preinterview', label: 'Pre-interview', to: '/hr/preinterview', icon: 'calendar', portalKey: 'PORTAL_HR_PREINTERVIEW', roles: ['HR', 'ADMIN'], preload: () => import('../../pages/PreinterviewPage.jsx') },
        { key: 'failCandidates', label: 'Fail Candidates', to: '/hr/fail-candidates', icon: 'x-circle', portalKey: 'PORTAL_FAIL_CANDIDATES', roles: ['HR', 'ADMIN'], preload: () => import('../../pages/FailCandidatesPage.jsx') },
        { key: 'inperson', label: 'In-person', to: '/hr/inperson', icon: 'user', portalKey: 'PORTAL_HR_INPERSON', roles: ['HR', 'ADMIN'], preload: () => import('../../pages/InpersonTechPage.jsx') },
        { key: 'final', label: 'Final Interview', to: '/hr/final', icon: 'check-circle', portalKey: 'PORTAL_HR_FINAL', roles: ['HR', 'ADMIN'], preload: () => import('../../pages/FinalInterviewPage.jsx') },
        { key: 'finalHold', label: 'Final Hold', to: '/hr/final-hold', icon: 'clock', portalKey: 'PORTAL_HR_FINAL_HOLD', roles: ['HR', 'ADMIN'], preload: () => import('../../pages/FinalHoldPage.jsx') },
        { key: 'joining', label: 'Joining', to: '/hr/joining', icon: 'users', portalKey: 'PORTAL_HR_JOINING', roles: ['HR', 'ADMIN'], preload: () => import('../../pages/JoiningPage.jsx') },
        { key: 'probation', label: 'Probation', to: '/hr/probation', icon: 'shield', portalKey: 'PORTAL_HR_PROBATION', roles: ['HR', 'EA', 'ADMIN'], preload: () => import('../../pages/ProbationPage.jsx') },
      ],
    },
    {
      key: 'owner',
      title: 'Owner',
      items: [{ key: 'owner', label: 'Approvals', to: '/owner', icon: 'shield', portalKey: 'PORTAL_OWNER', roles: ['OWNER', 'ADMIN'], preload: () => import('../../pages/OwnerPage.jsx') }],
    },
    {
      key: 'logs',
      title: 'Logs & Analytics',
      items: [
        { key: 'rejections', label: 'Rejection Log', to: '/rejections', icon: 'file-text', portalKey: 'PORTAL_REJECTION_LOG', roles: ['EA', 'HR', 'ADMIN'], preload: () => import('../../pages/RejectionLogPage.jsx') },
        { key: 'analytics', label: 'Analytics', to: '/analytics', icon: 'bar-chart', portalKey: 'PORTAL_ANALYTICS', roles: ['HR', 'ADMIN'], preload: () => import('../../pages/AnalyticsPage.jsx') },
      ],
    },
    {
      key: 'employee',
      title: 'Employee',
      items: [{ key: 'trainings', label: 'Trainings', to: '/employee/trainings', icon: 'award', roles: ['EMPLOYEE'], preload: () => import('../../pages/EmployeeTrainingPage.jsx') }],
    },
    {
      key: 'admin',
      title: 'Admin',
      items: [
        { key: 'admin', label: 'Admin', to: '/admin', icon: 'settings', portalKey: 'PORTAL_ADMIN', roles: ['ADMIN'], preload: () => import('../../pages/AdminPage.jsx') },
        { key: 'sla', label: 'SLA Config', to: '/admin/sla', icon: 'gauge', portalKey: 'PORTAL_ADMIN_SLA', roles: ['ADMIN'], preload: () => import('../../pages/SlaConfigPage.jsx') },
      ],
    },
  ];
}
