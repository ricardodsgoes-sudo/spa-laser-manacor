/* ===================================================================
   SPA LASER MANACOR — main.js (global)
   Scroll suave (Lenis) · reveals (IntersectionObserver) · contadores ·
   testimonios (Swiper) · menú móvil · header sticky.
   Tudo com guards: se um componente/CDN não existir, o resto funciona.
   =================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ----------------------------------------------------------------
     1. Ano no rodapé
     ---------------------------------------------------------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------------
     1b. Hero vídeo — respeita prefers-reduced-motion (pausa → mostra poster)
     ---------------------------------------------------------------- */
  const heroVideo = $(".hero__video");
  if (heroVideo && reduceMotion) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  }

  /* ----------------------------------------------------------------
     2. Header sticky — muda de estado ao rolar
     ---------------------------------------------------------------- */
  const header = $("#header");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 60);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ----------------------------------------------------------------
     3. Menú móvil (drawer)
     ---------------------------------------------------------------- */
  const navToggle = $("#navToggle");
  const mobileMenu = $("#mobileMenu");
  const navClose = $("#navClose");
  if (navToggle && mobileMenu) {
    const closeMenu = () => {
      navToggle.classList.remove("is-open");
      mobileMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };
    navToggle.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      mobileMenu.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    if (navClose) navClose.addEventListener("click", closeMenu);
    $$("a", mobileMenu).forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  }

  /* ----------------------------------------------------------------
     4. Reveals ao entrar no viewport (data-animate)
     ---------------------------------------------------------------- */
  const animatedEls = $$("[data-animate]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    animatedEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealIO = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    animatedEls.forEach((el) => revealIO.observe(el));
  }

  /* ----------------------------------------------------------------
     5. Contadores animados (data-count [data-decimals])
     ---------------------------------------------------------------- */
  const counters = $$("[data-count]");
  const formatNum = (val, decimals) =>
    decimals > 0 ? val.toFixed(decimals).replace(".", ",") : String(Math.round(val));

  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduceMotion) { el.textContent = formatNum(target, decimals); return; }
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = formatNum(target * eased, decimals);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = formatNum(target, decimals);
    };
    requestAnimationFrame(tick);
  };

  if (counters.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(runCounter);
    } else {
      const countIO = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { runCounter(entry.target); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach((el) => countIO.observe(el));
    }
  }

  /* ----------------------------------------------------------------
     6. Testimonios (Swiper) — só se a lib carregou
     ---------------------------------------------------------------- */
  if (typeof Swiper !== "undefined" && $("#testimonialsSwiper")) {
    new Swiper("#testimonialsSwiper", {
      slidesPerView: 1,
      spaceBetween: 24,
      grabCursor: true,
      autoplay: reduceMotion ? false : { delay: 5000, disableOnInteraction: false },
      pagination: { el: "#testimonialsSwiper .swiper-pagination", clickable: true },
      breakpoints: { 700: { slidesPerView: 2 }, 1000: { slidesPerView: 3 } },
    });
  }

  /* ----------------------------------------------------------------
     7. Scroll suave (Lenis) + parallax sutil (GSAP) — opcionais
     ---------------------------------------------------------------- */
  if (!reduceMotion && typeof Lenis !== "undefined") {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });

    if (typeof gsap !== "undefined" && gsap.ticker) {
      lenis.on("scroll", () => { if (window.ScrollTrigger) ScrollTrigger.update(); });
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    // Parallax sutil nas imagens emolduradas (welcome / featured)
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      $$(".welcome__media img, .featured__media img").forEach((img) => {
        gsap.fromTo(img, { yPercent: -4 }, {
          yPercent: 4, ease: "none",
          scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    }
  }

  /* ----------------------------------------------------------------
     8. Filtro por categoría (servicios .svc-card · galería .gal-tile)
     ---------------------------------------------------------------- */
  const filterTabs = $$(".filter-tab");
  const filterItems = $$(".svc-card, .gal-tile");
  const filterCount = $("#filterCount");
  const galEmpty = $("#galEmpty");
  if (filterTabs.length && filterItems.length) {
    const applyFilter = (cat) => {
      let shown = 0;
      filterItems.forEach((item) => {
        const show = cat === "todos" || item.dataset.cat === cat;
        item.classList.toggle("is-hidden", !show);
        if (show) shown++;
      });
      if (filterCount) filterCount.textContent = shown;
      if (galEmpty) galEmpty.hidden = shown > 0;
    };
    filterTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        filterTabs.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        applyFilter(tab.dataset.cat);
      });
    });
  }

  /* ----------------------------------------------------------------
     8b. Lightbox da galería — só se existir
     ---------------------------------------------------------------- */
  const lightbox = $("#lightbox");
  const galGrid = $("#galGrid");
  if (lightbox && galGrid) {
    const lbImg = $("#lbImg", lightbox);
    const lbCap = $("#lbCap", lightbox);
    const lbClose = $("#lbClose", lightbox);
    const lbPrev = $("#lbPrev", lightbox);
    const lbNext = $("#lbNext", lightbox);
    let group = [];        // tiles visíveis no momento da abertura
    let current = 0;
    let lastFocused = null;

    const render = () => {
      const tile = group[current];
      if (!tile) return;
      lbImg.src = tile.dataset.full;
      lbImg.alt = tile.dataset.capTitle || "";
      lbCap.innerHTML = `<b>${tile.dataset.capCat || ""}</b>${tile.dataset.capTitle || ""}`;
    };
    const openAt = (tile) => {
      // só navega entre as tiles atualmente visíveis (respeita o filtro)
      group = $$(".gal-tile", galGrid).filter((t) => !t.classList.contains("is-hidden"));
      current = group.indexOf(tile);
      if (current < 0) return;
      lastFocused = tile;
      render();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      lbClose.focus();
    };
    const close = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    };
    const step = (dir) => {
      if (!group.length) return;
      current = (current + dir + group.length) % group.length;
      render();
    };

    galGrid.addEventListener("click", (e) => {
      const tile = e.target.closest(".gal-tile");
      if (tile) openAt(tile);
    });
    lbClose.addEventListener("click", close);
    lbPrev.addEventListener("click", () => step(-1));
    lbNext.addEventListener("click", () => step(1));
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
  }

  /* ----------------------------------------------------------------
     8b. FAQ — acordeão acessível (1 aberto por vez)
     Alterna .is-open + aria-expanded; a altura é animada no CSS.
     ---------------------------------------------------------------- */
  const faq = $("[data-faq]");
  if (faq) {
    const items = $$(".faq__item", faq);
    faq.addEventListener("click", (e) => {
      const btn = e.target.closest(".faq__q");
      if (!btn) return;
      const item = btn.closest(".faq__item");
      const willOpen = !item.classList.contains("is-open");
      // fecha todos (comportamento clássico de FAQ)
      items.forEach((it) => {
        it.classList.remove("is-open");
        const q = it.querySelector(".faq__q");
        if (q) q.setAttribute("aria-expanded", "false");
      });
      if (willOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  }

  /* ----------------------------------------------------------------
     9. Âncoras internas com offset do header (se houver no futuro)
     ---------------------------------------------------------------- */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }
      }
    });
  });
})();
