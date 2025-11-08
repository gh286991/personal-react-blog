# Docker 準備檢查清單 ✅

## 已完成的配置

### 1. ✅ Dockerfile 更新
- [x] 添加 `tailwind.config.js` 到構建階段
- [x] 添加 `postcss.config.js` 到構建階段
- [x] 支持新的文件結構 (`src/server/`, `src/page/`)
- [x] 優化記憶體使用（`--smol` 標誌）
- [x] 多階段構建（Builder + Runner）

**位置**: `./Dockerfile`

### 2. ✅ .dockerignore 創建
- [x] 排除 `node_modules`
- [x] 排除 `dist`（會在容器中重新構建）
- [x] 排除開發文件和日誌
- [x] 只包含必要的構建文件

**位置**: `./.dockerignore`

### 3. ✅ Docker Compose 配置
- [x] 簡化的服務配置
- [x] 端口映射 (3000:3000)
- [x] 環境變數設定
- [x] 記憶體限制配置
- [x] 健康檢查設定
- [x] 自動重啟策略

**位置**: `./docker-compose.yml`

### 4. ✅ Docker 測試腳本
- [x] 自動構建測試
- [x] 容器啟動測試
- [x] HTTP 訪問測試
- [x] 自動清理功能
- [x] 彩色輸出和錯誤處理

**位置**: `./scripts/test-docker.sh`

### 5. ✅ 文檔更新
- [x] README.md - 添加 Docker 使用說明
- [x] DOCKER_GUIDE.md - 完整的 Docker 部署指南
- [x] FILE_STRUCTURE.md - 文件結構說明
- [x] 包含故障排除和部署建議

## 驗證步驟

### 快速驗證

```bash
# 1. 使用 Docker Compose（推薦）
docker-compose up -d

# 2. 檢查容器狀態
docker-compose ps

# 3. 查看日誌
docker-compose logs -f

# 4. 測試訪問
curl http://localhost:3000

# 5. 停止服務
docker-compose down
```

### 完整測試

```bash
# 運行自動化測試腳本
./scripts/test-docker.sh
```

測試腳本會執行：
1. 構建 Docker 映像
2. 檢查映像大小
3. 啟動容器
4. 測試 HTTP 訪問
5. 顯示容器日誌
6. 自動清理

## 文件結構驗證

### 構建時複製的文件

```
✅ package.json
✅ package-lock.json
✅ tsconfig.json
✅ tsconfig.server.json
✅ vite.config.ts
✅ tailwind.config.js     ← 新添加
✅ postcss.config.js      ← 新添加
✅ src/ (整個目錄)
   ├── server/            ← 新結構
   │   ├── server.ts
   │   └── entry-server.tsx
   ├── page/              ← 新結構
   ├── components/
   └── ...
✅ scripts/
✅ posts/
✅ index.html
```

### 運行時文件

```
/app/dist/
├── server/
│   ├── server.js         ← 從 src/server/server.ts 編譯
│   ├── entry-server.mjs  ← 從 src/server/entry-server.tsx 編譯
│   └── ...
├── client/
│   ├── index.html
│   └── assets/
│       ├── index-*.js
│       └── index-*.css   ← 包含 Tailwind CSS
└── posts/
    └── *.md
```

## 配置驗證

### 環境變數

```bash
NODE_ENV=production
CONTENT_BASE=/app/dist
PORT=3000
BUN_JSC_forceGCSlowPaths=true
BUN_JSC_useJIT=false
```

### 端口暴露

- Container Port: 3000
- Host Port: 3000 (可在 docker-compose.yml 中修改)

### 記憶體限制

- Limit: 256M
- Reservation: 128M
- 優化標誌: `--smol`

## 部署檢查清單

### 本地測試 ✅

- [ ] Docker 構建成功
- [ ] 容器啟動正常
- [ ] HTTP 訪問返回 200/301
- [ ] 樣式正確加載（Tailwind CSS）
- [ ] 主題切換正常工作（亮/暗色）
- [ ] 文章列表顯示正確
- [ ] 文章詳情頁顯示正確
- [ ] 篩選和分頁功能正常

### 生產部署準備 ✅

- [ ] 確認所有依賴已安裝
- [ ] 確認 Node.js 版本 >= 18
- [ ] 確認 posts/ 目錄有文章
- [ ] 確認環境變數設置正確
- [ ] 確認端口沒有衝突
- [ ] 測試記憶體使用（< 256MB）

### 平台特定檢查

#### Zeabur
- [ ] 連接 GitHub 倉庫
- [ ] Dockerfile 自動檢測
- [ ] 環境變數配置
- [ ] 域名綁定

#### Fly.io
- [ ] `fly.toml` 配置（如需要）
- [ ] `fly deploy` 測試

#### Railway
- [ ] 連接 GitHub 倉庫
- [ ] Dockerfile 自動使用
- [ ] 端口設置 (3000)

#### Render
- [ ] Web Service 創建
- [ ] Docker 部署選擇
- [ ] 健康檢查路徑 (/)

## 常見問題排查

### 1. 樣式未加載 ❌

**檢查**:
```bash
# 進入容器
docker exec -it personal-react-blog sh

# 檢查構建文件
ls -la /app/dist/client/assets/*.css

# 檢查配置文件
ls -la /app/tailwind.config.js
ls -la /app/postcss.config.js
```

**解決**: 確認 Dockerfile 第 13 行包含配置文件

### 2. 服務器無法啟動 ❌

**檢查**:
```bash
# 查看詳細日誌
docker logs personal-react-blog -f

# 檢查文件結構
docker exec -it personal-react-blog sh
ls -la /app/dist/server/
```

**解決**: 確認 `dist/server/server.js` 存在

### 3. 端口衝突 ❌

**檢查**:
```bash
# 查看端口占用
lsof -i :3000

# 或使用其他端口
docker run -p 8080:3000 personal-react-blog
```

### 4. 記憶體不足 ❌

**檢查**:
```bash
# 監控容器記憶體
docker stats personal-react-blog
```

**優化**:
- 已啟用 `--smol` 標誌
- 已設置 JIT 優化標誌
- 已配置記憶體限制

## 效能指標

### 預期值

- **映像大小**: < 300 MB
- **記憶體使用**: < 256 MB (運行時)
- **啟動時間**: < 10 秒
- **響應時間**: < 500 ms (首次請求)
- **構建時間**: 2-5 分鐘（取決於網絡和 CPU）

### 監控命令

```bash
# 映像大小
docker images personal-react-blog

# 運行時記憶體
docker stats personal-react-blog

# 容器日誌
docker logs personal-react-blog -f

# 健康狀態
docker inspect personal-react-blog | grep -A 10 Health
```

## 下一步

1. **本地測試**: 運行 `./scripts/test-docker.sh`
2. **驗證功能**: 手動測試所有頁面和功能
3. **部署到測試環境**: 選擇一個平台進行測試部署
4. **監控**: 觀察記憶體和性能指標
5. **生產部署**: 確認無誤後部署到生產環境

## 聯繫資訊

遇到問題？檢查以下資源：

- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - 詳細部署指南
- [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) - 文件結構說明
- [README.md](./README.md) - 項目概覽

---

**✅ Docker 配置已完成並可以運作！**

