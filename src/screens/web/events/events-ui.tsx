import { useEffect, useState, type FC, type ReactNode } from "react";
import { ArrowLeft, Calendar, CalendarCheck01, Check, CheckCircle, ChevronDown, Link01, Lock01, MarkerPin01, Minus, Plus, Share07 } from "@untitledui/icons";
import {
    Button as AriaButton,
    Menu as AriaMenu,
    MenuItem as AriaMenuItem,
    MenuTrigger as AriaMenuTrigger,
    Popover as AriaPopover,
    ToggleButton as AriaToggleButton,
    type Key,
} from "react-aria-components";
import { cx, sortCx } from "@/utils/cx";
import { StatusBadge, type StatusTone } from "@/components/base/badge";
import { Button, type ButtonProps } from "@/components/base/button";
import { ProgressBar } from "@/components/base/progress-bar";
import { WebDialog } from "@/components/web/web-dialog";
import { WebLink } from "@/components/web/web-router";
import { currency, PAYMENT_CARDS } from "@/data/crane";
import { type Availability, type CalendarType, dateBadge, type ClubEvent, fmtRange, EVENT_KINDS } from "./events-data";

export const focusRing = "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";
export const money = (n: number) => (n === 0 ? "Free" : currency(n));

/* ---------- Buttons (web sizing over the shared Button) ---------- */

const webSizes = { sm: "h-9 rounded-lg px-3.5 text-sm", md: "h-11 rounded-lg px-4 text-md", lg: "h-12 rounded-lg px-5 text-md" };

export const WebButton = ({ size = "md", className, ...props }: Omit<ButtonProps, "size"> & { size?: keyof typeof webSizes }) => (
    <Button {...props} size={size === "sm" ? "sm" : "md"} className={cx(webSizes[size], className)} />
);

/* ---------- Type colors (calendar + list accents) ---------- */

export const TYPE_UI = sortCx({
    event: { label: "Event", plural: "Events", bg: "bg-utility-brand-50", fg: "text-utility-brand-700", border: "border-utility-brand-500", borderL: "border-l-utility-brand-500", dot: "bg-utility-brand-500" },
    clinic: { label: "Clinic", plural: "Clinics", bg: "bg-utility-blue-50", fg: "text-utility-blue-700", border: "border-utility-blue-500", borderL: "border-l-utility-blue-500", dot: "bg-utility-blue-500" },
    league: { label: "League", plural: "Leagues", bg: "bg-utility-purple-50", fg: "text-utility-purple-700", border: "border-utility-purple-500", borderL: "border-l-utility-purple-500", dot: "bg-utility-purple-500" },
}) satisfies Record<CalendarType, Record<string, string>>;

export const kindLabel = (k: ClubEvent["kind"]) => EVENT_KINDS.find((x) => x.id === k)?.label ?? k;

/* ---------- Status ---------- */

/** Pale status pill — Open · Few spots · Full · Waitlist · Ended. */
export const AvailabilityBadge = ({ availability, waitlist, className }: { availability: Availability; waitlist?: boolean; className?: string }) => {
    const map: Record<Availability, { tone: StatusTone; label: string }> = {
        open: { tone: "success", label: "Open" },
        few: { tone: "warning", label: "Few spots" },
        full: waitlist ? { tone: "gray", label: "Waitlist" } : { tone: "error", label: "Full" },
        past: { tone: "gray", label: "Ended" },
    };
    const s = map[availability];
    return (
        <StatusBadge tone={s.tone} className={cx("text-xs", className)}>
            {s.label}
        </StatusBadge>
    );
};

export const MembersBadge = ({ className }: { className?: string }) => (
    <StatusBadge tone="gray" className={cx("gap-1 text-xs", className)}>
        <Lock01 className="size-3" aria-hidden="true" /> Members only
    </StatusBadge>
);

/** Neutral pill for a kind / focus / format label. */
export const LabelPill = ({ children, icon: Icon, className }: { children: ReactNode; icon?: FC<{ className?: string }>; className?: string }) => (
    <span className={cx("inline-flex h-6 items-center gap-1 rounded-md bg-primary px-2 text-xs font-semibold text-secondary ring-1 ring-secondary ring-inset", className)}>
        {Icon && <Icon className="size-3.5 text-fg-quaternary" aria-hidden="true" />}
        {children}
    </span>
);

/** "18 of 72 spots left" with a filled meter. */
export const SpotsMeter = ({ capacity, spotsLeft, noun = "spots", className }: { capacity: number; spotsLeft: number; noun?: string; className?: string }) => {
    const taken = capacity - spotsLeft;
    return (
        <div className={cx("flex flex-col gap-1.5", className)}>
            <div className="flex items-center justify-between text-sm">
                <span className="text-tertiary">
                    {taken} of {capacity} {noun} taken
                </span>
                <span className={cx("font-semibold tabular-nums", spotsLeft === 0 ? "text-error-primary" : spotsLeft <= 6 ? "text-warning-primary" : "text-primary")}>
                    {spotsLeft === 0 ? "Full" : `${spotsLeft} left`}
                </span>
            </div>
            <ProgressBar value={taken} max={capacity} aria-label={`${taken} of ${capacity} ${noun} taken`} />
        </div>
    );
};

/* ---------- Filter chips ---------- */

const chip = cx(
    "flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm font-semibold whitespace-nowrap ring-1 ring-inset transition duration-100 ease-linear",
    focusRing,
);
const chipOff = "bg-primary text-secondary ring-secondary hover:bg-primary_hover";
const chipOn = "bg-primary-solid text-white ring-transparent";

/** On/off filter chip — "Charity", "Available". */
export const FilterChip = ({ isSelected, onChange, children, icon: Icon }: { isSelected: boolean; onChange: (v: boolean) => void; children: ReactNode; icon?: FC<{ className?: string }> }) => (
    <AriaToggleButton isSelected={isSelected} onChange={onChange} className={cx(chip, isSelected ? chipOn : chipOff)}>
        {Icon && <Icon className="size-4" aria-hidden="true" />}
        {children}
    </AriaToggleButton>
);

export interface MenuOption {
    id: string;
    label: string;
}

/** Chip that opens a single-select menu — "Sort by", "Price", "Type". */
export const FilterMenuChip = ({
    label,
    options,
    value,
    onChange,
    isActive,
    icon: Icon,
    menuLabel,
}: {
    label: ReactNode;
    options: MenuOption[];
    value: string;
    onChange: (id: string) => void;
    isActive?: boolean;
    icon?: FC<{ className?: string }>;
    menuLabel: string;
}) => (
    <AriaMenuTrigger>
        <AriaButton className={cx(chip, isActive ? chipOn : chipOff, "group")}>
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {label}
            <ChevronDown className="size-4 transition duration-100 ease-linear group-aria-expanded:rotate-180" aria-hidden="true" />
        </AriaButton>
        <AriaPopover placement="bottom start" offset={8} className="min-w-56 rounded-xl bg-primary p-1.5 shadow-lg ring-1 ring-secondary_alt outline-none data-[entering]:animate-in data-[entering]:fade-in">
            <AriaMenu
                aria-label={menuLabel}
                selectionMode="single"
                selectedKeys={[value]}
                onSelectionChange={(keys) => {
                    const [k] = keys as Set<Key>;
                    if (k != null) onChange(String(k));
                }}
                className="outline-none"
            >
                {options.map((o) => (
                    <AriaMenuItem
                        key={o.id}
                        id={o.id}
                        className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-secondary outline-none data-[focused]:bg-primary_hover data-[selected]:bg-active data-[selected]:font-medium data-[selected]:text-primary"
                    >
                        {o.label}
                        <Check className="size-4 shrink-0 text-fg-brand-primary opacity-0 group-data-[selected]:opacity-100" aria-hidden="true" />
                    </AriaMenuItem>
                ))}
            </AriaMenu>
        </AriaPopover>
    </AriaMenuTrigger>
);

/** Horizontal chip row — wraps on desktop, scrolls sideways on mobile web. */
export const ChipRow = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={cx("scrollbar-hide -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 @tablet:mx-0 @tablet:flex-wrap @tablet:overflow-visible @tablet:px-0", className)}>{children}</div>
);

/* ---------- Cards ---------- */

export const DateBadge = ({ iso, className }: { iso: string; className?: string }) => {
    const { month, day } = dateBadge(iso);
    return (
        <span className={cx("flex min-w-11 flex-col items-center rounded-lg bg-primary px-2.5 py-1 shadow-sm ring-1 ring-secondary ring-inset", className)}>
            <span className="text-[10px] leading-4 font-bold tracking-wide text-brand-secondary">{month}</span>
            <span className="-mt-0.5 text-lg leading-6 font-bold text-primary tabular-nums">{day}</span>
        </span>
    );
};

/** Photo-led event tile (Fox EventCard): image + date badge, organizer, title, when, where. */
export const EventCard = ({ event, availability }: { event: ClubEvent; availability: Availability }) => (
    <WebLink href={`/events/${event.id}`} className={cx("group flex flex-col rounded-2xl text-left", focusRing)}>
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-tertiary ring-1 ring-secondary ring-inset">
            <img src={event.image} alt="" loading="lazy" className="size-full object-cover transition duration-200 ease-out group-hover:scale-[1.03]" />
            <DateBadge iso={event.date} className="absolute top-3 left-3" />
            <span className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                {availability !== "open" && <AvailabilityBadge availability={availability} waitlist={!!event.waitlist} className="shadow-sm" />}
                {event.membersOnly && <MembersBadge className="shadow-sm" />}
            </span>
        </div>
        <p className="mt-3 truncate text-sm font-semibold text-brand-secondary">{event.organizer}</p>
        <p className="mt-0.5 line-clamp-2 text-md font-semibold text-primary transition duration-100 ease-linear group-hover:text-brand-secondary">{event.title}</p>
        <p className="mt-1 text-sm text-tertiary">
            {fmtRange(event.date, event.endDate)} · {event.time}
        </p>
        <p className="mt-1 flex items-center gap-1 text-sm text-tertiary">
            <MarkerPin01 className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
        </p>
        <p className="mt-2 text-sm font-semibold text-primary tabular-nums">
            {money(event.price)}
            {event.price > 0 && <span className="font-normal text-tertiary"> {event.priceUnit}</span>}
            {event.charity && <span className="ml-2 font-medium text-brand-secondary">· Charity</span>}
        </p>
    </WebLink>
);

/* ---------- Detail page parts ---------- */

export const BackLink = ({ href, children }: { href: string; children: ReactNode }) => (
    <WebLink href={href} className={cx("inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-tertiary transition duration-100 ease-linear hover:text-secondary", focusRing)}>
        <ArrowLeft className="size-4" aria-hidden="true" /> {children}
    </WebLink>
);

export const Hero = ({ src, alt = "" }: { src: string; alt?: string }) => (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-tertiary ring-1 ring-secondary ring-inset @tablet:aspect-[5/2] @tablet:rounded-3xl @desktop:aspect-[3/1]">
        <img src={src} alt={alt} className="size-full object-cover" />
    </div>
);

export const MetaInline = ({ icon: Icon, children }: { icon: FC<{ className?: string }>; children: ReactNode }) => (
    <span className="flex items-center gap-1.5">
        <Icon className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
        {children}
    </span>
);

export const InfoRow = ({ icon: Icon, label, value }: { icon: FC<{ className?: string }>; label: string; value: ReactNode }) => (
    <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
        <div>
            <p className="caps text-[11px] text-quaternary">{label}</p>
            <p className="text-sm text-secondary">{value}</p>
        </div>
    </div>
);

export const DetailSection = ({ title, children, first, action }: { title: ReactNode; children: ReactNode; first?: boolean; action?: ReactNode }) => (
    <section className={cx(!first && "border-t border-secondary pt-8")}>
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-primary">{title}</h2>
            {action}
        </div>
        <div className="mt-3">{children}</div>
    </section>
);

export const CheckList = ({ items }: { items: string[] }) => (
    <ul className="grid grid-cols-1 gap-2.5 @tablet:grid-cols-2">
        {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
                <CheckCircle className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                <span className="text-sm text-secondary">{item}</span>
            </li>
        ))}
    </ul>
);

export const InitialsAvatar = ({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) => (
    <span
        className={cx(
            "flex shrink-0 items-center justify-center rounded-full bg-brand-primary_alt font-semibold text-brand-secondary ring-1 ring-secondary ring-inset",
            { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg" }[size],
        )}
    >
        {initials}
    </span>
);

/** Quantity stepper used in the register cards. */
export const Stepper = ({ value, onChange, min = 1, max, label }: { value: number; onChange: (n: number) => void; min?: number; max: number; label: string }) => {
    const btn = cx(
        "flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary text-fg-secondary ring-1 ring-primary ring-inset transition duration-100 ease-linear hover:bg-primary_hover disabled:cursor-not-allowed disabled:opacity-50",
        focusRing,
    );
    return (
        <div role="group" aria-label={label} className="flex items-center gap-2">
            <AriaButton aria-label={`Fewer ${label.toLowerCase()}`} isDisabled={value <= min} onPress={() => onChange(value - 1)} className={btn}>
                <Minus className="size-4" aria-hidden="true" />
            </AriaButton>
            <span className="w-6 text-center text-md font-semibold text-primary tabular-nums" aria-live="polite">
                {value}
            </span>
            <AriaButton aria-label={`More ${label.toLowerCase()}`} isDisabled={value >= max} onPress={() => onChange(value + 1)} className={btn}>
                <Plus className="size-4" aria-hidden="true" />
            </AriaButton>
        </div>
    );
};

/** The sticky right-column card on desktop; inline on mobile web. */
export const SideCard = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={cx("rounded-2xl bg-primary p-5 shadow-lg ring-1 ring-secondary @desktop:sticky @desktop:top-36", className)}>{children}</div>
);

export const PriceHeadline = ({ price, unit }: { price: number; unit?: string }) => (
    <div className="flex items-baseline gap-1.5">
        <span className="text-display-xs font-semibold text-primary tabular-nums">{money(price)}</span>
        {price > 0 && unit && <span className="text-sm text-tertiary">{unit}</span>}
    </div>
);

export const SummaryLine = ({ label, value, strong }: { label: ReactNode; value: ReactNode; strong?: boolean }) => (
    <div className={cx("flex items-start justify-between gap-4 text-sm", strong && "text-md")}>
        <span className={strong ? "font-semibold text-primary" : "text-tertiary"}>{label}</span>
        <span className={cx("text-right tabular-nums", strong ? "font-semibold text-primary" : "text-secondary")}>{value}</span>
    </div>
);

/**
 * Mobile web only: a bar pinned to the bottom of the viewport with the price and the main
 * action, so Register / Book is always one tap away while reading the details.
 */
export const MobileActionBar = ({ summary, action }: { summary: ReactNode; action: ReactNode }) => (
    <div className="sticky bottom-0 z-20 border-t border-secondary bg-primary/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur @desktop:hidden">
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">{summary}</div>
            {action}
        </div>
    </div>
);

/* ---------- Add to calendar + share ---------- */

export const AddToCalendar = ({ size = "md", fullWidth }: { size?: "sm" | "md"; fullWidth?: boolean }) => {
    const [added, setAdded] = useState<string | null>(null);
    return (
        <AriaMenuTrigger>
            <AriaButton
                className={cx(
                    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-secondary ring-1 ring-primary ring-inset transition duration-100 ease-linear hover:bg-primary_hover",
                    size === "sm" ? "h-9 px-3.5 text-sm" : "h-11 px-4 text-md",
                    fullWidth && "w-full",
                    focusRing,
                )}
            >
                {added ? <CalendarCheck01 className="size-5 text-fg-success-primary" aria-hidden="true" /> : <Calendar className="size-5" aria-hidden="true" />}
                {added ? `Added to ${added}` : "Add to calendar"}
            </AriaButton>
            <AriaPopover placement="bottom" offset={8} className="min-w-52 rounded-xl bg-primary p-1.5 shadow-lg ring-1 ring-secondary_alt outline-none">
                <AriaMenu aria-label="Add to calendar" onAction={(k) => setAdded(String(k))} className="outline-none">
                    {["Google Calendar", "Apple Calendar", "Outlook"].map((c) => (
                        <AriaMenuItem key={c} id={c} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-secondary outline-none data-[focused]:bg-primary_hover">
                            {c}
                        </AriaMenuItem>
                    ))}
                </AriaMenu>
            </AriaPopover>
        </AriaMenuTrigger>
    );
};

export const ShareButton = ({ size = "md", iconOnly }: { size?: "sm" | "md"; iconOnly?: boolean }) => {
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(t);
    }, [copied]);
    return (
        <AriaButton
            aria-label={iconOnly ? (copied ? "Link copied" : "Share") : undefined}
            onPress={() => setCopied(true)}
            className={cx(
                "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-secondary ring-1 ring-primary ring-inset transition duration-100 ease-linear hover:bg-primary_hover",
                size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-md",
                iconOnly && (size === "sm" ? "w-9 px-0" : "w-11 px-0"),
                focusRing,
            )}
        >
            {copied ? <Link01 className="size-5 text-fg-success-primary" aria-hidden="true" /> : <Share07 className="size-5" aria-hidden="true" />}
            {!iconOnly && (copied ? "Link copied" : "Share")}
        </AriaButton>
    );
};

/* ---------- Confirmation dialog (register / reserve / join / book) ---------- */

export type DialogStep = "confirm" | "done";

export interface ConfirmDialogProps {
    step: DialogStep | null;
    onStepChange: (s: DialogStep | null) => void;
    /** Called when the user confirms; flips the page into its registered state. */
    onConfirmed: () => void;
    /** "Confirm registration", "Join the waitlist" … */
    title: string;
    /** Event / clinic / league / bay name and when. */
    subject: { title: string; when: string; image?: string };
    lines: { label: ReactNode; value: ReactNode }[];
    total?: number;
    /** waitlist: no charge now. free: no payment. */
    mode: "pay" | "free" | "waitlist";
    confirmLabel: string;
    done: { title: string; body: ReactNode };
    /** Hide the total + cancellation note (sub requests). */
    hideTotal?: boolean;
    /** Cancellation note under the total. */
    policy?: string;
}

export const ConfirmDialog = ({ step, onStepChange, onConfirmed, title, subject, lines, total = 0, mode, confirmLabel, done, hideTotal, policy = "Free cancellation up to 48 hours before the start time." }: ConfirmDialogProps) => {
    const card = PAYMENT_CARDS[0];
    const [busy, setBusy] = useState(false);
    const confirm = () => {
        setBusy(true);
        setTimeout(() => {
            setBusy(false);
            onConfirmed();
            onStepChange("done");
        }, 500);
    };
    const close = () => onStepChange(null);
    const isDone = step === "done";

    return (
        <WebDialog
            isOpen={step != null}
            onOpenChange={(o) => !o && close()}
            title={isDone ? done.title : title}
            description={isDone ? undefined : mode === "waitlist" ? "You won't be charged unless a spot opens and you accept it." : undefined}
            footer={
                isDone ? (
                    <WebButton onPress={close} className="w-full @tablet:w-auto">
                        Done
                    </WebButton>
                ) : (
                    <>
                        <WebButton color="outline" onPress={close}>
                            Cancel
                        </WebButton>
                        <WebButton onPress={confirm} isLoading={busy}>
                            {confirmLabel}
                        </WebButton>
                    </>
                )
            }
        >
            {isDone ? (
                <div className="flex flex-col items-center pb-2 text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-success-secondary">
                        <CheckCircle className="size-7 text-fg-success-primary" aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-md font-semibold text-primary">{subject.title}</p>
                    <p className="text-sm text-tertiary">{subject.when}</p>
                    <div className="mt-3 text-sm text-secondary">{done.body}</div>
                    <div className="mt-5 flex w-full flex-col gap-2.5 @tablet:flex-row @tablet:justify-center">
                        <AddToCalendar />
                        <ShareButton />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 rounded-xl bg-secondary p-3">
                        {subject.image && <img src={subject.image} alt="" className="size-14 shrink-0 rounded-lg object-cover" />}
                        <div className="min-w-0">
                            <p className="truncate text-md font-semibold text-primary">{subject.title}</p>
                            <p className="text-sm text-tertiary">{subject.when}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        {lines.map((l, i) => (
                            <SummaryLine key={i} label={l.label} value={l.value} />
                        ))}
                    </div>
                    {!hideTotal && <div className="border-t border-secondary pt-3">
                        <SummaryLine strong label={mode === "waitlist" ? "Due now" : "Total"} value={mode === "waitlist" ? currency(0) : money(total)} />
                    </div>}
                    {mode === "pay" && (
                        <div className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 ring-1 ring-secondary ring-inset">
                            <span className="flex items-center gap-2.5 text-sm text-secondary">
                                <span className="rounded bg-primary-solid px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">{card.brand.toUpperCase()}</span>
                                •••• {card.last4}
                            </span>
                            <span className="text-xs text-tertiary">Exp {card.exp}</span>
                        </div>
                    )}
                    {!hideTotal && <p className="text-xs text-tertiary">{policy}</p>}
                </div>
            )}
        </WebDialog>
    );
};
