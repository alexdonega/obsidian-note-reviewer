# Arquitetura do Sistema

## Visão Geral

Este documento descreve a arquitetura técnica do projeto **obsidian-note-reviewer**.

## Componentes Principais

### 1. Módulo de Download
- Responsável por revisar e melhorar qualidade de notas
- Gerencia conexões e sessões
- Implementa retry logic e tratamento de erros

### 2. Módulo de Organização
- Estrutura os arquivos baixados
- Cria hierarquia de pastas
- Gerencia metadados dos cursos

### 3. Interface de Usuário
- CLI ou interface gráfica para interação
- Configurações e preferências
- Feedback de progresso

## Tecnologias Utilizadas

- **Linguagem Principal**: [A definir baseado no código]
- **Bibliotecas de HTTP**: Para requisições e downloads
- **Gerenciamento de Arquivos**: Sistema de I/O para organização

## Decisões Arquiteturais

### DA-001: Estrutura Modular
**Contexto**: Necessidade de manter código organizado e testável
**Decisão**: Separar funcionalidades em módulos independentes
**Consequências**: Facilita manutenção e testes unitários

### DA-002: Tratamento de Erros
**Contexto**: Downloads podem falhar por diversos motivos
**Decisão**: Implementar retry logic com backoff exponencial
**Consequências**: Maior resiliência, mas maior complexidade

## Fluxo de Execução

1. Usuário configura curso desejado
2. Sistema autentica na plataforma (se necessário)
3. Coleta metadados do curso
4. Faz download sequencial ou paralelo dos arquivos
5. Organiza arquivos na estrutura definida
6. Gera relatório de conclusão

## Padrões de Código

- Usar async/await para operações I/O
- Validar entradas do usuário
- Logar operações importantes
- Tratamento explícito de erros

## Integrações

- Plataformas de cursos suportadas
- Sistema de arquivos local
- Possível integração com cloud storage

## Segurança

- Armazenamento seguro de credenciais
- Validação de URLs e paths
- Sanitização de nomes de arquivos
