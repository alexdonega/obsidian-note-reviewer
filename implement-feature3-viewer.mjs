import { readFileSync, writeFileSync } from 'fs';

const filePath = 'packages/ui/components/Viewer.tsx';

try {
  let content = readFileSync(filePath, 'utf8');

  // 1. Find and add FrontmatterEditor import after other imports
  // Look for the last import statement
  const lastImportMatch = content.match(/import [^;]+;(?=\n\n)/);
  if (lastImportMatch) {
    const importToAdd = `\nimport { FrontmatterEditor } from './FrontmatterEditor';`;
    content = content.replace(lastImportMatch[0], lastImportMatch[0] + importToAdd);
  }

  // 2. Update ViewerProps interface to include onBlockChange
  // Find the ViewerProps interface
  const viewerPropsPattern = /(export interface ViewerProps \{[^}]+)/;
  if (content.match(viewerPropsPattern)) {
    content = content.replace(
      viewerPropsPattern,
      (match) => match + `\n  onBlockChange?: (blocks: Block[]) => void;`
    );
  }

  // 3. Update BlockRenderer to accept additional props
  const oldBlockRenderer = `const BlockRenderer: React.FC<{ block: Block }> = ({ block }) => {`;
  const newBlockRenderer = `const BlockRenderer: React.FC<{
  block: Block;
  blocks: Block[];
  onBlockChange?: (blocks: Block[]) => void;
}> = ({ block, blocks, onBlockChange }) => {`;

  content = content.replace(oldBlockRenderer, newBlockRenderer);

  // 4. Replace the frontmatter case
  const oldFrontmatterCase = `  switch (block.type) {    case 'frontmatter':
      return (
        <div
          className="mb-6 p-4 bg-muted/30 border border-border/30 rounded-lg"
          data-block-id={block.id}
        >
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
            Frontmatter YAML
          </div>
          <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
            {block.content}
          </pre>
        </div>
      );`;

  const newFrontmatterCase = `  switch (block.type) {
    case 'frontmatter':
      return (
        <FrontmatterEditor
          key={block.id}
          blockId={block.id}
          content={block.content}
          onChange={(newContent) => {
            if (onBlockChange) {
              const updatedBlocks = blocks.map(b =>
                b.id === block.id ? { ...b, content: newContent } : b
              );
              onBlockChange(updatedBlocks);
            }
          }}
        />
      );`;

  content = content.replace(oldFrontmatterCase, newFrontmatterCase);

  // 5. Update all BlockRenderer usages to pass blocks and onBlockChange
  // Find where BlockRenderer is used (typically <BlockRenderer block={...} />)
  // This is complex, so let's find the pattern
  const blockRendererUsagePattern = /<BlockRenderer block=\{([^}]+)\} \/>/g;
  content = content.replace(blockRendererUsagePattern, (match, blockVar) => {
    return `<BlockRenderer block={${blockVar}} blocks={blocks} onBlockChange={onBlockChange} />`;
  });

  writeFileSync(filePath, content, 'utf8');
  console.log('✓ Viewer.tsx atualizado com FrontmatterEditor');
  console.log('  - Import FrontmatterEditor adicionado');
  console.log('  - ViewerProps interface expandida');
  console.log('  - BlockRenderer atualizado para aceitar blocks e onBlockChange');
  console.log('  - Caso frontmatter substituído por FrontmatterEditor');
  console.log('  - Usos de BlockRenderer atualizados');
} catch (err) {
  console.error('✗ Erro:', err.message);
  console.error(err.stack);
  process.exit(1);
}
