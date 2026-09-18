import React, { useState, useRef, useEffect } from 'react';

export interface ExportOption {
  label: string;
  format: 'csv' | 'xlsx' | 'jpg';
  icon?: string;
  onClick: () => void;
}

export interface ExportButtonProps {
  label?: string;
  options?: ExportOption[];
  onExportCSV?: () => void;
  onExportXLSX?: () => void;
  onExportJPG?: () => void;
  inline?: boolean;
  size?: 'sm' | 'md';
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  label = 'Download / Export',
  options,
  onExportCSV,
  onExportXLSX,
  onExportJPG,
  inline = false,
  size = 'md',
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute options list
  const activeOptions: ExportOption[] = options || [
    ...(onExportCSV ? [{ label: 'Export CSV (.csv)', format: 'csv' as const, icon: '📄', onClick: onExportCSV }] : []),
    ...(onExportXLSX ? [{ label: 'Export Excel (.xlsx)', format: 'xlsx' as const, icon: '📊', onClick: onExportXLSX }] : []),
    ...(onExportJPG ? [{ label: 'Download Card (.jpg)', format: 'jpg' as const, icon: '🖼️', onClick: onExportJPG }] : []),
  ];

  if (activeOptions.length === 0) return null;

  // Inline mode: renders separate sleek chip buttons for quick access
  if (inline) {
    return (
      <div className={`export-inline-group size-${size}`}>
        {activeOptions.map((opt) => (
          <button
            key={opt.format}
            type="button"
            className={`export-chip-btn export-${opt.format}`}
            onClick={opt.onClick}
            title={`Download as ${opt.format.toUpperCase()}`}
          >
            <span className="export-chip-icon">{opt.icon || '📥'}</span>
            <span className="export-chip-label">{opt.format.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  // Dropdown mode: a single sleek button with dropdown
  return (
    <div className={`export-dropdown-wrapper size-${size}`} ref={menuRef}>
      <button
        type="button"
        className="export-trigger-btn"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        title="Download in multiple formats"
      >
        <span className="export-icon">📥</span>
        <span className="export-label">{label}</span>
        <span className="export-caret">▾</span>
      </button>

      {open && (
        <div className="export-popover-menu" role="menu">
          <div className="export-popover-header">Download Formats</div>
          {activeOptions.map((opt) => (
            <button
              key={opt.format}
              type="button"
              className="export-menu-item"
              onClick={() => {
                setOpen(false);
                opt.onClick();
              }}
              role="menuitem"
            >
              <span className="item-icon">{opt.icon || '📥'}</span>
              <div className="item-text">
                <strong>{opt.label}</strong>
                <small>Standard {opt.format.toUpperCase()} file</small>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
