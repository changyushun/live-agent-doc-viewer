# agent-doc-viewer

A lightweight viewer for AI agent work outputs. Multiple agents (developer, reviewer, or any role you define) write markdown documents into `workspace/`, push to GitHub, and results appear instantly — no redeploy needed.

**Live demo:** https://live-agent-doc-viewer-production.up.railway.app

---

## How it works

```
Agent produces files in workspace/
  → git push to GitHub
  → Refresh browser
  → Server fetches live from GitHub API → rendered
```

The server (Hono on Node.js) reads `workspace/projects/` from GitHub API on every request. No build step, no redeploy cycle.

---

## Stack

- [Hono](https://hono.dev) — lightweight Node.js server
- [marked](https://marked.js.org) — markdown → HTML
- Tailwind CSS CDN — no build step
- Railway — hosting
- GitHub API — live file source

---

## Deploy your own

**1. Fork this repo**

**2. Deploy to Railway**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

New Project → Deploy from GitHub repo → select your fork

**3. Set environment variables in Railway**

| Variable | Value |
|---|---|
| `GITHUB_TOKEN` | GitHub personal access token (repo read scope) |
| `GITHUB_REPO` | `your-username/your-repo` |
| `GITHUB_BRANCH` | `main` |

**4. Generate a domain**

Railway → Settings → Networking → Generate Domain

---

## Agent workflow

Open a new Claude Code session in this directory and give it a role:

```bash
cd your-repo
claude "你是 developer agent，為新專案「XXX」產出 spec.md，主題是：..."
claude "你是 reviewer agent，review {slug} 的 spec，產出 round-1 review"
```

Each session reads `CLAUDE.md` for file conventions, does its job, pushes, and exits. Refresh the viewer to see results.

---

## Workspace structure

```
workspace/
└── projects/
    └── {project-slug}/
        ├── meta.json
        ├── spec.md
        ├── reviews/
        │   └── round-{n}-{model}.md
        └── revisions/
            └── v{n}-spec.md
```

See `CLAUDE.md` for full conventions.
