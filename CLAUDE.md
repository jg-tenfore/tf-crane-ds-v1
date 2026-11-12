# TF Crane Design System (tf-crane-ds-v1)

Design system + clickable prototypes for **TF Crane**, TenFore Golf's customer-facing iPhone app
(the production app is Expo / React Native at TenForeGolf/Crane — this repo is where screens and
UX concepts are designed and prototyped before they're built there).

## Stack

- **React 19 + TypeScript + Vite**, **Tailwind CSS v4**, **React Aria Components**
- **Storybook 10** (`@storybook/react-vite`) — `npm run storybook` → http://localhost:6021
- `npm run typecheck` · `npm run test` (mounts every story in headless Chromium)

## Design foundations

- **Colour + semantic tokens = Fox DS** (`src/styles/theme.css`, ported from tf-fox-ds-v1). The brand ramp's
  600–950 are re-anchored on the Crane app's green: **brand-600 #2C7C4D** (solid buttons), brand-500 #339C5E.
  Use semantic classes only: `text-primary`, `text-tertiary`, `bg-primary`, `bg-secondary`,
  `bg-brand-solid`, `text-brand-secondary`, `text-fg-brand-primary`, `ring-secondary`, … Never raw
  palette classes like `text-gray-600` / `bg-green-700`.
- **iOS layer = `src/styles/cupertino.css`** — system font stack, iOS Dynamic Type
  (`text-ios-large-title|title1|title2|title3|headline|body|callout|subheadline|footnote|caption1|caption2`),
  radii (`rounded-ios-control|card|sheet|device`), shadows (`shadow-ios-card|float`), device spacing
  (`px-gutter` = 16pt), Liquid Glass utilities (`glass`, `glass-strong`) and `press-scale`.
- **Component look = react-cupertino-ui** (iOS 26 Liquid Glass). Its components were *ported*, not
  installed (React 18 peers, fixed positioning, per-component SCSS) and re-skinned with Fox tokens.

## Canvas: iPhone 17 = 402 × 874 pt

Reference screenshots (`references/`, 1206 × 2622 @3x) are iPhone 17. Every screen is authored at
402 × 874 pt. Safe areas: top 62, bottom 34. Never hard-code another device size.

- `IPhoneFrame` (`components/device/iphone-frame.tsx`) — bezel + status bar + Dynamic Island. Overlays
  (sheets, alerts, drawers) portal **into the frame** via `UNSAFE_PortalProvider`, so they're clipped
  to the phone. Overlays therefore use `absolute inset-0`, never `fixed`.
- Stories opt into the frame with `parameters: { phone: true }`; the toolbar toggles bezel/bare + light/dark.
- `Screen` (`components/device/screen.tsx`) — one full screen. Pass `nav` (NavigationBar) and
  optional `footer`; it computes insets for nav bar / tab bar / home indicator.

## Prototyping

- `StackNavigator` + `useStack()` (`components/prototype/stack-navigator.tsx`) — UINavigationController
  push/pop with the iOS slide. Screens call `useStack().push("edit-profile")` / `.pop()`.
  Outside a navigator every call is a no-op, so the same screen works as a static story.
- `AppShell` (`components/prototype/app-shell.tsx`) — floating TabBar (Home / Bookings / Profile) over
  three independent stacks.
- Screen registries: each area exports a `ScreenRegistry` from `src/screens/<area>/index.ts`.

## Prototype app (`npm run prototype` → http://localhost:6022)

`prototype/` (index.html + main.tsx) + `vite.prototype.config.ts` + `src/prototype-app/` stitch every screen into one app:
- `Presenter` renders the page around the phone: a side panel to jump to any screen, frame and appearance toggles, and Reset. It fits the phone to the window and goes full-screen (`IPhoneFrame variant="fullscreen"`) on real phones.
- `CranePrototype` covers the signed-out auth stack → the signed-in `AppShell`. All state is in `PrototypeState` (`prototype-state.ts`): it's persisted to localStorage and mirrored to the URL hash (`#/profile/edit-profile`, `#/auth/welcome/sign-in`, `#/reset`).
- Screens stay prototype-agnostic: they talk to optional contexts that no-op in Storybook. These are `useBookings()`, `useToast()`, `useAppShell()`, `useCourse()` and `useSafeArea()`. Never hard-code the 62/34 insets; use `useSafeArea()` / `useNavChromeHeight()`.
- The `brand/` and `crane-logo/` folders are served and copied by a small plugin in `vite.prototype.config.ts`.
- The Introduction's hero (`src/stories/prototype-link.tsx`) shows real screenshots from `public/prototype-preview/`.
  After changing those screens, refresh them with `npm run prototype:preview` while the prototype is running. GitHub Pages publishes the build at `/tf-crane-ds-v1/prototype/`.

## Crane Web (`Crane Web/*` stories, `src/components/web/`, `src/screens/web/`)

The responsive web/desktop app (crane.tenfore.golf), replacing Fox. Fox web layouts are ported and restyled;
Fox itself stays an archive (`tf-fox-ds-v1`).
- **Fonts are scoped per surface:** iPhone screens use SF Pro; everything inside `WebFrame` (`.crane-web`) uses
  **Outfit** (`@fontsource-variable/outfit`, `src/styles/crane-web.css`). On web use the web type scale
  (`text-sm/md/lg/xl`, `text-display-*`) and the `caps` utility (12px · 600 · 2px tracking, uppercase) — never `text-ios-*`.
- **Chrome = live CraneWeb:** plain white two-row header (no glass): utility row (location · cart · account) + course
  switcher and uppercase section nav; left course-picker drawer; footer with Contact / Powered by TenFore Golf.
- **`WebFrame`** renders a browser window at `desktop` 1440 / `laptop` 1024 / `mobile` 390. The page is an `@container`,
  so components use container variants **`@tablet:` (≥768) and `@desktop:` (≥1024)** — never viewport `md:`/`lg:`.
  Dialogs/drawers portal into the page (`WebDialog`, `Drawer`).
- **Routing:** `web-router.tsx` (`WebRouterProvider`, `WebLink`, `useWebRouter`, `matchPath`). Paths mirror real CraneWeb
  URLs and are deep-linkable (`/shop/golf-balls/dozens/<id>`, `/cart`, `/checkout`, `/tee-times`, `/account/wallet`…);
  each area exports a `…Routes` array and the address bar shows the current path.
- **Shared state:** `WebShell` + `useWebSession()` (course, signed-in name), `useCart()` (`src/screens/web/cart-store.tsx`;
  food & pro-shop items can't be checked out together — `add()` returns `{ ok: false, reason: "mixed" }`).
- **Data:** `src/data/shop.ts` (groups → subgroups derived from products, Club Offerings, destination tax by ZIP),
  `store-catalog.ts` (Fox apparel/shoes/balls), `shop-pos-catalog.ts` (curated balls, accessories, snack-bar food).
  Images: `images/store` → `/store-images`, `images/shop` → `/shop-images`, `images/cards` → `/card-images`.
- Stories use `WebScreen` (`src/stories/crane-web/web-story-kit.tsx`) with `path` + `width`.
- **Areas** (each exports a `…Routes` array, assembled in `src/screens/web/web-app.tsx` → `webRoutes()` + `CraneWebRoutes`):
  `auth/`, `browse/` (shop, tabs | sidebar nav variants), `checkout/` (cart → checkout with destination tax → order),
  `restaurant/`, `tee-times/`, `events/` (events, clinics, leagues, activities, calendar), `account/`.
- **Web prototype:** `npm run prototype:web` → http://localhost:6024/web/ (also :6022/web/). `prototype/web/main.tsx`
  renders `CraneWebPresenter` (`src/prototype-app/web-presenter.tsx`: jump list, width/appearance/shop-nav switches,
  full-window) around the shared hash-routed app in `src/prototype-app/web-prototype.tsx`. Storybook › Crane Web › Flow
  is the same app in a frame.
- **Event/clinic/league art:** `src/screens/web/events/images/art/<id>-card.webp` (1200×800, 3:2 cards) and
  `<id>-banner.webp` (2160×925, 21:9 detail heroes, subject centred so it crops to 3:1 / 5:2 / 16:9). Loaded via
  `art(id)` in `events-data.ts`; `Hero` uses `banner ?? image`. Generated with Higgsfield from Sagamore references.
- **Course imagery** copied from Fox lives in `images/courses/` (sagamore, mcg, kettleHills, flogolf, events, logos).
- **WebDialog** sits below the global nav on tablet+ (not centred) and is a bottom sheet on mobile web.
- Web sizing: shared form/feedback components switch to web sizes inside `.crane-web` via `in-[.crane-web]:` variants;
  Button has explicit `web-sm | web-md | web-lg` sizes.

## Conventions (from Untitled UI / Fox)

- Files are **kebab-case**. Imports from `react-aria-components` are prefixed `Aria*`
  (`import { Button as AriaButton } from "react-aria-components"`).
- Icons: `@untitledui/icons`, passed as component refs (`icon={User01}`); decorative icons get `aria-hidden`.
- Disabled = `disabled:opacity-50 disabled:cursor-not-allowed`. Small transitions = `transition duration-100 ease-linear`.
- Pressed state uses React Aria's `data-[pressed]` (touch-first: avoid hover-only affordances).
- Sample data lives in `src/data/crane.ts`. Don't put real personal details (phone, personal email) in stories —
  use `@tenfore.golf` addresses and 555 numbers.

## Story categories (sidebar order)

Introduction · Foundations · Components · Sign in ∕ Sign up · Profile ∕ Account · App Chrome · Crane Web · Nov 11, 2026 Issues

## Hosting

GitHub Pages: every push to `main` runs `.github/workflows/deploy-pages.yml` and publishes Storybook to
https://jg-tenfore.github.io/tf-crane-ds-v1/ (built with `PAGES=1` so Vite uses the `/tf-crane-ds-v1/` base).
Asset paths must stay relative (`crane-logo/…`, `brand/…`) so they resolve under that sub-path.

## Git

Commit as **jg-tenfore** (`justin.girard@tenfore.golf`, set repo-locally). Check `gh api user -q .login`
is `jg-tenfore` before every push. Work on `tf-crane-work-MMDDYY-Xam|pm` branches → PR into `main`.
`references/` is git-ignored (screenshots contain real account details; the repo is public).
