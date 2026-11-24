/* TiendaDeportivaLM — panel del dueño (protegido con PIN) */
(() => {
  "use strict";
  const I = window.Inventario;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  let productos = I.cargar();
  let filtro = "";
  let ocupado = 0;

  /* ================= puerta con PIN ================= */
  async function entrar(pin, silencioso) {
    const err = $("#gate-error");
    try {
      if (!(await I.verificarPin(pin))) {
        I.pin.borrar();
        if (!silencioso) err.textContent = "PIN incorrecto. Vuelve a intentarlo.";
        return;
      }
    } catch {
      err.textContent = "No hay conexión con la hoja de Google. Revisa tu internet e inténtalo de nuevo.";
      return;
    }
    I.pin.guardar(pin);
    $("#gate").hidden = true;
    $("#app").hidden = false;
    iniciar();
  }
  $("#gate-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const pin = $("#pin").value.trim();
    if (pin.length < 4) { $("#gate-error").textContent = "El PIN tiene al menos 4 caracteres."; return; }
    $("#gate-error").textContent = "Comprobando…";
    entrar(pin, false);
  });
  $("#salir").addEventListener("click", () => { I.pin.borrar(); location.reload(); });

  if (I.pin.guardado()) entrar(I.pin.guardado(), true);
  else $("#pin").focus();

  /* ================= panel ================= */
  let iniciado = false;
  function iniciar() {
    if (iniciado) return;
    iniciado = true;
    $("#f-cat").innerHTML = I.CATEGORIAS.map((c) => `<option>${esc(c)}</option>`).join("");
    $("#local-tools").hidden = I.remoto;
    pintar();
    if (I.remoto) {
      estado("Conectado a Google Sheets");
      const sync = () => { if (!ocupado) I.sincronizar().then(() => estado("Al día")).catch(() => estado("Sin conexión", true)); };
      sync();
      setInterval(() => { if (!document.hidden) sync(); }, I.refrescoMs);
      document.addEventListener("visibilitychange", () => { if (!document.hidden) sync(); });
    } else {
      estado("Modo local", true);
    }
  }

  window.addEventListener("inventario:cambio", () => { if (!ocupado) { productos = I.cargar(); pintar(); } });
  window.addEventListener("storage", (e) => { if (e.key === I.KEY || e.key === null) { productos = I.cargar(); pintar(); } });

  function estado(txt, alerta) {
    const el = $("#sync");
    el.textContent = txt;
    el.classList.toggle("is-warn", !!alerta);
  }

  // Aplica un cambio: en la hoja (modo remoto) o en este navegador (modo local).
  // La pantalla se actualiza al instante y se revierte si la hoja rechaza el cambio.
  async function aplicar(accion, datos, cambioLocal, msg) {
    const antes = JSON.parse(JSON.stringify(productos));
    cambioLocal();
    pintar();
    if (!I.remoto) {
      try { I.guardar(productos); avisar(msg); }
      catch { productos = antes; pintar(); avisar("No se pudo guardar: el navegador no tiene espacio. Usa fotos más pequeñas."); }
      return true;
    }
    ocupado += 1;
    estado("Guardando…");
    try {
      productos = await I.enviar(accion, datos);
      pintar();
      estado("Guardado");
      avisar(msg);
      return true;
    } catch (e) {
      productos = antes;
      pintar();
      estado("Error al guardar", true);
      if (/PIN/.test(e.message)) { avisar("El PIN cambió. Vuelve a entrar."); I.pin.borrar(); setTimeout(() => location.reload(), 1500); }
      else avisar("No se guardó: " + e.message + ". Inténtalo de nuevo.");
      return false;
    } finally {
      ocupado -= 1;
    }
  }

  function pintar() {
    $("#s-productos").textContent = productos.length;
    $("#s-unidades").textContent = productos.reduce((n, p) => n + p.stock, 0);
    $("#s-bajo").textContent = productos.filter((p) => p.stock <= 5).length;

    const lista = productos.filter((p) => !filtro || norm(p.nombre + " " + p.categoria).includes(filtro));
    $("#lista").innerHTML = lista.length === 0
      ? '<li class="empty">No hay productos. Agrega el primero con el formulario de abajo.</li>'
      : lista.map((p) => `
        <li class="item${p.stock <= 0 ? " is-out" : p.stock <= 5 ? " is-low" : ""}" data-id="${esc(p.id)}">
          <img src="${esc(I.rutaImagen(p.imagen, "../"))}" alt="">
          <div>
            <h3>${esc(p.nombre)}</h3>
            <p>${esc(p.categoria)} · ${I.formatoQ(p.precio)} ${p.stock <= 0 ? '· <span class="item__tag">Agotado</span>' : p.stock <= 5 ? '· <span class="item__tag">Quedan pocos</span>' : ""}</p>
          </div>
          <div class="stock">
            <button type="button" data-act="menos" aria-label="Restar una unidad de ${esc(p.nombre)}" ${p.stock <= 0 ? "disabled" : ""}>−</button>
            <output aria-label="Unidades de ${esc(p.nombre)}">${p.stock}</output>
            <button type="button" data-act="mas" aria-label="Sumar una unidad de ${esc(p.nombre)}">+</button>
          </div>
          <div class="item__actions">
            <button type="button" class="link-btn" data-act="cantidad">Cambiar cantidad</button>
            <button type="button" class="link-btn" data-act="precio">Cambiar precio</button>
            <button type="button" class="link-btn link-btn--danger" data-act="borrar">Eliminar</button>
          </div>
        </li>`).join("");
  }

  $("#lista").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const id = b.closest(".item").dataset.id;
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    const act = b.dataset.act;
    const buscar = () => productos.find((x) => x.id === id);

    if (act === "menos" && p.stock > 0) {
      await aplicar("ajustar", { id, delta: -1 }, () => { buscar().stock -= 1; }, `${p.nombre}: quedan ${p.stock - 1}`);
    } else if (act === "mas") {
      await aplicar("ajustar", { id, delta: 1 }, () => { buscar().stock += 1; }, `${p.nombre}: ahora hay ${p.stock + 1}`);
    } else if (act === "cantidad") {
      const n = prompt(`¿Cuántas unidades hay de "${p.nombre}"?`, p.stock);
      if (n === null) return;
      const v = parseInt(n, 10);
      if (Number.isNaN(v) || v < 0) return avisar("Escribe un número entero de 0 o más.");
      await aplicar("fijar", { id, campo: "stock", valor: v }, () => { buscar().stock = v; }, `${p.nombre}: cantidad actualizada a ${v}`);
    } else if (act === "precio") {
      const n = prompt(`Nuevo precio en quetzales para "${p.nombre}"`, p.precio);
      if (n === null) return;
      const v = Math.round(parseFloat(String(n).replace(",", ".")) * 100) / 100;
      if (Number.isNaN(v) || v < 0) return avisar("Escribe un precio válido, por ejemplo 150.");
      await aplicar("fijar", { id, campo: "precio", valor: v }, () => { buscar().precio = v; }, `${p.nombre}: precio actualizado a ${I.formatoQ(v)}`);
    } else if (act === "borrar") {
      if (!confirm(`¿Eliminar "${p.nombre}" del inventario?`)) return;
      await aplicar("eliminar", { id }, () => { productos = productos.filter((x) => x.id !== id); }, `${p.nombre} se eliminó`);
    }
    const mismo = document.querySelector(`.item[data-id="${CSS.escape(id)}"] [data-act="${act}"]`);
    if (mismo && !mismo.disabled) mismo.focus();
  });

  $("#filtro").addEventListener("input", (e) => { filtro = norm(e.target.value.trim()); pintar(); });

  /* ---------- agregar producto ---------- */
  const form = $("#form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form.elements;
    const err = $("#f-error");
    const nombre = f.nombre.value.trim();
    const precio = parseFloat(f.precio.value);
    const stock = parseInt(f.stock.value, 10);
    if (nombre.length < 2) { err.textContent = "Escribe el nombre del producto."; return f.nombre.focus(); }
    if (Number.isNaN(precio) || precio < 0) { err.textContent = "Escribe el precio en quetzales, por ejemplo 150."; return f.precio.focus(); }
    if (Number.isNaN(stock) || stock < 0) { err.textContent = "Escribe cuántas unidades hay, por ejemplo 10."; return f.stock.focus(); }
    err.textContent = "";
    let foto = "";
    if (f.imagen.files[0]) {
      try { foto = await reducirImagen(f.imagen.files[0]); }
      catch { err.textContent = "No se pudo leer la foto. Prueba con otra imagen (JPG o PNG)."; return; }
    }
    const producto = {
      id: "p" + Date.now().toString(36), nombre, categoria: f.categoria.value,
      precio: Math.round(precio * 100) / 100, stock, imagen: I.remoto ? "" : foto, descripcion: f.descripcion.value.trim(),
    };
    const boton = form.querySelector('button[type="submit"]');
    boton.disabled = true;
    boton.textContent = "Guardando…";
    const ok = await aplicar("agregar", { producto, foto }, () => { productos.unshift({ ...producto, imagen: foto }); }, `${nombre} se agregó al inventario`);
    boton.disabled = false;
    boton.textContent = "Agregar al inventario";
    if (ok) { form.reset(); f.nombre.focus(); }
  });

  // reduce la foto a 600 px (cuadrada) antes de guardarla
  function reducirImagen(file) {
    return new Promise((ok, mal) => {
      const img = new Image();
      img.onload = () => {
        const lado = 600;
        const cv = document.createElement("canvas");
        cv.width = cv.height = lado;
        const m = Math.min(img.width, img.height);
        cv.getContext("2d").drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, lado, lado);
        URL.revokeObjectURL(img.src);
        ok(cv.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = mal;
      img.src = URL.createObjectURL(file);
    });
  }

  /* ---------- solo en modo local ---------- */
  $("#exportar").addEventListener("click", () => {
    const cabecera = "/* Catálogo de TiendaDeportivaLM exportado desde el panel el " + new Date().toLocaleString("es-GT") + " */\n";
    const blob = new Blob([cabecera + "window.CATALOGO_BASE = " + JSON.stringify(productos, null, 2) + ";\n"], { type: "text/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "catalogo.js";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    avisar("Descargado catalogo.js: súbelo a GitHub en la carpeta js/");
  });
  $("#restaurar").addEventListener("click", () => {
    if (!confirm("Se perderán los cambios hechos en este navegador y volverás al catálogo publicado. ¿Continuar?")) return;
    I.restaurar();
    productos = I.cargar();
    pintar();
    avisar("Catálogo publicado restaurado");
  });

  let t;
  function avisar(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(t);
    t = setTimeout(() => el.classList.remove("is-on"), 2800);
  }
})();
