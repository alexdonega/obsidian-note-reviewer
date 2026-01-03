# 🚀 PLANO MESTRE: PLANNOTATOR 5.95 → 10/10

**Objetivo:** Transformar Plannotator em produto de classe mundial
**Timeline:** 12 semanas (3 meses)
**Status Atual:** 5.95/10 (NÃO production-ready)
**Meta Final:** 10/10 (World-class, revenue-ready, exit-ready)

---

## 📊 GAPS A FECHAR

| Dimensão | Atual | Meta | Gap | Prioridade |
|----------|-------|------|-----|------------|
| **Segurança** | 2/10 | 10/10 | **+8** | 🚨 CRÍTICA |
| Qualidade Código | 6/10 | 10/10 | +4 | 🔥 Alta |
| Recorrência | 3/10 | 10/10 | +7 | 🔥 Alta |
| Vendabilidade | 5/10 | 10/10 | +5 | ⚠️ Média |
| Escalabilidade | 6/10 | 10/10 | +4 | ⚠️ Média |
| Lucratividade | 6/10 | 10/10 | +4 | ⚠️ Média |
| Performance | 7/10 | 10/10 | +3 | 💡 Baixa |
| Arquitetura | 7/10 | 10/10 | +3 | 💡 Baixa |
| Inovação | 8/10 | 10/10 | +2 | 💡 Baixa |

---

## 🎯 ESTRATÉGIA DE TRANSFORMAÇÃO

### Filosofia: "Move Fast, Fix Things"

**Princípios:**
1. **Segurança First** - Zero CVEs é não-negociável
2. **Revenue-Ready** - Produto deve gerar receita recorrente
3. **Scale-Ready** - Deve suportar 10K+ usuários
4. **Exit-Ready** - Valuation de $1M+ em 12 semanas
5. **World-Class Code** - Qualidade DHH-level

**Metodologia:**
- 🔴 **Semanas 1-4**: Fundação (Segurança + Arquitetura)
- 🟠 **Semanas 5-8**: Escala (Infraestrutura + Performance)
- 🟡 **Semanas 9-10**: Monetização (Revenue Engine)
- 🟢 **Semanas 11-12**: Excelência (Polish + Launch)

---

## 📅 TIMELINE MASTER (12 SEMANAS)

```
Semana 1-4: FUNDAÇÃO (Segurança 10/10, Arquitetura 10/10)
├─ Semana 1: Security Hardening + Code Quality
├─ Semana 2: Architecture Refactor + Testing
├─ Semana 3: Database + Auth + Multi-tenancy
└─ Semana 4: Performance + Bundle Optimization

Semana 5-8: ESCALA (Escalabilidade 10/10, Performance 10/10)
├─ Semana 5: Serverless Architecture + Edge
├─ Semana 6: Real-time Collaboration + WebSockets
├─ Semana 7: Observability + Monitoring
└─ Semana 8: Load Testing + Optimization

Semana 9-10: MONETIZAÇÃO (Recorrência 10/10, Lucratividade 10/10)
├─ Semana 9: Paywall + Billing + Subscription
└─ Semana 10: Growth Engine + Analytics + Retention

Semana 11-12: EXCELÊNCIA (Vendabilidade 10/10, Inovação 10/10)
├─ Semana 11: Onboarding + UX Polish + Documentation
└─ Semana 12: Launch + Marketing + Exit Prep
```

---

# 🔴 FASE 1: FUNDAÇÃO (Semanas 1-4)

**Objetivo:** 2/10 → 10/10 em Segurança, 7/10 → 10/10 em Arquitetura

## SEMANA 1: Security Hardening + Code Quality

### 🎯 Objetivos
- ✅ Resolver 3 CVEs críticos
- ✅ Adicionar CI/CD com security scans
- ✅ Implementar logging e monitoring
- ✅ Code coverage >90%

### 📋 Tasks Detalhadas

#### DIA 1: CVEs Críticos (Quick Wins)
**Tempo:** 4 horas

1. **Path Traversal Fix**
```typescript
// apps/hook/server/index.ts
import path from 'path';
import os from 'os';

const ALLOWED_DIRS = [
  path.join(os.homedir(), 'Documents'),
  path.join(os.homedir(), 'Obsidian'),
  process.env.VAULT_PATH || path.join(os.homedir(), 'ObsidianVault')
];

function isPathSafe(userPath: string): boolean {
  const resolved = path.resolve(userPath);
  return ALLOWED_DIRS.some(dir => resolved.startsWith(dir));
}

// No endpoint /api/save
if (!isPathSafe(body.path)) {
  return Response.json({ error: 'Invalid path' }, { status: 403 });
}
```

2. **XSS Mermaid Fix**
```bash
bun add dompurify @types/dompurify
```

```typescript
// packages/ui/components/Viewer.tsx
import DOMPurify from 'dompurify';

function sanitizeMermaidSVG(svg: string): string {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true },
    FORBID_TAGS: ['script', 'iframe', 'object'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick']
  });
}

// Linha 770
const cleanSvg = sanitizeMermaidSVG(svg);
return <div dangerouslySetInnerHTML={{ __html: cleanSvg }} />;
```

3. **CORS Fix**
```typescript
// apps/portal/api/notes.ts
const ALLOWED_ORIGINS = [
  'https://plannotator.ai',
  'http://localhost:3000',
  process.env.ALLOWED_ORIGIN
].filter(Boolean);

const origin = req.headers.origin || '';
if (ALLOWED_ORIGINS.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}
```

**Validação:**
```bash
# Rodar testes de segurança
bun test
# Todos devem passar
```

---

#### DIA 2: Security Headers & CSP
**Tempo:** 6 horas

1. **Content Security Policy**
```typescript
// apps/hook/server/index.ts (adicionar middleware)
function addSecurityHeaders(res: Response): Response {
  const headers = new Headers(res.headers);

  // CSP
  headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " + // Mermaid precisa inline
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://api.plannotator.ai; " +
    "frame-ancestors 'none';"
  );

  // Security headers
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS (apenas em produção)
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers
  });
}

// Aplicar em todos os endpoints
return addSecurityHeaders(Response.json(...));
```

2. **Cookie Security**
```typescript
// apps/portal/api/notes.ts
res.setHeader('Set-Cookie', [
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`,
  `csrf=${csrfToken}; Secure; SameSite=Strict; Max-Age=86400; Path=/`
]);
```

3. **Rate Limiting**
```bash
bun add @upstash/ratelimit @upstash/redis
```

```typescript
// apps/hook/server/index.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests por 10s
  analytics: true
});

// Middleware
async function checkRateLimit(ip: string): Promise<boolean> {
  const { success } = await ratelimit.limit(ip);
  return success;
}

// Nos endpoints
const ip = req.headers.get('x-forwarded-for') || 'unknown';
if (!await checkRateLimit(ip)) {
  return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

**Validação:**
```bash
# Testar CSP
curl -I http://localhost:PORT | grep -i "content-security"

# Testar rate limit
for i in {1..15}; do curl http://localhost:PORT/api/save; done
# Deve retornar 429 após 10 requests
```

---

#### DIA 3: CI/CD Pipeline com Security Scans
**Tempo:** 8 horas

1. **GitHub Actions Workflow**
```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *' # Daily

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: 1.3.5

      - name: Install dependencies
        run: bun install

      - name: Run tests
        run: bun test --coverage

      - name: Security audit (npm/bun)
        run: bun audit

      - name: Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'plannotator'
          path: '.'
          format: 'HTML'

      - name: CodeQL Analysis
        uses: github/codeql-action/analyze@v2

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

2. **Pre-commit Hooks**
```bash
bun add -D husky lint-staged
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "bun test --related --passWithNoTests"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

bun run lint-staged
bun test --since HEAD --bail
```

3. **Dependency Security**
```bash
# Adicionar script de audit diário
cat > scripts/security-audit.sh << 'EOF'
#!/bin/bash
echo "🔍 Running security audit..."

# Bun audit
bun audit --audit-level=moderate

# Check for outdated deps
bun outdated

# Snyk test
snyk test --severity-threshold=high

echo "✅ Security audit complete"
EOF

chmod +x scripts/security-audit.sh
```

**Validação:**
```bash
# Testar CI localmente
act -j security # Requer 'act' instalado

# Testar pre-commit
git add .
git commit -m "test: security hooks"
# Deve rodar testes antes de commitar
```

---

#### DIA 4-5: Code Quality & Testing
**Tempo:** 16 horas

1. **ESLint + Prettier Configuração Rigorosa**
```bash
bun add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
bun add -D eslint-plugin-react eslint-plugin-react-hooks
bun add -D eslint-plugin-security eslint-plugin-import
```

```javascript
// .eslintrc.cjs
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:security/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    // Segurança
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-unsafe-regex': 'error',

    // Qualidade
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // React
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Imports
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc' }
    }]
  }
};
```

2. **Testes de Segurança**
```typescript
// packages/ui/utils/__tests__/sanitize.test.ts
import { describe, it, expect } from 'bun:test';
import DOMPurify from 'dompurify';

describe('Mermaid SVG Sanitization', () => {
  it('should remove script tags', () => {
    const malicious = '<svg><script>alert("XSS")</script></svg>';
    const clean = DOMPurify.sanitize(malicious, { USE_PROFILES: { svg: true } });
    expect(clean).not.toContain('script');
    expect(clean).not.toContain('alert');
  });

  it('should remove onerror handlers', () => {
    const malicious = '<svg><img src=x onerror="alert(1)"></svg>';
    const clean = DOMPurify.sanitize(malicious, {
      USE_PROFILES: { svg: true },
      FORBID_ATTR: ['onerror']
    });
    expect(clean).not.toContain('onerror');
  });

  it('should allow safe SVG elements', () => {
    const safe = '<svg><rect width="100" height="100" fill="blue"/></svg>';
    const clean = DOMPurify.sanitize(safe, { USE_PROFILES: { svg: true } });
    expect(clean).toContain('rect');
    expect(clean).toContain('fill="blue"');
  });
});
```

```typescript
// apps/hook/server/__tests__/path-validation.test.ts
import { describe, it, expect } from 'bun:test';
import path from 'path';
import os from 'os';

describe('Path Traversal Protection', () => {
  function isPathSafe(userPath: string): boolean {
    const ALLOWED_DIRS = [
      path.join(os.homedir(), 'Documents'),
      path.join(os.homedir(), 'Obsidian')
    ];
    const resolved = path.resolve(userPath);
    return ALLOWED_DIRS.some(dir => resolved.startsWith(dir));
  }

  it('should allow paths in Documents', () => {
    const safePath = path.join(os.homedir(), 'Documents', 'test.md');
    expect(isPathSafe(safePath)).toBe(true);
  });

  it('should block path traversal attempts', () => {
    const malicious = path.join(os.homedir(), 'Documents', '..', '..', 'etc', 'passwd');
    expect(isPathSafe(malicious)).toBe(false);
  });

  it('should block absolute paths outside allowed dirs', () => {
    expect(isPathSafe('/etc/passwd')).toBe(false);
    expect(isPathSafe('C:\\Windows\\System32')).toBe(false);
  });
});
```

3. **Coverage Target: 90%+**
```bash
# Rodar com coverage
bun test --coverage

# Target: >90% coverage
# Atual: ~60-70% (estimado)
# Gap: +20-30% coverage
```

**Adicionar testes faltantes:**
```typescript
// packages/editor/__tests__/App.test.tsx
import { describe, it, expect } from 'bun:test';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Obsidian Note Reviewer/i)).toBeDefined();
  });

  it('creates annotation on text selection', async () => {
    const { container } = render(<App />);

    // Simular seleção de texto
    const textNode = container.querySelector('[data-block-id]');
    if (textNode) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(textNode);
      selection?.removeAllRanges();
      selection?.addRange(range);

      fireEvent.mouseUp(textNode);

      // Deve mostrar toolbar
      expect(screen.getByRole('toolbar')).toBeDefined();
    }
  });

  it('saves to vault when button clicked', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ ok: true })
      })
    );

    render(<App />);

    const saveButton = screen.getByText(/Salvar no Obsidian/i);
    fireEvent.click(saveButton);

    // Deve chamar /api/save
    expect(fetch).toHaveBeenCalledWith('/api/save', expect.objectContaining({
      method: 'POST'
    }));
  });
});
```

**Validação:**
```bash
bun test --coverage
# Esperado:
# Statements   : 90%+ (target: 95%)
# Branches     : 85%+ (target: 90%)
# Functions    : 90%+ (target: 95%)
# Lines        : 90%+ (target: 95%)
```

---

### 📊 Checkpoint Semana 1

**Métricas de Sucesso:**
- ✅ 0 CVEs críticos (resolvidos: Path Traversal, XSS, CORS)
- ✅ CI/CD pipeline funcionando (GitHub Actions)
- ✅ Code coverage >90%
- ✅ Security headers implementados
- ✅ Rate limiting ativo
- ✅ Pre-commit hooks rodando

**Score Atualizado:**
- Segurança: 2/10 → **8/10** (+6) 🎯
- Qualidade: 6/10 → **8/10** (+2)

**Deliverables:**
- [ ] PR #1: Security Hardening (CVEs resolvidos)
- [ ] PR #2: CI/CD Pipeline
- [ ] PR #3: Security Headers & Rate Limiting
- [ ] PR #4: Code Quality (ESLint + Testes)

---

## SEMANA 2: Architecture Refactor + Testing

### 🎯 Objetivos
- ✅ Migrar storage in-memory para Supabase
- ✅ Refatorar God Component (App.tsx)
- ✅ Implementar state management (Zustand)
- ✅ Adicionar error boundaries
- ✅ Criar camada de serviços

### 📋 Tasks Detalhadas

#### DIA 1: Database Setup (Supabase)
**Tempo:** 8 horas

1. **Schema Design**
```sql
-- migrations/001_initial_schema.sql

-- Organizations (multi-tenancy)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free', -- free, pro, team
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notes (planos do Plannotator)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  markdown TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, slug)
);

-- Annotations
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  block_id TEXT NOT NULL,
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  type TEXT NOT NULL, -- comment, highlight, delete, insert, replace
  text TEXT,
  original_text TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notes_org_id ON notes(org_id);
CREATE INDEX idx_notes_slug ON notes(slug);
CREATE INDEX idx_notes_share_hash ON notes(share_hash);
CREATE INDEX idx_annotations_note_id ON annotations(note_id);
CREATE INDEX idx_users_org_id ON users(org_id);

-- RLS (Row Level Security)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their org"
  ON organizations FOR SELECT
  USING (id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view org users"
  ON users FOR SELECT
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view org notes"
  ON notes FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    OR is_public = true
  );

CREATE POLICY "Users can insert notes in their org"
  ON notes FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update notes in their org"
  ON notes FOR UPDATE
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view annotations on accessible notes"
  ON annotations FOR SELECT
  USING (
    note_id IN (
      SELECT id FROM notes
      WHERE org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
      OR is_public = true
    )
  );
```

2. **Supabase Client Setup**
```bash
bun add @supabase/supabase-js @supabase/auth-helpers-react
```

```typescript
// packages/ui/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types gerados automaticamente
export type Database = {
  public: {
    Tables: {
      organizations: { /* ... */ };
      users: { /* ... */ };
      notes: { /* ... */ };
      annotations: { /* ... */ };
    };
  };
};
```

3. **Migrar NotesService**
```typescript
// packages/ui/services/NotesService.ts
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Note = Database['public']['Tables']['notes']['Row'];
type NoteInsert = Database['public']['Tables']['notes']['Insert'];

export class NotesService {
  async create(note: NoteInsert): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert(note)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getBySlug(slug: string): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found
      throw new Error(error.message);
    }
    return data;
  }

  async getByShareHash(hash: string): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('share_hash', hash)
      .eq('is_public', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    return data;
  }

  async update(id: string, updates: Partial<Note>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // Real-time subscription
  subscribeToNoteChanges(noteId: string, callback: (note: Note) => void) {
    return supabase
      .channel(`note:${noteId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${noteId}`
        },
        (payload) => callback(payload.new as Note)
      )
      .subscribe();
  }
}

export const notesService = new NotesService();
```

**Validação:**
```bash
# Testar CRUD
bun test packages/ui/services/__tests__/NotesService.test.ts

# Testar RLS
# Deve permitir apenas acesso a notas da própria org
```

---

#### DIA 2-3: Refactor God Component
**Tempo:** 16 horas

1. **Extrair Custom Hooks**
```typescript
// packages/ui/hooks/useAnnotations.ts
import { useState, useCallback } from 'react';
import type { Annotation } from '../types';

export function useAnnotations(initialAnnotations: Annotation[] = []) {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [history, setHistory] = useState<string[]>([]);

  const addAnnotation = useCallback((annotation: Annotation) => {
    setAnnotations(prev => [...prev, annotation]);
    setHistory(prev => [...prev, annotation.id]);
  }, []);

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  }, []);

  const undoLastAnnotation = useCallback(() => {
    if (history.length === 0) return;

    const lastId = history[history.length - 1];
    setAnnotations(prev => prev.filter(a => a.id !== lastId));
    setHistory(prev => prev.slice(0, -1));
  }, [history]);

  return {
    annotations,
    addAnnotation,
    deleteAnnotation,
    undoLastAnnotation,
    canUndo: history.length > 0
  };
}
```

```typescript
// packages/ui/hooks/useSaveToVault.ts
import { useState, useCallback } from 'react';
import type { Block } from '../types';

export function useSaveToVault() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (path: string, blocks: Block[]) => {
    if (!path.trim()) {
      setError('Configure o caminho nas configurações');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      const content = reconstructMarkdown(blocks);
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, path })
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Erro ao salvar');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { save, isSaving, error };
}

function reconstructMarkdown(blocks: Block[]): string {
  return blocks.map(block => {
    if (block.type === 'frontmatter') {
      return `---\n${block.content}\n---`;
    }
    return block.content;
  }).join('\n\n');
}
```

```typescript
// packages/ui/hooks/useApiMode.ts
import { useState, useEffect } from 'react';

export function useApiMode() {
  const [isApiMode, setIsApiMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState('');

  useEffect(() => {
    fetch('/api/plan')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setPlan(data.plan);
        setIsApiMode(true);
      })
      .catch(() => setIsApiMode(false))
      .finally(() => setIsLoading(false));
  }, []);

  const approve = async () => {
    await fetch('/api/approve', { method: 'POST' });
  };

  const deny = async (feedback: string) => {
    await fetch('/api/deny', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback })
    });
  };

  return { isApiMode, isLoading, plan, approve, deny };
}
```

2. **State Management com Zustand**
```bash
bun add zustand
```

```typescript
// packages/ui/store/useAnnotationStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Annotation } from '../types';

interface AnnotationState {
  annotations: Annotation[];
  selectedId: string | null;
  history: string[];

  addAnnotation: (annotation: Annotation) => void;
  deleteAnnotation: (id: string) => void;
  selectAnnotation: (id: string | null) => void;
  undo: () => void;
  clear: () => void;
}

export const useAnnotationStore = create<AnnotationState>()(
  devtools(
    persist(
      (set, get) => ({
        annotations: [],
        selectedId: null,
        history: [],

        addAnnotation: (annotation) => set((state) => ({
          annotations: [...state.annotations, annotation],
          history: [...state.history, annotation.id],
          selectedId: annotation.id
        })),

        deleteAnnotation: (id) => set((state) => ({
          annotations: state.annotations.filter(a => a.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId
        })),

        selectAnnotation: (id) => set({ selectedId: id }),

        undo: () => {
          const { history, annotations } = get();
          if (history.length === 0) return;

          const lastId = history[history.length - 1];
          set({
            annotations: annotations.filter(a => a.id !== lastId),
            history: history.slice(0, -1),
            selectedId: null
          });
        },

        clear: () => set({ annotations: [], selectedId: null, history: [] })
      }),
      { name: 'annotation-store' }
    )
  )
);
```

```typescript
// packages/ui/store/useSettingsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  vaultPath: string;
  notePath: string;
  identity: string;
  theme: 'light' | 'dark' | 'system';

  setVaultPath: (path: string) => void;
  setNotePath: (path: string) => void;
  setIdentity: (identity: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      vaultPath: '',
      notePath: '',
      identity: '',
      theme: 'dark',

      setVaultPath: (path) => set({ vaultPath: path }),
      setNotePath: (path) => set({ notePath: path }),
      setIdentity: (identity) => set({ identity }),
      setTheme: (theme) => set({ theme })
    }),
    { name: 'settings-store' }
  )
);
```

3. **Refatorar App.tsx**
```typescript
// packages/editor/App.tsx (simplificado)
import React, { useState, useMemo } from 'react';
import { useAnnotations } from '@obsidian-note-reviewer/ui/hooks/useAnnotations';
import { useSaveToVault } from '@obsidian-note-reviewer/ui/hooks/useSaveToVault';
import { useApiMode } from '@obsidian-note-reviewer/ui/hooks/useApiMode';
import { useAnnotationStore } from '@obsidian-note-reviewer/ui/store/useAnnotationStore';
import { useSettingsStore } from '@obsidian-note-reviewer/ui/store/useSettingsStore';
import { parseMarkdownToBlocks, exportDiff } from '@obsidian-note-reviewer/ui/utils/parser';

import { Viewer } from '@obsidian-note-reviewer/ui/components/Viewer';
import { AnnotationPanel } from '@obsidian-note-reviewer/ui/components/AnnotationPanel';
import { EditorHeader } from './components/EditorHeader';
import { EditorContent } from './components/EditorContent';

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState('');
  const [editorMode, setEditorMode] = useState<EditorMode>('selection');

  // Zustand stores
  const annotations = useAnnotationStore(state => state.annotations);
  const addAnnotation = useAnnotationStore(state => state.addAnnotation);
  const selectedId = useAnnotationStore(state => state.selectedId);
  const vaultPath = useSettingsStore(state => state.vaultPath);
  const notePath = useSettingsStore(state => state.notePath);

  // Custom hooks
  const { isApiMode, approve, deny } = useApiMode();
  const { save, isSaving, error: saveError } = useSaveToVault();

  // Memoized values
  const blocks = useMemo(() => parseMarkdownToBlocks(markdown), [markdown]);
  const diffOutput = useMemo(() => exportDiff(blocks, annotations), [blocks, annotations]);

  const handleSave = async () => {
    const fullPath = `${vaultPath}/${notePath}`;
    const success = await save(fullPath, blocks);

    if (success && isApiMode) {
      if (annotations.length > 0) {
        await deny(diffOutput);
      } else {
        await approve();
      }
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <EditorHeader
        onSave={handleSave}
        isSaving={isSaving}
        hasAnnotations={annotations.length > 0}
        isApiMode={isApiMode}
      />

      <EditorContent
        blocks={blocks}
        markdown={markdown}
        annotations={annotations}
        onAddAnnotation={addAnnotation}
        selectedId={selectedId}
        mode={editorMode}
      />

      <AnnotationPanel
        annotations={annotations}
        selectedId={selectedId}
      />
    </div>
  );
};

export default App;
```

**Validação:**
```bash
# Contar linhas App.tsx
wc -l packages/editor/App.tsx
# Antes: 772 linhas
# Depois: <200 linhas ✅

# Rodar testes
bun test packages/editor
# Todos devem passar
```

---

#### DIA 4-5: Error Boundaries & Observability
**Tempo:** 16 horas

1. **Error Boundaries**
```typescript
// packages/ui/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Send to error tracking (Sentry)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } }
      });
    }

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-screen bg-background">
          <div className="max-w-md p-8 bg-card border border-border rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Algo deu errado</h2>
            <p className="text-muted-foreground mb-4">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Recarregar
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Detalhes do erro
                </summary>
                <pre className="mt-2 text-xs overflow-auto p-2 bg-muted rounded">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

2. **Logging Estruturado**
```bash
bun add pino pino-pretty
```

```typescript
// packages/ui/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  browser: {
    asObject: true,
  },
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined
});

// Structured logging helpers
export const log = {
  info: (msg: string, data?: object) => logger.info(data, msg),
  warn: (msg: string, data?: object) => logger.warn(data, msg),
  error: (msg: string, error?: Error | unknown, data?: object) => {
    if (error instanceof Error) {
      logger.error({ ...data, error: error.message, stack: error.stack }, msg);
    } else {
      logger.error({ ...data, error }, msg);
    }
  },
  debug: (msg: string, data?: object) => logger.debug(data, msg),
};
```

3. **Monitoramento (Sentry)**
```bash
bun add @sentry/react @sentry/vite-plugin
```

```typescript
// packages/ui/lib/sentry.ts
import * as Sentry from '@sentry/react';

export function initSentry() {
  if (process.env.NODE_ENV !== 'production') return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay()
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    beforeSend(event, hint) {
      // Filtrar erros conhecidos/esperados
      if (event.exception?.values?.[0]?.value?.includes('ResizeObserver loop')) {
        return null;
      }
      return event;
    }
  });
}
```

```typescript
// packages/editor/main.tsx
import { initSentry } from '@obsidian-note-reviewer/ui/lib/sentry';
import { ErrorBoundary } from '@obsidian-note-reviewer/ui/components/ErrorBoundary';

initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

**Validação:**
```bash
# Testar error boundary
# Adicionar throw new Error('Test') em algum componente
# Deve mostrar tela de erro gracefully

# Testar Sentry
# Deve enviar erros para dashboard Sentry
```

---

### 📊 Checkpoint Semana 2

**Métricas de Sucesso:**
- ✅ Storage migrado para Supabase (persistente)
- ✅ App.tsx < 200 linhas (era 772)
- ✅ Custom hooks extraídos (useAnnotations, useSaveToVault, useApiMode)
- ✅ State management centralizado (Zustand)
- ✅ Error boundaries implementados
- ✅ Logging estruturado (Pino)
- ✅ Monitoramento (Sentry)

**Score Atualizado:**
- Arquitetura: 7/10 → **9/10** (+2) 🎯
- Qualidade: 8/10 → **9/10** (+1)
- Escalabilidade: 6/10 → **7/10** (+1)

**Deliverables:**
- [ ] PR #5: Database Migration (Supabase)
- [ ] PR #6: God Component Refactor
- [ ] PR #7: State Management (Zustand)
- [ ] PR #8: Error Handling & Observability

---

## SEMANA 3: Database + Auth + Multi-tenancy

### 🎯 Objetivos
- ✅ Implementar autenticação (Supabase Auth)
- ✅ Multi-tenancy completo
- ✅ RBAC (Role-Based Access Control)
- ✅ Session management

### 📋 Tasks Detalhadas

#### DIA 1-2: Authentication
**Tempo:** 16 horas

1. **Supabase Auth Setup**
```typescript
// packages/ui/lib/auth.ts
import { supabase } from './supabase';

export const auth = {
  // Email/Password signup
  async signUp(email: string, password: string, metadata?: object) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
  },

  // Email/Password login
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // OAuth login (Google, GitHub)
  async signInWithOAuth(provider: 'google' | 'github') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
    return data;
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }
};
```

2. **Auth Context Provider**
```typescript
// packages/ui/providers/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/auth';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    auth.getUser().then(setUser).finally(() => setLoading(false));

    // Listen to auth changes
    const { data: { subscription } } = auth.onAuthStateChange(setUser);

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signIn: async (email, password) => {
      await auth.signIn(email, password);
    },
    signUp: async (email, password) => {
      await auth.signUp(email, password);
    },
    signOut: async () => {
      await auth.signOut();
    },
    signInWithOAuth: async (provider) => {
      await auth.signInWithOAuth(provider);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

3. **Login/Signup Components**
```typescript
// packages/ui/components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signInWithOAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-card border border-border rounded-xl">
      <h2 className="text-2xl font-semibold mb-6">Login to Plannotator</h2>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => signInWithOAuth('google')}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted"
          >
            Google
          </button>
          <button
            onClick={() => signInWithOAuth('github')}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted"
          >
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Validação:**
```bash
# Testar fluxo completo
1. Signup novo usuário
2. Verificar email enviado
3. Login com email/password
4. Login com Google OAuth
5. Logout
6. Session persistence após refresh

# Todos devem funcionar
```

---

(Continuação na próxima mensagem devido ao limite de caracteres...)
