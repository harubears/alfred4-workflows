#!/usr/bin/env bash

export TZ="Asia/Tokyo"
# Node.js のパス
NODE="/opt/homebrew/bin/node"
#SCRIPT_PATH="path/to/notion-post.js"

# Alfred Workflowの設定例:
# 1. 通常のメモ追加 (nm)
#    Input: {query} -> Run Script: "$NODE" "$SCRIPT_PATH" "{query}"
#
# 2. タイトル指定付きメモ追加 (nt)
#    Input: {query} -> Run Script: "$NODE" "$SCRIPT_PATH" --title "{var:title}" "{query}"

#### LOG MODE ####
# ログファイル出力なし
export LOG_MODE=none

# ログファイル新規作成（既存を削除）
#export LOG_MODE=new

# ログファイル追記モード（デフォルト）
#export LOG_MODE=append

#### LOG OUTPUT LEVEL ####
# 全てのログを出力
#export LOG_LEVEL=DEBUG

# エラーのみ出力
#export LOG_LEVEL=ERROR

# 警告とエラーのみ出力
export LOG_LEVEL=WARN


# Alfred からの引数をそのまま渡す
"$NODE" "$SCRIPT_PATH" "$@"
