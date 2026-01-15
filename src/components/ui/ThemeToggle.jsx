import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { SunIcon, MoonIcon } from './Icons';

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
}
