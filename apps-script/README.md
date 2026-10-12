# Plazas libres con Google Sheets (opcional)

Sin esto, la página de reservas funciona igual: muestra todas las horas y el
cliente envía su reserva por WhatsApp; el restaurante confirma.

Con esto, como en Calendly, cada reserva se guarda en una hoja de Google, la
app muestra **"2 plazas libres / 1 plaza libre"** y una hora llena desaparece.

## Instalación (10 minutos, una sola vez)

1. Crea una hoja nueva en Google Sheets (por ejemplo "Reservas Mozzafiato").
2. Menú **Extensiones → Apps Script**. Borra lo que haya y pega todo el
   contenido de [`Reservas.gs`](Reservas.gs).
   - Si quieres un correo por cada reserva, escribe tu correo en `CORREO_AVISOS`.
   - Ajusta `CUPOS` si cambia el número de salas.
3. Guarda (💾) y toca **Implementar → Nueva implementación**:
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
4. Autoriza los permisos que pide Google y copia la **URL de la aplicación web**
   (termina en `/exec`).
5. En [`public/config.js`](../public/config.js) pega esa URL en
   `reservas.apiUrl: '...'` y guarda en `main`.

## Uso diario

- Cada reserva llega como una fila con estado **Pendiente de abono**.
- Cuando el cliente envíe el comprobante, cambia el estado a **Confirmada**.
- Para liberar un cupo (no pagó, canceló o reprogramó), escribe **Cancelada**
  en la columna *Estado*. Esa hora vuelve a aparecer disponible.
- Para bloquear una hora (evento privado, mantenimiento), agrega una fila a mano
  con la actividad (`splash`, `slime` o `ceramica`), la fecha (`2026-10-24`) y
  la hora (`15:00`).

Si cambias el código de `Reservas.gs`, usa **Implementar → Administrar
implementaciones → Editar → Nueva versión** para que la URL siga siendo la misma.
