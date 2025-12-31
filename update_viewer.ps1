$content = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Viewer.tsx' -Raw
$content = $content -replace "title=\{copied \? 'Copied!' : 'Copy plan'\}", "title={copied ? 'Copiado!' : 'Copiar nota'}"
$content = $content -replace '              Copied!', '              Copiado!'
$content = $content -replace '              Copy plan', '              Copiar nota'
$content = $content -replace "title=\{copied \? 'Copied!' : 'Copy code'\}", "title={copied ? 'Copiado!' : 'Copiar código'}"
$content | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Viewer.tsx' -Encoding utf8 -NoNewline
Write-Host 'Viewer.tsx updated'
