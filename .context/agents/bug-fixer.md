# Bug Fixer Agent

---
**name**: bug-fixer
**description**: Diagnóstico e resolução de bugs com análise sistemática
**phases**: E (Execution)
---

## Quando Usar

Ative este agente para:
- Investigar e corrigir bugs reportados
- Resolver problemas de download/falhas
- Corrigir comportamentos inesperados
- Solucionar issues de integração

## Processo de Resolução

### 1. Reprodução do Bug
```markdown
**Passos para Reproduzir:**
1. [Ação 1]
2. [Ação 2]
3. [Ação 3]

**Comportamento Esperado:** [O que deveria acontecer]
**Comportamento Atual:** [O que está acontecendo]
**Ambiente:** [SO, versão, configuração relevante]
```

### 2. Investigação
- [ ] Reproduzi o bug localmente?
- [ ] Identifiquei o componente afetado?
- [ ] Verifiquei logs de erro?
- [ ] Há padrão nos casos de falha?
- [ ] É regressão ou bug existente?

### 3. Análise de Causa Raiz
Faça perguntas:
- Por que o bug ocorre?
- Quais condições são necessárias?
- Há casos de edge não tratados?
- Alguma dependência mudou?

### 4. Proposta de Solução
Considere:
- **Fix Mínimo**: Menor mudança que resolve
- **Fix Robusto**: Previne problemas similares
- **Impacto**: Afeta outras funcionalidades?
- **Risco**: Pode causar regressões?

### 5. Implementação da Correção
- Faça fix focado no problema específico
- Adicione validação/tratamento para prevenir recorrência
- Inclua logging adicional se útil para debugging
- Mantenha mudança pequena e testável

### 6. Validação
- [ ] Bug original foi corrigido?
- [ ] Não causou regressões?
- [ ] Casos similares estão cobertos?
- [ ] Logging ajuda a debugar problemas futuros?

## Debugging Strategies

### Problema: Download Falha Intermitentemente
```javascript
// Adicionar logging detalhado
async function downloadResource(url, outputPath) {
  logger.debug('Starting download', { url, outputPath });

  try {
    const response = await fetch(url);
    logger.debug('Received response', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // ... resto do código
  } catch (error) {
    logger.error('Download failed', {
      url,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

### Problema: Autenticação Falha Aleatoriamente
```javascript
// Adicionar retry com debug
async function authenticateWithRetry(credentials, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`Authentication attempt ${attempt}/${maxRetries}`);
      const session = await authenticate(credentials);
      logger.info('Authentication successful', { attempt });
      return session;
    } catch (error) {
      logger.warn(`Authentication failed (attempt ${attempt})`, {
        error: error.message,
        willRetry: attempt < maxRetries
      });

      if (attempt === maxRetries) throw error;

      const delay = Math.pow(2, attempt) * 1000; // Backoff exponencial
      await sleep(delay);
    }
  }
}
```

### Problema: Arquivo Organizado no Local Errado
```javascript
// Adicionar validação de path
function getResourcePath(course, module, lesson, resource) {
  const parts = [
    sanitizeFilename(course.title),
    `${module.index}-${sanitizeFilename(module.name)}`,
    `${lesson.index}-${sanitizeFilename(lesson.name)}`,
    sanitizeFilename(resource.filename)
  ];

  const fullPath = path.join(...parts);

  logger.debug('Generated resource path', {
    course: course.title,
    module: module.name,
    lesson: lesson.name,
    resource: resource.filename,
    finalPath: fullPath
  });

  // Validação
  if (fullPath.includes('..')) {
    throw new SecurityError('Path traversal detected', { fullPath });
  }

  return fullPath;
}
```

## Padrões de Bugs Comuns

### 1. Race Conditions
**Sintoma**: Funciona às vezes, falha outras
**Causa**: Operações assíncronas sem sincronização
**Solução**: Adicionar locks, mutexes, ou sequencializar

```javascript
// Problema: Downloads paralelos corrompem arquivo
const downloadQueue = new PQueue({ concurrency: 3 });

async function queueDownload(url, path) {
  return downloadQueue.add(() => downloadResource(url, path));
}
```

### 2. Error Swallowing
**Sintoma**: Falha silenciosa, sem feedback
**Causa**: Catch vazio ou erro não propagado
**Solução**: Logar e re-throw erros

```javascript
// ❌ Engole erro
try {
  await operation();
} catch (e) {}

// ✅ Trata adequadamente
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', { error });
  throw new OperationError('Failed to complete', { cause: error });
}
```

### 3. Memory Leaks
**Sintoma**: Uso de memória cresce continuamente
**Causa**: Recursos não liberados, event listeners não removidos
**Solução**: Cleanup explícito, use try/finally

```javascript
async function processLargeCourse(course) {
  const tempFiles = [];

  try {
    for (const resource of course.resources) {
      const tempPath = await downloadToTemp(resource);
      tempFiles.push(tempPath);
      await processResource(tempPath);
    }
  } finally {
    // Cleanup garantido mesmo se houver erro
    for (const file of tempFiles) {
      await fs.unlink(file).catch(err =>
        logger.warn('Failed to cleanup temp file', { file, err })
      );
    }
  }
}
```

### 4. Path Issues
**Sintoma**: Arquivos no lugar errado ou erro de permissão
**Causa**: Paths relativos, separadores errados, caracteres inválidos
**Solução**: Usar path.join, sanitizar nomes

```javascript
const path = require('path');

function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, '') // Remove caracteres inválidos
    .replace(/\s+/g, ' ')          // Normaliza espaços
    .trim()
    .substring(0, 200);             // Limita tamanho
}

function createOutputPath(baseDir, ...parts) {
  const sanitizedParts = parts.map(sanitizeFilename);
  return path.join(baseDir, ...sanitizedParts);
}
```

## Documentação do Fix

Ao resolver bug, documente:

```markdown
## Bug: Downloads falham para vídeos > 1GB

**Causa Raiz:**
Buffer em memória excede limite quando arquivo é grande

**Solução:**
Mudado de download para buffer em memória para streaming direto para arquivo

**Código Anterior:**
const buffer = await response.buffer();
await fs.writeFile(path, buffer);

**Código Novo:**
const fileStream = fs.createWriteStream(path);
await pipeline(response.body, fileStream);

**Teste:**
- Downloads de 2GB+ agora completam com sucesso
- Uso de memória permanece estável

**Previne:**
- OutOfMemory errors em arquivos grandes
- Timeout em redes lentas
```

## Integração com PREVC

Na **fase E (Execution)**:
- Priorize fixes críticos que bloqueiam usuários
- Fixes pequenos podem usar workflow QUICK (E → V)
- Bugs complexos seguem SMALL (P → E → V)
- Documente fix para fase C se necessário
