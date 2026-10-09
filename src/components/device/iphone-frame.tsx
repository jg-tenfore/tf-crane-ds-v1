import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { UNSAFE_PortalProvider } from "react-aria";
import { cx } from "@/utils/cx";
import { StatusBar, type StatusBarProps } from "./status-bar";

/** iPhone 17 logical resolution (pt). Every Crane screen is authored at this size. */
export const IPHONE_17 = {
    width: 402,
    height: 874,
    safeTop: 62,
    safeBottom: 34,
    cornerRadius: 55,
    island: { width: 126, height: 37, top: 11 },
} as const;

/** Safe-area insets (pt) for the screen being rendered. */
export interface SafeArea {
    top: number;
    bottom: number;
}
const SafeAreaContext = createContext<SafeArea>({ top: IPHONE_17.safeTop, bottom: IPHONE_17.safeBottom });

/**
 * Insets for the current screen: iPhone 17's 62 / 34 inside the Storybook frame, or the real
 * device's `env(safe-area-inset-*)` when the prototype runs full-screen on a phone.
 */
export const useSafeArea = () => useContext(SafeAreaContext);

/** Reads env(safe-area-inset-*) via a hidden probe element. */
const useEnvSafeArea = (enabled: boolean): SafeArea | null => {
    const [area, setArea] = useState<SafeArea | null>(null);
    useLayoutEffect(() => {
        if (!enabled) return;
        const probe = document.createElement("div");
        probe.style.cssText = "position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)";
        document.body.appendChild(probe);
        const read = () => {
            const cs = getComputedStyle(probe);
            setArea({ top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0 });
        };
        read();
        window.addEventListener("resize", read);
        return () => {
            window.removeEventListener("resize", read);
            probe.remove();
        };
    }, [enabled]);
    return area;
};

export interface IPhoneFrameProps {
    children: ReactNode;
    /**
     * `device` draws the titanium bezel around the screen (presentations, reviews).
     * `bare` renders just the 402×874 screen (side-by-side comparisons, tight grids).
     * `fullscreen` fills its parent with no simulated hardware and uses the real device's
     * safe areas — for running the prototype on an actual phone.
     */
    variant?: "device" | "bare" | "fullscreen";
    /** Status bar foreground. `dark` = black glyphs on light screens. */
    statusBar?: StatusBarProps["tone"] | "hidden";
    statusBarTime?: string;
    /** Draw the home indicator bar along the bottom edge. */
    homeIndicator?: boolean;
    /** Home indicator colour, independent of the status bar (a hero photo up top doesn't mean a dark bottom). */
    homeIndicatorTone?: "dark" | "light";
    /** Render the screen in the dark theme. */
    dark?: boolean;
    className?: string;
}

/**
 * IPhoneFrame — a pixel-accurate iPhone 17 viewport (402 × 874 pt).
 *
 * Overlays (sheets, alerts, drawers) portal into the screen rather than <body>, so a
 * modal opened inside a story stays clipped to the phone just like it would on device.
 */
export const IPhoneFrame = ({
    children,
    variant = "device",
    statusBar = "dark",
    statusBarTime = "9:41",
    homeIndicator = true,
    dark = false,
    homeIndicatorTone = dark ? "light" : "dark",
    className,
}: IPhoneFrameProps) => {
    const screenRef = useRef<HTMLDivElement>(null);
    const fullscreen = variant === "fullscreen";
    const env = useEnvSafeArea(fullscreen);
    // In a browser tab the OS bars sit outside the page (env = 0), so keep a little breathing room.
    const safeArea: SafeArea = fullscreen ? { top: Math.max(env?.top ?? 0, 14), bottom: Math.max(env?.bottom ?? 0, 12) } : { top: IPHONE_17.safeTop, bottom: IPHONE_17.safeBottom };
    // Re-render once mounted so the portal container exists before any overlay opens.
    const [, setMounted] = useState(false);

    const screen = (
        <div
            ref={(node) => {
                if (node && !screenRef.current) {
                    screenRef.current = node;
                    setMounted(true);
                }
            }}
            data-device-screen
            className={cx(
                "relative isolate overflow-hidden bg-secondary font-body text-primary antialiased",
                dark && "dark-mode",
                variant === "bare" && "rounded-ios-device shadow-ios-float",
            )}
            style={{
                width: fullscreen ? "100%" : IPHONE_17.width,
                height: fullscreen ? "100%" : IPHONE_17.height,
                borderRadius: fullscreen ? 0 : IPHONE_17.cornerRadius,
                // Lets descendants use `absolute` overlays and `transform` without escaping the screen.
                transform: "translateZ(0)",
            }}
        >
            <SafeAreaContext.Provider value={safeArea}>
                <UNSAFE_PortalProvider getContainer={() => screenRef.current}>{children}</UNSAFE_PortalProvider>
            </SafeAreaContext.Provider>

            {!fullscreen && statusBar !== "hidden" && <StatusBar tone={statusBar} time={statusBarTime} />}

            {/* Dynamic Island */}
            {!fullscreen && <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 z-[100] -translate-x-1/2 rounded-full bg-black"
                style={{ top: IPHONE_17.island.top, width: IPHONE_17.island.width, height: IPHONE_17.island.height }}
            />}

            {homeIndicator && !fullscreen && (
                <div
                    aria-hidden="true"
                    className={cx(
                        "pointer-events-none absolute bottom-2 left-1/2 z-[100] h-[5px] w-[139px] -translate-x-1/2 rounded-full",
                        homeIndicatorTone === "light" ? "bg-white" : "bg-black",
                    )}
                />
            )}
        </div>
    );

    if (variant === "bare") return <div className={className}>{screen}</div>;
    if (fullscreen) return <div className={cx("h-full w-full", className)}>{screen}</div>;

    return (
        <div
            className={cx("relative inline-block rounded-[68px] bg-[#2b2b2d] p-[13px] shadow-[0_30px_80px_rgba(0,0,0,0.25)]", className)}
            style={{ boxShadow: "inset 0 0 0 2px #4a4a4c, inset 0 0 0 5px #1a1a1a, 0 30px 80px rgba(0,0,0,0.25)" }}
        >
            {/* Side buttons */}
            <span aria-hidden="true" className="absolute top-[180px] -left-[3px] h-[34px] w-[4px] rounded-l bg-[#3a3a3c]" />
            <span aria-hidden="true" className="absolute top-[240px] -left-[3px] h-[62px] w-[4px] rounded-l bg-[#3a3a3c]" />
            <span aria-hidden="true" className="absolute top-[315px] -left-[3px] h-[62px] w-[4px] rounded-l bg-[#3a3a3c]" />
            <span aria-hidden="true" className="absolute top-[260px] -right-[3px] h-[96px] w-[4px] rounded-r bg-[#3a3a3c]" />
            {screen}
        </div>
    );
};
