import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()
app.get('/', (c) => c.text('agent-doc-viewer is running'))

serve({ fetch: app.fetch, port: process.env.PORT || 3000 })
