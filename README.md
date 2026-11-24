# TiendaDeportivaLM

Tienda deportiva estática para GitHub Pages (HTML, CSS y JS, librerías por CDN; funciona también abriendo `index.html` con doble clic).

- **Tienda:** catálogo con compra por deporte, filtros, búsqueda, orden por precio, carrito y pedido por WhatsApp (+502 5487 0255). Escaparate 3D (Three.js) donde el balón gira 360° con el scroll.
- **Menú administrador:** botón al final de la página. Pide un PIN (se crea la primera vez en cada dispositivo) y pone la misma tienda en modo dueño: sumar/restar existencias, cambiar cantidad o precio, eliminar y agregar productos con foto.

## Dónde se guardan los cambios del administrador
En el navegador del dispositivo donde se hacen (localStorage). Para que **todos** los clientes vean el inventario nuevo: en el modo administrador pulsa **Descargar catálogo** y sube el `catalogo.js` descargado a la carpeta `js/` del repositorio.

## Imágenes
Las fotos de `assets/img/` están generadas con IA: reemplázalas por fotos reales de tus productos cuando las tengas.
