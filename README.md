# agent-doc-viewer

**[English](#english) | [中文](#中文)**

---

## English

A lightweight viewer for AI agent work outputs. Multiple agents (developer, reviewer, or any role you define) write markdown documents into `workspace/`, push to GitHub, and results appear instantly — no redeploy needed.

**Live demo:** https://live-agent-doc-viewer-production.up.railway.app/

### How it works

```
Agent produces files in workspace/
  → git push to GitHub
  → Refresh browser
  → Server fetches live from GitHub API → rendered
```

The server reads `workspace/projects/` from GitHub API on every request. No build step, no redeploy cycle.

### Stack

- [Hono](https://hono.dev) — lightweight Node.js server
- [marked](https://marked.js.org) — markdown → HTML
- Tailwind CSS CDN — no build step
- Railway — hosting
- GitHub API — live file source

### Deploy your own

**1. Fork this repo**

**2. Deploy to Railway**

New Project → Deploy from GitHub repo → select your fork

**3. Set environment variables in Railway**

| Variable | Value |
|---|---|
| `GITHUB_TOKEN` | GitHub personal access token (repo read scope) |
| `GITHUB_REPO` | `your-username/your-repo` |
| `GITHUB_BRANCH` | `main` |

**4. Generate a domain**

Railway → Settings → Networking → Generate Domain

### Agent workflow

Open a new Claude Code session in this directory and give it a role:

```bash
cd your-repo
claude "You are a developer agent. Produce a spec.md for a new project called XXX..."
claude "You are a reviewer agent. Review the spec for {slug} and produce a round-1 review."
```

Each session reads `CLAUDE.md` for file conventions, does its job, pushes, and exits. Refresh the viewer to see results. Roles are defined at invocation — not hardcoded — so you can add any agent role you need.

### Workspace structure

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

---

## 中文

一個輕量的 AI agent 工作成果展示平台。多個 agent（developer、reviewer 或任何你定義的角色）將 markdown 文件寫入 `workspace/`，push 到 GitHub 後即時可見，不需要重新部署。

**Live demo：** https://live-agent-doc-viewer-production.up.railway.app/

### 運作方式

```
Agent 產出文件到 workspace/
  → git push 到 GitHub
  → 刷新瀏覽器
  → Server 從 GitHub API 即時拉取 → 渲染顯示
```

Server 每次請求時從 GitHub API 讀取 `workspace/projects/`，不需要 build step，不需要等重新部署。

### 技術架構

- [Hono](https://hono.dev) — 輕量 Node.js server
- [marked](https://marked.js.org) — markdown 轉 HTML
- Tailwind CSS CDN — 不需要 build step
- Railway — hosting
- GitHub API — 即時文件來源

### 自行部署

**1. Fork 這個 repo**

**2. 部署到 Railway**

New Project → Deploy from GitHub repo → 選擇你的 fork

**3. 在 Railway 設定環境變數**

| 變數 | 說明 |
|---|---|
| `GITHUB_TOKEN` | GitHub personal access token（repo read 權限） |
| `GITHUB_REPO` | `your-username/your-repo` |
| `GITHUB_BRANCH` | `main` |

**4. 產生 domain**

Railway → Settings → Networking → Generate Domain

### Agent 工作流程

在這個目錄開新的 Claude Code session，指定角色和任務：

```bash
cd your-repo
claude "你是 developer agent，為新專案「XXX」產出 spec.md，主題是：..."
claude "你是 reviewer agent，review {slug} 的 spec，產出 round-1 review"
```

每個 session 自動讀取 `CLAUDE.md` 的格式規範，完成任務後 push，然後結束。角色由啟動時指定，不寫死，可以隨時增加新角色。

### Workspace 結構

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

完整格式規範見 `CLAUDE.md`。
