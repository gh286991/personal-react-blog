---
title: "Vlogo: 讓 YouTube 旅遊 Vlog 更具互動性的 Chrome 擴充功能"
date: "2023-10-24"
summary: "介紹 Vlogo 開發歷程：如何使用 React 與 Google Maps API，自動偵測影片中的地標資訊，並在側邊欄即時顯示地圖，解決觀眾需要手動切換視窗查詢地點的痛點。"
tags: ["Chrome Extension", "React", "Google Maps API", "Project"]
category: "Project"
image: "/images/vlogoprmot1.png"
---

## 專案緣起

身為一個旅遊 Vlog 的愛好者，我常遇到一個困擾：當 YouTuber 介紹到某個景點時，我往往需要暫停影片，切換到 Google Maps 搜尋那個地方在哪裡。這個頻繁切換視窗的過程打斷了觀影體驗。

因此，我決定開發 **Vlogo** —— 一個能與 YouTube 播放器連動的 Chrome 擴充功能。

## 核心功能

1.  **即時地圖同步**：當影片播放到特定時間點，擴充功能會自動在地圖上標記當前介紹的地點。
2.  **無縫整合**：地圖直接顯示在影片側邊欄 (Sidebar)，無需離開 YouTube 頁面。
3.  **社群標註**：允許創作者或觀眾貢獻時間軸與地點資訊 (Crowdsourcing)。

## 技術架構

本專案採用以下技術堆疊：

- **Frontend**: React (使用 Vite 建置)
- **Extension Framework**: Manifest V3
- **Maps**: Google Maps JavaScript API
- **State Management**: Zustand / React Context

### 遇到的挑戰：Youtube 的動態導航

YouTube 使用 SPA (Single Page Application) 架構，這意味著當使用者切換影片時，頁面不會重新整理。這對 Chrome Extension 的 Content Script 注入造成了挑戰。

解決方案是監聽 `yt-navigate-finish` 事件，並在網址變更時手動重新掛載 React Root。

```typescript
document.addEventListener("yt-navigate-finish", () => {
  // 重新初始化 Vlogo
  initVlogo();
});
```

## 未來展望

目前的 Vlogo 已經能滿足基本的查詢需求，未來我計畫加入「行程規劃」功能，讓用戶能直接將影片中的景點加入 Google Maps 列表，實現從「觀看」到「出發」的無縫體驗。

[前往 GitHub 查看源碼](https://github.com/tomslab/vlogo) | [Chrome Web Store 下載](https://chromewebstore.google.com/detail/vlogo/gafjhpljbjkfldgjpdaiokeijelojdgi)
