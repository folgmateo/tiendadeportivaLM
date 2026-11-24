/* TiendaDeportivaLM — catálogo, carrito y animaciones de la tienda */
(() => {
  "use strict";

  const WHATSAPP = "50254870255"; // +502 5487 0255
  const CART_KEY = "tdlm_carrito_v1";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const $ = (s, r = document) => r.querySelector(s);
  const { formatoQ, rutaImagen } = window.Inventario;

  window.TDLM = { heroProgress: 0, reduced, mouseX: 0, mouseY: 0 };
  $("#year").textContent = new Date().getFullYear();

  /* ================= estado ================= */
  let productos = window.Inventario.cargar();
  let carrito = leerCarrito();
  let categoria = "Todos";
  let busqueda = "";

  function leerCarrito() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; }
  }
  function guardarCarrito() {
    localStorage.setItem(CART_KEY, JSON.stringify(carrito));
    pintarCarrito();
  }
  const porId = (id) => productos.find((p) => p.id === id);
  const escapar = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const normalizar = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  /* ================= filtros ================= */
  const filtros = $("#filtros");
  function pintarFiltros() {
    const cats = ["Todos", ...new Set(productos.map((p) => p.categoria))];
    if (!cats.includes(categoria)) categoria = "Todos";
    filtros.innerHTML = cats.map((c) =>
      `<button class="chip" type="button" aria-pressed="${c === categoria}" data-cat="${escapar(c)}">${escapar(c)}</button>`).join("");
  }
  filtros.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    categoria = b.dataset.cat;
    pintarFiltros();
    pintarProductos(true);
  });
  $("#buscar").addEventListener("input", (e) => { busqueda = normalizar(e.target.value.trim()); pintarProductos(true); });

  /* ================= productos ================= */
  const grid = $("#grid");
  function pintarProductos(animar = false) {
    const lista = productos.filter((p) =>
      (categoria === "Todos" || p.categoria === categoria) &&
      (!busqueda || normalizar(`${p.nombre} ${p.categoria} ${p.descripcion || ""}`).includes(busqueda)));
    $("#vacio").hidden = lista.length > 0;
    grid.innerHTML = lista.map((p) => {
      const agotado = p.stock <= 0;
      const enCarrito = carrito[p.id] || 0;
      const badge = agotado ? '<span class="badge badge--out">Agotado</span>'
        : p.stock <= 5 ? `<span class="badge badge--low">¡Quedan ${p.stock}!</span>`
        : `<span class="badge">${p.stock} disponibles</span>`;
      return `
        <article class="card${agotado ? " is-out" : ""}" data-id="${escapar(p.id)}">
          <div class="card__media">
            <img src="${escapar(rutaImagen(p.imagen))}" alt="${escapar(p.nombre)}" loading="lazy" width="600" height="600">
            ${badge}
          </div>
          <div class="card__body">
            <span class="card__cat">${escapar(p.categoria)}</span>
            <h3 class="card__name">${escapar(p.nombre)}</h3>
            <p class="card__desc">${escapar(p.descripcion || "")}</p>
            <div class="card__row">
              <span class="card__price">${formatoQ(p.precio)}</span>
              <button class="btn btn--orange" type="button" data-add="${escapar(p.id)}" ${agotado || enCarrito >= p.stock ? "disabled" : ""}>
                ${agotado ? "Agotado" : enCarrito >= p.stock ? "Máximo" : "Agregar"}
              </button>
            </div>
          </div>
        </article>`;
    }).join("");
    activarTilt();
    if (animar && hasGsap && !reduced) {
      gsap.fromTo(grid.children, { y: 30, autoAlpha: 0, scale: .96 }, { y: 0, autoAlpha: 1, scale: 1, duration: .55, stagger: .05, ease: "power3.out" });
    }
  }

  grid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (!b || b.disabled) return;
    const p = porId(b.dataset.add);
    if (!p) return;
    carrito[p.id] = Math.min((carrito[p.id] || 0) + 1, p.stock);
    guardarCarrito();
    pintarProductos();
    avisar(`${p.nombre} se agregó al carrito`);
    if (hasGsap && !reduced) {
      gsap.fromTo("#cart-count", { scale: 1.8 }, { scale: 1, duration: .6, ease: "elastic.out(1, .4)" });
      volarAlCarrito(b.closest(".card").querySelector("img"));
    }
  });

  function volarAlCarrito(img) {
    const a = img.getBoundingClientRect();
    const b = $("#cart-open").getBoundingClientRect();
    const clon = img.cloneNode();
    Object.assign(clon.style, { position: "fixed", left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px", borderRadius: "16px", zIndex: 150, pointerEvents: "none", objectFit: "cover" });
    document.body.appendChild(clon);
    gsap.to(clon, {
      left: b.left + b.width / 2 - 20, top: b.top + b.height / 2 - 20, width: 40, height: 40, borderRadius: "50%", rotate: 20,
      duration: .8, ease: "power3.in", onComplete: () => clon.remove(),
    });
  }

  /* ================= carrito ================= */
  const cartEl = $("#cart");
  const cartBtn = $("#cart-open");
  let ultimoFoco = null;

  function pintarCarrito() {
    // limpia productos que ya no existen y ajusta al stock disponible
    for (const id of Object.keys(carrito)) {
      const p = porId(id);
      if (!p || p.stock <= 0) delete carrito[id];
      else if (carrito[id] > p.stock) carrito[id] = p.stock;
    }
    const ids = Object.keys(carrito);
    const unidades = ids.reduce((n, id) => n + carrito[id], 0);
    const total = ids.reduce((n, id) => n + carrito[id] * porId(id).precio, 0);
    $("#cart-count").textContent = unidades;
    $("#cart-total").textContent = formatoQ(total);
    $("#cart-send").disabled = unidades === 0;
    $("#cart-items").innerHTML = ids.length === 0
      ? '<p class="cart__empty">Tu carrito está vacío. Agrega productos desde el catálogo.</p>'
      : ids.map((id) => {
        const p = porId(id);
        return `
          <div class="line-item">
            <img src="${escapar(rutaImagen(p.imagen))}" alt="">
            <div><h3>${escapar(p.nombre)}</h3><p>${formatoQ(p.precio)} c/u</p></div>
            <div class="qty">
              <button type="button" data-dec="${escapar(id)}" aria-label="Quitar uno de ${escapar(p.nombre)}">−</button>
              <output aria-label="Cantidad">${carrito[id]}</output>
              <button type="button" data-inc="${escapar(id)}" aria-label="Agregar uno de ${escapar(p.nombre)}" ${carrito[id] >= p.stock ? "disabled" : ""}>+</button>
            </div>
          </div>`;
      }).join("");
  }

  $("#cart-items").addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    if (inc) { const p = porId(inc.dataset.inc); carrito[p.id] = Math.min(carrito[p.id] + 1, p.stock); }
    else if (dec) { const id = dec.dataset.dec; carrito[id] -= 1; if (carrito[id] <= 0) delete carrito[id]; }
    else return;
    guardarCarrito();
    pintarProductos();
  });

  function abrirCarrito() {
    ultimoFoco = document.activeElement;
    cartEl.hidden = false;
    document.body.style.overflow = "hidden";
    if (hasGsap && !reduced) {
      gsap.fromTo(".cart__panel", { xPercent: 100 }, { xPercent: 0, duration: .55, ease: "expo.out" });
      gsap.fromTo(".cart__backdrop", { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 });
    }
    cartEl.querySelector(".icon-btn").focus();
  }
  function cerrarCarrito() {
    const fin = () => { cartEl.hidden = true; document.body.style.overflow = ""; ultimoFoco && ultimoFoco.focus(); };
    if (hasGsap && !reduced) {
      gsap.to(".cart__panel", { xPercent: 100, duration: .4, ease: "power3.in" });
      gsap.to(".cart__backdrop", { autoAlpha: 0, duration: .3, onComplete: fin });
    } else fin();
  }
  cartBtn.addEventListener("click", abrirCarrito);
  cartEl.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) cerrarCarrito(); });
  document.addEventListener("keydown", (e) => {
    if (cartEl.hidden) return;
    if (e.key === "Escape") cerrarCarrito();
    if (e.key === "Tab") { // mantiene el foco dentro del carrito
      const f = [...cartEl.querySelectorAll("button:not([disabled])")];
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  $("#cart-send").addEventListener("click", () => {
    const ids = Object.keys(carrito);
    if (!ids.length) return;
    let total = 0;
    const lineas = ids.map((id) => {
      const p = porId(id);
      const sub = p.precio * carrito[id];
      total += sub;
      return `• ${carrito[id]} x ${p.nombre} — ${formatoQ(sub)}`;
    });
    const texto = ["Hola, quiero hacer este pedido en TiendaDeportivaLM:", ...lineas, `Total: ${formatoQ(total)}`, "", "¿Me confirman disponibilidad y entrega?"].join("\n");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
    avisar("Abriendo WhatsApp con tu pedido…");
  });

  /* ================= aviso ================= */
  let tAviso;
  function avisar(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(tAviso);
    tAviso = setTimeout(() => t.classList.remove("is-on"), 2600);
  }

  /* ================= inventario siempre al día ================= */
  let primeraCarga = true;
  function recargarInventario() {
    const nuevo = window.Inventario.cargar();
    if (JSON.stringify(nuevo) === JSON.stringify(productos)) return;
    productos = nuevo;
    pintarFiltros(); pintarProductos(); pintarCarrito();
    if (!primeraCarga) avisar("Inventario actualizado");
  }
  // misma pestaña (sincronización con la hoja) y otras pestañas (panel del dueño)
  window.addEventListener("inventario:cambio", recargarInventario);
  window.addEventListener("storage", (e) => { if (e.key === window.Inventario.KEY || e.key === null) recargarInventario(); });

  // Google Sheets: al abrir, cada pocos segundos y al volver a la pestaña
  if (window.Inventario.remoto) {
    const sync = () => window.Inventario.sincronizar().catch(() => { /* sin conexión: se mantiene la última copia */ }).finally(() => { primeraCarga = false; });
    sync();
    setInterval(() => { if (!document.hidden) sync(); }, window.Inventario.refrescoMs);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) sync(); });
  } else {
    primeraCarga = false;
  }

  /* ================= acceso oculto del dueño: 5 toques seguidos al logo del pie ================= */
  {
    let toques = 0, tToques;
    const ir = () => { location.href = (window.TDLM_CONFIG || {}).PANEL || "panel-fox2gjmz/"; };
    document.querySelector(".footer__brand").addEventListener("click", (e) => {
      e.preventDefault();
      toques += 1;
      clearTimeout(tToques);
      tToques = setTimeout(() => { toques = 0; }, 1500);
      if (toques >= 5) { toques = 0; ir(); }
    });
  }

  /* ================= tilt 3D de tarjetas ================= */
  function activarTilt() {
    if (!finePointer || reduced) return;
    grid.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - .5) * 10}deg`);
        card.style.setProperty("--rx", `${(.5 - (e.clientY - r.top) / r.height) * 10}deg`);
      });
      card.addEventListener("pointerleave", () => { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
    });
  }

  /* ================= nav ================= */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40 && window.scrollY > (window.TDLM.pinEnd || 0) - 80);
  window.addEventListener("scroll", onScroll, { passive: true });

  if (finePointer) {
    window.addEventListener("pointermove", (e) => {
      window.TDLM.mouseX = (e.clientX / innerWidth) * 2 - 1;
      window.TDLM.mouseY = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
  }

  pintarFiltros();
  pintarProductos();
  pintarCarrito();
  onScroll();

  if (!hasGsap || reduced) return;

  /* ================= animaciones (GSAP + Lenis) ================= */
  gsap.registerPlugin(ScrollTrigger);
  if (typeof window.Lenis !== "undefined") {
    const lenis = new Lenis({ lerp: .1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const el = id.length > 1 && document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(id === "#inicio" ? 0 : el, { offset: -70, duration: 1.3 });
    }));
  }

  // título del hero letra por letra
  const chars = [];
  document.querySelectorAll(".hero__title .line").forEach((line) => {
    const txt = line.textContent;
    line.setAttribute("aria-hidden", "true");
    line.innerHTML = [...txt].map((c) => `<span class="char">${c === " " ? "&nbsp;" : c}</span>`).join("");
    chars.push(...line.children);
  });
  $(".hero__title").setAttribute("aria-label", "Equípate para ganar");

  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from(".hero__tag", { scale: 0, rotate: -30, duration: .9, ease: "back.out(2.5)" }, .2)
    .from(chars, { yPercent: 120, rotate: 10, duration: 1.1, stagger: .03 }, .3)
    .from(".hero__lede", { y: 30, autoAlpha: 0, duration: 1 }, .8)
    .from(".hero__cta .btn", { y: 24, autoAlpha: 0, duration: .9, stagger: .1 }, .95)
    .from(".nav > *", { y: -30, autoAlpha: 0, duration: .8, stagger: .08 }, .5)
    .from(".hero__hint", { autoAlpha: 0, duration: 1 }, 1.4);

  // Hero fijado breve: giro 360° + explosión del balón (js/escena.js)
  gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".hero", start: "top top", end: innerWidth < 860 ? "+=110%" : "+=130%",
      pin: true, scrub: true, anticipatePin: 1,
      onUpdate: (self) => { window.TDLM.heroProgress = self.progress; },
      onRefresh: (self) => { window.TDLM.pinEnd = self.end; onScroll(); },
    },
  })
    .fromTo(".hero__content", { y: 0, autoAlpha: 1 }, { y: -90, autoAlpha: 0, duration: .15, ease: "none", immediateRender: false }, 0)
    .fromTo(".hero__hint", { autoAlpha: 1 }, { autoAlpha: 0, duration: .05, immediateRender: false }, 0)
    .set({}, {}, 1);

  // ticker que acelera con el scroll
  const ticker = gsap.to(".ticker__track", { xPercent: -50, duration: 20, ease: "none", repeat: -1 });
  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = gsap.utils.clamp(-5, 5, self.getVelocity() / 300);
      gsap.to(ticker, { timeScale: 1 + Math.abs(v), duration: .3, overwrite: true });
      gsap.to(ticker, { timeScale: 1, duration: 1, delay: .3 });
    },
  });

  document.querySelectorAll(".reveal-title").forEach((h) => {
    h.innerHTML = `<span class="ln"><span>${h.innerHTML}</span></span>`;
    gsap.from(h.querySelector(".ln > span"), { yPercent: 110, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 88%" } });
  });
  ScrollTrigger.batch(".reveal", {
    start: "top 90%", once: true,
    onEnter: (els) => gsap.from(els, { y: 40, autoAlpha: 0, duration: .9, stagger: .12, ease: "power3.out" }),
  });
  gsap.from(".chip", { y: 20, autoAlpha: 0, duration: .6, stagger: .05, ease: "back.out(2)", scrollTrigger: { trigger: "#filtros", start: "top 90%" } });
  ScrollTrigger.batch(".card", {
    start: "top 92%", once: true,
    onEnter: (els) => gsap.from(els, { y: 70, rotateX: -15, autoAlpha: 0, duration: 1, stagger: .08, ease: "expo.out", clearProps: "transform" }),
  });

  gsap.fromTo(".banner__img", { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".banner", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".banner", { clipPath: "inset(8% 6% 8% 6% round 32px)", ease: "none", scrollTrigger: { trigger: ".banner", start: "top bottom", end: "top 30%", scrub: true } });

  if (finePointer) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: .6, ease: "elastic.out(1, .4)" });
      const yTo = gsap.quickTo(el, "y", { duration: .6, ease: "elastic.out(1, .4)" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .3);
        yTo((e.clientY - r.top - r.height / 2) * .35);
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
