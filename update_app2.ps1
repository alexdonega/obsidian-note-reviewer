$content = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\editor\App.tsx' -Raw
$content = $content -replace '                  Got it', '                  Entendi'
$content | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\editor\App.tsx' -Encoding utf8 -NoNewline
Write-Host 'App.tsx updated again'
