import type { FC, HTMLAttributes, ReactNode } from "react";
import { cx } from "@/utils/cx";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Inner padding. `none` for cards that hold their own rows (lists, key/value tables). */
    padding?: "none" | "md" | "lg";
}

/** White rounded surface on the grouped-gray background. The basic Crane container. */
export const Card = ({ padding = "md", className, ...props }: CardProps) => (
    <div
        {...props}
        className={cx(
            "rounded-ios-card bg-primary shadow-ios-card ring-1 ring-secondary/60",
            padding === "md" && "p-4",
            padding === "lg" && "p-5",
            className,
        )}
    />
);

export interface SectionProps {
    title?: ReactNode;
    icon?: FC<{ className?: string }>;
    /** Right-aligned text or action next to the title. */
    accessory?: ReactNode;
    children: ReactNode;
    className?: string;
}

/** A titled block of content on a screen — "Date & Time", "Players (2)", "Order Summary". */
export const Section = ({ title, icon: Icon, accessory, children, className }: SectionProps) => (
    <section className={cx("px-gutter", className)}>
        {title && (
            <div className="mb-2.5 flex items-center gap-2">
                {Icon && <Icon className="size-[22px] text-fg-brand-primary" aria-hidden="true" />}
                <h2 className="flex-1 text-ios-title3 text-primary">{title}</h2>
                {accessory}
            </div>
        )}
        {children}
    </section>
);

export interface IconTileProps {
    icon: FC<{ className?: string }>;
    size?: "sm" | "md" | "lg" | "xl";
    shape?: "rounded" | "circle";
    tone?: "brand" | "gray" | "error" | "warning";
    className?: string;
}

const tileSizes = {
    sm: "size-8 [&>svg]:size-4",
    md: "size-10 [&>svg]:size-5",
    lg: "size-14 [&>svg]:size-7",
    xl: "size-20 [&>svg]:size-10",
};
const tileTones = {
    brand: "bg-brand-primary_alt text-fg-brand-primary",
    gray: "bg-tertiary text-fg-tertiary",
    error: "bg-error-secondary text-fg-error-primary",
    warning: "bg-warning-secondary text-fg-warning-primary",
};

/** Soft-tinted square/circle holding a line icon — profile rows, empty states, balance header. */
export const IconTile = ({ icon: Icon, size = "md", shape = "rounded", tone = "brand", className }: IconTileProps) => (
    <span
        className={cx(
            "inline-flex shrink-0 items-center justify-center",
            tileSizes[size],
            tileTones[tone],
            shape === "circle" ? "rounded-full" : size === "sm" ? "rounded-lg" : "rounded-[10px]",
            className,
        )}
    >
        <Icon aria-hidden="true" />
    </span>
);

/** Hairline divider that respects iOS list insets. */
export const Divider = ({ inset = 0, className }: { inset?: number; className?: string }) => (
    <div role="separator" className={cx("h-px bg-border-secondary", className)} style={{ marginLeft: inset }} />
);
