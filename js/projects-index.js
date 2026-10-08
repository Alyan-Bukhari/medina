/**
 * Projects index — filter pills, Madina Heights series view.
 */
(function () {
  const SERIES = {
    "madina-heights": {
      brandMain: "Madina",
      brandSub: "Heights",
      title: "Madina Heights | RealTek Developers",
      eyebrow: "Madina Heights — The collection",
      headingHtml: "Every Madina Heights development in one <em>place.</em>",
      lead:
        "Madina Heights buildings across Lahore — status, location, and the full project page. La Monte Vista and Madina Homes are listed under all projects.",
      match: (card) => card.getAttribute("data-series") === "madina"
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-folio]");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const seriesKey =
      params.get("series") ||
      (document.body && document.body.getAttribute("data-seo-series")) ||
      "";
    const series = SERIES[seriesKey] || null;

    const buttons = root.querySelectorAll("[data-filter]");
    const cards = Array.from(root.querySelectorAll("[data-kind]"));
    const empty = root.querySelector("[data-folio-empty]");
    const pool = series ? cards.filter(series.match) : cards;

    const reactSeries = Boolean(series && document.getElementById("heights-series-root"));

    if (series) {
      document.body.classList.add("is-folio-series", "is-series-" + seriesKey);
      applySeriesBranding(series, seriesKey);
      if (!reactSeries) sortSeriesCards(root, pool);
      if (window.RT && typeof RT.applySeo === "function") {
        RT.applySeo(
          {
            title: series.title,
            description: series.lead,
            image: "images/madina-mall/videos/drone-poster.jpg"
          },
          window.location.origin + "/madina-heights.html"
        );
      }
      cards.forEach((card) => {
        if (!series.match(card)) card.classList.add("is-hidden");
        card.classList.remove("is-featured");
      });
      updateFilterCounts(buttons, pool);
      if (reactSeries) {
        const reactRoot = document.getElementById("heights-series-root");
        if (reactRoot) reactRoot.hidden = false;
        const grid = root.querySelector(".folio-grid");
        if (grid) grid.classList.add("is-hidden");
        if (empty) empty.hidden = true;
      }
    }

    const apply = (kind) => {
      if (reactSeries) return;
      let shown = 0;
      pool.forEach((card) => {
        const match = kind === "all" || card.getAttribute("data-kind") === kind;
        card.classList.toggle("is-hidden", !match);
        if (match) shown += 1;
      });
      if (empty) empty.hidden = shown > 0;
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (reactSeries) return;
        const kind = btn.getAttribute("data-filter") || "all";
        buttons.forEach((other) => {
          const on = other === btn;
          other.classList.toggle("is-active", on);
          other.setAttribute("aria-pressed", on ? "true" : "false");
        });
        apply(kind);
      });
    });

    if (series && !reactSeries) apply("all");
  });

  function sortSeriesCards(root, pool) {
    const grid = root.querySelector(".folio-grid");
    if (!grid) return;
    // Highest series-order first so MMR is on top; Heights 1 lands at the bottom
    const ordered = pool.slice().sort((a, b) => {
      const ao = Number(a.getAttribute("data-series-order") || 0);
      const bo = Number(b.getAttribute("data-series-order") || 0);
      return bo - ao;
    });
    ordered.forEach((card) => grid.appendChild(card));
  }

  function applySeriesBranding(series, seriesKey) {
    document.title = series.title;

    const wordmark = document.querySelector(".site-header .wordmark");
    if (wordmark) {
      const main = wordmark.querySelector(".wordmark-main");
      const sub = wordmark.querySelector(".wordmark-sub");
      if (main) main.textContent = series.brandMain;
      if (sub) sub.textContent = series.brandSub;
      wordmark.setAttribute("aria-label", series.brandMain + " " + series.brandSub);
      wordmark.setAttribute("href", "projects.html?series=" + encodeURIComponent(seriesKey));
    }

    document.querySelectorAll(".nav-link").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const isSeries =
        href.includes("series=" + seriesKey) ||
        href.endsWith("?series=" + seriesKey);
      const isProjectsAll = /projects\.html\/?$/.test(href.split("?")[0]) && !href.includes("series=");
      link.classList.toggle("is-active", isSeries);
      if (isProjectsAll) link.classList.remove("is-active");
    });

    const eyebrow = document.querySelector(".folio-intro .eyebrow");
    if (eyebrow) eyebrow.textContent = series.eyebrow;

    const heading = document.querySelector(".folio-intro h1");
    if (heading) heading.innerHTML = series.headingHtml;

    const lead = document.querySelector(".folio-intro .folio-lead");
    if (lead) lead.textContent = series.lead;
  }

  function updateFilterCounts(buttons, pool) {
    const counts = { all: pool.length, upcoming: 0, available: 0, sold: 0 };
    pool.forEach((card) => {
      const kind = card.getAttribute("data-kind");
      if (kind && counts[kind] != null) counts[kind] += 1;
    });
    buttons.forEach((btn) => {
      const kind = btn.getAttribute("data-filter") || "all";
      const span = btn.querySelector("span");
      if (span && counts[kind] != null) span.textContent = String(counts[kind]);
      if (kind !== "all" && counts[kind] === 0) btn.hidden = true;
    });
  }
})();
