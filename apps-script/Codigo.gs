/**
 * TiendaDeportivaLM — inventario en Google Sheets.
 * Pega este código en la hoja: Extensiones > Apps Script. Después:
 *   1. Cambia CLAVE por un PIN propio (el panel /host/ lo pedirá para guardar cambios).
 *   2. Ejecuta una vez la función "prepararHoja" (crea la pestaña Inventario con los productos de ejemplo).
 *   3. Implementar > Nueva implementación > Tipo: Aplicación web
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier usuario
 *   4. Copia la URL que termina en /exec y pásasela a Claude.
 */
const HOJA = 'Inventario';
const CLAVE = 'CAMBIA-ESTE-PIN';
const COLS = ['id', 'nombre', 'categoria', 'precio', 'stock', 'imagen', 'descripcion'];
const BASE_IMG = 'https://folgmateo.github.io/tiendadeportivaLM/';

/** Lectura pública: la tienda y el panel piden el inventario aquí. */
function doGet() {
  return json_({ ok: true, productos: leer_() });
}

/** Escritura protegida con CLAVE: solo el panel /host/. */
function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (err) { return json_({ ok: false, error: 'Petición no válida' }); }
  if (body.accion === 'verificar') return json_({ ok: body.clave === CLAVE });
  if (body.clave !== CLAVE) return json_({ ok: false, error: 'PIN incorrecto' });

  const lock = LockService.getScriptLock();
  lock.waitLock(15000); // evita que dos ventas a la vez pisen el stock
  try {
    const hoja = hoja_();
    const datos = hoja.getDataRange().getValues();
    const fila = (id) => datos.findIndex((r, i) => i > 0 && String(r[0]) === String(id)) + 1; // 1-based, 0 = no existe
    const col = (nombre) => COLS.indexOf(nombre) + 1;

    switch (body.accion) {
      case 'ajustar': { // suma o resta unidades: { id, delta }
        const f = fila(body.id);
        if (!f) return json_({ ok: false, error: 'Producto no encontrado' });
        const actual = Number(hoja.getRange(f, col('stock')).getValue()) || 0;
        hoja.getRange(f, col('stock')).setValue(Math.max(0, actual + Number(body.delta || 0)));
        break;
      }
      case 'fijar': { // { id, campo: 'stock'|'precio'|'nombre'|'descripcion'|'categoria', valor }
        const f = fila(body.id);
        if (!f || !['stock', 'precio', 'nombre', 'descripcion', 'categoria'].includes(body.campo)) return json_({ ok: false, error: 'Datos no válidos' });
        hoja.getRange(f, col(body.campo)).setValue(body.valor);
        break;
      }
      case 'agregar': { // { producto: {...}, foto: dataURL opcional }
        const p = body.producto || {};
        let imagen = p.imagen || '';
        if (body.foto) imagen = guardarFoto_(body.foto, p.nombre);
        hoja.appendRow([p.id || 'p' + Date.now().toString(36), p.nombre, p.categoria, Number(p.precio) || 0, Number(p.stock) || 0, imagen, p.descripcion || '']);
        break;
      }
      case 'eliminar': {
        const f = fila(body.id);
        if (f) hoja.deleteRow(f);
        break;
      }
      default:
        return json_({ ok: false, error: 'Acción desconocida' });
    }
    SpreadsheetApp.flush();
    return json_({ ok: true, productos: leer_() });
  } finally {
    lock.releaseLock();
  }
}

/** Ejecutar UNA vez desde el editor: crea la pestaña y carga los productos de ejemplo. */
function prepararHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = ss.getSheetByName(HOJA);
  if (!hoja) hoja = ss.insertSheet(HOJA);
  if (hoja.getLastRow() > 1) return; // ya tiene datos: no se toca
  hoja.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight('bold');
  const ejemplo = [
    ['p1', 'Zapatillas de running Aero', 'Running', 549, 12, 'assets/img/zapatillas.webp', 'Amortiguación ligera y suela con agarre para asfalto y pista.'],
    ['p2', 'Balón de fútbol Clásico N.º 5', 'Fútbol', 189, 20, 'assets/img/balon-futbol.webp', 'Costura reforzada, ideal para cancha sintética y natural.'],
    ['p3', 'Balón de baloncesto Pro N.º 7', 'Baloncesto', 229, 9, 'assets/img/balon-basket.webp', 'Agarre de goma texturizada para interior y exterior.'],
    ['p4', 'Camiseta técnica Cancha', 'Fútbol', 159, 25, 'assets/img/camiseta.webp', 'Tela transpirable de secado rápido. Tallas S a XL.'],
    ['p5', 'Mancuernas hexagonales 10 lb (par)', 'Gimnasio', 399, 6, 'assets/img/mancuernas.webp', 'Recubrimiento de caucho y mango cromado antideslizante.'],
    ['p6', 'Esterilla de yoga 6 mm', 'Gimnasio', 179, 14, 'assets/img/esterilla.webp', 'Antideslizante por ambas caras, incluye correa.'],
    ['p7', 'Mochila deportiva 30 L', 'Accesorios', 299, 3, 'assets/img/mochila.webp', 'Compartimento para zapatillas y bolsillo térmico.'],
    ['p8', 'Botella térmica 750 ml', 'Accesorios', 129, 30, 'assets/img/botella.webp', 'Acero inoxidable: frío 24 h, caliente 12 h.'],
  ].map((r) => { r[5] = BASE_IMG + r[5]; return r; });
  hoja.getRange(2, 1, ejemplo.length, COLS.length).setValues(ejemplo);
  hoja.setFrozenRows(1);
  hoja.autoResizeColumns(1, COLS.length);
}

function hoja_() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
  if (!hoja) throw new Error('Falta la pestaña "' + HOJA + '". Ejecuta prepararHoja().');
  return hoja;
}

function leer_() {
  const filas = hoja_().getDataRange().getValues();
  return filas.slice(1).filter((r) => r[0] !== '' && r[1] !== '').map((r) => ({
    id: String(r[0]), nombre: String(r[1]), categoria: String(r[2]),
    precio: Number(r[3]) || 0, stock: Math.max(0, parseInt(r[4], 10) || 0),
    imagen: String(r[5] || ''), descripcion: String(r[6] || ''),
  }));
}

/** Guarda la foto subida desde el panel en Google Drive y devuelve un enlace público. */
function guardarFoto_(dataUrl, nombre) {
  const m = String(dataUrl).match(/^data:(image\/\w+);base64,(.+)$/);
  if (!m) return '';
  const carpetas = DriveApp.getFoldersByName('TiendaDeportivaLM fotos');
  const carpeta = carpetas.hasNext() ? carpetas.next() : DriveApp.createFolder('TiendaDeportivaLM fotos');
  const archivo = carpeta.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], (nombre || 'producto') + '.jpg'));
  archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/thumbnail?id=' + archivo.getId() + '&sz=w800';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
