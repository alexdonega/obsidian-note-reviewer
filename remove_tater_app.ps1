$app = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\editor\App.tsx' -Raw

# Remove taterMode state and handler
$app = $app -replace "(?s)  const \[taterMode, setTaterMode\] = useState\(\(\) => \{.*?\}\);", ""
$app = $app -replace "(?s)  const handleTaterModeChange = \(enabled: boolean\) => \{.*?\};", ""

# Remove taterMode from Settings
$app = $app -replace " taterMode=\{taterMode\} onTaterModeChange=\{handleTaterModeChange\}", ""

# Remove taterMode from ModeSwitcher
$app = $app -replace " taterMode=\{taterMode\}", ""

# Remove taterMode from Viewer
$app = $app -replace "                taterMode=\{taterMode\}`r?`n", ""

# Clean up extra blank lines
$app = $app -replace "`r?`n`r?`n`r?`n", "`r`n`r`n"

$app | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\editor\App.tsx' -Encoding utf8 -NoNewline

Write-Host 'Tater removed from App.tsx'
