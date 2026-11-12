import { useState } from "react";
import { Calendar, CheckCircle, Clock, Dotpoints01, MarkerPin01, Package } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { WebPage } from "@/components/web/web-layout";
import { formatDate, PAYMENT_CARDS, TODAY, USER } from "@/data/crane";
import { useWebSession, WebShell } from "../web-shell";
import { availability as availabilityOf, CLINICS, clinicById, fmtLong, isPast, type Clinic } from "./events-data";
import { ClinicRow, LevelBadge, sessionsSummary } from "./clinics-browse-page";
import {
    AddToCalendar,
    AvailabilityBadge,
    BackLink,
    CheckList,
    ConfirmDialog,
    DetailSection,
    focusRing,
    Hero,
    InitialsAvatar,
    LabelPill,
    MetaInline,
    MobileActionBar,
    money,
    PriceHeadline,
    ShareButton,
    SideCard,
    SpotsMeter,
    Stepper,
    SummaryLine,
    WebButton,
    type DialogStep,
} from "./events-ui";

export interface ClinicDetailPageProps {
    id: string;
    initialStep?: DialogStep | null;
    initialRegistered?: boolean;
}

/**
 * /clinics/:id — ports Fox "Global Nav/Clinics/Clinic Details" (clinic-detail.stories.tsx:
 * default, junior, playing lesson): hero, focus + level, what you'll learn, who it's for, what
 * to bring, instructor, where, and a sticky reserve card. Crane adds the session schedule, a
 * spots meter, the waitlist when full and a confirmation dialog.
 */
export const ClinicDetailPage = ({ id, initialStep = null, initialRegistered = false }: ClinicDetailPageProps) => {
    const clinic = clinicById(id);
    if (!clinic)
        return (
            <WebShell active="clinics">
                <WebPage>
                    <BackLink href="/clinics">All clinics</BackLink>
                    <p className="mt-10 text-lg font-semibold text-primary">We couldn't find that clinic.</p>
                </WebPage>
            </WebShell>
        );
    return <ClinicDetail key={clinic.id} clinic={clinic} initialStep={initialStep} initialRegistered={initialRegistered} />;
};

const ClinicDetail = ({ clinic, initialStep, initialRegistered }: { clinic: Clinic; initialStep: DialogStep | null; initialRegistered: boolean }) => {
    const { course } = useWebSession();
    const status = availabilityOf(clinic);
    const isFull = status === "full";
    const noun = clinic.priceUnit === "per junior" ? "Juniors" : "Spots";
    const [qty, setQty] = useState(1);
    const [step, setStep] = useState<DialogStep | null>(initialStep);
    const [registered, setRegistered] = useState(initialRegistered);
    const total = clinic.price * qty;
    const when = sessionsSummary(clinic);
    const cta = isFull ? "Join waitlist" : "Reserve your spot";
    const related = CLINICS.filter((c) => c.id !== clinic.id && (c.focus === clinic.focus || c.instructor === clinic.instructor) && !isPast(c.sessions[c.sessions.length - 1].date)).slice(0, 2);

    const card = registered ? (
        <SideCard>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-secondary px-3 py-1 text-xs font-semibold text-success-primary">
                <CheckCircle className="size-3.5" aria-hidden="true" /> {isFull ? "On the waitlist" : "Reserved"}
            </span>
            <p className="mt-3 text-md font-semibold text-primary">{isFull ? `You're #${(clinic.waitlist ?? 0) + 1} on the waitlist` : "See you on the range"}</p>
            <p className="text-sm text-tertiary">{when}</p>
            <dl className="mt-4 flex flex-col gap-2.5 border-t border-secondary pt-4">
                <SummaryLine label="Reserved on" value={formatDate(TODAY)} />
                <SummaryLine label={noun} value={qty} />
                {!isFull && <SummaryLine label="Amount paid" value={money(total)} />}
                {!isFull && <SummaryLine label="Paid with" value={`${PAYMENT_CARDS[0].brand} •••• ${PAYMENT_CARDS[0].last4}`} />}
            </dl>
            <div className="mt-4 flex flex-col gap-2.5">
                <AddToCalendar fullWidth />
                <ShareButton />
            </div>
            <button type="button" onClick={() => setRegistered(false)} className={cx("mt-3 w-full cursor-pointer rounded text-center text-sm font-semibold text-error-primary", focusRing)}>
                {isFull ? "Leave waitlist" : "Cancel reservation"}
            </button>
        </SideCard>
    ) : (
        <SideCard>
            <PriceHeadline price={clinic.price} unit={clinic.priceUnit} />
            <p className="mt-3 flex items-start gap-2 text-sm text-secondary">
                <Calendar className="mt-0.5 size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                {when}
            </p>
            <SpotsMeter capacity={clinic.capacity} spotsLeft={clinic.spotsLeft} className="mt-4" />
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-secondary p-3">
                <div>
                    <p className="text-sm font-semibold text-primary">{isFull ? "Party size" : noun}</p>
                    <p className="text-xs text-tertiary">{isFull ? `${clinic.waitlist} on the waitlist` : `Up to ${Math.min(4, clinic.spotsLeft)} per reservation`}</p>
                </div>
                <Stepper value={qty} onChange={setQty} max={isFull ? 4 : Math.min(4, clinic.spotsLeft)} label={noun} />
            </div>
            {!isFull && (
                <div className="mt-4 flex flex-col gap-2 border-t border-secondary pt-4">
                    <SummaryLine label={`${money(clinic.price)} × ${qty}`} value={money(total)} />
                    <SummaryLine strong label="Total" value={money(total)} />
                </div>
            )}
            <WebButton size="lg" fullWidth className="mt-4" onPress={() => setStep("confirm")}>
                {cta}
            </WebButton>
            <p className="mt-2.5 text-center text-xs text-tertiary">{isFull ? "No charge to join the waitlist" : "Free cancellation up to 48 hours before"}</p>
        </SideCard>
    );

    return (
        <WebShell active="clinics">
            <WebPage className="pb-10 @desktop:pb-20">
                <div className="mb-5">
                    <BackLink href="/clinics">All clinics</BackLink>
                </div>
                <Hero src={clinic.image} alt={clinic.title} />

                <div className="mt-6 flex flex-wrap items-center gap-2">
                    <LevelBadge level={clinic.level} />
                    <LabelPill>{clinic.focus}</LabelPill>
                    {clinic.sessions.length > 1 && <LabelPill>{clinic.sessions.length}-week series</LabelPill>}
                    <AvailabilityBadge availability={status} waitlist={!!clinic.waitlist} />
                </div>
                <div className="mt-3 flex items-start justify-between gap-4">
                    <h1 className="max-w-3xl text-display-xs font-bold tracking-[-0.3px] text-primary @tablet:text-display-sm">{clinic.title}</h1>
                    <span className="hidden shrink-0 @tablet:block">
                        <ShareButton size="sm" />
                    </span>
                </div>
                <p className="mt-2 text-md font-semibold text-brand-secondary">
                    with {clinic.instructor.name}, {clinic.instructor.title}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-tertiary">
                    <MetaInline icon={Calendar}>{clinic.sessions.length > 1 ? `Starts ${fmtLong(clinic.sessions[0].date)}` : fmtLong(clinic.sessions[0].date)}</MetaInline>
                    <MetaInline icon={Clock}>{clinic.sessions[0].time}</MetaInline>
                    <MetaInline icon={MarkerPin01}>{clinic.location}</MetaInline>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 @desktop:grid-cols-3">
                    <div className="flex flex-col gap-8 @desktop:col-span-2">
                        <DetailSection first title="About this clinic">
                            <p className="text-md text-secondary">{clinic.description}</p>
                        </DetailSection>
                        <DetailSection first title="What you'll learn">
                            <CheckList items={clinic.learn} />
                        </DetailSection>

                        <DetailSection title={clinic.sessions.length > 1 ? `Sessions (${clinic.sessions.length})` : "Session"}>
                            <ol className="overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset">
                                {clinic.sessions.map((s, i) => (
                                    <li key={s.date} className="flex items-center gap-4 border-b border-secondary px-4 py-3 last:border-b-0">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary tabular-nums">{i + 1}</span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-primary">{fmtLong(s.date)}</p>
                                            <p className="text-sm text-tertiary">
                                                {s.time} · {clinic.location}
                                            </p>
                                        </div>
                                        {isPast(s.date) && <span className="text-xs font-medium text-quaternary">Done</span>}
                                    </li>
                                ))}
                            </ol>
                        </DetailSection>

                        <DetailSection title="Skill level & who it's for">
                            <div className="flex items-center gap-2">
                                <LevelBadge level={clinic.level} />
                                {clinic.ageGroup && <span className="text-sm font-medium text-secondary">{clinic.ageGroup}</span>}
                            </div>
                            <p className="mt-2.5 text-sm text-tertiary">{clinic.prerequisites}</p>
                        </DetailSection>

                        <DetailSection title="What to bring">
                            <div className="grid grid-cols-1 gap-6 @tablet:grid-cols-2">
                                {[
                                    { icon: Dotpoints01, title: "Bring", items: clinic.bring },
                                    { icon: Package, title: "We provide", items: clinic.provided },
                                ].map((g) => (
                                    <div key={g.title}>
                                        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                                            <g.icon className="size-4 text-fg-quaternary" aria-hidden="true" /> {g.title}
                                        </p>
                                        <ul className="flex flex-col gap-1.5">
                                            {g.items.map((x) => (
                                                <li key={x} className="text-sm text-tertiary">
                                                    {x}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </DetailSection>

                        <DetailSection title="Your instructor">
                            <div className="flex items-start gap-4">
                                <InitialsAvatar initials={clinic.instructor.initials} size="lg" />
                                <div>
                                    <p className="text-md font-semibold text-primary">{clinic.instructor.name}</p>
                                    <p className="text-sm font-medium text-brand-secondary">{clinic.instructor.title}</p>
                                    <p className="mt-1 text-sm text-tertiary">{clinic.instructor.bio}</p>
                                </div>
                            </div>
                        </DetailSection>

                        <DetailSection title="Where">
                            <p className="text-sm font-medium text-secondary">{course.name}</p>
                            {course.address && <p className="text-sm text-tertiary">{course.address}</p>}
                            <p className="mt-1 text-sm text-tertiary">Meet at the {clinic.location} 10 minutes early.</p>
                        </DetailSection>
                    </div>
                    <div className="order-first @desktop:order-none">{card}</div>
                </div>

                {related.length > 0 && (
                    <section className="mt-14 border-t border-secondary pt-8">
                        <h2 className="text-lg font-semibold text-primary">More clinics</h2>
                        <div className="mt-5 flex flex-col gap-4">
                            {related.map((c) => (
                                <ClinicRow key={c.id} clinic={c} />
                            ))}
                        </div>
                    </section>
                )}
            </WebPage>

            {!registered && (
                <MobileActionBar
                    summary={
                        <>
                            <p className="text-md font-semibold text-primary tabular-nums">{isFull ? "Waitlist" : money(total)}</p>
                            <p className="truncate text-xs text-tertiary">{isFull ? `${clinic.waitlist} ahead of you` : `${qty} ${qty === 1 ? "spot" : "spots"} · ${clinic.sessions.length} ${clinic.sessions.length === 1 ? "session" : "sessions"}`}</p>
                        </>
                    }
                    action={<WebButton onPress={() => setStep("confirm")}>{isFull ? "Join waitlist" : "Reserve"}</WebButton>}
                />
            )}

            <ConfirmDialog
                step={step}
                onStepChange={setStep}
                onConfirmed={() => setRegistered(true)}
                title={isFull ? "Join the waitlist" : "Reserve your spot"}
                subject={{ title: clinic.title, when, image: clinic.image }}
                lines={
                    isFull
                        ? [
                              { label: "Party size", value: qty },
                              { label: "Waitlist position", value: `#${(clinic.waitlist ?? 0) + 1}` },
                          ]
                        : [
                              { label: "Instructor", value: clinic.instructor.name },
                              { label: "Sessions", value: clinic.sessions.length },
                              { label: `${money(clinic.price)} × ${qty}`, value: money(total) },
                          ]
                }
                total={total}
                mode={isFull ? "waitlist" : "pay"}
                confirmLabel={isFull ? "Join waitlist" : `Pay ${money(total)}`}
                done={
                    isFull
                        ? { title: "You're on the waitlist", body: `We'll email ${USER.email} if a spot opens.` }
                        : { title: "Spot reserved", body: `${clinic.instructor.name} will see you ${clinic.sessions.length > 1 ? "at the first session" : "there"}. Confirmation sent to ${USER.email}.` }
                }
            />
        </WebShell>
    );
};
