# tf-crane-ds-v1

Design system and clickable prototypes for **TF Crane**, TenFore Golf's customer iPhone app.

- React 19 · TypeScript · Vite · Tailwind CSS v4 · React Aria Components
- Storybook 10, with every screen drawn at iPhone 17 size (402 × 874 pt)
- Fox DS colour tokens, plus an iOS 26 Liquid Glass look ported from react-cupertino-ui

```bash
npm install
npm run storybook   # http://localhost:6021
npm run typecheck
npm run test        # mounts every story in headless Chromium
```

Live Storybook (after merge to main): https://jg-tenfore.github.io/tf-crane-ds-v1/

Storybook categories: **Foundations**, **Components**, **Sign in ∕ Sign up**, **Profile ∕ Account**,
**App Chrome**. **App Chrome → Global Nav** is the whole app, clickable.

Conventions and architecture are documented in [CLAUDE.md](CLAUDE.md).
