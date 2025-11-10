---
title: "湯編驛建置日誌：從零到部署的三天"
date: ""
summary: "記錄從專案啟動到完成部署的過程：RSS 訂閱、記憶體優化、Docker 建構，以及各種小細節的調整。"
category: "架構筆記"
tags:
  - SSR
  - React
  - 記憶體優化
  - Docker
updated: ""
---

這幾天把整個部落格從無到有搭建起來，過程中遇到不少有趣的問題。記錄一下主要做了什麼。

## 專案初始化與品牌設定

一開始建立了基於 React 19 + Express 的 SSR 架構，選擇輕量級的技術堆疊：
- **前端**：React 19、Tailwind CSS、Vite
- **後端**：Express、Markdown（gray-matter + marked）
- **部署**：Docker + Bun runtime

確定了品牌識別：**湯編驛 (Tom's lab)**，並設計了一個以齒輪與箭頭為主題的 favicon，象徵編譯與建構的過程。

## RSS 訂閱功能

發現 RSS 訂閱按鈕壞掉了，於是實作了完整的 RSS feed：
- 新增 `/feed.xml` 路由
- 實作符合 RSS 2.0 標準的 XML 生成
- 使用 RFC 822 日期格式
- 自動更新 `lastBuildDate` 讓閱讀器能偵測更新

## 記憶體優化挑戰

最大的挑戰是記憶體優化。初始部署時記憶體使用達到 70MB，目標是降到 50MB 以下。

### 優化策略

1. **大幅降低快取**
   - HTML 快取：2 → 0（完全禁用）
   - Summary 快取：50 → 5（只保留最近 5 個）

2. **添加記憶體限制**
   - Bun 啟動參數：`--smol --max-old-space-size=48`
   - Node heap 限制為 48MB
   - 啟用 `--expose-gc` 讓垃圾回收能正常運作

3. **優化 GC 頻率**
   - 低記憶體模式下每 10 秒執行一次（原本 20 秒）
   - 每次請求後清理快取

4. **降低並發數**
   - 文章載入並發從 5 降到 3（一般模式）
   - 低記憶體模式下設為 1

5. **啟用 LOW_MEMORY_MODE**
   - 在 Docker 和 package.json 中設定環境變數
   - 確保應用層級的記憶體優化生效

### 預期效果
記憶體從 70MB 降到 40-50MB 範圍，節省約 25-30MB。對於低流量部落格，效能影響（每次多 5-10ms）完全可接受。

## Docker 建構問題

遇到幾個 Docker 相關的問題：

1. **Lockfile 版本問題**
   - 舊的 `package-lock.json` 是 v1（Bun 不支援）
   - 舊的 `bun.lockb` 與新版 Bun 不兼容
   - 解決方案：移除舊 lockfiles，重新生成 `bun.lock`

2. **COPY 指令語法錯誤**
   - 原本用 `COPY frontend server shared scripts posts public ./` 會導致目錄結構錯誤
   - 改為分別複製每個目錄到正確位置

## 文章組織系統

實作了子目錄支援，讓文章可以用資料夾組織：
- 支援遞迴掃描 `posts/` 下的所有子目錄
- 子目錄名稱自動成為文章分類（如果 frontmatter 沒指定）
- URL 保持扁平化（`/posts/article-name`）
- 例如：`posts/blog/article.md` → category 自動設為 "blog"

這樣可以用資料夾來管理不同類型的文章，而不需要每篇都手動設定分類。

## 技術細節

### 為什麼選擇這個架構？

1. **單一常駐進程**：沒有多餘的 proxy 或 runtime，最適合小型環境
2. **動態載入 Markdown**：請求時才讀取，配合檔案快取避免重複 IO
3. **Bun runtime**：比 Node.js 更快、記憶體佔用更低
4. **零資料庫**：內容直接部署，省下額外服務

### 實際部署數據

最終配置：
- 基礎映像：`oven/bun:1.1.22-slim`
- 記憶體限制：48MB heap
- 啟動參數：`bun --smol --expose-gc --max-old-space-size=48`
- 環境變數：`LOW_MEMORY_MODE=true`

## 下一步

- 監控實際生產環境的記憶體使用
- 考慮添加圖片 lazy loading
- 實作文章搜尋功能
- 優化首次載入速度

整個過程從專案初始化到完成部署花了三天，主要時間都在記憶體優化和 Docker 建構問題上。現在系統已經可以穩定運行在 50MB 以下的記憶體環境中。
