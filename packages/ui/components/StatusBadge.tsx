import React from 'react';
import { AnnotationStatus, Annotation } from '../types';

interface StatusBadgeProps {
  status?: AnnotationStatus;
  size?: 'small' | 'large';
  onClick?: () => void;
  annotation?: Annotation;
}

const statusConfig = {
  [AnnotationStatus.OPEN]: {
    label: 'Aberto',
    colorClass: 'text-gray-600',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    borderClass: 'border-gray-200 dark:border-gray-700',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  [AnnotationStatus.IN_PROGRESS]: {
    label: 'Em Progresso',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    borderClass: 'border-blue-200 dark:border-blue-800',
    icon: (
      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  [AnnotationStatus.RESOLVED]: {
    label: 'Resolvido',
    colorClass: 'text-green-600',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    borderClass: 'border-green-200 dark:border-green-800',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
};

const sizeClasses = {
  small: {
    container: 'px-1.5 py-0.5 gap-1',
    text: 'text-[9px]',
    icon: 'w-3 h-3',
  },
  large: {
    container: 'px-2.5 py-1 gap-1.5',
    text: 'text-xs',
    icon: 'w-4 h-4',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = AnnotationStatus.OPEN,
  size = 'small',
  onClick,
  annotation
}) => {
  const config = statusConfig[status] || statusConfig[AnnotationStatus.OPEN];
  const sizeClass = sizeClasses[size];

  // Default to OPEN if status is undefined (for backward compatibility)
  const displayStatus = status || AnnotationStatus.OPEN;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center rounded-md border transition-all
        ${config.bgClass} ${config.borderClass} ${config.colorClass}
        ${sizeClass.container}
        ${onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
      `}
      title={config.label}
    >
      <span className={sizeClass.icon}>
        {config.icon}
      </span>
      <span className={`${sizeClass.text} font-medium uppercase tracking-wide`}>
        {config.label}
      </span>
    </button>
  );
};

export default StatusBadge;
