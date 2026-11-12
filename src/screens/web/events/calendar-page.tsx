import { useState } from "react";
import { CalendarDate, ChevronLeft, ChevronRight, List } from "@untitledui/icons";
import { Button as AriaButton, ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup, type Key } from "react-aria-components";
import { cx } from "@/utils/cx";
import { useWebFrame } from "@/components/web/web-frame";
import { PageHeader, WebPage } from "@/components/web/web-layout";
import { WebLink } from "@/components/web/web-router";
import { useWebSession, WebShell } from "../web-shell";
import { CALENDAR_ITEMS, fmtLong, parseIso, TODAY_ISO, toIso, type CalendarItem, type CalendarType } from "./events-data";
import { AvailabilityBadge, focusRing, money, TYPE_UI } from "./events-ui";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FIRST = { y: 2026, m: 8 };
const LAST = { y: 2027, m: 1 };
const TYPES: CalendarType[] = ["event", "clinic", "league"];

const shortTime = (t: string) => t.split(" – ")[0].replace(/ (shotgun|tee times)$/, "");

interface Cell {
    iso: string;
    day: number;
    inMonth: boolean;
}
const monthCells = (y: number, m: number): Cell[] => {
    const first = new Date(y, m, 1);
    const start = new Date(y, m, 1 - first.getDay());
    const days = new Date(y, m + 1, 0).getDate();
    const count = Math.ceil((first.getDay() + days) / 7) * 7;
    return Array.from({ length: count }, (_, i) => {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        return { iso: toIso(d), day: d.getDate(), inMonth: d.getMonth() === m };
    });
};

export interface CalendarPageProps {
    /** Defaults to Month on desktop/laptop and List on mobile web. */
    initialView?: "list" | "month";
    initialTypes?: CalendarType[];
    /** 0-based month in 2026 (or 2027 for 0–1). Defaults to October 2026 (TODAY). */
    initialMonth?: { y: number; m: number };
}

/**
 * /calendar — ports Fox "Global Nav/Calendar" (events-calendar.stories.tsx, List View +
 * Calendar View) and folds in Fox's clinic calendar: one feed of events, clinic sessions and
 * league nights, color-coded by type with filter chips. Today is highlighted; past items are
 * muted. Mobile web opens on the list; its month grid shows dots and a day list.
 */
export const CalendarPage = ({ initialView, initialTypes = TYPES, initialMonth = { y: 2026, m: 9 } }: CalendarPageProps) => {
    const { course } = useWebSession();
    const { width } = useWebFrame();
    const isMobile = width === "mobile";
    const [view, setView] = useState<"list" | "month">(initialView ?? (isMobile ? "list" : "month"));
    const [types, setTypes] = useState<Set<CalendarType>>(new Set(initialTypes));
    const [month, setMonth] = useState(initialMonth);
    const [day, setDay] = useState<string>(TODAY_ISO);

    const atFirst = month.y === FIRST.y && month.m === FIRST.m;
    const atLast = month.y === LAST.y && month.m === LAST.m;
    const step = (dir: number) => setMonth((v) => ({ y: v.y + Math.floor((v.m + dir) / 12), m: (v.m + dir + 12) % 12 }));
    const monthLabel = new Date(month.y, month.m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const items = CALENDAR_ITEMS.filter((i) => types.has(i.type));
    const inMonth = items.filter((i) => {
        const d = parseIso(i.date);
        return d.getFullYear() === month.y && d.getMonth() === month.m;
    });
    const byDay = inMonth.reduce<Record<string, CalendarItem[]>>((acc, i) => {
        (acc[i.date] ??= []).push(i);
        return acc;
    }, {});
    const isCurrentMonth = TODAY_ISO.startsWith(`${month.y}-${String(month.m + 1).padStart(2, "0")}`);
    const listDays = Object.keys(byDay)
        .sort()
        .filter((d) => !isCurrentMonth || d >= TODAY_ISO);

    const toggleType = (t: CalendarType, on: boolean) =>
        setTypes((s) => {
            const n = new Set(s);
            if (on) n.add(t);
            else if (n.size > 1) n.delete(t);
            return n;
        });

    const navBtn = cx(
        "flex size-10 cursor-pointer items-center justify-center rounded-lg bg-primary text-fg-secondary ring-1 ring-secondary ring-inset transition duration-100 ease-linear hover:bg-primary_hover disabled:cursor-not-allowed disabled:opacity-40",
        focusRing,
    );

    return (
        <WebShell active="calendar">
            <WebPage>
                <PageHeader eyebrow={course.name} title="Calendar" subtitle="Events, clinics and league nights in one place." />

                {/* Controls */}
                <div className="mt-7 flex flex-col gap-4 @desktop:flex-row @desktop:items-center @desktop:justify-between">
                    <div className="flex items-center gap-2">
                        <AriaButton aria-label="Previous month" isDisabled={atFirst} onPress={() => step(-1)} className={navBtn}>
                            <ChevronLeft className="size-5" aria-hidden="true" />
                        </AriaButton>
                        <h2 className="min-w-44 text-center text-xl font-semibold text-primary" aria-live="polite">
                            {monthLabel}
                        </h2>
                        <AriaButton aria-label="Next month" isDisabled={atLast} onPress={() => step(1)} className={navBtn}>
                            <ChevronRight className="size-5" aria-hidden="true" />
                        </AriaButton>
                        <AriaButton
                            onPress={() => {
                                setMonth({ y: 2026, m: 9 });
                                setDay(TODAY_ISO);
                            }}
                            className={cx("ml-1 h-10 cursor-pointer rounded-lg px-3.5 text-sm font-semibold text-secondary ring-1 ring-secondary ring-inset hover:bg-primary_hover", focusRing)}
                        >
                            Today
                        </AriaButton>
                        <AriaToggleButtonGroup
                            aria-label="View"
                            selectionMode="single"
                            disallowEmptySelection
                            selectedKeys={[view]}
                            onSelectionChange={(k) => {
                                const [v] = k as Set<Key>;
                                if (v != null) setView(v as "list" | "month");
                            }}
                            className="ml-auto flex rounded-lg bg-tertiary p-1 @desktop:ml-4"
                        >
                            {[
                                { id: "list", label: "List", icon: List },
                                { id: "month", label: "Month", icon: CalendarDate },
                            ].map((v) => (
                                <AriaToggleButton
                                    key={v.id}
                                    id={v.id}
                                    aria-label={`${v.label} view`}
                                    className={cx(
                                        "flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-tertiary transition duration-100 ease-linear data-[selected]:bg-primary data-[selected]:text-primary data-[selected]:shadow-sm",
                                        focusRing,
                                    )}
                                >
                                    <v.icon className="size-4" aria-hidden="true" />
                                    <span className="hidden @tablet:inline">{v.label}</span>
                                </AriaToggleButton>
                            ))}
                        </AriaToggleButtonGroup>
                    </div>

                    <div role="group" aria-label="Show" className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 @tablet:mx-0 @tablet:px-0">
                        {TYPES.map((t) => (
                            <AriaToggleButton
                                key={t}
                                isSelected={types.has(t)}
                                onChange={(on) => toggleType(t, on)}
                                className={cx(
                                    "flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-tertiary ring-1 ring-secondary ring-inset transition duration-100 ease-linear hover:bg-primary_hover data-[selected]:text-primary data-[selected]:ring-primary",
                                    focusRing,
                                )}
                            >
                                {({ isSelected }) => (
                                    <>
                                        <span className={cx("size-2.5 rounded-full", isSelected ? TYPE_UI[t].dot : "bg-quaternary")} />
                                        {TYPE_UI[t].plural}
                                    </>
                                )}
                            </AriaToggleButton>
                        ))}
                    </div>
                </div>

                {view === "list" ? (
                    <div className="mt-7 flex flex-col gap-7">
                        {listDays.length === 0 && <p className="rounded-xl bg-primary px-5 py-10 text-center text-sm text-tertiary ring-1 ring-secondary ring-inset">Nothing scheduled in {monthLabel}.</p>}
                        {listDays.map((d) => (
                            <DayGroup key={d} iso={d} items={byDay[d]} />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="mt-6 overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset">
                            <div className="grid grid-cols-7 border-b border-secondary bg-secondary">
                                {WEEKDAYS.map((w) => (
                                    <div key={w} className="py-2.5 text-center text-xs font-semibold tracking-wide text-tertiary uppercase">
                                        {isMobile ? w[0] : w}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7">
                                {monthCells(month.y, month.m).map((c, i) => {
                                    const list = c.inMonth ? (byDay[c.iso] ?? []) : [];
                                    const isToday = c.iso === TODAY_ISO;
                                    const past = c.iso < TODAY_ISO;
                                    if (isMobile) {
                                        return (
                                            <button
                                                key={c.iso}
                                                type="button"
                                                disabled={!c.inMonth}
                                                onClick={() => setDay(c.iso)}
                                                aria-label={`${fmtLong(c.iso)}, ${list.length} items`}
                                                className={cx(
                                                    "flex h-14 flex-col items-center justify-start gap-1 border-b border-secondary pt-2 [&:nth-child(7n)]:border-r-0",
                                                    "border-r",
                                                    !c.inMonth && "bg-secondary_subtle",
                                                    focusRing,
                                                )}
                                            >
                                                <span
                                                    className={cx(
                                                        "flex size-7 items-center justify-center rounded-full text-sm tabular-nums",
                                                        !c.inMonth ? "text-quaternary" : day === c.iso ? "bg-brand-solid font-semibold text-white" : isToday ? "font-bold text-brand-secondary" : past ? "text-quaternary" : "text-secondary",
                                                    )}
                                                >
                                                    {c.day}
                                                </span>
                                                <span className="flex gap-0.5">
                                                    {[...new Set(list.map((x) => x.type))].map((t) => (
                                                        <span key={t} className={cx("size-1.5 rounded-full", TYPE_UI[t].dot)} />
                                                    ))}
                                                </span>
                                            </button>
                                        );
                                    }
                                    return (
                                        <div
                                            key={c.iso + i}
                                            className={cx("min-h-28 border-r border-b border-secondary p-1.5 [&:nth-child(7n)]:border-r-0", !c.inMonth && "bg-secondary_subtle", isToday && "bg-brand-primary_alt")}
                                        >
                                            <div className="flex items-center justify-between px-1">
                                                {isToday && <span className="caps text-[10px] text-brand-secondary">Today</span>}
                                                <span className={cx("ml-auto text-sm tabular-nums", !c.inMonth ? "text-quaternary" : isToday ? "font-bold text-brand-secondary" : past ? "text-quaternary" : "font-medium text-secondary")}>
                                                    {c.day}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex flex-col gap-1">
                                                {list.slice(0, 3).map((it) => (
                                                    <WebLink
                                                        key={it.key}
                                                        href={it.href}
                                                        className={cx(
                                                            "block rounded-md border-l-[3px] px-1.5 py-1 transition duration-100 ease-linear hover:brightness-95",
                                                            TYPE_UI[it.type].bg,
                                                            TYPE_UI[it.type].border,
                                                            past && "opacity-55",
                                                            focusRing,
                                                        )}
                                                    >
                                                        <p className="truncate text-[11px] leading-tight font-semibold text-primary">
                                                            {shortTime(it.time)} · {TYPE_UI[it.type].label}
                                                        </p>
                                                        <p className="truncate text-[11px] leading-tight text-secondary">{it.title}</p>
                                                    </WebLink>
                                                ))}
                                                {list.length > 3 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setDay(c.iso);
                                                            setView("list");
                                                        }}
                                                        className={cx("cursor-pointer rounded px-1.5 text-left text-[11px] font-semibold text-tertiary hover:text-secondary", focusRing)}
                                                    >
                                                        +{list.length - 3} more
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {isMobile && (
                            <div className="mt-6">
                                {byDay[day]?.length ? (
                                    <DayGroup iso={day} items={byDay[day]} />
                                ) : (
                                    <p className="rounded-xl bg-primary px-5 py-8 text-center text-sm text-tertiary ring-1 ring-secondary ring-inset">Nothing on {fmtLong(day)}.</p>
                                )}
                            </div>
                        )}

                        {!isMobile && (
                            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                                {TYPES.map((t) => (
                                    <span key={t} className="flex items-center gap-2 text-xs font-medium text-tertiary">
                                        <span className={cx("h-3 w-5 rounded-sm border-l-[3px]", TYPE_UI[t].bg, TYPE_UI[t].border)} />
                                        {TYPE_UI[t].plural}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </WebPage>
        </WebShell>
    );
};

const DayGroup = ({ iso, items }: { iso: string; items: CalendarItem[] }) => (
    <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-tertiary uppercase">
            {parseIso(iso).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            {iso === TODAY_ISO && <span className="rounded bg-brand-solid px-1.5 py-0.5 text-[10px] font-bold text-white">TODAY</span>}
        </h3>
        <div className="overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset">
            {items.map((it) => (
                <WebLink
                    key={it.key}
                    href={it.href}
                    className={cx(
                        "flex items-center gap-4 border-b border-l-4 border-secondary px-4 py-3.5 transition duration-100 ease-linear last:border-b-0 hover:bg-primary_hover",
                        TYPE_UI[it.type].borderL,
                        it.availability === "past" && "opacity-60",
                        focusRing,
                    )}
                >
                    <div className="w-20 shrink-0 @tablet:w-24">
                        <p className="text-sm font-semibold text-primary">{shortTime(it.time)}</p>
                        <p className={cx("text-xs font-medium", TYPE_UI[it.type].fg)}>{TYPE_UI[it.type].label}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-primary">{it.title}</p>
                        <p className="truncate text-sm text-tertiary">{it.subtitle}</p>
                    </div>
                    {it.price != null && <span className="hidden shrink-0 text-sm font-semibold text-primary tabular-nums @tablet:block">{money(it.price)}</span>}
                    {it.availability !== "open" && <AvailabilityBadge availability={it.availability} className="hidden @min-[480px]:inline-flex" />}
                </WebLink>
            ))}
        </div>
    </div>
);
