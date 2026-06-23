#!/bin/bash
set -euo pipefail

# ============================================================
# 服务器配置备份脚本
# 用途: 备份 Nginx、项目环境变量、PM2 配置等，并打包归档
# ============================================================

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_ROOT=~/backup
BACKUP_DIR="$BACKUP_ROOT/configs_$TIMESTAMP"
ARCHIVE_NAME="backup_configs_$TIMESTAMP.tar.gz"
SKIPPED=""
SUCCESS=""

# ---------- 颜色输出 ----------
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_ok()    { echo -e "${GREEN}[✓]${NC} $1"; }
log_skip()  { echo -e "${YELLOW}[!]${NC} $1"; }
log_err()   { echo -e "${RED}[✗]${NC} $1"; }
log_info()  { echo -e "[→] $1"; }

# ============================================================
# 辅助函数
# ============================================================

# 安全拷贝：源存在且目标目录创建成功才拷贝
safe_copy() {
    local src="$1"
    local dst="$2"
    local label="${3:-$src}"

    if [ ! -e "$src" ]; then
        log_skip "跳过 $label — 源不存在: $src"
        SKIPPED="$SKIPPED\n  - $label (源不存在)"
        return 0
    fi

    mkdir -p "$(dirname "$dst")"

    if sudo cp -r "$src" "$dst" 2>/dev/null; then
        log_ok "已备份: $label"
        SUCCESS="$SUCCESS\n  - $label"
    else
        log_err "备份失败: $label"
        SKIPPED="$SKIPPED\n  - $label (拷贝失败)"
    fi
}

# 尝试执行命令（用于可选步骤如 pm2）
try_cmd() {
    local description="$1"
    shift
    log_info "尝试: $description"
    if "$@" 2>/dev/null; then
        log_ok "$description"
    else
        log_skip "$description — 命令不可用或执行失败"
    fi
}

# ============================================================
# 开始备份
# ============================================================

echo ""
echo "=========================================="
echo "  服务器配置备份"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  目标: $BACKUP_DIR"
echo "=========================================="
echo ""

mkdir -p "$BACKUP_DIR"

# ============================================================
# 1. 备份 Nginx 配置
# ============================================================

log_info "--- Nginx 配置 ---"

NGINX_DIR="/etc/nginx"
if [ -d "$NGINX_DIR" ]; then
    # sites-available（如果存在）
    if [ -d "$NGINX_DIR/sites-available" ] && [ "$(ls -A "$NGINX_DIR/sites-available" 2>/dev/null)" ]; then
        mkdir -p "$BACKUP_DIR/nginx/sites-available"
        if sudo cp -r "$NGINX_DIR/sites-available/"* "$BACKUP_DIR/nginx/sites-available/" 2>/dev/null; then
            log_ok "已备份: /etc/nginx/sites-available/"
        else
            log_skip "/etc/nginx/sites-available/ — 拷贝失败（可能需要 sudo 密码）"
        fi
    else
        log_skip "/etc/nginx/sites-available/ — 目录为空或不存在"
    fi

    # sites-enabled（如果存在）
    if [ -d "$NGINX_DIR/sites-enabled" ] && [ "$(ls -A "$NGINX_DIR/sites-enabled" 2>/dev/null)" ]; then
        mkdir -p "$BACKUP_DIR/nginx/sites-enabled"
        if sudo cp -r "$NGINX_DIR/sites-enabled/"* "$BACKUP_DIR/nginx/sites-enabled/" 2>/dev/null; then
            log_ok "已备份: /etc/nginx/sites-enabled/"
        else
            log_skip "/etc/nginx/sites-enabled/ — 拷贝失败（可能需要 sudo 密码）"
        fi
    fi

    # nginx.conf
    safe_copy "$NGINX_DIR/nginx.conf" "$BACKUP_DIR/nginx/nginx.conf" "/etc/nginx/nginx.conf"

    # conf.d 目录（常用扩展配置目录）
    if [ -d "$NGINX_DIR/conf.d" ] && [ "$(ls -A "$NGINX_DIR/conf.d" 2>/dev/null)" ]; then
        mkdir -p "$BACKUP_DIR/nginx/conf.d"
        if sudo cp -r "$NGINX_DIR/conf.d/"* "$BACKUP_DIR/nginx/conf.d/" 2>/dev/null; then
            log_ok "已备份: /etc/nginx/conf.d/"
        else
            log_skip "/etc/nginx/conf.d/ — 拷贝失败"
        fi
    fi

    # proxy-common.conf（如果之前创建过）
    safe_copy "$NGINX_DIR/proxy-common.conf" "$BACKUP_DIR/nginx/proxy-common.conf" "/etc/nginx/proxy-common.conf"
else
    log_skip "Nginx 目录不存在: $NGINX_DIR"
fi

# ============================================================
# 2. 备份各项目环境变量
# ============================================================

echo ""
log_info "--- 环境变量文件 ---"

# 定义需要备份的项目列表: "项目名:路径"
PROJECTS=(
    "silent-rain-admin:/www/silent-rain-admin/.env.production"
    "silent-rain-api:/www/silent-rain-api/.env.production"
    "silent-rain-web:/www/silent-rain-web/.env.production"
)

for project in "${PROJECTS[@]}"; do
    name="${project%%:*}"
    env_file="${project#*:}"

    safe_copy "$env_file" "$BACKUP_DIR/$name/.env.production" "$name/.env.production"
done

# ============================================================
# 3. 备份 PM2 配置
# ============================================================

echo ""
log_info "--- PM2 配置 ---"

if command -v pm2 &>/dev/null; then
    # 保存 PM2 进程列表
    try_cmd "pm2 save" pm2 save

    # 备份 dump 文件
    PM2_DUMP="$HOME/.pm2/dump.pm2"
    PM2_ECOSYSTEM="$HOME/.pm2/ecosystem.config.js"

    safe_copy "$PM2_DUMP" "$BACKUP_DIR/pm2/dump.pm2" "PM2 dump.pm2"
    safe_copy "$PM2_ECOSYSTEM" "$BACKUP_DIR/pm2/ecosystem.config.js" "PM2 ecosystem.config.js"

    # 备份项目中的 pm2.sh 部署脚本
    PM2_SCRIPT="/www/silent-rain-api/pm2.sh"
    safe_copy "$PM2_SCRIPT" "$BACKUP_DIR/pm2/pm2.sh" "pm2.sh 部署脚本"
else
    log_skip "PM2 未安装，跳过 PM2 相关备份"
fi

# ============================================================
# 4. 备份项目配置文件（可选）
# ============================================================

echo ""
log_info "--- 项目配置文件 ---"

API_DIR="/www/silent-rain-api"
if [ -d "$API_DIR" ]; then
    # 如果项目中有 .env.production.local 等本地覆盖配置
    for config_file in "$API_DIR/.env.production.local" "$API_DIR/.env"; do
        if [ -f "$config_file" ]; then
            fname=$(basename "$config_file")
            safe_copy "$config_file" "$BACKUP_DIR/silent-rain-api/$fname" "silent-rain-api/$fname"
        fi
    done
fi

# ============================================================
# 5. 备份 crontab（如果有定时任务）
# ============================================================

echo ""
log_info "--- Crontab ---"

CRONTAB_BACKUP="$BACKUP_DIR/crontab.txt"
if crontab -l &>/dev/null; then
    if crontab -l > "$CRONTAB_BACKUP" 2>/dev/null; then
        log_ok "已备份: crontab"
    else
        log_skip "crontab 备份失败"
    fi
else
    log_skip "当前用户无 crontab 定时任务"
fi

# ============================================================
# 6. 备份系统包列表（便于灾后恢复）
# ============================================================

echo ""
log_info "--- 系统信息 ---"

# Node.js 全局包列表
if command -v npm &>/dev/null; then
    npm list -g --depth=0 > "$BACKUP_DIR/npm-global-packages.txt" 2>/dev/null && \
        log_ok "已备份: npm 全局包列表" || true
fi

# ============================================================
# 7. 打包归档
# ============================================================

echo ""
log_info "--- 打包归档 ---"

cd "$BACKUP_ROOT"
if tar -czf "$ARCHIVE_NAME" "configs_$TIMESTAMP" 2>/dev/null; then
    ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
    log_ok "已打包: $ARCHIVE_NAME ($ARCHIVE_SIZE)"
else
    log_err "打包失败！备份文件保留在: $BACKUP_DIR"
    exit 1
fi

# 清理临时目录（保留最近 3 次备份的原始目录，其余只保留压缩包）
ls -dt "$BACKUP_ROOT"/configs_* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null || true

# 删除 30 天前的压缩包
find "$BACKUP_ROOT" -maxdepth 1 -name "backup_configs_*.tar.gz" -mtime +30 -delete 2>/dev/null || true

# ============================================================
# 8. 输出摘要
# ============================================================

echo ""
echo "=========================================="
echo "  备份完成"
echo "  压缩包: $BACKUP_ROOT/$ARCHIVE_NAME"
echo "  原始目录: $BACKUP_DIR"
echo "=========================================="

if [ -n "$SUCCESS" ]; then
    echo ""
    echo -e "${GREEN}已备份:${NC}"
    echo -e "$SUCCESS"
fi

if [ -n "$SKIPPED" ]; then
    echo ""
    echo -e "${YELLOW}已跳过:${NC}"
    echo -e "$SKIPPED"
fi

echo ""