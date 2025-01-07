#!/usr/bin/env node

/**
 * notion-post.js
 *
 * - Alfredなどから "{query}" を引数として受け取り
 * - NotionのDBを検索して「今日の日付」のページがあるか確認
 * - なければ新規作成
 * - そのページの本文(ブロック)にタイムスタンプ付きメモを追記
 * - ログをファイル (notion-post.log) に追記
 */

const fs = require('fs');
const path = require('path');

// Node.js 18 以前でも fetch を使うためのラッパ
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

// ログファイルのパスを、環境変数または既定値から設定
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || path.join(__dirname, '..', 'notion-post.log');
logToFile(`Using log file: ${LOG_FILE_PATH}`, 'DEBUG');

// ログレベルの定数定義を追加
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// ログ出力モードの定数定義
const LOG_MODES = {
  NONE: 'none',      // ログファイル出力なし
  NEW: 'new',        // 新規作成（既存を削除）
  APPEND: 'append'   // 追記モード
};

// 環境変数からログ設定を取得
const LOG_MODE = process.env.LOG_MODE || LOG_MODES.APPEND;  // デフォルトは追記モード
const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';
const CURRENT_LOG_LEVEL = LOG_LEVELS[LOG_LEVEL] || LOG_LEVELS.INFO;

// ログファイルの初期化
if (LOG_MODE === LOG_MODES.NEW && fs.existsSync(LOG_FILE_PATH)) {
  fs.unlinkSync(LOG_FILE_PATH);  // 既存のログファイルを削除
}

/**
 * ファイル & コンソール両方へログを出すヘルパー関数
 */
function logToFile(message, level = 'INFO') {
  // 現在のログレベルより高いレベルのログは出力しない
  if (LOG_LEVELS[level] > CURRENT_LOG_LEVEL) {
    return;
  }

  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] ${message}\n`;

  // コンソールへの出力（常に実行）
  if (level === 'ERROR') {
    console.error(logLine.trim());
  } else {
    console.log(logLine.trim());
  }

  // ログファイルへの出力（LOG_MODE に応じて）
  if (LOG_MODE !== LOG_MODES.NONE) {
    try {
      fs.appendFileSync(LOG_FILE_PATH, logLine, { encoding: 'utf8' });
    } catch (err) {
      console.error(`Failed to write to log file: ${err.message}`);
    }
  }
}

// 起動時のログ出力を追加
logToFile(`Log Mode: ${LOG_MODE}`, 'DEBUG');
logToFile(`Log Level: ${LOG_LEVEL}`, 'DEBUG');

// Notion API関連: 環境変数から取得
const NOTION_TOKEN = process.env.NOTION_TOKEN || '';
const NOTION_DB_ID = process.env.NOTION_DB_ID || '';

if (!NOTION_TOKEN || !NOTION_DB_ID) {
  logToFile('NOTION_TOKEN or NOTION_DB_ID is missing.', 'ERROR');
  process.exit(1);
}

// 環境変数のログ出力をDEBUGレベルに変更
logToFile(`Current LOG_LEVEL: ${LOG_LEVEL}`, 'DEBUG');
logToFile(`NOTION_TOKEN length=${NOTION_TOKEN.length}`, 'DEBUG');
logToFile(`NOTION_DB_ID=${NOTION_DB_ID}`, 'DEBUG');

// 今日の日付(YYYY-MM-DD)をタイトルのデフォルト値として先に定義
const todayStr = new Date().toISOString().slice(0, 10);

// コマンドライン引数の処理をシンプル化
const args = process.argv.slice(2)[0]?.split(/\s+/) || [];
logToFile(`Raw args from Alfred: ${JSON.stringify(args)}`, 'DEBUG');

let pageTitle = todayStr;  // デフォルトは今日の日付
let memoContent = '';

if (args[0] === '--title') {
  // タイトル更新モード：--title 以降の全文字列を結合
  pageTitle = args.slice(1).join(' ').trim() || todayStr;
  logToFile(`Updating title to: ${pageTitle}`, 'DEBUG');
} else {
  // メモ追加モード
  memoContent = args
      .filter(arg => arg !== "{query}")
      .join(' ')
      .trim();
  logToFile(`Adding memo: ${memoContent}`, 'DEBUG');
}

logToFile(`Final Title: ${pageTitle}`, 'DEBUG');
logToFile(`Final Content: ${memoContent}`, 'DEBUG');

// メモが空の場合の警告
if (!memoContent) {
  logToFile('Warning: Empty memo content received', 'WARN');
}

function getJSTString() {
  // 現在時刻のミリ秒 + 9時間
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);

  // YYYY-MM-DD HH:mm:ss 形式にフォーマット
  const yyyy = jst.getUTCFullYear();
  const mm = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(jst.getUTCDate()).padStart(2, "0");
  const hh = String(jst.getUTCHours()).padStart(2, "0");
  const mi = String(jst.getUTCMinutes()).padStart(2, "0");
  const ss = String(jst.getUTCSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

const textToAppend = `${getJSTString()} ${memoContent || '(空のメモ)'}`;

// Notion API関連の定数を追加
const NOTION_API_VERSION = '2022-02-22';
const NOTION_BASE_URL = 'https://api.notion.com/v1';

// ヘッダー作成のヘルパー関数を追加
function getNotionHeaders() {
  return {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': NOTION_API_VERSION,
    'Content-Type': 'application/json'
  };
}

// findPageByTitle を findTodaysPage に変更
async function findTodaysPage(dbId, dateStr) {
  logToFile(`Searching DB for page with date "${dateStr}"`);

  const url = `https://api.notion.com/v1/databases/${dbId}/query`;
  const bodyFilter = {
    filter: {
      property: 'Date',  // Date プロパティで検索
      date: {
        equals: dateStr  // YYYY-MM-DD 形式で検索
      }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: getNotionHeaders(),
    body: JSON.stringify(bodyFilter)
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Query DB error: ${res.status} - ${errBody}`);
  }

  const data = await res.json();
  if (data.results && data.results.length > 0) {
    logToFile(`Found today's page. ID=${data.results[0].id}`);
    return data.results[0];
  } else {
    logToFile(`No page found for date="${dateStr}".`);
    return null;
  }
}

// createPage 関数を修正（タイトルを引数で受け取る）
async function createPage(dbId, titleStr, dateStr) {
  logToFile(`Creating a new page titled "${titleStr}"`);
  const url = 'https://api.notion.com/v1/pages';
  const bodyData = {
    parent: { database_id: dbId },
    properties: {
      Name: {
        title: [
          {
            type: 'text',
            text: { content: titleStr }
          }
        ]
      },
      Date: {
        date: {
          start: dateStr // 日付プロパティには常に日付を設定
        }
      }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: getNotionHeaders(),
    body: JSON.stringify(bodyData)
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Create page error: ${res.status} - ${errBody}`);
  }

  const data = await res.json();
  logToFile(`New page created. ID=${data.id}`);
  return data;
}

/**
 * 既存ページに paragraph ブロックを追加
 */
async function appendParagraph(pageId, text) {
  try {
    // ページIDの処理を修正
    const cleanPageId = pageId.replace(/[^a-zA-Z0-9]/g, '');
    logToFile(`Clean pageId: ${cleanPageId}`);

    const url = `${NOTION_BASE_URL}/blocks/${cleanPageId}/children`;
    logToFile(`API URL: ${url}`);

    const payload = {
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: text
                }
              }
            ]
          }
        }
      ]
    };

    logToFile(`Sending request with payload: ${JSON.stringify(payload)}`);

    const res = await fetch(url, {
      method: 'PATCH',
      headers: getNotionHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errBody = await res.text();
      logToFile(`API Response Error: ${res.status} - ${errBody}`, 'ERROR');
      throw new Error(`Append block error: ${res.status} - ${errBody}`);
    }

    const data = await res.json();
    logToFile(`API Response Success: ${JSON.stringify(data)}`);
    return data;
  } catch (err) {
    logToFile(`appendParagraph error: ${err.message}`, 'ERROR');
    throw err;
  }
}

// Notionページのタイトルを更新する関数を追加
async function updatePageTitle(pageId, newTitle) {
  logToFile(`Updating page title to: ${newTitle}`);
  const url = `${NOTION_BASE_URL}/pages/${pageId}`;

  const payload = {
    properties: {
      Name: {
        title: [
          {
            type: 'text',
            text: { content: newTitle }
          }
        ]
      }
    }
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: getNotionHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errBody = await res.text();
    logToFile(`Update title error: ${res.status} - ${errBody}`, 'ERROR');
    throw new Error(`Update title error: ${res.status} - ${errBody}`);
  }

  const data = await res.json();
  logToFile(`Title updated successfully`);
  return data;
}

// メイン処理の修正
(async () => {
  try {
    logToFile(`=== Script Start | Title="${pageTitle}" Memo="${memoContent}" ===`);

    // 1) 今日の日付のページを探す（Date プロパティで検索）
    let page = await findTodaysPage(NOTION_DB_ID, todayStr);

    if (!page) {
      // 今日のページがなければ作成
      page = await createPage(NOTION_DB_ID, pageTitle, todayStr);
    }

    if (args[0] === '--title') {
      // タイトル更新モード
      await updatePageTitle(page.id, pageTitle);
      console.log('Notion page title updated successfully.');
    } else {
      // メモ追加モード
      await appendParagraph(page.id, textToAppend);
      console.log('Notion page content updated successfully.');
    }

    logToFile('=== Script End (SUCCESS) ===');
    process.exit(0);

  } catch (err) {
    logToFile(`=== Script End (ERROR): ${err.stack || err}`, 'ERROR');
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
})();
