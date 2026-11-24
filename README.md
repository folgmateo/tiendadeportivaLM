# TiendaDeportivaLM

Sitio estático para GitHub Pages con dos partes:

- **Tienda** (`/`): catálogo con filtros, búsqueda, carrito y pedido por WhatsApp (+502 5487 0255). Hero 3D procedural (Three.js) con giro de 360° y explosión al hacer scroll.
- **Panel del dueño** (ruta oculta en `js/config.js`, se abre tocando 5 veces el logo del pie de página; protegido con PIN): agregar productos (con foto), sumar/restar unidades, cambiar precio y eliminar.

## Cómo se guardan los datos
El inventario vive en Google Sheets mediante el script `apps-script/Codigo.gs` (pegado en la hoja con Extensiones > Apps Script e implementado como aplicación web).
Pon la URL `/exec` en `SHEETS_URL` dentro de `js/config.js`: la tienda revisa la hoja cada 20 s y el panel guarda directo en ella (validando el PIN en el script).
Sin URL, todo funciona en modo local (solo en el navegador) y el panel permite descargar `catalogo.js` para publicar.

## Imágenes
Las fotos de `assets/img/` están generadas con IA: reemplázalas por fotos reales de tus productos cuando las tengas.
