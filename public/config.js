// ============================================================
//  CONFIGURACIÓN DE MOZZAFIATO ART
//  Este es el único archivo que necesitas editar para cambiar
//  precios, actividades, horarios, extras o el número de WhatsApp.
//  Los precios van en pesos colombianos, sin puntos (50000, no 50.000).
// ============================================================

export const config = {
  negocio: {
    nombre: 'Mozzafiato Art',
    // Número de WhatsApp con indicativo de país, sin + ni espacios.
    // Ejemplo: 573001234567
    whatsapp: '57XXXXXXXXXX', // ⚠️ PENDIENTE: poner el número real
  },

  // Días que se cobran con tarifa de fin de semana (0 = domingo … 6 = sábado).
  // Viernes, sábado y domingo. Los festivos de Colombia también se cobran
  // como fin de semana y se calculan solos.
  diasFinDeSemana: [5, 6, 0],

  // Con cuántos días de anticipación se puede reservar (1 = desde mañana).
  diasAnticipacionMinima: 1,

  // Hasta cuántos meses hacia adelante se puede cotizar.
  mesesMaximos: 6,

  personas: {
    minimo: 1,
    maximo: 60,
    porDefecto: 8,
  },

  // ⚠️ PENDIENTE: confirmar los horarios reales de inicio.
  horarios: ['10:00 a. m.', '12:00 m.', '2:00 p. m.', '4:00 p. m.'],

  actividades: [
    {
      id: 'pizza',
      nombre: 'Arma tu pizza',
      emoji: '🍕',
      descripcion: 'Cada invitado prepara y decora su propia pizza.',
      precio: 30000,
    },
    {
      id: 'splash',
      nombre: 'Art splash',
      emoji: '🎨',
      descripcion: 'Pintura libre y salpicada, ¡a ensuciarse con arte!',
      precio: {
        entreSemana: 50000, // lunes a jueves
        finDeSemana: 70000, // viernes, sábado, domingo y festivos
        // Oferta de fin de semana para grupos grandes
        finDeSemanaGrupo: { minimoPersonas: 6, precio: 50000 },
      },
    },
    {
      id: 'slime',
      nombre: 'Art slime',
      emoji: '🫧',
      descripcion: 'Cada niño crea su slime con 2 texturas.',
      precio: 50000,
    },
    {
      id: 'ceramica',
      nombre: 'Art cerámica',
      emoji: '🏺',
      descripcion: 'Pintura de piezas de cerámica.',
      precio: 25000,
      aproximado: true,
      nota: 'Valor promedio: el precio final depende de la pieza elegida.',
    },
  ],

  // Extras opcionales. tipo: 'porPersona' o 'unico' (un solo cobro por reserva).
  // Solo se muestran los que tengan activo: true.
  // ⚠️ PENDIENTE: definir extras reales y sus precios.
  extras: [
    { id: 'decoracion', nombre: 'Decoración temática', precio: 0, tipo: 'unico', activo: false },
    { id: 'refrigerio', nombre: 'Refrigerio', precio: 0, tipo: 'porPersona', activo: false },
    { id: 'recuerdos', nombre: 'Recuerdos para invitados', precio: 0, tipo: 'porPersona', activo: false },
  ],

  notaFinal:
    'Esta es una cotización de referencia. La reserva queda confirmada cuando Mozzafiato Art confirme disponibilidad por WhatsApp.',
};
