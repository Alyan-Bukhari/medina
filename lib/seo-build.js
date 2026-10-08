/**
 * Build-time SEO — canonical URLs, social tags, sitemap, robots.
 * Primary domain: realtekdevelopers.com
 */

export const SITE = (process.env.SITE_URL || "https://realtekdevelopers.com").replace(/\/$/, "");

export const DOMAINS = {
  main: "realtekdevelopers.com",
  heights: "madinaheights.com",
  mall: "madinamallandresidency.com"
};

export const STATIC_PAGES = [
  {
    file: "index.html",
    path: "/",
    title: "RealTek Developers | Elevating Real Estate in Pakistan",
    description:
      "RealTek Developers — Sharia-compliant residential and commercial projects in Lahore. Madina Heights, Madina Mall & Residency, and eight delivered developments across Bahria Town.",
    image: "images/hero-1920.jpg",
    type: "website"
  },
  {
    file: "ceo.html",
    path: "/ceo.html",
    title: "Hamza Ilyas Sheikh | CEO, RealTek Developers",
    description:
      "Hamza Ilyas Sheikh, CEO of RealTek Developers — 13+ years in Pakistani real estate, eight delivered projects, and a 100% Riba-free, customer-centric practice.",
    image: "images/ceo.jpg",
    type: "profile"
  },
  {
    file: "projects.html",
    path: "/projects.html",
    title: "Projects | RealTek Developers",
    description:
      "Every RealTek development in one place — delivered buildings, available units, and Madina Mall & Residency. Status, locations, and project pages across Lahore.",
    image: "images/madina-mall-featured.jpg",
    type: "website"
  },
  {
    file: "project.html",
    path: "/project.html",
    title: "Project | RealTek Developers",
    description:
      "Explore a RealTek Developers project in Lahore — location, status, and booking details for a Sharia-compliant investment.",
    image: "images/madina-mall-featured.jpg",
    type: "website"
  }
];

export const SERIES_PAGES = [
  {
    file: "madina-heights.html",
    source: "projects.html",
    path: "/madina-heights.html",
    title: "Madina Heights | Real Estate in Lahore",
    description:
      "Madina Heights by RealTek Developers — commercial and residential towers across Bahria Town and Lahore. View every phase, location, and booking status.",
    image: "images/madina-heights-4/elevation/elevation-01.jpg",
    series: "madina-heights",
    domain: DOMAINS.heights
  },
  {
    file: "madina-mall-and-residency.html",
    source: "project.html",
    path: "/madina-mall-and-residency.html",
    projectId: "upcoming",
    title: "Madina Mall & Residency | Bahria Town Lahore",
    description:
      "Madina Mall & Residency — mixed-use mall and residences in Bahria Town Lahore. Studio to three-bed homes, premium retail, 36-month Sharia-compliant plan.",
    image: "images/madina-mall-featured.jpg",
    domain: DOMAINS.mall
  }
];

export function absUrl(path) {
  return SITE + (path.startsWith("/") ? path : "/" + path);
}

export function absImage(image) {
  if (!image) return absUrl("images/hero-1920.jpg");
  if (/^https?:\/\//i.test(image)) return image;
  return absUrl(image);
}

export function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function seoHeadBlock(page) {
  const url = absUrl(page.path);
  const image = absImage(page.image);
  const canonical = page.canonical ? absUrl(page.canonical) : url;

  return (
    `<link rel="canonical" href="${esc(canonical)}">\n` +
    `  <meta name="robots" content="index, follow, max-image-preview:large">\n` +
    `  <meta name="author" content="RealTek Developers">\n` +
    `  <meta property="og:site_name" content="RealTek Developers">\n` +
    `  <meta property="og:locale" content="en_PK">\n` +
    `  <meta property="og:url" content="${esc(url)}">\n` +
    `  <meta property="og:image" content="${esc(image)}">\n` +
    `  <meta property="og:image:alt" content="${esc(page.title)}">\n` +
    `  <meta name="twitter:card" content="summary_large_image">\n` +
    `  <meta name="twitter:title" content="${esc(page.title)}">\n` +
    `  <meta name="twitter:description" content="${esc(page.description)}">\n` +
    `  <meta name="twitter:image" content="${esc(image)}">`
  );
}

export function orgJsonLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "RealTek Developers",
    url: absUrl("/"),
    logo: absImage("images/favicon.svg"),
    image: absImage("images/hero-1920.jpg"),
    telephone: "+923124455477",
    email: "info@realtek.pk",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      addressCountry: "PK"
    },
    areaServed: "Lahore, Pakistan",
    sameAs: [
      "https://www.facebook.com/realtekdevelopers",
      "https://www.instagram.com/realtekdevelopers",
      "https://www.youtube.com/@realtekdevelopers"
    ]
  });
}

export function projectJsonLd(project) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: project.name,
    description: project.overview,
    url: absUrl("/project-" + project.id + ".html"),
    image: absImage(project.image),
    address: {
      "@type": "PostalAddress",
      streetAddress: project.address || project.location,
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      addressCountry: "PK"
    }
  });
}

export function injectSeo(html, page, extraJsonLd) {
  let out = html;

  out = out.replace(/<meta property="og:image" content="[^"]*">/, "");
  if (out.includes('rel="canonical"')) {
    out = out.replace(/<link rel="canonical" href="[^"]*">\s*/g, "");
  }
  if (out.includes('name="twitter:card"')) {
    out = out.replace(/<meta name="twitter:[^"]+" content="[^"]*">\s*/g, "");
  }
  if (out.includes('property="og:url"')) {
    out = out.replace(/<meta property="og:url" content="[^"]*">\s*/g, "");
  }
  if (out.includes('property="og:site_name"')) {
    out = out.replace(/<meta property="og:site_name" content="[^"]*">\s*/g, "");
  }

  const block = seoHeadBlock(page);
  out = out.replace(
    /<meta property="og:type" content="[^"]*">/,
    `<meta property="og:type" content="${page.type || "website"}">\n  ${block}`
  );

  if (extraJsonLd) {
    const script =
      `\n  <script type="application/ld+json">${extraJsonLd}</script>`;
    if (!out.includes("application/ld+json")) {
      out = out.replace("</head>", script + "\n</head>");
    }
  }

  if (page.dataSeries) {
    out = out.replace("<body>", `<body data-seo-series="${esc(page.dataSeries)}">`);
  }
  if (page.dataProject) {
    out = out.replace("<body>", `<body data-seo-project="${esc(page.dataProject)}">`);
  }

  return out;
}

export function sitemapXml(urls) {
  const body = urls
    .map(
      (u) =>
        "  <url>\n    <loc>" +
        esc(u.loc) +
        "</loc>\n    <changefreq>" +
        (u.changefreq || "monthly") +
        "</changefreq>\n    <priority>" +
        (u.priority || "0.7") +
        "</priority>\n  </url>"
    )
    .join("\n");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    body +
    "\n</urlset>\n"
  );
}

export function robotsTxt() {
  return (
    "User-agent: *\nAllow: /\n\nSitemap: " +
    absUrl("/sitemap.xml") +
    "\n"
  );
}
