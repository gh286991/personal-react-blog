# Zeabur 部署故障排除

## 當前問題：Module not found "dist/server/server.js"

### 根本原因

這個錯誤表示構建過程中沒有正確生成 `dist/server/server.js` 文件。

### 已修復的問題

✅ **已修復 tsconfig.server.json 配置**

之前的配置：
```json
{
  "compilerOptions": {
    "outDir": "./dist/server",
    "rootDir": "./src"  // ❌ 錯誤！會創建 dist/server/server/server.js
  }
}
```

新的配置：
```json
{
  "compilerOptions": {
    "outDir": "./dist",  // ✅ 正確！會創建 dist/server/server.js
    "sourceMap": false
  },
  "include": ["src/server/server.ts", "src/content.ts", "src/types.ts", "src/security/**/*.ts"]
}
```

### 文件結構

構建後應該有以下文件：

```
dist/
├── server/
│   ├── server.js          ← 主服務器文件
│   └── entry-server.mjs   ← SSR 入口（由 Vite 生成）
├── client/
│   ├── index.html
│   └── assets/
│       ├── index-*.js
│       └── index-*.css
├── posts/                 ← Markdown 文章
├── content.js             ← 內容加載模塊
├── types.js               ← 類型定義
└── security/
    └── contentSanitizers.js
```

### Zeabur 部署步驟

#### 1. 推送代碼到 GitHub

```bash
git add .
git commit -m "Fix tsconfig for Zeabur deployment"
git push origin main
```

#### 2. 在 Zeabur 控制台查看構建日誌

查找以下關鍵信息：

```
=== Build output ===
# 應該看到 dist/ 目錄結構

=== Server files ===
# 應該看到 server.js

=== All JS files ===
# 應該看到所有編譯後的 JS 文件
```

#### 3. 驗證 Node.js 版本

Zeabur 應該自動檢測並使用 Node.js >= 18。如果需要，可以在項目根目錄創建 `.node-version` 文件：

```bash
echo "18" > .node-version
```

或者在 `package.json` 中指定：

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 調試命令

如果部署失敗，在 Zeabur 控制台的終端中運行：

```bash
# 檢查文件是否存在
ls -la /app/dist/server/

# 檢查完整目錄結構
find /app/dist -type f | head -30

# 測試 Node.js 版本
node --version

# 嘗試手動運行
cd /app
node dist/server/server.js
```

### 常見問題

#### 問題 1: "Module not found" 錯誤

**原因**: 
- TypeScript 編譯配置不正確
- 依賴的模塊路徑錯誤

**解決方案**:
1. 檢查 `tsconfig.server.json` 配置
2. 確認 `include` 包含所有必要文件
3. 驗證相對路徑（`../content`, `../types` 等）

#### 問題 2: 樣式未加載

**原因**: 
- Tailwind CSS 配置文件未包含在 Docker 構建中

**解決方案**:
已在 Dockerfile 中添加：
```dockerfile
COPY tailwind.config.js postcss.config.js ./
```

#### 問題 3: 構建超時

**原因**: 
- 依賴安裝太慢
- 構建過程太長

**解決方案**:
- 使用 Bun 進行更快的安裝和構建
- 已在 Dockerfile 中配置

#### 問題 4: 記憶體不足

**原因**: 
- 構建過程消耗太多記憶體

**解決方案**:
在 Zeabur 中增加構建資源，或使用記憶體優化標誌：
- 已在 Dockerfile 中設置 `BUN_JSC_forceGCSlowPaths=true`
- 已設置 `BUN_JSC_useJIT=false`

### 環境變數檢查

在 Zeabur 設置以下環境變數：

```
NODE_ENV=production
PORT=3000
CONTENT_BASE=/app/dist
```

### 健康檢查

Zeabur 會自動檢測服務健康狀態，應該在 `/` 路徑返回 200 或 301 狀態碼。

### 成功部署的標誌

✅ 構建日誌顯示所有文件正確生成
✅ 容器啟動無錯誤
✅ HTTP 請求返回 200/301
✅ 樣式正確加載
✅ 文章列表和詳情頁正常顯示

### 本地驗證

在推送到 Zeabur 前，先本地測試：

```bash
# 1. 清理並構建
npm run build

# 2. 驗證文件存在
ls -la dist/server/server.js

# 3. 本地運行
npm start

# 4. 測試訪問
curl http://localhost:3000
```

### Docker 本地測試

```bash
# 構建映像
docker build -t personal-react-blog .

# 運行容器
docker run -p 3000:3000 personal-react-blog

# 查看日誌
docker logs <container-id>

# 進入容器調試
docker exec -it <container-id> sh
ls -la /app/dist/server/
```

### 聯繫支持

如果問題持續存在：

1. **檢查 Zeabur 狀態頁面**: 確認服務正常
2. **查看詳細日誌**: 在 Zeabur 控制台查看完整構建和運行日誌
3. **提交支持請求**: 包含構建日誌和錯誤信息

### 回滾策略

如果新部署失敗，可以：

1. 在 Zeabur 控制台回滾到上一個工作版本
2. 或者 revert Git commit 並重新部署

### 監控

部署成功後，監控以下指標：

- **響應時間**: < 500ms
- **記憶體使用**: < 256MB
- **錯誤率**: < 1%
- **啟動時間**: < 10 秒

---

## 更新日誌

- **2024-11-09**: 修復 tsconfig.server.json 配置
- **2024-11-09**: 添加 Dockerfile 調試輸出
- **2024-11-09**: 更新文檔和故障排除指南

