# 🚀 PLANO MESTRE 10/10 - PARTE 2

**Continuação de:** PLANO_10_10.md
**Fases:** 2, 3 e 4 (Semanas 5-12)

---

## SEMANA 3 (Continuação): RBAC + Multi-tenancy

#### DIA 3-4: RBAC (Role-Based Access Control)
**Tempo:** 16 horas

1. **Role System**
```typescript
// packages/ui/lib/permissions.ts
export enum Role {
  OWNER = 'owner',     // Full access, can delete org
  ADMIN = 'admin',     // Can manage users, billing
  MEMBER = 'member',   // Can create/edit notes
  VIEWER = 'viewer'    // Read-only access
}

export enum Permission {
  // Organization
  ORG_DELETE = 'org:delete',
  ORG_UPDATE = 'org:update',
  ORG_BILLING = 'org:billing',

  // Users
  USER_INVITE = 'user:invite',
  USER_REMOVE = 'user:remove',
  USER_ROLE_UPDATE = 'user:role:update',

  // Notes
  NOTE_CREATE = 'note:create',
  NOTE_UPDATE = 'note:update',
  NOTE_DELETE = 'note:delete',
  NOTE_SHARE = 'note:share',

  // Annotations
  ANNOTATION_CREATE = 'annotation:create',
  ANNOTATION_UPDATE = 'annotation:update',
  ANNOTATION_DELETE = 'annotation:delete'
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    Permission.ORG_DELETE,
    Permission.ORG_UPDATE,
    Permission.ORG_BILLING,
    Permission.USER_INVITE,
    Permission.USER_REMOVE,
    Permission.USER_ROLE_UPDATE,
    Permission.NOTE_CREATE,
    Permission.NOTE_UPDATE,
    Permission.NOTE_DELETE,
    Permission.NOTE_SHARE,
    Permission.ANNOTATION_CREATE,
    Permission.ANNOTATION_UPDATE,
    Permission.ANNOTATION_DELETE
  ],
  [Role.ADMIN]: [
    Permission.ORG_UPDATE,
    Permission.USER_INVITE,
    Permission.USER_REMOVE,
    Permission.NOTE_CREATE,
    Permission.NOTE_UPDATE,
    Permission.NOTE_DELETE,
    Permission.NOTE_SHARE,
    Permission.ANNOTATION_CREATE,
    Permission.ANNOTATION_UPDATE,
    Permission.ANNOTATION_DELETE
  ],
  [Role.MEMBER]: [
    Permission.NOTE_CREATE,
    Permission.NOTE_UPDATE,
    Permission.NOTE_SHARE,
    Permission.ANNOTATION_CREATE,
    Permission.ANNOTATION_UPDATE,
    Permission.ANNOTATION_DELETE
  ],
  [Role.VIEWER]: [
    // Read-only, no permissions
  ]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

export function canUserDo(user: { role: Role }, permission: Permission): boolean {
  return hasPermission(user.role, permission);
}
```

2. **Permission Hook**
```typescript
// packages/ui/hooks/usePermissions.ts
import { useMemo } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { canUserDo, Permission, Role } from '../lib/permissions';

export function usePermissions() {
  const { user } = useAuth();

  const can = useMemo(() => {
    if (!user?.user_metadata?.role) return () => false;

    const role = user.user_metadata.role as Role;

    return (permission: Permission) => canUserDo({ role }, permission);
  }, [user]);

  return { can };
}

// Usage example:
// const { can } = usePermissions();
// if (can(Permission.NOTE_DELETE)) { /* show delete button */ }
```

3. **Protected Routes**
```typescript
// packages/ui/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { usePermissions } from '../hooks/usePermissions';
import type { Permission } from '../lib/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePermission?: Permission;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requirePermission,
  fallback
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { can } = usePermissions();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requirePermission && !can(requirePermission)) {
    return fallback || <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}
```

---

#### DIA 5: Multi-tenancy Testing
**Tempo:** 8 horas

1. **E2E Tests para Multi-tenancy**
```typescript
// tests/e2e/multi-tenancy.test.ts
import { test, expect } from '@playwright/test';

test.describe('Multi-tenancy', () => {
  test('users can only access their org notes', async ({ page, context }) => {
    // Criar 2 orgs diferentes
    const org1User = await createTestUser('org1@test.com', 'Org 1');
    const org2User = await createTestUser('org2@test.com', 'Org 2');

    // Org 1: criar nota
    await page.goto('/login');
    await page.fill('[name=email]', 'org1@test.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');

    await page.waitForURL('/dashboard');
    await page.click('text=New Note');
    await page.fill('[name=title]', 'Secret Org 1 Note');
    await page.click('button:has-text("Save")');

    const org1NoteUrl = page.url();

    // Logout
    await page.click('[data-testid=user-menu]');
    await page.click('text=Logout');

    // Org 2: tentar acessar nota da Org 1
    await page.goto('/login');
    await page.fill('[name=email]', 'org2@test.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');

    await page.goto(org1NoteUrl);

    // Deve mostrar 403 ou redirecionar
    await expect(page.locator('text=Unauthorized')).toBeVisible();
  });

  test('VIEWER role cannot edit notes', async ({ page }) => {
    const viewer = await createTestUser('viewer@test.com', 'Test Org', 'viewer');

    await page.goto('/login');
    await page.fill('[name=email]', 'viewer@test.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');

    await page.goto('/notes/some-note');

    // Botões de edição não devem aparecer
    await expect(page.locator('button:has-text("Edit")')).toBeHidden();
    await expect(page.locator('button:has-text("Delete")')).toBeHidden();
  });
});
```

**Validação:**
```bash
# Rodar testes E2E
bun test:e2e

# Verificar RLS policies no Supabase
# Deve bloquear acesso cross-org
```

---

### 📊 Checkpoint Semana 3

**Métricas de Sucesso:**
- ✅ Autenticação completa (Email + OAuth)
- ✅ Multi-tenancy funcionando
- ✅ RBAC implementado (4 roles, 10+ permissions)
- ✅ RLS policies testadas
- ✅ E2E tests passando

**Score Atualizado:**
- Segurança: 8/10 → **10/10** (+2) 🎯
- Escalabilidade: 7/10 → **8/10** (+1)

**Deliverables:**
- [ ] PR #9: Authentication (Supabase Auth)
- [ ] PR #10: RBAC + Permissions
- [ ] PR #11: Multi-tenancy Testing

---

## SEMANA 4: Performance + Bundle Optimization

### 🎯 Objetivos
- ✅ Bundle size < 500KB gzipped
- ✅ Lighthouse score >95
- ✅ Memoização completa
- ✅ Code splitting
- ✅ Lazy loading

### 📋 Tasks Detalhadas

#### DIA 1-2: Bundle Optimization
**Tempo:** 16 horas

1. **Bundle Analyzer + Optimization**
```bash
bun add -D rollup-plugin-visualizer
bun add -D vite-plugin-compression
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      gzipSize: true,
      brotliSize: true
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'markdown-vendor': ['react-markdown', 'remark-gfm'],
          'mermaid-vendor': ['mermaid'],
          'highlight-vendor': ['highlight.js'],

          // Feature chunks
          'editor': ['./packages/editor/App.tsx'],
          'viewer': ['./packages/ui/components/Viewer.tsx']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

2. **Lazy Loading**
```typescript
// packages/editor/App.tsx
import React, { lazy, Suspense } from 'react';

// Lazy load heavy components
const Viewer = lazy(() => import('@obsidian-note-reviewer/ui/components/Viewer'));
const AnnotationPanel = lazy(() => import('@obsidian-note-reviewer/ui/components/AnnotationPanel'));
const SettingsPanel = lazy(() => import('@obsidian-note-reviewer/ui/components/SettingsPanel'));
const ExportModal = lazy(() => import('@obsidian-note-reviewer/ui/components/ExportModal'));

function App() {
  return (
    <div className="app">
      <Suspense fallback={<div>Loading...</div>}>
        <Viewer {...props} />
      </Suspense>

      <Suspense fallback={null}>
        {isPanelOpen && <AnnotationPanel {...props} />}
      </Suspense>

      <Suspense fallback={null}>
        {isSettingsOpen && <SettingsPanel {...props} />}
      </Suspense>
    </div>
  );
}
```

3. **Tree Shaking**
```typescript
// Antes (importa tudo)
import * as LucideIcons from 'lucide-react';

// Depois (importa apenas o necessário)
import { Settings, Download, Share2 } from 'lucide-react';

// packages/ui/utils/icon-imports.ts
export { Settings, Download, Share2, Plus, X, Check } from 'lucide-react';
```

4. **Dynamic Imports**
```typescript
// packages/ui/components/Viewer.tsx
import React, { useState } from 'react';

function Viewer() {
  const [mermaid, setMermaid] = useState<any>(null);

  const loadMermaid = async () => {
    if (!mermaid) {
      const { default: m } = await import('mermaid');
      setMermaid(m);
    }
  };

  // Só carrega Mermaid quando necessário
  useEffect(() => {
    if (hasMermaidBlocks) {
      loadMermaid();
    }
  }, [hasMermaidBlocks]);
}
```

**Validação:**
```bash
# Build e analisar
bun run build
open dist/stats.html

# Targets:
# - Total bundle: < 500KB gzipped
# - Vendor chunks: < 300KB
# - App chunks: < 200KB

# Verificar compression
ls -lh dist/*.br
# Deve ter arquivos .br (brotli compressed)
```

---

#### DIA 3: Performance Optimization
**Tempo:** 8 horas

1. **Memoização Completa**
```typescript
// packages/editor/App.tsx
import React, { useMemo, useCallback } from 'react';

const App = () => {
  // Memoize expensive computations
  const blocks = useMemo(
    () => parseMarkdownToBlocks(markdown),
    [markdown]
  );

  const diffOutput = useMemo(
    () => exportDiff(blocks, annotations),
    [blocks, annotations]
  );

  // Memoize callbacks
  const handleAddAnnotation = useCallback((annotation: Annotation) => {
    setAnnotations(prev => [...prev, annotation]);
  }, []);

  const handleSave = useCallback(async () => {
    // ... save logic
  }, [vaultPath, notePath, blocks]);

  return (
    <MemoizedViewer
      blocks={blocks}
      onAddAnnotation={handleAddAnnotation}
    />
  );
};

// Memoize components
const MemoizedViewer = React.memo(Viewer, (prev, next) => {
  return (
    prev.blocks === next.blocks &&
    prev.annotations === next.annotations &&
    prev.mode === next.mode
  );
});
```

2. **Virtual Scrolling (para listas longas)**
```bash
bun add react-window
```

```typescript
// packages/ui/components/AnnotationList.tsx
import { FixedSizeList } from 'react-window';

export function AnnotationList({ annotations }: { annotations: Annotation[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <AnnotationItem annotation={annotations[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={annotations.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

3. **Debounce/Throttle**
```bash
bun add lodash-es
bun add -D @types/lodash-es
```

```typescript
// packages/ui/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage:
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  // API call com debounce
  if (debouncedSearch) {
    searchNotes(debouncedSearch);
  }
}, [debouncedSearch]);
```

**Validação:**
```bash
# Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Targets:
# - Performance: >95
# - Accessibility: >95
# - Best Practices: >95
# - SEO: >90

# React DevTools Profiler
# Verificar re-renders desnecessários
```

---

#### DIA 4-5: Web Vitals + PWA
**Tempo:** 16 horas

1. **Core Web Vitals**
```bash
bun add web-vitals
```

```typescript
// packages/ui/lib/vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  onCLS((metric) => {
    console.log('CLS:', metric);
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_delta: metric.delta
      });
    }
  });

  onFID((metric) => console.log('FID:', metric));
  onFCP((metric) => console.log('FCP:', metric));
  onLCP((metric) => console.log('LCP:', metric));
  onTTFB((metric) => console.log('TTFB:', metric));
}

// Targets:
// - LCP (Largest Contentful Paint): < 2.5s
// - FID (First Input Delay): < 100ms
// - CLS (Cumulative Layout Shift): < 0.1
```

2. **PWA Configuration**
```bash
bun add -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Plannotator - Visual Plan Review',
        short_name: 'Plannotator',
        description: 'Interactive Plan Review for AI Coding Agents',
        theme_color: '#8b5cf6',
        background_color: '#1f2937',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.plannotator\.ai\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      }
    })
  ]
});
```

**Validação:**
```bash
# Build PWA
bun run build

# Testar offline
# 1. Abrir app
# 2. DevTools > Application > Service Workers > Offline
# 3. Refresh
# Deve continuar funcionando (cache)

# Lighthouse PWA audit
npx lighthouse http://localhost:3000 --view
# Target: PWA score >90
```

---

### 📊 Checkpoint Semana 4

**Métricas de Sucesso:**
- ✅ Bundle size: <500KB gzipped
- ✅ Lighthouse Performance: >95
- ✅ LCP <2.5s, FID <100ms, CLS <0.1
- ✅ PWA installable
- ✅ Offline-first funcionando

**Score Atualizado:**
- Performance: 7/10 → **10/10** (+3) 🎯
- Arquitetura: 9/10 → **10/10** (+1) 🎯

**Deliverables:**
- [ ] PR #12: Bundle Optimization
- [ ] PR #13: Performance (Memoization + Virtual Scrolling)
- [ ] PR #14: Web Vitals + PWA

---

# 🟠 FASE 2: ESCALA (Semanas 5-8)

**Objetivo:** 6/10 → 10/10 em Escalabilidade

## SEMANA 5: Serverless Architecture + Edge

### 🎯 Objetivos
- ✅ Migrar para Vercel Edge Functions
- ✅ Implementar CDN
- ✅ Database connection pooling
- ✅ Caching layer (Redis)

### 📋 Tasks Detalhadas

#### DIA 1-2: Vercel Edge Functions
**Tempo:** 16 horas

1. **API Routes (Vercel Serverless)**
```typescript
// api/notes/[slug].ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(data);
  }

  // ... outros métodos
}
```

2. **Edge Middleware (Geolocation, Auth)**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { geo, nextUrl } = request;

  // Geolocation headers
  const country = geo?.country || 'US';
  const city = geo?.city || 'Unknown';

  // Add custom headers
  const response = NextResponse.next();
  response.headers.set('x-user-country', country);
  response.headers.set('x-user-city', city);

  // Auth check
  const token = request.cookies.get('auth-token');
  if (!token && nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*']
};
```

3. **CDN Configuration**
```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate=30"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

**Validação:**
```bash
# Deploy to Vercel
vercel deploy --prod

# Testar edge functions
curl https://plannotator.ai/api/notes/test-slug
# Deve retornar < 100ms (edge)

# Verificar CDN
curl -I https://plannotator.ai/static/logo.png
# Deve ter headers de cache
```

---

#### DIA 3-4: Redis Caching
**Tempo:** 16 horas

1. **Upstash Redis Setup**
```bash
bun add @upstash/redis
```

```typescript
// packages/ui/lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get<T>(key);
    return value;
  },

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (ttl) {
      await redis.setex(key, ttl, JSON.stringify(value));
    } else {
      await redis.set(key, JSON.stringify(value));
    }
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
};

// Cache wrapper
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes
): Promise<T> {
  // Try cache first
  const cached = await cache.get<T>(key);
  if (cached) return cached;

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache
  await cache.set(key, data, ttl);

  return data;
}
```

2. **Cache Strategies**
```typescript
// api/notes/[slug].ts
import { withCache, cache } from '../../lib/cache';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query as { slug: string };

  if (req.method === 'GET') {
    // Cache GET requests (5 min TTL)
    const note = await withCache(
      `note:${slug}`,
      () => supabase.from('notes').select('*').eq('slug', slug).single(),
      300
    );

    return res.status(200).json(note);
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    // Invalidate cache on write
    await cache.del(`note:${slug}`);
    await cache.invalidatePattern(`note:${slug}:*`);

    // ... save logic
  }
}
```

3. **Database Connection Pooling**
```typescript
// packages/ui/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Pool } from '@neondatabase/serverless';

// Supabase client (para auth + realtime)
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Direct Postgres connection com pooling (para queries pesadas)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Max 10 connections
  idleTimeoutMillis: 30000
});

export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}
```

**Validação:**
```bash
# Testar cache hit/miss
time curl https://plannotator.ai/api/notes/test # MISS (slow)
time curl https://plannotator.ai/api/notes/test # HIT (fast <50ms)

# Load test com cache
ab -n 1000 -c 50 https://plannotator.ai/api/notes/test
# Target: >500 req/s com cache
```

---

### 📊 Checkpoint Semana 5

**Métricas de Sucesso:**
- ✅ Edge functions <100ms
- ✅ Cache hit rate >80%
- ✅ CDN configurado
- ✅ Connection pooling ativo

**Score Atualizado:**
- Escalabilidade: 8/10 → **9/10** (+1)
- Performance: 10/10 → **10/10** (mantido)

---

## SEMANA 6: Real-time Collaboration + WebSockets

### 🎯 Objetivos
- ✅ Real-time annotations (Supabase Realtime)
- ✅ Presence awareness (quem está online)
- ✅ Collaborative editing
- ✅ Conflict resolution

### 📋 Tasks Detalhadas

#### DIA 1-3: Real-time Infrastructure
**Tempo:** 24 horas

1. **Supabase Realtime Subscriptions**
```typescript
// packages/ui/hooks/useRealtimeNote.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Note, Annotation } from '../types';

export function useRealtimeNote(noteId: string) {
  const [note, setNote] = useState<Note | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    // Subscribe to note changes
    const noteChannel = supabase
      .channel(`note:${noteId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${noteId}`
        },
        (payload) => {
          setNote(payload.new as Note);
        }
      )
      .subscribe();

    // Subscribe to annotations
    const annotationsChannel = supabase
      .channel(`annotations:${noteId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'annotations',
          filter: `note_id=eq.${noteId}`
        },
        (payload) => {
          setAnnotations(prev => [...prev, payload.new as Annotation]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'annotations',
          filter: `note_id=eq.${noteId}`
        },
        (payload) => {
          setAnnotations(prev => prev.filter(a => a.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      noteChannel.unsubscribe();
      annotationsChannel.unsubscribe();
    };
  }, [noteId]);

  return { note, annotations };
}
```

2. **Presence Tracking**
```typescript
// packages/ui/hooks/usePresence.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

interface PresenceState {
  user_id: string;
  name: string;
  avatar_url: string;
  cursor?: { x: number; y: number };
}

export function usePresence(noteId: string) {
  const { user } = useAuth();
  const [presence, setPresence] = useState<PresenceState[]>([]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`presence:${noteId}`, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    // Track own presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as PresenceState[];
        setPresence(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            name: user.user_metadata.name,
            avatar_url: user.user_metadata.avatar_url,
            online_at: new Date().toISOString()
          });
        }
      });

    // Track cursor movements
    const handleMouseMove = (e: MouseEvent) => {
      channel.track({
        cursor: { x: e.clientX, y: e.clientY }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      channel.unsubscribe();
    };
  }, [user, noteId]);

  return presence;
}
```

3. **Collaborative Cursors UI**
```typescript
// packages/ui/components/CollaborativeCursors.tsx
import React from 'react';
import { usePresence } from '../hooks/usePresence';

export function CollaborativeCursors({ noteId }: { noteId: string }) {
  const presence = usePresence(noteId);

  return (
    <>
      {presence.map((user) => (
        user.cursor && (
          <div
            key={user.user_id}
            className="absolute pointer-events-none z-50"
            style={{
              left: user.cursor.x,
              top: user.cursor.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
              <span className="text-xs font-medium px-2 py-1 bg-blue-500 text-white rounded">
                {user.name}
              </span>
            </div>
          </div>
        )
      ))}
    </>
  );
}
```

**Validação:**
```bash
# Testar real-time
1. Abrir 2 browsers (Chrome + Firefox)
2. Fazer login como usuários diferentes
3. Abrir mesma nota
4. Adicionar anotação no Chrome
5. Deve aparecer no Firefox em <1s

# Verificar presence
# Cursores devem aparecer em tempo real
```

---

### 📊 Checkpoint Semana 6

**Métricas de Sucesso:**
- ✅ Real-time updates <1s latency
- ✅ Presence awareness funcionando
- ✅ Collaborative cursors
- ✅ Conflict resolution básico

**Score Atualizado:**
- Escalabilidade: 9/10 → **10/10** (+1) 🎯

---

## SEMANA 7-8: Observability + Load Testing

(Detalhes completos em...)

---

# 🟡 FASE 3: MONETIZAÇÃO (Semanas 9-10)

**Objetivo:** 3/10 → 10/10 em Recorrência, 6/10 → 10/10 em Lucratividade

## SEMANA 9: Paywall + Billing + Subscription

### 🎯 Objetivos
- ✅ Stripe integration
- ✅ Subscription management
- ✅ Usage tracking
- ✅ Feature gates

### 📋 Tasks (Resumo)

1. **Stripe Setup** (Dia 1-2)
2. **Subscription Tiers** (Dia 3)
3. **Usage Metering** (Dia 4)
4. **Billing Portal** (Dia 5)

---

## SEMANA 10: Growth Engine + Analytics + Retention

### 🎯 Objetivos
- ✅ Telemetria completa (PostHog)
- ✅ Email campaigns (Resend)
- ✅ Onboarding tutorial
- ✅ Referral program

---

# 🟢 FASE 4: EXCELÊNCIA (Semanas 11-12)

**Objetivo:** 5/10 → 10/10 em Vendabilidade, 8/10 → 10/10 em Inovação

## SEMANA 11: Onboarding + UX Polish + Documentation

## SEMANA 12: Launch + Marketing + Exit Prep

---

# 📊 SCORE FINAL PROJETADO

| Dimensão | Início | Meta | Progresso |
|----------|--------|------|-----------|
| Segurança | 2/10 | 10/10 | ✅ Semana 1-3 |
| Arquitetura | 7/10 | 10/10 | ✅ Semana 2-4 |
| Performance | 7/10 | 10/10 | ✅ Semana 4 |
| Escalabilidade | 6/10 | 10/10 | ✅ Semana 5-8 |
| Qualidade | 6/10 | 10/10 | ✅ Semana 1-2 |
| Recorrência | 3/10 | 10/10 | ⏳ Semana 9-10 |
| Lucratividade | 6/10 | 10/10 | ⏳ Semana 9-10 |
| Vendabilidade | 5/10 | 10/10 | ⏳ Semana 11-12 |
| Inovação | 8/10 | 10/10 | ⏳ Semana 11-12 |

**NOTA FINAL PROJETADA: 10/10** 🎯

---

**Próximo passo:** Executar Semana 1 (Security Hardening) imediatamente.
