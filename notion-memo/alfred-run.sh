#!/usr/bin/env bash

export TZ="Asia/Tokyo"
# Node.js のパス
NODE="/opt/homebrew/bin/node"

# 必須の環境変数
# ここで定義してもよいし、Alfred の環境変数から渡すこともできる
#SCRIPT_PATH="/path/to/dist/notion-post.bundle.js"
#export NOTION_TOKEN="your_token_here"
#export NOTION_DB_ID="your_database_id_here"

#### LOG MODE & LEVEL ####
export LOG_MODE=none
export LOG_LEVEL=WARN

# オプション: デフォルトと異なるログファイルパスを使用する場合のみ設定
#export LOG_FILE_PATH="/path/to/custom/notion-post.log"

# Alfred からの引数をそのまま渡す
"$NODE" "$SCRIPT_PATH" "$@"
