import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { formatShortcut, SHORTCUTS } from '../../hooks/useKeyboardShortcuts';

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// Search categories
const SEARCH_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'candidates', label: 'Candidates' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'pages', label: 'Pages' },
];

// Page navigation items
const PAGE_ITEMS = [
  { title: 'Dashboard', path: '/dashboard', keywords: ['home', 'overview'] },
  { title: 'Admin Panel', path: '/admin', keywords: ['settings', 'users'] },
  { title: 'Requirements', path: '/requirements', keywords: ['jobs', 'openings'] },
  { title: 'HR Review', path: '/hr-review', keywords: ['review', 'hr'] },
  { title: 'Precall', path: '/precall', keywords: ['calls', 'screening'] },
  { title: 'Final Interview', path: '/final-interview', keywords: ['interview', 'final'] },
  { title: 'Joining', path: '/joining', keywords: ['onboarding', 'new hire'] },
  { title: 'Probation', path: '/probation', keywords: ['new employees'] },
  { title: 'Tests', path: '/tests', keywords: ['assessments', 'exams'] },
  { title: 'Rejection Log', path: '/rejections', keywords: ['failed', 'rejected'] },
];

export function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search logic
  const performSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const searchLower = searchQuery.toLowerCase();

      // Search pages
      const pageResults =
        category === 'all' || category === 'pages'
          ? PAGE_ITEMS.filter(
              (item) =>
                item.title.toLowerCase().includes(searchLower) ||
                item.keywords.some((kw) => kw.includes(searchLower))
            ).map((item) => ({
              type: 'page',
              title: item.title,
              subtitle: 'Navigate to page',
              action: () => {
                navigate(item.path);
                onClose();
              },
            }))
          : [];

      // Simulate API search for candidates (replace with real API)
      const candidateResults =
        category === 'all' || category === 'candidates'
          ? []
          : // Would be: await api.searchCandidates(searchQuery)
            [];

      // Combine results
      setResults([...pageResults, ...candidateResults]);
      setIsLoading(false);
    },
    [category, navigate, onClose]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            results[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="global-search-overlay" onClick={onClose}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="global-search-header">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            className="global-search-input"
            placeholder="Search candidates, pages, requirements..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="global-search-shortcut">{formatShortcut(SHORTCUTS.ESCAPE)}</kbd>
        </div>

        <div className="global-search-categories">
          {SEARCH_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={cn('global-search-category', category === cat.key && 'active')}
              onClick={() => setCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="global-search-results">
          {isLoading ? (
            <div className="global-search-loading">
              <span className="spinner-sm" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="global-search-empty">
              {query ? (
                <>
                  <span className="global-search-empty-icon">🔍</span>
                  <p>No results found for "{query}"</p>
                </>
              ) : (
                <>
                  <span className="global-search-empty-icon">⌨️</span>
                  <p>Start typing to search</p>
                </>
              )}
            </div>
          ) : (
            results.map((result, index) => (
              <div
                key={index}
                className={cn('global-search-result', index === selectedIndex && 'selected')}
                onClick={result.action}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="global-search-result-icon">
                  {result.type === 'page' ? '📄' : result.type === 'candidate' ? '👤' : '📋'}
                </div>
                <div className="global-search-result-content">
                  <div className="global-search-result-title">{result.title}</div>
                  <div className="global-search-result-subtitle">{result.subtitle}</div>
                </div>
                {index === selectedIndex && (
                  <kbd className="global-search-result-hint">Enter ↵</kbd>
                )}
              </div>
            ))
          )}
        </div>

        <div className="global-search-footer">
          <span>
            <kbd>↑↓</kbd> Navigate
          </span>
          <span>
            <kbd>↵</kbd> Select
          </span>
          <span>
            <kbd>Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}

export function SearchTrigger({ onClick }) {
  return (
    <button className="search-trigger" onClick={onClick} aria-label="Search">
      <SearchIcon />
      <span className="search-trigger-text">Search...</span>
      <kbd className="search-trigger-shortcut">{formatShortcut(SHORTCUTS.SEARCH)}</kbd>
    </button>
  );
}
