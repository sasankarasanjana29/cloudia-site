# Style lock: Cloudia website

## Direction contract
- Thesis: the site shows the app, it does not describe it. Every feature is a live fragment of a real Cloudia screen.
- First viewport: the app's own line "You said you would. They said they would." over a phone rising out of a scalloped cloud bank (after Abode), on a soft sky.
- System: the Cloudia app's tokens, mascots and components, rebuilt in HTML (no registries; static site).
- Risk: the hero leans on the phone; if it reads small, enlarge the phone, never add floating badges.

## References (viewed 2026-10-07)
abode.space (favourite: phone from clouds, pastel bento of live demos, zigzag rows), jomo.so (favourite: sky and clouds, SF Rounded, glass pill nav, tilted scenario cards), tiimoapp.com (fanned phones, card carousel), aave.com (inset hero, three phones, honest stats), ahead-app.com (UI spilling out of the phone, sticky mobile CTA), luma.com (launch animation), headspace.com (intent rows), moonly.app, monday.com.

## Color contract (light)
text #1b1b1b / page #ffffff 17.2; brand-strong #0069b8 / page 5.7 (links, small brand text); brand #0195ff / page 3.1 (large text and UI only); white / #0195ff 3.1 (labels 19px bold+); text-3 #5f6672 on every tint >= 5.3.
Dark: the app's navy night ramp; text #eaf0f8 / #070d19; text-3 #9fb0c8 / #070d19 8.8.

## Type
System rounded (ui-rounded, SF Pro Rounded), never bundled. Display 800, tracking -0.045em; h2 -0.035em.

## Density & spacing
Scale 4/8/12/16/24/32/48/64/96/128/160. Pivotal sections 128; tiles padding >= 24.

## Assets
App art only (scripts/sync-assets.py). No photography, no third-party illustration. Icons are the app's own line icons.

## Motion
No GSAP on purpose: zero third-party code keeps the site cookie-free and request-free. IntersectionObserver reveals, CSS keyframes, rAF ports of the app's seal and orbit. All gated by Reduce Motion and visibility.
