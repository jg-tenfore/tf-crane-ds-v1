/**
 * Lesson availability — the time board behind private-lesson booking. Ported from Fox
 * Prototype 3 (`instruction-3/instruction-catalog.ts` availability + `square-booking.tsx` dates).
 *
 * An instructor's day at a course runs 8:00 AM – 6:00 PM on 30-minute centres. Each slot is
 * `open`, `booked` (someone has it) or `blocked` (unavailable: lunch, or outside a lesson's
 * guardrails). It is deterministic per (coach, course, date) — a hash, not random — so every
 * story and deep link renders the same board. Premier-rate instructors are busier.
 *
 * "Any available instructor" merges every pro at the course onto one board, each open slot
 * tagged with whoever is free — so a golfer can pick a time before a person.
 */
import { addDays, fmtTime, INSTRUCTION_TODAY, isoOf, isPast } from "./dates";
import { coachById, coachesAtCourse, serviceById, type LessonService } from "./catalog";
import { courseShortName } from "./roster";

export interface Slot {
    /** Minutes since midnight. */
    minutes: number;
    label: string;
    status: "open" | "booked" | "blocked";
    /** Why it's blocked, when shown ("Unavailable", "Not offered"). */
    blockedReason?: string;
    /** Which instructor this slot belongs to (set when resolving "any instructor"). */
    coachId?: string;
}

export const slotLabel = fmtTime;

/** Stable pseudo-random in [0, 1) from a string (FNV-1a). */
const hash = (s: string) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
};

export const DAY_START = 8 * 60;
export const DAY_END = 18 * 60;
export const SLOT_STEP = 30;

/** One instructor's working day at one course. `fullyBooked` forces the "nothing open" state. */
export const coachDay = (coachId: string, courseSlug: string, date: Date, opts?: { fullyBooked?: boolean }): Slot[] => {
    const coach = coachById(coachId);
    const adj = coach?.priceAdj ?? 0;
    const density = opts?.fullyBooked ? 1 : adj > 0 ? 0.62 : adj === 0 ? 0.45 : 0.26;
    const key = `${coachId}|${courseSlug}|${isoOf(date)}`;
    const slots: Slot[] = [];
    for (let minutes = DAY_START; minutes <= DAY_END; minutes += SLOT_STEP) {
        // A midday hour held for lunch — shown as blocked, not hidden.
        if (minutes === 12 * 60 || minutes === 12 * 60 + 30) {
            slots.push({ minutes, label: fmtTime(minutes), status: "blocked", blockedReason: "Unavailable", coachId });
            continue;
        }
        slots.push({ minutes, label: fmtTime(minutes), status: hash(`${key}|${minutes}`) < density ? "booked" : "open", coachId });
    }
    return slots;
};

/** Every bookable pro at the course merged onto one board (the "any instructor" day). */
export const anyInstructorDay = (courseSlug: string, date: Date): Slot[] => {
    const byMinute = new Map<number, Slot>();
    for (const pro of coachesAtCourse(courseSlug).filter((c) => !c.comingSoon)) {
        for (const slot of coachDay(pro.id, courseSlug, date)) {
            const existing = byMinute.get(slot.minutes);
            if (!existing || (existing.status !== "open" && slot.status === "open")) byMinute.set(slot.minutes, slot);
        }
    }
    return [...byMinute.values()].sort((a, b) => a.minutes - b.minutes);
};

/** Apply a service's guardrails — anything outside them stops being bookable. */
export const applyGuardrails = (slots: Slot[], service: LessonService, date: Date): Slot[] => {
    const g = service.guardrails;
    if (!g) return slots;
    const dayOk = !g.daysOfWeek || g.daysOfWeek.includes(date.getDay());
    return slots.map((s) => {
        const timeOk = !g.timeWindow || (s.minutes >= g.timeWindow.start && s.minutes < g.timeWindow.end);
        return !dayOk || !timeOk ? { ...s, status: "blocked" as const, blockedReason: "Not offered" } : s;
    });
};

/** The bookable board for a day: one instructor (`coachId`) or `"any"`, with the service's guardrails applied. */
export const dayFor = (service: LessonService, coachId: string, courseSlug: string, date: Date): Slot[] => {
    const raw = coachId === "any" ? anyInstructorDay(courseSlug, date) : coachDay(coachId, courseSlug, date);
    return applyGuardrails(raw, service, date);
};

/** Is anything open that day (never in the past)? */
export const openOn = (service: LessonService, coachId: string, courseSlug: string, date: Date) => !isPast(date) && dayFor(service, coachId, courseSlug, date).some((s) => s.status === "open");

/** The next day from `from` (inclusive) with an open slot, within eight weeks, or null. */
export const nextAvailable = (service: LessonService, coachId: string, courseSlug: string, from: Date = INSTRUCTION_TODAY): Date | null => {
    for (let i = 0; i < 56; i++) {
        const d = addDays(from, i);
        if (openOn(service, coachId, courseSlug, d)) return d;
    }
    return null;
};

/** "9:30 AM · Falls Road" — the next open slot for a coach on a date, across their courses. */
export const nextOpening = (coachId: string, date: Date = INSTRUCTION_TODAY): string => {
    const coach = coachById(coachId);
    if (!coach) return "—";
    for (const slug of coach.courseSlugs) {
        const open = coachDay(coachId, slug, date).find((s) => s.status === "open");
        if (open) return `${open.label} · ${courseShortName(slug)}`;
    }
    return "No openings today";
};

/** Does a private lesson have any opening that fits (course list, weekdays, date range)? Fox's one-step-search check. */
export const serviceHasOpening = (serviceId: string, courses: string[], days: number[], from?: Date, to?: Date): boolean => {
    const service = serviceById(serviceId);
    if (!service) return true;
    const start = from && from > INSTRUCTION_TODAY ? from : INSTRUCTION_TODAY;
    const end = to ?? addDays(start, 56);
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        if (days.length && !days.includes(d.getDay())) continue;
        for (const slug of courses) if (dayFor(service, "any", slug, d).some((s) => s.status === "open")) return true;
    }
    return false;
};

/* ---- dayparts: a 20-slot day reads better in three blocks ---- */

export interface Daypart {
    id: "any" | "morning" | "afternoon" | "evening";
    label: string;
    start: number;
    end: number;
}

export const DAYPARTS: Daypart[] = [
    { id: "morning", label: "Morning", start: 0, end: 12 * 60 },
    { id: "afternoon", label: "Afternoon", start: 12 * 60, end: 17 * 60 },
    { id: "evening", label: "Evening", start: 17 * 60, end: 24 * 60 },
];

/** Split a day into Morning / Afternoon / Evening, dropping empty blocks. */
export const byDaypart = (slots: Slot[]): { daypart: Daypart; slots: Slot[] }[] =>
    DAYPARTS.map((daypart) => ({ daypart, slots: slots.filter((s) => s.minutes >= daypart.start && s.minutes < daypart.end) })).filter((g) => g.slots.length > 0);

/** Waitlist preference windows, offered when nothing on the board works. */
export const WAITLIST_WINDOWS: Daypart[] = [{ id: "any", label: "Any time", start: 0, end: 24 * 60 }, ...DAYPARTS];
