import { useState } from "react";
import { ArrowRight, Calendar, Trophy01, Users01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { PageHeader, WebPage } from "@/components/web/web-layout";
import { WebLink } from "@/components/web/web-router";
import { useWebSession, WebShell } from "../web-shell";
import { availability, fmtDay, fmtShort, leagueThisWeek, leagueWeekLabel, LEAGUES, type League } from "./events-data";
import { AvailabilityBadge, ChipRow, FilterMenuChip, focusRing, LabelPill, MetaInline, money, SpotsMeter } from "./events-ui";

/** "In season · Week 7 of 9" / "Registration open" pill on league cards. */
export const LeagueStatusPill = ({ league }: { league: League }) => (
    <span
        className={cx(
            "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold ring-1 ring-inset",
            league.status === "registering" ? "bg-brand-primary_alt text-brand-secondary ring-brand" : "bg-utility-purple-50 text-utility-purple-700 ring-utility-purple-200",
        )}
    >
        <span className={cx("size-1.5 rounded-full", league.status === "registering" ? "bg-fg-brand-primary" : "bg-utility-purple-500")} />
        {league.status === "registering" ? "Registration open" : `In season · ${leagueWeekLabel(league)}`}
    </span>
);

export const LeagueCard = ({ league }: { league: League }) => {
    const status = availability(league);
    return (
        <WebLink href={`/leagues/${league.id}`} className={cx("group flex flex-col overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary ring-inset hover:ring-primary", focusRing)}>
            <div className="relative aspect-[2/1] bg-tertiary">
                <img src={league.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-200 ease-out group-hover:scale-[1.03]" />
                <span className="absolute top-3 left-3 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold tracking-wide text-primary uppercase shadow-sm">{league.day}</span>
                {league.youAreIn && <span className="absolute top-3 right-3 rounded-lg bg-brand-solid px-2.5 py-1 text-xs font-semibold text-white shadow-sm">You're in</span>}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                    <LeagueStatusPill league={league} />
                    {status !== "open" && <AvailabilityBadge availability={status} waitlist={!!league.waitlist} />}
                </div>
                <div>
                    <p className="text-lg font-semibold text-primary transition duration-100 ease-linear group-hover:text-brand-secondary">{league.name}</p>
                    <p className="text-sm text-tertiary">{league.tagline}</p>
                </div>
                <div className="flex flex-col gap-1.5 text-sm text-secondary">
                    <MetaInline icon={Calendar}>
                        {league.day} · {league.time}
                    </MetaInline>
                    <MetaInline icon={Trophy01}>{league.format}</MetaInline>
                    <MetaInline icon={Users01}>
                        {league.teamSize === 2 ? "2-person teams" : "Individual"} · {league.eligibility}
                    </MetaInline>
                </div>
                <div className="mt-auto flex flex-col gap-3 border-t border-secondary pt-3">
                    <div className="flex items-baseline justify-between">
                        <p className="text-md font-semibold text-primary tabular-nums">
                            {money(league.fee)} <span className="text-sm font-normal text-tertiary">{league.feeUnit}</span>
                        </p>
                        <span className="text-xs text-tertiary">
                            {fmtShort(league.start)} – {fmtShort(league.end)}
                        </span>
                    </div>
                    <SpotsMeter capacity={league.capacity} spotsLeft={league.spotsLeft} noun={league.teamSize === 2 ? "teams" : "spots"} />
                </div>
            </div>
        </WebLink>
    );
};

type Filter = "all" | "registering" | "in-season" | "teams" | "individual";
const FILTERS = [
    { id: "all", label: "All leagues" },
    { id: "registering", label: "Registration open" },
    { id: "in-season", label: "In season" },
    { id: "teams", label: "Team leagues" },
    { id: "individual", label: "Individual leagues" },
];

/**
 * /leagues — new for Crane Web (Fox had no leagues page). Weekly leagues as cards: day, time,
 * format, team or individual, season fee and spots, with a "Your leagues" strip when the
 * signed-in golfer is already on a team.
 */
export const LeaguesBrowsePage = () => {
    const { course, userName } = useWebSession();
    const [filter, setFilter] = useState<Filter>("all");
    const mine = userName ? LEAGUES.filter((l) => l.youAreIn) : [];
    const list = LEAGUES.filter((l) =>
        filter === "all" ? true : filter === "teams" ? l.teamSize === 2 : filter === "individual" ? l.teamSize === 1 : l.status === filter,
    ).sort((a, b) => (a.status === b.status ? 0 : a.status === "registering" ? -1 : 1));

    return (
        <WebShell active="leagues">
            <WebPage>
                <PageHeader eyebrow={course.name} title="Leagues" subtitle="Play the same night every week with the same crew. Join a team, sign up solo, or get on the sub list." />

                {mine.map((l) => {
                    const next = leagueThisWeek(l);
                    const me = l.standings?.findIndex((s) => s.you) ?? -1;
                    return (
                        <WebLink
                            key={l.id}
                            href={`/leagues/${l.id}`}
                            className={cx("mt-7 flex flex-col gap-3 rounded-2xl bg-brand-primary_alt p-5 ring-1 ring-brand ring-inset @tablet:flex-row @tablet:items-center @tablet:justify-between", focusRing)}
                        >
                            <div>
                                <p className="caps text-brand-secondary">Your league</p>
                                <p className="mt-1 text-lg font-semibold text-primary">{l.name}</p>
                                <p className="text-sm text-secondary">
                                    {next ? `Next round ${fmtDay(next.date)} · ${l.time} · ${next.format}` : "Season complete"}
                                    {me >= 0 && ` · ${l.standings![me].team} in ${ordinal(me + 1)}`}
                                </p>
                            </div>
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-secondary">
                                Standings & schedule <ArrowRight className="size-4" aria-hidden="true" />
                            </span>
                        </WebLink>
                    );
                })}

                <ChipRow className="mt-7">
                    <FilterMenuChip menuLabel="Show" label={FILTERS.find((f) => f.id === filter)!.label} isActive={filter !== "all"} options={FILTERS} value={filter} onChange={(v) => setFilter(v as Filter)} />
                    <LabelPill className="h-10 rounded-full px-4 text-sm font-medium text-tertiary">Fall 2026 · Winter 2026–27</LabelPill>
                </ChipRow>

                <div className="mt-6 grid grid-cols-1 gap-5 @min-[600px]:grid-cols-2 @desktop:grid-cols-3">
                    {list.map((l) => (
                        <LeagueCard key={l.id} league={l} />
                    ))}
                </div>
            </WebPage>
        </WebShell>
    );
};

export const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"}`;
