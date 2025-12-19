#!/bin/sh
set -e

# node_modulesディレクトリの権限を修正
chown -R node:node /app 2>/dev/null || true

# nodeユーザーに切り替えてnpm installを実行（既にインストール済みの場合はスキップ）
if [ ! -d "/app/node_modules" ] || [ -z "$(ls -A /app/node_modules 2>/dev/null)" ]; then
  echo "Installing dependencies..."
  su-exec node sh -c "cd /app && npm install"
fi

# 開発サーバーを起動
exec su-exec node sh -c "cd /app && npm run dev -- --host 0.0.0.0"
