import { useEffect, useState } from "react";
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup, ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup, type Key } from "react-aria-components";
import { cx } from "@/utils/cx";
import { WebDialog } from "@/components/web/web-dialog";
import {
    asapAvailable,
    ASAP_MINUTES,
    at,
    clock,
    defaultPickup,
    fmtDay,
    LOCATIONS,
    TODAY,
    TOMORROW,
    timeSlots,
    TURN_HOLES,
    turnAvailable,
    type Day,
    type Pickup,
} from "./restaurant-data";
import { focusRing, WebButton } from "./restaurant-ui";

export interface PickupDialogProps {
    isOpen: boolean;
    onOpenChange: (o: boolean) => void;
    day: Day;
    now: number;
    value: Pickup;
    onChange: (p: Pickup) => void;
}

const chip = cx(
    "flex h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-secondary ring-1 ring-secondary ring-inset transition duration-100 ease-linear hover:ring-brand",
    "data-[selected]:bg-brand-solid data-[selected]:text-white data-[selected]:ring-transparent disabled:cursor-not-allowed disabled:opacity-50",
    focusRing,
);

/**
 * "When do you want it?" — ASAP at the Grill, a pickup time, or at the turn (timed off the hole
 * you text from, picked up at the turn stand). A WebDialog, so it's a bottom sheet on mobile web.
 */
export const PickupDialog = ({ isOpen, onOpenChange, day, now, value, onChange }: PickupDialogProps) => {
    const [draft, setDraft] = useState<Pickup>(value);
    useEffect(() => {
        if (isOpen) setDraft(value);
    }, [isOpen, value]);

    const slots = timeSlots(day, now);
    const asap = asapAvailable(day, now);
    const turn = turnAvailable(day, now);
    const groups = [
        { label: "Morning", times: slots.filter((t) => t < at(12)) },
        { label: "Afternoon", times: slots.filter((t) => t >= at(12) && t < at(17)) },
        { label: "Evening", times: slots.filter((t) => t >= at(17)) },
    ].filter((g) => g.times.length > 0);

    const setMode = (mode: string) => {
        if (mode === "asap") setDraft({ mode: "asap" });
        if (mode === "time") {
            const d = defaultPickup(day, now);
            setDraft({ mode: "time", time: draft.mode === "time" ? draft.time : d.mode === "time" ? d.time : (slots.find((t) => t >= now + 60) ?? slots[0]) });
        }
        if (mode === "turn") setDraft({ mode: "turn", hole: draft.mode === "turn" ? draft.hole : 7 });
    };

    const modes = [
        {
            id: "asap",
            label: "ASAP",
            detail: asap ? `Ready in about ${ASAP_MINUTES} minutes at ${LOCATIONS.grill.name}.` : day === "tomorrow" ? "Only for today's orders." : "The kitchen isn't taking ASAP orders right now.",
            disabled: !asap,
        },
        { id: "time", label: "Schedule a pickup time", detail: slots.length ? `Pick up at the ${LOCATIONS.grill.name.replace("The ", "")} counter, ${clock(slots[0])} – ${clock(slots[slots.length - 1])}.` : "No pickup times left today.", disabled: slots.length === 0 },
        {
            id: "turn",
            label: "At the turn",
            detail: turn
                ? `Text us from the tee of the hole you pick and we'll fire it — ready at the ${LOCATIONS.turn.name.toLowerCase()} (${LOCATIONS.turn.where.toLowerCase()}).`
                : `The ${LOCATIONS.turn.name.toLowerCase()} closes at ${clock(LOCATIONS.turn.close)}.`,
            disabled: !turn,
        },
    ];

    return (
        <WebDialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="When do you want it?"
            description={`${day === "today" ? "Today" : "Tomorrow"}, ${fmtDay(day === "today" ? TODAY : TOMORROW)} · pickup only`}
            footer={
                <>
                    <WebButton color="outline" onPress={() => onOpenChange(false)}>
                        Cancel
                    </WebButton>
                    <WebButton
                        onPress={() => {
                            onChange(draft);
                            onOpenChange(false);
                        }}
                    >
                        Save pickup
                    </WebButton>
                </>
            }
        >
            <div className="flex flex-col gap-5">
                <AriaRadioGroup aria-label="Pickup" value={draft.mode} onChange={setMode} className="flex flex-col gap-2">
                    {modes.map((m) => (
                        <AriaRadio
                            key={m.id}
                            value={m.id}
                            isDisabled={m.disabled}
                            className={cx(
                                "group flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3.5 ring-1 ring-secondary transition duration-100 ease-linear ring-inset",
                                "hover:bg-primary_hover data-[selected]:bg-brand-primary_alt data-[selected]:ring-2 data-[selected]:ring-brand",
                                "data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60 disabled:cursor-not-allowed disabled:opacity-50",
                            )}
                        >
                            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary ring-1 ring-primary ring-inset group-data-[selected]:bg-brand-solid group-data-[selected]:ring-0">
                                <span className="size-2 rounded-full bg-white opacity-0 group-data-[selected]:opacity-100" />
                            </span>
                            <span className="flex min-w-0 flex-col gap-0.5">
                                <span className="text-md font-semibold text-primary">{m.label}</span>
                                <span className="text-sm text-tertiary">{m.detail}</span>
                            </span>
                        </AriaRadio>
                    ))}
                </AriaRadioGroup>

                {draft.mode === "time" && (
                    <div className="flex flex-col gap-4">
                        {groups.map((g) => (
                            <section key={g.label}>
                                <p className="mb-2 text-sm font-semibold text-secondary">{g.label}</p>
                                <AriaToggleButtonGroup
                                    aria-label={`${g.label} pickup times`}
                                    selectionMode="single"
                                    disallowEmptySelection
                                    selectedKeys={[String(draft.time)]}
                                    onSelectionChange={(keys: Set<Key>) => {
                                        const [k] = keys;
                                        if (k != null) setDraft({ mode: "time", time: Number(k) });
                                    }}
                                    className="grid grid-cols-3 gap-2 @tablet:grid-cols-5"
                                >
                                    {g.times.map((t) => (
                                        <AriaToggleButton key={t} id={String(t)} className={chip}>
                                            {clock(t)}
                                        </AriaToggleButton>
                                    ))}
                                </AriaToggleButtonGroup>
                            </section>
                        ))}
                    </div>
                )}

                {draft.mode === "turn" && (
                    <section>
                        <p className="text-sm font-semibold text-secondary">Which hole will you text us from?</p>
                        <p className="mt-0.5 mb-3 text-sm text-tertiary">We start cooking when your text comes in. Hole 7 suits most groups; pick 8 or 9 if you&rsquo;re playing fast.</p>
                        <AriaToggleButtonGroup
                            aria-label="Hole"
                            selectionMode="single"
                            disallowEmptySelection
                            selectedKeys={[String(draft.hole)]}
                            onSelectionChange={(keys: Set<Key>) => {
                                const [k] = keys;
                                if (k != null) setDraft({ mode: "turn", hole: Number(k) });
                            }}
                            className="grid grid-cols-4 gap-2"
                        >
                            {TURN_HOLES.map((h) => (
                                <AriaToggleButton key={h} id={String(h)} className={cx(chip, "h-12 flex-col gap-0 leading-tight")}>
                                    <span className="text-[11px] font-medium opacity-70">Hole</span>
                                    <span className="text-md font-semibold">{h}</span>
                                </AriaToggleButton>
                            ))}
                        </AriaToggleButtonGroup>
                    </section>
                )}
            </div>
        </WebDialog>
    );
};
