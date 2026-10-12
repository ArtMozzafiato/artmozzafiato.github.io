// Duración de la visita y horas de inicio disponibles.

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const toHHMM = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

// "13:30" → "1:30 p. m."
export function timeLabel(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const mm = String(m).padStart(2, '0');
  if (h === 12 && m === 0) return '12:00 m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${h < 12 ? 'a. m.' : 'p. m.'}`;
}

// 130 → "2 h 10 min"
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

const selected = (activityIds, config) =>
  config.actividades.filter((activity) => activityIds.includes(activity.id));

export const stayMinutes = (activityIds, config) =>
  selected(activityIds, config).reduce((sum, activity) => sum + (activity.duracionMinutos ?? 0), 0);

export const onTheHourOnly = (activityIds, config) =>
  selected(activityIds, config).some((activity) => activity.soloEnPunto);

// Horas de inicio que permiten terminar todo antes del cierre.
export function startTimes(activityIds, config) {
  const { apertura, cierre, intervaloMinutos } = config.horario;
  const step = onTheHourOnly(activityIds, config) ? 60 : intervaloMinutos;
  const duration = stayMinutes(activityIds, config) || 60;
  const first = Math.ceil(toMinutes(apertura) / step) * step;
  const last = toMinutes(cierre) - duration;

  const times = [];
  for (let t = first; t <= last; t += step) {
    const value = toHHMM(t);
    times.push({ value, label: timeLabel(value) });
  }
  return times;
}
