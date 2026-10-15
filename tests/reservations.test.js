import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../public/config.js';
import { buildQuote, parseDate } from '../public/pricing.js';
import { buildReservation, reservationsEnabled } from '../public/reservations.js';

test('sin URL configurada no se envía nada', () => {
  assert.equal(reservationsEnabled({ reservas: { url: '' } }), false);
  assert.equal(reservationsEnabled({ reservas: { url: 'https://script.google.com/x/exec' } }), true);
});

test('la reserva lleva fecha, hora, personas por actividad y totales', () => {
  const quote = buildQuote(
    {
      date: parseDate('2026-10-17'),
      attendees: 20,
      activityIds: ['splash', 'slime'],
      activityPeople: { splash: 10, slime: 5 },
      extraIds: ['pablo'],
    },
    config
  );
  const r = buildReservation(
    { dateValue: '2026-10-17', timeValue: '15:00', birthdayName: 'Sofía', birthdayAge: '7', contactName: 'Ana', contactPhone: '300', comments: '' },
    quote
  );
  assert.ok(r.id);
  assert.equal(r.fecha, '2026-10-17');
  assert.equal(r.hora, '15:00');
  assert.deepEqual(r.actividades, { splash: 10, slime: 5 });
  assert.equal(r.pablo, true);
  assert.equal(r.asistentes, 20);
  assert.equal(r.total, 1200000);
  assert.equal(r.saldo, 415000);
  assert.equal(r.estanciaMin, 90);
});
