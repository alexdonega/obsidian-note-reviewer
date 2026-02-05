import React from 'react';
import { AnnotationStatus, Annotation } from '../types';

/**
 * Get the Portuguese label for a given status
 */
export function getStatusLabel(status: AnnotationStatus): string {
  const labels: Record<AnnotationStatus, string> = {
    [AnnotationStatus.OPEN]: 'Aberto',
    [AnnotationStatus.IN_PROGRESS]: 'Em Progresso',
    [AnnotationStatus.RESOLVED]: 'Resolvido',
  };
  return labels[status] || labels[AnnotationStatus.OPEN];
}

/**
 * Get the CSS color classes for a given status
 */
export function getStatusColor(status: AnnotationStatus): {
  text: string;
  bg: string;
  border: string;
} {
  const colors: Record<AnnotationStatus, { text: string; bg: string; border: string }> = {
    [AnnotationStatus.OPEN]: {
      text: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-100 dark:bg-gray-800',
      border: 'border-gray-200 dark:border-gray-700',
    },
    [AnnotationStatus.IN_PROGRESS]: {
      text: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800',
    },
    [AnnotationStatus.RESOLVED]: {
      text: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800',
    },
  };
  return colors[status] || colors[AnnotationStatus.OPEN];
}

/**
 * Get the React icon element for a given status
 */
export function getStatusIcon(status: AnnotationStatus): React.ReactElement {
  const icons: Record<AnnotationStatus, React.ReactElement> = {
    [AnnotationStatus.OPEN]: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    [AnnotationStatus.IN_PROGRESS]: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    [AnnotationStatus.RESOLVED]: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  };
  return icons[status] || icons[AnnotationStatus.OPEN];
}

/**
 * Check if a user can change the status of an annotation
 * Allow any collaborator to change status (not just author)
 */
export function canChangeStatus(annotation: Annotation, userId: string): boolean {
  // Any authenticated user can change status
  // This is a collaborative decision, not restricted to author
  return !!userId;
}

/**
 * Get the next suggested status in the workflow
 */
export function getNextStatus(currentStatus: AnnotationStatus): AnnotationStatus {
  const workflow: Record<AnnotationStatus, AnnotationStatus> = {
    [AnnotationStatus.OPEN]: AnnotationStatus.IN_PROGRESS,
    [AnnotationStatus.IN_PROGRESS]: AnnotationStatus.RESOLVED,
    [AnnotationStatus.RESOLVED]: AnnotationStatus.OPEN, // Can reopen
  };
  return workflow[currentStatus] || AnnotationStatus.IN_PROGRESS;
}

/**
 * Get all available statuses for display in a dropdown or controls
 */
export function getAllStatuses(): Array<{
  status: AnnotationStatus;
  label: string;
  description: string;
}> {
  return [
    {
      status: AnnotationStatus.OPEN,
      label: 'Aberto',
      description: 'Anotação aberta e aguardando revisão',
    },
    {
      status: AnnotationStatus.IN_PROGRESS,
      label: 'Em Progresso',
      description: 'Trabalhando nesta anotação',
    },
    {
      status: AnnotationStatus.RESOLVED,
      label: 'Resolvido',
      description: 'Anotação resolvida e concluída',
    },
  ];
}

/**
 * Format the resolved timestamp for display
 */
export function formatResolvedAt(resolvedAt?: number): string | null {
  if (!resolvedAt) return null;

  const now = Date.now();
  const diff = now - resolvedAt;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'agora';
  if (minutes < 60) => `resolvido ${minutes}m atrás`;
  if (hours < 24) => `resolvido ${hours}h atrás`;
  if (days < 7) => `resolvido ${days}d atrás`;

  return `resolvido ${new Date(resolvedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

/**
 * Check if an annotation is in a resolved state
 */
export function isResolved(annotation: Annotation): boolean {
  return annotation.status === AnnotationStatus.RESOLVED;
}

/**
 * Check if an annotation is in an active state (not resolved)
 */
export function isActive(annotation: Annotation): boolean {
  return !isResolved(annotation);
}
