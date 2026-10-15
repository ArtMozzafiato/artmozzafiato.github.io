import { formatCOP, formatLongDate } from './pricing.js';
import { formatDuration } from './schedule.js';

// Texto que se envía por WhatsApp al negocio.
export function buildMessage(data, quote, config) {
  const { info } = quote;
  const dayType = info.holiday ? `festivo: ${info.holiday}` : info.rateLabel.toLowerCase();

  const lines = [
    `¡Hola ${config.negocio.nombre}! 🎨 Quiero reservar un cumpleaños:`,
    '',
    `🎂 Cumpleañero: ${data.birthdayName} (${data.birthdayAge} años)`,
    `📅 Fecha: ${formatLongDate(data.date)} (${dayType})`,
    `🕒 Hora: ${data.time}`,
    `👥 Asistentes al evento: ${quote.attendees}`,
    `⏱️ Estancia aprox.: ${formatDuration(quote.stayMinutes)}` +
      (config.celebracionMinutos
        ? ` (actividades ${formatDuration(quote.activityMinutes)} + ${formatDuration(config.celebracionMinutos)} de celebración)`
        : ''),
    '',
    '*Cotización:*',
    ...quote.lines.map((line) => {
      const qty =
        line.kind === 'actividad'
          ? ` (${line.quantity} ${line.quantity === 1 ? 'persona' : 'personas'} × ${formatCOP(line.unit)})`
          : line.quantity > 1
            ? ` (${line.quantity} × ${formatCOP(line.unit)})`
            : '';
      const approx = line.approximate ? ' aprox.' : '';
      return `• ${line.name}${qty}: ${formatCOP(line.subtotal)}${approx}`;
    }),
    ...(quote.balance > 0
      ? [
          `Subtotal actividades y extras: ${formatCOP(quote.subtotal)}`,
          `🍕 Saldo para consumir en el restaurante: ${formatCOP(quote.balance)}`,
          `   (consumo mínimo ${quote.attendees} × ${formatCOP(config.consumoMinimoPorAsistente)} = ${formatCOP(quote.minimumSpend)})`,
        ]
      : []),
    '',
    `*Total estimado: ${formatCOP(quote.total)}${quote.approximate ? ' aprox.' : ''}*`,
    '',
    `👤 ${data.contactName} · 📱 ${data.contactPhone}`,
  ];

  if (quote.needsRoom) {
    lines.push('', `🎨 Art splash a las ${data.time}: por favor confirmar sala disponible.`);
  }
  if (data.comments) lines.push('', `📝 ${data.comments}`);
  return lines.join('\n');
}

export function whatsappUrl(phone, text) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
