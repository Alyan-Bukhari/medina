(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: no-preference)");
  const motionOk = () => reduce.matches;
  const isMobile = () => window.matchMedia("(max-width: 860px)").matches;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function initHeader() {
    const header = $("#header");
    const toggle = $(".nav-toggle");
    const nav = $("#nav");
    if (!header) return;

    const onDarkHero =
      !!$(".hero, .page-hero, .heights-page-hero") ||
      document.body.classList.contains("is-folio-series") ||
      document.body.getAttribute("data-seo-series") === "madina-heights" ||
      new URLSearchParams(window.location.search).get("series") === "madina-heights";
    if (!onDarkHero) header.classList.add("is-light");
    else header.classList.remove("is-light");

    const onScroll = () => {
      const threshold = $(".heights-page-hero")
        ? Math.max(48, window.innerHeight * 0.55)
        : 24;
      header.classList.toggle("is-scrolled", window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        document.body.style.overflow = open ? "hidden" : "";
      });
      $$(".nav-link", nav).forEach((link) => {
        link.addEventListener("click", () => {
          nav.classList.remove("is-open");
          toggle.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }
  }

  function initLenis() {
    if (!motionOk() || isMobile() || typeof Lenis === "undefined") return null;
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1,
      autoRaf: false
    });
    const notifyScroll = () => {
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.update();
      window.dispatchEvent(new Event("rt:scroll"));
    };
    lenis.on("scroll", notifyScroll);
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => {
        lenis.raf(t);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
    return lenis;
  }

  function initLoadBar() {
    const bar = $("#loadbar");
    if (!bar) return;
    const inner = $("i", bar);
    const finish = () => {
      if (inner) inner.style.width = "100%";
      bar.classList.add("is-done");
      setTimeout(() => bar.remove(), 700);
    };
    if (document.readyState === "complete") {
      requestAnimationFrame(finish);
      return;
    }
    if (inner) inner.style.transition = "width 0.7s var(--ease, cubic-bezier(0.22,1,0.36,1))";
    if (inner) inner.style.width = "70%";
    window.addEventListener("load", finish, { once: true });
  }

  function initSplit() {
    if (typeof SplitType === "undefined" || typeof gsap === "undefined") return;
    const nodes = $$("[data-split]");
    if (!nodes.length) return;

    nodes.forEach((el) => {
      const mode = el.getAttribute("data-split") || "words";
      const types = mode.indexOf("chars") === 0 ? "lines, chars" : "lines, words";
      const split = new SplitType(el, { types: types, tagName: "span" });
      if (split.lines) {
        split.lines.forEach((line) => line.classList.add("split-line"));
      }
      if (split.words) {
        split.words.forEach((word) => word.classList.add("split-word"));
      }
      if (split.chars) {
        split.chars.forEach((char) => char.classList.add("split-char"));
      }

      if (!motionOk()) return;

      if (mode === "chars-scrub" && split.chars && split.chars.length) {
        const section = el.closest(".manifesto") || el;
        /* Scrub leaves glyphs mid-travel on short mobile scrolls — play once instead */
        if (isMobile()) {
          gsap.from(split.chars, {
            yPercent: 110,
            duration: 0.85,
            stagger: { each: 0.02, from: "random" },
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              once: true
            }
          });
        } else {
          gsap.set(split.chars, { yPercent: 120 });
          gsap.to(split.chars, {
            yPercent: 0,
            ease: "power3.out",
            stagger: { each: 0.05, from: "random" },
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
              end: "center 40%",
              scrub: true
            }
          });
        }
      } else if (mode === "chars" && split.chars && split.chars.length) {
        gsap.set(split.chars, { yPercent: 120 });
        gsap.to(split.chars, {
          yPercent: 0,
          duration: 1,
          stagger: { each: 0.028, from: "random" },
          ease: "power3.out",
          delay: 0.18
        });
      } else if (split.words && split.words.length) {
        gsap.from(split.words, {
          yPercent: 110,
          opacity: 0,
          duration: 0.9,
          stagger: 0.045,
          ease: "power3.out",
          delay: 0.15
        });
      }
    });
  }

  function initHeroIntro() {
    if (!motionOk() || typeof gsap === "undefined") return;
    const bits = $$(".hero-lockup, .hero-scroll");
    if (!bits.length) return;
    gsap.from(bits, {
      y: 24,
      opacity: 0,
      duration: 1.1,
      stagger: 0.12,
      delay: 0.2,
      ease: "power3.out"
    });
  }

  function initHeroParallax() {
    const video = $(".hero-video");
    if (video) {
      if (!motionOk()) {
        video.pause();
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.15 }
      );
      io.observe(video);
      return;
    }

    const img = $(".hero-media img");
    if (!img || !motionOk() || isMobile() || typeof gsap === "undefined") return;
    gsap.fromTo(
      img,
      { scale: 1.08, yPercent: 0 },
      {
        scale: 1.18,
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      }
    );
  }

  function initWorkGrid() {
    const section = $(".work");
    if (!section) return;

    const intro = $(".work-intro", section);
    const track = $(".work-track", section);
    const scroller = $(".work-scroller", section);
    const cards = $$(".work-card", section);

    const nativeScroll = () => {
      section.classList.add("is-native-scroll");
      section.classList.remove("is-pinned-scroll");
    };

    if (!track || !scroller || !cards.length) {
      nativeScroll();
      return;
    }

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || !motionOk() || isMobile()) {
      nativeScroll();
      return;
    }

    section.classList.add("is-pinned-scroll");
    section.classList.remove("is-native-scroll");

    if (intro) {
      gsap.from(intro.children, {
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: "power2.out",
        scrollTrigger: { trigger: intro, start: "top 82%", once: true }
      });
    }

    const getX = () => Math.min(0, scroller.clientWidth - track.scrollWidth);

    if (Math.abs(getX()) < 48) {
      nativeScroll();
      return;
    }

    gsap.set(track, { x: 0, force3D: true });
    gsap.to(track, {
      x: getX,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + Math.max(window.innerHeight * 0.85, Math.abs(getX())),
        pin: true,
        scrub: 0.65,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });
  }

  function initSurfer() {
    const pin = $(".surfer-pin");
    const track = $("[data-surfer-track]");
    const cards = $$("[data-surfer-card]", track || document);
    if (!pin || !track || !cards.length || typeof gsap === "undefined") return;

    if (!motionOk() || isMobile()) return;

    const n = cards.length;
    const stepX = 240;
    const stepY = -84;
    const stepZ = -288;

    gsap.set(track, { x: 0, y: 0, z: 0, force3D: true });
    cards.forEach((card, i) => {
      gsap.set(card, {
        x: i * stepX,
        y: i * stepY,
        z: i * stepZ,
        rotationY: -50,
        scale: 1,
        transformOrigin: "50% 50%",
        force3D: true
      });
    });

    gsap.to(track, {
      x: -n * stepX,
      y: -n * stepY,
      z: -n * stepZ,
      ease: "none",
      scrollTrigger: {
        trigger: pin,
        start: "top top",
        end: "+=" + n * 560,
        pin: true,
        scrub: 0.65,
        anticipatePin: 1
      }
    });

    const scales = cards.map((card) =>
      gsap.quickTo(card, "scale", { duration: 0.35, ease: "power3.out" })
    );

    const onMove = (e) => {
      const mx = e.clientX;
      const my = e.clientY;
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const dx = mx - (r.left + r.width / 2);
        const dy = my - (r.top + r.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const t = Math.max(0, 1 - dist / 380);
        const s = 1 + t * 0.48;
        scales[i](s);
        card.classList.toggle("is-hot", t > 0.35);
      });
    };

    const onLeave = () => {
      cards.forEach((card, i) => {
        scales[i](1);
        card.classList.remove("is-hot");
      });
    };

    pin.addEventListener("mousemove", onMove);
    pin.addEventListener("mouseleave", onLeave);
  }

  function initSlideMask() {
    const pin = $(".spotlight-pin");
    const media = $(".spotlight-media");
    const img = media ? $("img", media) : null;
    const copy = $(".spotlight-copy");
    if (!pin || !media) return;
    if (typeof gsap === "undefined") return;

    if (!motionOk() || isMobile()) {
      media.style.clipPath = "none";
      return;
    }

    const baseWheel = 0.8;
    const pinnedWheel = 0.42;
    const setWheel = (mult) => {
      const lenis = window.RT && window.RT.lenis;
      if (lenis && lenis.options) lenis.options.wheelMultiplier = mult;
    };

    /* Longer pin + lagged scrub so trackpad/mouse flicks cannot skip the reveal */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pin,
        start: "top top",
        end: () => "+=" + Math.round(window.innerHeight * 4.5),
        pin: true,
        scrub: 1.25,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        fastScrollEnd: false,
        preventOverlaps: true,
        onToggle(self) {
          setWheel(self.isActive ? pinnedWheel : baseWheel);
        },
        onKill() {
          setWheel(baseWheel);
        }
      }
    });
    tl.fromTo(
      media,
      { clipPath: "inset(18% 32% 18% 32%)" },
      { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
      0
    );
    if (img) tl.fromTo(img, { scale: 1.05 }, { scale: 1.16, ease: "none" }, 0);
    if (copy) tl.fromTo(copy, { y: 48, opacity: 0.55 }, { y: 0, opacity: 1, ease: "none" }, 0);
  }

  function initRail() {
    const rail = $("#rail");
    const startAt = $("#stats") || $("#work");
    if (!rail || !startAt || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    if (isMobile() || !motionOk()) return;

    gsap.set(rail, { x: 90, yPercent: -50 });
    ScrollTrigger.create({
      trigger: startAt,
      start: "top 40%",
      onEnter() {
        rail.classList.add("is-in");
        gsap.to(rail, { x: 0, yPercent: -50, duration: 0.6, ease: "power3.out" });
      },
      onLeaveBack() {
        rail.classList.remove("is-in");
        gsap.to(rail, { x: 90, yPercent: -50, duration: 0.4, ease: "power2.in" });
      }
    });
  }

  function initTicker() {
    const track = $("[data-ticker]");
    if (!track || typeof gsap === "undefined") return;
    if (!motionOk()) return;

    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 28,
      ease: "none",
      repeat: -1
    });

    let lastY = window.scrollY;
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        const down = y >= lastY;
        gsap.to(tween, { timeScale: down ? 1 : -1, duration: 0.35, overwrite: true });
        lastY = y;
      },
      { passive: true }
    );
  }

  function initParallax() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    initHeroParallax();
    initWorkGrid();
    initSlideMask();
    initRail();

    const pageHeroImg = $(".page-hero img");
    if (pageHeroImg && motionOk() && !isMobile()) {
      gsap.fromTo(
        pageHeroImg,
        { scale: 1.06 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".page-hero",
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        }
      );
    }
  }

  function initCounters() {
    const items = $$("[data-count]");
    if (!items.length) return;

    const animate = (el) => {
      const target = parseFloat(el.getAttribute("data-count"));
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const prefix = el.getAttribute("data-prefix") || "";
      const suffix = el.getAttribute("data-suffix") || "";
      if (!motionOk() || typeof gsap === "undefined") {
        el.textContent = prefix + (decimals ? target.toFixed(decimals) : String(target)) + suffix;
        return;
      }
      const obj = { n: 0 };
      gsap.to(obj, {
        n: target,
        duration: 1.8,
        ease: "power2.out",
        onUpdate() {
          const val = decimals ? obj.n.toFixed(decimals) : Math.round(obj.n).toLocaleString("en-PK");
          el.textContent = prefix + val + suffix;
        }
      });
    };

    if (typeof IntersectionObserver === "undefined") {
      items.forEach(animate);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    items.forEach((el) => io.observe(el));
  }

  function initFilters() {
    const buttons = $$("[data-filter]");
    const cards = $$("[data-cat]");
    if (!buttons.length || !cards.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const key = btn.getAttribute("data-filter");
        cards.forEach((card) => {
          const show = key === "all" || card.getAttribute("data-cat") === key;
          card.classList.toggle("is-hidden", !show);
          if (show && motionOk() && typeof gsap !== "undefined") {
            gsap.fromTo(card, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
          }
        });
      });
    });
  }

  function initGallery(root) {
    const gallery = root || $(".gallery");
    if (!gallery) return;
    const track = $(".gallery-track", gallery);
    const slides = $$("img", track);
    const count = $("[data-gallery-count]", gallery);
    const prev = $("[data-gallery-prev]", gallery);
    const next = $("[data-gallery-next]", gallery);
    if (!track || !slides.length) return;

    const ui = $(".gallery-ui", gallery);
    if (slides.length < 2) {
      if (prev) prev.hidden = true;
      if (next) next.hidden = true;
      if (ui) ui.hidden = true;
      if (count) count.textContent = "1 / 1";
      return;
    }

    let i = 0;
    const render = () => {
      track.style.transform = "translateX(" + -i * 100 + "%)";
      if (count) count.textContent = i + 1 + " / " + slides.length;
    };
    render();
    if (prev) {
      prev.addEventListener("click", () => {
        i = (i - 1 + slides.length) % slides.length;
        render();
      });
    }
    if (next) {
      next.addEventListener("click", () => {
        i = (i + 1) % slides.length;
        render();
      });
    }

    let startX = 0;
    track.addEventListener("pointerdown", (e) => {
      startX = e.clientX;
    });
    track.addEventListener("pointerup", (e) => {
      const dx = e.clientX - startX;
      if (Math.abs(dx) < 40) return;
      i = dx < 0 ? (i + 1) % slides.length : (i - 1 + slides.length) % slides.length;
      render();
    });
  }

  function initTabs(root) {
    const wrap = root || $("[data-tabs]");
    if (!wrap) return;
    const tabs = $$("[data-tab]", wrap);
    const panels = $$("[data-panel]", wrap);
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.getAttribute("data-tab");
        tabs.forEach((t) => t.classList.remove("is-active"));
        panels.forEach((p) => p.classList.remove("is-active"));
        tab.classList.add("is-active");
        const panel = $('[data-panel="' + id + '"]', wrap);
        if (panel) panel.classList.add("is-active");
      });
    });
  }

  function initNewsletter() {
    const form = $("#newsletter-form");
    if (!form) return;
    const action = (form.getAttribute("action") || "").toLowerCase();
    if (form.method && form.method.toLowerCase() === "post" && action.indexOf("http") === 0) {
      return;
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (form.querySelector('input[type="email"]') || {}).value || "";
      const note = form.parentElement.querySelector(".newsletter-note");
      const subject = encodeURIComponent("Website enquiry");
      const body = encodeURIComponent("Please add this address to the RealTek list: " + email);
      window.location.href = "mailto:info@realtek.pk?subject=" + subject + "&body=" + body;
      if (note) note.textContent = "Your email app will open to complete this with info@realtek.pk.";
    });
  }

  function renderHomeProjects() {
    const grid = $("#project-grid");
    if (!grid || !window.RT || !RT.PROJECTS) return;
    const rank = { available: 0, upcoming: 1, sold: 2 };
    const ordered = [...RT.PROJECTS].sort((a, b) => {
      const d = (rank[a.filter] || 9) - (rank[b.filter] || 9);
      return d !== 0 ? d : String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
    });
    grid.innerHTML = ordered
      .map((p) => {
        const badgeClass = /live/i.test(p.status)
            ? " badge-soon"
            : p.filter === "upcoming"
            ? " badge-soon"
            : /80%|reserv/i.test(p.status)
              ? " badge-reserved"
              : p.filter === "available"
                ? " badge-available"
                : "";
        return (
          '<a class="project-card" href="project.html?id=' +
          encodeURIComponent(p.id) +
          '" data-cat="' +
          p.filter +
          '">' +
          '<div class="project-card-media">' +
          '<img src="' +
          p.image +
          '" alt="' +
          p.name +
          ", " +
          p.location +
          '" loading="lazy" width="760" height="1024">' +
          '<span class="badge' +
          badgeClass +
          '">' +
          p.status +
          "</span></div>" +
          '<p class="project-card-loc">' +
          p.location +
          "</p>" +
          "<h3>" +
          p.name +
          "</h3>" +
          '<p class="project-card-cta"><span>View Details</span></p>' +
          "</a>"
        );
      })
      .join("");

    if (typeof gsap !== "undefined" && motionOk()) {
      const cards = $$(".project-card", grid);
      if (cards.length) {
        gsap.from(cards, {
          y: 16,
          opacity: 0,
          duration: 0.4,
          stagger: 0.04,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: { trigger: grid, start: "top 88%", once: true }
        });
      }
    }
  }

  function initAnchorScroll(lenis) {
    const scrollToHash = (hash, immediate) => {
      if (!hash || hash === "#") return false;
      let id = hash;
      try {
        id = decodeURIComponent(hash);
      } catch (err) {
        id = hash;
      }
      const target = document.querySelector(id);
      if (!target) return false;
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(target, { immediate: !!immediate, offset: 0 });
      } else {
        target.scrollIntoView({
          behavior: immediate || !motionOk() ? "auto" : "smooth"
        });
      }
      return true;
    };

    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const hash = link.getAttribute("href");
        if (!hash || hash === "#") return;
        if (scrollToHash(hash, false)) {
          e.preventDefault();
          if (history.pushState) history.pushState(null, "", hash);
        }
      });
    });

    if (location.hash) {
      requestAnimationFrame(() => scrollToHash(location.hash, true));
      window.addEventListener(
        "load",
        () => scrollToHash(location.hash, true),
        { once: true }
      );
    }
  }

  function initIntroSplash(onDone) {
    const splash = $("#intro-splash");
    const STORAGE_KEY = "realtek-intro-seen";
    let finished = false;
    let exitTimer;
    let doneTimer;
    let safety;

    const clear = () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      window.clearTimeout(safety);
    };

    const done = () => {
      if (finished) return;
      finished = true;
      clear();
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch (e) {}
      document.documentElement.classList.remove("intro-pending");
      if (splash) splash.remove();
      onDone();
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("resize"));
        if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
      });
    };

    if (!splash) {
      document.documentElement.classList.remove("intro-pending");
      onDone();
      return;
    }

    let skip = false;
    try {
      skip =
        sessionStorage.getItem(STORAGE_KEY) === "1" ||
        new URLSearchParams(location.search).get("skipIntro") === "1";
    } catch (e) {}

    if (skip || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done();
      return;
    }

    if (!document.documentElement.classList.contains("intro-pending")) {
      document.documentElement.classList.add("intro-pending");
    }

    exitTimer = window.setTimeout(() => {
      splash.classList.add("is-exit");
    }, 1400);
    doneTimer = window.setTimeout(done, 2150);
    safety = window.setTimeout(done, 3000);

    splash.addEventListener(
      "animationend",
      (e) => {
        if (e.animationName === "intro-fade-out") done();
      },
      { once: true }
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLoadBar();
    initHeader();
    initIntroSplash(() => {
      const lenis = initLenis();
      window.RT = window.RT || {};
      window.RT.lenis = lenis;
      window.dispatchEvent(new CustomEvent("rt:lenis"));
      initAnchorScroll(lenis);
      initSplit();
      initHeroIntro();
      initParallax();
      initTicker();
      initCounters();
      window.addEventListener(
        "load",
        () => {
          if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
        },
        { once: true }
      );
      renderHomeProjects();
      initFilters();
      initGallery();
      initTabs();
      initLightbox();
      initNewsletter();
    });
  });

  function initLightbox() {
    const box = $("#lightbox");
    if (!box) return;
    const img = $("[data-lightbox-img]", box);
    const cap = $("[data-lightbox-cap]", box);
    const figure = $(".lightbox-figure", box);
    if (!img || box.dataset.lbChrome) return;
    box.dataset.lbChrome = "1";

    let items = [];
    let index = 0;
    let scale = 1;
    let panX = 0;
    let panY = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastFocus = null;

    const applyTransform = () => {
      img.style.transform = "translate(" + panX + "px, " + panY + "px) scale(" + scale + ")";
    };

    const resetView = () => {
      scale = 1;
      panX = 0;
      panY = 0;
      applyTransform();
    };

    const show = (i) => {
      if (!items.length) return;
      index = (i + items.length) % items.length;
      const item = items[index];
      img.src = item.src;
      img.alt = item.alt;
      if (cap) cap.textContent = item.alt;
      resetView();
    };

    const open = (i) => {
      lastFocus = document.activeElement;
      show(i);
      box.hidden = false;
      document.body.style.overflow = "hidden";
      if (window.RT && RT.lenis && typeof RT.lenis.stop === "function") RT.lenis.stop();
      const closeBtn = $("[data-lightbox-close]", box);
      if (closeBtn) closeBtn.focus();
    };

    const close = () => {
      box.hidden = true;
      document.body.style.overflow = "";
      if (window.RT && RT.lenis && typeof RT.lenis.start === "function") RT.lenis.start();
      resetView();
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    };

    const zoomBy = (factor) => {
      const next = Math.min(4, Math.max(1, scale * factor));
      if (next === 1) {
        panX = 0;
        panY = 0;
      }
      scale = next;
      applyTransform();
    };

    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-lightbox]");
      if (!el || el.closest(".lightbox")) return;
      e.preventDefault();
      const group = el.getAttribute("data-lightbox-group");
      const pool = $$("[data-lightbox]").filter((t) =>
        group ? t.getAttribute("data-lightbox-group") === group : t === el
      );
      items = pool.map((t) => ({
        src: t.getAttribute("data-src") || ((t.querySelector("img") || {}).src || ""),
        alt: t.getAttribute("data-alt") || ((t.querySelector("img") || {}).alt || "")
      }));
      open(Math.max(0, pool.indexOf(el)));
    });

    const closeBtn = $("[data-lightbox-close]", box);
    const prevBtn = $("[data-lightbox-prev]", box);
    const nextBtn = $("[data-lightbox-next]", box);
    const zoomIn = $("[data-lightbox-zoom-in]", box);
    const zoomOut = $("[data-lightbox-zoom-out]", box);
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (prevBtn) prevBtn.addEventListener("click", () => show(index - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => show(index + 1));
    if (zoomIn) zoomIn.addEventListener("click", () => zoomBy(1.35));
    if (zoomOut) zoomOut.addEventListener("click", () => zoomBy(1 / 1.35));

    box.addEventListener("click", (e) => {
      if (e.target === box) close();
    });

    document.addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
      if (e.key === "+" || e.key === "=") zoomBy(1.35);
      if (e.key === "-" || e.key === "_") zoomBy(1 / 1.35);
    });

    box.addEventListener(
      "wheel",
      (e) => {
        if (box.hidden) return;
        e.preventDefault();
        zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12);
      },
      { passive: false }
    );

    const onDown = (e) => {
      if (scale <= 1 || !figure) return;
      dragging = true;
      figure.classList.add("is-dragging");
      startX = e.clientX;
      startY = e.clientY;
      lastX = panX;
      lastY = panY;
    };
    const onMove = (e) => {
      if (!dragging) return;
      panX = lastX + (e.clientX - startX);
      panY = lastY + (e.clientY - startY);
      applyTransform();
    };
    const onUp = () => {
      dragging = false;
      figure.classList.remove("is-dragging");
    };
    if (figure) {
      figure.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }
  }

  window.RT = window.RT || {};
  window.RT.initGallery = initGallery;
  window.RT.initTabs = initTabs;
  window.RT.initLightbox = initLightbox;
})();
