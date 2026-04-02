# agent-doc-viewer — 工作規範

## 專案用途

這是一個 AI agent 工作成果展示平台。多個 agent（developer、reviewer）在 `workspace/` 目錄下產出文件，這個 viewer 負責動態讀取並渲染，讓使用者從手機瀏覽器查看成果。

## 架構

```
GitHub repo (source of truth)
  ↕ GitHub API
Railway (Hono server, 長駐)
  ↕ HTTP
使用者瀏覽器
```

Server 每次請求時從 GitHub API 即時拉取 `workspace/` 內容，**不讀本機檔案系統**。agent push 到 GitHub 後刷新頁面即可看到，不需要 redeploy。

## 環境變數

| 變數 | 用途 |
|---|---|
| `GITHUB_TOKEN` | GitHub personal access token（repo read 權限） |
| `GITHUB_REPO` | `owner/repo`，預設 `changyushun/agent-doc-viewer` |
| `GITHUB_BRANCH` | 讀取的分支，預設 `main` |
| `PORT` | server port，Railway 自動注入 |

## 修改 server

- 路由邏輯在 `src/index.js`，唯一的 server 檔案
- 讀檔用 `ghFile(path)`，列目錄用 `ghDir(path)`，路徑相對 repo root
- 新增路由後本機測試需設 `GITHUB_TOKEN`；Railway 上已有環境變數

## Commit 規範

```
feat: 新功能
fix:  修 bug
docs: 只改文件（workspace/ 內容）
```

agent 產出文件時用 `docs:` prefix。

---

## Agent 作業規範

### 角色定義

**Developer Agent**
- 負責產出 `spec.md`：需求分析、設計決策、驗收標準
- 每個決策要說明理由，不只寫「做什麼」，要寫「為什麼這樣做」

**Reviewer Agent**
- 負責產出 `reviews/round-{n}-{model}.md`：審查 spec 或 revision
- 必須有明確結論：`Approved` / `Revise & Proceed` / `Reject`
- 優點與問題分開列，問題標明是否擋 proceed

### workspace 目錄結構

```
workspace/
└── projects/
    └── {project-slug}/         ← kebab-case
        ├── meta.json            ← 必填
        ├── spec.md              ← developer 產出
        ├── reviews/
        │   └── round-{n}-{model}.md   ← reviewer 產出
        └── revisions/
            └── v{n}-spec.md     ← developer 修訂後產出
```

### meta.json schema

```json
{
  "name": "人類可讀的專案名稱",
  "status": "in-review | revised | approved",
  "created": "YYYY-MM-DD",
  "models": ["opus", "sonnet"],
  "currentRound": 1
}
```

`status` 規則：
- 剛建立、等待 review → `in-review`
- reviewer 要求修改、developer 已修訂 → `revised`
- reviewer 通過 → `approved`

### spec.md 必要區塊

1. **背景與目標** — 為什麼要做，預期達到什麼
2. **現況問題** — 用數據或具體描述，不用模糊形容詞
3. **設計決策** — 每個主要決策附理由
4. **驗收標準** — checkbox 格式，可量化

### review 必要區塊

1. **優點** — 具體說明哪裡做對了
2. **問題** — 每個問題標明嚴重程度（擋 proceed / 不擋）
3. **結論** — 三選一：`Approved` / `Revise & Proceed` / `Reject`

### 產出後的動作

```bash
git add workspace/projects/{slug}/
git commit -m "docs({slug}): {動作描述}"
git push origin main
```

範例：
```bash
git commit -m "docs(checkout-redesign): add spec v1"
git commit -m "docs(checkout-redesign): add round-1 review by opus"
```
