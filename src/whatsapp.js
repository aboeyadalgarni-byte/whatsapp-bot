import { processUserMessage } from "./router.js";

const GRAPH = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";

export function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

export async function handleWebhook(body) {
  for (const entry of body?.entry || []) {
    for (const change of entry.changes || []) {
      for (const message of change.value?.messages || []) {
        if (!message.from) continue;
        try {
          const reply = await processUserMessage(message);
          if (reply) await sendText(message.from, reply);
        } catch (err) {
          console.error("[message]", err);
          await sendText(message.from, "تعذر تنفيذ الطلب الآن. جرّب مرة ثانية بعد قليل.");
        }
      }
    }
  }
}

export async function sendText(to, text) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;
  if (!phoneId || !token) throw new Error("WhatsApp credentials are missing");

  const url = `https://graph.facebook.com/${GRAPH}/${phoneId}/messages`;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body: text.slice(0, 4096) }
    })
  });
  if (!r.ok) throw new Error(`WhatsApp send failed ${r.status}: ${await r.text()}`);
}
