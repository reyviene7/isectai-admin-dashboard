import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  itemLabel?: string;
  isStandalone?: boolean;
  className?: string;
  showPageJump?: boolean;
  showGoTo?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'records',
  isStandalone = false,
  className = '',
  showPageJump = true,
  showGoTo = true
}) => {
  const [goToInput, setGoToInput] = useState('');

  // Calculate item range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers window (e.g. 1 2 3 ... 10)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }
    return pages;
  };

  const handleGoToSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(goToInput.trim(), 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setGoToInput('');
    }
  };

  const pageNumbers = getPageNumbers();

  // If no items exist, show clean minimal message
  if (totalItems === 0) {
    return (
      <div
        className={`pagination-container ${isStandalone ? 'pagination-standalone' : ''} ${className}`}
        id="pagination-wrapper"
      >
        <div className="pagination-info">
          No {itemLabel} to display
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pagination-container ${isStandalone ? 'pagination-standalone' : ''} ${className}`}
      id="pagination-wrapper"
    >
      {/* Left: Results Summary */}
      <div className="pagination-info">
        Showing <span className="pagination-info-num">{startItem}</span>–<span className="pagination-info-num">{endItem}</span> of <span className="pagination-info-num">{totalItems}</span> {itemLabel}
      </div>

      {/* Center: Interactive Page Controls */}
      {totalPages > 1 ? (
        <div className="pagination-controls" role="navigation" aria-label="Pagination">
          {/* First Page */}
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="First page"
            aria-label="First page"
          >
            <ChevronsLeft size={16} />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous page"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Numeric Page Buttons */}
          <div className="pagination-pages">
            {pageNumbers.map((num, idx) => {
              if (num === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="pagination-ellipsis" aria-hidden="true">
                    •••
                  </span>
                );
              }
              const pageNum = num as number;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`pagination-btn pagination-page-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onPageChange(pageNum)}
                  title={`Page ${pageNum}`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next page"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>

          {/* Last Page */}
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Last page"
            aria-label="Last page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      ) : (
        <div className="pagination-single-page">
          <span className="pagination-badge">Page 1 of 1</span>
        </div>
      )}

      {/* Right: Quick Jump / Direct Selector */}
      {totalPages > 1 && (
        <div className="pagination-actions">
          {showPageJump && (
            <div className="pagination-jump">
              <span className="pagination-jump-label">Page</span>
              <div className="pagination-select-wrapper">
                <select
                  className="pagination-select"
                  value={currentPage}
                  onChange={(e) => onPageChange(Number(e.target.value))}
                  aria-label="Select page"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="pagination-select-arrow" />
              </div>
              <span className="pagination-jump-total">of {totalPages}</span>
            </div>
          )}

          {showGoTo && totalPages > 5 && (
            <form className="pagination-goto" onSubmit={handleGoToSubmit}>
              <span className="pagination-goto-label">Go to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                placeholder={String(currentPage)}
                value={goToInput}
                onChange={(e) => setGoToInput(e.target.value)}
                className="pagination-goto-input"
                aria-label="Go to page number"
              />
              <button type="submit" className="pagination-goto-btn" title="Jump to page">
                Go
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
