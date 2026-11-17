import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell01, Calendar, Clock, GraduationHat01, InfoCircle, MarkerPin01, Plus, Users01 } from "@untitledui/icons";
import { ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup, type Key } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";
import { Tag } from "@/components/base/badge";
import { Notice } from "@/components/feedback/notice";
import { TextField } from "@/components/forms/text-field";
import { Panel } from "@/components/web/web-layout";
import { useWebRouter } from "@/components/web/web-router";
import { USER } from "@/data/crane";
import { WebCheckbox } from "../../checkout/checkout-ui";
import { MenuRow, PlayerAvatar, SelectorCell, YouTag } from "../../tee-times/tee-times-ui";
import { useWebSession } from "../../web-shell";
import {
    ACADEMY_COURSE_ORDER,
    ANY_INSTRUCTOR,
    addDays,
    checkEligibility,
    coachById,
    courseName,
    courseShortName,
    creditsFor,
    dateOfIso,
    dayFor,
    fmtDateShort,
    GOLFER,
    guardrailSummary,
    isoOf,
    LESSON_EXTRAS,
    missingBookingAnswers,
    money,
    money0,
    nextAvailable,
    packageById,
    parseTime,
    PRIVATE_SERVICES,
    proHref,
    SAMPLE_GUESTS,
    serviceHref,
    servicePrice,
    timeParam,
    WAITLIST_WINDOWS,
    WEEKDAYS_SHORT,
    withQuery,
    type Coach,
    type LessonService,
    type Slot,
} from "../data";
import { useInstructionStore } from "../instruction-store";
import { CoachAvatar, DaypartBoard } from "../pro/instructor-ui";
import { useInstructionQuery } from "../use-instruction-query";
import {
    ANY,
    confirmationHref,
    courseFor,
    defaultDate,
    defaultWaitlistTo,
    extrasOf,
    LESSON_RAIL,
    lessonStepOf,
    promoOf,
    quoteLesson,
    timeLabelOf,
    timeRange,
    waitlistWindowLabel,
    withExtra,
    type LessonStep,
} from "./book-model";
import {
    BookingLayout,
    DEFAULT_CARD,
    EligibilityFields,
    IconTile,
    MoneyBlock,
    MoneyRow,
    MultiPills,
    PaymentOptions,
    paymentName,
    PrimaryAction,
    PromoBox,
    QuestionField,
    SignInGate,
    StepPanel,
    SummaryBlock,
    WebTextArea,
} from "./booking-ui";
import { DateStrip } from "./date-strip";

interface Golfer {
    first: string;
    last: string;
    birthDate?: string;
    answers: Record<string, string>;
}

const longDay = (iso: string) =>
    dateOfIso(iso).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
const golfersLabel = (n: number) => `${n} ${n === 1 ? "golfer" : "golfers"}`;

/** Golfer 1 is the booker; a junior lesson opens on a child (the sample guest), since juniors rarely book themselves. */
const seedGolfers = (service: LessonService): Golfer[] => {
    const kid = service.audience === "junior";
    const host: Golfer = kid
        ? {
              first: SAMPLE_GUESTS[0].first,
              last: SAMPLE_GUESTS[0].last,
              birthDate: SAMPLE_GUESTS[0].birthDate,
              answers: {},
          }
        : { first: GOLFER.first, last: GOLFER.last, answers: {} };
    const guests = SAMPLE_GUESTS.slice(kid ? 1 : 0).map((g) => ({
        first: g.first,
        last: g.last,
        birthDate: service.rules?.age ? g.birthDate : undefined,
        answers: {},
    }));
    return [host, ...guests, { first: "", last: "", answers: {} }];
};

/**
 * Booking a private lesson — Fox Prototype 3's Square-style flow, rebuilt on Crane's tee-time
 * checkout: Date & time (date strip + Morning / Afternoon / Evening board, waitlist when nothing
 * fits) → Details (golfers, questions, extras, note) → Sign in (only for guests) → Payment (lesson
 * credit, saved cards, pay at the lesson, promo) → Review & confirm → `/instruction/review`.
 */
export const LessonBooking = ({ service, coachId }: { service: LessonService; coachId: string }) => {
    const { query, setQuery } = useInstructionQuery();
    const { userName } = useWebSession();
    const { navigate } = useWebRouter();
    const store = useInstructionStore();

    const anyMode = coachId === ANY;
    const pickedCoach = coachById(coachId) ?? ANY_INSTRUCTOR;
    const course = courseFor(query, service, pickedCoach);
    const dateIso = defaultDate(service, coachId, course, query);
    const slots = useMemo(() => dayFor(service, coachId, course, dateOfIso(dateIso)), [service, coachId, course, dateIso]);

    /* ---- page state (written to the URL when the golfer continues) ---- */
    const [time, setTime] = useState<string | undefined>(query.time);
    useEffect(() => setTime(query.time), [query.time]);
    const [players, setPlayers] = useState(Math.min(query.players ?? 1, service.maxPlayers));
    useEffect(() => setPlayers(Math.min(query.players ?? 1, service.maxPlayers)), [query.players, service.maxPlayers]);
    const [golfers, setGolfers] = useState<Golfer[]>(() => seedGolfers(service));
    const [bookingAnswers, setBookingAnswers] = useState<Record<string, string>>({});
    const [extraIds, setExtraIds] = useState<string[]>(() => extrasOf(query).map((e) => e.id));
    const [note, setNote] = useState("");
    const [pay, setPay] = useState<string>(query.extra.pay ?? DEFAULT_CARD);
    const [promo, setPromo] = useState<string | null>(promoOf(query));
    const [booking, setBooking] = useState(false);
    // Waitlist
    const [waitFrom, setWaitFrom] = useState(dateIso);
    const [waitTo, setWaitTo] = useState(defaultWaitlistTo(dateIso));
    const [waitParts, setWaitParts] = useState<string[]>(["any"]);
    const [waitDays, setWaitDays] = useState<string[]>([]);
    const [mobile, setMobile] = useState(USER.phone);
    const [email, setEmail] = useState(USER.email);

    const slot: Slot | undefined = time ? slots.find((s) => s.minutes === parseTime(time) && s.status === "open") : undefined;
    const coach: Coach | undefined = anyMode ? (slot?.coachId ? coachById(slot.coachId) : undefined) : pickedCoach;
    const shown = coach ?? ANY_INSTRUCTOR;

    /* ---- which step really shows (deep links are checked, never trusted) ---- */
    const asked = lessonStepOf(query.step);
    let step: LessonStep = asked;
    if (step !== "time" && step !== "waitlist" && !slot) step = "time";
    if ((step === "payment" || step === "confirm") && !userName) step = "account";
    if (step === "account" && userName) step = "payment";
    const lostTime = asked !== step && step === "time" && asked !== "time";

    /* ---- money ---- */
    const extras = LESSON_EXTRAS.filter((e) => extraIds.includes(e.id));
    const lesson = servicePrice(service, coach, players);
    const balance = coach ? creditsFor(coach.id, service.id, store.balances)[0] : undefined;
    const creditOk = !!balance && players === 1;
    const effectivePay = pay === "credit" && !creditOk ? DEFAULT_CARD : pay;
    const quote = quoteLesson({ lesson, extras, promo, pay: effectivePay });
    const usesCredit = effectivePay === "credit";

    /* ---- validation (details) ---- */
    const party = golfers.slice(0, players);
    const eligibility = party.map((g, i) => checkEligibility(service.rules, { birthDate: g.birthDate, answers: g.answers }, dateIso, g.first || `Golfer ${i + 1}`));
    const missingNames = party.some((g) => !g.first.trim());
    const blocked = eligibility.some((r) => r.problems.length > 0);
    const incomplete = missingNames || eligibility.some((r) => r.incomplete) || missingBookingAnswers(service.rules, bookingAnswers).length > 0;

    const go = (next: LessonStep, extra?: Record<string, string>) =>
        setQuery({
            step: next === "time" ? undefined : next,
            date: dateIso,
            time: slot ? timeParam(slot.minutes) : undefined,
            players,
            ...(extra ? { extra } : {}),
        });

    const railIndex = {
        time: 0,
        waitlist: 0,
        details: 1,
        account: 2,
        payment: 3,
        confirm: 4,
    }[step];
    const back = anyMode || !coach ? { href: serviceHref(service.id, course), label: service.name } : { href: proHref(coach.id), label: coach.name };

    const book = () => {
        if (!slot || !coach) return;
        setBooking(true);
        setTimeout(() => {
            const rec = store.bookLesson({
                coachId: coach.id,
                serviceId: service.id,
                courseSlug: course,
                date: dateIso,
                time: slot.label,
                players,
                total: quote.total,
                creditBalanceId: usesCredit ? balance?.id : undefined,
            });
            if (usesCredit && balance) store.spendCredit(balance.id, `${service.name} · ${courseShortName(course)}`, quote.lesson);
            setBooking(false);
            navigate(
                confirmationHref(
                    "booked",
                    {
                        coach: coach.id,
                        service: service.id,
                        course,
                        date: dateIso,
                        time: timeParam(slot.minutes),
                        players,
                    },
                    {
                        confirmation: rec.id,
                        paid: quote.dueNow.toFixed(2),
                        due: quote.dueAtLesson ? quote.dueAtLesson.toFixed(2) : undefined,
                        credit: usesCredit ? "1" : undefined,
                        pay: effectivePay,
                        extras: extraIds.join(",") || undefined,
                        promo: !usesCredit && promo ? promo : undefined,
                        matched: anyMode ? "1" : undefined,
                    },
                ),
            );
        }, 700);
    };

    /* ---- summary rail ---- */
    const summary = (
        <>
            <SummaryBlock
                lead={<CoachAvatar photo={shown.photo} initials={shown.initials} size="md" />}
                title={coach ? (coach.credential ? `${coach.name}, ${coach.credential}` : coach.name) : "Any available instructor"}
                lines={[anyMode ? (coach ? "First available — matched to your time" : `Whoever is free at ${courseShortName(course)}`) : coach?.title]}
                edit={
                    step !== "time"
                        ? {
                              label: "Change instructor",
                              onPress: () => navigate(serviceHref(service.id, course)),
                          }
                        : undefined
                }
            />
            <SummaryBlock
                lead={<IconTile icon={GraduationHat01} />}
                title={service.name}
                lines={[
                    `${service.durationMin} min · ${golfersLabel(players)}`,
                    guardrailSummary(service) ? <span className="text-warning-primary">{guardrailSummary(service)}</span> : null,
                ]}
                edit={step !== "time" ? { label: "Change lesson", onPress: () => go("time") } : undefined}
            />
            <SummaryBlock
                lead={<IconTile icon={Calendar} />}
                title={step === "waitlist" ? "Waitlist — first matching slot" : slot ? longDay(dateIso) : "Choose a time"}
                lines={[slot ? timeRange(timeParam(slot.minutes), service.durationMin + extras.reduce((n, e) => n + (e.minutes ?? 0), 0)) : longDay(dateIso), courseName(course)]}
                edit={step !== "time" ? { label: "Change date and time", onPress: () => go("time") } : undefined}
            />
            {extras.length > 0 && (
                <SummaryBlock
                    lead={<IconTile icon={Plus} />}
                    title="Extras"
                    lines={extras.map((e) => `${e.name} · ${money(e.price)}`)}
                    edit={step === "payment" || step === "confirm" ? { label: "Change extras", onPress: () => go("details") } : undefined}
                />
            )}
            {step === "waitlist" ? (
                <MoneyBlock>
                    <MoneyRow label="Due now" value={money(0)} />
                    <p className="text-sm text-tertiary">
                        Nothing is charged until a slot opens and you accept it — then it's {coach ? money(quote.total) : `from ${money(lesson)}`} with the facility fee, or a
                        lesson credit.
                    </p>
                </MoneyBlock>
            ) : (
                <MoneyBlock>
                    <MoneyRow label={`Lesson · ${golfersLabel(players)}`} value={coach ? money(lesson) : `from ${money(lesson)}`} />
                    {quote.extras > 0 && <MoneyRow label="Extras" value={money(quote.extras)} />}
                    {quote.discount > 0 && <MoneyRow label={quote.promoLabel ?? "Promo"} value={`−${money(quote.discount)}`} tone="success" />}
                    {usesCredit && <MoneyRow label="Lesson credit (1)" value={`−${money(quote.creditApplied)}`} tone="success" />}
                    <MoneyRow label="Facility fee" value={quote.facilityWaived ? "Included" : money(quote.facilityFee)} tone={quote.facilityWaived ? "muted" : undefined} />
                    <div className="mt-1 border-t border-secondary pt-3">
                        <MoneyRow strong label="Total" value={money(quote.total)} />
                    </div>
                    {effectivePay === "lesson" && (
                        <>
                            <MoneyRow label="Due today" value={money(0)} />
                            <MoneyRow label="Due at the lesson" value={money(quote.dueAtLesson)} />
                        </>
                    )}
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-tertiary">
                        <InfoCircle className="mt-0.5 size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                        Free cancellation until 24 hours before your lesson.
                    </p>
                </MoneyBlock>
            )}
        </>
    );

    /* ---- per-step header + action ---- */
    const titles: Record<LessonStep, [string, string]> = {
        time: [
            "Choose a time",
            `${service.name} with ${anyMode ? "any available instructor" : pickedCoach.name} at ${courseShortName(course)}. Change any of it here without starting again.`,
        ],
        waitlist: [
            "Join the waitlist",
            `Tell us when you could play and we'll text you the moment ${anyMode ? "an instructor" : pickedCoach.name} has a matching slot. Nothing is charged until you accept.`,
        ],
        details: ["Who's taking the lesson", "Everyone on the lesson, so your instructor knows who to expect."],
        account: ["Sign in to book", "MCG saves every lesson to an account. Your time is held while you sign in."],
        payment: ["Payment", "Lesson held for 10 minutes. You won't be charged until you confirm."],
        confirm: ["Review and confirm", "Check everything once more — each part can still be changed."],
    };

    const detailsMissing = !userName ? null : blocked ? "Someone on this booking can't take this lesson." : incomplete ? "Fill in the required details to continue." : null;
    const action = (() => {
        switch (step) {
            case "time":
                return (
                    <PrimaryAction onPress={() => go("details")} isDisabled={!slot} icon={ArrowRight}>
                        {slot ? "Continue" : "Choose a time"}
                    </PrimaryAction>
                );
            case "details":
                return (
                    <PrimaryAction
                        onPress={() => go(userName ? "payment" : "account", withExtra(query, { extras: extraIds.join(",") || undefined }))}
                        isDisabled={blocked || incomplete}
                        icon={ArrowRight}
                    >
                        Continue
                    </PrimaryAction>
                );
            case "payment":
                return (
                    <PrimaryAction
                        onPress={() =>
                            go(
                                "confirm",
                                withExtra(query, {
                                    pay: effectivePay,
                                    promo: !usesCredit && promo ? promo : undefined,
                                    extras: extraIds.join(",") || undefined,
                                }),
                            )
                        }
                        icon={ArrowRight}
                    >
                        Review booking
                    </PrimaryAction>
                );
            case "confirm":
                return (
                    <PrimaryAction onPress={book} isLoading={booking}>
                        {usesCredit && quote.total === 0
                            ? "Confirm — $0.00 with credit"
                            : effectivePay === "lesson"
                              ? "Confirm — pay at the lesson"
                              : `Confirm and pay ${money(quote.total)}`}
                    </PrimaryAction>
                );
            case "waitlist":
                return (
                    <PrimaryAction
                        icon={Bell01}
                        isDisabled={!mobile.trim() || !waitFrom}
                        onPress={() => {
                            const window = waitlistWindowLabel({
                                from: waitFrom,
                                to: waitTo,
                                dayparts: waitParts,
                                days: waitDays.map(Number),
                            });
                            const entry = store.joinWaitlist({
                                coachId: anyMode ? undefined : pickedCoach.id,
                                serviceId: service.id,
                                courseSlug: course,
                                window,
                            });
                            navigate(
                                confirmationHref(
                                    "waitlisted",
                                    {
                                        coach: coachId,
                                        service: service.id,
                                        course,
                                        date: waitFrom,
                                        players,
                                    },
                                    {
                                        confirmation: entry.id,
                                        window,
                                        to: waitTo || undefined,
                                        mobile,
                                    },
                                ),
                            );
                        }}
                    >
                        Join the waitlist
                    </PrimaryAction>
                );
            default:
                return undefined;
        }
    })();

    return (
        <BookingLayout
            back={back}
            eyebrow="Book a lesson"
            title={titles[step][0]}
            subtitle={titles[step][1]}
            rail={
                step === "waitlist"
                    ? undefined
                    : {
                          steps: LESSON_RAIL.map((s) => (s.id === "account" && userName ? { ...s, doneLabel: "Signed in" } : s)),
                          current: railIndex,
                          onStep: (id) => go(id as LessonStep),
                      }
            }
            summary={summary}
            summaryTitle="Lesson summary"
            summaryLine={`${fmtDateShort(dateIso)}${slot ? ` · ${slot.label}` : ""} · ${golfersLabel(players)}`}
            price={step === "waitlist" ? money(0) : coach ? money(quote.total) : `from ${money0(lesson)}`}
            priceNote={
                step === "time"
                    ? slot
                        ? `${slot.label} · ${fmtDateShort(dateIso)}`
                        : "Choose a time"
                    : step === "confirm" || step === "payment"
                      ? effectivePay === "lesson"
                          ? "Due at the lesson"
                          : paymentName(effectivePay)
                      : step === "waitlist"
                        ? "Nothing charged now"
                        : `${service.name} · ${slot?.label ?? ""}`
            }
            action={action}
            actionNote={step === "details" ? detailsMissing : step === "confirm" ? "By confirming you agree to the Academy's 24-hour cancellation policy." : undefined}
        >
            {lostTime && (
                <Notice tone="warning" className="rounded-lg text-sm">
                    {query.time ? `${timeLabelOf(query.time)} on ${fmtDateShort(dateIso)} isn't open any more.` : "Choose a time first."} Pick another time to continue — everything
                    else is kept.
                </Notice>
            )}

            {step === "time" && (
                <TimeStep
                    service={service}
                    coachId={coachId}
                    pickedCoach={pickedCoach}
                    course={course}
                    dateIso={dateIso}
                    slots={slots}
                    selected={slot?.minutes ?? null}
                    players={players}
                    onPlayers={setPlayers}
                    onSelect={(s) => setTime(timeParam(s.minutes))}
                    onDate={(iso) => {
                        setTime(undefined);
                        setQuery({ date: iso, time: undefined }, { replace: true });
                    }}
                    onService={(id) => setQuery({ service: id, time: undefined, players: undefined }, { replace: true })}
                    onCourse={(slug) => setQuery({ courses: [slug], date: undefined, time: undefined }, { replace: true })}
                    onWaitlist={() => setQuery({ step: "waitlist", date: dateIso, time: undefined })}
                />
            )}

            {step === "waitlist" && (
                <>
                    <StepPanel title="Between which dates?" sub="Leave the end date blank to wait for whatever opens first.">
                        <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                            <TextField label="From" type="date" value={waitFrom} onChange={setWaitFrom} isRequired />
                            <TextField label="To" type="date" value={waitTo} onChange={setWaitTo} hint="Optional" />
                        </div>
                    </StepPanel>
                    <StepPanel title="Times of day that work">
                        <MultiPills
                            label="Times of day"
                            options={WAITLIST_WINDOWS.map((w) => ({
                                id: w.id,
                                label: w.label,
                            }))}
                            value={waitParts}
                            onChange={(ids) => {
                                const added = ids.find((x) => !waitParts.includes(x));
                                setWaitParts(added === "any" || ids.length === 0 ? ["any"] : ids.filter((x) => x !== "any"));
                            }}
                        />
                    </StepPanel>
                    <StepPanel title="Days that work" sub={waitDays.length === 0 ? "Any day" : `${waitDays.length} ${waitDays.length === 1 ? "day" : "days"} selected`}>
                        <MultiPills
                            label="Days"
                            options={WEEKDAYS_SHORT.map((d, i) => ({
                                id: String(i),
                                label: d,
                            }))}
                            value={waitDays}
                            onChange={setWaitDays}
                        />
                    </StepPanel>
                    <StepPanel title="Where to reach you" sub="We text the moment a slot matches — first to reply takes it.">
                        <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                            <TextField label="Mobile" type="tel" value={mobile} onChange={setMobile} isRequired />
                            <TextField label="Email" type="email" value={email} onChange={setEmail} />
                        </div>
                    </StepPanel>
                    <Button size="web-md" color="outline" onPress={() => setQuery({ step: undefined })} className="self-start">
                        Back to times
                    </Button>
                </>
            )}

            {step === "details" && (
                <>
                    {service.maxPlayers > 1 && (
                        <StepPanel
                            title="How many golfers?"
                            sub={`${service.name} takes up to ${service.maxPlayers}. The instructor's ${service.durationMin} minutes are the same either way, so each golfer pays less.`}
                        >
                            <AriaToggleButtonGroup
                                aria-label="Golfers"
                                selectionMode="single"
                                disallowEmptySelection
                                selectedKeys={[String(players)]}
                                onSelectionChange={(keys: Set<Key>) => {
                                    const [k] = keys;
                                    if (k != null) setPlayers(Number(k));
                                }}
                                className="grid grid-cols-2 gap-2.5 @tablet:grid-cols-4"
                            >
                                {Array.from({ length: service.maxPlayers }, (_, i) => i + 1).map((n) => {
                                    const total = servicePrice(service, coach, n);
                                    return (
                                        <AriaToggleButton
                                            key={n}
                                            id={String(n)}
                                            className="flex cursor-pointer flex-col items-start gap-0.5 rounded-xl bg-primary px-4 py-3 text-left ring-1 ring-secondary transition duration-100 ease-linear ring-inset hover:bg-primary_hover data-[selected]:bg-brand-primary_alt data-[selected]:ring-2 data-[selected]:ring-brand"
                                        >
                                            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                                                <Users01 className="size-4 text-fg-quaternary" aria-hidden="true" />
                                                {golfersLabel(n)}
                                            </span>
                                            <span className="text-md font-semibold text-primary tabular-nums">{money0(total)}</span>
                                            <span className="text-xs text-tertiary tabular-nums">{n > 1 ? `${money0(total / n)} each` : "Just you"}</span>
                                        </AriaToggleButton>
                                    );
                                })}
                            </AriaToggleButtonGroup>
                            {balance && players > 1 && (
                                <p className="text-sm text-tertiary">Your lesson credits cover one golfer — with {players} golfers this lesson is paid by card.</p>
                            )}
                        </StepPanel>
                    )}

                    <Panel title={`Golfers · ${party.filter((g) => g.first.trim()).length} of ${players} added`}>
                        <ul className="divide-y divide-secondary">
                            {party.map((g, i) => {
                                const me = i === 0 && g.first === GOLFER.first && g.last === GOLFER.last;
                                const set = (patch: Partial<Golfer>) => setGolfers((list) => list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
                                return (
                                    <li key={i} className="flex flex-col gap-4 px-5 py-5 @tablet:px-6">
                                        <div className="flex items-center gap-3">
                                            <PlayerAvatar number={i + 1} name={g.first ? `${g.first} ${g.last}` : undefined} />
                                            <span className="flex min-w-0 flex-1 items-center gap-2 text-md font-semibold text-primary">
                                                <span className="truncate">{g.first ? `${g.first} ${g.last}` : `Golfer ${i + 1}`}</span>
                                                {me && <YouTag />}
                                                {i === 0 && !me && <span className="text-sm font-normal text-tertiary">· booked by {userName ?? "you"}</span>}
                                            </span>
                                        </div>
                                        {!me && (
                                            <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                                                <TextField label="First name" value={g.first} onChange={(v) => set({ first: v })} isRequired />
                                                <TextField label="Last name" value={g.last} onChange={(v) => set({ last: v })} />
                                            </div>
                                        )}
                                        <EligibilityFields
                                            rules={service.rules}
                                            birthDate={g.birthDate}
                                            answers={g.answers}
                                            onBirthDate={(v) => set({ birthDate: v })}
                                            onAnswer={(id, v) => set({ answers: { ...g.answers, [id]: v } })}
                                            asOf={dateIso}
                                            result={eligibility[i]}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </Panel>

                    {(service.rules?.questions ?? []).some((q) => q.per === "booking") && (
                        <StepPanel title="About this lesson" sub="Asked once, so the instructor can plan the session.">
                            {(service.rules?.questions ?? [])
                                .filter((q) => q.per === "booking")
                                .map((q) => (
                                    <QuestionField key={q.id} question={q} value={bookingAnswers[q.id] ?? ""} onChange={(v) => setBookingAnswers((a) => ({ ...a, [q.id]: v }))} />
                                ))}
                        </StepPanel>
                    )}

                    <StepPanel
                        title="Add to your lesson"
                        sub="Optional, and charged with the booking."
                        right={
                            <Tag tone="gray" variant="soft">
                                Sample extras
                            </Tag>
                        }
                    >
                        <div className="flex flex-col gap-3">
                            {LESSON_EXTRAS.map((e) => (
                                <div key={e.id} className="flex items-start justify-between gap-4 rounded-lg px-1">
                                    <WebCheckbox
                                        isSelected={extraIds.includes(e.id)}
                                        onChange={(on) => setExtraIds((ids) => (on ? [...ids, e.id] : ids.filter((x) => x !== e.id)))}
                                    >
                                        <span className="flex flex-col">
                                            <span className="text-md font-medium text-primary">{e.name}</span>
                                            <span className="text-sm text-tertiary">
                                                {e.desc}
                                                {e.minutes ? ` · +${e.minutes} min` : ""}
                                            </span>
                                        </span>
                                    </WebCheckbox>
                                    <span className="shrink-0 text-md font-medium text-primary tabular-nums">{money(e.price)}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-tertiary">MCG doesn&rsquo;t publish lesson add-ons — these show how they&rsquo;d work.</p>
                    </StepPanel>

                    <StepPanel title={`Note for ${coach?.name ?? "your instructor"}`} sub="Optional — anything they should know before you arrive.">
                        <WebTextArea label="Lesson note" value={note} onChange={setNote} placeholder="Slicing my driver, and I play at Falls Road most Saturdays." />
                    </StepPanel>
                </>
            )}

            {step === "account" && (
                <SignInGate
                    what="lesson"
                    nextHref={withQuery("/instruction/book", {
                        ...query,
                        step: "payment",
                        date: dateIso,
                        time: slot ? timeParam(slot.minutes) : undefined,
                        players,
                        extra: withExtra(query, {
                            extras: extraIds.join(",") || undefined,
                        }),
                    })}
                    onSignedIn={() => go("payment", withExtra(query, { extras: extraIds.join(",") || undefined }))}
                />
            )}

            {step === "payment" && (
                <>
                    <SignInGate what="lesson" nextHref="" onSignedIn={() => undefined} />
                    <StepPanel title="How you're paying" sub="MCG charges online bookings when you confirm. No invoices.">
                        <PaymentOptions
                            value={effectivePay}
                            onChange={setPay}
                            payAtLesson
                            courseShort={courseShortName(course)}
                            credit={
                                balance && coach
                                    ? {
                                          remaining: balance.creditsRemaining,
                                          total: balance.creditsTotal,
                                          coachName: coach.name,
                                          expiresOn: balance.expiresOn,
                                          blockedReason: creditOk
                                              ? undefined
                                              : `Your credits cover ${service.name.toLowerCase()}s with ${coach.name}, one golfer at a time. This booking has ${players}.`,
                                      }
                                    : undefined
                            }
                        />
                        {usesCredit && balance && (
                            <Notice tone="success" className="rounded-lg text-sm">
                                One credit applied — {money(quote.creditApplied)} covered. That leaves {balance.creditsRemaining - 1}{" "}
                                {balance.creditsRemaining - 1 === 1 ? "lesson" : "lessons"} with {coach?.name}
                                {packageById(balance.packageId)?.expiration ? `, good through ${packageById(balance.packageId)!.expiration}.` : "."}
                            </Notice>
                        )}
                    </StepPanel>
                    <StepPanel title="Promo code">
                        <PromoBox
                            applied={promo}
                            onApply={setPromo}
                            onRemove={() => setPromo(null)}
                            disabledReason={usesCredit ? "Promo codes don't combine with a lesson credit." : undefined}
                        />
                    </StepPanel>
                    <StepPanel title="Cancellation">
                        <p className="text-sm text-tertiary">
                            Cancel or reschedule at least 24 hours before your lesson and your {usesCredit ? "credit is" : "payment is"} returned in full. Inside 24 hours the
                            lesson is charged
                            {usesCredit ? " (the credit is spent)" : ""}, at the instructor&rsquo;s discretion.
                        </p>
                    </StepPanel>
                </>
            )}

            {step === "confirm" && slot && (
                <>
                    <StepPanel title="Lesson" right={<EditLink onPress={() => go("time")}>Change</EditLink>}>
                        <div className="flex items-center gap-3">
                            <CoachAvatar photo={shown.photo} initials={shown.initials} size="lg" />
                            <div className="flex min-w-0 flex-col">
                                <span className="text-md font-semibold text-primary">
                                    {service.name} with {coach?.name}
                                </span>
                                <span className="text-sm text-tertiary">
                                    {longDay(dateIso)} · {timeRange(timeParam(slot.minutes), service.durationMin)}
                                </span>
                                <span className="text-sm text-tertiary">{courseName(course)} · check in at the pro shop</span>
                            </div>
                        </div>
                        {anyMode && (
                            <p className="text-sm text-tertiary">
                                You asked for any available instructor — {coach?.name} is free at {slot.label}.
                            </p>
                        )}
                    </StepPanel>
                    <StepPanel title={`Golfers · ${players}`} right={<EditLink onPress={() => go("details")}>Change</EditLink>}>
                        <ul className="flex flex-col gap-2">
                            {party.map((g, i) => (
                                <li key={i} className="flex items-center gap-3 text-md text-primary">
                                    <PlayerAvatar name={`${g.first} ${g.last}`} size="sm" />
                                    {g.first} {g.last}
                                </li>
                            ))}
                        </ul>
                        {Object.entries(bookingAnswers).filter(([, v]) => v).length > 0 && <p className="text-sm text-tertiary">Working on: {bookingAnswers.focus}</p>}
                        {extras.length > 0 && <p className="text-sm text-tertiary">Extras: {extras.map((e) => e.name).join(", ")}</p>}
                        {note && <p className="text-sm text-tertiary">Note: &ldquo;{note}&rdquo;</p>}
                    </StepPanel>
                    <StepPanel title="Payment" right={<EditLink onPress={() => go("payment")}>Change</EditLink>}>
                        <p className="text-md text-primary">{paymentName(effectivePay)}</p>
                        {usesCredit && balance && (
                            <p className="text-sm text-tertiary">
                                1 of {balance.creditsRemaining} credits with {coach?.name}. Extras{quote.extras ? ` (${money(quote.extras)})` : ""} go on your card on file.
                            </p>
                        )}
                        {quote.promoLabel && (
                            <p className="text-sm text-success-primary">
                                {promo} — {quote.promoLabel}
                            </p>
                        )}
                    </StepPanel>
                </>
            )}
        </BookingLayout>
    );
};

const EditLink = ({ children, onPress }: { children: string; onPress: () => void }) => (
    <Button size="web-sm" color="plain" onPress={onPress}>
        {children}
    </Button>
);

/* ------------------------------------------------------------------ */
/* Time step                                                           */
/* ------------------------------------------------------------------ */

const TimeStep = ({
    service,
    coachId,
    pickedCoach,
    course,
    dateIso,
    slots,
    selected,
    players,
    onPlayers,
    onSelect,
    onDate,
    onService,
    onCourse,
    onWaitlist,
}: {
    service: LessonService;
    coachId: string;
    pickedCoach: Coach;
    course: string;
    dateIso: string;
    slots: Slot[];
    selected: number | null;
    players: number;
    onPlayers: (n: number) => void;
    onSelect: (s: Slot) => void;
    onDate: (iso: string) => void;
    onService: (id: string) => void;
    onCourse: (slug: string) => void;
    onWaitlist: () => void;
}) => {
    const [open, setOpen] = useState<null | "lesson" | "course" | "players">(null);
    const cell = (k: NonNullable<typeof open>) => ({
        isOpen: open === k,
        onOpenChange: (o: boolean) => setOpen(o ? k : null),
    });
    const anyMode = coachId === ANY;
    const courses = anyMode ? ACADEMY_COURSE_ORDER : pickedCoach.courseSlugs;
    const priceCoach = anyMode ? undefined : pickedCoach;
    const openSlots = slots.filter((s) => s.status === "open");
    const next = openSlots.length === 0 ? nextAvailable(service, coachId, course, addDays(dateOfIso(dateIso), 1)) : null;
    const countFor = (iso: string) => dayFor(service, coachId, course, dateOfIso(iso)).filter((s) => s.status === "open").length;

    return (
        <>
            <div className="relative grid grid-cols-2 rounded-xl bg-primary ring-1 ring-secondary ring-inset @tablet:grid-cols-3 @tablet:divide-x @tablet:divide-secondary">
                <SelectorCell
                    label="Lesson"
                    value={`${service.name}`}
                    icon={GraduationHat01}
                    {...cell("lesson")}
                    className="col-span-2 border-b border-secondary @tablet:col-span-1 @tablet:border-b-0"
                    panelClassName="@tablet:w-80"
                >
                    {(close) => (
                        <div className="flex flex-col gap-0.5">
                            {PRIVATE_SERVICES.map((s) => (
                                <MenuRow
                                    key={s.id}
                                    selected={s.id === service.id}
                                    label={s.name}
                                    detail={`${s.durationMin} min · ${anyMode ? "from " : ""}${money0(servicePrice(s, priceCoach, 1))}${guardrailSummary(s) ? ` · ${guardrailSummary(s)}` : ""}`}
                                    onPress={() => {
                                        onService(s.id);
                                        close();
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </SelectorCell>
                <SelectorCell label="Course" value={courseShortName(course)} icon={MarkerPin01} {...cell("course")} className="border-r border-secondary @tablet:border-r-0">
                    {(close) => (
                        <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
                            {courses.map((slug) => (
                                <MenuRow
                                    key={slug}
                                    selected={slug === course}
                                    label={courseName(slug)}
                                    onPress={() => {
                                        onCourse(slug);
                                        close();
                                    }}
                                />
                            ))}
                            {!anyMode && courses.length === 1 && (
                                <p className="px-3 pt-2 text-sm text-tertiary">
                                    {pickedCoach.name} teaches at {courseShortName(course)} only.
                                </p>
                            )}
                        </div>
                    )}
                </SelectorCell>
                <SelectorCell label="Golfers" value={golfersLabel(players)} icon={Users01} align="right" {...cell("players")}>
                    {(close) => (
                        <div className="flex flex-col gap-0.5">
                            {Array.from({ length: service.maxPlayers }, (_, i) => i + 1).map((n) => (
                                <MenuRow
                                    key={n}
                                    selected={players === n}
                                    label={golfersLabel(n)}
                                    detail={`${anyMode ? "from " : ""}${money0(servicePrice(service, priceCoach, n))}${n > 1 ? ` · ${money0(servicePrice(service, priceCoach, n) / n)} each` : ""}`}
                                    onPress={() => {
                                        onPlayers(n);
                                        close();
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </SelectorCell>
            </div>

            <Panel bodyClassName="flex flex-col gap-6 px-5 py-5 @tablet:px-6 @tablet:py-6">
                <DateStrip value={dateIso} onChange={onDate} openCount={countFor} />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-secondary pt-5">
                    <h2 className="text-lg font-semibold text-primary">{longDay(dateIso)}</h2>
                    <span className="flex items-center gap-1.5 text-sm text-tertiary tabular-nums">
                        <Clock className="size-4 text-fg-quaternary" aria-hidden="true" />
                        {openSlots.length} open · {slots.length - openSlots.length} taken
                    </span>
                </div>
                {guardrailSummary(service) && (
                    <p className="-mt-3 text-sm text-warning-primary">
                        {service.name}: {guardrailSummary(service)}. Times outside that show as &ldquo;Not offered&rdquo;.
                    </p>
                )}
                {openSlots.length === 0 ? (
                    <div className="flex flex-col gap-4 rounded-xl bg-secondary p-5">
                        <p className="text-md text-secondary">
                            {next ? `Nothing open on ${longDay(dateIso)}. The next opening is ${longDay(isoOf(next))}.` : "Nothing open in the next eight weeks."}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {next && (
                                <Button size="web-md" onPress={() => onDate(isoOf(next))}>
                                    Go to {fmtDateShort(isoOf(next))}
                                </Button>
                            )}
                            <Button size="web-md" color="outline" iconLeading={Bell01} onPress={onWaitlist}>
                                Join the waitlist
                            </Button>
                        </div>
                    </div>
                ) : (
                    <DaypartBoard
                        slots={slots}
                        selected={selected}
                        onSelect={onSelect}
                        priceFor={(s) => servicePrice(service, anyMode ? coachById(s.coachId ?? "") : pickedCoach, players)}
                        noteFor={anyMode ? (s) => (s.coachId ? coachById(s.coachId)?.name.split(" ")[0] : undefined) : undefined}
                    />
                )}
                {openSlots.length > 0 && (
                    <div className={cx("flex flex-wrap items-center justify-between gap-3 border-t border-secondary pt-5")}>
                        <p className="text-sm text-tertiary">Don&rsquo;t see a time that works?</p>
                        <Button size="web-md" color="outline" iconLeading={Bell01} onPress={onWaitlist}>
                            Join the waitlist
                        </Button>
                    </div>
                )}
            </Panel>
        </>
    );
};
