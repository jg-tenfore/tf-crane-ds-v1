import { createContext, useContext, type ReactNode } from "react";
import { cx } from "@/utils/cx";
import { IPHONE_17, useSafeArea } from "./iphone-frame";

/** Height of the top chrome on iPhone 17 when a NavigationBar is present: status bar safe area + nav row. */
export const NAV_CHROME_HEIGHT = IPHONE_17.safeTop + 54;
/** Same as NAV_CHROME_HEIGHT but for the device actually rendering (Storybook frame or a real phone). */
export const useNavChromeHeight = () => useSafeArea().top + 54;
/** Space reserved at the bottom when the floating TabBar is on screen. */
export const TAB_BAR_CHROME_HEIGHT = 108;

/**
 * Chrome that lives *outside* a screen (the app-level TabBar) tells screens how much
 * room to leave. AppShell provides it; standalone stories default to no tab bar.
 */
export const ScreenChromeContext = createContext<{ hasTabBar: boolean }>({ hasTabBar: false });
export const useScreenChrome = () => useContext(ScreenChromeContext);

export interface ScreenProps {
    /** Top chrome — usually a NavigationBar. Floats over content so glass blur shows scroll-under. */
    nav?: ReactNode;
    /** Pinned bottom area (primary action, sheet footers). Sits above the tab bar when present. */
    footer?: ReactNode;
    /**
     * What sits behind the footer so scrolled content doesn't collide with the button.
     * `fade` (default) blends into the screen background down through the home-indicator area.
     */
    footerSurface?: "fade" | "glass" | "none";
    /** Grouped gray (default, iOS settings style) or plain white. */
    background?: "grouped" | "plain";
    /** Override the top inset, e.g. 0 for a full-bleed hero image. Use useNavChromeHeight() to build on the nav height. */
    topInset?: number;
    children?: ReactNode;
    className?: string;
    contentClassName?: string;
}

/**
 * Screen — one full iPhone screen. Content scrolls; nav and footer float above it.
 * Insets are computed from the iPhone 17 safe areas so nothing hides under the
 * Dynamic Island, the nav bar, the tab bar, or the home indicator.
 */
export const Screen = ({ nav, footer, footerSurface = "fade", background = "grouped", topInset, children, className, contentClassName }: ScreenProps) => {
    const { hasTabBar } = useScreenChrome();
    const safe = useSafeArea();
    const top = topInset ?? (nav ? safe.top + 54 : safe.top);
    const bottomChrome = hasTabBar ? TAB_BAR_CHROME_HEIGHT : safe.bottom;

    return (
        <div className={cx("absolute inset-0 flex flex-col", background === "grouped" ? "bg-secondary" : "bg-primary", className)}>
            <div
                className={cx("scrollbar-hide relative flex-1 overflow-y-auto overscroll-contain", contentClassName)}
                style={{ paddingTop: top, paddingBottom: bottomChrome + (footer ? 84 : 16) }}
            >
                {children}
            </div>

            {nav && <div className="absolute inset-x-0 top-0 z-20">{nav}</div>}

            {footer && (
                <div
                    className={cx(
                        "absolute inset-x-0 bottom-0 z-20 px-gutter pt-5",
                        footerSurface === "fade" &&
                            (background === "grouped"
                                ? "bg-linear-to-b from-transparent via-bg-secondary/95 via-30% to-bg-secondary"
                                : "bg-linear-to-b from-transparent via-bg-primary/95 via-30% to-bg-primary"),
                        footerSurface === "glass" && "border-t border-secondary bg-primary/80 pt-3 backdrop-blur-xl",
                    )}
                    style={{ paddingBottom: bottomChrome + 12 }}
                >
                    {footer}
                </div>
            )}
        </div>
    );
};
