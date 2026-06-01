# Cloudflare Worker 演示应用

一个完整的Cloudflare Worker应用，包含API路由和静态页面，使用Hono框架和Vite构建工具。

## 功能特性

✅ **API路由** - 使用Hono框架构建RESTful API  
✅ **静态页面托管** - 通过Cloudflare Static Assets提供服务  
✅ **SPA支持** - 单页应用回退配置  
✅ **CORS支持** - 跨域请求处理  
✅ **TypeScript** - 类型安全开发体验  
✅ **Vite集成** - 现代化开发体验  
✅ **热重载** - 本地开发实时预览  

## 项目结构

```
cloudflare-worker-demo/
├── src/
│   └── index.ts          # Hono应用主文件（API路由）
├── public/
│   └── index.html        # 静态页面（SPA入口）
├── wrangler.jsonc        # Cloudflare Worker配置
├── vite.config.ts        # Vite配置（Cloudflare插件）
├── tsconfig.json         # TypeScript配置
├── package.json          # 项目依赖
└── README.md            # 项目说明
```

## 快速开始

### 1. 安装依赖

```bash
cd D:/WorkBuddyX/cloudflare-worker-demo
npm install
```

### 2. 本地开发

```bash
npm run dev
```

应用将在 `http://localhost:8787` 启动

### 3. 部署到Cloudflare

```bash
npm run deploy
```

## API端点

### 健康检查
```
GET /api/health
```

响应示例：
```json
{
  "status": "ok",
  "environment": "development",
  "timestamp": "2026-06-01T07:41:12.345Z"
}
```

### 问候API
```
GET /api/greet/:name
```

示例：`GET /api/greet/张三`

响应示例：
```json
{
  "message": "Hello, 张三!",
  "environment": "development"
}
```

### Echo API
```
POST /api/echo
Content-Type: application/json

{
  "key": "value"
}
```

响应示例：
```json
{
  "received": {"key": "value"},
  "environment": "development",
  "timestamp": "2026-06-01T07:41:12.345Z"
}
```

## 静态页面功能

首页 (`/`) 提供交互式演示界面，包含：

1. **健康检查** - 测试API连接状态
2. **问候测试** - 调用动态问候API
3. **Echo测试** - 测试POST请求处理

## 关键配置说明

### wrangler.jsonc

- `assets.directory`: 静态资源目录 (`./public/`)
- `assets.binding`: 资源绑定名称 (`ASSETS`)
- `assets.not_found_handling`: SPA回退模式
- `assets.run_worker_first`: 优先Worker处理的路径 (`/api/*`)

### 路由优先级

1. `/api/*` 路径 → Worker处理（API路由）
2. 其他路径 → 静态资源回退 → SPA index.html

### 导出语法

```typescript
// ✅ 正确 - 使用这种语法
export default app

// ❌ 错误 - 会导致 "Cannot read properties of undefined"
export default { fetch: app.fetch }
```

## 技术栈

- **运行时**: Cloudflare Workers
- **框架**: Hono (轻量级Web框架)
- **构建工具**: Vite + @cloudflare/vite-plugin
- **语言**: TypeScript
- **静态资源**: Cloudflare Static Assets

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动本地开发服务器 |
| `npm run deploy` | 部署到Cloudflare |
| `npm run build` | 构建项目（Vite） |

## 故障排查

### 问题：API路由返回HTML而不是JSON

**原因**: 缺少 `run_worker_first` 配置

**解决**: 确保在 `wrangler.jsonc` 中包含：
```jsonc
"assets": {
  "run_worker_first": ["/api/*"]
}
```

### 问题：部署时出现权限错误

**解决**: 
1. 运行 `npx wrangler login` 登录Cloudflare
2. 检查Cloudflare账户权限

## 扩展建议

可以进一步添加：

- **D1数据库** - 添加 `wrangler.jsonc` 中的 `d1_databases` 配置
- **R2存储** - 添加 `r2_buckets` 配置处理文件存储
- **KV存储** - 添加 `kv_namespaces` 配置用于缓存
- **身份验证** - 集成Clerk或better-auth
- **CI/CD** - 配置GitHub Actions自动部署

## 参考资源

- Hono文档: https://hono.dev/
- Cloudflare Workers文档: https://developers.cloudflare.com/workers/
- Static Assets文档: https://developers.cloudflare.com/workers/static-assets/
- Vite插件文档: https://developers.cloudflare.com/workers/vite-plugin/

## 许可证

MIT
