"""Genera el logo transparente y los íconos de la app a partir de scripts/logo-original.png.

Uso: python3 scripts/make-icons.py   (requiere Pillow)
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GOLD = (184, 153, 111)  # dorado del logo, #b8996f
BLACK = (10, 10, 10)

src = Image.open(ROOT / 'scripts/logo-original.png').convert('L')
# Recorte del logo (la captura trae espacio negro arriba y abajo)
box = src.crop((0, 900, src.width, 1900)).point(lambda v: 255 if v > 60 else 0).getbbox()
crop = src.crop((box[0], box[1] + 900, box[2], box[3] + 900))

# El logo es dorado sobre negro: el brillo se convierte en transparencia
alpha = crop.point(lambda v: min(255, round(v * 255 / max(GOLD))))
logo = Image.new('RGBA', crop.size, GOLD + (255,))
logo.putalpha(alpha)
logo.thumbnail((900, 900), Image.LANCZOS)
logo.save(ROOT / 'public/brand/logo.png', optimize=True)


def icon(size, scale, name):
    canvas = Image.new('RGBA', (size, size), BLACK + (255,))
    mark = logo.copy()
    mark.thumbnail((round(size * scale), round(size * scale)), Image.LANCZOS)
    canvas.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
    canvas.convert('RGB').save(ROOT / 'public/icons' / name, optimize=True)


icon(192, 0.9, 'icon-192.png')
icon(512, 0.9, 'icon-512.png')
icon(180, 0.9, 'apple-touch-icon.png')
icon(512, 0.72, 'icon-maskable-512.png')  # zona segura de Android
icon(48, 0.95, 'favicon.png')
