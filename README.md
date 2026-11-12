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

## Storybook

Live Storybook (after merge to main): https://jg-tenfore.github.io/tf-crane-ds-v1/

Storybook categories: **Foundations**, **Components**, **Sign in ∕ Sign up**, **Profile ∕ Account**,
**App Chrome**, **Crane Web**. **App Chrome → Global Nav** is the whole iPhone app, clickable; **Crane Web → Flow** is the whole web app.

Conventions and architecture are documented in [CLAUDE.md](CLAUDE.md).
