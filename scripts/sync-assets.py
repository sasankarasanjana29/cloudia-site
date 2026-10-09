"""
Copies Cloudia's artwork from the app repo into the site, as web-sized WebP.

The app is the source of truth for every mascot, category tile and orbit
piece; the site never edits them, it only resizes. Run again whenever the
app's art changes:

    python3 scripts/sync-assets.py [path/to/test-designs-app]

The default app path is the sibling folder ../test-designs-app.
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

SITE = Path(__file__).resolve().parent.parent
APP = Path(sys.argv[1]) if len(sys.argv) > 1 else SITE.parent / 'test-designs-app'
SRC = APP / 'assets' / 'cloudia'
OUT = SITE / 'src' / 'assets' / 'art'

# name in the app -> longest edge on the site, in pixels (2x the largest
# size the page draws it at, so it is sharp on a retina screen)
WANT: dict[str, int] = {
    # Cloudia in her moods
    **{f'mascot-{m}': 640 for m in [
        'all-clear', 'calendar', 'completed', 'good-news', 'greeting', 'milestone',
        'reminder', 'working', 'peeking', 'neutral', 'care', 'writing',
        'listening', 'noted', 'thumbs-up', 'bye',
    ]},
    # the seal moment, on its shared canvas (keeps its own size)
    **{f'mascot-seal-{p}': 0 for p in ['climb', 'jump', 'press', 'proud']},
    # the onboarding orbit, cut into pieces
    **{f'orbit-{p}': 0 for p in ['cloud', 'bell', 'check', 'heart', 'hourglass', 'bead']},
    'cloud': 0,
    # category and answer tiles
    **{f'answer-{a}': 192 for a in [
        'bill-due', 'package-in-transit', 'waiting-on-reply', 'reply-i-owe', 'refunds-and-returns',
        'appointments-and-callbacks', 'health', 'money-lent', 'documents-and-paperwork',
        'government-and-admin', 'subscription', 'split-bill', 'paying-back', 'borrowed',
        'item-to-return', 'home-repair', 'friends-and-family', 'work-colleagues', 'landlord', 'other',
        'invoice-unpaid', 'tax-refund', 'insurance-claim', 'vehicle', 'travel-booking', 'ticket',
        'passport-visa', 'prescription', 'contract-to-sign', 'licence-renewal', 'gift-to-send',
        'in-my-head', 'notes-app', 'screenshots', 'email-inbox', 'promises-i-made',
        'things-people-owe-me', 'messages-and-replies',
    ]},
}


def main() -> None:
    if not SRC.is_dir():
        sys.exit(f'No app art at {SRC}. Pass the app folder as the first argument.')
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for name, edge in WANT.items():
        src = SRC / f'{name}.png'
        if not src.exists():
            print('missing', name)
            continue
        im = Image.open(src).convert('RGBA')
        if edge and max(im.size) > edge:
            im.thumbnail((edge, edge), Image.LANCZOS)
        dst = OUT / f'{name}.webp'
        im.save(dst, 'WEBP', quality=88, method=6)
        total += dst.stat().st_size
    # the app icon. Home screens round it themselves, so they get the square
    # 1024 (assets/icon.png); the favicon and the logo in the header and
    # footer use the app's rounded copy.
    square = Image.open(APP / 'assets' / 'icon.png').convert('RGB')
    for size, fname in [(180, 'apple-touch-icon.png'), (512, 'icon-512.png')]:
        square.resize((size, size), Image.LANCZOS).save(SITE / 'src' / 'assets' / fname, optimize=True)
    icon = Image.open(SRC / 'app-icon.png').convert('RGBA')
    icon.resize((64, 64), Image.LANCZOS).save(SITE / 'src' / 'assets' / 'favicon.png', optimize=True)
    icon.resize((256, 256), Image.LANCZOS).save(OUT / 'app-icon.webp', 'WEBP', quality=90)
    print(f'{len(list(OUT.glob("*.webp")))} images, {total / 1024:.0f} KB')


if __name__ == '__main__':
    main()
