import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Phone01, RefreshCcw01 } from "@untitledui/icons";
import { WebFrame } from "@/components/web/web-frame";
import { WebRouterProvider } from "@/components/web/web-router";
import { CartProvider } from "@/screens/web/cart-store";
import { CraneWebRoutes, webRoutes } from "@/screens/web/web-app";
import { WebSessionProvider } from "@/screens/web/web-shell";

const HOME = "/tee-times";
const pathFromHash = () => {
    const h = typeof location !== "undefined" ? decodeURIComponent(location.hash.replace(/^#/, "")) : "";
    return h.startsWith("/") ? h : HOME;
};

const isLocal = () => typeof location !== "undefined" && /^(localhost|127\.|192\.168\.)/.test(location.hostname);
/** Storybook: :6021 locally, two levels up from /prototype/web/ on GitHub Pages. */
const STORYBOOK_URL = isLocal() ? `${location.protocol}//${location.hostname}:6021/?path=/docs/crane-web-overview--docs` : "../../?path=/docs/crane-web-overview--docs";

/**
 * CraneWebPrototype — every Crane Web screen as one real, full-window web app. Routes live in
 * the URL hash (#/shop/golf-balls/dozens), so every page is a shareable deep link and the
 * browser Back button works. Responsive breakpoints follow the actual window width.
 */
export const CraneWebPrototype = () => {
    const [start, setStart] = useState(pathFromHash);
    const [session, setSession] = useState(0);
    const last = useRef(start);
    const routes = useRef(webRoutes()).current;

    // In-app navigation → push a hash entry (so Back works) without remounting.
    const onNavigate = (p: string) => {
        last.current = p;
        if (decodeURIComponent(location.hash.replace(/^#/, "")) !== p) location.hash = p;
    };

    // Browser Back/Forward or a pasted deep link → remount the app at that path.
    useEffect(() => {
        const onHash = () => {
            const p = pathFromHash();
            if (p === last.current) return;
            last.current = p;
            setStart(p);
            setSession((n) => n + 1);
        };
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, []);

    useEffect(() => {
        if (!location.hash) history.replaceState(null, "", `#${start}`);
    }, [start]);

    return (
        <div className="h-dvh w-screen">
            <WebRouterProvider key={session} initialPath={start} onNavigate={onNavigate}>
                <WebSessionProvider>
                    <CartProvider>
                        <WebFrame fill>
                            <CraneWebRoutes routes={routes} />
                        </WebFrame>
                    </CartProvider>
                </WebSessionProvider>
            </WebRouterProvider>

            {/* Prototype controls — small, out of the way, not part of the design. */}
            <div className="crane-web pointer-events-none fixed right-3 bottom-3 z-[100] flex justify-end">
                <details className="group pointer-events-auto rounded-xl bg-gray-950/85 text-white shadow-lg backdrop-blur [&_summary::-webkit-details-marker]:hidden">
                    <summary className="caps cursor-pointer list-none px-3 py-2 text-[11px] text-white/80 select-none">Crane Web prototype</summary>
                    <div className="flex flex-col gap-1 px-2 pb-2 text-sm">
                        <a className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10" href={STORYBOOK_URL} target="_blank" rel="noreferrer">
                            <ArrowUpRight className="size-4" aria-hidden="true" /> Storybook
                        </a>
                        <a className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10" href="../">
                            <Phone01 className="size-4" aria-hidden="true" /> iPhone prototype
                        </a>
                        <a
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10"
                            href={`#${HOME}`}
                            onClick={(e) => {
                                e.preventDefault();
                                last.current = HOME;
                                history.replaceState(null, "", `#${HOME}`);
                                setStart(HOME);
                                setSession((n) => n + 1);
                            }}
                        >
                            <RefreshCcw01 className="size-4" aria-hidden="true" /> Start over
                        </a>
                    </div>
                </details>
            </div>
        </div>
    );
};
