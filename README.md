<p align="center">
  <img src="apps/marketing/public/og-image.webp" alt="Plannotator" width="100%" />
</p>

# Plannotator

Interactive Plan Review: Mark up and refine your plans using a UI, easily share for team collaboration, automatically integrates with Claude Code plan mode.

<!-- TODO: Replace VIDEO_ID with actual YouTube video ID -->
<p align="center">
  <a href="https://www.youtube.com/watch?v=VIDEO_ID">
    <img src="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg" alt="Watch the demo" width="600" />
  </a>
</p>

## Install

**Install the `plannotator` command so Claude Code can use it:**

**macOS / Linux / WSL:**

```bash
curl -fsSL https://plannotator.ai/install.sh | bash
```

**Windows PowerShell:**

```powershell
irm https://plannotator.ai/install.ps1 | iex
```

**Then in Claude Code:**

```
/plugin marketplace add backnotprop/plannotator
/plugin install plannotator@plannotator
```

**Important:** Restart Claude Code after installing the plugin for the hooks to take effect.

See [apps/hook/README.md](apps/hook/README.md) for detailed installation instructions including a `manual hook` approach.

## How It Works

When Claude Code calls `ExitPlanMode`, this hook intercepts and:

1. Opens Plannotator UI in your browser
2. Lets you annotate the plan visually
3. Approve → Claude proceeds with implementation
4. Request changes → Your annotations are sent back to Claude

---

## License

**Copyright (c) 2025 backnotprop.**

This project is licensed under the **Business Source License 1.1 (BSL)**.
