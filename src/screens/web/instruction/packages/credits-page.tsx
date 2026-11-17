import { AlertTriangle, CheckCircle, Coins01, RefreshCcw01, Ticket02, TrendUp02, User01, Users01 } from "@untitledui/icons";
import { Tag } from "@/components/base/badge";
import { Notice } from "@/components/feedback/notice";
import { PageHeader, WebPage } from "@/components/web/web-layout";
import { cx } from "@/utils/cx";
import { EmptyBlock, LinkButton, StatTile, TextAction } from "../../account/account-ui";
import { useWebRouter } from "@/components/web/web-router";
import { useWebSession, WebShell } from "../../web-shell";
import { useInstructionStore } from "../instruction-store";
import {
    ACADEMY_CONTACT,
    BALANCE_AFTER_REDEMPTION,
    EDGE_BALANCES,
    VOLUME_PROGRESS,
    instructionHref,
    money,
    money0,
    packageById,
    packagesHref,
    serviceById,
    servicePrice,
    type CreditBalance,
} from "../data";
import { useInstructionQuery } from "../use-instruction-query";
import { CreditBalanceCard, balanceStatus, isUsable } from "./credit-balance-card";
import { CreditsExplainer } from "./credits-explainer";
import { BOUGHT_PARAM, bookWithHref } from "./pack-checkout-page";
import { packHref } from "./pack-card";
import { BackLink, plansHref } from "./packages-page";
import { CoachAvatar, MicroLabel, coachFor, lessonsLabel } from "./packages-ui";

/**
 * `?demo=` sample states for reviews and stories (the wallet otherwise shows the session store):
 *  - `after-booking` — the Mike Kenny pack one lesson later (4 of 5, with its history)
 *  - `spent-expired` — adds a used-up pack and one that expired with lessons on it
 *  - `empty`         — no credits at all
 */
export const DEMO_PARAM = "demo";
export type CreditsDemo = "after-booking" | "spent-expired" | "empty";

const applyDemo = (balances: CreditBalance[], demo?: string): CreditBalance[] => {
    if (demo === "empty") return [];
    if (demo === "after-booking") return balances.map((b) => (b.id === BALANCE_AFTER_REDEMPTION.id ? BALANCE_AFTER_REDEMPTION : b));
    if (demo === "spent-expired") return [...balances, ...EDGE_BALANCES.filter((e) => !balances.some((b) => b.id === e.id))];
    return balances;
};

const SectionTitle = ({ title, sub, meta }: { title: string; sub?: string; meta?: string }) => (
    <div className="mb-4">
        <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-xl font-semibold tracking-[-0.3px] text-primary">{title}</h2>
            {meta && <span className="text-sm text-tertiary">{meta}</span>}
        </div>
        {sub && <p className="mt-1 max-w-3xl text-md text-tertiary">{sub}</p>}
    </div>
);

/** Fox "Model B" — a volume discount: no balance, the next lesson is cheaper after N. Shown as a concept. */
const LoyaltyCard = () => {
    const vp = VOLUME_PROGRESS;
    const coach = coachFor(vp.coachId);
    const svc = serviceById(vp.serviceId)!;
    const full = servicePrice(svc, coach, 1);
    const toGo = vp.lessonsRequired - vp.lessonsTaken;
    const pct = Math.round(vp.discount * 100);
    const recent = [
        { date: "Apr 11, 2026", where: "Laytonsville" },
        { date: "May 2, 2026", where: "Little Bennett" },
        { date: "Jun 6, 2026", where: "Laytonsville" },
    ];
    return (
        <article data-testid="loyalty-card" className="flex flex-col gap-4 rounded-xl bg-primary p-5 ring-1 ring-secondary ring-inset">
            <header className="flex items-start gap-3.5">
                <CoachAvatar coach={coach} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <h4 className="text-md font-semibold text-primary">Loyalty discount with {coach.name}</h4>
                    <p className="text-sm text-tertiary">{svc.name} · nothing to buy or redeem</p>
                </div>
                <Tag tone="warning" variant="soft">
                    Concept
                </Tag>
            </header>
            <div className="flex flex-col gap-3 rounded-lg bg-secondary px-4 py-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <MicroLabel>Lessons taken</MicroLabel>
                        <span className="text-display-xs font-semibold text-primary tabular-nums">
                            {vp.lessonsTaken}
                            <span className="text-md font-medium text-tertiary">/{vp.lessonsRequired}</span>
                        </span>
                    </div>
                    <span className="pb-1 text-sm text-tertiary">
                        {toGo} more and the next is {pct}% off
                    </span>
                </div>
                <div className="flex gap-1.5" role="meter" aria-label={`Lessons toward the discount with ${coach.name}`} aria-valuemin={0} aria-valuemax={vp.lessonsRequired} aria-valuenow={vp.lessonsTaken}>
                    {Array.from({ length: vp.lessonsRequired }, (_, i) => (
                        <span key={i} className={cx("h-2.5 flex-1 rounded-full", i < vp.lessonsTaken ? "bg-fg-brand-primary" : "bg-quaternary")} />
                    ))}
                </div>
            </div>
            <ul className="flex flex-col divide-y divide-secondary">
                {recent.map((l) => (
                    <li key={l.date} className="flex flex-wrap items-center justify-between gap-x-4 py-2 text-sm">
                        <span className="text-secondary">
                            {svc.name} · {l.where}
                        </span>
                        <span className="flex gap-4">
                            <span className="text-tertiary tabular-nums">{l.date}</span>
                            <span className="font-semibold text-primary tabular-nums">{money(full)}</span>
                        </span>
                    </li>
                ))}
            </ul>
            <footer className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <LinkButton size="sm" href={bookWithHref(coach.id, svc.id)}>
                    Book lesson {vp.lessonsTaken + 1} at {money0(full)}
                </LinkButton>
                <span className="text-sm text-tertiary">Lesson {vp.lessonsRequired + 1} is {money(full * (1 - vp.discount))}, applied at checkout.</span>
            </footer>
        </article>
    );
};

/**
 * `/instruction/credits` — My lesson credits (Fox "Wallet — credit balance" + "When credits run
 * out"): totals, a card per balance with its history, the loyalty-discount concept (Model B),
 * used-up and expired balances, how credits work, and an empty state. Reads the session store, so
 * a pack bought in checkout shows up here straight away.
 */
export const CreditsPage = () => {
    const { userName } = useWebSession();
    const { path } = useWebRouter();
    const { query } = useInstructionQuery();
    const store = useInstructionStore();
    const demo = query.extra[DEMO_PARAM];
    const balances = applyDemo(store.balances, demo);
    const active = balances.filter(isUsable);
    const past = balances.filter((b) => !isUsable(b));
    const totalCredits = active.reduce((n, b) => n + b.creditsRemaining, 0);
    const totalValue = active.reduce((n, b) => n + b.valueRemaining, 0);
    const instructors = new Set(active.map((b) => b.coachId)).size;

    const boughtId = query.extra[BOUGHT_PARAM];
    const bought = boughtId ? packageById(boughtId) : undefined;
    const boughtBalance = bought ? active.find((b) => b.packageId === bought.id && b.history.length === 0) : undefined;
    const spentAfterBooking = demo === "after-booking" ? BALANCE_AFTER_REDEMPTION : undefined;
    const expired = past.find((b) => balanceStatus(b) === "expired");

    const header = (
        <PageHeader
            back={<BackLink href={instructionHref()}>Instruction</BackLink>}
            eyebrow="MCG Academy"
            title="My lesson credits"
            subtitle="Credits sit in your MCG wallet next to gift cards and punch cards. Each balance belongs to the instructor you bought it from."
            actions={
                <div className="flex flex-wrap gap-2.5">
                    <LinkButton href={packagesHref()} color="outline" icon={Ticket02}>
                        Browse packages
                    </LinkButton>
                </div>
            }
        />
    );

    if (!userName) {
        const next = encodeURIComponent(path);
        return (
            <WebShell active="instruction">
                <WebPage>
                    {header}
                    <div className="mt-8 rounded-xl bg-primary ring-1 ring-secondary ring-inset">
                        <EmptyBlock
                            icon={User01}
                            title="Sign in to see your lesson credits"
                            description="Credits are kept in your MCG account, one balance per instructor."
                            action={<LinkButton href={`/sign-in?next=${next}`}>Sign in</LinkButton>}
                        />
                    </div>
                    <CreditsExplainer className="mt-6" />
                </WebPage>
            </WebShell>
        );
    }

    return (
        <WebShell active="instruction">
            <WebPage>
                {header}

                {(bought || spentAfterBooking) && (
                    <div className="mt-6">
                        {bought ? (
                            <Notice tone="success" title={`${bought.credits} credits added to your wallet`} className="rounded-lg text-sm">
                                {bought.label} with {coachFor(bought.coachId).name} — ready to book.
                            </Notice>
                        ) : (
                            spentAfterBooking && (
                                <Notice tone="success" title="Lesson booked with a credit" className="rounded-lg text-sm">
                                    One credit spent with {coachFor(spentAfterBooking.coachId).name} — {lessonsLabel(spentAfterBooking.creditsRemaining)} left on that pack. The same entry that draws down your balance relieves what MCG owes for that instructor.
                                </Notice>
                            )
                        )}
                    </div>
                )}

                {balances.length === 0 ? (
                    <>
                        <div className="mt-8 rounded-xl bg-primary ring-1 ring-secondary ring-inset" data-testid="credits-empty">
                            <EmptyBlock
                                icon={Ticket02}
                                title="No lesson credits yet"
                                description="Buy a 5- or 10-lesson pack from any MCG instructor and pay less per lesson. Credits land here the moment you pay."
                                action={
                                    <div className="flex flex-wrap justify-center gap-3">
                                        <LinkButton href={packagesHref()}>Browse packages</LinkButton>
                                        <LinkButton href={plansHref()} color="outline" icon={RefreshCcw01}>
                                            Monthly plans
                                        </LinkButton>
                                    </div>
                                }
                            />
                        </div>
                        <CreditsExplainer className="mt-6" />
                    </>
                ) : (
                    <>
                        <div className="mt-8 grid grid-cols-1 gap-3 @tablet:grid-cols-3">
                            <StatTile icon={Ticket02} label="Lessons available" value={totalCredits} sub={`across ${instructors} ${instructors === 1 ? "instructor" : "instructors"}`} />
                            <StatTile icon={Coins01} label="Value remaining" value={money0(totalValue)} sub="at the price you paid" />
                            <StatTile icon={Users01} label="Balances" value={active.length} sub={past.length ? `${past.length} used up or expired` : "one per pack"} />
                        </div>

                        <section aria-label="Active balances" className="mt-10">
                            <SectionTitle title="Active balances" sub="One balance per instructor — that's also how MCG reports what the Academy still owes in lessons." />
                            {active.length ? (
                                <div className="grid grid-cols-1 items-start gap-4 @desktop:grid-cols-2">
                                    {active.map((b) => {
                                        const pack = packageById(b.packageId);
                                        return (
                                            <CreditBalanceCard
                                                key={b.id}
                                                balance={b}
                                                highlight={b === boughtBalance}
                                                actions={
                                                    <>
                                                        <LinkButton size="sm" href={bookWithHref(b.coachId, pack?.appliesToServiceId ?? "private-45")}>
                                                            Book with these credits
                                                        </LinkButton>
                                                        <TextAction href={packHref(b.packageId)}>Terms</TextAction>
                                                    </>
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-xl bg-primary ring-1 ring-secondary ring-inset">
                                    <EmptyBlock icon={Ticket02} title="No credits left to spend" description="Your past balances are below. A new pack starts a fresh balance." action={<LinkButton href={packagesHref()}>Browse packages</LinkButton>} />
                                </div>
                            )}
                        </section>

                        <section aria-label="Loyalty discount" className="mt-10">
                            <SectionTitle title="Loyalty discount" sub="An alternative MCG is weighing: no pack, no balance, no expiry — lessons ring up at full price and the next one is half off after four with the same instructor." />
                            <div className="grid grid-cols-1 gap-4 @desktop:grid-cols-2">
                                <LoyaltyCard />
                                <div className="flex items-start gap-3 self-start rounded-xl bg-primary p-5 ring-1 ring-secondary ring-inset">
                                    <TrendUp02 className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                                    <div className="flex flex-col gap-1">
                                        <p className="text-md font-semibold text-primary">What MCG trades away</p>
                                        <p className="text-md text-tertiary">
                                            No outstanding liability, no expiry policy, no refunds to administer. In exchange: no cash up front, and no commitment holding the golfer to a fifth lesson. A monthly plan keeps the revenue without the liability.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {past.length > 0 && (
                            <section aria-label="Used up and expired" className="mt-10">
                                <SectionTitle title="Used up & expired" sub="Kept as a record. A used-up pack's next step is another pack; an expired one is where the policy has to be clear." meta={`${past.length} ${past.length === 1 ? "balance" : "balances"}`} />
                                <div className="grid grid-cols-1 items-start gap-4 @desktop:grid-cols-2">
                                    {past.map((b) => {
                                        const status = balanceStatus(b);
                                        const again = packageById(`${b.coachId}--pack-5`);
                                        return (
                                            <CreditBalanceCard
                                                key={b.id}
                                                balance={b}
                                                actions={
                                                    status === "used-up" && again ? (
                                                        <LinkButton size="sm" href={packHref(again.id)}>
                                                            Buy another {again.credits}-lesson pack — {money0(again.price)}
                                                        </LinkButton>
                                                    ) : (
                                                        <>
                                                            <a
                                                                href={`mailto:${ACADEMY_CONTACT.email}?subject=${encodeURIComponent("Expired lesson credits")}`}
                                                                className="inline-flex h-9 items-center rounded-lg bg-primary px-3.5 text-sm font-semibold text-secondary ring-1 ring-primary outline-none transition duration-100 ease-linear ring-inset hover:bg-primary_hover focus-visible:ring-4 focus-visible:ring-brand-300/60"
                                                            >
                                                                Ask the Academy about these
                                                            </a>
                                                            <TextAction href={packHref(b.packageId)}>Read the terms</TextAction>
                                                        </>
                                                    )
                                                }
                                            />
                                        );
                                    })}
                                </div>
                                {expired && (
                                    <div className="mt-4 flex items-start gap-3 rounded-xl bg-warning-primary p-5">
                                        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-fg-warning-primary" aria-hidden="true" />
                                        <div className="flex flex-col gap-1">
                                            <p className="text-md font-semibold text-warning-primary">Open question for MCG</p>
                                            <p className="max-w-3xl text-md text-warning-primary">
                                                {money(expired.valueRemaining)} sat unused with {coachFor(expired.coachId).name} past {expired.expiresOn}. Does that revert to the Academy as revenue, stay on the books as liability, or get extended on request? Whichever it is, the golfer needs to have been told on the way in — the pack&rsquo;s restrictions list does that today.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        <div className="mt-10 flex flex-col gap-4">
                            <div className="flex flex-col gap-4 rounded-xl bg-primary p-5 ring-1 ring-secondary ring-inset @tablet:flex-row @tablet:items-center @tablet:justify-between">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-md font-semibold text-primary">Add more lessons</p>
                                        <p className="text-md text-tertiary">Packages and monthly plans are available from MCG instructors.</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    <LinkButton href={packagesHref()} color="outline">
                                        Browse packages
                                    </LinkButton>
                                    <LinkButton href={plansHref()} color="outline" icon={RefreshCcw01}>
                                        Monthly plans
                                    </LinkButton>
                                </div>
                            </div>
                            <CreditsExplainer />
                        </div>
                    </>
                )}
            </WebPage>
        </WebShell>
    );
};
