/**
 * Dates for the Instruction sample data.
 *
 * Fox Prototype 3 was dated around **Fri Jun 19, 2026** (its "today"). Crane's sample today is
 * `TODAY` in src/data/crane.ts (**Fri Oct 9, 2026**). Every Fox date is shifted forward by the
 * whole number of weeks between the two (`REBASE_DAYS`, 112 = 16 weeks today), so programs stay
 * upcoming and keep their weekday and time — a "Thursdays 6:00 PM" clinic is still on Thursdays.
 * If Crane's TODAY moves, the shift follows automatically.
 *
 * All ISO strings are `YYYY-MM-DD` in local time (no time zone shifts).
 */
import { TODAY } from "@/data/crane";

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (n: number) => String(n).padStart(2, "0");

export const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const dateOfIso = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
};
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const sameDay = (a: Date, b: Date) => isoOf(a) === isoOf(b);
/** The Sunday that starts `d`'s week. */
export const weekStart = (d: Date) => addDays(d, -d.getDay());

/** Crane's sample "today" (Fri Oct 9, 2026). */
export const INSTRUCTION_TODAY = startOfDay(TODAY);
export const TODAY_ISO = isoOf(INSTRUCTION_TODAY);
export const isPast = (d: Date) => startOfDay(d) < INSTRUCTION_TODAY;

/** Fox Prototype 3's "today" for Instruction (offerings, booking). */
export const FOX_TODAY_ISO = "2026-06-19";
/** Fox's events catalog (county clinics) had its own "today", a week earlier (also a Friday). */
export const FOX_EVENTS_TODAY_ISO = "2026-06-12";
/** Whole weeks between a Fox "today" and Crane's, in days — so weekdays line up. */
export const rebaseDaysFrom = (foxTodayIso: string) => Math.round((INSTRUCTION_TODAY.getTime() - dateOfIso(foxTodayIso).getTime()) / (7 * 86_400_000)) * 7;
/** 112 (16 weeks) with today's dates. */
export const REBASE_DAYS = rebaseDaysFrom(FOX_TODAY_ISO);
/** A Fox Prototype 3 date, moved into Crane's calendar (same weekday), relative to the source's own "today". */
export const rebaseIso = (foxIso: string, foxTodayIso: string = FOX_TODAY_ISO) => isoOf(addDays(dateOfIso(foxIso), rebaseDaysFrom(foxTodayIso)));

/** "Sat, Oct 10, 2026". */
export const fmtDate = (iso: string) => {
    const d = dateOfIso(iso);
    return `${WEEKDAYS_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};
/** "Sat, Oct 10". */
export const fmtDateShort = (iso: string) => {
    const d = dateOfIso(iso);
    return `${WEEKDAYS_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
};
/** "Oct 10". */
export const fmtMonthDay = (iso: string) => {
    const d = dateOfIso(iso);
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
};

/** Minutes since midnight → "6:00 PM". */
export const fmtTime = (minutes: number) => {
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const h = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h}:${pad(m)} ${h24 < 12 ? "AM" : "PM"}`;
};

/** "18:30" / "1830" / "6:30pm" → minutes since midnight, or null. */
export const parseTime = (s: string): number | null => {
    const m = /^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/i.exec(s.trim());
    if (!m) return null;
    let h = Number(m[1]);
    const min = Number(m[2] ?? 0);
    const ap = m[3]?.toLowerCase();
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    if (h > 23 || min > 59) return null;
    return h * 60 + min;
};

/** Minutes since midnight → "18:30" (the URL form). */
export const timeParam = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/* ---------- Program runs: the schedule of a group program, from its first session ---------- */

/**
 * How a scheduled program meets: `weekly` (same weekday each week), `daily` (consecutive days,
 * e.g. a Mon–Thu camp) or `once` (a single session).
 */
export type RunPattern = "weekly" | "daily" | "once";

/** Every session date (ISO) of a program. */
export const sessionDates = (startIso: string, sessions: number, pattern: RunPattern): string[] =>
    Array.from({ length: Math.max(1, sessions) }, (_, i) => isoOf(addDays(dateOfIso(startIso), pattern === "daily" ? i : i * 7)));

/** Weekdays (0 = Sunday) a program meets on, sorted. */
export const runDays = (startIso: string, sessions: number, pattern: RunPattern): number[] =>
    [...new Set(sessionDates(startIso, sessions, pattern).map((iso) => dateOfIso(iso).getDay()))].sort();
