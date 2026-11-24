/* Capa de datos compartida entre la tienda (/) y el panel de inventario (/host/).
   Guarda el inventario en el navegador (localStorage). */
(function () {
  "use strict";
  const KEY = "tdlm_inventario_v1";
  const CATEGORIAS = ["Running", "Fútbol", "Baloncesto", "Gimnasio", "Accesorios"];

  const copiaBase = () => JSON.parse(JSON.stringify(window.CATALOGO_BASE || []));

  function cargar() {
    try {
      const guardado = localStorage.getItem(KEY);
      if (guardado) return JSON.parse(guardado);
    } catch (e) { /* datos corruptos: se usa el catálogo base */ }
    return copiaBase();
  }

  function guardar(lista) {
    localStorage.setItem(KEY, JSON.stringify(lista));
    window.dispatchEvent(new CustomEvent("inventario:cambio"));
  }

  function restaurar() {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent("inventario:cambio"));
  }

  const formatoQ = (n) =>
    "Q." + Number(n).toLocaleString("es-GT", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

  // Rutas relativas: desde /host/ las imágenes del catálogo base necesitan "../"
  const SIN_FOTO = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#ECECE6"/>' +
    '<path d="M18 74 C18 46 40 26 82 26" fill="none" stroke="#FF6A1A" stroke-width="6" stroke-linecap="round"/>' +
    '<text x="50" y="86" text-anchor="middle" font-family="Arial" font-size="9" fill="#5B6670">Sin foto</text></svg>');
  const rutaImagen = (src, prefijo = "") =>
    !src ? SIN_FOTO : /^(data:|https?:|blob:)/.test(src) ? src : prefijo + src;

  window.Inventario = { KEY, CATEGORIAS, cargar, guardar, restaurar, formatoQ, rutaImagen };
})();
