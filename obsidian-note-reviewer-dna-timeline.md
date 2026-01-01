---
dna_type: timeline
produto: Obsidian Note Reviewer
versao: 0.2.1
autor: Alex Donega
data_criacao: 2026-01-01
ultima_atualizacao: 2026-01-01
tags:
  - historia
  - milestones
  - evolucao
  - roadmap
---

# DNA TIMELINE - Obsidian Note Reviewer

> **Jornada**: Da frustração com revisão em terminal ao sistema visual integrado com AI agents e Obsidian.

---

## LINHA DO TEMPO COMPLETA

### 🌱 **FASE 1: PROBLEMA IDENTIFICADO** (Dez 2024 - Jan 2025)

#### Dezembro 2024 - **O Incômodo Inicial**

**Contexto:**
- Alex Donega usa Claude Code diariamente para gerar planos e documentação
- Frustração crescente com revisão de documentos longos em terminal
- Copia/cola manual para Obsidian, perdendo formatação

**Dor Específica:**
```
Situação típica:
1. Claude gera plano de 200 linhas com frontmatter, callouts, tabelas
2. Terminal mostra texto puro (callouts como "> [!note]")
3. Scrollar, entender estrutura, fazer anotações = doloroso
4. Copiar para Obsidian manualmente
5. Perder formatação, recriar frontmatter
6. Frustração: "Tem que existir jeito melhor!"
```

**Primeira Tentativa:**
- Experimenta copiar direto para Obsidian
- Problema: frontmatter quebra, callouts não funcionam
- Tenta usar VSCode com preview
- Problema: não integra com Claude Code

---

#### Janeiro 2025 - **Descoberta e Decisão**

**Descoberta do Plannotator:**
- Encontra projeto open source de revisão colaborativa
- Vê potencial: sistema de anotações robusto
- Identifica gaps:
  - Interface só em inglês
  - Sem suporte a frontmatter YAML
  - Não renderiza callouts Obsidian
  - Falta integração com salvamento em vaults

**Decisão de Fork:**
- ✅ Base sólida (sistema de anotações funciona)
- ✅ Open source (BSL-1.1)
- ✅ Stack moderna (React + TypeScript)
- 🎯 Adaptável para Obsidian + mercado brasileiro

**Commit Inicial:**
```
Data: ~Janeiro 2025
Ação: Fork do repositório Plannotator
Branch: main (inicial)
```

---

### 🚀 **FASE 2: MVP FUNCIONAL** (Jan 2025)

#### Janeiro 2025 (Semana 1-2) - **Adaptações Básicas**

**Milestone: Interface em Português**
- Traduz 100% da UI para pt-BR
- Adapta linguagem para brasileiro autêntico (não tradução robótica)
- Mensagens de erro em português

**Milestone: Frontmatter YAML Editável**
- Implementa parser usando js-yaml
- Cria editor visual de frontmatter
- Validação em tempo real
- Preservação de formatação ao exportar

**Commit Marcante:**
```
feat: Add YAML frontmatter editing with visual interface
- Parse frontmatter com js-yaml
- Editor inline de campos
- Validação de sintaxe
- Preview em tempo real
```

---

#### Janeiro 2025 (Semana 3-4) - **Integração Obsidian**

**Milestone: Endpoint `/api/save`**
- Cria API local para salvar notas direto no vault
- Integração com filesystem (fs/promises)
- Validação de paths

**Milestone: Templates Inteligentes**
- Mapeia 12 tipos de nota
- Frontmatter pré-preenchido
- Paths automáticos (Atlas/Atomos/, Sources/Videos/, etc.)

**Tag Git:**
```
v0.1.0 - MVP Funcional
- Interface pt-BR completa
- Frontmatter editável
- Salvamento em vault local
- Templates básicos
```

---

### 🎯 **FASE 3: REFINAMENTO** (Jan 2026)

#### Janeiro 2026 (Semana 1) - **Renderização Avançada**

**Milestone: Callouts do Obsidian**
```
Commit: 2026-01-01 17:06
"Add complete Obsidian callouts rendering with Mermaid"
```

**Features:**
- Suporte a 15+ tipos de callouts (note, warning, info, tip, etc.)
- Renderização de Mermaid DENTRO de callouts (único no mercado)
- Parser customizado para detectar blocos Mermaid

**Impacto:**
- ✅ Primeira ferramenta a renderizar callouts Obsidian perfeitamente
- ✅ Suporte a diagramas complexos em callouts
- 🎯 Diferencial técnico claro vs. concorrentes

---

#### Janeiro 2026 (Semana 1) - **UX Melhorada**

**Milestone: Modo de Edição + Comentários Globais**
```
Commit: 2026-01-01 17:11
"Add edit mode, 404 page and global comments"
```

**Features:**
- Modo Autor / Modo Revisor claramente separados
- Comentários globais (não vinculados a texto)
- Página 404 customizada para notas não encontradas
- Melhor organização de anotações

**Milestone: Bug Fixes e Polimento**
```
Commit: 2026-01-01 17:29
"Fix: Corrige bug no GlobalCommentInput"
```

---

#### Janeiro 2026 (Semana 1) - **Organização e Limpeza**

**Milestone: Refatoração**
```
Commit: 2026-01-01 19:08
"Clean: Remove temporary migration scripts"
```

**Tag Git:**
```
v0.2.0 - Renderização Completa
- Callouts do Obsidian + Mermaid
- Modo autor/revisor/visualização
- Comentários globais
- 410 testes implementados
```

---

### 🛡️ **FASE 4: SEGURANÇA E QUALIDADE** (Jan 2026 - Atual)

#### Janeiro 2026 (Semana 1-2) - **Security Audit**

**Análise Técnica Completa:**
- Identificadas 3 CVEs críticas:
  1. Path traversal em `/api/save`
  2. XSS via Mermaid SVG
  3. CORS overly permissive

**15 Branches de Correção Criadas:**
- `auto-claude/add-aria-labels-to-toolbar-buttons`
- `auto-claude/add-keyboard-shortcuts-for-common-actions`
- `auto-claude/implement-content-security-policy-csp-headers`
- `auto-claude/add-sanitization-to-prevent-xss-in-mermaid-rendering`
- `auto-claude/add-path-traversal-protection`
- `auto-claude/improve-cors-configuration`
- `auto-claude/add-undo-redo-functionality`
- `auto-claude/add-json-export-option`
- E mais...

**Status:** Em revisão, merge pendente

---

#### Janeiro 2026 (Atual) - **v0.2.1 Estável**

**Estado Atual:**
- ✅ 410 arquivos de teste (cobertura excepcional)
- ✅ Deploy Vercel funcionando (https://r.alexdonega.com.br)
- ✅ CI/CD configurado (GitHub Actions)
- ✅ Executáveis standalone compilados (113MB)
- 🚧 Correções de segurança em branches
- 🚧 Melhorias de acessibilidade em desenvolvimento

**Tag Git:**
```
v0.2.1 - Beta Funcional
- Todas features principais implementadas
- Testes abrangentes
- Deploy production-ready
- Aguardando correções de segurança para lançamento público
```

---

## MARCOS IMPORTANTES (RESUMO)

| Data | Marco | Impacto |
|:-----|:------|:--------|
| **Dez 2024** | Identificação do problema | Frustração com revisão em terminal |
| **Jan 2025** | Fork do Plannotator | Base de código estabelecida |
| **Jan 2025** | v0.1.0 - MVP | Interface pt-BR + frontmatter + templates |
| **Jan 2026** | Callouts + Mermaid | Diferencial técnico único |
| **Jan 2026** | v0.2.0 - Feature Complete | Todos modos, 410 testes |
| **Jan 2026** | Security Audit | 15 branches de correções |
| **Jan 2026** | v0.2.1 - Beta Estável | **Estado atual** |

---

## MÉTRICAS DE EVOLUÇÃO

### Commits e Desenvolvimento

**Velocidade de Desenvolvimento:**
```
Jan 2025:  ~20-30 commits (setup inicial + MVP)
Jan 2026:  ~150 commits (features + refinamento)
Média:     ~5 commits/dia (altamente ativo)
```

**Branches Ativas:**
```
main:               1 (produção)
auto-claude/*:      15 (melhorias e correções)
Total:              16 branches
```

### Código e Testes

**Evolução de LOC:**
```
v0.1.0:  ~3.000 linhas
v0.2.0:  ~7.000 linhas
v0.2.1:  ~7.582 linhas (+ 410 arquivos de teste)
```

**Cobertura de Testes:**
```
v0.1.0:  Sem testes
v0.2.0:  ~200 testes
v0.2.1:  410 arquivos de teste 🎉
```

### Dependências

**Evolução do Stack:**
```
v0.1.0:
- React 18.x
- Tailwind CSS 3.x
- Webpack

v0.2.1:
- React 19.2.3 ⬆️ (latest)
- Tailwind CSS 4.1.18 ⬆️ (v4)
- Vite 6.2.0 ⬆️ (migration de Webpack)
- Bun 1.3.5 ⬆️ (adicionado)
```

---

## PRÓXIMOS PASSOS (ROADMAP)

### 🔥 **CURTO PRAZO** (Jan-Fev 2026)

#### Semana 1-2 - **Correções de Segurança**
- [ ] Merge de 15 branches de correções
- [ ] Fix CVE-1: Path traversal
- [ ] Fix CVE-2: XSS via Mermaid
- [ ] Fix CVE-3: CORS permissivo
- [ ] Testes de penetração

**Milestone:**
```
v0.3.0 - Security Hardened
- Zero CVEs críticos
- CSP headers implementados
- Input sanitization completa
```

---

#### Semana 3-4 - **Acessibilidade e UX**
- [ ] ARIA labels completos
- [ ] Keyboard navigation expandida
- [ ] Focus indicators visíveis
- [ ] Screen reader testing

**Milestone:**
```
v0.4.0 - Accessibility Compliant
- WCAG 2.1 AA conformance
- Keyboard-only usable
```

---

### 🎯 **MÉDIO PRAZO** (Mar-Abr 2026)

#### Março 2026 - **Lançamento Público**

**Preparação:**
- [ ] Landing page (apps/marketing)
- [ ] Documentação completa (Getting Started, API Reference)
- [ ] Vídeos de demonstração
- [ ] Guia de instalação ilustrado

**Lançamento:**
- [ ] Post no r/ObsidianMD
- [ ] Submissão para Obsidian Roundup
- [ ] Tweet thread com demos
- [ ] Product Hunt launch (se aplicável)

**Milestone:**
```
v1.0.0 - Public Launch
- Marketing site live
- Docs completas
- Zero bugs críticos
- Community feedback loop
```

---

#### Abril 2026 - **Integração MCP**

**Features:**
- [ ] Servidor MCP customizado para Obsidian
- [ ] Leitura/escrita de notas via MCP tools
- [ ] Substituição do endpoint `/api/save` local
- [ ] Integração nativa com Claude 4.5+

**Milestone:**
```
v1.1.0 - MCP Integration
- Servidor MCP standalone
- Claude Code integration nativa
- Deprecation de endpoint local
```

---

### 🚀 **LONGO PRAZO** (Mai 2026+)

#### Q2 2026 - **Monetização e Escala**

**Features Pagas (Possíveis):**
- [ ] Templates customizados premium
- [ ] Sync cloud de anotações
- [ ] Colaboração em tempo real
- [ ] Analytics de revisão

**Modelo de Negócio:**
```
Free:
- Uso local ilimitado
- Templates básicos
- Compartilhamento stateless

Pro ($5-10/mês):
- Templates premium (biblioteca expandida)
- Sync cloud de configurações
- Suporte prioritário

Teams ($X/mês):
- Colaboração em tempo real
- Dashboard de métricas
- SSO/SAML
```

---

#### Q3 2026 - **Marketplace e Plugins**

**Features:**
- [ ] Plugin API aberta
- [ ] Marketplace de templates comunitários
- [ ] Webhooks para integrações
- [ ] CLI expandido

---

## LIÇÕES APRENDIDAS POR FASE

### v0.1.0 - MVP
✅ **O que funcionou:**
- Fork de projeto maduro economizou meses
- Foco em pt-BR criou diferenciação imediata
- Frontmatter editável foi killer feature

❌ **O que não funcionou:**
- Testes insuficientes (bugs em produção)
- Segurança não foi prioridade inicial

📚 **Aprendizado:**
> "MVP não significa 'sem testes'. Qualidade desde dia 1 economiza refatoração depois."

---

### v0.2.0 - Feature Complete
✅ **O que funcionou:**
- Renderização de callouts + Mermaid = diferencial único
- 410 testes deram confiança para refatorar
- Monorepo organizou código compartilhado

❌ **O que não funcionou:**
- 15 branches de correções = dívida técnica acumulada
- Lançamento atrasado por falta de security review inicial

📚 **Aprendizado:**
> "Security audit deveria ser antes de feature freeze, não depois."

---

### v0.2.1 - Atual
✅ **O que está funcionando:**
- Desenvolvimento ativo (5 commits/dia) mantém momentum
- Building in public (15 branches abertas) gera transparência
- Deploy automatizado permite iterações rápidas

🚧 **Desafios Atuais:**
- Merge de 15 branches sem regressões
- Documentação não acompanhou velocidade de features
- Analytics ausente impede validação de uso real

📚 **Aprendizado em Progresso:**
> "Código rápido é bom. Código seguro e documentado é melhor."

---

## VISÃO DE FUTURO

### 12 Meses (Jan 2027)
```
Obsidian Note Reviewer v2.0:
- 1.000+ usuários ativos
- MCP integration nativa
- Marketplace de templates comunitários
- Revenue: $500-1.000/mês (freemium)
- Featured no Obsidian Roundup 3x
- 4.5+ estrelas em reviews
```

### 24 Meses (Jan 2028)
```
Obsidian Note Reviewer v3.0:
- 10.000+ usuários
- Plugin oficial do Obsidian (marketplace)
- Colaboração em tempo real
- Revenue: $5-10k/mês
- Equipe expandida (1-2 contratações)
- Integração com Notion, Roam, etc.
```

---

## MARCO ZERO: ONDE TUDO COMEÇOU

**Frase que iniciou o projeto:**

> "Tem que existir um jeito melhor de revisar esses planos do Claude. Não aguento mais scrollar 200 linhas de terminal."
>
> — Alex Donega, Dezembro 2024

**Frase que define o momento atual:**

> "Construímos a ferramenta que eu queria que existisse. Agora vamos compartilhar com quem tem a mesma dor."
>
> — Alex Donega, Janeiro 2026

---

**Versão**: 1.0
**Última Revisão**: 2026-01-01
**Próxima Revisão**: Após v1.0.0 Public Launch
