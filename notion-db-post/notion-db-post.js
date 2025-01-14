const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const config = require('./config');

// 環境変数の確認
console.log('NOTION_TOKEN:', process.env.NOTION_TOKEN);
console.log('NOTION_DB_ID:', process.env.NOTION_DB_ID);

// ロガーの設定
const logger = {
  error: (msg, ...args) => config.logging.level !== 'none' && console.error(config.logging.format.error, msg, ...args),
  warn: (msg, ...args) => ['warn', 'info', 'debug'].includes(config.logging.level) && console.warn(config.logging.format.warn, msg, ...args),
  info: (msg, ...args) => ['info', 'debug'].includes(config.logging.level) && console.log(config.logging.format.info, msg, ...args),
  debug: (msg, ...args) => config.logging.level === 'debug' && console.log(config.logging.format.debug, msg, ...args)
};

// 引数をパースする関数
function parseArgs(args) {
  const parsed = {
    defaultValue: null,
    properties: {}
  };

  args.slice(2).forEach(arg => {
    if (arg.startsWith(config.argParser.prefix)) {
      const [prop, value] = arg.slice(config.argParser.prefix.length).split(config.argParser.separator);
      if (prop && value && config.properties[prop]) {
        parsed.properties[prop] = value;
      }
    } else if (!parsed.defaultValue) {
      parsed.defaultValue = arg;
    }
  });

  return parsed;
}

// プロパティ値を検証する関数
function validateProperty(propKey, value) {
  const prop = config.properties[propKey];
  if (!prop.validation(value)) {
    throw new Error(`Invalid format for ${prop.name}: ${value}`);
  }
  return true;
}

// URLかどうかを判定する関数
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// データベースにアイテムを追加する関数
async function addToDatabase(parsedArgs) {
  const properties = {};
  
  // デフォルト値の処理
  if (parsedArgs.defaultValue) {
    const defaultTarget = Object.entries(config.properties)
      .find(([_, prop]) => prop.defaultTarget)?.[0];
    
    if (defaultTarget) {
      try {
        validateProperty(defaultTarget, parsedArgs.defaultValue);
        properties[config.properties[defaultTarget].name] = {
          [config.properties[defaultTarget].type]: defaultTarget === 'title' ? 
            [{ text: { content: parsedArgs.defaultValue } }] : 
            parsedArgs.defaultValue
        };

        // URLの場合は自動的にURLプロパティも設定
        if (config.properties.url && config.properties.url.validation(parsedArgs.defaultValue)) {
          properties[config.properties.url.name] = {
            url: parsedArgs.defaultValue
          };
        }
      } catch (error) {
        logger.error(error.message);
        throw error;
      }
    }
  }

  // 明示的に指定されたプロパティの処理
  for (const [key, value] of Object.entries(parsedArgs.properties)) {
    try {
      validateProperty(key, value);
      properties[config.properties[key].name] = {
        [config.properties[key].type]: key === 'title' ? 
          [{ text: { content: value } }] : 
          value
      };
    } catch (error) {
      logger.error(error.message);
      throw error;
    }
  }

  // 必須プロパティのチェック
  for (const [key, prop] of Object.entries(config.properties)) {
    if (prop.required && !properties[prop.name]) {
      throw new Error(`Required property ${prop.name} is missing`);
    }
  }

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.notion.apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: config.notion.databaseId },
        properties: properties
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error adding to Notion: ${errorData.message}`);
    }

    const responseData = await response.json();
    logger.info('Successfully added to Notion');
    return responseData;
  } catch (error) {
    logger.error('Error adding to Notion:', error);
    throw error;
  }
}

// エラーメッセージをユーザーフレンドリーにする
function formatError(error) {
  if (error.message.includes('unauthorized')) {
    return 'Notion APIキーが無効です。Alfred設定画面で正しいAPIキーを設定してください。';
  }
  return error.message || '不明なエラーが発生しました';
}

// メイン処理
async function main() {
  const parsedArgs = parseArgs(process.argv);
  if (!parsedArgs.defaultValue && Object.keys(parsedArgs.properties).length === 0) {
    logger.error('テキストまたはプロパティを指定してください');
    process.exit(1);
  }

  try {
    await addToDatabase(parsedArgs);
  } catch (error) {
    logger.error(formatError(error));
    process.exit(1);
  }
}

main();
