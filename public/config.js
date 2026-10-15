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
    // Todos los que vienen al evento: niños y adultos.
    asistentes: { minimo: 1, maximo: 150, porDefecto: 15 },
    // Personas en cada actividad: se elige por actividad y nunca supera a
    // los asistentes. porDefecto es el valor inicial al marcarla.
    participantes: { minimo: 1, maximo: 60, porDefecto: 8 },
  },

  // Consumo promedio por asistente. Asistentes × este valor, menos lo que
  // suman actividades y extras, es el saldo para consumir en el restaurante.
  consumoMinimoPorAsistente: 60000,

  // Horario del restaurante (formato 24 h). Las horas de inicio se generan
  // solas cada "intervaloMinutos", y la última es la que alcanza a terminar
  // todas las actividades elegidas antes del cierre.
  horario: {
    apertura: '13:00',
    cierre: '22:30',
    intervaloMinutos: 30,
  },

  // Carrusel que se muestra arriba, apenas el cliente abre el link.
  // Las fotos van en la carpeta public/fotos (verticales 4:5, 900×1125).
  historia: {
    titulo: 'Así se celebra en Mozzafiato',
    subtitulo: 'El cumpleaños de Jero',
    fotos: [
      { src: 'fotos/historia-1.jpg', alt: 'Grupo de niños felices con delantales Art en el cumpleaños de Jero' },
      { src: 'fotos/historia-2.jpg', alt: 'Niño pintando una alcancía de cerámica' },
      { src: 'fotos/historia-3.jpg', alt: 'Jero junto a su torta de Sonic' },
    ],
  },

  actividades: [
    {
      id: 'pizza',
      nombre: 'Arma tu pizza',
      emoji: '🍕',
      descripcion: 'Cada invitado prepara y decora su propia pizza.',
      duracionMinutos: 25, // máximo armando
      precio: 30000,
      fotos: [
        { src: 'fotos/pizza-1.jpg', alt: 'Niños armando sus pizzas en la mesa, vista desde arriba' },
        { src: 'fotos/pizza-2.jpg', alt: 'Niño poniéndole salsa a su pizza' },
      ],
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
      fotos: [
        { src: 'fotos/splash-1.jpg', alt: 'Familia feliz con sus cuadros en la sala neón de Art splash' },
        { src: 'fotos/splash-2.jpg', alt: 'Sala de Art splash lista: lienzos y bombas de pintura neón' },
      ],
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
      fotos: [
        { src: 'fotos/slime-1.jpg', alt: 'Niño mezclando su slime azul' },
        { src: 'fotos/slime-2.jpg', alt: 'Niña amasando slime sobre un bowl' },
        { src: 'fotos/slime-3.jpg', alt: 'Niños jugando con slime de colores en la sala neón' },
      ],
      precio: 50000,
    },
    {
      id: 'ceramica',
      nombre: 'Art cerámica',
      emoji: '🏺',
      descripcion: 'Pintura de piezas de cerámica, a su ritmo.',
      duracionMinutos: 60, // tiempo libre; 1 hora en promedio
      duracionLibre: true,
      fotos: [
        { src: 'fotos/ceramica-1.jpg', alt: 'Piezas de cerámica pintadas por nuestros clientes' },
        { src: 'fotos/ceramica-2.jpg', alt: 'Estantería con piezas de cerámica para escoger' },
      ],
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
      fotos: [{ src: 'fotos/pablo-1.jpg', alt: 'Pablo de neón con velas volcán, deditos de queso y bebida' }],
    },
  ],

  // Conexión con la hoja "Reservas Mozzafiato" en Google Drive.
  // Pega aquí la URL de la aplicación web de Apps Script (termina en /exec).
  // Vacío = la app funciona igual, solo por WhatsApp.
  reservas: {
    url: '',
  },

  notaFinal:
    'Esta es una cotización de referencia. La reserva queda confirmada cuando Mozzafiato Pizzería confirme disponibilidad por WhatsApp.',
};
