// Festivos de Colombia, calculados para cualquier año.
// Incluye los fijos, los trasladables por Ley Emiliani (Ley 51 de 1983)
// y los que dependen de la Semana Santa.

const addDays = (date, days) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

// Si la fecha no cae en lunes, se mueve al lunes siguiente.
const toNextMonday = (date) => addDays(date, (8 - date.getDay()) % 7);

export const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

// Algoritmo anónimo gregoriano (Meeus/Jones/Butcher).
export function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const cache = new Map();

export function colombianHolidays(year) {
  if (cache.has(year)) return cache.get(year);

  const holidays = new Map();
  const add = (date, name) => holidays.set(dateKey(date), name);
  const on = (month, day) => new Date(year, month - 1, day);

  // Fijos
  add(on(1, 1), 'Año Nuevo');
  add(on(5, 1), 'Día del Trabajo');
  add(on(7, 20), 'Día de la Independencia');
  add(on(8, 7), 'Batalla de Boyacá');
  add(on(12, 8), 'Inmaculada Concepción');
  add(on(12, 25), 'Navidad');

  // Ley Emiliani: se trasladan al lunes siguiente
  add(toNextMonday(on(1, 6)), 'Día de los Reyes Magos');
  add(toNextMonday(on(3, 19)), 'Día de San José');
  add(toNextMonday(on(6, 29)), 'San Pedro y San Pablo');
  add(toNextMonday(on(8, 15)), 'Asunción de la Virgen');
  add(toNextMonday(on(10, 12)), 'Día de la Raza');
  add(toNextMonday(on(11, 1)), 'Día de Todos los Santos');
  add(toNextMonday(on(11, 11)), 'Independencia de Cartagena');

  // Dependientes de la Pascua
  const easter = easterSunday(year);
  add(addDays(easter, -3), 'Jueves Santo');
  add(addDays(easter, -2), 'Viernes Santo');
  add(toNextMonday(addDays(easter, 39)), 'Ascensión del Señor');
  add(toNextMonday(addDays(easter, 60)), 'Corpus Christi');
  add(toNextMonday(addDays(easter, 68)), 'Sagrado Corazón de Jesús');

  cache.set(year, holidays);
  return holidays;
}

export function holidayName(date) {
  return colombianHolidays(date.getFullYear()).get(dateKey(date)) ?? null;
}
