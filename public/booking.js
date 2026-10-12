// Lógica de las reservas de actividades (página reservar.html).
import { dayInfo, formatCOP, formatLongDate, parseDate } from './pricing.js';
import { dateKey } from './holidays.js';
import { formatDuration, timeLabel } from './schedule.js';

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const activeActivities = (reservas) => reservas.actividades.filter((a) => a.activo !== false);

// Fecha y hora actuales en la zona del restaurante (no la del celular).
export function zonedNow(timeZone, now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value])
  );
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function lastBookableKey(reservas, now) {
  const today = parseDate(now.dateKey);
  return dateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + reservas.diasMaximos));
}

// Horas de un día y, si se conoce la ocupación (ocupados = { '14:00': 1 }),
// cuántos salones quedan. Las horas llenas se devuelven con libres = 0.
// Cada reserva ocupa un salón completo, sin importar cuántas personas sean.
export function slotsFor(activity, key, reservas, now, ocupados = null) {
  const date = parseDate(key);
  if (!date) return [];
  if (key < now.dateKey || key > lastBookableKey(reservas, now)) return [];
  if (reservas.fechasCerradas?.includes(key)) return [];
  if (activity.dias && !activity.dias.includes(date.getDay())) return [];

  const limit = key === now.dateKey ? now.minutes + reservas.anticipacionMinimaMinutos : -1;
  return activity.horas
    .filter((hora) => toMinutes(hora) >= limit)
    .map((hora) => ({
      value: hora,
      label: timeLabel(hora),
      libres: ocupados ? Math.max(0, activity.cupos - (ocupados[hora] ?? 0)) : null,
      cupos: activity.cupos,
    }));
}

export const isDayBookable = (activity, key, reservas, now) =>
  slotsFor(activity, key, reservas, now).length > 0;

// "50.000 lun a jue · 70.000 vie, sáb, dom y festivos"
export function priceText(activity) {
  const { precio } = activity;
  if (typeof precio === 'number') return `${activity.aproximado ? 'desde ' : ''}${formatCOP(precio)} por persona`;
  return `lunes a jueves ${formatCOP(precio.entreSemana)} por persona · viernes, sábado, domingo y festivos ${formatCOP(precio.finDeSemana)} por persona`;
}

export function bookingPrice(activity, date, people, config) {
  const info = dayInfo(date, config);
  const { precio, aproximado = false } = activity;
  const unit = typeof precio === 'number' ? precio : info.isWeekend ? precio.finDeSemana : precio.entreSemana;
  const total = unit * people;
  return {
    info,
    unit,
    people,
    total,
    abono: Math.round((total * config.reservas.abonoPorcentaje) / 100),
    approximate: aproximado,
  };
}

export const paymentText = ({ pago }) =>
  `${pago.titular} – ${pago.documento} – ${pago.tipoCuenta} ${pago.banco} ${pago.numero}`;

// "573169150000" → "316 915 0000"
export const localPhone = (phone) => phone.replace(/^57/, '').replace(/^(\d{3})(\d{3})(\d+)$/, '$1 $2 $3');

// Reemplaza {precios}, {abono}, {pago} y {whatsapp} en los textos del formulario.
export function fillText(text, activity, config) {
  const { reservas } = config;
  return text
    .replaceAll('{precios}', priceText(activity))
    .replaceAll('{abono}', `${reservas.abonoPorcentaje}%`)
    .replaceAll('{pago}', paymentText(reservas))
    .replaceAll('{whatsapp}', localPhone(config.negocio.whatsapp));
}

// Texto que el cliente envía por WhatsApp al restaurante.
export function buildBookingMessage(data, activity, price, config) {
  const { reservas } = config;
  const approx = price.approximate ? ' aprox.' : '';
  const dayType = price.info.holiday ? `festivo: ${price.info.holiday}` : price.info.rateLabel.toLowerCase();
  const lines = [
    `¡Hola ${config.negocio.nombre}! ${activity.emoji ?? ''} Quiero confirmar mi reserva:`.replace('  ', ' '),
    '',
    `${activity.emoji ?? '🎨'} *${activity.titulo}*`,
    `📅 Fecha: ${formatLongDate(parseDate(data.date))} (${dayType})`,
    `🕒 Hora: ${timeLabel(data.time)} (${formatDuration(activity.duracionMinutos)})`,
    `📍 Sede: ${reservas.sede.direccion}`,
    '',
    `👥 Personas: *${price.people}*`,
    `💵 Valor: ${price.people} × ${formatCOP(price.unit)} = *${formatCOP(price.total)}${approx}*`,
    `💳 Abono ${reservas.abonoPorcentaje}%: *${formatCOP(price.abono)}${approx}*`,
    '',
    `👤 ${data.name}`,
    `📱 ${data.phone}`,
    `✉️ ${data.email}`,
    `👧👦 ${data.minors}`,
  ];
  if (data.special) lines.push(`🎉 ${data.special}`);
  lines.push(
    '',
    '✅ Leí y acepté los términos y condiciones de la reserva.',
    `📎 Adjunto el comprobante del abono del ${reservas.abonoPorcentaje}% (${formatCOP(price.abono)}).`
  );
  if (data.id) lines.push('', `Reserva #${data.id}`);
  return lines.join('\n');
}
