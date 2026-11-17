/**
 * Booking model — pure helpers behind `/instruction/book` and `/instruction/review`.
 *
 * ## URL contract (every step deep-links)
 *
 * Private lesson: `/instruction/book?coach=&service=&course=` +
 *
 * | param     | step(s)            | meaning                                                    |
 * | --------- | ------------------ | ---------------------------------------------------------- |
 * | `step`    | all                | `time` (default) · `details` · `account` · `payment` · `confirm` · `waitlist` |
 * | `date`    | time →             | chosen day, ISO (default: the next day with an opening)    |
 * | `time`    | details →          | chosen slot, `HH:MM`                                       |
 * | `players` | details →          | 1–4 golfers                                                |
 * | `extras`  | payment →          | lesson extras, comma ids (`video-review,range-bucket`)     |
 * | `pay`     | confirm            | `credit` · `lesson` · a saved card id (`pm-visa`)          |
 * | `promo`   | payment, confirm   | an applied promo code (`WELCOME10`)                        |
 *
 * Group program (Academy `clinic-*` / `camp-*`, or a county clinic id; `coach` may be `any`):
 * `step` = `sessions` (default) · `details` · `account` · `payment` · `confirm` · `waitlist`,
 * `players` = participants, `sessions` = chosen dates for pick-your-dates clinics, `pay`, `promo`.
 *
 * Choices made *within* a step (a slot, golfer names, a payment row) stay in page state and are
 * written to the URL when the golfer continues — so links stay honest without every tap adding a
 * history entry (and scrolling the page to the top).
 *
 * Review / confirmation: `/instruction/review?coach&service&course&date&time&players` +
 * `step=booked|waitlisted|registered` + `confirmation=<id>` (+ `paid`, `credit=1`, `window`).
 * Without `step` it is the post-lesson "rate your lesson" page (Fox), e.g. `reviewHref(…)`.
 */
import {
    addDays,
    clinicById,
    coachById,
    courseName,
    courseShortName,
    dateOfIso,
    FACILITY_FEE,
    fmtTime,
    INSTRUCTION_TODAY,
    isoOf,
    LESSON_EXTRAS,
    nextAvailable,
    parseTime,
    PROMOS,
    serviceById,
    servicePrice,
    spotsLeft,
    TODAY_ISO,
    withQuery,
    dayFor,
    type Coach,
    type InstructionQuery,
    type LessonExtra,
    type LessonService,
    type RegistrationRules,
} from "../data";
import { coachPhoto } from "../data/roster";

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

export type LessonStep = "time" | "details" | "account" | "payment" | "confirm" | "waitlist";
export type ProgramStep = "sessions" | "details" | "account" | "payment" | "confirm" | "waitlist";

export const LESSON_RAIL: { id: LessonStep; label: string }[] = [
    { id: "time", label: "Date & time" },
    { id: "details", label: "Details" },
    { id: "account", label: "Sign in" },
    { id: "payment", label: "Payment" },
    { id: "confirm", label: "Review" },
];

export const PROGRAM_RAIL: { id: ProgramStep; label: string }[] = [
    { id: "sessions", label: "Sessions" },
    { id: "details", label: "Participants" },
    { id: "account", label: "Sign in" },
    { id: "payment", label: "Payment" },
    { id: "confirm", label: "Review" },
];

const LESSON_STEPS = new Set<string>(["time", "details", "account", "payment", "confirm", "waitlist"]);
const PROGRAM_STEPS = new Set<string>(["sessions", "details", "account", "payment", "confirm", "waitlist"]);

export const lessonStepOf = (step?: string): LessonStep => (step && LESSON_STEPS.has(step) ? (step as LessonStep) : "time");
export const programStepOf = (step?: string): ProgramStep => (step && PROGRAM_STEPS.has(step) ? (step as ProgramStep) : step === "time" ? "sessions" : "sessions");

/* ------------------------------------------------------------------ */
/* Extra params                                                        */
/* ------------------------------------------------------------------ */

const csv = (v?: string) =>
    (v ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

export const extrasOf = (q: InstructionQuery): LessonExtra[] => {
    const ids = csv(q.extra.extras);
    return LESSON_EXTRAS.filter((e) => ids.includes(e.id));
};
export const sessionsParamOf = (q: InstructionQuery): string[] => csv(q.extra.sessions).filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
export const promoOf = (q: InstructionQuery): string | null => {
    const code = q.extra.promo?.trim().toUpperCase();
    return code && PROMOS[code] ? code : null;
};

/** Set / clear extra params without dropping the others. */
export const withExtra = (q: InstructionQuery, patch: Record<string, string | undefined>): Record<string, string> => {
    const next = { ...q.extra };
    for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === "") delete next[k];
        else next[k] = v;
    }
    return next;
};

/* ------------------------------------------------------------------ */
/* Lesson selection                                                    */
/* ------------------------------------------------------------------ */

export const ANY = "any";

/** The course a booking is at: the URL's, else the program's / instructor's first. */
export const courseFor = (q: InstructionQuery, service?: LessonService, coach?: Coach): string =>
    q.courses[0] ?? service?.courseSlug ?? (coach && !coach.isAny ? coach.courseSlugs[0] : undefined) ?? "falls-road";

/** The day the time board opens on: the URL's date, else the next day with an opening (from `from`, else today). */
export const defaultDate = (service: LessonService, coachId: string, course: string, q: InstructionQuery): string => {
    if (q.date && dateOfIso(q.date) >= INSTRUCTION_TODAY) return q.date;
    const from = q.from && dateOfIso(q.from) > INSTRUCTION_TODAY ? dateOfIso(q.from) : INSTRUCTION_TODAY;
    return isoOf(nextAvailable(service, coachId, course, from) ?? from);
};

/** The slot at `time` on a day's board (open or not), or undefined. */
export const slotAt = (service: LessonService, coachId: string, course: string, dateIso: string, time?: string) => {
    if (!time) return undefined;
    const minutes = parseTime(time);
    if (minutes === null) return undefined;
    return dayFor(service, coachId, course, dateOfIso(dateIso)).find((s) => s.minutes === minutes);
};

/** Who teaches the lesson: the chosen instructor, or (any-instructor mode) whoever holds the chosen slot. */
export const teachingCoach = (service: LessonService, coachId: string, course: string, dateIso: string, time?: string): Coach | undefined => {
    if (coachId !== ANY) return coachById(coachId);
    const slot = slotAt(service, coachId, course, dateIso, time);
    return slot?.coachId ? coachById(slot.coachId) : undefined;
};

/** Lesson price for a party: the instructor's, or (no instructor resolved yet) the lowest at the course. */
export const lessonPrice = (service: LessonService, coach: Coach | undefined, players: number) => servicePrice(service, coach, players);

/** "9:30 AM – 10:15 AM" for a slot plus the lesson (and extras') length. */
export const timeRange = (time: string, durationMin: number) => {
    const m = parseTime(time) ?? 0;
    return `${fmtTime(m)} – ${fmtTime(m + durationMin)}`;
};

export const timeLabelOf = (time?: string) => {
    const m = time ? parseTime(time) : null;
    return m === null ? "" : fmtTime(m);
};

/* ------------------------------------------------------------------ */
/* Money                                                               */
/* ------------------------------------------------------------------ */

export interface LessonQuote {
    lesson: number;
    extras: number;
    /** Facility fee on a private lesson — included when a lesson credit pays for it. */
    facilityFee: number;
    facilityWaived: boolean;
    discount: number;
    promoLabel?: string;
    /** The lesson's value, covered by a credit. */
    creditApplied: number;
    total: number;
    /** Charged when the golfer checks in (pay-at-lesson). */
    dueNow: number;
}

/**
 * Totals for a private lesson. A lesson credit covers the lesson; the facility fee is still charged
 * to the card on file, as in Fox (decided Nov 17), so a credit booking with no extras costs $4. Promo codes come off
 * the lesson only and don't combine with a credit.
 */
export const quoteLesson = ({ lesson, extras, promo, pay }: { lesson: number; extras: LessonExtra[]; promo?: string | null; pay: string }): LessonQuote => {
    const useCredit = pay === "credit";
    const extrasTotal = extras.reduce((n, e) => n + e.price, 0);
    const rule = !useCredit && promo ? PROMOS[promo] : undefined;
    const discount = rule ? (rule.type === "percent" ? Math.round(lesson * rule.value) / 100 : Math.min(rule.value, lesson)) : 0;
    const facilityFee = FACILITY_FEE; // Charged even when a credit pays, as in Fox (Nov 17 decision).
    const creditApplied = useCredit ? lesson : 0;
    const total = Math.max(0, lesson - creditApplied - discount) + extrasTotal + facilityFee;
    return {
        lesson,
        extras: extrasTotal,
        facilityFee,
        facilityWaived: false,
        discount,
        promoLabel: rule?.label,
        creditApplied,
        total,
        dueNow: total, // always charged at booking (Nov 17: no golfer-facing pay-at-lesson)
    };
};

/* ------------------------------------------------------------------ */
/* Group programs — Academy programs and county clinics, one shape     */
/* ------------------------------------------------------------------ */

export interface BookableProgram {
    id: string;
    source: "academy" | "county";
    name: string;
    desc: string;
    /** Roster id (Academy programs only). */
    coachId?: string;
    instructorName: string;
    instructorTitle?: string;
    instructorInitials: string;
    photo?: string | null;
    courseSlug: string;
    location: string;
    schedule: string;
    /** "6:00 PM – 7:00 PM". */
    time: string;
    sessionDates: string[];
    /** Price for one participant: the whole program, or one session when `perSession`. */
    price: number;
    priceUnit: string;
    /** Sold a session at a time — the golfer picks dates. */
    perSession: boolean;
    capacity: number;
    registered: number;
    spotsLeft: number;
    rules?: RegistrationRules;
    image?: string;
    banner?: string;
    ageGroup?: string;
    bring: string[];
    provided: string[];
    /** Fox P3 sample format MCG doesn't run yet. */
    sample?: boolean;
}

const ACADEMY_BRING = ["Your own clubs (or ask the shop for a loaner set)", "Golf shoes or flat-soled trainers", "Water and a light layer for evening sessions"];

/** A group program by id — an Academy `LessonService` of kind `group`, or a county clinic. */
export const programFor = (id: string): BookableProgram | undefined => {
    const service = serviceById(id);
    if (service && service.kind === "group") {
        const coach = coachById(service.coachIds?.[0] ?? "");
        const slug = service.courseSlug ?? coach?.courseSlugs[0] ?? "falls-road";
        const capacity = service.capacity ?? 12;
        const registered = service.registered ?? 0;
        return {
            id: service.id,
            source: "academy",
            name: service.name,
            desc: service.desc,
            coachId: coach?.id,
            instructorName: coach ? (coach.credential ? `${coach.name}, ${coach.credential}` : coach.name) : "MCG Academy",
            instructorTitle: coach?.title,
            instructorInitials: coach?.initials ?? "MA",
            photo: coach ? coachPhoto(coach) : null,
            courseSlug: slug,
            location: `${courseName(slug)} · Academy lesson tee`,
            schedule: service.schedule ?? service.meta,
            time: service.time ?? "",
            sessionDates: service.sessionDates ?? [],
            price: service.basePrice,
            priceUnit: service.sessions && service.sessions > 1 ? `for all ${service.sessions} sessions` : "per person",
            perSession: false,
            capacity,
            registered,
            spotsLeft: spotsLeft(service) ?? 0,
            rules: service.rules,
            image: service.image,
            banner: service.banner,
            ageGroup: service.ageGroup,
            bring: ACADEMY_BRING,
            provided: [service.rules?.equipmentProvided ? "Clubs for every participant" : null, "Range balls for every session", "Written notes after the last session"].filter(
                (x): x is string => !!x,
            ),
        };
    }
    const clinic = clinicById(id);
    if (clinic) {
        return {
            id: clinic.id,
            source: "county",
            name: clinic.title,
            desc: clinic.description,
            instructorName: clinic.instructor.name,
            instructorTitle: clinic.instructor.title,
            instructorInitials: clinic.instructor.initials,
            photo: null,
            courseSlug: clinic.courseSlug,
            location: clinic.location,
            schedule: clinic.schedule,
            time: clinic.time,
            sessionDates: clinic.sessionDates,
            price: clinic.perSession?.price ?? clinic.price,
            priceUnit: clinic.priceUnit,
            perSession: !!clinic.perSession,
            capacity: clinic.capacity,
            registered: clinic.registered,
            spotsLeft: Math.max(0, clinic.capacity - clinic.registered),
            rules: clinic.rules,
            image: clinic.image,
            banner: clinic.banner,
            ageGroup: clinic.audience,
            bring: clinic.bring,
            provided: clinic.provided,
            sample: clinic.sample,
        };
    }
    return undefined;
};

/** Sessions from today on (a program already under way can still be joined for what's left). */
export const upcomingSessions = (p: BookableProgram) => p.sessionDates.filter((d) => d >= TODAY_ISO);

export interface ProgramQuote {
    unit: number;
    /** Sessions charged per participant (1 for a whole-program price). */
    sessions: number;
    participants: number;
    subtotal: number;
    multiBuyDiscount: number;
    discount: number;
    promoLabel?: string;
    total: number;
}

export const quoteProgram = (p: BookableProgram, participants: number, chosenSessions: number, promo?: string | null): ProgramQuote => {
    const sessions = p.perSession ? chosenSessions : 1;
    const subtotal = p.price * sessions * participants;
    const mb = p.rules?.multiBuy;
    const multiBuyDiscount = mb && p.perSession && sessions >= mb.buy ? Math.round(subtotal * mb.percentOff) / 100 : 0;
    const rule = promo ? PROMOS[promo] : undefined;
    const afterMb = subtotal - multiBuyDiscount;
    const discount = rule ? (rule.type === "percent" ? Math.round(afterMb * rule.value) / 100 : Math.min(rule.value, afterMb)) : 0;
    return {
        unit: p.price,
        sessions,
        participants,
        subtotal,
        multiBuyDiscount,
        discount,
        promoLabel: rule?.label,
        total: Math.max(0, afterMb - discount),
    };
};

/* ------------------------------------------------------------------ */
/* Confirmation links                                                  */
/* ------------------------------------------------------------------ */

export type ConfirmationKind = "booked" | "waitlisted" | "registered";

export const confirmationHref = (
    kind: ConfirmationKind,
    sel: {
        coach?: string;
        service: string;
        course?: string;
        date?: string;
        time?: string;
        players?: number;
    },
    extra: Record<string, string | undefined>,
) =>
    withQuery("/instruction/review", {
        coach: sel.coach,
        service: sel.service,
        courses: sel.course ? [sel.course] : [],
        date: sel.date,
        time: sel.time,
        players: sel.players,
        step: kind,
        extra: Object.fromEntries(Object.entries(extra).filter((e): e is [string, string] => !!e[1])),
    });

/** "Sat, Oct 10 – Sat, Nov 7" style window label for a waitlist request. */
export const waitlistWindowLabel = ({ from, to, dayparts, days }: { from: string; to: string; dayparts: string[]; days: number[] }) => {
    const md = (iso: string) =>
        dateOfIso(iso).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    const range = to ? `${md(from)} – ${md(to)}` : `From ${md(from)}`;
    const parts =
        dayparts.includes("any") || dayparts.length === 0
            ? "any time"
            : dayparts
                  .map((d) => d[0].toUpperCase() + d.slice(1))
                  .join(", ")
                  .toLowerCase();
    const dayNames =
        days.length === 0
            ? "any day"
            : [...days]
                  .sort()
                  .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
                  .join(", ");
    return `${range} · ${parts} · ${dayNames}`;
};

export const defaultWaitlistTo = (fromIso: string) => isoOf(addDays(dateOfIso(fromIso), 28));

export const shortCourse = courseShortName;

/* ------------------------------------------------------------------ */
/* Sign-in round trip                                                  */
/* ------------------------------------------------------------------ */

const DRAFT_PREFIX = "crane-mcg-booking-draft:";

/**
 * What a golfer typed that the URL doesn't carry (guest names, birth dates, answers, the note). Saved
 * only when they leave for the full sign-in page, and read back once when the booking reopens, so the
 * round trip loses nothing (decided Nov 17). Keyed by service + coach.
 */
export const saveBookingDraft = (key: string, draft: unknown) => {
    try {
        sessionStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(draft));
    } catch {
        /* storage blocked: the URL still carries date, time, players and extras */
    }
};

/** The saved draft for `key`, if any. Call from a state initializer; then `clearBookingDraft` in an effect. */
export const readBookingDraft = <T>(key: string): Partial<T> | undefined => {
    try {
        const raw = sessionStorage.getItem(DRAFT_PREFIX + key);
        return raw ? (JSON.parse(raw) as Partial<T>) : undefined;
    } catch {
        return undefined;
    }
};

export const clearBookingDraft = (key: string) => {
    try {
        sessionStorage.removeItem(DRAFT_PREFIX + key);
    } catch {
        /* nothing to clear */
    }
};
