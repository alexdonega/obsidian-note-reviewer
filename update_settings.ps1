$content = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Settings.tsx' -Raw
$content = $content -replace 'title="Settings"', 'title="Configurações"'
$content = $content -replace '<h3 className="font-semibold text-sm">Settings</h3>', '<h3 className="font-semibold text-sm">Configurações</h3>'
$content = $content -replace 'Your Identity', 'Sua Identidade'
$content = $content -replace 'Used when sharing annotations with others', 'Usada ao compartilhar anotações com outros'
$content = $content -replace 'title="Regenerate identity"', 'title="Regenerar identidade"'
$content = $content -replace 'Tater Mode', 'Modo Tater'
$content | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Settings.tsx' -Encoding utf8 -NoNewline
Write-Host 'Settings.tsx updated'
