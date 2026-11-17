/**
 * MCG Instruction catalog — instructors (as bookable coaches), the lesson/program service menu
 * and pricing. Ported from Fox Prototype 3 (`instruction-3/instruction-catalog.ts`); ids are
 * identical (`private-45`, `clinic-adult-l2`, `mike-kenny`, …).
 *
 * Three structural decisions carried over from Fox:
 *  1. **Privates and group programs are the same object** (`LessonService`, separated by `kind`).
 *  2. **Price is an Academy table per group size, adjusted per instructor** (`priceAdj`, or an
 *     instructor's own table in `priceOverrides`). One menu, not one per instructor.
 *  3. **Course is a dimension of a service, not a copy of it.** A coach at three courses has one
 *     menu and three calendars.
 *
 * Rates are a *model* (derived from the Academy title), not real MCG prices. Program dates are
 * re-based onto Crane's calendar — see `dates.ts`.
 */
import { USER } from "@/data/crane";
import { fmtMonthDay, fmtTime, dateOfIso, rebaseIso, runDays, sessionDates, WEEKDAYS, WEEKDAYS_SHORT, type RunPattern } from "./dates";
import { programArt } from "./images";
import type { EligibilityAnswers, RegistrationRules } from "./registration-rules";
import { ACADEMY_COURSE_ORDER, ACADEMY_ROSTER, coachPhoto, instructorContact, type AcademyInstructor } from "./roster";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Audience = "adult" | "junior" | "senior";

export const AUDIENCE_LABEL: Record<Audience, string> = { adult: "Adult", junior: "Junior", senior: "Senior" };

export type FocusArea = "Full swing" | "Short game" | "Putting" | "Playing" | "Junior development";

/** A one-to-one lesson, or a seat in a scheduled group program. */
export type ServiceKind = "private" | "group";

/** Restrictions on a service: they narrow which of an instructor's slots can be booked for it. */
export interface Guardrails {
    /** 0 = Sunday … 6 = Saturday. Omit for any day. */
    daysOfWeek?: number[];
    /** Minutes since midnight. Omit for the instructor's full working day. */
    timeWindow?: { start: number; end: number };
    /** Display-only seasonal note. */
    season?: string;
}

export interface LessonService {
    id: string;
    name: string;
    kind: ServiceKind;
    audience: Audience;
    /** Short line under the name on a card, e.g. "45 min · 1–4 golfers". */
    meta: string;
    desc: string;
    durationMin: number;
    minPlayers: number;
    /** Party size is an option on one service, not separate services. */
    maxPlayers: number;
    /** Price at one golfer, before any instructor adjustment. */
    basePrice: number;
    /** The Academy's **total** for 1, 2, 3 or 4 golfers, typed in one size at a time. */
    priceByPlayers: Record<number, number>;
    guardrails?: Guardrails;
    /** Who can book it and what they're asked (`registration-rules.ts`). */
    rules?: RegistrationRules;
    tags: string[];
    /** Catalog section heading. */
    section: string;
    featured?: boolean;
    /** e.g. "Save 20%". */
    save?: string;

    /* ---- group programs only ---- */
    /** Which instructors teach it. Omit on a private = every bookable instructor. */
    coachIds?: string[];
    /** A scheduled program runs at one course (Crane course id). */
    courseSlug?: string;
    /** e.g. "Thursdays 6:00 PM, from Oct 15" — generated from `startIso`. */
    schedule?: string;
    /** First session (ISO, already re-based onto Crane's calendar). */
    startIso?: string;
    /** Last session (ISO). */
    endIso?: string;
    /** Every session date (ISO). */
    sessionDates?: string[];
    /** Weekdays it meets (0 = Sunday). */
    days?: number[];
    /** Session time, e.g. "6:00 PM – 7:00 PM". */
    time?: string;
    sessions?: number;
    capacity?: number;
    registered?: number;
    ageGroup?: string;
    /** 3:2 card art and a 21:9 banner. */
    image?: string;
    banner?: string;
}

export interface Coach {
    id: string;
    /** Printed name, without the credential suffix. */
    name: string;
    credential: string | null;
    /** The Academy title, e.g. "Director Of Instruction". */
    title: string;
    initials: string;
    /** Every course this instructor teaches at (Crane course ids). */
    courseSlugs: string[];
    /** Headshot URL, the coming-soon placeholder, or null (initials). */
    photo: string | null;
    /**
     * Added to the Academy price. Derived from the Academy title — a model of the structure
     * (producers above the academy rate), NOT real MCG rates.
     */
    priceAdj: number;
    /** An instructor's own group-size table for a lesson (by service id), replacing table + adj. */
    priceOverrides?: Record<string, Record<number, number>>;
    /** Generic Academy contact (never a personal email or direct line). */
    contact: { email: string; phone: string; label: string };
    /** Only where the Academy publishes one. Never invented for a real person. */
    bio: string | null;
    /** The Academy hasn't published a photo yet; can't be booked. */
    comingSoon?: boolean;
    /** Only on the "any instructor" placeholder — never attributed to real staff. */
    focus?: FocusArea[];
    credentials?: string[];
    /** The "any available instructor" placeholder rather than a real person. */
    isAny?: boolean;
}

/** An instructor and a coach are the same person; screens may use either name. */
export type Instructor = Coach;

/* ------------------------------------------------------------------ */
/* Instructors                                                         */
/* ------------------------------------------------------------------ */

/**
 * "Any available instructor" — a first-class choice. Offered at the top of the instructor step so
 * a golfer never has to pick a person before a time.
 */
export const ANY_INSTRUCTOR: Coach = {
    id: "any",
    name: "Any available instructor",
    credential: null,
    title: "We'll match you with an MCG pro",
    initials: "??",
    courseSlugs: ACADEMY_COURSE_ORDER,
    photo: null,
    priceAdj: 0,
    contact: instructorContact({ courseSlugs: [] }),
    bio: "Pick this if you're flexible on who teaches you. We'll assign an MCG Academy instructor based on your course, your time, and what you want to work on — and you'll see who it is before you pay.",
    focus: ["Full swing", "Short game"],
    credentials: ["Every MCG Academy instructor is certified by the Academy"],
    isAny: true,
};

/** Rate tiers by Academy title — a model, not a claim about what anyone charges. */
const TITLE_ADJ: { match: RegExp; adj: number }[] = [
    { match: /Director/i, adj: 25 },
    { match: /Master Instructor/i, adj: 25 },
    { match: /Lead Instructor/i, adj: 15 },
    { match: /Certified Instructor/i, adj: 5 },
    { match: /Academy Instructor/i, adj: 0 },
];

const adjFor = (x: AcademyInstructor): number => TITLE_ADJ.find((t) => t.match.test(x.role))?.adj ?? (x.credential === "Master PGA" ? 20 : 0);

const initialsOfName = (name: string) =>
    name
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

/** One instructor who prices groups their own way (a model of the structure, not real rates). */
const PRICE_OVERRIDES: Record<string, Coach["priceOverrides"]> = {
    "doug-hamilton": {
        "private-45": { 1: 95, 2: 120, 3: 135, 4: 150 },
        "private-60": { 1: 120, 2: 150, 3: 170, 4: 185 },
    },
};

/** Every instructor as a bookable coach, in roster order. */
export const COACHES: Coach[] = ACADEMY_ROSTER.map((x) => ({
    id: x.id,
    name: x.name,
    credential: x.credential,
    title: x.role,
    initials: initialsOfName(x.name),
    courseSlugs: x.courseSlugs,
    photo: coachPhoto(x),
    priceAdj: adjFor(x),
    priceOverrides: PRICE_OVERRIDES[x.id],
    contact: instructorContact(x),
    bio: x.bio,
    comingSoon: x.comingSoon,
    credentials: [x.credential, x.role].filter((v): v is string => Boolean(v)),
}));

/** Instructors who can actually be booked — Coming Soon cards can't. */
export const BOOKABLE_COACHES: Coach[] = COACHES.filter((c) => !c.comingSoon);

export const coachById = (id: string): Coach | undefined => (id === "any" ? ANY_INSTRUCTOR : COACHES.find((c) => c.id === id));

export const coachesAtCourse = (slug: string): Coach[] => COACHES.filter((c) => c.courseSlugs.includes(slug));

/** How an instructor's adjustment reads on a card. */
export const adjLabel = (adj: number): string => (adj > 0 ? `+$${adj} premier rate` : adj < 0 ? `−$${Math.abs(adj)} off academy rate` : "Academy rate");

/* ------------------------------------------------------------------ */
/* Service catalog                                                     */
/* ------------------------------------------------------------------ */

const PRIVATE_QUESTIONS: RegistrationRules["questions"] = [
    {
        id: "focus",
        label: "What would you like to work on?",
        type: "choice",
        options: ["Full swing", "Short game", "Putting", "Course management", "Not sure yet"],
        required: true,
        per: "booking",
    },
    { id: "hand", label: "Plays", type: "choice", options: ["Right-handed", "Left-handed"], required: false, per: "golfer" },
];

const LESSON_RULES: Record<string, RegistrationRules> = {
    "private-45": { questions: PRIVATE_QUESTIONS },
    "private-60": { questions: PRIVATE_QUESTIONS },
    "playing-9": { questions: PRIVATE_QUESTIONS },
    "private-30": { questions: PRIVATE_QUESTIONS },
    "junior-30": { age: { min: 7, max: 17 }, questions: PRIVATE_QUESTIONS },
    "senior-45": { age: { min: 62 }, questions: PRIVATE_QUESTIONS },
    "clinic-adult-l2": { age: { min: 18 }, equipmentProvided: false },
    "clinic-get-golf-ready": { age: { min: 18 }, equipmentProvided: true },
    "clinic-junior-first": {
        age: { min: 7, max: 10 },
        equipmentProvided: true,
        questions: [{ id: "shirt", label: "T-shirt size", type: "choice", options: ["Youth XS", "Youth S", "Youth M", "Youth L"], required: true, per: "golfer" }],
    },
    "camp-junior-summer": {
        age: { min: 6, max: 12 },
        equipmentProvided: true,
        questions: [
            { id: "medical", label: "Allergies or medical notes", type: "text", required: false, per: "golfer" },
            { id: "emergency", label: "Emergency contact phone", type: "text", required: true, per: "booking" },
        ],
    },
};

/** A private lesson: `prices` is the Academy's total for 1, 2, … golfers (its length is the max group). */
const priv = (id: string, name: string, audience: Audience, meta: string, durationMin: number, prices: number[], desc: string, tags: string[], extra: Partial<LessonService> = {}): LessonService => ({
    id,
    name,
    kind: "private",
    audience,
    meta,
    desc,
    durationMin,
    minPlayers: 1,
    maxPlayers: prices.length,
    basePrice: prices[0],
    priceByPlayers: Object.fromEntries(prices.map((p, i) => [i + 1, p])),
    rules: LESSON_RULES[id],
    tags,
    section: "Private lessons",
    ...extra,
});

/** "6:00 PM" from a "6:00 PM – 7:00 PM" range. */
const startTimeOf = (time: string) => time.split(/\s+–\s+/)[0];

/** The schedule line for an Academy program, from its (re-based) first session. */
const academySchedule = (startIso: string, time: string, sessions: number, pattern: RunPattern): string => {
    const d = dateOfIso(startIso);
    const start = startTimeOf(time);
    if (pattern === "once") return `${WEEKDAYS_SHORT[d.getDay()]} ${fmtMonthDay(startIso)}, ${start}`;
    if (pattern === "daily") {
        const last = sessionDates(startIso, sessions, "daily").at(-1)!;
        return `${WEEKDAYS_SHORT[d.getDay()]}–${WEEKDAYS_SHORT[dateOfIso(last).getDay()]} mornings, ${fmtMonthDay(startIso)}`;
    }
    return `${WEEKDAYS[d.getDay()]}s ${start}, from ${fmtMonthDay(startIso)}`;
};

interface GroupSpec {
    id: string;
    name: string;
    audience: Audience;
    coachId: string;
    courseSlug: string;
    /** First session in Fox's (June) calendar — re-based here. */
    foxStartIso: string;
    pattern: RunPattern;
    time: string;
    sessions: number;
    durationMin: number;
    price: number;
    capacity: number;
    registered: number;
    ageGroup: string;
    desc: string;
    tags: string[];
    save?: string;
}

const group = (g: GroupSpec): LessonService => {
    const startIso = rebaseIso(g.foxStartIso);
    const dates = sessionDates(startIso, g.sessions, g.pattern);
    const schedule = academySchedule(startIso, g.time, g.sessions, g.pattern);
    return {
        id: g.id,
        name: g.name,
        kind: "group",
        audience: g.audience,
        meta: `${schedule} · ${g.sessions} ${g.sessions === 1 ? "session" : "sessions"}`,
        desc: g.desc,
        durationMin: g.durationMin,
        minPlayers: 1,
        maxPlayers: 1,
        basePrice: g.price,
        priceByPlayers: { 1: g.price },
        rules: LESSON_RULES[g.id],
        tags: g.tags,
        section: "Group clinics & programs",
        coachIds: [g.coachId],
        courseSlug: g.courseSlug,
        schedule,
        startIso,
        endIso: dates.at(-1),
        sessionDates: dates,
        days: runDays(startIso, g.sessions, g.pattern),
        time: g.time,
        sessions: g.sessions,
        capacity: g.capacity,
        registered: g.registered,
        ageGroup: g.ageGroup,
        save: g.save,
        ...programArt(g.id),
    };
};

/** One catalog: privates and scheduled Academy programs side by side. */
export const LESSON_SERVICES: LessonService[] = [
    /* ---- privates: taught by every bookable instructor ---- */
    priv("private-45", "45-Minute Private", "adult", "45 min · 1–4 golfers", 45, [90, 125, 140, 155], "The standard lesson. Full swing, short game, or whatever you bring to the tee that day.", ["private", "adult"], {
        featured: true,
        section: "Featured",
    }),
    priv("private-60", "60-Minute Private", "adult", "60 min · 1–4 golfers", 60, [115, 155, 180, 195], "An extra fifteen minutes — enough to work on two things instead of one.", ["private", "adult"], {
        featured: true,
        section: "Featured",
    }),
    priv("playing-9", "9-Hole Playing Lesson", "adult", "~2 hr · on-course", 120, [170, 230, 265], "Nine holes with your instructor — course management, and lies you never get on the range.", ["private", "playing", "adult"], {
        featured: true,
        section: "Featured",
        guardrails: { timeWindow: { start: 14 * 60, end: 17 * 60 }, season: "March – November" },
    }),
    priv("private-30", "30-Minute Tune-Up", "adult", "30 min · 1–2 golfers", 30, [60, 80], "A focused half hour on one thing — putting, chipping, bunker play, or driver tempo.", ["private", "adult"]),
    priv("junior-30", "Junior Private", "junior", "30 min · ages 7–17", 30, [55, 75], "Thirty minutes is the right attention span for most juniors. Clubs available if they need them.", ["private", "junior"], {
        guardrails: { daysOfWeek: [0, 6] },
    }),
    priv("senior-45", "Senior Private", "senior", "45 min · ages 62+", 45, [75, 100], "Built around what still works, not what used to. Weekday mornings, at a gentler pace.", ["private", "senior"], {
        guardrails: { daysOfWeek: [1, 2, 3, 4], timeWindow: { start: 9 * 60, end: 12 * 60 } },
    }),

    /* ---- scheduled Academy programs: fixed instructor, course and roster ---- */
    group({
        id: "clinic-adult-l2",
        name: "Adult Level 2 — Building a Repeatable Swing",
        audience: "adult",
        coachId: "mike-kenny",
        courseSlug: "falls-road",
        foxStartIso: "2026-06-25",
        pattern: "weekly",
        time: "6:00 PM – 7:00 PM",
        sessions: 6,
        durationMin: 60,
        price: 189,
        capacity: 12,
        registered: 9,
        ageGroup: "Adults with some experience",
        desc: "A six-week clinic covering the full swing, short game, and on-course fundamentals. The natural next step after a handful of privates.",
        tags: ["group", "adult"],
        save: "Save 20%",
    }),
    group({
        id: "clinic-scoring",
        name: "Scoring Clinic — 60 Yards and In",
        audience: "adult",
        coachId: "brent-wilkerson",
        courseSlug: "needwood",
        foxStartIso: "2026-06-27",
        pattern: "once",
        time: "9:00 AM – 11:00 AM",
        sessions: 1,
        durationMin: 120,
        price: 65,
        capacity: 16,
        registered: 8,
        ageGroup: "All levels",
        desc: "Two hours inside 60 yards, where the strokes actually are. Wedge matrix, lies, and a short-game test to finish.",
        tags: ["group", "adult"],
    }),
    group({
        id: "clinic-launch-lab",
        name: "Launch Monitor Lab",
        audience: "adult",
        coachId: "mike-dickson",
        courseSlug: "northwest",
        foxStartIso: "2026-06-24",
        pattern: "weekly",
        time: "5:30 PM – 7:00 PM",
        sessions: 4,
        durationMin: 90,
        price: 149,
        capacity: 10,
        registered: 5,
        ageGroup: "Adults",
        desc: "Four weeks on the launch monitor. Numbers first: club path, face angle, spin, and what to actually do about them.",
        tags: ["group", "adult"],
    }),
    group({
        id: "clinic-get-golf-ready",
        name: "Get Golf Ready — Beginner Group",
        audience: "adult",
        coachId: "doug-hamilton",
        courseSlug: "laytonsville",
        foxStartIso: "2026-06-23",
        pattern: "weekly",
        time: "6:00 PM – 7:00 PM",
        sessions: 5,
        durationMin: 60,
        price: 139,
        capacity: 12,
        registered: 8,
        ageGroup: "New golfers",
        desc: "Five weeks from never having held a club to playing nine holes. Clubs provided; the last session is on the course.",
        tags: ["group", "adult"],
        save: "Save 15%",
    }),
    group({
        id: "clinic-junior-first",
        name: "First Swings — Junior Starter",
        audience: "junior",
        coachId: "kate-schanuel",
        courseSlug: "crossvines",
        foxStartIso: "2026-06-20",
        pattern: "weekly",
        time: "10:00 AM – 11:00 AM",
        sessions: 8,
        durationMin: 60,
        price: 129,
        capacity: 14,
        registered: 8,
        ageGroup: "Ages 7–10",
        desc: "Eight Saturday mornings of first swings, games, and etiquette. The front door to the MCG junior pathway.",
        tags: ["group", "junior"],
        save: "Save 25%",
    }),
    group({
        id: "camp-junior-summer",
        name: "Junior Golf Camp — 1 Week",
        audience: "junior",
        coachId: "kate-schanuel",
        courseSlug: "crossvines",
        foxStartIso: "2026-07-13",
        pattern: "daily",
        time: "9:00 AM – 12:00 PM",
        sessions: 5,
        durationMin: 180,
        price: 425,
        capacity: 16,
        registered: 14,
        ageGroup: "Ages 6–12",
        desc: "A week-long day camp — instruction, games, short on-course play, and lunch. Weekly sessions run through the season.",
        tags: ["group", "junior"],
    }),
    group({
        id: "clinic-wedge",
        name: "Wedge Matrix Workshop",
        audience: "adult",
        coachId: "brent-wilkerson",
        courseSlug: "needwood",
        foxStartIso: "2026-06-28",
        pattern: "once",
        time: "1:00 PM – 3:00 PM",
        sessions: 1,
        durationMin: 120,
        price: 75,
        capacity: 12,
        registered: 12,
        ageGroup: "Intermediate and up",
        desc: "Build your own distance chart across three wedges and three swing lengths. You leave with numbers you can trust.",
        tags: ["group", "adult"],
    }),
];

/** Catalog filter chips (Fox Prototype 1/2 catalog). */
export const CATALOG_FILTERS: { id: string; label: string; match: string | null }[] = [
    { id: "all", label: "All", match: null },
    { id: "private", label: "Private lessons", match: "private" },
    { id: "group", label: "Group clinics", match: "group" },
    { id: "junior", label: "Junior", match: "junior" },
    { id: "senior", label: "Senior", match: "senior" },
    { id: "playing", label: "Playing lessons", match: "playing" },
];

export const serviceById = (id: string): LessonService | undefined => LESSON_SERVICES.find((s) => s.id === id);

export const PRIVATE_SERVICES = LESSON_SERVICES.filter((s) => s.kind === "private");
export const GROUP_SERVICES = LESSON_SERVICES.filter((s) => s.kind === "group");

/** Seats left in a scheduled program, or null for a private. */
export const spotsLeft = (service: LessonService): number | null => (service.capacity === undefined ? null : Math.max(0, service.capacity - (service.registered ?? 0)));

/** Services an instructor can teach — every private, plus their own programs. */
export const servicesForCoach = (coachId: string): LessonService[] => LESSON_SERVICES.filter((s) => (s.kind === "private" ? true : s.coachIds?.includes(coachId)));

/** Scheduled programs an instructor runs — shown on their profile. */
export const clinicsForCoach = (coachId: string): LessonService[] => GROUP_SERVICES.filter((s) => s.coachIds?.includes(coachId));

/** Instructors who can teach a service (at a course, when given). Coming Soon instructors are excluded. */
export const coachesForService = (service: LessonService, courseSlug?: string): Coach[] => {
    if (service.kind === "group") return (service.coachIds ?? []).map((id) => coachById(id)).filter((c): c is Coach => !!c);
    return BOOKABLE_COACHES.filter((c) => (courseSlug && courseSlug !== "all" ? c.courseSlugs.includes(courseSlug) : true));
};

/* ---- pricing: the Academy's group-size table, adjusted per instructor ---- */

export const hasOwnPricing = (service: LessonService, coach?: Coach): boolean => Boolean(coach?.priceOverrides?.[service.id]);

/** What a service costs with this instructor at this party size (own table → Academy table + adj). */
export const servicePrice = (service: LessonService, coach?: Coach, players = 1): number => {
    const size = Math.min(players, service.maxPlayers);
    const base = service.priceByPlayers[size] ?? service.basePrice;
    if (service.kind === "group") return base; // programs are priced by the Academy, not the teacher
    const own = coach?.priceOverrides?.[service.id]?.[size];
    if (own !== undefined) return own;
    return base + (coach?.priceAdj ?? 0);
};

export interface GroupSizePrice {
    players: number;
    total: number;
    each: number;
}

/** The full 1…max table for a lesson with an instructor. */
export const groupSizePrices = (service: LessonService, coach?: Coach): GroupSizePrice[] =>
    Array.from({ length: service.maxPlayers - service.minPlayers + 1 }, (_, i) => {
        const players = service.minPlayers + i;
        const total = servicePrice(service, coach, players);
        return { players, total, each: total / players };
    });

export const perPlayer = (service: LessonService, coach: Coach | undefined, players: number): number => servicePrice(service, coach, players) / players;

/** The cheapest lesson with this instructor — "Lessons from $X" on a card. */
export const fromPrice = (coachId: string): number => {
    const coach = coachById(coachId);
    return Math.min(...PRIVATE_SERVICES.map((s) => servicePrice(s, coach, 1)));
};

/** The cheapest instructor for a service — the "from" price on a catalog card. */
export const serviceFromPrice = (service: LessonService, courseSlug?: string): number => {
    if (service.kind === "group") return service.basePrice;
    const coaches = coachesForService(service, courseSlug);
    return coaches.length ? Math.min(...coaches.map((c) => servicePrice(service, c, 1))) : service.basePrice;
};

/** Plain-English summary of a service's guardrails ("Weekends only", "Mon, Tue, Wed, Thu only · 9:00 AM – 12:00 PM"). */
export const guardrailSummary = (service: LessonService): string | null => {
    const g = service.guardrails;
    if (!g) return null;
    const parts: string[] = [];
    if (g.daysOfWeek) {
        const days = g.daysOfWeek.map((d) => WEEKDAYS_SHORT[d]);
        parts.push(days.length === 2 && g.daysOfWeek.every((d) => d === 0 || d === 6) ? "Weekends only" : `${days.join(", ")} only`);
    }
    if (g.timeWindow) parts.push(`${fmtTime(g.timeWindow.start)} – ${fmtTime(g.timeWindow.end)}`);
    if (g.season) parts.push(g.season);
    return parts.length ? parts.join(" · ") : null;
};

/* ------------------------------------------------------------------ */
/* Checkout bits                                                       */
/* ------------------------------------------------------------------ */

/** Sample add-ons (MCG publishes none) — a field at checkout, not a step. */
export interface LessonExtra {
    id: string;
    name: string;
    desc: string;
    price: number;
    /** Added to the lesson's length, where the extra takes time. */
    minutes?: number;
}

export const LESSON_EXTRAS: LessonExtra[] = [
    { id: "range-bucket", name: "Large range bucket", desc: "Warm up before the lesson, or keep hitting what you just learned.", price: 12 },
    { id: "video-review", name: "Swing video review", desc: "Your lesson filmed on the bay, with the instructor's notes on the clip afterwards.", price: 25, minutes: 15 },
    { id: "club-fitting", name: "Club fitting consult", desc: "Fifteen minutes on the launch monitor checking lie, loft and shaft.", price: 40, minutes: 15 },
    { id: "rental-clubs", name: "Rental clubs", desc: "A full set for the lesson, if you're not bringing your own.", price: 15 },
];

/** Facility fee on a private lesson (Fox P3 Square checkout). */
export const FACILITY_FEE = 4;

/** Promo codes accepted at checkout. */
export const PROMOS: Record<string, { type: "percent" | "fixed"; value: number; label: string }> = {
    MCGJUNIOR: { type: "percent", value: 15, label: "Junior Academy — 15% off" },
    WELCOME10: { type: "percent", value: 10, label: "New golfer — 10% off" },
    MCGVET: { type: "fixed", value: 20, label: "Military & first responder — $20 off" },
};

/** The demo golfer — Crane's sample user (never Fox's real contact details). */
export const GOLFER = {
    first: USER.firstName,
    last: USER.lastName,
    initials: `${USER.firstName[0]}${USER.lastName[0]}`,
    email: USER.email,
    phone: USER.phone,
    memberOf: "Montgomery County Golf",
};

/** One golfer on a booking; eligibility answers are collected only when the rules ask. */
export interface Participant extends EligibilityAnswers {
    first: string;
    last: string;
    email: string;
    phone: string;
}

export const EMPTY_PARTICIPANT: Participant = { first: "", last: "", email: "", phone: "" };

export const HOST_PARTICIPANT: Participant = { first: GOLFER.first, last: GOLFER.last, email: GOLFER.email, phone: GOLFER.phone };

/** Sample guests so multi-person stories open with completed cards. */
export const SAMPLE_GUESTS: Participant[] = [
    { first: "Casey", last: "Girard", email: "casey.girard@tenfore.golf", phone: "(240) 555-0142", birthDate: "2015-03-02" },
    { first: "Rowan", last: "Ellis", email: "rowan.ellis@tenfore.golf", phone: "(240) 555-0188", birthDate: "2014-05-19" },
    { first: "Sam", last: "Okafor", email: "sam.okafor@tenfore.golf", phone: "(240) 555-0119", birthDate: "2016-01-08" },
];

export const initialsOf = (p: { first: string; last: string }): string | undefined => (p.first ? `${p.first[0]}${p.last[0] ?? ""}`.toUpperCase() : undefined);

export const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
/** Whole dollars ("$90"), "Free" for 0. */
export const money0 = (n: number) => (n === 0 ? "Free" : `$${Math.round(n)}`);
