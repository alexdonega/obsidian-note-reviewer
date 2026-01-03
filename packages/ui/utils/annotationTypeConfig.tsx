import React from 'react';
import { AnnotationType } from '../types';

export interface AnnotationTypeStyle {
  label: string;
  color: string;
  bg: string;
  icon: React.ReactElement;
}

export type AnnotationTypeConfig = Record<AnnotationType, AnnotationTypeStyle>;

/**
 * Shared configuration for annotation type styling
 * Used by AnnotationCard and AnnotationStatistics components
 */
export const annotationTypeConfig: AnnotationTypeConfig = {
  [AnnotationType.DELETION]: {
    label: 'Excluir',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    )
  },
  [AnnotationType.INSERTION]: {
    label: 'Inserir',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    )
  },
  [AnnotationType.REPLACEMENT]: {
    label: 'Substituir',
    color: 'text-primary',
    bg: 'bg-primary/10',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    )
  },
  [AnnotationType.COMMENT]: {
    label: 'Comentario',
    color: 'text-accent',
    bg: 'bg-accent/10',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    )
  },
  [AnnotationType.GLOBAL_COMMENT]: {
    label: 'Global',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
};
