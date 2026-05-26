const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// توكن البوت
const token = '8815356896:AAFzhaQIV9JRlVOIIPJGnCfQNqsIcE3Qn7U';

// تشغيل البوت
const bot = new TelegramBot(token, {
  polling: true
});

// القناة
const channel = '@harajpulse1';

// أمر start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '🔥 البوت شغال بنجاح');
});

// إرسال رسالة للقناة كل دقيقة
setInterval(() => {

  const message = `
🚨 فرصة جديدة من حراج

🚗 كامري 2024 فل كامل

💰 السعر: 89,000 ر.س

🔗 https://haraj.com.sa
`;

  bot.sendMessage(channel, message);

}, 60000);

// سيرفر لـ Railway
const PORT = process.env.PORT || 8080;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running');
}).listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

console.log('Telegram bot running 🚀');
