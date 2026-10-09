import type { FC, ReactNode } from "react";
import { cx, sortCx } from "@/utils/cx";

const tagStyles = sortCx({
    solid: {
        brand: "bg-brand-solid text-white",
        gray: "bg-secondary-solid text-white",
        error: "bg-error-solid/85 text-white",
        warning: "bg-warning-solid text-white",
        success: "bg-success-solid text-white",
    },
    soft: {
        brand: "bg-brand-primary_alt text-brand-secondary",
        gray: "bg-tertiary text-secondary",
        error: "bg-error-primary text-error-primary",
        warning: "bg-warning-primary text-warning-primary",
        success: "bg-success-primary text-success-primary",
    },
});

export type TagTone = keyof typeof tagStyles.solid;

export interface TagProps {
    children: ReactNode;
    tone?: TagTone;
    variant?: "solid" | "soft";
    icon?: FC<{ className?: string }>;
    className?: string;
}

/**
 * Tag — the small uppercase label in Crane cards: FULL, BOOKER, GUEST.
 * Short status words only; use a Badge-style count for numbers.
 */
export const Tag = ({ children, tone = "brand", variant = "solid", icon: Icon, className }: TagProps) => (
    <span
        className={cx(
            "inline-flex h-[18px] shrink-0 items-center gap-1 rounded-[4px] px-1.5 text-[11px] leading-none font-bold tracking-[0.04em] uppercase",
            tagStyles[variant][tone],
            className,
        )}
    >
        {Icon && <Icon className="size-3" aria-hidden="true" />}
        {children}
    </span>
);

export interface CountBadgeProps {
    count: number;
    /** Hide when zero (default) — iOS never shows a "0" badge. */
    showZero?: boolean;
    className?: string;
}

/** Red notification count — tab bar icons, list rows. Caps at 99+. */
export const CountBadge = ({ count, showZero, className }: CountBadgeProps) => {
    if (!count && !showZero) return null;
    return (
        <span
            className={cx(
                "inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-error-solid px-1.5 text-[12px] leading-none font-semibold text-white tabular-nums",
                className,
            )}
        >
            {count > 99 ? "99+" : count}
        </span>
    );
};

export interface PillProps {
    children: ReactNode;
    icon?: FC<{ className?: string }>;
    tone?: "brand" | "gray";
    className?: string;
}

/** Rounded informational pill — "🏆 0" next to a name, "Expires in 30s", "Added". */
export const Pill = ({ children, icon: Icon, tone = "gray", className }: PillProps) => (
    <span
        className={cx(
            "inline-flex h-[24px] items-center gap-1 rounded-full px-2.5 text-ios-footnote font-medium",
            tone === "brand" ? "bg-brand-solid text-white" : "bg-primary text-secondary ring-1 ring-secondary",
            className,
        )}
    >
        {Icon && <Icon className="size-3.5" aria-hidden="true" />}
        {children}
    </span>
);

const statusTones = sortCx({
    success: "bg-(--status-success-bg) text-(--status-success-fg)",
    gray: "bg-(--status-gray-bg) text-(--status-gray-fg)",
    error: "bg-(--status-error-bg) text-(--status-error-fg)",
    warning: "bg-(--status-warning-bg) text-(--status-warning-fg)",
});

export type StatusTone = keyof typeof statusTones;

export interface StatusBadgeProps {
    children: ReactNode;
    tone?: StatusTone;
    className?: string;
}

/**
 * StatusBadge — sentence-case status on wallet items: Active, Available, Used Up,
 * Expired, Expiring Soon. Pale in both Light and Warm Dark, like the app (--status-* tokens
 * in cupertino.css). Use Tag for the small uppercase labels (FULL, BOOKER).
 */
export const StatusBadge = ({ children, tone = "success", className }: StatusBadgeProps) => (
    <span
        className={cx(
            "inline-flex h-[24px] shrink-0 items-center rounded-md px-2 text-ios-footnote font-semibold whitespace-nowrap",
            statusTones[tone],
            className,
        )}
    >
        {children}
    </span>
);
