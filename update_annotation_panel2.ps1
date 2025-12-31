$content = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\AnnotationPanel.tsx' -Raw
$content = $content -replace '            Annotations', '            Anotacoes'
$content = $content -replace '                Copied', '                Copiado'
$content = $content -replace '                Quick Share', '                Compartilhar'
$content | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\AnnotationPanel.tsx' -Encoding utf8 -NoNewline
Write-Host 'AnnotationPanel.tsx updated again'
