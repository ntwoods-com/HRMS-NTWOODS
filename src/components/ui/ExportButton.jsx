import React, { useState } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import { Spinner } from './Spinner';

const DownloadIcon = () => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const EXPORT_FORMATS = [
  { id: 'excel', label: 'Excel (.xlsx)', icon: '📊', description: 'Best for data analysis' },
  { id: 'csv', label: 'CSV', icon: '📄', description: 'Universal format' },
  { id: 'pdf', label: 'PDF', icon: '📕', description: 'Best for printing' },
];

/**
 * Export Button with format selection modal
 */
export function ExportButton({
  onExport,
  data,
  filename = 'export',
  formats = ['excel', 'csv', 'pdf'],
  disabled = false,
  children,
  variant = 'default',
  size = 'default',
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(formats[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const availableFormats = EXPORT_FORMATS.filter((f) => formats.includes(f.id));

  const handleExport = async () => {
    if (!onExport) {
      // Default client-side export for simple cases
      await defaultExport(data, selectedFormat, filename);
      setIsModalOpen(false);
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      await onExport(selectedFormat, data);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
      >
        <DownloadIcon />
        {children || 'Export'}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Export Data"
        size="sm"
      >
        <div className="export-modal">
          <p className="export-description">
            Choose a format to export your data
          </p>

          <div className="export-formats">
            {availableFormats.map((format) => (
              <label
                key={format.id}
                className={`export-format-option ${selectedFormat === format.id ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value={format.id}
                  checked={selectedFormat === format.id}
                  onChange={() => setSelectedFormat(format.id)}
                />
                <span className="export-format-icon">{format.icon}</span>
                <div className="export-format-info">
                  <span className="export-format-label">{format.label}</span>
                  <span className="export-format-desc">{format.description}</span>
                </div>
              </label>
            ))}
          </div>

          {error && (
            <div className="export-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="export-actions">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Spinner size="sm" />
                  Exporting...
                </>
              ) : (
                <>
                  <DownloadIcon />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>

        <style>{`
          .export-modal {
            padding: 8px 0;
          }

          .export-description {
            font-size: 14px;
            color: var(--gray-600);
            margin: 0 0 16px;
          }

          .export-formats {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
          }

          .export-format-option {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            border: 1px solid var(--gray-200);
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: all var(--transition);
          }

          .export-format-option:hover {
            border-color: var(--gray-300);
            background: var(--gray-50);
          }

          .export-format-option.selected {
            border-color: var(--primary);
            background: rgba(37, 99, 235, 0.05);
          }

          .export-format-option input {
            display: none;
          }

          .export-format-icon {
            font-size: 24px;
          }

          .export-format-info {
            display: flex;
            flex-direction: column;
          }

          .export-format-label {
            font-size: 14px;
            font-weight: 600;
            color: var(--gray-800);
          }

          .export-format-desc {
            font-size: 12px;
            color: var(--gray-500);
          }

          .export-error {
            padding: 10px 12px;
            background: #fee2e2;
            border-radius: var(--radius-sm);
            font-size: 13px;
            color: var(--danger);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .export-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding-top: 16px;
            border-top: 1px solid var(--gray-100);
          }
        `}</style>
      </Modal>
    </>
  );
}

/**
 * Default client-side export for simple data
 */
async function defaultExport(data, format, filename) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('No data to export');
  }

  if (format === 'csv') {
    exportToCsv(data, filename);
  } else if (format === 'excel') {
    // For Excel, we'll export as CSV with xlsx extension
    // In a real app, you'd use a library like xlsx
    exportToCsv(data, filename, 'xlsx');
  } else if (format === 'pdf') {
    // For PDF, create a printable HTML and use browser print
    exportToPrint(data, filename);
  }
}

function exportToCsv(data, filename, extension = 'csv') {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          let cell = row[header];
          if (cell === null || cell === undefined) cell = '';
          cell = String(cell).replace(/"/g, '""');
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            cell = `"${cell}"`;
          }
          return cell;
        })
        .join(',')
    ),
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.${extension}`);
}

function exportToPrint(data, filename) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background: #f5f5f5; font-weight: 600; }
        tr:nth-child(even) { background: #fafafa; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>${filename}</h1>
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) =>
                `<tr>${headers.map((h) => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`
            )
            .join('')}
        </tbody>
      </table>
      <script>window.print();</script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Quick export button (no modal, direct download)
 */
export function QuickExportButton({ data, filename = 'export', format = 'csv', ...props }) {
  const handleClick = () => {
    if (format === 'csv') {
      exportToCsv(data, filename);
    } else if (format === 'pdf') {
      exportToPrint(data, filename);
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      <DownloadIcon />
      Export {format.toUpperCase()}
    </Button>
  );
}
