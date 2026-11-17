import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, FilterLines, Heart, SearchLg, SearchMd, Ticket02 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { Button } from "@/components/base/button";
import { WebDialog } from "@/components/web/web-dialog";
import { CapsTabs, PageHeader, WebPage } from "@/components/web/web-layout";
import { WebLink } from "@/components/web/web-router";
import { courseById } from "@/data/crane";
import { cx } from "@/utils/cx";
import {
    academyLessonPhoto,
    activeFilterCount,
    coursesLabel,
    filterOfferings,
    FORMAT_LABEL,
    FORMAT_ORDER,
    instructionHref,
    instructorsFor,
    isFiltered,
    money0,
    packagesHref,
    programArt,
    queryToFilter,
    SAMPLE_REVIEW_NOTICE,
    serviceHref,
    type HubView,
    type InstructionQuery,
    type Offering,
    type OfferingFormat,
} from "../data";
import { useInstructionQuery } from "../use-instruction-query";
import { useOfferingArt } from "../use-offering-art";
import { useInstructionStore } from "../instruction-store";
import { useWebSession, WebShell } from "../../web-shell";
import { ActiveFilterChips, clearedFilters, coursesSummary, FilterFields, isGroupOnly, querySummary } from "./hub-filters";
import { AcademyLogoTile, cardBase, CourseSelect, FilterToggle, focusRing, InstructorCard, LinkButton, PrivateLessonCard, ProgramCard, useIsNarrow } from "./hub-ui";

/** Art for each format tile (Crane event art; the private tile uses a real MCG lesson photo). */
const FORMAT_ART: Record<OfferingFormat, string> = {
    private: academyLessonPhoto,
    clinic: programArt("clinic-adult-l2").image,
    "junior-camp": programArt("camp-junior-summer").image,
    "junior-league": programArt("junior-league-northwest").image,
    op36: programArt("op36-little-bennett").image,
};

const FORMAT_BLURB: Record<OfferingFormat, string> = {
    private: "One-to-one with an Academy pro",
    clinic: "Multi-week groups, all levels",
    "junior-camp": "Week-long camps for kids",
    "junior-league": "Team play for juniors",
    op36: "The Operation 36 pathway",
};

/** How many cards a section shows on the unfiltered landing before "See all". */
const LANDING_LIMIT = 6;

/** The hub query a result link carries forward (so the service page's Back returns to the same search). */
const carried = (q: InstructionQuery): Partial<InstructionQuery> => ({ courses: q.courses, formats: q.formats, skills: q.skills, days: q.days, from: q.from, to: q.to, q: q.q });

/**
 * Keeps the hub's course filter and the org header's course switcher in step (decided Nov 17).
 * On landing, a course in the URL wins and moves the header; a URL with no course takes the header's
 * course. After that, whichever side changes moves the other. Several courses leave the header alone.
 */
const useHeaderCourseSync = ({
    query,
    patch,
    hasOrg,
    sessionCourse,
    selectCourse,
}: {
    query: InstructionQuery;
    patch: (p: Partial<InstructionQuery>) => void;
    hasOrg: boolean;
    sessionCourse: string | null;
    selectCourse: ReturnType<typeof useWebSession>["selectCourse"];
}) => {
    const urlKey = query.courses.join(",");
    const prev = useRef<{ url: string; session: string | null } | null>(null);
    useEffect(() => {
        if (!hasOrg) return;
        const urlCourse = query.courses.length <= 1 ? (query.courses[0] ?? null) : undefined;
        const p = prev.current;
        prev.current = { url: urlKey, session: sessionCourse };
        const toHeader = () => urlCourse !== undefined && urlCourse !== sessionCourse && selectCourse(urlCourse ? courseById(urlCourse) : null);
        const toUrl = () => urlCourse !== sessionCourse && patch({ courses: sessionCourse ? [sessionCourse] : [] });
        if (!p) {
            if (query.courses.length === 0) toUrl();
            else toHeader();
        } else if (p.url !== urlKey) toHeader();
        else if (p.session !== sessionCourse) toUrl();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- runs on the two keys only
    }, [hasOrg, urlKey, sessionCourse]);
};

/**
 * Where a result goes: always its detail page first (decided Nov 17 — Fox sent Academy programs straight
 * to booking). Privates choose an instructor there; programs and county clinics show sessions and Register.
 * The search travels with the link so Back returns to it.
 */
const resultHref = (o: Offering, q: InstructionQuery) =>
    serviceHref(o.id, o.format !== "private" && o.source === "academy" && q.courses.length !== 1 ? o.courseSlugs[0] : undefined, carried(q));

const ResultGrid = ({ items, query }: { items: Offering[]; query: InstructionQuery }) => (
    <div className="grid gap-4 @tablet:grid-cols-2 @tablet:gap-5 @desktop:grid-cols-3">
        {items.map((o) => (o.format === "private" ? <PrivateLessonCard key={o.key} offering={o} href={resultHref(o, query)} /> : <ProgramCard key={o.key} offering={o} href={resultHref(o, query)} />))}
    </div>
);

/** One tile per format: art, label, count and "from $". Pressing it filters to that format. */
const FormatTiles = ({ offerings, hrefFor }: { offerings: Offering[]; hrefFor: (f: OfferingFormat) => string }) => {
    const tiles = FORMAT_ORDER.map((format) => {
        const items = offerings.filter((o) => o.format === format);
        const paid = items.map((o) => o.priceFrom).filter((n) => n > 0);
        return { format, count: items.length, from: paid.length ? Math.min(...paid) : 0 };
    }).filter((t) => t.count > 0);
    const { art } = useOfferingArt();
    if (tiles.length < 2) return null;
    return (
        <nav aria-label="Browse by format" className="grid grid-cols-2 gap-3 @tablet:grid-cols-3 @desktop:grid-cols-5 @desktop:gap-4">
            {tiles.map((t) => (
                <WebLink key={t.format} href={hrefFor(t.format)} className={cx("group flex flex-col overflow-hidden transition duration-100 ease-linear hover:ring-brand", cardBase, focusRing)}>
                    <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                        <img src={art(t.format, FORMAT_ART[t.format])} alt="" loading="lazy" className={cx("size-full object-cover transition duration-300 ease-out group-hover:scale-[1.04]", t.format === "private" && "object-[50%_30%]")} />
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5 p-3.5 @tablet:p-4">
                        <span className="flex items-center justify-between gap-2">
                            <span className="text-md font-semibold text-primary group-hover:underline">{FORMAT_LABEL[t.format]}</span>
                            <ArrowRight className="hidden size-4 shrink-0 text-fg-quaternary transition duration-100 ease-linear group-hover:translate-x-0.5 group-hover:text-fg-brand-primary @tablet:block" aria-hidden="true" />
                        </span>
                        <span className="hidden text-xs text-tertiary @tablet:block">{FORMAT_BLURB[t.format]}</span>
                        <span className="mt-1 text-sm text-tertiary tabular-nums">
                            {t.count} {t.count === 1 ? "option" : "options"} · from <span className="font-semibold text-primary">{money0(t.from)}</span>
                        </span>
                    </div>
                </WebLink>
            ))}
        </nav>
    );
};

/** Free-text search, written to `?q=` (replace). Local state so typing isn't trimmed mid-word. */
const SearchField = ({ value, onCommit }: { value?: string; onCommit: (v: string | undefined) => void }) => {
    const [text, setText] = useState(value ?? "");
    useEffect(() => {
        if ((value ?? "") !== text.trim()) setText(value ?? "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    return (
        <label className="relative flex min-w-0 flex-1">
            <span className="sr-only">Search lessons, programs and instructors</span>
            <SearchMd className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-quaternary" aria-hidden="true" />
            <input
                type="search"
                value={text}
                placeholder="Search lessons, programs, instructors"
                onChange={(e) => {
                    setText(e.target.value);
                    onCommit(e.target.value.trim() || undefined);
                }}
                className="h-10 w-full rounded-lg bg-primary pr-3 pl-9 text-sm text-primary ring-1 ring-primary transition duration-100 ease-linear ring-inset outline-none placeholder:text-placeholder focus:ring-2 focus:ring-brand"
            />
        </label>
    );
};

export interface InstructionHubPageProps {
    /** `/instruction/instructors` implies the Instructors tab regardless of `?view=`. */
    view?: HubView;
}

/**
 * `/instruction` — the MCG Academy hub (Fox Prototype 3, made lighter after the Nov 17 call).
 *
 * Lands calm: header, Services | Instructors, a compact bar (search · course · **Filters**), format
 * tiles and short result sections — no lesson-credit banner, no filter wall. The full Prototype 3
 * filter set (courses, format, dates, days, skill set) opens behind Filters (`?expanded=1`); on
 * mobile web it's a bottom sheet. Every change is written to the URL (replace), so any state is a
 * deep link; a link that arrives filtered lands collapsed with a one-line summary + removable chips.
 */
export const InstructionHubPage = ({ view: forcedView }: InstructionHubPageProps) => {
    const { query, setQuery } = useInstructionQuery();
    const { org, courses, course, anyCourse, selectCourse } = useWebSession();
    const rootRef = useRef<HTMLDivElement>(null);
    const narrow = useIsNarrow(rootRef);

    const view: HubView = forcedView ?? query.view;
    const patch = (p: Partial<InstructionQuery>) => setQuery(p, { replace: true });
    const clearAll = () => patch(clearedFilters(query));
    useHeaderCourseSync({ query, patch, hasOrg: !!org, sessionCourse: org && !anyCourse ? course.id : null, selectCourse });

    const offerings = useMemo(() => filterOfferings(queryToFilter(query)), [query]);
    const groupOnly = isGroupOnly(query);
    const tileOfferings = useMemo(() => (query.formats.length === 0 || groupOnly ? offerings : []), [offerings, query.formats.length, groupOnly]);
    const { savedInstructors } = useInstructionStore();
    // `?saved=1` on the Instructors tab: only the pros the golfer saved (the heart on a profile).
    const savedOnly = query.extra.saved === "1";
    const instructors = useMemo(() => {
        const all = instructorsFor(offerings);
        return savedOnly ? all.filter((e) => !!e.instructor.id && savedInstructors.includes(e.instructor.id)) : all;
    }, [offerings, savedOnly, savedInstructors]);
    const setSavedOnly = (on: boolean) => {
        const { saved: _drop, ...rest } = query.extra;
        patch({ extra: on ? { ...rest, saved: "1" } : rest });
    };
    const filtered = isFiltered(query);
    const count = activeFilterCount(query);
    // MCG's "Clinics" link: group formats and nothing else — the title says so, no summary box needed.
    const onlyGroup = groupOnly && count === 1 && !query.q;
    const landingLimit = narrow ? 3 : LANDING_LIMIT;
    const anyLabel = org?.anyCourseLabel ?? "Any course";

    const grouped = FORMAT_ORDER.map((format) => ({ format, items: offerings.filter((o) => o.format === format) })).filter((g) => g.items.length > 0);
    const resultsLabel = view === "services" ? `${offerings.length} ${offerings.length === 1 ? "result" : "results"}` : `${instructors.length} ${instructors.length === 1 ? "instructor" : "instructors"}`;
    const summary = querySummary(query);

    // Tabs keep the search; the Instructors path implies the tab, so Services goes back to /instruction.
    const tabHref = (v: HubView) => instructionHref({ ...query, view: v, expanded: false });
    const title = groupOnly && view === "services" ? "Clinics & programs" : "Instruction";
    const subtitle =
        groupOnly && view === "services"
            ? "Group clinics, junior camps, junior league and Op 36 across all nine county courses."
            : view === "instructors"
              ? "Every MCG Academy pro, with where they teach, what they charge and when they're next free."
              : "Private lessons, clinics, camps and junior programs with MCG Academy pros at all nine county courses.";

    const courseValue = query.courses.length === 0 ? "all" : query.courses.length === 1 ? query.courses[0] : "multi";

    const panelOpen = query.expanded;

    return (
        <WebShell active="instruction">
            <div ref={rootRef}>
                <WebPage>
                    {/* ---------- Header ---------- */}
                    <div className="flex items-start gap-4 @tablet:items-center @tablet:gap-6">
                        <AcademyLogoTile className="hidden h-24 w-32 @tablet:inline-flex" />
                        <PageHeader
                            className="min-w-0 flex-1"
                            eyebrow="MCG Golf Academy"
                            title={title}
                            subtitle={subtitle}
                            actions={
                                <LinkButton href={packagesHref()} size="sm">
                                    <Ticket02 className="size-4" aria-hidden="true" /> Lesson packages
                                </LinkButton>
                            }
                        />
                    </div>

                    {/* ---------- Tabs ---------- */}
                    <CapsTabs
                        className="mt-8 border-b border-secondary"
                        label="Browse by"
                        tabs={[
                            { href: tabHref("services"), label: "Services", active: view === "services" },
                            { href: tabHref("instructors"), label: "Instructors", active: view === "instructors" },
                        ]}
                    />

                    {/* ---------- Search bar ---------- */}
                    <div className="mt-5 flex flex-col gap-3 @tablet:flex-row @tablet:items-center">
                        <SearchField value={query.q} onCommit={(q) => patch({ q })} />
                        <div className="flex gap-3">
                            <CourseSelect
                                className="min-w-0 flex-1 @tablet:w-64 @tablet:flex-none"
                                courses={courses}
                                value={courseValue}
                                anyLabel={anyLabel}
                                multiLabel={coursesSummary(query.courses)}
                                onChange={(id) => patch({ courses: id === "all" ? [] : [id] })}
                            />
                            <AriaButton
                                aria-expanded={panelOpen}
                                onPress={() => patch({ expanded: !panelOpen })}
                                className={cx(
                                    "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 text-sm font-semibold ring-1 ring-inset transition duration-100 ease-linear",
                                    panelOpen ? "bg-brand-primary_alt text-brand-secondary ring-brand" : "bg-primary text-secondary ring-primary hover:bg-primary_hover",
                                    focusRing,
                                )}
                            >
                                <FilterLines className="size-4" aria-hidden="true" />
                                Filters
                                {count > 0 && (
                                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-solid px-1.5 text-xs font-semibold text-white tabular-nums" aria-label={`${count} active`}>
                                        {count}
                                    </span>
                                )}
                            </AriaButton>
                        </div>
                    </div>

                    {/* ---------- Filters: inline panel (tablet+) ---------- */}
                    {panelOpen && !narrow && (
                        <section aria-label="Filters" className={cx("mt-4 p-5 @desktop:p-6", cardBase)}>
                            <FilterFields query={query} courses={courses} onPatch={patch} />
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-secondary pt-4">
                                <span className="text-sm text-tertiary">
                                    <span className="font-semibold text-primary tabular-nums">{resultsLabel}</span> · {coursesLabel(query.courses)}
                                </span>
                                <div className="flex items-center gap-2">
                                    {filtered && (
                                        <Button size="web-sm" color="plain" onPress={clearAll}>
                                            Clear all
                                        </Button>
                                    )}
                                    <Button size="web-sm" color="filled" onPress={() => patch({ expanded: false })}>
                                        Done
                                    </Button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ---------- Filters: bottom sheet (mobile web) ---------- */}
                    {narrow && (
                        <WebDialog
                            isOpen={panelOpen}
                            onOpenChange={(open) => patch({ expanded: open })}
                            title="Filters"
                            description={`${resultsLabel} · ${coursesLabel(query.courses)}`}
                            footerStart={
                                filtered ? (
                                    <Button size="web-md" color="plain" onPress={clearAll}>
                                        Clear all
                                    </Button>
                                ) : undefined
                            }
                            footer={
                                <Button size="web-md" color="filled" onPress={() => patch({ expanded: false })}>
                                    Show {resultsLabel}
                                </Button>
                            }
                        >
                            <FilterFields query={query} courses={courses} onPatch={patch} />
                        </WebDialog>
                    )}

                    {/* ---------- Deep-link summary + removable chips (collapsed) ---------- */}
                    {filtered && !onlyGroup && (!panelOpen || narrow) && (
                        <div className="mt-4 flex flex-col gap-3 rounded-xl bg-primary px-4 py-3 ring-1 ring-secondary ring-inset @tablet:px-5">
                            <p className="text-sm text-secondary">
                                <span className="font-semibold text-primary">{summary.join(" · ")}</span>
                                <span className="text-tertiary"> — {resultsLabel}</span>
                                <span className="text-quaternary"> · </span>
                                <button type="button" onClick={() => patch({ expanded: true })} className={cx("cursor-pointer rounded-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                                    Edit filters
                                </button>
                            </p>
                            <ActiveFilterChips query={query} onPatch={patch} onClear={clearAll} />
                        </div>
                    )}

                    {onlyGroup && (!panelOpen || narrow) && view === "services" && (
                        <p className="mt-4 text-sm text-tertiary">
                            Showing group programs only.{" "}
                            <WebLink href={instructionHref({ ...query, formats: [] })} className={cx("rounded-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                                Include private lessons
                            </WebLink>
                        </p>
                    )}

                    {/* ---------- Results ---------- */}
                    <div className="mt-8 flex flex-col gap-10">
                        {view === "services" && tileOfferings.length > 0 && (
                            <FormatTiles offerings={tileOfferings} hrefFor={(f) => instructionHref({ ...query, formats: [f], expanded: false })} />
                        )}

                        {offerings.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-primary bg-primary px-6 py-14 text-center">
                                <SearchLg className="size-6 text-fg-quaternary" aria-hidden="true" />
                                <p className="text-lg font-semibold text-primary">Nothing matches that search</p>
                                <p className="max-w-md text-sm text-tertiary">
                                    Widen the dates or days, try another course, or drop a format. The Academy desk at {org?.phone ?? "the pro shop"} can point you to the nearest program.
                                </p>
                                <div className="mt-2 flex flex-wrap justify-center gap-2.5">
                                    <Button size="web-md" color="filled" onPress={clearAll}>
                                        Clear filters
                                    </Button>
                                    <Button size="web-md" color="outline" onPress={() => patch({ expanded: true })}>
                                        Edit filters
                                    </Button>
                                </div>
                            </div>
                        ) : view === "services" ? (
                            grouped.map((g) => {
                                const limited = !filtered && g.items.length > landingLimit;
                                const items = limited ? g.items.slice(0, landingLimit) : g.items;
                                return (
                                    <section key={g.format} className="flex flex-col gap-4" aria-labelledby={`hub-${g.format}`}>
                                        <div className="flex items-end justify-between gap-3">
                                            <h2 id={`hub-${g.format}`} className="text-display-xs font-semibold tracking-[-0.3px] text-primary">
                                                {FORMAT_LABEL[g.format]} <span className="text-quaternary tabular-nums">· {g.items.length}</span>
                                            </h2>
                                            {limited && (
                                                <WebLink href={instructionHref({ ...query, formats: [g.format] })} className={cx("flex shrink-0 items-center gap-1 rounded-md text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                                                    See all {g.items.length} <ArrowRight className="size-4" aria-hidden="true" />
                                                </WebLink>
                                            )}
                                        </div>
                                        <ResultGrid items={items} query={query} />
                                    </section>
                                );
                            })
                        ) : (
                            <section className="flex flex-col gap-4" aria-label="Instructors">
                                <div className="flex items-end justify-between gap-3">
                                    <h2 className="text-display-xs font-semibold tracking-[-0.3px] text-primary">
                                        {resultsLabel} <span className="text-md font-normal text-tertiary">· {coursesLabel(query.courses)}</span>
                                    </h2>
                                    <FilterToggle
                                        isSelected={savedOnly}
                                        onChange={setSavedOnly}
                                        leading={<Heart className={cx("size-4", savedOnly && "fill-current")} aria-hidden="true" />}
                                    >
                                        Saved <span className="tabular-nums">{savedInstructors.length}</span>
                                    </FilterToggle>
                                </div>
                                {savedOnly && instructors.length === 0 && (
                                    <div className={cx(cardBase, "flex flex-col items-start gap-2 p-6")}>
                                        <p className="text-md font-semibold text-primary">No saved instructors{query.courses.length ? " here" : ""} yet</p>
                                        <p className="text-sm text-tertiary">Tap Save on an instructor&rsquo;s profile and they&rsquo;ll show up here, on any device you&rsquo;re signed in on.</p>
                                        <LinkButton href={instructionHref({ ...query, extra: Object.fromEntries(Object.entries(query.extra).filter(([k]) => k !== "saved")) })}>Show all instructors</LinkButton>
                                    </div>
                                )}
                                <div className="grid gap-4 @tablet:grid-cols-2 @tablet:gap-5 @desktop:grid-cols-3">
                                    {instructors.map((e) => (
                                        <InstructorCard key={e.instructor.id ?? e.instructor.name} entry={e} />
                                    ))}
                                </div>
                                <p className="text-xs text-quaternary">Ratings: {SAMPLE_REVIEW_NOTICE}</p>
                            </section>
                        )}
                    </div>
                </WebPage>
            </div>
        </WebShell>
    );
};
