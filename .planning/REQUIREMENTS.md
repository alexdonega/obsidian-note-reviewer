# Requirements: Obsidian Note Reviewer

**Defined:** 2025-02-04
**Core Value:** Usuários podem revisar visualmente notas e planos, com integração perfeita com Claude Code e colaboração em tempo real.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Autenticação

- [ ] **AUTH-01**: User pode criar conta com email e senha
- [ ] **AUTH-02**: User pode fazer login com email/senha ou OAuth (GitHub/Google)
- [ ] **AUTH-03**: User session persiste across browser refresh
- [ ] **AUTH-04**: User pode fazer logout de qualquer página
- [ ] **AUTH-05**: User profile com display name e avatar

### Anotações e Revisão

- [ ] **ANNO-01**: User pode adicionar anotações visuais em elementos específicos do markdown
- [ ] **ANNO-02**: User pode criar threads de comentários com @mentions
- [ ] **ANNO-03**: User pode responder a comentários existentes
- [ ] **ANNO-04**: User pode definir status das anotações (open/in-progress/resolved)
- [ ] **ANNO-05**: User pode ver histórico de versões do documento
- [ ] **ANNO-06**: User pode restaurar versões anteriores do documento
- [ ] **ANNO-07**: Markdown rendering suporta sintaxe padrão com code blocks e imagens

### Claude Code Integration

- [ ] **CLAU-01**: Hook abre reviewer automaticamente ao criar nota no Obsidian
- [ ] **CLAU-02**: Hook abre reviewer automaticamente ao ativar plan mode no Claude Code
- [ ] **CLAU-03**: Anotações são enviadas de volta ao Claude Code em formato estruturado
- [ ] **CLAU-04**: Prompt fixo automático formata as revisões para o Claude Code
- [ ] **CLAU-05**: Campo editável permite customizar o prompt antes de enviar
- [ ] **CLAU-06**: Todas as anotações são incluídas: edições, comentários globais, comentários individuais, exclusões, marcações

### IA Avançada

- [ ] **AI-01**: IA sugere anotações proativamente (issue identification)
- [ ] **AI-02**: IA entende contexto do vault Obsidian (backlinks, graph)
- [ ] **AI-03**: IA gera sumários executivos de documentos anotados

### Colaboração

- [ ] **COLL-01**: User pode ver indicadores de presença de outros usuários
- [ ] **COLL-02**: User pode ver avatares/cursor de usuários ativos no documento
- [ ] **COLL-03**: User pode compartilhar review via link amigável (slug-based)
- [ ] **COLL-04**: Guest access permite visualizar reviews sem login
- [ ] **COLL-05**: Workflow nativo com Obsidian vault (acesso local)

### Multi-Document

- [ ] **MULT-01**: User pode revisar múltiplos documentos simultaneamente
- [ ] **MULT-02**: User pode navegar entre documentos com tabs
- [ ] **MULT-03**: User pode ver referências cruzadas entre documentos

### Mobile

- [ ] **MOBL-01**: Interface funciona em dispositivos mobile
- [ ] **MOBL-02**: User pode comparar views mobile/tablet/desktop (breakpoint comparison)

### Configurações

- [ ] **CONF-01**: User pode configurar preferências (theme dark/light automático)
- [ ] **CONF-02**: User pode configurar local de salvamento (vault Obsidian, nuvem, ambos)
- [ ] **CONF-03**: User pode customizar prompt de integração Claude Code
- [ ] **CONF-04**: Página de configurações tem design moderno estilo Apple

### Compartilhamento e URLs

- [ ] **SHAR-01**: URLs amigáveis com slug (r.alexdonega.com.br/plan/nome-do-plano)
- [ ] **SHAR-02**: Slug é único e validado
- [ ] **SHAR-03**: Multi-usuário podem ver e revisar planos compartilhados

### Monetização

- [ ] **MONY-01**: Sistema de freemium funcional (plano free vs pago)
- [ ] **MONY-02**: Plano free limita colaboradores (uso individual)
- [ ] **MONY-03**: Plano pago permite colaboradores ilimitados
- [ ] **MONY-04**: Stripe subscriptions processam pagamentos
- [ ] **MONY-05**: Assinatura lifetime disponível como opção
- [ ] **MONY-06**: Webhooks do Stripe são verificados com signature

### Deploy e Domínio

- [ ] **DEPL-01**: App faz deploy na Vercel
- [ ] **DEPL-02**: Domínio r.alexdonega.com.br configurado
- [ ] **DEPL-03**: Subdomínio r. aponta para Vercel
- [ ] **DEPL-04**: Environment variables configuradas corretamente

### Design e UX

- [ ] **DSGN-01**: Design minimalista estilo Apple/macOS
- [ ] **DSGN-02**: Theme system com dark/light mode automático
- [ ] **DSGN-03**: Cores personalizáveis
- [ ] **DSGN-04**: UX focada em usabilidade

### Qualidade e Estabilidade

- [ ] **QUAL-01**: Console.logs removidos de produção
- [ ] **QUAL-02**: Sistema de logging apropriado (Pino)
- [ ] **QUAL-03**: Tratamento de erros robusto
- [ ] **QUAL-04**: Sistema de undo/redo para anotações
- [ ] **QUAL-05**: Testes automatizados para features críticas
- [ ] **QUAL-06**: Performance otimizada (sem memory leaks)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Integrações

- **INTG-01**: Exportar reviews para PDF
- **INTG-02**: Sync com ferramentas de projeto (Jira, Linear, ClickUp)
- **INTG-03**: Webhooks customizados para integrações

### Features Avançadas

- **ADV-01**: Approval workflows com multi-stage sign-off
- **ADV-02**: Real-time collaborative editing (CRDT-based)
- **ADV-03**: Offline mode com sync automático
- **ADV-04**: Native mobile apps (iOS/Android)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time collaborative editing (Notion-style) | Muito complexo (CRDT/OT), conflita com Obsidian local-first; annotation-first é suficiente |
| Full chat/DM system | Slack/Discord já existem; distração do core value |
| Native mobile apps | PWA suficiente inicialmente; alta manutenção |
| Custom branding/white-label completo | Feature creep; logo/cores custom é suficiente |
| Advanced permissions (ACLs granulares) | Simple roles (owner/editor/viewer) é suficiente |
| Video/voice calling integrado | Zoom/Meet existem; embed via iframe |
| Blockchain/crypto features | Sem valor real; adiciona complexidade |
| Social features (likes, follows) | Distração do core value |
| Múltiplos storage backends | Obsidian usa local files; isso é suficiente |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| ANNO-01 | Phase 2 | Pending |
| ANNO-02 | Phase 2 | Pending |
| ANNO-03 | Phase 2 | Pending |
| ANNO-04 | Phase 2 | Pending |
| ANNO-05 | Phase 2 | Pending |
| ANNO-06 | Phase 2 | Pending |
| ANNO-07 | Phase 2 | Pending |
| CLAU-01 | Phase 3 | Pending |
| CLAU-02 | Phase 3 | Pending |
| CLAU-03 | Phase 3 | Pending |
| CLAU-04 | Phase 3 | Pending |
| CLAU-05 | Phase 3 | Pending |
| CLAU-06 | Phase 3 | Pending |
| AI-01 | Phase 4 | Pending |
| AI-02 | Phase 4 | Pending |
| AI-03 | Phase 4 | Pending |
| COLL-01 | Phase 5 | Pending |
| COLL-02 | Phase 5 | Pending |
| COLL-03 | Phase 5 | Pending |
| COLL-04 | Phase 5 | Pending |
| COLL-05 | Phase 5 | Pending |
| MULT-01 | Phase 6 | Pending |
| MULT-02 | Phase 6 | Pending |
| MULT-03 | Phase 6 | Pending |
| MOBL-01 | Phase 7 | Pending |
| MOBL-02 | Phase 7 | Pending |
| CONF-01 | Phase 8 | Pending |
| CONF-02 | Phase 8 | Pending |
| CONF-03 | Phase 8 | Pending |
| CONF-04 | Phase 8 | Pending |
| SHAR-01 | Phase 9 | Pending |
| SHAR-02 | Phase 9 | Pending |
| SHAR-03 | Phase 9 | Pending |
| MONY-01 | Phase 10 | Pending |
| MONY-02 | Phase 10 | Pending |
| MONY-03 | Phase 10 | Pending |
| MONY-04 | Phase 10 | Pending |
| MONY-05 | Phase 10 | Pending |
| MONY-06 | Phase 10 | Pending |
| DEPL-01 | Phase 11 | Pending |
| DEPL-02 | Phase 11 | Pending |
| DEPL-03 | Phase 11 | Pending |
| DEPL-04 | Phase 11 | Pending |
| DSGN-01 | Phase 12 | Pending |
| DSGN-02 | Phase 12 | Pending |
| DSGN-03 | Phase 12 | Pending |
| DSGN-04 | Phase 12 | Pending |
| QUAL-01 | Phase 13 | Pending |
| QUAL-02 | Phase 13 | Pending |
| QUAL-03 | Phase 13 | Pending |
| QUAL-04 | Phase 13 | Pending |
| QUAL-05 | Phase 13 | Pending |
| QUAL-06 | Phase 13 | Pending |

**Coverage:**
- v1 requirements: 61 total
- Mapped to phases: 61
- Unmapped: 0

---
*Requirements defined: 2025-02-04*
*Last updated: 2025-02-04 after roadmap creation*
