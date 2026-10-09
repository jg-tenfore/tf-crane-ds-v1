# tf-crane-ds-v1

Design system and clickable prototypes for **TF Crane**, TenFore Golf's customer iPhone app.

- React 19 · TypeScript · Vite · Tailwind CSS v4 · React Aria Components
- Storybook 10, with every screen drawn at iPhone 17 size (402 × 874 pt)
- Fox DS colour tokens, plus an iOS 26 Liquid Glass look ported from react-cupertino-ui

```bash
npm install
npm run storybook   # http://localhost:6021
npm run prototype   # http://localhost:6022
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

## Storybook

Live Storybook (after merge to main): https://jg-tenfore.github.io/tf-crane-ds-v1/

Storybook categories: **Foundations**, **Components**, **Sign in ∕ Sign up**, **Profile ∕ Account**,
**App Chrome**. **App Chrome → Global Nav** is the whole app, clickable.

Conventions and architecture are documented in [CLAUDE.md](CLAUDE.md).
