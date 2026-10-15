/**
 * Reservas Mozzafiato · conexión entre el cotizador, esta hoja y Google Calendar.
 *
 * Instalación (una sola vez):
 *   1. En la hoja "Reservas Mozzafiato": Extensiones → Apps Script.
 *   2. Borra lo que haya y pega todo este archivo. Guarda (ícono del disquete).
 *   3. Arriba elige la función "instalar" y toca ▶ Ejecutar. Acepta los permisos.
 *   4. Implementar → Nueva implementación → tipo "Aplicación web":
 *        Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario.
 *      Copia la URL que termina en /exec y pásasela a Claude.
 *
 * Qué hace:
 *   - Cada cotización enviada desde la app agrega una fila con Estado "Pendiente"
 *     y crea el evento "⏳ Por confirmar" en tu calendario.
 *   - Si cambias el Estado a "Confirmada", el evento pasa a "✅".
 *     Si lo cambias a "Cancelada", el evento se borra del calendario.
 *   - La app pregunta qué horas de Art splash ya tienen las 2 salas ocupadas
 *     (solo cuentan las reservas Confirmadas) y no las ofrece.
 */

const ZONA = 'America/Bogota';
const HOJA = 'Reservas';
const SALAS_SPLASH = 2;

const COLUMNAS = [
  'ID', 'Recibida', 'Estado', 'Fecha', 'Hora', 'Cumpleañero', 'Edad', 'Contacto',
  'Teléfono', 'Asistentes', 'Arma tu pizza', 'Art splash', 'Art slime', 'Art cerámica',
  'Decoración Pablo', 'Subtotal', 'Saldo consumo', 'Total', 'Estancia (min)',
  'Comentarios', 'ID evento',
];
const ESTADOS = ['Pendiente', 'Confirmada', 'Cancelada'];

// ---------- Instalación ----------

function instalar() {
  const libro = SpreadsheetApp.getActive();
  libro.setSpreadsheetTimeZone(ZONA);
  const hoja = libro.getSheetByName(HOJA) || libro.getSheets()[0].setName(HOJA);

  hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS])
    .setFontWeight('bold').setBackground('#0a0a0a').setFontColor('#b8996f');
  hoja.setFrozenRows(1);

  const reglaEstado = SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS, true).build();
  hoja.getRange(2, col('Estado'), hoja.getMaxRows() - 1, 1).setDataValidation(reglaEstado);
  ['Subtotal', 'Saldo consumo', 'Total'].forEach((nombre) =>
    hoja.getRange(2, col(nombre), hoja.getMaxRows() - 1, 1).setNumberFormat('$#,##0'));

  // Activador para reaccionar cuando cambies el Estado (requiere permisos de calendario).
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'alEditar')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('alEditar').forSpreadsheet(libro).onEdit().create();

  CalendarApp.getDefaultCalendar(); // pide el permiso de calendario ahora
}

// ---------- Recibir una reserva desde la app ----------

function doPost(e) {
  const datos = JSON.parse(e.postData.contents);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) || !/^\d{2}:\d{2}$/.test(datos.hora)) {
    return json({ ok: false, error: 'Fecha u hora inválida' });
  }

  const bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(10000);
  try {
    const hoja = hojaReservas();
    if (buscarFila(hoja, datos.id)) return json({ ok: true, repetida: true });

    const act = datos.actividades || {};
    const fila = {
      'ID': datos.id,
      'Recibida': new Date(),
      'Estado': 'Pendiente',
      'Fecha': datos.fecha,
      'Hora': datos.hora,
      'Cumpleañero': datos.cumpleanero,
      'Edad': datos.edad,
      'Contacto': datos.contacto,
      'Teléfono': datos.telefono,
      'Asistentes': datos.asistentes,
      'Arma tu pizza': act.pizza || '',
      'Art splash': act.splash || '',
      'Art slime': act.slime || '',
      'Art cerámica': act.ceramica || '',
      'Decoración Pablo': datos.pablo ? 'Sí' : '',
      'Subtotal': datos.subtotal,
      'Saldo consumo': datos.saldo,
      'Total': datos.total,
      'Estancia (min)': datos.estanciaMin,
      'Comentarios': datos.comentarios || '',
    };
    hoja.appendRow(COLUMNAS.map((c) => (c in fila ? fila[c] : '')));
    const numero = hoja.getLastRow();
    // Fecha y hora como texto, para que la hoja no las convierta.
    hoja.getRange(numero, col('Fecha'), 1, 2).setNumberFormat('@').setValues([[datos.fecha, datos.hora]]);

    const evento = crearEvento(leerFila(hoja, numero));
    hoja.getRange(numero, col('ID evento')).setValue(evento.getId());
    return json({ ok: true });
  } finally {
    bloqueo.releaseLock();
  }
}

// ---------- Horas de Art splash ocupadas (para la app) ----------

function doGet(e) {
  const fecha = (e.parameter && e.parameter.fecha) || '';
  const conteo = {};
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const hoja = hojaReservas();
    const filas = hoja.getLastRow() > 1
      ? hoja.getRange(2, 1, hoja.getLastRow() - 1, COLUMNAS.length).getDisplayValues()
      : [];
    filas.forEach((f) => {
      const r = aObjeto(f);
      if (r['Estado'] === 'Confirmada' && r['Fecha'] === fecha && Number(r['Art splash']) > 0) {
        conteo[r['Hora']] = (conteo[r['Hora']] || 0) + 1;
      }
    });
  }
  const llenas = Object.keys(conteo).filter((h) => conteo[h] >= SALAS_SPLASH);
  return json({ fecha: fecha, splashLlenas: llenas });
}

// ---------- Cambios de Estado hechos a mano ----------

function alEditar(e) {
  const hoja = e.range.getSheet();
  if (hoja.getName() !== HOJA || e.range.getColumn() !== col('Estado') || e.range.getRow() < 2) return;

  for (let n = e.range.getRow(); n <= e.range.getLastRow(); n++) {
    const r = leerFila(hoja, n);
    const evento = r['ID evento'] ? buscarEvento(r['ID evento']) : null;
    if (r['Estado'] === 'Cancelada') {
      if (evento) evento.deleteEvent();
      hoja.getRange(n, col('ID evento')).setValue('');
    } else if (evento) {
      evento.setTitle(tituloEvento(r));
    } else if (r['Fecha'] && r['Hora']) {
      hoja.getRange(n, col('ID evento')).setValue(crearEvento(r).getId());
    }
  }
}

// ---------- Calendario ----------

function crearEvento(r) {
  const inicio = Utilities.parseDate(`${r['Fecha']} ${r['Hora']}`, ZONA, 'yyyy-MM-dd HH:mm');
  const minutos = Math.max(Number(r['Estancia (min)']) || 0, 60);
  const fin = new Date(inicio.getTime() + minutos * 60000);
  return CalendarApp.getDefaultCalendar().createEvent(tituloEvento(r), inicio, fin, {
    description: descripcionEvento(r),
  });
}

function tituloEvento(r) {
  const marca = r['Estado'] === 'Confirmada' ? '✅' : '⏳ Por confirmar ·';
  const act = [
    ['Arma tu pizza', 'Pizza'], ['Art splash', 'Splash'], ['Art slime', 'Slime'], ['Art cerámica', 'Cerámica'],
  ].filter(([c]) => Number(r[c]) > 0).map(([c, corto]) => `${corto} ${r[c]}`);
  return `${marca} 🎂 ${r['Cumpleañero']} (${r['Edad']}) · ${r['Asistentes']} asist.` +
    (act.length ? ` · ${act.join(' · ')}` : '');
}

function descripcionEvento(r) {
  return [
    `Contacto: ${r['Contacto']} · ${r['Teléfono']}`,
    `Asistentes: ${r['Asistentes']}`,
    ...['Arma tu pizza', 'Art splash', 'Art slime', 'Art cerámica']
      .filter((c) => Number(r[c]) > 0).map((c) => `${c}: ${r[c]} personas`),
    r['Decoración Pablo'] ? 'Decoración Pablo: Sí' : '',
    `Total estimado: ${r['Total']} (saldo consumo: ${r['Saldo consumo'] || 0})`,
    r['Comentarios'] ? `Comentarios: ${r['Comentarios']}` : '',
    `ID reserva: ${r['ID']}`,
  ].filter(Boolean).join('\n');
}

function buscarEvento(id) {
  try {
    return CalendarApp.getDefaultCalendar().getEventById(id);
  } catch (err) {
    return null;
  }
}

// ---------- Utilidades ----------

function hojaReservas() {
  const libro = SpreadsheetApp.getActive();
  return libro.getSheetByName(HOJA) || libro.getSheets()[0];
}

function col(nombre) {
  return COLUMNAS.indexOf(nombre) + 1;
}

function aObjeto(valores) {
  const r = {};
  COLUMNAS.forEach((c, i) => (r[c] = valores[i]));
  return r;
}

function leerFila(hoja, n) {
  return aObjeto(hoja.getRange(n, 1, 1, COLUMNAS.length).getDisplayValues()[0]);
}

function buscarFila(hoja, id) {
  if (!id || hoja.getLastRow() < 2) return 0;
  const ids = hoja.getRange(2, 1, hoja.getLastRow() - 1, 1).getValues().map((f) => String(f[0]));
  const i = ids.indexOf(String(id));
  return i === -1 ? 0 : i + 2;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
