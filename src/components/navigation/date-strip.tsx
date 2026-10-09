import type { Key } from "react-aria-components";
import { ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup } from "react-aria-components";
import { cx } from "@/utils/cx";

export interface DateStripDay {
    /** ISO date, e.g. "2026-10-09". */
    id: string;
    weekday: string;
    label: string;
    isDisabled?: boolean;
}

export interface DateStripProps {
    days: DateStripDay[];
    selectedId: string;
    onChange: (id: string) => void;
    className?: string;
}

/** Build `count` consecutive days starting at `start` (local time). */
export const buildDays = (start: Date, count = 14): DateStripDay[] =>
    Array.from({ length: count }, (_, i) => {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        return {
            id: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
            weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
            label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        };
    });

/** Horizontal scrolling day picker above the tee sheet. Selected day is solid brand green. */
export const DateStrip = ({ days, selectedId, onChange, className }: DateStripProps) => (
    <AriaToggleButtonGroup
        aria-label="Choose a date"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[selectedId]}
        onSelectionChange={(keys: Set<Key>) => {
            const [k] = keys;
            if (k != null) onChange(String(k));
        }}
        className={cx("scrollbar-hide flex gap-2 overflow-x-auto px-gutter py-2", className)}
    >
        {days.map((d) => (
            <AriaToggleButton
                key={d.id}
                id={d.id}
                isDisabled={d.isDisabled}
                className={cx(
                    "press-scale flex h-[52px] w-[78px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-ios-control bg-primary text-primary shadow-ios-card ring-1 ring-secondary/70 outline-none",
                    "focus-visible:ring-4 focus-visible:ring-brand-300/60 disabled:cursor-not-allowed disabled:opacity-50",
                    "data-[selected]:bg-brand-solid data-[selected]:text-white data-[selected]:ring-0",
                )}
            >
                <span className="text-ios-footnote opacity-80">{d.weekday}</span>
                <span className="text-ios-subheadline font-semibold">{d.label}</span>
            </AriaToggleButton>
        ))}
    </AriaToggleButtonGroup>
);
