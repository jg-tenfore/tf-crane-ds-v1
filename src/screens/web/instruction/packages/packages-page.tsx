import type { ReactNode } from "react";
import { ArrowLeft, InfoCircle, RefreshCcw01, Ticket02 } from "@untitledui/icons";
import { Tag } from "@/components/base/badge";
import { PageHeader, WebPage } from "@/components/web/web-layout";
import { WebLink } from "@/components/web/web-router";
import { cx } from "@/utils/cx";
import { EmptyBlock, LinkButton } from "../../account/account-ui";
import { WebShell } from "../../web-shell";
import { PACKAGE_FILTERS, SUBSCRIPTIONS, coachById, creditsHref, instructionHref, onlinePackages, packagesForCoach, packagesHref, subscriptionForCoach } from "../data";
import { useInstructionQuery } from "../use-instruction-query";
import { CreditsExplainer } from "./credits-explainer";
import { MonthlyPlanCard } from "./monthly-plan-card";
import { PackCard } from "./pack-card";
import { CoachAvatar } from "./packages-ui";

/** `?lessons=5|10` — the pack-size filter (kept in the query's `extra` params). */
export const LESSONS_PARAM = "lessons";
/** `/instruction/packages?step=plans` — the monthly plans view. */
export const plansHref = () => packagesHref({ step: "plans" });

const focusRing = "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";

/** "← Instruction" style back link. */
export const BackLink = ({ href, children }: { href: string; children: ReactNode }) => (
    <WebLink href={href} className={cx("inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        {children}
    </WebLink>
);

/** Monthly plans / My credits — the two ways out of the catalog. */
const HeaderActions = ({ plans = true }: { plans?: boolean }) => (
    <div className="flex flex-wrap gap-2.5">
        {plans && (
            <LinkButton href={plansHref()} color="outline" icon={RefreshCcw01}>
                Monthly plans
            </LinkButton>
        )}
        <LinkButton href={creditsHref()} color="outline" icon={Ticket02}>
            My credits
        </LinkButton>
    </div>
);

/** A pill link (filter chips are links, so every filter is a deep link). */
const ChipLink = ({ href, active, children }: { href: string; active: boolean; children: ReactNode }) => (
    <WebLink
        href={href}
        aria-current={active ? "page" : undefined}
        className={cx(
            "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold ring-1 transition duration-100 ease-linear ring-inset",
            focusRing,
            active ? "bg-brand-solid text-white ring-transparent" : "bg-primary text-secondary ring-secondary hover:bg-primary_hover",
        )}
    >
        {children}
    </WebLink>
);

const WhyTiedNote = () => (
    <div className="flex items-start gap-3 rounded-xl bg-primary p-5 ring-1 ring-secondary ring-inset">
        <InfoCircle className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
        <div className="flex flex-col gap-1">
            <p className="text-md font-semibold text-primary">Why packages are tied to an instructor</p>
            <p className="max-w-3xl text-md text-tertiary">
                MCG sets rates per instructor — a teacher who stays full at a higher rate is priced there. Because the rate belongs to the person, so does the package, and so does the credit you hold.
            </p>
        </div>
    </div>
);

/**
 * `/instruction/packages` — the lesson-pack catalog (Fox Prototype 3 › Flow B "Browse packages").
 * `?lessons=5|10` filters by pack size; `?coach=<id>` scopes to one instructor's packs (and shows
 * their monthly plan, when they offer one).
 */
export const PackagesPage = () => {
    const { query, hrefWith } = useInstructionQuery();
    const lessons = PACKAGE_FILTERS.some((f) => f.id === query.extra[LESSONS_PARAM]) ? query.extra[LESSONS_PARAM] : "all";
    const coach = query.coach ? coachById(query.coach) : undefined;
    const scoped = !!coach && !coach.isAny;
    const packs = scoped ? packagesForCoach(coach.id) : onlinePackages();
    const visible = lessons === "all" ? packs : packs.filter((p) => String(p.credits) === lessons);
    const coachCount = new Set(packs.map((p) => p.coachId)).size;
    const plan = scoped ? subscriptionForCoach(coach.id) : undefined;

    const withLessons = (id: string) => {
        const extra = { ...query.extra };
        if (id === "all") delete extra[LESSONS_PARAM];
        else extra[LESSONS_PARAM] = id;
        return hrefWith({ extra });
    };

    return (
        <WebShell active="instruction">
            <WebPage>
                <PageHeader
                    back={<BackLink href={instructionHref()}>Instruction</BackLink>}
                    eyebrow="MCG Academy"
                    title="Lesson packages"
                    subtitle="Buy several lessons up front and pay less per lesson. Rates are set per instructor across the county, so packages are too — a pack is good with the instructor you bought it from."
                    actions={<HeaderActions />}
                />

                {scoped && (
                    <div data-testid="coach-scope" className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-brand-primary_alt px-4 py-3 ring-1 ring-brand ring-inset">
                        <CoachAvatar coach={coach} size="sm" />
                        <p className="min-w-0 flex-1 text-md text-primary">
                            Showing <span className="font-semibold">{coach.name}&rsquo;s</span> packs
                        </p>
                        <WebLink href={hrefWith({ coach: undefined })} className={cx("rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                            Show all
                        </WebLink>
                    </div>
                )}

                <section aria-label="Available packages" className="mt-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 className="text-display-xs font-semibold tracking-[-0.3px] text-primary">Available packages</h2>
                            <p className="mt-1 text-md text-tertiary">
                                {visible.length} {visible.length === 1 ? "package" : "packages"}
                                {scoped ? ` from ${coach.name}` : ` from ${coachCount} instructors`}
                            </p>
                        </div>
                        <nav aria-label="Package size" className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 @tablet:mx-0 @tablet:px-0">
                            {PACKAGE_FILTERS.map((f) => (
                                <ChipLink key={f.id} href={withLessons(f.id)} active={lessons === f.id}>
                                    {f.label}
                                </ChipLink>
                            ))}
                        </nav>
                    </div>

                    {visible.length ? (
                        <div className="mt-5 grid grid-cols-1 items-stretch gap-4 @tablet:grid-cols-2 @desktop:grid-cols-3">
                            {visible.map((p) => (
                                <PackCard key={p.id} pack={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-5 rounded-xl bg-primary ring-1 ring-secondary ring-inset">
                            <EmptyBlock
                                icon={Ticket02}
                                title={scoped && packs.length === 0 ? `${coach.name} doesn’t sell packages yet` : `No ${lessons}-lesson packages here`}
                                description={scoped ? "Packages are set per instructor. Book single lessons, or see every instructor's packs." : "Try another pack size."}
                                action={
                                    <LinkButton href={scoped ? hrefWith({ coach: undefined, extra: {} }) : withLessons("all")} color="outline">
                                        {scoped ? "Show all packages" : "All packages"}
                                    </LinkButton>
                                }
                            />
                        </div>
                    )}
                </section>

                {plan && (
                    <section aria-label="Monthly plan" className="mt-10">
                        <h2 className="text-xl font-semibold tracking-[-0.3px] text-primary">Or a monthly plan with {coach!.name}</h2>
                        <p className="mt-1 text-md text-tertiary">Billed monthly instead of up front. Nothing prepaid past the current month.</p>
                        <div className="mt-4 grid grid-cols-1 gap-4 @tablet:grid-cols-2 @desktop:grid-cols-3">
                            <MonthlyPlanCard plan={plan} hideCoach />
                        </div>
                    </section>
                )}

                <div className="mt-10 flex flex-col gap-4">
                    <WhyTiedNote />
                    <CreditsExplainer />
                </div>
            </WebPage>
        </WebShell>
    );
};

/**
 * `/instruction/packages?step=plans` — monthly lesson plans (Fox "Model C"), marked as a concept:
 * billed monthly with auto-renew and a renewal notice, nothing prepaid past the current cycle.
 */
export const MonthlyPlansPage = () => (
    <WebShell active="instruction">
        <WebPage>
            <PageHeader
                back={<BackLink href={packagesHref()}>Lesson packages</BackLink>}
                eyebrow="MCG Academy"
                title={
                    <span className="flex flex-wrap items-center gap-3">
                        Monthly plans
                        <Tag tone="warning" variant="soft">
                            Concept
                        </Tag>
                    </span>
                }
                subtitle="A set number of lessons every month, billed monthly like a membership. Cancel anytime — you're told before every renewal."
                actions={<HeaderActions plans={false} />}
            />

            <section aria-label="Plans" className="mt-8">
                <h2 className="text-display-xs font-semibold tracking-[-0.3px] text-primary">Available plans</h2>
                <p className="mt-1 text-md text-tertiary">Offered by MCG instructors at their own rate.</p>
                <div className="mt-5 grid grid-cols-1 gap-4 @tablet:grid-cols-2 @desktop:grid-cols-3">
                    {SUBSCRIPTIONS.map((s) => (
                        <MonthlyPlanCard key={s.id} plan={s} />
                    ))}
                </div>
            </section>

            <div className="mt-10 grid grid-cols-1 gap-4 @desktop:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl bg-primary p-5 ring-1 ring-secondary ring-inset">
                    <RefreshCcw01 className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                    <div className="flex flex-col gap-1">
                        <p className="text-md font-semibold text-primary">Plan or pack?</p>
                        <p className="text-md text-tertiary">
                            A pack is paid once and spent lesson by lesson. A plan is paid monthly and resets each month — nothing sits prepaid, and you can stop whenever you like.
                        </p>
                        <WebLink href={packagesHref()} className={cx("mt-1 self-start rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                            Compare with lesson packages
                        </WebLink>
                    </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-warning-primary p-5">
                    <InfoCircle className="mt-0.5 size-5 shrink-0 text-fg-warning-primary" aria-hidden="true" />
                    <div className="flex flex-col gap-1">
                        <p className="text-md font-semibold text-warning-primary">A third option for MCG</p>
                        <p className="text-md text-warning-primary">
                            Billed monthly with auto-renew. Nothing is prepaid beyond the current cycle, so the Academy carries no liability — but unlike a pure discount, the revenue and the commitment are both predictable.
                        </p>
                    </div>
                </div>
            </div>
        </WebPage>
    </WebShell>
);
