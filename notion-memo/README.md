# Notion Memo Integration for Alfred

Alfredから直接Notionのデータベースにメモを追加・更新するワークフローです。

## 機能

- 今日の日付をタイトルとしたNotionページの作成
- 既存ページへのメモの追記
- ページタイトルの更新
- 日本時間でのタイムスタンプ付きメモ
- 柔軟なログ出力設定

## 必要条件

- macOS
- Alfred 4 (Powerpack)
- Node.js (v18以上推奨)
- Notion API トークン
- Notionデータベース（以下のプロパティが必要）
  - `Name`: タイトル (title)
  - `Date`: 日付 (date)

## セットアップ

1. 環境変数の設定

    Alfred の 環境変数として以下を登録してください。

    ```bash
    # Notion APIトークン
    export NOTION_TOKEN="your_token_here"
    # NotionデータベースID
    export NOTION_DB_ID="your_database_id_here"
    # JavaScript ファイルのパス
    export SCRIPT_PATH="/path/to/notion-post.js"
    ```

2. 依存パッケージのインストール

```bash
npm install node-fetch
```

## 使用方法

### メモの追加

```bash
# Alfred から
nm メモ内容    # 「今日の日付」というタイトルのページにメモを追加
```

### タイトルの更新

```bash
# Alfred から
nt 新しいタイトル    # 今日のページのタイトルを更新
```

## 環境設定

### ログモード設定

```bash
# ログファイル出力なし
export LOG_MODE=none

# ログファイル新規作成（既存を削除）
export LOG_MODE=new

# ログファイル追記モード（デフォルト）
export LOG_MODE=append
```

### ログレベル設定

```bash
# 全てのログを出力
export LOG_LEVEL=DEBUG

# エラーのみ出力
export LOG_LEVEL=ERROR

# 警告とエラーのみ出力
export LOG_LEVEL=WARN

# 情報レベル以上を出力（デフォルト）
export LOG_LEVEL=INFO
```

## ファイル構成

- `notion-post.js`: メインのNode.jsスクリプト
- `alfred-run.sh`: Alfred Workflowから呼び出されるシェルスクリプト
- `notion-post.log`: ログファイル（設定による）

## プロジェクトの特徴

- JST（日本時間）対応
- 柔軟なログ設定
- Notion APIのエラーハンドリング
- 日付ベースのページ管理

## ライセンス

MIT

## 注意事項

- Notion APIトークンは適切に管理してください
- ログファイルは定期的にクリーンアップすることを推奨します
