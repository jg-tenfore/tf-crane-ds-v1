import { ChevronDown, Flag01, User01, Users01 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Tag } from "@/components/base/badge";

export interface TeeTime {
    id: string;
    time: string;
    price: number;
    spots: number;
    holes: 9 | 18;
    course: string;
    /** Players already reserved on this time (shown as "Reserved (x2)"). */
    reserved?: number;
}

export interface TeeTimeCardProps {
    teeTime: TeeTime;
    onPress?: (teeTime: TeeTime) => void;
    className?: string;
}

const currency = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/** Golf-tee glyph — no tee icon in the line set, so it's drawn here. */
const TeeIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M12 3v14M12 3l6 3-6 3" />
        <path d="M7 21c0-2 2.2-3.5 5-3.5s5 1.5 5 3.5" />
    </svg>
);

/**
 * TeeTimeCard — a row on the tee sheet. Available times are full white cards;
 * sold-out times collapse to a dimmed single line with a FULL tag.
 */
export const TeeTimeCard = ({ teeTime: t, onPress, className }: TeeTimeCardProps) => {
    const full = t.spots === 0;

    if (full) {
        return (
            <div
                aria-label={`${t.time}, full`}
                className={cx("flex h-[58px] items-center gap-2 rounded-ios-card bg-primary/60 px-4 opacity-60 shadow-ios-card", className)}
            >
                <span className="text-ios-title2 text-quaternary">{t.time}</span>
                <Tag tone="error">Full</Tag>
                <span className="ml-auto text-ios-title3 text-quaternary tabular-nums">{currency(t.price)}</span>
                <ChevronDown className="size-4 text-fg-quaternary" aria-hidden="true" />
            </div>
        );
    }

    return (
        <AriaButton
            onPress={() => onPress?.(t)}
            className={cx(
                "press-scale block w-full cursor-pointer rounded-ios-card bg-primary px-4 py-3.5 text-left shadow-ios-card ring-1 ring-secondary/60 outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60",
                className,
            )}
        >
            <div className="flex items-baseline justify-between">
                <span className="text-ios-title2 text-primary">{t.time}</span>
                <span className="text-ios-title3 font-bold text-primary tabular-nums">{currency(t.price)}</span>
            </div>
            <div className="mt-1 flex items-center gap-4 text-ios-subheadline text-tertiary">
                <span className="flex items-center gap-1.5">
                    <User01 className="size-4" aria-hidden="true" />
                    {t.spots} {t.spots === 1 ? "spot" : "spots"} available
                </span>
                <span className="flex items-center gap-1.5">
                    <TeeIcon className="size-4" />
                    {t.holes} holes
                </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-ios-subheadline text-tertiary">
                <Flag01 className="size-4" aria-hidden="true" />
                {t.course}
            </div>
            {t.reserved ? (
                <div className="mt-1 flex items-center gap-1.5 text-ios-footnote text-tertiary">
                    <Users01 className="size-4" aria-hidden="true" />
                    Reserved (x{t.reserved})
                </div>
            ) : null}
        </AriaButton>
    );
};
