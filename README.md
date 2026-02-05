<p align="center">
  <img src="apps/marketing/public/og-image.webp" alt="obsidian-note-reviewer" width="80%" />
</p>

# obsidian-note-reviewer

Interactive Plan Review for AI Coding Agents. Mark up and refine your plans using a visual UI, share for team collaboration, and seamlessly integrate with **Claude Code**.

<p align="center">
<a href="https://www.youtube.com/watch?v=bCkCWnmAD-o">
<img src="apps/marketing/public/youtube.png" alt="Claude Code Demo" width="60%" />
</a>
<br />
<a href="https://www.youtube.com/watch?v=bCkCWnmAD-o">Watch Demo</a>
</p>

---

## Install for Claude Code

**Install the `obsidian-note-reviewer` command:**

**macOS / Linux / WSL:**

```bash
curl -fsSL https://obsidian-note-reviewer.ai/install.sh | bash
```

**Windows PowerShell:**

```powershell
irm https://obsidian-note-reviewer.ai/install.ps1 | iex
```

**Then in Claude Code:**

```
/plugin marketplace add backnotprop/obsidian-note-reviewer
/plugin install obsidian-note-reviewer@obsidian-note-reviewer

# IMPORTANT: Restart Claude Code after plugin install
```

See [apps/hook/README.md](apps/hook/README.md) for detailed installation instructions including a `manual hook` approach.

---

## How It Works

When your AI agent finishes planning, obsidian-note-reviewer:

1. Opens the obsidian-note-reviewer UI in your browser
2. Lets you annotate the plan visually (delete, insert, replace, comment)
3. **Approve** → Agent proceeds with implementation
4. **Request changes** → Your annotations are sent back as structured feedback

---

## License

**Copyright (c) 2025 backnotprop.**

This project is licensed under the **Business Source License 1.1 (BSL)**.
