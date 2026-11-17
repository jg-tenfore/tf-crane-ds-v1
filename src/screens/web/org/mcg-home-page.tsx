import { useState, type FC, type MouseEvent, type ReactNode } from "react";
import { ArrowRight, Calendar, ChevronDown, Flag01, GraduationHat01, MarkerPin01, SearchLg, Ticket02, Users01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { WebLink, useWebRouter } from "@/components/web/web-router";
import type { Course } from "@/data/crane";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { coursePhotos } from "@/screens/chrome/course-photos";
import {
    academyLogo,
    academyRangePhoto,
    clinicsHref,
    courseShortName,
    creditsHref,
    fmtDateShort,
    instructionHref,
    money0,
    packagesHref,
    PRIVATE_SERVICES,
    servicePrice,
    totalCredits,
    upcomingPrograms,
} from "../instruction/data";
import { useWebSession, WebShell } from "../web-shell";
import { cx } from "@/utils/cx";

/** Weekday 18-hole green fee per MCG course (Fox Prototype 3 sample rates). Sligo Creek is a nine played twice. */
const WEEKDAY_RATE: Record<string, number> = {
    "falls-road": 38,
    northwest: 42,
    "hampshire-greens": 62,
    laytonsville: 34,
    "little-bennett": 36,
    needwood: 40,
    crossvines: 58,
    rattlewood: 39,
    "sligo-creek": 28,
};

const ENTRY_TILES: { href: string; label: string; detail: string; icon: FC<{ className?: string }> }[] = [
    { href: "/tee-times", label: "Book a tee time", detail: "All nine courses on one sheet", icon: Flag01 },
    { href: instructionHref(), label: "Lessons & clinics", detail: "MCG Academy — privates and programs", icon: GraduationHat01 },
    { href: "/events", label: "Leagues & events", detail: "Scrambles, leagues, county championships", icon: Users01 },
    { href: "/calendar", label: "What's on", detail: "Every course, every program, one month view", icon: Calendar },
];

const focus = "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";
const card = "rounded-2xl bg-primary ring-1 ring-secondary";

const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
    <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
            <h2 className="text-display-xs font-bold tracking-[-0.3px] text-primary">{title}</h2>
            {subtitle && <p className="text-md text-tertiary">{subtitle}</p>}
        </div>
        {action}
    </div>
);

const LinkButton = ({ href, children, variant = "outline" }: { href: string; children: ReactNode; variant?: "outline" | "filled" }) => (
    <WebLink
        href={href}
        className={cx(
            "inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold whitespace-nowrap transition duration-100 ease-linear",
            variant === "filled" ? "bg-brand-solid text-white hover:bg-brand-solid_hover" : "bg-primary text-secondary ring-1 ring-primary ring-inset hover:bg-primary_hover",
            focus,
        )}
    >
        {children}
    </WebLink>
);

/** One course tile: photo (or the logo on a tinted panel), town, holes · par, weekday rate, Tee times. */
const CourseTile = ({ course, onBook }: { course: Course; onBook: (c: Course) => void }) => (
    <a
        href="/tee-times"
        onClick={(e: MouseEvent) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey) return;
            e.preventDefault();
            onBook(course);
        }}
        aria-label={`${course.name} — tee times`}
        className={cx("group flex flex-col overflow-hidden transition duration-100 ease-linear hover:ring-brand", card, focus)}
    >
        <div className="relative flex aspect-[16/7] items-center justify-center overflow-hidden bg-secondary">
            {course.photo ? (
                <img src={course.photo} alt="" loading="lazy" className="size-full object-cover transition duration-300 ease-out group-hover:scale-[1.03]" />
            ) : (
                <CourseLogo course={course} size={96} className="rounded-xl shadow-xs" />
            )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-lg font-semibold text-primary">{course.shortName}</span>
                    <span className="flex items-center gap-1.5 text-sm text-tertiary">
                        <MarkerPin01 className="size-4 text-fg-quaternary" aria-hidden="true" />
                        {course.city}, {course.state}
                    </span>
                </div>
                {course.photo && <CourseLogo course={course} size={40} className="rounded-lg" />}
            </div>
            {course.holes && (
                <span className="text-sm text-tertiary">
                    {course.holes} holes · par {course.par}
                </span>
            )}
            <div className="mt-auto flex items-end justify-between gap-3 border-t border-secondary pt-3">
                <span className="flex flex-col">
                    <span className="text-xs text-quaternary">Weekday 18</span>
                    <span className="text-lg font-semibold text-primary tabular-nums">{money0(WEEKDAY_RATE[course.id] ?? 40)}</span>
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-brand-secondary group-hover:underline">
                    Tee times <ArrowRight className="size-4" aria-hidden="true" />
                </span>
            </div>
        </div>
    </a>
);

/**
 * MCG home (`/` under the MCG org) — Fox Prototype 3's front door, rebuilt in Crane Web.
 * A county system's golfer usually wants "somewhere in the county this weekend", so the hero is a
 * quick-book across all nine courses, then four entry tiles, the courses as a portfolio, the MCG
 * Academy with programs starting soon, and the residents banner.
 */
export const McgHomePage = () => {
    const { org, courses, selectCourse, userName } = useWebSession();
    const { navigate } = useWebRouter();
    const [pick, setPick] = useState("any");
    const programs = upcomingPrograms(4);
    const lessonFrom = Math.min(...PRIVATE_SERVICES.map((s) => servicePrice(s, undefined, 1)));
    const credits = userName ? totalCredits() : 0;
    const anyLabel = org?.anyCourseLabel ?? "Any course";

    const book = (c: Course | null) => {
        selectCourse(c);
        navigate("/tee-times");
    };

    return (
        <WebShell>
            {/* ---------------- Hero ---------------- */}
            <section className="relative isolate overflow-hidden border-b border-secondary bg-primary">
                <img src={coursePhotos.northwest} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
                <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg-primary via-bg-primary/85 to-bg-primary/45" />
                <div className="mx-auto flex max-w-web flex-col gap-7 px-4 pt-10 pb-10 @tablet:px-8 @tablet:pt-16 @tablet:pb-14">
                    <div className="flex max-w-3xl flex-col gap-3">
                        <span className="caps text-brand-secondary">{org?.name ?? "Montgomery County Golf"}</span>
                        <h1 className="text-display-sm font-bold tracking-[-0.6px] text-primary @tablet:text-display-md @desktop:text-display-lg">Nine public courses. One tee sheet.</h1>
                        <p className="max-w-2xl text-md text-secondary @tablet:text-lg">
                            Sligo Creek to Poolesville — book any MCG course, take a lesson with a county pro, or join a league. County residents play at the resident rate.
                        </p>
                    </div>

                    {/* Quick-book */}
                    <form
                        className={cx("flex flex-col gap-3 p-4 shadow-lg @tablet:flex-row @tablet:items-end", card)}
                        onSubmit={(e) => {
                            e.preventDefault();
                            book(pick === "any" ? null : (courses.find((c) => c.id === pick) ?? null));
                        }}
                    >
                        <label className="flex flex-1 flex-col gap-1.5">
                            <span className="caps text-quaternary">Course</span>
                            <span className="relative">
                                <select
                                    value={pick}
                                    onChange={(e) => setPick(e.target.value)}
                                    className="h-12 w-full cursor-pointer appearance-none rounded-lg bg-primary pr-10 pl-3.5 text-md text-primary ring-1 ring-primary transition duration-100 ease-linear ring-inset outline-none focus:ring-2 focus:ring-brand"
                                >
                                    <option value="any">{anyLabel}</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-fg-quaternary" aria-hidden="true" />
                            </span>
                        </label>
                        <Button type="submit" size="web-lg" iconLeading={SearchLg} className="@tablet:px-6">
                            Find tee times
                        </Button>
                    </form>
                </div>
            </section>

            <main className="mx-auto flex max-w-web flex-col gap-12 px-4 pt-8 pb-16 @tablet:gap-14 @tablet:px-8 @tablet:pt-10 @tablet:pb-20">
                {/* ---------------- Entry tiles ---------------- */}
                <nav aria-label="Start here" className="grid gap-3 @tablet:grid-cols-2 @tablet:gap-4 @desktop:grid-cols-4">
                    {ENTRY_TILES.map(({ href, label, detail, icon: Icon }) => (
                        <WebLink key={href} href={href} className={cx("group flex items-center gap-4 p-4 transition duration-100 ease-linear hover:ring-brand @tablet:flex-col @tablet:items-start @tablet:gap-3 @tablet:p-5", card, focus)}>
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary_alt">
                                <Icon className="size-5 text-fg-brand-primary" aria-hidden="true" />
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span className="text-md font-semibold text-primary">{label}</span>
                                <span className="text-sm text-tertiary">{detail}</span>
                            </span>
                            <ArrowRight className="size-4 shrink-0 text-fg-quaternary transition duration-100 ease-linear group-hover:translate-x-0.5 group-hover:text-fg-brand-primary" aria-hidden="true" />
                        </WebLink>
                    ))}
                </nav>

                {/* ---------------- Courses ---------------- */}
                <section className="flex flex-col gap-5" aria-labelledby="mcg-courses">
                    <div id="mcg-courses">
                        <SectionHeader
                            title="The courses"
                            subtitle="Nine county courses, from a walkable par 34 inside the Beltway to the newest course in Maryland."
                            action={
                                <LinkButton href="/tee-times">
                                    See all tee times <ArrowRight className="size-4" aria-hidden="true" />
                                </LinkButton>
                            }
                        />
                    </div>
                    <div className="grid gap-4 @tablet:grid-cols-2 @desktop:grid-cols-3">
                        {courses.map((c) => (
                            <CourseTile key={c.id} course={c} onBook={book} />
                        ))}
                    </div>
                </section>

                {/* ---------------- Academy + programs ---------------- */}
                <section className="grid gap-4 @desktop:grid-cols-2">
                    <div className={cx("flex flex-col overflow-hidden", card)}>
                        <div className="relative h-36 overflow-hidden bg-secondary @tablet:h-44">
                            <img src={academyRangePhoto} alt="" loading="lazy" className="size-full object-cover" />
                            <span className="absolute bottom-3 left-4 inline-flex h-16 items-center rounded-xl bg-white px-3 shadow-md ring-1 ring-black/5">
                                <img src={academyLogo} alt="MCG Golf Academy" className="h-12 w-auto" />
                            </span>
                        </div>
                        <div className="flex flex-1 flex-col justify-between gap-5 p-6">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xl font-semibold text-primary">The MCG Academy</h3>
                                <p className="max-w-xl text-md text-tertiary">
                                    Private lessons, playing lessons, multi-week clinics and junior camps with PGA-certified county pros — from {money0(lessonFrom)}. Pick a lesson and we&rsquo;ll find you an
                                    instructor and a time.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                <LinkButton href={instructionHref()} variant="filled">
                                    Browse lessons <ArrowRight className="size-4" aria-hidden="true" />
                                </LinkButton>
                                <LinkButton href={packagesHref()}>
                                    <Ticket02 className="size-4" aria-hidden="true" /> Lesson packages
                                </LinkButton>
                            </div>
                            {credits > 0 && (
                                <p className="text-sm text-tertiary">
                                    You have {credits} lesson credits waiting —{" "}
                                    <WebLink href={creditsHref()} className="font-semibold text-brand-secondary hover:underline">
                                        see your credits
                                    </WebLink>
                                    .
                                </p>
                            )}
                        </div>
                    </div>

                    <div className={cx("flex flex-col gap-2 p-6", card)}>
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-xl font-semibold text-primary">Programs starting soon</h3>
                            <WebLink href={clinicsHref()} className={cx("rounded-md text-sm font-semibold text-brand-secondary hover:underline", focus)}>
                                All clinics
                            </WebLink>
                        </div>
                        <ul className="flex flex-col divide-y divide-border-secondary">
                            {programs.map((o) => (
                                <li key={o.key}>
                                    <WebLink href={o.detailHref} className={cx("group flex items-center justify-between gap-4 rounded-md py-3.5", focus)}>
                                        <span className="flex min-w-0 flex-col gap-0.5">
                                            <span className="truncate text-md font-semibold text-primary group-hover:underline">{o.name}</span>
                                            <span className="truncate text-sm text-tertiary">
                                                Starts {fmtDateShort(o.startIso!)} · {o.courseSlugs.map(courseShortName).join(", ")}
                                            </span>
                                        </span>
                                        <span className="flex shrink-0 flex-col items-end">
                                            <span className="text-md font-semibold text-primary tabular-nums">{money0(o.priceFrom)}</span>
                                            <span className="text-xs text-quaternary">{o.priceUnit}</span>
                                        </span>
                                    </WebLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* ---------------- Residents ---------------- */}
                <section className="flex flex-col items-start gap-5 rounded-2xl bg-brand-section p-6 ring-1 ring-secondary ring-inset @tablet:flex-row @tablet:items-center @tablet:justify-between @tablet:p-8">
                    <div className="flex max-w-2xl flex-col gap-2">
                        <h3 className="text-display-xs font-bold tracking-[-0.3px] text-primary_on-brand">Montgomery County residents play for less</h3>
                        <p className="text-md text-tertiary_on-brand">Add your county residency to your MCG account and the resident rate applies automatically at checkout, on every course.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {userName ? (
                            <LinkButton href="/account/my-account">Add residency</LinkButton>
                        ) : (
                            <>
                                <LinkButton href="/sign-up">Create an account</LinkButton>
                                <WebLink href="/sign-in" className={cx("rounded-md px-2 py-2 text-sm font-semibold text-primary_on-brand hover:underline", focus)}>
                                    Sign in
                                </WebLink>
                            </>
                        )}
                    </div>
                </section>
            </main>
        </WebShell>
    );
};
