# ✅ CHECKLIST DE EXECUÇÃO - PLANO 10/10

**Timeline:** 12 semanas (3 meses)
**Início:** HOJE
**Meta:** Transformar Plannotator de 5.95/10 para 10/10

---

## 📋 VISÃO GERAL

```
SEMANAS 1-4: FUNDAÇÃO      🔴 [Segurança 10/10, Arquitetura 10/10]
SEMANAS 5-8: ESCALA        🟠 [Escalabilidade 10/10, Performance 10/10]
SEMANAS 9-10: MONETIZAÇÃO  🟡 [Recorrência 10/10, Lucratividade 10/10]
SEMANAS 11-12: EXCELÊNCIA  🟢 [Vendabilidade 10/10, Inovação 10/10]
```

---

## 🔴 SEMANA 1: SECURITY HARDENING

### DIA 1: CVEs Críticos (4h) 🚨 CRÍTICO

- [ ] **Path Traversal Fix**
  ```bash
  # 1. Abrir apps/hook/server/index.ts
  # 2. Adicionar função isPathSafe() no topo
  # 3. Aplicar validação no endpoint /api/save (linha 75)
  # 4. Testar: curl com path malicioso deve retornar 403
  ```

- [ ] **XSS Mermaid Fix**
  ```bash
  bun add dompurify @types/dompurify
  # 1. Importar DOMPurify em packages/ui/components/Viewer.tsx
  # 2. Criar função sanitizeMermaidSVG()
  # 3. Aplicar sanitização na linha 770
  # 4. Testar: diagrama com <script> deve ser sanitizado
  ```

- [ ] **CORS Fix**
  ```bash
  # 1. Editar apps/portal/api/notes.ts
  # 2. Criar whitelist de origens (linha 12)
  # 3. Remover Allow-Origin: *
  # 4. Testar: origem não permitida deve ser bloqueada
  ```

- [ ] **Validação Final**
  ```bash
  bun test
  # Todos os testes devem passar
  git commit -m "fix: resolve 3 CVEs críticos (Path Traversal, XSS, CORS)"
  ```

**Tempo:** 4 horas
**Impacto:** Segurança 2/10 → 5/10

---

### DIA 2: Security Headers & CSP (6h)

- [ ] **Content Security Policy**
  ```bash
  # Ver PLANO_10_10.md Semana 1, Dia 2
  # Adicionar middleware addSecurityHeaders() em server/index.ts
  ```

- [ ] **Cookie Security**
  ```bash
  # Adicionar HttpOnly, Secure, SameSite flags
  # apps/portal/api/notes.ts
  ```

- [ ] **Rate Limiting**
  ```bash
  bun add @upstash/ratelimit @upstash/redis
  # Implementar rate limiting (10 req/10s)
  ```

- [ ] **Validação**
  ```bash
  curl -I http://localhost:PORT | grep "Content-Security-Policy"
  # Deve mostrar CSP header

  for i in {1..15}; do curl http://localhost:PORT/api/save; done
  # Deve retornar 429 após 10 requests
  ```

**Tempo:** 6 horas
**Impacto:** Segurança 5/10 → 7/10

---

### DIA 3: CI/CD Pipeline (8h)

- [ ] **GitHub Actions Workflow**
  ```bash
  # Criar .github/workflows/security.yml
  # Ver código completo em PLANO_10_10.md
  ```

- [ ] **Pre-commit Hooks**
  ```bash
  bun add -D husky lint-staged
  npm pkg set scripts.prepare="husky install"
  npx husky install
  npx husky add .husky/pre-commit "bun run lint-staged"
  ```

- [ ] **Dependency Security**
  ```bash
  # Criar scripts/security-audit.sh
  chmod +x scripts/security-audit.sh
  ./scripts/security-audit.sh
  ```

- [ ] **Validação**
  ```bash
  git add .
  git commit -m "test: verify pre-commit hooks"
  # Deve rodar testes antes de commitar
  ```

**Tempo:** 8 horas
**Impacto:** Segurança 7/10 → 8/10, Qualidade 6/10 → 7/10

---

### DIA 4-5: Code Quality & Testing (16h)

- [ ] **ESLint + Prettier Rigoroso**
  ```bash
  bun add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
  bun add -D eslint-plugin-react eslint-plugin-react-hooks
  bun add -D eslint-plugin-security eslint-plugin-import

  # Criar .eslintrc.cjs (ver PLANO_10_10.md)
  ```

- [ ] **Testes de Segurança**
  ```bash
  # Criar packages/ui/utils/__tests__/sanitize.test.ts
  # Criar apps/hook/server/__tests__/path-validation.test.ts
  bun test
  ```

- [ ] **Coverage Target: 90%**
  ```bash
  bun test --coverage
  # Target: >90% em Statements, Branches, Functions, Lines
  ```

- [ ] **Validação Final**
  ```bash
  bun test --coverage
  # Verificar coverage report

  bun run lint
  # 0 erros
  ```

**Tempo:** 16 horas
**Impacto:** Qualidade 7/10 → 9/10, Segurança 8/10 → 10/10 ✅

---

### 📊 CHECKPOINT SEMANA 1

- [ ] **Score Atingido:**
  - Segurança: 2/10 → 10/10 ✅
  - Qualidade: 6/10 → 9/10 ⚡

- [ ] **Deliverables:**
  - [ ] PR #1: Security Hardening (CVEs resolvidos)
  - [ ] PR #2: CI/CD Pipeline
  - [ ] PR #3: Security Headers & Rate Limiting
  - [ ] PR #4: Code Quality (ESLint + Testes)

- [ ] **Validação Final:**
  ```bash
  # Rodar suite completa
  bun test
  bun run lint
  bun audit

  # Verificar GitHub Actions
  # Todos os checks devem passar ✅
  ```

**Status:** ⏳ Em Andamento / ✅ Completo

---

## 🔴 SEMANA 2: ARCHITECTURE REFACTOR

### DIA 1: Database Setup (8h)

- [ ] **Supabase Schema**
  ```bash
  # Criar migrations/001_initial_schema.sql
  # Ver schema completo em PLANO_10_10.md

  # Aplicar migration no Supabase
  supabase db push
  ```

- [ ] **Supabase Client**
  ```bash
  bun add @supabase/supabase-js @supabase/auth-helpers-react

  # Criar packages/ui/lib/supabase.ts
  # Criar packages/ui/services/NotesService.ts
  ```

- [ ] **Validação**
  ```bash
  bun test packages/ui/services/__tests__/NotesService.test.ts
  # CRUD deve funcionar
  ```

**Tempo:** 8 horas
**Impacto:** Escalabilidade 6/10 → 7/10

---

### DIA 2-3: Refactor God Component (16h)

- [ ] **Extrair Custom Hooks**
  ```bash
  # Criar packages/ui/hooks/useAnnotations.ts
  # Criar packages/ui/hooks/useSaveToVault.ts
  # Criar packages/ui/hooks/useApiMode.ts
  ```

- [ ] **State Management (Zustand)**
  ```bash
  bun add zustand

  # Criar packages/ui/store/useAnnotationStore.ts
  # Criar packages/ui/store/useSettingsStore.ts
  ```

- [ ] **Refatorar App.tsx**
  ```bash
  # Simplificar de 772 → <200 linhas
  # Usar hooks e stores
  ```

- [ ] **Validação**
  ```bash
  wc -l packages/editor/App.tsx
  # Deve ter <200 linhas ✅

  bun test packages/editor
  # Todos os testes devem passar
  ```

**Tempo:** 16 horas
**Impacto:** Arquitetura 7/10 → 9/10, Qualidade 9/10 → 10/10 ✅

---

### DIA 4-5: Error Boundaries & Observability (16h)

- [ ] **Error Boundaries**
  ```bash
  # Criar packages/ui/components/ErrorBoundary.tsx
  ```

- [ ] **Logging Estruturado**
  ```bash
  bun add pino pino-pretty
  # Criar packages/ui/lib/logger.ts
  ```

- [ ] **Monitoramento (Sentry)**
  ```bash
  bun add @sentry/react @sentry/vite-plugin
  # Criar packages/ui/lib/sentry.ts
  ```

- [ ] **Validação**
  ```bash
  # Testar error boundary
  # Adicionar throw new Error('Test') em componente
  # Deve mostrar tela de erro gracefully
  ```

**Tempo:** 16 horas
**Impacto:** Qualidade 10/10 (mantido), Arquitetura 9/10 → 10/10 ✅

---

### 📊 CHECKPOINT SEMANA 2

- [ ] **Score Atingido:**
  - Arquitetura: 7/10 → 10/10 ✅
  - Qualidade: 9/10 → 10/10 ✅
  - Escalabilidade: 6/10 → 7/10 ⚡

- [ ] **Deliverables:**
  - [ ] PR #5: Database Migration (Supabase)
  - [ ] PR #6: God Component Refactor
  - [ ] PR #7: State Management (Zustand)
  - [ ] PR #8: Error Handling & Observability

---

## 🔴 SEMANA 3: AUTH + MULTI-TENANCY

### DIA 1-2: Authentication (16h)

- [ ] **Supabase Auth Setup**
  ```bash
  # Criar packages/ui/lib/auth.ts
  # Criar packages/ui/providers/AuthProvider.tsx
  # Criar packages/ui/components/LoginForm.tsx
  ```

- [ ] **Validação**
  ```bash
  # Testar fluxo completo:
  # 1. Signup novo usuário
  # 2. Login email/password
  # 3. Login OAuth (Google)
  # 4. Logout
  # 5. Session persistence
  ```

**Tempo:** 16 horas

---

### DIA 3-4: RBAC (16h)

- [ ] **Role System**
  ```bash
  # Criar packages/ui/lib/permissions.ts
  # Criar packages/ui/hooks/usePermissions.ts
  # Criar packages/ui/components/ProtectedRoute.tsx
  ```

- [ ] **Validação**
  ```bash
  # Testar permissões:
  # VIEWER não pode editar
  # MEMBER pode criar notas
  # ADMIN pode gerenciar users
  # OWNER pode deletar org
  ```

**Tempo:** 16 horas

---

### DIA 5: Multi-tenancy Testing (8h)

- [ ] **E2E Tests**
  ```bash
  # Criar tests/e2e/multi-tenancy.test.ts
  bun test:e2e
  ```

**Tempo:** 8 horas

---

### 📊 CHECKPOINT SEMANA 3

- [ ] **Score Atingido:**
  - Segurança: 10/10 (mantido) ✅
  - Escalabilidade: 7/10 → 8/10 ⚡

---

## 🔴 SEMANA 4: PERFORMANCE

### DIA 1-2: Bundle Optimization (16h)

- [ ] **Bundle Analyzer**
  ```bash
  bun add -D rollup-plugin-visualizer vite-plugin-compression

  # Configurar vite.config.ts
  bun run build
  open dist/stats.html
  ```

- [ ] **Lazy Loading**
  ```bash
  # Refatorar imports para lazy()
  # Mermaid, AnnotationPanel, SettingsPanel
  ```

- [ ] **Tree Shaking**
  ```bash
  # Substituir import * por imports específicos
  # lucide-react, lodash, etc
  ```

- [ ] **Validação**
  ```bash
  ls -lh dist/*.br
  # Bundle total <500KB gzipped ✅
  ```

**Tempo:** 16 horas
**Impacto:** Performance 7/10 → 9/10

---

### DIA 3: Performance Optimization (8h)

- [ ] **Memoização**
  ```bash
  # Adicionar useMemo em parseMarkdownToBlocks
  # Adicionar React.memo em componentes puros
  # useCallback para funções
  ```

- [ ] **Virtual Scrolling**
  ```bash
  bun add react-window
  # Implementar em AnnotationList
  ```

- [ ] **Debounce**
  ```bash
  # Criar useDebounce hook
  # Aplicar em search, auto-save
  ```

**Tempo:** 8 horas

---

### DIA 4-5: Web Vitals + PWA (16h)

- [ ] **Core Web Vitals**
  ```bash
  bun add web-vitals
  # Implementar reportWebVitals()
  ```

- [ ] **PWA**
  ```bash
  bun add -D vite-plugin-pwa
  # Configurar manifest + service worker
  ```

- [ ] **Validação**
  ```bash
  npx lighthouse http://localhost:3000 --view
  # Performance >95
  # PWA >90
  # LCP <2.5s, FID <100ms, CLS <0.1
  ```

**Tempo:** 16 horas
**Impacto:** Performance 9/10 → 10/10 ✅, Arquitetura 10/10 (mantido)

---

### 📊 CHECKPOINT SEMANA 4

- [ ] **Score Atingido:**
  - Performance: 7/10 → 10/10 ✅
  - Arquitetura: 10/10 (mantido) ✅

- [ ] **Deliverables:**
  - [ ] PR #12: Bundle Optimization
  - [ ] PR #13: Performance (Memoization)
  - [ ] PR #14: Web Vitals + PWA

**FASE 1 COMPLETA:** ✅ Fundação 100%

---

## 🟠 SEMANAS 5-8: ESCALA

### Resumo de Tasks

**Semana 5:** Serverless + Edge + Redis Caching
**Semana 6:** Real-time Collaboration + WebSockets
**Semana 7:** Observability (Datadog/New Relic)
**Semana 8:** Load Testing + Auto-scaling

**Objetivo:** Escalabilidade 8/10 → 10/10 ✅

_(Ver detalhes em PLANO_10_10_PARTE_2.md)_

---

## 🟡 SEMANAS 9-10: MONETIZAÇÃO

### Resumo de Tasks

**Semana 9:**
- [ ] Stripe integration
- [ ] Subscription tiers (FREE, PRO, TEAM)
- [ ] Usage metering
- [ ] Billing portal

**Semana 10:**
- [ ] Telemetria (PostHog)
- [ ] Email campaigns (Resend)
- [ ] Onboarding tutorial
- [ ] Referral program

**Objetivo:** Recorrência 3/10 → 10/10 ✅, Lucratividade 6/10 → 10/10 ✅

---

## 🟢 SEMANAS 11-12: EXCELÊNCIA

### Resumo de Tasks

**Semana 11:**
- [ ] Onboarding tutorial completo
- [ ] UX Polish (micro-interactions)
- [ ] Documentation site (docs.plannotator.ai)
- [ ] Video demos

**Semana 12:**
- [ ] Launch campaign
- [ ] Product Hunt launch
- [ ] Pitch deck para Anthropic
- [ ] Exit prep (data room, metrics dashboard)

**Objetivo:** Vendabilidade 5/10 → 10/10 ✅, Inovação 8/10 → 10/10 ✅

---

## 📊 SCORECARD FINAL

| Dimensão | Início | Meta | Status |
|----------|--------|------|--------|
| Segurança | 2/10 | 10/10 | ⏳ Semana 1-3 |
| Arquitetura | 7/10 | 10/10 | ⏳ Semana 2-4 |
| Performance | 7/10 | 10/10 | ⏳ Semana 4 |
| Qualidade | 6/10 | 10/10 | ⏳ Semana 1-2 |
| Escalabilidade | 6/10 | 10/10 | ⏳ Semana 5-8 |
| Recorrência | 3/10 | 10/10 | ⏳ Semana 9-10 |
| Lucratividade | 6/10 | 10/10 | ⏳ Semana 9-10 |
| Vendabilidade | 5/10 | 10/10 | ⏳ Semana 11-12 |
| Inovação | 8/10 | 10/10 | ⏳ Semana 11-12 |

**NOTA FINAL:** 5.95/10 → **10/10** 🎯

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

### HOJE (Próximas 4 horas)

1. [ ] Ler PLANO_10_10.md completo
2. [ ] Iniciar Semana 1, Dia 1 (CVEs Críticos)
3. [ ] Implementar Path Traversal fix (30 min)
4. [ ] Implementar XSS Mermaid fix (45 min)
5. [ ] Implementar CORS fix (15 min)
6. [ ] Testar tudo (30 min)
7. [ ] Git commit + push

### ESTA SEMANA

- [ ] Completar Semana 1 (Security Hardening)
- [ ] 4 PRs merged
- [ ] Segurança 2/10 → 10/10 ✅

### PRÓXIMOS 30 DIAS

- [ ] Completar Fase 1 (Semanas 1-4)
- [ ] Fundação 100%
- [ ] Production-ready

---

## 📁 DOCUMENTOS DO PLANO

1. **PLANO_10_10.md** - Plano mestre detalhado (Fase 1: Fundação)
2. **PLANO_10_10_PARTE_2.md** - Fases 2, 3, 4 (Escala, Monetização, Excelência)
3. **CHECKLIST_EXECUCAO.md** - Este checklist (use para tracking)
4. **ANALISE_COMPLETA_PLANNOTATOR.md** - Análise técnica base
5. **QUICK_WINS_IMPLEMENTATION.md** - Guia rápido dos primeiros fixes

---

## 🎯 TRACKING DE PROGRESSO

**Semana Atual:** _____

**Status Geral:**
- 🔴 Fundação (Semanas 1-4): __ / 4 completas
- 🟠 Escala (Semanas 5-8): __ / 4 completas
- 🟡 Monetização (Semanas 9-10): __ / 2 completas
- 🟢 Excelência (Semanas 11-12): __ / 2 completas

**Score Atual:** ___ / 10

---

**Última atualização:** _____
**Próxima revisão:** _____

---

**IMPORTANTE:** Marque cada item como completo ✅ conforme avança.
Use `git commit` frequentemente para não perder progresso.

**BOA SORTE! 🚀**
