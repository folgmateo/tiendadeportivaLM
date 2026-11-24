/* TiendaDeportivaLM — catálogo, carrito y movimiento */
(() => {
  "use strict";

  const WHATSAPP = "50254870255"; // +502 5487 0255
  const CART_KEY = "tdlm_carrito_v1";
  const SPOT_ID = "p2"; // producto del escaparate 3D (balón de fútbol)
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const $ = (s, r = document) => r.querySelector(s);
  const { formatoQ, rutaImagen } = window.Inventario;

  window.TDLM = { spot: 0, reduced };
  $("#year").textContent = new Date().getFullYear();

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const ICON_MINUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>';
  const ICON_PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12M12 6v12"/></svg>';

  /* ================= estado ================= */
  let productos = window.Inventario.cargar();
  let carrito = leerCarrito();
  let categoria = "Todos";
  let busqueda = "";
  let orden = "rec";

  function leerCarrito() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; }
  }
  function guardarCarrito() {
    localStorage.setItem(CART_KEY, JSON.stringify(carrito));
    pintarCarrito();
  }
  const porId = (id) => productos.find((p) => p.id === id);
  const baseId = (k) => k.split(":")[0];
  const colorDe = (k) => k.split(":")[1] || "";
  const enCarritoDe = (id) => Object.keys(carrito).filter((k) => baseId(k) === id).reduce((n, k) => n + carrito[k], 0);
  // fotos de ambiente para "Compra por deporte" (generadas con IA; reemplázalas por fotos reales)
  const FOTO_CATEGORIA = { Running: "assets/img/cat-running.webp", "Fútbol": "assets/img/cat-futbol.webp", Baloncesto: "assets/img/cat-baloncesto.webp", Gimnasio: "assets/img/cat-gimnasio.webp", Accesorios: "assets/img/cat-accesorios.webp" };
  const categorias = () => window.Inventario.CATEGORIAS.filter((c) => productos.some((p) => p.categoria === c))
    .concat([...new Set(productos.map((p) => p.categoria))].filter((c) => !window.Inventario.CATEGORIAS.includes(c)));

  /* ================= compra por deporte ================= */
  function pintarDeportes() {
    $("#sports-rail").innerHTML = categorias().map((c) => {
      const items = productos.filter((p) => p.categoria === c);
      const foto = FOTO_CATEGORIA[c] || rutaImagen((items.find((p) => p.imagen) || items[0] || {}).imagen);
      return `<button class="sport" type="button" data-cat="${esc(c)}">
          <div class="sport__img"><img src="${esc(foto)}" alt="" loading="lazy" width="800" height="1000"></div>
          <div class="sport__label">${esc(c)}<span>${items.length} ${items.length === 1 ? "producto" : "productos"}</span></div>
        </button>`;
    }).join("");
    $("#footer-cats").innerHTML = categorias().map((c) => `<li><button class="link" type="button" data-cat="${esc(c)}">${esc(c)}</button></li>`).join("");
  }

  // cualquier elemento con data-cat filtra el catálogo y lleva hasta él
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-cat]");
    if (!el || el.classList.contains("chip")) return;
    e.preventDefault();
    elegirCategoria(el.dataset.cat);
    irA($("#productos"));
  });

  function elegirCategoria(c) {
    categoria = c;
    pintarFiltros();
    pintarProductos(true);
  }

  /* ================= filtros, búsqueda y orden ================= */
  const filtros = $("#filtros");
  function pintarFiltros() {
    const cats = ["Todos", ...categorias()];
    if (!cats.includes(categoria)) categoria = "Todos";
    filtros.innerHTML = cats.map((c) =>
      `<button class="chip" type="button" aria-pressed="${c === categoria}" data-filtro="${esc(c)}">${esc(c)}</button>`).join("");
    $("#catalog-title").textContent = categoria === "Todos" ? "Todos los productos" : categoria;
  }
  filtros.addEventListener("click", (e) => {
    const b = e.target.closest("[data-filtro]");
    if (b) elegirCategoria(b.dataset.filtro);
  });
  $("#buscar").addEventListener("input", (e) => { busqueda = norm(e.target.value.trim()); pintarProductos(true); });
  $("#orden").addEventListener("change", (e) => { orden = e.target.value; pintarProductos(true); });
  $("#search-open").addEventListener("click", () => {
    irA($("#productos"));
    setTimeout(() => $("#buscar").focus({ preventScroll: true }), reduced ? 0 : 700);
  });

  /* ================= catálogo ================= */
  const grid = $("#grid");
  function pintarProductos(animar = false) {
    let lista = productos.filter((p) =>
      (categoria === "Todos" || p.categoria === categoria) &&
      (!busqueda || norm(`${p.nombre} ${p.categoria} ${p.descripcion || ""}`).includes(busqueda)));
    if (orden === "asc") lista = [...lista].sort((a, b) => a.precio - b.precio);
    if (orden === "desc") lista = [...lista].sort((a, b) => b.precio - a.precio);

    $("#vacio").hidden = lista.length > 0;
    $("#catalog-count").textContent = `(${lista.length})`;
    grid.innerHTML = lista.map((p) => {
      const agotado = p.stock <= 0;
      const enCarrito = enCarritoDe(p.id);
      const stock = agotado ? '<p class="card__stock is-out">Agotado</p>'
        : p.stock <= 5 ? `<p class="card__stock">Quedan ${p.stock}</p>` : "";
      const lleno = !agotado && enCarrito >= p.stock;
      return `
        <article class="card${agotado ? " is-out" : ""}" data-id="${esc(p.id)}">
          <div class="card__media"><img src="${esc(rutaImagen(p.imagen))}" alt="${esc(p.nombre)}" loading="lazy" width="700" height="700"></div>
          <div class="card__body">
            <h3 class="card__name">${esc(p.nombre)}</h3>
            <p class="card__cat">${esc(p.categoria)}</p>
            <p class="card__price">${formatoQ(p.precio)}</p>
            ${stock}
            <div class="card__add">
              <button class="btn btn--dark" type="button" data-add="${esc(p.id)}" ${agotado || lleno ? "disabled" : ""}>
                ${agotado ? "Agotado" : lleno ? "Ya tienes todas las disponibles" : "Agregar al carrito"}
              </button>
            </div>
            <div class="admin-tools">
              <div class="admin-tools__row">
                <span>Existencias</span>
                <div class="stepper">
                  <button type="button" data-admin="menos" aria-label="Restar una unidad de ${esc(p.nombre)}" ${agotado ? "disabled" : ""}>${ICON_MINUS}</button>
                  <output aria-label="Existencias de ${esc(p.nombre)}">${p.stock}</output>
                  <button type="button" data-admin="mas" aria-label="Sumar una unidad de ${esc(p.nombre)}">${ICON_PLUS}</button>
                </div>
              </div>
              <div class="admin-tools__links">
                <button type="button" class="link-btn" data-admin="cantidad">Cambiar cantidad</button>
                <button type="button" class="link-btn" data-admin="precio">Cambiar precio</button>
                <button type="button" class="link-btn link-btn--danger" data-admin="borrar">Eliminar</button>
              </div>
            </div>
          </div>
        </article>`;
    }).join("");
    if (animar && hasGsap && !reduced) {
      gsap.fromTo(grid.children, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .03, ease: "power3.out", clearProps: "all" });
    }
  }

  grid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (b && !b.disabled) agregar(b.dataset.add);
  });

  function agregar(id, color) {
    const p = porId(id);
    if (!p || p.stock <= 0) return;
    if (enCarritoDe(id) >= p.stock) { avisar("Ya tienes en el carrito todas las unidades disponibles"); return; }
    const k = color ? `${id}:${color}` : id;
    carrito[k] = (carrito[k] || 0) + 1;
    guardarCarrito();
    pintarProductos();
    pintarEscaparate();
    avisar(`Agregado al carrito: ${p.nombre}${color ? ", color " + color : ""}`);
    if (hasGsap && !reduced) gsap.fromTo("#cart-count", { scale: 1.6 }, { scale: 1, duration: .45, ease: "power3.out" });
  }

  /* ================= escaparate 3D ================= */
  function pintarEscaparate() {
    const p = porId(SPOT_ID);
    const sec = $("#destacado");
    sec.hidden = !p;
    if (!p) return;
    $("#spot-t").textContent = p.nombre;
    $("#spot-desc").textContent = p.descripcion || "";
    $("#spot-price").textContent = formatoQ(p.precio);
    const b = $("#spot-add");
    const lleno = enCarritoDe(p.id) >= p.stock;
    b.disabled = p.stock <= 0 || lleno;
    b.textContent = p.stock <= 0 ? "Agotado" : lleno ? "Ya tienes todas las disponibles" : "Agregar al carrito";
  }
  $("#spot-add").addEventListener("click", () => agregar(SPOT_ID));

  /* ================= carrito ================= */
  const cartEl = $("#cart");
  let ultimoFoco = null;

  function pintarCarrito() {
    // limpia lo que ya no existe y ajusta cada producto a sus existencias
    const usados = {};
    for (const k of Object.keys(carrito)) {
      const p = porId(baseId(k));
      if (!p || p.stock <= 0) { delete carrito[k]; continue; }
      const libre = p.stock - (usados[p.id] || 0);
      if (libre <= 0) { delete carrito[k]; continue; }
      if (carrito[k] > libre) carrito[k] = libre;
      usados[p.id] = (usados[p.id] || 0) + carrito[k];
    }
    const ids = Object.keys(carrito);
    const unidades = ids.reduce((n, k) => n + carrito[k], 0);
    const total = ids.reduce((n, k) => n + carrito[k] * porId(baseId(k)).precio, 0);
    $("#cart-count").textContent = unidades;
    $("#cart-count").dataset.n = unidades;
    $("#cart-count-sr").textContent = unidades;
    $("#cart-total").textContent = formatoQ(total);
    $("#cart-send").disabled = unidades === 0;
    $("#cart-items").innerHTML = ids.length === 0
      ? '<p class="drawer__empty">Tu carrito está vacío. Agrega productos desde el catálogo.</p>'
      : ids.map((id) => {
        const p = porId(baseId(id));
        const color = colorDe(id);
        return `
          <div class="line">
            <img src="${esc(rutaImagen(p.imagen))}" alt="">
            <div>
              <h3>${esc(p.nombre)}</h3>
              <p class="line__meta">${color ? "Color: " + esc(color) : esc(p.categoria)}</p>
              <div class="line__row">
                <div class="stepper">
                  <button type="button" data-dec="${esc(id)}" aria-label="Quitar uno de ${esc(p.nombre)}">${ICON_MINUS}</button>
                  <output aria-label="Cantidad">${carrito[id]}</output>
                  <button type="button" data-inc="${esc(id)}" aria-label="Agregar uno de ${esc(p.nombre)}" ${enCarritoDe(p.id) >= p.stock ? "disabled" : ""}>${ICON_PLUS}</button>
                </div>
                <span class="line__price">${formatoQ(p.precio * carrito[id])}</span>
              </div>
            </div>
          </div>`;
      }).join("");
  }

  $("#cart-items").addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    if (inc) { const k = inc.dataset.inc; const p = porId(baseId(k)); if (enCarritoDe(p.id) < p.stock) carrito[k] += 1; }
    else if (dec) { const id = dec.dataset.dec; carrito[id] -= 1; if (carrito[id] <= 0) delete carrito[id]; }
    else return;
    guardarCarrito();
    pintarProductos();
    pintarEscaparate();
  });

  function abrirCarrito() {
    ultimoFoco = document.activeElement;
    $("#toast").classList.remove("is-on");
    cartEl.hidden = false;
    document.documentElement.style.overflow = "hidden";
    if (lenis) lenis.stop();
    if (hasGsap && !reduced) {
      gsap.fromTo(".drawer__panel", { xPercent: 100 }, { xPercent: 0, duration: .5, ease: "expo.out" });
      gsap.fromTo(".drawer__backdrop", { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 });
    }
    cartEl.querySelector(".icon-btn").focus();
  }
  function cerrarCarrito() {
    const fin = () => {
      cartEl.hidden = true;
      document.documentElement.style.overflow = "";
      if (lenis) lenis.start();
      if (ultimoFoco) ultimoFoco.focus();
    };
    if (hasGsap && !reduced) {
      gsap.to(".drawer__panel", { xPercent: 100, duration: .35, ease: "power3.in" });
      gsap.to(".drawer__backdrop", { autoAlpha: 0, duration: .3, onComplete: fin });
    } else fin();
  }
  $("#cart-open").addEventListener("click", abrirCarrito);
  cartEl.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) cerrarCarrito(); });
  document.addEventListener("keydown", (e) => {
    if (cartEl.hidden) return;
    if (e.key === "Escape") cerrarCarrito();
    if (e.key === "Tab") {
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
      const p = porId(baseId(id));
      const color = colorDe(id);
      const sub = p.precio * carrito[id];
      total += sub;
      return `• ${carrito[id]} x ${p.nombre}${color ? " (color " + color + ")" : ""}: ${formatoQ(sub)}`;
    });
    const texto = ["Hola, quiero hacer este pedido en TiendaDeportivaLM:", ...lineas, `Total: ${formatoQ(total)}`, "", "¿Me confirman existencias y entrega?"].join("\n");
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
    avisar("Abriendo WhatsApp con tu pedido");
  });

  /* ================= aviso ================= */
  let tAviso;
  function avisar(msg) {
    const t = $("#toast");
    if (!cartEl.hidden) return; // el carrito abierto ya confirma el cambio
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(tAviso);
    tAviso = setTimeout(() => t.classList.remove("is-on"), 2600);
  }

  /* ================= cambios del inventario (modo administrador u otra pestaña) ================= */
  function recargar() {
    productos = window.Inventario.cargar();
    pintarDeportes(); pintarFiltros(); pintarProductos(); pintarCarrito(); pintarEscaparate();
  }
  window.addEventListener("inventario:cambio", recargar);
  window.addEventListener("storage", (e) => { if (e.key === window.Inventario.KEY || e.key === null) recargar(); });

  window.Tienda = { avisar, agregar, porId: (id) => porId(id), enCarritoDe, productos: () => productos };

  /* ================= cabecera: se esconde al bajar, vuelve al subir ================= */
  const header = $("#header");
  let ultimoY = window.scrollY;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    header.classList.toggle("is-stuck", y > 40);
    if (!reduced) header.classList.toggle("is-hidden", y > 400 && y > ultimoY && cartEl.hidden);
    ultimoY = y;
  }, { passive: true });

  /* ================= navegación suave ================= */
  let lenis = null;
  function irA(el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 72;
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    if (a.dataset.cat) return;
    const id = a.getAttribute("href");
    const el = id.length > 1 && document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    if (id === "#inicio") { if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); }
    else irA(el);
  }));

  pintarDeportes();
  pintarFiltros();
  pintarProductos();
  pintarCarrito();
  pintarEscaparate();

  if (!hasGsap || reduced) return;

  /* ================= movimiento ================= */
  gsap.registerPlugin(ScrollTrigger);
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: .11 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // entrada del hero: la foto se asienta y el texto sube una sola vez
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from(".hero__img", { scale: 1.08, duration: 2.2 }, 0)
    .from(".hero__title", { y: 40, autoAlpha: 0, duration: 1.2 }, .2)
    .from(".hero__text, .hero__actions", { y: 24, autoAlpha: 0, duration: 1, stagger: .1 }, .45);
  gsap.to(".hero__img", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  gsap.fromTo(".editorial__img", { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".editorial", start: "top bottom", end: "bottom top", scrub: true } });

  // escaparate: la sección se fija y el balón da una vuelta completa
  ScrollTrigger.create({
    trigger: ".spotlight__stage", start: "top top", end: () => "+=" + Math.round(innerHeight * 1.2),
    pin: true, scrub: true, anticipatePin: 1,
    onUpdate: (self) => { window.TDLM.spot = self.progress; },
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
