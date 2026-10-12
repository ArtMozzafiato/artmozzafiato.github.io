// Carruseles de fotos deslizables (sin librerías) y vista ampliada.

let lightbox;

function getLightbox() {
  if (lightbox) return lightbox;
  lightbox = document.createElement('dialog');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button type="button" class="lightbox__close" aria-label="Cerrar">×</button>
    <div class="lightbox__track"></div>
    <p class="lightbox__count" aria-live="polite"></p>`;
  lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  const track = lightbox.querySelector('.lightbox__track');
  track.addEventListener('scroll', () => {
    const index = Math.round(track.scrollLeft / track.clientWidth);
    lightbox.querySelector('.lightbox__count').textContent = `${index + 1} / ${track.children.length}`;
  });
  document.body.append(lightbox);
  return lightbox;
}

function openLightbox(photos, start) {
  const dialog = getLightbox();
  const track = dialog.querySelector('.lightbox__track');
  track.replaceChildren(
    ...photos.map((photo) => {
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt;
      return img;
    })
  );
  dialog.querySelector('.lightbox__count').textContent = `${start + 1} / ${photos.length}`;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  track.scrollLeft = start * track.clientWidth;
}

// variant: 'story' (foto completa con puntos) o 'strip' (miniaturas que asoman)
export function createCarousel(photos, { variant = 'strip', label = 'Fotos' } = {}) {
  const root = document.createElement('div');
  root.className = `carousel carousel--${variant}`;
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', label);

  const track = document.createElement('div');
  track.className = 'carousel__track';
  photos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'carousel__slide';
    button.setAttribute('aria-label', `Ver foto ${index + 1} de ${photos.length}: ${photo.alt}`);
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 900;
    img.height = 1125;
    button.append(img);
    button.addEventListener('click', () => openLightbox(photos, index));
    track.append(button);
  });
  root.append(track);

  if (variant === 'story' && photos.length > 1) {
    const dots = document.createElement('div');
    dots.className = 'carousel__dots';
    photos.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ir a la foto ${index + 1}`);
      dot.addEventListener('click', () =>
        track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
      );
      dots.append(dot);
    });
    const update = () => {
      const current = Math.round(track.scrollLeft / track.clientWidth);
      [...dots.children].forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    };
    track.addEventListener('scroll', update, { passive: true });
    update();
    root.append(dots);
  }

  return root;
}
