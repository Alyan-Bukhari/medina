/**
 * archive-sold-v4
 * Project dossier — Zee99-style subnav, residences, commercial, payment.
 * Price amounts are withheld site-wide; payment sections show percentages only.
 * Madina Mall, Madina Heights 4 & 5 keep payment-plan tables.
 */
(function (global) {
  const FX = { PKR: 1, GBP: 365, USD: 278, AUD: 185, EUR: 305 };
  const FX_LABEL = { PKR: "Rs", GBP: "£", USD: "$", AUD: "A$", EUR: "€" };

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function imageKey(src) {
    return String(src || "")
      .split("?")[0]
      .replace(/\\/g, "/")
      .replace(/^\.\//, "")
      .toLowerCase();
  }

  function uniqueImages(list, limit, exclude) {
    const out = [];
    const seen = Object.create(null);
    (exclude || []).forEach(function (src) {
      const key = imageKey(src);
      if (key) seen[key] = true;
    });
    (list || []).forEach(function (img) {
      if (!img || !img.src) return;
      const key = imageKey(img.src);
      if (!key || seen[key]) return;
      seen[key] = true;
      out.push(img);
    });
    if (limit && out.length > limit) return out.slice(0, limit);
    return out;
  }


  function schedule(total, months) {
    return {
      total: total,
      down: Math.round(total * 0.175),
      confirm: Math.round(total * 0.175),
      monthly: Math.round(total * 0.01),
      half: Math.round(total * 0.04),
      possession: Math.round(total * 0.05),
      months: months
    };
  }

  function unitSchedule(unit, rate, months) {
    return schedule(unit.area * rate, months);
  }

  function formatFull(pkr, code) {
    const cur = code || "PKR";
    const n = pkr / FX[cur];
    if (cur === "PKR") return Math.round(n).toLocaleString("en-PK");
    return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function formatShort(pkr, code) {
    const cur = code || "PKR";
    const prefix = FX_LABEL[cur] + " ";
    if (cur !== "PKR") return prefix + formatFull(pkr, cur);
    if (pkr >= 10000000) {
      const cr = pkr / 10000000;
      return prefix + (Number.isInteger(cr) ? cr : cr.toFixed(2)) + " Cr";
    }
    const lacs = pkr / 100000;
    return prefix + (Number.isInteger(lacs) ? lacs : lacs.toFixed(1)) + " Lacs";
  }

  function dummyDossier(project) {
    const rate = 0;
    const months = 36;
    return {
      sample: true,
      copy: project.overview,
      caption: project.name + " — " + (project.shot || "Exterior"),
      imageKind: "Photo",
      stats: [
        { label: "Status", value: project.status },
        { label: "Type", value: project.type || "—" },
        { label: "Location", value: project.location }
      ],
      rate: rate,
      months: months,
      units: (function () {
        const labels = [
          { id: "a", name: "Studio", area: 400, blurb: "Sample studio plate — confirm sizes and the written schedule at booking." },
          { id: "b", name: "1 Bed", area: 550, blurb: "Sample one-bed plate — confirm sizes and the written schedule at booking." },
          { id: "c", name: "2 Bed", area: 850, blurb: "Sample two-bed plate — confirm sizes and the written schedule at booking." }
        ];
        const pool = uniqueImages(
          (project.gallery && project.gallery.length
            ? project.gallery
            : [{ src: project.image, alt: project.name }]
          ).concat(project.image ? [{ src: project.image, alt: project.name }] : []),
          3
        );
        if (!pool.length && project.image) {
          pool.push({ src: project.image, alt: project.name });
        }
        return pool.map(function (img, i) {
          const meta = labels[i] || labels[labels.length - 1];
          const virtual = (project.virtualTours || [])[i];
          return {
            id: meta.id + String(i),
            name: meta.name,
            area: meta.area,
            blurb: meta.blurb,
            hero: img.src,
            plan: img.src,
            gallery: [img],
            tour: virtual && virtual.panoee ? { panoee: virtual.panoee } : undefined
          };
        });
      })(),
      floors: [
        {
          id: "typical",
          name: "Typical floor",
          desc: "Sample floor plate. Ask RealTek for the issued drawings for " + project.name + ".",
          units: "On request",
          sizes: "On request",
          rate: null,
          use: project.type || "Mixed use",
          image: project.image
        }
      ],
      amenityShots: uniqueImages([
        { src: project.image, alt: project.name },
        { src: "images/dummy-night.jpg", alt: "Sample night elevation" },
        { src: "images/dummy-terrace.jpg", alt: "Sample terrace" },
        { src: "images/dummy-facade.jpg", alt: "Sample facade" }
      ]),
      amenityGroups: [],
      updates: [
        {
          title: project.status,
          note: project.timeline || project.completion || "",
          body: project.overview
        }
      ],
      faqs: [
        {
          q: "How do I get pricing?",
          a: "WhatsApp or call 0312 4455477 for the issued schedule for " + project.name + "."
        },
        {
          q: "How do I visit?",
          a: "Call or WhatsApp 0312 4455477. Address: " + (project.address || project.location) + "."
        }
      ],
      mapsQuery: project.address || project.location
    };
  }

  function hasLivePayment(project) {
    const id = project && project.id;
    return id === "upcoming" || id === "5" || id === "6";
  }

  /** MMR + Madina Heights 4 & 5 keep the full booking dossier. */
  function isLiveBooking(project) {
    return hasLivePayment(project);
  }

  function navHtml(hasCommercial, showPayment, showVideos) {
    const links = [
      ["overview", "Overview"],
      ["residences", "Residences & Plans"]
    ];
    if (hasCommercial) links.push(["commercial", "Commercial"]);
    if (showPayment) links.push(["plans", "Payment"]);
    links.push(["amenities", "Amenities"]);
    if (showVideos !== false) links.push(["videos", "Videos"]);
    links.push(
      ["location", "Location"],
      ["updates", "Updates"],
      ["faqs", "FAQs"]
    );
    return (
      '<nav class="dossier-nav" aria-label="On this page"><div class="dossier-nav-inner">' +
      links
        .map(
          (l, i) =>
            '<a href="#' +
            l[0] +
            '"' +
            (i === 0 ? ' class="is-active"' : "") +
            ">" +
            esc(l[1]) +
            "</a>"
        )
        .join("") +
      "</div></nav>"
    );
  }

  function padNum(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function normMediaPath(src) {
    return String(src || "")
      .replace(/^\.\//, "")
      .replace(/^\//, "");
  }

  /** Videos for the dossier block — skip the clip already used as the page hero. */
  function dossierVideos(project) {
    const d = (project && project.dossier) || {};
    const list = Array.isArray(d.videos)
      ? d.videos
      : Array.isArray(project.videos)
        ? project.videos
        : [];
    const heroSrc =
      Array.isArray(project.videos) && project.videos[0] && project.videos[0].src
        ? normMediaPath(project.videos[0].src)
        : "";
    if (!heroSrc) return list.slice();
    return list.filter(function (v) {
      return normMediaPath(v && v.src) !== heroSrc;
    });
  }

  function videoCards(videos) {
    return (videos || [])
      .map(function (v) {
        return (
          '<article class="dossier-video">' +
          '<div class="dossier-video-frame">' +
          '<video controls playsinline preload="metadata"' +
          (v.poster ? ' poster="' + esc(v.poster) + '"' : "") +
          ">" +
          '<source src="' +
          esc(v.src) +
          '" type="video/mp4">' +
          "</video></div>" +
          "<h3>" +
          esc(v.title || "Drone video") +
          "</h3>" +
          (v.note ? "<p>" + esc(v.note) + "</p>" : "") +
          "</article>"
        );
      })
      .join("");
  }

  function videosSection(project, videos, kickerHtml, opts) {
    opts = opts || {};
    const hasVideos = Array.isArray(videos) && videos.length > 0;
    if (!hasVideos && opts.omitWhenEmpty) return "";
    const soldOut = !!opts.soldOut;
    const waMsg = soldOut
      ? "Hi, " +
        (project.name || "this project") +
        " is sold out — please share archive media or current booking options (Madina Mall & Residency / Madina Heights 4 & 5)."
      : "Hi, I'd like site footage and further details for " +
        (project.name || "a RealTek project") +
        ".";
    const wa =
      global.RT && typeof RT.whatsappHref === "function"
        ? RT.whatsappHref(waMsg)
        : "https://wa.me/923124455477?text=" + encodeURIComponent(waMsg);

    if (hasVideos) {
      return (
        '<section class="dossier-block" id="videos"><div class="wrap dossier-videos-wrap' +
        (soldOut ? " dossier-archive" : "") +
        '">' +
        kickerHtml +
        '<h2 class="display display-emphasis">From the air.</h2>' +
        '<p class="dossier-note">Drone footage of the building and site.</p>' +
        '<div class="dossier-videos">' +
        videoCards(videos) +
        "</div></div></section>"
      );
    }

    const emptyCopy = soldOut
      ? "Aerial media for " +
        esc(project.name || "this project") +
        " is not published here. WhatsApp our team for archive photography, or ask about Madina Mall & Residency and Madina Heights 4 & 5 — still booking."
      : "Aerial and site media for " +
        esc(project.name || "this project") +
        " is not published here yet. Our team can share current photography, a private briefing, and availability over WhatsApp.";

    const secondBtn = soldOut
      ? '<a class="btn btn-outline" href="project.html?id=upcoming">See live projects</a>'
      : '<a class="btn btn-outline" href="tel:03124455477">Call 0312 4455477</a>';

    return (
      '<section class="dossier-block" id="videos"><div class="wrap dossier-videos-wrap' +
      (soldOut ? " dossier-archive" : "") +
      '">' +
      kickerHtml +
      '<h2 class="display display-emphasis">' +
      (soldOut ? "Archive media." : "Footage on request.") +
      "</h2>" +
      '<div class="dossier-video-empty">' +
      "<p>" +
      emptyCopy +
      "</p>" +
      '<div class="dossier-video-empty-actions">' +
      '<a class="btn" href="' +
      esc(wa) +
      '" target="_blank" rel="noopener noreferrer">WhatsApp the office</a>' +
      secondBtn +
      "</div></div></div></section>"
    );
  }

  function unitCard(unit, rate, months, sample, showPayment) {
    const n = (unit.gallery || []).length;
    const galBtns = (unit.gallery || [])
      .map(function (img, i) {
        return (
          '<button type="button" class="' +
          (i === 0 ? "unit-act" : "visually-hidden") +
          '" data-lightbox data-lightbox-group="gal-' +
          esc(unit.id) +
          '" data-src="' +
          esc(img.src) +
          '" data-alt="' +
          esc(img.alt) +
          '"' +
          (i === 0 ? "" : ' tabindex="-1" aria-hidden="true"') +
          ">" +
          (i === 0
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="10" r="1.4"/><path d="M3 16l5-5 4 4 3-3 6 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Gallery'
            : "") +
          "</button>"
        );
      })
      .join("");

    const priceBlock = showPayment
      ? '<p class="unit-card-price">On request</p><p class="unit-card-sub">WhatsApp for schedule</p>'
      : '<p class="unit-card-price">Sold out</p><p class="unit-card-sub">delivered project</p>';

    return (
      '<article class="unit-card" data-unit="' +
      esc(unit.id) +
      '">' +
      '<div class="unit-card-media">' +
      '<img src="' +
      esc(unit.hero) +
      '" alt="' +
      esc(unit.name) +
      '" loading="lazy">' +
      '<span class="unit-card-count">' +
      n +
      " photo" +
      (n === 1 ? "" : "s") +
      "</span></div>" +
      '<div class="unit-card-body">' +
      '<div class="unit-card-head"><h3>' +
      esc(unit.name) +
      "</h3>" +
      (unit.area > 0 ? "<p>~" + unit.area + " sq. ft.</p>" : "") +
      "</div>" +
      priceBlock +
      "<p>" +
      esc(unit.blurb) +
      "</p></div>" +
      '<div class="unit-card-acts">' +
      galBtns +
      (unit.tour
        ? '<button type="button" class="unit-act" data-tour-open="' +
          esc(unit.id) +
          '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Tour</button>'
        : '<button type="button" class="unit-act" data-lightbox data-lightbox-group="plan-' +
          esc(unit.id) +
          '" data-src="' +
          esc(unit.plan) +
          '" data-alt="' +
          esc(unit.name) +
          ' floor plan">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Floor plan</button>') +
      (showPayment
        ? '<a class="unit-act" href="#plans">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 10h10M7 14h6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Payment plan</a>'
        : "") +
      "</div></article>"
    );
  }

  function floorPanel(floor, i) {
    return (
      '<article class="floor-split' +
      (i === 0 ? " is-active" : "") +
      '" data-floor-panel="' +
      esc(floor.id) +
      '">' +
      '<div class="floor-copy"><h3>' +
      esc(floor.name) +
      "</h3><p>" +
      esc(floor.desc) +
      '</p><div class="floor-spec">' +
      "<div><span>Units</span><strong>" +
      esc(floor.units) +
      "</strong></div>" +
      "<div><span>Sizes</span><strong>" +
      esc(floor.sizes) +
      "</strong></div>" +
      "<div><span>Use</span><strong>" +
      esc(floor.use || "—") +
      "</strong></div>" +
      "<div><span>Pricing</span><strong>On request</strong></div></div></div>" +
      '<figure class="floor-plan"><button type="button" data-lightbox data-lightbox-group="floor-' +
      esc(floor.id) +
      '" data-src="' +
      esc(floor.image) +
      '" data-alt="' +
      esc(floor.name) +
      ' floor plan"><img src="' +
      esc(floor.image) +
      '" alt="' +
      esc(floor.name) +
      ' floor plan" loading="lazy"></button>' +
      "<figcaption>Click to enlarge the blueprint</figcaption></figure></article>"
    );
  }

  function defaultPaymentPlans(project, d, rate, months) {
    const plans = project.paymentPlans;
    if (plans && plans.length) {
      return {
        plans: plans,
        notes: project.paymentNotes || []
      };
    }

    const rows = (d.units || []).map(function (u) {
      return [u.name, "17.5%", "17.5%", "1%", "4%", "5%"];
    });
    if (!rows.length) {
      rows.push(["Unit", "17.5%", "17.5%", "1%", "4%", "5%"]);
    }

    return {
      plans: [
        {
          title: "1% Payment Plan",
          note: months + " months installment",
          rows: rows
        }
      ],
        notes: d.sample
        ? ["Sample schedule for this page — confirm the issued plan at booking."]
        : [
            "Percentages only · amounts on request at booking.",
            "All areas are approx and gross.",
            "All category charges that may apply will be applicable."
          ]
    };
  }

  function paymentPlansHtml(project, d, rate, months) {
    const data = defaultPaymentPlans(project, d, rate, months);
    return (
      data.plans
        .map(function (plan) {
          return (
            '<div class="table-wrap pay-commercial"><p class="eyebrow">' +
            esc(plan.title) +
            (plan.note ? " · " + esc(plan.note) : "") +
            "</p><table><thead><tr><th>Type</th><th>Booking</th><th>Confirm</th><th>Monthly</th><th>Half-yearly</th><th>Possession</th></tr></thead><tbody>" +
            plan.rows
              .map(function (r) {
                const cells =
                  r.length > 2 && !/%/.test(String(r[1]))
                    ? [r[0]].concat(r.slice(2))
                    : r;
                return (
                  "<tr>" +
                  cells
                    .map(function (c) {
                      return "<td>" + esc(c) + "</td>";
                    })
                    .join("") +
                  "</tr>"
                );
              })
              .join("") +
            "</tbody></table></div>"
          );
        })
        .join("") +
      '<ul class="plan-notes">' +
      data.notes
        .map(function (n) {
          return "<li>" + esc(n) + "</li>";
        })
        .join("") +
      "</ul>"
    );
  }

  function paymentTable(units, rate, months, sample, projectName) {
    const rows = [
      ["Total price", "total", true],
      ["Down payment", "down", false, "At booking · 17.5%"],
      ["Confirmation", "confirm", false, "17.5%"],
      ["Monthly instalment", "monthly", false, "× " + months + " · 1%"],
      ["Half-yearly", "half", false, "× 6 · 4%"],
      ["At possession", "possession", false, "5%"]
    ];
    const head =
      '<div class="pay-table" style="--cols: ' +
      units.length +
      '" data-pay-table><div class="pay-row pay-head"><span>Payment</span>' +
      units
        .map(function (u) {
          return "<span>" + esc(u.name) + "<small>~" + u.area + " sq. ft.</small></span>";
        })
        .join("") +
      "</div>";
    const body = rows
      .map(function (row) {
        return (
          '<div class="pay-row' +
          (row[2] ? " is-total" : "") +
          '"><span>' +
          esc(row[0]) +
          (row[3] ? "<small>" + esc(row[3]) + "</small>" : "") +
          "</span>" +
          units
            .map(function (u) {
              const pay = unitSchedule(u, rate, months);
              const val = pay[row[1]];
              return '<span data-pkr="' + val + '">' + formatFull(val, "PKR") + "</span>";
            })
            .join("") +
          "</div>"
        );
      })
      .join("");
    const cta =
      '<div class="pay-row pay-cta"><span></span>' +
      units
        .map(function (u) {
          return (
            '<span><a href="' +
            esc(
              global.RT.whatsappHref
                ? RT.whatsappHref(
                    "Hi, I would like the full payment schedule for a " +
                      u.name +
                      " at " +
                      (projectName || "Madina Mall & Residency") +
                      "."
                  )
                : "https://wa.me/923124455477"
            ) +
            '" target="_blank" rel="noopener noreferrer">Full schedule →</a></span>'
          );
        })
        .join("") +
      "</div></div>";
    return (
      head +
      body +
      cta +
      '<p class="pay-foot"' +
      (sample ? ' data-base="sample"' : "") +
      ">" +
      (sample
        ? "Sample figures for layout only · confirm the issued schedule at booking."
        : "All figures in PKR · 1% construction-linked plan · areas approx and gross · schedules issued in writing at booking.") +
      "</p>"
    );
  }


  function archiveNavHtml(opts) {
    opts = opts || {};
    const links = [["overview", "Overview"]];
    if (opts.showVideos) links.push(["videos", "Videos"]);
    links.push(["location", "Location"]);
    return (
      '<nav class="dossier-nav" aria-label="On this page"><div class="dossier-nav-inner">' +
      links
        .map(function (l, i) {
          return (
            '<a href="#' +
            l[0] +
            '"' +
            (i === 0 ? ' class="is-active"' : "") +
            ">" +
            esc(l[1]) +
            "</a>"
          );
        })
        .join("") +
      "</div></nav>"
    );
  }

  function archiveGalleryHtml(project, exclude) {
    const raw = project.gallery || [];
    const list = uniqueImages(
      raw.filter(function (img) {
        const src = String((img && img.src) || "").toLowerCase();
        return src && !/floorplan|floor-plan|\/plan-|brochure\/page-/i.test(src);
      }),
      9,
      exclude || []
    );
    if (!list.length) return "";
    return (
      '<div class="dossier-archive-gallery" data-count="' +
      list.length +
      '">' +
      list
        .map(function (img, i) {
          return (
            '<button type="button" data-lightbox data-lightbox-group="archive" data-src="' +
            esc(img.src) +
            '" data-alt="' +
            esc(img.alt || project.name) +
            '"><img src="' +
            esc(img.src) +
            '" alt="' +
            esc(img.alt || project.name) +
            '"' +
            (i === 0 ? "" : ' loading="lazy"') +
            "></button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function buildSoldOutArchive(project) {
    const d = project.dossier || {};
    const copy = d.copy || project.overview || "";
    const locSrc = (function () {
      if (d.locImage) return d.locImage;
      const gallery = uniqueImages(project.gallery || [], 9);
      const alt = gallery.find(function (img) {
        return img.src && img.src !== project.image && !/floorplan|floor-plan/i.test(img.src);
      });
      return (alt && alt.src) || d.hero || project.image;
    })();
    const maps = encodeURIComponent(d.mapsQuery || project.address || project.location || "");
    const projectVideos = dossierVideos(project);
    const showVideos = projectVideos.length > 0;
    const statsSrc = (
      d.stats && d.stats.length
        ? d.stats.map(function (s, i) {
            if (i === 0 || /status/i.test(s.label || "")) {
              return { label: s.label || "Status", value: "Sold Out" };
            }
            return s;
          })
        : [
            { label: "Status", value: "Sold Out" },
            { label: "Type", value: project.type || "—" },
            { label: "Location", value: project.location || "—" }
          ]
    ).slice(0, 3);
    const stats = statsSrc
      .map(function (s) {
        return (
          "<div><span>" +
          esc(s.label) +
          "</span><strong>" +
          esc(s.value) +
          "</strong></div>"
        );
      })
      .join("");
    let step = 1;
    function kicker(label) {
      const n = padNum(step++);
      return '<p class="dossier-kicker"><i></i>' + n + " — " + label + "</p>";
    }
    const waLive =
      global.RT && typeof RT.whatsappHref === "function"
        ? RT.whatsappHref(
            "Hi, I'm looking at sold-out " +
              project.name +
              ". Please share current booking options."
          )
        : "https://wa.me/923124455477";

    return (
      archiveNavHtml({ showVideos: showVideos }) +
      '<section class="dossier-block" id="overview">' +
      '<div class="wrap dossier-archive">' +
      kicker("Overview") +
      '<div class="dossier-archive-status">' +
      '<span class="badge">Sold Out</span>' +
      "<div>" +
      "<p><strong>" +
      esc(project.name) +
      " is sold out.</strong> Floor plans and payment schedules are closed for this development. For current inventory, see Madina Mall &amp; Residency or Madina Heights 4 &amp; 5.</p>" +
      '<div class="dossier-archive-status-actions">' +
      '<a class="btn" href="project.html?id=upcoming">Madina Mall &amp; Residency</a>' +
      '<a class="btn btn-outline" href="' +
      esc(waLive) +
      '" target="_blank" rel="noopener noreferrer">WhatsApp for live options</a>' +
      "</div></div></div>" +
      '<h2 class="display display-emphasis">About the project.</h2>' +
      '<p class="dossier-archive-copy">' +
      esc(copy) +
      "</p>" +
      '<div class="dossier-stats dossier-archive-stats">' +
      stats +
      "</div>" +
      archiveGalleryHtml(project, [project.image, locSrc]) +
      "</div></section>" +
      (showVideos
        ? videosSection(project, projectVideos, kicker("Videos"), {
            soldOut: true,
            omitWhenEmpty: true
          })
        : "") +
      '<section class="dossier-block" id="location">' +
      '<div class="wrap dossier-archive"><div class="dossier-split dossier-archive-location"><div>' +
      kicker("Location") +
      '<h2 class="display display-emphasis">' +
      esc(project.location) +
      "</h2><p>" +
      esc(project.address || project.location) +
      '</p><a class="btn btn-outline" href="https://www.google.com/maps/search/?api=1&query=' +
      maps +
      '" target="_blank" rel="noopener noreferrer">Get directions</a></div>' +
      '<figure><img src="' +
      esc(locSrc) +
      '" alt="' +
      esc(project.name) +
      ", " +
      esc(project.location) +
      '" loading="lazy"><figcaption><span>' +
      esc(project.name) +
      "</span><span>Site</span></figcaption></figure></div></section>"
    );
  }

  function render(project) {
    if (!isLiveBooking(project)) {
      return buildSoldOutArchive(project);
    }
    const d = project.dossier || dummyDossier(project);
    const hasCommercial = Array.isArray(d.floors) && d.floors.length > 0;
    const isMall = project.id === "upcoming";
    return build(project, d, isMall, hasCommercial, d.rate, d.months, d.hero || project.image);
  }

  function build(project, d, isMall, hasCommercial, rate, months, img) {
    const sample = !!d.sample;
    const showPayment = hasLivePayment(project);
    const projectVideos = dossierVideos(project);
    const showVideos = projectVideos.length > 0;
    let step = 1;

    const stats = d.stats
      .map(function (s) {
        return (
          "<div><span>" + esc(s.label) + "</span><strong>" + esc(s.value) + "</strong></div>"
        );
      })
      .join("");

    const floorTabs = d.floors
      .map(function (f, i) {
        return (
          '<button type="button" class="floor-tab' +
          (i === 0 ? " is-active" : "") +
          '" data-floor="' +
          esc(f.id) +
          '">' +
          esc(f.name) +
          "</button>"
        );
      })
      .join("");

    const amenityPhotos = (d.amenityShots || [])
      .map(function (s) {
        return (
          '<button type="button" data-lightbox data-lightbox-group="amenities" data-src="' +
          esc(s.src) +
          '" data-alt="' +
          esc(s.alt) +
          '"><img src="' +
          esc(s.src) +
          '" alt="' +
          esc(s.alt) +
          '" loading="lazy"></button>'
        );
      })
      .join("");

    const groups = project.amenityGroups || [];
    const amenityLists = groups
      .map(function (g) {
        return (
          "<div><h3>" +
          esc(g.label) +
          "</h3><ul>" +
          g.items.map(function (item) {
            return "<li>" + esc(item) + "</li>";
          }).join("") +
          "</ul></div>"
        );
      })
      .join("");

    const updates = (d.updates || [])
      .map(function (u) {
        return (
          "<article><p class=\"dossier-kicker\">" +
          esc(u.note || "") +
          "</p><h3>" +
          esc(u.title) +
          "</h3><p>" +
          esc(u.body) +
          "</p></article>"
        );
      })
      .join("");

    const faqs = (d.faqs || [])
      .map(function (f) {
        return (
          "<details><summary>" +
          esc(f.q) +
          "</summary><p>" +
          esc(f.a) +
          "</p></details>"
        );
      })
      .join("");

    const maps = encodeURIComponent(d.mapsQuery || project.location);

    const locSrc = (function () {
      if (d.locImage) return d.locImage;
      const gallery = uniqueImages(project.gallery || [], 9);
      const alt = gallery.find(function (img) {
        return img.src && img.src !== project.image && !/floorplan|floor-plan/i.test(img.src);
      });
      return (alt && alt.src) || d.hero || project.image;
    })();

    function kicker(label) {
      const n = padNum(step++);
      return '<p class="dossier-kicker"><i></i>' + n + " — " + label + "</p>";
    }

    return (
      navHtml(hasCommercial, showPayment, showVideos) +
      (sample && showPayment
        ? '<p class="dossier-banner wrap">Sample figures for this page — not a published RealTek schedule. WhatsApp for issued drawings.</p>'
        : "") +
      '<section class="dossier-block" id="overview">' +
      '<div class="wrap dossier-split">' +
      "<div>" +
      kicker("Overview") +
      '<p class="dossier-copy">' +
      esc(d.copy) +
      "</p></div>" +
      "<figure><img src=\"" +
      esc(img) +
      '" alt="' +
      esc(d.caption) +
      '"><figcaption><span>' +
      esc(d.caption) +
      "</span><span>" +
      esc(d.imageKind) +
      "</span></figcaption></figure></div>" +
      '<div class="dossier-stats">' +
      stats +
      "</div></section>" +
      '<section class="dossier-block" id="residences">' +
      '<div class="wrap">' +
      kicker("Residences &amp; plans") +
      "<h2 class=\"display display-emphasis\">" +
      (isMall ? "Three ways in." : d.sample ? "Sample plates." : "Residences.") +
      "</h2>" +
      (sample
        ? "<p class=\"dossier-note\">Dummy layouts for this project — WhatsApp for issued drawings.</p>"
        : "<p class=\"dossier-note\">Photos from the delivered building. Ask RealTek for related inventory still booking.</p>") +
      '<div class="unit-grid">' +
      d.units.map(function (u) {
        return unitCard(u, showPayment ? rate : 0, months, sample, showPayment);
      }).join("") +
      "</div></div></section>" +
      (hasCommercial
        ? '<section class="dossier-block" id="commercial"><div class="wrap">' +
          kicker("Commercial") +
          '<h2 class="display display-emphasis">Retail, floor by floor.</h2>' +
          '<div class="floor-tabs" role="tablist">' +
          floorTabs +
          "</div>" +
          d.floors.map(floorPanel).join("") +
          "</div></section>"
        : "") +
      (showPayment
        ? '<section class="dossier-block" id="plans">' +
          '<div class="wrap">' +
          kicker("Payment") +
          '<h2 class="display display-emphasis">Payment plans</h2>' +
          paymentPlansHtml(project, d, rate, months) +
          "</div></section>"
        : "") +
      '<section class="dossier-block" id="amenities">' +
      '<div class="wrap">' +
      kicker("Amenities") +
      '<h2 class="display display-emphasis">' +
      (isMall ? "Built in, not bolted on." : "On the record.") +
      "</h2>" +
      '<div class="amenity-shots">' +
      amenityPhotos +
      "</div>" +
      (amenityLists ? '<div class="amenity-cols">' + amenityLists + "</div>" : "") +
      "</div></section>" +
      (showVideos
        ? videosSection(project, projectVideos, kicker("Videos"), {
            omitWhenEmpty: true
          })
        : "") +
      '<section class="dossier-block" id="location">' +
      '<div class="wrap dossier-split"><div>' +
      kicker("Location") +
      '<h2 class="display display-emphasis">' +
      esc(project.location) +
      "</h2><p>" +
      esc(project.address || project.location) +
      '</p><a class="btn btn-outline" href="https://www.google.com/maps/search/?api=1&query=' +
      maps +
      '" target="_blank" rel="noopener noreferrer">Get directions</a></div>' +
      '<figure><img src="' +
      esc(locSrc) +
      '" alt="' +
      esc(project.name) +
      ", " +
      esc(project.location) +
      '" loading="lazy"><figcaption><span>' +
      esc(project.name) +
      "</span><span>Site</span></figcaption></figure></div></section>" +
      '<section class="dossier-block" id="updates">' +
      '<div class="wrap">' +
      kicker("Updates") +
      '<div class="update-list">' +
      updates +
      "</div></div></section>" +
      '<section class="dossier-block" id="faqs">' +
      '<div class="wrap">' +
      kicker("FAQs") +
      '<div class="faq-list">' +
      faqs +
      "</div></div></section>"
    );
  }

  function applyFx(root, code) {
    root.querySelectorAll("[data-pkr]").forEach(function (el) {
      const pkr = Number(el.getAttribute("data-pkr"));
      if (!pkr) return;
      const short = el.classList.contains("unit-card-price");
      const inTable = el.closest(".pay-table");
      if (short) el.textContent = formatShort(pkr, code);
      else if (inTable) {
        el.textContent =
          (code === "PKR" ? "" : FX_LABEL[code] + " ") + formatFull(pkr, code);
      } else {
        el.textContent = FX_LABEL[code] + " " + formatFull(pkr, code);
      }
    });
    const foot = root.querySelector(".pay-foot");
    if (!foot || foot.dataset.base === "sample") return;
    if (code !== "PKR") {
      foot.textContent =
        "Indicative " +
        code +
        " for overseas viewing · schedules issued in PKR · construction-linked, never rate-linked.";
    } else {
      foot.textContent =
        "All figures in PKR · 1% construction-linked plan · areas approx and gross · schedules issued in writing at booking.";
    }
  }

  function bind(root, project) {
    const tabs = root.querySelectorAll("[data-floor]");
    const panels = root.querySelectorAll("[data-floor-panel]");
    tabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-floor");
        tabs.forEach(function (t) {
          t.classList.toggle("is-active", t === btn);
        });
        panels.forEach(function (p) {
          p.classList.toggle("is-active", p.getAttribute("data-floor-panel") === id);
        });
      });
    });

    root.querySelectorAll(".unit-card-media").forEach(function (media) {
      media.addEventListener("click", function () {
        const card = media.closest(".unit-card");
        const btn = card && card.querySelector(".unit-card-acts [data-lightbox]");
        if (btn) btn.click();
      });
    });

    const fxBtns = root.querySelectorAll("[data-fx]");
    fxBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        fxBtns.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        applyFx(root, btn.getAttribute("data-fx"));
      });
    });

    root.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        const id = (a.getAttribute("href") || "").slice(1);
        const sec = document.getElementById(id);
        if (!sec) return;
        e.preventDefault();
        const nav = root.querySelector(".dossier-nav");
        const header = document.getElementById("header");
        const offset = -((header ? header.offsetHeight : 72) + (nav ? nav.offsetHeight : 48) + 8);
        const lenis = global.RT && RT.lenis;
        if (lenis && typeof lenis.scrollTo === "function") {
          lenis.scrollTo(sec, { offset: offset });
        } else {
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    root.querySelectorAll("[data-tour-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const uid = btn.getAttribute("data-tour-open");
        const d =
          project && project.dossier ? project.dossier : dummyDossier(project || {});
        const unit = (d.units || []).find(function (u) {
          return u.id === uid;
        });
        if (unit && unit.tour && global.RT && typeof RT.openTour === "function") {
          RT.openTour(unit.tour, unit.name);
        }
      });
    });

    const links = root.querySelectorAll(".dossier-nav a");
    const sections = [];
    links.forEach(function (a) {
      const id = (a.getAttribute("href") || "").slice(1);
      const sec = document.getElementById(id);
      if (sec) sections.push({ a: a, sec: sec });
    });
    if (sections.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            links.forEach(function (a) {
              a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
            });
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach(function (s) {
        io.observe(s.sec);
      });
    }
  }

  function mount(project, host) {
    if (!host || !project) return;
    document.body.classList.add("is-dossier");
    document.body.classList.toggle("is-dossier-archive", !isLiveBooking(project));
    host.innerHTML = render(project);
    bind(host, project);
    if (global.RT && typeof RT.initLightbox === "function") RT.initLightbox();
  }

  global.RT = global.RT || {};
  global.RT.mountDossier = mount;
})(window);
