import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../public/config.js';
import { parseDate } from '../public/pricing.js';
import {
  activeActivities,
  bookingPrice,
  buildBookingMessage,
  fillText,
  isDayBookable,
  peopleLimits,
  slotStatus,
  slotsFor,
  zonedNow,
} from '../public/booking.js';

const { reservas } = config;
const splash = reservas.actividades.find((a) => a.id === 'splash');
const ceramica = reservas.actividades.find((a) => a.id === 'ceramica');
const slime = reservas.actividades.find((a) => a.id === 'slime');
const taller = reservas.actividades.find((a) => a.id === 'slime-taller');
const now = { dateKey: '2026-10-12', minutes: 11 * 60 }; // lunes 11:00 a. m.
const price = (date, people, activity = splash) => bookingPrice(activity, parseDate(date), people, config);

test('hora de Bogotá sin importar la zona del celular', () => {
  // 2026-10-13 03:30 UTC = 2026-10-12 22:30 en Bogotá (UTC-5)
  assert.deepEqual(zonedNow('America/Bogota', new Date('2026-10-13T03:30:00Z')), {
    dateKey: '2026-10-12',
    minutes: 22 * 60 + 30,
  });
});

test('Art Splash: 50.000 lun a jue, 70.000 vie a dom y festivos', () => {
  assert.equal(price('2026-10-15', 4).total, 200000); // jueves
  assert.equal(price('2026-10-16', 4).total, 280000); // viernes
  assert.equal(price('2026-10-18', 1).total, 70000); // domingo
  assert.equal(price('2026-10-12', 2).unit, 70000); // lunes festivo (Día de la Raza)
  // Sin la oferta de grupo del cotizador de cumpleaños
  assert.equal(price('2026-10-17', 10).unit, 70000);
});

test('abono del 50%', () => {
  const p = price('2026-10-16', 3);
  assert.equal(p.total, 210000);
  assert.equal(p.abono, 105000);
  assert.equal(price('2026-10-14', 3, ceramica).approximate, true);
});

test('horas del día: 2:00 a 8:00 p. m. en punto', () => {
  const slots = slotsFor(splash, '2026-10-13', reservas, now);
  assert.deepEqual(slots.map((s) => s.value), ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']);
  assert.equal(slots[0].label, '2:00 p. m.');
  assert.equal(slots[0].libres, null); // sin hoja de Google no se conocen los salones
});

test('salones: cada reserva ocupa un salón, 2 salones por hora', () => {
  // 14:00: una pareja y un grupo de 15 → 2/2 lleno. 15:00: una reserva → 1/2.
  const slots = slotsFor(splash, '2026-10-13', reservas, now, { '14:00': 2, '15:00': 1 });
  assert.equal(slots[0].value, '14:00');
  assert.equal(slots[0].libres, 0);
  assert.equal(slots[1].libres, 1);
  assert.equal(slots[2].libres, 2);
  assert.equal(slots[0].cupos, 2);
});

test('mismo día: solo horas con la anticipación mínima', () => {
  const at = (h, m = 0) => ({ dateKey: '2026-10-13', minutes: h * 60 + m });
  assert.equal(slotsFor(splash, '2026-10-13', reservas, at(14))[0].value, '15:00');
  assert.equal(slotsFor(splash, '2026-10-13', reservas, at(14, 1))[0].value, '16:00');
  assert.equal(isDayBookable(splash, '2026-10-13', reservas, at(19, 30)), false);
});

test('días reservables', () => {
  assert.equal(isDayBookable(splash, '2026-10-11', reservas, now), false); // ayer
  assert.equal(isDayBookable(splash, '2026-12-11', reservas, now), true); // 60 días
  assert.equal(isDayBookable(splash, '2026-12-12', reservas, now), false); // 61 días
  const closed = { ...reservas, fechasCerradas: ['2026-12-24'] };
  assert.equal(isDayBookable(splash, '2026-12-24', closed, now), false);
});

test('textos del formulario con los datos de pago', () => {
  const abono = reservas.condiciones.find((c) => c.id === 'abono');
  const text = fillText(abono.texto, splash, config);
  assert.match(text, /50% del pago a: Daniela Márquez – CC 1037609217 – Cuenta de ahorros Bancolombia 01913351378/);
  assert.match(text, /WhatsApp 316 915 0000/);
});

test('mensaje de WhatsApp con total, abono y recordatorio del comprobante', () => {
  const p = price('2026-10-16', 4);
  const text = buildBookingMessage(
    {
      date: '2026-10-16',
      time: '15:00',
      name: 'Ana',
      phone: '3001234567',
      email: 'ana@correo.com',
      minors: 'Ninguno es menor de edad.',
      special: 'Cumpleaños de Ana',
      id: 'AB12CD',
    },
    splash,
    p,
    config
  );
  assert.match(text, /ArtSplash - Laureles/);
  assert.match(text, /viernes, 16 de octubre de 2026/);
  assert.match(text, /Hora: 3:00 p\. m\. \(45 min\)/);
  assert.match(text, /Personas: \*4\*/);
  assert.match(text, /4 × \$\s?70\.000 = \*\$\s?280\.000\*/);
  assert.match(text, /Abono 50%: \*\$\s?140\.000\*/);
  assert.match(text, /Adjunto el comprobante del abono del 50%/);
  assert.match(text, /Cumpleaños de Ana/);
  assert.match(text, /Reserva #AB12CD/);
});

test('todas las actividades activas tienen lo necesario', () => {
  for (const a of activeActivities(reservas)) {
    assert.ok(a.titulo && a.horas.length && a.cupos > 0 && a.duracionMinutos > 0, a.id);
  }
});

test('solo se reservan Art Splash y Art Slime', () => {
  assert.deepEqual(activeActivities(reservas).map((a) => a.id), ['splash', 'slime', 'slime-taller']);
  assert.equal(splash.emoji, '🫟');
  assert.equal(slime.emoji, '🧪');
});

test('Art Slime clase privada: 1 salón, mínimo 5 personas, sábado sin la hora del taller', () => {
  assert.deepEqual(peopleLimits(slime, reservas), { minimo: 5, maximo: 30 });
  const saturday = slotsFor(slime, '2026-10-17', reservas, now).map((s) => s.value);
  assert.equal(saturday[0], '15:00');
  assert.equal(slotsFor(slime, '2026-10-16', reservas, now)[0].value, '14:00'); // viernes
  const [first] = slotsFor(slime, '2026-10-16', reservas, now, { '14:00': 1 });
  assert.equal(slotStatus(first, slime), 'Lleno · 1/1 salones');
  assert.equal(bookingPrice(slime, parseDate('2026-10-17'), 5, config).total, 250000);
});

test('Art Slime taller grupal: sábados 1:30 p. m., 10 cupos por persona, grupos de 1 a 4', () => {
  assert.equal(isDayBookable(taller, '2026-10-16', reservas, now), false); // viernes
  const [slot] = slotsFor(taller, '2026-10-17', reservas, now, { '13:30': 7 });
  assert.equal(slot.value, '13:30');
  assert.equal(slot.label, '1:30 p. m.');
  assert.equal(slot.libres, 3);
  assert.equal(slotStatus(slot, taller), '7/10 cupos reservados');
  assert.deepEqual(peopleLimits(taller, reservas), { minimo: 1, maximo: 4 });
  const [full] = slotsFor(taller, '2026-10-17', reservas, now, { '13:30': 10 });
  assert.equal(slotStatus(full, taller), 'Lleno · 10/10 cupos');
});

test('Art Splash muestra salones', () => {
  const [slot] = slotsFor(splash, '2026-10-16', reservas, now, { '14:00': 1 });
  assert.equal(slotStatus(slot, splash), '1/2 salones reservados');
});
