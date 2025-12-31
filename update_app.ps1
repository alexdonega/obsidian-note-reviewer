$content = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\editor\App.tsx' -Raw

# Remove Tater imports
$content = $content -replace "import \{ TaterSpriteRunning \} from '@plannotator/ui/components/TaterSpriteRunning';\r?\n", ""
$content = $content -replace "import \{ TaterSpritePullup \} from '@plannotator/ui/components/TaterSpritePullup';\r?\n", ""

# Remove Tater sprite running usage
$content = $content -replace "\s*\{/\* Tater sprites \*/\}\r?\n\s*\{taterMode && <TaterSpriteRunning />\}\r?\n", ""

# Remove taterSprite prop from ExportModal
$content = $content -replace '\s*taterSprite=\{taterMode \? <TaterSpritePullup /> : undefined\}\r?\n', "`n"

# Translate texts in App.tsx
$content = $content -replace 'title="Provide Feedback"', 'title="Solicitar Alteracoes"'
$content = $content -replace "'Sending...'", "'Enviando...'"
$content = $content -replace "'Provide Feedback'", "'Solicitar Alteracoes'"
$content = $content -replace "'Approving...'", "'Aprovando...'"
$content = $content -replace "'Approve'", "'Aprovar'"
$content = $content -replace 'title="Export"', 'title="Exportar"'
$content = $content -replace '>Export</span>', '>Exportar</span>'
$content = $content -replace "'Plan Approved'", "'Nota Aprovada'"
$content = $content -replace "'Feedback Sent'", "'Alteracoes Solicitadas'"
$content = $content -replace "'Claude will proceed with the implementation.'", "'A nota sera salva no Obsidian.'"
$content = $content -replace "'Claude will revise the plan based on your annotations.'", "'Claude ira revisar a nota com base nas suas anotacoes.'"
$content = $content -replace 'Claude Code terminal', 'terminal do Claude Code'
$content = $content -replace '>Add Annotations First<', '>Adicione Anotacoes<'
$content = $content -replace 'To provide feedback, select text in the plan and add annotations. Claude will use your annotations to revise the plan.', 'Para solicitar alteracoes, selecione texto na nota e adicione anotacoes.'
$content = $content -replace '>Got it<', '>Entendi<'
$content = $content -replace 'Return to your', 'Retorne ao'
$content = $content -replace 'to continue\.', 'para continuar.'

$content | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\editor\App.tsx' -Encoding utf8 -NoNewline
Write-Host 'App.tsx updated'
