import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { Button as AriaButton, ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup, type Key } from "react-aria-components";
import { cx } from "@/utils/cx";
import { addDays, dateOfIso, INSTRUCTION_TODAY, isoOf, MONTHS_SHORT, WEEKDAYS_SHORT } from "../data";
import { focusRing } from "../pro/instructor-ui";

/** How far ahead lessons can be booked online. */
export const BOOKING_WINDOW_DAYS = 56;

const anchorFor = (iso: string) => {
    const days = Math.max(0, Math.round((dateOfIso(iso).getTime() - INSTRUCTION_TODAY.getTime()) / 86_400_000));
    return addDays(INSTRUCTION_TODAY, Math.floor(days / 7) * 7);
};

/**
 * A week of days from today, paged a week at a time — the tee-time date strip's tiles, with each
 * day's open-time count instead of a green-fee price. Closed days stay selectable (they lead to the
 * next opening and the waitlist), like Square's.
 */
export const DateStrip = ({ value, onChange, openCount }: { value: string; onChange: (iso: string) => void; openCount: (iso: string) => number }) => {
    const [anchor, setAnchor] = useState(() => anchorFor(value));
    useEffect(() => setAnchor(anchorFor(value)), [value]);
    const days = Array.from({ length: 7 }, (_, i) => isoOf(addDays(anchor, i)));
    const canBack = anchor > INSTRUCTION_TODAY;
    const canNext = addDays(anchor, 7) < addDays(INSTRUCTION_TODAY, BOOKING_WINDOW_DAYS);
    const first = dateOfIso(days[0]);
    const last = dateOfIso(days[6]);
    const label =
        first.getMonth() === last.getMonth()
            ? `${MONTHS_SHORT[first.getMonth()]} ${first.getFullYear()}`
            : `${MONTHS_SHORT[first.getMonth()]} – ${MONTHS_SHORT[last.getMonth()]} ${last.getFullYear()}`;
    const arrow = cx(
        "flex size-9 cursor-pointer items-center justify-center rounded-lg bg-primary text-fg-secondary ring-1 ring-secondary ring-inset transition duration-100 ease-linear hover:bg-primary_hover disabled:cursor-not-allowed disabled:opacity-50",
        focusRing,
    );

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <span className="text-md font-semibold text-primary">{label}</span>
                <div className="flex gap-2">
                    <AriaButton aria-label="Previous week" isDisabled={!canBack} onPress={() => setAnchor((a) => addDays(a, -7))} className={arrow}>
                        <ChevronLeft className="size-5" aria-hidden="true" />
                    </AriaButton>
                    <AriaButton aria-label="Next week" isDisabled={!canNext} onPress={() => setAnchor((a) => addDays(a, 7))} className={arrow}>
                        <ChevronRight className="size-5" aria-hidden="true" />
                    </AriaButton>
                </div>
            </div>
            <AriaToggleButtonGroup
                aria-label="Choose a day"
                selectionMode="single"
                selectedKeys={days.includes(value) ? [value] : []}
                onSelectionChange={(keys: Set<Key>) => {
                    const [k] = keys;
                    if (k != null) onChange(String(k));
                }}
                className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 py-1 @tablet:mx-0 @tablet:grid @tablet:grid-cols-7 @tablet:px-0"
            >
                {days.map((iso) => {
                    const d = dateOfIso(iso);
                    const n = openCount(iso);
                    const today = iso === isoOf(INSTRUCTION_TODAY);
                    return (
                        <AriaToggleButton
                            key={iso}
                            id={iso}
                            aria-label={`${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}, ${n ? `${n} open` : "nothing open"}`}
                            className={cx(
                                "group flex h-[68px] w-[76px] shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl bg-primary ring-1 ring-secondary transition duration-100 ease-linear ring-inset hover:ring-primary @tablet:w-auto",
                                "data-[selected]:bg-brand-solid data-[selected]:ring-0",
                                focusRing,
                            )}
                        >
                            <span className="text-xs text-tertiary group-data-[selected]:text-white/80">{today ? "Today" : WEEKDAYS_SHORT[d.getDay()]}</span>
                            <span className="text-md font-semibold text-primary group-data-[selected]:text-white">
                                {MONTHS_SHORT[d.getMonth()]} {d.getDate()}
                            </span>
                            <span className={cx("text-[11px] leading-none group-data-[selected]:text-white/85", n ? "text-brand-secondary" : "text-quaternary")}>
                                {n ? `${n} open` : "Full"}
                            </span>
                        </AriaToggleButton>
                    );
                })}
            </AriaToggleButtonGroup>
        </div>
    );
};
