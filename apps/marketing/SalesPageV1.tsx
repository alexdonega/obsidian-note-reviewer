import React from "react";
import { ModeToggle } from "@obsidian-note-reviewer/ui/components/ModeToggle";

interface SalesPageV1Props {
  onEnter?: () => void;
}

export const SalesPageV1: React.FC<SalesPageV1Props> = ({ onEnter }) => {
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);
  const [isTermsOpen, setIsTermsOpen] = React.useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-6 bg-background/95 backdrop-blur-sm border-b border-border/30 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">NR</span>
            </div>
            <span className="text-base font-semibold tracking-tight">
              Note Reviewer
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-sm">
            <a
              href="#como-funciona"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Como funciona
            </a>
            <span className="text-muted-foreground/30">|</span>
            <a
              href="#beneficios"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Benefícios
            </a>
          </div>
          <ModeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Integração nativa com Claude Code e OpenCode
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Revise notas como elas
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                merecem ser revisadas
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              Interface visual que renderiza markdown perfeitamente, integra com AI agents automaticamente, e salva no Obsidian sem fricção.
            </p>

            <p className="text-base text-muted-foreground/80 mb-10">
              <strong className="text-foreground">Do terminal para a interface.</strong> Sem copiar/colar. Sem perder formatação. Workflow de 10 minutos vira 30 segundos.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a
                href="https://buy.stripe.com/test_note_reviewer_lifetime_37"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                Garantir por R$37
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
              <button
                onClick={() => setIsVideoOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-secondary/10 text-foreground font-semibold text-lg hover:bg-secondary/20 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Ver Demo
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Lifetime por R$37
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                100% local
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Instalação em 30 segundos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Problema → Solução */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
              Do Caos à Claridade
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold">
              O problema que você conhece bem
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* ANTES */}
            <div className="p-8 rounded-2xl border-2 border-destructive/20 bg-destructive/5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-destructive">ANTES</h4>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-destructive shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Scrollar 200 linhas de terminal para revisar plano do Claude</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-destructive shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Copiar/colar manualmente para Obsidian</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-destructive shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Frontmatter YAML quebrado, callouts viram texto puro</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-destructive shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Recriar estrutura manualmente (5-10 minutos/documento)</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-destructive shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Feedback impreciso para AI ("melhore a seção X")</span>
                </li>
              </ul>
              <div className="mt-6 p-4 rounded-lg bg-background/50 border border-destructive/20">
                <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resultado: 10 minutos desperdiçados por documento
                </p>
              </div>
            </div>

            {/* DEPOIS */}
            <div className="p-8 rounded-2xl border-2 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-primary">DEPOIS</h4>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Interface abre automaticamente quando Claude termina</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Callouts renderizados perfeitamente + Mermaid funcionando</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Frontmatter YAML editável visualmente</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Anotações estruturadas (DELETE, INSERT, REPLACE, COMMENT)</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Um clique salva direto no vault, tudo preservado</span>
                </li>
              </ul>
              <div className="mt-6 p-4 rounded-lg bg-background/50 border border-primary/20">
                <p className="text-sm font-semibold text-primary flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
                  </svg>
                  Resultado: 30 segundos da revisão ao salvamento
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground">
              <strong className="text-foreground">20x mais rápido.</strong> Zero fricção. 100% de preservação.
            </p>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
              Por que Note Reviewer
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Único que combina os 4 elementos
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Outras ferramentas fazem 1 ou 2 desses. Note Reviewer é a única que faz todos os 4.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <BenefitCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              }
              title="Renderização Perfeita de Obsidian"
              description="Único que renderiza callouts do Obsidian com Mermaid embutido. Suporta 15+ tipos (note, warning, tip, etc.) com syntax highlighting automático."
            />
            <BenefitCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
              title="Integração Automática com AI Agents"
              description="Hook nativo que abre automaticamente quando Claude Code termina. Feedback estruturado retorna direto para o agent. Zero passos manuais."
            />
            <BenefitCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
              title="Frontmatter YAML Editável"
              description="Único com editor visual de frontmatter + validação em tempo real. Preserva formatação original ao exportar. Zero quebra de metadados."
            />
            <BenefitCard
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              }
              title="Salvamento Direto no Vault"
              description="12 templates pré-configurados com paths automáticos. Seleciona 'Vídeo YouTube' → frontmatter preenchido + path correto. Simples assim."
            />
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
              Workflow Completo
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              30 segundos do início ao fim
            </h3>
          </div>

          <div className="space-y-8">
            <WorkflowStep
              num={1}
              time="3s"
              title="AI Agent Termina"
              description="Claude Code finaliza geração de plano → Hook dispara automaticamente → Servidor local inicia em porta aleatória"
            />
            <WorkflowStep
              num={2}
              time="2s"
              title="Interface Abre"
              description="Browser abre automaticamente em http://localhost:PORTA → Carrega conteúdo do plano via /api/content → Renderiza markdown com callouts + Mermaid"
            />
            <WorkflowStep
              num={3}
              time="20s"
              title="Você Revisa"
              description="Lê documento visualmente renderizado → Adiciona anotações (seleciona texto → marca DELETE/INSERT/etc.) → Edita frontmatter se necessário → Adiciona comentários globais"
            />
            <WorkflowStep
              num={4}
              time="5s"
              title="Salvamento"
              description="Clica 'Salvar no vault' → Seleciona template (opcional) → Confirma path sugerido → Nota salva com frontmatter preservado, callouts intactos"
            />
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-primary/10 border border-primary/20">
            <p className="text-center text-lg font-semibold">
              <span className="text-primary">TOTAL: ~30 segundos</span>
              <span className="text-muted-foreground"> vs. 10 minutos antes</span>
            </p>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
              Templates Inteligentes
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              12 templates pré-configurados
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cada template com frontmatter pré-preenchido, path correto e tags padrão. Persistência via cookies (lembra última escolha).
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Vídeo YouTube", path: "Sources/Videos/YouTube/" },
              { name: "Artigo Web", path: "Sources/Articles/" },
              { name: "Conceito Atômico", path: "Atlas/Atomos/Conceitos/" },
              { name: "Framework", path: "Atlas/Atomos/Frameworks/" },
              { name: "Pessoa", path: "Atlas/Atomos/Pessoas/" },
              { name: "MOC", path: "Atlas/MOCs/" },
              { name: "Projeto", path: "Projects/" },
              { name: "Newsletter", path: "Sources/Newsletters/" },
              { name: "Livro", path: "Sources/Books/" },
              { name: "Podcast", path: "Sources/Podcasts/" },
              { name: "Citação", path: "Atlas/Atomos/Quotes/" },
              { name: "Roteiro Vídeo", path: "Content/Roteiros/Videos/" },
            ].map((template, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card transition-colors"
              >
                <p className="font-semibold mb-1">{template.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{template.path}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparação */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
              Comparação
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold">
              Note Reviewer vs. Alternativas
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold">Aspecto</th>
                  <th className="text-center p-4 font-semibold">Workflow Manual</th>
                  <th className="text-center p-4 font-semibold">Obsidian Nativo</th>
                  <th className="text-center p-4 font-semibold text-primary">Note Reviewer</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <ComparisonRow
                  feature="Tempo/documento"
                  manual="10 min"
                  obsidian="5 min"
                  noteReviewer="30s"
                />
                <ComparisonRow
                  feature="Renderiza callouts"
                  manual={false}
                  obsidian={true}
                  noteReviewer={true}
                />
                <ComparisonRow
                  feature="Integração Claude Code"
                  manual={false}
                  obsidian={false}
                  noteReviewer={true}
                />
                <ComparisonRow
                  feature="Sistema de anotações"
                  manual={false}
                  obsidian={false}
                  noteReviewer={true}
                />
                <ComparisonRow
                  feature="Templates com paths"
                  manual={false}
                  obsidian="Parcial"
                  noteReviewer={true}
                />
                <ComparisonRow
                  feature="Preserva frontmatter"
                  manual={false}
                  obsidian={true}
                  noteReviewer={true}
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Quem Desenvolveu */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
              Quem Está Por Trás
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Desenvolvido por quem vive isso na prática
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Este não é mais um projeto abandonado no GitHub. É uma ferramenta criada por alguém que usa Obsidian, Claude Code e IA todos os dias.
            </p>
          </div>

          <div className="bg-card/50 border border-border/50 rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Foto */}
              <div className="shrink-0">
                <img
                  src="/alex-donega.webp"
                  alt="Alex Donega"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary/20"
                />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-bold mb-2">Alex Donega</h4>
                <p className="text-lg text-primary mb-4">Engenheiro de Contexto · Diretor na Autobots Ventures</p>

                <div className="space-y-3 mb-6 text-sm md:text-base">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Por que você pode confiar:</strong> Sou o criador do curso{" "}
                    <a
                      href="https://alexdonega.com.br/segundo-cerebro-com-obsidian/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold"
                    >
                      "Clone seu Cérebro, Domine o Obsidian"
                    </a>
                    , especialista em produtividade com IA e responsável por +25 software no ecossistema Autobots Ventures (R$150M+ em valuation).
                  </p>

                  <p className="text-muted-foreground leading-relaxed">
                    Criei o Note Reviewer porque eu mesmo enfrentava esse problema: revisar outputs do Claude Code era lento e frustrante. Testei 410 vezes até funcionar perfeitamente. Agora uso diariamente e decidi disponibilizar para outros desenvolvedores PKM.
                  </p>

                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Transparência total:</strong> Este é um projeto ativo, com atualizações frequentes e suporte real. Não é vaporware. É uma ferramenta que uso no meu dia a dia e mantenho funcionando porque dependo dela.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <a
                    href="https://alexdonega.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary/10 text-foreground text-sm font-semibold hover:bg-secondary/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 919-9" />
                    </svg>
                    Ver Meu Site
                  </a>
                  <a
                    href="https://alexdonega.com.br/segundo-cerebro-com-obsidian/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Curso de Obsidian
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Prova Social Adicional */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-lg bg-card/30 border border-border/30">
              <div className="text-2xl font-bold text-primary mb-1">410+</div>
              <div className="text-xs text-muted-foreground">Testes até funcionar</div>
            </div>
            <div className="p-4 rounded-lg bg-card/30 border border-border/30">
              <div className="text-2xl font-bold text-primary mb-1">25+</div>
              <div className="text-xs text-muted-foreground">Software no portfólio</div>
            </div>
            <div className="p-4 rounded-lg bg-card/30 border border-border/30">
              <div className="text-2xl font-bold text-primary mb-1">R$150M+</div>
              <div className="text-xs text-muted-foreground">Valuation gerado</div>
            </div>
            <div className="p-4 rounded-lg bg-card/30 border border-border/30">
              <div className="text-2xl font-bold text-primary mb-1">100%</div>
              <div className="text-xs text-muted-foreground">Uso diário real</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing e CTA Final */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-12">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-4">
              Investimento
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comece sua transformação hoje
            </h2>
          </div>

          {/* Pricing Card */}
          <div className="max-w-lg mx-auto bg-gradient-to-br from-card to-card/80 border-2 border-primary rounded-3xl p-12">
            {/* Social Proof */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 fill-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Testado em <strong className="text-foreground">410+ testes automatizados</strong>
              </p>
            </div>

            {/* Badge */}
            <div className="inline-block border-b-2 border-primary pb-2 mb-4">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Oferta de Lançamento
              </span>
            </div>

            {/* Original Price */}
            <div className="text-2xl text-muted-foreground line-through mb-2">
              De R$97/ano
            </div>

            {/* Main Price */}
            <div className="mb-8">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-2xl text-muted-foreground">R$</span>
                <span className="text-7xl font-bold text-foreground">37</span>
              </div>
              <p className="text-lg text-muted-foreground">
                Pagamento único · <span className="text-foreground font-semibold">Acesso Lifetime</span>
              </p>
            </div>

            {/* Features List */}
            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-base text-muted-foreground">Acesso vitalício a todas as features</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-base text-muted-foreground">Atualizações gratuitas para sempre</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-base text-muted-foreground">12 templates pré-configurados</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-base text-muted-foreground">Integração com Claude Code e OpenCode</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-base text-muted-foreground">Suporte prioritário via GitHub</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-base text-muted-foreground">Discord privado (primeiros 100)</span>
              </li>
            </ul>

            {/* CTA Button */}
            <a
              href="https://buy.stripe.com/test_note_reviewer_lifetime_37"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold text-lg uppercase tracking-wide py-6 px-8 rounded-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-600/40 w-full mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Garantir Acesso Lifetime
            </a>

            {/* Guarantee Box */}
            <div className="flex items-start gap-4 bg-primary/10 border border-primary/30 rounded-xl p-6 text-left">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 fill-primary-foreground" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-base font-semibold text-foreground mb-1">
                  Garantia incondicional de 30 dias
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Se por qualquer motivo você não gostar do Note Reviewer, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-6">
            <FAQItem
              question="Não tenho tempo para aprender ferramenta nova"
              answer="Zero curva de aprendizado. Claude Code termina → abre automaticamente → você revisa. Instala em 2 comandos. 30 segundos. Funciona."
              ctaText="Economize tempo agora por R$37"
              ctaUrl="https://buy.stripe.com/test_note_reviewer_lifetime_37"
            />
            <FAQItem
              question="Já uso Obsidian nativo, por que preciso disso?"
              answer="Note Reviewer não substitui Obsidian. Complementa. Obsidian = escrever e organizar notas. Note Reviewer = revisar notas de AI agents visualmente. Use os dois. Não compete, integra."
              ctaText="Integrar com meu Obsidian"
              ctaUrl="https://buy.stripe.com/test_note_reviewer_lifetime_37"
            />
            <FAQItem
              question="E se eu não uso Claude Code?"
              answer="Funciona sem Claude Code também. Abra qualquer nota markdown no portal web: https://r.alexdonega.com.br. Renderiza callouts + Mermaid, edita frontmatter, compartilha. Claude Code é uma forma de usar, não a única."
              ctaText="Garantir acesso por R$37"
              ctaUrl="https://buy.stripe.com/test_note_reviewer_lifetime_37"
            />
            <FAQItem
              question="Parece complexo de instalar"
              answer="2 comandos. 30 segundos. Windows PowerShell: irm https://r.alexdonega.com.br/install.ps1 | iex. Pronto. Funciona."
              ctaText="Começar agora por R$37"
              ctaUrl="https://buy.stripe.com/test_note_reviewer_lifetime_37"
            />
            <FAQItem
              question="Meu vault tem dados sensíveis. É seguro?"
              answer="100% local. Zero dados em servidor. Como funciona: • Servidor roda na SUA máquina (localhost) • Notas ficam no SEU vault • Compartilhamento: dados comprimidos na URL (stateless) • Zero tracking, zero analytics. Código aberto: audite você mesmo."
              ctaText="Garantir segurança total por R$37"
              ctaUrl="https://buy.stripe.com/test_note_reviewer_lifetime_37"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          {/* Copyright */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground">
              © 2025 DONEGA NEGÓCIOS DIGITAIS | CNPJ: 52.460.940/0001-67
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border/30 mb-8"></div>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Importante:</strong> Note Reviewer não é um produto associado à Anthropic, Claude AI ou qualquer plataforma de IA mencionada.
              Ao tratar de questões de produtividade em nossos produtos, incluindo sites, vídeos, palestras, programas ou outros conteúdos, nos esforçamos ao máximo para garantir que representem com precisão nosso software e sua capacidade de impactar positivamente o seu workflow e a sua produtividade.
              No entanto, é importante frisar que os resultados alcançados dependem inteiramente do empenho, dedicação e aplicação de cada indivíduo.
              As estratégias e informações que fornecemos não garantem que você obterá resultados de produtividade ou ganhos de tempo específicos.
              Nada em nosso site ou em nossos materiais deve ser interpretado como uma promessa ou garantia de ganhos futuros.
              Seu sucesso depende do seu esforço, dedicação e aplicação das ideias, ferramentas e estratégias que propomos.
              Estamos aqui para apoiar você com recursos valiosos no seu caminho, mas o seu sucesso é fruto do seu próprio esforço e dedicação.
              Ao fazer seu cadastro em nosso site, você concorda com os nossos{" "}
              <button onClick={() => setIsTermsOpen(true)} className="text-primary hover:underline font-medium">
                Termos de Uso
              </button>{" "}
              e{" "}
              <button onClick={() => setIsPrivacyOpen(true)} className="text-primary hover:underline font-medium">
                Política de Privacidade
              </button>.
            </p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoId="a_AT7cEN_9I"
      />

      {/* Terms Modal */}
      <LegalModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        title="Termos de Uso"
        content="terms"
      />

      {/* Privacy Modal */}
      <LegalModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        title="Política de Privacidade"
        content="privacy"
      />
    
      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/554599711775?text=Estou%20na%20p%C3%A1gina%20de%20vendas%20do%20Obsidian%20Note%20Reviewer%20e%20quero%20tirar%20uma%20d%C3%BAvida"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-110 z-50"
        aria-label="Fale conosco no WhatsApp"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
};

// Helper Components
const BenefitCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="p-6 rounded-xl border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card transition-all">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h4 className="text-lg font-semibold mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

const WorkflowStep: React.FC<{
  num: number;
  time: string;
  title: string;
  description: string;
}> = ({ num, time, title, description }) => (
  <div className="flex gap-4 items-start">
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center">
        {num}
      </div>
      <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
        {time}
      </div>
    </div>
    <div className="pt-1">
      <h4 className="text-lg font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const ComparisonRow: React.FC<{
  feature: string;
  manual: string | boolean;
  obsidian: string | boolean;
  noteReviewer: string | boolean;
}> = ({ feature, manual, obsidian, noteReviewer }) => (
  <tr className="border-b border-border/50">
    <td className="p-4 font-medium">{feature}</td>
    <td className="p-4 text-center">
      {typeof manual === "boolean" ? (
        manual ? (
          <svg className="w-5 h-5 text-primary inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-destructive inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      ) : (
        <span className="text-muted-foreground">{manual}</span>
      )}
    </td>
    <td className="p-4 text-center">
      {typeof obsidian === "boolean" ? (
        obsidian ? (
          <svg className="w-5 h-5 text-primary inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-destructive inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      ) : (
        <span className="text-muted-foreground">{obsidian}</span>
      )}
    </td>
    <td className="p-4 text-center font-semibold">
      {typeof noteReviewer === "boolean" ? (
        noteReviewer ? (
          <svg className="w-5 h-5 text-primary inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-destructive inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      ) : (
        <span className="text-primary">{noteReviewer}</span>
      )}
    </td>
  </tr>
);

const FAQItem: React.FC<{
  question: string;
  answer: string;
  ctaText: string;
  ctaUrl: string;
}> = ({ question, answer, ctaText, ctaUrl }) => (
  <details className="group p-6 rounded-xl border border-border/50 bg-card/50 hover:border-primary/50 transition-colors">
    <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
      <span>{question}</span>
      <svg
        className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </summary>
    <div className="mt-4 space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        {answer}
      </p>
      <a
        href={ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        {ctaText}
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </a>
    </div>
  </details>
);

const VideoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}> = ({ isOpen, onClose, videoId }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          aria-label="Fechar vídeo"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* YouTube iframe */}
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="Note Reviewer Demo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

const LegalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: 'terms' | 'privacy';
}> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="relative w-full max-w-3xl my-8 bg-background rounded-xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 text-sm space-y-6">
          {content === 'terms' ? (
            <>
              <p className="text-xs text-muted-foreground mb-4">Atualizado em 01 de janeiro de 2025</p>

              <section>
                <h3 className="text-lg font-semibold mb-3">1. Objeto</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  1.1. Constitui objeto deste Instrumento a outorga de licença de uso do Software denominado "Note Reviewer" (o "Software"), em caráter oneroso, não exclusivo e intransferível pela DONEGA NEGÓCIOS DIGITAIS LTDA ("CONTRATADA") em favor do CLIENTE, nas formas e condições definidas neste Termo.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  1.2. O Software é licenciado com a única finalidade de servir exclusivamente à atividade pessoal ou empresarial do CLIENTE para revisão e edição de notas Markdown geradas por AI agents, não estando a CONTRATADA obrigada a fornecer qualquer funcionalidade, melhoria ou recurso adicional além do especificado.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  1.3. O Note Reviewer é um software desktop que funciona 100% localmente na máquina do usuário, sendo de exclusiva responsabilidade do CONTRATANTE possuir todos os equipamentos e manter a configuração técnica necessária para a adequada operacionalização do serviço.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. Licença e Pagamento</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  2.1. A licença do Note Reviewer é oferecida na modalidade <strong>Lifetime</strong> (vitalícia) pelo valor único de R$ 37,00 (trinta e sete reais).
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  2.2. O pagamento é realizado uma única vez, não havendo cobranças recorrentes ou mensalidades.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  2.3. A licença concede acesso vitalício a todas as funcionalidades do Software, incluindo atualizações gratuitas que vierem a ser disponibilizadas.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  2.4. O acesso ao Software se dará a partir da confirmação do pagamento e fornecimento da chave de licença ao CLIENTE.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. Obrigações do Cliente</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">3.1. São obrigações da CONTRATANTE:</p>
                <ul className="space-y-2 text-muted-foreground ml-4">
                  <li>a) Utilizar o Software observando os limites legais e contratuais, sem que isto lhe constitua uma transferência de propriedade ou qualquer outro título de direito sobre o Software.</li>
                  <li>b) Realizar cópia de backup dos dados processados pelo Software de acordo com seu interesse e necessidade, sendo o CLIENTE o único responsável por manter backups adequados de seus arquivos.</li>
                  <li>c) Utilizar das informações do Software única e exclusivamente para os fins contratados, guardando o dever de confidencialidade quanto a tais informações.</li>
                  <li>d) Não modificar, reproduzir, comercializar, sublicenciar, ceder, doar, alienar, alugar, distribuir, transmitir ou transferir a terceiro, por qualquer forma, mesmo gratuita, ou fazer engenharia reversa do Software.</li>
                  <li>e) Não utilizar ou modificar o Software para fins criminais ou ilegais do ponto de vista de legislações nacionais ou internacionais aplicáveis.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. Propriedade Intelectual</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  4.1. Os direitos de propriedade intelectual do Software e demais materiais que o compõem são de propriedade exclusiva da CONTRATADA e/ou de seus licenciadores, não tendo o CONTRATANTE qualquer autorização para agir em nome deles ou promover qualquer registro em autoridade competente.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  4.2. Qualquer violação ou uso não autorizado promovido pelo CONTRATANTE implicará na aplicação de sanções e multas previstas neste Termo, sem prejuízo de desdobramentos na esfera cível e criminal.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  4.3. Nenhuma disposição deste instrumento deve ser entendida como cessão ao CONTRATANTE dos direitos de propriedade intelectual da CONTRATADA.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. Limitação de Responsabilidade</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  5.1. O Software é fornecido "como está" (as is), sem garantias de qualquer tipo, expressas ou implícitas.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  5.2. A CONTRATADA não se responsabiliza por perdas de dados causadas por mau uso do Software, falhas de infraestrutura do CLIENTE, ou integrações com softwares de terceiros (incluindo, mas não se limitando a, AI agents, Claude Code, ou Obsidian).
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  5.3. O CLIENTE reconhece que é o único responsável por manter backups adequados de seus dados e arquivos processados pelo Software.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  5.4. Qualquer responsabilidade da CONTRATADA não ultrapassará, em nenhuma hipótese, a quantia equivalente ao valor pago pelo CONTRATANTE pela licença (R$ 37,00).
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. Vigência e Rescisão</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  6.1. O presente Termo entrará em vigor a partir do aceite pelo CONTRATANTE e terá vigência por prazo indeterminado.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  6.2. A licença Lifetime não possui prazo de expiração e permanece válida enquanto o CLIENTE observar os termos deste instrumento.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  6.3. A CONTRATADA se reserva o direito de cancelar a licença em caso de violação dos termos deste instrumento, sem direito a reembolso.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">7. Proteção de Dados</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  7.1. O Note Reviewer funciona 100% localmente na máquina do CLIENTE. O conteúdo das notas processadas pelo Software NÃO é transmitido para servidores da CONTRATADA.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  7.2. Apenas dados cadastrais (nome, e-mail) e informações de licenciamento são armazenados pela CONTRATADA para fins de ativação e suporte.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  7.3. O tratamento de dados pessoais está detalhado na Política de Privacidade, que integra este Termo.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">8. Disposições Gerais</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  8.1. A CONTRATADA poderá alterar as disposições deste Termo a qualquer momento, mediante publicação dos termos atualizados.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  8.2. Caso o CONTRATANTE não concorde com as alterações, poderá continuar utilizando o Software sob os termos anteriores, mas não terá direito a atualizações futuras.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  8.3. Este Termo será regido pela legislação da República Federativa do Brasil. Fica eleito o Foro da Comarca de Toledo/PR para dirimir qualquer controvérsia decorrente do presente Termo.
                </p>
              </section>

              <div className="pt-6 border-t border-border/30 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">DONEGA NEGÓCIOS DIGITAIS LTDA</p>
                <p>CNPJ: 52.460.940/0001-67</p>
                <p>Rua Crissiumal, 2071, apto 202, Jardim La Salle</p>
                <p>Toledo/PR - CEP: 85902-120</p>
                <p className="mt-3">© 2025 DONEGA NEGÓCIOS DIGITAIS. Todos os direitos reservados.</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-4">Atualizado em 01 de janeiro de 2025</p>

              <section>
                <h3 className="text-lg font-semibold mb-3">1. Sobre a Empresa</h3>
                <p className="text-muted-foreground leading-relaxed">
                  DONEGA NEGÓCIOS DIGITAIS LTDA, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o n.º 52.460.940/0001-67, com sede na Rua Crissiumal, 2071, apto 202, Jardim La Salle, Toledo/PR, CEP: 85902-120.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. Objetivo</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Esta Política de Privacidade e Tratamento de Dados tem o propósito de demonstrar o compromisso do Note Reviewer com a privacidade e o tratamento de dados pessoais dos usuários, conforme a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e demais legislações sobre o tema.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. Dados Pessoais Coletados</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  3.1. O Note Reviewer coleta os seguintes dados pessoais:
                </p>
                <div className="space-y-3 text-muted-foreground">
                  <div className="pl-4">
                    <p className="font-semibold text-foreground mb-1">Dados Cadastrais:</p>
                    <ul className="space-y-1 ml-4 text-sm">
                      <li>• Nome completo - para identificação do usuário</li>
                      <li>• E-mail - para comunicação e envio da chave de licença</li>
                      <li>• Telefone (opcional) - para suporte técnico</li>
                    </ul>
                  </div>
                  <div className="pl-4">
                    <p className="font-semibold text-foreground mb-1">Dados de Identificação Digital:</p>
                    <ul className="space-y-1 ml-4 text-sm">
                      <li>• Endereço IP - cumprimento do Marco Civil da Internet (Lei 12.965/2014)</li>
                      <li>• Registros de acesso - fins de segurança e estatísticos</li>
                      <li>• Cookies - para melhorar a experiência de navegação no site</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. Finalidade do Tratamento</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  4.1. Os dados pessoais são utilizados para as seguintes finalidades:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-4 text-sm">
                  <li>• Identificação e autenticação do usuário</li>
                  <li>• Envio da chave de licença do Software</li>
                  <li>• Comunicação sobre atualizações e suporte técnico</li>
                  <li>• Cumprimento de obrigações legais e regulatórias</li>
                  <li>• Fins estatísticos e de segurança da informação</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. Privacidade e Segurança dos Dados</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  5.1. <strong className="text-foreground">Importante:</strong> O Note Reviewer funciona 100% localmente em sua máquina. O conteúdo das notas que você processa com o Software NÃO é enviado para nossos servidores.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  5.2. Apenas dados cadastrais (nome, e-mail) e informações de licenciamento são armazenados em ambiente seguro e controlado.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  5.3. Adotamos medidas técnicas e organizacionais para proteger os dados pessoais contra destruição acidental ou ilícita, perda, alteração, comunicação ou acesso não autorizado.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  5.4. Utilizamos criptografia SSL/TLS para transmissão de dados e armazenamento seguro em servidores com backup regular.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. Armazenamento e Retenção</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  6.1. Os dados cadastrais serão armazenados pelo prazo de 5 (cinco) anos após o término da relação comercial, conforme previsto no Código de Defesa do Consumidor.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  6.2. Os dados de identificação digital (IP, logs de acesso) serão armazenados por 6 (seis) meses, conforme determina o Marco Civil da Internet.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  6.3. O usuário pode solicitar a exclusão dos dados antes do prazo, exceto quando houver obrigação legal de retenção.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">7. Direitos do Titular</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  7.1. Conforme a LGPD, o usuário tem direito a:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-4 text-sm">
                  <li>• Confirmação da existência de tratamento de dados</li>
                  <li>• Acesso aos dados pessoais</li>
                  <li>• Correção de dados incompletos, inexatos ou desatualizados</li>
                  <li>• Anonimização, bloqueio ou eliminação de dados desnecessários</li>
                  <li>• Portabilidade dos dados a outro fornecedor</li>
                  <li>• Eliminação dos dados tratados com consentimento</li>
                  <li>• Informação sobre compartilhamento de dados</li>
                  <li>• Revogação do consentimento</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  7.2. Para exercer esses direitos, entre em contato através do e-mail: <a href="mailto:alexdonega@gmail.com" className="text-primary hover:underline">alexdonega@gmail.com</a>
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">8. Compartilhamento de Dados</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  8.1. Os dados pessoais NÃO são compartilhados com terceiros para fins comerciais.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  8.2. Dados podem ser compartilhados apenas nas seguintes hipóteses:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-4 text-sm">
                  <li>• Cumprimento de obrigação legal ou regulatória</li>
                  <li>• Ordem judicial ou requisição de autoridade competente</li>
                  <li>• Proteção da vida ou da incolumidade física do titular ou de terceiro</li>
                  <li>• Tutela da saúde, em procedimento realizado por profissionais da área da saúde</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">9. Cookies</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  9.1. O site do Note Reviewer utiliza cookies para otimizar a navegação e melhorar a experiência do usuário.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  9.2. Cookies são pequenos arquivos de texto armazenados no navegador que permitem reconhecer o usuário em visitas futuras.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  9.3. O usuário pode gerenciar ou desabilitar cookies através das configurações do navegador, porém isso pode afetar a funcionalidade do site.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">10. Alterações na Política</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  10.1. Esta Política de Privacidade pode ser alterada a qualquer momento para garantir conformidade com leis aplicáveis.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  10.2. Recomendamos que o usuário revise esta política periodicamente. Alterações entram em vigor imediatamente após publicação.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">11. Contato e Encarregado de Dados</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  11.1. Para questões relacionadas a esta Política de Privacidade ou exercício de direitos previstos na LGPD:
                </p>
                <p className="text-muted-foreground leading-relaxed ml-4">
                  <strong className="text-foreground">E-mail:</strong> <a href="mailto:alexdonega@gmail.com" className="text-primary hover:underline">alexdonega@gmail.com</a>
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">12. Lei Aplicável</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Esta Política será regida pela legislação brasileira, especialmente pela Lei Geral de Proteção de Dados (Lei 13.709/2018) e pelo Marco Civil da Internet (Lei 12.965/2014).
                </p>
              </section>

              <div className="pt-6 border-t border-border/30 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">DONEGA NEGÓCIOS DIGITAIS LTDA</p>
                <p>CNPJ: 52.460.940/0001-67</p>
                <p>Rua Crissiumal, 2071, apto 202, Jardim La Salle</p>
                <p>Toledo/PR - CEP: 85902-120</p>
                <p>E-mail: <a href="mailto:alexdonega@gmail.com" className="text-primary hover:underline">alexdonega@gmail.com</a></p>
                <p className="mt-3">© 2025 DONEGA NEGÓCIOS DIGITAIS. Todos os direitos reservados.</p>
                <p className="mt-2 text-muted-foreground/60">Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</p>
              </div>
            </>
          )}
        </div>
        <div className="p-4 border-t border-border/30 bg-muted/10">
          <button onClick={onClose} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90">Entendi</button>
        </div>
      </div>
    </div>
  );
};
