# Mozzafiato Pizzería · Reservas y cotizador de cumpleaños

App web (PWA) para que los clientes coticen su celebración de cumpleaños desde el
celular. Funciona en Android y iPhone, se puede instalar en la pantalla de inicio
y abre sin internet. Al terminar, el cliente envía la cotización por WhatsApp al
negocio con todo el detalle.

## Cómo funciona para el cliente

1. Elige **fecha y hora**. La app indica si es tarifa entre semana o de fin de
   semana/festivo (los festivos de Colombia se calculan solos).
2. Elige el **número de personas**.
3. Marca una o varias **actividades**; los precios se actualizan al instante.
4. Llena sus **datos** y el del cumpleañero.
5. Toca **Enviar por WhatsApp**: se abre un chat con el negocio y el mensaje listo.

## Reservas de actividades (estilo Calendly)

Página `reservar.html`, el mismo flujo que se usaba en Calendly:

1. Elige la **experiencia** (Art Splash, Art Slime o Art Cerámica).
2. Elige el **día** en el calendario y la **hora** (2:00 a 8:00 p. m., en punto).
3. Llena nombre, correo, celular y **cuántas personas** van. La app totaliza al
   instante (personas × precio del día) y calcula el **abono del 50%**.
4. Acepta las condiciones (precio, abono, llegar 15 min antes, 10 min de
   tolerancia, menores con adulto, cancelación con 24 h, términos).
5. Toca **Programar**: aparece el recordatorio con el valor del abono y la cuenta
   Bancolombia; al tocar **Abrir WhatsApp** se abre el chat del restaurante con
   la reserva escrita, y se le recuerda **adjuntar el comprobante** en ese chat.

Links para Instagram (abren directo el calendario de cada actividad):

- `https://serlifecol-dot.github.io/artmozzafiato/reservar.html?actividad=splash`
- `https://serlifecol-dot.github.io/artmozzafiato/reservar.html?actividad=slime`
- `https://serlifecol-dot.github.io/artmozzafiato/reservar.html?actividad=ceramica`
- `https://serlifecol-dot.github.io/artmozzafiato/reservar.html` (todas)

Textos, precios, horas, cupos, datos de pago y condiciones están en
`reservas` dentro de [`public/config.js`](public/config.js). Los viernes,
sábados, domingos y festivos de Colombia se cobran con tarifa de fin de semana.

**Plazas libres (opcional):** para que la app muestre "2 plazas libres" y no
deje reservar una hora llena, conecta una hoja de Google siguiendo
[`apps-script/README.md`](apps-script/README.md). Sin eso, se muestran todas
las horas y el restaurante confirma por WhatsApp.

## Instalar en el celular (Android y iPhone)

Es una PWA: el mismo link funciona en los dos.

- **Android (Chrome):** aparece el botón **Instalar**, o menú ⋮ → *Instalar app*.
- **iPhone (Safari):** botón Compartir → *Agregar a inicio*.

Queda con el ícono de Mozzafiato y abre a pantalla completa como una app.
Manteniendo presionado el ícono (Android) aparecen los atajos *Reservar* y
*Cumpleaños*.

## Precios y tiempos actuales

| Actividad | Precio por persona | Duración |
|---|---|---|
| Arma tu pizza | $30.000 | 25 min máx. |
| Art splash | Lun–jue $50.000 · Vie, sáb, dom y festivos $70.000 · Fin de semana desde 6 personas $50.000 | 45 min, siempre en punto (2 salas, sujeto a disponibilidad) |
| Art slime (2 texturas) | $50.000 | 45 min |
| Art cerámica | Desde $25.000 aprox. (depende de la pieza) | ≈ 1 h, tiempo libre |

**Extra:** Decoración Pablo, $35.000 por reserva (personaje Pablo con estructura
de neón, dos velas volcán, deditos de queso y una bebida).

**Horario:** 1:00 p. m. a 10:30 p. m. Las horas de inicio se calculan para que
todas las actividades elegidas terminen antes del cierre; con Art splash solo se
ofrecen horas en punto. La cotización muestra la estancia promedio aproximada.

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
npm test        # pruebas de precios, festivos, reservas y mensajes
npm start       # servidor local en http://localhost:8080
npm run icons   # regenera logo e íconos desde scripts/logo-original.png (requiere Pillow)
```

Sin frameworks ni paso de compilación: HTML, CSS y JavaScript (módulos ES) en `public/`.
