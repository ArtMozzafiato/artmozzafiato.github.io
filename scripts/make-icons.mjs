// Genera los íconos PNG a partir de public/icons/icon.svg usando Chromium.
// Uso: node scripts/make-icons.mjs   (requiere el paquete "playwright")
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const dir = fileURLToPath(new URL('../public/icons/', import.meta.url));
const svg = await readFile(`${dir}icon.svg`, 'utf8');

// Sin esquinas redondeadas: iPhone y Android las recortan solos.
const square = svg.replace(' rx="112"', '');
// "Maskable": fondo completo y dibujo reducido al 80% (zona segura de Android).
const maskable = square
  .replace(/(<rect[^>]*\/>)/, '$1<g transform="translate(51.2 51.2) scale(.8)">')
  .replace('</svg>', '</g></svg>');

const outputs = [
  ['icon-192.png', svg, 192, true],
  ['icon-512.png', svg, 512, true],
  ['apple-touch-icon.png', square, 180, false],
  ['icon-maskable-512.png', maskable, 512, false],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, source, size, transparent] of outputs) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${source}`
  );
  await page.screenshot({ path: `${dir}${name}`, omitBackground: transparent });
}
await browser.close();
