import { useState } from "react";
import { AlertTriangle, ArrowRight, Award05, Check, ChevronRight, Flag06, Ticket01, Ticket02, UserPlus01, Wallet02, CalendarCheck01 } from "@untitledui/icons";
import { IconTile } from "@/components/base/card";
import { WebLink } from "@/components/web/web-router";
import { BOOKINGS, MEMBERSHIPS, PUNCH_CARDS, currency, formatDate, walletStatus, type Membership } from "@/data/crane";
import { useWebSession } from "@/screens/web/web-shell";
import { cx } from "@/utils/cx";
import { ACCOUNT_EXTRAS, BUDDY_SUGGESTIONS, EVENT_KIND_LABEL, REGISTERED_EVENTS } from "./account-data";
import { AccountLayout } from "./account-layout";
import { AccountTitle, Initials, LinkButton, StatTile, TextAction, shortDay } from "./account-ui";

export interface UpcomingItem {
    id: string;
    kind: "tee-time" | "event";
    date: Date;
    title: string;
    detail: string;
    href: string;
}

/** Upcoming tee times + registered events/clinics, soonest first. */
export const upcomingItems = (): UpcomingItem[] =>
    [
        ...BOOKINGS.filter((b) => b.status === "upcoming").map<UpcomingItem>((b) => ({
            id: b.id,
            kind: "tee-time",
            date: b.date,
            title: `Tee Time · ${b.course.name}`,
            detail: `${shortDay(b.date)} · ${b.time} · ${b.players} player${b.players === 1 ? "" : "s"} · ${b.holes} holes`,
            href: `/tee-times/bookings/${b.id}`,
        })),
        ...REGISTERED_EVENTS.map<UpcomingItem>((e) => ({
            id: e.id,
            kind: "event",
            date: e.date,
            title: `${EVENT_KIND_LABEL[e.kind]} · ${e.title}`,
            detail: `${shortDay(e.date)} · ${e.time} · ${e.location}`,
            href: `/account/events?open=${e.id}`,
        })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

/** A full-width link row: tile · title/detail · chevron. */
export const UpcomingRow = ({ item }: { item: UpcomingItem }) => (
    <li>
        <WebLink
            href={item.href}
            className="flex items-center gap-4 px-5 py-4 outline-none transition duration-100 ease-linear hover:bg-primary_hover focus-visible:bg-primary_hover focus-visible:ring-4 focus-visible:ring-brand-300/60 focus-visible:ring-inset"
        >
            <IconTile icon={item.kind === "tee-time" ? Flag06 : Ticket02} tone={item.kind === "tee-time" ? "brand" : "gray"} />
            <span className="min-w-0 flex-1">
                <span className="block text-md font-semibold text-primary @tablet:truncate">{item.title}</span>
                <span className="block text-sm text-tertiary @tablet:truncate">{item.detail}</span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
        </WebLink>
    </li>
);

/** Non-member upsell (Fox Overview "Get more out of …" banner). */
const JoinBanner = ({ courseName }: { courseName: string }) => (
    <section aria-label="Memberships" className="flex flex-col gap-4 rounded-xl bg-brand-section p-6 text-white @tablet:flex-row @tablet:items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Award05 className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-white">Get more out of {courseName}</p>
            <p className="text-sm text-white/75">Members get unlimited golf, a 30-day booking window, and first access to leagues, clinics and events.</p>
        </div>
        <WebLink href="/account/memberships" className="caps inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-5 text-brand-secondary outline-none focus-visible:ring-4 focus-visible:ring-white/50">
            View memberships <ArrowRight className="size-3.5" aria-hidden="true" />
        </WebLink>
    </section>
);

const ExpiringNotice = ({ m }: { m: Membership }) => (
    <div role="note" className="flex flex-wrap items-center gap-3 rounded-xl bg-warning-primary px-5 py-4">
        <AlertTriangle className="size-5 shrink-0 text-fg-warning-primary" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-sm text-warning-primary">
            <span className="font-semibold">{m.name}</span> ends {formatDate(m.expires)}. Renew to keep your member booking window.
        </p>
        <TextAction href="/account/memberships" tone="brand">
            Renew <ArrowRight className="size-4" aria-hidden="true" />
        </TextAction>
    </div>
);

/** Fox's Golf Buddies connect module, filled with people you've played with. */
const BuddiesModule = () => {
    const [added, setAdded] = useState<Set<string>>(new Set());
    return (
        <section aria-label="Golf Buddies" className="overflow-hidden rounded-xl bg-brand-section text-white">
            <div className="flex flex-col gap-1 px-6 pt-6">
                <span className="caps text-white/60">Golf Buddies</span>
                <h3 className="text-xl font-semibold text-white">Play with people you know</h3>
                <p className="max-w-xl text-sm text-white/75">You've played with these golfers recently. Add them as buddies to add them to a tee time in one click.</p>
            </div>
            <ul className="mt-5 grid grid-cols-1 gap-3 px-6 @tablet:grid-cols-2">
                {BUDDY_SUGGESTIONS.map((b) => {
                    const on = added.has(b.id);
                    return (
                        <li key={b.id} className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                            <Initials name={b.name} className="bg-white/15 text-white" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-white">{b.name}</p>
                                <p className="truncate text-xs text-white/65">{b.note}</p>
                            </div>
                            <button
                                type="button"
                                aria-pressed={on}
                                onClick={() => setAdded((s) => new Set(s).add(b.id))}
                                disabled={on}
                                className={cx(
                                    "flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 text-xs font-semibold outline-none transition duration-100 ease-linear focus-visible:ring-4 focus-visible:ring-white/40",
                                    on ? "cursor-default bg-white/15 text-white" : "bg-white text-brand-secondary hover:bg-white/90",
                                )}
                            >
                                {on ? <Check className="size-3.5" aria-hidden="true" /> : <UserPlus01 className="size-3.5" aria-hidden="true" />}
                                {on ? "Invited" : "Add"}
                            </button>
                        </li>
                    );
                })}
            </ul>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
                <p className="text-sm text-white/75">Know someone who isn't on Crane yet?</p>
                <WebLink href="/account/buddies" className="rounded text-sm font-semibold text-white underline underline-offset-4 outline-none focus-visible:ring-4 focus-visible:ring-white/40">
                    Invite a buddy
                </WebLink>
            </div>
        </section>
    );
};

export interface AccountOverviewScreenProps {
    /** Pass [] for the non-member state (shows the join banner). */
    memberships?: Membership[];
    statementBalance?: number;
}

/**
 * Overview — ports Fox "Profile ∕ Account/Overview": welcome, at-a-glance stats, upcoming
 * tee times and events, and the Golf Buddies connect module.
 */
export const AccountOverviewScreen = ({ memberships = MEMBERSHIPS, statementBalance = 0 }: AccountOverviewScreenProps) => {
    const { userName, course } = useWebSession();
    const upcoming = upcomingItems();
    const active = memberships.filter((m) => walletStatus({ expires: m.expires }) !== "expired");
    const expiring = active.find((m) => walletStatus({ expires: m.expires }) === "expiring-soon");
    const punchesLeft = PUNCH_CARDS.reduce((n, c) => n + c.items.reduce((s, i) => s + (i.total - i.used), 0), 0);
    const teeTimes = upcoming.filter((u) => u.kind === "tee-time").length;

    return (
        <AccountLayout active="overview">
            <div className="flex flex-col gap-8">
                <AccountTitle
                    title={`Welcome back, ${userName ?? "golfer"}`}
                    subtitle={active.length ? `${active[0].name} · ${course.name}` : `Guest · ${course.name}`}
                />

                {active.length === 0 && <JoinBanner courseName={course.name} />}
                {expiring && <ExpiringNotice m={expiring} />}

                <div className="grid grid-cols-2 gap-3 @tablet:grid-cols-4 @tablet:gap-4">
                    <StatTile icon={Flag06} label="Handicap" value={ACCOUNT_EXTRAS.handicap} sub="Index" href="/account/my-account" />
                    <StatTile icon={Wallet02} label="Balance" value={currency(statementBalance)} sub={statementBalance > 0 ? "Due now" : "Nothing due"} href="/account/wallet" />
                    <StatTile
                        icon={CalendarCheck01}
                        label="Upcoming"
                        value={upcoming.length}
                        sub={`${teeTimes} tee time${teeTimes === 1 ? "" : "s"} · ${upcoming.length - teeTimes} events`}
                        href="/account/activity"
                    />
                    <StatTile icon={Ticket01} label="Punch cards" value={punchesLeft} sub="Punches left" href="/account/wallet" />
                </div>

                <section aria-label="Upcoming" className="overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset">
                    <header className="flex items-center justify-between gap-4 border-b border-secondary px-5 py-4">
                        <h3 className="text-lg font-semibold text-primary">Upcoming</h3>
                        <TextAction href="/account/activity" tone="brand">
                            View all <ChevronRight className="size-4" aria-hidden="true" />
                        </TextAction>
                    </header>
                    <ul className="divide-y divide-secondary">
                        {upcoming.slice(0, 3).map((u) => (
                            <UpcomingRow key={u.id} item={u} />
                        ))}
                    </ul>
                    <div className="flex flex-wrap gap-2.5 border-t border-secondary px-5 py-4">
                        <LinkButton size="sm" href="/tee-times" icon={Flag06}>
                            Book a tee time
                        </LinkButton>
                        <LinkButton size="sm" color="outline" href="/events">
                            Browse events
                        </LinkButton>
                    </div>
                </section>

                <BuddiesModule />
            </div>
        </AccountLayout>
    );
};
