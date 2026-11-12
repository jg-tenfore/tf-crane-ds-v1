import { useCallback, useEffect, useRef, useState, type FC, type ReactNode } from "react";
import { ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup, type Key } from "react-aria-components";
import { CheckCircle } from "@untitledui/icons";
import { StatusBadge, type StatusTone } from "@/components/base/badge";
import { Button, buttonStyles, type ButtonProps } from "@/components/base/button";
import { WebLink } from "@/components/web/web-router";
import type { WalletStatus } from "@/data/crane";
import { cx } from "@/utils/cx";

/**
 * Small building blocks shared by the Crane Web account pages. They wrap the Crane
 * components with web type sizes (text-sm / text-md) instead of iOS Dynamic Type.
 */

const webSizes = {
    sm: "h-9 rounded-lg px-3.5 text-sm",
    md: "h-11 rounded-lg px-4.5 text-md",
} as const;

export interface WebButtonProps extends Omit<ButtonProps, "size"> {
    size?: keyof typeof webSizes;
}

/** Crane Button at web sizes: sm 36px / md 44px, Outfit text-sm / text-md. */
export const WebButton = ({ size = "md", className, ...props }: WebButtonProps) => (
    <Button {...props} size={size === "sm" ? "sm" : "md"} className={cx(webSizes[size], className)} />
);

/** Link-styled text action ("Edit", "View all"). */
export const TextAction = ({ children, onPress, href, tone = "gray", className }: { children: ReactNode; onPress?: () => void; href?: string; tone?: "gray" | "brand" | "error"; className?: string }) => {
    const cls = cx(
        "inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md text-sm font-semibold underline-offset-4 outline-none transition duration-100 ease-linear hover:underline focus-visible:ring-4 focus-visible:ring-brand-300/60 disabled:cursor-not-allowed disabled:opacity-50",
        tone === "gray" && "text-secondary hover:text-primary",
        tone === "brand" && "text-brand-secondary",
        tone === "error" && "text-error-primary",
        className,
    );
    if (href)
        return (
            <WebLink href={href} className={cls}>
                {children}
            </WebLink>
        );
    return (
        <button type="button" onClick={onPress} className={cls}>
            {children}
        </button>
    );
};

/** Page title inside the account content column ("Welcome back, Justin", "Wallet"). */
export const AccountTitle = ({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) => (
    <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
            <h2 className="text-display-xs font-bold tracking-[-0.4px] text-primary @tablet:text-display-sm">{title}</h2>
            {subtitle && <p className="mt-1 text-md text-tertiary">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2.5">{actions}</div>}
    </div>
);

/** White panel with an optional title row and right-aligned action. */
export const AccountPanel = ({
    title,
    description,
    action,
    children,
    className,
    flush,
    id,
}: {
    title?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    /** No horizontal padding on the body (rows bring their own). */
    flush?: boolean;
    id?: string;
}) => (
    <section id={id} aria-label={typeof title === "string" ? title : undefined} className={cx("rounded-xl bg-primary ring-1 ring-secondary ring-inset", className)}>
        {title && (
            <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-secondary px-5 py-4">
                <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-primary">{title}</h3>
                    {description && <p className="text-sm text-tertiary">{description}</p>}
                </div>
                {action}
            </header>
        )}
        <div className={cx(!flush && "px-5")}>{children}</div>
    </section>
);

/** At-a-glance number ("Account balance $0.00"). Optional href makes the tile a link. */
export const StatTile = ({ icon: Icon, label, value, sub, href }: { icon: FC<{ className?: string }>; label: string; value: ReactNode; sub?: ReactNode; href?: string }) => {
    const body = (
        <>
            <div className="flex items-center gap-1.5">
                <Icon className="size-4 text-fg-quaternary" aria-hidden="true" />
                <span className="caps text-[11px] text-quaternary">{label}</span>
            </div>
            <p className="mt-2 text-display-xs font-semibold text-primary tabular-nums">{value}</p>
            {sub && <p className="mt-0.5 text-sm text-tertiary">{sub}</p>}
        </>
    );
    const cls = "block rounded-xl bg-primary p-4 ring-1 ring-secondary ring-inset";
    if (!href) return <div className={cls}>{body}</div>;
    return (
        <WebLink href={href} className={cx(cls, "outline-none transition duration-100 ease-linear hover:ring-primary focus-visible:ring-4 focus-visible:ring-brand-300/60")}>
            {body}
        </WebLink>
    );
};

const initialsOf = (name: string, email: string) => {
    const src = name.trim() || email;
    const parts = src.split(/[\s.@]+/).filter(Boolean);
    return ((parts[0]?.[0] ?? "") + (name.trim() ? (parts[1]?.[0] ?? "") : "")).toUpperCase();
};

/** Initials in a soft brand circle (buddies, account header). */
export const Initials = ({ name, email = "", size = "md", className }: { name: string; email?: string; size?: "sm" | "md" | "lg"; className?: string }) => (
    <span
        aria-hidden="true"
        className={cx(
            "flex shrink-0 items-center justify-center rounded-full bg-brand-primary_alt font-semibold text-brand-secondary",
            size === "sm" && "size-9 text-xs",
            size === "md" && "size-11 text-sm",
            size === "lg" && "size-14 text-lg",
            className,
        )}
    >
        {initialsOf(name, email)}
    </span>
);

const STATUS: Record<WalletStatus, { label: string; tone: StatusTone }> = {
    active: { label: "Active", tone: "success" },
    available: { label: "Available", tone: "success" },
    "used-up": { label: "Used Up", tone: "gray" },
    expired: { label: "Expired", tone: "error" },
    "expiring-soon": { label: "Expiring Soon", tone: "warning" },
};

/** Pale wallet status pill at web size. */
export const WalletStatusBadge = ({ status }: { status: WalletStatus }) => (
    <StatusBadge tone={STATUS[status].tone} className="text-xs">
        {STATUS[status].label}
    </StatusBadge>
);

/** Other status pills (Upcoming, Registered, Completed, Pending). */
export const Pill = ({ tone = "success", children }: { tone?: StatusTone; children: ReactNode }) => (
    <StatusBadge tone={tone} className="text-xs">
        {children}
    </StatusBadge>
);

/** Centered empty block inside a panel or on its own. */
export const EmptyBlock = ({ icon: Icon, title, description, action, className }: { icon: FC<{ className?: string }>; title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) => (
    <div className={cx("flex flex-col items-center px-6 py-12 text-center", className)}>
        <span className="flex size-14 items-center justify-center rounded-full bg-brand-primary_alt text-fg-brand-primary">
            <Icon className="size-7" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-lg font-semibold text-primary">{title}</h3>
        {description && <p className="mt-1 max-w-sm text-md text-tertiary">{description}</p>}
        {action && <div className="mt-5">{action}</div>}
    </div>
);

/** Pill-style single select for small option sets (gift amount, plan type). */
export const ChoicePills = ({
    options,
    value,
    onChange,
    label,
    className,
}: {
    options: { id: string; label: string }[];
    value: string;
    onChange: (id: string) => void;
    label: string;
    className?: string;
}) => (
    <AriaToggleButtonGroup
        aria-label={label}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[value]}
        onSelectionChange={(keys: Set<Key>) => {
            const [first] = keys;
            if (first != null) onChange(String(first));
        }}
        className={cx("flex flex-wrap gap-2", className)}
    >
        {options.map((o) => (
            <AriaToggleButton
                key={o.id}
                id={o.id}
                className="h-9 cursor-pointer rounded-full bg-primary px-4 text-sm font-semibold text-secondary ring-1 ring-secondary outline-none transition duration-100 ease-linear ring-inset hover:bg-primary_hover focus-visible:ring-4 focus-visible:ring-brand-300/60 data-[selected]:bg-brand-solid data-[selected]:text-white data-[selected]:ring-transparent"
            >
                {o.label}
            </AriaToggleButton>
        ))}
    </AriaToggleButtonGroup>
);

/** Inline confirmation ("Invite sent to …") that fades after a few seconds. Web has no toast yet. */
export const useFlash = (ms = 3500) => {
    const [message, setMessage] = useState<string | null>(null);
    const t = useRef<ReturnType<typeof setTimeout>>(undefined);
    const show = useCallback(
        (m: string) => {
            clearTimeout(t.current);
            setMessage(m);
            t.current = setTimeout(() => setMessage(null), ms);
        },
        [ms],
    );
    useEffect(() => () => clearTimeout(t.current), []);
    return { message, show };
};

export const Flash = ({ message }: { message: string | null }) => (
    <div role="status" aria-live="polite" className="empty:hidden">
        {message && (
            <div className="flex items-center gap-2 rounded-lg bg-success-primary px-4 py-3 text-sm font-medium text-success-primary">
                <CheckCircle className="size-4 shrink-0" aria-hidden="true" />
                {message}
            </div>
        )}
    </div>
);

/** "Sun, Oct 11". */
export const shortDay = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

/** A WebLink that looks like WebButton (filled / outline) — for navigation actions. */
export const LinkButton = ({ href, children, color = "filled", size = "md", icon: Icon, className }: { href: string; children: ReactNode; color?: "filled" | "outline" | "tinted"; size?: "sm" | "md"; icon?: FC<{ className?: string }>; className?: string }) => (
    <WebLink
        href={href}
        className={cx(
            buttonStyles.common.root,
            buttonStyles.sizes[size].root,
            buttonStyles.colors[color].root,
            webSizes[size],
            "transition duration-100 ease-linear",
            color === "filled" && "hover:bg-brand-solid_hover",
            color === "outline" && "hover:bg-primary_hover",
            className,
        )}
    >
        {Icon && <Icon className={cx(buttonStyles.common.icon, size === "sm" ? "size-4" : "size-5")} aria-hidden="true" />}
        {children}
    </WebLink>
);
