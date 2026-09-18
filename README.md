# سوّها — Clean WhatsApp Cloud API

هذه نسخة نظيفة من «سوّها» تعمل مباشرة مع WhatsApp Cloud API لحساب واحد، بدون Embedded Signup أو OAuth أو تأهيل عملاء.

## لماذا؟

الهدف الحالي هو تشغيل بوت واتساب لحساب واحد. لذلك لا نستخدم Embedded Signup في هذه المرحلة. Embedded Signup مخصص لمنتجات Solution Partner / Tech Provider التي تقوم بتأهيل حسابات عملاء متعددة.

Meta توضح أن Cloud API يحتاج Business Portfolio وWhatsApp Business Account ورقم أعمال، وأن التطبيق يجب الاشتراك فيه على الـWABA حتى تصل أحداث Webhook. كما أن رسالة الاختبار الرسمية تستخدم endpoint الخاص بـPhone Number ID.

## الوظائف

- استقبال رسائل WhatsApp.
- تلخيص الروابط.
- ترجمة الروابط.
- استخراج المعلومات.
- تحليل صفحات المنتجات.
- قراءة PDF وWord.
- تفريغ الصوت/الفيديو.
- ردود AI بالعربية.

## متغيرات البيئة

- META_VERIFY_TOKEN: قيمة عشوائية تختارها أنت وتستخدم نفس القيمة في إعداد Webhook داخل Meta.
- WHATSAPP_TOKEN: System User Access Token.
- WHATSAPP_PHONE_NUMBER_ID: معرّف رقم الهاتف في WhatsApp Manager.
- WHATSAPP_GRAPH_VERSION: v26.0.
- OPENAI_API_KEY: مفتاح OpenAI إذا أردت وظائف AI.
- OPENAI_MODEL: النموذج النصي.
- OPENAI_TRANSCRIBE_MODEL: نموذج التفريغ.
- MAX_DOWNLOAD_MB: الحد الأقصى للملفات التي يعالجها البوت.

لا تضع أي Access Token أو App Secret في GitHub.

## نقاط الاختبار

GET /health — صحة الخدمة وحالة وجود متغيرات البيئة.
GET /status — يختبر الوصول إلى Phone Number ID عبر Meta دون كشف التوكن.
GET /webhook — تحقق Meta.
POST /webhook — استقبال رسائل WhatsApp.

## إعداد Meta

1. افتح تطبيق «سوّها».
2. فعّل WhatsApp Cloud API.
3. اضبط Webhook URL على:
   https://sawha-whatsapp.onrender.com/webhook
4. استخدم نفس قيمة META_VERIFY_TOKEN.
5. فعّل Webhooks المطلوبة.
6. اشترك التطبيق في WABA حتى تصل أحداث أرقام الحساب إلى Webhook.
7. اختبر رسالة hello_world.

لا تستخدم Embedded Signup الآن.

## الأمان

الرابط الذي يرسله المستخدم يمر عبر فحص أولي لمنع localhost والشبكات الخاصة قبل جلب المحتوى. لا يستخدم المشروع لتجاوز تسجيل الدخول أو حماية المنصات أو تنزيل محتوى محمي دون إذن.
