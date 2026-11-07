import { finalizeSites } from "./lib/site-build.js";
import fs from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { FALLBACK, answerChat, clientIp, readJsonBody } from "./lib/madina-chat.js";
import {
  SITE,
  projectPath,
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
    name: "madina-groq-chat",
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
      "La Monte Vista at 166-B Commercial, Bahria Town Lahore: explore the completed building, its 20 apartments, three commercial halls and project photographs.",
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
      "Madina Heights 1 on Main Canal Bank Road combines 22 apartments with two commercial halls. Explore the building location and completed project details.",
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
      "Explore Madina Heights 2 at 189 A Side Commercial, Sector C, Bahria Town. View photographs and details of its 18 apartments and six commercial halls.",
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
      "Madina Heights 3 is located at 42 Umer Block Commercial near Safari Villas. Explore this residential and commercial building and its project details.",
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
      "Explore Madina Heights 4 at plots 11–12 Umer Block Commercial: apartment layouts, shops, photographs and virtual tours. Enquire about current availability.",
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
      "Discover Madina Heights 5 in Bahria Town Lahore, with 84 apartments and 43 shops. View building photographs and contact the team for current booking details.",
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
      "Madina Silver Heights is a completed project at 166B Commercial, Bahria Town Lahore. Explore the building, its 35 apartments and project photographs.",
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
      "Explore Madina Homes in Mariam Town: a collection of 50 three-bedroom villas. View home photographs and contact the team for project and possession details.",
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
      "Explore Madina Mall & Residency in Bahria Town Lahore. View apartment layouts, retail spaces, amenities and project photographs, and enquire about payment plans.",
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
        if (page.file !== "project.html") sitemapUrls.push({
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
        const pagePath = projectPath(p.id);
        const pageUrl = absUrl(pagePath);
        let html = template;
        html = html.replace(/<title>[\s\S]*?<\/title>/, "<title>" + esc(p.name) + " | Madina Developer</title>");
        html = html.replace(
          /<meta name="description" content="[^"]*">/,
          '<meta name="description" content="' + esc(p.overview) + '">'
        );
        html = html.replace(
          /<meta property="og:title" content="[^"]*">/,
          '<meta property="og:title" content="' + esc(p.name) + ' | Madina Developer">'
        );
        html = html.replace(
          /<meta property="og:description" content="[^"]*">/,
          '<meta property="og:description" content="' + esc(p.overview) + '">'
        );
        html = injectSeo(
          html,
          {
            path: pagePath,
            title: p.name + " | Madina Developer",
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
      finalizeSites(dist);
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
"contact-us": path.resolve(__dirname, "contact-us.html"),

"virtual-tour": path.resolve(__dirname, "virtual-tour.html"),
"3d-models": path.resolve(__dirname, "3d-models.html"),

        ceo: path.resolve(__dirname, "ceo.html"),
        project: path.resolve(__dirname, "project.html"),
        projects: path.resolve(__dirname, "projects.html")
      }
    }
  }
});
