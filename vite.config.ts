import fs from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { FALLBACK, answerChat, clientIp, readJsonBody } from "./lib/realtek-chat.js";
import {
  SITE,
  STATIC_PAGES,
  SERIES_PAGES,
  absUrl,
  absImage,
  esc,
  injectSeo,
  orgJsonLd,
  projectJsonLd,
  sitemapXml,
  robotsTxt
} from "./lib/seo-build.js";

function groqChatPlugin() {
  return {
    name: "realtek-groq-chat",
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), "");
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || "").split("?")[0];
        if (url !== "/api/chat") {
          next();
          return;
        }

        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");

        if (req.method !== "POST") {
          res.statusCode = 200;
          res.end(JSON.stringify({ reply: FALLBACK }));
          return;
        }

        try {
          const body = await readJsonBody(req);
          const { reply } = await answerChat({
            message: body.message,
            ip: clientIp(req),
            apiKey: env.GROQ_API_KEY || process.env.GROQ_API_KEY
          });
          res.statusCode = 200;
          res.end(JSON.stringify({ reply }));
        } catch {
          res.statusCode = 200;
          res.end(JSON.stringify({ reply: FALLBACK }));
        }
      });
    }
  };
}

const PROJECT_PAGES = [
  {
    id: "1",
    name: "La Monte Vista",
    status: "Sold Out",
    location: "Bahria Town, Lahore",
    type: "Commercial + Apartments",
    overview:
      "Delivered 2021 in 166-B Commercial — 20 apartments and three commercial halls, now fully sold.",
    image: "images/la-monte-vista/exterior-card.jpeg",
    address: "166-B Commercial, Bahria Town."
  },
  {
    id: "2",
    name: "Madina Heights 1",
    status: "Sold Out",
    location: "Canal Bank Road",
    type: "Commercial + Apartments",
    overview:
      "Main Canal Bank Road — 22 apartments and two commercial halls, handed over in 2021.",
    image: "images/project-2.jpg",
    address: "Sector D, Main Canal Bank Road."
  },
  {
    id: "3",
    name: "Madina Heights 2",
    status: "Sold Out",
    location: "Sector C, Bahria Town",
    type: "Commercial + Apartments",
    overview:
      "Sector-C side commercial — 18 apartments and six halls, completed 2023.",
    image: "images/madina-heights-2/photo-06.jpeg",
    address: "189 A Side Commercial, Sector-C."
  },
  {
    id: "4",
    name: "Madina Heights 3",
    status: "Sold Out",
    location: "Safari Villas",
    type: "Commercial + Residential",
    overview:
      "Umer block, next to Safari Villas — 22 apartments and two commercial halls, sold out.",
    image: "images/project-4.jpg",
    address: "42, Umer block Commercial."
  },
  {
    id: "5",
    name: "Madina Heights 4",
    status: "80% Sold",
    location: "Safari Villas",
    type: "Commercial + Residential",
    overview:
      "Two plots at Umer block — 54 apartments and 27 shops, still booking on a 30-month plan.",
    image: "images/madina-heights-4/elevation/elevation-01.jpg",
    address: "11,12 Umer block Commercial."
  },
  {
    id: "6",
    name: "Madina Heights 5",
    status: "80% Sold",
    location: "Bahria Town, Lahore",
    type: "Commercial + Residential",
    overview:
      "Our largest Heights building — 84 apartments and 43 shops, still booking through 2026.",
    image: "images/madina-heights-5/commercial-view.jpeg",
    address: "166B Commercial, Bahria Town."
  },
  {
    id: "7",
    name: "Madina Silver Heights",
    status: "Sold Out",
    location: "Bahria Town, Lahore",
    type: "Mixed Use",
    overview:
      "Twelve-month plan, 35 apartments — handed over 2025 in 166B Commercial.",
    image: "images/project-7.jpg",
    address: "166B Commercial, Bahria Town."
  },
  {
    id: "8",
    name: "Madina Homes",
    status: "Sold Out",
    location: "Mariam Town",
    type: "Double-story villas",
    overview:
      "Fifty three-bedroom villas in a gated community — sold out, possession ongoing.",
    image: "images/madina-homes/page-1.jpg",
    address: "Mariam Town (Gated Community)."
  },
  {
    id: "upcoming",
    name: "Madina Mall & Residency",
    status: "Live",
    location: "Bahria Town, Lahore",
    type: "36 months instalment",
    overview:
      "A mixed-use mall and residences in Bahria Town — studio to three-bed, premium retail, owned on a 36-month plan.",
    image: "images/madina-mall-featured.jpg",
    address: "Bahria Town, Lahore"
  }
];

function copyStatic() {
  return {
    name: "copy-static",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      for (const dir of ["images", "css", "js"]) {
        const from = path.resolve(__dirname, dir);
        if (fs.existsSync(from)) {
          fs.cpSync(from, path.join(dist, dir), { recursive: true });
        }
      }

      const sitemapUrls = [];

      for (const page of STATIC_PAGES) {
        const filePath = path.join(dist, page.file);
        if (!fs.existsSync(filePath)) continue;
        let html = fs.readFileSync(filePath, "utf8");
        html = html.replace(/<title>[\s\S]*?<\/title>/, "<title>" + esc(page.title) + "</title>");
        html = html.replace(
          /<meta name="description" content="[^"]*">/,
          '<meta name="description" content="' + esc(page.description) + '">'
        );
        html = html.replace(
          /<meta property="og:title" content="[^"]*">/,
          '<meta property="og:title" content="' + esc(page.title) + '">'
        );
        html = html.replace(
          /<meta property="og:description" content="[^"]*">/,
          '<meta property="og:description" content="' + esc(page.description) + '">'
        );
        const jsonLd = page.file === "index.html" ? orgJsonLd() : null;
        html = injectSeo(html, page, jsonLd);
        fs.writeFileSync(filePath, html);
        sitemapUrls.push({
          loc: absUrl(page.path),
          priority: page.file === "index.html" ? "1.0" : "0.8",
          changefreq: page.file === "index.html" ? "weekly" : "monthly"
        });
      }

      for (const sp of SERIES_PAGES) {
        const srcPath = path.join(dist, sp.source);
        if (!fs.existsSync(srcPath)) continue;
        let html = fs.readFileSync(srcPath, "utf8");
        html = html.replace(/<title>[\s\S]*?<\/title>/, "<title>" + esc(sp.title) + "</title>");
        html = html.replace(
          /<meta name="description" content="[^"]*">/,
          '<meta name="description" content="' + esc(sp.description) + '">'
        );
        html = html.replace(
          /<meta property="og:title" content="[^"]*">/,
          '<meta property="og:title" content="' + esc(sp.title) + '">'
        );
        html = html.replace(
          /<meta property="og:description" content="[^"]*">/,
          '<meta property="og:description" content="' + esc(sp.description) + '">'
        );
        const pageMeta = {
          ...sp,
          type: "website",
          dataSeries: sp.series || undefined,
          dataProject: sp.projectId || undefined
        };
        html = injectSeo(html, pageMeta, null);
        fs.writeFileSync(path.join(dist, sp.file), html);
        sitemapUrls.push({
          loc: absUrl(sp.path),
          priority: "0.9",
          changefreq: "weekly"
        });
      }

      const templatePath = path.join(dist, "project.html");
      if (!fs.existsSync(templatePath)) return;
      const template = fs.readFileSync(templatePath, "utf8");

      for (const p of PROJECT_PAGES) {
        const pagePath = "/project-" + p.id + ".html";
        const pageUrl = absUrl(pagePath);
        let html = template;
        html = html.replace(/<title>[\s\S]*?<\/title>/, "<title>" + esc(p.name) + " | RealTek Developers</title>");
        html = html.replace(
          /<meta name="description" content="[^"]*">/,
          '<meta name="description" content="' + esc(p.overview) + '">'
        );
        html = html.replace(
          /<meta property="og:title" content="[^"]*">/,
          '<meta property="og:title" content="' + esc(p.name) + ' | RealTek Developers">'
        );
        html = html.replace(
          /<meta property="og:description" content="[^"]*">/,
          '<meta property="og:description" content="' + esc(p.overview) + '">'
        );
        html = injectSeo(
          html,
          {
            path: pagePath,
            title: p.name + " | RealTek Developers",
            description: p.overview,
            image: p.image,
            type: "website",
            dataProject: p.id
          },
          projectJsonLd(p)
        );
        html = html.replace(/id="p-crumb">[^<]*/, 'id="p-crumb">' + esc(p.name));
        html = html.replace(/id="p-status">[^<]*/, 'id="p-status">' + esc(p.status));
        html = html.replace(/id="p-title">[^<]*/, 'id="p-title">' + esc(p.name));
        html = html.replace(/id="p-location">[^<]*/, 'id="p-location">' + esc(p.address || p.location));
        html = html.replace(
          /<img id="p-hero-img"[^>]*>/,
          '<img id="p-hero-img" src="' + p.image + '" alt="' + esc(p.name + ", " + p.location) + '">'
        );
        html = html.replace(
          /<div id="p-overview">[\s\S]*?<\/div>/,
          '<div id="p-overview"><p>' + esc(p.overview) + "</p></div>"
        );
        html = html.replace(
          /<section class="key-facts" id="p-facts"[^>]*>[\s\S]*?<\/section>/,
          '<section class="key-facts" id="p-facts" aria-label="Project facts">' +
            '<div class="key-fact"><strong>' +
            esc(p.location) +
            "</strong><span>Location</span></div>" +
            '<div class="key-fact"><strong>' +
            esc(p.type) +
            "</strong><span>Project Type</span></div>" +
            '<div class="key-fact"><strong>' +
            esc(p.status) +
            "</strong><span>Status</span></div></section>"
        );
        fs.writeFileSync(path.join(dist, "project-" + p.id + ".html"), html);
        sitemapUrls.push({
          loc: pageUrl,
          priority: p.id === "upcoming" || p.id === "5" || p.id === "6" ? "0.9" : "0.7",
          changefreq: "monthly"
        });
      }

      fs.writeFileSync(path.join(dist, "robots.txt"), robotsTxt());
      fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemapXml(sitemapUrls));
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), copyStatic(), groqChatPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  },
  server: {
    port: 8765,
    strictPort: true
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        ceo: path.resolve(__dirname, "ceo.html"),
        project: path.resolve(__dirname, "project.html"),
        projects: path.resolve(__dirname, "projects.html")
      }
    }
  }
});
