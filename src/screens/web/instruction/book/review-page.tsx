import { useState, type FC, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Bell01, CheckCircle, CheckVerified01, Package, Star01, Ticket02 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";
import { Tag } from "@/components/base/badge";
import { Notice } from "@/components/feedback/notice";
import { TextField } from "@/components/forms/text-field";
import { WebDialog } from "@/components/web/web-dialog";
import { Panel, PageHeader, WebPage } from "@/components/web/web-layout";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { USER } from "@/data/crane";
import { AddToCalendar, CheckList, ShareButton } from "../../events/events-ui";
import { WebShell } from "../../web-shell";
import {
    ANY_INSTRUCTOR,
    bookHref,
    clinicsHref,
    coachById,
    coachPhoto,
    courseName,
    courseShortName,
    creditsHref,
    dateOfIso,
    fmtDate,
    guardrailSummary,
    instructionHref,
    money,
    money0,
    packagesForCoach,
    packagesHref,
    PROMOS,
    proHref,
    REVIEW_MINIMUM,
    reviewsEnabled,
    instructorReviews,
    serviceById,
    servicePrice,
    type InstructionQuery,
} from "../data";
import { useInstructionStore } from "../instruction-store";
import { CoachAvatar, focusRing } from "../pro/instructor-ui";
import { useInstructionQuery } from "../use-instruction-query";
import { useFollowCourse } from "../use-follow-course";
import { extrasOf, programFor, quoteLesson, sessionsParamOf, timeLabelOf, timeRange, type BookableProgram } from "./book-model";
import { MoneyRow, paymentName, WebTextArea } from "./booking-ui";

const longDay = (iso: string) =>
    dateOfIso(iso).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

/**
 * `/instruction/review` — where a booking lands, and where a finished lesson is rated.
 *
 * - `step=booked` — "You're booked": summary, add to calendar, what to bring, the cancellation
 *   window and the lesson's guardrails, manage links (cancel, credits; golfers can't reschedule — only
 *   instructors move lessons, decided Nov 17), pack prompt.
 * - `step=waitlisted` — a private-lesson or program waitlist request.
 * - `step=registered` — a group program registration.
 * - no `step` — Fox's post-lesson review form (`reviewHref(…)`), or "link incomplete".
 *
 * Everything shown comes from the URL (so a confirmation deep-links); the session store adds
 * what only it knows — the remaining credit balance, and cancelling.
 */
export const LessonReviewPage = () => {
    const { query } = useInstructionQuery();
    const program = query.service ? programFor(query.service) : undefined;
    useFollowCourse(query.courses[0] ?? program?.courseSlug ?? (query.coach ? coachById(query.coach)?.courseSlugs[0] : undefined));
    const kind = query.step;
    if (kind === "booked") return <BookedConfirmation q={query} />;
    if (kind === "waitlisted") return <WaitlistConfirmation q={query} />;
    if (kind === "registered") return <RegisteredConfirmation q={query} />;
    return <RateLesson q={query} />;
};

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

const Hero = ({ icon: Icon, tone, title, children, id }: { icon: FC<{ className?: string }>; tone: "success" | "warning"; title: string; children: ReactNode; id?: string }) => (
    <div className="flex flex-col items-center gap-3 text-center">
        <span className={cx("flex size-14 items-center justify-center rounded-full", tone === "success" ? "bg-success-secondary" : "bg-warning-secondary")}>
            <Icon className={cx("size-7", tone === "success" ? "text-fg-success-primary" : "text-fg-warning-primary")} />
        </span>
        <h1 className="text-display-sm font-bold tracking-[-0.5px] text-primary @tablet:text-display-md">{title}</h1>
        {id && (
            <span className="caps text-quaternary">
                Confirmation <span className="text-secondary">{id}</span>
            </span>
        )}
        <p className="max-w-xl text-md text-tertiary">{children}</p>
    </div>
);

const Fact = ({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) => (
    <div className="flex flex-col gap-1">
        <span className="caps text-quaternary">{label}</span>
        <span className="text-md font-semibold text-primary">{value}</span>
        {sub && <span className="text-sm text-tertiary">{sub}</span>}
    </div>
);

const ManageLink = ({ href, children }: { href: string; children: ReactNode }) => (
    <WebLink
        href={href}
        className={cx(
            "flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-md font-medium text-primary ring-1 ring-secondary ring-inset transition duration-100 ease-linear hover:bg-primary_hover",
            focusRing,
        )}
    >
        {children}
        <ArrowRight className="size-4 text-fg-quaternary" aria-hidden="true" />
    </WebLink>
);

const LESSON_BRING = [
    "Your clubs — or add rental clubs at the pro shop",
    "Golf shoes or flat-soled trainers",
    "Arrive 10 minutes early and check in at the pro shop",
    "Range balls are included with every lesson",
];

/** "Free cancellation until Thu, Oct 15 at 9:30 AM" — 24 hours before the start. */
const cancelBy = (iso: string, time?: string) => {
    const d = dateOfIso(iso);
    d.setDate(d.getDate() - 1);
    return `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}${time ? ` at ${timeLabelOf(time)}` : ""}`;
};

const Incomplete = ({ title, body }: { title: string; body: string }) => {
    const { navigate } = useWebRouter();
    return (
        <WebShell active="instruction">
            <WebPage width="content">
                <Panel className="mx-auto max-w-2xl" bodyClassName="flex flex-col items-start gap-4 p-8">
                    <h1 className="text-display-xs font-semibold text-primary">{title}</h1>
                    <p className="text-md text-tertiary">{body}</p>
                    <Button size="web-md" color="outline" iconLeading={ArrowLeft} onPress={() => navigate("/account/activity")}>
                        Your activity
                    </Button>
                </Panel>
            </WebPage>
        </WebShell>
    );
};

/* ------------------------------------------------------------------ */
/* You're booked                                                       */
/* ------------------------------------------------------------------ */

const BookedConfirmation = ({ q }: { q: InstructionQuery }) => {
    const store = useInstructionStore();
    const { navigate } = useWebRouter();
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const service = q.service ? serviceById(q.service) : undefined;
    const coach = q.coach ? coachById(q.coach) : undefined;
    if (!service || !coach || !q.date)
        return <Incomplete title="This confirmation link is incomplete" body="Your booking is safe — open it from your confirmation email, or find it in your account activity." />;

    const course = q.courses[0] ?? coach.courseSlugs[0];
    const players = q.players ?? 1;
    const id = q.extra.confirmation ?? "MCG-48213";
    const pay = q.extra.pay ?? "pm-amex";
    const extras = extrasOf(q);
    const promo = q.extra.promo && PROMOS[q.extra.promo] ? q.extra.promo : null;
    const quote = quoteLesson({
        lesson: servicePrice(service, coach, players),
        extras,
        promo,
        pay,
    });
    const usedCredit = pay === "credit";
    const balance = store.balances.find((b) => b.coachId === coach.id);
    const packs = packagesForCoach(coach.id);
    const bestPack = packs.reduce<(typeof packs)[number] | undefined>((a, b) => (!a || b.savings > a.savings ? b : a), undefined);
    const guard = guardrailSummary(service);
    const lessonId = store.lessons.find((l) => l.id === id)?.id;

    return (
        <WebShell active="instruction">
            <WebPage>
                <Hero icon={CheckCircle} tone={cancelled ? "warning" : "success"} title={cancelled ? "Lesson cancelled" : "You're booked"} id={id}>
                    {cancelled
                        ? `${service.name} with ${coach.name} on ${longDay(q.date)} is cancelled${usedCredit ? " and your credit is back in your wallet" : " and refunded in full"}.`
                        : `${service.name} with ${coach.name} on ${longDay(q.date)} at ${timeLabelOf(q.time)}. A confirmation is on its way to ${USER.email} and ${USER.phone}, and it's saved to your MCG account.`}
                </Hero>

                <div className="mt-10 grid grid-cols-1 gap-6 @desktop:grid-cols-[minmax(0,1fr)_360px] @desktop:gap-8">
                    <div className="flex min-w-0 flex-col gap-5">
                        <Panel bodyClassName="flex flex-col gap-5 px-5 py-5 @tablet:px-6 @tablet:py-6">
                            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-secondary pb-5">
                                <div className="flex items-center gap-3.5">
                                    <CoachAvatar photo={coachPhoto(coach)} initials={coach.initials} size="lg" />
                                    <div className="flex flex-col">
                                        <span className="text-lg font-semibold text-primary">{coach.credential ? `${coach.name}, ${coach.credential}` : coach.name}</span>
                                        <span className="text-sm text-tertiary">{service.name}</span>
                                    </div>
                                </div>
                                <Tag tone={cancelled ? "gray" : "success"} variant="soft">
                                    {cancelled ? "Cancelled" : "Confirmed"}
                                </Tag>
                            </div>
                            <div className="grid grid-cols-1 gap-5 @tablet:grid-cols-3">
                                <Fact
                                    label="When"
                                    value={longDay(q.date)}
                                    sub={q.time ? timeRange(q.time, service.durationMin + extras.reduce((n, e) => n + (e.minutes ?? 0), 0)) : undefined}
                                />
                                <Fact label="Where" value={courseName(course)} sub="Academy lesson tee · check in at the pro shop" />
                                <Fact label="Golfers" value={players} sub={players === 1 ? "Just you" : `You + ${players - 1}`} />
                            </div>
                            {q.extra.matched && (
                                <Notice tone="info" className="rounded-lg text-sm">
                                    You asked for any available instructor and we matched you with {coach.name}. Want someone else? Cancel free up to 24 hours before and book again, or ask the Academy to switch you.
                                </Notice>
                            )}
                            <div className="flex flex-col gap-2 border-t border-secondary pt-5">
                                <span className="caps text-quaternary">Payment</span>
                                <MoneyRow label={`${service.name} · ${players} ${players === 1 ? "golfer" : "golfers"}`} value={money(quote.lesson)} />
                                {extras.map((e) => (
                                    <MoneyRow key={e.id} label={e.name} value={money(e.price)} />
                                ))}
                                {quote.discount > 0 && <MoneyRow label={quote.promoLabel ?? "Promo"} value={`−${money(quote.discount)}`} tone="success" />}
                                {usedCredit && <MoneyRow label="Lesson credit (1)" value={`−${money(quote.creditApplied)}`} tone="success" />}
                                <MoneyRow
                                    label="Facility fee"
                                    value={quote.facilityWaived ? "Included" : money(quote.facilityFee)}
                                    tone={quote.facilityWaived ? "muted" : undefined}
                                />
                                <div className="mt-1 border-t border-secondary pt-3">
                                    <MoneyRow
                                        strong
                                        label={`Charged to ${usedCredit ? (quote.total ? "your card on file" : "your lesson credit") : paymentName(pay)}`}
                                        value={money(quote.total)}
                                    />
                                </div>
                                {usedCredit && balance && (
                                    <p className="flex items-center gap-1.5 text-sm font-medium text-success-primary">
                                        <Ticket02 className="size-4" aria-hidden="true" />
                                        {balance.creditsRemaining} lesson {balance.creditsRemaining === 1 ? "credit" : "credits"} left with {coach.name}
                                    </p>
                                )}
                            </div>
                            {!cancelled && (
                                <div className="flex flex-col gap-2.5 border-t border-secondary pt-5 @tablet:flex-row">
                                    <AddToCalendar />
                                    <ShareButton />
                                </div>
                            )}
                        </Panel>

                        <div className="grid grid-cols-1 gap-5 @tablet:grid-cols-2">
                            <Panel title="What to bring" bodyClassName="px-5 py-4">
                                <CheckList items={LESSON_BRING} />
                            </Panel>
                            <Panel title="Cancellation" bodyClassName="flex flex-col gap-2 px-5 py-4 text-sm text-tertiary">
                                <p>
                                    Free cancellation until <span className="font-semibold text-secondary">{cancelBy(q.date, q.time)}</span>. After that the lesson
                                    is charged
                                    {usedCredit ? " (the credit is spent)" : ""}, at the instructor&rsquo;s discretion.
                                </p>
                                <p>Need a new time? Your instructor can move it — reply to your confirmation or call the Academy.</p>
                                {guard && <p>This lesson runs {guard.toLowerCase()}, so any new time stays inside that.</p>}
                                <p>Rain or lightning? The Academy moves the lesson at no charge.</p>
                            </Panel>
                        </div>
                    </div>

                    <aside className="flex flex-col gap-5">
                        <Panel title="Manage this lesson" bodyClassName="flex flex-col gap-2 px-5 py-4">
                            {!cancelled && (
                                <AriaButton
                                    onPress={() => setCancelOpen(true)}
                                    className={cx(
                                        "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-md font-medium text-error-primary ring-1 ring-secondary ring-inset hover:bg-primary_hover",
                                        focusRing,
                                    )}
                                >
                                    Cancel lesson
                                </AriaButton>
                            )}
                            <ManageLink href="/account/activity">Your activity</ManageLink>
                            <ManageLink href={creditsHref()}>Lesson credits</ManageLink>
                            <ManageLink href={proHref(coach.id)}>More with {coach.name}</ManageLink>
                            {!cancelled && <p className="px-1 pt-1 text-sm text-tertiary">Need a new time? Your instructor can move it — reply to your confirmation or call the Academy.</p>}
                        </Panel>
                        {!usedCredit && bestPack && (
                            <Panel bodyClassName="flex flex-col gap-3 px-5 py-5">
                                <span className="flex items-center gap-2 text-md font-semibold text-primary">
                                    <Package className="size-5 text-fg-brand-primary" aria-hidden="true" />
                                    Coming back? Save {money0(bestPack.savings)}
                                </span>
                                <p className="text-sm text-tertiary">
                                    A {bestPack.credits}-lesson pack with {coach.name} is {money0(bestPack.price)} — {money0(bestPack.perLessonPrice)} a lesson. Credits go to your
                                    wallet and pay for your next booking.
                                </p>
                                <Button size="web-md" color="outline-brand" onPress={() => navigate(packagesHref({ coach: coach.id, pack: bestPack.id }))}>
                                    See packs
                                </Button>
                            </Panel>
                        )}
                    </aside>
                </div>
            </WebPage>
            <WebDialog
                isOpen={cancelOpen}
                onOpenChange={setCancelOpen}
                title="Cancel this lesson?"
                description={`${service.name} with ${coach.name}, ${longDay(q.date)} at ${timeLabelOf(q.time)}.`}
                footer={
                    <>
                        <Button size="web-md" color="outline" onPress={() => setCancelOpen(false)}>
                            Keep lesson
                        </Button>
                        <Button
                            size="web-md"
                            color="destructive"
                            onPress={() => {
                                if (lessonId) store.cancelLesson(lessonId);
                                setCancelled(true);
                                setCancelOpen(false);
                            }}
                        >
                            Cancel lesson
                        </Button>
                    </>
                }
            >
                <p className="text-md text-tertiary">
                    You&rsquo;re outside the 24-hour window, so {usedCredit ? "the credit goes back to your wallet" : `${money(quote.total)} is refunded to ${paymentName(pay)}`}.
                </p>
            </WebDialog>
        </WebShell>
    );
};

/* ------------------------------------------------------------------ */
/* Waitlist                                                            */
/* ------------------------------------------------------------------ */

const WaitlistConfirmation = ({ q }: { q: InstructionQuery }) => {
    const store = useInstructionStore();
    const [left, setLeft] = useState(false);
    const program = q.service ? programFor(q.service) : undefined;
    const service = q.service ? serviceById(q.service) : undefined;
    const coach = q.coach ? (coachById(q.coach) ?? ANY_INSTRUCTOR) : ANY_INSTRUCTOR;
    if (!program && !service) return <Incomplete title="This waitlist link is incomplete" body="Your request is safe — find it in your account activity." />;
    const id = q.extra.confirmation ?? "WL-10421";
    const course = q.courses[0] ?? program?.courseSlug ?? coach.courseSlugs[0];
    const title = program ? program.name : `${service!.name} with ${coach.isAny ? "any instructor" : coach.name}`;
    const mobile = q.extra.mobile ?? USER.phone;
    const back = program
        ? bookHref({ coach: q.coach ?? "any", service: program.id, course })
        : bookHref({
              coach: q.coach ?? "any",
              service: service!.id,
              course,
              date: q.date,
          });

    return (
        <WebShell active="instruction">
            <WebPage width="content">
                <Hero icon={Bell01} tone="warning" title={left ? "You've left the waitlist" : "You're on the waitlist"} id={id}>
                    {left
                        ? "Nothing was charged. You can join again any time."
                        : `${title}. We'll text ${mobile} the moment a ${program ? "spot" : "slot"} opens that matches — nothing is charged until you accept.`}
                </Hero>
                <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-5">
                    <Panel bodyClassName="flex flex-col gap-4 px-5 py-5 @tablet:px-6">
                        <div className="flex items-center gap-3.5">
                            {program ? (
                                program.image && <img src={program.image} alt="" className="size-14 rounded-lg object-cover" />
                            ) : (
                                <CoachAvatar photo={coach.isAny ? null : coachPhoto(coach)} initials={coach.initials} size="lg" />
                            )}
                            <div className="flex min-w-0 flex-col">
                                <span className="text-lg font-semibold text-primary">{title}</span>
                                <span className="text-sm text-tertiary">{courseName(course)}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 border-t border-secondary pt-4 @tablet:grid-cols-2">
                            <Fact label="Window" value={q.extra.window ?? "First opening"} />
                            <Fact label={program ? "Places" : "Golfers"} value={q.players ?? 1} sub={`Texts to ${mobile}`} />
                        </div>
                    </Panel>
                    <Panel title="What happens next" bodyClassName="px-5 py-4">
                        <ol className="flex flex-col gap-3">
                            {[
                                [
                                    "We watch the calendar",
                                    program
                                        ? "When someone cancels, the first person in line is offered the spot."
                                        : "Every cancellation and newly opened slot is checked against your window.",
                                ],
                                ["You get a text", "With the time and a link. It's held for you for 2 hours."],
                                ["Reply to book it", "Payment happens then — never before."],
                            ].map(([t, d], i) => (
                                <li key={t} className="flex gap-3">
                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-solid text-xs font-semibold text-white tabular-nums">
                                        {i + 1}
                                    </span>
                                    <span className="flex flex-col">
                                        <span className="text-md font-semibold text-primary">{t}</span>
                                        <span className="text-sm text-tertiary">{d}</span>
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </Panel>
                    <div className="flex flex-col gap-2.5 @tablet:flex-row">
                        {!left && (
                            <Button
                                size="web-md"
                                color="outline"
                                onPress={() => {
                                    const e = store.waitlist.find((w) => w.id === id);
                                    if (e) store.leaveWaitlist(e.id);
                                    setLeft(true);
                                }}
                            >
                                Leave the waitlist
                            </Button>
                        )}
                        <WebLink
                            href={back}
                            className={cx(
                                "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-brand-secondary ring-1 ring-brand ring-inset hover:bg-brand-primary_alt",
                                focusRing,
                            )}
                        >
                            {program ? "Back to the program" : "Back to times"}
                        </WebLink>
                        <WebLink
                            href={program ? clinicsHref() : instructionHref()}
                            className={cx("inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-secondary hover:underline", focusRing)}
                        >
                            {program ? "Other programs" : "All instruction"}
                        </WebLink>
                    </div>
                </div>
            </WebPage>
        </WebShell>
    );
};

/* ------------------------------------------------------------------ */
/* Program registration                                                */
/* ------------------------------------------------------------------ */

const RegisteredConfirmation = ({ q }: { q: InstructionQuery }) => {
    const program: BookableProgram | undefined = q.service ? programFor(q.service) : undefined;
    if (!program) return <Incomplete title="This registration link is incomplete" body="Your registration is safe — find it in your account activity." />;
    const id = q.extra.confirmation ?? "REG-20931";
    const people = q.players ?? 1;
    const picked = sessionsParamOf(q);
    const dates = program.perSession && picked.length ? picked : program.sessionDates;
    const paid = Number(q.extra.paid ?? program.price * people);

    return (
        <WebShell active="instruction">
            <WebPage>
                <Hero icon={CheckCircle} tone="success" title="You're registered" id={id}>
                    {`${people} ${people === 1 ? "spot" : "spots"} in ${program.name}. A confirmation is on its way to ${USER.email}, and it's saved to your MCG account.`}
                </Hero>
                <div className="mt-10 grid grid-cols-1 gap-6 @desktop:grid-cols-[minmax(0,1fr)_360px] @desktop:gap-8">
                    <div className="flex min-w-0 flex-col gap-5">
                        <Panel bodyClassName="flex flex-col gap-5 p-0">
                            {program.banner && <img src={program.banner} alt="" className="aspect-[3/1] w-full rounded-t-xl object-cover" />}
                            <div className="flex flex-col gap-5 px-5 pb-5 @tablet:px-6 @tablet:pb-6">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <CoachAvatar photo={program.photo} initials={program.instructorInitials} size="lg" />
                                        <div className="flex flex-col">
                                            <span className="text-lg font-semibold text-primary">{program.name}</span>
                                            <span className="text-sm text-tertiary">with {program.instructorName}</span>
                                        </div>
                                    </div>
                                    <Tag tone="success" variant="soft">
                                        Registered
                                    </Tag>
                                </div>
                                <div className="grid grid-cols-1 gap-5 @tablet:grid-cols-3">
                                    <Fact label="When" value={program.schedule} sub={program.time} />
                                    <Fact label="Where" value={courseShortName(program.courseSlug)} sub={program.location} />
                                    <Fact
                                        label="Paid"
                                        value={money(paid)}
                                        sub={`${people} ${people === 1 ? "person" : "people"}${q.extra.pay ? ` · ${paymentName(q.extra.pay)}` : ""}`}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 border-t border-secondary pt-5">
                                    <span className="caps text-quaternary">Your sessions · {dates.length}</span>
                                    <ul className="grid grid-cols-1 gap-2 @tablet:grid-cols-2">
                                        {dates.map((iso, i) => (
                                            <li key={iso} className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary">
                                                <span className="font-semibold text-primary">{i + 1}</span> {fmtDate(iso)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex flex-col gap-2.5 border-t border-secondary pt-5 @tablet:flex-row">
                                    <AddToCalendar />
                                    <ShareButton />
                                </div>
                            </div>
                        </Panel>
                        <div className="grid grid-cols-1 gap-5 @tablet:grid-cols-2">
                            <Panel title="What to bring" bodyClassName="px-5 py-4">
                                <CheckList items={program.bring} />
                            </Panel>
                            <Panel title="Provided" bodyClassName="px-5 py-4">
                                <CheckList items={program.provided} />
                            </Panel>
                        </div>
                    </div>
                    <aside className="flex flex-col gap-5">
                        <Panel title="Cancellation" bodyClassName="px-5 py-4 text-sm text-tertiary">
                            Free cancellation until 48 hours before the first session ({fmtDate(dates[0] ?? program.sessionDates[0])}). After that a spot can be passed to someone
                            in your household.
                        </Panel>
                        <Panel title="Manage" bodyClassName="flex flex-col gap-2 px-5 py-4">
                            <ManageLink href="/account/events">Your registrations</ManageLink>
                            {program.coachId && <ManageLink href={proHref(program.coachId)}>More with {program.instructorName.split(",")[0]}</ManageLink>}
                            <ManageLink href={clinicsHref()}>Other programs</ManageLink>
                        </Panel>
                    </aside>
                </div>
            </WebPage>
        </WebShell>
    );
};

/* ------------------------------------------------------------------ */
/* Rate a completed lesson (Fox P3 lesson-review-screen)               */
/* ------------------------------------------------------------------ */

const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
    <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-secondary">Your rating</span>
        <div className="flex gap-1.5" role="group" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
                <AriaButton
                    key={n}
                    aria-label={`${n} star${n === 1 ? "" : "s"}`}
                    aria-pressed={value === n}
                    onPress={() => onChange(n)}
                    className={cx("cursor-pointer rounded-md p-1", focusRing)}
                >
                    <Star01 className={cx("size-8", n <= value ? "fill-current text-fg-warning-secondary" : "text-fg-quaternary")} aria-hidden="true" />
                </AriaButton>
            ))}
        </div>
    </div>
);

const RateLesson = ({ q }: { q: InstructionQuery }) => {
    const { navigate } = useWebRouter();
    const [stars, setStars] = useState(0);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [sent, setSent] = useState(false);
    const service = q.service ? serviceById(q.service) : undefined;
    const coach = q.coach ? coachById(q.coach) : undefined;
    if (!service || !coach || coach.isAny)
        return (
            <Incomplete
                title="This review link is incomplete"
                body="Reviews are attached to a completed lesson. Open the link from your post-lesson email, or find the lesson in your account activity."
            />
        );

    const summary = instructorReviews(coach.id);
    const afterThis = summary.count + 1;
    const course = q.courses[0];
    const lessonCard = (
        <div className="flex items-center gap-4 rounded-xl bg-secondary p-4">
            <CoachAvatar photo={coachPhoto(coach)} initials={coach.initials} size="lg" />
            <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-md font-semibold text-primary">{service.name}</p>
                <p className="text-sm text-tertiary">{[`with ${coach.name}`, course ? courseName(course) : null, q.date ? fmtDate(q.date) : null].filter(Boolean).join(" · ")}</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-success-primary">
                    <CheckVerified01 className="size-3.5" aria-hidden="true" />
                    Completed lesson — this review will be marked verified
                </p>
            </div>
        </div>
    );
    const again = () => navigate(proHref(coach.id));

    return (
        <WebShell active="instruction">
            <WebPage width="content">
                <Panel className="mx-auto max-w-2xl" bodyClassName="flex flex-col gap-6 px-5 py-6 @tablet:px-8 @tablet:py-8">
                    {!reviewsEnabled(coach.id) ? (
                        <>
                            <PageHeader
                                title="Thanks for taking a lesson"
                                subtitle={`${coach.name} doesn't collect public reviews. If there's anything about the lesson you'd like the Academy to know, the shop is happy to hear it.`}
                            />
                            {lessonCard}
                            <Button size="web-lg" onPress={again} className="self-start">
                                Book another lesson
                            </Button>
                        </>
                    ) : sent ? (
                        <div className="flex flex-col items-start gap-4">
                            <CheckCircle className="size-10 text-fg-success-primary" aria-hidden="true" />
                            <PageHeader
                                title="Thanks — your review is in"
                                subtitle={
                                    summary.status === "published"
                                        ? `It will appear on ${coach.name}'s profile with your initials once the Academy has checked it, usually within a day.`
                                        : afterThis >= REVIEW_MINIMUM
                                          ? `That makes ${REVIEW_MINIMUM} — ${coach.name}'s rating will be published once the Academy has checked the reviews.`
                                          : `${coach.name}'s rating appears once ${REVIEW_MINIMUM} golfers have reviewed a lesson. Yours makes ${afterThis} of ${REVIEW_MINIMUM}.`
                                }
                            />
                            <Button size="web-lg" onPress={again}>
                                Book another lesson
                            </Button>
                        </div>
                    ) : (
                        <>
                            <PageHeader
                                eyebrow="Verified review"
                                title="How was your lesson?"
                                subtitle="Only golfers who took a lesson can review it. Your review is shown with your initials, never your name."
                            />
                            {lessonCard}
                            <StarPicker value={stars} onChange={setStars} />
                            <TextField label="Headline (optional)" placeholder="Sum it up in a few words" value={title} onChange={setTitle} />
                            <WebTextArea
                                label="Your review (optional)"
                                placeholder="What did you work on? How was booking, setup and pacing?"
                                rows={5}
                                value={text}
                                onChange={setText}
                                hint="Keep it about the lesson — reviews that name other golfers aren't published."
                            />
                            <div className="flex flex-col gap-3 border-t border-secondary pt-5 @tablet:flex-row @tablet:items-center @tablet:justify-between">
                                <p className="text-sm text-tertiary">The Academy checks reviews before they&rsquo;re published.</p>
                                <Button size="web-lg" isDisabled={stars === 0} onPress={() => setSent(true)}>
                                    Submit review
                                </Button>
                            </div>
                        </>
                    )}
                </Panel>
                <p className="mx-auto mt-4 max-w-2xl text-sm text-tertiary">
                    Takes under a minute. Reviews are optional per instructor and only published after {REVIEW_MINIMUM} are in.
                </p>
            </WebPage>
        </WebShell>
    );
};
