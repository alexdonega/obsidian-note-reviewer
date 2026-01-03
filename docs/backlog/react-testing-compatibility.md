# Compatibilidade React 19 com Ambiente de Testes

**Prioridade:** Media
**Criado:** 2026-01-03
**Status:** Pendente

## Problema

Os testes de componentes React e alguns hooks React falham devido à incompatibilidade entre:

- **React 19.2.3** (versão do projeto)
- **happy-dom** (espera React ^18.2.0)
- **@testing-library** (alguns plugins esperam React 18)

O componente renderiza como `<div />` vazio porque happy-dom não suporta completamente o React 19.

## Impacto

| Pacote | Passando | Falhando |
|--------|----------|----------|
| packages/ui/hooks | 16 | 11 |
| packages/ui/components | ~3 | ~51 |

**Total:** ~62 testes falhando por incompatibilidade de ambiente

## Soluções Possíveis

### 1. Downgrade para React 18
- **Prós:** Compatibilidade total com happy-dom e testing-library
- **Contras:** Perde features do React 19 (Actions, use(), etc.)
- **Esforço:** Médio (verificar breaking changes)

### 2. Usar jsdom em vez de happy-dom
- **Prós:** Melhor suporte a React 19, mais maduro
- **Contras:** Mais lento, maior consumo de memória
- **Esforço:** Baixo (trocar configuração)

### 3. Aguardar atualizações do happy-dom
- **Prós:** Sem trabalho imediato
- **Contras:** Sem previsão de quando será suportado
- **Esforço:** Nenhum (monitorar releases)

### 4. Marcar testes como skip temporariamente
- **Prós:** CI passa, testes core funcionam
- **Contras:** Cobertura reduzida até resolver
- **Esforço:** Baixo

## Decisão

[ ] Opção escolhida: _______________

## Referências

- [happy-dom GitHub Issues](https://github.com/capricorn86/happy-dom/issues)
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [Testing Library React 19 Support](https://github.com/testing-library/react-testing-library/issues)
