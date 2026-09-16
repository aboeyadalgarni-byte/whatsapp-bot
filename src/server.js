import "dotenv/config";
import express from "express";
import { handleWebhook, verifyWebhook } from "./whatsapp.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "sawha", time: new Date().toISOString() });
});

app.get("/webhook", verifyWebhook);
app.post("/webhook", (req, res) => {
  res.sendStatus(200);
  handleWebhook(req.body).catch((err) => console.error("[webhook]", err));
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`سوّها running on :${port}`));
