import type { FC, ReactNode } from "react";
import { Check, Star01 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "@/utils/cx";
import { courseById } from "@/data/crane";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { byDaypart, courseShortName, money0, type Slot } from "../data";

/**
 * Small pieces shared by the instructor profile and the booking flow (Crane Web, MCG org).
 * Semantic tokens only, so every chip, slot and badge reads in Warm Dark too.
 */

export const focusRing = "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";

/** Headshot, or initials on a tinted disc ("any instructor", county staff). */
export const CoachAvatar = ({
    photo,
    initials,
    name,
    size = "md",
    className,
}: {
    photo?: string | null;
    initials: string;
    name?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}) => {
    const box = {
        sm: "size-9 text-xs",
        md: "size-11 text-sm",
        lg: "size-14 text-md",
        xl: "size-20 text-lg",
    }[size];
    return photo ? (
        <img src={photo} alt={name ?? ""} className={cx("shrink-0 rounded-full bg-secondary object-cover object-top ring-1 ring-secondary", box, className)} />
    ) : (
        <span
            aria-hidden={name ? undefined : true}
            aria-label={name}
            className={cx("flex shrink-0 items-center justify-center rounded-full bg-brand-primary_alt font-semibold text-brand-secondary ring-1 ring-secondary", box, className)}
        >
            {initials}
        </span>
    );
};

/** Five stars, filled to the nearest half. */
export const StarRating = ({ rating, size = "md", className }: { rating: number; size?: "sm" | "md"; className?: string }) => (
    <span className={cx("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => {
            const fill = rating >= n ? 1 : rating >= n - 0.5 ? 0.5 : 0;
            const s = size === "sm" ? "size-3.5" : "size-4";
            return (
                <span key={n} className={cx("relative inline-flex", s)}>
                    <Star01 className={cx("absolute inset-0 text-fg-quaternary/40", s)} aria-hidden="true" />
                    {fill > 0 && (
                        <span className="absolute inset-0 overflow-hidden" style={{ width: fill === 1 ? "100%" : "50%" }}>
                            <Star01 className={cx("fill-current text-fg-warning-secondary", s)} aria-hidden="true" />
                        </span>
                    )}
                </span>
            );
        })}
    </span>
);

/** A home course as a chip: its logo tile + short name. */
export const CourseChip = ({ slug, className }: { slug: string; className?: string }) => {
    const course = courseById(slug);
    return (
        <span
            className={cx(
                "inline-flex h-9 items-center gap-2 rounded-full bg-primary py-1 pr-3.5 pl-1 text-sm font-semibold text-secondary ring-1 ring-secondary ring-inset",
                className,
            )}
        >
            <CourseLogo course={course} size={26} shape="circle" className="rounded-full" />
            {courseShortName(slug)}
        </span>
    );
};

/** Icon + muted text line ("Next opening 9:30 AM · Falls Road"). */
export const MetaLine = ({ icon: Icon, children, tone }: { icon: FC<{ className?: string }>; children: ReactNode; tone?: "warning" }) => (
    <span className={cx("flex min-w-0 items-center gap-1.5 text-sm", tone === "warning" ? "text-warning-primary" : "text-tertiary")}>
        <Icon className={cx("size-4 shrink-0", tone === "warning" ? "text-fg-warning-secondary" : "text-fg-quaternary")} aria-hidden="true" />
        <span className="min-w-0">{children}</span>
    </span>
);

/** Section heading inside a panel: title, supporting line, optional action on the right. */
export const SectionTitle = ({ title, sub, action, as: As = "h2" }: { title: ReactNode; sub?: ReactNode; action?: ReactNode; as?: "h2" | "h3" }) => (
    <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
            <As className={cx("font-semibold text-primary", As === "h2" ? "text-xl" : "text-lg")}>{title}</As>
            {sub && <p className="max-w-2xl text-sm text-tertiary">{sub}</p>}
        </div>
        {action}
    </div>
);

/* ---------- The time board ---------- */

export interface SlotButtonProps {
    slot: Slot;
    price?: number;
    selected?: boolean;
    note?: string;
    onSelect?: () => void;
}

/**
 * One time on the board. Open times are white tiles with the price; booked and unavailable times
 * stay visible (struck through, muted) so the shape of the day reads, but can't be pressed.
 */
export const SlotButton = ({ slot, price, selected, note, onSelect }: SlotButtonProps) => {
    const open = slot.status === "open";
    return (
        <AriaButton
            isDisabled={!open}
            onPress={onSelect}
            aria-pressed={open ? !!selected : undefined}
            aria-label={
                open
                    ? `${slot.label}${note ? ` with ${note}` : ""}${price !== undefined ? `, ${money0(price)}` : ""}`
                    : `${slot.label}, ${slot.status === "booked" ? "booked" : (slot.blockedReason ?? "unavailable").toLowerCase()}`
            }
            className={cx(
                "relative flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-center ring-inset transition duration-100 ease-linear",
                open
                    ? selected
                        ? "cursor-pointer bg-brand-solid text-white ring-0"
                        : "cursor-pointer bg-primary text-primary ring-1 ring-brand hover:bg-brand-primary_alt"
                    : "cursor-not-allowed bg-secondary text-quaternary ring-1 ring-secondary",
                focusRing,
            )}
        >
            <span className={cx("text-sm font-semibold tabular-nums", !open && "line-through decoration-1")}>{slot.label}</span>
            <span className={cx("text-xs tabular-nums", open ? (selected ? "text-white/85" : "text-brand-secondary") : "text-quaternary")}>
                {open ? (note ?? (price !== undefined ? money0(price) : "Open")) : slot.status === "booked" ? "Booked" : (slot.blockedReason ?? "Unavailable")}
            </span>
            {selected && (
                <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary ring-2 ring-brand">
                    <Check className="size-3 text-fg-brand-primary" aria-hidden="true" />
                </span>
            )}
        </AriaButton>
    );
};

/** A day's slots in Morning / Afternoon / Evening blocks, each with its open count. */
export const DaypartBoard = ({
    slots,
    priceFor,
    selected,
    onSelect,
    noteFor,
    columns = "wide",
}: {
    slots: Slot[];
    priceFor?: (slot: Slot) => number | undefined;
    selected?: number | null;
    onSelect?: (slot: Slot) => void;
    noteFor?: (slot: Slot) => string | undefined;
    /** `wide` = up to 7 across on desktop; `narrow` = 4 (inside a checkout column). */
    columns?: "wide" | "narrow";
}) => (
    <div className="flex flex-col gap-5">
        {byDaypart(slots).map(({ daypart, slots: ss }) => {
            const open = ss.filter((s) => s.status === "open").length;
            return (
                <section key={daypart.id} aria-label={daypart.label} className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-3">
                        <span className="caps text-quaternary">{daypart.label}</span>
                        <span className={cx("text-xs tabular-nums", open ? "text-tertiary" : "text-quaternary")}>{open ? `${open} open` : "Nothing open"}</span>
                    </div>
                    <div className={cx("grid grid-cols-3 gap-2 @tablet:grid-cols-5", columns === "wide" ? "@desktop:grid-cols-7" : "@desktop:grid-cols-5")}>
                        {ss.map((s) => (
                            <SlotButton key={s.minutes} slot={s} price={priceFor?.(s)} note={noteFor?.(s)} selected={selected === s.minutes} onSelect={() => onSelect?.(s)} />
                        ))}
                    </div>
                </section>
            );
        })}
    </div>
);

/* ---------- Step rail ---------- */

export interface RailStep {
    id: string;
    label: string;
    /** Shown instead of the label once done ("Signed in"). */
    doneLabel?: string;
}

/**
 * The booking's steps across the top: done steps are links back (check mark), the current one is
 * green, later ones muted. Collapses to "Step 2 of 5 · Details" + a bar on mobile web.
 */
export const StepRail = ({ steps, current, onStep }: { steps: RailStep[]; current: number; onStep?: (id: string) => void }) => (
    <nav aria-label="Booking steps">
        <div className="flex flex-col gap-2 @tablet:hidden">
            <p className="text-sm font-semibold text-primary">
                Step {Math.min(current + 1, steps.length)} of {steps.length}{" "}
                <span className="font-normal text-tertiary">· {steps[Math.min(current, steps.length - 1)]?.label}</span>
            </p>
            <div className="flex gap-1" aria-hidden="true">
                {steps.map((s, i) => (
                    <span key={s.id} className={cx("h-1 flex-1 rounded-full", i <= current ? "bg-brand-solid" : "bg-tertiary")} />
                ))}
            </div>
        </div>
        <ol className="hidden items-center gap-2 @tablet:flex">
            {steps.map((s, i) => {
                const done = i < current;
                const active = i === current;
                const inner = (
                    <>
                        <span
                            className={cx(
                                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                                done
                                    ? "bg-brand-solid text-white"
                                    : active
                                      ? "bg-brand-primary_alt text-brand-secondary ring-2 ring-brand ring-inset"
                                      : "bg-tertiary text-tertiary",
                            )}
                        >
                            {done ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
                        </span>
                        <span className={cx("text-sm whitespace-nowrap", active ? "font-semibold text-primary" : done ? "font-medium text-secondary" : "text-tertiary")}>
                            {done ? (s.doneLabel ?? s.label) : s.label}
                        </span>
                    </>
                );
                return (
                    <li key={s.id} className="flex min-w-0 items-center gap-2" aria-current={active ? "step" : undefined}>
                        {done && onStep ? (
                            <AriaButton onPress={() => onStep(s.id)} className={cx("flex cursor-pointer items-center gap-2 rounded-md hover:underline", focusRing)}>
                                {inner}
                            </AriaButton>
                        ) : (
                            <span className="flex items-center gap-2">{inner}</span>
                        )}
                        {i < steps.length - 1 && (
                            <span className={cx("h-px w-6 shrink-0 @desktop:w-10", done ? "bg-fg-brand-primary" : "bg-border-secondary")} aria-hidden="true" />
                        )}
                    </li>
                );
            })}
        </ol>
    </nav>
);
