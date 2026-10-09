import type { ReactNode } from "react";
import { Label as AriaLabel, Meter as AriaMeter } from "react-aria-components";
import { cx } from "@/utils/cx";

export interface ProgressBarProps {
    value: number;
    max: number;
    /** Visible label above the bar ("Green Fees"). Omit and pass aria-label for bar-only usage. */
    label?: ReactNode;
    "aria-label"?: string;
    /** Text to the right of the bar ("3/20 used", "$91.63 used"). */
    valueLabel?: ReactNode;
    className?: string;
}

/**
 * ProgressBar — how much of something is used: punches on a punch card, the balance on a
 * rain check. Built on React Aria Meter (a quantity within a range, not a loading state).
 */
export const ProgressBar = ({ value, max, label, valueLabel, className, ...props }: ProgressBarProps) => (
    <AriaMeter value={value} maxValue={max} aria-label={props["aria-label"]} className={cx("flex flex-col gap-2", className)}>
        {({ percentage }) => (
            <>
                {label && <AriaLabel className="text-ios-body text-primary">{label}</AriaLabel>}
                <div className="flex items-center gap-3">
                    <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-tertiary">
                        <div className="h-full rounded-full bg-fg-brand-secondary transition-[width] duration-500 ease-ios" style={{ width: `${percentage}%` }} />
                    </div>
                    {valueLabel && <span className="shrink-0 text-ios-subheadline text-tertiary tabular-nums">{valueLabel}</span>}
                </div>
            </>
        )}
    </AriaMeter>
);
