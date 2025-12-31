---
title: Obsidian Note Reviewer - Guia de Teste
author: Alex Donega
tags: [obsidian, review, annotation, teste]
created: 2025-12-31
status: draft
priority: high
version: 0.2.1
---

# Obsidian Note Reviewer - Guia de Teste

## Sobre o Projeto

O **Obsidian Note Reviewer** é uma ferramenta web para revisar e anotar documentos markdown do Obsidian de forma colaborativa. Este projeto é um fork do Plannotator, adaptado especificamente para integração com vaults Obsidian.

## Funcionalidades Principais

### 1. Editor de Frontmatter YAML
Você pode editar o frontmatter YAML diretamente na interface:
- Clique no botão "Editar" que aparece ao passar o mouse sobre o bloco YAML
- Faça suas alterações
- A validação em tempo real garante que o YAML esteja correto
- Salve ou cancele conforme necessário

### 2. Sistema de Anotações
Selecione qualquer texto neste documento para adicionar anotações:
- **Comentários**: Adicione observações e sugestões
- **Highlights**: Marque trechos importantes
- **Feedback estruturado**: Organize suas revisões de forma clara

### 3. Salvar no Vault
Configure o caminho do seu vault nas configurações:
1. Clique no ícone de configurações (engrenagem)
2. Insira o **Caminho do Vault** (ex: `C:/Users/Alex/Documents/ObsidianVault`)
3. Insira o **Caminho da Nota** (ex: `projetos/note-reviewer-teste.md`)
4. Clique em "Salvar no Vault" para salvar esta nota editada

### 4. Modos de Visualização
- **Modo Autor**: Para criar e editar conteúdo
- **Modo Revisor**: Para adicionar anotações e feedback
- **Modo Visualização**: Para ver anotações compartilhadas

## Recursos Técnicos

### Arquitetura
```
obsidian-note-reviewer/
├── apps/hook/          # Servidor local com API REST
├── packages/
│   ├── editor/         # Componente principal App.tsx
│   └── ui/             # Componentes React reutilizáveis
└── docs/               # Documentação
```

### Stack Tecnológica
- **Runtime**: Bun
- **Framework**: React + TypeScript
- **Build**: Vite com plugin singlefile
- **Parsing**: Remark/Unified para markdown
- **Validação YAML**: js-yaml
- **Testes**: Bun test + React Testing Library

### API Endpoints
O servidor local expõe:
- `POST /api/save` - Salva nota no filesystem
- `GET /api/share/:hash` - Recupera nota compartilhada
- `POST /api/share` - Cria link de compartilhamento

## Melhorias Implementadas (v0.1 → v0.2.1)

### Da Upstream (Plannotator)
1. ✅ Verificação automática de atualizações
2. ✅ Exibição dinâmica da versão
3. ✅ Correção de URLs de compartilhamento
4. ✅ Melhorias na restauração de anotações

### Customizações para Obsidian
1. ✅ **Tradução completa para português brasileiro**
2. ✅ **Botão "Salvar no Vault"** com feedback visual
3. ✅ **Configuração de caminhos** persistente via cookies
4. ✅ **Editor de frontmatter YAML** com validação
5. ✅ **Documentação de integração MCP** para Claude Code
6. ✅ **Suite de testes automatizados** com cobertura >80%

## Como Testar Esta Nota

### Passo 1: Carregar a Nota
1. Abra o Obsidian Note Reviewer no navegador
2. Esta nota deve carregar automaticamente
3. Verifique se o frontmatter YAML está sendo exibido corretamente

### Passo 2: Testar Edição de Frontmatter
1. Passe o mouse sobre o bloco YAML no topo
2. Clique em "Editar"
3. Altere o valor de `status` para `in-review`
4. Salve e veja a mudança refletida

### Passo 3: Adicionar Anotações
1. Selecione este texto: **"Este é um texto importante para revisão"**
2. Adicione um comentário: "Concordo, muito relevante!"
3. Veja a anotação aparecer na barra lateral

### Passo 4: Salvar no Vault
1. Abra as configurações (ícone de engrenagem)
2. Configure:
   - Caminho do Vault: seu diretório Obsidian
   - Caminho da Nota: `testes/note-reviewer-exemplo.md`
3. Clique em "Salvar no Vault"
4. Abra o Obsidian e verifique se a nota foi criada

## Casos de Uso

### Para Autores
- Escreva notas markdown com frontmatter rico
- Receba feedback estruturado de revisores
- Mantenha histórico de revisões

### Para Revisores
- Adicione anotações contextuais
- Sugira melhorias diretamente no texto
- Aprove ou solicite alterações

### Para Equipes
- Compartilhe notas via URL
- Colabore de forma assíncrona
- Integre com workflows existentes do Obsidian

## Atalhos e Dicas

| Ação | Como Fazer |
|------|------------|
| Adicionar anotação | Selecione texto + clique no popup |
| Editar frontmatter | Hover sobre YAML + "Editar" |
| Salvar no vault | Botão "Salvar no Vault" (após configurar) |
| Ver anotações | Painel lateral direito |
| Mudar modo | Toggle Autor/Revisor no header |

## Próximos Passos

Após testar esta nota, você pode:
1. **Criar suas próprias notas** markdown com frontmatter customizado
2. **Integrar com seu vault** usando os caminhos configurados
3. **Compartilhar com revisores** gerando links de compartilhamento
4. **Explorar a integração MCP** (veja `docs/OBSIDIAN_INTEGRATION.md`)

## Suporte e Documentação

- **Repositório**: `C:/Users/Alex/Dev/obsidian-note-reviewer`
- **Docs**: `docs/OBSIDIAN_INTEGRATION.md`
- **Testes**: Execute `bun test` para ver cobertura

---

**Nota**: Esta é uma nota de exemplo criada especificamente para testar todas as funcionalidades do Obsidian Note Reviewer. Sinta-se livre para editá-la, anotá-la e salvá-la no seu vault!
