const TelegramBot = require('node-telegram-bot-api');

// التوكن
const token = '8815356896:AAFzhaQIV9JRlVOIIPJGnCfQNqsIcE3Qn7U';

// تشغيل البوت
const bot = new TelegramBot(token, { polling: true });

// اسم القناة
const channel = '@harajpulse1';

// رسالة /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    '🔥 بوت حراج شغال بنجاح'
  );
});

// إرسال فرصة كل دقيقة
setInterval(() => {

  const message = `
🚨 فرصة جديدة من حراج

🚗 كامري 2024 فل كامل

💰 السعر: 89,000 ر.س

🔗 https://haraj.com.sa
`;

  bot.sendMessage(channel, message);

}, 60000);

console.log('Telegram bot running 🚀');
