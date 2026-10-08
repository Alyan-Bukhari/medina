/**
 * Apartment tour — floor-plan hotspots + room viewer.
 * Config shape: { plan, photos: [{src,alt}], hotspots: [{id,label,top,left,start}] }
 */
(function (global) {
  let kenBurns = null;
  let photos = [];
  let index = 0;
  let title = "";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function ensure() {
    if ($("#apt-tour")) return $("#apt-tour");
    const wrap = document.createElement("div");
    wrap.id = "apt-tour";
    wrap.className = "apt-tour";
    wrap.hidden = true;
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-label", "Apartment tour");
    wrap.innerHTML =
      '<button class="apt-tour-close" type="button" data-tour-close aria-label="Close tour">×</button>' +
      '<div class="apt-tour-plan" data-tour-plan>' +
      '<p class="apt-tour-kicker">Floor plan</p>' +
      '<h2 data-tour-title></h2>' +
      '<p class="apt-tour-hint">Tap a marker to open that room.</p>' +
      '<div class="apt-tour-stage"><img data-tour-plan-img alt=""><div data-tour-spots></div></div>' +
      '<div class="apt-tour-rooms" data-tour-rooms></div>' +
      "</div>" +
      '<div class="apt-tour-room" data-tour-room hidden>' +
      '<button class="apt-tour-back" type="button" data-tour-back>← Back to floor plan</button>' +
      '<figure class="apt-tour-figure"><img data-tour-room-img alt=""></figure>' +
      '<div class="apt-tour-bar">' +
      '<button type="button" data-tour-prev aria-label="Previous photo">←</button>' +
      '<p data-tour-count>1 / 1</p>' +
      '<button type="button" data-tour-next aria-label="Next photo">→</button>' +
      "</div>" +
      '<div class="apt-tour-thumbs" data-tour-thumbs></div>' +
      "</div>" +
      '<div class="apt-tour-picker" data-tour-picker hidden>' +
      '<div class="apt-tour-picker-copy">' +
      '<p class="apt-tour-kicker" data-tour-picker-kicker>Madina Heights 4</p>' +
      "<h2>Take a virtual tour</h2>" +
      '<p class="apt-tour-hint">Choose a residence to walk through.</p>' +
      "</div>" +
      '<div class="apt-tour-picker-list" data-tour-picker-list></div>' +
      "</div>" +
      '<div class="apt-tour-panoee" data-tour-panoee hidden>' +
      '<p class="apt-tour-kicker">360° tour</p>' +
      "<h2 data-tour-panoee-title></h2>" +
      '<iframe data-tour-panoee-frame title="360 apartment tour" allowfullscreen webkitallowfullscreen mozallowfullscreen allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer; magnetometer; web-share" referrerpolicy="no-referrer-when-downgrade"></iframe>' +
      "</div>";
    document.body.appendChild(wrap);

    wrap.addEventListener("click", function (e) {
      if (e.target === wrap || e.target.closest("[data-tour-close]")) close();
    });
    wrap.querySelector("[data-tour-back]").addEventListener("click", showPlan);
    wrap.querySelector("[data-tour-prev]").addEventListener("click", function () {
      showPhoto(index - 1);
    });
    wrap.querySelector("[data-tour-next]").addEventListener("click", function () {
      showPhoto(index + 1);
    });
    document.addEventListener("keydown", function (e) {
      if (wrap.hidden) return;
      if (e.key === "Escape") close();
      const room = wrap.querySelector("[data-tour-room]");
      if (room.hidden) return;
      if (e.key === "ArrowLeft") showPhoto(index - 1);
      if (e.key === "ArrowRight") showPhoto(index + 1);
    });
    return wrap;
  }

  function stopKenBurns() {
    if (kenBurns && typeof kenBurns.kill === "function") kenBurns.kill();
    kenBurns = null;
  }

  function hidePicker(root) {
    const picker = root && root.querySelector("[data-tour-picker]");
    if (picker) picker.hidden = true;
  }

  function syncTourViewport() {
    const root = $("#apt-tour");
    if (!root || root.hidden) return;
    const panoee = root.classList.contains("is-panoee");
    const picker = root.classList.contains("is-picker");
    if (!panoee && !picker) return;
    const view = window.visualViewport;
    const w = Math.round((view && view.width) || window.innerWidth);
    const h = Math.round((view && view.height) || window.innerHeight);
    const top = Math.round((view && view.offsetTop) || 0);
    const left = Math.round((view && view.offsetLeft) || 0);
    root.style.setProperty("--tour-w", w + "px");
    root.style.setProperty("--tour-h", h + "px");
    root.style.top = top + "px";
    root.style.left = left + "px";
    root.style.width = w + "px";
    root.style.height = h + "px";

    const phone = Math.min(w, h) <= 900;
    const portrait = h > w;
    if (panoee && phone && portrait) {
      const coverW = Math.ceil(Math.max(w, h * (16 / 9)));
      const coverH = Math.ceil(Math.max(h, w * (9 / 16)));
      root.classList.add("is-panoee-cover");
      root.style.setProperty("--tour-frame-w", coverW + "px");
      root.style.setProperty("--tour-frame-h", coverH + "px");
    } else {
      root.classList.remove("is-panoee-cover");
      root.style.removeProperty("--tour-frame-w");
      root.style.removeProperty("--tour-frame-h");
    }
  }

  function bindTourViewport() {
    if (bindTourViewport.bound) return;
    bindTourViewport.bound = true;
    const sync = function () {
      syncTourViewport();
    };
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", sync);
      window.visualViewport.addEventListener("scroll", sync);
    }
  }

  function setTourMode(mode) {
    const root = ensure();
    const open = mode !== "closed";
    root.classList.toggle("is-panoee", mode === "panoee");
    root.classList.toggle("is-picker", mode === "picker");
    document.documentElement.classList.toggle("apt-tour-open", open);
    document.body.classList.toggle("apt-tour-open", open);
    if (mode === "panoee" || mode === "picker") {
      bindTourViewport();
      syncTourViewport();
    } else {
      root.style.removeProperty("--tour-w");
      root.style.removeProperty("--tour-h");
      root.style.removeProperty("--tour-frame-w");
      root.style.removeProperty("--tour-frame-h");
      root.classList.remove("is-panoee-cover");
      root.style.top = "";
      root.style.left = "";
      root.style.width = "";
      root.style.height = "";
    }
  }

  function showPlan() {
    const root = ensure();
    const panoee = root.querySelector("[data-tour-panoee]");
    if (panoee && !panoee.hidden) return;
    hidePicker(root);
    setTourMode("plan");
    root.querySelector("[data-tour-plan]").hidden = false;
    root.querySelector("[data-tour-room]").hidden = true;
    stopKenBurns();
  }

  function heights4Tours() {
    if (global.RT && RT.HEIGHTS4_TOURS && RT.HEIGHTS4_TOURS.length) {
      return RT.HEIGHTS4_TOURS;
    }
    const project = global.RT && RT.getProject ? RT.getProject("5") : null;
    return (project && project.virtualTours) || [];
  }

  function openPicker() {
    const tours = heights4Tours();
    if (!tours.length) return;
    const root = ensure();
    const picker = root.querySelector("[data-tour-picker]");
    const list = root.querySelector("[data-tour-picker-list]");
    root.querySelector("[data-tour-plan]").hidden = true;
    root.querySelector("[data-tour-room]").hidden = true;
    const pane = root.querySelector("[data-tour-panoee]");
    if (pane) pane.hidden = true;
    const frame = $("[data-tour-panoee-frame]", root);
    if (frame) frame.src = "about:blank";
    if (list) {
      list.innerHTML = tours
        .map(function (t) {
          return (
            '<button type="button" data-tour-pick="' +
            String(t.panoee).replace(/"/g, "") +
            '" data-tour-pick-name="' +
            String(t.name || "Residence").replace(/"/g, "") +
            '">' +
            (t.name || "Residence") +
            "</button>"
          );
        })
        .join("");
      list.querySelectorAll("[data-tour-pick]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          open({ panoee: btn.getAttribute("data-tour-pick") }, btn.getAttribute("data-tour-pick-name"));
        });
      });
    }
    if (picker) picker.hidden = false;
    root.hidden = false;
    setTourMode("picker");
    document.body.style.overflow = "hidden";
    if (global.RT && RT.lenis && typeof RT.lenis.stop === "function") RT.lenis.stop();
    const closeBtn = $("[data-tour-close]", root);
    if (closeBtn) closeBtn.focus();
  }

  function showPhoto(i) {
    if (!photos.length) return;
    index = (i + photos.length) % photos.length;
    const item = photos[index];
    const img = $("[data-tour-room-img]");
    const count = $("[data-tour-count]");
    const root = ensure();
    root.querySelector("[data-tour-plan]").hidden = true;
    const room = root.querySelector("[data-tour-room]");
    room.hidden = false;
    img.src = item.src;
    img.alt = item.alt || title;
    if (count) count.textContent = index + 1 + " / " + photos.length;
    root.querySelectorAll("[data-tour-thumbs] button").forEach(function (btn, n) {
      btn.classList.toggle("is-active", n === index);
    });
    stopKenBurns();
    img.style.transform = "scale(1)";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && global.gsap) {
      kenBurns = gsap.fromTo(
        img,
        { scale: 1 },
        { scale: 1.06, duration: 7, ease: "none" }
      );
    }
  }

  function open(config, name) {
    if (!config) return;
    if (config.panoee) {
      photos = [];
      title = name || "Apartment";
      const root = ensure();
      hidePicker(root);
      const frame = $("[data-tour-panoee-frame]", root);
      const heading = $("[data-tour-panoee-title]", root);
      root.querySelector("[data-tour-plan]").hidden = true;
      root.querySelector("[data-tour-room]").hidden = true;
      const pane = root.querySelector("[data-tour-panoee]");
      pane.hidden = false;
      if (heading) heading.textContent = title;
      if (frame) {
        frame.src = config.panoee;
        frame.title = title + " 360 tour";
      }
      root.hidden = false;
      setTourMode("panoee");
      document.body.style.overflow = "hidden";
      if (global.RT && RT.lenis && typeof RT.lenis.stop === "function") RT.lenis.stop();
      const closeBtn = $("[data-tour-close]", root);
      if (closeBtn) closeBtn.focus();
      return;
    }
    if (!config.plan) return;
    photos = config.photos || [];
    title = name || "Apartment";
    const root = ensure();
    hidePicker(root);
    const panoeePane = root.querySelector("[data-tour-panoee]");
    if (panoeePane) {
      panoeePane.hidden = true;
      const frame = $("[data-tour-panoee-frame]", root);
      if (frame) frame.src = "about:blank";
    }
    $("[data-tour-title]", root).textContent = title;
    const planImg = $("[data-tour-plan-img]", root);
    planImg.src = config.plan;
    planImg.alt = title + " floor plan";
    const spots = $("[data-tour-spots]", root);
    const rooms = $("[data-tour-rooms]", root);
    const thumbs = $("[data-tour-thumbs]", root);
    spots.innerHTML = (config.hotspots || [])
      .map(function (h) {
        return (
          '<button type="button" class="apt-hotspot" style="top:' +
          h.top +
          ";left:" +
          h.left +
          '" data-start="' +
          (h.start || 0) +
          '" aria-label="' +
          h.label +
          '"><span>' +
          h.label +
          "</span></button>"
        );
      })
      .join("");
    rooms.innerHTML = (config.hotspots || [])
      .map(function (h) {
        return (
          '<button type="button" data-start="' +
          (h.start || 0) +
          '">' +
          h.label +
          "</button>"
        );
      })
      .join("");
    thumbs.innerHTML = photos
      .map(function (p, i) {
        return (
          '<button type="button" data-start="' +
          i +
          '"><img src="' +
          p.src +
          '" alt=""></button>'
        );
      })
      .join("");

    function bindStarts(sel) {
      root.querySelectorAll(sel).forEach(function (btn) {
        btn.addEventListener("click", function () {
          showPhoto(Number(btn.getAttribute("data-start") || 0));
        });
      });
    }
    bindStarts("[data-tour-spots] [data-start]");
    bindStarts("[data-tour-rooms] [data-start]");
    bindStarts("[data-tour-thumbs] [data-start]");

    showPlan();
    root.hidden = false;
    setTourMode("plan");
    document.body.style.overflow = "hidden";
    if (global.RT && RT.lenis && typeof RT.lenis.stop === "function") RT.lenis.stop();
    const closeBtn = $("[data-tour-close]", root);
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    const root = $("#apt-tour");
    if (!root) return;
    const frame = $("[data-tour-panoee-frame]", root);
    if (frame) frame.src = "about:blank";
    const pane = root.querySelector("[data-tour-panoee]");
    if (pane) pane.hidden = true;
    hidePicker(root);
    root.hidden = true;
    setTourMode("closed");
    document.body.style.overflow = "";
    stopKenBurns();
    if (global.RT && RT.lenis && typeof RT.lenis.start === "function") RT.lenis.start();
  }

  document.addEventListener("click", function (e) {
    const trigger = e.target.closest("[data-virtual-tour]");
    if (!trigger) return;
    e.preventDefault();
    openPicker();
  });

  global.RT = global.RT || {};
  global.RT.openTour = open;
  global.RT.closeTour = close;
  global.RT.openTourPicker = openPicker;
})(window);
