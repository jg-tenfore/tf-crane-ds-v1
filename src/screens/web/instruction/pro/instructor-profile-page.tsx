import { useMemo, useState, type ReactNode } from "react";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Calendar,
    CalendarCheck01,
    CheckVerified01,
    Clock,
    CreditCard01,
    Heart,
    Mail01,
    MarkerPin01,
    Phone,
    RefreshCcw01,
    Ticket02,
    Users01,
    Wallet02,
} from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";
import { Tag } from "@/components/base/badge";
import { WebDialog } from "@/components/web/web-dialog";
import { useWebFrame } from "@/components/web/web-frame";
import { Panel, WebPage } from "@/components/web/web-layout";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { courseById } from "@/data/crane";
import { ShareButton, SpotsMeter } from "../../events/events-ui";
import { WebShell } from "../../web-shell";
import {
    academyBanner,
    academyInstructor,
    academyLessonPhoto,
    academyLogo,
    academyRangePhoto,
    applyGuardrails,
    bookHref,
    coachDay,
    courseName,
    courseShortName,
    dateOfIso,
    fmtDateShort,
    guardrailSummary,
    instructionHref,
    instructorPhoto,
    instructorProfile,
    INSTRUCTION_TODAY,
    isoOf,
    money0,
    nextAvailable,
    packagesHref,
    REVIEW_MINIMUM,
    REVIEW_SOURCE,
    SAMPLE_REVIEW_NOTICE,
    SAMPLE_REVIEW_NOTICE_SHORT,
    servicePrice,
    spotsLeft,
    timeParam,
    type InstructorProfile,
    type InstructorReview,
    type LessonService,
} from "../data";
import { useInstructionQuery } from "../use-instruction-query";
import { useInstructionStore } from "../instruction-store";
import { useFollowCourse } from "../use-follow-course";
import { useOfferingArt } from "../use-offering-art";
import { CourseChip, DaypartBoard, focusRing, MetaLine, SectionTitle, StarRating } from "./instructor-ui";

export interface InstructorProfilePageProps {
    id: string;
    /** Story state: render the instructor's calendar as fully booked (the "no openings" profile). */
    fullyBooked?: boolean;
}

interface Shot {
    src: string;
    label: string;
    /** Headshots are framed from the top. */
    top?: boolean;
}

/**
 * `/instruction/pro/:id` and `/instruction/instructors/:id` — the instructor profile, Fox Prototype
 * 3's "instructor as a product page", in Crane Web: gallery + buy box (Academy lockup, name and
 * credential, title, sample-data rating, lessons from $, home courses, next opening, Book / Save /
 * Share, Academy contact), then everything they sell: private lessons with a price-by-group-size
 * grid, the group programs they run (registered for right here), next openings, packages and
 * plans, and verified reviews (sample data, always labelled). Nothing biographical is invented.
 */
export const InstructorProfilePage = ({ id, fullyBooked }: InstructorProfilePageProps) => {
    const profile = instructorProfile(id);
    const roster = academyInstructor(id);
    const { query } = useInstructionQuery();
    useFollowCourse(query.courses.length === 1 ? query.courses[0] : roster?.courseSlugs.length === 1 ? roster.courseSlugs[0] : undefined);
    // "All instructors", keeping whatever the hub had filtered (course, format, …).
    const backHref = instructionHref({
        ...query,
        coach: undefined,
        service: undefined,
        view: "instructors",
    });

    if (!profile || !roster) {
        return (
            <WebShell active="instruction">
                <WebPage width="content">
                    <BackLink href={backHref} />
                    <Panel className="mt-6" bodyClassName="flex flex-col items-start gap-3 p-8">
                        <h1 className="text-display-xs font-semibold text-primary">Instructor not found</h1>
                        <p className="text-md text-tertiary">That instructor isn&rsquo;t on the MCG Golf Academy roster.</p>
                    </Panel>
                </WebPage>
            </WebShell>
        );
    }
    if (profile.coach.comingSoon) return <ComingSoon profile={profile} backHref={backHref} photo={instructorPhoto(roster)} />;
    return <Profile key={id} profile={profile} backHref={backHref} fullyBooked={fullyBooked} />;
};

const BackLink = ({ href }: { href: string }) => (
    <WebLink href={href} className={cx("inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
        <ArrowLeft className="size-4" aria-hidden="true" /> All instructors
    </WebLink>
);

/** Headshot first, then their courses' photography, a lesson, the range and the Academy banner (max 5). */
const galleryFor = (profile: InstructorProfile): Shot[] => {
    const shots: Shot[] = [{ src: profile.coach.photo ?? "", label: profile.displayName, top: true }];
    for (const c of profile.courses) {
        const photo = courseById(c.id).photo;
        if (photo) shots.push({ src: photo, label: courseName(c.id) });
    }
    shots.push(
        { src: academyLessonPhoto, label: "An MCG Golf Academy lesson", top: true },
        { src: academyRangePhoto, label: "Practice range" },
        { src: academyBanner, label: "MCG Golf Academy" },
    );
    const seen = new Set<string>();
    return shots.filter((s) => s.src && !seen.has(s.src) && seen.add(s.src)).slice(0, 5);
};

const Gallery = ({ shots, badge }: { shots: Shot[]; badge?: string | null }) => {
    const [i, setI] = useState(0);
    const shot = shots[i];
    return (
        <div className="flex flex-col-reverse gap-3 self-start @tablet:flex-row @tablet:items-start">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto @tablet:flex-col @tablet:overflow-visible" role="tablist" aria-label="Photos">
                {shots.map((s, j) => (
                    <AriaButton
                        key={s.src}
                        aria-label={s.label}
                        aria-pressed={j === i}
                        onPress={() => setI(j)}
                        className={cx(
                            "size-16 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-2 ring-transparent transition duration-100 ease-linear @desktop:size-[72px]",
                            j === i ? "ring-brand" : "opacity-80 hover:opacity-100",
                            focusRing,
                        )}
                    >
                        <img src={s.src} alt="" className={cx("size-full object-cover", s.top && "object-top")} />
                    </AriaButton>
                ))}
            </div>
            <figure className="relative min-w-0 flex-1 overflow-hidden rounded-2xl bg-secondary ring-1 ring-secondary">
                <img src={shot.src} alt={shot.label} className={cx("aspect-[4/5] w-full object-cover @tablet:aspect-[5/6]", shot.top && "object-top")} />
                {badge && i === 0 && (
                    <span className="absolute top-3 left-3 rounded-md bg-primary px-2 py-1 text-xs font-bold tracking-wide text-brand-secondary shadow-sm ring-1 ring-secondary">
                        {badge}
                    </span>
                )}
                <figcaption className="absolute right-3 bottom-3 left-3 truncate rounded-md bg-primary/90 px-2.5 py-1.5 text-xs font-medium text-secondary backdrop-blur">
                    {shot.label}
                </figcaption>
            </figure>
        </div>
    );
};

type SectionId = "reservations" | "programs" | "openings" | "packages" | "reviews";

const Profile = ({ profile, backHref, fullyBooked }: { profile: InstructorProfile; backHref: string; fullyBooked?: boolean }) => {
    const { coach } = profile;
    const { navigate } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    const store = useInstructionStore();
    const { artFor } = useOfferingArt();
    const saved = store.savedInstructors.includes(coach.id);
    const [reviewsOpen, setReviewsOpen] = useState(false);
    const first = coach.name.split(" ")[0];
    const home = coach.courseSlugs[0];
    const headline = profile.rates.find((r) => r.service.id === "private-45")?.service ?? profile.rates[0]?.service;
    const shots = useMemo(() => galleryFor(profile), [profile]);

    // The "Next openings" strip: their day at the home course for the standard lesson — today, or
    // the next day with anything open.
    const board = useMemo(() => {
        if (!headline) return null;
        const day = fullyBooked ? null : nextAvailable(headline, coach.id, home, INSTRUCTION_TODAY);
        const date = day ?? INSTRUCTION_TODAY;
        const slots = applyGuardrails(coachDay(coach.id, home, date, { fullyBooked }), headline, date);
        return { date, slots, today: isoOf(date) === isoOf(INSTRUCTION_TODAY) };
    }, [headline, coach.id, home, fullyBooked]);
    const openToday = board?.slots.filter((s) => s.status === "open") ?? [];
    const nextOpening = fullyBooked
        ? "Fully booked — join the waitlist"
        : board && openToday.length
          ? `${board.today ? "" : `${fmtDateShort(isoOf(board.date))}, `}${openToday[0].label} · ${courseShortName(home)}`
          : profile.nextOpening;

    const scrollTo = (sid: SectionId) => {
        if (typeof document === "undefined") return;
        document.getElementById(`pro-${sid}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const book = (service: LessonService, extra: { date?: string; time?: string; course?: string } = {}) => {
        navigate(
            bookHref({
                coach: coach.id,
                service: service.id,
                course: extra.course ?? service.courseSlug ?? home,
                date: extra.date,
                time: extra.time,
            }),
        );
        scrollToTop();
    };

    const nav: { id: SectionId; label: string; count?: number }[] = [
        {
            id: "reservations" as const,
            label: "Private lessons",
            count: profile.rates.length,
        },
        {
            id: "programs" as const,
            label: "Group clinics",
            count: profile.programs.length,
        },
        { id: "openings" as const, label: "Next openings" },
        {
            id: "packages" as const,
            label: "Packages",
            count: profile.packs.length + (profile.plan ? 1 : 0),
        },
        {
            id: "reviews" as const,
            label: "Reviews",
            count: profile.reviews.status === "published" ? profile.reviews.count : undefined,
        },
    ].filter((n) => (n.count === undefined ? n.id !== "reviews" || profile.reviews.status !== "off" : n.count > 0));

    return (
        <WebShell active="instruction">
            <WebPage>
                <BackLink href={backHref} />

                {/* ---- Gallery + buy box ---- */}
                <div className="mt-6 grid grid-cols-1 gap-8 @desktop:grid-cols-2 @desktop:gap-12">
                    <Gallery shots={shots} badge={coach.credential} />

                    <div className="flex flex-col">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-secondary">
                                <img src={academyLogo} alt="" className="max-h-6 max-w-6 object-contain" />
                            </span>
                            <span className="text-sm font-semibold text-secondary">MCG Golf Academy</span>
                        </div>
                        <h1 className="text-display-sm font-bold tracking-[-0.5px] text-primary @tablet:text-display-md">{profile.displayName}</h1>
                        <p className="mt-1 text-lg text-tertiary">{coach.title}</p>

                        {profile.reviews.status === "published" && (
                            <AriaButton
                                onPress={() => setReviewsOpen(true)}
                                className={cx("mt-3 flex w-fit cursor-pointer flex-wrap items-center gap-2 rounded text-left", focusRing)}
                            >
                                <StarRating rating={profile.reviews.average} />
                                <span className="text-sm font-medium text-primary tabular-nums">{profile.reviews.average.toFixed(1)}</span>
                                <span className="text-sm text-tertiary tabular-nums underline underline-offset-2">{profile.reviews.count} verified reviews</span>
                                <Tag tone="warning" variant="soft">
                                    {SAMPLE_REVIEW_NOTICE_SHORT}
                                </Tag>
                            </AriaButton>
                        )}
                        {profile.reviews.status === "collecting" && (
                            <AriaButton
                                onPress={() => scrollTo("reviews")}
                                className={cx("mt-3 w-fit cursor-pointer rounded text-left text-sm text-tertiary hover:text-secondary", focusRing)}
                            >
                                New to online booking · collecting reviews
                            </AriaButton>
                        )}

                        <p className="mt-5 text-xl font-semibold text-primary tabular-nums">Lessons from {money0(profile.fromPrice)}</p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {profile.courses.map((c) => (
                                <CourseChip key={c.id} slug={c.id} />
                            ))}
                        </div>

                        <div className="mt-5 flex flex-col gap-2 border-t border-secondary pt-5">
                            <MetaLine icon={Clock} tone={fullyBooked ? "warning" : undefined}>
                                Next opening <span className={cx("font-semibold", fullyBooked ? "text-warning-primary" : "text-secondary")}>{nextOpening}</span>
                            </MetaLine>
                            <MetaLine icon={Users01}>
                                {profile.rates.length} private {profile.rates.length === 1 ? "lesson" : "lessons"}
                                {profile.programs.length ? ` · ${profile.programs.length} group ${profile.programs.length === 1 ? "program" : "programs"}` : ""}
                            </MetaLine>
                            <MetaLine icon={MarkerPin01}>
                                {coach.courseSlugs.length === 1 ? courseName(home) : `Teaches at ${coach.courseSlugs.length} courses — one menu, a calendar at each`}
                            </MetaLine>
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            {headline && (
                                <Button
                                    size="web-lg"
                                    fullWidth
                                    iconTrailing={ArrowRight}
                                    onPress={() => {
                                        if (!fullyBooked) return book(headline);
                                        navigate(
                                            bookHref({
                                                coach: coach.id,
                                                service: headline.id,
                                                course: home,
                                                step: "waitlist",
                                            }),
                                        );
                                        scrollToTop();
                                    }}
                                >
                                    {fullyBooked ? "Join the waitlist" : "Book a lesson"}
                                </Button>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    size="web-lg"
                                    color="outline"
                                    iconLeading={<Heart className={cx("size-5", saved && "fill-current text-fg-error-primary")} aria-hidden="true" />}
                                    onPress={() => store.toggleSavedInstructor(coach.id)}
                                >
                                    {saved ? "Saved" : "Save"}
                                </Button>
                                <ShareButton />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-2 border-t border-secondary pt-5">
                            <p className="text-sm text-secondary">Please call or email the Academy with any questions.</p>
                            <a
                                href={`mailto:${coach.contact.email}`}
                                className={cx("flex w-fit items-center gap-2 rounded text-sm font-medium text-brand-secondary hover:underline", focusRing)}
                            >
                                <Mail01 className="size-4 text-fg-quaternary" aria-hidden="true" />
                                {coach.contact.email}
                            </a>
                            <span className="flex items-center gap-2 text-sm text-secondary">
                                <Phone className="size-4 text-fg-quaternary" aria-hidden="true" />
                                {coach.contact.phone} <span className="text-tertiary">· {coach.contact.label}</span>
                            </span>
                        </div>

                        {coach.bio && (
                            <div className="mt-6 border-t border-secondary pt-5">
                                <h2 className="text-md font-semibold text-primary">About {coach.name}</h2>
                                <p className="mt-2 text-sm leading-relaxed text-tertiary">{coach.bio}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ---- What they offer ---- */}
                <nav aria-label={`What ${first} offers`} className="mt-12 flex flex-wrap items-center gap-2 rounded-xl bg-primary p-3 ring-1 ring-secondary ring-inset @tablet:p-4">
                    <span className="mr-1 px-1 text-sm font-semibold text-primary">What {first} offers</span>
                    {nav.map((n) => (
                        <AriaButton
                            key={n.id}
                            onPress={() => scrollTo(n.id)}
                            className={cx(
                                "flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-secondary px-3.5 text-sm font-semibold text-secondary ring-1 ring-secondary transition duration-100 ease-linear ring-inset hover:ring-brand",
                                focusRing,
                            )}
                        >
                            {n.label}
                            {n.count !== undefined && <span className="text-tertiary tabular-nums">{n.count}</span>}
                        </AriaButton>
                    ))}
                </nav>

                <div className="mt-6 flex flex-col gap-6">
                    {/* ---- Private lessons ---- */}
                    <Section id="reservations">
                        <SectionTitle
                            title="Private lessons"
                            sub={`Every private lesson ${coach.name} teaches, priced at ${first}'s rate. Book any one of them on its own — no pack, no commitment.`}
                        />
                        <div className="flex flex-col gap-3">
                            {profile.rates.map(({ service, prices }) => (
                                <div key={service.id} className="flex flex-col gap-4 rounded-xl bg-primary p-4 ring-1 ring-secondary ring-inset @tablet:flex-row @tablet:p-5">
                                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-md font-semibold text-primary">{service.name}</h3>
                                            <Tag tone={service.audience === "junior" ? "brand" : service.audience === "senior" ? "warning" : "gray"} variant="soft">
                                                {service.audience}
                                            </Tag>
                                        </div>
                                        <p className="text-sm text-tertiary">{service.desc}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                                            <MetaLine icon={Clock}>{service.durationMin} min</MetaLine>
                                            <MetaLine icon={Users01}>{service.maxPlayers === 1 ? "1 golfer" : `1–${service.maxPlayers} golfers`}</MetaLine>
                                            {guardrailSummary(service) && (
                                                <MetaLine icon={Calendar} tone="warning">
                                                    {guardrailSummary(service)}
                                                </MetaLine>
                                            )}
                                        </div>
                                        <span className="caps mt-1 text-quaternary">Price by group size</span>
                                        <div className="grid grid-cols-2 gap-2 @tablet:grid-cols-4">
                                            {prices.map((p) => (
                                                <div key={p.players} className="flex flex-col rounded-lg bg-secondary px-3 py-2">
                                                    <span className="text-xs text-tertiary">
                                                        {p.players} {p.players === 1 ? "golfer" : "golfers"}
                                                    </span>
                                                    <span className="text-md font-semibold text-primary tabular-nums">{money0(p.total)}</span>
                                                    {p.players > 1 && <span className="text-xs text-tertiary tabular-nums">{money0(p.each)} each</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-secondary pt-3 @tablet:w-44 @tablet:flex-col @tablet:items-end @tablet:justify-center @tablet:border-t-0 @tablet:pt-0">
                                        <div className="flex flex-col @tablet:items-end">
                                            <span className="text-xl font-semibold text-primary tabular-nums">{money0(servicePrice(service, coach, 1))}</span>
                                            <span className="text-xs text-tertiary">for 1 golfer</span>
                                        </div>
                                        <Button size="web-sm" color="tinted" iconTrailing={ArrowRight} onPress={() => book(service)}>
                                            Book this lesson
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* ---- Group clinics & programs they run ---- */}
                    {profile.programs.length > 0 && (
                        <Section id="programs">
                            <SectionTitle
                                title="Group clinics & programs"
                                sub={`Scheduled programs ${coach.name} runs. Register right here — a full program still takes waitlist entries.`}
                            />
                            <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                                {profile.programs.map((program) => {
                                    const left = spotsLeft(program) ?? 0;
                                    const full = left === 0;
                                    return (
                                        <article key={program.id} className="flex flex-col overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset">
                                            <img src={artFor(program.id, program.image)} alt="" className="aspect-[3/1] w-full object-cover" />
                                            <div className="flex flex-1 flex-col gap-3 p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <h3 className="text-md font-semibold text-primary">{program.name}</h3>
                                                    <span className="shrink-0 text-lg font-semibold text-primary tabular-nums">{money0(program.basePrice)}</span>
                                                </div>
                                                <p className="text-sm text-tertiary">{program.desc}</p>
                                                <div className="flex flex-col gap-1">
                                                    <MetaLine icon={CalendarCheck01}>
                                                        {program.schedule} · {program.sessions} {program.sessions === 1 ? "session" : "sessions"}
                                                    </MetaLine>
                                                    <MetaLine icon={Clock}>{program.time}</MetaLine>
                                                    {program.courseSlug && <MetaLine icon={MarkerPin01}>{courseName(program.courseSlug)}</MetaLine>}
                                                </div>
                                                {program.sessionDates && program.sessionDates.length > 1 && (
                                                    <div className="flex flex-wrap gap-1.5" aria-label="Session dates">
                                                        {program.sessionDates.map((d) => (
                                                            <span key={d} className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary tabular-nums">
                                                                {fmtDateShort(d).split(", ")[1]}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <SpotsMeter capacity={program.capacity ?? 0} spotsLeft={left} />
                                                <Button
                                                    size="web-md"
                                                    color={full ? "outline" : "filled"}
                                                    className="mt-auto self-start"
                                                    onPress={() => book(program, { course: program.courseSlug })}
                                                >
                                                    {full ? "Join the waitlist" : "Register"}
                                                </Button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </Section>
                    )}

                    {/* ---- Next openings ---- */}
                    {headline && board && (
                        <Section id="openings">
                            <SectionTitle
                                title="Next openings"
                                sub={`${headline.name} at ${courseName(home)} on ${dateOfIso(isoOf(board.date)).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}. Pick a time to start booking.`}
                                action={
                                    <Button size="web-sm" color="outline" iconLeading={Calendar} onPress={() => book(headline)}>
                                        See full calendar
                                    </Button>
                                }
                            />
                            {openToday.length === 0 ? (
                                <div className="flex flex-col gap-3 rounded-xl bg-secondary p-5">
                                    <p className="text-md text-secondary">
                                        {fullyBooked ? `${first} is fully booked for the next eight weeks.` : `Nothing open on ${fmtDateShort(isoOf(board.date))}.`} Join the
                                        waitlist and we&rsquo;ll text you the moment a slot opens.
                                    </p>
                                    <Button
                                        size="web-md"
                                        color="outline"
                                        className="self-start"
                                        onPress={() => {
                                            navigate(
                                                bookHref({
                                                    coach: coach.id,
                                                    service: headline.id,
                                                    course: home,
                                                    step: "waitlist",
                                                }),
                                            );
                                            scrollToTop();
                                        }}
                                    >
                                        Join the waitlist
                                    </Button>
                                </div>
                            ) : (
                                <DaypartBoard
                                    slots={board.slots}
                                    priceFor={() => servicePrice(headline, coach, 1)}
                                    onSelect={(s) =>
                                        book(headline, {
                                            date: isoOf(board.date),
                                            time: timeParam(s.minutes),
                                        })
                                    }
                                />
                            )}
                        </Section>
                    )}

                    {/* ---- Packages ---- */}
                    {(profile.packs.length > 0 || profile.plan) && (
                        <Section id="packages">
                            <SectionTitle
                                title="Packages"
                                sub={`Prepay for lessons with ${coach.name} at a lower rate per lesson. Buy now, book whenever — credits never tie you to a date.`}
                            />
                            {profile.packs.length > 0 && (
                                <div className="grid grid-cols-1 gap-3 @tablet:grid-cols-2">
                                    {profile.packs.map((pack) => {
                                        const best = profile.packs.length > 1 && pack.savings === Math.max(...profile.packs.map((p) => p.savings));
                                        return (
                                            <div key={pack.id} className="flex flex-col gap-2 rounded-xl bg-primary p-5 ring-1 ring-secondary ring-inset">
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="text-md font-semibold text-primary">{pack.credits} lessons</span>
                                                    {best && (
                                                        <Tag tone="brand" variant="soft">
                                                            Best value
                                                        </Tag>
                                                    )}
                                                </div>
                                                <span className="text-display-xs font-semibold text-primary tabular-nums">{money0(pack.price)}</span>
                                                <span className="text-sm text-secondary tabular-nums">
                                                    {money0(pack.perLessonPrice)} a lesson{" "}
                                                    <span className="text-tertiary line-through">{money0(pack.listPrice / pack.credits)}</span>
                                                </span>
                                                <span className="text-sm font-medium text-success-primary tabular-nums">Save {money0(pack.savings)}</span>
                                                <Button size="web-md" color="outline" className="mt-2" onPress={() => navigate(packagesHref({ coach: coach.id, pack: pack.id }))}>
                                                    Buy this pack
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <CreditsExplainer />
                            {profile.plan && (
                                <div className="flex flex-col gap-3 rounded-xl bg-brand-primary_alt p-5 ring-1 ring-brand ring-inset">
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-md font-semibold text-primary">{profile.plan.label}</span>
                                        <Tag tone="brand" variant="soft">
                                            Monthly plan
                                        </Tag>
                                    </div>
                                    <span className="text-display-xs font-semibold text-primary tabular-nums">
                                        {money0(profile.plan.monthlyPrice)}
                                        <span className="text-sm font-medium text-tertiary"> / month</span>
                                    </span>
                                    <span className="text-sm text-tertiary tabular-nums">
                                        {money0(profile.plan.listMonthly)} booked one at a time · save {money0(profile.plan.listMonthly - profile.plan.monthlyPrice)} a month
                                    </span>
                                    <div className="flex flex-col gap-1.5">
                                        <MetaLine icon={CreditCard01}>{profile.plan.lessonsPerMonth} lessons every month</MetaLine>
                                        <MetaLine icon={RefreshCcw01}>Cancel anytime · {profile.plan.renewalNoticeDays} days&rsquo; notice</MetaLine>
                                    </div>
                                    <Button size="web-md" className="self-start" onPress={() => navigate(packagesHref({ coach: coach.id }))}>
                                        Start monthly plan
                                    </Button>
                                </div>
                            )}
                        </Section>
                    )}

                    {/* ---- Reviews (hidden entirely when the instructor turned them off) ---- */}
                    {profile.reviews.status === "collecting" && (
                        <Section id="reviews">
                            <SectionTitle title="Reviews" />
                            <ReviewSource />
                            <div className="flex flex-col gap-1 rounded-xl bg-secondary p-5">
                                <p className="text-md font-semibold text-primary">Collecting reviews</p>
                                <p className="text-sm text-tertiary">
                                    {coach.name} has {profile.reviews.count} of the {REVIEW_MINIMUM} verified reviews needed before a rating is published. Ratings stay hidden until
                                    then, so one afternoon can&rsquo;t define a pro who just joined.
                                </p>
                            </div>
                        </Section>
                    )}
                    {profile.reviews.status === "published" && (
                        <Section id="reviews">
                            <SectionTitle title="Reviews" />
                            <ReviewSource />
                            <SampleNotice />
                            <div className="flex flex-col gap-6 @tablet:flex-row @tablet:items-center @tablet:gap-10">
                                <div className="flex shrink-0 flex-col items-start gap-1">
                                    <span className="text-display-md font-semibold text-primary tabular-nums">{profile.reviews.average.toFixed(1)}</span>
                                    <StarRating rating={profile.reviews.average} />
                                    <span className="text-sm text-tertiary tabular-nums">{profile.reviews.count} verified reviews</span>
                                </div>
                                <Bars distribution={profile.reviews.distribution} />
                            </div>
                            <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2 @desktop:grid-cols-3">
                                {profile.reviews.reviews.slice(0, 3).map((r) => (
                                    <ReviewCard key={r.id} review={r} />
                                ))}
                            </div>
                            <Button size="web-lg" color="outline" fullWidth onPress={() => setReviewsOpen(true)}>
                                Read more reviews
                            </Button>
                        </Section>
                    )}
                </div>
            </WebPage>

            {profile.reviews.status === "published" && (
                <WebDialog isOpen={reviewsOpen} onOpenChange={setReviewsOpen} title={`Reviews for ${coach.name}`} description={SAMPLE_REVIEW_NOTICE} size="lg">
                    <div className="flex flex-col gap-3">
                        {profile.reviews.reviews.map((r) => (
                            <ReviewCard key={r.id} review={r} />
                        ))}
                    </div>
                </WebDialog>
            )}
        </WebShell>
    );
};

const Section = ({ id, children }: { id: SectionId; children: ReactNode }) => (
    <section id={`pro-${id}`} className="scroll-mt-40">
        <Panel bodyClassName="flex flex-col gap-5 px-5 py-6 @tablet:px-7 @tablet:py-7">{children}</Panel>
    </section>
);

const CREDIT_STEPS = [
    {
        icon: CreditCard01,
        title: "Buy a pack",
        detail: "5 or 10 lessons with one instructor, paid up front at a lower rate per lesson.",
    },
    {
        icon: Wallet02,
        title: "Credits land in your wallet",
        detail: "Straight away, under Account → Wallet. Nothing to print or remember.",
    },
    {
        icon: RefreshCcw01,
        title: "Spend one when you book",
        detail: "Pick “Use a lesson credit” at payment and the lesson costs nothing further.",
    },
];

/** Buy → wallet → redeem, in three lines (Fox P3 credits-explainer). */
export const CreditsExplainer = () => (
    <div className="flex flex-col gap-4 rounded-xl bg-secondary p-5">
        <div className="flex items-center gap-2">
            <Ticket02 className="size-5 text-fg-brand-primary" aria-hidden="true" />
            <h3 className="text-md font-semibold text-primary">How lesson credits work</h3>
        </div>
        <ol className="grid grid-cols-1 gap-4 @tablet:grid-cols-3">
            {CREDIT_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-solid text-xs font-semibold text-white tabular-nums">{i + 1}</span>
                    <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-primary">{s.title}</span>
                        <span className="text-sm text-tertiary">{s.detail}</span>
                    </span>
                </li>
            ))}
        </ol>
        <p className="text-xs text-tertiary">Packs are bought on their own, before a booking — they aren&rsquo;t part of paying for a lesson.</p>
    </div>
);

const ReviewSource = () => (
    <p className="flex items-start gap-2 text-sm text-tertiary">
        <CheckVerified01 className="mt-0.5 size-4 shrink-0 text-fg-success-primary" aria-hidden="true" />
        {REVIEW_SOURCE}
    </p>
);

/** The undismissable sample-data notice (reviews.ts: every render must show it). */
const SampleNotice = () => (
    <div className="flex items-start gap-3 rounded-xl bg-warning-primary p-4 ring-1 ring-secondary ring-inset">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-fg-warning-primary" aria-hidden="true" />
        <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-warning-primary">{SAMPLE_REVIEW_NOTICE}</p>
            <p className="text-sm text-secondary">
                Ratings and comments below are placeholder content for this prototype so the layout can be evaluated. MCG does not publish instructor reviews, and nothing here
                reflects any MCG instructor.
            </p>
        </div>
    </div>
);

const Bars = ({ distribution }: { distribution: number[] }) => (
    <ul className="flex w-full max-w-md flex-col gap-1.5" aria-label="Rating distribution">
        {distribution.map((f, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
                <span className="w-3 text-tertiary tabular-nums">{5 - i}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-tertiary">
                    <span className="block h-full rounded-full bg-fg-warning-secondary" style={{ width: `${Math.round(f * 100)}%` }} />
                </span>
                <span className="w-9 text-right text-xs text-tertiary tabular-nums">{Math.round(f * 100)}%</span>
            </li>
        ))}
    </ul>
);

const ReviewCard = ({ review }: { review: InstructorReview }) => (
    <article className="flex flex-col gap-2 rounded-xl bg-primary p-4 ring-1 ring-secondary ring-inset">
        <StarRating rating={review.stars} size="sm" />
        <h3 className="text-md font-semibold text-primary">{review.title}</h3>
        <p className="text-sm text-tertiary">{review.text}</p>
        <div className="mt-auto flex items-center gap-2 pt-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-tertiary text-xs font-semibold text-secondary">{review.initials}</span>
            <span className="flex flex-col">
                <span className="flex items-center gap-1 text-xs font-medium text-success-primary">
                    <CheckVerified01 className="size-3.5" aria-hidden="true" /> Verified lesson
                </span>
                <span className="text-xs text-tertiary">
                    {review.lesson} · {review.date}
                </span>
            </span>
        </div>
    </article>
);

/* ---------- Coming soon ---------- */

const ComingSoon = ({ profile, backHref, photo }: { profile: InstructorProfile; backHref: string; photo: string }) => {
    const { navigate } = useWebRouter();
    return (
        <WebShell active="instruction">
            <WebPage>
                <BackLink href={backHref} />
                <div className="mt-6 grid grid-cols-1 gap-8 @desktop:grid-cols-2 @desktop:gap-12">
                    <div className="overflow-hidden rounded-2xl bg-secondary ring-1 ring-secondary">
                        <img src={photo} alt="" className="aspect-[4/5] w-full object-contain p-14 opacity-60" />
                    </div>
                    <div className="flex flex-col items-start gap-4">
                        <Tag tone="gray" variant="soft">
                            Coming soon
                        </Tag>
                        <h1 className="text-display-sm font-bold text-primary">{profile.displayName}</h1>
                        <p className="text-lg text-tertiary">{profile.coach.title}</p>
                        <div className="flex flex-wrap gap-2">
                            {profile.courses.map((c) => (
                                <CourseChip key={c.id} slug={c.id} />
                            ))}
                        </div>
                        <Panel bodyClassName="flex flex-col gap-2 p-5">
                            <h2 className="text-md font-semibold text-primary">Profile coming soon</h2>
                            <p className="text-sm text-tertiary">
                                The Academy lists {profile.coach.name} but hasn&rsquo;t published a photo, a lesson menu or online booking yet. They teach at{" "}
                                {profile.courses.map((c) => courseName(c.id)).join(" and ")} — until the profile is live, the shop books their lessons by phone (
                                {profile.coach.contact.phone}).
                            </p>
                        </Panel>
                        <div className="flex flex-wrap gap-3">
                            <Button size="web-lg" onPress={() => navigate(instructionHref())}>
                                Browse the lesson catalog
                            </Button>
                            <Button size="web-lg" color="outline" iconLeading={ArrowLeft} onPress={() => navigate(backHref)}>
                                All instructors
                            </Button>
                        </div>
                    </div>
                </div>
            </WebPage>
        </WebShell>
    );
};
