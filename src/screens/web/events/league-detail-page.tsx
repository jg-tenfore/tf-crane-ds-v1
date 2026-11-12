import { useState, type ReactNode } from "react";
import { Calendar, CheckCircle, Clock, Mail01, MarkerPin01, Trophy01, Users01 } from "@untitledui/icons";
import { Tab as AriaTab, TabList as AriaTabList, TabPanel as AriaTabPanel, Tabs as AriaTabs, ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup, type Key } from "react-aria-components";
import { cx } from "@/utils/cx";
import { RadioCardGroup } from "@/components/forms/choice";
import { TextField } from "@/components/forms/text-field";
import { WebPage } from "@/components/web/web-layout";
import { BUDDIES, USER } from "@/data/crane";
import { WebShell } from "../web-shell";
import { availability as availabilityOf, fmtDay, fmtLong, fmtShort, isPast, leagueById, leagueThisWeek, type League } from "./events-data";
import { LeagueStatusPill, ordinal } from "./leagues-browse-page";
import {
    AddToCalendar,
    AvailabilityBadge,
    BackLink,
    CheckList,
    ConfirmDialog,
    DetailSection,
    focusRing,
    Hero,
    InfoRow,
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

const partners = BUDDIES.filter((b) => b.name).slice(0, 4);

export type LeagueTab = "overview" | "schedule" | "standings";

export interface LeagueDetailPageProps {
    id: string;
    initialTab?: LeagueTab;
    initialStep?: DialogStep | null;
    initialJoined?: boolean;
}

/**
 * /leagues/:id — new for Crane Web, built to match the event and clinic detail pages: hero,
 * Overview / Schedule / Standings tabs, and a sticky join card. The card adapts to the league:
 * team signup (partner or solo), mid-season prorated join, waitlist when full, and "you're in"
 * with request-a-sub for leagues the golfer already plays.
 */
export const LeagueDetailPage = ({ id, initialTab = "overview", initialStep = null, initialJoined = false }: LeagueDetailPageProps) => {
    const league = leagueById(id);
    if (!league)
        return (
            <WebShell active="leagues">
                <WebPage>
                    <BackLink href="/leagues">All leagues</BackLink>
                    <p className="mt-10 text-lg font-semibold text-primary">We couldn't find that league.</p>
                </WebPage>
            </WebShell>
        );
    return <LeagueDetail key={league.id} league={league} initialTab={initialTab} initialStep={initialStep} initialJoined={initialJoined} />;
};

const weekStatus = (date: string, next?: string, rainout?: boolean) =>
    rainout ? { label: "Rainout", cls: "text-warning-primary" } : isPast(date) ? { label: "Played", cls: "text-quaternary" } : date === next ? { label: "Next", cls: "text-brand-secondary font-semibold" } : { label: "Upcoming", cls: "text-tertiary" };

const Th = ({ children, className }: { children?: ReactNode; className?: string }) => <th className={cx("px-4 py-2.5 text-left text-xs font-semibold text-tertiary", className)}>{children}</th>;

const LeagueDetail = ({ league, initialTab, initialStep, initialJoined }: { league: League; initialTab: LeagueTab; initialStep: DialogStep | null; initialJoined: boolean }) => {
    const status = availabilityOf(league);
    const isFull = status === "full";
    const next = leagueThisWeek(league);
    const remaining = league.schedule.filter((w) => !isPast(w.date)).length;
    const prorated = league.status === "in-season" && remaining < league.schedule.length;
    const fee = prorated ? Math.round((league.fee * remaining) / league.schedule.length) : league.fee;
    const myIndex = league.standings?.findIndex((s) => s.you) ?? -1;
    const myTeam = myIndex >= 0 ? league.standings![myIndex] : undefined;

    const [tab, setTab] = useState<Key>(initialTab);
    const [mode, setMode] = useState(league.teamSize === 2 ? "team" : "solo");
    const [partner, setPartner] = useState(partners[0].id);
    const [teamName, setTeamName] = useState(`${USER.lastName} / ${partners[0].name.split(" ")[1]}`);
    const [party, setParty] = useState(1);
    const [step, setStep] = useState<DialogStep | null>(initialStep);
    const [joined, setJoined] = useState(initialJoined);
    const [subStep, setSubStep] = useState<DialogStep | null>(null);
    const [subRequested, setSubRequested] = useState(false);

    const partnerName = partners.find((p) => p.id === partner)!.name;
    const when = `${league.day} · ${league.time}`;
    const cta = isFull ? "Join waitlist" : league.teamSize === 2 && mode === "team" ? "Register team" : "Join league";
    const showJoinBar = !myTeam && !joined;

    const card = myTeam ? (
        <SideCard>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-secondary px-3 py-1 text-xs font-semibold text-success-primary">
                <CheckCircle className="size-3.5" aria-hidden="true" /> You're in
            </span>
            <p className="mt-3 text-lg font-semibold text-primary">{myTeam.team}</p>
            <p className="text-sm text-tertiary">{myTeam.players.join(" & ")}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                    ["Place", ordinal(myIndex + 1)],
                    ["Points", myTeam.points],
                    ["Net avg", myTeam.net.toFixed(1)],
                ].map(([l, v]) => (
                    <div key={l} className="rounded-xl bg-secondary px-2 py-3">
                        <p className="text-lg font-semibold text-primary tabular-nums">{v}</p>
                        <p className="text-xs text-tertiary">{l}</p>
                    </div>
                ))}
            </div>
            {next && (
                <div className="mt-4 rounded-xl p-3 ring-1 ring-secondary ring-inset">
                    <p className="caps text-[11px] text-quaternary">Next round</p>
                    <p className="mt-1 text-sm font-semibold text-primary">
                        {fmtDay(next.date)} · {league.time}
                    </p>
                    <p className="text-sm text-tertiary">
                        Week {next.week} · {next.format}
                    </p>
                </div>
            )}
            <div className="mt-4 flex flex-col gap-2.5">
                <AddToCalendar fullWidth />
                <WebButton color="outline" isDisabled={subRequested} onPress={() => setSubStep("confirm")}>
                    {subRequested ? "Sub requested" : "Can't make it? Request a sub"}
                </WebButton>
            </div>
        </SideCard>
    ) : joined ? (
        <SideCard>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-secondary px-3 py-1 text-xs font-semibold text-success-primary">
                <CheckCircle className="size-3.5" aria-hidden="true" /> {isFull ? "On the waitlist" : "Registered"}
            </span>
            <p className="mt-3 text-md font-semibold text-primary">{isFull ? `You're #${(league.waitlist ?? 0) + 1} on the waitlist` : mode === "team" ? teamName : "You're in the league"}</p>
            <p className="text-sm text-tertiary">
                {isFull ? "We'll email you if a team drops out." : mode === "team" ? `We sent ${partnerName} an invite to pay their share.` : "We'll pair you with a partner before week 1."}
            </p>
            {!isFull && (
                <p className="mt-3 text-sm text-secondary">
                    First round {fmtDay(next?.date ?? league.start)} · {league.time}
                </p>
            )}
            <div className="mt-4 flex flex-col gap-2.5">
                <AddToCalendar fullWidth />
                <ShareButton />
            </div>
        </SideCard>
    ) : (
        <SideCard>
            <PriceHeadline price={fee} unit={prorated ? "per player · rest of season" : league.feeUnit} />
            {prorated && (
                <p className="text-sm text-tertiary">
                    Prorated from {money(league.fee)} · {remaining} of {league.schedule.length} weeks left
                </p>
            )}
            <p className="mt-3 flex items-center gap-2 text-sm text-secondary">
                <Calendar className="size-4 text-fg-quaternary" aria-hidden="true" />
                {when}
            </p>
            <SpotsMeter capacity={league.capacity} spotsLeft={league.spotsLeft} noun={league.teamSize === 2 ? "teams" : "spots"} className="mt-4" />

            {isFull ? (
                <div className="mt-4 rounded-xl bg-secondary p-3">
                    <p className="text-sm font-semibold text-primary">This league is full</p>
                    <p className="text-sm text-tertiary">{league.waitlist} on the waitlist. Teams drop out every season — join and we'll email you.</p>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-secondary">Players</span>
                        <Stepper value={party} onChange={setParty} max={league.teamSize} min={1} label="Players" />
                    </div>
                </div>
            ) : league.teamSize === 2 ? (
                <div className="mt-5 flex flex-col gap-4">
                    <RadioCardGroup
                        label="How are you joining?"
                        value={mode}
                        onChange={setMode}
                        options={[
                            { id: "team", label: "With a partner", description: "Register your team of two" },
                            { id: "solo", label: "On my own", description: "We'll pair you before week 1" },
                        ]}
                    />
                    {mode === "team" && (
                        <>
                            <div>
                                <p className="text-sm font-semibold text-primary">Partner</p>
                                <AriaToggleButtonGroup
                                    aria-label="Partner"
                                    selectionMode="single"
                                    disallowEmptySelection
                                    selectedKeys={[partner]}
                                    onSelectionChange={(k) => {
                                        const [v] = k as Set<Key>;
                                        if (v == null) return;
                                        setPartner(String(v));
                                        setTeamName(`${USER.lastName} / ${partners.find((p) => p.id === v)!.name.split(" ")[1]}`);
                                    }}
                                    className="mt-2 flex flex-wrap gap-2"
                                >
                                    {partners.map((p) => (
                                        <AriaToggleButton
                                            key={p.id}
                                            id={p.id}
                                            className={cx(
                                                "h-9 cursor-pointer rounded-full px-3.5 text-sm font-medium text-secondary ring-1 ring-secondary ring-inset transition duration-100 ease-linear hover:bg-primary_hover data-[selected]:bg-brand-solid data-[selected]:text-white data-[selected]:ring-transparent",
                                                focusRing,
                                            )}
                                        >
                                            {p.name}
                                        </AriaToggleButton>
                                    ))}
                                </AriaToggleButtonGroup>
                            </div>
                            <TextField label="Team name" value={teamName} onChange={setTeamName} />
                        </>
                    )}
                </div>
            ) : null}

            {!isFull && (
                <div className="mt-5 flex flex-col gap-2 border-t border-secondary pt-4">
                    <SummaryLine label="Your fee" value={money(fee)} />
                    {league.teamSize === 2 && mode === "team" && <SummaryLine label={`${partnerName}'s fee`} value="Invite sent" />}
                    <SummaryLine strong label="Due today" value={money(fee)} />
                </div>
            )}
            <WebButton size="lg" fullWidth className="mt-4" onPress={() => setStep("confirm")}>
                {cta}
            </WebButton>
            <p className="mt-2.5 text-center text-xs text-tertiary">{isFull ? "No charge to join the waitlist" : "Full refund until the first round"}</p>
        </SideCard>
    );

    const tabCls = cx(
        "caps relative cursor-pointer pb-3 whitespace-nowrap text-quaternary outline-none transition duration-100 ease-linear hover:text-secondary data-[selected]:text-brand-secondary data-[selected]:after:absolute data-[selected]:after:inset-x-0 data-[selected]:after:bottom-0 data-[selected]:after:h-0.5 data-[selected]:after:rounded-full data-[selected]:after:bg-fg-brand-primary data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60",
    );

    return (
        <WebShell active="leagues">
            <WebPage className="pb-10 @desktop:pb-20">
                <div className="mb-5">
                    <BackLink href="/leagues">All leagues</BackLink>
                </div>
                <Hero src={league.banner ?? league.image} alt={league.name} />
                <div className="mt-6 flex flex-wrap items-center gap-2">
                    <LeagueStatusPill league={league} />
                    {status !== "open" && <AvailabilityBadge availability={status} waitlist={!!league.waitlist} />}
                </div>
                <div className="mt-3 flex items-start justify-between gap-4">
                    <h1 className="max-w-3xl text-display-xs font-bold tracking-[-0.3px] text-primary @tablet:text-display-sm">{league.name}</h1>
                    <span className="hidden shrink-0 @tablet:block">
                        <ShareButton size="sm" />
                    </span>
                </div>
                <p className="mt-2 text-md font-semibold text-brand-secondary">{league.tagline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-tertiary">
                    <MetaInline icon={Clock}>{when}</MetaInline>
                    <MetaInline icon={Calendar}>
                        {fmtShort(league.start)} – {fmtShort(league.end)}
                    </MetaInline>
                    <MetaInline icon={MarkerPin01}>{league.location}</MetaInline>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 @desktop:grid-cols-3">
                    <AriaTabs selectedKey={tab} onSelectionChange={setTab} className="min-w-0 @desktop:col-span-2">
                        <AriaTabList aria-label="League sections" className="scrollbar-hide flex gap-7 overflow-x-auto border-b border-secondary">
                            <AriaTab id="overview" className={tabCls}>
                                Overview
                            </AriaTab>
                            <AriaTab id="schedule" className={tabCls}>
                                Schedule
                            </AriaTab>
                            {league.standings && (
                                <AriaTab id="standings" className={tabCls}>
                                    Standings
                                </AriaTab>
                            )}
                        </AriaTabList>

                        <AriaTabPanel id="overview" className="flex flex-col gap-8 pt-7 outline-none">
                            <DetailSection first title="About this league">
                                <p className="text-md text-secondary">{league.description}</p>
                            </DetailSection>
                            <DetailSection first title="What's included">
                                <CheckList items={league.includes} />
                            </DetailSection>
                            <DetailSection title="League details">
                                <div className="grid grid-cols-1 gap-5 @tablet:grid-cols-2">
                                    <InfoRow icon={Clock} label="When" value={when} />
                                    <InfoRow icon={Calendar} label="Season" value={`${fmtLong(league.start)} – ${fmtLong(league.end)}`} />
                                    <InfoRow icon={Trophy01} label="Format" value={league.format} />
                                    <InfoRow icon={Users01} label="Teams" value={league.teamSize === 2 ? "2-person teams · solo players paired" : "Individual"} />
                                    <InfoRow icon={Users01} label="Eligibility" value={league.eligibility} />
                                    <InfoRow icon={Mail01} label="Coordinator" value={league.coordinator} />
                                </div>
                            </DetailSection>
                            <DetailSection title="How it works">
                                <p className="text-sm text-tertiary">
                                    Show up 20 minutes before {league.time.split(" ")[0]} {league.time.split(" ")[1]} to check in. Can't make a week? Request a sub from this page by 5 PM the day
                                    before. Rainouts are made up at the end of the season.
                                </p>
                            </DetailSection>
                        </AriaTabPanel>

                        <AriaTabPanel id="schedule" className="pt-7 outline-none">
                            <div className="overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset">
                                <table className="w-full">
                                    <thead className="border-b border-secondary bg-secondary">
                                        <tr>
                                            <Th className="w-16">Week</Th>
                                            <Th>Date</Th>
                                            <Th className="hidden @tablet:table-cell">Format</Th>
                                            <Th className="text-right">Status</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {league.schedule.map((w) => {
                                            const s = weekStatus(w.date, next?.date, w.rainout);
                                            return (
                                                <tr key={w.week} className={cx("border-b border-secondary last:border-b-0", w.date === next?.date && "bg-brand-primary_alt")}>
                                                    <td className="px-4 py-3 text-sm font-semibold text-secondary tabular-nums">{w.week}</td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-sm font-medium text-primary">{fmtDay(w.date)}</p>
                                                        <p className="text-xs text-tertiary @tablet:hidden">{w.format}</p>
                                                        {w.note && <p className="text-xs text-tertiary">{w.note}</p>}
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-sm text-secondary @tablet:table-cell">{w.format}</td>
                                                    <td className={cx("px-4 py-3 text-right text-sm", s.cls)}>{s.label}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </AriaTabPanel>

                        {league.standings && (
                            <AriaTabPanel id="standings" className="pt-7 outline-none">
                                <div className="overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset">
                                    <table className="w-full">
                                        <thead className="border-b border-secondary bg-secondary">
                                            <tr>
                                                <Th className="w-14">Pos</Th>
                                                <Th>{league.teamSize === 2 ? "Team" : "Player"}</Th>
                                                <Th className="hidden text-right @tablet:table-cell">Played</Th>
                                                <Th className="hidden text-right @tablet:table-cell">Net avg</Th>
                                                <Th className="text-right">Points</Th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {league.standings.map((s, i) => (
                                                <tr key={s.team} className={cx("border-b border-secondary last:border-b-0", s.you && "bg-brand-primary_alt")}>
                                                    <td className="px-4 py-3 text-sm font-semibold text-secondary tabular-nums">{i + 1}</td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-sm font-semibold text-primary">
                                                            {s.team}
                                                            {s.you && <span className="ml-2 rounded bg-brand-solid px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">You</span>}
                                                        </p>
                                                        {league.teamSize === 2 && <p className="text-xs text-tertiary">{s.players.join(" & ")}</p>}
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-right text-sm text-secondary tabular-nums @tablet:table-cell">{s.played}</td>
                                                    <td className="hidden px-4 py-3 text-right text-sm text-secondary tabular-nums @tablet:table-cell">{s.net.toFixed(1)}</td>
                                                    <td className="px-4 py-3 text-right text-sm font-semibold text-primary tabular-nums">{s.points}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="mt-3 text-xs text-tertiary">Updated after every round. Ties are broken on net average.</p>
                            </AriaTabPanel>
                        )}
                    </AriaTabs>

                    <div className="order-first @desktop:order-none">{card}</div>
                </div>
            </WebPage>

            {showJoinBar && (
                <MobileActionBar
                    summary={
                        <>
                            <p className="text-md font-semibold text-primary tabular-nums">{isFull ? "Waitlist" : money(fee)}</p>
                            <p className="truncate text-xs text-tertiary">{isFull ? `${league.waitlist} ahead of you` : `${league.day} · ${fmtShort(next?.date ?? league.start)} start`}</p>
                        </>
                    }
                    action={<WebButton onPress={() => setStep("confirm")}>{cta}</WebButton>}
                />
            )}

            <ConfirmDialog
                step={step}
                onStepChange={setStep}
                onConfirmed={() => setJoined(true)}
                title={isFull ? "Join the waitlist" : mode === "team" && league.teamSize === 2 ? "Register your team" : "Join the league"}
                subject={{ title: league.name, when, image: league.image }}
                lines={
                    isFull
                        ? [
                              { label: "Players", value: party },
                              { label: "Waitlist position", value: `#${(league.waitlist ?? 0) + 1}` },
                          ]
                        : [
                              ...(league.teamSize === 2 && mode === "team"
                                  ? [
                                        { label: "Team", value: teamName },
                                        { label: "Partner", value: `${partnerName} (invite to pay)` },
                                    ]
                                  : [{ label: "Joining", value: league.teamSize === 2 ? "Solo — we'll pair you" : "Individual" }]),
                              { label: "Season", value: `${fmtShort(next?.date ?? league.start)} – ${fmtShort(league.end)}` },
                              { label: prorated ? "Prorated fee" : "Season fee", value: money(fee) },
                          ]
                }
                total={fee}
                mode={isFull ? "waitlist" : "pay"}
                policy="Full refund until the first round."
                confirmLabel={isFull ? "Join waitlist" : `Pay ${money(fee)}`}
                done={
                    isFull
                        ? { title: "You're on the waitlist", body: `We'll email ${USER.email} if a spot opens.` }
                        : { title: "Welcome to the league", body: mode === "team" && league.teamSize === 2 ? `${partnerName} has been invited to join ${teamName}.` : `See you ${fmtDay(next?.date ?? league.start)}.` }
                }
            />

            {next && (
                <ConfirmDialog
                    step={subStep}
                    onStepChange={setSubStep}
                    onConfirmed={() => setSubRequested(true)}
                    title="Request a sub"
                    subject={{ title: `${league.name} · Week ${next.week}`, when: `${fmtDay(next.date)} · ${league.time}`, image: league.image }}
                    lines={[
                        { label: "Your team", value: myTeam?.team ?? "" },
                        { label: "Sub list", value: `${league.waitlist ?? 0} golfers` },
                    ]}
                    mode="free"
                    hideTotal
                    confirmLabel="Request sub"
                    done={{ title: "Sub requested", body: "We've posted your spot to the sub list and will email you when it's filled." }}
                />
            )}
        </WebShell>
    );
};
