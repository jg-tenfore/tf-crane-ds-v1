import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Calendar, CalendarCheck01, Flag01, SearchMd, Users01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";
import { WebCoursePicker } from "@/components/web/web-course-picker";
import { useWebFrame } from "@/components/web/web-frame";
import { PageHeader, Panel, WebPage } from "@/components/web/web-layout";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { COURSES } from "@/data/crane";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { useWebSession, WebShell } from "../web-shell";
import {
    CLOSED_DAY,
    PERIODS,
    TODAY_ID,
    WINDOW_DAYS,
    bookableDays,
    bookingWindow,
    checkoutPath,
    lastBookableDay,
    closureFor,
    clubLayout,
    dayType,
    fmtDay,
    fromPrice,
    isBookable,
    playersLabel,
    queryOf,
    teeTimesFor,
    type Period,
    type WebTeeTime,
} from "./tee-times-data";
import { ChipGroup, CourseAnnouncement, MembershipAd, MenuRow, MonthCalendar, SelectorCell, TeeTimeTile, WebDateStrip, focusRing, webBtn } from "./tee-times-ui";

export interface TeeTimesPageProps {
    /** Start on this date (ISO). Defaults to `?d=` in the URL, then today. */
    date?: string;
    players?: number;
    /** Fox "Dismissible Banner" — a course announcement above the sheet. */
    banner?: boolean;
    /** Fox "18 Holes + Membership Ads" — a dismissible membership ad. */
    membershipAd?: boolean;
    /** Live CraneWeb's "No Golf Course Selected" state (first visit, no home course). */
    noCourse?: boolean;
}

type HolesFilter = "any" | "18" | "9";
type PeriodFilter = "all" | Period;

/**
 * Tee Times — ports Fox "Global Nav / Tee Times / 18 Holes (Sagamore)": the Course · Date ·
 * Players · Holes selector bar over a 4-column grid of tee times (2 on tablet, the app's
 * one-per-row list on mobile web). Adds the app's date strip and FULL / few-spots states,
 * Morning / Afternoon / Twilight grouping, and the multi-course split label from
 * "3 Courses (Kettle Hills)" for clubs with several nines.
 */
export const TeeTimesPage = ({ date: dateProp, players: playersProp, banner, membershipAd, noCourse: noCourseProp }: TeeTimesPageProps) => {
    const { course, setCourse } = useWebSession();
    const { path, navigate } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    const q = queryOf(path);
    const qd = q.get("d");

    const [noCourse, setNoCourse] = useState(!!noCourseProp);
    const [picker, setPicker] = useState(false);
    const [date, setDate] = useState(() => dateProp ?? (qd && isBookable(qd, course) ? qd : TODAY_ID));
    const advance = bookingWindow(course) > WINDOW_DAYS;
    /** The Course cell's icon is the club's logo (real logo for branded clubs, initials otherwise). */
    const courseMark = useMemo(() => {
        const Mark = ({ className }: { className?: string }) => <CourseLogo course={course} size={24} className={cx(className, "size-6 rounded-md")} />;
        return Mark;
    }, [course]);
    // Switching to a course with a shorter window drops a date it doesn't take bookings for.
    useEffect(() => {
        if (!isBookable(date, course)) setDate(TODAY_ID);
    }, [course, date]);
    const [players, setPlayers] = useState(() => playersProp ?? Math.min(4, Math.max(1, Number(q.get("p")) || 1)));
    const [holes, setHoles] = useState<HolesFilter>("any");
    const [period, setPeriod] = useState<PeriodFilter>("all");
    const [sub, setSub] = useState("all");
    const [open, setOpen] = useState<null | "course" | "date" | "players" | "holes">(null);

    const layout = clubLayout(course);
    const multi = !!layout.courses;
    const sheet = useMemo(() => teeTimesFor(course, date), [course, date]);
    const closure = closureFor(course, date);
    const priceFor = (id: string) => fromPrice(course, id);

    const matches = (t: WebTeeTime) =>
        (t.spots === 0 || t.spots >= players) &&
        (holes === "any" || String(t.holes) === holes) &&
        (period === "all" || t.period === period) &&
        (sub === "all" || t.startCourse === sub);
    const visible = sheet.filter(matches);
    const openCount = visible.filter((t) => t.spots > 0).length;
    const filtersOn = holes !== "any" || period !== "all" || sub !== "all" || players > 1;

    const book = (t: WebTeeTime) => {
        navigate(checkoutPath({ date, teeTimeId: t.id, players }));
        scrollToTop();
    };
    const resetFilters = () => {
        setHoles("any");
        setPeriod("all");
        setSub("all");
        setPlayers(1);
    };
    const cell = (k: NonNullable<typeof open>) => ({ isOpen: open === k, onOpenChange: (o: boolean) => setOpen(o ? k : null) });

    const header = (
        <PageHeader
            eyebrow={noCourse ? "Book a round" : course.name}
            title="Tee Times"
            subtitle={noCourse ? undefined : `${advance ? "This week, or up to 3 months ahead" : "Book up to 7 days ahead"} · ${course.city}, ${course.state}`}
            actions={
                <WebLink href="/tee-times/my-rounds" className={cx("inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-md font-semibold text-secondary ring-1 ring-primary ring-inset hover:bg-primary_hover", focusRing)}>
                    <CalendarCheck01 className="size-5 text-fg-quaternary" aria-hidden="true" /> My Rounds
                </WebLink>
            }
        />
    );

    /* ---- No course selected (live CraneWeb) ---- */
    if (noCourse) {
        return (
            <WebShell active="tee-times">
                <WebPage>
                    {header}
                    <Panel className="mt-8" bodyClassName="flex flex-col items-center px-6 py-16 text-center @tablet:py-24">
                        <span className="flex size-16 items-center justify-center rounded-full bg-brand-primary_alt">
                            <Flag01 className="size-8 text-fg-brand-primary" aria-hidden="true" />
                        </span>
                        <h2 className="mt-5 text-display-xs font-semibold text-primary">No Golf Course Selected</h2>
                        <p className="mt-2 max-w-sm text-md text-tertiary">Select a golf course to start booking tee times</p>
                        <Button size="lg" iconLeading={Flag01} onPress={() => setPicker(true)} className={cx("mt-7", webBtn)}>
                            Select Course
                        </Button>
                    </Panel>
                </WebPage>
                <WebCoursePicker
                    isOpen={picker}
                    onOpenChange={setPicker}
                    onSelect={(c) => {
                        setCourse(c);
                        setNoCourse(false);
                    }}
                />
            </WebShell>
        );
    }

    /* ---- Selector bar ---- */
    const bar = (
        <div className="relative grid grid-cols-3 divide-secondary rounded-xl bg-primary shadow-md ring-1 ring-secondary ring-inset @tablet:grid-cols-[minmax(0,1.6fr)_1fr_1fr_1fr] @tablet:divide-x">
            <SelectorCell label="Course" value={course.name} icon={courseMark} {...cell("course")} className="col-span-3 border-b border-secondary @tablet:col-span-1 @tablet:border-b-0" panelClassName="@tablet:w-[340px]">
                {(close) => (
                    <div className="scrollbar-hide flex max-h-[360px] flex-col gap-0.5 overflow-y-auto">
                        <p className="caps px-3 pt-1 pb-2 text-[11px] text-quaternary">Golf courses</p>
                        {COURSES.map((c) => (
                            <MenuRow
                                key={c.id}
                                selected={c.id === course.id}
                                leading={<CourseLogo course={c} size={32} className="rounded-md [&>span]:text-[12px]" />}
                                label={c.name}
                                detail={`${c.city}, ${c.state}`}
                                onPress={() => {
                                    setCourse(c);
                                    setSub("all");
                                    close();
                                }}
                            />
                        ))}
                    </div>
                )}
            </SelectorCell>
            <SelectorCell
                label="Date"
                value={
                    <>
                        <span className="@tablet:hidden">{fmtDay(date, { month: "short", day: "numeric" })}</span>
                        <span className="hidden @tablet:inline">{fmtDay(date)}</span>
                    </>
                } icon={Calendar} {...cell("date")} panelClassName="@tablet:w-[320px]">
                {(close) => (
                    <MonthCalendar
                        key={course.id}
                        value={date}
                        days={bookableDays(course)}
                        priceFor={priceFor}
                        onChange={(d) => {
                            setDate(d);
                            close();
                        }}
                    />
                )}
            </SelectorCell>
            <SelectorCell label="Players" value={playersLabel(players)} icon={Users01} {...cell("players")} className="border-l border-secondary @tablet:border-l-0">
                {(close) => (
                    <div className="flex flex-col gap-0.5">
                        {[1, 2, 3, 4].map((n) => (
                            <MenuRow
                                key={n}
                                selected={players === n}
                                label={playersLabel(n)}
                                onPress={() => {
                                    setPlayers(n);
                                    close();
                                }}
                            />
                        ))}
                        <p className="px-3 pt-2 text-sm text-tertiary">Only times with room for your whole group are shown.</p>
                    </div>
                )}
            </SelectorCell>
            <SelectorCell label="Holes" value={holes === "any" ? "Any" : `${holes} holes`} icon={Flag01} align="right" {...cell("holes")} className="border-l border-secondary @tablet:border-l-0">
                {(close) => (
                    <div className="flex flex-col gap-0.5">
                        {(
                            [
                                ["any", "Any", "18-hole rounds and nines"],
                                ["18", "18 holes", undefined],
                                ["9", "9 holes", multi ? "Any single nine" : `${layout.nine} only`],
                            ] as const
                        ).map(([id, label, detail]) => (
                            <MenuRow
                                key={id}
                                selected={holes === id}
                                label={label}
                                detail={detail}
                                onPress={() => {
                                    setHoles(id);
                                    close();
                                }}
                            />
                        ))}
                    </div>
                )}
            </SelectorCell>
        </div>
    );

    /* ---- Results ---- */
    const groups = (period === "all" ? PERIODS : PERIODS.filter((p) => p.id === period))
        .map((p) => ({ ...p, times: visible.filter((t) => t.period === p.id) }))
        .filter((g) => g.times.length > 0);

    const empty = closure ? (
        <EmptyResults
            title={closure.title}
            body={closure.body}
            action={
                <Button size="md" color="outline" onPress={() => setDate(nextOpenDay(date))} className={webBtn}>
                    See {fmtDay(nextOpenDay(date), { weekday: "long" })}
                </Button>
            }
        />
    ) : (
        <EmptyResults
            title="No tee times match"
            body={`Nothing on ${fmtDay(date, { weekday: "long", month: "short", day: "numeric" })} fits your filters. Try fewer players, any holes, or another part of the day.`}
            action={
                filtersOn && (
                    <Button size="md" color="outline" onPress={resetFilters} className={webBtn}>
                        Clear filters
                    </Button>
                )
            }
        />
    );

    return (
        <WebShell active="tee-times">
            <WebPage>
                {header}

                {(banner || membershipAd) && (
                    <div className="mt-6 flex flex-col gap-2 @tablet:mt-8">
                        {banner && <CourseAnnouncement dateLabel={fmtDay(CLOSED_DAY, { weekday: "short", month: "short", day: "numeric" })} />}
                        {membershipAd && <MembershipAd />}
                    </div>
                )}
                {/* Sticks under the header on desktop while the sheet scrolls (Fox behaviour). */}
                <div className="relative z-20 -mx-4 mt-4 bg-secondary px-4 py-2 @tablet:mx-0 @tablet:mt-6 @tablet:px-0 @desktop:sticky @desktop:top-[118px]">{bar}</div>
                <div className="mt-2">
                    <WebDateStrip value={date} onChange={setDate} priceFor={priceFor} moreUntil={advance ? lastBookableDay(course) : undefined} onMore={() => setOpen("date")} />
                </div>

                <div className={cx("mt-6 flex flex-wrap items-center justify-between gap-3", closure && "hidden")}>
                    <ChipGroup<PeriodFilter>
                        label="Time of day"
                        value={period}
                        onChange={setPeriod}
                        options={[{ id: "all", label: "All day" }, ...PERIODS.map((p) => ({ id: p.id, label: p.label }))]}
                        className="-mx-4 px-4 @tablet:mx-0 @tablet:px-0"
                    />
                    {!closure && (
                        <p className="text-sm text-tertiary" aria-live="polite">
                            <span className="font-semibold text-secondary">{openCount}</span> open {openCount === 1 ? "time" : "times"} · {fmtDay(date, { weekday: "long", month: "short", day: "numeric" })} · {dayType(date)} rates
                        </p>
                    )}
                </div>
                {multi && !closure && (
                    <div className="mt-3 flex items-center gap-3">
                        <span className="caps hidden shrink-0 text-[11px] text-quaternary @tablet:block">Starting course</span>
                        <ChipGroup
                            label="Starting course"
                            value={sub}
                            onChange={setSub}
                            options={[{ id: "all", label: "All courses" }, ...layout.courses!.map((c) => ({ id: c, label: c }))]}
                            className="-mx-4 px-4 @tablet:mx-0 @tablet:px-0"
                        />
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-8">
                    {groups.length === 0
                        ? empty
                        : groups.map((g) => (
                              <section key={g.id} aria-labelledby={`period-${g.id}`}>
                                  <div className="mb-3 flex items-center gap-3">
                                      <h2 id={`period-${g.id}`} className="text-xl font-semibold text-primary">
                                          {g.label}
                                      </h2>
                                      <span className="text-sm text-tertiary">{g.range}</span>
                                      <span className="h-px flex-1 bg-border-secondary" aria-hidden="true" />
                                      <span className="caps shrink-0 text-[11px] text-quaternary">{g.times.filter((t) => t.spots > 0).length} open</span>
                                  </div>
                                  <div className="grid grid-cols-1 gap-2.5 @tablet:grid-cols-2 @tablet:gap-3 @desktop:grid-cols-4">
                                      {g.times.map((t) => (
                                          <TeeTimeTile key={t.id} teeTime={t} dayLabel={dayType(date)} multiCourse={multi} onPress={book} />
                                      ))}
                                  </div>
                              </section>
                          ))}
                </div>
            </WebPage>
        </WebShell>
    );
};

const nextOpenDay = (id: string) => {
    const d = new Date(`${id}T12:00:00`);
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const EmptyResults = ({ title, body, action }: { title: string; body: string; action?: ReactNode }) => (
    <Panel bodyClassName="flex flex-col items-center px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-tertiary">
            <SearchMd className="size-6 text-fg-quaternary" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-primary">{title}</h2>
        <p className="mt-1.5 max-w-md text-md text-tertiary">{body}</p>
        {action && <div className="mt-6">{action}</div>}
    </Panel>
);
