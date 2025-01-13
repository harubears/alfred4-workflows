/**
 * 環境変数と定数を設定するための設定ファイル。
 * 
 * このモジュールは、さまざまな設定を含むオブジェクトをエクスポートします：
 * 
 * - TIMEZONE: タイムゾーン設定、デフォルトは 'Asia/Tokyo'。
 * - LOG_MODE: ログモード、環境変数 LOG_MODE で設定可能、デフォルトは 'append'。
 * - LOG_LEVEL: ログレベル、環境変数 LOG_LEVEL で設定可能、デフォルトは 'INFO'。
 * - LOG_FILE_PATH: ログファイルのパス、環境変数 LOG_FILE_PATH で設定可能、デフォルトは 'notion-post.log'。
 * - NOTION_API_VERSION: 使用する Notion API のバージョン、デフォルトは '2022-02-22'。
 * - NOTION_BASE_URL: Notion API のベース URL、デフォルトは 'https://api.notion.com/v1'。
 * - NOTION_TOKEN: Notion API への認証トークン、環境変数 NOTION_TOKEN で設定可能。
 * - NOTION_DB_ID: Notion データベースの ID、環境変数 NOTION_DB_ID で設定可能。
 * 
 * 環境変数は、適用可能な場合にデフォルト設定を上書きするために使用されます。
 */
module.exports = {
  TIMEZONE: 'Asia/Tokyo',
  LOG_MODE: process.env.LOG_MODE || 'append',
  LOG_LEVEL: process.env.LOG_LEVEL || 'INFO',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || 'notion-post.log',
  NOTION_API_VERSION: '2022-02-22',
  NOTION_BASE_URL: 'https://api.notion.com/v1',
  NOTION_TOKEN: process.env.NOTION_TOKEN || '',
  NOTION_DB_ID: process.env.NOTION_DB_ID || ''
};
