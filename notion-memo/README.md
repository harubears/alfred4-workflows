# Notion Memo Integration for Alfred

Alfredから直接Notionのデータベースにメモを追加・更新するワークフローです。

## 主な変更点（2024年1月）

- ビルドシステムの導入
  - esbuildを使用して単一の実行ファイルを生成
  - node_modulesへの依存を排除
  - `npm run build`で`dist/notion-post.bundle.js`が生成される
- ログ出力の改善
  - ログファイルの出力先を環境変数で設定可能
  - より詳細なログレベル制御

## 必要条件

- macOS
- Alfred 4 (Powerpack)
- Node.js (v18以上推奨)
- Notion API トークン
- Notionデータベース（以下のプロパティが必要）
  - `Name`: タイトル (title)
  - `Date`: 日付 (date)

## セットアップ

### 1. 開発環境での初期セットアップ（ビルド）

```bash
# 依存関係のインストールとビルド
npm install
npm run build
```

ビルドが完了すると `dist/notion-post.bundle.js` が生成されます。

### 2. 環境変数の設定

Alfred の 環境変数として以下を登録：

```bash
# 必須設定
export NOTION_TOKEN="your_token_here"
export NOTION_DB_ID="your_database_id_here"
export NODE="/opt/homebrew/bin/node"
export SCRIPT_PATH="/path/to/dist/notion-post.bundle.js"

# オプション：ログ設定
export LOG_FILE_PATH="/path/to/notion-post.log"  # ログファイルの保存先
export LOG_MODE="append"                          # none, new, append から選択
export LOG_LEVEL="INFO"                          # ERROR, WARN, INFO, DEBUG から選択
```

## 使用方法

### メモの追加

```bash
# Alfred から
nm メモ内容    # 「YYYY-MM-DD」というタイトルのページにメモを追加
```

### タイトルの更新

```bash
# Alfred から
nt 新しいタイトル    # 今日のページのタイトルを更新
```

## 環境設定

### ログファイルの場所

- デフォルト: プロジェクトルートの `notion-post.log`
- カスタム: 環境変数 `LOG_FILE_PATH` で指定可能

  ```bash
  export LOG_FILE_PATH="/path/to/custom/notion-post.log"
  ```

## ログモードとレベル

### ログモード（LOG_MODE）

- `none`: ログファイル出力を無効化
- `new`: 毎回新規作成（既存ログを削除）
- `append`: 追記モード（デフォルト）

### ログレベル（LOG_LEVEL）

- `ERROR`: エラーのみ
- `WARN`: 警告とエラー
- `INFO`: 情報レベル以上（デフォルト）
- `DEBUG`: 全てのログを出力

## ファイル構成

- `notion-post.js`: メインのソースコード
- `dist/notion-post.bundle.js`: ビルド済み実行ファイル
- `package.json`: プロジェクト設定
- `notion-post.log`: ログファイル

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
