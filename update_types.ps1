$types = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\types.ts' -Raw
$types = $types -replace "type: 'paragraph' \| 'heading' \| 'blockquote' \| 'list-item' \| 'code' \| 'hr' \| 'table';", "type: 'frontmatter' | 'paragraph' | 'heading' | 'blockquote' | 'list-item' | 'code' | 'hr' | 'table';"
$types | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\types.ts' -Encoding utf8 -NoNewline
Write-Host 'types.ts updated with frontmatter type'
