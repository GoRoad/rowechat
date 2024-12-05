#!/bin/sh

# 如果配置文件不存在，则创建它
if [ ! -f "/app/config/.env.production" ]; then
    echo "PORT=${PORT:-3000}" > /app/config/.env.production
    echo "DEBUG=${DEBUG:-false}" >> /app/config/.env.production
    echo "WEGE_BASE_API_URL=${WEGE_BASE_API_URL}" >> /app/config/.env.production
    echo "WEGE_FILE_API_URL=${WEGE_FILE_API_URL}" >> /app/config/.env.production
    echo "WEGE_LOCAL_PROXY=${WEGE_LOCAL_PROXY}" >> /app/config/.env.production
    echo "OPENAI_API_BASE=${OPENAI_API_BASE}" >> /app/config/.env.production
    echo "OPENAI_API_KEY=${OPENAI_API_KEY}" >> /app/config/.env.production
    echo "OPENAI_MODEL=${OPENAI_MODEL:-gpt-3.5-turbo}" >> /app/config/.env.production
    echo "ALLOWED_ROOM_LIST=${ALLOWED_ROOM_LIST}" >> /app/config/.env.production
fi

# 执行传入的命令
exec "$@"
