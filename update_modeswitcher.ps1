$content = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\ModeSwitcher.tsx' -Raw

# Remove TaterSpritePullup import
$content = $content -replace "import \{ TaterSpritePullup \} from './TaterSpritePullup';`r?`n", ""

# Remove taterMode prop
$content = $content -replace "  taterMode\?: boolean;`r?`n", ""
$content = $content -replace "\{ mode, onChange, taterMode \}", "{ mode, onChange }"

# Remove taterMode usage
$content = $content -replace "\{taterMode && <TaterSpritePullup />\}", ""

# Translate
$content = $content -replace 'label="Selection"', 'label="Seleção"'
$content = $content -replace 'label="Redline"', 'label="Redline"'
$content = $content -replace 'how does this work\?', 'como funciona?'
$content = $content -replace 'How Plannotator Works', 'Como o Plannotator Funciona'

$content | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\ModeSwitcher.tsx' -Encoding utf8 -NoNewline
Write-Host 'ModeSwitcher.tsx updated'
