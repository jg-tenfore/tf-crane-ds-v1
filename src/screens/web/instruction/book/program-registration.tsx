import { useEffect, useState } from "react";
import { ArrowRight, Bell01, Calendar, Clock, MarkerPin01, Users01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Tag } from "@/components/base/badge";
import { Notice } from "@/components/feedback/notice";
import { TextField } from "@/components/forms/text-field";
import { Panel } from "@/components/web/web-layout";
import { useWebRouter } from "@/components/web/web-router";
import { USER } from "@/data/crane";
import { WebCheckbox } from "../../checkout/checkout-ui";
import { CheckList, SpotsMeter, Stepper } from "../../events/events-ui";
import { PlayerAvatar, YouTag } from "../../tee-times/tee-times-ui";
import { useWebSession } from "../../web-shell";
import {
    ageOn,
    ageRangeLabel,
    checkEligibility,
    clinicsHref,
    courseShortName,
    dateOfIso,
    fmtDateShort,
    genderNote,
    GOLFER,
    missingBookingAnswers,
    money,
    money0,
    multiBuyLabel,
    proHref,
    SAMPLE_GUESTS,
    serviceHref,
    TODAY_ISO,
    withQuery,
} from "../data";
import { useInstructionStore } from "../instruction-store";
import { CoachAvatar, MetaLine } from "../pro/instructor-ui";
import { useInstructionQuery } from "../use-instruction-query";
import {
    confirmationHref,
    PROGRAM_RAIL,
    programStepOf,
    promoOf,
    quoteProgram,
    sessionsParamOf,
    upcomingSessions,
    withExtra,
    type BookableProgram,
    type ProgramStep,
} from "./book-model";
import {
    BookingLayout,
    DEFAULT_CARD,
    EligibilityFields,
    MoneyBlock,
    MoneyRow,
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

interface Participant {
    first: string;
    last: string;
    birthDate?: string;
    answers: Record<string, string>;
}

/** Sample date of birth for the signed-in golfer, so adult age checks pass in stories. */
const HOST_BIRTH = "1986-05-14";

const seedParticipants = (p: BookableProgram, asOf: string): Participant[] => {
    const max = p.rules?.age?.max;
    const youth = max !== undefined && max < 18;
    if (youth) {
        const fits = (b?: string) => !!b && (p.rules?.age?.min === undefined || ageOn(b, asOf) >= p.rules.age.min) && ageOn(b, asOf) <= max;
        const kids = [...SAMPLE_GUESTS].sort((a, b) => Number(fits(b.birthDate)) - Number(fits(a.birthDate)));
        return [
            ...kids.map((k) => ({
                first: k.first,
                last: k.last,
                birthDate: k.birthDate,
                answers: {},
            })),
            { first: "", last: "", answers: {} },
        ];
    }
    const host = {
        first: GOLFER.first,
        last: GOLFER.last,
        birthDate: p.rules?.age ? HOST_BIRTH : undefined,
        answers: {},
    };
    return [
        host,
        ...SAMPLE_GUESTS.map((g) => ({
            first: g.first,
            last: g.last,
            birthDate: p.rules?.age ? "1990-08-02" : undefined,
            answers: {},
        })),
        { first: "", last: "", answers: {} },
    ];
};

const sessionLine = (n: number) => `${n} ${n === 1 ? "session" : "sessions"}`;

/**
 * Registering for a group program — an Academy clinic/camp or a county clinic. Its dates are
 * fixed, so instead of a time board there is the session list (or, for pick-your-dates clinics,
 * session checkboxes with the multi-buy discount), spots left, then Participants (age rules from
 * `registration-rules.ts`) → Sign in → Payment → Review. A full program takes waitlist entries.
 */
export const ProgramRegistration = ({ program }: { program: BookableProgram }) => {
    const { query, setQuery } = useInstructionQuery();
    const { userName } = useWebSession();
    const { navigate } = useWebRouter();
    const store = useInstructionStore();

    const upcoming = upcomingSessions(program);
    const firstIso = upcoming[0] ?? program.sessionDates[0] ?? TODAY_ISO;
    const full = program.spotsLeft === 0;
    const maxPeople = Math.max(1, Math.min(4, program.spotsLeft || 4));

    const [people, setPeople] = useState(Math.min(query.players ?? 1, maxPeople));
    useEffect(() => setPeople(Math.min(query.players ?? 1, maxPeople)), [query.players, maxPeople]);
    const [picked, setPicked] = useState<string[]>(() => {
        const fromUrl = sessionsParamOf(query).filter((d) => upcoming.includes(d));
        return fromUrl.length ? fromUrl : upcoming.slice(0, 1);
    });
    const [participants, setParticipants] = useState<Participant[]>(() => seedParticipants(program, firstIso));
    const [bookingAnswers, setBookingAnswers] = useState<Record<string, string>>({});
    const [note, setNote] = useState("");
    const [pay, setPay] = useState(query.extra.pay && query.extra.pay !== "credit" && query.extra.pay !== "lesson" ? query.extra.pay : DEFAULT_CARD);
    const [promo, setPromo] = useState<string | null>(promoOf(query));
    const [busy, setBusy] = useState(false);
    const [mobile, setMobile] = useState(USER.phone);
    const [email, setEmail] = useState(USER.email);

    const asked = programStepOf(query.step);
    let step: ProgramStep = asked;
    if (full && step !== "waitlist" && step !== "sessions") step = "waitlist";
    if ((step === "payment" || step === "confirm") && !userName) step = "account";
    if (step === "account" && userName) step = "payment";

    const sessionsChosen = program.perSession ? picked.length : 1;
    const quote = quoteProgram(program, people, sessionsChosen, promo);
    const party = participants.slice(0, people);
    const eligibility = party.map((p, i) => checkEligibility(program.rules, { birthDate: p.birthDate, answers: p.answers }, firstIso, p.first || `Participant ${i + 1}`));
    const blocked = eligibility.some((r) => r.problems.length > 0);
    const incomplete = party.some((p) => !p.first.trim()) || eligibility.some((r) => r.incomplete) || missingBookingAnswers(program.rules, bookingAnswers).length > 0;
    const noSessions = program.perSession && picked.length === 0;

    const go = (next: ProgramStep, extra?: Record<string, string>) =>
        setQuery({
            step: next === "sessions" ? undefined : next,
            players: people,
            extra:
                extra ??
                withExtra(query, {
                    sessions: program.perSession ? picked.join(",") : undefined,
                }),
        });

    const register = () => {
        setBusy(true);
        setTimeout(() => {
            const reg = store.registerProgram({
                serviceId: program.id,
                participants: people,
                total: quote.total,
                waitlisted: false,
            });
            setBusy(false);
            navigate(
                confirmationHref(
                    "registered",
                    {
                        coach: program.coachId ?? "any",
                        service: program.id,
                        course: program.courseSlug,
                        date: picked[0] ?? firstIso,
                        players: people,
                    },
                    {
                        confirmation: reg.id,
                        paid: quote.total.toFixed(2),
                        pay,
                        sessions: program.perSession ? picked.join(",") : undefined,
                        promo: promo ?? undefined,
                    },
                ),
            );
        }, 700);
    };

    const back = program.coachId
        ? {
              href: proHref(program.coachId),
              label: program.instructorName.split(",")[0],
          }
        : {
              href: serviceHref(program.id, program.courseSlug),
              label: program.name,
          };
    const railIndex = {
        sessions: 0,
        waitlist: 0,
        details: 1,
        account: 2,
        payment: 3,
        confirm: 4,
    }[step];

    const summary = (
        <>
            <div className="flex items-start gap-3 border-b border-secondary px-5 py-4">
                {program.image && <img src={program.image} alt="" className="size-14 shrink-0 rounded-lg object-cover" />}
                <div className="min-w-0">
                    <p className="text-md font-semibold text-primary">{program.name}</p>
                    <p className="text-sm text-tertiary">{program.schedule}</p>
                </div>
            </div>
            <SummaryBlock
                lead={<CoachAvatar photo={program.photo} initials={program.instructorInitials} size="md" />}
                title={program.instructorName}
                lines={[program.instructorTitle]}
            />
            <SummaryBlock
                lead={
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <MarkerPin01 className="size-5 text-fg-secondary" aria-hidden="true" />
                    </span>
                }
                title={courseShortName(program.courseSlug)}
                lines={[program.location, program.time]}
            />
            <div className="border-b border-secondary px-5 py-4">
                <SpotsMeter capacity={program.capacity} spotsLeft={program.spotsLeft} />
            </div>
            <MoneyBlock>
                {full && step === "waitlist" ? (
                    <>
                        <MoneyRow label={`Waitlist · ${people} ${people === 1 ? "place" : "places"}`} value={money(0)} />
                        <p className="text-sm text-tertiary">
                            Nothing is charged unless a spot opens and you accept it ({money0(program.price)} {program.priceUnit}).
                        </p>
                    </>
                ) : (
                    <>
                        <MoneyRow
                            label={
                                program.perSession
                                    ? `${sessionLine(sessionsChosen)} × ${people} × ${money0(program.price)}`
                                    : `${people} × ${money0(program.price)} ${program.priceUnit}`
                            }
                            value={money(quote.subtotal)}
                        />
                        {quote.multiBuyDiscount > 0 && program.rules?.multiBuy && (
                            <MoneyRow label={multiBuyLabel(program.rules.multiBuy)} value={`−${money(quote.multiBuyDiscount)}`} tone="success" />
                        )}
                        {quote.discount > 0 && <MoneyRow label={quote.promoLabel ?? "Promo"} value={`−${money(quote.discount)}`} tone="success" />}
                        <div className="mt-1 border-t border-secondary pt-3">
                            <MoneyRow strong label="Total" value={money(quote.total)} />
                        </div>
                        <p className="text-sm text-tertiary">No facility fee on group programs. Free cancellation until 48 hours before the first session.</p>
                    </>
                )}
            </MoneyBlock>
        </>
    );

    const titles: Record<ProgramStep, [string, string]> = {
        sessions: [program.name, program.desc],
        waitlist: ["Join the waitlist", `${program.name} is full. We'll text you the moment a spot opens — you keep your place in line until it does.`],
        details: [
            "Who's registering",
            [ageRangeLabel(program.rules?.age), genderNote(program.rules)].filter(Boolean).join(" · ") || "Everyone taking a spot, so the instructor knows who to expect.",
        ],
        account: ["Sign in to register", "MCG saves every registration to an account. Your spots are held while you sign in."],
        payment: ["Payment", "Spots held for 10 minutes. You won't be charged until you confirm."],
        confirm: ["Review and confirm", "Check everything once more — each part can still be changed."],
    };

    const action = (() => {
        switch (step) {
            case "sessions":
                return full ? (
                    <PrimaryAction icon={Bell01} onPress={() => go("waitlist")}>
                        Join the waitlist
                    </PrimaryAction>
                ) : (
                    <PrimaryAction icon={ArrowRight} isDisabled={noSessions} onPress={() => go("details")}>
                        {noSessions ? "Choose a session" : `Register · ${money(quote.total)}`}
                    </PrimaryAction>
                );
            case "details":
                return (
                    <PrimaryAction icon={ArrowRight} isDisabled={blocked || incomplete} onPress={() => go(userName ? "payment" : "account")}>
                        Continue
                    </PrimaryAction>
                );
            case "payment":
                return (
                    <PrimaryAction
                        icon={ArrowRight}
                        onPress={() =>
                            go(
                                "confirm",
                                withExtra(query, {
                                    pay,
                                    promo: promo ?? undefined,
                                    sessions: program.perSession ? picked.join(",") : undefined,
                                }),
                            )
                        }
                    >
                        Review registration
                    </PrimaryAction>
                );
            case "confirm":
                return (
                    <PrimaryAction onPress={register} isLoading={busy}>
                        {quote.total === 0 ? "Confirm registration" : `Confirm and pay ${money(quote.total)}`}
                    </PrimaryAction>
                );
            case "waitlist":
                return (
                    <PrimaryAction
                        icon={Bell01}
                        isDisabled={!mobile.trim()}
                        onPress={() => {
                            const reg = store.registerProgram({
                                serviceId: program.id,
                                participants: people,
                                total: 0,
                                waitlisted: true,
                            });
                            navigate(
                                confirmationHref(
                                    "waitlisted",
                                    {
                                        coach: program.coachId ?? "any",
                                        service: program.id,
                                        course: program.courseSlug,
                                        players: people,
                                    },
                                    {
                                        confirmation: reg.id,
                                        mobile,
                                        window: "First spot that opens",
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
            eyebrow={program.source === "academy" ? "Register · MCG Golf Academy" : "Register · County clinic"}
            title={titles[step][0]}
            subtitle={titles[step][1]}
            rail={
                step === "waitlist"
                    ? undefined
                    : {
                          steps: PROGRAM_RAIL.map((s) => (s.id === "account" && userName ? { ...s, doneLabel: "Signed in" } : s)),
                          current: railIndex,
                          onStep: (id) => go(id as ProgramStep),
                      }
            }
            summary={summary}
            summaryTitle="Registration summary"
            summaryLine={`${program.schedule} · ${people} ${people === 1 ? "person" : "people"}`}
            price={step === "waitlist" ? money(0) : money(quote.total)}
            priceNote={step === "waitlist" ? "Nothing charged now" : full ? "Full — waitlist open" : `${program.spotsLeft} spots left`}
            action={action}
            actionNote={
                step === "details" && userName && (blocked || incomplete)
                    ? blocked
                        ? "Someone on this registration can't take this program."
                        : "Fill in the required details to continue."
                    : undefined
            }
        >
            {step === "sessions" && (
                <>
                    <Panel bodyClassName="flex flex-col gap-5 p-0">
                        {program.banner && <img src={program.banner} alt="" className="aspect-[3/1] w-full rounded-t-xl object-cover" />}
                        <div className="flex flex-col gap-4 px-5 pb-5 @tablet:px-6 @tablet:pb-6">
                            <div className="flex flex-wrap gap-2">
                                <Tag tone="brand" variant="soft">
                                    {program.source === "academy" ? "MCG Golf Academy" : "County clinic"}
                                </Tag>
                                {program.ageGroup && (
                                    <Tag tone="gray" variant="soft">
                                        {program.ageGroup}
                                    </Tag>
                                )}
                                {program.sample && (
                                    <Tag tone="warning" variant="soft">
                                        Sample program
                                    </Tag>
                                )}
                                {full && (
                                    <Tag tone="error" variant="soft">
                                        Full
                                    </Tag>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <CoachAvatar photo={program.photo} initials={program.instructorInitials} size="lg" />
                                <div className="min-w-0">
                                    <p className="text-md font-semibold text-primary">{program.instructorName}</p>
                                    {program.instructorTitle && <p className="text-sm text-tertiary">{program.instructorTitle}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2 @tablet:grid-cols-3">
                                <MetaLine icon={Calendar}>{program.schedule}</MetaLine>
                                <MetaLine icon={Clock}>{program.time}</MetaLine>
                                <MetaLine icon={MarkerPin01}>{program.location}</MetaLine>
                            </div>
                            <SpotsMeter capacity={program.capacity} spotsLeft={program.spotsLeft} />
                            {full && (
                                <Notice tone="warning" className="rounded-lg text-sm">
                                    Every spot is taken. Join the waitlist and we&rsquo;ll text you if one opens — nothing is charged until you accept.
                                </Notice>
                            )}
                        </div>
                    </Panel>

                    <StepPanel
                        title={program.perSession ? "Choose your sessions" : `Sessions · ${program.sessionDates.length}`}
                        sub={
                            program.perSession
                                ? `${money0(program.price)} a session.${program.rules?.multiBuy ? ` ${multiBuyLabel(program.rules.multiBuy)} on the whole registration.` : ""}`
                                : "One registration covers every session below."
                        }
                    >
                        <ul className="flex flex-col divide-y divide-secondary rounded-lg ring-1 ring-secondary ring-inset">
                            {program.sessionDates.map((iso, i) => {
                                const past = iso < TODAY_ISO;
                                const label = (
                                    <span className="flex flex-col">
                                        <span className="text-md font-medium text-primary">
                                            Session {i + 1} · {fmtDateShort(iso)}
                                        </span>
                                        <span className="text-sm text-tertiary">{program.time}</span>
                                    </span>
                                );
                                return (
                                    <li key={iso} className="flex items-center justify-between gap-3 px-4 py-3">
                                        {program.perSession && !past ? (
                                            <WebCheckbox
                                                isSelected={picked.includes(iso)}
                                                onChange={(on) => setPicked((xs) => (on ? [...xs, iso].sort() : xs.filter((x) => x !== iso)))}
                                            >
                                                {label}
                                            </WebCheckbox>
                                        ) : (
                                            label
                                        )}
                                        <span className="shrink-0 text-sm text-tertiary">
                                            {past
                                                ? "Done"
                                                : dateOfIso(iso).toLocaleDateString("en-US", {
                                                      weekday: "long",
                                                  })}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                        {program.perSession && program.rules?.multiBuy && (
                            <p className={quote.multiBuyDiscount > 0 ? "text-sm font-medium text-success-primary" : "text-sm text-tertiary"}>
                                {quote.multiBuyDiscount > 0
                                    ? `${program.rules.multiBuy.percentOff}% off applied — you save ${money(quote.multiBuyDiscount)}.`
                                    : `Choose ${program.rules.multiBuy.buy - picked.length} more ${program.rules.multiBuy.buy - picked.length === 1 ? "session" : "sessions"} to get ${program.rules.multiBuy.percentOff}% off.`}
                            </p>
                        )}
                    </StepPanel>

                    <StepPanel
                        title="How many are registering?"
                        sub={full ? "Places you'd take if spots open." : `Up to ${maxPeople} per registration · ${program.spotsLeft} spots left.`}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-2 text-md text-secondary">
                                <Users01 className="size-5 text-fg-quaternary" aria-hidden="true" />
                                {people} {people === 1 ? "person" : "people"}
                            </span>
                            <Stepper value={people} onChange={setPeople} min={1} max={maxPeople} label="People" />
                        </div>
                    </StepPanel>

                    <StepPanel title="Before you register">
                        <div className="grid grid-cols-1 gap-5 @tablet:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <span className="caps text-quaternary">Who it&rsquo;s for</span>
                                <p className="text-sm text-secondary">
                                    {[ageRangeLabel(program.rules?.age) ?? "All ages", genderNote(program.rules), program.ageGroup].filter(Boolean).join(" · ")}
                                </p>
                                {(program.rules?.questions ?? []).length > 0 && (
                                    <p className="text-sm text-tertiary">
                                        We&rsquo;ll ask {program.rules!.questions!.length} short {program.rules!.questions!.length === 1 ? "question" : "questions"} at sign-up.
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="caps text-quaternary">{program.rules?.equipmentProvided ? "Provided" : "What to bring"}</span>
                                <CheckList items={program.rules?.equipmentProvided ? program.provided : program.bring} />
                            </div>
                        </div>
                    </StepPanel>
                </>
            )}

            {step === "waitlist" && (
                <>
                    <StepPanel title="How many places?">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-md text-secondary">
                                {people} {people === 1 ? "person" : "people"}
                            </span>
                            <Stepper value={people} onChange={setPeople} min={1} max={4} label="Places" />
                        </div>
                    </StepPanel>
                    <StepPanel title="Where to reach you" sub="First to reply to the text takes the spot.">
                        <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                            <TextField label="Mobile" type="tel" value={mobile} onChange={setMobile} isRequired />
                            <TextField label="Email" type="email" value={email} onChange={setEmail} />
                        </div>
                    </StepPanel>
                    <Button size="web-md" color="outline" onPress={() => navigate(clinicsHref())} className="self-start">
                        Browse other programs
                    </Button>
                </>
            )}

            {step === "details" && (
                <>
                    <Panel title={`Participants · ${party.filter((p) => p.first.trim()).length} of ${people} added`}>
                        <ul className="divide-y divide-secondary">
                            {party.map((p, i) => {
                                const me = p.first === GOLFER.first && p.last === GOLFER.last;
                                const set = (patch: Partial<Participant>) => setParticipants((list) => list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
                                return (
                                    <li key={i} className="flex flex-col gap-4 px-5 py-5 @tablet:px-6">
                                        <div className="flex items-center gap-3">
                                            <PlayerAvatar number={i + 1} name={p.first ? `${p.first} ${p.last}` : undefined} />
                                            <span className="flex min-w-0 flex-1 items-center gap-2 text-md font-semibold text-primary">
                                                <span className="truncate">{p.first ? `${p.first} ${p.last}` : `Participant ${i + 1}`}</span>
                                                {me && <YouTag />}
                                            </span>
                                        </div>
                                        {!me && (
                                            <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                                                <TextField label="First name" value={p.first} onChange={(v) => set({ first: v })} isRequired />
                                                <TextField label="Last name" value={p.last} onChange={(v) => set({ last: v })} />
                                            </div>
                                        )}
                                        <EligibilityFields
                                            rules={program.rules}
                                            birthDate={p.birthDate}
                                            answers={p.answers}
                                            onBirthDate={(v) => set({ birthDate: v })}
                                            onAnswer={(id, v) => set({ answers: { ...p.answers, [id]: v } })}
                                            asOf={firstIso}
                                            result={eligibility[i]}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </Panel>
                    {(program.rules?.questions ?? []).some((q) => q.per === "booking") && (
                        <StepPanel title="About this registration" sub="Asked once for the whole registration.">
                            {(program.rules?.questions ?? [])
                                .filter((q) => q.per === "booking")
                                .map((q) => (
                                    <QuestionField key={q.id} question={q} value={bookingAnswers[q.id] ?? ""} onChange={(v) => setBookingAnswers((a) => ({ ...a, [q.id]: v }))} />
                                ))}
                        </StepPanel>
                    )}
                    <StepPanel title={`Note for ${program.instructorName.split(",")[0]}`} sub="Optional — anything the instructor should know.">
                        <WebTextArea label="Note" value={note} onChange={setNote} placeholder="First time in a group clinic — I've had a handful of private lessons." />
                    </StepPanel>
                </>
            )}

            {step === "account" && (
                <SignInGate
                    what="registration"
                    nextHref={withQuery("/instruction/book", {
                        ...query,
                        step: "payment",
                        players: people,
                    })}
                    onSignedIn={() => go("payment")}
                />
            )}

            {step === "payment" && (
                <>
                    <SignInGate what="registration" nextHref="" onSignedIn={() => undefined} />
                    {quote.total === 0 && quote.subtotal === 0 ? (
                        <StepPanel title="No payment needed" sub="This program is free — confirm to hold your spots." />
                    ) : (
                        <StepPanel title="How you're paying" sub="Charged when you confirm.">
                            <PaymentOptions value={pay} onChange={setPay} />
                        </StepPanel>
                    )}
                    <StepPanel title="Promo code">
                        <PromoBox applied={promo} onApply={setPromo} onRemove={() => setPromo(null)} />
                    </StepPanel>
                    <StepPanel title="Cancellation">
                        <p className="text-sm text-tertiary">
                            Free cancellation until 48 hours before the first session. After that the registration is non-refundable, but a spot can be passed to someone else in
                            your household.
                        </p>
                    </StepPanel>
                </>
            )}

            {step === "confirm" && (
                <>
                    <StepPanel
                        title="Program"
                        right={
                            <Button size="web-sm" color="plain" onPress={() => go("sessions")}>
                                Change
                            </Button>
                        }
                    >
                        <p className="text-md font-semibold text-primary">{program.name}</p>
                        <p className="text-sm text-tertiary">
                            {program.perSession ? picked.map(fmtDateShort).join(", ") : `${program.schedule} · ${sessionLine(program.sessionDates.length)}`} · {program.time}
                        </p>
                        <p className="text-sm text-tertiary">{program.location}</p>
                    </StepPanel>
                    <StepPanel
                        title={`Participants · ${people}`}
                        right={
                            <Button size="web-sm" color="plain" onPress={() => go("details")}>
                                Change
                            </Button>
                        }
                    >
                        <ul className="flex flex-col gap-2">
                            {party.map((p, i) => (
                                <li key={i} className="flex items-center gap-3 text-md text-primary">
                                    <PlayerAvatar name={`${p.first} ${p.last}`} size="sm" />
                                    {p.first} {p.last}
                                    {p.birthDate && program.rules?.age && <span className="text-sm text-tertiary">· age {ageOn(p.birthDate, firstIso)}</span>}
                                </li>
                            ))}
                        </ul>
                    </StepPanel>
                    <StepPanel
                        title="Payment"
                        right={
                            <Button size="web-sm" color="plain" onPress={() => go("payment")}>
                                Change
                            </Button>
                        }
                    >
                        <p className="text-md text-primary">{quote.total === 0 ? "Nothing to pay" : paymentName(pay)}</p>
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
