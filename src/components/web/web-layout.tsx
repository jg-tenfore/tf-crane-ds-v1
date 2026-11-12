import type { ReactNode } from "react";
import { cx } from "@/utils/cx";
import { WebLink } from "./web-router";

/** Centered page rail. `content` (1080) for cart/checkout columns, `wide` (1200) to align with the header. */
export const WebPage = ({ children, width = "wide", className }: { children: ReactNode; width?: "wide" | "content"; className?: string }) => (
    <main className={cx("mx-auto w-full px-4 pt-6 pb-16 @tablet:px-8 @tablet:pt-10 @tablet:pb-20", width === "wide" ? "max-w-web" : "max-w-web-content", className)}>{children}</main>
);

export interface PageHeaderProps {
    /** Small green caps label above the title ("YOUR ORDER"). */
    eyebrow?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    /** Link-style action above the eyebrow ("← Continue Shopping"). */
    back?: ReactNode;
    actions?: ReactNode;
    className?: string;
}

/** Large page title block — "Shop", "Your Cart". */
export const PageHeader = ({ eyebrow, title, subtitle, back, actions, className }: PageHeaderProps) => (
    <div className={cx("flex flex-col gap-1", className)}>
        {back && <div className="mb-3">{back}</div>}
        {eyebrow && <div className="caps text-brand-secondary">{eyebrow}</div>}
        <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-display-sm font-bold tracking-[-0.5px] text-primary @tablet:text-display-md">{title}</h1>
            {actions}
        </div>
        {subtitle && <p className="mt-1 text-md text-tertiary">{subtitle}</p>}
    </div>
);

export interface CapsTab {
    href: string;
    label: string;
    active?: boolean;
}

/**
 * CapsTabs — CraneWeb's uppercase, letter-spaced link tabs with a green underline on the
 * current one. Real links (deep-linkable): use for shop categories and subgroups.
 * `size="sm"` is the quieter second row (subgroups).
 */
export const CapsTabs = ({ tabs, label, size = "md", gap = "md", className }: { tabs: CapsTab[]; label: string; size?: "md" | "sm"; gap?: "sm" | "md"; className?: string }) => (
    <nav
        aria-label={label}
        className={cx(
            "scrollbar-hide flex overflow-x-auto",
            gap === "sm" ? "gap-4" : "gap-6",
            // Fade the trailing edge so overflowing tabs read as scrollable.
            "[mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)]",
            className,
        )}
    >
        {tabs.map((t) => (
            <WebLink
                key={t.href}
                href={t.href}
                aria-current={t.active ? "page" : undefined}
                className={cx(
                    "caps relative shrink-0 pb-2 whitespace-nowrap transition duration-100 ease-linear outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60",
                    size === "sm" && "text-[11px]",
                    t.active ? "text-brand-secondary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-fg-brand-primary" : "text-quaternary hover:text-secondary",
                )}
            >
                {t.label}
            </WebLink>
        ))}
    </nav>
);

/** "Club Offerings ——— 4 ITEMS" section heading with a hairline rule. */
export const SectionHeading = ({ title, count, action }: { title: ReactNode; count?: number; action?: ReactNode }) => (
    <div className="mb-5 flex items-center gap-4">
        <h2 className="shrink-0 text-display-xs font-semibold tracking-[-0.3px] text-primary">{title}</h2>
        <span className="h-px flex-1 bg-border-secondary" aria-hidden="true" />
        {count != null && <span className="caps shrink-0 text-quaternary">{count} items</span>}
        {action}
    </div>
);

/** White bordered panel used for cart lines, order summaries, checkout sections. */
export const Panel = ({ title, children, className, bodyClassName }: { title?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }) => (
    <section className={cx("flex flex-col rounded-xl bg-primary ring-1 ring-secondary ring-inset", className)}>
        {title && <header className="border-b border-secondary px-5 py-4 text-md font-semibold text-primary">{title}</header>}
        <div className={bodyClassName}>{children}</div>
    </section>
);
