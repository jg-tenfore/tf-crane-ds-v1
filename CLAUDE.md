# TF Crane Design System (tf-crane-ds-v1)

Design system + clickable prototypes for **TF Crane**, TenFore Golf's customer-facing iPhone app
(the production app is Expo / React Native at TenForeGolf/Crane — this repo is where screens and
UX concepts are designed and prototyped before they're built there).

## Stack

- **React 19 + TypeScript + Vite**, **Tailwind CSS v4**, **React Aria Components**
- **Storybook 10** (`@storybook/react-vite`) — `npm run storybook` → http://localhost:6021
- `npm run typecheck` · `npm run test` (mounts every story in headless Chromium)

## Design foundations

- **Colour + semantic tokens = Fox DS** (`src/styles/theme.css`, ported verbatim from tf-fox-ds-v1).
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

## Conventions (from Untitled UI / Fox)

- Files are **kebab-case**. Imports from `react-aria-components` are prefixed `Aria*`
  (`import { Button as AriaButton } from "react-aria-components"`).
- Icons: `@untitledui/icons`, passed as component refs (`icon={User01}`); decorative icons get `aria-hidden`.
- Disabled = `disabled:opacity-50 disabled:cursor-not-allowed`. Small transitions = `transition duration-100 ease-linear`.
- Pressed state uses React Aria's `data-[pressed]` (touch-first: avoid hover-only affordances).
- Sample data lives in `src/data/crane.ts`. Don't put real personal details (phone, personal email) in stories —
  use `@tenfore.golf` addresses and 555 numbers.

## Story categories (sidebar order)

Introduction · Foundations · Components · Sign in ∕ Sign up · Profile ∕ Account · App Chrome

## Git

Commit as **jg-tenfore** (`justin.girard@tenfore.golf`, set repo-locally). Check `gh api user -q .login`
is `jg-tenfore` before every push. Work on `tf-crane-work-MMDDYY-Xam|pm` branches → PR into `main`.
`references/` is git-ignored (screenshots contain real account details; the repo is public).
