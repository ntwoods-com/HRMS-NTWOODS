import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'ntw_hrms_theme_v1';

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
      // Check system preference
      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // ignore
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return;

    const handler = (e) => {
      const stored = localStorage.getItem(THEME_KEY);
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener?.('change', handler);
    return () => mediaQuery.removeEventListener?.('change', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme);
    }
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };
}
