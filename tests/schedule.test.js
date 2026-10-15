import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../public/config.js';
import { activityMinutes, formatDuration, startTimes, stayMinutes, timeLabel } from '../public/schedule.js';
import { buildQuote, parseDate } from '../public/pricing.js';

const values = (ids) => startTimes(ids, config).map((t) => t.value);

test('duración de la estancia: actividades + 2 h de celebración', () => {
  assert.equal(activityMinutes(['pizza'], config), 25);
  assert.equal(activityMinutes(['splash', 'pizza'], config), 70);
  assert.equal(activityMinutes(['splash', 'slime', 'ceramica', 'pizza'], config), 175);
  assert.equal(stayMinutes(['pizza'], config), 145);
  assert.equal(stayMinutes(['splash', 'pizza'], config), 190);
  assert.equal(stayMinutes(['splash', 'slime', 'ceramica', 'pizza'], config), 295);
  assert.equal(stayMinutes([], config), 120);
  assert.equal(formatDuration(25), '25 min');
  assert.equal(formatDuration(60), '1 h');
  assert.equal(formatDuration(70), '1 h 10 min');
});

test('formato de hora', () => {
  assert.equal(timeLabel('13:00'), '1:00 p. m.');
  assert.equal(timeLabel('20:30'), '8:30 p. m.');
  assert.equal(timeLabel('12:00'), '12:00 m.');
});

test('sin Art splash: cada 30 min y terminando antes de las 10:30 p. m.', () => {
  const pizza = values(['pizza']); // 25 min + 2 h → última 8:00 p. m.
  assert.equal(pizza[0], '13:00');
  assert.equal(pizza[1], '13:30');
  assert.equal(pizza.at(-1), '20:00');
  assert.equal(values(['ceramica']).at(-1), '19:30'); // 1 h + 2 h
});

test('con Art splash: solo en punto', () => {
  const splash = values(['splash']); // 45 min + 2 h → última 7:00 p. m.
  assert.deepEqual(splash, ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']);
  // splash + cerámica + 2 h = 3 h 45 min → debe terminar antes de las 10:30 p. m.
  assert.equal(values(['splash', 'ceramica']).at(-1), '18:00');
});

test('la cotización indica estancia y verificación de sala', () => {
  const q = buildQuote({ date: parseDate('2026-10-14'), people: 4, activityIds: ['splash', 'pizza'] }, config);
  assert.equal(q.activityMinutes, 70);
  assert.equal(q.stayMinutes, 190);
  assert.equal(q.needsRoom, true);
  const sinSplash = buildQuote({ date: parseDate('2026-10-14'), people: 4, activityIds: ['pizza'] }, config);
  assert.equal(sinSplash.needsRoom, false);
});

test('Decoración Pablo: 35.000 por reserva', () => {
  const q = buildQuote(
    { date: parseDate('2026-10-14'), people: 10, activityIds: ['pizza'], extraIds: ['pablo'] },
    config
  );
  assert.equal(q.total, 300000 + 35000);
});
