# Mozzafiato Pizzería · Cotizador de cumpleaños

App web (PWA) para que los clientes coticen su celebración de cumpleaños desde el
celular. Funciona en Android y iPhone, se puede instalar en la pantalla de inicio
y abre sin internet. Al terminar, el cliente envía la cotización por WhatsApp al
negocio con todo el detalle.

## Cómo funciona para el cliente

1. Elige **fecha y hora**. La app indica si es tarifa entre semana o de fin de
   semana/festivo (los festivos de Colombia se calculan solos).
2. Indica cuántos **asistentes** vienen al evento (niños y adultos).
3. Marca una o varias **actividades** y, en cada una, cuántas personas la harán
   (nunca más que los asistentes). Los precios se actualizan al instante; la
   oferta de grupo de Art splash depende de cuántos hacen Art splash.
4. Llena sus **datos** y el del cumpleañero.
5. Toca **Enviar por WhatsApp**: se abre un chat con el negocio y el mensaje listo.

## Precios y tiempos actuales

| Actividad | Precio por persona | Duración |
|---|---|---|
| Arma tu pizza | $30.000 | 25 min máx. |
| Art splash | Lun–jue $50.000 · Vie, sáb, dom y festivos $70.000 · Fin de semana desde 6 personas $50.000 | 45 min, siempre en punto (2 salas, sujeto a disponibilidad) |
| Art slime (2 texturas) | $50.000 | 45 min |
| Art cerámica | Desde $25.000 aprox. (depende de la pieza) | ≈ 1 h, tiempo libre |

**Extra:** Decoración Pablo, $35.000 por reserva (personaje Pablo con estructura
de neón, dos velas volcán, deditos de queso y una bebida).

**Consumo mínimo:** $60.000 por asistente. La cotización calcula
`asistentes × 60.000 − (actividades + extras)` y lo muestra como **saldo para
consumir en el restaurante**. Si las actividades ya cubren ese monto, no se
muestra saldo. El valor se cambia en `consumoMinimoPorAsistente`.

**Estancia:** duración de las actividades + **2 horas de celebración** (partir
la torta, repartir regalos y compartir). Se cambia en `celebracionMinutos`.

**Horario:** 1:00 p. m. a 10:30 p. m. Las horas de inicio se calculan para que
la estancia completa termine antes del cierre; con Art splash solo se ofrecen
horas en punto.

## Cambiar precios, horarios, extras o WhatsApp

Todo está en **un solo archivo**: [`public/config.js`](public/config.js).
Se puede editar directo en GitHub (ícono del lápiz) y al guardar en `main` la app
se publica sola en uno o dos minutos.

## Fotos

- **Historia** (arriba de todo): `historia.fotos` en `public/config.js`.
- **Por actividad o extra**: la lista `fotos` de cada uno. Si no tiene fotos, no se
  muestra carrusel.
- Las fotos van en `public/fotos/`, verticales 4:5 (900×1125 px, JPG de ~100–200 KB)
  para que carguen rápido con datos móviles. Al tocarlas se ven en grande.
- Usa solo fotos de niños con autorización de sus padres (Ley 1581 de 2012).

## Reservas en Google Drive y Calendar

La hoja **Reservas Mozzafiato** (Google Drive) recibe cada cotización enviada y
la pone en el Google Calendar del dueño de la hoja:

- Al tocar *Enviar por WhatsApp* se agrega una fila con Estado **Pendiente** y se
  crea el evento "⏳ Por confirmar" a la hora elegida, con la duración de la estancia.
- Cambiar el Estado a **Confirmada** marca el evento con ✅; **Cancelada** lo borra.
- La app no ofrece horas de Art splash con las 2 salas ocupadas por reservas
  **Confirmadas** de ese día.

Instalación: el código está en [`apps-script/Codigo.gs`](apps-script/Codigo.gs), con
los pasos al inicio del archivo. La URL de la aplicación web (termina en `/exec`)
va en `reservas.url` de `public/config.js`. Si está vacía, la app funciona solo
con WhatsApp.

La URL es pública: cualquiera que la conozca podría enviar filas falsas. Por eso
las reservas entran como Pendientes y solo las Confirmadas bloquean salas.

## Línea gráfica

Sigue la identidad de Mozzafiato: fondo negro con textura, dorado del logo
(`#b8996f`) y dorado de las cintas (`#b17a39`), títulos en **Montserrat Black**
en mayúsculas, subtítulos anchos en **Michroma** y etiquetas tipo cinta (negra y
dorada inclinada). Los colores están al inicio de `public/styles.css`.

## Publicación (GitHub Pages)

La primera vez:

1. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Unir los cambios a la rama `main`.
3. El link queda en `https://serlifecol-dot.github.io/artmozzafiato/`.

Ese es el link que se envía a los clientes.

## Para desarrolladores

```sh
npm test        # pruebas de precios, festivos y mensaje
npm start       # servidor local en http://localhost:8080
npm run icons   # regenera logo e íconos desde scripts/logo-original.png (requiere Pillow)
```

Sin frameworks ni paso de compilación: HTML, CSS y JavaScript (módulos ES) en `public/`.
