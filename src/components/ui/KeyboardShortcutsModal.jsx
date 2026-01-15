import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { formatShortcut, SHORTCUTS } from '../../hooks/useKeyboardShortcuts';

const SHORTCUT_CATEGORIES = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: SHORTCUTS.SEARCH, description: 'Open search' },
      { keys: SHORTCUTS.TOGGLE_SIDEBAR, description: 'Toggle sidebar' },
      { keys: 'escape', description: 'Close modal / Cancel' },
    ],
  },
  {
    title: 'Theme',
    shortcuts: [
      { keys: SHORTCUTS.TOGGLE_THEME, description: 'Toggle dark/light mode' },
    ],
  },
  {
    title: 'Quick Actions',
    shortcuts: [
      { keys: 'ctrl+n', description: 'New item (context dependent)' },
      { keys: 'ctrl+s', description: 'Save (context dependent)' },
      { keys: 'ctrl+r', description: 'Refresh data' },
    ],
  },
];

export function KeyboardShortcutsModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <div className="shortcuts-modal">
        {SHORTCUT_CATEGORIES.map((category, idx) => (
          <div key={idx} className="shortcuts-category">
            <h4 className="shortcuts-category-title">{category.title}</h4>
            <div className="shortcuts-list">
              {category.shortcuts.map((shortcut, sidx) => (
                <div key={sidx} className="shortcut-item">
                  <span className="shortcut-description">{shortcut.description}</span>
                  <kbd className="shortcut-keys">{formatShortcut(shortcut.keys)}</kbd>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="shortcuts-footer">
          <p className="small">
            Press <kbd>{formatShortcut(SHORTCUTS.HELP)}</kbd> anywhere to open this dialog
          </p>
        </div>
      </div>

      <style>{`
        .shortcuts-modal {
          padding: 8px 0;
        }

        .shortcuts-category {
          margin-bottom: 20px;
        }

        .shortcuts-category:last-of-type {
          margin-bottom: 0;
        }

        .shortcuts-category-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--gray-500);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--gray-100);
        }

        .shortcuts-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .shortcut-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
        }

        .shortcut-description {
          font-size: 14px;
          color: var(--gray-700);
        }

        .shortcut-keys {
          font-size: 12px;
          padding: 4px 10px;
          background: var(--gray-100);
          border: 1px solid var(--gray-200);
          border-radius: 6px;
          font-family: inherit;
          color: var(--gray-600);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .shortcuts-footer {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--gray-100);
          text-align: center;
        }

        .shortcuts-footer kbd {
          font-size: 11px;
          padding: 2px 6px;
          background: var(--gray-100);
          border: 1px solid var(--gray-200);
          border-radius: 4px;
          font-family: inherit;
        }
      `}</style>
    </Modal>
  );
}

/**
 * Hook to show keyboard shortcuts modal with Ctrl+/ shortcut
 */
export function useKeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
