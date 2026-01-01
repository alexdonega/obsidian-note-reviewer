---
dna_type: landmark
produto: Obsidian Note Reviewer
versao: 0.2.1
autor: Alex Donega
data_criacao: 2026-01-01
ultima_atualizacao: 2026-01-01
tags:
  - valores
  - filosofia
  - principios
  - manifesto
---

# DNA LANDMARK - Obsidian Note Reviewer

> **Essência**: Os valores inegociáveis e a filosofia que guiam todas as decisões do produto.

---

## VALORES CENTRAIS

### 🎯 VALOR 1: SIMPLICIDADE

**Frase:**
> "Complexidade é inimiga da execução."

**O que significa:**
- Features devem ser óbvias, não requerer manual
- Menos cliques > Mais cliques
- Zero configuração obrigatória
- Defaults inteligentes que funcionam pra maioria

**Aplicação Prática:**

**✅ Como vivemos este valor:**
- Instalação: 2 comandos, funciona
- Hook: Abre automaticamente, zero setup
- Templates: Pré-configurados, só escolher
- UI: Botões claros ("Revisar", "Salvar"), não jargão

**❌ O que rejeitamos:**
- Wizards de configuração de 10 etapas
- Features que requerem tutorial de 20min
- Opções excessivas que paralisam usuário
- Complexidade técnica exposta desnecessariamente

**Exemplo Concreto:**
```
RUIM (Complexo):
"Configure seu workspace, selecione o parser markdown preferido,
ajuste os parâmetros de rendering, defina a estratégia de cache..."

BOM (Simples):
"Abra a nota. Funciona."
```

**Decisões Guiadas por Este Valor:**
- Frontmatter tem defaults (não precisa preencher tudo)
- Templates são opcionais (nota vazia funciona)
- Salvamento sugere path automático (baseado em tipo)
- Rendering é automático (detecta Mermaid, callouts, etc.)

---

### ⚡ VALOR 2: EFICÁCIA

**Frase:**
> "Resultados > Features."

**O que significa:**
- Resolver problema real > Adicionar feature legal
- Funcionar bem em 1 coisa > Funcionar mal em 10
- Usuário alcança objetivo > Produto tem recurso

**Aplicação Prática:**

**✅ Como vivemos este valor:**
- Foco em renderização perfeita (callouts + Mermaid)
- Sistema de anotações robusto (cross-element highlighting)
- Integração que realmente funciona (hook sem falhas)
- Testes (410 arquivos) garantem que funciona

**❌ O que rejeitamos:**
- Features bonitas mas não úteis
- Adicionar recurso só porque concorrente tem
- Complexidade que não resolve dor real
- "Seria legal ter X" sem validar necessidade

**Exemplo Concreto:**
```
REJEITADO:
"Adicionar modo dark/light/auto/custom com 50 temas"
(Bonito, mas não resolve problema central)

PRIORIZADO:
"Renderizar callouts Obsidian perfeitamente"
(Feature que usuários Obsidian PRECISAM)
```

**Decisões Guiadas por Este Valor:**
- Priorizar correções de bugs > features novas
- 410 testes antes de lançar (qualidade > velocidade)
- Focar em integrações que usuários pedem (Claude Code)
- Rejeitar feature requests que não alinham com problema central

---

### 🔍 VALOR 3: TRANSPARÊNCIA

**Frase:**
> "Building in public. Sempre."

**O que significa:**
- Roadmap público
- Bugs reportados abertamente
- Decisões técnicas explicadas
- Métricas compartilhadas (quando existirem)
- Limitações comunicadas honestamente

**Aplicação Prática:**

**✅ Como vivemos este valor:**
- GitHub público (código, issues, PRs)
- Dev logs semanais (o que foi feito, por quê)
- Comunicação honesta sobre estado (beta, não production-ready)
- 15 branches de correções abertas (não escondemos débito técnico)

**❌ O que rejeitamos:**
- Marketing que esconde limitações
- Promessas de features sem delivery date
- Dizer "lançado" quando é beta
- Esconder bugs conhecidos

**Exemplo Concreto:**
```
MARKETING TÍPICO (Desonesto):
"Note Reviewer é a ferramenta completa de revisão,
pronta para uso enterprise, com zero bugs."

NOSSO MARKETING (Honesto):
"Note Reviewer está em beta. Funciona bem para revisão
de notas Obsidian, mas tem 3 CVEs que estamos corrigindo.
Código aberto, issues públicas. Use e reporte bugs."
```

**Decisões Guiadas por Este Valor:**
- README menciona estado beta
- ANALISE_COMPLETA_PLANNOTATOR.md pública (nota 5.95/10)
- Issues abertas (não deletamos bugs reportados)
- Changelog honesto (não só features, também fixes)

---

### 🤝 VALOR 4: COMUNIDADE

**Frase:**
> "Construído por usuários, para usuários."

**O que significa:**
- Features vêm de necessidades reais (dogfooding)
- Feedback da comunidade guia roadmap
- Open source (BSL-1.1)
- Contribuições são bem-vindas

**Aplicação Prática:**

**✅ Como vivemos este valor:**
- Fork de projeto open source (créditos ao Plannotator)
- Issues e PRs aceitos
- Feature requests considerados
- Templates criados baseados em casos de uso reais

**❌ O que rejeitamos:**
- Desenvolver em silos (sem feedback)
- Ignorar bugs reportados
- Closed source sem razão
- "Sabemos melhor que usuário"

**Exemplo Concreto:**
```
FEATURE REQUEST TÍPICO:
User: "Seria legal ter undo/redo"

RESPOSTA RUIM:
"Obrigado pelo feedback. Vamos avaliar."
[Nunca acontece]

RESPOSTA BOA:
"Faz sentido! Criei issue #42 e adicionei no roadmap Q1.
Quer contribuir com um PR?"
[Branch auto-claude/add-undo-redo-functionality criada]
```

**Decisões Guiadas por Este Valor:**
- 12 templates baseados em estrutura de vault real (Alex)
- pt-BR nativo (comunidade brasileira)
- Integração Claude Code (pedido de usuários)
- Licença BSL-1.1 (open source com proteção comercial)

---

## FILOSOFIA DO PRODUTO

### Filosofia Central

**Note Reviewer acredita que:**

1. **Markdown é perfeito para escrever, terrível para revisar em texto puro.**
   - Por isso renderizamos tudo visualmente

2. **AI agents geram conhecimento, humanos precisam organizar.**
   - Por isso integramos Claude Code + Obsidian

3. **Ferramentas devem se integrar ao workflow, não criar novo.**
   - Por isso hook abre automaticamente, sem quebrar fluxo

4. **Brasileiro merece produtos em português nativo, não tradução.**
   - Por isso interface 100% pt-BR autêntico

5. **Open source constrói produtos melhores.**
   - Por isso código, issues e roadmap são públicos

6. **Simplicidade escala. Complexidade quebra.**
   - Por isso menos features bem-feitas > muitas mal-feitas

---

### Princípios de Design

#### 1. **"Zero-Friction Integration"**
```
Produto não deve adicionar fricção ao workflow existente.
Deve ser invisível quando não necessário,
instantâneo quando acionado.
```

**Exemplos:**
- Hook dispara automaticamente (não precisa abrir manual)
- Templates sugerem path (não precisa lembrar estrutura)
- Defaults funcionam (não precisa configurar)

---

#### 2. **"Visual Reveals Structure"**
```
Humanos processam visualmente melhor que textualmente.
Renderização não é luxo, é necessidade.
```

**Exemplos:**
- Callouts renderizados (revela hierarquia de informação)
- Mermaid renderizado (fluxogramas visíveis)
- Frontmatter visual (campos estruturados claros)

---

#### 3. **"Building in Public Builds Trust"**
```
Transparência sobre processo, não só produto final,
cria conexão autêntica com comunidade.
```

**Exemplos:**
- Dev logs semanais (o que foi feito)
- Roadmap público (o que vem)
- Bugs documentados (o que não funciona ainda)

---

#### 4. **"Dogfooding Drives Quality"**
```
Se criador não usa diariamente, produto vai ficar ruim.
Use próprio produto antes de lançar features.
```

**Exemplos:**
- Alex usa Note Reviewer para revisar planos do Claude (diário)
- Templates vêm de estrutura real de vault
- Features priorizadas baseadas em dor pessoal

---

## MANIFESTO (OPCIONAL)

### O MANIFESTO NOTE REVIEWER

```
Acreditamos que:

• Conhecimento merece ser revisado visualmente,
  não em scrolls infinitos de terminal.

• AI agents são incríveis em gerar conteúdo,
  mas humanos precisam organizar e validar.

• Ferramentas devem integrar workflows existentes,
  não criar novos processos fragmentados.

• Brasileiro merece produtos em português autêntico,
  feitos por quem entende o contexto local.

• Open source não é caridade, é estratégia.
  Comunidade constrói produtos melhores.

• Simplicidade vence complexidade.
  Menos features bem-feitas > muitas mal-feitas.

• Transparência constrói confiança.
  Compartilhe o processo, não só o resultado.

• Código sem testes é dívida técnica.
  410 testes não são exagero, são responsabilidade.

Note Reviewer não é só ferramenta de revisão.
É a ponte entre AI e Second Brain.
É a interface visual que faltava no markdown.
É o workflow sem fricção que você merecia ter.

Construído por quem usa. Para quem usa.
```

---

## DECISÕES INEGOCIÁVEIS

### O que NUNCA faremos:

❌ **1. Vender dados de usuários**
```
Razão: Privacidade é inegociável.
Notas contêm conhecimento pessoal/profissional sensível.
Compartilhamento stateless (dados na URL) garante zero tracking.
```

❌ **2. Adicionar features que comprometem simplicidade**
```
Razão: Complexidade mata adoção.
Se feature precisa de tutorial de 20min, não entra.
```

❌ **3. Abandonar português brasileiro**
```
Razão: É diferencial e compromisso com comunidade local.
Mesmo se 90% dos usuários forem internacionais,
pt-BR permanece como língua primária.
```

❌ **4. Lançar sem testes**
```
Razão: Qualidade > Velocidade.
410 testes existem porque bugs em produção destroem confiança.
```

❌ **5. Esconder limitações em marketing**
```
Razão: Transparência é valor central.
Se é beta, chamamos de beta. Se tem bugs, listamos.
```

---

### O que SEMPRE faremos:

✅ **1. Dogfooding**
```
Alex usa Note Reviewer diariamente.
Se não usa, não lança.
```

✅ **2. Building in Public**
```
Roadmap, bugs, decisões: tudo público.
Comunidade merece saber o que está acontecendo.
```

✅ **3. Open Source**
```
Código aberto (BSL-1.1).
Contribuições bem-vindas.
Forks permitidos (com atribuição).
```

✅ **4. Foco em Eficácia**
```
Features que não resolvem problema real: rejeitadas.
Foco > Ruído.
```

✅ **5. Honestidade Técnica**
```
Se tem bug, reportamos.
Se não sabemos, admitimos.
Se prometemos, entregamos.
```

---

## ÉTICA DE DESENVOLVIMENTO

### Princípios Éticos

**1. Segurança em Primeiro Lugar**
```
3 CVEs identificados? 15 branches de correção criadas.
Não lançamos v1.0 até security audit limpo.
```

**2. Acessibilidade**
```
ARIA labels, keyboard navigation, screen reader support.
Web é para todos, não só para quem vê/usa mouse.
```

**3. Performance**
```
Usuários em conexões lentas importam.
Build otimizado (~500KB), carregamento rápido.
```

**4. Privacidade**
```
Compartilhamento stateless = zero dados em servidor.
Salvamento local = controle total do usuário.
```

**5. Sustentabilidade**
```
Código limpo, testado, documentado.
Produto deve ser mantível a longo prazo.
```

---

## CULTURA DO TIME (FUTURO)

### Se Note Reviewer crescer e tiver time:

**Valores de Contratação:**
```
Procuramos pessoas que:
✅ Usam Obsidian (dogfooding)
✅ Contribuíram em open source
✅ Valorizam simplicidade > complexidade
✅ Escrevem testes sem precisar lembrar
✅ Comunicam de forma transparente
```

**Valores de Trabalho:**
```
✅ Remote-first (time global)
✅ Async communication
✅ Building in public (compartilhar progresso)
✅ Autonomia > Micromanagement
✅ Resultados > Horas trabalhadas
```

---

## ANTI-VALORES (O que NÃO somos)

### ❌ O que Note Reviewer rejeita:

**1. Growth Hacking Agressivo**
```
Não fazemos:
• Pop-ups invasivos
• Dark patterns (dificultar cancelamento)
• Viral loops artificiais
• Notificações spam
```

**2. Feature Bloat**
```
Não adicionamos features porque:
• Concorrente tem
• "Seria legal"
• Investidor pediu
• Marketing quer
```

**3. Vaporware**
```
Não prometemos features sem:
• Protótipo funcional
• Roadmap claro
• Commitment de entrega
```

**4. Closed Development**
```
Não desenvolvemos:
• Em silos sem feedback
• Features surpresa sem validação
• Roadmap secreto
```

**5. Tecnologia pelo Hype**
```
Não adotamos tech porque:
• Está na moda
• Todo mundo usa
• Fica bem no currículo

Adotamos porque: Resolve problema.
```

---

## RESUMO DOS VALORES

| Valor | Frase | Manifestação |
|:------|:------|:-------------|
| **Simplicidade** | "Complexidade é inimiga da execução" | 2 comandos pra instalar, zero config obrigatória |
| **Eficácia** | "Resultados > Features" | 410 testes, callouts perfeitos, foco em resolver problema real |
| **Transparência** | "Building in public. Sempre." | Roadmap público, bugs documentados, dev logs semanais |
| **Comunidade** | "Construído por usuários, para usuários" | Open source, dogfooding, feature requests ouvidos |

---

## O QUE NOS GUIA EM DECISÕES DIFÍCEIS

Quando em dúvida sobre uma decisão, perguntamos:

1. **Isso simplifica ou complica?** (Valor: Simplicidade)
2. **Isso resolve problema real?** (Valor: Eficácia)
3. **Podemos ser transparentes sobre isso?** (Valor: Transparência)
4. **A comunidade se beneficia?** (Valor: Comunidade)

Se 3/4 respostas forem "sim" → Provavelmente boa decisão.
Se 2/4 ou menos → Repensar.

---

**Versão**: 1.0
**Última Revisão**: 2026-01-01
**Próxima Revisão**: Anualmente ou quando contratar primeiro funcionário
