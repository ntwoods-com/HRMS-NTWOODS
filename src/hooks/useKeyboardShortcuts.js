import { useEffect, useCallback } from 'react';

/**
 * Global keyboard shortcuts hook
 * @param {Object} shortcuts - Object mapping shortcut keys to handlers
 * Example: { 'ctrl+k': () => openSearch(), 'ctrl+/': () => toggleHelp() }
 */
export function useKeyboardShortcuts(shortcuts, enabled = true) {
  const handleKeyDown = useCallback(
    (event) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Allow Escape key even in inputs
        if (event.key !== 'Escape') return;
      }

      const keys = [];
      if (event.ctrlKey || event.metaKey) keys.push('ctrl');
      if (event.altKey) keys.push('alt');
      if (event.shiftKey) keys.push('shift');
      keys.push(event.key.toLowerCase());

      const shortcutKey = keys.join('+');

      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        shortcuts[shortcutKey](event);
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Common keyboard shortcuts for the app
 */
export const SHORTCUTS = {
  SEARCH: 'ctrl+k',
  HELP: 'ctrl+/',
  ESCAPE: 'escape',
  REFRESH: 'ctrl+r',
  NEW: 'ctrl+n',
  SAVE: 'ctrl+s',
  TOGGLE_SIDEBAR: 'ctrl+b',
  TOGGLE_THEME: 'ctrl+shift+l',
  GO_DASHBOARD: 'g+d',
  GO_ADMIN: 'g+a',
};

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut) {
  const isMac = navigator.platform?.toLowerCase().includes('mac');
  return shortcut
    .split('+')
    .map((key) => {
      if (key === 'ctrl') return isMac ? '⌘' : 'Ctrl';
      if (key === 'alt') return isMac ? '⌥' : 'Alt';
      if (key === 'shift') return '⇧';
      if (key === 'escape') return 'Esc';
      return key.charAt(0).toUpperCase() + key.slice(1);
    })
    .join(' + ');
}
