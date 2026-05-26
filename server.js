const TelegramBot = require('node-telegram-bot-api');

const token = '8815356896:AAFzhaQIV9JRlVOIIPJGnCfQNqsIcE3Qn7U';

const bot = new TelegramBot(token, { polling: true });

const channel = '@harajpulse1';

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '🔥 بوت حراج شغال');
});

// رسالة تجريبية كل دقيقة
setInterval(() => {

  bot.sendMessage(channel, `
🚨 فرصة جديدة من حراج

كامري 2024 فل كامل

💰 السعر: 89,000 ريال

🔗 https://haraj.com.sa
`);

}, 60000);

console.log('Telegram bot running 🚀');
