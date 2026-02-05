# Glossário

## Termos do Domínio

### Curso
Conjunto completo de conteúdo educacional organizado em módulos e aulas.

### Módulo
Seção de um curso que agrupa aulas relacionadas por tema.

### Aula (Lesson)
Unidade individual de conteúdo dentro de um módulo, pode conter múltiplos recursos.

### Recurso
Arquivo individual para download (vídeo, PDF, arquivo complementar).

### Sessão
Estado de autenticação mantido com a plataforma de cursos (cookies, tokens).

### Metadata
Informações sobre a estrutura do curso (títulos, ordem, URLs).

## Termos Técnicos

### Retry Logic
Mecanismo de tentativa automática em caso de falha, geralmente com backoff exponencial.

### Backoff Exponencial
Estratégia de espera crescente entre tentativas (1s, 2s, 4s, 8s...).

### Parallel Downloads
Download simultâneo de múltiplos arquivos para otimizar velocidade.

### Rate Limiting
Controle de taxa de requisições para evitar bloqueio pela plataforma.

### Scraping
Extração de dados de páginas HTML quando API não está disponível.

### Filesystem Hierarchy
Estrutura de pastas criada para organizar o conteúdo baixado.

## Acrônimos

- **CLI**: Command Line Interface - Interface de linha de comando
- **API**: Application Programming Interface
- **HTTP**: HyperText Transfer Protocol
- **URL**: Uniform Resource Locator
- **I/O**: Input/Output - Entrada/Saída

## Padrões de Nomenclatura

### Arquivos
- Vídeos: `<numero>-<nome-aula>.mp4`
- PDFs: `<nome>-material.pdf`
- Legendas: `<nome-video>.srt`

### Pastas
- Curso: `<nome-curso>/`
- Módulo: `<numero>-<nome-modulo>/`
- Aula: `<numero>-<nome-aula>/`

## Conceitos de Negócio

### Download Completo
Download de todos os recursos de um curso, incluindo vídeos, materiais e anexos.

### Download Seletivo
Permitir ao usuário escolher módulos ou aulas específicas para download.

### Resumable Download
Capacidade de continuar um download interrompido do ponto onde parou.

### Verificação de Integridade
Checagem de hash/checksum para garantir que o arquivo foi baixado corretamente.
