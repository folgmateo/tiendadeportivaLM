/* TiendaDeportivaLM — Menú administrador (modo dueño dentro de la misma tienda).
   El PIN se guarda cifrado (SHA-256) en este dispositivo. Los cambios de inventario
   también se guardan aquí; "Descargar catálogo" genera catalogo.js para publicarlos. */
(() => {
  "use strict";
  const I = window.Inventario;
  const $ = (s) => document.querySelector(s);
  const PIN_KEY = "tdlm_admin_pin";
  const SESION = "tdlm_admin_activo";
  const avisar = (m) => window.Tienda.avisar(m);

  async function hashPin(pin) {
    const datos = new TextEncoder().encode("tdlm:" + pin);
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", datos);
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    let h = 0; // respaldo si el navegador no ofrece crypto.subtle
    for (const b of datos) h = (Math.imul(31, h) + b) | 0;
    return "f" + (h >>> 0).toString(16);
  }

  /* ---------- entrar / salir ---------- */
  const dlg = $("#pin-dialog");
  const pin = $("#pin"), pin2 = $("#pin2"), err = $("#pin-error");
  let creando = false;

  function activar() {
    document.body.classList.add("is-admin");
    $("#admin-bar").hidden = false;
    sessionStorage.setItem(SESION, "1");
  }
  function desactivar() {
    document.body.classList.remove("is-admin");
    $("#admin-bar").hidden = true;
    sessionStorage.removeItem(SESION);
  }

  $("#admin-open").addEventListener("click", () => {
    if (document.body.classList.contains("is-admin")) { $("#admin-bar").scrollIntoView({ block: "nearest" }); return; }
    creando = !localStorage.getItem(PIN_KEY);
    $("#pin-help").textContent = creando
      ? "Es la primera vez en este dispositivo: crea un PIN de 4 a 8 números. Te lo pediremos cada vez que entres."
      : "Escribe tu PIN para editar el inventario.";
    $("#pin2-label").hidden = pin2.hidden = !creando;
    $("#pin-submit").textContent = creando ? "Crear PIN y entrar" : "Entrar";
    pin.value = pin2.value = "";
    err.textContent = "";
    dlg.showModal();
    pin.focus();
  });

  dlg.addEventListener("click", (e) => { if (e.target.closest("[data-cancel]")) dlg.close(); });

  $("#pin-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const v = pin.value.trim();
    if (!/^\d{4,8}$/.test(v)) { err.textContent = "El PIN debe tener de 4 a 8 números."; pin.focus(); return; }
    if (creando) {
      if (v !== pin2.value.trim()) { err.textContent = "Los dos PIN no coinciden. Escríbelos de nuevo."; pin2.focus(); return; }
      localStorage.setItem(PIN_KEY, await hashPin(v));
    } else if ((await hashPin(v)) !== localStorage.getItem(PIN_KEY)) {
      err.textContent = "PIN incorrecto. Inténtalo de nuevo.";
      pin.select();
      return;
    }
    dlg.close();
    activar();
    avisar("Modo administrador activado");
    document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
  });

  $("#admin-exit").addEventListener("click", () => { desactivar(); avisar("Saliste del modo administrador"); });
  if (sessionStorage.getItem(SESION) && localStorage.getItem(PIN_KEY)) activar();

  /* ---------- editar productos (en las tarjetas) ---------- */
  function guardar(lista, msg) {
    try { I.guardar(lista); avisar(msg); return true; }
    catch { avisar("No hay espacio en este dispositivo. Usa fotos más pequeñas o elimina productos."); return false; }
  }

  document.getElementById("grid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-admin]");
    if (!b || !document.body.classList.contains("is-admin")) return;
    const id = b.closest(".card").dataset.id;
    const lista = I.cargar();
    const p = lista.find((x) => x.id === id);
    if (!p) return;
    const act = b.dataset.admin;

    if (act === "menos" && p.stock > 0) { p.stock -= 1; guardar(lista, `${p.nombre}: quedan ${p.stock}`); }
    else if (act === "mas") { p.stock += 1; guardar(lista, `${p.nombre}: ahora hay ${p.stock}`); }
    else if (act === "cantidad") {
      const n = prompt(`¿Cuántas unidades hay de «${p.nombre}»?`, p.stock);
      if (n === null) return;
      const v = parseInt(n, 10);
      if (Number.isNaN(v) || v < 0) return avisar("Escribe un número entero de 0 o más.");
      p.stock = v; guardar(lista, `${p.nombre}: existencias actualizadas a ${v}`);
    } else if (act === "precio") {
      const n = prompt(`Nuevo precio en quetzales para «${p.nombre}»`, p.precio);
      if (n === null) return;
      const v = Math.round(parseFloat(String(n).replace(",", ".")) * 100) / 100;
      if (Number.isNaN(v) || v < 0) return avisar("Escribe un precio válido, por ejemplo 150.");
      p.precio = v; guardar(lista, `${p.nombre}: precio actualizado a ${I.formatoQ(v)}`);
    } else if (act === "borrar") {
      if (!confirm(`¿Eliminar «${p.nombre}» del inventario?`)) return;
      guardar(lista.filter((x) => x.id !== id), `${p.nombre} se eliminó`);
      return;
    }
    // el catálogo se repinta: devuelve el foco al mismo control
    const mismo = document.querySelector(`.card[data-id="${CSS.escape(id)}"] [data-admin="${act}"]`);
    if (mismo && !mismo.disabled) mismo.focus();
  });

  /* ---------- agregar producto ---------- */
  const addDlg = $("#add-dialog");
  const form = $("#add-form");
  $("#add-cat").innerHTML = I.CATEGORIAS.map((c) => `<option>${c}</option>`).join("");
  $("#admin-add").addEventListener("click", () => { form.reset(); $("#add-error").textContent = ""; addDlg.showModal(); form.elements.nombre.focus(); });
  addDlg.addEventListener("click", (e) => { if (e.target.closest("[data-cancel]")) addDlg.close(); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form.elements;
    const error = $("#add-error");
    const nombre = f.nombre.value.trim();
    const precio = parseFloat(f.precio.value);
    const stock = parseInt(f.stock.value, 10);
    if (nombre.length < 2) { error.textContent = "Escribe el nombre del producto."; return f.nombre.focus(); }
    if (Number.isNaN(precio) || precio < 0) { error.textContent = "Escribe el precio en quetzales, por ejemplo 150."; return f.precio.focus(); }
    if (Number.isNaN(stock) || stock < 0) { error.textContent = "Escribe cuántas unidades hay, por ejemplo 10."; return f.stock.focus(); }
    let imagen = "";
    if (f.imagen.files[0]) {
      try { imagen = await reducirImagen(f.imagen.files[0]); }
      catch { error.textContent = "No se pudo leer la foto. Prueba con otra imagen JPG o PNG."; return; }
    }
    const lista = I.cargar();
    lista.unshift({ id: "p" + Date.now().toString(36), nombre, categoria: f.categoria.value, precio: Math.round(precio * 100) / 100, stock, imagen, descripcion: f.descripcion.value.trim() });
    if (guardar(lista, `${nombre} se agregó al inventario`)) addDlg.close();
  });

  // foto cuadrada de 600 px para que quepa en el dispositivo
  function reducirImagen(file) {
    return new Promise((ok, mal) => {
      const img = new Image();
      img.onload = () => {
        const lado = 600, m = Math.min(img.width, img.height);
        const cv = document.createElement("canvas");
        cv.width = cv.height = lado;
        cv.getContext("2d").drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, lado, lado);
        URL.revokeObjectURL(img.src);
        ok(cv.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = mal;
      img.src = URL.createObjectURL(file);
    });
  }

  /* ---------- publicar y restablecer ---------- */
  $("#admin-export").addEventListener("click", () => {
    const cabecera = "/* Catálogo de TiendaDeportivaLM exportado desde el Menú administrador el " + new Date().toLocaleString("es-GT") + " */\n";
    const blob = new Blob([cabecera + "window.CATALOGO_BASE = " + JSON.stringify(I.cargar(), null, 2) + ";\n"], { type: "text/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "catalogo.js";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    avisar("Descargado catalogo.js: súbelo a la carpeta js/ para que todos lo vean");
  });
  $("#admin-reset").addEventListener("click", () => {
    if (!confirm("Volverás al catálogo publicado y se perderán los cambios hechos en este dispositivo. ¿Continuar?")) return;
    I.restaurar();
    avisar("Catálogo publicado restablecido");
  });
})();
