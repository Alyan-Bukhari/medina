/**
 * Runtime SEO — domain-aware canonical URLs and series/project meta.
 */
(function (global) {
  const PRIMARY = "https://realtekdevelopers.com";
  const DOMAINS = {
    "madinaheights.com": {
      canonicalRoot: "https://madinaheights.com/",
      series: "madina-heights"
    },
    "www.madinaheights.com": {
      canonicalRoot: "https://madinaheights.com/",
      series: "madina-heights"
    },
    "madinamallandresidency.com": {
      canonicalRoot: "https://madinamallandresidency.com/",
      projectPath: "/madina-mall-and-residency.html"
    },
    "www.madinamallandresidency.com": {
      canonicalRoot: "https://madinamallandresidency.com/",
      projectPath: "/madina-mall-and-residency.html"
    }
  };

  const SERIES_META = {
    "madina-heights": {
      title: "Madina Heights | Real Estate in Lahore",
      description:
        "Madina Heights by RealTek Developers — commercial and residential towers across Bahria Town and Lahore. View every phase, location, and booking status.",
      path: "/madina-heights.html",
      image: "images/madina-heights-4/elevation/elevation-01.jpg"
    }
  };

  function host() {
    return (location.hostname || "").toLowerCase();
  }

  function origin() {
    return location.origin.replace(/\/$/, "");
  }

  function abs(path) {
    return origin() + (path.startsWith("/") ? path : "/" + path);
  }

  function absPrimary(path) {
    return PRIMARY + (path.startsWith("/") ? path : "/" + path);
  }

  function setMeta(attr, key, value) {
    if (!value) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  }

  function setCanonical(href) {
    if (!href) return;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;
  }

  function applyPageMeta(meta, canonical) {
    if (meta.title) document.title = meta.title;
    setMeta("name", "description", meta.description);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", canonical);
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    if (meta.image) {
      const img = abs(meta.image);
      setMeta("property", "og:image", img);
      setMeta("name", "twitter:image", img);
    }
    setCanonical(canonical);
  }

  function boot() {
    const h = host();
    const domain = DOMAINS[h];
    const body = document.body;
    const seriesKey =
      (body && body.getAttribute("data-seo-series")) ||
      new URLSearchParams(location.search).get("series") ||
      (domain && domain.series) ||
      "";
    const projectId = body && body.getAttribute("data-seo-project");

    if (seriesKey && SERIES_META[seriesKey]) {
      const meta = SERIES_META[seriesKey];
      const onHeightsDomain = h.includes("madinaheights.com");
      const canonical = onHeightsDomain
        ? DOMAINS[h].canonicalRoot.replace(/\/$/, "") + "/"
        : absPrimary(meta.path);
      applyPageMeta(meta, canonical);
      return;
    }

    if (projectId === "upcoming" || location.pathname.includes("madina-mall-and-residency")) {
      const meta = {
        title: "Madina Mall & Residency | Bahria Town Lahore",
        description:
          "Madina Mall & Residency — mixed-use mall and residences in Bahria Town Lahore. Studio to three-bed homes, premium retail, 36-month Sharia-compliant plan.",
        image: "images/madina-mall-featured.jpg"
      };
      const onMallDomain = h.includes("madinamallandresidency.com");
      const canonical = onMallDomain
        ? DOMAINS[h].canonicalRoot.replace(/\/$/, "") + "/"
        : absPrimary("/madina-mall-and-residency.html");
      applyPageMeta(meta, canonical);
      return;
    }

    if (
      domain &&
      domain.canonicalRoot &&
      (location.pathname === "/" || location.pathname === "/index.html")
    ) {
      if (domain.series) {
        applyPageMeta(SERIES_META[domain.series], domain.canonicalRoot);
      } else if (domain.projectPath) {
        applyPageMeta(
          {
            title: "Madina Mall & Residency | Bahria Town Lahore",
            description:
              "Madina Mall & Residency — mixed-use mall and residences in Bahria Town Lahore.",
            image: "images/madina-mall-featured.jpg"
          },
          domain.canonicalRoot
        );
      }
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
  if (document.readyState !== "loading") boot();

  global.RT = global.RT || {};
  global.RT.applySeo = applyPageMeta;
})(window);
