# Remove Tater sprites from Viewer.tsx
$viewer = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Viewer.tsx' -Raw
$viewer = $viewer -replace "import \{ TaterSpriteSitting \} from './TaterSpriteSitting';`r?`n", ""
$viewer = $viewer -replace "  taterMode: boolean;`r?`n", ""
$viewer = $viewer -replace "  mode,`r?`n  taterMode`r?`n", "  mode`r`n"
$viewer = $viewer -replace "\{taterMode && <TaterSpriteSitting />\}", ""
$viewer | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Viewer.tsx' -Encoding utf8 -NoNewline

# Remove Tater sprites from Settings.tsx
$settings = Get-Content 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Settings.tsx' -Raw
$settings = $settings -replace "import \{ TaterSpritePullup \} from './TaterSpritePullup';`r?`n", ""
$settings = $settings -replace "  taterMode: boolean;`r?`n", ""
$settings = $settings -replace "  onTaterModeChange: \(enabled: boolean\) => void;`r?`n", ""
$settings = $settings -replace "\{taterMode && <TaterSpritePullup />\}", ""
$settings = $settings -replace "export const Settings: React\.FC<SettingsProps> = \(\{ taterMode, onTaterModeChange, onIdentityChange \}\)", "export const Settings: React.FC<SettingsProps> = ({ onIdentityChange })"
# Remove Tater Mode toggle section
$settings = $settings -replace "(?s)<div className=`"border-t border-border`" />.*?<!-- Tater Mode -->.*?<div className=`"flex items-center justify-between`">.*?<div className=`"text-sm font-medium`">Modo Tater</div>.*?</div>.*?</div>", ""
$settings = $settings -replace "(?s)\s*<div className=`"border-t border-border`" />\s*\r?\n\s*\{/\* Tater Mode \*/\}\s*\r?\n\s*<div className=`"flex items-center justify-between`">.*?</div>\s*\r?\n\s*</div>", ""
$settings | Out-File -FilePath 'C:\Users\Alex\Dev\obsidian-note-reviewer\packages\ui\components\Settings.tsx' -Encoding utf8 -NoNewline

Write-Host 'Tater sprites removed from components'
