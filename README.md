# tomslab.dev｜日編驛 (The Build Station)

日編驛是一個極簡、低記憶體消耗的 React SSR 部落格，用於記錄日常開發筆記與程式碼編譯過程。文章以 Markdown 編寫並在伺服器端渲染 (SSR)。

## 為什麼這個架構很省資源？

- **單一 Express 進程**：沒有多餘的 proxy 或 runtime，最適合 128 MB 等小型環境。
- **Markdown 檔案直讀**：文章存在 `posts/*.md`，請求時動態轉成 HTML，並附上一層檔案快取避免重複 IO。
- **esbuild**：前端只有一支極小的 hydration bundle（<10KB gzip），不需要重量級打包器。
- **零資料庫**：內容直接隨程式碼部署，省下額外的 service。

## 快速開始

### 本地開發

```bash
npm install
npm run dev
```

開啟 `http://localhost:3000`，伺服器會自動監聽文件變化並重新載入。

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
npm run build
npm start
```

1. `npm run build`：
   - 清除 `dist/`
   - 編譯伺服器 (`tsc`)
   - 使用 `esbuild` 打包前端到 `dist/public/client.js`
   - 複製 `public/`（排除開發用 bundle）與 `posts/` 到 `dist/`
2. `npm start`：以 `CONTENT_BASE=dist` 啟動伺服器，確保靜態資源與 Markdown 都從編譯結果讀取。

若要自訂部署路徑，只要設定：

```bash
CONTENT_BASE=/path/to/content PORT=8080 node dist/server.js
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

## 目錄結構

```
personal-react-blog/
├─ posts/                   # Markdown 文章
├─ src/
│  ├─ server/              # 服務器相關
│  │  ├─ server.ts         # Express SSR 伺服器
│  │  └─ entry-server.tsx  # SSR 入口
│  ├─ page/                # 頁面組件
│  │  ├─ Layout.tsx        # 主佈局
│  │  ├─ PostList.tsx      # 文章列表
│  │  └─ PostPage.tsx      # 文章詳情
│  ├─ components/          # 共用元件
│  │  └─ ThemeToggle.tsx   # 主題切換
│  ├─ security/            # 安全工具
│  ├─ App.tsx              # 共用 App 進入點
│  ├─ entry-client.tsx     # 客戶端入口
│  ├─ content.ts           # Markdown 載入 + 快取
│  └─ styles.scss          # 全局樣式（Tailwind + SCSS）
├─ scripts/                # build 輔助腳本
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
- 建立 RSS / Sitemap
- 加入圖片 lazy loading 或 CDN
- 添加搜索功能
