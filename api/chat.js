import { FALLBACK, answerChat, clientIp, readJsonBody } from "../lib/realtek-chat.js";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.statusCode = 200;
    res.end(JSON.stringify({ reply: FALLBACK }));
    return;
  }

  const body = await readJsonBody(req);
  const { reply } = await answerChat({
    message: body.message,
    ip: clientIp(req),
    apiKey: process.env.GROQ_API_KEY
  });

  res.statusCode = 200;
  res.end(JSON.stringify({ reply }));
}
