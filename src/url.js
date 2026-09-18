import * as cheerio from "cheerio";
import dns from "node:dns/promises";
import net from "node:net";

function isPrivateIp(ip) {
  if (net.isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168);
  }
  if (net.isIP(ip) === 6) {
    const normalized = ip.toLowerCase();
    return normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:");
  }
  return true;
}

async function isSafePublicUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  if (!["http:", "https:"].includes(url.protocol)) return false;
  if (url.username || url.password) return false;

  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return false;

  try {
    const addresses = await dns.lookup(host, { all: true });
    return addresses.length > 0 && addresses.every(({ address }) => !isPrivateIp(address));
  } catch {
    return false;
  }
}

export async function fetchUrlText(rawUrl) {
  if (!(await isSafePublicUrl(rawUrl))) return { text: "" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const r = await fetch(rawUrl, {
      redirect: "follow",
      headers: { "User-Agent": "SawhaBot/1.0 (+https://sawha.app)" },
      signal: controller.signal
    });

    if (!r.ok) throw new Error("URL fetch failed " + r.status);

    const contentType = r.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      return { text: "" };
    }

    const html = await r.text();
    const $ = cheerio.load(html);
    $("script,style,noscript,svg,nav,footer").remove();

    const title = $("title").text().trim();
    const text = $("body").text().replace(/\s+/g, " ").trim();
    return { title, text };
  } finally {
    clearTimeout(timer);
  }
}
