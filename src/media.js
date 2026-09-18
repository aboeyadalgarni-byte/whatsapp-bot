import OpenAI from "openai";
import pdf from "pdf-parse";
import mammoth from "mammoth";

const GRAPH = process.env.WHATSAPP_GRAPH_VERSION || "v26.0";
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function extractMediaText(message) {
  const media = message[message.type];
  if (!media?.id) return "لم أستطع قراءة الملف.";

  const buffer = await downloadMedia(media.id);

  if (message.type === "document") {
    const mime = media.mime_type || "";
    let text = "";

    if (mime === "application/pdf" || media.filename?.toLowerCase().endsWith(".pdf")) {
      const parsed = await pdf(buffer);
      text = parsed.text;
    } else if (
      mime.includes("wordprocessingml") ||
      media.filename?.toLowerCase().endsWith(".docx")
    ) {
      const parsed = await mammoth.extractRawText({ buffer });
      text = parsed.value;
    } else {
      return "استقبلت الملف 📎. حاليًا أدعم PDF وWord.";
    }

    if (!text.trim()) return "الملف وصل لكن لم أجد نصًا قابلًا للاستخراج.";
    return summarizeIfPossible(text);
  }

  if (message.type === "audio" || message.type === "video") {
    if (!openai) return "ميزة تفريغ الصوت/الفيديو تحتاج OPENAI_API_KEY.";

    const ext = message.type === "audio" ? "ogg" : "mp4";
    const file = new File([buffer], media.id + "." + ext);
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-transcribe",
      response_format: "text"
    });

    return "تم التفريغ ✅\n\n" + String(transcription).slice(0, 12000);
  }

  return "وصل الملف.";
}

async function summarizeIfPossible(text) {
  if (!openai) return "تم استخراج النص ✅\n\n" + text.slice(0, 12000);

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
    input: "لخص النص التالي بالعربية في نقاط عملية قصيرة، مع الحفاظ على الأرقام والأسماء وعدم اختراع معلومات.\n\n" + text.slice(0, 50000),
    max_output_tokens: 1400
  });

  return "تمت معالجة الملف ✅\n\n" + (response.output_text?.trim() || text.slice(0, 12000));
}

async function downloadMedia(mediaId) {
  const token = process.env.WHATSAPP_TOKEN;
  if (!token) throw new Error("WHATSAPP_TOKEN missing");

  const meta = await fetch(
    "https://graph.facebook.com/" + GRAPH + "/" + encodeURIComponent(mediaId),
    { headers: { Authorization: "Bearer " + token } }
  );
  const metaBody = await meta.json().catch(() => ({}));
  if (!meta.ok || !metaBody.url) throw new Error("Media metadata failed " + meta.status);

  const r = await fetch(metaBody.url, {
    headers: { Authorization: "Bearer " + token }
  });
  if (!r.ok) throw new Error("Media download failed " + r.status);

  const max = Number(process.env.MAX_DOWNLOAD_MB || 25) * 1024 * 1024;
  const contentLength = Number(r.headers.get("content-length") || 0);
  if (contentLength > max) throw new Error("Media too large");

  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > max) throw new Error("Media too large");
  return buf;
}
