// Alfred環境変数が設定されていない場合にのみ dotenv を読み込む
if (!process.env.alfred_NOTION_TOKEN || !process.env.alfred_NOTION_DB_ID) {
  require('dotenv').config();
}

// 設定ソースの優先順位付き読み込み
function getConfigValue(key, defaultValue = null) {
  // Alfred環境変数をチェック
  const alfredKey = `alfred_${key}`;
  if (process.env[alfredKey]) return process.env[alfredKey];

  // process.env経由での直接アクセスを優先
  const value = process.env[key];
  if (value) return value;

  return defaultValue;
}

// APIキーのバリデーション
function validateConfig() {
  const apiKey = getConfigValue('NOTION_TOKEN');
  const databaseId = getConfigValue('NOTION_DB_ID');

  if (!apiKey) {
    throw new Error('Notion API key is not set. Please set NOTION_TOKEN in your environment variables or Alfred workflow configuration.');
  }

  if (!databaseId) {
    throw new Error('Notion Database ID is not set. Please set NOTION_DB_ID in your environment variables or Alfred workflow configuration.');
  }
}

// 設定の検証を実行
validateConfig();

module.exports = {
  // Notion API設定
  notion: {
    apiKey: getConfigValue('NOTION_TOKEN'),
    databaseId: getConfigValue('NOTION_DB_ID')
  },

  // ロギング設定
  logging: {
    level: 'debug', // 'error' | 'warn' | 'info' | 'debug'
    format: {
      error: '❌ Error: %s',
      warn: '⚠️ Warning: %s',
      info: 'ℹ️ Info: %s',
      debug: '🔍 Debug: %s'
    }
  },
  
  // データベースのプロパティ定義
  properties: {
    title: {
      name: 'Title',
      type: 'title',
      required: true,
      defaultTarget: true, // 引数なしの場合のデフォルトターゲット
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

  // 引数パース設定
  argParser: {
    prefix: '--', // プロパティ指定プレフィックス
    separator: '=' // プロパティと値の区切り文字
  }
};

