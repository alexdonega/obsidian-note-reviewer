$content = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\AnnotationSidebar.tsx' -Raw
$content = $content -replace 'Review Changes', 'Revisar Alterações'
$content = $content -replace 'No annotations yet.', 'Nenhuma anotação ainda.'
$content = $content -replace 'Select text in the document to add comments or suggest changes.', 'Selecione texto no documento para adicionar comentários ou sugerir alterações.'
$content = $content -replace 'title="Remove Annotation"', 'title="Remover Anotação"'
$content | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\AnnotationSidebar.tsx' -Encoding utf8 -NoNewline
Write-Host 'AnnotationSidebar.tsx updated'
