import { Calendar, Users01 } from "@untitledui/icons";
import { StatusBadge, Tag } from "@/components/base/badge";
import { WebLink } from "@/components/web/web-router";
import { cx } from "@/utils/cx";
import { money0, packagesHref, serviceById, servicePrice, type LessonPackage } from "../data";
import { CoachAvatar, CourseChip, CreditDots, MetaLine, coachFor, useByLabel } from "./packages-ui";

/** The canonical link to a pack (or monthly plan): `/instruction/packages?pack=<id>` (+ `step`). */
export const packHref = (id: string, step?: "detail" | "checkout" | "done") => packagesHref({ pack: id, step: step === "detail" ? undefined : step });

/** What a pack saves against booking the same lessons one at a time, at this instructor's rate. */
export const packSaving = (pack: LessonPackage) => {
    const service = serviceById(pack.appliesToServiceId);
    const single = service ? servicePrice(service, coachFor(pack.coachId), 1) : pack.perLessonPrice;
    return { single, perLesson: pack.perLessonPrice, saved: Math.max(0, single * pack.credits - pack.price), pct: pack.listPrice ? Math.round((pack.savings / pack.listPrice) * 100) : 0 };
};

export interface PackCardProps {
    pack: LessonPackage;
    /**
     * `full` (default) — the catalog card: instructor, badges, credit dots, courses, terms, price.
     * `compact` — for an instructor's own page, where the instructor is already known: lessons,
     * price, per-lesson vs single rate, saving.
     */
    variant?: "full" | "compact";
    /** Where the card goes. Defaults to the pack's detail page. */
    href?: string;
    className?: string;
}

/**
 * PackCard — one lesson package, as a link to its detail page. Reusable on the instructor
 * profile (`variant="compact"`).
 *
 *     <PackCard pack={packageById("mike-kenny--pack-5")!} />
 *     {packagesForCoach("mike-kenny").map((p) => <PackCard key={p.id} pack={p} variant="compact" />)}
 */
export const PackCard = ({ pack, variant = "full", href, className }: PackCardProps) => {
    const coach = coachFor(pack.coachId);
    const service = serviceById(pack.appliesToServiceId);
    const { single, saved } = packSaving(pack);
    const link = href ?? packHref(pack.id);
    const cardCls = cx(
        "group flex h-full flex-col rounded-xl bg-primary text-left ring-1 ring-secondary outline-none transition duration-100 ease-linear ring-inset hover:ring-brand focus-visible:ring-4 focus-visible:ring-brand-300/60",
        className,
    );

    if (variant === "compact") {
        return (
            <WebLink href={link} className={cx(cardCls, "gap-2 p-4")} aria-label={`${pack.credits} lessons with ${coach.name}, ${money0(pack.price)}`}>
                <span className="flex items-start justify-between gap-2">
                    <span className="text-md font-semibold text-primary">{pack.credits} lessons</span>
                    {pack.badge && <Tag tone="brand">{pack.badge}</Tag>}
                </span>
                <CreditDots total={pack.credits} remaining={pack.credits} size="sm" />
                <span className="mt-1 text-display-xs font-semibold text-primary tabular-nums">{money0(pack.price)}</span>
                <span className="text-sm text-secondary tabular-nums">
                    {money0(pack.perLessonPrice)} a lesson <span className="text-quaternary line-through">{money0(single)}</span>
                </span>
                <span className="text-sm font-medium text-success-primary tabular-nums">Save {money0(saved)}</span>
                <span className="mt-auto pt-2 text-sm font-semibold text-brand-secondary group-hover:underline">View pack</span>
            </WebLink>
        );
    }

    return (
        <WebLink href={link} className={cx(cardCls, "gap-4 p-5")} aria-label={`${pack.label} with ${coach.name}, ${money0(pack.price)}`}>
            <span className="flex items-start gap-3.5">
                <CoachAvatar coach={coach} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-md font-semibold text-primary">{coach.name}</span>
                    <span className="truncate text-sm text-tertiary">{coach.title}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1.5">
                    {pack.badge && <Tag tone="brand">{pack.badge}</Tag>}
                    <StatusBadge tone="success">Save {money0(pack.savings)}</StatusBadge>
                </span>
            </span>

            <span className="flex flex-col gap-2 rounded-lg bg-secondary px-4 py-3.5">
                <span className="text-md font-semibold text-primary">{pack.label}</span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <CreditDots total={pack.credits} remaining={pack.credits} />
                    {service && <span className="text-xs text-tertiary">{service.durationMin}-minute privates</span>}
                </span>
            </span>

            <span className="flex flex-wrap gap-1.5">
                {coach.courseSlugs.map((slug) => (
                    <CourseChip key={slug} slug={slug} />
                ))}
            </span>

            <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <MetaLine icon={Calendar}>{useByLabel(pack.expiration)}</MetaLine>
                <MetaLine icon={Users01}>{pack.transferable ? "Transferable" : "Non-transferable"}</MetaLine>
            </span>

            <span className="mt-auto flex items-end justify-between gap-3 border-t border-secondary pt-3.5">
                <span className="flex flex-col">
                    <span className="text-xl font-semibold text-primary tabular-nums">{money0(pack.price)}</span>
                    <span className="text-xs text-tertiary tabular-nums">{money0(pack.perLessonPrice)} per lesson</span>
                </span>
                <span className="text-sm font-semibold text-brand-secondary group-hover:underline">View</span>
            </span>
        </WebLink>
    );
};
