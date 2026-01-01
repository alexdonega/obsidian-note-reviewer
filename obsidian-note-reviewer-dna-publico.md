---
dna_type: publico
produto: Obsidian Note Reviewer
versao: 0.2.1
autor: Alex Donega
data_criacao: 2026-01-01
ultima_atualizacao: 2026-01-01
tags:
  - icp
  - persona
  - dores
  - desejos
  - objecoes
---

# DNA PÚBLICO - Obsidian Note Reviewer

> **Essência**: Para quem construímos, quais dores resolvemos e como nos posicionamos na mente do usuário.

---

## 1. PERFIL DO CLIENTE IDEAL (ICP)

### ICP Primário: "O Developer PKM Enthusiast"

**Quem é:**
```
Nome: Rafael, 32 anos
Ocupação: Software Engineer / Tech Lead
Localização: São Paulo, Brasil (ou remoto)
Renda: R$8k-15k/mês
Tecnologia: Usa Obsidian há 1+ ano, 500-2000 notas no vault
```

**Perfil Demográfico:**
- **Idade**: 25-45 anos
- **Ocupação**:
  - Developers (frontend, backend, full-stack)
  - Tech leads / Engineering managers
  - DevOps / SREs
  - Technical writers
- **Educação**: Superior completo ou em andamento (TI, Eng., áreas correlatas)
- **Renda**: R$5k-20k/mês (média: R$10k)
- **Localização**: Brasil (principalmente SP, RJ, RS, MG), alguns no exterior
- **Idioma**: Português nativo, inglês técnico

**Perfil Psicográfico:**
- 🧠 **Early adopter** de ferramentas de produtividade
- 📚 **Knowledge worker** que valoriza organização de informação
- 🛠️ **Tinkerer** - gosta de customizar ferramentas
- 🎯 **Eficiência-focado** - odeia processos manuais repetitivos
- 🤖 **AI-curious** - experimenta Claude, ChatGPT, Copilot ativamente
- 💻 **Terminal-comfortable** mas valoriza UIs bem-feitas
- 🇧🇷 **Brasileiro autêntico** - prefere pt-BR nativo a traduções

**Tecnologias que Usa:**
- **PKM**: Obsidian (primário), já testou Notion, Roam, Logseq
- **AI Tools**: Claude Code, ChatGPT, GitHub Copilot
- **Dev Tools**: VSCode, Git, Terminal, Docker
- **Produtividade**: Todoist, Notion, calendário digital
- **Comunicação**: Slack, Discord, Telegram

---

### ICP Secundário: "O Pesquisador/Acadêmico Digital"

**Quem é:**
```
Nome: Ana, 28 anos
Ocupação: Mestranda / Pesquisadora / Professor
Localização: Universidades brasileiras
Renda: R$2k-6k/mês (bolsa ou júnior)
Tecnologia: Obsidian para organizar papers e anotações
```

**Diferenças do ICP Primário:**
- Menos tech-savvy (mas não leigo)
- Usa AI para resumir papers, gerar insights
- Vault focado em pesquisa acadêmica (citações, bibliografia)
- Menos renda disponível (mais sensível a preço)

---

### ICP Terciário: "O Content Creator Organizado"

**Quem é:**
```
Nome: Lucas, 35 anos
Ocupação: YouTuber / Writer / Course Creator
Localização: Remoto, Brasil
Renda: Variável (R$3k-30k/mês)
Tecnologia: Obsidian para organizar roteiros, ideias, pesquisas
```

**Diferenças:**
- Usa AI para gerar drafts de roteiros
- Vault focado em criação de conteúdo (vídeos, artigos, cursos)
- Workflow: pesquisa → anotação → roteiro → publicação

---

## 2. DORES PRINCIPAIS (JOBS TO BE DONE)

### 🔥 DOR 1: "Revisão em Terminal é Improdutiva e Frustrante"

**Citação Real (Persona Developer):**
> "Quando o Claude Code termina um plano de 200 linhas, tenho que scrollar no terminal pra revisar tudo. É lento, cansa a vista, e eu sempre perco contexto. Queria uma interface visual pra isso, mas não quero sair do workflow."

**Contexto:**
- Usa Claude Code diariamente para gerar planos, documentação
- Terminal é ótimo para código, ruim para revisar documentos longos
- Copiar/colar para outro editor quebra o fluxo
- Callouts (`> [!note]`) não renderizam no terminal

**Consequências:**
- ⏱️ **Tempo perdido**: 5-10min revisando algo que deveria levar 30s
- 😫 **Frustração**: Scrollar infinitamente, perder linha, recomeçar
- ❌ **Erros**: Aprovar plano sem revisar direito por preguiça
- 🔄 **Context switching**: Abrir Obsidian separado, copiar, formatar

**Intensidade:** 🔥🔥🔥🔥🔥 (5/5) - Dor diária, alta frequência

---

### 🔥 DOR 2: "Callouts e Frontmatter Quebram ao Copiar para Obsidian"

**Citação Real (Persona Developer):**
> "Claude gera nota com frontmatter lindo e callouts estruturados. Quando copio pro Obsidian, o frontmatter some ou fica quebrado, e os callouts viram texto puro. Tenho que recriar tudo manualmente. Perco 5 minutos TODA VEZ."

**Contexto:**
- AI agents geram markdown com frontmatter YAML
- Terminal mostra frontmatter como texto (`---\ntags: []\n---`)
- Copiar/colar direto não preserva estrutura
- Callouts precisam ser refeitos no Obsidian

**Consequências:**
- 🕐 **Retrabalho**: Reescrever frontmatter manualmente
- 📉 **Perda de dados**: Campos YAML mal formatados não funcionam
- 😡 **Frustração**: "Por que isso não deveria já funcionar?"

**Intensidade:** 🔥🔥🔥🔥 (4/5) - Dor recorrente, médio-alta frequência

---

### 🔥 DOR 3: "Não Tenho Sistema para Organizar Notas de AI"

**Citação Real (Persona Pesquisador):**
> "Gero resumos de papers com ChatGPT, transcrições de vídeos com AI, mas não tenho estrutura para organizar isso no Obsidian. Cada nota fica em lugar aleatório, sem tags consistentes. Vira bagunça."

**Contexto:**
- AI gera muito conteúdo (resumos, transcrições, insights)
- Falta de templates padronizados
- Não sabe onde salvar cada tipo de nota
- Frontmatter inconsistente dificulta busca

**Consequências:**
- 🗂️ **Vault desorganizado**: Notas soltas, sem estrutura
- 🔍 **Difícil de achar**: Busca não funciona sem tags/metadata
- 😓 **Sobrecarga cognitiva**: "Onde salvo isso? Como organizo?"

**Intensidade:** 🔥🔥🔥 (3/5) - Dor crescente conforme vault aumenta

---

### 🔥 DOR 4: "Feedback para AI Agents é Genérico Demais"

**Citação Real (Persona Developer):**
> "Quando Claude Code gera algo errado, meu feedback é tipo 'Muda o parágrafo 3'. Mas seria melhor anotar direto NO texto específico: 'DELETE isso, INSERT aquilo'. Feedback textual é vago e demorado."

**Contexto:**
- AI agents geram conteúdo, mas precisam de revisão humana
- Feedback em texto livre é ambíguo ("melhore a seção X")
- Anotar direto no texto seria mais preciso
- Claude Code não tem sistema de anotações visuais

**Consequências:**
- 🔄 **Iterações lentas**: Claude interpreta mal, precisa refazer
- 📝 **Feedback impreciso**: "Melhore isso" vs. "Delete linha 42, insira Y"
- ⏱️ **Tempo perdido**: 3-5 rodadas para acertar algo simples

**Intensidade:** 🔥🔥🔥 (3/5) - Dor em casos complexos

---

### 🔥 DOR 5: "Obsidian é Ótimo, Mas Falta Interface para Revisão Colaborativa"

**Citação Real (Persona Content Creator):**
> "Uso Obsidian para roteiros. Quando preciso de feedback, copio para Google Docs porque Obsidian não tem sistema de comentários. Mas aí perco o markdown, as tags, tudo. Frustrante."

**Contexto:**
- Obsidian é single-user (sem colaboração nativa)
- Google Docs tem comentários, mas perde markdown
- Notion tem colaboração, mas lock-in vendor

**Consequências:**
- 🔄 **Context switching**: Obsidian → Google Docs → Obsidian
- 📉 **Perda de formatação**: Markdown não funciona em Docs
- 😓 **Workflow fragmentado**: Ferramentas não conversam

**Intensidade:** 🔥🔥 (2/5) - Dor ocasional, mas significativa

---

## 3. DESEJOS PRINCIPAIS (JOBS TO BE DONE - Aspiracional)

### ✨ DESEJO 1: "Quero Revisar Notas Visualmente, Sem Sair do Workflow"

**Citação Real:**
> "Quero que quando Claude Code termine um plano, abra automaticamente uma interface visual onde eu vejo callouts renderizados, Mermaid funcionando, e consigo anotar direto. E quando aprovar, salva no Obsidian sem eu fazer nada."

**O que isso significa:**
- **Zero fricção**: Hook automático, não precisa abrir manual
- **Renderização perfeita**: Callouts, Mermaid, syntax highlighting
- **Anotações visuais**: Marcar texto específico, não só comentário geral
- **Salvamento direto**: Um clique, nota vai pro vault

**Ganho Emocional:**
- 😌 **Alívio**: "Finalmente não preciso lutar com o terminal"
- 🎉 **Satisfação**: "Funciona como deveria desde o início"
- ⚡ **Empoderamento**: "Controle total, sem esforço"

---

### ✨ DESEJO 2: "Quero Templates que Organizem Automaticamente Meu Vault"

**Citação Real:**
> "Quero selecionar 'Vídeo YouTube' e pronto: frontmatter preenchido, path correto (Sources/Videos/), tags certas. Sem pensar, só usar."

**O que isso significa:**
- **Templates inteligentes**: 10-15 tipos pré-configurados
- **Paths automáticos**: Baseado em tipo de nota
- **Frontmatter pré-preenchido**: Só ajustar se necessário
- **Consistência**: Todas notas do mesmo tipo ficam iguais

**Ganho Emocional:**
- 🧘 **Paz de espírito**: "Meu vault está organizado"
- 🚀 **Velocidade**: "Crio nota em 10 segundos"
- 🎯 **Clareza**: "Sei exatamente onde está cada coisa"

---

### ✨ DESEJO 3: "Quero Dar Feedback Preciso para AI Agents"

**Citação Real:**
> "Quero marcar exatamente onde o texto está errado, que tipo de mudança precisa (DELETE, INSERT, REPLACE), e que isso volte pro Claude automaticamente. Sem escrever 'mude o parágrafo X', só marcar visualmente."

**O que isso significa:**
- **Anotações posicionais**: Marca linha/palavra específica
- **Tipos de mudança**: DELETE, INSERT, REPLACE, COMMENT
- **Feedback estruturado**: Retorna JSON pro AI agent
- **Loop fechado**: Vai e volta sem fricção

**Ganho Emocional:**
- 🎯 **Precisão**: "Claude vai entender exatamente o que quero"
- ⏱️ **Eficiência**: "1 rodada em vez de 3"
- 💪 **Controle**: "Sou eu quem decide, com clareza"

---

### ✨ DESEJO 4: "Quero Compartilhar Notas para Feedback sem Perder Formatação"

**Citação Real:**
> "Quero mandar link de uma nota para alguém revisar, e que essa pessoa veja callouts, Mermaid, frontmatter, tudo renderizado. E que os comentários dela voltem pra mim estruturados."

**O que isso significa:**
- **Compartilhamento sem servidor**: Link com dados comprimidos
- **Renderização perfeita**: Destinatário vê exatamente como criador
- **Anotações multi-usuário**: Identidade por revisor
- **Exportação estruturada**: JSON/Diff de mudanças

**Ganho Emocional:**
- 🤝 **Colaboração fácil**: "Não preciso migrar pro Google Docs"
- 🎨 **Preservação**: "Markdown continua intacto"
- 🔒 **Privacidade**: "Dados não ficam em servidor de terceiros"

---

## 4. NÍVEIS DE CONSCIÊNCIA DO PROBLEMA

### Distribuição do Público:

```
NÍVEL 5 - Most Aware (5%):
"Preciso do Note Reviewer. Já testei, quero usar."
→ Pronto para converter

NÍVEL 4 - Product Aware (15%):
"Conheço Note Reviewer. Quero saber mais."
→ Precisa de demo convincente

NÍVEL 3 - Solution Aware (30%):
"Sei que preciso de ferramenta de revisão visual.
Não sabia que Note Reviewer existia."
→ Precisa de educação sobre produto

NÍVEL 2 - Problem Aware (40%):
"Revisar no terminal é frustrante, mas não sei
que existe solução melhor."
→ Precisa de educação sobre problema

NÍVEL 1 - Unaware (10%):
"Nem percebo que tenho problema com revisão."
→ Fora do target agora
```

**Estratégia de Comunicação por Nível:**

| Nível | Mensagem | CTA |
|:------|:---------|:----|
| **5 - Most Aware** | "Instale agora. 2 comandos." | Download direto |
| **4 - Product Aware** | "Veja como funciona (demo 60s)" | Watch demo |
| **3 - Solution Aware** | "Revise notas visualmente com Note Reviewer" | Learn more |
| **2 - Problem Aware** | "Cansado de scrollar terminal? Existe solução." | Discover |
| **1 - Unaware** | (Não targetamos ainda) | - |

---

## 5. OBJEÇÕES E RESPOSTAS

### 🚫 OBJEÇÃO 1: "Não tenho tempo para aprender ferramenta nova"

**Resposta:**
```
✅ "Zero curva de aprendizado.
   Claude Code termina → abre automaticamente → você revisa.
   Instala em 2 comandos. 30 segundos. Funciona."

📸 [GIF: instalação + primeira revisão em 60s total]
```

**Tática:** Mostrar, não contar. Proof via screencast.

---

### 🚫 OBJEÇÃO 2: "Já uso Obsidian nativo, por que preciso disso?"

**Resposta:**
```
✅ "Note Reviewer não substitui Obsidian.
   Complementa.

   Obsidian = escrever e organizar notas
   Note Reviewer = revisar notas de AI agents visualmente

   Use os dois. Não compete, integra."

📊 Diagrama: [AI Agent] → [Note Reviewer] → [Obsidian Vault]
```

**Tática:** Posicionar como complemento, não concorrente.

---

### 🚫 OBJEÇÃO 3: "E se eu não uso Claude Code?"

**Resposta:**
```
✅ "Funciona sem Claude Code também.

   Abra qualquer nota markdown no portal web:
   https://r.alexdonega.com.br

   Renderiza callouts + Mermaid, edita frontmatter, compartilha.

   Claude Code é uma forma de usar, não a única."
```

**Tática:** Mostrar versatilidade, não dependency.

---

### 🚫 OBJEÇÃO 4: "Parece complexo de instalar"

**Resposta:**
```
✅ "2 comandos. 30 segundos.

Windows PowerShell:
irm https://r.alexdonega.com.br/install.ps1 | iex

Pronto. Funciona.

[Screenshot: antes (terminal vazio) → depois (interface rodando)]"
```

**Tática:** Simplicidade comprovada visualmente.

---

### 🚫 OBJEÇÃO 5: "Não quero pagar mais uma assinatura"

**Resposta:**
```
✅ "Grátis. Open source. Zero assinatura.

Código no GitHub: github.com/alexdonega/obsidian-note-reviewer
Licença BSL-1.1 (livre para uso pessoal/comercial)

Futuro: talvez features premium, mas core sempre grátis."
```

**Tática:** Remover barreira financeira completamente.

---

### 🚫 OBJEÇÃO 6: "E se eu tiver problema? Quem dá suporte?"

**Resposta:**
```
✅ "Issues no GitHub: github.com/.../issues
   Respondo em 24-48h (geralmente menos).

   Building in public = comunidade ajuda também.

   Bugs críticos: prioridade máxima (< 24h)."
```

**Tática:** Transparência sobre processo de suporte.

---

### 🚫 OBJEÇÃO 7: "Meu vault tem dados sensíveis. É seguro?"

**Resposta:**
```
✅ "100% local. Zero dados em servidor.

   Como funciona:
   • Servidor roda na SUA máquina (localhost)
   • Notas ficam no SEU vault
   • Compartilhamento: dados comprimidos na URL (stateless)
   • Zero tracking, zero analytics

   Código aberto: audite você mesmo."
```

**Tática:** Segurança através de arquitetura transparente.

---

## 6. PREMISSA PERSUASIVA

### A Crença Limitante que Trava o Público:

> **Crença Falsa:**
> "Revisar em terminal é chato, mas é o preço de usar AI tools. Não tem jeito melhor. É isso ou copiar/colar manualmente para outro editor, o que é ainda pior."

### A Verdade que Liberta:

> **Nova Crença:**
> "Você não precisa escolher entre usar AI tools e ter workflow fluido. Pode ter os dois. Note Reviewer conecta Claude Code ao Obsidian sem fricção. O terminal é ótimo para código, mas documentos merecem interface visual. Use a ferramenta certa para cada job."

### O Insight Transformador:

> **Aha Moment:**
> "Ah! Não é que EU sou improdutivo revisando no terminal. É que TERMINAL não foi feito para revisar documentos longos. Faz todo sentido ter interface visual pra isso. Por que eu aceitei que tinha que ser assim?"

---

## 7. SEGMENTAÇÃO DE PÚBLICO

### Segmento A: "AI Power Users" (40%)

**Características:**
- Usa AI tools diariamente (Claude, ChatGPT, Copilot)
- Gera 5-20 documentos/semana com AI
- Dor mais intensa: revisão em terminal
- Adoção rápida (< 1 semana de awareness → uso)

**Mensagem Chave:**
> "Revise outputs de Claude visualmente. Sem sair do workflow."

**Canais:** Twitter (AI/tech), r/ClaudeAI, r/ObsidianMD

---

### Segmento B: "Obsidian Enthusiasts" (35%)

**Características:**
- Vault com 500+ notas
- Usa Obsidian há 1+ ano
- Experimenta plugins ativamente
- Dor mais intensa: organização de notas AI-generated

**Mensagem Chave:**
> "Templates inteligentes para organizar notas de AI no Obsidian."

**Canais:** r/ObsidianMD, Discord Obsidian, Obsidian Roundup

---

### Segmento C: "Pesquisadores/Acadêmicos" (15%)

**Características:**
- Usa AI para resumir papers
- Vault focado em pesquisa
- Menor tech-savviness
- Dor mais intensa: falta de estrutura

**Mensagem Chave:**
> "Organize resumos de papers com templates prontos."

**Canais:** LinkedIn (academia), Twitter acadêmico, universidades

---

### Segmento D: "Content Creators" (10%)

**Características:**
- Usa AI para roteiros, ideias
- Workflow: pesquisa → draft → publicação
- Dor mais intensa: colaboração/feedback

**Mensagem Chave:**
> "Compartilhe roteiros para feedback sem perder markdown."

**Canais:** YouTube, Twitter creators, r/ContentCreation

---

## RESUMO DO PÚBLICO

**ICP Principal:**
```
Developer brasileiro, 25-40 anos, usa Obsidian + AI tools,
frustra-se revisando em terminal, valoriza eficiência,
prefere pt-BR nativo, early adopter, tech-savvy.
```

**Dor Central:**
```
"Revisar outputs de AI em terminal é lento e frustrante.
Copiar para Obsidian quebra formatação. Workflow fragmentado."
```

**Desejo Central:**
```
"Interface visual que renderiza markdown perfeitamente,
integra com Claude Code automaticamente, e salva no Obsidian
sem fricção. Zero passos manuais."
```

**Objeção Principal:**
```
"Não quero aprender ferramenta nova / Parece complexo"
→ Resposta: "2 comandos. 30 segundos. Funciona."
```

---

**Versão**: 1.0
**Última Revisão**: 2026-01-01
**Próxima Revisão**: Após primeiros 100 usuários (feedback real)
