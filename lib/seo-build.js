/**
 * Build-time SEO — canonical URLs, social tags, sitemap, robots.
 * Primary domain: www.madinadeveloper.com
 */

export const SITE = (process.env.SITE_URL || "https://www.madinadeveloper.com").replace(/\/$/, "");

export const DOMAINS = {
  main: "www.madinadeveloper.com",
  heights: "madinaheights.com",
  mall: "madinamallandresidency.com"
};

export const STATIC_PAGES = [
{"file": "contact-us.html", "path": "/contact-us/", "title": "Contact Us | Madina Developer", "description": "Contact Madina Developer for property enquiries, site visits, availability and payment plans in Lahore.", "image": "images/hero-1920.jpg", "type": "website"},
{"file": "blogs.html", "path": "/blogs/", "title": "Insights & Property Guides | Madina Developer", "description": "Explore practical property guides from Madina Developer, including site visits, payment plans and project comparisons.", "image": "images/hero-1920.jpg", "type": "website"},
{"file": "virtual-tour.html", "path": "/virtual-tour/", "title": "Take a Virtual Tour | Madina Developer", "description": "Explore Madina Developer properties with interactive virtual tours.", "image": "images/hero-1920.jpg", "type": "website"},
{"file": "3d-models.html", "path": "/3d-models/", "title": "View 3D Models | Madina Developer", "description": "View interactive 3D models of Madina Developer projects.", "image": "images/hero-1920.jpg", "type": "website"},

  {
    file: "index.html",
    path: "/",
    title: "Madina Developer | Official Website | Property Developer in Lahore",
    description:
      "Explore Madina Developer’s residential and commercial projects in Lahore, including Madina Heights and Madina Mall & Residency. Contact our team for property enquiries.",
    image: "images/hero-1920.jpg",
    type: "website"
  },
  {
    file: "ceo.html",
    path: "/about-us/",
    title: "Hamza Ilyas Sheikh | CEO, Madina Developer",
    description:
      "Hamza Ilyas Sheikh, CEO of Madina Developer — 13+ years in Pakistani real estate, eight delivered projects, and a 100% Riba-free, customer-centric practice.",
    image: "images/ceo.jpg",
    type: "profile"
  },
  {
    file: "projects.html",
    path: "/projects/",
    title: "Projects | Madina Developer",
    description:
      "Every Madina development in one place — delivered buildings, available units, and Madina Mall & Residency. Status, locations, and project pages across Lahore.",
    image: "images/madina-mall-featured.jpg",
    type: "website"
  },
  {
    file: "project.html",
    path: "/project.html",
    title: "Project | Madina Developer",
    description:
      "Explore a Madina Developer project in Lahore — location, status, and booking details for a Sharia-compliant investment.",
    image: "images/madina-mall-featured.jpg",
    type: "website"
  }
];

export const SERIES_PAGES = [
  {
    file: "madina-heights.html",
    source: "projects.html",
    path: "/projects/madina-heights/",
    title: "Madina Heights | Real Estate in Lahore",
    description:
      "Madina Heights by Madina Developer — commercial and residential towers across Bahria Town and Lahore. View every phase, location, and booking status.",
    image: "images/madina-heights-4/elevation/elevation-01.jpg",
    series: "madina-heights",
    domain: DOMAINS.heights
  },
  {
    file: "madina-mall-and-residency.html",
    source: "project.html",
    path: "/projects/madina-mall-residency/",
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
    `  <meta name="author" content="Madina Developer">\n` +
    `  <meta property="og:site_name" content="Madina Developer">\n` +
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
  const organizationId = absUrl('/#organization');
  const websiteId = absUrl('/#website');
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RealEstateAgent', '@id': organizationId,
        name: 'Madina Developer', alternateName: ['Madina Developers', 'Madinadeveloper'],
        url: absUrl('/'), image: absImage('images/hero-1920.jpg'),
        telephone: '+923124455477', email: 'madinaheightspvtlimited@gmail.com',
        address: { '@type': 'PostalAddress', addressLocality: 'Lahore', addressRegion: 'Punjab', addressCountry: 'PK' },
        areaServed: { '@type': 'City', name: 'Lahore' },
        contactPoint: { '@type': 'ContactPoint', telephone: '+923124455477', email: 'madinaheightspvtlimited@gmail.com', contactType: 'sales', areaServed: 'PK' }
      },
      {
        '@type': 'WebSite', '@id': websiteId, url: absUrl('/'),
        name: 'Madina Developer', alternateName: ['Madinadeveloper', 'Madina Developers'],
        publisher: { '@id': organizationId }, inLanguage: 'en-PK'
      },
      {
        '@type': 'WebPage', '@id': absUrl('/#webpage'), url: absUrl('/'),
        name: 'Madina Developer | Official Website | Property Developer in Lahore',
        isPartOf: { '@id': websiteId }, about: { '@id': organizationId }, inLanguage: 'en-PK'
      }
    ]
  });
}

export function projectJsonLd(project) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: project.name,
    description: project.overview,
    url: absUrl(projectPath(project.id)),
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
    // Replace stale source/template data rather than silently skipping the current schema.
    out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '');
    out = out.replace('</head>', `<script type="application/ld+json">${extraJsonLd}</script>\n</head>`);
  }
  if (page.path !== '/' && page.path !== '/project.html') {
    out = out.replace(/<script data-seo-breadcrumbs[^>]*>[\s\S]*?<\/script>/g, '');
    const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Home', item: absUrl('/') }];
    if (page.path.startsWith('/projects/') && page.path !== '/projects/') {
      crumbs.push({ '@type': 'ListItem', position: 2, name: 'Projects', item: absUrl('/projects/') });
    }
    crumbs.push({ '@type': 'ListItem', position: crumbs.length + 1, name: page.title.split(' | ')[0], item: absUrl(page.path) });
    out = out.replace('</head>', `<script data-seo-breadcrumbs type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs })}</script>\n</head>`);
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
  const body = [...new Map(urls.map(u => [u.loc, u])).values()]
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

export const PROJECT_SLUGS = {"1": "la-monte-vista", "2": "madina-heights-1", "3": "madina-heights-2", "4": "madina-heights-3", "5": "madina-heights-4", "6": "madina-heights-5", "7": "madina-silver-heights", "8": "madina-homes", "upcoming": "madina-mall-residency"};
export const projectPath = id => "/projects/" + PROJECT_SLUGS[id] + "/";
