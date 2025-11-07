# 個人 React SSR 部落格

一個極簡、低記憶體消耗的 React 18 + Express 伺服器，文章以 Markdown 編寫並在伺服器端渲染 (SSR)。

## 為什麼這個架構很省資源？

- **單一 Express 進程**：沒有多餘的 proxy 或 runtime，最適合 128 MB 等小型環境。
- **Markdown 檔案直讀**：文章存在 `posts/*.md`，請求時動態轉成 HTML，並附上一層檔案快取避免重複 IO。
- **esbuild**：前端只有一支極小的 hydration bundle（<10KB gzip），不需要重量級打包器。
- **零資料庫**：內容直接隨程式碼部署，省下額外的 service。

## 快速開始

```bash
npm install
npm run dev
```

- 開啟 `http://localhost:3000`，左側是 SSR 完成的頁面，`esbuild` 會 watch 產出 `public/client.js` 供 hydration 使用。

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
├─ posts/              # Markdown 文章
├─ public/             # 靜態資產（CSS, icons...）
├─ src/
│  ├─ components/      # React UI
│  ├─ App.tsx          # 共用 App 進入點
│  ├─ client.tsx       # 前端 hydration
│  ├─ content.ts       # Markdown 載入 + 快取
│  └─ server.ts        # Express SSR 伺服器
└─ scripts/            # build 輔助腳本
```

## 記憶體最佳化建議

- 伺服器預設不會把所有文章常駐在記憶體，而是根據檔案 `mtime` 做最小限度的快取。
- 若部署在容器中，可把 `PORT` 設定為 0.0.0.0 並透過 systemd / Docker 設定 64–128 MB 限制皆可正常執行。
- `marked` 只負責基本 Markdown 轉換；若內容完全可信，可以維持這個設定獲得最小 bundle。

## 待延伸想法

- 接上 `remark-prism` 等語法上色（支援時再行引入，避免預設加重 bundle）。
- 建立 RSS / Sitemap。
- 加入圖片 lazy loading 或 CDN。
