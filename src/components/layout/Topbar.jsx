import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MenuIcon } from '../ui/Icons';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationBell } from '../ui/NotificationBell';
import { GlobalSearch, SearchTrigger } from '../ui/GlobalSearch';
import { PerformanceBadge } from '../ui/PerformanceMonitor';
import { useKeyboardShortcuts, SHORTCUTS } from '../../hooks/useKeyboardShortcuts';
import { getNavSections } from './nav';

function normalizeRole_(role) {
  const r = String(role || '').trim().toUpperCase();
  return r || null;
}

export function Topbar({ onToggleCollapsed }) {
  const { me, legacyRole, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const effectiveRole = normalizeRole_(me?.role) || normalizeRole_(legacyRole) || normalizeRole_(role) || 'USER';

  // Keyboard shortcuts
  useKeyboardShortcuts({
    [SHORTCUTS.SEARCH]: () => setIsSearchOpen(true),
    [SHORTCUTS.TOGGLE_SIDEBAR]: onToggleCollapsed,
  });

  const pageLabel = useMemo(() => {
    const path = String(location.pathname || '');
    for (const s of getNavSections()) {
      for (const it of s.items || []) {
        if (it.to === path) return it.label;
      }
    }
    return '';
  }, [location.pathname]);

  return (
    <>
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <header className="topbar">
        <div className="topbar-inner">
          <div className="row" style={{ gap: 10, minWidth: 0 }}>
            <button className="icon-button" type="button" onClick={onToggleCollapsed} aria-label="Toggle sidebar">
              <MenuIcon size={18} />
            </button>
            <div style={{ minWidth: 0 }}>
              <div className="topbar-title">{pageLabel || 'HRMS'}</div>
              <div className="topbar-subtitle">Workflow-driven portal</div>
            </div>
          </div>

          <div className="spacer" />

          {/* Search Trigger */}
          <SearchTrigger onClick={() => setIsSearchOpen(true)} />

          <div className="row" style={{ gap: 10 }}>
            {/* Performance Badge */}
            <PerformanceBadge />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <NotificationBell />

            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Badge variant="blue">{effectiveRole}</Badge>
            <div className="topbar-user">
              <div className="topbar-userName">{me?.fullName ?? me?.email ?? 'User'}</div>
              <div className="topbar-userMeta">{me?.email ?? ''}</div>
            </div>
            <Button size="sm" onClick={logout} style={{ color: 'var(--danger)' }}>
              Logout
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}

