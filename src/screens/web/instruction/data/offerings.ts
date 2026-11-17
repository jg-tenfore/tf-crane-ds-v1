/**
 * One instruction catalog, searched in one step — ported from Fox Prototype 3
 * (`mcg-3/instruction/offerings.ts`).
 *
 * Everything a golfer can sign up for is an `Offering`: Academy privates, Academy group programs
 * and county clinics, each with a type (golf), a format (private / clinic / junior camp / junior
 * league / Op 36), who teaches it, where, the skill sets it suits, when it runs and a price. The
 * three sources keep their own detail data (`catalog.ts`, `county-clinics.ts`) — this only puts
 * them on one shelf so the hub can filter them together.
 *
 * `filterOfferings(queryToFilter(query))` is what the hub shows for a URL.
 */
import { addDays, dateOfIso, INSTRUCTION_TODAY, TODAY_ISO } from "./dates";
import { serviceHasOpening } from "./availability";
import { BOOKABLE_COACHES, coachById, GROUP_SERVICES, PRIVATE_SERVICES, servicePrice, spotsLeft as serviceSpotsLeft, type LessonService } from "./catalog";
import { clinicSpotsLeft, MCG_CLINICS, type McgClinic } from "./county-clinics";
import { bookHref, serviceHref } from "./query";
import { ACADEMY_COURSE_ORDER, courseName } from "./roster";
import { SKILL_ORDER, type InstructionType, type OfferingFormat, type SkillTag } from "./vocab";

export interface OfferingInstructor {
    /** Academy roster id. County clinic staff aren't on the roster and have none. */
    id?: string;
    name: string;
    initials: string;
    title?: string;
    /** Headshot, when the instructor is on the roster. */
    photo?: string | null;
}

export interface Offering {
    /** Unique across sources, e.g. `academy-private-45`, `county-ggr-northwest`. */
    key: string;
    /** The source id (service id or clinic id) — what `serviceHref(id)` takes. */
    id: string;
    type: InstructionType;
    format: OfferingFormat;
    source: "academy" | "county";
    name: string;
    blurb: string;
    /** Short facts line: duration and party size, or the schedule. */
    meta: string;
    image?: string;
    banner?: string;
    /** Crane course ids. */
    courseSlugs: string[];
    instructors: OfferingInstructor[];
    skills: SkillTag[];
    /** The lowest price a golfer could pay at the chosen course(s). */
    priceFrom: number;
    /** What `priceFrom` buys: "1 golfer", "for the series", "per session"… */
    priceUnit: string;
    /** Seats left, for group offerings with a roster. */
    spotsLeft?: number;
    /** Weekdays it runs (0 = Sunday). A private carries every day. */
    days: number[];
    /** First and last session, ISO. Absent on a private. */
    startIso?: string;
    endIso?: string;
    /** Fox P3 sample format MCG doesn't run yet — label it "Sample program". */
    sample?: boolean;
    /** The lesson behind a private offering, for checking real availability. */
    serviceId?: string;
    /** Primary action: privates → choose an instructor (service page); Academy programs → booking; county clinics → detail. */
    href: string;
    /** The detail page for any offering: `/instruction/service/<id>`. */
    detailHref: string;
}

/** Which skill sets each Academy service suits (set by hand, as in Fox). */
const ACADEMY_SKILLS: Record<string, SkillTag[]> = {
    "private-45": ["beginner", "advanced"],
    "private-60": ["advanced", "short-game"],
    "playing-9": ["on-course", "advanced"],
    "private-30": ["short-game", "putting"],
    "junior-30": ["kids", "beginner"],
    "senior-45": ["beginner"],
    "clinic-adult-l2": ["on-course"],
    "clinic-3wk-nov": ["beginner", "advanced"],
    "clinic-scoring": ["short-game"],
    "clinic-launch-lab": ["advanced"],
    "clinic-get-golf-ready": ["beginner", "on-course"],
    "clinic-junior-first": ["kids", "beginner"],
    "camp-junior-summer": ["kids"],
    "clinic-wedge": ["short-game", "advanced"],
};

/** Academy programs that aren't plain clinics. */
const ACADEMY_FORMAT: Record<string, OfferingFormat> = { "camp-junior-summer": "junior-camp" };

/** County clinics carry a level and an audience, which map onto skill sets directly. */
const countySkills = (clinic: McgClinic): SkillTag[] => {
    const tags = new Set<SkillTag>();
    if (clinic.level === "New to golf" || clinic.level === "Beginner") tags.add("beginner");
    if (clinic.level === "Advanced") tags.add("advanced");
    if (clinic.audience === "Juniors" || clinic.audience === "All ages") tags.add("kids");
    if (/short-game/.test(clinic.id)) tags.add("short-game");
    if (/play-nine|women-on-course|league-ready|tour-prep/.test(clinic.id)) tags.add("on-course");
    return SKILL_ORDER.filter((t) => tags.has(t));
};

const initialsOf = (name: string) =>
    name
        .replace(/,.*$/, "")
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

const ALL = "all";
const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

const privateOffering = (service: LessonService, courseSlug: string): Offering | null => {
    const coaches = BOOKABLE_COACHES.filter((c) => courseSlug === ALL || c.courseSlugs.includes(courseSlug));
    if (coaches.length === 0) return null;
    return {
        key: `academy-${service.id}`,
        id: service.id,
        type: "golf",
        format: "private",
        source: "academy",
        name: service.name,
        blurb: service.desc,
        meta: service.meta,
        courseSlugs: ACADEMY_COURSE_ORDER.filter((slug) => coaches.some((c) => c.courseSlugs.includes(slug))),
        instructors: coaches.map((c) => ({ id: c.id, name: c.name, initials: c.initials, title: c.title, photo: c.photo })),
        skills: ACADEMY_SKILLS[service.id] ?? [],
        priceFrom: Math.min(...coaches.map((c) => servicePrice(service, c, 1))),
        priceUnit: "1 golfer",
        days: service.guardrails?.daysOfWeek ?? EVERY_DAY,
        serviceId: service.id,
        href: serviceHref(service.id, courseSlug),
        detailHref: serviceHref(service.id, courseSlug),
    };
};

const programOffering = (service: LessonService): Offering => {
    const coachId = service.coachIds?.[0] ?? "";
    const coach = coachById(coachId);
    return {
        key: `academy-${service.id}`,
        id: service.id,
        type: "golf",
        format: ACADEMY_FORMAT[service.id] ?? "clinic",
        source: "academy",
        name: service.name,
        blurb: service.desc,
        meta: service.meta,
        image: service.image,
        banner: service.banner,
        courseSlugs: service.courseSlug ? [service.courseSlug] : [],
        instructors: coach ? [{ id: coach.id, name: coach.name, initials: coach.initials, title: coach.title, photo: coach.photo }] : [],
        skills: ACADEMY_SKILLS[service.id] ?? [],
        priceFrom: service.basePrice,
        priceUnit: service.sessions && service.sessions > 1 ? "for the program" : "per player",
        spotsLeft: serviceSpotsLeft(service) ?? undefined,
        days: service.days ?? EVERY_DAY,
        startIso: service.startIso,
        endIso: service.endIso,
        serviceId: service.id,
        href: bookHref({ coach: coachId, service: service.id, course: service.courseSlug }),
        detailHref: serviceHref(service.id, service.courseSlug),
    };
};

const countyOffering = (clinic: McgClinic): Offering => ({
    key: `county-${clinic.id}`,
    id: clinic.id,
    type: "golf",
    format: clinic.programFormat ?? "clinic",
    source: "county",
    name: clinic.title,
    blurb: clinic.description,
    meta: `${clinic.schedule} · ${clinic.time}`,
    image: clinic.image,
    banner: clinic.banner,
    courseSlugs: [clinic.courseSlug],
    instructors: [{ name: clinic.instructor.name, initials: clinic.instructor.initials || initialsOf(clinic.instructor.name), title: clinic.instructor.title }],
    skills: countySkills(clinic),
    priceFrom: clinic.perSession?.price ?? clinic.price,
    priceUnit: clinic.priceUnit,
    spotsLeft: clinic.perSession ? undefined : clinicSpotsLeft(clinic),
    days: clinic.days,
    startIso: clinic.isoDate,
    endIso: clinic.endIso,
    sample: clinic.sample,
    href: serviceHref(clinic.id, clinic.courseSlug),
    detailHref: serviceHref(clinic.id, clinic.courseSlug),
});

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

/** What the golfer asked for. Every list is multi-select; empty means "no preference". */
export interface OfferingFilter {
    /** Course ids. Empty = every course. */
    courses: string[];
    formats: OfferingFormat[];
    skills: SkillTag[];
    /** Weekdays, 0 = Sunday. Empty = any day. */
    days: number[];
    /** ISO dates. A program must overlap the range; a private needs an opening in it. */
    from?: string;
    to?: string;
    /** Free text over name, blurb, instructor names and course names. */
    q?: string;
    type: InstructionType | typeof ALL;
}

export const DEFAULT_FILTER: OfferingFilter = { courses: [], formats: [], skills: [], days: [], type: ALL };

/**
 * Everything offered at a course (or `"all"`). Privates are priced and staffed for that course:
 * where no Academy instructor teaches (Hampshire Greens today) they drop out rather than list a
 * lesson nobody there can teach.
 */
export const offeringsAt = (courseSlug: string): Offering[] => {
    const privates = PRIVATE_SERVICES.map((s) => privateOffering(s, courseSlug)).filter((o): o is Offering => o !== null);
    const atCourse = (o: Offering) => courseSlug === ALL || o.courseSlugs.includes(courseSlug);
    return [...privates, ...GROUP_SERVICES.map(programOffering).filter(atCourse), ...MCG_CLINICS.map(countyOffering).filter(atCourse)];
};

/** Every offering across every course. */
export const ALL_OFFERINGS: Offering[] = offeringsAt(ALL);

/** One offering by source id (`private-45`, `clinic-adult-l2`, `ggr-northwest`) or key. */
export const offeringById = (id: string): Offering | undefined => ALL_OFFERINGS.find((o) => o.id === id || o.key === id);

/** Offerings across a set of courses, deduped — the multi-select course filter. */
export const offeringsForCourses = (courses: string[]): Offering[] => {
    if (courses.length === 0) return offeringsAt(ALL);
    const seen = new Map<string, Offering>();
    for (const slug of courses) for (const o of offeringsAt(slug)) if (!seen.has(o.key)) seen.set(o.key, o);
    return [...seen.values()];
};

/** A scheduled program must still be running inside the requested range. */
const inDateRange = (o: Offering, from?: string, to?: string) => {
    if (!from && !to) return true;
    if (!o.startIso || !o.endIso) return true; // a private has no fixed run
    if (from && o.endIso < from) return false;
    if (to && o.startIso > to) return false;
    return true;
};

/**
 * A private matches a day/date filter only if an instructor actually has an opening then —
 * Fox's fix for "filter your way to an empty calendar three screens later".
 */
const privateHasOpening = (o: Offering, f: OfferingFilter) =>
    !o.serviceId || serviceHasOpening(o.serviceId, f.courses.length ? f.courses : o.courseSlugs, f.days, f.from ? dateOfIso(f.from) : undefined, f.to ? dateOfIso(f.to) : undefined);

const matchesText = (o: Offering, q?: string) => {
    if (!q?.trim()) return true;
    const hay = [o.name, o.blurb, o.meta, ...o.instructors.map((i) => i.name), ...o.courseSlugs.map(courseName)].join(" ").toLowerCase();
    return q
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((w) => hay.includes(w));
};

/** Upcoming only: programs that have already finished drop out. */
const notFinished = (o: Offering) => !o.endIso || o.endIso >= TODAY_ISO;

export const filterOfferings = (filter: OfferingFilter): Offering[] =>
    offeringsForCourses(filter.courses).filter(
        (o) =>
            notFinished(o) &&
            (filter.formats.length === 0 || filter.formats.includes(o.format)) &&
            (filter.skills.length === 0 || filter.skills.some((s) => o.skills.includes(s))) &&
            (filter.days.length === 0 || o.days.some((d) => filter.days.includes(d))) &&
            inDateRange(o, filter.from, filter.to) &&
            (o.format !== "private" || (filter.days.length === 0 && !filter.from && !filter.to) || privateHasOpening(o, filter)) &&
            matchesText(o, filter.q) &&
            (filter.type === ALL || o.type === filter.type),
    );

/** Group programs starting soonest (from today) — the home page's "Programs starting soon". */
export const upcomingPrograms = (limit = 4, within = 60): Offering[] =>
    ALL_OFFERINGS.filter((o) => o.format !== "private" && o.startIso && o.startIso >= TODAY_ISO && dateOfIso(o.startIso) <= addDays(INSTRUCTION_TODAY, within))
        .sort((a, b) => (a.startIso! < b.startIso! ? -1 : 1))
        .slice(0, limit);

/** Instruction types on offer — the type filter hides itself below two. */
export const typesAt = (courses: string[]): InstructionType[] => [...new Set(offeringsForCourses(courses).map((o) => o.type))];

export interface InstructorWithOfferings {
    instructor: OfferingInstructor;
    offerings: Offering[];
}

/** The instructors behind a set of offerings, each with what they teach from it (roster first). */
export const instructorsFor = (offerings: Offering[]): InstructorWithOfferings[] => {
    const map = new Map<string, InstructorWithOfferings>();
    for (const offering of offerings) {
        for (const instructor of offering.instructors) {
            const key = instructor.id ?? `name:${instructor.name}`;
            const entry = map.get(key) ?? { instructor, offerings: [] };
            entry.offerings.push(offering);
            map.set(key, entry);
        }
    }
    const all = [...map.values()];
    return [...all.filter((e) => e.instructor.id), ...all.filter((e) => !e.instructor.id)];
};

/** "all nine courses" / "Falls Road Golf Course" / "3 courses". */
export const coursesLabel = (courses: string[]) => (courses.length === 0 ? "all nine courses" : courses.length === 1 ? courseName(courses[0]) : `${courses.length} courses`);
