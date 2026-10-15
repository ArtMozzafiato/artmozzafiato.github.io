// Conexión opcional con la hoja "Reservas Mozzafiato" (Google Apps Script).
// Si config.reservas.url está vacío, no se envía ni se consulta nada.

const llenasPorFecha = new Map();

export const reservationsEnabled = (config) => Boolean(config.reservas?.url);

const newId = () =>
  (crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

export function buildReservation(data, quote) {
  const people = Object.fromEntries(
    quote.lines.filter((l) => l.kind === 'actividad').map((l) => [l.id, l.quantity])
  );
  return {
    id: newId(),
    fecha: data.dateValue,
    hora: data.timeValue,
    cumpleanero: data.birthdayName,
    edad: data.birthdayAge,
    contacto: data.contactName,
    telefono: data.contactPhone,
    asistentes: quote.attendees,
    actividades: people,
    pablo: quote.lines.some((l) => l.id === 'pablo'),
    subtotal: quote.subtotal,
    saldo: quote.balance,
    total: quote.total,
    estanciaMin: quote.stayMinutes,
    comentarios: data.comments,
  };
}

// Se envía como text/plain y sin CORS para que Apps Script lo acepte desde
// cualquier página; keepalive deja terminar el envío aunque se abra WhatsApp.
export function sendReservation(config, reservation) {
  if (!reservationsEnabled(config)) return;
  try {
    fetch(config.reservas.url, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(reservation),
    }).catch(() => {});
  } catch {}
}

// Horas ("15:00") en que las salas de Art splash ya están llenas ese día.
export async function fullSplashHours(config, dateValue) {
  if (!reservationsEnabled(config) || !dateValue) return [];
  if (llenasPorFecha.has(dateValue)) return llenasPorFecha.get(dateValue);
  try {
    const res = await fetch(`${config.reservas.url}?fecha=${encodeURIComponent(dateValue)}`);
    const data = await res.json();
    const llenas = Array.isArray(data.splashLlenas) ? data.splashLlenas : [];
    llenasPorFecha.set(dateValue, llenas);
    return llenas;
  } catch {
    return []; // sin conexión: se ofrecen todas las horas y se confirma por WhatsApp
  }
}
