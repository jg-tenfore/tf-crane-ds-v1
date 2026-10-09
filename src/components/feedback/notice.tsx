import type { FC, ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Clock, InfoCircle } from "@untitledui/icons";
import { cx, sortCx } from "@/utils/cx";

type Tone = "error" | "warning" | "success" | "info";

const toneIcon: Record<Tone, FC<{ className?: string }>> = {
    error: AlertCircle,
    warning: AlertTriangle,
    success: CheckCircle,
    info: InfoCircle,
};

export interface StatusBannerProps {
    tone?: Tone;
    icon?: FC<{ className?: string }>;
    children: ReactNode;
    className?: string;
}

const bannerTones = sortCx({
    error: "bg-fg-error-secondary text-white",
    warning: "bg-warning-solid text-white",
    success: "bg-success-solid text-white",
    info: "bg-brand-solid text-white",
});

/** Full-bleed solid strip under the nav bar — "This booking has expired". */
export const StatusBanner = ({ tone = "error", icon, children, className }: StatusBannerProps) => {
    const Icon = icon ?? (tone === "error" ? Clock : toneIcon[tone]);
    return (
        <div role="status" className={cx("flex items-center justify-center gap-2 px-gutter py-2.5 text-ios-subheadline font-medium", bannerTones[tone], className)}>
            <Icon className="size-[18px]" aria-hidden="true" />
            {children}
        </div>
    );
};

export interface NoticeProps {
    tone?: Tone;
    title?: ReactNode;
    children: ReactNode;
    /**
     * `accent` — tinted card with a coloured left rule (inline errors: "cannot be cancelled").
     * `soft` — tinted rounded box with a leading icon (cancellation-window warnings).
     * `card` — white card with a tinted icon badge (long booking notices).
     */
    variant?: "accent" | "soft" | "card";
    className?: string;
}

const softTones = sortCx({
    error: { box: "bg-error-primary text-error-primary", icon: "text-fg-error-primary", rule: "border-fg-error-primary", badge: "bg-error-secondary text-fg-error-primary" },
    warning: { box: "bg-warning-primary text-warning-primary", icon: "text-fg-warning-primary", rule: "border-fg-warning-primary", badge: "bg-warning-secondary text-fg-warning-primary" },
    success: { box: "bg-success-primary text-success-primary", icon: "text-fg-success-primary", rule: "border-fg-success-primary", badge: "bg-success-secondary text-fg-success-primary" },
    info: { box: "bg-brand-primary_alt text-brand-secondary", icon: "text-fg-brand-primary", rule: "border-fg-brand-primary", badge: "bg-brand-secondary text-fg-brand-primary" },
});

/** Inline message in the content flow. */
export const Notice = ({ tone = "info", title, children, variant = "soft", className }: NoticeProps) => {
    const Icon = toneIcon[tone];
    const t = softTones[tone];

    if (variant === "accent") {
        return (
            <div role="note" className={cx("rounded-ios-control border-l-4 px-4 py-3.5 text-ios-subheadline shadow-ios-card", t.rule, t.box, "text-primary", className)}>
                {title && <div className="mb-0.5 font-semibold">{title}</div>}
                {children}
            </div>
        );
    }

    if (variant === "card") {
        return (
            <div role="note" className={cx("flex gap-3 rounded-ios-card bg-secondary p-4", className)}>
                <span className={cx("flex size-7 shrink-0 items-center justify-center rounded-full", t.badge)}>
                    <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 text-ios-subheadline text-tertiary">
                    {title && <div className="mb-0.5 text-ios-headline text-primary">{title}</div>}
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div role="note" className={cx("flex gap-2.5 rounded-ios-control px-3.5 py-3 text-ios-subheadline", t.box, className)}>
            <Icon className={cx("mt-0.5 size-[18px] shrink-0", t.icon)} aria-hidden="true" />
            <div className="min-w-0 flex-1 text-primary">
                {title && <div className="font-semibold">{title}</div>}
                {children}
            </div>
        </div>
    );
};
