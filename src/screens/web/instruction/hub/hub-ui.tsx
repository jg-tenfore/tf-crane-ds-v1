import { useLayoutEffect, useState, type FC, type ReactNode, type RefObject } from "react";
import { ArrowRight, Calendar, ChevronDown, Clock, MarkerPin01, Star01 } from "@untitledui/icons";
import { ToggleButton as AriaToggleButton } from "react-aria-components";
import { Tag } from "@/components/base/badge";
import { WebLink } from "@/components/web/web-router";
import type { Course } from "@/data/crane";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { cx } from "@/utils/cx";
import { useOfferingArt } from "../use-offering-art";
import {
    academyDisplayName,
    academyLogo,
    coachById,
    courseShortName,
    FORMAT_LABEL,
    fromPrice,
    instructorReviews,
    money0,
    nextOpening,
    proHref,
    SKILL_LABEL,
    type InstructorWithOfferings,
    type Offering,
    type OfferingInstructor,
} from "../data";

/* ------------------------------------------------------------------ */
/* Shared styles                                                       */
/* ------------------------------------------------------------------ */

export const focusRing = "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";
export const cardBase = "rounded-2xl bg-primary ring-1 ring-secondary ring-inset";
export const cardLink = cx("group flex flex-col overflow-hidden transition duration-100 ease-linear hover:ring-brand", cardBase, focusRing);

/** True while `ref`'s element is narrower than the Crane Web `@tablet` breakpoint (768). */
export const useIsNarrow = (ref: RefObject<HTMLElement | null>, breakpoint = 768) => {
    const [narrow, setNarrow] = useState(false);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < breakpoint));
        ro.observe(el);
        return () => ro.disconnect();
    }, [ref, breakpoint]);
    return narrow;
};

/** Button-styled link (Crane Web sizes). */
export const LinkButton = ({ href, children, variant = "outline", size = "md", className }: { href: string; children: ReactNode; variant?: "outline" | "filled" | "tinted"; size?: "sm" | "md" | "lg"; className?: string }) => (
    <WebLink
        href={href}
        className={cx(
            "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold whitespace-nowrap transition duration-100 ease-linear",
            { sm: "h-9 px-3.5 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-5 text-md" }[size],
            variant === "filled" && "bg-brand-solid text-white hover:bg-brand-solid_hover",
            variant === "tinted" && "bg-brand-primary_alt text-brand-secondary hover:bg-brand-secondary",
            variant === "outline" && "bg-primary text-secondary ring-1 ring-primary ring-inset hover:bg-primary_hover",
            focusRing,
            className,
        )}
    >
        {children}
    </WebLink>
);

/** The MCG Golf Academy lockup on a white tile (full-colour art, so it reads in dark mode too). */
export const AcademyLogoTile = ({ className }: { className?: string }) => (
    <span className={cx("inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-2 ring-1 ring-secondary ring-inset", className)}>
        <img src={academyLogo} alt="MCG Golf Academy" className="h-[78%] w-auto object-contain" />
    </span>
);

/* ------------------------------------------------------------------ */
/* Chips                                                               */
/* ------------------------------------------------------------------ */

/** Multi-select filter chip. Selected = solid brand with a check-like fill; never colour alone (aria-pressed). */
export const FilterToggle = ({ isSelected, onChange, children, leading }: { isSelected: boolean; onChange: (v: boolean) => void; children: ReactNode; leading?: ReactNode }) => (
    <AriaToggleButton
        isSelected={isSelected}
        onChange={onChange}
        className={cx(
            "flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full text-sm font-semibold whitespace-nowrap ring-1 ring-inset transition duration-100 ease-linear",
            leading ? "pr-3.5 pl-1.5" : "px-3.5",
            isSelected ? "bg-brand-solid text-white ring-transparent" : "bg-primary text-secondary ring-primary hover:bg-primary_hover",
            focusRing,
        )}
    >
        {leading}
        {children}
    </AriaToggleButton>
);

/** A course chip with its logo. */
export const CourseToggle = ({ course, isSelected, onChange }: { course: Course; isSelected: boolean; onChange: (v: boolean) => void }) => (
    <FilterToggle isSelected={isSelected} onChange={onChange} leading={<CourseLogo course={course} size={24} shape="circle" className="rounded-full" />}>
        {course.shortName}
    </FilterToggle>
);

/* ------------------------------------------------------------------ */
/* Course select (toolbar)                                             */
/* ------------------------------------------------------------------ */

export const CourseSelect = ({
    courses,
    value,
    anyLabel,
    multiLabel,
    onChange,
    className,
    label = "Course",
}: {
    courses: Course[];
    /** A course id, "all", or "multi" (several picked in the filter panel). */
    value: string;
    anyLabel: string;
    multiLabel?: string;
    onChange: (id: string) => void;
    className?: string;
    label?: string;
}) => (
    <label className={cx("relative flex", className)}>
        <span className="sr-only">{label}</span>
        <MarkerPin01 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-quaternary" aria-hidden="true" />
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-full cursor-pointer appearance-none truncate rounded-lg bg-primary pr-9 pl-9 text-sm font-medium text-primary ring-1 ring-primary transition duration-100 ease-linear ring-inset outline-none focus:ring-2 focus:ring-brand"
        >
            <option value="all">{anyLabel}</option>
            {value === "multi" && (
                <option value="multi" disabled>
                    {multiLabel}
                </option>
            )}
            {courses.map((c) => (
                <option key={c.id} value={c.id}>
                    {c.name}
                </option>
            ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-quaternary" aria-hidden="true" />
    </label>
);

/* ------------------------------------------------------------------ */
/* Avatars                                                             */
/* ------------------------------------------------------------------ */

const AVATAR = { xs: "size-7 text-[10px]", sm: "size-9 text-xs", md: "size-12 text-sm", lg: "size-16 text-lg" };

/** Headshot (top-cropped) or initials on the brand tint. */
export const InstructorAvatar = ({ photo, initials, size = "sm", className }: { photo?: string | null; initials: string; size?: keyof typeof AVATAR; className?: string }) =>
    photo ? (
        <img src={photo} alt="" loading="lazy" className={cx("shrink-0 rounded-full bg-secondary object-cover object-top", AVATAR[size], className)} />
    ) : (
        <span className={cx("flex shrink-0 items-center justify-center rounded-full bg-brand-primary_alt font-semibold text-brand-secondary", AVATAR[size], className)}>{initials}</span>
    );

/** Up to four overlapping headshots + "22 instructors" / "with Mike Kenny". */
export const InstructorStack = ({ instructors }: { instructors: OfferingInstructor[] }) => (
    <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex shrink-0 -space-x-2">
            {instructors.slice(0, 4).map((i) => (
                <InstructorAvatar key={i.id ?? i.name} photo={i.photo} initials={i.initials} size="xs" className="ring-2 ring-bg-primary" />
            ))}
        </div>
        <span className="truncate text-xs text-tertiary">{instructors.length === 1 ? `with ${instructors[0].name}` : `${instructors.length} instructors`}</span>
    </div>
);

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

export const OfferingBadges = ({ offering, className }: { offering: Offering; className?: string }) => {
    const full = offering.spotsLeft === 0;
    return (
        <div className={cx("flex flex-wrap items-center gap-1.5", className)}>
            <Tag tone={offering.format === "private" ? "brand" : "gray"} variant="soft">
                {FORMAT_LABEL[offering.format]}
            </Tag>
            {offering.sample && (
                <Tag tone="gray" variant="soft">
                    Sample program
                </Tag>
            )}
            {full && (
                <Tag tone="error" variant="soft">
                    Waitlist
                </Tag>
            )}
            {offering.spotsLeft !== undefined && offering.spotsLeft > 0 && offering.spotsLeft <= 3 && (
                <Tag tone="warning" variant="soft">
                    {offering.spotsLeft} {offering.spotsLeft === 1 ? "spot" : "spots"} left
                </Tag>
            )}
        </div>
    );
};

export const SkillPills = ({ offering, max = 3 }: { offering: Offering; max?: number }) =>
    offering.skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
            {offering.skills.slice(0, max).map((s) => (
                <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary ring-1 ring-secondary ring-inset">
                    {SKILL_LABEL[s]}
                </span>
            ))}
        </div>
    ) : null;

const Fact = ({ icon: Icon, children }: { icon: FC<{ className?: string }>; children: ReactNode }) => (
    <span className="flex min-w-0 items-center gap-1.5">
        <Icon className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
        <span className="truncate">{children}</span>
    </span>
);

const PriceBlock = ({ offering }: { offering: Offering }) => (
    <div className="flex shrink-0 flex-col items-end">
        <span className="text-md font-semibold text-primary tabular-nums">{offering.format === "private" ? `From ${money0(offering.priceFrom)}` : money0(offering.priceFrom)}</span>
        <span className="text-xs text-quaternary">{offering.priceUnit}</span>
    </div>
);

/* ------------------------------------------------------------------ */
/* Result cards                                                        */
/* ------------------------------------------------------------------ */

/**
 * A private lesson: no photo (every private would share one) — the Academy lockup, format,
 * duration · golfers, two lines of copy, skill sets, who teaches it and the lowest price.
 */
export const PrivateLessonCard = ({ offering, href }: { offering: Offering; href: string }) => (
    <WebLink href={href} className={cardLink} aria-label={`${offering.name} — choose an instructor`}>
        <div className="flex flex-1 flex-col gap-3 p-5">
            <OfferingBadges offering={offering} />
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-primary group-hover:underline">{offering.name}</h3>
                <p className="flex items-center gap-1.5 text-sm text-tertiary">
                    <Clock className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                    {offering.meta}
                </p>
            </div>
            <p className="line-clamp-2 text-sm text-tertiary">{offering.blurb}</p>
            <SkillPills offering={offering} />
            <div className="mt-auto flex items-end justify-between gap-3 border-t border-secondary pt-3">
                <InstructorStack instructors={offering.instructors} />
                <PriceBlock offering={offering} />
            </div>
        </div>
    </WebLink>
);

/** A group program (Academy program or county clinic): art, badges, schedule, course, instructor, price. */
export const ProgramCard = ({ offering, href }: { offering: Offering; href: string }) => {
    const { art } = useOfferingArt();
    return (
        <WebLink href={href} className={cardLink}>
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
                <img src={art(offering.format, offering.image, offering.id)} alt="" loading="lazy" className="size-full object-cover transition duration-300 ease-out group-hover:scale-[1.03]" />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
                <OfferingBadges offering={offering} />
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-primary group-hover:underline">{offering.name}</h3>
                    <div className="flex flex-col gap-1 text-sm text-tertiary">
                        <Fact icon={Calendar}>{offering.meta}</Fact>
                        <Fact icon={MarkerPin01}>{offering.courseSlugs.map(courseShortName).join(", ")}</Fact>
                    </div>
                </div>
                <p className="line-clamp-2 text-sm text-tertiary">{offering.blurb}</p>
                <SkillPills offering={offering} />
                <div className="mt-auto flex items-end justify-between gap-3 border-t border-secondary pt-3">
                    <InstructorStack instructors={offering.instructors} />
                    <PriceBlock offering={offering} />
                </div>
            </div>
        </WebLink>
    );
};

/* ------------------------------------------------------------------ */
/* Instructor cards                                                    */
/* ------------------------------------------------------------------ */

const ReviewLine = ({ id }: { id: string }) => {
    const r = instructorReviews(id);
    if (r.status === "off") return null;
    if (r.status === "collecting") return <span className="text-xs text-quaternary">New · collecting reviews</span>;
    return (
        <span className="flex items-center gap-1 text-xs text-tertiary">
            <Star01 className="size-3.5 fill-current text-fg-warning-secondary" aria-hidden="true" />
            <span className="font-semibold text-primary tabular-nums">{r.average.toFixed(1)}</span>
            <span className="tabular-nums">({r.count})</span>
        </span>
    );
};

const offerSummary = (offerings: Offering[]) => {
    const privates = offerings.filter((o) => o.format === "private").length;
    const groups = offerings.length - privates;
    return [privates && `${privates} private ${privates === 1 ? "lesson" : "lessons"}`, groups && `${groups} group ${groups === 1 ? "program" : "programs"}`].filter(Boolean).join(" · ");
};

/**
 * An Academy instructor: headshot, "Name, Credential", title, home courses, what they teach that
 * matches the search, lessons from $, next opening today and the (sample) rating. Links to the profile.
 */
export const InstructorCard = ({ entry }: { entry: InstructorWithOfferings }) => {
    const { instructor, offerings } = entry;
    const coach = instructor.id ? coachById(instructor.id) : undefined;
    if (!coach) return <CountyStaffCard entry={entry} />;
    const opening = nextOpening(coach.id);
    return (
        <WebLink href={proHref(coach.id)} className={cardLink} aria-label={`${academyDisplayName(coach)} — profile`}>
            <div className="flex items-start gap-4 p-5">
                <InstructorAvatar photo={coach.photo} initials={coach.initials} size="lg" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <h3 className="truncate text-lg font-semibold text-primary group-hover:underline">{academyDisplayName(coach)}</h3>
                    <p className="truncate text-sm text-tertiary">{coach.title}</p>
                    <ReviewLine id={coach.id} />
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5 px-5">
                {coach.courseSlugs.map((slug) => (
                    <span key={slug} className="inline-flex h-6 items-center gap-1 rounded-md bg-secondary px-2 text-xs font-semibold text-secondary ring-1 ring-secondary ring-inset">
                        <MarkerPin01 className="size-3 text-fg-quaternary" aria-hidden="true" />
                        {courseShortName(slug)}
                    </span>
                ))}
            </div>
            <div className="mt-4 flex flex-1 flex-col gap-1 border-t border-secondary px-5 py-3 text-sm">
                <span className="text-xs font-semibold text-brand-secondary">{offerSummary(offerings)}</span>
                <span className="flex items-center gap-1.5 text-tertiary">
                    <Clock className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                    {opening === "No openings today" ? "No openings today" : `Next: today ${opening}`}
                </span>
            </div>
            <div className="mt-auto flex items-center justify-between gap-3 border-t border-secondary px-5 py-3">
                <span className="flex flex-col">
                    <span className="text-xs text-quaternary">Lessons from</span>
                    <span className="text-md font-semibold text-primary tabular-nums">{money0(fromPrice(coach.id))}</span>
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-brand-secondary">
                    View profile <ArrowRight className="size-4" aria-hidden="true" />
                </span>
            </div>
        </WebLink>
    );
};

/** County clinic staff aren't on the Academy roster (no profile): their programs as links instead. */
const CountyStaffCard = ({ entry }: { entry: InstructorWithOfferings }) => {
    const { instructor, offerings } = entry;
    return (
        <article className={cx("flex flex-col overflow-hidden", cardBase)}>
            <div className="flex items-start gap-4 p-5">
                <InstructorAvatar initials={instructor.initials} size="lg" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <h3 className="truncate text-lg font-semibold text-primary">{instructor.name}</h3>
                    {instructor.title && <p className="line-clamp-2 text-sm text-tertiary">{instructor.title}</p>}
                    <span className="text-xs text-quaternary">County clinic staff</span>
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-1 border-t border-secondary px-5 py-3">
                <span className="text-xs font-semibold text-brand-secondary">{offerSummary(offerings)}</span>
                <ul className="flex flex-col">
                    {offerings.slice(0, 5).map((o) => (
                        <li key={o.key}>
                            <WebLink href={o.detailHref} className={cx("flex items-center justify-between gap-3 rounded-md py-1.5 text-sm font-medium text-secondary transition duration-100 ease-linear hover:text-brand-secondary", focusRing)}>
                                <span className="truncate">{o.name}</span>
                                <ArrowRight className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                            </WebLink>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    );
};
