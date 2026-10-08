export const FALLBACK =
  "I can only answer questions about RealTek Developers and our projects. Try asking about a specific project, our payment plans, or how to reach us — or call us directly at 0312 4455477.";

export const KNOWLEDGE = [
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "salam"],
    answer:
      "Hi! I'm the RealTek assistant. Ask me about our projects, payment plans, or how to get in touch."
  },
  {
    id: "about",
    answer:
      "RealTek Developers is a real estate development and property management company based in Lahore, Pakistan — known for Sharia-compliant, on-time delivery of residential and commercial projects."
  },
  {
    id: "project-1",
    answer:
      "La Monte Vista — Bahria Town, Lahore. Sold Out. Delivered 2021 in 166-B Commercial: 20 apartments and three commercial halls."
  },
  {
    id: "project-2",
    answer:
      "Madina Heights 1 — Canal Bank Road. Sold Out. 22 apartments and two commercial halls, handed over in 2021."
  },
  {
    id: "project-3",
    answer:
      "Madina Heights 2 — Sector C, Bahria Town. Sold Out. 18 apartments and six halls, completed 2023."
  },
  {
    id: "project-4",
    answer:
      "Madina Heights 3 — Safari Villas. Sold Out. 22 apartments and two commercial halls at Umer block."
  },
  {
    id: "project-5",
    answer:
      "Madina Heights 4 — Safari Villas. 80% Sold. 54 apartments and 27 shops, still booking on a 30-month plan."
  },
  {
    id: "project-6",
    answer:
      "Madina Heights 5 — Bahria Town, Lahore. 80% Sold. Our largest Heights building: 84 apartments and 43 shops, still booking through 2026."
  },
  {
    id: "project-7",
    answer:
      "Madina Silver Heights — Bahria Town, Lahore. Sold Out. 35 apartments, 12-month plan, handed over 2025."
  },
  {
    id: "project-8",
    answer:
      "Madina Homes — Mariam Town. Sold Out. Fifty three-bedroom villas in a gated community, possession ongoing."
  },
  {
    id: "project-upcoming",
    answer:
      "Madina Mall & Residency — Bahria Town, Lahore. Live. A mixed-use mall and residences, studio to three-bed, on a 36-month plan."
  },
  {
    id: "payment",
    answer:
      "All RealTek projects are 100% Sharia-compliant and interest-free — no bank involvement. Installment plans vary by project; contact us for current plan details on a specific one."
  },
  {
    id: "contact",
    answer:
      "Call us at 0312 4455477, email info@realtek.pk, or visit our office in Bahria Town, Lahore."
  },
  {
    id: "ceo",
    answer:
      "RealTek Developers was founded by Hamza Ilyas Sheikh in 2017. He has 13+ years in real estate and has delivered 8 projects over the last 7 years."
  }
];

export const SYSTEM_PROMPT =
  "You are the RealTek Developers website assistant. Answer only using the information provided below. If the question cannot be answered from this information, respond with exactly: 'I can only answer questions about RealTek Developers and our projects. Try asking about a specific project, our payment plans, or how to reach us — or call us directly at 0312 4455477.' Do not use outside knowledge, do not guess, do not invent project details, phone numbers, or prices that aren't listed below.\n\nKnowledge base:\n" +
  JSON.stringify(KNOWLEDGE, null, 2);

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 12;
const hits = new Map();

export function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) return forwarded[0];
  return req.socket?.remoteAddress || req.headers["x-real-ip"] || "unknown";
}

export function allowIp(ip) {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now - row.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    return true;
  }
  if (row.count >= MAX_HITS) return false;
  row.count += 1;
  return true;
}

export function cleanMessage(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, 500);
}

const MODELS = ["llama-3.1-8b-instant", "openai/gpt-oss-20b"];

export async function groqReply(message, apiKey) {
  if (!message || !apiKey) return FALLBACK;

  for (const model of MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          max_tokens: 280,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message }
          ]
        }),
        signal: controller.signal
      });

      if (res.status === 404 || res.status === 400) continue;
      if (!res.ok) return FALLBACK;
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text !== "string" || !text.trim()) return FALLBACK;
      return text.trim();
    } catch {
      return FALLBACK;
    } finally {
      clearTimeout(timer);
    }
  }

  return FALLBACK;
}

export async function answerChat({ message, ip, apiKey }) {
  const text = cleanMessage(message);
  if (!text) return { reply: FALLBACK };
  if (!allowIp(ip || "unknown")) return { reply: FALLBACK };
  const reply = await groqReply(text, apiKey);
  return { reply: reply || FALLBACK };
}

export function readJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === "object") {
      resolve(req.body);
      return;
    }
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}
