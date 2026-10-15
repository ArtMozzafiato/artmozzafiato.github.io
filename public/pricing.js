import { holidayName } from './holidays.js';
import { activityMinutes, stayMinutes, onTheHourOnly } from './schedule.js';

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Convierte "2026-10-24" en una fecha local (sin desfase de zona horaria).
export function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function dayInfo(date, config) {
  const holiday = holidayName(date);
  const isWeekend = holiday !== null || config.diasFinDeSemana.includes(date.getDay());
  return {
    dayName: DAY_NAMES[date.getDay()],
    holiday,
    isWeekend,
    rateLabel: isWeekend ? 'Tarifa fin de semana / festivo' : 'Tarifa entre semana',
  };
}

// Precio por persona de una actividad para el día y número de personas dados.
export function unitPrice(activity, people, info) {
  const { precio } = activity;
  if (typeof precio === 'number') return { amount: precio, note: null };

  if (!info.isWeekend) return { amount: precio.entreSemana, note: 'Tarifa entre semana' };

  const group = precio.finDeSemanaGrupo;
  if (group && people >= group.minimoPersonas) {
    return {
      amount: group.precio,
      note: `Oferta fin de semana desde ${group.minimoPersonas} personas`,
    };
  }
  return { amount: precio.finDeSemana, note: 'Tarifa fin de semana / festivo' };
}

// activityPeople: { idActividad: personas }. Si falta, se usa people.
export function buildQuote(
  { date, people = 0, attendees = 0, activityIds, activityPeople = {}, extraIds = [] },
  config
) {
  const info = date ? dayInfo(date, config) : null;
  const lines = [];

  for (const activity of config.actividades) {
    if (!activityIds.includes(activity.id)) continue;
    // Sin fecha se usa la tarifa entre semana como referencia.
    const quantity = activityPeople[activity.id] ?? people;
    const { amount, note } = unitPrice(activity, quantity, info ?? { isWeekend: false });
    lines.push({
      kind: 'actividad',
      id: activity.id,
      name: activity.nombre,
      unit: amount,
      quantity,
      subtotal: amount * quantity,
      note: activity.aproximado ? activity.nota : note,
      approximate: Boolean(activity.aproximado),
    });
  }

  for (const extra of config.extras) {
    if (!extra.activo || !extraIds.includes(extra.id)) continue;
    const quantity = extra.tipo === 'porPersona' ? attendees || people : 1;
    lines.push({
      kind: 'extra',
      id: extra.id,
      name: extra.nombre,
      unit: extra.precio,
      quantity,
      subtotal: extra.precio * quantity,
      note: extra.tipo === 'porPersona' ? 'Por persona' : 'Valor único',
      approximate: false,
    });
  }

  // Consumo mínimo del evento: lo que no cubren actividades y extras queda
  // como saldo para consumir en el restaurante.
  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const minimumSpend = attendees * (config.consumoMinimoPorAsistente ?? 0);
  const balance = Math.max(0, minimumSpend - subtotal);

  return {
    info,
    lines,
    attendees,
    subtotal,
    minimumSpend,
    balance,
    total: subtotal + balance,
    approximate: lines.some((line) => line.approximate),
    activityMinutes: activityMinutes(activityIds, config),
    stayMinutes: stayMinutes(activityIds, config),
    needsRoom: onTheHourOnly(activityIds, config),
  };
}

export const formatCOP = (amount) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);

export function formatLongDate(date) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
