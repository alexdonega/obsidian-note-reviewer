# Playbooks de Agentes IA

Este diretório contém playbooks especializados que orientam como agentes de IA devem abordar tarefas específicas neste projeto.

## Agentes Disponíveis

### Desenvolvimento
- [Feature Developer](./feature-developer.md) - Desenvolvimento de novas funcionalidades
- [Bug Fixer](./bug-fixer.md) - Resolução de bugs e problemas

### Qualidade
- [Code Reviewer](./code-reviewer.md) - Revisão de código e qualidade
- [Test Writer](./test-writer.md) - Criação e manutenção de testes
- [Refactoring Specialist](./refactoring-specialist.md) - Refatoração e melhoria de código

### Especialistas Técnicos
- [Backend Specialist](./backend-specialist.md) - Lógica de negócio e integrações
- [Performance Optimizer](./performance-optimizer.md) - Otimização de performance

### Documentação e Arquitetura
- [Documentation Writer](./documentation-writer.md) - Criação e atualização de docs
- [Architect Specialist](./architect-specialist.md) - Decisões arquiteturais

### Segurança
- [Security Auditor](./security-auditor.md) - Auditoria de segurança

## Como Usar

Os assistentes de IA carregam automaticamente estes playbooks quando trabalham em tarefas relacionadas. Cada playbook contém:

- **Quando Usar**: Contexto apropriado para ativar o agente
- **Instruções**: Diretrizes específicas do projeto
- **Exemplos**: Casos práticos baseados neste codebase

## Workflow PREVC

Os agentes são ativados em diferentes fases do workflow:

- **P (Planning)**: Architect, Documentation Writer
- **R (Review)**: Code Reviewer, Security Auditor, Architect
- **E (Execution)**: Feature Developer, Bug Fixer, Test Writer
- **V (Validation)**: Test Writer, Security Auditor, Code Reviewer
- **C (Confirmation)**: Documentation Writer

## Versão

Playbooks compatíveis com @ai-coders/context v0.6.0
