(function () {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  /** Brand lines that replace the RealTek Developers wordmark. */
  const PROJECT_BRANDS = {
    "1": {
      main: "La Monte",
      sub: "Vista",
      href: "project.html?id=1",
      activeMatch: (href) => /project\.html\?id=1(?:$|&)/.test(href)
    },
    "8": {
      main: "Madina",
      sub: "Homes",
      href: "project.html?id=8",
      activeMatch: (href) => /project\.html\?id=8(?:$|&)/.test(href)
    }
  };

  const MADINA_HEIGHTS_IDS = new Set(["2", "3", "4", "5", "6", "7", "upcoming"]);

  function applyProjectBranding(id) {
    const key = String(id);
    let brand = PROJECT_BRANDS[key] || null;

    if (!brand && MADINA_HEIGHTS_IDS.has(key)) {
      brand = {
        main: "Madina",
        sub: "Heights",
        href: "projects.html?series=madina-heights",
        activeMatch: (href) => href.includes("series=madina-heights")
      };
    }

    if (!brand) return;

    const wordmark = document.querySelector(".site-header .wordmark");
    if (wordmark) {
      const main = wordmark.querySelector(".wordmark-main");
      const sub = wordmark.querySelector(".wordmark-sub");
      if (main) main.textContent = brand.main;
      if (sub) sub.textContent = brand.sub;
      wordmark.setAttribute("aria-label", brand.main + " " + brand.sub);
      wordmark.setAttribute("href", brand.href);
    }

    document.querySelectorAll(".nav-link").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const isBrand = brand.activeMatch(href);
      const isProjectsAll =
        /projects\.html\/?$/.test(href.split("?")[0]) && !href.includes("series=");
      link.classList.toggle("is-active", isBrand);
      if (isProjectsAll) link.classList.remove("is-active");
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
  if (document.readyState !== "loading") boot();

  function boot() {
    if (boot.ran) return;
    boot.ran = true;
    if (!window.RT || !RT.getProject) return;
    const params = new URLSearchParams(window.location.search);
    const id =
      params.get("id") ||
      (document.body && document.body.getAttribute("data-seo-project")) ||
      "1";
    const project = RT.getProject(id);

    if (!project) {
      setText("p-title", "Project not found");
      setText("p-location", "The requested project could not be located.");
      const missingActions = document.getElementById("p-hero-actions");
      if (missingActions) missingActions.hidden = true;
      return;
    }

    document.title = project.name + " | RealTek Developers";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute(
        "content",
        project.name +
          " in " +
          project.location +
          " — " +
          project.status +
          ". RealTek Developers, Lahore."
      );
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", project.name + " | RealTek Developers");
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", project.overview || "");
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) {
      try {
        ogImg.setAttribute("content", new URL(project.image, window.location.origin).href);
      } catch (err) {
        ogImg.setAttribute("content", project.image);
      }
    }

    applyProjectBranding(id);

    const heroImg = document.getElementById("p-hero-img");
    const heroVideo = document.getElementById("p-hero-video");
    const heroSection = document.getElementById("p-hero");
    if (heroImg) {
      heroImg.src = project.image;
      heroImg.alt = project.name + ", " + project.location;
    }
    if (heroVideo && heroSection) {
      const heroClip =
        (Array.isArray(project.videos) && project.videos[0]) ||
        (String(project.id) === "upcoming"
          ? {
              src: "images/madina-mall/videos/drone.mp4",
              poster: "images/madina-mall/videos/drone-poster.jpg"
            }
          : null);

      if (heroClip && heroClip.src) {
        const poster = heroClip.poster || project.image;
        const src = heroClip.src;
        heroVideo.poster = poster;
        heroVideo.innerHTML =
          '<source src="' + src + '" type="video/mp4">';
        heroVideo.hidden = false;
        heroVideo.setAttribute("autoplay", "");
        heroSection.classList.add("has-video");
        if (heroImg) {
          heroImg.src = poster;
          heroImg.classList.add("is-video-fallback");
        }
        const play = () => {
          const p = heroVideo.play();
          if (p && typeof p.catch === "function") p.catch(function () {});
        };
        if (heroVideo.readyState >= 2) play();
        else heroVideo.addEventListener("loadeddata", play, { once: true });
      } else {
        heroVideo.hidden = true;
        heroVideo.removeAttribute("autoplay");
        heroVideo.removeAttribute("src");
        heroVideo.innerHTML = "";
        heroSection.classList.remove("has-video");
        if (heroImg) heroImg.classList.remove("is-video-fallback");
      }
    }

    setText("p-status", project.status);
    const statusEl = document.getElementById("p-status");
    if (statusEl) {
      statusEl.classList.remove("badge-soon", "badge-reserved", "badge-available");
      const s = String(project.status || "");
      if (/live/i.test(s)) statusEl.classList.add("badge-soon");
      else if (/coming/i.test(s)) statusEl.classList.add("badge-soon");
      else if (/80%|reserv/i.test(s)) statusEl.classList.add("badge-reserved");
    }
    setText("p-title", project.name);
    setText("p-location", project.address || project.location);
    setText("p-crumb", project.name);
    const heroActions = document.getElementById("p-hero-actions");
    if (heroActions) {
      heroActions.hidden = !(project.virtualTours && project.virtualTours.length);
    }

    const waMessage =
      "Hi, I'm interested in " +
      project.name +
      " (" +
      project.status +
      "). Please share availability and the schedule.";
    const wa = RT.whatsappHref ? RT.whatsappHref(waMessage) : "https://wa.me/923124455477";
    const waLink = document.getElementById("p-wa");
    if (waLink) waLink.href = wa;
    const floatWa = document.getElementById("p-float-wa");
    if (floatWa) floatWa.href = wa;

    const extra = document.getElementById("p-extra");
    const useDossier = extra && RT.mountDossier;

    const factsHost = document.getElementById("p-facts");
    if (factsHost) {
      const facts = [];
      facts.push({ label: "Location", value: project.location });
      if (project.type) facts.push({ label: "Project Type", value: project.type });
      if (project.area) facts.push({ label: "Area", value: project.area });
      if (project.floors) facts.push({ label: "Floors", value: project.floors });
      if (project.completion) facts.push({ label: "Completion", value: project.completion });
      if (facts.length < 3) {
        facts.push({ label: "Status", value: project.status });
        if (project.address) facts.push({ label: "Address", value: project.address });
      }
      factsHost.innerHTML = facts
        .map(
          (f) =>
            '<div class="key-fact"><strong>' +
            escapeHtml(f.value) +
            "</strong><span>" +
            escapeHtml(f.label) +
            "</span></div>"
        )
        .join("");
    }

    const overview = document.getElementById("p-overview");
    if (overview) {
      overview.innerHTML =
        "<p>" +
        escapeHtml(project.overview || "Full project details coming soon.") +
        "</p>";
    }

    const factList = document.getElementById("p-fact-list");
    if (factList && !useDossier && project.facts && project.facts.length) {
      factList.innerHTML = project.facts
        .map(
          (f) =>
            '<li><span class="k">' +
            escapeHtml(f.label) +
            '</span><span>' +
            escapeHtml(f.value) +
            "</span></li>"
        )
        .join("");
    }

    const galleryTrack = document.getElementById("p-gallery-track");
    if (galleryTrack && !useDossier && project.gallery) {
      galleryTrack.innerHTML = project.gallery
        .map(
          (img, i) =>
            '<img src="' +
            img.src +
            '" alt="' +
            escapeHtml(img.alt) +
            '"' +
            (i === 0 ? "" : ' loading="lazy"') +
            ">"
        )
        .join("");
      if (window.RT.initGallery) RT.initGallery(document.querySelector(".gallery"));
    }

    if (useDossier) {
      RT.mountDossier(project, extra);
    }

    renderNext(project);
    renderRelated(project);
  }

  function cardHtml(p, featured) {
    const href = RT.projectHref ? RT.projectHref(p.id) : "project.html?id=" + p.id;
    const live =
      /live/i.test(p.status) || p.filter === "upcoming"
        ? ' is-live"><i></i>'
        : '">';
    return (
      '<a class="folio-card' +
      (featured ? " is-featured" : "") +
      '" href="' +
      href +
      '"><div class="folio-card-media"><img src="' +
      escapeHtml(p.image) +
      '" alt="' +
      escapeHtml(p.name) +
      '" loading="lazy"><span class="folio-badge' +
      live +
      escapeHtml(p.status) +
      '</span></div><div class="folio-card-body"><div class="folio-card-top"><h2>' +
      escapeHtml(p.name) +
      '</h2><p class="folio-card-meta">' +
      escapeHtml((p.type ? p.type + " · " : "") + (p.location || "")) +
      "</p></div><p>" +
      escapeHtml((p.overview || "").split(". ")[0] + ".") +
      '</p><span class="folio-card-cta">See project <span aria-hidden="true">→</span></span></div></a>'
    );
  }

  function renderNext(project) {
    const host = document.getElementById("p-next");
    if (!host || !RT.PROJECTS) return;
    if (project.filter === "upcoming") {
      host.hidden = true;
      host.innerHTML = "";
      return;
    }
    const next = RT.getProject("upcoming");
    if (!next) {
      host.hidden = true;
      return;
    }
    host.hidden = false;
    const sold = project.filter === "sold";
    host.innerHTML =
      "<h2>" +
      (sold ? "This one’s sold. The next one is open." : "The next one is booking now.") +
      "</h2><p>" +
      escapeHtml(next.overview.split(". ")[0] + ".") +
      '</p><a class="btn btn-light" href="' +
      (RT.projectHref ? RT.projectHref(next.id) : "project.html?id=upcoming") +
      '">See Madina Mall &amp; Residency</a>';
  }

  function renderRelated(project) {
    const reactRoot = document.getElementById("related-glass-root");
    if (reactRoot) {
      reactRoot.hidden = false;
      const grid = document.getElementById("p-related-grid");
      if (grid) {
        grid.hidden = true;
        grid.innerHTML = "";
      }
      return;
    }
    const grid = document.getElementById("p-related-grid");
    if (!grid || !RT.PROJECTS) return;
    const others = RT.PROJECTS.filter((p) => p.id !== project.id).sort((a, b) => {
      const rank = (p) => (p.filter === "upcoming" ? 0 : p.filter === "available" ? 1 : 2);
      return rank(a) - rank(b);
    });
    grid.innerHTML = others.slice(0, 4).map((p) => cardHtml(p, false)).join("");
  }

  function renderUpcoming(project) {
    const groups = project.amenityGroups || [];
    const tabs = groups
      .map(
        (g, i) =>
          '<button class="tab' +
          (i === 0 ? " is-active" : "") +
          '" type="button" data-tab="' +
          g.id +
          '">' +
          escapeHtml(g.label) +
          "</button>"
      )
      .join("");
    const panels = groups
      .map(
        (g, i) =>
          '<div class="tab-panel' +
          (i === 0 ? " is-active" : "") +
          '" data-panel="' +
          g.id +
          '"><ul class="amenity-list">' +
          g.items.map((item) => "<li>" + escapeHtml(item) + "</li>").join("") +
          "</ul></div>"
      )
      .join("");

    const floors = (project.floorProgram || [])
      .map(
        (f) =>
          '<div class="floor-item"><h3>' +
          escapeHtml(f.name) +
          "</h3><p>" +
          escapeHtml(f.use) +
          "</p></div>"
      )
      .join("");

    const plans = (project.paymentPlans || [])
      .map((plan) => {
        const rows = plan.rows
          .map((r) => {
            const cells =
              r.length > 2 && !/%/.test(String(r[1]))
                ? [r[0]].concat(r.slice(2))
                : r;
            return (
              "<tr>" +
              cells.map((c) => "<td>" + escapeHtml(c) + "</td>").join("") +
              "</tr>"
            );
          })
          .join("");
        return (
          '<div class="plan-block"><p class="eyebrow">' +
          escapeHtml(plan.note) +
          "</p><h3 class=\"display\" style=\"font-size: var(--fs-h3)\">" +
          escapeHtml(plan.title) +
          '</h3><div class="table-wrap"><table><thead><tr>' +
          "<th>Property Type</th><th>Booking</th><th>Confirmation</th>" +
          "<th>Instalment / Month</th><th>Half Yearly</th><th>Possession</th>" +
          "</tr></thead><tbody>" +
          rows +
          "</tbody></table></div></div>"
        );
      })
      .join("");

    const notes = (project.paymentNotes || [])
      .map((n) => "<li>" + escapeHtml(n) + "</li>")
      .join("");

    const planImgs = (project.floorPlanImages || [])
      .map(
        (img) =>
          '<button type="button" class="plan-thumb" data-lightbox data-lightbox-group="plans" data-src="' +
          escapeHtml(img.src) +
          '" data-alt="' +
          escapeHtml(img.alt) +
          '">' +
          '<img src="' +
          img.src +
          '" alt="' +
          escapeHtml(img.alt) +
          '" loading="lazy">' +
          '<span class="plan-thumb-hint">Click to enlarge</span>' +
          "</button>"
      )
      .join("");

    return (
      '<section class="wrap" style="padding-bottom: var(--section)" data-tabs>' +
      '<p class="eyebrow">Amenities</p>' +
      '<h2 class="display" style="font-size: var(--fs-h2); margin-bottom: 0.5rem">World-class amenities</h2>' +
      '<p style="color: var(--muted); max-width: 48ch">Designed to provide unparalleled convenience and luxury, Madina Mall & Residency features a comprehensive list of amenities.</p>' +
      '<div class="tabs">' +
      tabs +
      "</div>" +
      panels +
      '<div class="floor-program">' +
      floors +
      "</div>" +
      '<div class="plans">' +
      plans +
      '<ul class="plan-notes">' +
      notes +
      "</ul>" +
      '<div class="plan-gallery">' +
      planImgs +
      "</div></div></section>"
    );
  }
})();
