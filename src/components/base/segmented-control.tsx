import type { Key } from "react-aria-components";
import { ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup } from "react-aria-components";
import { cx } from "@/utils/cx";

export interface SegmentedOption {
    id: string;
    label: string;
    isDisabled?: boolean;
}

export interface SegmentedControlProps {
    options: SegmentedOption[];
    value: string;
    onChange: (id: string) => void;
    "aria-label": string;
    /**
     * `ios` — classic gray track with a white sliding thumb.
     * `brand` — separated pills, selected one solid green (Crane's "18 Holes / 9 Holes").
     */
    variant?: "ios" | "brand";
    className?: string;
}

/** Single-select segmented control built on React Aria ToggleButtonGroup. */
export const SegmentedControl = ({ options, value, onChange, variant = "ios", className, ...props }: SegmentedControlProps) => (
    <AriaToggleButtonGroup
        aria-label={props["aria-label"]}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[value]}
        onSelectionChange={(keys: Set<Key>) => {
            const [first] = keys;
            if (first != null) onChange(String(first));
        }}
        className={cx("flex w-full", variant === "ios" ? "rounded-[9px] bg-tertiary p-[2px]" : "gap-2", className)}
    >
        {options.map((o) => (
            <AriaToggleButton
                key={o.id}
                id={o.id}
                isDisabled={o.isDisabled}
                className={cx(
                    "flex-1 cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60 disabled:cursor-not-allowed disabled:opacity-50",
                    variant === "ios"
                        ? "h-[30px] rounded-[7px] text-ios-subheadline font-medium text-primary transition duration-150 ease-ios data-[selected]:bg-primary data-[selected]:font-semibold data-[selected]:shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)]"
                        : "press-scale h-[44px] rounded-ios-control bg-tertiary text-ios-body font-medium text-tertiary data-[selected]:bg-brand-solid data-[selected]:font-semibold data-[selected]:text-white",
                )}
            >
                {o.label}
            </AriaToggleButton>
        ))}
    </AriaToggleButtonGroup>
);
