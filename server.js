const express = require("express");

const app = express();

app.use(express.urlencoded({ extended: false }));

app.post("/whatsapp", (req, res) => {
  const msg = req.body.Body?.toLowerCase() || "";

  let reply = "ارسل: كامري أو ايفون 🚗📱";

  if (msg.includes("كامري")) {
    reply = "🚗 أرخص كامري: 41500 ريال";
  }

  if (msg.includes("ايفون")) {
    reply = "📱 أرخص آيفون: 1700 ريال";
  }

  res.send(`
<Response>
<Message>${reply}</Message>
</Response>
`);
});

app.get("/", (req, res) => {
  res.send("WhatsApp Bot Running 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
