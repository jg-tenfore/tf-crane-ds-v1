import type { ReactNode } from "react";
import { cx } from "@/utils/cx";
import { BackButton } from "@/components/base/glass-button";
import { IPHONE_17 } from "@/components/device/iphone-frame";

export interface NavigationBarProps {
    title?: ReactNode;
    /** Shows a glass back capsule. Pass the previous screen's title (iOS convention). */
    backLabel?: string;
    /** Show a chevron-only back circle instead of a labeled capsule. */
    backIconOnly?: boolean;
    onBack?: () => void;
    /** Custom leading content (hamburger menu, close button). Replaces the back button. */
    leading?: ReactNode;
    /** Trailing actions — GlassIconButton / GlassPillButton. */
    trailing?: ReactNode;
    /**
     * `center` — title centered over the bar (root screens: "Profile", "Bookings").
     * `inline` — title sits right after the back capsule (Crane's pushed screens).
     */
    titleAlign?: "center" | "inline";
    /** Brand-green title, used on detail screens ("Tee Time Details"). */
    titleTone?: "default" | "brand";
    /** Hairline under the bar. On by default; turn off over hero images. */
    divider?: boolean;
    /** `glass` blurs content scrolling underneath; `transparent` for hero images. */
    surface?: "glass" | "solid" | "transparent";
    className?: string;
}

/**
 * NavigationBar — the top chrome of every Crane screen, including the status-bar safe area.
 * Floats over content; Screen pads its scroll area to match.
 */
export const NavigationBar = ({
    title,
    backLabel,
    backIconOnly,
    onBack,
    leading,
    trailing,
    titleAlign = backLabel || backIconOnly ? "inline" : "center",
    titleTone = "default",
    divider = true,
    surface = "glass",
    className,
}: NavigationBarProps) => {
    const lead = leading ?? (backLabel || backIconOnly ? <BackButton label={backIconOnly ? undefined : backLabel} onPress={onBack} /> : null);
    const titleEl = title ? (
        <h1 className={cx("truncate text-ios-headline", titleTone === "brand" ? "text-brand-secondary" : "text-primary")}>{title}</h1>
    ) : null;

    return (
        <header
            className={cx(
                "relative w-full",
                surface === "glass" && "bg-primary/80 backdrop-blur-xl backdrop-saturate-150",
                surface === "solid" && "bg-primary",
                divider && surface !== "transparent" && "border-b border-secondary",
                className,
            )}
            style={{ paddingTop: IPHONE_17.safeTop - 8 }}
        >
            <div className="relative flex h-[54px] items-center gap-3 px-gutter pb-1">
                {lead && <div className="flex shrink-0 items-center">{lead}</div>}

                {titleAlign === "inline" ? (
                    <div className="min-w-0 flex-1">{titleEl}</div>
                ) : (
                    <>
                        <div className="flex-1" />
                        <div className="pointer-events-none absolute inset-x-[96px] flex justify-center">{titleEl}</div>
                    </>
                )}

                {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
            </div>
        </header>
    );
};
