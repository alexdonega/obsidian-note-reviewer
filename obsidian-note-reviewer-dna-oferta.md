---
dna_type: oferta
produto: Obsidian Note Reviewer
versao: 0.2.1
autor: Alex Donega
data_criacao: 2026-01-01
ultima_atualizacao: 2026-01-01
tags:
  - problema
  - solucao
  - pricing
  - proposta-valor
---

# DNA OFERTA - Obsidian Note Reviewer

> **Essência**: O que vendemos, como resolvemos e quanto custa (atualmente grátis, futuro freemium planejado).

---

## 1. O PROBLEMA CENTRAL

### O Maior Único Problema (MUP)

**Problema:**
```
Desenvolvedores e knowledge workers que usam AI agents
(Claude Code, ChatGPT, etc.) para gerar documentos longos
estão presos em um workflow fragmentado e frustrante:

1. AI gera documento em markdown (planos, docs, notas)
2. Revisar em terminal é lento e improdutivo
3. Copiar para Obsidian quebra formatação (frontmatter, callouts)
4. Recriar estrutura manualmente desperdiça tempo
5. Não existe sistema de anotações preciso para feedback

Resultado: Workflow que deveria levar 30 segundos toma 10 minutos.
```

### O Inimigo (Crença Limitante)

**A crença que mantém o problema vivo:**
> "Terminal é suficiente para revisar documentos. É chato, mas é o preço de usar AI tools. Não tem alternativa melhor. Copiar/colar para GUI é ainda pior."

**Por que essa crença é falsa:**
- Terminal é excelente para código, péssimo para documentos longos
- Callouts e frontmatter YAML precisam de renderização visual
- Existe solução melhor: interface especializada em revisão
- Integração automática > copiar/colar manual

---

### Consequências de Não Resolver

**Se usuário não resolver este problema:**

📉 **Produtividade**
- 10min/documento × 5 docs/semana = 50min/semana desperdiçados
- 200min/mês = ~3,3 horas/mês de retrabalho
- Anualizado: ~40 horas/ano revisando de forma ineficiente

😫 **Frustração Acumulada**
- Cada revisão é frustrante
- Aversão a usar AI tools (paradoxo: ferramenta produtiva vira chata)
- Burnout com processos manuais repetitivos

❌ **Erros e Qualidade Baixa**
- Aprova documentos sem revisar direito (por preguiça)
- Perde informações ao copiar (frontmatter quebrado)
- Feedback impreciso para AI (iterações desnecessárias)

🔄 **Workflow Fragmentado**
- Múltiplas ferramentas desconectadas (terminal → editor → Obsidian)
- Context switching constante
- Mental overhead de gerenciar fragmentação

---

## 2. A SOLUÇÃO (O VEÍCULO)

### O que é Note Reviewer

**Definição em 1 Frase:**
```
Interface visual que renderiza markdown perfeitamente,
integra com AI agents automaticamente, e salva notas
no Obsidian sem fricção.
```

**Definição Expandida:**
```
Note Reviewer é uma ferramenta open source que conecta
AI agents (Claude Code, OpenCode) ao seu vault Obsidian
através de:

1. Hook automático (dispara ao finalizar plano AI)
2. Interface visual com renderização avançada
   (callouts Obsidian, Mermaid, frontmatter editável)
3. Sistema de anotações estruturadas
   (DELETE, INSERT, REPLACE, COMMENT)
4. Salvamento direto no vault (preserva formatação)

Resultado: Workflow de 10 minutos vira 30 segundos.
```

---

### A Promessa

**Promessa Central:**
> "Em 30 dias de uso, você vai revisar documentos de AI 5x mais rápido, com zero perda de formatação, usando apenas 30 segundos por revisão."

**Promessas Específicas:**

✅ **Velocidade:**
- Revisão de documento de 200 linhas: 10min → 30s
- Instalação e setup: < 1 minuto
- Primeira revisão após instalar: < 2 minutos

✅ **Qualidade:**
- 100% de preservação de frontmatter YAML
- Renderização perfeita de callouts Obsidian
- Diagramas Mermaid funcionando dentro de callouts

✅ **Integração:**
- Hook abre automaticamente (zero cliques manuais)
- Salva direto no vault (sem copiar/colar)
- Templates inteligentes (paths corretos automaticamente)

✅ **Experiência:**
- Interface 100% em português brasileiro
- Zero curva de aprendizado (funciona out-of-the-box)
- Open source (código auditável, contribuições aceitas)

---

### Como Funciona (Passo a Passo)

#### FLUXO COMPLETO (30 segundos):

**1. AI AGENT TERMINA (3s)**
```
Claude Code finaliza geração de plano
→ Hook dispara automaticamente
→ Servidor local inicia em porta aleatória
```

**2. INTERFACE ABRE (2s)**
```
Browser abre automaticamente em http://localhost:PORTA
→ Carrega conteúdo do plano via /api/content
→ Renderiza markdown com callouts + Mermaid
```

**3. USUÁRIO REVISA (20s)**
```
Lê documento visualmente renderizado
→ Adiciona anotações (seleciona texto → marca DELETE/INSERT/etc.)
→ Edita frontmatter se necessário (clique no editor visual)
→ Adiciona comentários globais se aplicável
```

**4. SALVAMENTO (5s)**
```
Clica "Salvar no vault"
→ Seleciona template (se quiser)
→ Confirma path sugerido
→ Nota salva em C:\vault\[path]\[filename].md
→ Frontmatter preservado, callouts intactos
```

**TOTAL: ~30 segundos** (vs. 10 minutos antes)

---

### Transformação (Antes vs. Depois)

#### ANTES (Workflow Fragmentado - 10min)

```
1. ⏱️ Claude Code termina plano (terminal)
2. 📜 Scrollar 200 linhas, perder contexto (3min)
3. 📋 Copiar texto completo
4. 📝 Abrir Obsidian manualmente
5. 📄 Colar nota (frontmatter quebrado)
6. ✏️ Recriar frontmatter YAML (2min)
7. 🔧 Formatar callouts manualmente (2min)
8. 📁 Mover para pasta correta (1min)
9. 🏷️ Adicionar tags manualmente (1min)
10. 💾 Salvar (1min)

TOTAL: ~10 minutos
FRUSTRAÇÃO: 🔥🔥🔥🔥🔥
ERROS: 3-5 por documento
```

#### DEPOIS (Workflow Integrado - 30s)

```
1. ⚡ Claude Code termina → interface abre automaticamente
2. 👀 Revisa visualmente (callouts renderizados, Mermaid funcionando)
3. ✍️ Anota precisamente (DELETE linha X, INSERT Y)
4. 💾 Clica "Salvar no vault"
5. ✅ Pronto. Nota no Obsidian com tudo preservado.

TOTAL: ~30 segundos
SATISFAÇÃO: 😍😍😍😍😍
ERROS: 0
```

---

### Diferencial (MUS - Maior Único Segredo)

**O que torna Note Reviewer único no mercado:**

#### 1. **Única ferramenta que combina 4 elementos:**
```
✅ Revisão visual de markdown avançado
  +
✅ Integração automática com AI agents
  +
✅ Renderização perfeita de Obsidian (callouts + Mermaid)
  +
✅ Salvamento direto em vault local
```

**Concorrentes fazem 1-2 desses. Ninguém faz os 4.**

---

#### 2. **Callouts do Obsidian com Mermaid Embutido**

**O que outros fazem:**
- ❌ Obsidian nativo: Não tem sistema de anotações estruturado
- ❌ VSCode Markdown Preview: Não renderiza callouts Obsidian
- ❌ Notion: Renderiza, mas não é markdown puro + lock-in
- ❌ Google Docs: Perde markdown completamente

**O que Note Reviewer faz:**
- ✅ Renderiza 15+ tipos de callouts Obsidian
- ✅ Detecta e renderiza Mermaid DENTRO de callouts
- ✅ Syntax highlighting automático
- ✅ Preserva markdown puro (sem conversão)

**Exemplo Visual:**
```markdown
> [!note] Fluxo do Sistema
> ```mermaid
> graph TD
>   A[AI Agent] --> B[Note Reviewer]
>   B --> C[Obsidian Vault]
> ```
```

**Resultado:**
- ❌ Outros: Mostram texto puro `> [!note]...`
- ✅ Note Reviewer: Renderiza callout azul com diagrama Mermaid

---

#### 3. **Templates Inteligentes com Paths Automáticos**

**12 templates pré-configurados:**
```
1. Vídeo YouTube    → Sources/Videos/YouTube/
2. Artigo Web       → Sources/Articles/
3. Conceito Atômico → Atlas/Atomos/Conceitos/
4. Framework        → Atlas/Atomos/Frameworks/
5. Pessoa           → Atlas/Atomos/Pessoas/
6. MOC              → Atlas/MOCs/
7. Projeto          → Projects/
8. Newsletter       → Sources/Newsletters/
9. Livro            → Sources/Books/
10. Podcast         → Sources/Podcasts/
11. Citação         → Atlas/Atomos/Quotes/
12. Roteiro Vídeo   → Content/Roteiros/Videos/
```

**Cada template:**
- Frontmatter pré-preenchido
- Path correto automaticamente
- Tags padrão incluídas
- Persistência via cookies (lembra última escolha)

---

#### 4. **Compartilhamento Stateless (Sem Servidor)**

**Como outros fazem:**
- Google Docs: Dados no servidor Google
- Notion: Lock-in vendor, dados na nuvem
- Dropbox Paper: Requer conta, dados centralizados

**Como Note Reviewer faz:**
```
1. Nota comprimida com LZ-String
2. Dados codificados na própria URL
3. Zero servidor, zero banco de dados
4. Funciona offline para quem recebe link

Exemplo URL:
https://r.alexdonega.com.br/review?data=N4IgdghgtgpiBcID...

Resultado:
✅ Privacidade (dados não armazenados)
✅ Zero custo de infra (stateless)
✅ Funciona sem login
```

---

## 3. A OFERTA (PRODUTOS E PRICING)

### Estado Atual: 100% GRÁTIS

**Modelo Atual (Beta):**
```
💰 Preço: $0 (grátis)
📜 Licença: BSL-1.1 (open source para uso pessoal/comercial)
🔓 Recursos: Todos desbloqueados
⏰ Limitações: Nenhuma
```

**Por que grátis agora:**
- Fase beta (v0.2.1)
- Prioridade: validação de uso e feedback
- Construindo comunidade antes de monetizar
- 3 CVEs em correção (não ético cobrar com bugs conhecidos)

---

### Modelo Futuro: FREEMIUM (Planejado para v1.1+)

#### PLANO FREE (Para Sempre)

**Preço:** $0/mês

**Recursos Incluídos:**
```
✅ Uso local ilimitado
✅ Todos os 12 templates básicos
✅ Renderização completa (callouts, Mermaid, frontmatter)
✅ Salvamento direto no vault
✅ Sistema de anotações completo
✅ Compartilhamento stateless (até 10 notas/mês)
✅ Integração com Claude Code e OpenCode
✅ Suporte via GitHub Issues (resposta em 48-72h)
```

**Para quem:**
- Uso pessoal
- Até 50 revisões/mês
- Freelancers, estudantes, hobbyistas

**Limitações:**
```
⚠️ Templates: Só os 12 básicos (sem custom)
⚠️ Compartilhamento: 10 notas/mês
⚠️ Analytics: Estatísticas básicas
⚠️ Suporte: GitHub Issues (não prioritário)
```

---

#### PLANO PRO (Planejado)

**Preço:** $5-10/mês ou $49-99/ano (~R$25-50/mês ou R$250-500/ano)

**Tudo do Free +**
```
✨ Templates customizados ilimitados
✨ Compartilhamento ilimitado
✨ Sync de configurações via cloud (opcional)
✨ Analytics avançado de revisões
   (tempo médio, tipos de anotação mais usados, etc.)
✨ Exportação em múltiplos formatos
   (JSON, Git patch, Markdown diff)
✨ Suporte prioritário (resposta em 24h)
✨ Acesso antecipado a features beta
✨ Discord privado (comunidade Pro)
```

**Para quem:**
- Power users
- Profissionais que revisam 50+ docs/mês
- Quem valoriza customização avançada

**Justificativa de Preço:**
```
Comparação de Mercado:
• Notion Pro: $10/mês
• Obsidian Sync: $8/mês (só sync)
• Roam Research: $15/mês
• Note Reviewer Pro: $5-10/mês

Custo/Benefício:
• Economiza ~3h/mês (vs. workflow manual)
• $10/mês ÷ 3h = $3,33/hora economizada
• Se hora vale R$50, ROI = 1.500%
```

---

#### PLANO TEAMS (Futuro Distante)

**Preço:** $X/usuário/mês (a definir, provavelmente $15-25/user)

**Tudo do Pro +**
```
👥 Colaboração em tempo real
👥 Comentários multi-usuário com identidades
👥 Dashboard de métricas do time
👥 SSO/SAML (integração empresarial)
👥 Audit logs
👥 SLA de suporte (resposta em 4h)
👥 Onboarding dedicado
👥 Custom deployment (on-premise se necessário)
```

**Para quem:**
- Equipes de 5-50 pessoas
- Empresas que usam Obsidian para documentação
- Consultorias, agências, times de produto

---

### Garantia

**Quando começar a cobrar:**
```
💯 30 dias de devolução do dinheiro, sem perguntas.

Se não melhorar sua produtividade de revisão em 30 dias,
devolvo 100% do valor pago.

Email: refund@alexdonega.com.br
Processo: < 48h para reembolso completo
```

---

### Bônus (Planejados para Lançamento v1.0)

**Para Early Adopters (primeiros 500 usuários):**
```
🎁 BÔNUS 1: Lifetime Pro Access ($149 one-time)
   → Para quem adotar durante beta e reportar bugs

🎁 BÔNUS 2: Guia "Obsidian + AI Workflows" (PDF 50 páginas)
   → 10 workflows comprovados para integrar AI e PKM

🎁 BÔNUS 3: Pack de 20 Templates Premium
   → Templates avançados para casos de uso específicos

🎁 BÔNUS 4: Acesso ao Discord Privado
   → Comunidade exclusiva, networking, early feedback
```

---

## 4. PROPOSTA DE VALOR POR PERSONA

### Para Developers

**Proposta:**
> "Revise planos do Claude Code 10x mais rápido. Interface visual que abre automaticamente, renderiza callouts, e salva no Obsidian sem você fazer nada."

**ROI:**
```
Tempo economizado: 50min/semana
Valor da hora: R$100/h
Economia mensal: R$333
Custo do Pro: R$50/mês
ROI: 566%
```

---

### Para Pesquisadores

**Proposta:**
> "Organize resumos de papers com templates prontos. Frontmatter estruturado, tags automáticas, paths corretos. Seu vault sempre organizado."

**ROI:**
```
Tempo economizado: 2h/semana organizando notas
Valor da hora: R$50/h
Economia mensal: R$400
Custo do Pro: R$50/mês
ROI: 700%
```

---

### Para Content Creators

**Proposta:**
> "Compartilhe roteiros para feedback sem perder markdown. Colaboradores veem callouts, Mermaid, tudo renderizado. Anotações estruturadas voltam pra você."

**ROI:**
```
Tempo economizado: 3h/mês em retrabalho de formatação
Valor da hora: R$80/h
Economia mensal: R$240
Custo do Pro: R$50/mês
ROI: 380%
```

---

## 5. COMPARAÇÃO COM ALTERNATIVAS

### VS. Workflow Manual (Copiar/Colar)

| Aspecto | Manual | Note Reviewer |
|:--------|:-------|:--------------|
| **Tempo/doc** | 10min | 30s |
| **Preserva frontmatter** | ❌ | ✅ |
| **Renderiza callouts** | ❌ | ✅ |
| **Anotações estruturadas** | ❌ | ✅ |
| **Automação** | ❌ | ✅ |
| **Custo** | Grátis | Grátis (atual) |

**Vencedor:** Note Reviewer (20x mais rápido)

---

### VS. Obsidian Nativo

| Aspecto | Obsidian | Note Reviewer |
|:--------|:---------|:--------------|
| **Renderiza markdown** | ✅ | ✅ |
| **Sistema de anotações** | ❌ | ✅ (DELETE/INSERT/etc.) |
| **Integração Claude Code** | ❌ | ✅ (hook automático) |
| **Compartilhamento** | ❌ | ✅ (stateless) |
| **Templates com paths** | Parcial | ✅ (12 pré-configs) |

**Vencedor:** Complementam-se (não competem)

---

### VS. Notion

| Aspecto | Notion | Note Reviewer |
|:--------|:-------|:--------------|
| **Markdown puro** | ❌ (próprio formato) | ✅ |
| **Lock-in** | ✅ (dados na nuvem) | ❌ (local) |
| **Renderização** | ✅ | ✅ |
| **Offline** | Limitado | ✅ |
| **Open source** | ❌ | ✅ |
| **Custo** | $10/mês | Grátis (atual) |

**Vencedor:** Note Reviewer (para usuários Obsidian)

---

## 6. CALL-TO-ACTION PRINCIPAL

### CTA Primário (Atual - Beta)

**Mensagem:**
```
🚀 Experimente Grátis Agora
   Instale em 2 comandos. 30 segundos.

   [Botão: Download for Windows]
   [Botão: Download for macOS]
   [Link: View on GitHub]
```

**Onde leva:**
- Página de instalação com comandos prontos
- README com instruções detalhadas
- Demo em vídeo (60s)

---

### CTA Secundário

**Mensagem:**
```
📺 Veja em Ação (Demo 60s)
   [Botão: Watch Demo]
```

**Onde leva:**
- YouTube com screencast
- GIF animado inline

---

## RESUMO DA OFERTA

**O que vendemos:**
```
Interface visual que conecta AI agents ao Obsidian,
eliminando fricção e preservando formatação.
```

**Como resolvemos:**
```
Hook automático + Renderização perfeita + Anotações estruturadas
+ Salvamento direto = Workflow de 10min vira 30s
```

**Quanto custa:**
```
AGORA: Grátis (beta)
FUTURO: Freemium ($0 free, $5-10/mês pro)
ROI: 380-700% (economiza 2-4h/mês)
```

**Garantia:**
```
30 dias devolução sem perguntas (quando começar a cobrar)
```

---

**Versão**: 1.0
**Última Revisão**: 2026-01-01
**Próxima Revisão**: Ao lançar v1.0 (pricing definitivo)
