$content = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\AnnotationPanel.tsx' -Raw
$content = $content -replace '>Annotations<', '>Anotacoes<'
$content = $content -replace 'Select text to add annotations', 'Selecione texto para adicionar anotacoes'
$content = $content -replace '>Quick Share<', '>Compartilhar<'
$content = $content -replace '>Copied<', '>Copiado<'
$content = $content -replace "label: 'Delete'", "label: 'Excluir'"
$content = $content -replace "label: 'Insert'", "label: 'Inserir'"
$content = $content -replace "label: 'Replace'", "label: 'Substituir'"
$content = $content -replace "label: 'Comment'", "label: 'Comentario'"
$content = $content -replace " \(me\)'", " (eu)'"
$content | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\AnnotationPanel.tsx' -Encoding utf8 -NoNewline
Write-Host 'AnnotationPanel.tsx updated'
