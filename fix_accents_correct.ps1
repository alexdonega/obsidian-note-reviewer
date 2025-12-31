# Script para corrigir acentos com encoding correto

$files = @(
    'packages\ui\components\AnnotationPanel.tsx',
    'packages\ui\components\AnnotationSidebar.tsx',
    'packages\ui\components\DecisionBar.tsx',
    'packages\ui\components\Settings.tsx',
    'packages\ui\components\Toolbar.tsx',
    'packages\ui\components\Viewer.tsx',
    'packages\ui\components\ModeSwitcher.tsx',
    'packages\editor\App.tsx'
)

foreach ($file in $files) {
    $path = "C:\Users\Alex\Dev\obsidian-note-reviewer\$file"

    if (Test-Path $path) {
        Write-Host "Corrigindo: $file"

        # Ler o arquivo como bytes para não ter problemas de encoding
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $content = [System.Text.Encoding]::UTF8.GetString($bytes)

        # Corrigir os caracteres com encoding errado primeiro
        $content = $content -replace 'AnotaÃ§Ãµes', 'Anotações'
        $content = $content -replace 'anotaÃ§Ãµes', 'anotações'
        $content = $content -replace 'anotaÃ§Ã£o', 'anotação'
        $content = $content -replace 'AlteraÃ§Ãµes', 'Alterações'
        $content = $content -replace 'alteraÃ§Ãµes', 'alterações'
        $content = $content -replace 'ConfiguraÃ§Ãµes', 'Configurações'
        $content = $content -replace 'configuraÃ§Ãµes', 'configurações'
        $content = $content -replace 'comentÃ¡rio', 'comentário'
        $content = $content -replace 'serÃ¡', 'será'
        $content = $content -replace 'irÃ¡', 'irá'
        $content = $content -replace 'SeleÃ§Ã£o', 'Seleção'

        # Agora corrigir versões sem acento também (caso existam)
        $content = $content -replace 'Anotacoes', 'Anotações'
        $content = $content -replace 'anotacoes', 'anotações'
        $content = $content -replace 'anotacao\b', 'anotação'
        $content = $content -replace 'Alteracoes', 'Alterações'
        $content = $content -replace 'alteracoes', 'alterações'
        $content = $content -replace 'Configuracoes', 'Configurações'
        $content = $content -replace 'configuracoes', 'configurações'
        $content = $content -replace 'comentario\b', 'comentário'
        $content = $content -replace 'sera\s', 'será '
        $content = $content -replace 'ira\s', 'irá '
        $content = $content -replace 'Selecao', 'Seleção'

        # Salvar com UTF-8 sem BOM
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
    }
}

Write-Host "`nAcentos corrigidos com encoding correto!" -ForegroundColor Green
