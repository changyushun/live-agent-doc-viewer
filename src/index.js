import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { marked } from 'marked'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WORKSPACE = path.resolve(__dirname, '../workspace/projects')

const app = new Hono()

// ── helpers ──────────────────────────────────────────────────────────────────

const shell = (title, back, body) => `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — agent-doc-viewer</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  .prose h1{font-size:1.6rem;font-weight:700;margin:1.5rem 0 .75rem;line-height:1.3}
  .prose h2{font-size:1.2rem;font-weight:600;margin:1.5rem 0 .5rem;padding-bottom:.25rem;border-bottom:1px solid #e5e7eb}
  .prose h3{font-size:1rem;font-weight:600;margin:1.2rem 0 .4rem}
  .prose p{margin:.6rem 0;line-height:1.75}
  .prose ul,.prose ol{margin:.6rem 0 .6rem 1.4rem}
  .prose li{margin:.25rem 0;line-height:1.7}
  .prose ul li{list-style-type:disc}
  .prose ol li{list-style-type:decimal}
  .prose table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.9rem}
  .prose th,.prose td{border:1px solid #e5e7eb;padding:.5rem .75rem;text-align:left}
  .prose th{background:#f9fafb;font-weight:600}
  .prose code{background:#f3f4f6;padding:.15em .35em;border-radius:.25rem;font-size:.875em;font-family:ui-monospace,monospace}
  .prose pre{background:#1e293b;color:#e2e8f0;padding:1rem;border-radius:.5rem;overflow-x:auto;margin:.75rem 0;font-size:.85rem;line-height:1.6}
  .prose pre code{background:none;padding:0;color:inherit}
  .prose blockquote{border-left:3px solid #d1d5db;padding-left:1rem;color:#6b7280;margin:.75rem 0;font-style:italic}
  .prose hr{border:none;border-top:1px solid #e5e7eb;margin:1.5rem 0}
  .prose a{color:#2563eb;text-decoration:underline}
  .prose input[type=checkbox]{accent-color:#2563eb;margin-right:.35rem}
</style>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen">
  <div class="max-w-2xl mx-auto px-4 py-6">
    ${back ? `<a href="${back}" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5">← 返回</a>` : ''}
    ${body}
  </div>
</body>
</html>`

const statusBadge = (status) => {
  const map = {
    'in-review': ['審核中', 'bg-yellow-100 text-yellow-800'],
    'revised':   ['已修訂', 'bg-blue-100 text-blue-800'],
    'approved':  ['已通過', 'bg-green-100 text-green-800'],
  }
  const [label, cls] = map[status] ?? [status, 'bg-gray-100 text-gray-700']
  return `<span class="text-xs font-medium px-2 py-0.5 rounded-full ${cls}">${label}</span>`
}

async function safeReadFile(base, rel) {
  const resolved = path.resolve(base, rel)
  if (!resolved.startsWith(base)) return null  // path traversal guard
  try { return await fs.readFile(resolved, 'utf8') } catch { return null }
}

async function listFiles(dir) {
  try { return await fs.readdir(dir) } catch { return [] }
}

// ── routes ───────────────────────────────────────────────────────────────────

// Home: list all projects
app.get('/', async (c) => {
  const dirs = await listFiles(WORKSPACE)
  const projects = []
  for (const d of dirs.sort()) {
    const metaRaw = await safeReadFile(WORKSPACE, `${d}/meta.json`)
    if (!metaRaw) continue
    try { projects.push({ slug: d, ...JSON.parse(metaRaw) }) } catch {}
  }

  const cards = projects.length
    ? projects.map(p => `
        <a href="/project/${p.slug}" class="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-sm transition">
          <div class="flex items-start justify-between gap-2 mb-1">
            <span class="font-semibold text-gray-900">${p.name ?? p.slug}</span>
            ${statusBadge(p.status)}
          </div>
          <div class="text-xs text-gray-400">${p.created ?? ''}</div>
        </a>`).join('')
    : '<p class="text-gray-400 text-sm">workspace/projects/ 下尚無專案。</p>'

  return c.html(shell('Projects', null, `
    <h1 class="text-xl font-bold mb-5">專案列表</h1>
    <div class="flex flex-col gap-3">${cards}</div>
  `))
})

// Project page: list documents
app.get('/project/:name', async (c) => {
  const slug = c.req.param('name')
  const projectDir = path.resolve(WORKSPACE, slug)
  if (!projectDir.startsWith(WORKSPACE)) return c.text('Not found', 404)

  const metaRaw = await safeReadFile(WORKSPACE, `${slug}/meta.json`)
  if (!metaRaw) return c.text('Not found', 404)
  let meta = {}
  try { meta = JSON.parse(metaRaw) } catch {}

  const docLink = (rel, label) =>
    `<a href="/project/${slug}/doc/${rel}" class="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition text-sm text-gray-800">
      <span class="text-gray-400">📄</span>${label}
    </a>`

  const section = (title, files, folder) => {
    if (!files.length) return ''
    return `<div class="mb-5">
      <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">${title}</div>
      <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        ${files.map(f => docLink(folder ? `${folder}/${f}` : f, f)).join('')}
      </div>
    </div>`
  }

  const specExists = (await safeReadFile(WORKSPACE, `${slug}/spec.md`)) !== null
  const reviews = (await listFiles(path.join(projectDir, 'reviews'))).filter(f => f.endsWith('.md')).sort()
  const revisions = (await listFiles(path.join(projectDir, 'revisions'))).filter(f => f.endsWith('.md')).sort()

  return c.html(shell(meta.name ?? slug, '/', `
    <div class="mb-5">
      <h1 class="text-xl font-bold mb-1">${meta.name ?? slug}</h1>
      <div class="flex items-center gap-2 text-xs text-gray-400">
        ${statusBadge(meta.status)}
        <span>${meta.created ?? ''}</span>
        ${meta.models ? `<span>· ${meta.models.join(', ')}</span>` : ''}
      </div>
    </div>
    ${specExists ? section('Spec', ['spec.md'], null) : ''}
    ${section('Reviews', reviews, 'reviews')}
    ${section('Revisions', revisions, 'revisions')}
  `))
})

// Doc page: render markdown
app.get('/project/:name/doc/*', async (c) => {
  const slug = c.req.param('name')
  const rel = c.req.path.replace(`/project/${slug}/doc/`, '')
  const projectDir = path.resolve(WORKSPACE, slug)
  if (!projectDir.startsWith(WORKSPACE)) return c.text('Not found', 404)

  const content = await safeReadFile(projectDir, rel)
  if (content === null) return c.text('Not found', 404)

  const html = marked.parse(content)
  const filename = path.basename(rel)

  return c.html(shell(filename, `/project/${slug}`, `
    <article class="prose bg-white rounded-xl border border-gray-200 px-5 py-6">${html}</article>
  `))
})

// ── start ─────────────────────────────────────────────────────────────────────

serve({ fetch: app.fetch, port: process.env.PORT || 3000 })
