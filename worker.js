addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname
  const method = request.method

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (path === '/api/health' && method === 'GET') {
      return jsonResponse({ status: 'ok', time: new Date().toISOString() }, corsHeaders)
    }

    if (path.startsWith('/api/greet/') && method === 'GET') {
      const name = decodeURIComponent(path.replace('/api/greet/', ''))
      return jsonResponse({ message: 'Hello, ' + name + '!' }, corsHeaders)
    }

    if (path === '/api/echo' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      return jsonResponse({ echo: body, method: 'POST', time: new Date().toISOString() }, corsHeaders)
    }

    if (path === '/api/ip' && method === 'GET') {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
      const country = request.headers.get('CF-IPCountry') || 'unknown'
      return jsonResponse({ ip: ip, country: country }, corsHeaders)
    }

    if (path === '/api/products' && method === 'GET') {
      const products = [
        { id: 1, name: '亲肤摇粒绒面料', price: 28.50, sku: 'Fleece-001', stock: 500 },
        { id: 2, name: '加厚摇粒绒面料', price: 35.00, sku: 'Fleece-002', stock: 320 },
        { id: 3, name: '抗菌摇粒绒面料', price: 42.00, sku: 'Fleece-003', stock: 180 },
      ]
      return jsonResponse({ products: products, total: products.length }, corsHeaders)
    }

    if (!path.startsWith('/api/')) {
      return new Response(HTML_PAGE, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    return jsonResponse({ error: 'Not Found', path: path }, corsHeaders, 404)

  } catch (err) {
    return jsonResponse({ error: err.message }, corsHeaders, 500)
  }
}

function jsonResponse(data, extraHeaders, status) {
  if (status === undefined) status = 200
  if (extraHeaders === undefined) extraHeaders = {}
  return new Response(JSON.stringify(data, null, 2), {
    status: status,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, extraHeaders)
  })
}

const HTML_PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare Worker Demo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, sans-serif; background: #f0f4f8; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
    h1 { font-size: 2rem; color: #4F46E5; margin-bottom: 8px; }
    .card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .btn { background: #4F46E5; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; margin: 4px; }
    .btn:hover { background: #4338CA; }
    .btn.secondary { background: #6b7280; }
    input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; }
    pre { background: #f3f4f6; padding: 16px; border-radius: 8px; font-size: 0.85rem; white-space: pre-wrap; }
    .status-ok { color: #059669; font-weight: 600; }
    .status-err { color: #dc2626; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Cloudflare Worker Demo</h1>
    <p style="color:#6b7280;margin-bottom:32px">API 路由 + SPA | 全自动部署</p>
    <div class="card">
      <h2>API 测试</h2>
      <button class="btn" onclick="testAPI('/api/health','GET')">GET /api/health</button>
      <button class="btn" onclick="testAPI('/api/greet/World','GET')">GET /api/greet/World</button>
      <button class="btn" onclick="testAPI('/api/ip','GET')">GET /api/ip</button>
      <button class="btn" onclick="testAPI('/api/products','GET')">GET /api/products</button>
      <button class="btn secondary" onclick="testAPI('/api/echo','POST')">POST /api/echo</button>
      <br><br>
      <input id="customPath" placeholder="输入路径，如 /api/greet/小恒" onkeydown="if(event.key==='Enter')testCustom()">
      <button class="btn secondary" onclick="testCustom()">发送</button>
    </div>
    <div class="card">
      <h2>响应结果</h2>
      <pre id="result">点击按钮测试 API...</pre>
    </div>
  </div>
  <script>
    async function testAPI(path, method) {
      var el = document.getElementById('result')
      el.textContent = '请求中...'
      el.className = ''
      try {
        var opts = method==='POST' ? {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({test:true})} : {}
        var r = await fetch(path, opts)
        var data = await r.json()
        el.textContent = JSON.stringify(data, null, 2)
        el.className = r.ok ? 'status-ok' : 'status-err'
      } catch(e) { el.textContent = 'Error: '+e.message; el.className = 'status-err' }
    }
    function testCustom() {
      var p = document.getElementById('customPath').value.trim()
      if(p) testAPI(p, 'GET')
    }
  <\/script>
</body>
</html>`;
