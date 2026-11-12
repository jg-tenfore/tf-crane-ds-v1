import { useState } from "react";
import { ArrowRight, Check, CheckCircle, Flag01, Lock01, Monitor01, Users01, Stars02 } from "@untitledui/icons";
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup, ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup, type Key } from "react-aria-components";
import { cx } from "@/utils/cx";
import { PageHeader, SectionHeading, WebPage } from "@/components/web/web-layout";
import { WebLink } from "@/components/web/web-router";
import { PAYMENT_CARDS, TODAY, USER } from "@/data/crane";
import { useWebSession, WebShell } from "../web-shell";
import { addDays, fmtDay, fmtMinutes, IMAGES, OTHER_ACTIVITIES, parseIso, SIM_BAYS, SIM_CLOSE, SIM_SLOTS, simHourlyRate, simIsBooked, toIso } from "./events-data";
import { AddToCalendar, ConfirmDialog, focusRing, MobileActionBar, money, SideCard, Stepper, SummaryLine, WebButton, type DialogStep } from "./events-ui";

const DURATIONS = [
    { id: "60", label: "1 hr" },
    { id: "90", label: "1.5 hr" },
    { id: "120", label: "2 hr" },
    { id: "180", label: "3 hr" },
];
const DAYS = Array.from({ length: 7 }, (_, i) => toIso(addDays(TODAY, i)));

type SlotState = "open" | "start" | "in-range" | "booked" | "short";

export interface ActivitiesPageProps {
    initialDate?: string;
    initialBay?: number;
    initialStart?: number | null;
    initialDuration?: number;
    initialPlayers?: number;
    initialStep?: DialogStep | null;
}

const segBtn = cx(
    "flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg px-3.5 text-sm font-semibold text-secondary ring-1 ring-secondary ring-inset transition duration-100 ease-linear hover:bg-primary_hover data-[selected]:bg-brand-solid data-[selected]:text-white data-[selected]:ring-transparent disabled:cursor-not-allowed disabled:opacity-50",
    focusRing,
);

/**
 * /activities — simulator bays first (ports Fox "Global Nav/Tee Times/FloGolf Indoor",
 * tenfore-simulator-flogolf.stories.tsx: bays with seating + capacity, 30-minute slots from
 * 10 AM to 10 PM, booked blocks, day/evening rate tiers, bays too small for the party
 * disabled). Crane simplifies Fox's tap-start-then-end strips to: date → players → duration →
 * bay → start time, with the whole window highlighted. Other activities follow as cards.
 */
export const ActivitiesPage = ({ initialDate = DAYS[1], initialBay = 0, initialStart = null, initialDuration = 90, initialPlayers = 4, initialStep = null }: ActivitiesPageProps) => {
    const { course } = useWebSession();
    const [date, setDate] = useState(initialDate);
    const [players, setPlayers] = useState(initialPlayers);
    const [duration, setDuration] = useState(initialDuration);
    const [bay, setBay] = useState(initialBay);
    const [start, setStart] = useState<number | null>(initialStart);
    const [step, setStep] = useState<DialogStep | null>(initialStep);
    const [booked, setBooked] = useState(false);

    const slotsNeeded = duration / 30;
    const windowFree = (s: number) => {
        if (s + duration > SIM_CLOSE) return false;
        for (let m = s; m < s + duration; m += 30) if (simIsBooked(date, bay, m)) return false;
        return true;
    };
    const slotState = (m: number): SlotState => {
        if (simIsBooked(date, bay, m)) return "booked";
        if (start != null && m === start) return "start";
        if (start != null && m > start && m < start + duration) return "in-range";
        if (!windowFree(m)) return "short";
        return "open";
    };
    const reset = (fn: () => void) => {
        fn();
        setStart(null);
        setBooked(false);
    };
    const total = start == null ? 0 : Array.from({ length: slotsNeeded }, (_, i) => simHourlyRate(date, start + i * 30) / 2).reduce((a, b) => a + b, 0);
    const selection = start != null ? `${fmtMinutes(start)} – ${fmtMinutes(start + duration)}` : null;
    const bayInfo = SIM_BAYS[bay];
    const weekend = [0, 6].includes(parseIso(date).getDay());

    const summary = (
        <SideCard>
            {booked ? (
                <>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-secondary px-3 py-1 text-xs font-semibold text-success-primary">
                        <CheckCircle className="size-3.5" aria-hidden="true" /> Booked
                    </span>
                    <p className="mt-3 text-md font-semibold text-primary">
                        {bayInfo.name} · {fmtDay(date)}
                    </p>
                    <p className="text-sm text-tertiary">
                        {selection} · {players} players
                    </p>
                    <div className="mt-4 flex flex-col gap-2.5">
                        <AddToCalendar fullWidth />
                        <WebButton color="outline" onPress={() => reset(() => {})}>
                            Book another bay
                        </WebButton>
                    </div>
                </>
            ) : (
                <>
                    <p className="caps text-quaternary">Your booking</p>
                    <div className="mt-3 flex flex-col gap-2.5">
                        <SummaryLine label="Date" value={fmtDay(date)} />
                        <SummaryLine label="Bay" value={`${bayInfo.name} · ${bayInfo.seating}`} />
                        <SummaryLine label="Players" value={players} />
                        <SummaryLine label="Time" value={selection ?? <span className="text-quaternary">Pick a start time</span>} />
                    </div>
                    <div className="mt-4 border-t border-secondary pt-4">
                        <SummaryLine strong label="Total" value={start != null ? money(total) : "—"} />
                        <p className="mt-1 text-xs text-tertiary">{weekend ? "Weekend rate $65 / hr" : "$45 / hr before 5 PM · $65 / hr after"} · per bay, not per player</p>
                    </div>
                    <WebButton size="lg" fullWidth className="mt-4" isDisabled={start == null} onPress={() => setStep("confirm")}>
                        Book bay
                    </WebButton>
                    <p className="mt-2.5 text-center text-xs text-tertiary">Free cancellation up to 24 hours before</p>
                </>
            )}
        </SideCard>
    );

    return (
        <WebShell active="activities">
            <WebPage className="pb-10 @desktop:pb-20">
                <PageHeader eyebrow={course.name} title="Activities" subtitle="Simulator bays, the range, lessons and more — book online." />

                {/* Simulator intro */}
                <div className="mt-7 grid grid-cols-1 overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary ring-inset @tablet:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                    <div className="relative aspect-[16/9] bg-tertiary @tablet:aspect-auto">
                        <img src={IMAGES.simLounge} alt="Simulator lounge with four bays" className="absolute inset-0 size-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center gap-4 p-6 @desktop:p-8">
                        <div>
                            <h2 className="text-display-xs font-semibold tracking-[-0.3px] text-primary">Simulator bays</h2>
                            <p className="mt-1 text-md text-tertiary">Four indoor bays, open 10 AM – 10 PM every day. Play a world course, practice on the range, or bring friends for a night out.</p>
                        </div>
                        <ul className="grid grid-cols-1 gap-2.5 text-sm text-secondary @desktop:grid-cols-2">
                            {[
                                { icon: Monitor01, t: "TrackMan launch monitor & shot tracer" },
                                { icon: Flag01, t: "200+ courses and range games" },
                                { icon: Users01, t: "Up to 8 players per bay" },
                                { icon: Stars02, t: "Food & drinks served to your bay" },
                            ].map((f) => (
                                <li key={f.t} className="flex items-center gap-2.5">
                                    <f.icon className="size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                                    {f.t}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 @desktop:grid-cols-3">
                    <div className="flex min-w-0 flex-col gap-7 @desktop:col-span-2">
                        {/* Date */}
                        <section>
                            <h3 className="text-md font-semibold text-primary">Date</h3>
                            <AriaToggleButtonGroup
                                aria-label="Date"
                                selectionMode="single"
                                disallowEmptySelection
                                selectedKeys={[date]}
                                onSelectionChange={(k) => {
                                    const [v] = k as Set<Key>;
                                    if (v != null) reset(() => setDate(String(v)));
                                }}
                                className="scrollbar-hide -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 @tablet:mx-0 @tablet:px-0"
                            >
                                {DAYS.map((d, i) => {
                                    const dt = parseIso(d);
                                    return (
                                        <AriaToggleButton
                                            key={d}
                                            id={d}
                                            className={cx(
                                                "flex w-[72px] shrink-0 cursor-pointer flex-col items-center rounded-xl bg-primary py-2.5 text-secondary ring-1 ring-secondary ring-inset transition duration-100 ease-linear hover:bg-primary_hover data-[selected]:bg-brand-solid data-[selected]:text-white data-[selected]:ring-transparent @tablet:flex-1",
                                                focusRing,
                                            )}
                                        >
                                            <span className="text-xs font-semibold uppercase">{i === 0 ? "Today" : dt.toLocaleDateString("en-US", { weekday: "short" })}</span>
                                            <span className="text-lg font-bold tabular-nums">{dt.getDate()}</span>
                                            <span className="text-xs opacity-80">{dt.toLocaleDateString("en-US", { month: "short" })}</span>
                                        </AriaToggleButton>
                                    );
                                })}
                            </AriaToggleButtonGroup>
                        </section>

                        {/* Players + duration */}
                        <section className="flex flex-col gap-5 @tablet:flex-row @tablet:items-start @tablet:gap-10">
                            <div>
                                <h3 className="text-md font-semibold text-primary">Players</h3>
                                <div className="mt-3 flex h-10 items-center">
                                    <Stepper
                                        value={players}
                                        min={1}
                                        max={8}
                                        label="Players"
                                        onChange={(n) =>
                                            reset(() => {
                                                setPlayers(n);
                                                if (SIM_BAYS[bay].capacity < n) setBay(SIM_BAYS.findIndex((b) => b.capacity >= n));
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-md font-semibold text-primary">Duration</h3>
                                <AriaToggleButtonGroup
                                    aria-label="Duration"
                                    selectionMode="single"
                                    disallowEmptySelection
                                    selectedKeys={[String(duration)]}
                                    onSelectionChange={(k) => {
                                        const [v] = k as Set<Key>;
                                        if (v != null) reset(() => setDuration(Number(v)));
                                    }}
                                    className="mt-3 flex gap-2"
                                >
                                    {DURATIONS.map((d) => (
                                        <AriaToggleButton key={d.id} id={d.id} className={segBtn}>
                                            {d.label}
                                        </AriaToggleButton>
                                    ))}
                                </AriaToggleButtonGroup>
                            </div>
                        </section>

                        {/* Bay */}
                        <section>
                            <h3 className="text-md font-semibold text-primary">Bay</h3>
                            <AriaRadioGroup
                                aria-label="Bay"
                                value={String(bay)}
                                onChange={(v) => reset(() => setBay(Number(v)))}
                                className="mt-3 grid grid-cols-2 gap-2.5 @desktop:grid-cols-4"
                            >
                                {SIM_BAYS.map((b, i) => {
                                    const tooSmall = b.capacity < players;
                                    return (
                                        <AriaRadio
                                            key={b.id}
                                            value={String(i)}
                                            isDisabled={tooSmall}
                                            className={cx(
                                                "group relative flex cursor-pointer flex-col rounded-xl bg-primary p-3.5 ring-1 ring-secondary ring-inset transition duration-100 ease-linear hover:bg-primary_hover data-[selected]:bg-brand-primary_alt data-[selected]:ring-2 data-[selected]:ring-brand disabled:cursor-not-allowed disabled:opacity-50",
                                                "data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60",
                                            )}
                                        >
                                            <span className="text-sm font-semibold text-primary">{b.name}</span>
                                            <span className="text-sm text-tertiary">{b.seating}</span>
                                            <span className={cx("mt-1 text-xs", tooSmall ? "font-medium text-warning-primary" : "text-quaternary")}>{tooSmall ? `Seats ${b.capacity} — too small` : `Seats up to ${b.capacity}`}</span>
                                            <Check className="absolute top-3 right-3 hidden size-4 text-fg-brand-primary group-data-[selected]:block" aria-hidden="true" />
                                        </AriaRadio>
                                    );
                                })}
                            </AriaRadioGroup>
                        </section>

                        {/* Times */}
                        <section>
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <h3 className="text-md font-semibold text-primary">
                                    Start time <span className="font-normal text-tertiary">· {bayInfo.name}, {fmtDay(date)}</span>
                                </h3>
                                <div className="flex items-center gap-4 text-xs text-tertiary">
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-3 rounded bg-primary ring-1 ring-secondary ring-inset" /> Open
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-3 rounded bg-brand-solid" /> Selected
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-3 rounded bg-quaternary" /> Booked
                                    </span>
                                </div>
                            </div>
                            <div role="group" aria-label="Start times" className="mt-3 grid grid-cols-3 gap-2 @tablet:grid-cols-6">
                                {SIM_SLOTS.map((m) => {
                                    const s = slotState(m);
                                    const disabled = s === "booked" || s === "short";
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            disabled={disabled}
                                            aria-pressed={s === "start"}
                                            onClick={() => setStart(start === m ? null : m)}
                                            className={cx(
                                                "flex h-14 cursor-pointer flex-col items-start justify-center rounded-lg px-3 text-left transition duration-100 ease-linear disabled:cursor-not-allowed",
                                                focusRing,
                                                s === "open" && "bg-primary ring-1 ring-secondary ring-inset hover:ring-brand",
                                                s === "start" && "bg-brand-solid text-white",
                                                s === "in-range" && "bg-brand-primary_alt ring-1 ring-brand ring-inset",
                                                s === "booked" && "bg-quaternary",
                                                s === "short" && "bg-primary opacity-50 ring-1 ring-secondary ring-inset",
                                            )}
                                        >
                                            <span className={cx("text-sm font-semibold tabular-nums", s === "start" ? "text-white" : s === "booked" ? "text-tertiary line-through" : "text-primary")}>{fmtMinutes(m)}</span>
                                            <span className={cx("flex items-center gap-1 text-xs", s === "start" ? "text-white/85" : "text-tertiary")}>
                                                {s === "booked" ? (
                                                    <>
                                                        <Lock01 className="size-3" aria-hidden="true" /> Booked
                                                    </>
                                                ) : s === "short" ? (
                                                    "Not enough time"
                                                ) : s === "start" ? (
                                                    <>
                                                        <Check className="size-3.5" aria-hidden="true" /> Start
                                                    </>
                                                ) : s === "in-range" ? (
                                                    "Included"
                                                ) : (
                                                    `$${simHourlyRate(date, m)}/hr`
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    <div>{summary}</div>
                </div>

                {/* Other activities */}
                <section className="mt-14">
                    <SectionHeading title="More to do" />
                    <div className="grid grid-cols-1 gap-5 @min-[600px]:grid-cols-2 @desktop:grid-cols-4">
                        {OTHER_ACTIVITIES.map((a) => (
                            <WebLink key={a.id} href={a.href} className={cx("group flex flex-col overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary ring-inset hover:ring-primary", focusRing)}>
                                <div className="aspect-[3/2] overflow-hidden bg-tertiary">
                                    <img src={a.image} alt="" loading="lazy" className="size-full object-cover transition duration-200 ease-out group-hover:scale-[1.03]" />
                                </div>
                                <div className="flex flex-1 flex-col p-4">
                                    <p className="text-md font-semibold text-primary">{a.title}</p>
                                    <p className="mt-1 flex-1 text-sm text-tertiary">{a.description}</p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-primary">{a.price}</span>
                                        <span className="flex items-center gap-1 text-sm font-semibold text-brand-secondary">
                                            {a.cta} <ArrowRight className="size-4" aria-hidden="true" />
                                        </span>
                                    </div>
                                </div>
                            </WebLink>
                        ))}
                    </div>
                </section>
            </WebPage>

            {!booked && (
                <MobileActionBar
                    summary={
                        <>
                            <p className="text-md font-semibold text-primary tabular-nums">{start != null ? money(total) : "Pick a time"}</p>
                            <p className="truncate text-xs text-tertiary">
                                {bayInfo.name} · {fmtDay(date)}
                                {selection ? ` · ${selection}` : ""}
                            </p>
                        </>
                    }
                    action={
                        <WebButton isDisabled={start == null} onPress={() => setStep("confirm")}>
                            Book bay
                        </WebButton>
                    }
                />
            )}

            <ConfirmDialog
                step={step}
                onStepChange={setStep}
                onConfirmed={() => setBooked(true)}
                title="Book simulator bay"
                subject={{ title: `${bayInfo.name} · ${bayInfo.seating}`, when: `${fmtDay(date)} · ${selection ?? ""}`, image: IMAGES.simLounge }}
                lines={[
                    { label: "Players", value: players },
                    { label: "Duration", value: DURATIONS.find((d) => d.id === String(duration))!.label },
                    { label: "Booked by", value: `${USER.firstName} ${USER.lastName}` },
                ]}
                total={total}
                mode="pay"
                policy="Free cancellation up to 24 hours before your start time."
                confirmLabel={`Pay ${money(total)}`}
                done={{ title: "Bay booked", body: `Check in at the Simulator Lounge 10 minutes early. Receipt sent to ${USER.email} (${PAYMENT_CARDS[0].brand} •••• ${PAYMENT_CARDS[0].last4}).` }}
            />
        </WebShell>
    );
};
