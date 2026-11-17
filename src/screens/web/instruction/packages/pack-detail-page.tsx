import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, Calendar, MarkerPin01, RefreshCcw01, Ticket02, Users01 } from "@untitledui/icons";
import { Tag } from "@/components/base/badge";
import { Switch } from "@/components/base/switch";
import { Panel, WebPage } from "@/components/web/web-layout";
import { WebLink } from "@/components/web/web-router";
import { cx } from "@/utils/cx";
import { ChoicePills, LinkButton } from "../../account/account-ui";
import { WebShell } from "../../web-shell";
import {
    INSTRUCTION_TODAY,
    SUBSCRIPTIONS,
    addDays,
    courseName,
    creditsHref,
    dateOfIso,
    isoOf,
    money0,
    packagesHref,
    serviceById,
    servicePrice,
    subscriptionForCoach,
    type LessonPackage,
    type LessonSubscription,
} from "../data";
import { useInstructionQuery } from "../use-instruction-query";
import { CreditsExplainer } from "./credits-explainer";
import { planSaving } from "./monthly-plan-card";
import { packHref, packSaving } from "./pack-card";
import { BackLink, plansHref } from "./packages-page";
import { CoachAvatar, CourseChip, Fact, MetaLine, MicroLabel, PolicyList, SavingNote, coachFor, useByLabel } from "./packages-ui";

/* ---------- Shared layout: main column + sticky price aside (bottom bar on mobile) ---------- */

export const DetailLayout = ({ back, main, aside, bar }: { back: ReactNode; main: ReactNode; aside: ReactNode; bar?: ReactNode }) => (
    <WebShell active="instruction">
        <WebPage width="content">
            {back}
            <div className="mt-5 grid grid-cols-1 gap-6 @desktop:grid-cols-[minmax(0,1fr)_340px]">
                <div className="flex min-w-0 flex-col gap-6">{main}</div>
                <aside className="flex flex-col gap-4 @desktop:sticky @desktop:top-[140px] @desktop:self-start">{aside}</aside>
            </div>
            {bar && <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex items-center gap-4 border-t border-secondary bg-primary px-4 pt-3 pb-4 @tablet:-mx-8 @tablet:px-8 @desktop:hidden">{bar}</div>}
        </WebPage>
    </WebShell>
);

const Card = ({ children, className }: { children: ReactNode; className?: string }) => <section className={cx("flex flex-col gap-5 rounded-xl bg-primary p-5 ring-1 ring-secondary ring-inset @tablet:p-6", className)}>{children}</section>;

const CoachHeader = ({ coachId, title, badge, subtitle }: { coachId: string; title: ReactNode; badge?: ReactNode; subtitle: ReactNode }) => {
    const coach = coachFor(coachId);
    return (
        <div className="flex items-start gap-4">
            <CoachAvatar coach={coach} size="lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-display-xs font-bold tracking-[-0.4px] text-primary">{title}</h1>
                    {badge}
                </div>
                <p className="text-md text-tertiary">{subtitle}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {coach.courseSlugs.map((slug) => (
                        <CourseChip key={slug} slug={slug} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const PriceBlock = ({ label, price, list, suffix }: { label: string; price: number; list: number; suffix?: string }) => (
    <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col">
            <MicroLabel>{label}</MicroLabel>
            <span className="text-display-sm font-bold tracking-[-0.5px] text-primary tabular-nums">
                {money0(price)}
                {suffix && <span className="text-md font-medium text-tertiary">{suffix}</span>}
            </span>
        </div>
        {list > price && <span className="pb-1.5 text-md text-quaternary line-through tabular-nums">{money0(list)}</span>}
    </div>
);

/* ---------- Pack detail ---------- */

/**
 * `/instruction/packages?pack=<id>` — a pack as a product (Fox "Package details"): what's
 * included, how it works, restrictions, the fine print as fields, and the price with its saving.
 * Assigned packs (the Thrive import) show their terms but can't be bought.
 */
export const PackDetailPage = ({ pack }: { pack: LessonPackage }) => {
    const coach = coachFor(pack.coachId);
    const service = serviceById(pack.appliesToServiceId);
    const { single, pct } = packSaving(pack);
    const assigned = pack.availability === "assigned";
    const plan = subscriptionForCoach(pack.coachId);
    const where = coach.courseSlugs.length === 1 ? courseName(coach.courseSlugs[0]) : `${coach.courseSlugs.length} MCG courses`;

    const buy = (
        <LinkButton href={packHref(pack.id, "checkout")} className="w-full">
            Buy this package
            <ArrowRight className="size-5" aria-hidden="true" />
        </LinkButton>
    );

    return (
        <DetailLayout
            back={<BackLink href={assigned ? creditsHref() : packagesHref()}>{assigned ? "My lesson credits" : "All packages"}</BackLink>}
            main={
                <>
                    <Card>
                        <CoachHeader
                            coachId={pack.coachId}
                            title={pack.label}
                            badge={assigned ? <Tag tone="gray" variant="soft">Assigned</Tag> : pack.badge && <Tag tone="brand">{pack.badge}</Tag>}
                            subtitle={
                                <>
                                    with {coach.name} · {coach.title}
                                </>
                            }
                        />
                        <div className="grid grid-cols-1 gap-3 border-t border-secondary pt-5 @tablet:grid-cols-3">
                            <Fact label="Lessons" value={pack.credits} sub={service ? `${service.durationMin}-minute privates` : undefined} />
                            {assigned ? (
                                <>
                                    <Fact label="Issued by" value="The Academy" sub="Carried over from Thrive" />
                                    <Fact label="Price" value="—" sub="Not sold online" />
                                </>
                            ) : (
                                <>
                                    <Fact label="Per lesson" value={money0(pack.perLessonPrice)} sub={`Normally ${money0(single)}`} />
                                    <Fact label="You save" value={money0(pack.savings)} sub={`${pct}% off`} />
                                </>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <PolicyList title="How it works" items={pack.howItWorks} />
                        <div className="border-t border-secondary pt-5">
                            <PolicyList title="What's included" items={pack.included} />
                        </div>
                        <div className="border-t border-secondary pt-5">
                            <PolicyList title="Restrictions" items={pack.restrictions} tone="limit" />
                        </div>
                    </Card>

                    <Card>
                        <div>
                            <h2 className="text-lg font-semibold text-primary">The fine print</h2>
                            <p className="mt-1 text-md text-tertiary">Stated before you buy, where it&rsquo;s easy to check.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 @tablet:grid-cols-3">
                            <Fact label="Expires" value={pack.expiration === "No expiration" ? "Never" : "Dec 31"} sub={pack.expiration} />
                            <Fact label="Transferable" value={pack.transferable ? "Yes" : "No"} sub={pack.transferable ? "Shareable with family" : "This golfer only"} />
                            <Fact label="Valid with" value="1 pro" sub={coach.name} />
                        </div>
                        <div className="flex items-start gap-2.5 rounded-lg bg-warning-primary px-4 py-3">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-fg-warning-primary" aria-hidden="true" />
                            <p className="text-sm text-warning-primary">
                                <span className="font-semibold">Still open for MCG:</span> what happens to a balance if the instructor leaves. Every other term above is a field the Academy sets per package.
                            </p>
                        </div>
                    </Card>

                    <CreditsExplainer />
                </>
            }
            aside={
                <Panel bodyClassName="flex flex-col gap-4 p-5">
                    {assigned ? (
                        <>
                            <MicroLabel>Assigned by the Academy</MicroLabel>
                            <p className="text-md text-tertiary">This balance was carried over from MCG&rsquo;s previous booking system. It never appears in the catalog — there&rsquo;s nothing to buy.</p>
                            <LinkButton href={creditsHref()} className="w-full">
                                See my credits
                            </LinkButton>
                        </>
                    ) : (
                        <>
                            <PriceBlock label="Package price" price={pack.price} list={pack.listPrice} />
                            <SavingNote>
                                {money0(pack.savings)} cheaper than booking {pack.credits} lessons one at a time.
                            </SavingNote>
                            <div className="hidden @desktop:block">{buy}</div>
                            <LinkButton href={plan ? packHref(plan.id) : plansHref()} color="outline" icon={RefreshCcw01} className="w-full">
                                Compare with a monthly plan
                            </LinkButton>
                        </>
                    )}
                    <div className="flex flex-col gap-2 border-t border-secondary pt-4">
                        <MetaLine icon={Calendar}>{useByLabel(pack.expiration)}</MetaLine>
                        <MetaLine icon={Users01}>{pack.transferable ? "Transferable" : "One golfer per credit"}</MetaLine>
                        <MetaLine icon={MarkerPin01}>{where}</MetaLine>
                    </div>
                </Panel>
            }
            bar={
                assigned ? undefined : (
                    <>
                        <div className="flex min-w-0 flex-1 flex-col">
                            <span className="text-xl font-bold text-primary tabular-nums">{money0(pack.price)}</span>
                            <span className="text-xs text-tertiary">{money0(pack.perLessonPrice)} per lesson</span>
                        </div>
                        <LinkButton href={packHref(pack.id, "checkout")}>Buy package</LinkButton>
                    </>
                )
            }
        />
    );
};

/* ---------- Monthly plan detail ---------- */

/** `renew=0` turns auto-renew off (default on). */
export const RENEW_PARAM = "renew";

/** The three start dates offered: next Monday-ish choices from today. */
export const planStartOptions = () => [3, 10, 17].map((n) => isoOf(addDays(INSTRUCTION_TODAY, n)));
export const dayLabel = (iso: string) => dateOfIso(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
export const longDayLabel = (iso: string) => dateOfIso(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

/** The plan selections carried in the URL (`date`, `renew`). */
export const usePlanSelection = () => {
    const { query, setQuery } = useInstructionQuery();
    const options = planStartOptions();
    const start = query.date && options.includes(query.date) ? query.date : options[0];
    const autoRenew = query.extra[RENEW_PARAM] !== "0";
    const setStart = (date: string) => setQuery({ date }, { replace: true });
    const setAutoRenew = (on: boolean) => {
        const extra = { ...query.extra };
        if (on) delete extra[RENEW_PARAM];
        else extra[RENEW_PARAM] = "0";
        setQuery({ extra }, { replace: true });
    };
    return { start, autoRenew, options, setStart, setAutoRenew, query };
};

/**
 * `/instruction/packages?pack=<plan id>` — a monthly plan (Fox "Model C — a monthly lesson plan"):
 * what you get, how billing works, a start date and auto-renew, then the same checkout as a pack.
 */
export const PlanDetailPage = ({ plan }: { plan: LessonSubscription }) => {
    const coach = coachFor(plan.coachId);
    const service = serviceById(plan.appliesToServiceId);
    const { perLesson, saved } = planSaving(plan);
    const { start, autoRenew, options, setStart, setAutoRenew } = usePlanSelection();
    const checkout = packagesHref({ pack: plan.id, step: "checkout", date: start, extra: autoRenew ? {} : { [RENEW_PARAM]: "0" } });

    return (
        <DetailLayout
            back={<BackLink href={plansHref()}>Monthly plans</BackLink>}
            main={
                <>
                    <Card>
                        <CoachHeader
                            coachId={plan.coachId}
                            title={plan.label}
                            badge={
                                <Tag tone="warning" variant="soft">
                                    Concept
                                </Tag>
                            }
                            subtitle={
                                <>
                                    with {coach.name} · {service?.name ?? "Private lesson"}
                                </>
                            }
                        />
                        <div className="grid grid-cols-1 gap-3 border-t border-secondary pt-5 @tablet:grid-cols-3">
                            <Fact label="Each month" value={plan.lessonsPerMonth} sub={service ? `${service.durationMin}-minute privates` : undefined} />
                            <Fact label="Per lesson" value={money0(perLesson)} sub={`Normally ${money0(service ? servicePrice(service, coach, 1) : perLesson)}`} />
                            <Fact label="You save" value={money0(saved)} sub="every month" />
                        </div>
                    </Card>

                    <Card>
                        <PolicyList title="What you get" items={plan.perks} />
                        <div className="border-t border-secondary pt-5">
                            <PolicyList title="How billing works" items={plan.obligations} tone="limit" />
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-lg font-semibold text-primary">Start your plan</h2>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-secondary">First billing date</span>
                            <ChoicePills label="First billing date" options={options.map((iso) => ({ id: iso, label: dayLabel(iso) }))} value={start} onChange={setStart} />
                        </div>
                        <div className="flex items-center justify-between gap-4 rounded-lg bg-secondary px-4 py-3">
                            <span className="flex flex-col">
                                <span className="text-md font-medium text-primary">Auto-renew each month</span>
                                <span className="text-sm text-tertiary">
                                    {autoRenew
                                        ? `Renews monthly. You're notified ${plan.renewalNoticeDays} days before each renewal and can cancel anytime from your account.`
                                        : "One month only. The plan ends after the first cycle and nothing further is charged."}
                                </span>
                            </span>
                            <Switch isSelected={autoRenew} onChange={setAutoRenew} aria-label="Auto-renew each month" />
                        </div>
                    </Card>

                    <Card>
                        <div>
                            <h2 className="text-lg font-semibold text-primary">What MCG carries</h2>
                            <p className="mt-1 text-md text-tertiary">Why a plan sits between a pack and a volume discount.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 @tablet:grid-cols-3">
                            <Fact label="Liability" value="$0" sub="Nothing prepaid past this cycle" />
                            <Fact label="Cash up front" value={money0(plan.monthlyPrice)} sub="Every month, not once" />
                            <Fact label="Commitment" value="Rolling" sub="Cancel anytime" />
                        </div>
                    </Card>
                </>
            }
            aside={
                <Panel bodyClassName="flex flex-col gap-4 p-5">
                    <PriceBlock label="Per month" price={plan.monthlyPrice} list={plan.listMonthly} />
                    <SavingNote>
                        {money0(saved)} a month cheaper than booking {plan.lessonsPerMonth} lessons one at a time.
                    </SavingNote>
                    <div className="hidden @desktop:block">
                        <LinkButton href={checkout} className="w-full">
                            Start {money0(plan.monthlyPrice)}/month
                        </LinkButton>
                    </div>
                    <div className="flex flex-col gap-2 border-t border-secondary pt-4">
                        <MetaLine icon={RefreshCcw01}>{autoRenew ? "Auto-renews monthly" : "Single month"}</MetaLine>
                        <MetaLine icon={Calendar}>First charge {dayLabel(start)}</MetaLine>
                        <MetaLine icon={Users01}>One golfer per lesson</MetaLine>
                    </div>
                    {SUBSCRIPTIONS.length > 1 && (
                        <div className="flex flex-col gap-2 border-t border-secondary pt-4">
                            <MicroLabel>Other plans</MicroLabel>
                            {SUBSCRIPTIONS.filter((s) => s.id !== plan.id).map((s) => (
                                <LinkButton key={s.id} href={packHref(s.id)} color="outline" className="h-auto w-full justify-between py-2.5">
                                    <span className="flex min-w-0 flex-col items-start">
                                        <span className="truncate text-sm font-semibold text-primary">{s.label}</span>
                                        <span className="text-xs font-normal text-tertiary">with {coachFor(s.coachId).name}</span>
                                    </span>
                                    <span className="text-md font-semibold text-primary tabular-nums">{money0(s.monthlyPrice)}</span>
                                </LinkButton>
                            ))}
                        </div>
                    )}
                    <WebLink href={packagesHref({ coach: plan.coachId })} className="flex items-center gap-1.5 rounded text-sm font-semibold text-brand-secondary outline-none hover:underline focus-visible:ring-4 focus-visible:ring-brand-300/60">
                        <Ticket02 className="size-4" aria-hidden="true" />
                        Prefer to pay once? See {coach.name}&rsquo;s packs
                    </WebLink>
                </Panel>
            }
            bar={
                <>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-xl font-bold text-primary tabular-nums">
                            {money0(plan.monthlyPrice)}
                            <span className="text-sm font-medium text-tertiary">/month</span>
                        </span>
                        <span className="text-xs text-tertiary">First charge {dayLabel(start)}</span>
                    </div>
                    <LinkButton href={checkout}>Start plan</LinkButton>
                </>
            }
        />
    );
};
