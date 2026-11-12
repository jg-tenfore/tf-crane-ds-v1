import { useState } from "react";
import { Calendar, CheckCircle, Clock, HeartHand, Lock01, MarkerPin01, Plus, Trophy01, User01, Users01, XClose } from "@untitledui/icons";
import { Button as AriaButton, Checkbox as AriaCheckbox } from "react-aria-components";
import { cx } from "@/utils/cx";
import { ProgressBar } from "@/components/base/progress-bar";
import { ChoiceChips } from "@/components/forms/choice";
import { WebPage } from "@/components/web/web-layout";
import { useWebRouter } from "@/components/web/web-router";
import { BUDDIES, currency, formatDate, MEMBERSHIPS, PAYMENT_CARDS, TODAY, USER } from "@/data/crane";
import { useWebSession, WebShell } from "../web-shell";
import { availability as availabilityOf, EVENTS, eventById, fmtLong, fmtRange, isPast, type ClubEvent } from "./events-data";
import {
    AddToCalendar,
    AvailabilityBadge,
    BackLink,
    CheckList,
    ConfirmDialog,
    DetailSection,
    EventCard,
    focusRing,
    Hero,
    InfoRow,
    kindLabel,
    LabelPill,
    MembersBadge,
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

const wholeDollars = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const DONATIONS = [0, 25, 50, 100];
const namedBuddies = BUDDIES.filter((b) => b.name);

export interface EventDetailPageProps {
    id: string;
    /** Story hooks. */
    initialStep?: DialogStep | null;
    initialRegistered?: boolean;
    initialBuddies?: string[];
    initialGuests?: number;
}

/**
 * /events/:id — ports Fox "Global Nav/Events/Event Details" (default, clinic, charity,
 * registered): hero, about / included / details / where / policy, and a sticky register card.
 * Crane adds who's playing (you + buddies + guests, guest pricing), team events, members-only,
 * charity donations, the waitlist when full, and a confirmation dialog.
 */
export const EventDetailPage = ({ id, initialStep = null, initialRegistered = false, initialBuddies = [], initialGuests = 0 }: EventDetailPageProps) => {
    const event = eventById(id);
    if (!event) return <NotFound />;
    return <EventDetail key={event.id} event={event} initialStep={initialStep} initialRegistered={initialRegistered} initialBuddies={initialBuddies} initialGuests={initialGuests} />;
};

const NotFound = () => (
    <WebShell active="events">
        <WebPage>
            <BackLink href="/events">All events</BackLink>
            <p className="mt-10 text-lg font-semibold text-primary">We couldn't find that event.</p>
        </WebPage>
    </WebShell>
);

const EventDetail = ({ event, initialStep, initialRegistered, initialBuddies, initialGuests }: { event: ClubEvent } & Required<Omit<EventDetailPageProps, "id">>) => {
    const { course, userName } = useWebSession();
    const { navigate } = useWebRouter();
    const status = availabilityOf(event, event.endDate ?? event.date);
    const isFull = status === "full";
    const ended = status === "past" || isPast(event.endDate ?? event.date);
    const team = event.teamSize ?? 0;
    const maxParty = team || Math.max(1, Math.min(4, event.spotsLeft || 4));

    const [buddies, setBuddies] = useState<string[]>(initialBuddies);
    const [guests, setGuests] = useState(initialGuests);
    const [party, setParty] = useState(1); // waitlist party size
    const [donation, setDonation] = useState(0);
    const [step, setStep] = useState<DialogStep | null>(initialStep);
    const [registered, setRegistered] = useState(initialRegistered);

    const players = isFull ? party : 1 + buddies.length + guests;
    const roomLeft = maxParty - (1 + buddies.length + guests);
    const memberCount = 1 + buddies.length;
    const guestPrice = event.guestPrice ?? event.price;
    const subtotal = event.priceUnit === "per team" ? event.price : memberCount * event.price + guests * guestPrice;
    const total = subtotal + donation;
    const teamIncomplete = team > 0 && players < team;
    const needsSignIn = event.membersOnly && !userName;
    const membership = MEMBERSHIPS[0];

    const toggleBuddy = (bid: string, on: boolean) => setBuddies((b) => (on ? [...b, bid] : b.filter((x) => x !== bid)));
    const playerNames = [`${USER.firstName} ${USER.lastName} (you)`, ...buddies.map((bid) => BUDDIES.find((b) => b.id === bid)!.name), ...Array.from({ length: guests }, (_, i) => `Guest ${i + 1}`)];

    const cta = ended ? "Event ended" : needsSignIn ? "Sign in to register" : isFull ? "Join waitlist" : event.price === 0 ? "Reserve spot" : "Register";
    const onCta = () => (needsSignIn ? navigate("/sign-in") : setStep("confirm"));
    const ctaDisabled = ended || (!isFull && teamIncomplete);

    const related = EVENTS.filter((e) => e.id !== event.id && !isPast(e.date) && (e.kind === event.kind || e.charity === event.charity)).slice(0, 3);
    const when = `${fmtRange(event.date, event.endDate)} · ${event.time}`;

    const dialogLines = isFull
        ? [
              { label: "Party size", value: `${party} ${party === 1 ? "player" : "players"}` },
              { label: "Waitlist position", value: `#${(event.waitlist ?? 0) + 1}` },
          ]
        : [
              { label: "Players", value: <span className="block max-w-[220px]">{playerNames.join(", ")}</span> },
              ...(event.priceUnit === "per team"
                  ? [{ label: `1 team of ${team}`, value: money(event.price) }]
                  : [
                        { label: `${memberCount} × ${event.guestPrice ? "Member" : "Player"}`, value: money(memberCount * event.price) },
                        ...(guests ? [{ label: `${guests} × Guest`, value: money(guests * guestPrice) }] : []),
                    ]),
              ...(donation ? [{ label: `Donation to ${event.charity!.beneficiary}`, value: currency(donation) }] : []),
          ];

    /* ----- Register card (form → receipt once registered) ----- */
    const card = registered ? (
        <SideCard>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-secondary px-3 py-1 text-xs font-semibold text-success-primary">
                <CheckCircle className="size-3.5" aria-hidden="true" /> {isFull ? "On the waitlist" : "Registered"}
            </span>
            <p className="mt-3 text-md font-semibold text-primary">{isFull ? `You're #${(event.waitlist ?? 0) + 1} on the waitlist` : "You're all set"}</p>
            <p className="text-sm text-tertiary">{when}</p>
            <dl className="mt-4 flex flex-col gap-2.5 border-t border-secondary pt-4">
                <SummaryLine label="Registered on" value={formatDate(TODAY)} />
                <SummaryLine label="Players" value={players} />
                {!isFull && <SummaryLine label="Amount paid" value={money(total)} />}
                {!isFull && total > 0 && <SummaryLine label="Paid with" value={`${PAYMENT_CARDS[0].brand} •••• ${PAYMENT_CARDS[0].last4}`} />}
            </dl>
            <div className="mt-4 flex flex-col gap-2.5">
                <AddToCalendar fullWidth />
                <ShareButton />
            </div>
            <button type="button" onClick={() => setRegistered(false)} className={cx("mt-3 w-full cursor-pointer rounded text-center text-sm font-semibold text-error-primary", focusRing)}>
                {isFull ? "Leave waitlist" : "Cancel registration"}
            </button>
        </SideCard>
    ) : (
        <SideCard>
            <PriceHeadline price={event.price} unit={event.priceUnit} />
            {event.guestPrice && <p className="text-sm text-tertiary">Guests {money(event.guestPrice)}</p>}
            <p className="mt-3 flex items-center gap-2 text-sm text-secondary">
                <Calendar className="size-4 text-fg-quaternary" aria-hidden="true" />
                {when}
            </p>

            {!ended && <SpotsMeter capacity={event.capacity} spotsLeft={event.spotsLeft} noun={team ? "teams" : "spots"} className="mt-4" />}

            {event.membersOnly && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-secondary p-3 text-sm">
                    <Lock01 className="mt-0.5 size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                    {userName ? (
                        <span className="text-secondary">
                            Members only. Your <span className="font-semibold text-primary">{membership.name}</span> (#{membership.memberId}) qualifies.
                        </span>
                    ) : (
                        <span className="text-secondary">Members only. Sign in with your member account to register.</span>
                    )}
                </div>
            )}

            {isFull && !ended && (
                <div className="mt-4 rounded-xl bg-secondary p-3">
                    <p className="text-sm font-semibold text-primary">This event is full</p>
                    <p className="text-sm text-tertiary">
                        {event.waitlist} {event.waitlist === 1 ? "person is" : "people are"} on the waitlist. Join and we'll email you if a spot opens.
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-secondary">Party size</span>
                        <Stepper value={party} onChange={setParty} max={4} label="Players" />
                    </div>
                </div>
            )}

            {!isFull && !ended && !needsSignIn && (
                <div className="mt-5">
                    <p className="text-sm font-semibold text-primary">{team ? `Your team (${team} players)` : "Who's playing"}</p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                        <li className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5">
                            <User01 className="size-4 text-fg-quaternary" aria-hidden="true" />
                            <span className="flex-1 text-sm font-medium text-primary">
                                {USER.firstName} {USER.lastName}
                            </span>
                            <span className="text-xs text-tertiary">You{event.guestPrice ? " · Member" : ""}</span>
                        </li>
                        {Array.from({ length: guests }, (_, i) => (
                            <li key={i} className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5">
                                <User01 className="size-4 text-fg-quaternary" aria-hidden="true" />
                                <span className="flex-1 text-sm font-medium text-primary">Guest {i + 1}</span>
                                {event.guestPrice && <span className="text-xs text-tertiary">{money(guestPrice)}</span>}
                                <AriaButton aria-label={`Remove guest ${i + 1}`} onPress={() => setGuests((g) => g - 1)} className={cx("cursor-pointer rounded text-fg-quaternary hover:text-fg-secondary", focusRing)}>
                                    <XClose className="size-4" aria-hidden="true" />
                                </AriaButton>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3 text-xs font-semibold tracking-wide text-quaternary uppercase">{team ? "Add your partner" : "Add buddies"}</p>
                    <div className="mt-1.5 flex flex-col">
                        {namedBuddies.slice(0, 4).map((b) => {
                            const on = buddies.includes(b.id);
                            return (
                                <AriaCheckbox
                                    key={b.id}
                                    isSelected={on}
                                    isDisabled={!on && roomLeft <= 0}
                                    onChange={(v) => toggleBuddy(b.id, v)}
                                    className="group flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 text-sm text-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary ring-1 ring-primary ring-inset group-data-[focus-visible]:ring-4 group-data-[focus-visible]:ring-brand-300/60 group-data-[selected]:bg-brand-solid group-data-[selected]:ring-0">
                                        <CheckCircle className="hidden size-3.5 text-white group-data-[selected]:block" aria-hidden="true" />
                                    </span>
                                    <span className="flex-1">{b.name}</span>
                                    {b.handicap != null && <span className="text-xs text-tertiary tabular-nums">HCP {b.handicap}</span>}
                                </AriaCheckbox>
                            );
                        })}
                    </div>
                    <WebButton size="sm" color="outline" iconLeading={Plus} isDisabled={roomLeft <= 0} onPress={() => setGuests((g) => g + 1)} className="mt-2 w-full">
                        Add a guest
                    </WebButton>
                    <p className="mt-1.5 text-xs text-tertiary">{roomLeft > 0 ? `Up to ${maxParty} players per registration.` : team ? "Your team is complete." : `That's the most for one registration.`}</p>
                </div>
            )}

            {event.charity && !isFull && !ended && !needsSignIn && (
                <div className="mt-5">
                    <p className="text-sm font-semibold text-primary">Add a donation</p>
                    <ChoiceChips
                        aria-label="Donation amount"
                        value={String(donation)}
                        onChange={(v) => setDonation(Number(v))}
                        options={DONATIONS.map((d) => ({ id: String(d), label: d === 0 ? "None" : `$${d}` }))}
                        className="mt-2 [&>*]:h-9 [&>*]:w-auto [&>*]:min-w-14 [&>*]:rounded-lg [&>*]:px-3 [&>*]:text-sm"
                    />
                </div>
            )}

            {!isFull && !ended && !needsSignIn && (
                <div className="mt-5 flex flex-col gap-2 border-t border-secondary pt-4">
                    {event.priceUnit === "per team" ? (
                        <SummaryLine label="1 team" value={money(event.price)} />
                    ) : (
                        <>
                            <SummaryLine label={`${event.guestPrice ? "Members " : ""}${money(event.price)} × ${memberCount}`} value={money(memberCount * event.price)} />
                            {guests > 0 && <SummaryLine label={`Guests ${money(guestPrice)} × ${guests}`} value={money(guests * guestPrice)} />}
                        </>
                    )}
                    {donation > 0 && <SummaryLine label="Donation" value={currency(donation)} />}
                    <SummaryLine strong label="Total" value={money(total)} />
                </div>
            )}

            <WebButton size="lg" fullWidth className="mt-4" isDisabled={ctaDisabled} onPress={onCta}>
                {cta}
            </WebButton>
            {teamIncomplete && !isFull && <p className="mt-2 text-center text-xs text-warning-primary">Add your partner to complete the team.</p>}
            {!ended && !teamIncomplete && <p className="mt-2.5 text-center text-xs text-tertiary">{isFull ? "No charge to join the waitlist" : "Free cancellation up to 48 hours before"}</p>}
        </SideCard>
    );

    return (
        <WebShell active="events">
            <WebPage className="pb-10 @desktop:pb-20">
                <div className="mb-5">
                    <BackLink href="/events">All events</BackLink>
                </div>
                <Hero src={event.banner ?? event.image} alt={event.title} />

                <div className="mt-6 flex flex-wrap items-center gap-2">
                    <LabelPill icon={event.charity ? HeartHand : Trophy01}>{kindLabel(event.kind)}</LabelPill>
                    <AvailabilityBadge availability={status} waitlist={!!event.waitlist} />
                    {event.membersOnly && <MembersBadge />}
                    {event.ageGroup && <LabelPill icon={Users01}>{event.ageGroup}</LabelPill>}
                </div>
                <div className="mt-3 flex items-start justify-between gap-4">
                    <h1 className="max-w-3xl text-display-xs font-bold tracking-[-0.3px] text-primary @tablet:text-display-sm">{event.title}</h1>
                    <span className="hidden shrink-0 @tablet:block">
                        <ShareButton size="sm" />
                    </span>
                </div>
                <p className="mt-2 text-md font-semibold text-brand-secondary">{event.organizer}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-tertiary">
                    <MetaInline icon={Calendar}>{fmtRange(event.date, event.endDate)}</MetaInline>
                    <MetaInline icon={Clock}>{event.time}</MetaInline>
                    <MetaInline icon={MarkerPin01}>{event.location}</MetaInline>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 @desktop:grid-cols-3">
                    <div className="flex flex-col gap-8 @desktop:col-span-2">
                        <DetailSection first title="About this event">
                            <p className="text-md text-secondary">{event.description}</p>
                        </DetailSection>

                        {event.charity && (
                            <div className="rounded-2xl bg-primary p-5 ring-1 ring-secondary ring-inset">
                                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                                    <HeartHand className="size-5 text-fg-brand-primary" aria-hidden="true" /> Proceeds support the {event.charity.beneficiary}
                                </p>
                                <div className="mt-3 flex items-baseline justify-between text-sm">
                                    <span className="text-display-xs font-semibold text-primary tabular-nums">{wholeDollars(event.charity.raised)}</span>
                                    <span className="text-tertiary">raised of {wholeDollars(event.charity.goal)} goal</span>
                                </div>
                                <ProgressBar value={event.charity.raised} max={event.charity.goal} aria-label="Fundraising progress" className="mt-2" />
                            </div>
                        )}

                        <DetailSection first title="What's included">
                            <CheckList items={event.included} />
                        </DetailSection>

                        <DetailSection title="Event details">
                            <div className="grid grid-cols-1 gap-5 @tablet:grid-cols-2">
                                <InfoRow icon={Calendar} label="Date" value={event.endDate ? `${fmtLong(event.date)} – ${fmtLong(event.endDate)}` : fmtLong(event.date)} />
                                <InfoRow icon={Clock} label="Time" value={event.time} />
                                <InfoRow icon={Users01} label="Format" value={event.format} />
                                <InfoRow icon={MarkerPin01} label="Location" value={`${event.location} · ${course.name}`} />
                                {event.ageGroup && <InfoRow icon={Users01} label="Eligibility" value={event.ageGroup} />}
                                {event.membersOnly && <InfoRow icon={Lock01} label="Eligibility" value={team ? "Members and one guest each" : "Members only"} />}
                            </div>
                        </DetailSection>

                        <DetailSection title="Where">
                            <p className="text-sm font-medium text-secondary">{course.name}</p>
                            {course.address && <p className="text-sm text-tertiary">{course.address}</p>}
                            <p className="mt-1 text-sm text-tertiary">Check in at the {event.location.split(" · ")[0]} 30 minutes before start.</p>
                        </DetailSection>

                        <DetailSection title="Know before you go">
                            <p className="text-sm text-tertiary">
                                Free cancellation up to 48 hours before the start time. Registration is {event.priceUnit}. If the event is weather-shortened, you'll receive a rain check by
                                email.
                            </p>
                        </DetailSection>
                    </div>

                    <div className="order-first @desktop:order-none">{card}</div>
                </div>

                {related.length > 0 && (
                    <section className="mt-14 border-t border-secondary pt-8">
                        <h2 className="text-lg font-semibold text-primary">More events</h2>
                        <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-8 @min-[600px]:grid-cols-2 @desktop:grid-cols-3">
                            {related.map((e) => (
                                <EventCard key={e.id} event={e} availability={availabilityOf(e)} />
                            ))}
                        </div>
                    </section>
                )}
            </WebPage>

            {!registered && !ended && (
                <MobileActionBar
                    summary={
                        <>
                            <p className="text-md font-semibold text-primary tabular-nums">{isFull ? "Waitlist" : money(total)}</p>
                            <p className="truncate text-xs text-tertiary">{isFull ? `${event.waitlist} ahead of you` : `${players} ${players === 1 ? "player" : "players"} · ${fmtRange(event.date, event.endDate)}`}</p>
                        </>
                    }
                    action={
                        <WebButton onPress={onCta} isDisabled={ctaDisabled}>
                            {cta}
                        </WebButton>
                    }
                />
            )}

            <ConfirmDialog
                step={step}
                onStepChange={setStep}
                onConfirmed={() => setRegistered(true)}
                title={isFull ? "Join the waitlist" : "Confirm registration"}
                subject={{ title: event.title, when, image: event.image }}
                lines={dialogLines}
                total={total}
                mode={isFull ? "waitlist" : total === 0 ? "free" : "pay"}
                confirmLabel={isFull ? "Join waitlist" : total === 0 ? "Reserve" : `Pay ${money(total)}`}
                done={
                    isFull
                        ? { title: "You're on the waitlist", body: `You're #${(event.waitlist ?? 0) + 1}. We'll email ${USER.email} if a spot opens.` }
                        : { title: "You're registered", body: `Confirmation sent to ${USER.email}.` }
                }
            />
        </WebShell>
    );
};
