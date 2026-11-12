import { useEffect, useId, useRef, useState, type FC, type ReactNode } from "react";
import { Announcement01, Award05, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Flag01, HelpCircle, Plus, User01, Users01, XClose } from "@untitledui/icons";
import { Button as AriaButton, ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup, type Key } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";
import { CLOSED_DAY, DAYS, currency, dateOf, initials, type WebTeeTime } from "./tee-times-data";

export const focusRing = "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";
/** Web sizing for the shared (iOS-sized) Button. */
export const webBtn = "rounded-lg text-md";
export const webBtnSm = "h-9 rounded-lg px-3.5 text-sm";

/* ---------- Selector bar (Fox "Course / Date / Players" bar) ---------- */

export interface SelectorCellProps {
    label: string;
    value: ReactNode;
    icon?: FC<{ className?: string }>;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    /** Which edge the desktop dropdown lines up with. */
    align?: "left" | "right";
    panelClassName?: string;
    className?: string;
    children: (close: () => void) => ReactNode;
}

/**
 * One cell of the selector bar — caps label over the value, opening a dropdown panel.
 * The panel is in-flow (not portalled) so it stays aligned inside the scaled WebFrame.
 * On mobile web the panel spans the whole bar.
 */
export const SelectorCell = ({ label, value, icon: Icon, isOpen, onOpenChange, align = "left", panelClassName, className, children }: SelectorCellProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const panelId = useId();
    useEffect(() => {
        if (!isOpen) return;
        const onDown = (e: PointerEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onOpenChange(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
        document.addEventListener("pointerdown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [isOpen, onOpenChange]);

    return (
        <div ref={ref} className={cx("min-w-0 @tablet:relative", className)}>
            <AriaButton
                aria-expanded={isOpen}
                aria-controls={isOpen ? panelId : undefined}
                onPress={() => onOpenChange(!isOpen)}
                className={cx(
                    "flex h-full w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition duration-100 ease-linear @tablet:px-5 @tablet:py-4",
                    isOpen ? "bg-secondary_hover" : "hover:bg-primary_hover",
                    "outline-none focus-visible:z-10 focus-visible:ring-4 focus-visible:ring-brand-300/60",
                )}
            >
                {Icon && <Icon className="hidden size-5 shrink-0 text-fg-quaternary @desktop:block" aria-hidden="true" />}
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="caps text-[11px] text-quaternary">{label}</span>
                    <span className="truncate text-md font-medium text-primary">{value}</span>
                </span>
                <ChevronDown className={cx("size-4 shrink-0 text-fg-quaternary transition duration-100 ease-linear", isOpen && "rotate-180")} aria-hidden="true" />
            </AriaButton>
            {isOpen && (
                <div
                    id={panelId}
                    role="dialog"
                    aria-label={label}
                    className={cx(
                        "absolute inset-x-0 top-full z-40 mt-2 rounded-xl bg-primary p-3 shadow-xl ring-1 ring-secondary_alt animate-in fade-in slide-in-from-top-1 duration-150",
                        "@tablet:inset-x-auto @tablet:w-72",
                        align === "left" ? "@tablet:left-0" : "@tablet:right-0",
                        panelClassName,
                    )}
                >
                    {children(() => onOpenChange(false))}
                </div>
            )}
        </div>
    );
};

/** Single-select row in a dropdown panel, with a check on the current one. */
export const MenuRow = ({ selected, onPress, label, detail, leading, isDisabled }: { selected: boolean; onPress: () => void; label: ReactNode; detail?: ReactNode; leading?: ReactNode; isDisabled?: boolean }) => (
    <AriaButton
        onPress={onPress}
        isDisabled={isDisabled}
        aria-pressed={selected}
        className={cx(
            "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-md transition duration-100 ease-linear disabled:cursor-not-allowed disabled:opacity-50",
            selected ? "bg-active font-semibold text-primary" : "text-secondary hover:bg-primary_hover",
            focusRing,
        )}
    >
        {leading}
        <span className="min-w-0 flex-1">
            <span className="block truncate">{label}</span>
            {detail && <span className="block truncate text-sm font-normal text-tertiary">{detail}</span>}
        </span>
        {selected && <Check className="size-4 shrink-0 text-fg-brand-primary" aria-hidden="true" />}
    </AriaButton>
);

/* ---------- Month calendar (Date cell) ---------- */

export const MonthCalendar = ({ value, onChange, priceFor }: { value: string; onChange: (id: string) => void; priceFor?: (id: string) => number | null }) => {
    const sel = dateOf(value);
    const [month, setMonth] = useState(() => new Date(sel.getFullYear(), sel.getMonth(), 1));
    const first = month.getDay();
    const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells = Array.from({ length: first + daysIn }, (_, i) => (i < first ? null : i - first + 1));
    const idOf = (d: number) => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const bookable = new Set(DAYS.map((d) => d.id));
    const nav = "flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-secondary hover:bg-primary_hover disabled:cursor-not-allowed disabled:opacity-40";
    const lastDay = dateOf(DAYS[DAYS.length - 1].id);
    const firstDay = dateOf(DAYS[0].id);

    return (
        <div className="w-full">
            <div className="mb-2 flex items-center justify-between px-1">
                <AriaButton aria-label="Previous month" className={cx(nav, focusRing)} isDisabled={month <= new Date(firstDay.getFullYear(), firstDay.getMonth(), 1)} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
                    <ChevronLeft className="size-4" aria-hidden="true" />
                </AriaButton>
                <span className="text-md font-semibold text-primary">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                <AriaButton aria-label="Next month" className={cx(nav, focusRing)} isDisabled={month >= new Date(lastDay.getFullYear(), lastDay.getMonth(), 1)} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
                    <ChevronRight className="size-4" aria-hidden="true" />
                </AriaButton>
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-medium text-quaternary">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <span key={i} className="py-1">
                        {d}
                    </span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((d, i) => {
                    if (d == null) return <span key={i} />;
                    const id = idOf(d);
                    const on = id === value;
                    const ok = bookable.has(id);
                    const closed = id === CLOSED_DAY;
                    const price = ok && priceFor ? priceFor(id) : null;
                    return (
                        <AriaButton
                            key={i}
                            isDisabled={!ok}
                            onPress={() => onChange(id)}
                            aria-label={`${dateOf(id).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}${closed ? ", closed" : ""}`}
                            className={cx(
                                "mx-auto flex h-11 w-full max-w-11 cursor-pointer flex-col items-center justify-center rounded-lg text-sm tabular-nums transition duration-100 ease-linear disabled:cursor-default disabled:opacity-40",
                                on ? "bg-brand-solid font-semibold text-white" : "text-primary hover:bg-primary_hover",
                                focusRing,
                            )}
                        >
                            <span className={cx(closed && !on && "text-quaternary line-through")}>{d}</span>
                            {ok && <span className={cx("text-[9px] leading-none", on ? "text-white/80" : closed ? "text-quaternary" : "text-brand-secondary")}>{closed ? "Closed" : price != null ? `$${price}` : "Full"}</span>}
                        </AriaButton>
                    );
                })}
            </div>
        </div>
    );
};

/* ---------- Date strip ---------- */

/** Web date strip — the app's day picker with a "from $" line, in web type. */
export const WebDateStrip = ({ value, onChange, priceFor }: { value: string; onChange: (id: string) => void; priceFor: (id: string) => number | null }) => (
    <AriaToggleButtonGroup
        aria-label="Choose a date"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[value]}
        onSelectionChange={(keys: Set<Key>) => {
            const [k] = keys;
            if (k != null) onChange(String(k));
        }}
        className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 py-1 @tablet:mx-0 @tablet:px-0"
    >
        {DAYS.map((d, i) => {
            const price = priceFor(d.id);
            const closed = d.id === CLOSED_DAY;
            return (
                <AriaToggleButton
                    key={d.id}
                    id={d.id}
                    className={cx(
                        "group flex h-[68px] w-[76px] shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl bg-primary ring-1 ring-secondary transition duration-100 ease-linear ring-inset hover:ring-primary",
                        "data-[selected]:bg-brand-solid data-[selected]:ring-0",
                        focusRing,
                    )}
                >
                    <span className="text-xs text-tertiary group-data-[selected]:text-white/80">{i === 0 ? "Today" : d.weekday}</span>
                    <span className="text-md font-semibold text-primary group-data-[selected]:text-white">{d.label}</span>
                    <span className={cx("text-[11px] leading-none group-data-[selected]:text-white/85", closed || price == null ? "text-quaternary" : "text-brand-secondary")}>
                        {closed ? "Closed" : price == null ? "Full" : `from $${price}`}
                    </span>
                </AriaToggleButton>
            );
        })}
    </AriaToggleButtonGroup>
);

/* ---------- Filter chips ---------- */

export const ChipGroup = <T extends string>({ label, options, value, onChange, className }: { label: string; options: { id: T; label: ReactNode }[]; value: T; onChange: (id: T) => void; className?: string }) => (
    <AriaToggleButtonGroup
        aria-label={label}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[value]}
        onSelectionChange={(keys: Set<Key>) => {
            const [k] = keys;
            if (k != null) onChange(String(k) as T);
        }}
        className={cx("scrollbar-hide flex gap-2 overflow-x-auto", className)}
    >
        {options.map((o) => (
            <AriaToggleButton
                key={o.id}
                id={o.id}
                className={cx(
                    "flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3.5 text-sm font-medium whitespace-nowrap text-secondary ring-1 ring-secondary transition duration-100 ease-linear ring-inset hover:bg-primary_hover",
                    "data-[selected]:bg-brand-primary_alt data-[selected]:text-brand-secondary data-[selected]:ring-brand",
                    focusRing,
                )}
            >
                {o.label}
            </AriaToggleButton>
        ))}
    </AriaToggleButtonGroup>
);

/* ---------- Tee time tile ---------- */

const TeeGlyph = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M12 3v14M12 3l6 3-6 3" />
        <path d="M7 21c0-2 2.2-3.5 5-3.5s5 1.5 5 3.5" />
    </svg>
);

export interface TeeTimeTileProps {
    teeTime: WebTeeTime;
    dayLabel: string;
    /** Multi-course clubs show a split "18 HOLES | Lakes → Woods" footer on every tile (Fox Kettle Hills option D). */
    multiCourse?: boolean;
    onPress?: (t: WebTeeTime) => void;
}

/**
 * A tee time — Fox's TeeCell (big time · holes · players · price + day type · optional
 * "BACK 9" footer) merged with the app's card states: FULL tag, "1 spot left".
 * Mobile web is the app's one-line-per-time list; tablet+ is the Fox grid tile.
 */
export const TeeTimeTile = ({ teeTime: t, dayLabel, multiCourse, onPress }: TeeTimeTileProps) => {
    const full = t.spots === 0;
    const few = !full && t.spots <= 2;
    const players = t.spots <= 1 ? "1" : `1–${t.spots}`;
    const footer = multiCourse ? (
        <div className="flex text-[11px] font-semibold tracking-[1px] uppercase">
            <span className={cx("px-3.5 py-1 text-white", full ? "bg-quaternary" : "bg-brand-solid")}>{t.holes} holes</span>
            <span className="flex-1 truncate bg-secondary px-3.5 py-1 text-secondary normal-case tracking-normal">{t.course}</span>
        </div>
    ) : t.holes === 9 && t.course ? (
        <div className={cx("px-3.5 py-1 text-[11px] font-semibold tracking-[1px] text-white uppercase", full ? "bg-quaternary" : "bg-brand-solid")}>{t.course}</div>
    ) : null;

    const label = `${t.time}, ${t.holes} holes${t.course ? `, ${t.course}` : ""}, ${full ? "full" : `${t.spots} ${t.spots === 1 ? "spot" : "spots"} open, ${currency(t.price)} per player`}`;

    const body = (
        <>
            <div className="flex flex-1 items-center gap-3 px-4 py-3 @tablet:flex-col @tablet:items-stretch @tablet:gap-2 @tablet:px-3.5">
                <div className="flex min-w-0 flex-1 flex-col gap-1 @tablet:gap-2">
                    <div className="flex items-center gap-2">
                        <span className={cx("text-lg font-semibold tabular-nums", full ? "text-quaternary" : "text-primary")}>{t.time}</span>
                        {full && <TagText tone="error">Full</TagText>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-tertiary tabular-nums">
                        <span className="flex items-center gap-1">
                            <TeeGlyph className="size-3.5 text-fg-quaternary" />
                            {t.holes} holes
                        </span>
                        {!full && (
                            <span className="flex items-center gap-1">
                                <Users01 className="size-3.5 text-fg-quaternary" aria-hidden="true" />
                                {players}
                            </span>
                        )}
                        {few && <span className="font-medium text-warning-primary">{t.spots === 1 ? "1 spot left" : "2 spots left"}</span>}
                    </div>
                </div>
                <p className="shrink-0 text-right text-sm text-tertiary @tablet:mt-auto @tablet:text-left">
                    <span className={cx("block text-md font-semibold tabular-nums @tablet:inline", full ? "text-quaternary" : "text-primary")}>{currency(t.price)}</span>{" "}
                    <span className="hidden @tablet:inline">{dayLabel}</span>
                </p>
                {!full && <ChevronRight className="size-5 shrink-0 text-fg-quaternary @tablet:hidden" aria-hidden="true" />}
            </div>
            {footer}
        </>
    );

    if (full) {
        return (
            <div aria-label={label} className="flex flex-col overflow-hidden rounded-xl bg-primary/60 opacity-70 ring-1 ring-secondary ring-inset">
                {body}
            </div>
        );
    }
    return (
        <AriaButton
            aria-label={label}
            onPress={() => onPress?.(t)}
            className={cx("group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-primary text-left ring-1 ring-secondary transition duration-100 ease-linear ring-inset hover:shadow-md hover:ring-brand data-[pressed]:scale-[0.99]", focusRing)}
        >
            {body}
        </AriaButton>
    );
};

const TagText = ({ children, tone }: { children: ReactNode; tone: "error" | "brand" }) => (
    <span className={cx("inline-flex h-[18px] items-center rounded px-1.5 text-[10px] leading-none font-bold tracking-[1px] uppercase", tone === "error" ? "bg-error-primary text-error-primary" : "bg-brand-primary_alt text-brand-secondary")}>
        {children}
    </span>
);

/* ---------- Banners (Fox "Dismissible Banner" + membership ads) ---------- */

export const DismissibleBanner = ({ icon: Icon, children, cta, tone = "brand", onCta }: { icon: FC<{ className?: string }>; children: ReactNode; cta?: string; tone?: "brand" | "subtle"; onCta?: () => void }) => {
    const [show, setShow] = useState(true);
    if (!show) return null;
    const brand = tone === "brand";
    return (
        <div role="region" aria-label="Announcement" className={cx("flex items-center gap-3 rounded-xl px-4 py-3 @tablet:px-5", brand ? "bg-brand-solid text-white" : "bg-brand-primary_alt text-brand-secondary ring-1 ring-brand ring-inset")}>
            <span className={cx("hidden size-8 shrink-0 items-center justify-center rounded-lg @tablet:flex", brand ? "bg-white/15" : "bg-primary")}>
                <Icon className="size-4.5" aria-hidden="true" />
            </span>
            <p className="flex-1 text-sm">{children}</p>
            {cta && (
                <AriaButton
                    onPress={onCta}
                    className={cx(
                        "hidden shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold transition duration-100 ease-linear @tablet:block",
                        brand ? "bg-white text-brand-secondary hover:bg-white/90" : "bg-brand-solid text-white hover:bg-brand-solid_hover",
                        focusRing,
                    )}
                >
                    {cta}
                </AriaButton>
            )}
            <AriaButton
                aria-label="Dismiss"
                onPress={() => setShow(false)}
                className={cx("flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition duration-100 ease-linear", brand ? "text-white/80 hover:bg-white/15 hover:text-white" : "hover:bg-primary", focusRing)}
            >
                <XClose className="size-5" aria-hidden="true" />
            </AriaButton>
        </div>
    );
};

export const CourseAnnouncement = ({ dateLabel }: { dateLabel: string }) => (
    <DismissibleBanner icon={Announcement01} cta="View rates">
        <span className="font-semibold">Fall aerification · {dateLabel}.</span> Greens maintenance closes the course for the day — enjoy reduced rates all week.
    </DismissibleBanner>
);

export const MembershipAd = () => (
    <DismissibleBanner icon={Award05} tone="subtle" cta="View plans">
        <span className="font-semibold">Play unlimited golf.</span> Become an annual member and skip the green fees.
    </DismissibleBanner>
);

/* ---------- Players ---------- */

export const PlayerAvatar = ({ number, name, size = "md" }: { number?: number; name?: string; size?: "sm" | "md" }) => (
    <span className="relative shrink-0">
        <span className={cx("flex items-center justify-center rounded-full bg-tertiary font-semibold text-secondary", size === "md" ? "size-10 text-sm" : "size-8 text-xs")}>
            {name ? initials(name) : <User01 className="size-5 text-fg-quaternary" aria-hidden="true" />}
        </span>
        {number != null && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-brand-solid text-[10px] font-semibold text-white ring-2 ring-bg-primary">{number}</span>
        )}
    </span>
);

export const YouTag = () => <span className="rounded-full bg-tertiary px-2 py-0.5 text-[11px] font-medium text-secondary">You</span>;

/* ---------- Common questions ---------- */

export const FAQ_ITEMS = [
    { q: "How far in advance can I book a tee time?", a: "Tee times open 14 days ahead online. Booking early gives you the best choice of prime morning and discounted twilight times." },
    { q: "What happens if my group has fewer than four players?", a: "Tee times are built for foursomes, so smaller groups may be paired with other golfers. You only pay for the players in your own booking." },
    { q: "Can I add players to my reservation here?", a: "Yes. Choose the number of players above, then add a golf buddy or a guest to each seat. Your summary updates instantly." },
    { q: "Do I pay now?", a: "No — green fees are paid at the course when you check in. We keep a card on file only to cover no-show fees, should they apply." },
    { q: "What is the cancellation and no-show policy?", a: "Changes and cancellations need at least 24 hours' notice. Showing up with fewer players than reserved may add a per-player no-show fee." },
];

export const FaqAccordion = ({ id }: { id?: string }) => {
    const [open, setOpen] = useState<number | null>(0);
    const base = useId();
    return (
        <section id={id} className="scroll-mt-40 rounded-xl bg-primary px-5 py-5 ring-1 ring-secondary ring-inset @tablet:px-7 @tablet:py-6">
            <div className="mb-4 flex items-center gap-2">
                <HelpCircle className="size-5 text-fg-brand-primary" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-primary">Common questions</h2>
            </div>
            <div className="flex flex-col divide-y divide-secondary">
                {FAQ_ITEMS.map((item, i) => {
                    const isOpen = open === i;
                    return (
                        <div key={item.q} className="py-3.5 first:pt-0 last:pb-0">
                            <AriaButton
                                onPress={() => setOpen(isOpen ? null : i)}
                                aria-expanded={isOpen}
                                aria-controls={`${base}-${i}`}
                                className={cx("flex w-full cursor-pointer items-start justify-between gap-4 rounded text-left", focusRing)}
                            >
                                <span className="text-md font-medium text-primary">{item.q}</span>
                                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-fg-quaternary ring-1 ring-secondary ring-inset">
                                    <Plus className={cx("size-4 transition-transform duration-200 ease-out", isOpen && "rotate-45")} aria-hidden="true" />
                                </span>
                            </AriaButton>
                            <div id={`${base}-${i}`} className={cx("grid transition-all duration-300 ease-out", isOpen ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                                <div className="overflow-hidden">
                                    <p className="pr-10 text-sm leading-relaxed text-tertiary">{item.a}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

/* ---------- Hold timer ---------- */

export const useHoldTimer = (initialSeconds: number) => {
    const [left, setLeft] = useState(initialSeconds);
    useEffect(() => {
        if (left <= 0) return;
        const t = setInterval(() => setLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
        return () => clearInterval(t);
    }, [left <= 0]); // eslint-disable-line react-hooks/exhaustive-deps
    const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
    return { left, mmss, expired: left <= 0, restart: () => setLeft(initialSeconds) };
};

/** Fox's "Time left to book" card. Turns amber in the last minute and red when the hold lapses. */
export const HoldTimerCard = ({ left, mmss, onFindAnother }: { left: number; mmss: string; onFindAnother: () => void }) => {
    if (left <= 0) {
        return (
            <div role="alert" className="rounded-xl bg-error-primary px-5 py-4 ring-1 ring-error_subtle ring-inset">
                <span className="flex items-center gap-2 text-md font-semibold text-error-primary">
                    <Clock className="size-4" aria-hidden="true" /> Your hold has expired
                </span>
                <p className="mt-1.5 text-sm leading-relaxed text-tertiary">This tee time went back on the live tee sheet. It may still be open — or pick another time.</p>
                <Button size="md" color="destructive" fullWidth iconLeading={Flag01} onPress={onFindAnother} className={cx("mt-3", webBtn)}>
                    Find another time
                </Button>
            </div>
        );
    }
    const low = left < 60;
    return (
        <div aria-live={low ? "polite" : "off"} className={cx("rounded-xl px-5 py-4 ring-1 ring-inset", low ? "bg-warning-primary ring-fg-warning-secondary/40" : "bg-brand-primary_alt ring-brand")}>
            <div className="flex items-center justify-between gap-3">
                <span className={cx("flex items-center gap-2 text-md font-semibold", low ? "text-warning-primary" : "text-brand-secondary")}>
                    <Clock className="size-4" aria-hidden="true" /> Time left to book
                </span>
                <span className={cx("text-xl font-semibold tabular-nums", low ? "text-warning-primary" : "text-brand-secondary")} role="timer">
                    {mmss}
                </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-tertiary">
                This tee time is held for you while you check out. If you leave before reserving, it goes back on the tee sheet for other golfers.
            </p>
        </div>
    );
};

/* ---------- Summary rows ---------- */

export const Row = ({ label, value, muted, className }: { label: ReactNode; value: ReactNode; muted?: boolean; className?: string }) => (
    <div className={cx("flex items-start justify-between gap-4 text-md", className)}>
        <span className={cx("min-w-0", muted ? "text-tertiary" : "text-secondary")}>{label}</span>
        <span className={cx("shrink-0 tabular-nums", muted ? "text-tertiary" : "text-primary")}>{value}</span>
    </div>
);

export const Detail = ({ icon: Icon, children }: { icon: FC<{ className?: string }>; children: ReactNode }) => (
    <span className="flex min-w-0 items-center gap-1.5 text-sm text-secondary">
        <Icon className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
        <span className="truncate">{children}</span>
    </span>
);
