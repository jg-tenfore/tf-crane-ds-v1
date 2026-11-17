import type { FC, ReactNode } from "react";
import { CheckCircle } from "@untitledui/icons";
import { courseBrandFor } from "@/screens/chrome/course-brands";
import { cx } from "@/utils/cx";
import { coachById, courseShortName, type Coach } from "../data";

/**
 * Small building blocks shared by Packages & credits (and exported for the instructor profile).
 * Ported from Fox Prototype 3's `instruction-ui.tsx` pieces, restyled for Crane Web: semantic
 * tokens only, Outfit web type sizes, container breakpoints.
 */

/** Uppercase micro-label ("LESSONS REMAINING"). */
export const MicroLabel = ({ children, className }: { children: ReactNode; className?: string }) => <span className={cx("caps text-[11px] text-quaternary", className)}>{children}</span>;

/** Icon + text meta line ("Use by December 31, 2027"). */
export const MetaLine = ({ icon: Icon, children }: { icon: FC<{ className?: string }>; children: ReactNode }) => (
    <span className="flex items-center gap-1.5 text-sm text-tertiary">
        <Icon className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
        {children}
    </span>
);

/** Instructor headshot (or initials) in a circle. */
export const CoachAvatar = ({ coach, size = "md", className }: { coach: Pick<Coach, "name" | "initials" | "photo">; size?: "sm" | "md" | "lg"; className?: string }) => {
    const box = cx(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
        size === "sm" && "size-9 text-xs",
        size === "md" && "size-12 text-sm",
        size === "lg" && "size-16 text-lg @tablet:size-20 @tablet:text-xl",
        className,
    );
    if (!coach.photo)
        return (
            <span className={cx(box, "bg-brand-solid text-white")} aria-hidden="true">
                {coach.initials}
            </span>
        );
    return (
        <span className={cx(box, "bg-secondary ring-1 ring-secondary ring-inset")}>
            <img src={coach.photo} alt="" aria-hidden="true" className="size-full object-cover" loading="lazy" />
        </span>
    );
};

/** The coach for an id — packages always point at a real instructor. */
export const coachFor = (id: string): Coach => coachById(id)!;

/** A course's logo chip — how every Academy screen names an MCG course. Logos sit on white in both modes. */
export const CourseChip = ({ slug }: { slug: string }) => {
    const brand = courseBrandFor(slug);
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary py-1 pr-3 pl-1 ring-1 ring-secondary ring-inset">
            {brand ? (
                <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-secondary">
                    <img src={brand.logo} alt="" className={cx("size-full", brand.fit === "cover" ? "object-cover" : "object-contain p-[3px]")} />
                </span>
            ) : (
                <span className="size-6 shrink-0 rounded-full bg-tertiary" aria-hidden="true" />
            )}
            <span className="text-xs font-semibold text-secondary">{courseShortName(slug)}</span>
        </span>
    );
};

/** One dot per lesson credit: filled = still available. */
export const CreditDots = ({ total, remaining, size = "md", muted }: { total: number; remaining: number; size?: "sm" | "md"; muted?: boolean }) => (
    <span className="flex flex-wrap items-center gap-1.5" role="img" aria-label={`${remaining} of ${total} lesson credits remaining`}>
        {Array.from({ length: total }, (_, i) => (
            <span
                key={i}
                className={cx(
                    "shrink-0 rounded-full",
                    size === "sm" ? "size-2.5" : "size-3",
                    i < remaining ? (muted ? "bg-fg-quaternary" : "bg-fg-brand-primary") : "bg-primary ring-1 ring-primary ring-inset",
                )}
            />
        ))}
    </span>
);

/** How it works / What's included / Restrictions — policy as a list. */
export const PolicyList = ({ title, items, tone = "good" }: { title: string; items: string[]; tone?: "good" | "limit" }) => (
    <div className="flex flex-col gap-2.5">
        <MicroLabel>{title}</MicroLabel>
        <ul className="flex flex-col gap-2">
            {items.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-md text-secondary">
                    <span className={cx("mt-2 size-1.5 shrink-0 rounded-full", tone === "good" ? "bg-fg-brand-primary" : "bg-fg-warning-secondary")} aria-hidden="true" />
                    {t}
                </li>
            ))}
        </ul>
    </div>
);

/** A labelled number tile ("PER LESSON $99 · Normally $110"). */
export const Fact = ({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) => (
    <div className="flex flex-col gap-1 rounded-lg bg-secondary px-4 py-3.5">
        <MicroLabel>{label}</MicroLabel>
        <span className="text-xl font-semibold text-primary tabular-nums">{value}</span>
        {sub && <span className="text-sm text-tertiary">{sub}</span>}
    </div>
);

/** Green "you save" callout. */
export const SavingNote = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={cx("flex items-start gap-2.5 rounded-lg bg-success-primary px-4 py-3", className)}>
        <CheckCircle className="mt-0.5 size-4 shrink-0 text-fg-success-secondary" aria-hidden="true" />
        <p className="text-sm text-success-primary">{children}</p>
    </div>
);

/** One line of an order summary. */
export const SummaryLine = ({ label, value, strong, tone }: { label: ReactNode; value: ReactNode; strong?: boolean; tone?: "success" | "muted" }) => (
    <div className="flex items-start justify-between gap-4 py-1">
        <span className={cx("text-md", strong ? "font-semibold text-primary" : "text-tertiary")}>{label}</span>
        <span className={cx("shrink-0 text-right tabular-nums", strong ? "text-lg font-bold text-brand-secondary" : tone === "success" ? "text-md font-medium text-success-primary" : tone === "muted" ? "text-md text-quaternary line-through" : "text-md font-medium text-primary")}>
            {value}
        </span>
    </div>
);

/** "Use by December 31, 2027" / "No expiry". */
export const useByLabel = (expiration?: string) => (!expiration || expiration === "No expiration" ? "No expiry" : `Use by ${expiration}`);

/** "5 lessons" / "1 lesson". */
export const lessonsLabel = (n: number) => `${n} ${n === 1 ? "lesson" : "lessons"}`;
