// Instalación en la pantalla de inicio (Android y iPhone) y uso sin conexión.

const $ = (selector) => document.querySelector(selector);

function setupInstall() {
  const banner = $('#install-banner');
  if (!banner) return;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  let dismissed = false;
  try {
    dismissed = localStorage.getItem('install-dismissed') === '1';
  } catch {}
  if (isStandalone || dismissed) return;

  $('#install-close').addEventListener('click', () => {
    banner.hidden = true;
    try {
      localStorage.setItem('install-dismissed', '1');
    } catch {}
  });

  // Android / Chrome: botón nativo de instalación
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    banner.hidden = false;
  });
  $('#install-btn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    banner.hidden = true;
  });

  // iPhone / iPad: Safari no tiene botón, se explica cómo hacerlo
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
    $('#install-text').textContent = 'Instala la app: toca el botón Compartir y luego “Agregar a inicio”.';
    $('#install-btn').hidden = true;
    banner.hidden = false;
  }
}

export function setupPwa() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
  }
  setupInstall();
}
