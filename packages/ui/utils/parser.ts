import { Block } from '../types';

/**
 * A simplified markdown parser that splits content into linear blocks.
 * Supports YAML frontmatter at the beginning of documents.
 */
export const parseMarkdownToBlocks = (markdown: string): Block[] => {
  const lines = markdown.split('\n');
  const blocks: Block[] = [];
  let currentId = 0;
  let lineIndex = 0;

  // Check for YAML frontmatter at the start
  if (lines[0]?.trim() === '---') {
    const frontmatterLines: string[] = [];
    lineIndex = 1; // Skip first ---

    while (lineIndex < lines.length && lines[lineIndex]?.trim() !== '---') {
      frontmatterLines.push(lines[lineIndex]);
      lineIndex++;
    }

    if (lineIndex < lines.length && lines[lineIndex]?.trim() === '---') {
      // Valid frontmatter found
      blocks.push({
        id: `block-${currentId++}`,
        type: 'frontmatter',
        content: frontmatterLines.join('\n'),
        order: currentId,
        startLine: 1
      });
      lineIndex++; // Skip closing ---
    } else {
      // Invalid frontmatter, reset
      lineIndex = 0;
    }
  }

  let buffer: string[] = [];
  let currentType: Block['type'] = 'paragraph';
  let currentLevel = 0;
  let bufferStartLine = lineIndex + 1;

  const flush = () => {
    if (buffer.length > 0) {
      const content = buffer.join('\n');
      blocks.push({
        id: `block-${currentId++}`,
        type: currentType,
        content: content,
        level: currentLevel,
        order: currentId,
        startLine: bufferStartLine
      });
      buffer = [];
    }
  };

  for (let i = lineIndex; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const currentLineNum = i + 1;

    // Headings
    if (trimmed.startsWith('#')) {
      flush();
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      blocks.push({
        id: `block-${currentId++}`,
        type: 'heading',
        content: trimmed.replace(/^#+\s*/, ''),
        level,
        order: currentId,
        startLine: currentLineNum
      });
      continue;
    }

    // Horizontal Rule (only after frontmatter)
    if ((trimmed === '---' || trimmed === '***') && i > lineIndex) {
      flush();
      blocks.push({
        id: `block-${currentId++}`,
        type: 'hr',
        content: '',
        order: currentId,
        startLine: currentLineNum
      });
      continue;
    }

    // List Items
    if (trimmed.match(/^(\*|-|\d+\.)\s/)) {
      flush();
      blocks.push({
        id: `block-${currentId++}`,
        type: 'list-item',
        content: trimmed.replace(/^(\*|-|\d+\.)\s/, ''),
        order: currentId,
        startLine: currentLineNum
      });
      continue;
    }

    // Callouts and Blockquotes
    if (trimmed.startsWith('>')) {
       flush();
       // Regex para detectar callout: > [!tipo]+/- Título opcional
       const calloutMatch = trimmed.match(/^>\s*\[!([^\]]+)\]([+-])?\s*(.*)/);

       if (calloutMatch) {
         // É um callout!
         const [_, calloutType, collapseIndicator, title] = calloutMatch;
         const calloutStartLine = currentLineNum;

         // Coletar todas as linhas do callout
         const calloutLines: string[] = [];

         // Continuar enquanto a próxima linha começar com >
         while (i + 1 < lines.length) {
           const nextLine = lines[i + 1].trim();
           if (nextLine.startsWith('>')) {
             i++;
             calloutLines.push(nextLine.replace(/^>\s*/, ''));
           } else {
             break;
           }
         }

         blocks.push({
           id: `block-${currentId++}`,
           type: 'callout',
           content: calloutLines.join('\n'),
           calloutType: calloutType.toLowerCase(),
           calloutTitle: title || undefined,
           isCollapsible: !!collapseIndicator,
           defaultCollapsed: collapseIndicator === '-',
           order: currentId,
           startLine: calloutStartLine
         });
       } else {
         // Blockquote normal (sem [!tipo])
         blocks.push({
           id: `block-${currentId++}`,
           type: 'blockquote',
           content: trimmed.replace(/^>\s*/, ''),
           order: currentId,
           startLine: currentLineNum
         });
       }
       continue;
    }

    // Code blocks
    if (trimmed.startsWith('```')) {
      flush();
      const codeStartLine = currentLineNum;
      const language = trimmed.slice(3).trim() || undefined;
      let codeContent = [];
      i++;
      while(i < lines.length && !lines[i].trim().startsWith('```')) {
        codeContent.push(lines[i]);
        i++;
      }
      blocks.push({
        id: `block-${currentId++}`,
        type: 'code',
        content: codeContent.join('\n'),
        language,
        order: currentId,
        startLine: codeStartLine
      });
      continue;
    }

    // Tables
    if (trimmed.startsWith('|') || (trimmed.includes('|') && trimmed.match(/^\|?.+\|.+\|?$/))) {
      flush();
      const tableStartLine = currentLineNum;
      const tableLines: string[] = [line];

      while (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.startsWith('|') || (nextLine.includes('|') && nextLine.match(/^\|?.+\|.+\|?$/))) {
          i++;
          tableLines.push(lines[i]);
        } else {
          break;
        }
      }

      blocks.push({
        id: `block-${currentId++}`,
        type: 'table',
        content: tableLines.join('\n'),
        order: currentId,
        startLine: tableStartLine
      });
      continue;
    }

    // Empty lines
    if (trimmed === '') {
      flush();
      currentType = 'paragraph';
      continue;
    }

    // Paragraph text
    if (buffer.length === 0) {
      bufferStartLine = currentLineNum;
    }
    buffer.push(line);
  }

  flush();

  return blocks;
};

export const exportDiff = (blocks: Block[], annotations: any[]): string => {
  if (annotations.length === 0) {
    return 'Nota aprovada sem alterações';
  }

  // Separate global comments from text annotations
  const globalComments = annotations.filter(ann => ann.isGlobal);
  const textAnnotations = annotations.filter(ann => !ann.isGlobal);

  const sortedAnns = [...textAnnotations].sort((a, b) => {
    const blockA = blocks.findIndex(blk => blk.id === a.blockId);
    const blockB = blocks.findIndex(blk => blk.id === b.blockId);
    if (blockA !== blockB) return blockA - blockB;
    return a.startOffset - b.startOffset;
  });

  let output = `SOLICITAÇÃO DE ALTERAÇÕES:\n\n`;

  // Global Comments Section
  if (globalComments.length > 0) {
    output += `🌐 COMENTÁRIOS GLOBAIS:\n\n`;
    globalComments.forEach((ann) => {
      const author = ann.author ? `[${ann.author}]` : '[Anônimo]';
      output += `${author}: ${ann.text}\n\n`;
    });

    // Add separator if there are also text annotations
    if (sortedAnns.length > 0) {
      output += `---\n\n📝 ANOTAÇÕES NO TEXTO:\n\n`;
    }
  }

  // Text Annotations Section
  sortedAnns.forEach((ann) => {
    const blockIndex = blocks.findIndex(b => b.id === ann.blockId);
    const lineNumber = blockIndex >= 0 ? `Linha ${blockIndex + 1}` : "Localização";

    output += `## ${lineNumber}\n`;

    switch (ann.type) {
      case 'DELETION':
        output += `❌ DELETAR: "${ann.originalText}"\n`;
        break;

      case 'INSERTION':
        output += `➕ ADICIONAR: "${ann.text}"\n`;
        break;

      case 'REPLACEMENT':
        output += `🔄 SUBSTITUIR: "${ann.originalText}"\n`;
        output += `Por: "${ann.text}"\n`;
        break;

      case 'COMMENT':
        output += `💬 COMENTÁRIO sobre: "${ann.originalText}"\n`;
        output += `Sugestão: ${ann.text}\n`;
        break;

      case 'GLOBAL_COMMENT':
        // This shouldn't happen as we filtered them out, but just in case
        output += `🌐 COMENTÁRIO GLOBAL: ${ann.text}\n`;
        break;
    }

    output += '\n';
  });

  return output;
};