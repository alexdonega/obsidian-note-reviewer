# Configuração do Obsidian Note Reviewer

Este é o Plannotator adaptado para revisar notas do Obsidian em português.

## Alterações Implementadas

✅ **Interface traduzida para pt-BR**
- Todos os textos da interface em português
- Botões, labels e mensagens localizados

✅ **Caixa de sugestões aumentada**
- Input de comentários expandido de 176px para 320px
- Mais espaço para feedback detalhado

✅ **Mascotes Tater removidos**
- Interface mais limpa e profissional
- Sem animações desnecessárias

✅ **Suporte a frontmatter YAML**
- Parser detecta e preserva frontmatter no início das notas
- Frontmatter renderizado em bloco separado

✅ **Endpoint de save no vault**
- API `/api/save` para salvar notas no vault do Obsidian
- Cria diretórios automaticamente se necessário

## Instalação

### 1. Build do projeto

```bash
cd C:/dev/obsidian-note-reviewer
bun install
bun run build
```

### 2. Configurar hook no Claude Code

Adicione ao seu `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "ExitPlanMode",
        "hooks": [
          {
            "type": "command",
            "command": "C:/dev/obsidian-note-reviewer/apps/hook/dist/plannotator",
            "timeout": 1800
          }
        ]
      }
    ]
  }
}
```

**Nota:** Ajuste o caminho conforme necessário.

### 3. Reiniciar Claude Code

Após adicionar o hook, reinicie o Claude Code para que as alterações tenham efeito.

## Uso

1. No Claude Code, quando estiver planejando uma nota, use `/plan` ou `EnterPlanMode`
2. Quando terminar o plano, use `ExitPlanMode`
3. O Plannotator abrirá automaticamente no navegador
4. Revise a nota, adicione anotações
5. Aprove ou solicite alterações

## API de Save

Para salvar uma nota no vault, faça uma requisição POST para `/api/save`:

```javascript
fetch('/api/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: 'C:/caminho/para/vault/nome-da-nota.md',
    content: '# Título\n\nConteúdo da nota...'
  })
})
```

## Frontmatter YAML

O parser agora detecta e preserva frontmatter YAML no início das notas:

```yaml
---
title: Minha Nota
tags: [obsidian, anotações]
date: 2025-01-01
---

# Conteúdo da nota

Texto aqui...
```

O frontmatter será renderizado em um bloco separado e preservado ao exportar.

## Suporte

Para problemas ou sugestões, abra uma issue no repositório original:
https://github.com/backnotprop/plannotator/issues
