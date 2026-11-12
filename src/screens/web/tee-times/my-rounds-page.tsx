import { CalendarPlus02, ChevronRight, Flag01, Users01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { StatusBadge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { useWebFrame } from "@/components/web/web-frame";
import { CapsTabs, PageHeader, Panel, WebPage } from "@/components/web/web-layout";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { useWebSession, WebShell } from "../web-shell";
import { currency, playersLabel, type WebRound } from "./tee-times-data";
import { useTeeTimeRounds } from "./tee-time-rounds-store";
import { focusRing, webBtn } from "./tee-times-ui";

export interface MyRoundsPageProps {
    /** Which tab; defaults to the URL (/tee-times/my-rounds/past) then Upcoming. */
    tab?: "upcoming" | "past";
    /** Show the empty states (no rounds on the books). */
    empty?: boolean;
}

const DateTile = ({ date }: { date: Date }) => (
    <span className="flex w-16 shrink-0 flex-col items-center rounded-lg bg-secondary py-2 ring-1 ring-secondary ring-inset">
        <span className="caps text-[10px] tracking-[1.5px] text-tertiary">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
        <span className="text-display-xs leading-8 font-semibold text-primary">{date.getDate()}</span>
        <span className="caps text-[10px] tracking-[1.5px] text-tertiary">{date.toLocaleDateString("en-US", { month: "short" })}</span>
    </span>
);

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const RoundRow = ({ round: r, onBookAgain }: { round: WebRound; onBookAgain: () => void }) => {
    const upcoming = r.status === "upcoming";
    const href = r.confirmation ? `/tee-times/confirmation/${r.confirmation}?d=${iso(r.date)}${r.teeTimeId ? `&t=${r.teeTimeId}` : ""}&h=${r.holes}&tr=${r.transport ?? "walking"}&n=${r.players}&c=${r.course.id}` : "/tee-times";
    return (
        <li className="flex flex-col gap-4 px-5 py-4 @tablet:flex-row @tablet:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <DateTile date={r.date} />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="truncate text-md font-semibold text-primary">
                            <span className="@tablet:hidden">{r.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                            <span className="hidden @tablet:inline">{r.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span> · {r.time}
                        </span>
                        <StatusBadge tone={upcoming ? "success" : "gray"}>{upcoming ? "Confirmed" : "Completed"}</StatusBadge>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-secondary">
                        <CourseLogo course={r.course} size={18} className="rounded [&>span]:text-[8px]" />
                        {r.course.name}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-tertiary">
                        <span className="flex items-center gap-1">
                            <Flag01 className="size-3.5 text-fg-quaternary" aria-hidden="true" />
                            {r.holes} holes
                        </span>
                        <span className="flex items-center gap-1">
                            <Users01 className="size-3.5 text-fg-quaternary" aria-hidden="true" />
                            {playersLabel(r.players)}
                        </span>
                        <span>{r.transport === "cart" ? "Golf Car" : "Walking"}</span>
                        {r.total != null && <span className="font-semibold text-secondary tabular-nums">{currency(r.total)}</span>}
                    </p>
                </div>
            </div>
            <div className="flex shrink-0 gap-2">
                {upcoming ? (
                    <WebLink href={href} className={cx("inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-4 text-sm font-semibold text-secondary ring-1 ring-primary ring-inset hover:bg-primary_hover @tablet:flex-none", focusRing)}>
                        View booking <ChevronRight className="size-4" aria-hidden="true" />
                    </WebLink>
                ) : (
                    <Button size="md" color="outline" onPress={onBookAgain} className={cx("h-10 flex-1 text-sm @tablet:flex-none", "rounded-lg")}>
                        Book again
                    </Button>
                )}
            </div>
        </li>
    );
};

/**
 * My Rounds — ports Fox "Booking / Pages / My Rounds": Upcoming / Past tabs (deep-linkable
 * CraneWeb caps tabs), reservation rows with status, and empty states that point back to the
 * tee sheet. Upcoming rows open the confirmation (manage / cancel); past rows Book again.
 */
export const MyRoundsPage = ({ tab: tabProp, empty }: MyRoundsPageProps) => {
    const { path, navigate } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    const { course, setCourse } = useWebSession();
    const store = useTeeTimeRounds();
    const tab = tabProp ?? (path.split("?")[0].endsWith("/past") ? "past" : "upcoming");
    const rounds = empty ? [] : store.rounds;
    const upcoming = rounds.filter((r) => r.status === "upcoming").sort((a, b) => a.date.getTime() - b.date.getTime());
    const past = rounds.filter((r) => r.status === "past").sort((a, b) => b.date.getTime() - a.date.getTime());
    const list = tab === "upcoming" ? upcoming : past;
    const go = (p: string) => {
        navigate(p);
        scrollToTop();
    };

    return (
        <WebShell active="tee-times">
            <WebPage width="content">
                <PageHeader
                    eyebrow="Your tee times"
                    title="My Rounds"
                    actions={
                        <Button size="md" iconLeading={CalendarPlus02} onPress={() => go("/tee-times")} className={webBtn}>
                            Book a tee time
                        </Button>
                    }
                />
                <CapsTabs
                    label="Rounds"
                    className="mt-8 border-b border-secondary"
                    tabs={[
                        { href: "/tee-times/my-rounds", label: `Upcoming (${upcoming.length})`, active: tab === "upcoming" },
                        { href: "/tee-times/my-rounds/past", label: `Past (${past.length})`, active: tab === "past" },
                    ]}
                />
                <div className="mt-6">
                    {list.length > 0 ? (
                        <Panel>
                            <ul className="divide-y divide-secondary">
                                {list.map((r) => (
                                    <RoundRow
                                        key={r.id}
                                        round={r}
                                        onBookAgain={() => {
                                            if (r.course.id !== course.id) setCourse(r.course);
                                            go(`/tee-times?p=${r.players}`);
                                        }}
                                    />
                                ))}
                            </ul>
                        </Panel>
                    ) : (
                        <Panel bodyClassName="flex flex-col items-center px-6 py-16 text-center">
                            <span className={cx("flex size-14 items-center justify-center rounded-full", tab === "upcoming" ? "bg-brand-primary_alt" : "bg-tertiary")}>
                                {tab === "upcoming" ? <CalendarPlus02 className="size-7 text-fg-brand-primary" aria-hidden="true" /> : <Flag01 className="size-7 text-fg-quaternary" aria-hidden="true" />}
                            </span>
                            <h2 className="mt-4 text-xl font-semibold text-primary">{tab === "upcoming" ? "No upcoming rounds" : "No past rounds"}</h2>
                            <p className="mt-1.5 max-w-sm text-md text-tertiary">
                                {tab === "upcoming" ? "You don't have any tee times booked. Find an open time and get back on the course." : "Rounds you've played will show up here once they're complete."}
                            </p>
                            {tab === "upcoming" && (
                                <Button size="md" iconLeading={CalendarPlus02} onPress={() => go("/tee-times")} className={cx("mt-6", webBtn)}>
                                    Book a tee time
                                </Button>
                            )}
                        </Panel>
                    )}
                </div>
            </WebPage>
        </WebShell>
    );
};
