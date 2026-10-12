import { formatCOP, formatLongDate } from './pricing.js';

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
    `👥 Personas: ${data.people}`,
    '',
    '*Cotización:*',
    ...quote.lines.map((line) => {
      const qty = line.quantity > 1 ? ` (${line.quantity} × ${formatCOP(line.unit)})` : '';
      const approx = line.approximate ? ' aprox.' : '';
      return `• ${line.name}${qty}: ${formatCOP(line.subtotal)}${approx}`;
    }),
    '',
    `*Total estimado: ${formatCOP(quote.total)}${quote.approximate ? ' aprox.' : ''}*`,
    '',
    `👤 ${data.contactName} · 📱 ${data.contactPhone}`,
  ];

  if (data.comments) lines.push(`📝 ${data.comments}`);
  return lines.join('\n');
}

export function whatsappUrl(phone, text) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
