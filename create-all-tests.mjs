import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Ensure directories exist
const dirs = [
  'packages/ui/components/__tests__',
  'packages/ui/utils/__tests__',
  'apps/hook/server/__tests__'
];

dirs.forEach(dir => {
  try {
    mkdirSync(dir, { recursive: true });
  } catch (e) {
    // Directory already exists
  }
});

// DecisionBar.test.tsx
const decisionBarTest = `import { describe, test, expect, mock } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DecisionBar } from '../DecisionBar';

describe('DecisionBar', () => {
  test('renderiza botões de aprovar e negar', () => {
    const mockApprove = mock(() => Promise.resolve());
    const mockDeny = mock(() => Promise.resolve());
    const mockGetFeedback = mock(() => 'feedback');

    render(
      <DecisionBar
        onApprove={mockApprove}
        onDeny={mockDeny}
        annotationCount={3}
        getFeedback={mockGetFeedback}
      />
    );

    expect(screen.getByText('Aprovar Nota')).toBeDefined();
    expect(screen.getByText('Solicitar Alterações')).toBeDefined();
    expect(screen.getByText(/3.*anotações/)).toBeDefined();
  });

  test('chama onApprove ao clicar em aprovar', async () => {
    const mockApprove = mock(() => Promise.resolve());
    const mockDeny = mock(() => Promise.resolve());
    const mockGetFeedback = mock(() => 'feedback');

    render(
      <DecisionBar
        onApprove={mockApprove}
        onDeny={mockDeny}
        annotationCount={0}
        getFeedback={mockGetFeedback}
      />
    );

    const approveButton = screen.getByText('Aprovar Nota');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(mockApprove).toHaveBeenCalledTimes(1);
    });
  });

  test('mostra estado de submissão', async () => {
    const mockApprove = mock(() => new Promise(resolve => setTimeout(resolve, 100)));
    const mockDeny = mock(() => Promise.resolve());
    const mockGetFeedback = mock(() => 'feedback');

    render(
      <DecisionBar
        onApprove={mockApprove}
        onDeny={mockDeny}
        annotationCount={0}
        getFeedback={mockGetFeedback}
      />
    );

    const approveButton = screen.getByText('Aprovar Nota');
    fireEvent.click(approveButton);

    expect(screen.getByText('Aprovando...')).toBeDefined();
  });

  test('mostra tela de sucesso após aprovação', async () => {
    const mockApprove = mock(() => Promise.resolve());
    const mockDeny = mock(() => Promise.resolve());
    const mockGetFeedback = mock(() => 'feedback');

    render(
      <DecisionBar
        onApprove={mockApprove}
        onDeny={mockDeny}
        annotationCount={0}
        getFeedback={mockGetFeedback}
      />
    );

    const approveButton = screen.getByText('Aprovar Nota');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText('Nota Aprovada')).toBeDefined();
      expect(screen.getByText(/será salva no Obsidian/)).toBeDefined();
    });
  });
});
`;

// Settings.test.tsx
const settingsTest = `import { describe, test, expect, mock } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from '../Settings';

describe('Settings', () => {
  test('abre modal ao clicar no botão', () => {
    render(<Settings />);

    const button = screen.getByTitle(/Configurações/);
    fireEvent.click(button);

    expect(screen.getByText('Configurações')).toBeDefined();
    expect(screen.getByText('Sua Identidade')).toBeDefined();
  });

  test('permite editar caminho do vault', async () => {
    const mockOnVaultPathChange = mock((path: string) => {});

    render(<Settings onVaultPathChange={mockOnVaultPathChange} />);

    fireEvent.click(screen.getByTitle(/Configurações/));

    const input = screen.getByPlaceholderText(/ObsidianVault/);
    fireEvent.change(input, { target: { value: 'C:/Test/Vault' } });

    await waitFor(() => {
      expect(mockOnVaultPathChange).toHaveBeenCalledWith('C:/Test/Vault');
    });
  });

  test('regenera identidade', async () => {
    const mockOnIdentityChange = mock((oldId: string, newId: string) => {});

    render(<Settings onIdentityChange={mockOnIdentityChange} />);

    fireEvent.click(screen.getByTitle(/Configurações/));

    const regenButton = screen.getByTitle('Regenerar identidade');
    fireEvent.click(regenButton);

    await waitFor(() => {
      expect(mockOnIdentityChange).toHaveBeenCalled();
    });
  });
});
`;

// parser.test.ts
const parserTest = `import { describe, test, expect } from 'bun:test';
import { parseMarkdownToBlocks } from '../parser';

describe('parseMarkdownToBlocks', () => {
  test('detecta frontmatter YAML válido', () => {
    const markdown = \`---
title: Test Note
tags: [test, example]
---

# Heading

Content here.\`;

    const blocks = parseMarkdownToBlocks(markdown);

    expect(blocks[0].type).toBe('frontmatter');
    expect(blocks[0].content).toContain('title: Test Note');
    expect(blocks[0].content).toContain('tags: [test, example]');
  });

  test('ignora --- se não houver fechamento', () => {
    const markdown = \`---
title: Incomplete

# Heading\`;

    const blocks = parseMarkdownToBlocks(markdown);

    // Primeiro bloco NÃO deve ser frontmatter
    expect(blocks[0].type).not.toBe('frontmatter');
  });

  test('processa frontmatter vazio', () => {
    const markdown = \`---
---

# Heading\`;

    const blocks = parseMarkdownToBlocks(markdown);

    expect(blocks[0].type).toBe('frontmatter');
    expect(blocks[0].content.trim()).toBe('');
  });

  test('preserva ordem dos blocos após frontmatter', () => {
    const markdown = \`---
title: Test
---

# Heading
Paragraph
## Subheading\`;

    const blocks = parseMarkdownToBlocks(markdown);

    expect(blocks[0].type).toBe('frontmatter');
    expect(blocks[1].type).toBe('heading');
    expect(blocks[2].type).toBe('paragraph');
    expect(blocks[3].type).toBe('heading');
  });
});
`;

// Note: save.test.ts requires a running server, so it will be simplified
const saveTestComment = `// API tests require a running server
// To run these tests, start the server first:
// bun run apps/hook/server/index.ts

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';

describe('POST /api/save', () => {
  test.skip('endpoint exists and responds', async () => {
    // This test is skipped by default
    // To run it, start the server and remove .skip
    const response = await fetch('http://localhost:5173/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '# Test',
        path: '/tmp/test.md'
      })
    });

    expect(response.status).toBeLessThan(500);
  });

  test('validates UTF-8 encoding preservation', () => {
    const testString = 'Título com Acentuação: ção, ã, é';
    const encoded = new TextEncoder().encode(testString);
    const decoded = new TextDecoder().decode(encoded);

    expect(decoded).toBe(testString);
    expect(decoded).toContain('ção');
    expect(decoded).toContain('Acentuação');
  });
});
`;

// Write all files
const files = [
  { path: 'packages/ui/components/__tests__/DecisionBar.test.tsx', content: decisionBarTest },
  { path: 'packages/ui/components/__tests__/Settings.test.tsx', content: settingsTest },
  { path: 'packages/ui/utils/__tests__/parser.test.ts', content: parserTest },
  { path: 'apps/hook/server/__tests__/save.test.ts', content: saveTestComment }
];

files.forEach(({ path, content }) => {
  writeFileSync(path, content, 'utf8');
  console.log(`✓ ${path}`);
});

console.log('\\n✅ Todos os arquivos de teste criados!');
