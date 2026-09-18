import "dotenv/config";
import express from "express";
import { handleWebhook, verifyWebhook } from "./whatsapp.js";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));

const PORT = Number(process.env.PORT || 8080);
const GRAPH = process.env.WHATSAPP_GRAPH_VERSION || "v26.0";

function envState() {
  return {
    verify_token: Boolean(process.env.META_VERIFY_TOKEN),
    whatsapp_token: Boolean(process.env.WHATSAPP_TOKEN),
    phone_number_id: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
    openai_key: Boolean(process.env.OPENAI_API_KEY)
  };
}

app.get("/", (_req, res) => {
  res.type("html").send(
    '<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>سوّها</title><style>body{font-family:system-ui;background:#111;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0}.card{max-width:620px;padding:32px;border:1px solid #333;border-radius:20px;background:#191919}code{color:#7dffad}</style>' +
    '<div class="card"><h1>سوّها</h1><p>WhatsApp URL Action Engine</p><p>الخدمة تعمل. نقطة Webhook: <code>/webhook</code></p></div>'
  );
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "sawha",
    version: "clean-cloud-api-1",
    time: new Date().toISOString(),
    graph_version: GRAPH,
    config: envState()
  });
});

app.get("/status", async (_req, res) => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    return res.status(503).json({ ok: false, error: "WhatsApp credentials are not configured." });
  }

  try {
    const r = await fetch(
      "https://graph.facebook.com/" + GRAPH + "/" + encodeURIComponent(phoneId) +
      "?fields=id,display_phone_number,verified_name,quality_rating",
      { headers: { Authorization: "Bearer " + token } }
    );
    const body = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ ok: false, meta_status: r.status, error: body?.error || body });
    res.json({ ok: true, whatsapp: body });
  } catch {
    res.status(502).json({ ok: false, error: "Meta Graph request failed." });
  }
});

app.get("/webhook", verifyWebhook);
app.post("/webhook", (req, res) => {
  res.sendStatus(200);
  handleWebhook(req.body).catch((err) => console.error("[webhook]", err));
});

app.listen(PORT, () => console.log("سوّها running on :" + PORT));
