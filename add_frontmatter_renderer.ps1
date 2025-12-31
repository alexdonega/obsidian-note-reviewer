$viewer = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Viewer.tsx' -Raw

# Find the BlockRenderer switch statement and add frontmatter case
$frontmatterCase = @'
    case 'frontmatter':
      return (
        <div
          className="mb-6 p-4 bg-muted/30 border border-border/30 rounded-lg"
          data-block-id={block.id}
        >
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
            Frontmatter YAML
          </div>
          <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
            {block.content}
          </pre>
        </div>
      );

'@

# Insert before the 'case heading' line
$viewer = $viewer -replace "(\s+case 'heading':)", "$frontmatterCase`$1"

$viewer | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Viewer.tsx' -Encoding utf8 -NoNewline
Write-Host 'Frontmatter renderer added to Viewer.tsx'
