import { holidayName } from './holidays.js';

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

export function buildQuote({ date, people, activityIds, extraIds = [] }, config) {
  const info = date ? dayInfo(date, config) : null;
  const lines = [];

  for (const activity of config.actividades) {
    if (!activityIds.includes(activity.id)) continue;
    // Sin fecha se usa la tarifa entre semana como referencia.
    const { amount, note } = unitPrice(activity, people, info ?? { isWeekend: false });
    lines.push({
      kind: 'actividad',
      id: activity.id,
      name: activity.nombre,
      unit: amount,
      quantity: people,
      subtotal: amount * people,
      note: activity.aproximado ? activity.nota : note,
      approximate: Boolean(activity.aproximado),
    });
  }

  for (const extra of config.extras) {
    if (!extra.activo || !extraIds.includes(extra.id)) continue;
    const quantity = extra.tipo === 'porPersona' ? people : 1;
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

  return {
    info,
    lines,
    total: lines.reduce((sum, line) => sum + line.subtotal, 0),
    approximate: lines.some((line) => line.approximate),
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
