// ========================================
// Cloudflare Worker - 完整部署版
// 复制以下全部内容 → 粘贴到 Cloudflare Dashboard → Ctrl+S
// ========================================

import { Hono } from 'hono'

const app = new Hono()

// ========== API 路由 ==========

// 健康检查
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    time: new Date().toISOString(),
    worker: 'cloudflare-worker-demo',
    version: '1.0.0'
  })
})

// 动态问候
app.get('/api/greet/:name', (c) => {
  const name = c.req.param('name')
  return c.json({
    message: `Hello, ${name}!`,
    from: 'Cloudflare Worker',
    timestamp: Date.now()
  })
})

// Echo 接口
app.post('/api/echo', async (c) => {
  let body = {}
  try { body = await c.req.json() } catch(e) {}
  return c.json({
    echo: body,
    method: 'POST',
    headers: Object.fromEntries(c.req.raw.headers),
    timestamp: new Date().toISOString()
  })
})

// 获取客户端 IP 和地理位置
app.get('/api/ip', (c) => {
  const cf = c.req.raw.cf || {}
  return c.json({
    ip: c.req.raw.headers.get('CF-Connecting-IP') || 'unknown',
    country: cf.country || 'unknown',
    city: cf.city || 'unknown',
    colo: cf.colo || 'unknown',
    timezone: cf.timezone || 'unknown'
  })
})

// 产品列表 API（模拟数据）
app.get('/api/products', (c) => {
  return c.json({
    products: [
      { id: 1, name: '摇粒绒面料 A款', price: 28.5, stock: 1500, category: '面料' },
      { id: 2, name: '摇粒绒面料 B款', price: 32.0, stock: 1200, category: '面料' },
      { id: 3, name: '复合摇粒绒', price: 45.0, stock: 800, category: '复合面料' }
    ],
    total: 3,
    page: 1
  })
})

// ========== SPA 静态页面 ==========

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare Worker Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui; background: #f0f4f8; color: #1a202c; min-height: 100vh; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { font-size: 28px; margin-bottom: 8px; color: #1a202c; }
    .subtitle { color: #718096; margin-bottom: 24px; font-size: 14px; }
    .card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .card h3 { font-size: 16px; margin-bottom: 12px; color: #2d3748; }
    .btn { background: #4F46E5; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; margin: 4px; transition: background 0.2s; }
    .btn:hover { background: #4338CA; }
    .btn.secondary { background: #E2E8F0; color: #2d3748; }
    .btn.secondary:hover { background: #CBD5E0; }
    input { padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 14px; margin: 4px; width: 200px; }
    pre { background: #F7FAFC; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; line-height: 1.6; color: #2d3748; border: 1px solid #E2E8F0; white-space: pre-wrap; word-break: break-all; }
    .status { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .status.ok { background: #C6F6D5; color: #22543D; }
    .status.error { background: #FED7D7; color: #742A2A; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
    .metric { text-align: center; padding: 16px; }
    .metric .value { font-size: 32px; font-weight: 700; color: #4F46E5; }
    .metric .label { font-size: 12px; color: #718096; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Cloudflare Worker Demo</h1>
    <p class="subtitle">Hono API 路由 + SPA 静态页面 · 全自动部署版</p>

    <div class="grid">
      <div class="card">
        <h3>📊 服务状态</h3>
        <div class="metric">
          <div class="value" id="statusIcon">…</div>
          <div class="label" id="statusText">检测中...</div>
        </div>
        <button class="btn" onclick="checkHealth()">刷新状态</button>
      </div>

      <div class="card">
        <h3>👋 动态问候</h3>
        <input id="nameInput" placeholder="输入姓名" value="小恒" />
        <button class="btn" onclick="testGreet()">发送问候</button>
        <button class="btn secondary" onclick="testGreetName()">用输入框内容</button>
      </div>
    </div>

    <div class="card">
      <h3>🧪 API 测试面板</h3>
      <button class="btn" onclick="testHealth()">GET /api/health</button>
      <button class="btn" onclick="testGreet()">GET /api/greet/World</button>
      <button class="btn" onclick="testEcho()">POST /api/echo</button>
      <button class="btn" onclick="testIp()">GET /api/ip</button>
      <button class="btn" onclick="testProducts()">GET /api/products</button>
      <pre id="result">点击按钮测试 API...</pre>
    </div>

    <div class="card">
      <h3>📋 部署说明</h3>
      <p style="font-size:13px;color:#4a5568;line-height:1.8;">
        本 Worker 已包含完整功能：<br/>
        ✅ Hono 路由框架（/api/*）<br/>
        ✅ 5个 API 端点（health / greet / echo / ip / products）<br/>
        ✅ SPA 静态页面（本页面）<br/>
        ✅ CORS 支持<br/>
        部署地址：<code style="background:#EDF2F7;padding:2px 6px;border-radius:4px;">https://&lt;your-worker&gt;.&lt;subdomain&gt;.workers.dev</code>
      </p>
    </div>
  </div>

  <script>
    const resultEl = document.getElementById('result')

    function setResult(data) {
      resultEl.textContent = JSON.stringify(data, null, 2)
    }

    async function checkHealth() {
      try {
        const r = await fetch('/api/health')
        const d = await r.json()
        document.getElementById('statusIcon').textContent = '✅'
        document.getElementById('statusText').innerHTML = '<span class="status ok">运行中</span>'
        setResult(d)
      } catch(e) {
        document.getElementById('statusIcon').textContent = '❌'
        document.getElementById('statusText').innerHTML = '<span class="status error">离线</span>'
        setResult({ error: e.message })
      }
    }

    async function testHealth() {
      const r = await fetch('/api/health')
      setResult(await r.json())
    }

    async function testGreet() {
      const r = await fetch('/api/greet/World')
      setResult(await r.json())
    }

    async function testGreetName() {
      const name = document.getElementById('nameInput').value || 'Guest'
      const r = await fetch('/api/greet/' + encodeURIComponent(name))
      setResult(await r.json())
    }

    async function testEcho() {
      const r = await fetch('/api/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg: 'hello from demo', ts: Date.now() })
      })
      setResult(await r.json())
    }

    async function testIp() {
      const r = await fetch('/api/ip')
      setResult(await r.json())
    }

    async function testProducts() {
      const r = await fetch('/api/products')
      setResult(await r.json())
    }

    // 页面加载时自动检查状态
    checkHealth()
  </script>
</body>
</html>`

// SPA 回退：非 API 请求返回 HTML
app.get('*', (c) => {
  const path = new URL(c.req.url).pathname
  if (path.startsWith('/api/')) {
    return c.notFound()
  }
  return c.html(html)
})

export default app
