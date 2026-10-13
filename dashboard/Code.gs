/**
 * Приём ответов анкеты «Запись эфира по дашбордам» в Google Таблицу
 * + (по желанию) уведомление Веронике в Телеграм.
 *
 * Как подключить:
 * 1. В таблице: Расширения → Apps Script → вставьте этот код вместо пустой функции.
 * 2. Если нужно уведомление в Телеграм, впишите TG_TOKEN (токен бота от @BotFather)
 *    и TG_CHAT (id чата Вероники; бот должен быть добавлен в этот чат).
 * 3. Начать развертывание → Новое развертывание → тип «Веб-приложение»,
 *    «Выполнять от имени: меня», «Доступ: все» → скопируйте ссылку.
 * 4. Вставьте ссылку в index.html в CONFIG.WEBHOOK_URL.
 */

const TG_TOKEN = '';
const TG_CHAT = '';

const COLUMNS = [
  ['date', 'Дата'], ['event', 'Событие'], ['priority', 'Приоритет'], ['name', 'Имя'],
  ['phone', 'Телефон'], ['tg', 'Телеграм'], ['segment', 'Чем занимается'], ['income', 'Доход сейчас'],
  ['goal', 'Цель через 3 мес, ₽'], ['block', 'Что мешает'], ['exp', 'Опыт']
];

// Проверка: откройте ссылку веб-приложения в браузере. Если всё настроено,
// увидите «Скрипт работает», а в таблице появится тестовая строка.
function doGet() {
  save({ event: 'test', date: new Date().toLocaleString('ru-RU'), name: 'Тестовая строка' });
  return ContentService.createTextOutput('Скрипт работает, тестовая строка добавлена в таблицу');
}

function doPost(e) {
  save(JSON.parse(e.postData.contents));
  return ContentService.createTextOutput('ok');
}

function save(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheets()[0];
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNS.map(c => c[1]));
    sh.setFrozenRows(1);
  }
  sh.appendRow(COLUMNS.map(c => data[c[0]] ?? ''));

  if (TG_TOKEN && TG_CHAT) {
    const head = data.event === 'booking_click' ? '🔥 Нажал «Записаться на разбор»' : '📝 Заполнил анкету';
    const text = [
      head,
      `${data.name}, ${data.phone}${data.tg ? ', ' + data.tg : ''}`,
      `${data.segment} · приоритет: ${data.priority}`,
      `Доход: ${data.income} → цель ${Number(data.goal).toLocaleString('ru-RU')} ₽`,
      `Мешает: ${data.block}`,
      `Опыт: ${data.exp}`
    ].join('\n');
    UrlFetchApp.fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'post',
      payload: { chat_id: TG_CHAT, text: text },
      muteHttpExceptions: true
    });
  }
}
