# Fluxo de Dados

## Visão Geral

Este documento descreve como os dados fluem através do sistema **obsidian-note-reviewer**.

## Fluxo Principal de Download

```
[Entrada do Usuário]
        ↓
[Validação e Parsing]
        ↓
[Autenticação na Plataforma]
        ↓
[Coleta de Metadados]
        ↓
[Lista de Recursos para Download]
        ↓
[Download de Arquivos]
        ↓
[Organização em Disco]
        ↓
[Geração de Relatório]
```

## Detalhamento por Etapa

### 1. Entrada do Usuário
**Entrada**: URL do curso, credenciais, configurações
**Processamento**: Parse e validação de formato
**Saída**: Objeto de configuração validado

### 2. Autenticação
**Entrada**: Credenciais do usuário
**Processamento**: Login na plataforma, obtenção de tokens/cookies
**Saída**: Sessão autenticada

### 3. Coleta de Metadados
**Entrada**: URL do curso, sessão autenticada
**Processamento**: Scraping ou chamadas API para estrutura do curso
**Saída**: Árvore de módulos, aulas e recursos

### 4. Download de Recursos
**Entrada**: Lista de URLs de recursos
**Processamento**: Download paralelo/sequencial com controle de taxa
**Saída**: Arquivos binários salvos localmente

### 5. Organização
**Entrada**: Arquivos baixados, metadados
**Processamento**: Criação de estrutura de pastas, renomeação
**Saída**: Curso organizado no filesystem

### 6. Relatório
**Entrada**: Log de operações
**Processamento**: Consolidação de sucessos e falhas
**Saída**: Relatório para o usuário

## Formato de Dados

### Configuração de Curso
```json
{
  "url": "https://plataforma.com/curso/123",
  "output_dir": "/caminho/destino",
  "credentials": {
    "username": "usuario",
    "password": "senha"
  },
  "options": {
    "parallel_downloads": 3,
    "overwrite": false
  }
}
```

### Metadados de Curso
```json
{
  "title": "Nome do Curso",
  "modules": [
    {
      "name": "Módulo 1",
      "lessons": [
        {
          "name": "Aula 1",
          "resources": [
            {"type": "video", "url": "...", "filename": "aula1.mp4"},
            {"type": "pdf", "url": "...", "filename": "material.pdf"}
          ]
        }
      ]
    }
  ]
}
```

## Pontos de Persistência

- **Configurações**: Arquivo de config ou argumentos CLI
- **Cache de Sessão**: Cookies/tokens para evitar reautenticação
- **Arquivos Baixados**: Sistema de arquivos local
- **Logs**: Arquivo de log para debug e auditoria

## Tratamento de Erros

- Erros de rede: Retry com backoff
- Falha de autenticação: Notificar usuário
- Arquivo corrompido: Re-download
- Sem espaço em disco: Abortar e notificar
