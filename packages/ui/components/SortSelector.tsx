/**
 * Sort Selector Component
 *
 * A compact button group for selecting annotation sort order.
 * Follows the ExportModal tab pattern with icon-only buttons and tooltips.
 * Designed for use in the narrow (w-72) AnnotationPanel sidebar.
 */

import React from 'react';
import { SortOption } from '../types';

interface SortSelectorProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

interface SortOptionConfig {
  value: SortOption;
  label: string;
  icon: React.ReactNode;
}

const sortOptions: SortOptionConfig[] = [
  {
    value: 'newest',
    label: 'Mais recentes',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-1.5-1.5" />
      </svg>
    ),
  },
  {
    value: 'oldest',
    label: 'Mais antigos',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l1.5 1.5" />
      </svg>
    ),
  },
  {
    value: 'type',
    label: 'Por tipo',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    value: 'author',
    label: 'Por autor',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export const SortSelector: React.FC<SortSelectorProps> = ({
  currentSort,
  onSortChange,
}) => {
  return (
    <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onSortChange(option.value)}
          title={option.label}
          className={`p-1.5 rounded-md transition-colors ${
            currentSort === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
};
