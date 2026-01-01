---
dna_type: cognitivo
produto: Obsidian Note Reviewer
versao: 0.2.1
autor: Alex Donega
data_criacao: 2026-01-01
ultima_atualizacao: 2026-01-01
tags:
  - arquitetura
  - stack-tecnico
  - engenharia
  - typescript
  - react
---

# DNA COGNITIVO - Obsidian Note Reviewer

> **Essência Técnica**: Monorepo TypeScript/React que combina renderização markdown avançada com sistema de anotações cross-element, integração filesystem e compartilhamento stateless via URL.

---

## 1. ARQUITETURA DO PRODUTO

### Visão Geral

**Obsidian Note Reviewer** é construído como um **monorepo modular** usando Bun workspaces, dividido em 3 aplicações principais e 2 pacotes compartilhados:

```
obsidian-note-reviewer/
├── apps/
│   ├── hook/           # CLI + Servidor efêmero (Bun)
│   ├── portal/         # Web app SPA (React + Vite)
│   └── opencode-plugin/# Plugin para OpenCode
├── packages/
│   ├── editor/         # Componente principal React
│   └── ui/             # Biblioteca de componentes UI
```

### Stack Tecnológico Principal

**Runtime & Build**
- **Bun** 1.3.5 - Package manager, runtime e test runner
- **Vite** 6.2.0 - Build tool otimizado
- **TypeScript** 5.8.2 - Type safety
- **Node.js** (opcional) - Compatibilidade

**Frontend**
- **React** 19.2.3 - UI framework (latest)
- **Tailwind CSS** 4.1.18 - Styling system (v4)
- **Lucide React** 0.460.0 - Sistema de ícones

**Markdown & Rendering**
- **React Markdown** 10.1.0 - Renderização base
- **Remark GFM** 4.0.1 - GitHub Flavored Markdown
- **Highlight.js** 11.11.1 - Syntax highlighting
- **Mermaid** 11.12.2 - Diagramas
- **js-yaml** 4.1.1 - Parser YAML para frontmatter

**Annotations System**
- **Web Highlighter** 0.7.4 - Cross-element highlighting
- **Custom annotation engine** - DELETE/INSERT/REPLACE/COMMENT

**Testing**
- **Bun Test** - Test runner nativo
- **React Testing Library** 16.3.1
- **Happy DOM** 20.0.11 - Ambiente de testes
- **410 arquivos de teste** 🎉

**Deployment**
- **Vercel** - Hosting do portal web
- **Vercel Serverless Functions** - API /api/notes
- **GitHub Actions** - CI/CD automatizado
- **Bun standalone** - Executáveis compilados (113MB)

---

## 2. MODELO MENTAL DO PRODUTO

### Como o Note Reviewer "Pensa" Sobre o Problema

**Problema Central:**
> "Markdown é ótimo para escrever, mas revisar em texto puro é doloroso. Especialmente quando vem de AI agents que geram documentos complexos com frontmatter, callouts e diagramas."

**Filosofia Arquitetural:**

1. **"Renderizar é Entender"**
   - Humanos processam visualmente melhor que textualmente
   - Callouts, tabelas e diagramas devem ser renderizados, não lidos como código
   - Frontmatter YAML deve ser editável visualmente

2. **"Anotações são Contexto"**
   - Feedback precisa estar ancorado no texto específico
   - Tipos de mudança (DELETE/INSERT/REPLACE) são mais precisos que comentários genéricos
   - Anotações globais para feedback geral são igualmente importantes

3. **"Integração é Invisível"**
   - Usuário não deve sair do workflow
   - Claude Code termina → interface abre automaticamente
   - Aprova/rejeita → volta pro AI agent sem fricção

4. **"Templates são Inteligência"**
   - Frontmatter padrão economiza tempo
   - Paths baseados em tipo de nota (vídeo → `Sources/Videos/`)
   - Configuração persistente entre sessões

5. **"Compartilhamento é Stateless"**
   - Nota comprimida na própria URL (LZ-String)
   - Zero dependência de servidor/banco de dados
   - Funciona offline para notas compartilhadas

### Decisões Arquiteturais Críticas

| Decisão | Raciocínio | Trade-off |
|:--------|:-----------|:----------|
| **Monorepo** | Código compartilhado entre hook/portal/plugin | Complexidade inicial vs. DRY |
| **Bun** | Build rápido, teste integrado, executáveis standalone | Ecossistema menor que npm |
| **React 19** | Concurrent rendering, melhor performance | Requer aprendizado de novas APIs |
| **Tailwind 4** | Estilo inline rápido, zero CSS custom | Curva de aprendizado, classes longas |
| **Web Highlighter** | Anotações cross-element robustas | Biblioteca externa, menos controle |
| **LZ-String URL** | Compartilhamento sem servidor | Limite de tamanho de URL (~2MB) |
| **Serverless Vercel** | Deploy fácil, auto-scaling | Cold start latency |
| **Filesystem local** | Salvamento direto no vault | Requer permissões, sem sync cloud |

---

## 3. ARQUITETURA DE COMPONENTES

### Apps (Aplicações)

#### 1. `apps/hook/` - CLI + Servidor Efêmero

**Propósito:** Integração com Claude Code via hooks plugin

**Tecnologias:**
- Bun.serve (servidor HTTP)
- fs/promises (filesystem operations)
- Porta aleatória (evita conflitos)

**Endpoints:**
```typescript
GET  /api/content        → Retorna nota markdown
POST /api/approve        → Aprova sem mudanças
POST /api/deny           → Rejeita com feedback
POST /api/save           → Salva no vault Obsidian
GET  /api/config/list    → Lista configs disponíveis
```

**Fluxo:**
1. Claude Code termina plano → dispara hook
2. Hook inicia servidor efêmero em porta aleatória
3. Abre `http://localhost:PORT?content=/path/to/file`
4. Portal busca conteúdo via `/api/content`
5. Usuário revisa/anota
6. Aprova → `/api/approve` ou `/api/save`

**Build:**
- Executável standalone: `obsidian-note-reviewer.exe` (113MB)
- Sem necessidade de Bun instalado

---

#### 2. `apps/portal/` - Web App SPA

**Propósito:** Interface principal de revisão/anotação

**Tecnologias:**
- React 19 + TypeScript
- Vite (dev server + build)
- Tailwind CSS 4
- Vercel Serverless Functions

**Estrutura:**
```
apps/portal/
├── index.html           # Entry point
├── dev-server.ts        # Dev server local
├── api/notes.ts         # Vercel function (GET/POST notes)
└── vite.config.ts       # Build config
```

**Features:**
- ✅ Modo Autor / Modo Revisor
- ✅ Visualização de notas compartilhadas
- ✅ Editor de frontmatter YAML
- ✅ Renderização de callouts + Mermaid
- ✅ Sistema de anotações
- ✅ Exportação de diff
- ✅ Página 404 customizada

**Build:**
- Arquivo único HTML: `vite-plugin-singlefile`
- Tamanho: ~500KB minificado
- Deploy: Vercel auto-deploy em push

---

#### 3. `apps/opencode-plugin/` - Plugin OpenCode

**Propósito:** Integração com OpenCode (alternativa ao Claude Code)

**Status:** Implementação básica, menos features que hook

---

### Packages (Código Compartilhado)

#### 1. `packages/editor/` - Componente Principal

**Arquivo:** `App.tsx` (771 linhas)

**Responsabilidades:**
- Gerenciamento de estado global da aplicação
- Coordenação entre modos (Autor/Revisor)
- Sincronização com URL (compartilhamento)
- Integração com servidor local (hook)

**Estado Principal:**
```typescript
{
  content: string,           // Markdown original
  yamlConfig: YAMLConfig,    // Frontmatter parseado
  annotations: Annotation[], // Anotações do usuário
  mode: 'author' | 'reviewer' | 'view',
  reviewerIdentity: string   // ID único do revisor
}
```

**Hooks Customizados:**
- `useSharing()` - Sincronização com URL via LZ-String

---

#### 2. `packages/ui/` - Biblioteca de Componentes

**22 componentes React**, incluindo:

**Core Components:**
- `Viewer.tsx` (44KB) - Renderizador markdown principal
  - Suporte a callouts Obsidian (15+ tipos)
  - Detecção de Mermaid em callouts
  - Syntax highlighting automático
  - Sistema de highlighting cross-element

- `AnnotationPanel.tsx` - Painel lateral de anotações
  - Filtragem por tipo (DELETE/INSERT/REPLACE/COMMENT)
  - Agrupamento por revisor
  - Jump-to-annotation

- `SettingsPanel.tsx` - Configurações
  - Seleção de template
  - Path do vault Obsidian
  - Configurações de frontmatter

- `ConfigEditor.tsx` - Editor visual de configs
  - Preview em tempo real
  - Validação de campos obrigatórios

**Utility Components:**
- `ExportModal.tsx` - Exportação de diff
- `GlobalCommentInput.tsx` - Comentários globais
- `ModeSwitcher.tsx` - Troca de modo
- `Toolbar.tsx` - Barra de ferramentas
- `ThemeProvider.tsx` - Gerenciamento de temas

**Utilitários (`utils/`):**
```typescript
// Parser markdown simplificado
parser.ts            → Extrai frontmatter + body

// Mapeamento de templates
notePaths.ts (12KB)  → 12 configs de tipos de nota

// Compartilhamento
sharing.ts           → Compressão/descompressão LZ-String

// Storage
storage.ts           → Cookie-based persistence cross-port

// Renderização
callouts.ts          → Lógica de callouts Obsidian
identity.ts          → Geração de IDs únicos
```

---

## 4. DIFERENCIAIS TÉCNICOS

### 1. Renderização de Callouts com Mermaid Embutido

**Problema:**
- Obsidian renderiza callouts como blocos especiais
- Mermaid dentro de callouts não renderiza em outros viewers

**Solução:**
```typescript
// packages/ui/utils/callouts.ts
function detectMermaidInCallout(content: string) {
  const regex = /```mermaid\n([\s\S]*?)```/g
  // Extrai blocos Mermaid
  // Renderiza com biblioteca Mermaid
  // Injeta SVG no callout
}
```

**Resultado:** Único viewer que renderiza callouts Obsidian com diagramas Mermaid perfeitamente.

---

### 2. Frontmatter YAML Editável

**Problema:**
- Maioria dos editores trata frontmatter como texto
- Editar requer conhecimento de sintaxe YAML
- Fácil quebrar formatação

**Solução:**
```typescript
// packages/ui/utils/parser.ts
import yaml from 'js-yaml'

function parseFrontmatter(markdown: string) {
  const match = /^---\n([\s\S]*?)\n---/.exec(markdown)
  if (!match) return null

  try {
    return yaml.load(match[1]) // Parse seguro
  } catch {
    return null // Fallback se inválido
  }
}
```

**Features:**
- ✅ Validação em tempo real
- ✅ Preserva formatação ao exportar
- ✅ Interface visual para edição
- ✅ Suporta campos customizados

---

### 3. Sistema de Templates Inteligente

**Problema:**
- Criar nota do zero toda vez é lento
- Paths inconsistentes no vault
- Frontmatter duplicado

**Solução:**
```typescript
// packages/ui/utils/notePaths.ts (12KB)
const TEMPLATE_CONFIGS = {
  'youtube-video': {
    folder: 'Sources/Videos/YouTube/',
    frontmatter: {
      tipo: 'video',
      plataforma: 'YouTube',
      status: 'assistir',
      tags: ['video', 'youtube']
    }
  },
  'conceito-atomico': {
    folder: 'Atlas/Atomos/Conceitos/',
    frontmatter: {
      tipo: 'conceito',
      categoria: '',
      tags: ['conceito', 'atomico']
    }
  }
  // ... 12 templates total
}
```

**Resultado:**
- 🎯 Path correto automaticamente
- 🎯 Frontmatter pré-preenchido
- 🎯 Configuração persiste via cookies

---

### 4. Compartilhamento Stateless via URL

**Problema:**
- Compartilhar notas requer servidor + banco
- Privacidade: dados armazenados em servidor de terceiros
- Custo de infraestrutura

**Solução:**
```typescript
// packages/ui/utils/sharing.ts
import LZString from 'lz-string'

function compressNote(note: Note): string {
  const json = JSON.stringify(note)
  return LZString.compressToEncodedURIComponent(json)
}

// URL final:
// https://r.alexdonega.com.br/review?data=N4IgdghgtgpiBcID...
```

**Resultado:**
- ✅ Zero servidor (dados na URL)
- ✅ Funciona offline
- ✅ Privacidade (dados não armazenados)
- ⚠️ Limite: ~2MB por nota (suficiente para 99% dos casos)

---

### 5. Anotações Cross-Element

**Problema:**
- Seleção de texto pode cruzar múltiplos elementos HTML
- DOM muda ao renderizar markdown
- Highlights podem quebrar ao re-renderizar

**Solução:**
```typescript
// packages/ui (usa web-highlighter 0.7.4)
import Highlighter from 'web-highlighter'

const highlighter = new Highlighter({
  $root: document.getElementById('viewer'),
  exceptSelectors: ['.annotation-marker']
})

// Serializa posição usando XPath + offsets
// Restaura highlights mesmo após re-render
```

**Resultado:** Anotações robustas que sobrevivem a mudanças no DOM.

---

## 5. PERFORMANCE E OTIMIZAÇÃO

### Build Otimizado

**Vite Configuration:**
```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined // Single file
      }
    },
    minify: 'terser',
    cssMinify: true
  },
  plugins: [viteSingleFile()] // Tudo em 1 HTML
}
```

**Resultado:**
- Portal: ~500KB (HTML + CSS + JS inlined)
- Carregamento: <1s em conexão 4G
- Zero requests adicionais (tudo embutido)

### Runtime Performance

**React 19 Features:**
- Concurrent rendering
- Automatic batching
- Transitions API para UI não-bloqueante

**Otimizações:**
- Memoização de componentes pesados (Viewer)
- Debounce em inputs (frontmatter editor)
- Lazy loading de Mermaid (só carrega se necessário)
- Virtual scrolling (planejado para listas longas)

---

## 6. SEGURANÇA E LIMITAÇÕES

### Vulnerabilidades Identificadas (Em Correção)

**CVE-1: Path Traversal** (`apps/hook/server/index.ts:75-96`)
```typescript
// ❌ VULNERÁVEL
app.post('/api/save', async (req) => {
  const { path, content } = await req.json()
  await fs.writeFile(path, content) // Path não validado!
})

// ✅ FIX (em branch)
const sanitizedPath = path.replace(/\.\./g, '') // Bloqueia ../
```

**CVE-2: XSS via Mermaid** (`packages/ui/components/Viewer.tsx:770`)
```typescript
// ❌ VULNERÁVEL
<div dangerouslySetInnerHTML={{ __html: mermaidSVG }} />

// ✅ FIX (em branch)
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(mermaidSVG)
}} />
```

**CVE-3: CORS Overly Permissive** (`apps/portal/api/notes.ts:13`)
```typescript
// ❌ VULNERÁVEL
res.setHeader('Access-Control-Allow-Origin', '*')

// ✅ FIX (em branch)
const allowedOrigins = ['https://r.alexdonega.com.br', 'http://localhost:*']
res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
```

**Status:** 15 branches ativas com correções, merge pendente.

---

## 7. ROADMAP TÉCNICO

### Implementado ✅
- Monorepo com Bun workspaces
- 410 testes automatizados
- Deploy CI/CD Vercel
- Executáveis standalone
- Renderização completa de markdown

### Em Desenvolvimento 🚧
- Correções de segurança (CVEs)
- Melhorias de acessibilidade (ARIA, keyboard nav)
- Shortcuts de teclado expandidos
- JSON export de anotações

### Planejado 📋
- **Servidor MCP customizado** para Obsidian
  - Alternativa ao endpoint `/api/save` local
  - Integração nativa com Claude via Model Context Protocol
  - Leitura/escrita de notas via MCP tools

- **Sistema de plugins**
  - API para estender funcionalidades
  - Marketplace de templates customizados

- **Virtual scrolling**
  - Performance para notas 1000+ linhas

- **Diff visual melhorado**
  - Coloração lado-a-lado
  - Exportação em múltiplos formatos (Git patch, JSON, etc.)

---

## MODELO COGNITIVO RESUMIDO

**Note Reviewer pensa assim:**

1. **Input:** Markdown (plano/puro, frontmatter, callouts, diagramas)
2. **Parse:** Separa frontmatter → body, detecta callouts, Mermaid
3. **Render:** Transforma em React components (Viewer)
4. **Annotate:** Overlay de highlights + marcadores de mudança
5. **Export:** Diff estruturado (DELETE/INSERT/REPLACE) ou salva direto
6. **Share:** Comprime tudo em URL (stateless)

**Filosofia:**
> "Renderizar perfeitamente. Anotar precisamente. Integrar invisivelmente."

---

**Versão**: 1.0
**Última Revisão**: 2026-01-01
**Próxima Revisão**: Após migração para MCP
