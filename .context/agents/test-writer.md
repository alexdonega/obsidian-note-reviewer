# Test Writer Agent

---
**name**: test-writer
**description**: Criação de testes unitários e de integração
**phases**: E (Execution), V (Validation)
---

## Quando Usar

Ative este agente para:
- Escrever testes para nova funcionalidade
- Adicionar cobertura a código existente
- Criar testes de regressão para bugs corrigidos
- Implementar testes de integração

## Estratégia de Testes

### Pirâmide de Testes
```
        /\
       /  \  E2E (poucos)
      /____\
     /      \
    / Integ  \ (alguns)
   /__________\
  /            \
 /   Unit Tests \ (muitos)
/____ ____________\
```

**Foco**: Máxima cobertura com testes unitários, testes de integração seletivos, E2E mínimos.

## Testes Unitários

### Estrutura de Teste
```javascript
describe('ModuleName', () => {
  describe('functionName', () => {
    it('should handle happy path correctly', async () => {
      // Arrange
      const input = 'test-input';
      const expected = 'expected-output';

      // Act
      const result = await functionName(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should throw error for invalid input', async () => {
      // Arrange
      const invalidInput = null;

      // Act & Assert
      await expect(functionName(invalidInput))
        .rejects.toThrow(ValidationError);
    });
  });
});
```

### O Que Testar

#### Download de Recursos
```javascript
describe('downloadResource', () => {
  it('should download file successfully', async () => {
    const url = 'https://example.com/video.mp4';
    const outputPath = '/tmp/video.mp4';

    const result = await downloadResource(url, outputPath);

    expect(result.success).toBe(true);
    expect(fs.existsSync(outputPath)).toBe(true);
  });

  it('should retry on network failure', async () => {
    // Mock fetch para falhar 2x depois suceder
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockResolvedValueOnce({ ok: true, buffer: () => Buffer.from('data') });

    global.fetch = mockFetch;

    await downloadResource('https://example.com/file', '/tmp/file');

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should fail after max retries', async () => {
    const mockFetch = jest.fn()
      .mockRejectedValue(new Error('Network error'));

    global.fetch = mockFetch;

    await expect(downloadResource('https://example.com/file', '/tmp/file'))
      .rejects.toThrow('Download failed');

    expect(mockFetch).toHaveBeenCalledTimes(3); // max retries
  });
});
```

#### Organização de Arquivos
```javascript
describe('organizeFiles', () => {
  it('should create correct folder structure', () => {
    const course = {
      title: 'Test Course',
      modules: [{
        index: 1,
        name: 'Module 1',
        lessons: [{
          index: 1,
          name: 'Lesson 1'
        }]
      }]
    };

    const structure = generateFolderStructure(course);

    expect(structure).toEqual([
      'Test Course',
      'Test Course/1-Module 1',
      'Test Course/1-Module 1/1-Lesson 1'
    ]);
  });

  it('should sanitize invalid characters in filenames', () => {
    const unsafeName = 'File: With <Invalid> Characters?';
    const safeName = sanitizeFilename(unsafeName);

    expect(safeName).toBe('File With Invalid Characters');
    expect(safeName).not.toMatch(/[<>:"/\\|?*]/);
  });
});
```

#### Autenticação
```javascript
describe('authenticate', () => {
  it('should return valid session on success', async () => {
    const credentials = { username: 'user', password: 'pass' };
    const mockSession = { token: 'abc123', expiresAt: Date.now() + 3600000 };

    mockAuthAPI.login.mockResolvedValue(mockSession);

    const session = await authenticate(credentials);

    expect(session.token).toBe('abc123');
    expect(session.isValid()).toBe(true);
  });

  it('should throw AuthError on invalid credentials', async () => {
    const credentials = { username: 'user', password: 'wrong' };

    mockAuthAPI.login.mockRejectedValue(new Error('401 Unauthorized'));

    await expect(authenticate(credentials))
      .rejects.toThrow(AuthError);
  });
});
```

## Testes de Integração

### Teste de Fluxo Completo
```javascript
describe('Course Download Integration', () => {
  let testCourse;
  let outputDir;

  beforeEach(() => {
    outputDir = '/tmp/test-' + Date.now();
    fs.mkdirSync(outputDir);
  });

  afterEach(() => {
    fs.rmSync(outputDir, { recursive: true });
  });

  it('should download complete course', async () => {
    const courseUrl = 'https://example.com/course/123';

    // Usa API real ou mock server
    const result = await downloadCourse(courseUrl, {
      outputDir,
      credentials: testCredentials
    });

    expect(result.success).toBe(true);
    expect(result.filesDownloaded).toBeGreaterThan(0);

    // Verifica estrutura criada
    const courseFolder = path.join(outputDir, 'Test Course');
    expect(fs.existsSync(courseFolder)).toBe(true);

    // Verifica arquivos baixados
    const videos = glob.sync(path.join(courseFolder, '**/*.mp4'));
    expect(videos.length).toBeGreaterThan(0);
  }, 30000); // timeout maior para integração
});
```

## Mocking e Test Doubles

### Mock de APIs Externas
```javascript
// __mocks__/api-client.js
class MockApiClient {
  async getCourse(id) {
    return {
      id,
      title: 'Mock Course',
      modules: [/* ... */]
    };
  }

  async getVideoUrl(videoId) {
    return `https://mock-cdn.com/video/${videoId}.mp4`;
  }
}

module.exports = MockApiClient;
```

### Mock de Filesystem
```javascript
jest.mock('fs/promises');

describe('saveToFile', () => {
  it('should write data to file', async () => {
    const data = Buffer.from('test data');
    const filePath = '/test/file.txt';

    await saveToFile(data, filePath);

    expect(fs.writeFile).toHaveBeenCalledWith(filePath, data);
  });
});
```

### Spy em Funções
```javascript
it('should log download progress', async () => {
  const loggerSpy = jest.spyOn(logger, 'info');

  await downloadResource('https://example.com/file', '/tmp/file');

  expect(loggerSpy).toHaveBeenCalledWith(
    expect.stringContaining('Downloaded:')
  );

  loggerSpy.mockRestore();
});
```

## Testes de Edge Cases

```javascript
describe('Edge Cases', () => {
  it('should handle empty course', async () => {
    const emptyCourse = { title: 'Empty', modules: [] };

    const result = await downloadCourse(emptyCourse, { outputDir: '/tmp' });

    expect(result.filesDownloaded).toBe(0);
    expect(result.success).toBe(true);
  });

  it('should handle very long filenames', () => {
    const longName = 'a'.repeat(300);
    const sanitized = sanitizeFilename(longName);

    expect(sanitized.length).toBeLessThanOrEqual(255);
  });

  it('should handle unicode in filenames', () => {
    const unicodeName = 'Aula sobre programação em 日本語';
    const sanitized = sanitizeFilename(unicodeName);

    expect(sanitized).toBeTruthy();
    expect(() => fs.mkdirSync(`/tmp/${sanitized}`)).not.toThrow();
  });

  it('should handle disk full error', async () => {
    fs.writeFile.mockRejectedValue(new Error('ENOSPC: no space left'));

    await expect(downloadResource('https://example.com/file', '/tmp/file'))
      .rejects.toThrow(/no space/i);
  });
});
```

## Cobertura de Testes

### Metas
- **Funções Críticas**: 100% (download, auth, organização)
- **Funções de Negócio**: 80%+
- **Utilities**: 70%+
- **Overall**: 75%+

### Verificar Cobertura
```bash
npm test -- --coverage
```

### Focar Em
- ✅ Lógica de negócio
- ✅ Tratamento de erros
- ✅ Edge cases
- ✅ Validações

### Não Priorizar
- ⚠️ Getters/setters simples
- ⚠️ Código de terceiros
- ⚠️ Configuração e bootstrap

## Checklist de Teste

Antes de considerar funcionalidade completa:
- [ ] Testes para happy path
- [ ] Testes para casos de erro
- [ ] Testes para edge cases
- [ ] Mocks de dependências externas
- [ ] Testes não são flaky (passam consistentemente)
- [ ] Testes rodam rápido (< 5s para unitários)
- [ ] Coverage adequado para código crítico

## Integração com PREVC

Na **fase E (Execution)**:
- Escrever testes junto com implementação (TDD opcional)

Na **fase V (Validation)**:
- Executar toda suite de testes
- Verificar cobertura
- Garantir que testes passam antes de aprovação
