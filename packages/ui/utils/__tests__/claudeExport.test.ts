import { describe, test, expect } from 'bun:test';
import { exportForClaude, transformAnnotation, generateSummary, formatForPrompt } from '../claudeExport';
import { Annotation, AnnotationType, AnnotationStatus } from '../../types';
import { ClaudeAnnotationType, ClaudeAnnotationStatus } from '../../types/claude';

/**
 * Helper to create test annotations with minimal required fields
 */
function createAnnotation(
  overrides: Partial<Annotation> & {
    id: string;
    createdA: number;
    type: AnnotationType;
  }
): Annotation {
  return {
    blockId: 'test-block',
    startOffset: 0,
    endOffset: 10,
    originalText: 'test text',
    ...overrides,
  };
}

describe('transformAnnotation', () => {
  describe('DELETION → deletion', () => {
    test('transforms DELETION annotation to Claude deletion type', () => {
      const annotation = createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.DELETION,
        originalText: 'remove this',
      });

      const result = transformAnnotation(annotation);

      expect(result.type).toBe(ClaudeAnnotationType.DELETION);
      expect(result.originalText).toBe('remove this');
      expect(result.text).toBeUndefined();
      expect(result.comment).toBeUndefined();
    });
  });

  describe('INSERTION → edit', () => {
    test('transforms INSERTION annotation to Claude edit type', () => {
      const annotation = createAnnotation({
        id: '2',
        createdA: 100,
        type: AnnotationType.INSERTION,
        text: 'new text',
        originalText: '',
      });

      const result = transformAnnotation(annotation);

      expect(result.type).toBe(ClaudeAnnotationType.EDIT);
      expect(result.text).toBe('new text');
      expect(result.originalText).toBe('');
    });
  });

  describe('REPLACEMENT → edit', () => {
    test('transforms REPLACEMENT annotation to Claude edit type', () => {
      const annotation = createAnnotation({
        id: '3',
        createdA: 100,
        type: AnnotationType.REPLACEMENT,
        text: 'replacement text',
        originalText: 'old text',
      });

      const result = transformAnnotation(annotation);

      expect(result.type).toBe(ClaudeAnnotationType.EDIT);
      expect(result.text).toBe('replacement text');
      expect(result.originalText).toBe('old text');
    });
  });

  describe('COMMENT → comment_individual', () => {
    test('transforms COMMENT annotation to Claude comment_individual type', () => {
      const annotation = createAnnotation({
        id: '4',
        createdA: 100,
        type: AnnotationType.COMMENT,
        text: 'this is a comment',
        originalText: 'text being commented on',
      });

      const result = transformAnnotation(annotation);

      expect(result.type).toBe(ClaudeAnnotationType.COMMENT_INDIVIDUAL);
      expect(result.comment).toBe('this is a comment');
      expect(result.text).toBe('text being commented on');
    });
  });

  describe('GLOBAL_COMMENT → comment_global', () => {
    test('transforms GLOBAL_COMMENT annotation to Claude comment_global type', () => {
      const annotation = createAnnotation({
        id: '5',
        createdA: 100,
        type: AnnotationType.GLOBAL_COMMENT,
        text: 'global comment about document',
        originalText: '',
      });

      const result = transformAnnotation(annotation);

      expect(result.type).toBe(ClaudeAnnotationType.COMMENT_GLOBAL);
      expect(result.comment).toBe('global comment about document');
      expect(result.originalText).toBeUndefined();
    });
  });

  describe('status preservation', () => {
    test('preserves OPEN status', () => {
      const annotation = createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.COMMENT,
        status: AnnotationStatus.OPEN,
      });

      const result = transformAnnotation(annotation);

      expect(result.status).toBe(ClaudeAnnotationStatus.OPEN);
    });

    test('preserves IN_PROGRESS status', () => {
      const annotation = createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.COMMENT,
        status: AnnotationStatus.IN_PROGRESS,
      });

      const result = transformAnnotation(annotation);

      expect(result.status).toBe(ClaudeAnnotationStatus.IN_PROGRESS);
    });

    test('preserves RESOLVED status', () => {
      const annotation = createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.COMMENT,
        status: AnnotationStatus.RESOLVED,
      });

      const result = transformAnnotation(annotation);

      expect(result.status).toBe(ClaudeAnnotationStatus.RESOLVED);
    });

    test('handles undefined status gracefully', () => {
      const annotation = createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.COMMENT,
        status: undefined,
      });

      const result = transformAnnotation(annotation);

      expect(result.status).toBeUndefined();
    });
  });

  describe('optional field handling', () => {
    test('includes author when present', () => {
      const annotation = createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.COMMENT,
        author: 'test-user',
      });

      const result = transformAnnotation(annotation);

      expect(result.author).toBe('test-user');
    });

    test('handles missing author', () => {
      const annotation = createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.COMMENT,
        author: undefined,
      });

      const result = transformAnnotation(annotation);

      expect(result.author).toBeUndefined();
    });

    test('handles missing text field gracefully', () => {
      const annotation = createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.INSERTION,
        text: undefined,
        originalText: '',
      });

      const result = transformAnnotation(annotation);

      expect(result.text).toBe('');
    });
  });
});

describe('exportForClaude', () => {
  test('transforms empty array to empty export', () => {
    const result = exportForClaude([]);

    expect(result.summary).toBe('Nenhuma anotação');
    expect(result.annotations).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.metadata.types).toEqual({
      edit: 0,
      comment_global: 0,
      comment_individual: 0,
      deletion: 0,
      highlight: 0,
    });
  });

  test('transforms single annotation', () => {
    const annotations: Annotation[] = [
      createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.COMMENT,
      }),
    ];

    const result = exportForClaude(annotations);

    expect(result.totalCount).toBe(1);
    expect(result.annotations).toHaveLength(1);
    expect(result.annotations[0].type).toBe(ClaudeAnnotationType.COMMENT_INDIVIDUAL);
  });

  test('transforms mixed array with all 5 annotation types', () => {
    const annotations: Annotation[] = [
      createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.DELETION,
        originalText: 'delete me',
      }),
      createAnnotation({
        id: '2',
        createdA: 100,
        type: AnnotationType.INSERTION,
        text: 'new',
        originalText: '',
      }),
      createAnnotation({
        id: '3',
        createdA: 100,
        type: AnnotationType.REPLACEMENT,
        text: 'replaced',
        originalText: 'old',
      }),
      createAnnotation({
        id: '4',
        createdA: 100,
        type: AnnotationType.COMMENT,
        text: 'comment',
        originalText: 'selected text',
      }),
      createAnnotation({
        id: '5',
        createdA: 100,
        type: AnnotationType.GLOBAL_COMMENT,
        text: 'global',
        originalText: '',
      }),
    ];

    const result = exportForClaude(annotations);

    expect(result.totalCount).toBe(5);
    expect(result.annotations).toHaveLength(5);

    // Verify all 5 types are present
    const types = result.annotations.map((a) => a.type);
    expect(types).toContain(ClaudeAnnotationType.DELETION);
    expect(types).toContain(ClaudeAnnotationType.EDIT);
    expect(types).toContain(ClaudeAnnotationType.COMMENT_INDIVIDUAL);
    expect(types).toContain(ClaudeAnnotationType.COMMENT_GLOBAL);

    // Count edits (both INSERTION and REPLACEMENT map to edit)
    const editCount = types.filter((t) => t === ClaudeAnnotationType.EDIT).length;
    expect(editCount).toBe(2);
  });

  test('totalCount matches input length', () => {
    const annotations: Annotation[] = [
      createAnnotation({ id: '1', createdA: 100, type: AnnotationType.COMMENT }),
      createAnnotation({ id: '2', createdA: 100, type: AnnotationType.DELETION }),
      createAnnotation({ id: '3', createdA: 100, type: AnnotationType.INSERTION }),
    ];

    const result = exportForClaude(annotations);

    expect(result.totalCount).toBe(annotations.length);
  });

  test('includes export date in ISO format', () => {
    const before = new Date().toISOString();
    const result = exportForClaude([]);
    const after = new Date().toISOString();

    expect(result.metadata.exportDate).toBeTruthy();
    expect(result.metadata.exportDate >= before).toBe(true);
    expect(result.metadata.exportDate <= after).toBe(true);
  });

  test('counts types correctly in metadata', () => {
    const annotations: Annotation[] = [
      createAnnotation({ id: '1', createdA: 100, type: AnnotationType.INSERTION }),
      createAnnotation({ id: '2', createdA: 100, type: AnnotationType.INSERTION }),
      createAnnotation({ id: '3', createdA: 100, type: AnnotationType.REPLACEMENT }),
      createAnnotation({ id: '4', createdA: 100, type: AnnotationType.DELETION }),
      createAnnotation({ id: '5', createdA: 100, type: AnnotationType.COMMENT }),
      createAnnotation({ id: '6', createdA: 100, type: AnnotationType.GLOBAL_COMMENT }),
    ];

    const result = exportForClaude(annotations);

    expect(result.metadata.types.edit).toBe(3); // 2 INSERTION + 1 REPLACEMENT
    expect(result.metadata.types.deletion).toBe(1);
    expect(result.metadata.types.comment_individual).toBe(1);
    expect(result.metadata.types.comment_global).toBe(1);
    expect(result.metadata.types.highlight).toBe(0);
  });
});

describe('generateSummary', () => {
  test('returns "Nenhuma anotação" for empty array', () => {
    const result = generateSummary([]);
    expect(result).toBe('Nenhuma anotação');
  });

  test('generates summary for single deletion', () => {
    const annotations: ClaudeAnnotation[] = [
      { type: ClaudeAnnotationType.DELETION, originalText: 'delete me' },
    ];

    const result = generateSummary(annotations);
    expect(result).toContain('1 anotação');
    expect(result).toContain('1 exclusão');
  });

  test('generates summary for multiple edits (plural)', () => {
    const annotations: ClaudeAnnotation[] = [
      { type: ClaudeAnnotationType.EDIT, text: 'new', originalText: 'old' },
      { type: ClaudeAnnotationType.EDIT, text: 'newer', originalText: 'older' },
    ];

    const result = generateSummary(annotations);
    expect(result).toContain('2 anotações');
    expect(result).toContain('2 edições');
  });

  test('generates summary for mixed types', () => {
    const annotations: ClaudeAnnotation[] = [
      { type: ClaudeAnnotationType.EDIT, text: 'new', originalText: 'old' },
      { type: ClaudeAnnotationType.DELETION, originalText: 'delete' },
      { type: ClaudeAnnotationType.COMMENT_INDIVIDUAL, text: 'selected', comment: 'comment' },
      { type: ClaudeAnnotationType.COMMENT_GLOBAL, comment: 'global comment' },
    ];

    const result = generateSummary(annotations);
    expect(result).toContain('4 anotações');
    expect(result).toContain('1 edição');
    expect(result).toContain('1 exclusão');
    expect(result).toContain('comentário individual');
    expect(result).toContain('comentário global');
  });

  test('uses correct Portuguese for singular vs plural', () => {
    const annotations: ClaudeAnnotation[] = [
      { type: ClaudeAnnotationType.EDIT, text: 'new', originalText: 'old' },
      { type: ClaudeAnnotationType.EDIT, text: 'newer', originalText: 'older' },
      { type: ClaudeAnnotationType.EDIT, text: 'newest', originalText: 'oldest' },
    ];

    const result = generateSummary(annotations);
    expect(result).toContain('3 anotações');
    expect(result).toContain('3 edições'); // Plural
  });
});

describe('formatForPrompt', () => {
  test('formats empty export with placeholder', () => {
    const exportData = exportForClaude([]);

    const result = formatForPrompt(exportData);

    expect(result).toContain('# Anotações para Revisão');
    expect(result).toContain('Nenhuma anotação');
  });

  test('includes header and metadata', () => {
    const annotations: Annotation[] = [
      createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.COMMENT,
        author: 'test-user',
      }),
    ];

    const exportData = exportForClaude(annotations);
    const result = formatForPrompt(exportData);

    expect(result).toContain('# Anotações para Revisão');
    expect(result).toContain('Exportado em:');
  });

  test('includes Portuguese type labels', () => {
    const annotations: Annotation[] = [
      createAnnotation({ id: '1', createdA: 100, type: AnnotationType.DELETION }),
      createAnnotation({ id: '2', createdA: 100, type: AnnotationType.COMMENT }),
    ];

    const exportData = exportForClaude(annotations);
    const result = formatForPrompt(exportData);

    expect(result).toContain('🗑️ Exclusões');
    expect(result).toContain('💭 Comentários Individuais');
  });

  test('includes status labels in Portuguese', () => {
    const annotations: Annotation[] = [
      createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.COMMENT,
        status: AnnotationStatus.IN_PROGRESS,
      }),
    ];

    const exportData = exportForClaude(annotations);
    const result = formatForPrompt(exportData);

    expect(result).toContain('Em Progresso');
  });

  test('formats all annotation fields', () => {
    const annotations: Annotation[] = [
      createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.REPLACEMENT,
        text: 'new text',
        originalText: 'old text',
        author: 'test-user',
        status: AnnotationStatus.OPEN,
      }),
    ];

    const exportData = exportForClaude(annotations);
    const result = formatForPrompt(exportData);

    expect(result).toContain('**Tipo:** edit');
    expect(result).toContain('**Status:** Aberto');
    expect(result).toContain('**Autor:** test-user');
    expect(result).toContain('**Original:** "old text"');
    expect(result).toContain('**Texto:** "new text"');
  });

  test('groups annotations by type', () => {
    const annotations: Annotation[] = [
      createAnnotation({ id: '1', createdA: 100, type: AnnotationType.DELETION }),
      createAnnotation({ id: '2', createdA: 100, type: AnnotationType.DELETION }),
      createAnnotation({ id: '3', createdA: 100, type: AnnotationType.COMMENT }),
    ];

    const exportData = exportForClaude(annotations);
    const result = formatForPrompt(exportData);

    // Check that deletions are grouped under one header
    const deletionSectionStart = result.indexOf('🗑️ Exclusões');
    const commentSectionStart = result.indexOf('💭 Comentários Individuais');
    expect(deletionSectionStart).toBeLessThan(commentSectionStart);
  });

  test('handles comments correctly', () => {
    const annotations: Annotation[] = [
      createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.COMMENT,
        text: 'This is my comment',
        originalText: 'selected text',
      }),
    ];

    const exportData = exportForClaude(annotations);
    const result = formatForPrompt(exportData);

    expect(result).toContain('**Comentário:** "This is my comment"');
    expect(result).toContain('**Texto:** "selected text"');
  });

  test('handles global comments', () => {
    const annotations: Annotation[] = [
      createAnnotation({
        id: '1',
        createdA: 100,
        type: AnnotationType.GLOBAL_COMMENT,
        text: 'Overall document feedback',
        originalText: '',
      }),
    ];

    const exportData = exportForClaude(annotations);
    const result = formatForPrompt(exportData);

    expect(result).toContain('💬 Comentários Globais');
    expect(result).toContain('**Comentário:** "Overall document feedback"');
  });
});
