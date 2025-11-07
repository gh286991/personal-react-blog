---
title: "XXX"
date: "2024-04-20"
summary: "Expresㄑsdfdfds、React 18、esbuild。"
category: "測試文章"
tags:
  - 測試
  - Demo
updated: "2024-04-25"
---

為了降低記憶體使用，我挑了幾個原則：

1. **單一常駐行程**：沒有額外的 Node cluster 或繁複的背景服務。
2. **動態載入 Markdown**：只有在請求時才把文章讀進來，並且做最簡單的快取。
3. **esbuild**：快速把前端程式打包成一支小 JS；SSR 端直接用 React 18 的 `renderToString`。

實際上線後，整個系統在 128MB RAM 的 container 依然很穩定。文章變多時只要加上一層檔案快取就能應付。

下一步想試試把圖片也做 lazy loading，減少初次載入的流量。
