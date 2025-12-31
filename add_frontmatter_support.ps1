# Add frontmatter support to parser.ts
$parser = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\utils\parser.ts' -Raw

# Replace the parseMarkdownToBlocks function with frontmatter support
$newParser = @"
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
        id: `block-`${currentId++}`,
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
        id: `block-`${currentId++}`,
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
        id: `block-`${currentId++}`,
        type: 'heading',
        content: trimmed.replace(/^#+\s*/, ''),
        level,
        order: currentId,
        startLine: currentLineNum
      });
      continue;
    }

    // Horizontal Rule (only if not at document start)
    if ((trimmed === '---' || trimmed === '***') && i > 0) {
      flush();
      blocks.push({
        id: `block-`${currentId++}`,
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
        id: `block-`${currentId++}`,
        type: 'list-item',
        content: trimmed.replace(/^(\*|-|\d+\.)\s/, ''),
        order: currentId,
        startLine: currentLineNum
      });
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith('>')) {
       flush();
       blocks.push({
         id: `block-`${currentId++}`,
         type: 'blockquote',
         content: trimmed.replace(/^>\s*/, ''),
         order: currentId,
         startLine: currentLineNum
       });
       continue;
    }

    // Code blocks
    if (trimmed.startsWith('```` + '```' + ````)) {
      flush();
      const codeStartLine = currentLineNum;
      const language = trimmed.slice(3).trim() || undefined;
      let codeContent = [];
      i++;
      while(i < lines.length && !lines[i].trim().startsWith('```` + '```' + ````)) {
        codeContent.push(lines[i]);
        i++;
      }
      blocks.push({
        id: `block-`${currentId++}`,
        type: 'code',
        content: codeContent.join('\n'),
        language,
        order: currentId,
        startLine: codeStartLine
      });
      continue;
    }

    // Tables
    if (trimmed.startsWith('|') || (trimmed.includes('|') && trimmed.match(/^\|?.+\|.+\|?`$/))) {
      flush();
      const tableStartLine = currentLineNum;
      const tableLines: string[] = [line];

      while (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.startsWith('|') || (nextLine.includes('|') && nextLine.match(/^\|?.+\|.+\|?`$/))) {
          i++;
          tableLines.push(lines[i]);
        } else {
          break;
        }
      }

      blocks.push({
        id: `block-`${currentId++}`,
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
    return 'No changes detected.';
  }

  const sortedAnns = [...annotations].sort((a, b) => {
    const blockA = blocks.findIndex(blk => blk.id === a.blockId);
    const blockB = blocks.findIndex(blk => blk.id === b.blockId);
    if (blockA !== blockB) return blockA - blockB;
    return a.startOffset - b.startOffset;
  });

  let output = `# Plan Feedback\n\n`;
  output += `I've reviewed this plan and have `${annotations.length}` piece`${annotations.length > 1 ? 's' : ''}` of feedback:\n\n`;

  sortedAnns.forEach((ann, index) => {
    const block = blocks.find(b => b.id === ann.blockId);

    output += `## `${index + 1}`. `;

    switch (ann.type) {
      case 'DELETION':
        output += `Remove this\n`;
        output += ````\n`${ann.originalText}\`n````\n`;
        output += `> I don't want this in the plan.\n`;
        break;

      case 'INSERTION':
        output += `Add this\n`;
        output += ````\n`${ann.text}\`n````\n`;
        break;

      case 'REPLACEMENT':
        output += `Change this\n`;
        output += `**From:**\n````\n`${ann.originalText}\`n````\n`;
        output += `**To:**\n````\n`${ann.text}\`n````\n`;
        break;

      case 'COMMENT':
        output += `Feedback on: "`${ann.originalText}`"\n`;
        output += `> `${ann.text}\`n`;
        break;
    }

    output += '\n';
  });

  output += `---\n`;

  return output;
};
"@

$newParser | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\utils\parser.ts' -Encoding utf8 -NoNewline
Write-Host 'Frontmatter support added to parser.ts'
