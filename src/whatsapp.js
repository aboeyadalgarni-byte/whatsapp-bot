import { processUserMessage } from "./router.js";

const GRAPH = process.env.WHATSAPP_GRAPH_VERSION || "v26.0";

export function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token && token === process.env.META_VERIFY_TOKEN && challenge) {
    return res.status(200).type("text/plain").send(challenge);
  }
  return res.sendStatus(403);
}

export async function handleWebhook(body) {
  for (const entry of body?.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      for (const message of value.messages || []) {
        if (!message.from) continue;
        try {
          const reply = await processUserMessage(message);
          if (reply) await sendText(message.from, reply);
        } catch (err) {
          console.error("[message]", err);
          try {
            await sendText(message.from, "تعذر تنفيذ الطلب الآن. جرّب مرة ثانية بعد قليل.");
          } catch (sendErr) {
            console.error("[message fallback]", sendErr);
          }
        }
      }
    }
  }
}

export async function sendText(to, text) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;

  if (!phoneId || !token) throw new Error("WhatsApp credentials are missing");

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: false, body: String(text).slice(0, 4096) }
  };

  const r = await fetch(
    "https://graph.facebook.com/" + GRAPH + "/" + encodeURIComponent(phoneId) + "/messages",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  const result = await r.json().catch(() => ({}));
  if (!r.ok) {
    const detail = result?.error?.message || JSON.stringify(result);
    throw new Error("WhatsApp send failed (" + r.status + "): " + detail);
  }
  return result;
}
