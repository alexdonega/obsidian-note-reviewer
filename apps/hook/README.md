# Obsidian Note Reviewer Claude Code Plugin

This directory contains the Claude Code plugin configuration for Obsidian Note Reviewer.

## Prerequisites

Install the `obsreview` command so Claude Code can use it:

**macOS / Linux / WSL:**
```bash
curl -fsSL https://obsreview.ai/install.sh | bash
```

**Windows PowerShell:**
```powershell
irm https://obsreview.ai/install.ps1 | iex
```

**Windows CMD:**
```cmd
curl -fsSL https://obsreview.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

---

[Plugin Installation](#plugin-installation) · [Manual Installation (Hooks)](#manual-installation-hooks)

---

## Plugin Installation

In Claude Code:

```
/plugin marketplace add alexdonega/obsreview
/plugin install obsreview@obsreview
```

**Important:** Restart Claude Code after installing the plugin for the hooks to take effect.

## Manual Installation (Hooks)

If you prefer not to use the plugin system, add this to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "ExitPlanMode",
        "hooks": [
          {
            "type": "command",
            "command": "obsreview",
            "timeout": 1800
          }
        ]
      }
    ]
  }
}
```

## How It Works

When Claude Code calls `ExitPlanMode`, this hook intercepts and:

1. Opens Obsidian Note Reviewer UI in your browser
2. Lets you annotate the plan visually
3. Approve → Claude proceeds with implementation
4. Request changes → Your annotations are sent back to Claude