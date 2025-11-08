# Zeabur 部署修復摘要

## 問題
```
error: Module not found "dist/server/server.js"
[Zeabur] Pod/service - BackOff: Back-off restarting failed container
```

## 根本原因

`tsconfig.server.json` 配置錯誤，導致編譯輸出路徑不正確：

**錯誤配置**:
```json
{
  "compilerOptions": {
    "outDir": "./dist/server",
    "rootDir": "./src"  // ❌ 會生成 dist/server/server/server.js
  }
}
```

**正確配置**:
```json
{
  "compilerOptions": {
    "outDir": "./dist",  // ✅ 生成 dist/server/server.js
    "sourceMap": false
  }
}
```

## 已修復的文件

### 1. ✅ `tsconfig.server.json`
- 修改 `outDir` 從 `"./dist/server"` 到 `"./dist"`
- 移除 `rootDir` 設置
- 添加 `src/security/**/*.ts` 到 include

### 2. ✅ `Dockerfile`
- 添加構建調試輸出
- 確認包含 `tailwind.config.js` 和 `postcss.config.js`

### 3. ✅ `.node-version`
- 新建文件，指定 Node.js 18

### 4. ✅ `package.json`
- 添加 `engines` 字段，要求 Node.js >= 18

### 5. ✅ `.dockerignore`
- 優化構建速度

### 6. ✅ 文檔
- `ZEABUR_TROUBLESHOOTING.md` - 詳細故障排除指南
- `DOCKER_GUIDE.md` - Docker 部署指南
- `DOCKER_CHECKLIST.md` - 部署檢查清單

## 構建輸出驗證

正確的構建輸出結構：

```
dist/
├── server/
│   └── server.js          ✅ 主服務器文件
├── client/
│   ├── index.html
│   └── assets/
├── posts/
├── content.js
├── types.js
└── security/
    └── contentSanitizers.js
```

## 本地驗證步驟

```bash
# 1. 清理構建
npm run clean

# 2. 執行構建
npm run build

# 3. 檢查文件
ls -la dist/server/server.js
# 應該看到: -rw-r--r-- ... server.js

# 4. 運行服務器
npm start

# 5. 測試訪問
curl http://localhost:3000
# 應該返回 301 或 200
```

## Zeabur 重新部署步驟

### 方法 1: 推送新 Commit（推薦）

```bash
git add .
git commit -m "fix: correct tsconfig.server.json for proper build output"
git push origin main
```

Zeabur 會自動檢測並重新部署。

### 方法 2: 手動觸發重新部署

在 Zeabur 控制台：
1. 進入您的服務
2. 點擊 "Redeploy" 按鈕
3. 選擇 "Rebuild"

## 預期結果

### 構建日誌應該顯示

```
=== Build output ===
total XX
drwxr-xr-x ... client
-rw-r--r-- ... content.js
drwxr-xr-x ... posts
drwxr-xr-x ... security
drwxr-xr-x ... server
-rw-r--r-- ... types.js

=== Server files ===
total XX
-rw-r--r-- ... server.js

=== All JS files ===
dist/types.js
dist/security/contentSanitizers.js
dist/server/server.js
dist/content.js
...
```

### 運行日誌應該顯示

```
✅ React SSR blog running on http://localhost:3000
```

或

```
✅ React SSR blog running on http://0.0.0.0:3000
💾 Low memory mode enabled
```

## 驗證清單

部署成功後驗證：

- [ ] 容器啟動成功（無 BackOff 錯誤）
- [ ] 訪問首頁返回 200/301
- [ ] 樣式正確加載（Tailwind CSS）
- [ ] 文章列表顯示正確
- [ ] 文章詳情頁可訪問
- [ ] 主題切換功能正常
- [ ] 篩選和分頁功能正常

## 效能指標

預期值：
- **啟動時間**: < 15 秒
- **記憶體使用**: < 256 MB
- **響應時間**: < 500 ms
- **構建時間**: 2-5 分鐘

## 如果問題仍然存在

### 1. 檢查 Zeabur 構建日誌

在 "Deployments" 標籤中查看詳細日誌，確認：
- npm/bun 安裝成功
- 構建步驟全部完成
- 沒有 TypeScript 錯誤
- dist/server/server.js 文件存在

### 2. 檢查運行日誌

在 "Logs" 標籤中查看：
- 服務器啟動消息
- 任何錯誤或警告
- 模塊加載情況

### 3. 環境變數

確認以下環境變數設置正確：
```
NODE_ENV=production
PORT=3000  (Zeabur 可能自動設置)
CONTENT_BASE=/app/dist
```

### 4. 進入容器調試

如果 Zeabur 提供 shell 訪問：

```bash
# 檢查文件結構
ls -la /app/dist/server/

# 檢查 Node.js 版本
node --version

# 嘗試手動運行
cd /app
node dist/server/server.js
```

## 回滾計劃

如果新部署失敗：

1. **快速回滾**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **在 Zeabur 控制台**: 選擇上一個成功的部署版本

## 後續優化

部署成功後可以考慮：

- [ ] 移除 Dockerfile 中的調試輸出（生產環境）
- [ ] 設置 CDN 加速靜態資源
- [ ] 配置自定義域名
- [ ] 設置監控和告警
- [ ] 優化構建緩存

## 聯繫方式

需要幫助？查看：
- [ZEABUR_TROUBLESHOOTING.md](./ZEABUR_TROUBLESHOOTING.md) - 詳細故障排除
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Docker 部署指南
- [Zeabur 文檔](https://zeabur.com/docs)

---

**✅ 修復已完成，準備重新部署！**

最後更新: 2024-11-09

