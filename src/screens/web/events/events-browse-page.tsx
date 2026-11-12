import { useState } from "react";
import { CalendarDate, FilterLines, HeartHand } from "@untitledui/icons";
import { PageHeader, WebPage } from "@/components/web/web-layout";
import { WebLink } from "@/components/web/web-router";
import { WebShell, useWebSession } from "../web-shell";
import { availability, EVENT_KINDS, EVENTS, isPast, type EventKind } from "./events-data";
import { ChipRow, EventCard, FilterChip, FilterMenuChip, focusRing, WebButton } from "./events-ui";
import { cx } from "@/utils/cx";

type SortKey = "date" | "price-asc" | "price-desc" | "spots";
const SORTS = [
    { id: "date", label: "Date: soonest" },
    { id: "price-asc", label: "Price: low to high" },
    { id: "price-desc", label: "Price: high to low" },
    { id: "spots", label: "Most spots left" },
];

type PriceKey = "any" | "free" | "u50" | "50-100" | "100p";
const PRICES: { id: PriceKey; label: string; test: (n: number) => boolean }[] = [
    { id: "any", label: "Any price", test: () => true },
    { id: "free", label: "Free", test: (n) => n === 0 },
    { id: "u50", label: "Under $50", test: (n) => n > 0 && n < 50 },
    { id: "50-100", label: "$50 – $100", test: (n) => n >= 50 && n <= 100 },
    { id: "100p", label: "Over $100", test: (n) => n > 100 },
];

export interface EventsBrowsePageProps {
    /** Story hooks: start with a filter applied. */
    initialCharity?: boolean;
    initialAvailable?: boolean;
    initialKind?: EventKind | "all";
}

/**
 * /events — "Events at Sagamore". Ports Fox "Global Nav/Events/Browse Events": filter chips
 * (Type · Sort · Charity · Price · Available), a result count, and a 4-column photo grid.
 * Past events drop off; full events stay visible with a Waitlist badge.
 */
export const EventsBrowsePage = ({ initialCharity = false, initialAvailable = false, initialKind = "all" }: EventsBrowsePageProps) => {
    const { course } = useWebSession();
    const [kind, setKind] = useState<EventKind | "all">(initialKind);
    const [sort, setSort] = useState<SortKey>("date");
    const [charity, setCharity] = useState(initialCharity);
    const [available, setAvailable] = useState(initialAvailable);
    const [price, setPrice] = useState<PriceKey>("any");

    let list = EVENTS.filter((e) => !isPast(e.endDate ?? e.date));
    if (kind !== "all") list = list.filter((e) => e.kind === kind);
    if (charity) list = list.filter((e) => e.charity);
    if (available) list = list.filter((e) => e.spotsLeft > 0);
    list = list.filter((e) => PRICES.find((p) => p.id === price)!.test(e.price));
    list = [...list].sort((a, b) =>
        sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "spots" ? b.spotsLeft - a.spotsLeft : a.date.localeCompare(b.date),
    );
    const anyFilter = kind !== "all" || charity || available || price !== "any";
    const clear = () => {
        setKind("all");
        setCharity(false);
        setAvailable(false);
        setPrice("any");
    };

    return (
        <WebShell active="events">
            <WebPage>
                <PageHeader
                    eyebrow={course.name}
                    title="Events"
                    subtitle="Scrambles, tournaments, charity outings and social nights. Reserve your spot."
                    actions={
                        <WebLink href="/calendar" className={cx("hidden items-center gap-2 rounded-lg text-sm font-semibold text-brand-secondary @tablet:flex", focusRing)}>
                            <CalendarDate className="size-5" aria-hidden="true" /> View calendar
                        </WebLink>
                    }
                />

                <ChipRow className="mt-7">
                    <FilterMenuChip
                        menuLabel="Event type"
                        icon={FilterLines}
                        label={kind === "all" ? "All types" : EVENT_KINDS.find((k) => k.id === kind)!.label}
                        isActive={kind !== "all"}
                        options={[{ id: "all", label: "All types" }, ...EVENT_KINDS]}
                        value={kind}
                        onChange={(v) => setKind(v as EventKind | "all")}
                    />
                    <FilterMenuChip menuLabel="Sort by" label="Sort by" options={SORTS} value={sort} onChange={(v) => setSort(v as SortKey)} />
                    <FilterChip isSelected={charity} onChange={setCharity} icon={HeartHand}>
                        Charity
                    </FilterChip>
                    <FilterMenuChip
                        menuLabel="Price"
                        label={price === "any" ? "Price" : PRICES.find((p) => p.id === price)!.label}
                        isActive={price !== "any"}
                        options={PRICES}
                        value={price}
                        onChange={(v) => setPrice(v as PriceKey)}
                    />
                    <FilterChip isSelected={available} onChange={setAvailable}>
                        Available
                    </FilterChip>
                </ChipRow>

                <div className="mt-4 flex items-center gap-3 text-sm text-tertiary">
                    <span aria-live="polite">
                        {list.length} {list.length === 1 ? "event" : "events"}
                    </span>
                    {anyFilter && (
                        <button type="button" onClick={clear} className={cx("cursor-pointer rounded font-semibold text-brand-secondary", focusRing)}>
                            Clear filters
                        </button>
                    )}
                </div>

                {list.length > 0 ? (
                    <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-9 @min-[600px]:grid-cols-2 @desktop:grid-cols-3 @min-[1200px]:grid-cols-4">
                        {list.map((e) => (
                            <EventCard key={e.id} event={e} availability={availability(e)} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-10 flex flex-col items-center gap-2 rounded-2xl bg-primary px-6 py-14 text-center ring-1 ring-secondary ring-inset">
                        <p className="text-md font-semibold text-primary">No events match your filters</p>
                        <p className="text-sm text-tertiary">Try clearing a filter to see more.</p>
                        <WebButton size="sm" color="outline" onPress={clear} className="mt-3">
                            Clear filters
                        </WebButton>
                    </div>
                )}
            </WebPage>
        </WebShell>
    );
};
