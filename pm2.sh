#!/bin/bash
set -euo pipefail

APP_NAME="silent-rain-api"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting reload for ${APP_NAME}..."

# 显式加载 nvm 和 pm2 路径
export NVM_DIR="/home/ecs-user/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    \. "$NVM_DIR/nvm.sh"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] nvm loaded successfully."
else
    echo "[ERROR] nvm.sh not found at ${NVM_DIR}/nvm.sh" >&2
    exit 1
fi

# 可选加载 bash_completion
if [ -s "$NVM_DIR/bash_completion" ]; then
    \. "$NVM_DIR/bash_completion"
fi

# 检查 pm2 是否可用
if ! command -v pm2 &>/dev/null; then
    echo "[ERROR] pm2 command not found." >&2
    exit 1
fi

# 检查进程是否已注册
if ! pm2 list | grep -q "${APP_NAME}"; then
    echo "[ERROR] Process '${APP_NAME}' not found in pm2 list." >&2
    exit 1
fi

# 执行 reload
pm2 reload "${APP_NAME}" --update-env --time

if [ $? -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${APP_NAME} reloaded successfully."
else
    echo "[ERROR] Failed to reload ${APP_NAME}." >&2
    exit 1
fi