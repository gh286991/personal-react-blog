# Docker 部署指南

## 快速開始

### 構建 Docker 映像

```bash
docker build -t personal-react-blog .
```

### 運行容器

```bash
docker run -p 3000:3000 personal-react-blog
```

然後訪問 `http://localhost:3000`

## Dockerfile 說明

### 多階段構建

本項目使用多階段構建來優化映像大小：

#### 1. Builder 階段 (oven/bun:1.1.22)
- 安裝所有依賴（包括開發依賴）
- 複製必要的配置文件：
  - `tsconfig*.json` - TypeScript 配置
  - `vite.config.ts` - Vite 構建配置
  - `tailwind.config.js` - Tailwind CSS 配置
  - `postcss.config.js` - PostCSS 配置
- 複製源代碼和資源：
  - `src/` - 所有源代碼（包含新的文件結構）
  - `scripts/` - 構建腳本
  - `posts/` - Markdown 文章
  - `index.html` - HTML 模板
- 運行 `bun run build` 構建應用
- 清理開發依賴，只保留生產依賴

#### 2. Runner 階段 (oven/bun:1.1.22-slim)
- 使用輕量級 slim 映像
- 複製生產依賴和構建產物
- 配置環境變數：
  - `NODE_ENV=production`
  - `CONTENT_BASE=/app/dist`
  - `PORT=3000`
  - `BUN_JSC_forceGCSlowPaths=true` - 降低記憶體使用
  - `BUN_JSC_useJIT=false` - 禁用 JIT，節省記憶體
- 使用 `--smol` 標誌運行，進一步優化記憶體

### 文件結構支持

Dockerfile 已更新以支持新的文件結構：

```
src/
├── server/
│   ├── server.ts          ← Express 服務器
│   └── entry-server.tsx   ← SSR 入口
├── page/                  ← 頁面組件
├── components/            ← 共用元件
├── security/              ← 安全工具
└── ...其他文件
```

構建過程會：
1. 編譯 TypeScript 到 `dist/server/`
2. 構建客戶端資源到 `dist/client/`
3. 構建 SSR 入口到 `dist/server/entry-server.mjs`
4. 複製靜態資源（posts）到 `dist/`

最終運行 `dist/server/server.js`

## 進階配置

### 自定義端口

```bash
docker run -p 8080:3000 -e PORT=3000 personal-react-blog
```

### 自定義環境變數

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  personal-react-blog
```

### 使用 Docker Compose

創建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  blog:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
```

運行：

```bash
docker-compose up -d
```

## 記憶體優化

本 Dockerfile 針對低記憶體環境進行了優化：

1. **使用 Bun slim 映像**：減少基礎映像大小
2. **多階段構建**：最終映像只包含生產依賴
3. **記憶體標誌**：
   - `BUN_JSC_forceGCSlowPaths=true`
   - `BUN_JSC_useJIT=false`
   - `--smol` 運行標誌
4. **清理臨時文件**：構建後刪除緩存

預期記憶體使用：**< 128MB**

## 故障排除

### 構建失敗

如果構建失敗，檢查：

1. **Node.js 版本**：確保 >= 18（Bun 會處理）
2. **依賴問題**：清理 `node_modules` 後重試
3. **磁碟空間**：確保有足夠空間構建

### 運行問題

如果容器啟動失敗：

1. **查看日誌**：
   ```bash
   docker logs <container-id>
   ```

2. **檢查端口**：確保 3000 端口未被占用

3. **進入容器調試**：
   ```bash
   docker run -it personal-react-blog /bin/sh
   ```

### 樣式未加載

如果 Tailwind CSS 樣式未正確加載：

1. 確認 `tailwind.config.js` 已複製到容器
2. 確認 `postcss.config.js` 已複製到容器
3. 檢查構建日誌是否有 CSS 相關錯誤

## 部署到雲平台

### Zeabur

1. 連接 GitHub 倉庫
2. Zeabur 會自動檢測 Dockerfile
3. 自動構建和部署

### Fly.io

```bash
fly launch
fly deploy
```

### Railway

1. 連接 GitHub 倉庫
2. Railway 會自動使用 Dockerfile
3. 配置環境變數和端口

### Render

1. 創建新的 Web Service
2. 選擇 Docker 部署
3. 設置端口為 3000

## 測試 Docker 構建

在本地測試完整流程：

```bash
# 1. 構建映像
docker build -t personal-react-blog .

# 2. 運行容器
docker run -d -p 3000:3000 --name blog personal-react-blog

# 3. 測試訪問
curl http://localhost:3000

# 4. 查看日誌
docker logs blog

# 5. 停止並刪除
docker stop blog
docker rm blog
```

## 映像大小優化

當前優化策略：

1. ✅ 使用 slim 基礎映像
2. ✅ 多階段構建
3. ✅ 只複製必要文件
4. ✅ 清理開發依賴
5. ✅ 使用 .dockerignore

預期最終映像大小：**< 300MB**

## 安全建議

1. **定期更新基礎映像**：
   ```bash
   docker pull oven/bun:1.1.22-slim
   ```

2. **掃描漏洞**：
   ```bash
   docker scan personal-react-blog
   ```

3. **使用非 root 用戶**（可選增強）：
   在 Dockerfile 中添加：
   ```dockerfile
   USER node
   ```

## 持續集成

GitHub Actions 示例：

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t personal-react-blog .
      
      - name: Test Docker image
        run: |
          docker run -d -p 3000:3000 --name test personal-react-blog
          sleep 5
          curl http://localhost:3000
          docker stop test
```

