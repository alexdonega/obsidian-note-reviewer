$content = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\DecisionBar.tsx' -Raw
$content = $content -replace "'Request Changes'", "'Solicitar Alteracoes'"
$content = $content -replace "'Approve Plan'", "'Aprovar Nota'"
$content = $content -replace "'Plan Approved'", "'Nota Aprovada'"
$content = $content -replace "'Feedback Sent'", "'Alteracoes Solicitadas'"
$content = $content -replace "'Sending...'", "'Enviando...'"
$content = $content -replace "'Approving...'", "'Aprovando...'"
$content = $content -replace "annotation{annotationCount !== 1 \? 's' : ''} to send as feedback", "{annotationCount !== 1 ? 'anotacoes' : 'anotacao'} para enviar como feedback"
$content = $content -replace "'Review the plan, then approve or request changes'", "'Revise a nota e aprove ou solicite alteracoes'"
$content = $content -replace "'Claude will proceed with the implementation.'", "'A nota sera salva no Obsidian.'"
$content = $content -replace "'Claude will revise the plan based on your annotations.'", "'Claude ira revisar a nota com base nas suas anotacoes.'"
$content = $content -replace 'Claude Code terminal', 'terminal do Claude Code'
$content = $content -replace 'Return to your', 'Retorne ao'
$content = $content -replace 'to continue.', 'para continuar.'
$content | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\DecisionBar.tsx' -Encoding utf8 -NoNewline
Write-Host 'DecisionBar.tsx updated'
