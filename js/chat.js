(function () {
  const FALLBACK =
    "I can only answer questions about RealTek Developers and our projects. Try asking about a specific project, our payment plans, or how to reach us — or call us directly at 0312 4455477.";

  const GREETING =
    "Hi! I'm the RealTek assistant. Ask me about our projects, payment plans, or how to get in touch.";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function addBubble(log, role, text) {
    const row = document.createElement("div");
    row.className = "chat-row is-" + role;
    const bubble = document.createElement("p");
    bubble.className = "chat-bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  function typing(log) {
    const row = document.createElement("div");
    row.className = "chat-row is-assistant is-typing";
    row.setAttribute("aria-label", "Assistant is typing");
    row.innerHTML = '<p class="chat-bubble"><i></i><i></i><i></i></p>';
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  async function ask(message) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: ctrl.signal
      });
      const data = await res.json();
      if (typeof data.reply === "string" && data.reply.trim()) return data.reply.trim();
      return FALLBACK;
    } catch {
      return FALLBACK;
    } finally {
      clearTimeout(timer);
    }
  }

  function initChat() {
    const dock = $("[data-float-dock]");
    const panel = $("#chat-panel");
    const log = $("[data-chat-log]", panel);
    const form = $("[data-chat-form]", panel);
    const input = $("[data-chat-input]", panel);
    const openBtn = $("[data-chat-open]");
    const closeBtn = $("[data-chat-close]");
    const moreBtn = $("[data-float-more]");
    if (!dock || !panel || !log || !form || !input || !openBtn) return;

    let busy = false;
    let greeted = false;

    function setOpen(open) {
      panel.hidden = !open;
      openBtn.setAttribute("aria-expanded", String(open));
      dock.classList.toggle("is-chat-open", open);
      if (open) {
        dock.classList.add("is-open");
        if (moreBtn) moreBtn.setAttribute("aria-expanded", "true");
        if (!greeted) {
          addBubble(log, "assistant", GREETING);
          greeted = true;
        }
        input.focus();
      }
    }

    if (moreBtn) {
      moreBtn.addEventListener("click", () => {
        const open = dock.classList.toggle("is-open");
        moreBtn.setAttribute("aria-expanded", String(open));
        if (!open) setOpen(false);
      });
    }

    openBtn.addEventListener("click", () => setOpen(panel.hidden));
    if (closeBtn) closeBtn.addEventListener("click", () => setOpen(false));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) setOpen(false);
    });

    panel.querySelectorAll("[data-chat-chip]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const q = chip.getAttribute("data-chat-chip") || chip.textContent;
        if (q) send(q);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      send(input.value);
    });

    async function send(raw) {
      const message = String(raw || "").replace(/\s+/g, " ").trim();
      if (!message || busy) return;
      if (panel.hidden) setOpen(true);
      input.value = "";
      addBubble(log, "user", message);
      busy = true;
      input.disabled = true;
      const wait = typing(log);
      const reply = await ask(message);
      wait.remove();
      addBubble(log, "assistant", reply);
      busy = false;
      input.disabled = false;
      input.focus();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChat);
  } else {
    initChat();
  }
})();
