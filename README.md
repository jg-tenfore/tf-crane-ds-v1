# tf-crane-ds-v1

Design system and clickable prototypes for **TF Crane**, TenFore Golf's customer iPhone app.

- React 19 · TypeScript · Vite · Tailwind CSS v4 · React Aria Components
- Storybook 10, with every screen drawn at iPhone 17 size (402 × 874 pt)
- Fox DS colour tokens, plus an iOS 26 Liquid Glass look ported from react-cupertino-ui

```bash
npm install
npm run storybook   # http://localhost:6021
npm run prototype       # http://localhost:6022 (iPhone) · http://localhost:6022/web/ (Crane Web)
npm run prototype:web   # http://localhost:6024/web/ (Crane Web review presenter)
npm run prototype:mcg   # http://localhost:6026/mcg/ (MCG Instruction review presenter)
npm run typecheck
npm run test        # mounts every story in headless Chromium
```

## Prototype

All the Storybook screens stitched into one working app. Sign in or up, book a tee time, manage your profile.

| | |
| --- | --- |
| **Open it** | **https://jg-tenfore.github.io/tf-crane-ds-v1/prototype/** (live after merge to `main`) |
| **Run locally** | `npm run prototype` → http://localhost:6022 |
| **Build** | `npm run build:prototype` → `dist-prototype/` |

- The prototype is built from the same `src/` as Storybook, so it never drifts from the design system.
- State survives a reload, and every screen has a deep link, for example `#/profile/edit-profile`, `#/bookings`, `#/auth/welcome/sign-up`.
- A side panel jumps to any screen. Open `#/reset` to start over.
- On an iPhone, open the link and choose **Share → Add to Home Screen** to run it full-screen.

## Crane Web prototype

The responsive web app (crane.tenfore.golf, replacing Fox) — Tee Times, Shop through checkout with
destination tax, Restaurant ordering, Events/Clinics/Leagues/Activities/Calendar, Profile ∕ Account and
Sign in ∕ Sign up — stitched into one real, full-window site.

| | |
| --- | --- |
| **Open it** | **https://jg-tenfore.github.io/tf-crane-ds-v1/prototype/web/** (live after merge to `main`) |
| **Run locally** | `npm run prototype:web` → http://localhost:6024/web/ (also served by `npm run prototype` at http://localhost:6022/web/) |

It opens in a **review presenter**: a side panel jumps to any page and switches the width (Desktop 1440 ·
Laptop 1024 · Tablet 768 · Mobile 390), appearance and shop nav, or goes full-window. Every page is a deep link
(`#/shop/golf-balls/dozens`, `#/checkout`, `#/account/wallet`), and the cart and sign-in survive width changes. Storybook › **Crane Web** has each screen at 1440 / 1024 / 390.

## MCG Instruction prototype

Crane Web for a multi-course organization: Montgomery County Golf's nine courses and the MCG Academy's lessons,
clinics, camps, instructors, packages and credits. It's Fox's MCG Prototype 3 rebuilt with the Crane design system,
with the Nov 17 changes (a lighter Instruction landing, filters behind a button, URL deep links).

| | |
| --- | --- |
| **Open it** | **https://jg-tenfore.github.io/tf-crane-ds-v1/prototype/mcg/** (live after merge to `main`) |
| **Run locally** | `npm run prototype:mcg` → http://localhost:6026/mcg/ |
| **In Storybook** | Prototypes › MCG Instruction › **Screen index** lists every page with its deep link |

Same review presenter as Crane Web. Its panel links back to Storybook and across to the Crane Web and iPhone prototypes.
Deep links look like `#/instruction?formats=clinic&course=needwood&days=sat` or `#/instruction/pro/mike-kenny`.

## Storybook

Live Storybook (after merge to main): https://jg-tenfore.github.io/tf-crane-ds-v1/

Storybook sections: **Start Here** (overview), **Prototypes** (iPhone app · Crane Web), **Design System** (Styles ·
Components · Crane Web), **Reviews** (one folder per review call). **Prototypes → iPhone app → Global Nav** is the whole
iPhone app, clickable; **Prototypes → Crane Web → Flow** is the whole web app.

Conventions and architecture are documented in [CLAUDE.md](CLAUDE.md).
