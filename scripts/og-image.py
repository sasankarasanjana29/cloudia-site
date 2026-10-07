"""
Makes the link-preview image (src/assets/og.png, 1200 x 630): Cloudia's day
sky, a row of clouds, the mascot, and the name. Uses only the app's art and
colours, and the system's rounded font when it can find it.

    python3 scripts/og-image.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SITE = Path(__file__).resolve().parent.parent
ART = SITE / 'src' / 'assets' / 'art'
W, H = 1200, 630


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def font(size: int) -> ImageFont.FreeTypeFont:
    for path in [
        '/System/Library/Fonts/SFNSRounded.ttf',
        '/System/Library/Fonts/SF-Pro-Rounded-Bold.otf',
        '/System/Library/Fonts/SFNS.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
    ]:
        try:
            f = ImageFont.truetype(path, size)
            try:
                f.set_variation_by_name('Bold')
            except Exception:
                pass
            return f
        except OSError:
            continue
    return ImageFont.load_default()


def main() -> None:
    # the app's day sky: #0195ff -> #38aaff -> #96d3ff
    stops = [hexrgb('#0195ff'), hexrgb('#38aaff'), hexrgb('#96d3ff')]
    img = Image.new('RGB', (W, H))
    px = img.load()
    for y in range(H):
        t = y / (H - 1)
        c = lerp(stops[0], stops[1], t / 0.55) if t < 0.55 else lerp(stops[1], stops[2], (t - 0.55) / 0.45)
        for x in range(W):
            px[x, y] = c
    img = img.convert('RGBA')

    cloud = Image.open(ART / 'cloud.webp').convert('RGBA')
    for x, y, w, a in [(-90, 40, 360, 150), (930, 70, 340, 150), (-60, 470, 420, 255), (300, 520, 460, 255), (700, 500, 430, 255), (1010, 480, 360, 255)]:
        c = cloud.resize((w, round(w * cloud.height / cloud.width)), Image.LANCZOS)
        if a < 255:
            c.putalpha(c.getchannel('A').point(lambda v: v * a // 255))
        img.alpha_composite(c, (x, y))

    mascot = Image.open(ART / 'mascot-milestone.webp').convert('RGBA')
    mascot.thumbnail((300, 300), Image.LANCZOS)
    img.alpha_composite(mascot, (W - 360, 150))

    d = ImageDraw.Draw(img)
    d.text((88, 150), 'Cloudia', font=font(118), fill='white')
    d.text((92, 300), 'For the things still in motion.', font=font(46), fill='white')
    d.text((92, 362), 'Coming soon to iPhone.', font=font(36), fill=(232, 242, 255))
    img.convert('RGB').save(SITE / 'src' / 'assets' / 'og.png', optimize=True)
    print('src/assets/og.png')


if __name__ == '__main__':
    main()
