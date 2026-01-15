import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

const FilterIcon = () => (
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
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * Advanced Filter Panel Component
 * 
 * @param {Object} props
 * @param {Array} props.filters - Array of filter definitions
 * @param {Object} props.values - Current filter values
 * @param {Function} props.onChange - Called when filters change
 * @param {Function} props.onReset - Called when filters are reset
 */
export function AdvancedFilters({
  filters = [],
  values = {},
  onChange,
  onReset,
  inline = false,
}) {
  const [isExpanded, setIsExpanded] = useState(inline);
  const activeCount = Object.keys(values).filter(
    (k) => values[k] !== undefined && values[k] !== '' && values[k] !== null
  ).length;

  const handleChange = (key, value) => {
    onChange?.({ ...values, [key]: value });
  };

  const handleReset = () => {
    onReset?.();
    onChange?.({});
  };

  return (
    <div className={cn('advanced-filters', inline && 'inline', isExpanded && 'expanded')}>
      {!inline && (
        <div className="advanced-filters-header">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <FilterIcon />
            Filters
            {activeCount > 0 && (
              <span className="advanced-filters-count">{activeCount}</span>
            )}
          </Button>

          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Clear all
            </Button>
          )}
        </div>
      )}

      {(inline || isExpanded) && (
        <div className="advanced-filters-body">
          <div className="advanced-filters-grid">
            {filters.map((filter) => (
              <FilterField
                key={filter.key}
                filter={filter}
                value={values[filter.key]}
                onChange={(value) => handleChange(filter.key, value)}
              />
            ))}
          </div>

          {!inline && (
            <div className="advanced-filters-actions">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Reset
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsExpanded(false)}>
                Apply Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active filter tags */}
      {activeCount > 0 && !isExpanded && (
        <div className="advanced-filters-tags">
          {filters
            .filter((f) => values[f.key] !== undefined && values[f.key] !== '')
            .map((filter) => (
              <FilterTag
                key={filter.key}
                label={filter.label}
                value={formatFilterValue(filter, values[filter.key])}
                onRemove={() => handleChange(filter.key, undefined)}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function FilterField({ filter, value, onChange }) {
  switch (filter.type) {
    case 'select':
      return (
        <div className="filter-field">
          <label className="filter-label">{filter.label}</label>
          <select
            className="filter-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
          >
            <option value="">All</option>
            {filter.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'multiselect':
      return (
        <MultiSelectField
          filter={filter}
          value={value || []}
          onChange={onChange}
        />
      );

    case 'date':
      return (
        <div className="filter-field">
          <label className="filter-label">{filter.label}</label>
          <input
            type="date"
            className="filter-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
          />
        </div>
      );

    case 'daterange':
      return (
        <DateRangeField filter={filter} value={value} onChange={onChange} />
      );

    case 'number':
      return (
        <div className="filter-field">
          <label className="filter-label">{filter.label}</label>
          <input
            type="number"
            className="filter-input"
            value={value || ''}
            min={filter.min}
            max={filter.max}
            placeholder={filter.placeholder}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      );

    case 'text':
    default:
      return (
        <div className="filter-field">
          <label className="filter-label">{filter.label}</label>
          <input
            type="text"
            className="filter-input"
            value={value || ''}
            placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
            onChange={(e) => onChange(e.target.value || undefined)}
          />
        </div>
      );
  }
}

function MultiSelectField({ filter, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedValues = Array.isArray(value) ? value : [];

  const handleToggle = (optValue) => {
    const newValue = selectedValues.includes(optValue)
      ? selectedValues.filter((v) => v !== optValue)
      : [...selectedValues, optValue];
    onChange(newValue.length > 0 ? newValue : undefined);
  };

  return (
    <div className="filter-field" ref={ref}>
      <label className="filter-label">{filter.label}</label>
      <div className="multiselect-wrapper">
        <button
          type="button"
          className="multiselect-trigger"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedValues.length > 0
            ? `${selectedValues.length} selected`
            : 'Select...'}
        </button>

        {isOpen && (
          <div className="multiselect-dropdown">
            {filter.options?.map((opt) => (
              <label key={opt.value} className="multiselect-option">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt.value)}
                  onChange={() => handleToggle(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DateRangeField({ filter, value, onChange }) {
  const rangeValue = value || { from: '', to: '' };

  return (
    <div className="filter-field filter-field-daterange">
      <label className="filter-label">{filter.label}</label>
      <div className="daterange-inputs">
        <input
          type="date"
          className="filter-input"
          value={rangeValue.from || ''}
          onChange={(e) =>
            onChange({ ...rangeValue, from: e.target.value || undefined })
          }
        />
        <span className="daterange-separator">to</span>
        <input
          type="date"
          className="filter-input"
          value={rangeValue.to || ''}
          onChange={(e) =>
            onChange({ ...rangeValue, to: e.target.value || undefined })
          }
        />
      </div>
    </div>
  );
}

function FilterTag({ label, value, onRemove }) {
  return (
    <div className="filter-tag">
      <span className="filter-tag-label">{label}:</span>
      <span className="filter-tag-value">{value}</span>
      <button className="filter-tag-remove" onClick={onRemove} aria-label="Remove filter">
        <CloseIcon />
      </button>
    </div>
  );
}

function formatFilterValue(filter, value) {
  if (filter.type === 'select') {
    const opt = filter.options?.find((o) => o.value === value);
    return opt?.label || value;
  }
  if (filter.type === 'multiselect' && Array.isArray(value)) {
    return value
      .map((v) => filter.options?.find((o) => o.value === v)?.label || v)
      .join(', ');
  }
  if (filter.type === 'daterange' && value) {
    return `${value.from || '...'} - ${value.to || '...'}`;
  }
  return String(value);
}

/**
 * Quick filter presets
 */
export function FilterPresets({ presets = [], onSelect, activePreset }) {
  return (
    <div className="filter-presets">
      {presets.map((preset) => (
        <button
          key={preset.key}
          className={cn('filter-preset-btn', activePreset === preset.key && 'active')}
          onClick={() => onSelect(preset.key, preset.filters)}
        >
          {preset.icon && <span className="filter-preset-icon">{preset.icon}</span>}
          {preset.label}
        </button>
      ))}
    </div>
  );
}

// Add CSS for filters
export const filterStyles = `
  .advanced-filters {
    margin-bottom: 16px;
  }

  .advanced-filters-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .advanced-filters-count {
    background: var(--primary);
    color: white;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 999px;
    margin-left: 4px;
  }

  .advanced-filters-body {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-top: 8px;
  }

  .advanced-filters.inline .advanced-filters-body {
    margin-top: 0;
    background: transparent;
    border: none;
    padding: 0;
  }

  .advanced-filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }

  .advanced-filters-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }

  .advanced-filters-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .filter-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .filter-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--gray-600);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .filter-input {
    padding: 8px 10px;
    font-size: 13px;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--gray-800);
  }

  .filter-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    outline: none;
  }

  .filter-field-daterange .daterange-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .daterange-separator {
    font-size: 12px;
    color: var(--gray-500);
  }

  .multiselect-wrapper {
    position: relative;
  }

  .multiselect-trigger {
    width: 100%;
    padding: 8px 10px;
    font-size: 13px;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--gray-800);
    text-align: left;
    cursor: pointer;
  }

  .multiselect-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-md);
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 4px;
  }

  .multiselect-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
  }

  .multiselect-option:hover {
    background: var(--gray-100);
  }

  .filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: var(--gray-100);
    border: 1px solid var(--gray-200);
    border-radius: 999px;
    font-size: 12px;
  }

  .filter-tag-label {
    color: var(--gray-500);
  }

  .filter-tag-value {
    color: var(--gray-800);
    font-weight: 500;
  }

  .filter-tag-remove {
    background: none;
    border: none;
    padding: 2px;
    cursor: pointer;
    color: var(--gray-400);
    display: flex;
  }

  .filter-tag-remove:hover {
    color: var(--gray-600);
  }

  .filter-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .filter-preset-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--surface);
    border: 1px solid var(--gray-200);
    border-radius: 999px;
    font-size: 12px;
    color: var(--gray-700);
    cursor: pointer;
    transition: all var(--transition);
  }

  .filter-preset-btn:hover {
    border-color: var(--gray-400);
    background: var(--gray-50);
  }

  .filter-preset-btn.active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }

  .filter-preset-icon {
    font-size: 14px;
  }
`;
