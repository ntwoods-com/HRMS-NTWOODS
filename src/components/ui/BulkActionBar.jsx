import React from 'react';

/**
 * BulkActionBar - Floating toolbar for bulk actions
 * 
 * @param {Object} props
 * @param {number} props.selectedCount - Number of selected items
 * @param {Function} props.onClearSelection - Callback to clear selection
 * @param {Array} props.actions - Array of action buttons [{label, onClick, variant, disabled, icon}]
 * @param {boolean} props.loading - Show loading state
 */
export function BulkActionBar({ selectedCount = 0, onClearSelection, actions = [], loading = false }) {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-action-bar">
      <div className="bulk-action-bar-inner">
        <div className="bulk-action-info">
          <span className="bulk-action-count">{selectedCount}</span>
          <span className="bulk-action-label">selected</span>
          <button 
            type="button" 
            className="bulk-action-clear"
            onClick={onClearSelection}
            disabled={loading}
          >
            ✕ Clear
          </button>
        </div>
        
        <div className="bulk-action-buttons">
          {actions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              className={`button ${action.variant || ''}`}
              onClick={action.onClick}
              disabled={action.disabled || loading}
              title={action.title}
            >
              {action.icon ? <span style={{ marginRight: 6 }}>{action.icon}</span> : null}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * BulkProgressModal - Show progress during bulk operations
 */
export function BulkProgressModal({ open, title, current, total, errors = [], onClose }) {
  if (!open) return null;

  const progress = total > 0 ? Math.round((current / total) * 100) : 0;
  const isComplete = current >= total;

  return (
    <div className="modal-overlay" onClick={isComplete ? onClose : undefined}>
      <div className="modal-content bulk-progress-modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>{title || 'Processing...'}</h3>
        
        <div className="bulk-progress-bar-container">
          <div className="bulk-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        
        <div className="bulk-progress-text">
          {current} / {total} ({progress}%)
        </div>

        {errors.length > 0 && (
          <div className="bulk-errors">
            <div className="bulk-errors-title">⚠️ {errors.length} errors:</div>
            <div className="bulk-errors-list">
              {errors.slice(0, 5).map((err, i) => (
                <div key={i} className="bulk-error-item">
                  {err.file || err.id}: {err.message}
                </div>
              ))}
              {errors.length > 5 && (
                <div className="bulk-error-item">...and {errors.length - 5} more</div>
              )}
            </div>
          </div>
        )}

        {isComplete && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <button className="button primary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * SelectAllCheckbox - Header checkbox for select all
 */
export function SelectAllCheckbox({ checked, indeterminate, onChange, disabled, label = 'Select All' }) {
  const checkboxRef = React.useRef(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className="bulk-select-all">
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span>{label}</span>
    </label>
  );
}
