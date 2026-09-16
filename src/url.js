import * as cheerio from "cheerio";

export function isUrl(value) {
  try { new URL(value); return true; } catch { return false; }
}

export async function fetchUrlText(url) {
  if (!isUrl(url)) return { text: "" };
  const r = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "SawhaBot/1.0" }
  });
  if (!r.ok) throw new Error(`URL fetch failed ${r.status}`);
  const contentType = r.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return { text: "" };
  const html = await r.text();
  const $ = cheerio.load(html);
  $("script,style,noscript,svg").remove();
  const title = $("title").text().trim();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  return { title, text };
}
