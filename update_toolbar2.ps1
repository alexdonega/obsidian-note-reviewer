$content = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Toolbar.tsx' -Raw
$content = $content -replace '>\s*Save\s*</button>', '>Salvar</button>'
$content | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Toolbar.tsx' -Encoding utf8 -NoNewline
Write-Host 'Toolbar.tsx updated again'
