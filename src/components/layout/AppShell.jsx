import React, { memo, useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const SIDEBAR_COLLAPSED_KEY = 'ntw_hrms_sidebar_collapsed_v1';

function loadCollapsed_() {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

function saveCollapsed_(collapsed) {
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {
    // ignore
  }
}

const ShellContent = memo(function ShellContent({ children }) {
  return children;
});

export function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(loadCollapsed_);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    saveCollapsed_(collapsed);
  }, [collapsed]);

  useEffect(() => {
    const mql = window.matchMedia?.('(max-width: 920px)');
    if (!mql) return;

    const update = () => setIsMobile(!!mql.matches);
    update();

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }

    // Safari < 14 fallback
    mql.addListener?.(update);
    return () => mql.removeListener?.(update);
  }, []);

  useEffect(() => {
    if (!isMobile) setMobileNavOpen(false);
  }, [isMobile]);

  const sidebarCollapsed = isMobile ? false : collapsed;

  return (
    <div className={cn('app-shell', sidebarCollapsed && 'is-collapsed', mobileNavOpen && 'is-mobile-nav-open')}>
      <div
        className="mobile-nav-overlay"
        aria-hidden={!mobileNavOpen}
        onClick={() => setMobileNavOpen(false)}
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => {
          if (isMobile) setMobileNavOpen(false);
          else setCollapsed((s) => !s);
        }}
        onNavigate={() => setMobileNavOpen(false)}
      />
      <div className="app-main">
        <Topbar
          onToggleCollapsed={() => {
            if (isMobile) setMobileNavOpen((s) => !s);
            else setCollapsed((s) => !s);
          }}
        />
        <main className="app-content">
          <div className="container">
            <ShellContent>{children}</ShellContent>
          </div>
        </main>
      </div>
    </div>
  );
}
