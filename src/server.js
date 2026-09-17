import "dotenv/config";
import express from "express";
import { handleWebhook, verifyWebhook } from "./whatsapp.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "sawha", time: new Date().toISOString() });
});

app.get("/connect", (_req, res) => {
  const appId = process.env.META_APP_ID || "416428942387460";
  const configId = process.env.META_EMBEDDED_SIGNUP_CONFIG_ID || "";
  res.type("html").send(`<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ربط سوّها بواتساب</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;background:#111;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0}.card{width:min(92vw,520px);padding:28px;border:1px solid #333;border-radius:20px;background:#191919;text-align:center}button{border:0;border-radius:12px;padding:14px 24px;background:#25d366;color:#071b0e;font-weight:800;font-size:16px}p{color:#bbb;line-height:1.8}.ok{color:#7dffad}.err{color:#ff8b8b}</style></head>
<body><main class="card"><h1>ربط سوّها بواتساب</h1><p>هذا المسار مخصص لربط رقم <b>WhatsApp Business</b> الحالي مع Cloud API مع الحفاظ على التطبيق، إذا كان الرقم مؤهلًا لـCoexistence.</p><button id="connect">ابدأ الربط</button><p id="status"></p></main>
<script>
const APP_ID=${JSON.stringify(appId)}; const CONFIG_ID=${JSON.stringify(configId)}; const status=document.getElementById('status');
window.addEventListener('message',e=>{if(!e.data||e.data.type!=='WA_EMBEDDED_SIGNUP')return;status.textContent='تمت العودة من Meta: '+JSON.stringify(e.data.data||{});status.className='ok';});
window.fbAsyncInit=function(){FB.init({appId:APP_ID,cookie:true,xfbml:false,version:'v26.0'});};
document.getElementById('connect').onclick=()=>{if(!CONFIG_ID){status.textContent='يلزم إعداد META_EMBEDDED_SIGNUP_CONFIG_ID في Render أولًا.';status.className='err';return;}FB.login(r=>{if(r.authResponse){status.textContent='تم استلام جلسة Meta. أكمل الخطوات داخل نافذة Meta.';status.className='ok';}else{status.textContent='تم إلغاء الربط.';status.className='err';}},{config_id:CONFIG_ID,response_type:'code',override_default_response_type:true,extras:{setup:{},featureType:'whatsapp_business_app_onboarding',sessionInfoVersion:'3'}});};
</script><script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script></body></html>`);
});

app.get("/webhook", verifyWebhook);
app.post("/webhook", (req, res) => {
  res.sendStatus(200);
  handleWebhook(req.body).catch((err) => console.error("[webhook]", err));
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`سوّها running on :${port}`));
