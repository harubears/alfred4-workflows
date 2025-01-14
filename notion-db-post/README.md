# Notion Database Post

Notion のデータベースに項目を追加するスクリプトです。

## 機能

- データベースへの項目追加
- プロパティ値の動的なバリデーション
- フレキシブルな引数指定
- ログレベルによる出力制御

## セットアップ

### 環境変数の設定

以下のいずれかの方法で環境変数を設定できます：

1. .envファイルを使用する場合

    ```bash
    # .envファイルを作成
    cp .env.example .env
    # 値を編集
    vim .env
    ```

2. Alfredワークフローの環境変数を使用する場合
   - Alfredの設定画面でワークフローを選択
   - 右上の [x] ボタンをクリック
   - 以下の変数を設定:
     - alfred_NOTION_TOKEN
     - alfred_NOTION_DB_ID

3. システムの環境変数を使用する場合

    ```bash
    export NOTION_TOKEN="your-api-key"
    export NOTION_DB_ID="your-database-id"
    ```

### 依存パッケージのインストール

```bash
npm install
```

## 使用方法

### 基本的な使用方法

```bash
# デフォルトの使用方法（Titleに設定）
node notion-db-post.js "メモ内容"

# URLの場合は自動的にURLプロパティも設定
node notion-db-post.js "https://example.com"

# プロパティを明示的に指定
node notion-db-post.js --title="タイトル" --url="https://example.com"
```

### 設定ファイル (config.js)

```javascript
module.exports = {
  notion: {
    apiKey: process.env.NOTION_TOKEN,
    databaseId: process.env.NOTION_DB_ID
  },
  logging: {
    level: 'info' // 'none' | 'error' | 'warn' | 'info' | 'debug'
  },
  properties: {
    title: {
      name: 'Title',
      type: 'title',
      required: true,
      defaultTarget: true,
      validation: (value) => value.length > 0
    },
    url: {
      name: 'URL',
      type: 'url',
      required: false,
      validation: (value) => {
        try {
          new URL(value);
          return true;
        } catch (_) {
          return false;
        }
      }
    }
  },
  argParser: {
    prefix: '--',
    separator: '='
  }
}
```

## プロパティの設定

### プロパティの定義

各プロパティは以下の属性を持ちます：

- `name`: Notionデータベース上でのプロパティ名
- `type`: プロパティのタイプ（'title', 'url' など）
- `required`: 必須項目かどうか
- `defaultTarget`: 引数なしの場合のデフォルトターゲットかどうか
- `validation`: 値の検証関数

### カスタムプロパティの追加

新しいプロパティを追加する場合は、`config.js` の `properties` に定義を追加します：

```javascript
properties: {
  // 既存のプロパティ定義...
  customProp: {
    name: 'カスタム項目',
    type: 'rich_text',
    required: false,
    validation: (value) => true
  }
}
```

## ログレベル

- `none`: ログ出力なし
- `error`: エラーのみ出力
- `warn`: 警告以上を出力
- `info`: 情報レベル以上を出力
- `debug`: デバッグ情報を含むすべてを出力

## エラーハンドリング

- プロパティの検証に失敗した場合はエラーメッセージを出力
- API接続エラーの場合は詳細なエラー情報を出力
- 必須プロパティが欠落している場合はエラーを表示
