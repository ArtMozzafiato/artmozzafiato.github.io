# Mozzafiato Art · Cotizador de cumpleaños

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

## Precios actuales

| Actividad | Precio por persona |
|---|---|
| Arma tu pizza | $30.000 |
| Art splash | Lun–jue $50.000 · Vie, sáb, dom y festivos $70.000 · Fin de semana desde 6 personas $50.000 |
| Art slime (2 texturas) | $50.000 |
| Art cerámica | Desde $25.000 aprox. (depende de la pieza) |

## Cambiar precios, horarios, extras o WhatsApp

Todo está en **un solo archivo**: [`public/config.js`](public/config.js).
Se puede editar directo en GitHub (ícono del lápiz) y al guardar en `main` la app
se publica sola en uno o dos minutos.

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
npm run icons   # regenera los PNG desde public/icons/icon.svg (requiere playwright)
```

Sin frameworks ni paso de compilación: HTML, CSS y JavaScript (módulos ES) en `public/`.
