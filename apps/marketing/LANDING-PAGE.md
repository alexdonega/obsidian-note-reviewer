# Landing Page - Note Reviewer (Português Brasileiro)

> **Página de vendas criada com base nos DNAs do produto**

## 📁 Arquivos Criados

- `index.pt-br.html` - HTML principal (SEO otimizado para pt-BR)
- `index.pt-br.tsx` - Entry point React para versão pt-BR
- `packages/ui/components/LandingPtBr.tsx` - Componente principal da landing page

## 🎯 Baseado nos DNAs

Esta landing page foi construída seguindo rigorosamente os DNAs do produto localizados em `C:\dev\obsidian-alexdonega\Esforços\Work\DNAs`:

### DNA Oferta (`obsidian-note-reviewer-dna-oferta.md`)

**Aplicado:**
- ✅ Problema central destacado (seção "Do Caos à Claridade")
- ✅ Solução com fluxo completo de 30 segundos
- ✅ Transformação Antes vs Depois visual
- ✅ Promessa central: "Em 30 dias de uso, você vai revisar documentos de AI 5x mais rápido"
- ✅ Pricing: 100% grátis, open source, beta
- ✅ Garantia futura: 30 dias devolução sem perguntas

### DNA Público (`obsidian-note-reviewer-dna-publico.md`)

**Aplicado:**
- ✅ ICP Primário: Developer PKM Enthusiast brasileiro
- ✅ Dores principais:
  - Revisão em terminal improdutiva
  - Callouts/frontmatter quebram ao copiar
  - Falta de sistema de organização
  - Feedback para AI agents genérico
- ✅ Desejos aspiracionais:
  - Revisar visualmente sem sair do workflow
  - Templates que organizem automaticamente
  - Feedback preciso para AI agents
- ✅ Objeções respondidas (FAQ):
  - "Não tenho tempo para aprender ferramenta nova"
  - "Já uso Obsidian nativo, por que preciso disso?"
  - "E se eu não uso Claude Code?"
  - "Parece complexo de instalar"
  - "Meu vault tem dados sensíveis. É seguro?"

### DNA Personalidade (`obsidian-note-reviewer-dna-personalidade.md`)

**Aplicado:**
- ✅ Tom: Profissional mas acessível
- ✅ Direto ao ponto: Sem rodeios, foca no que importa
- ✅ Brasileiro autêntico: 100% pt-BR natural (não tradução)
- ✅ Técnico quando necessário: Explica o "porquê"
- ✅ Credenciais técnicas:
  - 410 testes
  - Stack moderna (React 19, Tailwind 4)
  - Integração comprovada
  - Building in public

### DNA Discurso (`obsidian-note-reviewer-dna-discurso.md`)

**Aplicado:**
- ✅ Narrativa 1: "Do Caos à Clareza" (seção completa dedicada)
- ✅ Narrativa 2: "Construído por quem usa" (footer + about)
- ✅ Narrativa 3: "Open Source, Community-Driven" (seção garantia)
- ✅ Pilar 1: Produtividade com AI Tools (seção benefícios)
- ✅ Pilar 2: Knowledge Management (seção templates)
- ✅ Técnica: Problema → Solução → Resultado
- ✅ Técnica: Antes vs Depois (visual com emojis)
- ✅ Técnica: Show, Don't Tell (workflow com tempos exatos)

## 🎨 Estrutura da Landing Page

### 1. Hero Section
- Badge de beta com "Integração nativa com Claude Code e OpenCode"
- Headline: "Revise notas como elas merecem ser revisadas"
- Subheadline com benefício central
- CTAs: "Experimentar Grátis" + "Ver Demo"
- Social proof: "100% local · Instalação em 30 segundos"

### 2. Problema → Solução (Do Caos à Claridade)
- Grid 2 colunas: ANTES (😫) vs DEPOIS (😍)
- Lista de dores com ✗ vermelho
- Lista de soluções com ✓ verde
- Resultado quantificado: 10min → 30s

### 3. Benefícios (Por que Note Reviewer)
- 4 cards destacando diferenciais únicos:
  1. Renderização Perfeita de Obsidian
  2. Integração Automática com AI Agents
  3. Frontmatter YAML Editável
  4. Salvamento Direto no Vault

### 4. Como Funciona (Workflow Completo)
- 4 passos numerados com tempo estimado:
  1. AI Agent Termina (3s)
  2. Interface Abre (2s)
  3. Você Revisa (20s)
  4. Salvamento (5s)
- Total: ~30 segundos destacado

### 5. Templates Inteligentes
- Grid com 12 templates pré-configurados
- Cada card mostra nome + path automático

### 6. Comparação com Alternativas
- Tabela comparativa:
  - Workflow Manual vs Obsidian Nativo vs Note Reviewer
  - 6 aspectos comparados
  - Note Reviewer destacado em verde

### 7. Garantia e CTA Final
- "100% Grátis. Open Source."
- Promessa central em destaque
- CTA principal: "Experimente Grátis Agora"
- Subtítulo: "Instalação em 2 comandos. 30 segundos. Funciona."

### 8. FAQ
- 5 perguntas principais com respostas diretas
- Expandível com `<details>` nativo

### 9. Footer
- 3 colunas:
  1. Sobre o produto
  2. Links úteis
  3. Construído por Alex Donega
- Copyright + licença BSL-1.1
- Menção ao fork do Obsidian Note Reviewer

## 🎯 Princípios de Design Aplicados

### Tom de Comunicação
- ✅ Direto e prático (sem jargão desnecessário)
- ✅ Português brasileiro autêntico
- ✅ Focado em benefícios, não features
- ✅ Evidências visuais (emojis, ícones)

### Copywriting
- ✅ Headlines com benefício claro
- ✅ Números específicos (30s, 20x, 10min → 30s)
- ✅ Verbos de ação ("Revise", "Salve", "Experimente")
- ✅ Sem promessas exageradas
- ✅ Transparente sobre estado beta

### Visual Hierarchy
- ✅ Seções bem delimitadas com backgrounds alternados
- ✅ Tipografia clara (Inter + JetBrains Mono)
- ✅ Cores semânticas (verde = benefício, vermelho = problema)
- ✅ Espaçamento generoso (py-20 entre seções)
- ✅ CTAs destacados com sombras

### Conversão
- ✅ Múltiplos CTAs (hero, final, nav)
- ✅ Prova social (410 testes, stack moderna)
- ✅ Redução de fricção (FAQ, objeções respondidas)
- ✅ Urgência implícita (beta grátis, futuro freemium)

## 🚀 Como Usar

### Desenvolvimento Local

```bash
cd apps/marketing
bun dev:marketing
```

Acesse: `http://localhost:5173/index.pt-br.html`

### Build para Produção

```bash
cd apps/marketing
bun build:marketing
```

## 📊 Métricas a Acompanhar (Futuro)

Quando implementar analytics:

1. **Conversão**
   - Taxa de clique no CTA primário
   - Taxa de clique no demo em vídeo
   - Taxa de scroll até FAQ

2. **Engajamento**
   - Tempo médio na página
   - Seções mais visualizadas
   - FAQs mais expandidos

3. **Tráfego**
   - Origem (GitHub, Twitter, Reddit)
   - Dispositivos (desktop vs mobile)
   - Localização geográfica (validar público BR)

## 🔄 Próximas Iterações

### V1.1 (Planejado)
- [ ] Screenshots reais da interface
- [ ] GIF animado do workflow completo
- [ ] Depoimentos de early adopters
- [ ] Seção de "Use Cases" com exemplos reais

### V1.2 (Planejado)
- [ ] Vídeo demo embebido (não só link YouTube)
- [ ] Comparação técnica mais detalhada
- [ ] Roadmap público visível
- [ ] Blog/changelog integrado

### V2.0 (Futuro)
- [ ] Pricing table interativa (quando lançar Pro)
- [ ] Calculadora de ROI personalizada
- [ ] Case studies detalhados
- [ ] Comunidade/Discord integrado

## 📝 Notas Importantes

### O que NÃO fazer
- ❌ Não exagerar promessas (manter "5x mais rápido", não "100x")
- ❌ Não esconder que é beta (transparência)
- ❌ Não usar jargão técnico desnecessário
- ❌ Não adicionar features que não existem
- ❌ Não remover menção ao Obsidian Note Reviewer (crédito ao fork)

### O que SEMPRE fazer
- ✅ Manter tom brasileiro autêntico
- ✅ Atualizar números de versão quando mudar
- ✅ Sincronizar com DNAs (são fonte da verdade)
- ✅ Testar em mobile (50%+ do tráfego esperado)
- ✅ Validar acessibilidade (ARIA, keyboard navigation)

## 🔗 Links Importantes

- **Produto**: https://github.com/alexdonega/obsidian-note-reviewer
- **DNAs**: `C:\dev\obsidian-alexdonega\Esforços\Work\DNAs`
- **Fork original**: https://github.com/alexdonega/obsidian-note-reviewer
- **Demo**: https://r.alexdonega.com.br

---

**Versão**: 1.0
**Criado em**: 2026-01-01
**Autor**: Claude Code com base nos DNAs do produto
**Licença**: BSL-1.1 (mesma do produto)
