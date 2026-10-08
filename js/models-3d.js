/**
 * 3D apartment models viewer — model picker + embedded <model-viewer> stage.
 * Trigger: any [data-3d-models] button. Models live in images/models/.
 */
(function (global) {
  var MODELS = [
    { id: "studio", name: "Studio Apartment", src: "images/models/studio-apartment.glb" },
    { id: "1bed", name: "1 Bed Apartment", src: "images/models/1-bed-apartment.glb" },
    { id: "2bed", name: "2 Bed Apartment", src: "images/models/2-bed-apartment.glb" }
  ];

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function projectName() {
    var el = document.getElementById("p-title");
    var name = el ? el.textContent.trim() : "";
    return name || "Madina Heights";
  }

  function ensure() {
    if ($("#models-3d")) return $("#models-3d");
    var wrap = document.createElement("div");
    wrap.id = "models-3d";
    wrap.className = "models-3d";
    wrap.hidden = true;
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-label", "3D apartment models");
    wrap.innerHTML =
      '<button class="models-3d-close" type="button" data-m3d-close aria-label="Close 3D models">\u00d7</button>' +
      '<div class="models-3d-picker" data-m3d-picker hidden>' +
      '<div class="models-3d-picker-copy">' +
      '<p class="models-3d-kicker" data-m3d-kicker></p>' +
      "<h2>View 3D models</h2>" +
      '<p class="models-3d-hint">Choose a residence to explore in 3D. Drag to rotate, pinch or scroll to zoom.</p>' +
      "</div>" +
      '<div class="models-3d-list" data-m3d-list></div>' +
      "</div>" +
      '<div class="models-3d-viewer" data-m3d-viewer hidden>' +
      '<div class="models-3d-topbar">' +
      '<button class="models-3d-back" type="button" data-m3d-back>\u2190 All models</button>' +
      "<h2 data-m3d-title></h2>" +
      "</div>" +
      '<div class="models-3d-stage" data-m3d-stage></div>' +
      '<p class="models-3d-viewer-hint">Drag to orbit &middot; Scroll to zoom &middot; Right-drag to pan</p>' +
      "</div>";
    document.body.appendChild(wrap);

    wrap.addEventListener("click", function (e) {
      if (e.target === wrap || e.target.closest("[data-m3d-close]")) close();
    });
    wrap.querySelector("[data-m3d-back]").addEventListener("click", showPicker);
    document.addEventListener("keydown", function (e) {
      if (wrap.hidden) return;
      if (e.key === "Escape") close();
    });
    return wrap;
  }

  function lockScroll() {
    document.body.style.overflow = "hidden";
    if (global.RT && RT.lenis && typeof RT.lenis.stop === "function") RT.lenis.stop();
  }

  function unlockScroll() {
    document.body.style.overflow = "";
    if (global.RT && RT.lenis && typeof RT.lenis.start === "function") RT.lenis.start();
  }

  function showPicker(kickerText) {
    var root = ensure();
    var kicker = root.querySelector("[data-m3d-kicker]");
    if (kicker) kicker.textContent = kickerText || projectName();
    var list = root.querySelector("[data-m3d-list]");
    if (list && !list.children.length) {
      MODELS.forEach(function (m) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = m.name;
        btn.setAttribute("data-m3d-pick", m.id);
        btn.addEventListener("click", function () {
          openModel(m.id);
        });
        list.appendChild(btn);
      });
    }
    root.querySelector("[data-m3d-picker]").hidden = false;
    root.querySelector("[data-m3d-viewer]").hidden = true;
    root.classList.remove("is-viewer");
    root.classList.add("is-picker");
    root.hidden = false;
    lockScroll();
    var closeBtn = root.querySelector("[data-m3d-close]");
    if (closeBtn) closeBtn.focus();
  }

  function openModel(id) {
    var model = null;
    for (var i = 0; i < MODELS.length; i++) {
      if (MODELS[i].id === id) model = MODELS[i];
    }
    if (!model) return;
    var root = ensure();
    root.querySelector("[data-m3d-picker]").hidden = true;
    var viewerPane = root.querySelector("[data-m3d-viewer]");
    viewerPane.hidden = false;
    root.querySelector("[data-m3d-title]").textContent = model.name;
    var stage = root.querySelector("[data-m3d-stage]");
    var viewer = stage.querySelector("model-viewer");
    if (!viewer) {
      viewer = document.createElement("model-viewer");
      viewer.setAttribute("camera-controls", "");
      viewer.setAttribute("auto-rotate", "");
      viewer.setAttribute("rotation-per-second", "24deg");
      viewer.setAttribute("shadow-intensity", "1");
      viewer.setAttribute("exposure", "1.05");
      viewer.setAttribute("environment-image", "neutral");
      viewer.setAttribute("reveal", "auto");
      viewer.setAttribute("loading", "eager");
      viewer.style.width = "100%";
      viewer.style.height = "100%";
      stage.appendChild(viewer);
    }
    viewer.setAttribute("alt", model.name + " 3D model");
    if (viewer.getAttribute("src") !== model.src) {
      viewer.setAttribute("src", model.src);
    }
    root.classList.remove("is-picker");
    root.classList.add("is-viewer");
    root.hidden = false;
    lockScroll();
    var backBtn = root.querySelector("[data-m3d-back]");
    if (backBtn) backBtn.focus();
  }

  function close() {
    var root = $("#models-3d");
    if (!root) return;
    root.hidden = true;
    root.classList.remove("is-picker", "is-viewer");
    unlockScroll();
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-3d-models]");
    if (!trigger) return;
    e.preventDefault();
    showPicker(trigger.getAttribute("data-3d-kicker"));
  });

  global.RT = global.RT || {};
  global.RT.open3DModels = showPicker;
  global.RT.close3DModels = close;
})(window);
