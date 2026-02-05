import React, { useState, useEffect, useMemo, useRef } from 'react';
import { parseMarkdownToBlocks, exportDiff } from '@obsidian-note-reviewer/ui/utils/parser';
import { Viewer, ViewerHandle } from '@obsidian-note-reviewer/ui/components/Viewer';
import { ViewerSkeleton } from '@obsidian-note-reviewer/ui/components/ViewerSkeleton';
import { AnnotationPanel } from '@obsidian-note-reviewer/ui/components/AnnotationPanel';
import { ExportModal } from '@obsidian-note-reviewer/ui/components/ExportModal';
import { GlobalCommentInput } from '@obsidian-note-reviewer/ui/components/GlobalCommentInput';
import { Annotation, Block, EditorMode, AnnotationType } from '@obsidian-note-reviewer/ui/types';
import { ThemeProvider, useTheme } from '@obsidian-note-reviewer/ui/components/ThemeProvider';
import { ModeToggle } from '@obsidian-note-reviewer/ui/components/ModeToggle';
import { ModeSwitcher } from '@obsidian-note-reviewer/ui/components/ModeSwitcher';
import { SettingsPanel } from '@obsidian-note-reviewer/ui/components/SettingsPanel';
import { useSharing } from '@obsidian-note-reviewer/ui/hooks/useSharing';
import {
  storage,
  getVaultPath,
  getNotePath,
  setVaultPath,
  setNotePath,
  getNoteType,
  saveAnnotations,
  loadAnnotations
} from '@obsidian-note-reviewer/ui/utils/storage';
import { isInputFocused, formatTooltipWithShortcut } from '@obsidian-note-reviewer/ui/utils/shortcuts';
import { type TipoNota } from '@obsidian-note-reviewer/ui/utils/notePaths';

const PLAN_CONTENT = `---
title: Obsidian Note Reviewer - Guia de Teste
author: Alex Donega
tags: [obsidian, review, annotation, teste]
created: 2025-12-31
status: draft
priority: high
version: 0.2.1
---

# Obsidian Note Reviewer - Guia de Teste

## Sobre o Projeto

O **Obsidian Note Reviewer** é uma ferramenta web para revisar e anotar documentos markdown do Obsidian de forma colaborativa. Este projeto é um fork do Obsidian Note Reviewer, adaptado especificamente para integração com vaults Obsidian.

## Funcionalidades Principais

### 1. Editor de Frontmatter YAML
Você pode editar o frontmatter YAML diretamente na interface:
- Clique no botão "Editar" que aparece ao passar o mouse sobre o bloco YAML
- Faça suas alterações
- A validação em tempo real garante que o YAML esteja correto
- Salve ou cancele conforme necessário

### 2. Sistema de Anotações
Selecione qualquer texto neste documento para adicionar anotações:
- **Comentários**: Adicione observações e sugestões
- **Highlights**: Marque trechos importantes
- **Feedback estruturado**: Organize suas revisões de forma clara

### 3. Salvar no Vault
Configure o caminho do seu vault nas configurações:
1. Clique no ícone de configurações (engrenagem)
2. Insira o **Caminho do Vault** (ex: \`C:/Users/Alex/Documents/ObsidianVault\`)
3. Insira o **Caminho da Nota** (ex: \`projetos/note-reviewer-teste.md\`)
4. Clique em "Salvar no Vault" para salvar esta nota editada

### 4. Modos de Visualização
- **Modo Autor**: Para criar e editar conteúdo
- **Modo Revisor**: Para adicionar anotações e feedback
- **Modo Visualização**: Para ver anotações compartilhadas

## Recursos Técnicos

### Arquitetura
\`\`\`
obsidian-note-reviewer/
├── apps/hook/          # Servidor local com API REST
├── packages/
│   ├── editor/         # Componente principal App.tsx
│   └── ui/             # Componentes React reutilizáveis
└── docs/               # Documentação
\`\`\`

### Stack Tecnológica
- **Runtime**: Bun
- **Framework**: React + TypeScript
- **Build**: Vite com plugin singlefile
- **Parsing**: Remark/Unified para markdown
- **Validação YAML**: js-yaml
- **Testes**: Bun test + React Testing Library

### API Endpoints
O servidor local expõe:
- \`POST /api/save\` - Salva nota no filesystem
- \`GET /api/share/:hash\` - Recupera nota compartilhada
- \`POST /api/share\` - Cria link de compartilhamento

## Melhorias Implementadas (v0.1 → v0.2.1)

### Da Upstream (Obsidian Note Reviewer)
1. ✅ Verificação automática de atualizações
2. ✅ Exibição dinâmica da versão
3. ✅ Correção de URLs de compartilhamento
4. ✅ Melhorias na restauração de anotações

### Customizações para Obsidian
1. ✅ **Tradução completa para português brasileiro**
2. ✅ **Botão "Salvar no Vault"** com feedback visual
3. ✅ **Configuração de caminhos** persistente via cookies
4. ✅ **Editor de frontmatter YAML** com validação
5. ✅ **Documentação de integração MCP** para Claude Code
6. ✅ **Suite de testes automatizados** com cobertura >80%

## Como Testar Esta Nota

### Passo 1: Carregar a Nota
1. Abra o Obsidian Note Reviewer no navegador
2. Esta nota deve carregar automaticamente
3. Verifique se o frontmatter YAML está sendo exibido corretamente

### Passo 2: Testar Edição de Frontmatter
1. Passe o mouse sobre o bloco YAML no topo
2. Clique em "Editar"
3. Altere o valor de \`status\` para \`in-review\`
4. Salve e veja a mudança refletida

### Passo 3: Adicionar Anotações
1. Selecione este texto: **"Este é um texto importante para revisão"**
2. Adicione um comentário: "Concordo, muito relevante!"
3. Veja a anotação aparecer na barra lateral

### Passo 4: Salvar no Vault
1. Abra as configurações (ícone de engrenagem)
2. Configure:
   - Caminho do Vault: seu diretório Obsidian
   - Caminho da Nota: \`testes/note-reviewer-exemplo.md\`
3. Clique em "Salvar no Vault"
4. Abra o Obsidian e verifique se a nota foi criada

## Casos de Uso

### Para Autores
- Escreva notas markdown com frontmatter rico
- Receba feedback estruturado de revisores
- Mantenha histórico de revisões

### Para Revisores
- Adicione anotações contextuais
- Sugira melhorias diretamente no texto
- Aprove ou solicite alterações

### Para Equipes
- Compartilhe notas via URL
- Colabore de forma assíncrona
- Integre com workflows existentes do Obsidian

## Atalhos e Dicas

| Ação | Como Fazer |
|------|------------|
| Adicionar anotação | Selecione texto + clique no popup |
| Editar frontmatter | Hover sobre YAML + "Editar" |
| Salvar no vault | Botão "Salvar no Vault" (após configurar) |
| Ver anotações | Painel lateral direito |
| Mudar modo | Toggle Autor/Revisor no header |

## Próximos Passos

Após testar esta nota, você pode:
1. **Criar suas próprias notas** markdown com frontmatter customizado
2. **Integrar com seu vault** usando os caminhos configurados
3. **Compartilhar com revisores** gerando links de compartilhamento
4. **Explorar a integração MCP** (veja \`docs/OBSIDIAN_INTEGRATION.md\`)

## Suporte e Documentação

- **Repositório**: \`C:/dev/obsidian-note-reviewer\`
- **Docs**: \`docs/OBSIDIAN_INTEGRATION.md\`
- **Testes**: Execute \`bun test\` para ver cobertura

## Teste de Ferramentas de Desenho

A imagem abaixo pode ser usada para testar as novas ferramentas de desenho:

![Diagrama de Arquitetura](https://via.placeholder.com/800x400/6366f1/ffffff?text=Diagrama+de+Arquitetura+-+Teste+de+Desenho)

### Como testar o desenho sobre a imagem:

1. **Navegação por Teclado**:
   - Pressione \`j\` ou \`k\` para navegar entre os blocos
   - Pressione \`Enter\` para focar no bloco da imagem
   - Pressione \`Escape\` para limpar a seleção

2. **Ferramentas de Desenho**:
   - Passe o mouse sobre a imagem acima
   - A toolbar de desenho aparecerá no topo
   - Pressione \`1\` para **Caneta** - desenho à mão livre
   - Pressione \`2\` para **Seta** - indicar direções
   - Pressione \`3\` para **Círculo** - destacar áreas
   - Escolha cores e tamanhos diferentes
   - Use \`Ctrl+Z\` para desfazer

3. **Exportar**:
   - Clique no ícone de download para salvar a imagem anotada

---

**Nota**: Esta é uma nota de exemplo criada especificamente para testar todas as funcionalidades do Obsidian Note Reviewer. Sinta-se livre para editá-la, anotá-la e salvá-la no seu vault!
`;

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState(PLAN_CONTENT);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [savePath, setSavePath] = useState<string>(() => {
    // Use note path directly
    const note = getNotePath();
    return note || '';
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // History for undo (Ctrl+Z)
  const [annotationHistory, setAnnotationHistory] = useState<string[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showExport, setShowExport] = useState(false);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [showGlobalCommentModal, setShowGlobalCommentModal] = useState(false);
  const [showHelpVideo, setShowHelpVideo] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('selection');

  const [isApiMode, setIsApiMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<'approved' | 'denied' | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isFullEditMode, setIsFullEditMode] = useState(false);
  const [fullEditContent, setFullEditContent] = useState('');
  const viewerRef = useRef<ViewerHandle>(null);
  const headerRef = useRef<HTMLElement>(null);
  const fullEditTextareaRef = useRef<HTMLTextAreaElement>(null);

  // URL-based sharing
  const {
    isSharedSession,
    isLoadingShared,
    shareUrl,
    shareUrlSize,
    pendingSharedAnnotations,
    clearPendingSharedAnnotations,
  } = useSharing(
    markdown,
    annotations,
    setMarkdown,
    setAnnotations,
    () => {
      // When loaded from share, mark as loaded
      setIsLoading(false);
    }
  );

  // Track if annotations were loaded from localStorage to avoid re-saving immediately
  const [annotationsLoadedFromStorage, setAnnotationsLoadedFromStorage] = useState(false);

  // Apply shared annotations to DOM after they're loaded
  useEffect(() => {
    if (pendingSharedAnnotations && pendingSharedAnnotations.length > 0) {
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        // Clear existing highlights first (important when loading new share URL)
        viewerRef.current?.clearAllHighlights();
        viewerRef.current?.applySharedAnnotations(pendingSharedAnnotations);
        clearPendingSharedAnnotations();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pendingSharedAnnotations, clearPendingSharedAnnotations]);

  // Load annotations from localStorage when markdown is ready (and not from share)
  useEffect(() => {
    if (isLoading || isLoadingShared || isSharedSession) return;

    const storedAnnotations = loadAnnotations(markdown);
    if (storedAnnotations && Array.isArray(storedAnnotations) && storedAnnotations.length > 0) {
      // Validate and set annotations
      setAnnotations(storedAnnotations as Annotation[]);
      setAnnotationsLoadedFromStorage(true);

      // Apply highlights after a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        viewerRef.current?.clearAllHighlights();
        viewerRef.current?.applySharedAnnotations(storedAnnotations as Annotation[]);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [markdown, isLoading, isLoadingShared, isSharedSession]);

  // Save annotations to localStorage when they change
  useEffect(() => {
    // Don't save if we just loaded from storage (prevents unnecessary writes)
    if (annotationsLoadedFromStorage) {
      setAnnotationsLoadedFromStorage(false);
      return;
    }

    // Don't save during initial load or if loaded from share URL
    if (isLoading || isLoadingShared) return;

    // Save annotations (including empty array to clear previous state)
    saveAnnotations(markdown, annotations);
  }, [annotations, markdown, isLoading, isLoadingShared, annotationsLoadedFromStorage]);

  // Intersection Observer for sticky bar - shows when header is out of viewport
  useEffect(() => {
    if (!headerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when header is NOT visible (threshold 0 means any part visible)
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);


  // Check if we're in API mode (served from Bun hook server)
  // Skip if we loaded from a shared URL
  useEffect(() => {
    if (isLoadingShared) return; // Wait for share check to complete
    if (isSharedSession) return; // Already loaded from share

    fetch('/api/plan')
      .then(res => {
        if (!res.ok) throw new Error('Not in API mode');
        return res.json();
      })
      .then((data: { plan: string }) => {
        setMarkdown(data.plan);
        setIsApiMode(true);
      })
      .catch(() => {
        // Not in API mode - use default content
        setIsApiMode(false);
      })
      .finally(() => setIsLoading(false));
  }, [isLoadingShared, isSharedSession]);

  // Parse markdown with optional skeleton display for large content
  // Uses a threshold to avoid skeleton flash for fast parsing
  useEffect(() => {
    // Skip if still doing initial load (skeleton already shown)
    if (isLoading || isLoadingShared) {
      setBlocks(parseMarkdownToBlocks(markdown));
      return;
    }

    // For subsequent content changes, check if content is potentially large
    // Large content threshold: ~10KB of markdown typically takes noticeable time
    const LARGE_CONTENT_THRESHOLD = 10000;
    const PARSING_SKELETON_DELAY = 50; // ms before showing skeleton

    if (markdown.length < LARGE_CONTENT_THRESHOLD) {
      // Small content: parse immediately without skeleton
      setBlocks(parseMarkdownToBlocks(markdown));
      return;
    }

    // Large content: show skeleton if parsing takes longer than threshold
    let showSkeletonTimeout: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;

    // Schedule showing skeleton after delay (if parsing is slow)
    showSkeletonTimeout = setTimeout(() => {
      if (!isCancelled) {
        setIsParsing(true);
      }
    }, PARSING_SKELETON_DELAY);

    // Defer parsing to next frame to allow skeleton to display
    requestAnimationFrame(() => {
      if (isCancelled) return;

      const newBlocks = parseMarkdownToBlocks(markdown);

      // Clear timeout and hide skeleton
      if (showSkeletonTimeout) {
        clearTimeout(showSkeletonTimeout);
      }
      setIsParsing(false);
      setBlocks(newBlocks);
    });

    return () => {
      isCancelled = true;
      if (showSkeletonTimeout) {
        clearTimeout(showSkeletonTimeout);
      }
      setIsParsing(false);
    };
  }, [markdown, isLoading, isLoadingShared]);

  // Load file from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filePath = params.get('file');

    if (filePath) {
      fetch(`/api/load?path=${encodeURIComponent(filePath)}`)
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.content) {
            const newBlocks = parseMarkdownToBlocks(data.content);
            setBlocks(newBlocks);
            console.log('✅ Nota carregada:', filePath);
          } else {
            console.error('❌ Erro ao carregar nota:', data.error);
          }
        })
        .catch(err => {
          console.error('❌ Erro ao carregar nota:', err);
        });
    }
  }, []);

  // Ctrl+Z to undo last annotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (annotationHistory.length > 0) {
          const lastAnnotationId = annotationHistory[annotationHistory.length - 1];
          // Remove annotation
          setAnnotations(prev => prev.filter(a => a.id !== lastAnnotationId));
          // Remove from history
          setAnnotationHistory(prev => prev.slice(0, -1));
          // Remove highlight from viewer
          viewerRef.current?.removeHighlight(lastAnnotationId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [annotationHistory]);

  // Global keyboard shortcuts for main actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when focused on input/textarea elements
      if (isInputFocused()) return;

      // Number keys for editor modes (1-4)
      if (!e.ctrlKey && !e.metaKey && e.key === '1') {
        e.preventDefault();
        setEditorMode('selection');
      }
      if (!e.ctrlKey && !e.metaKey && e.key === '2') {
        e.preventDefault();
        setEditorMode('edit');
      }
      if (!e.ctrlKey && !e.metaKey && e.key === '3') {
        e.preventDefault();
        handleEnterFullEditMode();
      }
      if (!e.ctrlKey && !e.metaKey && e.key === '4') {
        e.preventDefault();
        setEditorMode('redline');
      }

      // C for global comment (without modifiers)
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setShowGlobalCommentModal(true);
      }

      // E for export (without modifiers)
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        setShowExport(true);
      }

      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 's') {
        e.preventDefault();
        if (savePath) handleSaveToVault();
      }

      // Ctrl+L to share (copy link)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'l') {
        e.preventDefault();
        if (shareUrl) {
          navigator.clipboard.writeText(shareUrl);
        }
      }

      // ? to open settings (shortcuts tab)
      if (e.key === '?') {
        e.preventDefault();
        setIsSettingsPanelOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [savePath, editorMode, shareUrl]);

  // Full edit mode keyboard shortcuts
  useEffect(() => {
    if (!isFullEditMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelFullEdit();
      }
      // Ctrl+Enter or Cmd+Enter to save
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSaveFullEdit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullEditMode, fullEditContent]);

  // API mode handlers
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/approve', { method: 'POST' });
      setSubmitted('approved');
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleDeny = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: diffOutput })
      });
      setSubmitted('denied');
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleAddAnnotation = (ann: Annotation) => {
    setAnnotations(prev => [...prev, ann]);
    setSelectedAnnotationId(ann.id);
    setIsPanelOpen(true);
    // Add to history for undo (Ctrl+Z)
    setAnnotationHistory(prev => [...prev, ann.id]);
  };

  const handleDeleteAnnotation = (id: string) => {
    viewerRef.current?.removeHighlight(id);
    setAnnotations(prev => prev.filter(a => a.id !== id));
    if (selectedAnnotationId === id) setSelectedAnnotationId(null);
  };

  const handleSelectAnnotation = (id: string | null) => {
    setSelectedAnnotationId(id);

    if (id) {
      // Find the highlighted element in the document
      const element = document.querySelector(`[data-bind-id="${id}"]`) as HTMLElement;
      if (element) {
        // Scroll to the element
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Add a brief highlight animation
        element.classList.add('annotation-flash');
        setTimeout(() => {
          element.classList.remove('annotation-flash');
        }, 1500);
      }
    }
  };

  const handleAddGlobalComment = (comment: string, author: string) => {
    const newAnnotation: Annotation = {
      id: `global-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      blockId: '', // Not tied to a specific block
      startOffset: 0,
      endOffset: 0,
      type: AnnotationType.GLOBAL_COMMENT,
      text: comment,
      originalText: '', // No selected text
      createdA: Date.now(),
      author,
      isGlobal: true,
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setSelectedAnnotationId(newAnnotation.id);
    setIsPanelOpen(true);
    setAnnotationHistory(prev => [...prev, newAnnotation.id]);
  };

  const handleVaultPathChange = (vaultPath: string) => {
    const notePath = getNotePath();
    if (vaultPath && notePath) {
      setSavePath(`${vaultPath}/${notePath}`);
    } else {
      setSavePath('');
    }
  };

  const handleNotePathChange = (notePath: string) => {
    setSavePath(notePath);
  };

  const handleIdentityChange = (oldIdentity: string, newIdentity: string) => {
    setAnnotations(prev => prev.map(ann =>
      ann.author === oldIdentity ? { ...ann, author: newIdentity } : ann
    ));
  };

  const handleNoteTypeChange = (tipo: TipoNota) => {
    // Just save the type, path comes from handleNotePathChange
  };

  const handleNoteNameChange = (name: string) => {
    // Note name is handled via handleNotePathChange
  };

  const reconstructMarkdownFromBlocks = (blocks: Block[]): string => {
    return blocks.map(block => {
      if (block.type === 'frontmatter') {
        return `---\n${block.content}\n---`;
      }
      return block.content;
    }).join('\n\n');
  };

  // Full edit mode handlers
  const handleEnterFullEditMode = () => {
    // Reconstruct markdown from blocks
    const currentMarkdown = reconstructMarkdownFromBlocks(blocks);
    setFullEditContent(currentMarkdown);
    setIsFullEditMode(true);
    // Focus textarea after render
    setTimeout(() => {
      if (fullEditTextareaRef.current) {
        fullEditTextareaRef.current.focus();
        fullEditTextareaRef.current.setSelectionRange(0, 0);
      }
    }, 100);
  };

  const handleSaveFullEdit = () => {
    // Update markdown and reparse blocks
    setMarkdown(fullEditContent);
    const newBlocks = parseMarkdownToBlocks(fullEditContent);
    setBlocks(newBlocks);
    setIsFullEditMode(false);
  };

  const handleCancelFullEdit = () => {
    setIsFullEditMode(false);
    setFullEditContent('');
  };

  // State for showing copy feedback toast
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleSaveToVault = async () => {
    if (!savePath.trim()) {
      setSaveError('Configure o caminho nas configurações');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // CASO 1: TEM ANOTAÇÕES → Fazer Alterações (deny com feedback)
      if (annotations.length > 0) {
        console.log('🟠 Solicitando alterações com', annotations.length, 'anotações');

        if (isApiMode) {
          // Envia feedback para Claude Code
          await fetch('/api/deny', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback: diffOutput })
          });
          setSubmitted('denied');
          console.log('✅ Alterações solicitadas ao Claude Code!');
        } else {
          // FALLBACK: Não está em API mode - copiar diff para clipboard
          try {
            await navigator.clipboard.writeText(diffOutput);
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 3000);
            console.log('📋 Diff copiado para clipboard!');
          } catch (clipboardError) {
            console.error('❌ Erro ao copiar para clipboard:', clipboardError);
            setSaveError('Erro ao copiar alterações para clipboard');
          }
        }
        return;
      }

      // CASO 2: SEM ANOTAÇÕES → Salvar no Obsidian e Aprovar
      console.log('🟣 Salvando nota no Obsidian...');

      const content = reconstructMarkdownFromBlocks(blocks);
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          path: savePath
        })
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Erro ao salvar');
      }

      console.log('✅ Nota salva com sucesso:', savePath);

      // Se estiver em API mode, também aprovar automaticamente
      if (isApiMode) {
        console.log('🎯 Aprovando automaticamente...');
        try {
          await fetch('/api/approve', { method: 'POST' });
          setSubmitted('approved');
          console.log('✅ Aprovado com sucesso!');
        } catch (approveError) {
          console.error('⚠️ Erro ao aprovar:', approveError);
          // Não falha se aprovação der erro - nota já foi salva
        }
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsSaving(false);
    }
  };

  const diffOutput = useMemo(() => exportDiff(blocks, annotations), [blocks, annotations]);

  // Theme shortcut component (must be inside ThemeProvider)
  const ThemeShortcut = () => {
    const { theme, setTheme } = useTheme();

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (isInputFocused()) return;

        // D for dark/light toggle
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && (e.key === 'd' || e.key === 'D')) {
          e.preventDefault();
          // Toggle between light and dark
          const newTheme = theme === 'dark' ? 'light' : 'dark';
          setTheme(newTheme);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [theme, setTheme]);

    return null;
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <ThemeShortcut />
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Show ONLY Settings when open */}
        {isSettingsPanelOpen ? (
          <SettingsPanel
            isOpen={isSettingsPanelOpen}
            onClose={() => setIsSettingsPanelOpen(false)}
            onIdentityChange={handleIdentityChange}
            onNoteTypeChange={handleNoteTypeChange}
            onNotePathChange={handleNotePathChange}
            onNoteNameChange={handleNoteNameChange}
          />
        ) : (
          <>
        {/* Minimal Header */}
        <header ref={headerRef} className="h-12 flex items-center justify-between px-2 md:px-4 border-b border-border/50 bg-card/50 backdrop-blur-xl z-50">
          <div className="flex items-center gap-2 md:gap-3">
            <a
              href="https://github.com/alexdonega/obsidian-note-reviewer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 md:gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-sm font-semibold tracking-tight">Obsidian Note Reviewer</span>
            </a>
            <span className="text-xs text-muted-foreground font-mono opacity-60 hidden md:inline">
              v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'}
            </span>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {isApiMode && (
              <>
                <button
                  onClick={() => {
                    if (annotations.length === 0) {
                      setShowFeedbackPrompt(true);
                    } else {
                      handleDeny();
                    }
                  }}
                  disabled={isSubmitting}
                  className={`p-1.5 md:px-2.5 md:py-1 rounded-md text-xs font-medium transition-all ${
                    isSubmitting
                      ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
                      : 'bg-accent/15 text-accent hover:bg-accent/25 border border-accent/30'
                  }`}
                  title="Solicitar Alterações"
                >
                  <svg className="w-4 h-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="hidden md:inline">{isSubmitting ? 'Enviando...' : 'Solicitar Alterações'}</span>
                </button>

                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className={`px-2 py-1 md:px-2.5 rounded-md text-xs font-medium transition-all ${
                    isSubmitting
                      ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
                      : 'bg-green-600 text-white hover:bg-green-500'
                  }`}
                  title="Aprovar Nota"
                >
                  <span className="md:hidden">{isSubmitting ? '...' : 'OK'}</span>
                  <span className="hidden md:inline">{isSubmitting ? 'Aprovando...' : 'Aprovar'}</span>
                </button>

                <div className="w-px h-5 bg-border/50 mx-1 hidden md:block" />
              </>
            )}


            {/* Botão Salvar/Alterações - Condicional */}
            <button
              onClick={handleSaveToVault}
              disabled={isSaving || !savePath}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${isSaving || !savePath
                  ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
                  : annotations.length > 0
                    ? 'bg-orange-500/20 text-orange-600 hover:bg-orange-500/30 border border-orange-500/40'
                    : 'bg-purple-500/20 text-purple-600 hover:bg-purple-500/30 border border-purple-500/40'
                }
              `}
              title={
                !savePath
                  ? 'Configure o caminho nas configurações'
                  : annotations.length > 0
                    ? 'Fazer alterações no Claude Code'
                    : 'Salvar nota no Obsidian'
              }
            >
              {annotations.length > 0 ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden md:inline">{isSaving ? 'Processando...' : 'Fazer Alterações'}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span className="hidden md:inline">{isSaving ? 'Salvando...' : 'Salvar no Obsidian'}</span>
                </>
              )}
            </button>

            {/* Help Button - Opens video directly */}
            <button
              onClick={() => setShowHelpVideo(true)}
              className="p-1.5 rounded-md text-xs font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Como funciona?"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                isSettingsPanelOpen
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="Configurações"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                isPanelOpen
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={isPanelOpen ? 'Ocultar Painel de Anotações' : 'Mostrar Painel de Anotações'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </button>

            <button
              onClick={() => setShowExport(true)}
              className="p-1.5 md:px-2.5 md:py-1 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 transition-colors flex items-center gap-1.5"
              title="Exportar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="hidden md:inline">Exportar</span>
            </button>
          </div>
        </header>

        {/* Sticky Action Bar - appears when header scrolls out of view */}
        {showStickyBar && !isSettingsPanelOpen && (
          <div className="fixed top-0 left-0 right-0 z-[60] bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {annotations.length} anotação{annotations.length !== 1 ? 'ões' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Botão principal - Fazer Alterações ou Salvar */}
                <button
                  onClick={handleSaveToVault}
                  disabled={isSaving || !savePath}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                    ${isSaving || !savePath
                      ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
                      : annotations.length > 0
                        ? 'bg-orange-500/20 text-orange-600 hover:bg-orange-500/30 border border-orange-500/40'
                        : 'bg-purple-500/20 text-purple-600 hover:bg-purple-500/30 border border-purple-500/40'
                    }
                  `}
                >
                  {annotations.length > 0 ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {isSaving ? 'Processando...' : 'Fazer Alterações'}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </>
                  )}
                </button>

                {/* Exportar */}
                <button
                  onClick={() => setShowExport(true)}
                  className="p-1.5 md:px-2.5 md:py-1 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 transition-colors flex items-center gap-1.5"
                  title="Exportar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="hidden md:inline">Exportar</span>
                </button>

                {/* Configurações */}
                <button
                  onClick={() => setIsSettingsPanelOpen(true)}
                  className="p-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  title="Configurações"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {/* Toggle painel de anotações */}
                <button
                  onClick={() => setIsPanelOpen(!isPanelOpen)}
                  className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                    isPanelOpen
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  title={isPanelOpen ? 'Ocultar Painel' : 'Mostrar Painel'}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document Area */}
          <main className="flex-1 overflow-y-auto bg-grid">
            {/* Mode Switcher - Floating */}
            <div className="sticky top-3 z-[60] mx-3 md:mx-8 w-fit">
              <ModeSwitcher mode={editorMode} onChange={setEditorMode} onEditMarkdown={handleEnterFullEditMode} onGlobalComment={() => setShowGlobalCommentModal(true)} />
            </div>
            <div className="min-h-full flex flex-col items-center p-3 md:p-8 pt-3">

              {/* Show skeleton during initial load or large content parsing */}
              {(isLoading || isLoadingShared || isParsing) ? (
                <ViewerSkeleton />
              ) : (
                <Viewer
                  ref={viewerRef}
                  blocks={blocks}
                  markdown={markdown}
                  annotations={annotations}
                  onAddAnnotation={handleAddAnnotation}
                  onSelectAnnotation={setSelectedAnnotationId}
                  selectedAnnotationId={selectedAnnotationId}
                  mode={editorMode}
                  onBlockChange={setBlocks}
                />
              )}
            </div>
          </main>

          {/* Annotation Panel */}
          <AnnotationPanel
            isOpen={isPanelOpen}
            blocks={blocks}
            annotations={annotations}
            selectedId={selectedAnnotationId}
            onSelect={handleSelectAnnotation}
            onDelete={handleDeleteAnnotation}
            shareUrl={shareUrl}
          />
        </div>

        {/* Export Modal */}
        <ExportModal
          isOpen={showExport}
          onClose={() => setShowExport(false)}
          shareUrl={shareUrl}
          shareUrlSize={shareUrlSize}
          diffOutput={diffOutput}
          annotationCount={annotations.length}

        />

        {/* Global Comment Input Modal */}
        <GlobalCommentInput
          isOpen={showGlobalCommentModal}
          onClose={() => setShowGlobalCommentModal(false)}
          onSubmit={handleAddGlobalComment}
        />

        {/* Help Video Modal */}
        {showHelpVideo && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowHelpVideo(false)}
          >
            <div
              className="bg-card border border-border rounded-xl w-full max-w-2xl shadow-2xl relative"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-video-title"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 id="help-video-title" className="font-semibold text-sm">Como o Obsidian Note Reviewer Funciona</h3>
                <button
                  onClick={() => setShowHelpVideo(false)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/bCkCWnmAD-o?autoplay=1"
                  title="Como o Obsidian Note Reviewer Funciona"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* Feedback prompt dialog */}
        {showFeedbackPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-sm shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Adicione Anotações</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Para solicitar alterações, selecione texto na nota e adicione anotações.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowFeedbackPrompt(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Completion overlay - shown after approve/deny */}
        {submitted && (
          <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md px-8">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                submitted === 'approved'
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-accent/20 text-accent'
              }`}>
                {submitted === 'approved' ? (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )}
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {submitted === 'approved' ? 'Nota Aprovada' : 'Alterações Solicitadas'}
                </h2>
                <p className="text-muted-foreground">
                  {submitted === 'approved'
                    ? 'A nota será salva no Obsidian.'
                    : 'Claude irá revisar a nota com base nas suas anotações.'}
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Retorne ao <span className="text-foreground font-medium">terminal do Claude Code</span> para continuar.
                </p>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* Update notification */}

        {/* Full Edit Mode Overlay */}
        {isFullEditMode && (
          <div className="fixed inset-0 z-[100] bg-background flex flex-col">
            {/* Full Edit Header */}
            <div className="h-12 flex items-center justify-between px-4 border-b border-border/50 bg-card/50 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm font-semibold">Modo de Edição</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {fullEditContent.length} caracteres
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelFullEdit}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveFullEdit}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Alterações
                </button>
              </div>
            </div>

            {/* Full Edit Content */}
            <div className="flex-1 overflow-hidden flex">
              <textarea
                ref={fullEditTextareaRef}
                value={fullEditContent}
                onChange={(e) => setFullEditContent(e.target.value)}
                className="flex-1 w-full h-full p-6 md:p-8 bg-background text-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none border-none"
                placeholder="Digite o conteúdo markdown da sua nota..."
                spellCheck={false}
              />
            </div>

            {/* Full Edit Footer with tips */}
            <div className="h-10 flex items-center justify-between px-4 border-t border-border/50 bg-muted/30 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Esc para cancelar</span>
                <span>Ctrl+Enter para salvar</span>
              </div>
              <div>
                Edição markdown direta
              </div>
            </div>
          </div>
        )}

        {/* Copy to clipboard toast */}
        {showCopyToast && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-card border border-border rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Alterações copiadas!</p>
                <p className="text-xs text-muted-foreground">Cole no Claude Code para processar</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;
