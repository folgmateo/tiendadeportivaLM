# TiendaDeportivaLM

Sitio estático para GitHub Pages con dos partes:

- **Tienda** (`/`): catálogo con filtros, búsqueda, carrito y pedido por WhatsApp (+502 5487 0255). Hero 3D procedural (Three.js) con giro de 360° y explosión al hacer scroll.
- **Panel de inventario** (`/host/`): agregar productos (con foto), sumar/restar unidades, cambiar precio y eliminar.

## Cómo se guardan los datos
El inventario se guarda en el navegador (localStorage). La tienda abierta en el mismo equipo y navegador ve los cambios del panel al instante.
Para que **todos** los clientes vean el inventario nuevo: en el panel pulsa "Descargar catálogo para publicar" y sube el `catalogo.js` descargado a la carpeta `js/` del repositorio.

## Imágenes
Las fotos de `assets/img/` están generadas con IA: reemplázalas por fotos reales de tus productos cuando las tengas.
