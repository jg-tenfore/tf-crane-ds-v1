import { Children, Fragment, isValidElement, type FC, type ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import { ChevronRight } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { IconTile } from "@/components/base/card";

export interface ListGroupProps {
    /** Small caption above the group. */
    header?: ReactNode;
    /** Helper text below the group. */
    footer?: ReactNode;
    /** Left inset of the hairline between rows, in pt. 68 aligns with the text column after an icon tile; 0 runs edge to edge. */
    separatorInset?: number;
    children: ReactNode;
    className?: string;
}

/**
 * ListGroup — iOS inset-grouped list: a white rounded card of rows with hairline
 * separators inset to the text column. Wrap ListRow / KeyValueRow children.
 */
export const ListGroup = ({ header, footer, separatorInset = 68, children, className }: ListGroupProps) => {
    const rows = Children.toArray(children).filter(isValidElement);
    return (
        <div className={cx("px-gutter", className)}>
            {header && <div className="mb-1.5 px-1 text-ios-footnote text-tertiary uppercase">{header}</div>}
            <div className="overflow-hidden rounded-ios-card bg-primary shadow-ios-card ring-1 ring-secondary/60">
                {rows.map((row, i) => (
                    <Fragment key={row.key ?? i}>
                        {i > 0 && <div className="h-px bg-border-secondary" style={{ marginLeft: separatorInset }} />}
                        {row}
                    </Fragment>
                ))}
            </div>
            {footer && <div className="mt-2 px-1 text-ios-footnote text-tertiary">{footer}</div>}
        </div>
    );
};

export interface ListRowProps {
    title: ReactNode;
    subtitle?: ReactNode;
    /** Leading icon in a soft brand tile (Profile rows). */
    icon?: FC<{ className?: string }>;
    /** Any custom leading element — avatar, logo. Overrides `icon`. */
    leading?: ReactNode;
    /** Inline next to the title — a Tag or Pill. */
    titleAccessory?: ReactNode;
    /** Right side: value text, CountBadge, Switch… */
    trailing?: ReactNode;
    /** Show the disclosure chevron. Defaults to true when the row is pressable. */
    chevron?: boolean;
    onPress?: () => void;
    isDisabled?: boolean;
    className?: string;
}

/** ListRow — one row in a ListGroup. Pressable rows get the chevron and an iOS press highlight. */
export const ListRow = ({ title, subtitle, icon, leading, titleAccessory, trailing, chevron, onPress, isDisabled, className }: ListRowProps) => {
    const showChevron = chevron ?? !!onPress;
    const content = (
        <>
            {leading ?? (icon ? <IconTile icon={icon} size="md" /> : null)}
            <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="flex items-center gap-2">
                    <span className="truncate text-ios-headline text-primary">{title}</span>
                    {titleAccessory}
                </span>
                {subtitle && <span className="truncate text-ios-subheadline text-tertiary">{subtitle}</span>}
            </span>
            {trailing && <span className="flex shrink-0 items-center gap-2 text-ios-body text-tertiary">{trailing}</span>}
            {showChevron && <ChevronRight className="size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />}
        </>
    );
    const rowClass = cx("flex min-h-[64px] w-full items-center gap-3 px-4 py-3", className);

    if (!onPress) return <div className={rowClass}>{content}</div>;
    return (
        <AriaButton
            onPress={onPress}
            isDisabled={isDisabled}
            className={cx(
                rowClass,
                "cursor-pointer outline-none transition duration-100 ease-linear data-[pressed]:bg-primary_hover data-[focus-visible]:bg-primary_hover disabled:cursor-not-allowed disabled:opacity-50",
            )}
        >
            {content}
        </AriaButton>
    );
};

export interface KeyValueRowProps {
    label: ReactNode;
    value: ReactNode;
    /** `emphasis` bolds the value (totals). `brand` colours it green. */
    tone?: "default" | "emphasis" | "brand";
    className?: string;
}

/** Label / value pair — Course Details tables, Order Summary, balances. */
export const KeyValueRow = ({ label, value, tone = "default", className }: KeyValueRowProps) => (
    <div className={cx("flex items-baseline justify-between gap-4 py-2.5", className)}>
        <span className={cx("text-ios-subheadline", tone === "default" ? "text-tertiary" : "text-ios-headline text-primary")}>{label}</span>
        <span
            className={cx(
                "text-right text-ios-subheadline font-semibold text-primary tabular-nums",
                tone === "emphasis" && "text-ios-title3",
                tone === "brand" && "text-ios-title3 text-brand-secondary",
            )}
        >
            {value}
        </span>
    </div>
);
