import OpenAI from "openai";
import { fetchUrlText, isUrl } from "./url.js";
import { extractMediaText } from "./media.js";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const sessions = new Map();

const MENU = `هلا 👋 أنا «سوّها».

أرسل لي أي رابط أو ملف، وقل وش تبي أسوي.

أمثلة:
• لخص الرابط
• ترجم للعربي
• استخرج أهم المعلومات
• حلل المنتج
• فرّغ الفيديو إلى نص
• حوّل الملف إلى نص

أرسل الرابط الآن 🚀`;

export async function processUserMessage(message) {
  const from = message.from;
  if (message.type === "text") {
    const text = message.text?.body?.trim() || "";
    if (/^(ابدأ|start|القائمة|مساعدة)$/i.test(text)) return MENU;

    const url = extractUrl(text);
    const session = sessions.get(from) || {};
    if (url) {
      session.url = url;
      sessions.set(from, session);
      const action = detectAction(text);
      if (!action) {
        return `تم استلام الرابط ✅\nوش تبي أسوي فيه؟\n\n1) تلخيص\n2) ترجمة\n3) استخراج معلومات\n4) تحليل المنتج`;
      }
      return executeUrlAction(url, action);
    }

    if (session.url) {
      const action = detectAction(text);
      if (action) return executeUrlAction(session.url, action);
    }

    return openai ? askAssistant(text) : "أرسل رابطًا أو ملفًا، واكتب المطلوب مثل: «لخص» أو «ترجم».";
  }

  if (["document", "audio", "video"].includes(message.type)) return extractMediaText(message);
  if (message.type === "image") return "وصلت الصورة 🖼️\nأضف طلبك مثل: «استخرج النص» أو «اشرح الصورة».";
  return "أرسل رابطًا أو ملفًا، وأنا أجهزه لك.";
}

function extractUrl(text) {
  const m = text.match(/https?:\/\/[^\s<>]+/i);
  return m?.[0]?.replace(/[),.!؟]+$/g, "");
}

function detectAction(text) {
  if (/ترجم|translation|translate/i.test(text)) return "translate";
  if (/لخص|ملخص|تلخيص|summary|summarize/i.test(text)) return "summarize";
  if (/استخرج|معلومات|extract|بيانات/i.test(text)) return "extract";
  if (/حلل المنتج|حلل|مواصفات|سعر/i.test(text)) return "product";
  return null;
}

async function executeUrlAction(url, action) {
  const data = await fetchUrlText(url);
  if (!data.text) return "ما قدرت أقرأ محتوى الرابط. إذا كان يحتاج تسجيل دخول أو محميًا، أرسل الملف مباشرة.";
  const instruction = {
    summarize: "لخّص المحتوى بالعربية في نقاط قصيرة، واذكر أهم 5 معلومات فقط.",
    translate: "ترجم المحتوى إلى العربية ترجمة واضحة، مع الحفاظ على الأرقام والأسماء والروابط.",
    extract: "استخرج المعلومات المهمة من المحتوى في قائمة منظمة، ولا تخترع أي معلومة غير موجودة.",
    product: "إذا كان المحتوى عن منتج، استخرج الاسم والسعر والمواصفات والمزايا والعيوب الظاهرة والبدائل المذكورة. إذا لم يكن منتجًا، قل ذلك."
  }[action];
  return askModel(`${instruction}\n\nالرابط: ${url}\n\nالمحتوى:\n${data.text.slice(0, 30000)}`);
}

async function askAssistant(text) {
  return askModel(`أنت مساعد «سوّها» على واتساب. أجب بالعربية السعودية بشكل مختصر وعملي.\nطلب المستخدم: ${text}`);
}

async function askModel(input) {
  if (!openai) return "ميزة الذكاء الاصطناعي غير مفعلة بعد. أضف OPENAI_API_KEY إلى إعدادات الخادم.";
  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
    input,
    max_output_tokens: 1200
  });
  return response.output_text?.trim() || "ما قدرت أطلع نتيجة.";
}
