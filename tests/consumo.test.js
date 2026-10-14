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
  assert.match(text, /Hacen actividades: 10/);
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
