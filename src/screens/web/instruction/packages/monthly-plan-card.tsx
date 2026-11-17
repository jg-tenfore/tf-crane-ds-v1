import { Calendar, RefreshCcw01 } from "@untitledui/icons";
import { StatusBadge, Tag } from "@/components/base/badge";
import { WebLink } from "@/components/web/web-router";
import { cx } from "@/utils/cx";
import { money0, serviceById, servicePrice, type LessonSubscription } from "../data";
import { packHref } from "./pack-card";
import { CoachAvatar, MetaLine, coachFor } from "./packages-ui";

/** Per-lesson price, the single-lesson rate and the monthly saving of a plan. */
export const planSaving = (plan: LessonSubscription) => {
    const service = serviceById(plan.appliesToServiceId);
    const single = service ? servicePrice(service, coachFor(plan.coachId), 1) : plan.listMonthly / plan.lessonsPerMonth;
    return { single, perLesson: Math.round(plan.monthlyPrice / plan.lessonsPerMonth), saved: plan.listMonthly - plan.monthlyPrice };
};

export interface MonthlyPlanCardProps {
    plan: LessonSubscription;
    /** Hide the instructor row (on the instructor's own page). */
    hideCoach?: boolean;
    /** Where "Start plan" goes. Defaults to the plan's detail page. */
    href?: string;
    className?: string;
}

/**
 * MonthlyPlanCard — one monthly lesson plan (Fox "Model C"): lessons a month, the monthly price,
 * the saving against booking one at a time, and the cancel / renewal-notice terms. Marked
 * "Concept" because MCG hasn't chosen between packs, a volume discount and plans.
 *
 *     <MonthlyPlanCard plan={subscriptionForCoach("mike-kenny")!} hideCoach />
 */
export const MonthlyPlanCard = ({ plan, hideCoach, href, className }: MonthlyPlanCardProps) => {
    const coach = coachFor(plan.coachId);
    const { perLesson, single, saved } = planSaving(plan);
    return (
        <WebLink
            href={href ?? packHref(plan.id)}
            aria-label={`${plan.label} with ${coach.name}, ${money0(plan.monthlyPrice)} a month`}
            className={cx(
                "group flex h-full flex-col gap-4 rounded-xl bg-primary p-5 text-left ring-1 ring-secondary outline-none transition duration-100 ease-linear ring-inset hover:ring-brand focus-visible:ring-4 focus-visible:ring-brand-300/60",
                className,
            )}
        >
            {!hideCoach && (
                <span className="flex items-start gap-3.5">
                    <CoachAvatar coach={coach} />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-md font-semibold text-primary">{coach.name}</span>
                        <span className="truncate text-sm text-tertiary">{coach.title}</span>
                    </span>
                    <Tag tone="warning" variant="soft">
                        Concept
                    </Tag>
                </span>
            )}

            <span className="flex flex-col gap-1 rounded-lg bg-secondary px-4 py-3.5">
                <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-md font-semibold text-primary">
                        <RefreshCcw01 className="size-4 text-fg-brand-primary" aria-hidden="true" />
                        {plan.label}
                    </span>
                    {hideCoach && (
                        <Tag tone="warning" variant="soft">
                            Concept
                        </Tag>
                    )}
                </span>
                <span className="text-sm text-tertiary">45-minute privates, booked whenever suits you</span>
            </span>

            <span className="flex flex-col gap-1">
                <span className="flex items-baseline gap-1.5">
                    <span className="text-xl font-semibold text-primary tabular-nums">{money0(plan.monthlyPrice)}</span>
                    <span className="text-sm text-tertiary">/ month</span>
                </span>
                <span className="text-sm text-secondary tabular-nums">
                    {money0(perLesson)} a lesson <span className="text-quaternary line-through">{money0(single)}</span>
                </span>
                <span>
                    <StatusBadge tone="success">Save {money0(saved)} a month</StatusBadge>
                </span>
            </span>

            <span className="flex flex-col gap-1">
                <MetaLine icon={RefreshCcw01}>Cancel anytime from your account</MetaLine>
                <MetaLine icon={Calendar}>Notified {plan.renewalNoticeDays} days before each renewal</MetaLine>
            </span>

            <span className="mt-auto border-t border-secondary pt-3.5 text-sm font-semibold text-brand-secondary group-hover:underline">Start monthly plan</span>
        </WebLink>
    );
};
