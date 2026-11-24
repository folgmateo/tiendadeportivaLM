/* Capa de datos compartida entre la tienda (/) y el panel del dueño.
   - Con SHEETS_URL (js/config.js): el inventario vive en Google Sheets y se sincroniza solo.
   - Sin SHEETS_URL: modo local en este navegador (localStorage).
   La última copia buena se guarda en localStorage para mostrarla al instante y si la hoja no responde. */
(function () {
  "use strict";
  const KEY = "tdlm_inventario_v1";
  const PIN_KEY = "tdlm_pin";
  const CATEGORIAS = ["Running", "Fútbol", "Baloncesto", "Gimnasio", "Accesorios"];
  const CFG = window.TDLM_CONFIG || {};
  const URL_HOJA = (CFG.SHEETS_URL || "").trim();
  const remoto = /^https:\/\/script\.google\.com\/.+\/exec$/.test(URL_HOJA);

  const copiaBase = () => JSON.parse(JSON.stringify(window.CATALOGO_BASE || []));
  const avisarCambio = () => window.dispatchEvent(new CustomEvent("inventario:cambio"));

  function cargar() {
    try {
      const guardado = localStorage.getItem(KEY);
      if (guardado) return JSON.parse(guardado);
    } catch (e) { /* datos corruptos: se usa el catálogo base */ }
    return copiaBase();
  }

  function guardarLocal(lista) {
    try { localStorage.setItem(KEY, JSON.stringify(lista)); } catch (e) { /* sin espacio: se ignora la copia */ }
  }

  // Modo local: el panel guarda aquí directamente
  function guardar(lista) {
    localStorage.setItem(KEY, JSON.stringify(lista));
    avisarCambio();
  }

  function restaurar() {
    localStorage.removeItem(KEY);
    avisarCambio();
  }

  const mismoInventario = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  /* ---------- Google Sheets ---------- */
  async function sincronizar() {
    if (!remoto) return cargar();
    const r = await fetch(URL_HOJA + "?t=" + Date.now(), { cache: "no-store" });
    const data = await r.json();
    if (!data.ok || !Array.isArray(data.productos)) throw new Error("Respuesta no válida de la hoja");
    if (!mismoInventario(data.productos, cargar())) {
      guardarLocal(data.productos);
      avisarCambio();
    }
    return data.productos;
  }

  // text/plain evita la verificación previa (CORS) que Apps Script no admite
  async function enviar(accion, datos = {}) {
    if (!remoto) throw new Error("Sin hoja de Google configurada");
    const r = await fetch(URL_HOJA, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ accion, clave: localStorage.getItem(PIN_KEY) || "", ...datos }),
    });
    const data = await r.json();
    if (!data.ok) throw new Error(data.error || "No se pudo guardar");
    if (Array.isArray(data.productos)) { guardarLocal(data.productos); avisarCambio(); }
    return data.productos;
  }

  async function verificarPin(pin) {
    if (!remoto) return pin.length >= 4; // modo local: no hay servidor que valide
    const r = await fetch(URL_HOJA, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ accion: "verificar", clave: pin }),
    });
    return (await r.json()).ok === true;
  }

  const pin = {
    guardado: () => localStorage.getItem(PIN_KEY),
    guardar: (p) => localStorage.setItem(PIN_KEY, p),
    borrar: () => localStorage.removeItem(PIN_KEY),
  };

  const formatoQ = (n) =>
    "Q." + Number(n).toLocaleString("es-GT", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

  // Rutas relativas: desde el panel las imágenes del catálogo base necesitan "../"
  const SIN_FOTO = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#ECECE6"/>' +
    '<path d="M18 74 C18 46 40 26 82 26" fill="none" stroke="#FF6A1A" stroke-width="6" stroke-linecap="round"/>' +
    '<text x="50" y="86" text-anchor="middle" font-family="Arial" font-size="9" fill="#5B6670">Sin foto</text></svg>');
  const rutaImagen = (src, prefijo = "") =>
    !src ? SIN_FOTO : /^(data:|https?:|blob:)/.test(src) ? src : prefijo + src;

  window.Inventario = {
    KEY, CATEGORIAS, remoto, refrescoMs: CFG.REFRESCO_MS || 20000,
    cargar, guardar, restaurar, sincronizar, enviar, verificarPin, pin, formatoQ, rutaImagen,
  };
})();
