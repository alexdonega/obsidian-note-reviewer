#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

base_path = r'C:/dev/obsidian-alexdonega/Atlas/Atomos/Conceitos'

notes = {
    "Ralph Wiggum Technique": {
        "colecao": "ia",
        "relacionado": ["Claude Code", "Stop Hook", "Completion Promise", "Agentes de IA"],
        "tags": ["conceito", "claude-code", "automacao", "agentes-ia"],
        "content": """A **Ralph Wiggum Technique** e uma tecnica de automacao para [[Agentes de IA]] criada por Geoffrey Huntley, inspirada no personagem Ralph Wiggum dos Simpsons. A ideia central e combinar ingenuidade com persistencia implacavel.

A tecnica consiste em um loop infinito que executa o mesmo prompt repetidamente ate que a tarefa seja concluida com sucesso. Originalmente implementada como um simples loop [[Bash]] while, foi posteriormente integrada ao [[Claude Code]] pela Anthropic usando o sistema de [[Stop Hook]].

O segredo do sucesso esta em fornecer criterios de conclusao claros (via [[Completion Promise]]) e limitar iteracoes (via [[Max Iterations]]) para controlar custos. Isso permite deixar tarefas rodando overnight e acordar com codigo funcional."""
    },

    "Completion Promise": {
        "colecao": "ia",
        "relacionado": ["Ralph Wiggum Technique", "Stop Hook", "Claude Code"],
        "tags": ["conceito", "claude-code", "automacao"],
        "content": """A **Completion Promise** e o sinal de conclusao usado na [[Ralph Wiggum Technique]] para indicar quando o loop de execucao deve parar. Os valores mais comuns sao "done" ou "complete".

Quando o [[Stop Hook]] do [[Claude Code]] verifica a saida de uma execucao, ele procura pela Completion Promise. Se encontrar, encerra o loop. Se nao encontrar, re-executa o mesmo prompt automaticamente.

E crucial que o prompt instrua claramente o agente a escrever a Completion Promise apenas quando a tarefa estiver realmente concluida e validada (por exemplo, apos todos os testes passarem)."""
    },

    "Max Iterations": {
        "colecao": "ia",
        "relacionado": ["Ralph Wiggum Technique", "Stop Hook", "Claude Code"],
        "tags": ["conceito", "claude-code", "automacao", "custos"],
        "content": """**Max Iterations** e o parametro que limita o numero maximo de repeticoes na [[Ralph Wiggum Technique]], evitando loops infinitos e controlando custos.

Cada vez que o [[Stop Hook]] faz o [[Claude Code]] re-executar o prompt, um contador e incrementado. Quando atinge o valor de Max Iterations especificado, o loop para independentemente de ter encontrado a [[Completion Promise]] ou nao.

E uma protecao essencial ao usar modelos caros como Opus. Recomenda-se comecar com valores baixos (5-10) e aumentar conforme necessario."""
    },

    "Stop Hook": {
        "colecao": "ia",
        "relacionado": ["Claude Code", "Ralph Wiggum Technique", "State File"],
        "tags": ["conceito", "claude-code", "hooks", "automacao"],
        "content": """O **Stop Hook** e um tipo de hook do [[Claude Code]] que e executado quando o agente termina uma tarefa. E o mecanismo central que permite a [[Ralph Wiggum Technique]] funcionar.

Quando acionado, o Stop Hook verifica se ha algum loop ativo consultando o [[State File]]. Se houver, le a saida mais recente e procura pela [[Completion Promise]]. Se nao encontrar, dispara uma nova execucao do mesmo prompt.

Diferente do conceito original de Geoffrey Huntley (um loop bash simples), a implementacao da Anthropic usa Stop Hooks para integracao profunda com o [[Claude Code]]."""
    },

    "State File": {
        "colecao": "ia",
        "relacionado": ["Ralph Wiggum Technique", "Stop Hook", "Claude Code"],
        "tags": ["conceito", "claude-code", "automacao"],
        "content": """O **State File** e um arquivo de estado criado pelo [[Claude Code]] quando a [[Ralph Wiggum Technique]] comeca a ser executada. Ele rastreia o progresso do loop entre iteracoes.

O arquivo armazena informacoes como: prompt original, [[Completion Promise]] esperada, contador de iteracoes atual, e [[Max Iterations]] definido. O [[Stop Hook]] consulta esse arquivo para decidir se deve re-executar o prompt.

Monitorar o State File permite acompanhar o progresso de tarefas longas rodando overnight."""
    },

    "Claude Code": {
        "colecao": "ia",
        "relacionado": ["Agentes de IA", "Stop Hook", "Ralph Wiggum Technique"],
        "tags": ["conceito", "ferramenta", "anthropic", "cli"],
        "content": """O **Claude Code** e a CLI (Command Line Interface) oficial da Anthropic para desenvolvimento assistido por IA. Permite interagir com o modelo Claude diretamente do terminal.

Oferece recursos avancados como sistema de hooks ([[Stop Hook]]), plugins, e integracao com ferramentas de desenvolvimento. A [[Ralph Wiggum Technique]] foi integrada como plugin oficial, permitindo automacao de tarefas complexas.

E especialmente util para tarefas de programacao, conversao de codigo, refatoracao e desenvolvimento de MVPs com supervisao minima."""
    },

    "Agentes de IA": {
        "colecao": "ia",
        "relacionado": ["Claude Code", "Ralph Wiggum Technique", "Automacao de Desenvolvimento"],
        "tags": ["conceito", "ia", "automacao"],
        "content": """**Agentes de IA** sao sistemas autonomos baseados em inteligencia artificial capazes de executar tarefas iterativamente com minima supervisao humana. Diferem de chatbots simples por sua capacidade de tomar acoes no mundo real.

No contexto de desenvolvimento, agentes como o [[Claude Code]] podem escrever codigo, executar testes, analisar resultados e iterar ate atingir um objetivo. A [[Ralph Wiggum Technique]] explora essa capacidade ao maximo.

O potencial de ROI e significativo: casos documentados mostram MVPs desenvolvidos por USD 300 que custariam USD 50.000 com desenvolvedores tradicionais."""
    },

    "Automacao de Desenvolvimento": {
        "colecao": "ia",
        "relacionado": ["Agentes de IA", "Claude Code", "Testes Automatizados"],
        "tags": ["conceito", "ia", "desenvolvimento", "automacao"],
        "content": """**Automacao de Desenvolvimento** refere-se ao uso de ferramentas e [[Agentes de IA]] para automatizar tarefas de programacao que tradicionalmente exigiriam intervencao humana constante.

Inclui atividades como: conversao de codigo entre linguagens, refatoracao, escrita de [[Testes Automatizados]], debugging, e ate desenvolvimento de features completas. O [[Claude Code]] com a [[Ralph Wiggum Technique]] e um exemplo poderoso.

A chave para sucesso e fornecer criterios de validacao claros (como testes que devem passar) para que o agente saiba quando a tarefa esta realmente concluida."""
    },

    "Testes Automatizados": {
        "colecao": "tecnologia",
        "relacionado": ["Automacao de Desenvolvimento", "Ralph Wiggum Technique", "Bun"],
        "tags": ["conceito", "testes", "desenvolvimento", "qualidade"],
        "content": """**Testes Automatizados** sao verificacoes de codigo executadas automaticamente para validar que o software funciona conforme esperado. Sao fundamentais para [[Automacao de Desenvolvimento]] com [[Agentes de IA]].

Na [[Ralph Wiggum Technique]], testes automatizados servem como criterio de conclusao objetivo. O prompt instrui o agente a escrever testes e executa-los ate que todos passem, garantindo que o codigo gerado realmente funciona.

Frameworks como [[Bun]] Test, Jest, e Pytest sao comumente usados. A combinacao de testes + Ralph permite deixar tarefas rodando overnight com confianca."""
    },

    "Bun": {
        "colecao": "tecnologia",
        "relacionado": ["TypeScript", "Testes Automatizados", "JavaScript"],
        "tags": ["conceito", "ferramenta", "runtime", "javascript"],
        "content": """**Bun** e um runtime JavaScript/[[TypeScript]] moderno e extremamente rapido, criado como alternativa ao Node.js. Inclui bundler, transpiler e framework de testes integrados.

O Bun Test e especialmente util para [[Testes Automatizados]] em projetos TypeScript devido a sua velocidade. No video sobre [[Ralph Wiggum Technique]], foi usado para validar a conversao de Python para TypeScript.

Sua performance superior o torna ideal para ciclos de iteracao rapidos em [[Automacao de Desenvolvimento]]."""
    }
}

# Create each note
for title, data in notes.items():
    filename = f"{title}.md"
    filepath = os.path.join(base_path, filename)

    relacionado_str = '\n'.join([f'  - "[[{r}]]"' for r in data['relacionado']])
    tags_str = '\n'.join([f'  - {t}' for t in data['tags']])

    note_content = f'''---
titulo: {title}
pai: "[[O Bizarro Plugin da Anthropic Que Todo Dev Esta Perdendo - Better Stack]]"
colecao: {data['colecao']}
area:
projeto:
pessoa:
relacionado:
{relacionado_str}
tipo_nota: atomica
data_criado: 2025-01-03
data_atualizado: 2025-01-03
cssclasses: normal
imagem_destaque:
mostrar_bloco_saas: false
status_saas: false
share_link:
share_updated:
status: concluido
tags:
{tags_str}
---

{data['content']}

---
## Propriedades da nota

> [!note]- Propriedades Gerais do Obsidian
>
>> **Identificacao**
>
> | Campo      | Valor                    |
> |:-----------|:-------------------------|
> | **Titulo** | {title} |
>
>> **Conexoes**
>
> | Campo           | Valor                                                                 |
> |:----------------|:----------------------------------------------------------------------|
> | **Pai**         | [[O Bizarro Plugin da Anthropic Que Todo Dev Esta Perdendo - Better Stack]] |
> | **Colecao**     | {data['colecao'].upper()} |
> | **Relacionado** | {', '.join([f'[[{r}]]' for r in data['relacionado']])} |
>
>> **Classificacao**
>
> | Campo      | Valor                                                                 |
> |:-----------|:----------------------------------------------------------------------|
> | **Tipo**   | Atomica |
> | **Tags**   | {', '.join(data['tags'])} |
> | **Status** | Concluido |
>
>> **Temporal**
>
> | Campo          | Valor                      |
> |:---------------|:---------------------------|
> | **Criado**     | 2025-01-03       |
> | **Atualizado** | 2025-01-03   |

> [!note]- Propriedades SaaS
>
> | Campo             | Valor                                                              |
> |:------------------|:-------------------------------------------------------------------|
> | **Mostrar Bloco** | false |
> | **Status SaaS**   | false        |
'''

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(note_content)

    print(f'Criada: {filename}')

print(f'\nTotal: {len(notes)} notas atomicas criadas em {base_path}')
