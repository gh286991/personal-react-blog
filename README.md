# tomslab.dev｜湯編驛 (Tom's lab)

湯編驛是一個極簡、低記憶體消耗的 React SSR 部落格，用於記錄日常開發筆記與程式碼編譯過程。文章以 Markdown 編寫並在伺服器端渲染 (SSR)。

## 為什麼這個架構很省資源？

- **單一 Express 進程**：沒有多餘的 proxy 或 runtime，最適合 128 MB 等小型環境。
- **Markdown 檔案直讀**：文章存在 `posts/*.md`，請求時動態轉成 HTML，並附上一層檔案快取避免重複 IO。
- **esbuild**：前端只有一支極小的 hydration bundle（<10KB gzip），不需要重量級打包器。
- **零資料庫**：內容直接隨程式碼部署，省下額外的 service。

## 快速開始

### 本地開發

```bash
pnpm install
pnpm dev
```

開啟 `http://localhost:3000`，伺服器會自動監聽文件變化並重新載入。

> 💡 這個 repo 使用 pnpm workspace 將 `frontend/`（React 用戶端）與 `server/`（Express SSR）拆分為獨立套件，必要時可以透過 `pnpm --filter frontend …` 或 `pnpm --filter server …` 單獨執行。

### 使用 Docker

```bash
# 快速啟動
docker-compose up -d

# 或手動構建和運行
docker build -t personal-react-blog .
docker run -p 3000:3000 personal-react-blog
```

**測試 Docker 構建**：
```bash
./scripts/test-docker.sh
```

詳細說明請參閱 [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

## 發佈流程

```bash
pnpm run build
pnpm start
```

1. `pnpm run build`：
   - 清除 `dist/`
   - 使用 Vite 構建客戶端 (`dist/client`)
   - 使用 Vite 構建 SSR 入口 (`dist/server/entry-server.mjs`)
   - 編譯伺服器程式（`tsc` → `dist/server/server.js`）
   - 複製 `posts/` 與 `public/` 到 `dist/`
2. `pnpm start`：以 `CONTENT_BASE=dist` 啟動伺服器，確保靜態資源與 Markdown 都從編譯結果讀取。

若要自訂部署路徑，只要設定：

```bash
CONTENT_BASE=/path/to/content PORT=8080 node dist/server/server.js
```

## 新增 / 編輯文章

1. 在 `posts/` 底下建立 `my-post.md`
2. 內容格式：

```md
---
title: "文章標題"
date: "2024-04-20"
summary: "列表頁要顯示的摘要"
---

正文使用 Markdown 撰寫，支援 `code block`、粗體、連結等語法。
```

3. 儲存後重新整理頁面即可看到（開發模式有快取，會自動讀取最新檔案時間）。

## RSS / Sitemap / Robots

- RSS：`/feed.xml`
- Sitemap：`/sitemap.xml`
- Robots：`/robots.txt`

Sitemap 會自動列出首頁、靜態頁面（如 `/about`, `/works`）與所有 Markdown 文章，所以只要新增 `.md` 就會出現在搜尋引擎索引；`robots.txt` 也自動指向 sitemap。

## 目錄結構

```
personal-react-blog/
├─ frontend/               # React 應用（包含 SSR / CSR 入口）
│  ├─ App.tsx
│  ├─ entry-client.tsx
│  ├─ entry-server.tsx
│  └─ components/, page/, styles.*
├─ server/                 # Express SSR 伺服器 (pnpm 套件)
│  ├─ server.ts
│  ├─ app.ts
│  └─ controllers/, services/
├─ shared/                 # 共用型別與 URL helpers
├─ posts/                  # Markdown 文章
├─ scripts/                # build / runtime 輔助腳本
├─ public/                 # 靜態資源
├─ pnpm-workspace.yaml     # 定義 frontend/server 套件
├─ Dockerfile              # Docker 構建配置
└─ docker-compose.yml      # Docker Compose 配置
```

詳細結構說明請參閱 [FILE_STRUCTURE.md](./FILE_STRUCTURE.md)

## 記憶體最佳化建議

- 伺服器預設不會把所有文章常駐在記憶體，而是根據檔案 `mtime` 做最小限度的快取。
- 若部署在容器中，可把 `PORT` 設定為 0.0.0.0 並透過 systemd / Docker 設定 64–128 MB 限制皆可正常執行。
- `marked` 只負責基本 Markdown 轉換；若內容完全可信，可以維持這個設定獲得最小 bundle。

## 技術棧

- **前端**: React 19 + Tailwind CSS + SCSS
- **後端**: Express + Node.js/Bun
- **構建**: Vite + TypeScript
- **樣式**: Tailwind CSS + SCSS (支持亮色/暗色主題)
- **部署**: Docker + Docker Compose

## 部署

### 支持的平台

- ✅ Zeabur
- ✅ Fly.io
- ✅ Railway
- ✅ Render
- ✅ 任何支持 Docker 的平台

詳細部署指南請參閱 [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

## 文檔

- [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) - 文件結構說明
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Docker 部署指南

## 待延伸想法

- 接上 `remark-prism` 等語法上色
- 加入圖片 lazy loading 或 CDN
- 添加搜索功能
