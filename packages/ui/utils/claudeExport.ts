/**
 * Claude Code export utilities
 *
 * Transforms internal annotations to Claude Code format for review workflows.
 * Explicitly handles all 5 AnnotationType values with no default/else cases.
 */

import type {
  ClaudeAnnotation,
  ClaudeAnnotationExport,
  ClaudeAnnotationStatus,
  ClaudeAnnotationType,
} from '../types/claude';
import { Annotation, AnnotationType, AnnotationStatus } from '../types';

/**
 * Maps internal AnnotationType to ClaudeAnnotationType
 */
function getClaudeAnnotationType(internalType: AnnotationType): ClaudeAnnotationType {
  const typeMap: Record<AnnotationType, ClaudeAnnotationType> = {
    // DELETION: Remove text
    [AnnotationType.DELETION]: 'deletion' as ClaudeAnnotationType,
    // INSERTION: Add new text (treated as edit)
    [AnnotationType.INSERTION]: 'edit' as ClaudeAnnotationType,
    // REPLACEMENT: Replace text (treated as edit)
    [AnnotationType.REPLACEMENT]: 'edit' as ClaudeAnnotationType,
    // COMMENT: Comment on specific text
    [AnnotationType.COMMENT]: 'comment_individual' as ClaudeAnnotationType,
    // GLOBAL_COMMENT: Document-level comment
    [AnnotationType.GLOBAL_COMMENT]: 'comment_global' as ClaudeAnnotationType,
  };

  return typeMap[internalType];
}

/**
 * Maps internal AnnotationStatus to ClaudeAnnotationStatus
 */
function getClaudeAnnotationStatus(internalStatus?: AnnotationStatus): ClaudeAnnotationStatus | undefined {
  if (!internalStatus) return undefined;

  const statusMap: Record<AnnotationStatus, ClaudeAnnotationStatus> = {
    [AnnotationStatus.OPEN]: 'open' as ClaudeAnnotationStatus,
    [AnnotationStatus.IN_PROGRESS]: 'in_progress' as ClaudeAnnotationStatus,
    [AnnotationStatus.RESOLVED]: 'resolved' as ClaudeAnnotationStatus,
  };

  return statusMap[internalStatus];
}

/**
 * Transforms a single internal annotation to Claude Code format
 *
 * @param annotation - Internal annotation to transform
 * @returns ClaudeAnnotation in Claude Code format
 */
export function transformAnnotation(annotation: Annotation): ClaudeAnnotation {
  const claudeType = getClaudeAnnotationType(annotation.type);
  const claudeStatus = getClaudeAnnotationStatus(annotation.status);

  // Base result with required fields
  const result: ClaudeAnnotation = {
    type: claudeType,
  };

  // Handle type-specific fields
  switch (annotation.type) {
    case AnnotationType.DELETION: {
      result.originalText = annotation.originalText;
      break;
    }

    case AnnotationType.INSERTION: {
      result.text = annotation.text || '';
      result.originalText = annotation.originalText;
      break;
    }

    case AnnotationType.REPLACEMENT: {
      result.text = annotation.text || '';
      result.originalText = annotation.originalText;
      break;
    }

    case AnnotationType.COMMENT: {
      result.text = annotation.originalText; // The text being commented on
      result.comment = annotation.text || ''; // The comment itself
      break;
    }

    case AnnotationType.GLOBAL_COMMENT: {
      result.comment = annotation.text || '';
      break;
    }

    default: {
      // This should never happen if all AnnotationType values are handled above
      // TypeScript will error if we miss any enum value
      const exhaustiveCheck: never = annotation.type;
      throw new Error(`Unhandled AnnotationType: ${exhaustiveCheck}`);
    }
  }

  // Add optional metadata if present
  if (claudeStatus) {
    result.status = claudeStatus;
  }

  if (annotation.author) {
    result.author = annotation.author;
  }

  // Line number could be computed from position in the future
  // For now, we don't have reliable line numbers stored
  // result.lineNumber = computedLineNumber;

  return result;
}

/**
 * Generates a Portuguese summary of annotations
 *
 * @param annotations - Transformed Claude annotations
 * @returns Human-readable summary string
 */
export function generateSummary(annotations: ClaudeAnnotation[]): string {
  const countByType = annotations.reduce<Record<ClaudeAnnotationType, number>>(
    (acc, ann) => {
      acc[ann.type] = (acc[ann.type] || 0) + 1;
      return acc;
    },
    {
      edit: 0,
      comment_global: 0,
      comment_individual: 0,
      deletion: 0,
      highlight: 0,
    }
  );

  const parts: string[] = [];

  if (countByType.edit > 0) {
    parts.push(`${countByType.edit} ediç${countByType.edit > 1 ? 'ões' : 'ão'}`);
  }
  if (countByType.deletion > 0) {
    parts.push(`${countByType.deletion} exclus${countByType.deletion > 1 ? 'ões' : 'ão'}`);
  }
  if (countByType.comment_individual > 0) {
    parts.push(
      `${countByType.comment_individual} comentário${countByType.comment_individual > 1 ? 's' : ''} individual`
    );
  }
  if (countByType.comment_global > 0) {
    parts.push(
      `${countByType.comment_global} comentário${countByType.comment_global > 1 ? 's' : ''} global`
    );
  }
  if (countByType.highlight > 0) {
    parts.push(`${countByType.highlight} destaque${countByType.highlight > 1 ? 's' : ''}`);
  }

  if (parts.length === 0) {
    return 'Nenhuma anotação';
  }

  return `Total: ${annotations.length} anotaç${annotations.length > 1 ? 'ões' : 'ão'} - ${parts.join(', ')}`;
}

/**
 * Transforms an array of internal annotations to Claude Code export format
 *
 * @param annotations - Array of internal annotations to transform
 * @returns Complete ClaudeAnnotationExport structure
 */
export function exportForClaude(annotations: Annotation[]): ClaudeAnnotationExport {
  const transformed = annotations.map(transformAnnotation);

  // Count by type for metadata
  const typeCounts = transformed.reduce<Record<ClaudeAnnotationType, number>>(
    (acc, ann) => {
      acc[ann.type] = (acc[ann.type] || 0) + 1;
      return acc;
    },
    {
      edit: 0,
      comment_global: 0,
      comment_individual: 0,
      deletion: 0,
      highlight: 0,
    }
  );

  return {
    summary: generateSummary(transformed),
    annotations: transformed,
    totalCount: annotations.length,
    metadata: {
      exportDate: new Date().toISOString(),
      types: typeCounts,
    },
  };
}

/**
 * Formats Claude annotation export as markdown for prompt inclusion
 *
 * @param exportData - Claude annotation export to format
 * @returns Markdown formatted string
 */
export function formatForPrompt(exportData: ClaudeAnnotationExport): string {
  const lines: string[] = [];

  // Header
  lines.push('# Anotações para Revisão\n');
  lines.push(`**${exportData.summary}**`);
  lines.push(`_Exportado em: ${new Date(exportData.metadata.exportDate).toLocaleString('pt-BR')}_\n`);

  // Group annotations by type
  const byType = exportData.annotations.reduce<
    Record<ClaudeAnnotationType, ClaudeAnnotation[]>
  >(
    (acc, ann) => {
      if (!acc[ann.type]) {
        acc[ann.type] = [];
      }
      acc[ann.type].push(ann);
      return acc;
    },
    {
      edit: [],
      comment_global: [],
      comment_individual: [],
      deletion: [],
      highlight: [],
    }
  );

  // Type labels in Portuguese
  const typeLabels: Record<ClaudeAnnotationType, string> = {
    edit: '📝 Edições',
    comment_global: '💬 Comentários Globais',
    comment_individual: '💭 Comentários Individuais',
    deletion: '🗑️ Exclusões',
    highlight: '🎨 Destaques',
  };

  // Output each section in specific order
  const typeOrder: ClaudeAnnotationType[] = [
    'edit',
    'deletion',
    'comment_individual',
    'comment_global',
    'highlight',
  ];

  for (const type of typeOrder) {
    const anns = byType[type];
    if (anns.length === 0) continue;

    lines.push(`## ${typeLabels[type]}`);

    for (const ann of anns) {
      lines.push(`- **Tipo:** ${ann.type}`);
      if (ann.status) {
        const statusLabels: Record<ClaudeAnnotationStatus, string> = {
          open: 'Aberto',
          in_progress: 'Em Progresso',
          resolved: 'Resolvido',
        };
        lines.push(`  - **Status:** ${statusLabels[ann.status]}`);
      }
      if (ann.author) {
        lines.push(`  - **Autor:** ${ann.author}`);
      }
      if (ann.originalText) {
        lines.push(`  - **Original:** "${ann.originalText}"`);
      }
      if (ann.text) {
        lines.push(`  - **Texto:** "${ann.text}"`);
      }
      if (ann.comment) {
        lines.push(`  - **Comentário:** "${ann.comment}"`);
      }
    }

    lines.push(''); // Empty line between sections
  }

  return lines.join('\n');
}
