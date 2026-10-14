import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../public/config.js';
import { buildQuote, parseDate } from '../public/pricing.js';
import { buildMessage } from '../public/message.js';

const quote = (attendees, people, activityIds, extraIds = []) =>
  buildQuote({ date: parseDate('2026-10-14'), attendees, people, activityIds, extraIds }, config);

test('saldo = asistentes × 60.000 − actividades − Pablo', () => {
  // 20 asistentes → 1.200.000; 10 en pizza = 300.000; Pablo 35.000
  const q = quote(20, 10, ['pizza'], ['pablo']);
  assert.equal(q.subtotal, 335000);
  assert.equal(q.minimumSpend, 1200000);
  assert.equal(q.balance, 865000);
  assert.equal(q.total, 1200000);
});

test('sin saldo cuando las actividades cubren el consumo mínimo', () => {
  // 5 asistentes → 300.000; 5 en pizza + slime (miércoles) = 400.000
  const q = quote(5, 5, ['pizza', 'slime']);
  assert.equal(q.balance, 0);
  assert.equal(q.total, 400000);
});

test('el mensaje de WhatsApp incluye asistentes y saldo', () => {
  const q = quote(20, 10, ['pizza'], ['pablo']);
  const text = buildMessage(
    {
      date: parseDate('2026-10-14'),
      time: '3:00 p. m.',
      people: 10,
      birthdayName: 'Jero',
      birthdayAge: '5',
      contactName: 'Ana',
      contactPhone: '3001234567',
      comments: '',
    },
    q,
    config
  );
  assert.match(text, /Asistentes al evento: 20/);
  assert.match(text, /Arma tu pizza \(10 personas/);
  assert.match(text, /Saldo para consumir en el restaurante: \$\s?865\.000/);
  assert.match(text, /Total estimado: \$\s?1\.200\.000/);
});

test('sin saldo, el mensaje no lo menciona', () => {
  const q = quote(5, 5, ['pizza', 'slime']);
  const text = buildMessage(
    { date: parseDate('2026-10-14'), time: '3:00 p. m.', people: 5, birthdayName: 'A', birthdayAge: '5', contactName: 'B', contactPhone: '1', comments: '' },
    q,
    config
  );
  assert.doesNotMatch(text, /Saldo/);
});

test('personas por actividad: 20 asistentes, 10 en Art splash y 5 en Art slime (sábado)', () => {
  const q = buildQuote(
    {
      date: parseDate('2026-10-17'),
      attendees: 20,
      activityIds: ['splash', 'slime'],
      activityPeople: { splash: 10, slime: 5 },
    },
    config
  );
  const byId = Object.fromEntries(q.lines.map((l) => [l.id, l]));
  assert.equal(byId.splash.quantity, 10);
  assert.equal(byId.splash.unit, 50000); // oferta de grupo: 10 ≥ 6
  assert.equal(byId.slime.quantity, 5);
  assert.equal(q.subtotal, 500000 + 250000);
  assert.equal(q.balance, 1200000 - 750000);
  assert.equal(q.total, 1200000);
});

test('la oferta de Art splash depende de cuántos hacen Art splash, no de los asistentes', () => {
  const q = buildQuote(
    { date: parseDate('2026-10-17'), attendees: 20, activityIds: ['splash'], activityPeople: { splash: 5 } },
    config
  );
  assert.equal(q.lines[0].unit, 70000);
});

test('el mensaje muestra las personas de cada actividad', () => {
  const q = buildQuote(
    {
      date: parseDate('2026-10-17'),
      attendees: 20,
      activityIds: ['splash', 'slime'],
      activityPeople: { splash: 10, slime: 5 },
    },
    config
  );
  const text = buildMessage(
    { date: parseDate('2026-10-17'), time: '3:00 p. m.', birthdayName: 'A', birthdayAge: '7', contactName: 'B', contactPhone: '1', comments: '' },
    q,
    config
  );
  assert.match(text, /Art splash \(10 personas × \$\s?50\.000\)/);
  assert.match(text, /Art slime \(5 personas × \$\s?50\.000\)/);
  assert.doesNotMatch(text, /Hacen actividades/);
});
