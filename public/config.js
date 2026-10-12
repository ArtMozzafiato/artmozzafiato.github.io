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
      emoji: '🫟',
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
      emoji: '🧪',
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

  notaFinal:
    'Esta es una cotización de referencia. La reserva queda confirmada cuando Mozzafiato Pizzería confirme disponibilidad por WhatsApp.',

  // ============================================================
  //  RESERVAS DE ACTIVIDADES (página reservar.html, estilo Calendly)
  // ============================================================
  reservas: {
    sede: {
      nombre: 'Laureles',
      direccion: 'Cl. 42 #74 - 25, Laureles - Medellín',
      mapa: 'https://www.google.com/maps/search/?api=1&query=Cl.+42+%2374-25+Laureles+Medell%C3%ADn',
    },
    zonaHoraria: 'America/Bogota',

    // Hasta cuántos días hacia adelante se puede reservar.
    diasMaximos: 60,
    // Para reservas del mismo día: minutos mínimos antes de la hora de inicio.
    anticipacionMinimaMinutos: 60,
    // Días en que no se atiende (formato AAAA-MM-DD).
    fechasCerradas: [],

    personas: { minimo: 1, maximo: 30 },

    abonoPorcentaje: 50,
    pago: {
      titular: 'Daniela Márquez',
      documento: 'CC 1037609217',
      banco: 'Bancolombia',
      tipoCuenta: 'Cuenta de ahorros',
      numero: '01913351378',
    },

    // Opcional: dirección de la hoja de Google (Apps Script) que guarda las
    // reservas y muestra cuántos salones quedan por hora. Ver apps-script/README.md.
    // Vacío = no se controlan los salones; el restaurante confirma por WhatsApp.
    apiUrl: '',

    // Cada actividad cuenta sus cupos por separado: reservar una no bloquea otra.
    //   cupoPor: 'salon'   → "cupos" = salones por hora; cada reserva ocupa un
    //                        salón completo, sea de 2 o de 15 personas.
    //   cupoPor: 'persona' → "cupos" = personas por hora (taller grupal).
    actividades: [
      {
        id: 'splash',
        activo: true,
        nombre: 'Art Splash',
        titulo: 'ArtSplash - Laureles "Un parche diferente"',
        emoji: '🫟',
        duracionMinutos: 45,
        // Horas de inicio (24 h).
        horas: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
        cupoPor: 'salon',
        cupos: 2, // 2 salones
        resumen: '2 salones · cada reserva toma un salón',
        // Días de la semana en que se ofrece (0 = domingo … 6 = sábado).
        dias: [0, 1, 2, 3, 4, 5, 6],
        precio: { entreSemana: 50000, finDeSemana: 70000 }, // fin de semana = vie, sáb, dom y festivos
        intro:
          '🫟✨ ¡Llegó Art-Splash a ArtMozzafiato! ✨\n🎨 ¿Estás listo para liberar tu creatividad y vivir una experiencia artística fuera de lo común? 🎟️',
        fotos: [
          { src: 'fotos/splash-1.jpg', alt: 'Familia feliz con sus cuadros en la sala neón de Art splash' },
          { src: 'fotos/splash-2.jpg', alt: 'Sala de Art splash lista: lienzos y bombas de pintura neón' },
        ],
      },
      {
        id: 'slime',
        activo: true,
        nombre: 'Art Slime · Clase privada',
        titulo: 'Art Slime - Laureles · Clase privada',
        emoji: '🧪',
        duracionMinutos: 45,
        horas: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
        // Los sábados el salón está ocupado por el taller grupal de 1:30 p. m.
        horasBloqueadas: { 6: ['14:00'] },
        cupoPor: 'salon',
        cupos: 1, // 1 salón
        resumen: 'Salón privado · mínimo 5 personas',
        personas: { minimo: 5, maximo: 30 }, // clase privada desde 5 personas
        dias: [0, 1, 2, 3, 4, 5, 6],
        precio: 50000,
        intro:
          '🧪 Clase privada de slime para tu grupo (mínimo 5 personas): cada uno crea su slime con 2 texturas. ¿Son menos de 5? Únanse al taller grupal de los sábados a la 1:30 p. m.',
        video: { src: 'videos/slime.mp4', poster: 'videos/slime-portada.jpg' },
        fotos: [
          { src: 'fotos/slime-1.jpg', alt: 'Niño mezclando su slime azul' },
          { src: 'fotos/slime-3.jpg', alt: 'Niños jugando con slime de colores en la sala neón' },
        ],
      },
      {
        id: 'slime-taller',
        activo: true,
        nombre: 'Art Slime · Taller grupal',
        titulo: 'Art Slime - Laureles · Taller grupal de los sábados',
        emoji: '🧪',
        duracionMinutos: 45,
        horas: ['13:30'],
        dias: [6], // solo sábados
        cupoPor: 'persona',
        cupos: 10, // 10 niños por taller
        resumen: 'Sábados 1:30 p. m. · cupo para 10 niños · grupos de 1 a 4',
        // Grupos de 5 o más reservan la clase privada.
        personas: { minimo: 1, maximo: 4 },
        precio: 50000,
        intro:
          '🧪 ¿Son menos de 5? Vengan a experimentar el taller de slime con más personas. Sábados a la 1:30 p. m., cupo para 10 niños. Cada uno crea su slime con 2 texturas.',
        video: { src: 'videos/slime.mp4', poster: 'videos/slime-portada.jpg' },
        fotos: [
          { src: 'fotos/slime-2.jpg', alt: 'Niña amasando slime sobre un bowl' },
          { src: 'fotos/slime-3.jpg', alt: 'Niños jugando con slime de colores en la sala neón' },
        ],
      },
      {
        id: 'ceramica',
        activo: false, // por ahora no se reserva en línea
        nombre: 'Art Cerámica',
        titulo: 'Art Cerámica - Laureles',
        emoji: '🏺',
        duracionMinutos: 60,
        horas: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
        cupoPor: 'salon',
        cupos: 2,
        dias: [0, 1, 2, 3, 4, 5, 6],
        precio: 25000,
        aproximado: true, // el valor final depende de la pieza elegida
        intro: '🏺 Pinta tu pieza de cerámica a tu ritmo. El valor final depende de la pieza que elijas.',
        fotos: [
          { src: 'fotos/ceramica-1.jpg', alt: 'Piezas de cerámica pintadas por nuestros clientes' },
          { src: 'fotos/ceramica-2.jpg', alt: 'Estantería con piezas de cerámica para escoger' },
        ],
      },
    ],

    // Preguntas obligatorias del formulario, en orden (como en Calendly).
    // {precios}, {abono}, {pago} y {whatsapp} se reemplazan solos.
    condiciones: [
      { id: 'precio', texto: 'Precio de la actividad por persona: {precios}', opcion: 'Acepto el valor de mi reserva.' },
      {
        id: 'abono',
        texto:
          '💸 Confirmación de reserva: para confirmar, realiza el {abono} del pago a: {pago}. Envía el soporte con nombre y fecha al WhatsApp {whatsapp}.',
        opcion: 'Confirmo lectura',
      },
      {
        id: 'llegada',
        texto:
          '⏰ Debes llegar 15 min antes. La reserva se confirma solo tras enviar el comprobante de pago. Usa ropa para ensuciarte. IMPORTANTE: esta reserva es para iniciar la actividad puntual. ¿Estás de acuerdo?',
        opcion: 'Acepto términos',
      },
      {
        id: 'tolerancia',
        texto:
          '📍 Si han pasado 10 min desde tu hora de inicio y no has llegado, tu reserva se cancela. Solo si la siguiente hora está libre, podrías continuar. ¿Aceptas estas condiciones?',
        opcion: 'Acepto términos y condiciones',
      },
      {
        id: 'menores',
        texto:
          '👧👦 ¿Algún participante tiene entre 5 y 12 años? Recuerda que deben asistir con un adulto responsable que también tenga reserva. El menor debe estar acompañado durante toda la experiencia.',
        respuestas: ['Ninguno es menor de edad.', 'Asisten menores y acepto responsabilidad'],
      },
      {
        id: 'cancelacion',
        texto:
          '❌ Si no puedes asistir, debes avisar con mínimo 24 h de anticipación para reprogramar y liberar la sala. Si no lo haces, se cancela tu reserva sin devolución del dinero. ¿Estás de acuerdo?',
        opcion: 'Acepto los términos de cancelación',
      },
    ],
    preguntaEspecial:
      '🎉 ¿Hay algo especial que debamos saber para hacer tu experiencia inolvidable? (Cumpleaños, propuesta, sorpresa, etc.) ¡Cuéntanos aquí y lo tendremos en cuenta!',
    aceptacionFinal: {
      texto:
        '🤝 ¿Aceptas todos los términos y condiciones mencionados en este formulario? Al realizar tu reserva aceptas las políticas de puntualidad, cancelación, uso de materiales y participación.',
      opcion: 'Acepto términos y condiciones de mi reserva.',
    },

    terminos: {
      titulo: 'TÉRMINOS Y CONDICIONES DE PARTICIPACIÓN',
      intro:
        'Al reservar y participar en nuestra actividad, el participante acepta los siguientes términos y condiciones:',
      puntos: [
        [
          'Responsabilidad sobre el uso de materiales',
          'Durante la actividad se utilizan pinturas, pinceles y otros materiales artísticos que pueden manchar la ropa, la piel o el cabello. Recomendamos usar ropa cómoda y que pueda ensuciarse, así como tomar las precauciones necesarias para proteger sus pertenencias.',
        ],
        [
          'Exoneración de responsabilidad por daños o manchas',
          'La empresa no se hace responsable por daños, manchas o deterioro en prendas de vestir, accesorios, calzado, cabello o cualquier otro bien personal ocasionado durante el desarrollo de la actividad.',
        ],
        [
          'Condiciones de salud y alergias',
          'El participante declara que no presenta alergias conocidas a los componentes de las pinturas o materiales utilizados. En caso de presentar alguna reacción alérgica o molestia, la empresa no asumirá responsabilidad alguna por consecuencias médicas derivadas del contacto con dichos productos.',
        ],
        [
          'Uso de materiales bajo supervisión',
          'Todos los materiales deberán usarse de manera responsable. Cualquier daño ocasionado por mal uso será responsabilidad del participante.',
        ],
        [
          'Aceptación de términos',
          'Al agendar la cita o participar en la actividad, el participante manifiesta haber leído y aceptado estos términos y condiciones, liberando a la empresa y a sus colaboradores de cualquier tipo de reclamación por los motivos anteriormente mencionados.',
        ],
      ],
    },
  },
};
