import { config } from './config.js';
import { dayInfo, formatCOP, formatLongDate, parseDate } from './pricing.js';
import { dateKey } from './holidays.js';
import { formatDuration, timeLabel } from './schedule.js';
import {
  activeActivities,
  bookingPrice,
  buildBookingMessage,
  fillText,
  isDayBookable,
  lastBookableKey,
  priceText,
  slotsFor,
  zonedNow,
} from './booking.js';
import { whatsappUrl } from './message.js';
import { createCarousel } from './gallery.js';
import { setupPwa } from './pwa.js';

const { reservas } = config;
const activities = activeActivities(reservas);
const $ = (selector) => document.querySelector(selector);

const state = {
  activity: null,
  date: null, // 'AAAA-MM-DD'
  time: null, // 'HH:MM'
  month: null, // Date del primer día del mes visible
  ocupados: null,
};

const now = () => zonedNow(reservas.zonaHoraria);

// ---------- Navegación entre pasos (con el botón atrás del celular) ----------

const views = [...document.querySelectorAll('.view')];
function show(view, push = true) {
  views.forEach((el) => (el.hidden = el.dataset.view !== view));
  $('#booking-bar').hidden = view !== 'form';
  if (push) history.pushState({ view }, '');
  window.scrollTo({ top: view === 'activity' ? 0 : $('main').offsetTop - 8 });
}
window.addEventListener('popstate', (event) => {
  const view = event.state?.view ?? firstView();
  if (view === 'time') renderSlots();
  show(view, false);
});
document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => history.back()));

const firstView = () => (activities.length > 1 && !fixedActivity ? 'activity' : 'day');

// ---------- Paso 1: actividad ----------

const requested = new URLSearchParams(location.search).get('actividad');
const fixedActivity = activities.find((a) => a.id === requested) ?? null;

function renderActivities() {
  const list = $('#activity-list');
  for (const activity of activities) {
    const card = document.createElement('div');
    card.className = 'option-card';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option option--button';
    button.innerHTML = `
      <span class="option__emoji" aria-hidden="true">${activity.emoji ?? ''}</span>
      <span class="option__body">
        <span class="option__name"></span>
        <span class="option__desc"></span>
        <span class="option__meta"></span>
      </span>
      <span class="option__go" aria-hidden="true">›</span>`;
    button.querySelector('.option__name').textContent = activity.nombre;
    button.querySelector('.option__desc').textContent = priceText(activity);
    button.querySelector('.option__meta').textContent = `⏱ ${formatDuration(activity.duracionMinutos)}`;
    button.addEventListener('click', () => selectActivity(activity));
    card.append(button);
    if (activity.fotos?.length) card.append(createCarousel(activity.fotos, { label: `Fotos de ${activity.nombre}` }));
    list.append(card);
  }
}

function selectActivity(activity, push = true) {
  state.activity = activity;
  state.date = null;
  state.time = null;
  const today = parseDate(now().dateKey);
  state.month = new Date(today.getFullYear(), today.getMonth(), 1);

  document.querySelectorAll('[data-bind="titulo"]').forEach((el) => (el.textContent = activity.titulo));
  document.querySelectorAll('[data-bind="duracion"]').forEach((el) => {
    el.textContent = formatDuration(activity.duracionMinutos);
  });
  document.querySelectorAll('[data-bind="direccion"]').forEach((el) => {
    el.textContent = reservas.sede.direccion;
    if (el.tagName === 'A') el.href = reservas.sede.mapa;
  });
  document.querySelector('[data-bind="precios"]').textContent = priceText(activity);
  renderDescription(activity);
  renderCalendar();
  renderFormTexts(activity);
  show('day', push);
}

function renderDescription(activity) {
  const box = $('#event-description');
  box.replaceChildren();
  const intro = document.createElement('p');
  intro.className = 'event__intro';
  intro.textContent = activity.intro ?? '';
  box.append(intro);
  if (activity.fotos?.length) box.append(createCarousel(activity.fotos, { label: `Fotos de ${activity.nombre}` }));

  const { terminos } = reservas;
  const title = document.createElement('h3');
  title.textContent = terminos.titulo;
  const lead = document.createElement('p');
  lead.textContent = terminos.intro;
  const list = document.createElement('ol');
  for (const [heading, text] of terminos.puntos) {
    const item = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = `${heading}. `;
    item.append(strong, text);
    list.append(item);
  }
  box.append(title, lead, list);
}

// ---------- Paso 2: calendario ----------

const monthFormat = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' });

function renderCalendar() {
  const { month, activity } = state;
  const current = now();
  const days = $('#cal-days');
  days.replaceChildren();
  const monthName = monthFormat.format(month);
  $('#cal-month').textContent = monthName[0].toUpperCase() + monthName.slice(1);

  const today = parseDate(current.dateKey);
  const last = parseDate(lastBookableKey(reservas, current));
  $('#cal-prev').disabled = month <= new Date(today.getFullYear(), today.getMonth(), 1);
  $('#cal-next').disabled = new Date(month.getFullYear(), month.getMonth() + 1, 1) > last;

  for (let i = 0; i < month.getDay(); i++) days.append(document.createElement('span'));
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  for (let day = 1; day <= total; day++) {
    const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = day;
    button.className = 'calendar__day';
    if (key === current.dateKey) button.classList.add('is-today');
    if (key === state.date) button.classList.add('is-selected');
    if (isDayBookable(activity, key, reservas, current)) {
      button.classList.add('is-available');
      if (dayInfo(parseDate(key), config).holiday) button.classList.add('is-holiday');
      button.setAttribute('aria-label', formatLongDate(parseDate(key)));
      button.addEventListener('click', () => selectDay(key));
    } else {
      button.disabled = true;
    }
    days.append(button);
  }
}

$('#cal-prev').addEventListener('click', () => {
  state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1);
  renderCalendar();
});
$('#cal-next').addEventListener('click', () => {
  state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1);
  renderCalendar();
});

// ---------- Paso 3: horas ----------

async function fetchOcupados(activity, key) {
  if (!reservas.apiUrl) return null;
  try {
    const url = `${reservas.apiUrl}?actividad=${encodeURIComponent(activity.id)}&fecha=${key}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.ok ? data.ocupados : null;
  } catch {
    return null; // sin conexión: se muestran todas las horas y el restaurante confirma
  }
}

async function selectDay(key, push = true) {
  state.date = key;
  state.time = null;
  renderCalendar();
  const date = parseDate(key);
  const info = dayInfo(date, config);
  const label = formatLongDate(date);
  $('#time-day').textContent = label[0].toUpperCase() + label.slice(1);
  const rate = $('#day-rate');
  rate.classList.toggle('badge--weekend', info.isWeekend);
  rate.textContent = info.holiday ? `🎉 Festivo (${info.holiday}) · ${info.rateLabel}` : info.rateLabel;

  state.ocupados = null;
  renderSlots(reservas.apiUrl ? 'Consultando disponibilidad…' : null);
  show('time', push);
  if (reservas.apiUrl) {
    state.ocupados = await fetchOcupados(state.activity, key);
    if (state.date === key) renderSlots();
  }
}

function renderSlots(loadingText = null) {
  const box = $('#slots');
  const msg = $('#slots-msg');
  box.replaceChildren();
  if (loadingText) {
    msg.hidden = false;
    msg.textContent = loadingText;
    return;
  }
  const slots = slotsFor(state.activity, state.date, reservas, now(), state.ocupados);
  msg.hidden = slots.some((slot) => slot.libres !== 0);
  msg.textContent = 'No quedan horas disponibles este día. Elige otro día.';

  for (const slot of slots) {
    const row = document.createElement('div');
    row.className = 'slot';
    row.classList.toggle('is-selected', slot.value === state.time);

    const pick = document.createElement('button');
    pick.type = 'button';
    pick.className = 'slot__time';
    pick.innerHTML = `<strong></strong>${slot.libres !== null ? '<small></small>' : ''}`;
    pick.querySelector('strong').textContent = slot.label;
    if (slot.libres !== null) {
      const ocupados = slot.cupos - slot.libres;
      pick.querySelector('small').textContent =
        slot.libres === 0
          ? `Lleno · ${ocupados}/${slot.cupos} salones`
          : `${ocupados}/${slot.cupos} salones reservados`;
    }
    if (slot.libres === 0) {
      pick.disabled = true;
      row.classList.add('is-full');
    }
    pick.addEventListener('click', () => {
      state.time = slot.value;
      renderSlots();
    });

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'slot__next';
    next.textContent = 'Siguiente';
    next.addEventListener('click', openForm);
    row.append(pick, next);
    box.append(row);
  }
}

// ---------- Paso 4: formulario ----------

const peopleInput = $('#people');
const clampPeople = (n) =>
  Math.min(reservas.personas.maximo, Math.max(reservas.personas.minimo, Math.round(n) || reservas.personas.minimo));

function checkTemplate(name, text, option, type = 'checkbox') {
  const box = document.createElement('fieldset');
  box.className = 'question';
  box.dataset.question = name;
  const legend = document.createElement('legend');
  legend.className = 'question__text';
  legend.textContent = text;
  box.append(legend);
  for (const value of [].concat(option)) {
    const label = document.createElement('label');
    label.className = 'check';
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.value = value;
    input.required = true;
    const span = document.createElement('span');
    span.textContent = value;
    label.append(input, span);
    box.append(label);
  }
  return box;
}

function renderFormTexts(activity) {
  $('#people-label').textContent = `👥 ¿Cuántas personas realizarán la experiencia ${activity.nombre}?`;
  const conditions = $('#conditions');
  conditions.replaceChildren(
    ...reservas.condiciones.map((c) =>
      c.respuestas
        ? checkTemplate(c.id, fillText(c.texto, activity, config), c.respuestas, 'radio')
        : checkTemplate(c.id, fillText(c.texto, activity, config), c.opcion)
    )
  );
  $('#special-label').textContent = reservas.preguntaEspecial;
  const { aceptacionFinal } = reservas;
  $('#final-acceptance').replaceChildren(checkTemplate('final', aceptacionFinal.texto, aceptacionFinal.opcion));
}

function openForm() {
  if (!state.time) return;
  const date = parseDate(state.date);
  $('#form-when').textContent = `${timeLabel(state.time)}, ${formatLongDate(date)}`;
  if (!peopleInput.value) peopleInput.value = 2;
  renderTotal();
  show('form');
}

function currentPrice() {
  return bookingPrice(state.activity, parseDate(state.date), clampPeople(Number(peopleInput.value)), config);
}

function renderTotal() {
  const price = currentPrice();
  const approx = price.approximate ? ' aprox.' : '';
  const pct = `${reservas.abonoPorcentaje}%`;
  $('#total-detail').textContent = `${price.people} ${price.people === 1 ? 'persona' : 'personas'} × ${formatCOP(price.unit)}`;
  $('#total-value').textContent = formatCOP(price.total) + approx;
  $('#abono-label').textContent = `Abono ${pct} para confirmar`;
  $('#abono-value').textContent = formatCOP(price.abono) + approx;
  $('#total-note').textContent =
    (price.info.holiday ? `🎉 Festivo: ${price.info.holiday}. ` : '') +
    `${price.info.rateLabel}.` +
    (price.approximate ? ' El valor final depende de la pieza elegida.' : '') +
    ` Envía el comprobante del abono por WhatsApp junto con tu mensaje.`;
  $('#bar-pct').textContent = pct;
  $('#bar-abono').textContent = formatCOP(price.abono);
}

document.querySelectorAll('[data-step]').forEach((button) => {
  button.addEventListener('click', () => {
    peopleInput.value = clampPeople(Number(peopleInput.value || 0) + Number(button.dataset.step));
    renderTotal();
  });
});
peopleInput.addEventListener('input', () => {
  if (peopleInput.value) renderTotal();
});
peopleInput.addEventListener('change', () => {
  peopleInput.value = clampPeople(Number(peopleInput.value));
  renderTotal();
});

const form = $('#booking-form');
form.addEventListener('input', (event) => {
  event.target.classList?.remove('invalid');
  event.target.closest('.question')?.classList.remove('invalid');
});
form.addEventListener('change', (event) => event.target.closest('.question')?.classList.remove('invalid'));

function validate() {
  form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
  const invalid = [];
  const name = $('#name');
  const email = $('#email');
  const phone = $('#phone');
  if (!name.value.trim()) invalid.push(name);
  if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) invalid.push(email);
  if (phone.value.replace(/\D/g, '').length < 7) invalid.push(phone);
  if (!Number(peopleInput.value)) invalid.push(peopleInput);
  form.querySelectorAll('.question[data-question]').forEach((question) => {
    if (!question.querySelector('input:checked')) invalid.push(question);
  });
  invalid.forEach((el) => el.classList.add('invalid'));
  return invalid;
}

// Registra la reserva en la hoja de Google (si está configurada).
async function register(data, price) {
  if (!reservas.apiUrl) return { ok: true };
  try {
    const response = await fetch(reservas.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // evita la verificación CORS previa
      body: JSON.stringify({
        actividad: state.activity.id,
        fecha: state.date,
        hora: state.time,
        personas: price.people,
        total: price.total,
        abono: price.abono,
        nombre: data.name,
        celular: data.phone,
        correo: data.email,
        menores: data.minors,
        especial: data.special,
      }),
    });
    return await response.json();
  } catch {
    return { ok: true }; // sin conexión con la hoja: igual se envía por WhatsApp
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const invalid = validate();
  if (invalid.length) {
    invalid[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (invalid[0].tagName === 'INPUT') invalid[0].focus({ preventScroll: true });
    return;
  }
  peopleInput.value = clampPeople(Number(peopleInput.value));
  const price = currentPrice();
  const data = {
    date: state.date,
    time: state.time,
    name: $('#name').value.trim(),
    email: $('#email').value.trim(),
    phone: $('#phone').value.trim(),
    minors: form.querySelector('input[name="menores"]:checked').value,
    special: $('#special').value.trim(),
  };

  const submit = $('#submit-btn');
  submit.disabled = true;
  const result = await register(data, price);
  submit.disabled = false;
  if (!result.ok) {
    alert(
      result.error === 'lleno'
        ? 'Lo sentimos, esa hora se acaba de llenar. Elige otra hora.'
        : 'No pudimos registrar tu reserva. Intenta de nuevo.'
    );
    if (result.error === 'lleno') {
      history.replaceState({ view: 'time' }, '');
      selectDay(state.date, false);
    }
    return;
  }

  const text = buildBookingMessage({ ...data, id: result.id }, state.activity, price, config);
  openPayDialog(price, whatsappUrl(config.negocio.whatsapp, text));
});

// ---------- Recordatorio del abono ----------

const dialog = $('#pay-dialog');

function openPayDialog(price, url) {
  const { pago, abonoPorcentaje } = reservas;
  const approx = price.approximate ? ' aprox.' : '';
  $('#pay-total').textContent = formatCOP(price.total) + approx;
  $('#pay-abono-label').textContent = `Abono ${abonoPorcentaje}%`;
  $('#pay-abono').textContent = formatCOP(price.abono) + approx;
  $('#pay-abono-step').textContent = formatCOP(price.abono);
  $('#pay-bank').textContent = `${pago.banco} · ${pago.tipoCuenta}`;
  $('#pay-number').textContent = pago.numero;
  $('#pay-holder').textContent = `${pago.titular} · ${pago.documento}`;
  $('#pay-wa').href = url;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

$('#pay-cancel').addEventListener('click', () => dialog.close());
$('#pay-copy').addEventListener('click', async (event) => {
  try {
    await navigator.clipboard.writeText(reservas.pago.numero);
    event.target.textContent = '¡Copiado! ✓';
  } catch {
    event.target.textContent = reservas.pago.numero;
  }
});

// ---------- Inicio ----------

renderActivities();
history.replaceState({ view: firstView() }, '');
if (activities.length === 1 || fixedActivity) selectActivity(fixedActivity ?? activities[0], false);
else show('activity', false);
// Entrando directo al calendario no hay paso anterior dentro de la app.
if (firstView() === 'day') document.querySelector('[data-view="day"] [data-back]').hidden = true;
setupPwa();
