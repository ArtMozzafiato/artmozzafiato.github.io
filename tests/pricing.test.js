import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../public/config.js';
import { colombianHolidays, easterSunday, dateKey } from '../public/holidays.js';
import { buildQuote, dayInfo, parseDate } from '../public/pricing.js';
import { buildMessage } from '../public/message.js';

const d = (value) => parseDate(value);
const quote = (date, people, activityIds, extraIds) =>
  buildQuote({ date: d(date), people, activityIds, extraIds }, config);

test('Pascua', () => {
  assert.equal(dateKey(easterSunday(2026)), '2026-04-05');
  assert.equal(dateKey(easterSunday(2027)), '2027-03-28');
});

test('festivos de Colombia 2026 (calendario oficial)', () => {
  const expected = [
    '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03',
    '2026-05-01', '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29',
    '2026-07-20', '2026-08-07', '2026-08-17', '2026-10-12', '2026-11-02',
    '2026-11-16', '2026-12-08', '2026-12-25',
  ];
  assert.deepEqual([...colombianHolidays(2026).keys()].sort(), expected);
});

test('tipo de día', () => {
  assert.equal(dayInfo(d('2026-10-15'), config).isWeekend, false); // jueves
  assert.equal(dayInfo(d('2026-10-16'), config).isWeekend, true); // viernes
  assert.equal(dayInfo(d('2026-10-18'), config).isWeekend, true); // domingo
  const holiday = dayInfo(d('2026-11-16'), config); // lunes festivo
  assert.equal(holiday.isWeekend, true);
  assert.equal(holiday.holiday, 'Independencia de Cartagena');
  assert.equal(dayInfo(d('2026-04-02'), config).isWeekend, true); // Jueves Santo
});

test('Arma tu pizza: 30.000 por persona', () => {
  assert.equal(quote('2026-10-17', 10, ['pizza']).total, 300000);
});

test('Art splash entre semana: 50.000', () => {
  assert.equal(quote('2026-10-14', 4, ['splash']).total, 200000);
  assert.equal(quote('2026-10-14', 10, ['splash']).total, 500000);
});

test('Art splash fin de semana: 70.000 hasta 5 personas, 50.000 desde 6', () => {
  assert.equal(quote('2026-10-17', 5, ['splash']).total, 350000);
  assert.equal(quote('2026-10-17', 6, ['splash']).total, 300000);
});

test('Art splash en festivo usa tarifa de fin de semana', () => {
  assert.equal(quote('2026-11-02', 3, ['splash']).total, 210000);
});

test('Art slime 50.000 y cerámica 25.000 aprox.', () => {
  assert.equal(quote('2026-10-14', 2, ['slime']).total, 100000);
  const ceramica = quote('2026-10-14', 2, ['ceramica']);
  assert.equal(ceramica.total, 50000);
  assert.equal(ceramica.approximate, true);
});

test('combinación de actividades', () => {
  // 8 personas sábado: pizza 30.000 + splash oferta 50.000 = 80.000 c/u
  assert.equal(quote('2026-10-17', 8, ['pizza', 'splash']).total, 640000);
});

test('extras solo cuentan si están activos', () => {
  const custom = {
    ...config,
    extras: [
      { id: 'deco', nombre: 'Decoración', precio: 100000, tipo: 'unico', activo: true },
      { id: 'refri', nombre: 'Refrigerio', precio: 10000, tipo: 'porPersona', activo: true },
      { id: 'off', nombre: 'Inactivo', precio: 99999, tipo: 'unico', activo: false },
    ],
  };
  const q = buildQuote(
    { date: d('2026-10-14'), people: 5, activityIds: ['pizza'], extraIds: ['deco', 'refri', 'off'] },
    custom
  );
  assert.equal(q.total, 150000 + 100000 + 50000);
});

test('mensaje de WhatsApp incluye el detalle', () => {
  const q = quote('2026-10-17', 8, ['pizza', 'splash']);
  const text = buildMessage(
    {
      date: d('2026-10-17'),
      time: '2:00 p. m.',
      people: 8,
      birthdayName: 'Sofía',
      birthdayAge: '7',
      contactName: 'Ana',
      contactPhone: '3001234567',
      comments: '',
    },
    q,
    config
  );
  assert.match(text, /Sofía \(7 años\)/);
  assert.match(text, /sábado/);
  assert.match(text, /Total estimado: \$\s?640\.000/);
});
