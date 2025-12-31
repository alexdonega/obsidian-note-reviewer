# Script para corrigir todos os acentos e caracteres especiais em pt-BR

# Lista de arquivos para corrigir
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
        $content = Get-Content $path -Raw -Encoding UTF8

        # Correções de acentos
        $content = $content -replace 'Anotacoes', 'Anotações'
        $content = $content -replace 'anotacoes', 'anotações'
        $content = $content -replace 'anotacao', 'anotação'
        $content = $content -replace 'Alteracoes', 'Alterações'
        $content = $content -replace 'alteracoes', 'alterações'
        $content = $content -replace 'Configuracoes', 'Configurações'
        $content = $content -replace 'configuracoes', 'configurações'
        $content = $content -replace 'comentario', 'comentário'
        $content = $content -replace 'Adicione um comentario', 'Adicione um comentário'

        # Verbos no futuro
        $content = $content -replace 'sera salva', 'será salva'
        $content = $content -replace 'ira revisar', 'irá revisar'

        # Outras palavras comuns
        $content = $content -replace 'Selecione texto para adicionar anotacoes', 'Selecione texto para adicionar anotações'
        $content = $content -replace 'Usada ao compartilhar anotacoes', 'Usada ao compartilhar anotações'
        $content = $content -replace 'Revise a nota e depois aprove ou solicite alteracoes', 'Revise a nota e depois aprove ou solicite alterações'
        $content = $content -replace 'Adicione Anotacoes', 'Adicione Anotações'
        $content = $content -replace 'Para solicitar alteracoes', 'Para solicitar alterações'
        $content = $content -replace 'selecione texto na nota e adicione anotacoes', 'selecione texto na nota e adicione anotações'
        $content = $content -replace 'Claude ira revisar a nota com base nas suas anotacoes', 'Claude irá revisar a nota com base nas suas anotações'
        $content = $content -replace 'Seleção', 'Seleção'

        # Salvar com encoding UTF-8 com BOM para preservar acentos
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($true))
    }
}

Write-Host "`nAcentos corrigidos em todos os arquivos!" -ForegroundColor Green
