/* TiendaDeportivaLM — panel de inventario */
(() => {
  "use strict";
  const I = window.Inventario;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  let productos = I.cargar();
  let filtro = "";

  $("#f-cat").innerHTML = I.CATEGORIAS.map((c) => `<option>${esc(c)}</option>`).join("");

  function guardar(msg) {
    try {
      I.guardar(productos);
      if (msg) avisar(msg);
    } catch (e) {
      avisar("No se pudo guardar: el navegador no tiene espacio. Usa fotos más pequeñas.");
    }
    pintar();
  }

  function pintar() {
    const unidades = productos.reduce((n, p) => n + p.stock, 0);
    $("#s-productos").textContent = productos.length;
    $("#s-unidades").textContent = unidades;
    $("#s-bajo").textContent = productos.filter((p) => p.stock <= 5).length;

    const lista = productos.filter((p) => !filtro || norm(p.nombre + " " + p.categoria).includes(filtro));
    $("#lista").innerHTML = lista.length === 0
      ? '<li class="empty">No hay productos. Agrega el primero con el formulario de arriba.</li>'
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

  $("#lista").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const p = productos.find((x) => x.id === b.closest(".item").dataset.id);
    if (!p) return;
    const act = b.dataset.act;
    if (act === "menos" && p.stock > 0) { p.stock -= 1; guardar(`${p.nombre}: quedan ${p.stock}`); }
    else if (act === "mas") { p.stock += 1; guardar(`${p.nombre}: ahora hay ${p.stock}`); }
    else if (act === "cantidad") {
      const n = prompt(`¿Cuántas unidades hay de "${p.nombre}"?`, p.stock);
      if (n === null) return;
      const v = parseInt(n, 10);
      if (Number.isNaN(v) || v < 0) return avisar("Escribe un número entero de 0 o más.");
      p.stock = v; guardar(`${p.nombre}: cantidad actualizada a ${v}`);
    } else if (act === "precio") {
      const n = prompt(`Nuevo precio en quetzales para "${p.nombre}"`, p.precio);
      if (n === null) return;
      const v = parseFloat(String(n).replace(",", "."));
      if (Number.isNaN(v) || v < 0) return avisar("Escribe un precio válido, por ejemplo 150.");
      p.precio = Math.round(v * 100) / 100; guardar(`${p.nombre}: precio actualizado a ${I.formatoQ(p.precio)}`);
    } else if (act === "borrar") {
      if (!confirm(`¿Eliminar "${p.nombre}" del inventario?`)) return;
      productos = productos.filter((x) => x !== p);
      guardar(`${p.nombre} se eliminó`);
    }
    // mantiene el foco en el mismo botón tras repintar
    const mismo = document.querySelector(`.item[data-id="${CSS.escape(p.id)}"] [data-act="${act}"]`);
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
    let imagen = "";
    if (f.imagen.files[0]) {
      try { imagen = await reducirImagen(f.imagen.files[0]); }
      catch { err.textContent = "No se pudo leer la foto. Prueba con otra imagen (JPG o PNG)."; return; }
    }
    productos.unshift({
      id: "p" + Date.now().toString(36),
      nombre, categoria: f.categoria.value, precio: Math.round(precio * 100) / 100, stock,
      imagen, descripcion: f.descripcion.value.trim(),
    });
    form.reset();
    guardar(`${nombre} se agregó al inventario`);
    f.nombre.focus();
  });

  // reduce la foto a 600 px para que quepa en el navegador
  function reducirImagen(file) {
    return new Promise((ok, mal) => {
      const img = new Image();
      img.onload = () => {
        const lado = 600;
        const cv = document.createElement("canvas");
        cv.width = cv.height = lado;
        const g = cv.getContext("2d");
        const m = Math.min(img.width, img.height);
        g.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, lado, lado);
        URL.revokeObjectURL(img.src);
        ok(cv.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = mal;
      img.src = URL.createObjectURL(file);
    });
  }

  /* ---------- publicar ---------- */
  $("#exportar").addEventListener("click", () => {
    const cabecera = "/* Catálogo de TiendaDeportivaLM exportado desde el panel /host/ el " + new Date().toLocaleString("es-GT") + " */\n";
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

  // si la tienda u otra pestaña del panel cambia el inventario
  window.addEventListener("storage", (e) => {
    if (e.key === I.KEY || e.key === null) { productos = I.cargar(); pintar(); }
  });

  let t;
  function avisar(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(t);
    t = setTimeout(() => el.classList.remove("is-on"), 2800);
  }

  pintar();
})();
