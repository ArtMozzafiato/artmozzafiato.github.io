import { config } from './config.js';
import { buildQuote, dayInfo, formatCOP, parseDate, unitPrice } from './pricing.js';
import { buildMessage, whatsappUrl } from './message.js';
import { formatDuration, startTimes, timeLabel } from './schedule.js';
import { createCarousel } from './gallery.js';
import { buildReservation, fullSplashHours, sendReservation } from './reservations.js';

const $ = (selector) => document.querySelector(selector);

const form = $('#quote-form');
const dateInput = $('#date');
const timeSelect = $('#time');
const attendeesInput = $('#attendees');
const activitiesBox = $('#activities');
const extrasBox = $('#extras');
const activeExtras = config.extras.filter((extra) => extra.activo);

const pad = (n) => String(n).padStart(2, '0');
const toInputValue = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// ---------- Construcción inicial ----------

function setupDateLimits() {
  const today = new Date();
  const min = new Date(today.getFullYear(), today.getMonth(), today.getDate() + config.diasAnticipacionMinima);
  const max = new Date(today.getFullYear(), today.getMonth() + config.mesesMaximos, today.getDate());
  dateInput.min = toInputValue(min);
  dateInput.max = toInputValue(max);
}

const clamp = (n, { minimo, maximo }) => Math.min(maximo, Math.max(minimo, Math.round(n) || minimo));
const clampAttendees = (n) => clamp(n, config.personas.asistentes);
// Las personas de cada actividad también son asistentes: nunca más que ellos.
const clampActivity = (n, attendees) =>
  clamp(n, { minimo: config.personas.participantes.minimo, maximo: Math.min(attendees, config.personas.participantes.maximo) });

const countInputs = () => [...activitiesBox.querySelectorAll('.count-input')];

// Ajusta asistentes y personas por actividad a sus límites y recalcula.
function setCounts() {
  const attendees = clampAttendees(Number(attendeesInput.value));
  attendeesInput.value = attendees;
  for (const input of countInputs()) {
    input.max = attendees;
    input.value = clampActivity(Number(input.value), attendees);
  }
  render();
}

function setupPeople() {
  const { asistentes } = config.personas;
  Object.assign(attendeesInput, { min: asistentes.minimo, max: asistentes.maximo, value: asistentes.porDefecto });
  // Un solo manejador para todos los botones − / + (asistentes y actividades).
  form.addEventListener('click', (event) => {
    const button = event.target.closest('[data-step]');
    if (!button) return;
    const input = button.dataset.target === 'attendees' ? attendeesInput : $(`#count-${button.dataset.target}`);
    input.value = Number(input.value || 0) + Number(button.dataset.step);
    setCounts();
  });
  form.addEventListener('change', (event) => {
    if (event.target === attendeesInput || event.target.classList.contains('count-input')) setCounts();
  });
}

function countTemplate(activity) {
  const row = document.createElement('div');
  row.className = 'option__count';
  row.hidden = true;
  const start = Math.min(config.personas.participantes.porDefecto, config.personas.asistentes.porDefecto);
  row.innerHTML = `
    <label class="option__count-label" for="count-${activity.id}">Personas en esta actividad</label>
    <div class="stepper stepper--small">
      <button type="button" class="stepper__btn" data-target="${activity.id}" data-step="-1" aria-label="Quitar una persona de ${activity.nombre}">−</button>
      <input type="number" class="count-input" id="count-${activity.id}" data-activity="${activity.id}"
        inputmode="numeric" min="1" value="${start}" />
      <button type="button" class="stepper__btn" data-target="${activity.id}" data-step="1" aria-label="Agregar una persona a ${activity.nombre}">+</button>
    </div>`;
  return row;
}

function optionTemplate({ name, value, emoji, title, description, meta, photos, extra }) {
  const card = document.createElement('div');
  card.className = 'option-card';
  const label = document.createElement('label');
  label.className = 'option';
  label.innerHTML = `
    <input type="checkbox" name="${name}" value="${value}" />
    <span class="option__check" aria-hidden="true"></span>
    ${emoji ? `<span class="option__emoji" aria-hidden="true">${emoji}</span>` : ''}
    <span class="option__body">
      <span class="option__name"></span>
      <span class="option__desc"></span>
      ${meta ? '<span class="option__meta"></span>' : ''}
    </span>
    <span class="option__price" data-price-for="${value}"></span>`;
  label.querySelector('.option__name').textContent = title;
  label.querySelector('.option__desc').textContent = description ?? '';
  if (meta) label.querySelector('.option__meta').textContent = meta;
  card.append(label);
  if (extra) card.append(extra);
  // El carrusel va fuera del <label> para que deslizar no marque la casilla.
  if (photos?.length) card.append(createCarousel(photos, { label: `Fotos de ${title}` }));
  return card;
}

function setupStory() {
  const { historia } = config;
  if (!historia?.fotos?.length) return;
  const section = $('#story');
  section.hidden = false;
  section.querySelector('.story__title').textContent = historia.titulo;
  section.querySelector('.story__subtitle').textContent = historia.subtitulo ?? '';
  section.append(createCarousel(historia.fotos, { variant: 'story', label: historia.titulo }));
}

function setupOptions() {
  for (const activity of config.actividades) {
    activitiesBox.append(
      optionTemplate({
        name: 'activity',
        value: activity.id,
        emoji: activity.emoji,
        title: activity.nombre,
        description: activity.descripcion,
        meta: `⏱ ${formatDuration(activity.duracionMinutos)}${activity.duracionLibre ? ' aprox. · tiempo libre' : ''}`,
        photos: activity.fotos,
        extra: countTemplate(activity),
      })
    );
  }

  if (activeExtras.length) {
    $('#extras-section').hidden = false;
    $('#data-step').textContent = '5';
    for (const extra of activeExtras) {
      extrasBox.append(
        optionTemplate({
          name: 'extra',
          value: extra.id,
          title: extra.nombre,
          description: `${extra.descripcion ?? ''} ${extra.tipo === 'porPersona' ? 'Por persona.' : 'Valor único por reserva.'}`.trim(),
          photos: extra.fotos,
        })
      );
    }
  }

  $('#final-note').textContent = config.notaFinal;
}

// ---------- Estado y render ----------

const checkedValues = (name) =>
  [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);

function readState() {
  const attendees = clampAttendees(Number(attendeesInput.value));
  const activityPeople = Object.fromEntries(
    countInputs().map((input) => [input.dataset.activity, clampActivity(Number(input.value), attendees)])
  );
  return {
    date: parseDate(dateInput.value),
    attendees,
    activityPeople,
    activityIds: checkedValues('activity'),
    extraIds: checkedValues('extra'),
  };
}

function renderDayBadge(date) {
  const badge = $('#day-badge');
  if (!date) {
    badge.hidden = true;
    return;
  }
  const info = dayInfo(date, config);
  badge.hidden = false;
  badge.classList.toggle('badge--weekend', info.isWeekend);
  badge.textContent = info.holiday
    ? `🎉 Festivo (${info.holiday}) · ${info.rateLabel}`
    : `${info.dayName[0].toUpperCase()}${info.dayName.slice(1)} · ${info.rateLabel}`;
}

// Las horas dependen de las actividades: Art splash solo en punto y todo
// debe terminar antes del cierre.
let splashFull = { date: '', hours: [] };

// Pide a la hoja las horas con salas de Art splash llenas para la fecha elegida.
async function refreshSplashAvailability() {
  const dateValue = dateInput.value;
  const hours = await fullSplashHours(config, dateValue);
  if (dateInput.value !== dateValue) return; // cambió la fecha mientras tanto
  splashFull = { date: dateValue, hours };
  render();
}

function renderTimes(state) {
  const previous = timeSelect.value;
  const splashChosen = config.actividades.some((a) => a.soloEnPunto && state.activityIds.includes(a.id));
  const blocked = splashChosen && splashFull.date === dateInput.value ? splashFull.hours : [];
  const times = startTimes(state.activityIds, config).filter((t) => !blocked.includes(t.value));
  timeSelect.replaceChildren(new Option('Elige una hora', ''));
  for (const { value, label } of times) timeSelect.add(new Option(label, value));
  if (times.some((t) => t.value === previous)) timeSelect.value = previous;

  const hint = $('#time-hint');
  const splash = config.actividades.find((a) => a.soloEnPunto && state.activityIds.includes(a.id));
  hint.hidden = !splash;
  if (splash) {
    hint.textContent = `${splash.nombre} empieza en punto. ${splash.notaSala}` +
      (blocked.length ? ` Sin sala disponible ese día: ${blocked.map((h) => timeLabel(h)).join(', ')}` : '');
  }
}

function renderOptionPrices(state) {
  const info = state.date ? dayInfo(state.date, config) : { isWeekend: false };
  for (const activity of config.actividades) {
    const el = activitiesBox.querySelector(`[data-price-for="${activity.id}"]`);
    const { amount, note } = unitPrice(activity, state.activityPeople[activity.id], info);
    const prefix = activity.aproximado ? '<small>desde</small>' : '';
    let detail = activity.aproximado ? 'aprox. c/u' : 'por persona';
    if (typeof activity.precio === 'object' && !state.date) detail = 'lun a jue · elige fecha';
    else if (note && note.startsWith('Oferta')) detail = '¡Oferta grupo!';
    el.innerHTML = `${prefix}${formatCOP(amount)}<small>${detail}</small>`;
  }
  for (const extra of activeExtras) {
    extrasBox.querySelector(`[data-price-for="${extra.id}"]`).textContent = formatCOP(extra.precio);
  }
  form.querySelectorAll('.option-card').forEach((card) => {
    const checked = card.querySelector('input[type="checkbox"]').checked;
    card.classList.toggle('is-checked', checked);
    const count = card.querySelector('.option__count');
    if (count) count.hidden = !checked;
  });
}

function renderSummary(state, quote) {
  const summary = $('#summary');
  summary.replaceChildren();

  if (!quote.lines.length) {
    summary.innerHTML = '<p class="summary__empty">Elige al menos una actividad para ver tu cotización.</p>';
  } else {
    for (const line of quote.lines) {
      const row = document.createElement('div');
      row.className = 'summary__row';
      const left = document.createElement('div');
      left.textContent = line.name;
      const detail = document.createElement('small');
      const qty =
        line.kind === 'actividad'
          ? `${line.quantity} ${line.quantity === 1 ? 'persona' : 'personas'}`
          : line.quantity;
      detail.textContent = `${qty} × ${formatCOP(line.unit)}` + (line.note ? ` · ${line.note}` : '');
      left.append(detail);
      const right = document.createElement('strong');
      right.textContent = formatCOP(line.subtotal) + (line.approximate ? '*' : '');
      row.append(left, right);
      summary.append(row);
    }
    if (quote.balance > 0) {
      const sub = document.createElement('div');
      sub.className = 'summary__row summary__row--sub';
      sub.innerHTML = `<span>Subtotal actividades y extras</span><strong>${formatCOP(quote.subtotal)}</strong>`;
      summary.append(sub);

      const balance = document.createElement('div');
      balance.className = 'summary__balance';
      balance.innerHTML = `
        <div class="summary__balance-head">
          <span>🍕 Saldo para consumir en el restaurante</span>
          <strong>${formatCOP(quote.balance)}</strong>
        </div>
        <small>Consumo mínimo del evento: ${quote.attendees} asistentes × ${formatCOP(
          config.consumoMinimoPorAsistente
        )} = ${formatCOP(quote.minimumSpend)}, menos ${formatCOP(quote.subtotal)} de actividades y extras.
        Lo disfrutan en pizzas, hamburguesas y bebidas durante el evento.</small>`;
      summary.append(balance);
    }

    const total = document.createElement('div');
    total.className = 'summary__total';
    total.innerHTML = `<span>Total${quote.approximate ? ' aprox.' : ''}</span><span>${formatCOP(quote.total)}</span>`;
    summary.append(total);

    const stay = document.createElement('p');
    stay.className = 'summary__stay';
    stay.innerHTML = `<span>Estancia promedio aprox.</span><strong>${formatDuration(quote.stayMinutes)}</strong>`;
    if (config.celebracionMinutos) {
      const breakdown = document.createElement('small');
      breakdown.className = 'summary__stay-detail';
      breakdown.textContent = `Actividades ${formatDuration(quote.activityMinutes)} + ${formatDuration(
        config.celebracionMinutos
      )} para partir la torta, repartir regalos y compartir.`;
      stay.append(breakdown);
    }
    summary.append(stay);

    if (quote.needsRoom) {
      const room = document.createElement('p');
      room.className = 'fineprint';
      room.textContent = '🎨 Art splash: verificaremos que haya sala disponible a la hora elegida.';
      summary.append(room);
    }
    if (!state.date) {
      const warn = document.createElement('p');
      warn.className = 'fineprint';
      warn.textContent = 'Elige la fecha: algunas actividades cambian de precio en fin de semana y festivos.';
      summary.append(warn);
    }
  }

  $('#bar-total').textContent = formatCOP(quote.total);
}

function render() {
  const state = readState();
  const quote = buildQuote(state, config);
  renderDayBadge(state.date);
  renderTimes(state);
  renderOptionPrices(state);
  renderSummary(state, quote);
  $('#activities-error').hidden = true;
}

// ---------- Envío ----------

function validate(state) {
  form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
  const invalid = [];

  if (!state.date || dateInput.value < dateInput.min || dateInput.value > dateInput.max) invalid.push(dateInput);
  if (!timeSelect.value) invalid.push(timeSelect);
  if (!state.activityIds.length) {
    $('#activities-error').hidden = false;
    invalid.push(activitiesBox);
  }
  for (const id of ['#birthday-name', '#birthday-age', '#contact-name', '#contact-phone']) {
    const input = $(id);
    if (!input.value.trim()) invalid.push(input);
  }

  invalid.forEach((el) => el !== activitiesBox && el.classList.add('invalid'));
  return invalid;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const state = readState();
  const invalid = validate(state);

  if (invalid.length) {
    invalid[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (invalid[0] !== activitiesBox) invalid[0].focus({ preventScroll: true });
    if (invalid[0] === dateInput && dateInput.value) {
      alert(`Puedes reservar entre el ${dateInput.min} y el ${dateInput.max}.`);
    }
    return;
  }

  if (!/^\d{8,15}$/.test(config.negocio.whatsapp)) {
    alert('El número de WhatsApp del negocio aún no está configurado.');
    return;
  }

  const quote = buildQuote(state, config);
  const text = buildMessage(
    {
      ...state,
      time: timeSelect.selectedOptions[0].text,
      birthdayName: $('#birthday-name').value.trim(),
      birthdayAge: $('#birthday-age').value.trim(),
      contactName: $('#contact-name').value.trim(),
      contactPhone: $('#contact-phone').value.trim(),
      comments: $('#comments').value.trim(),
    },
    quote,
    config
  );
  sendReservation(
    config,
    buildReservation(
      {
        dateValue: dateInput.value,
        timeValue: timeSelect.value,
        birthdayName: $('#birthday-name').value.trim(),
        birthdayAge: $('#birthday-age').value.trim(),
        contactName: $('#contact-name').value.trim(),
        contactPhone: $('#contact-phone').value.trim(),
        comments: $('#comments').value.trim(),
      },
      quote
    )
  );
  window.location.href = whatsappUrl(config.negocio.whatsapp, text);
});

dateInput.addEventListener('change', refreshSplashAvailability);

form.addEventListener('input', (event) => {
  event.target.classList?.remove('invalid');
  if (event.target !== attendeesInput && !event.target.classList.contains('count-input')) render();
});

// ---------- Instalación (PWA) ----------

function setupInstall() {
  const banner = $('#install-banner');
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  let dismissed = false;
  try {
    dismissed = localStorage.getItem('install-dismissed') === '1';
  } catch {}
  if (isStandalone || dismissed) return;

  $('#install-close').addEventListener('click', () => {
    banner.hidden = true;
    try {
      localStorage.setItem('install-dismissed', '1');
    } catch {}
  });

  // Android / Chrome: botón nativo de instalación
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    banner.hidden = false;
  });
  $('#install-btn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    banner.hidden = true;
  });

  // iPhone / iPad: Safari no tiene botón, se explica cómo hacerlo
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
    $('#install-text').textContent = 'Instala la app: toca el botón Compartir y luego “Agregar a inicio”.';
    $('#install-btn').hidden = true;
    banner.hidden = false;
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}

setupDateLimits();
setupPeople();
setupStory();
setupOptions();
setupInstall();
render();
