/* Inventario de TiendaDeportivaLM.
   Parte del catálogo publicado (js/catalogo.js). Lo que el dueño cambia en el
   Menú administrador se guarda en este dispositivo (localStorage); para que lo
   vean todos se descarga catalogo.js y se sube al repositorio. */
(function () {
  "use strict";
  const KEY = "tdlm_inventario_v1";
  const CATEGORIAS = ["Running", "Fútbol", "Baloncesto", "Gimnasio", "Accesorios"];

  const copiaBase = () => JSON.parse(JSON.stringify(window.CATALOGO_BASE || []));
  const avisarCambio = () => window.dispatchEvent(new CustomEvent("inventario:cambio"));

  function cargar() {
    try {
      const guardado = localStorage.getItem(KEY);
      if (guardado) return JSON.parse(guardado);
    } catch (e) { /* datos dañados: se usa el catálogo publicado */ }
    return copiaBase();
  }

  function guardar(lista) {
    localStorage.setItem(KEY, JSON.stringify(lista)); // puede lanzar si no hay espacio
    avisarCambio();
  }

  function restaurar() {
    localStorage.removeItem(KEY);
    avisarCambio();
  }

  const tieneCambios = () => localStorage.getItem(KEY) !== null;

  const formatoQ = (n) =>
    "Q." + Number(n).toLocaleString("es-GT", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

  const SIN_FOTO = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#F5F5F5"/>' +
    '<path d="M30 66 C30 48 42 36 66 36" fill="none" stroke="#CACACB" stroke-width="4" stroke-linecap="round"/></svg>');
  const rutaImagen = (src) => src || SIN_FOTO;

  window.Inventario = { KEY, CATEGORIAS, cargar, guardar, restaurar, tieneCambios, formatoQ, rutaImagen };
})();
