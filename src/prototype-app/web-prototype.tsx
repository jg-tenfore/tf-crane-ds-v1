import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { ArrowUpRight, Phone01, RefreshCcw01 } from "@untitledui/icons";
import { WebFrame } from "@/components/web/web-frame";
import { WebRouterProvider, useWebRouter } from "@/components/web/web-router";
import type { CategoryNavVariant } from "@/screens/web/browse";
import { CartProvider } from "@/screens/web/cart-store";
import { CraneWebRoutes, webRoutes } from "@/screens/web/web-app";
import { WebSessionProvider } from "@/screens/web/web-shell";

/* ---------- Shared by the bare app (CraneWebPrototype) and the review presenter ---------- */

export const HOME = "/tee-times";

const hashPath = () => (typeof location !== "undefined" ? decodeURIComponent(location.hash.replace(/^#/, "")) : "");
export const pathFromHash = () => {
    const h = hashPath();
    return h.startsWith("/") ? h : HOME;
};

const isLocal = () => typeof location !== "undefined" && /^(localhost|127\.|192\.168\.)/.test(location.hostname);
/** Storybook › Crane Web overview: :6021 locally, two levels up from /prototype/web/ on GitHub Pages. */
export const STORYBOOK_URL = isLocal() ? `${location.protocol}//${location.hostname}:6021/?path=/docs/crane-web-overview--docs` : "../../?path=/docs/crane-web-overview--docs";
/** The iPhone prototype lives one level up (/ locally, /tf-crane-ds-v1/prototype/ on Pages). */
export const IPHONE_URL = "../";

/**
 * Keeps the in-app router and the URL hash in sync, so every page is a deep link
 * (#/shop/golf-balls/dozens) and the browser Back button works.
 *   - In-app navigation (including the router's own back()) → a new hash entry.
 *   - Browser Back/Forward, a pasted link or `jump()` → navigate in place (cart, session and
 *     booked rounds survive).
 *   - `restart()` remounts the whole app (fresh cart + session) at a path.
 */
export const useHashRouting = () => {
    const [start, setStart] = useState(pathFromHash);
    const [session, setSession] = useState(0);
    const [path, setPath] = useState(start);
    const last = useRef(start);
    const navRef = useRef<((p: string) => void) | null>(null);

    const restart = useCallback((p: string = HOME) => {
        last.current = p;
        navRef.current = null;
        history.replaceState(null, "", `#${p}`);
        setStart(p);
        setPath(p);
        setSession((n) => n + 1);
    }, []);

    const jump = useCallback(
        (p: string) => {
            if (navRef.current) navRef.current(p);
            else restart(p);
        },
        [restart],
    );

    // Called by <HashSync> whenever the router's path changes.
    const onPath = useCallback((p: string) => {
        setPath(p);
        last.current = p;
        if (hashPath() !== p) location.hash = p;
    }, []);

    useEffect(() => {
        const onHash = () => {
            const p = pathFromHash();
            if (p === last.current) return;
            last.current = p;
            if (navRef.current) navRef.current(p);
            else restart(p);
        };
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, [restart]);

    useEffect(() => {
        if (!location.hash) history.replaceState(null, "", `#${last.current}`);
    }, []);

    return { start, session, path, jump, restart, sync: { navRef, onPath } };
};

export type HashRouting = ReturnType<typeof useHashRouting>;

/** Lives inside the router: hands its navigate() up and reports path changes. */
const HashSync = ({ navRef, onPath }: { navRef: RefObject<((p: string) => void) | null>; onPath: (p: string) => void }) => {
    const { path, navigate } = useWebRouter();
    useLayoutEffect(() => {
        navRef.current = navigate;
    }, [navRef, navigate]);
    useEffect(() => {
        onPath(path);
    }, [path, onPath]);
    return null;
};

/**
 * Session, cart and router for the Crane Web prototype — rendered ABOVE the WebFrame, so
 * changing the frame's width/appearance (or switching to full window) keeps the page and cart.
 */
export const WebAppProviders = ({ routing, children }: { routing: HashRouting; children: ReactNode }) => (
    <WebSessionProvider key={`s${routing.session}`}>
        <CartProvider>
            <WebRouterProvider key={`r${routing.session}`} initialPath={routing.start}>
                <HashSync {...routing.sync} />
                {children}
            </WebRouterProvider>
        </CartProvider>
    </WebSessionProvider>
);

/** Every Crane Web route for a shop-nav variant (tabs | sidebar). */
export const useWebRoutes = (shopNav: CategoryNavVariant = "tabs") => useMemo(() => webRoutes({ shopNav }), [shopNav]);

/** The full-window app: real window breakpoints, no simulated browser bar. */
export const FullWindowApp = ({ shopNav = "tabs", dark = false }: { shopNav?: CategoryNavVariant; dark?: boolean }) => {
    const routes = useWebRoutes(shopNav);
    return (
        <WebFrame fill dark={dark}>
            <CraneWebRoutes routes={routes} />
        </WebFrame>
    );
};

/** Small floating prototype menu for full-window mode — out of the way, not part of the design. */
export const PrototypePill = ({ onStartOver, extra }: { onStartOver: () => void; extra?: ReactNode }) => (
    <div className="crane-web pointer-events-none fixed right-3 bottom-3 z-[100] flex justify-end">
        <details className="group pointer-events-auto rounded-xl bg-gray-950/85 text-white shadow-lg backdrop-blur [&_summary::-webkit-details-marker]:hidden">
            <summary className="caps cursor-pointer list-none px-3 py-2 text-[11px] text-white/80 select-none">Crane Web prototype</summary>
            <div className="flex flex-col gap-1 px-2 pb-2 text-sm">
                {extra}
                <a className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10" href={STORYBOOK_URL} target="_blank" rel="noreferrer">
                    <ArrowUpRight className="size-4" aria-hidden="true" /> Storybook
                </a>
                <a className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10" href={IPHONE_URL}>
                    <Phone01 className="size-4" aria-hidden="true" /> iPhone prototype
                </a>
                <a
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10"
                    href={`#${HOME}`}
                    onClick={(e) => {
                        e.preventDefault();
                        onStartOver();
                    }}
                >
                    <RefreshCcw01 className="size-4" aria-hidden="true" /> Start over
                </a>
            </div>
        </details>
    </div>
);

/**
 * CraneWebPrototype — every Crane Web screen as one real, full-window web app. Routes live in
 * the URL hash (#/shop/golf-balls/dozens), so every page is a shareable deep link and the
 * browser Back button works. Responsive breakpoints follow the actual window width.
 * (The review tool, `CraneWebPresenter`, wraps this same app with a side panel.)
 */
export const CraneWebPrototype = () => {
    const routing = useHashRouting();
    return (
        <div className="h-dvh w-screen">
            <WebAppProviders routing={routing}>
                <FullWindowApp />
            </WebAppProviders>
            <PrototypePill onStartOver={() => routing.restart(HOME)} />
        </div>
    );
};
