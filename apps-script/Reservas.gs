/**
 * Mozzafiato · Reservas en Google Sheets (opcional).
 *
 * Guarda cada reserva en la hoja "Reservas" y le dice a la app cuántas
 * plazas quedan libres en cada hora. Instrucciones en apps-script/README.md.
 */

// Reservas máximas por hora para cada actividad (igual que "cupos" en config.js).
const CUPOS = { splash: 2, slime: 2, ceramica: 2 };

// Correo que recibe un aviso por cada reserva nueva. Vacío = sin aviso.
const CORREO_AVISOS = '';

const HOJA = 'Reservas';
const COLUMNAS = [
  'Creada', 'ID', 'Actividad', 'Fecha', 'Hora', 'Personas', 'Total', 'Abono',
  'Nombre', 'Celular', 'Correo', 'Menores', 'Ocasión especial', 'Estado',
];
// Las reservas con este estado liberan su cupo.
const ESTADO_CANCELADA = 'Cancelada';

function hoja_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(HOJA);
    hoja.appendRow(COLUMNAS);
    hoja.setFrozenRows(1);
    // Fecha y hora como texto, para que Sheets no las convierta.
    hoja.getRange('D:E').setNumberFormat('@');
  }
  return hoja;
}

function texto_(valor, zona) {
  if (valor instanceof Date) {
    return Utilities.formatDate(valor, zona, valor.getFullYear() < 1900 ? 'HH:mm' : 'yyyy-MM-dd');
  }
  return String(valor);
}

// { '14:00': 1, '16:00': 2 } para una actividad y fecha.
function ocupados_(actividad, fecha) {
  const hoja = hoja_();
  const zona = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  const filas = hoja.getDataRange().getValues().slice(1);
  const conteo = {};
  for (const fila of filas) {
    if (fila[2] !== actividad || texto_(fila[3], zona) !== fecha) continue;
    if (String(fila[13]).trim().toLowerCase() === ESTADO_CANCELADA.toLowerCase()) continue;
    const hora = texto_(fila[4], zona);
    conteo[hora] = (conteo[hora] || 0) + 1;
  }
  return conteo;
}

function json_(datos) {
  return ContentService.createTextOutput(JSON.stringify(datos)).setMimeType(ContentService.MimeType.JSON);
}

const valido_ = (d) =>
  CUPOS[d.actividad] && /^\d{4}-\d{2}-\d{2}$/.test(d.fecha) && /^\d{2}:\d{2}$/.test(d.hora);

// GET ?actividad=splash&fecha=2026-10-12 → { ok, ocupados }
function doGet(e) {
  const d = e.parameter || {};
  if (!valido_({ ...d, hora: '00:00' })) return json_({ ok: false, error: 'datos' });
  return json_({ ok: true, ocupados: ocupados_(d.actividad, d.fecha) });
}

// POST con la reserva → { ok, id } o { ok: false, error: 'lleno' }
function doPost(e) {
  let d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (error) {
    return json_({ ok: false, error: 'datos' });
  }
  if (!valido_(d)) return json_({ ok: false, error: 'datos' });

  const candado = LockService.getScriptLock();
  candado.waitLock(20000);
  try {
    if ((ocupados_(d.actividad, d.fecha)[d.hora] || 0) >= CUPOS[d.actividad]) {
      return json_({ ok: false, error: 'lleno' });
    }
    const id = Utilities.getUuid().slice(0, 6).toUpperCase();
    const limpio = (v) => String(v == null ? '' : v).slice(0, 500).replace(/^[=+\-@]/, "'$&");
    hoja_().appendRow([
      new Date(), id, d.actividad, d.fecha, d.hora, Number(d.personas) || 0,
      Number(d.total) || 0, Number(d.abono) || 0, limpio(d.nombre), limpio(d.celular),
      limpio(d.correo), limpio(d.menores), limpio(d.especial), 'Pendiente de abono',
    ]);
    if (CORREO_AVISOS) {
      MailApp.sendEmail(
        CORREO_AVISOS,
        `Nueva reserva ${d.actividad} ${d.fecha} ${d.hora}`,
        `${d.nombre} (${d.celular}) reservó ${d.actividad} el ${d.fecha} a las ${d.hora} para ${d.personas} personas.\nAbono: ${d.abono}\nReserva #${id}`
      );
    }
    return json_({ ok: true, id });
  } finally {
    candado.releaseLock();
  }
}
