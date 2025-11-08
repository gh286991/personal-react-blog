#!/bin/bash

# Docker 構建測試腳本
# 用於驗證 Docker 構建和運行是否正常

set -e  # 遇到錯誤立即退出

echo "🐳 開始 Docker 構建測試..."
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

IMAGE_NAME="personal-react-blog-test"
CONTAINER_NAME="blog-test"
PORT=3001

# 清理函數
cleanup() {
    echo ""
    echo "🧹 清理測試環境..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    docker rmi $IMAGE_NAME 2>/dev/null || true
    echo "✅ 清理完成"
}

# 捕獲退出信號
trap cleanup EXIT

# 1. 構建 Docker 映像
echo "📦 步驟 1/4: 構建 Docker 映像..."
if docker build -t $IMAGE_NAME . ; then
    echo -e "${GREEN}✅ 映像構建成功${NC}"
else
    echo -e "${RED}❌ 映像構建失敗${NC}"
    exit 1
fi

echo ""

# 2. 檢查映像大小
echo "📊 步驟 2/4: 檢查映像大小..."
IMAGE_SIZE=$(docker images $IMAGE_NAME --format "{{.Size}}")
echo "   映像大小: $IMAGE_SIZE"

echo ""

# 3. 運行容器
echo "🚀 步驟 3/4: 啟動容器..."
if docker run -d -p $PORT:3000 --name $CONTAINER_NAME $IMAGE_NAME ; then
    echo -e "${GREEN}✅ 容器啟動成功${NC}"
else
    echo -e "${RED}❌ 容器啟動失敗${NC}"
    exit 1
fi

echo ""

# 等待服務啟動
echo "⏳ 等待服務啟動 (10秒)..."
sleep 10

# 4. 測試 HTTP 訪問
echo "🔍 步驟 4/4: 測試 HTTP 訪問..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ]; then
    echo -e "${GREEN}✅ HTTP 訪問成功 (狀態碼: $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ HTTP 訪問失敗 (狀態碼: $HTTP_CODE)${NC}"
    echo ""
    echo "容器日誌："
    docker logs $CONTAINER_NAME
    exit 1
fi

echo ""

# 顯示容器資訊
echo "📋 容器資訊："
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""

# 顯示容器日誌（最後 20 行）
echo "📝 容器日誌（最後 20 行）："
docker logs --tail 20 $CONTAINER_NAME

echo ""
echo -e "${GREEN}🎉 所有測試通過！${NC}"
echo ""
echo "💡 提示："
echo "   - 訪問應用: http://localhost:$PORT"
echo "   - 查看日誌: docker logs $CONTAINER_NAME"
echo "   - 手動清理: docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"
echo ""

