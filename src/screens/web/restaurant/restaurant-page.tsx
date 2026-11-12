import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Clock, MarkerPin01, SearchLg, SearchRefraction, Star01, XCircle } from "@untitledui/icons";
import { Button as AriaButton, Input as AriaInput, SearchField as AriaSearchField } from "react-aria-components";
import { cx } from "@/utils/cx";
import { CapsTabs, Panel, SectionHeading, WebPage } from "@/components/web/web-layout";
import { matchPath, useWebRouter, WebLink } from "@/components/web/web-router";
import { productById, type ShopProduct } from "@/data/shop";
import { useCart } from "../cart-store";
import { useWebSession, WebShell } from "../web-shell";
import { MenuItemDialog } from "./menu-item-dialog";
import { PickupDialog } from "./pickup-dialog";
import {
    ALCOHOL_SLUGS,
    availability,
    BREAKFAST_SLUG,
    clock,
    DEFAULT_NOW,
    defaultPickup,
    describe,
    grillState,
    LOCATIONS,
    menuItems,
    menuSections,
    modifiersFor,
    pickupLabel,
    pickupLocation,
    readyAt,
    restaurantPath,
    sectionBySlug,
    type Day,
    type Pickup,
} from "./restaurant-data";
import { DaySwitch, focusRing, MenuItemCard, MicroLabel, MixedCartDialog, MobileOrderBar, OrderSheet, OrderSummary, useHeaderHeight, WebButton } from "./restaurant-ui";
import diningRoom from "./images/dining-room.jpg";

export interface RestaurantPageProps {
    /** Menu section to show; the router path (/restaurant/:subgroup) wins when it matches. */
    subgroup?: string;
    /** Prototype clock, minutes after midnight (default 10:20 AM). */
    now?: number;
    /** Story fixture: open this item's dialog on mount. */
    openItemId?: string;
    /** Story fixture: try to add this item on mount (shows the mixed-cart dialog over a pro shop cart). */
    mixedItemId?: string;
    /** Story fixture: open the pickup-time picker on mount. */
    pickupOpen?: boolean;
    /** Story fixture: open the mobile order sheet on mount. */
    orderSheetOpen?: boolean;
}

interface PendingAdd {
    product: ShopProduct;
    variant: string;
    qty: number;
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

const statusFor = (now: number) => {
    const s = grillState(now);
    if (s === "open") return { tone: "open" as const, text: `Open now · until ${clock(LOCATIONS.grill.close)}` };
    if (s === "before-open") return { tone: "soon" as const, text: `Opens at ${clock(LOCATIONS.grill.open)}` };
    return { tone: "closed" as const, text: `Closed · opens ${clock(LOCATIONS.grill.open)} tomorrow` };
};

/** Fox's restaurant hero: wide photo, then the venue name, label and rating, centered. */
const Hero = ({ now }: { now: number }) => {
    const { course } = useWebSession();
    const status = statusFor(now);
    return (
        <div className="flex flex-col items-center text-center">
            <div className="h-40 w-full overflow-hidden rounded-2xl bg-tertiary ring-1 ring-secondary ring-inset @tablet:h-52">
                <img src={diningRoom} alt={`${course.name} grill room`} className="size-full object-cover" />
            </div>
            <p className="caps mt-6 text-brand-secondary">{course.name}</p>
            <h1 className="mt-1 text-display-sm font-bold tracking-[-0.5px] text-primary @tablet:text-display-md">The Grill</h1>
            <div className="mt-2 flex flex-col items-center gap-x-2 gap-y-1 text-sm text-tertiary @tablet:flex-row @tablet:flex-wrap @tablet:justify-center">
                <span className="flex items-center gap-1.5 font-medium text-primary">
                    <span className={cx("size-2 rounded-full", status.tone === "open" ? "bg-fg-success-secondary" : status.tone === "soon" ? "bg-fg-warning-secondary" : "bg-fg-quaternary")} aria-hidden="true" />
                    {status.text}
                </span>
                <span aria-hidden="true" className="hidden @tablet:inline">
                    ·
                </span>
                <span>Pickup at the Grill or Turn stand</span>
                <span aria-hidden="true" className="hidden @tablet:inline">
                    ·
                </span>
                <span className="hidden items-center gap-1 @tablet:flex">
                    <Star01 className="size-3.5 fill-current text-fg-warning-secondary" aria-hidden="true" />
                    <span className="font-medium text-primary tabular-nums">4.6</span> (412)
                </span>
            </div>
        </div>
    );
};

/** Fox's party/seating bar, re-cut for ordering: day · pickup · hours. */
const SelectorBar = ({ day, onDay, pickup, onPickup, todayClosed }: { day: Day; onDay: (d: Day) => void; pickup: Pickup; onPickup: () => void; todayClosed: boolean }) => {
    const loc = pickupLocation(pickup);
    return (
        <div className="mt-8 grid divide-y divide-secondary rounded-xl bg-primary shadow-xs ring-1 ring-secondary ring-inset @tablet:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] @tablet:divide-x @tablet:divide-y-0 @desktop:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-2 p-4">
                <MicroLabel>Order for</MicroLabel>
                <DaySwitch value={day} onChange={onDay} todayClosed={todayClosed} />
            </div>
            <AriaButton onPress={onPickup} className={cx("group flex cursor-pointer items-center gap-3 p-4 text-left transition duration-100 ease-linear hover:bg-primary_hover", focusRing)}>
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                    <MicroLabel>Pickup time</MicroLabel>
                    <span className="flex items-center gap-2.5">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-primary_alt">
                            <Clock className="size-5 text-fg-brand-primary" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-md font-semibold text-primary">{pickupLabel(pickup)}</span>
                            <span className="block truncate text-sm text-tertiary">{loc.name}</span>
                        </span>
                    </span>
                </span>
                <ChevronDown className="size-5 shrink-0 text-fg-quaternary group-hover:text-fg-quaternary_hover" aria-hidden="true" />
            </AriaButton>
            <div className="hidden flex-col gap-2 p-4 @desktop:flex">
                <MicroLabel>Hours</MicroLabel>
                {Object.values(LOCATIONS).map((l) => (
                    <p key={l.id} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-medium text-secondary">{l.name}</span>
                        <span className="text-tertiary tabular-nums">
                            {clock(l.open)} – {clock(l.close)}
                        </span>
                    </p>
                ))}
            </div>
        </div>
    );
};

/** Fox "Tomorrow" variant's notice — kitchen closed (or not open yet), order ahead. */
const ClosedNotice = ({ state }: { state: "before-open" | "closed" }) => (
    <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-primary p-6 text-center ring-1 ring-secondary ring-inset @tablet:flex-row @tablet:text-left">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary ring-1 ring-secondary ring-inset">
            <Clock className="size-6 text-fg-secondary" aria-hidden="true" />
        </span>
        <div className="flex-1">
            <h2 className="text-lg font-semibold text-primary">
                {state === "closed" ? `The Grill opens at ${clock(LOCATIONS.grill.open)} — order ahead for tomorrow` : `The Grill opens at ${clock(LOCATIONS.grill.open)} — order now for pickup from ${clock(LOCATIONS.grill.open)}`}
            </h2>
            <p className="mt-1 text-sm text-tertiary">
                {state === "closed"
                    ? "The kitchen is closed for today. Place your order now and pick a time tomorrow — counter pickup or at the turn."
                    : "ASAP orders open with the kitchen. Schedule a time and it'll be hot when you arrive."}
            </p>
        </div>
    </div>
);

const MenuSearch = ({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) => (
    <AriaSearchField aria-label="Search the menu" value={value} onChange={onChange} className={cx("group", className)}>
        <div className="flex h-10 items-center gap-2 rounded-lg bg-primary px-3 ring-1 ring-primary ring-inset group-focus-within:ring-2 group-focus-within:ring-brand">
            <SearchLg className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
            <AriaInput placeholder="Search the menu" className="h-full min-w-0 flex-1 bg-transparent text-md text-primary outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden" />
            <AriaButton className="flex size-6 cursor-pointer items-center justify-center text-fg-quaternary outline-none group-data-[empty]:hidden">
                <XCircle className="size-4" aria-hidden="true" />
            </AriaButton>
        </div>
    </AriaSearchField>
);

/** Mobile web: sticky, horizontally scrolling category chips (real links, like CapsTabs). */
const CategoryChips = ({ active }: { active?: string }) => (
    <nav aria-label="Menu categories" className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4">
        {[{ slug: "", label: "Full menu" }, ...menuSections()].map((s) => {
            const on = (active ?? "") === s.slug;
            return (
                <WebLink
                    key={s.slug || "all"}
                    href={restaurantPath(s.slug || undefined)}
                    aria-current={on ? "page" : undefined}
                    className={cx(
                        "flex h-9 shrink-0 items-center rounded-full px-3.5 text-sm font-medium whitespace-nowrap ring-1 transition duration-100 ease-linear ring-inset",
                        on ? "bg-primary-solid text-white ring-transparent" : "bg-primary text-secondary ring-secondary",
                        focusRing,
                    )}
                >
                    {s.label}
                </WebLink>
            );
        })}
    </nav>
);

const sectionNote = (slug: string) => {
    if (slug === BREAKFAST_SLUG) return "Hot breakfast 7:00 – 11:00 AM";
    if (ALCOHOL_SLUGS.has(slug)) return "21+ · ID checked at pickup";
    return undefined;
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/**
 * RestaurantPage — /restaurant and /restaurant/:subgroup. Order food & drinks ahead for pickup
 * at the Grill or the Turn stand. Ports Fox's Global Nav / Restaurant (hero, selector bar,
 * Today / Tomorrow, closed-today notice) onto the Crane Web shell, with Fox MCG Grill's
 * ordering edge cases (pickup at the turn, breakfast cut-off, 21+, sold out).
 */
export const RestaurantPage = ({ subgroup: subgroupProp, now = DEFAULT_NOW, openItemId, mixedItemId, pickupOpen, orderSheetOpen }: RestaurantPageProps) => {
    const { path } = useWebRouter();
    const cart = useCart();
    const rootRef = useRef<HTMLDivElement>(null);
    const headerH = useHeaderHeight(rootRef);

    const routed = matchPath("/restaurant/:subgroup?", path);
    const subgroup = routed ? routed.subgroup : subgroupProp;
    const section = subgroup ? sectionBySlug(subgroup) : undefined;

    const state = grillState(now);
    const [day, setDayState] = useState<Day>(state === "closed" ? "tomorrow" : "today");
    const [pickup, setPickup] = useState<Pickup>(() => defaultPickup(state === "closed" ? "tomorrow" : "today", now));
    const setDay = (d: Day) => {
        setDayState(d);
        setPickup(defaultPickup(d, now));
    };
    const ready = readyAt(pickup, day, now);

    const [query, setQuery] = useState("");
    const [item, setItem] = useState<ShopProduct | null>(() => (openItemId ? (productById(openItemId) ?? null) : null));
    const [itemOpen, setItemOpen] = useState(!!openItemId);
    const [pickerOpen, setPickerOpen] = useState(!!pickupOpen);
    const [sheetOpen, setSheetOpen] = useState(!!orderSheetOpen);
    const [pending, setPending] = useState<PendingAdd | null>(null);
    const [mixedOpen, setMixedOpen] = useState(false);
    const [clearing, setClearing] = useState(false);

    const add = (product: ShopProduct, variant: string, qty: number) => {
        const r = cart.add(product, variant, qty);
        if (!r.ok) {
            setPending({ product, variant, qty });
            setMixedOpen(true);
        }
    };

    // "Clear cart and add": clear() re-renders the cart, then the pending item goes in.
    useEffect(() => {
        if (clearing && cart.kind === null && pending) {
            cart.add(pending.product, pending.variant, pending.qty);
            setPending(null);
            setClearing(false);
            setMixedOpen(false);
        }
    }, [clearing, cart, pending]);

    useEffect(() => {
        const p = mixedItemId ? productById(mixedItemId) : undefined;
        if (p) add(p, "", 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const open = (p: ShopProduct) => {
        setItem(p);
        setItemOpen(true);
    };
    const quickAdd = (p: ShopProduct) => (modifiersFor(p).length === 0 ? add(p, "", 1) : open(p));

    const inCart = useMemo(() => {
        const m = new Map<string, number>();
        if (cart.kind === "food") for (const l of cart.lines) m.set(l.product.id, (m.get(l.product.id) ?? 0) + l.qty);
        return m;
    }, [cart.kind, cart.lines]);

    const q = query.trim().toLowerCase();
    const sections = menuSections()
        .filter((s) => q || !subgroup || s.slug === subgroup)
        .map((s) => ({ section: s, items: menuItems(s.slug).filter((p) => !q || `${p.title} ${describe(p)}`.toLowerCase().includes(q)) }))
        .filter((s) => s.items.length > 0);

    const tabs = [{ href: restaurantPath(), label: "Full menu", active: !subgroup }, ...menuSections().map((s) => ({ href: restaurantPath(s.slug), label: s.label, active: s.slug === subgroup }))];

    const summaryProps = { pickup, day, readyAt: ready, onChangePickup: () => setPickerOpen(true) };

    return (
        <WebShell active="restaurant">
            <div ref={rootRef}>
                <WebPage>
                    <Hero now={now} />
                    <SelectorBar day={day} onDay={setDay} pickup={pickup} onPickup={() => setPickerOpen(true)} todayClosed={state === "closed"} />
                    {state !== "open" && <ClosedNotice state={state} />}

                    {/* Category nav: CapsTabs from tablet up; sticky chips + search on mobile web */}
                    <div className="mt-10 hidden border-b border-secondary @tablet:block">
                        <CapsTabs tabs={tabs} label="Menu categories" size="sm" className="-mb-px gap-4" />
                    </div>

                    <div className="mt-6 grid gap-8 @desktop:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="min-w-0">
                            {/* Search (tablet up) — mobile web keeps it in the sticky chip row */}
                            <MenuSearch value={query} onChange={setQuery} className="hidden @tablet:block" />
                            <div className="sticky z-20 -mx-4 flex flex-col gap-3 border-b border-secondary bg-secondary/95 px-4 py-3 backdrop-blur-sm @tablet:hidden" style={{ top: headerH }}>
                                <MenuSearch value={query} onChange={setQuery} />
                                <CategoryChips active={subgroup} />
                            </div>

                            {subgroup && !section ? (
                                <div className="mt-8 flex flex-col items-center rounded-xl bg-primary p-10 text-center ring-1 ring-secondary ring-inset">
                                    <SearchRefraction className="size-8 text-fg-quaternary" aria-hidden="true" />
                                    <p className="mt-3 text-lg font-semibold text-primary">That&rsquo;s not on the menu</p>
                                    <p className="mt-1 text-sm text-tertiary">The section “{subgroup}” doesn&rsquo;t exist at the Grill.</p>
                                    <WebLink href={restaurantPath()} className={cx("mt-4 rounded-sm text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                                        See the full menu
                                    </WebLink>
                                </div>
                            ) : sections.length === 0 ? (
                                <div className="mt-8 flex flex-col items-center rounded-xl bg-primary p-10 text-center ring-1 ring-secondary ring-inset">
                                    <SearchRefraction className="size-8 text-fg-quaternary" aria-hidden="true" />
                                    <p className="mt-3 text-lg font-semibold text-primary">No matches for “{query}”</p>
                                    <p className="mt-1 text-sm text-tertiary">Try “burger”, “fries” or “coffee”.</p>
                                    <WebButton color="outline" className="mt-4" onPress={() => setQuery("")}>
                                        Clear search
                                    </WebButton>
                                </div>
                            ) : (
                                <div className="mt-8 flex flex-col gap-10">
                                    {q && (
                                        <p className="-mb-4 text-sm text-tertiary">
                                            {sections.reduce((n, s) => n + s.items.length, 0)} results for “{query}” across the menu
                                        </p>
                                    )}
                                    {sections.map(({ section: s, items }) => (
                                        <section key={s.slug} aria-labelledby={`menu-${s.slug}`}>
                                            <SectionHeading
                                                title={<span id={`menu-${s.slug}`}>{s.label}</span>}
                                                count={items.length}
                                                action={sectionNote(s.slug) && <span className="hidden shrink-0 text-sm text-tertiary @tablet:inline">{sectionNote(s.slug)}</span>}
                                            />
                                            {sectionNote(s.slug) && <p className="-mt-3 mb-4 text-sm text-tertiary @tablet:hidden">{sectionNote(s.slug)}</p>}
                                            <div className="grid gap-3 @tablet:grid-cols-2 @tablet:gap-4 @desktop:grid-cols-1 @min-[80rem]:grid-cols-2">
                                                {items.map((p) => (
                                                    <MenuItemCard key={p.id} product={p} avail={availability(p, day, ready)} inCart={inCart.get(p.id) ?? 0} onOpen={() => open(p)} onAdd={() => quickAdd(p)} />
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Order summary rail — desktop */}
                        <aside className="hidden @desktop:block">
                            <div className="sticky" style={{ top: headerH + 24 }}>
                                <Panel
                                    title={
                                        <span className="flex items-center justify-between">
                                            Your order
                                            {cart.kind === "food" && (
                                                <span className="text-sm font-normal text-tertiary">
                                                    {cart.count} {cart.count === 1 ? "item" : "items"}
                                                </span>
                                            )}
                                        </span>
                                    }
                                    bodyClassName="p-5"
                                >
                                    <OrderSummary {...summaryProps} />
                                </Panel>
                                <p className="mt-3 flex items-start gap-1.5 px-1 text-xs text-tertiary">
                                    <MarkerPin01 className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                                    Food &amp; drinks check out separately from pro shop items.
                                </p>
                            </div>
                        </aside>
                    </div>
                </WebPage>
                <MobileOrderBar onPress={() => setSheetOpen(true)} />
            </div>

            <MenuItemDialog product={item} isOpen={itemOpen} onOpenChange={setItemOpen} onAdd={(p, v, n) => add(p, v, n)} />
            <PickupDialog isOpen={pickerOpen} onOpenChange={setPickerOpen} day={day} now={now} value={pickup} onChange={setPickup} />
            <OrderSheet
                isOpen={sheetOpen}
                onOpenChange={setSheetOpen}
                {...summaryProps}
                onChangePickup={() => {
                    setSheetOpen(false);
                    setPickerOpen(true);
                }}
            />
            <MixedCartDialog
                isOpen={mixedOpen}
                onOpenChange={(o) => {
                    setMixedOpen(o);
                    if (!o && !clearing) setPending(null);
                }}
                product={pending?.product}
                onClearAndAdd={() => {
                    cart.clear();
                    setClearing(true);
                }}
            />
        </WebShell>
    );
};
