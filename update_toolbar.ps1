$content = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Toolbar.tsx' -Raw
$content = $content -replace 'label="Delete"', 'label="Excluir"'
$content = $content -replace 'label="Comment"', 'label="Comentar"'
$content = $content -replace 'label="Cancel"', 'label="Cancelar"'
$content = $content -replace 'placeholder="Add a comment..."', 'placeholder="Adicione um comentario..."'
$content = $content -replace '>Save<', '>Salvar<'
$content = $content -replace 'w-44', 'w-80'
$content | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Toolbar.tsx' -Encoding utf8 -NoNewline
Write-Host 'Toolbar.tsx updated'
