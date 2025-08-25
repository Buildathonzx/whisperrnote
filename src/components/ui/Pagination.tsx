'use client';

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  totalCount: number;
  pageSize: number;
  className?: string;
  compact?: boolean; // For mobile/smaller displays
}

export function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onNextPage,
  onPreviousPage,
  totalCount,
  pageSize,
  className = '',
  compact = false
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = compact ? 1 : 2; // How many pages to show on each side
    const pages: (number | string)[] = [];
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Always show first page
    pages.push(1);

    // Add ellipsis if there's a gap
    if (rangeStart > 2) {
      pages.push('...');
    }

    // Add pages around current page
    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Add ellipsis if there's a gap
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Results info */}
      <div className="text-sm text-foreground/60">
        {compact ? (
          `${currentPage} / ${totalPages}`
        ) : (
          `Showing ${startItem}-${endItem} of ${totalCount} results`
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-card border border-border rounded-xl text-foreground hover:shadow-inner-light dark:hover:shadow-inner-dark transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {!compact && 'Previous'}
        </button>

        {/* Page numbers */}
        {!compact && (
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-sm text-foreground/40">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                      currentPage === page
                        ? 'bg-accent text-white shadow-lg'
                        : 'bg-card border border-border text-foreground hover:shadow-inner-light dark:hover:shadow-inner-dark'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Next button */}
        <button
          onClick={onNextPage}
          disabled={!hasNextPage}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-card border border-border rounded-xl text-foreground hover:shadow-inner-light dark:hover:shadow-inner-dark transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {!compact && 'Next'}
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}