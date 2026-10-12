// ============================================================
//  CONFIGURACIÓN DE MOZZAFIATO PIZZERÍA
//  Este es el único archivo que necesitas editar para cambiar
//  precios, actividades, horarios, extras o el número de WhatsApp.
//  Los precios van en pesos colombianos, sin puntos (50000, no 50.000).
// ============================================================

export const config = {
  negocio: {
    nombre: 'Mozzafiato Pizzería',
    // Número de WhatsApp con indicativo de país, sin + ni espacios.
    // Ejemplo: 573001234567
    whatsapp: '573169150000',
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

  // Horario del restaurante (formato 24 h). Las horas de inicio se generan
  // solas cada "intervaloMinutos", y la última es la que alcanza a terminar
  // todas las actividades elegidas antes del cierre.
  horario: {
    apertura: '13:00',
    cierre: '22:30',
    intervaloMinutos: 30,
  },

  actividades: [
    {
      id: 'pizza',
      nombre: 'Arma tu pizza',
      emoji: '🍕',
      descripcion: 'Cada invitado prepara y decora su propia pizza.',
      duracionMinutos: 25, // máximo armando
      precio: 30000,
    },
    {
      id: 'splash',
      nombre: 'Art splash',
      emoji: '🎨',
      descripcion: 'Pintura libre y salpicada, ¡a ensuciarse con arte! Todos entran juntos.',
      duracionMinutos: 45,
      // Se organiza por sala: empieza siempre en punto (1:00, 2:00…) y los
      // 15 minutos restantes se usan para preparar la sala.
      soloEnPunto: true,
      notaSala:
        'Contamos con 2 salas por franja de 1 hora. La hora queda sujeta a que haya sala disponible.',
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
      duracionMinutos: 45,
      precio: 50000,
    },
    {
      id: 'ceramica',
      nombre: 'Art cerámica',
      emoji: '🏺',
      descripcion: 'Pintura de piezas de cerámica, a su ritmo.',
      duracionMinutos: 60, // tiempo libre; 1 hora en promedio
      duracionLibre: true,
      precio: 25000,
      aproximado: true,
      nota: 'Valor promedio: el precio final depende de la pieza elegida.',
    },
  ],

  // Extras opcionales. tipo: 'porPersona' o 'unico' (un solo cobro por reserva).
  // Solo se muestran los que tengan activo: true.
  extras: [
    {
      id: 'pablo',
      nombre: 'Decoración Pablo',
      descripcion:
        'Nuestro personaje Pablo llega a la mesa con estructura de neón, dos velas volcán, deditos de queso y una bebida.',
      precio: 35000,
      tipo: 'unico',
      activo: true,
    },
  ],

  notaFinal:
    'Esta es una cotización de referencia. La reserva queda confirmada cuando Mozzafiato Pizzería confirme disponibilidad por WhatsApp.',
};
