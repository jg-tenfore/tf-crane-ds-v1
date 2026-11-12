import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { UNSAFE_PortalProvider } from "react-aria";
import { ChevronLeft, ChevronRight, Lock01, RefreshCw01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

/** Crane Web review widths: desktop, laptop/tablet landscape, tablet portrait, and mobile web. */
export const WEB_WIDTHS = { desktop: 1440, laptop: 1024, tablet: 768, mobile: 390 } as const;
export type WebWidth = keyof typeof WEB_WIDTHS;

const CHROME_H = 44;

interface WebFrameApi {
    /** Scroll the page back to the top (call after navigating). */
    scrollToTop: () => void;
    width: WebWidth;
}
const WebFrameContext = createContext<WebFrameApi>({ scrollToTop: () => {}, width: "desktop" });
export const useWebFrame = () => useContext(WebFrameContext);

export interface WebFrameProps {
    children: ReactNode;
    width?: WebWidth;
    /** Visible page height (excluding the browser bar). Mobile defaults to 844. */
    height?: number;
    /** Shown in the address bar — makes deep links visible in reviews. */
    url?: string;
    /** Render the page in Warm Dark. */
    dark?: boolean;
    /** Scale down to fit the available width (default) instead of overflowing. */
    fit?: boolean;
    /**
     * Fill the parent (e.g. the whole browser tab) with no simulated browser bar or scaling —
     * for the real Crane Web prototype. The page is still a scroll container + portal target,
     * so dialogs stay in view and `@container` breakpoints follow the real window width.
     */
    fill?: boolean;
    className?: string;
}

/**
 * WebFrame — a browser window for Crane Web screens. The page inside is an `@container`,
 * so components respond to the frame's width (@tablet ≥768, @desktop ≥1024) rather than the
 * Storybook viewport. Dialogs/drawers portal into the page, and Outfit is scoped here.
 */
export const WebFrame = ({ children, width = "desktop", height, url = "crane.tenfore.golf/shop", dark = false, fit = true, fill = false, className }: WebFrameProps) => {
    const w = WEB_WIDTHS[width];
    const h = height ?? (width === "mobile" ? 844 : 900);
    const outerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [portal, setPortal] = useState<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        if (!fit || !outerRef.current) return;
        const el = outerRef.current;
        const ro = new ResizeObserver(([e]) => setScale(Math.min(1, (e.contentRect.width - 8) / w)));
        ro.observe(el);
        return () => ro.disconnect();
    }, [fit, w]);

    const api = useMemo<WebFrameApi>(
        () => ({
            scrollToTop: () => {
                scrollRef.current?.scrollTo({ top: 0 });
            },
            width,
        }),
        [width],
    );

    const page = (style: React.CSSProperties) => (
        <div ref={setPortal} className={cx("crane-web relative isolate overflow-clip", dark && "dark-mode")} style={{ ...style, transform: "translateZ(0)" }}>
            <div ref={scrollRef} className="@container h-full overflow-y-auto overscroll-contain bg-secondary font-body text-primary antialiased">
                <WebFrameContext.Provider value={api}>{portal && <UNSAFE_PortalProvider getContainer={() => portal}>{children}</UNSAFE_PortalProvider>}</WebFrameContext.Provider>
            </div>
        </div>
    );

    if (fill) return <div className={cx("h-full w-full", className)}>{page({ height: "100%" })}</div>;

    return (
        <div ref={outerRef} className={cx("w-full", className)}>
            <div style={{ width: w * scale, height: (h + CHROME_H) * scale }} className="mx-auto">
                <div
                    className="overflow-hidden rounded-xl bg-[#e8e8ea] shadow-[0_24px_60px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.08)]"
                    style={{ width: w, height: h + CHROME_H, transform: `scale(${scale})`, transformOrigin: "top left" }}
                >
                    {/* Browser bar */}
                    <div aria-hidden="true" className="flex items-center gap-3 px-3" style={{ height: CHROME_H }}>
                        {width !== "mobile" && (
                            <span className="flex gap-1.5">
                                <span className="size-3 rounded-full bg-[#ff5f57]" />
                                <span className="size-3 rounded-full bg-[#febc2e]" />
                                <span className="size-3 rounded-full bg-[#28c840]" />
                            </span>
                        )}
                        {width !== "mobile" && (
                            <span className="flex gap-1 text-[#6b6b70]">
                                <ChevronLeft className="size-4" />
                                <ChevronRight className="size-4" />
                            </span>
                        )}
                        <span className="mx-auto flex h-7 w-full max-w-[560px] items-center justify-center gap-1.5 rounded-lg bg-white/80 px-3 font-[system-ui] text-[12px] text-[#3a3a3c]">
                            <Lock01 className="size-3 shrink-0 text-[#6b6b70]" />
                            <span className="truncate">{url}</span>
                        </span>
                        {width !== "mobile" && <RefreshCw01 className="size-4 text-[#6b6b70]" />}
                    </div>

                    {/* Page */}
                    {page({ height: h })}
                </div>
            </div>
        </div>
    );
};
