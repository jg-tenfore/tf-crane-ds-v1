/**
 * Tee-time data for Crane Web. Builds a full day's tee sheet per course + date on top of the
 * mobile app's data (`teeSheet`, `TODAY`, `BOOKING_NOTICE`), so the 8:54–10:33 AM times on
 * today's sheet match the iPhone tee sheet exactly.
 */
import { buildDays } from "@/components/navigation/date-strip";
import { BOOKINGS, BUDDIES, TODAY, USER, courseById, currency, teeSheet, type Booking, type Course } from "@/data/crane";

export type Period = "morning" | "afternoon" | "twilight";
export type Transport = "walking" | "cart";

export const PERIODS: { id: Period; label: string; range: string }[] = [
    { id: "morning", label: "Morning", range: "Before 12 PM" },
    { id: "afternoon", label: "Afternoon", range: "12 – 3 PM" },
    { id: "twilight", label: "Twilight", range: "After 3 PM" },
];

export interface WebTeeTime {
    /** Unique within a course + day: "0854", or "1712-lakes" when twilight nines run in parallel. */
    id: string;
    minutes: number;
    time: string;
    period: Period;
    holes: 9 | 18;
    /** Which nine / course the round plays: "Back 9", or "Lakes" / "Lakes → Woods" on multi-course clubs. */
    course?: string;
    /** The starting course on a multi-course club (filter key). */
    startCourse?: string;
    /** Per-player green fee for this round. */
    price: number;
    /** Open spots (0 = FULL). */
    spots: number;
    reserved?: number;
}

/* ---------- Clubs ---------- */

export interface ClubLayout {
    /** Separate courses (nines) bookable on their own, e.g. Grand View's Lakes / Woods / Marsh. */
    courses?: string[];
    /** Label for a single-18 club's standalone nine ("Back 9"). */
    nine: string;
}

/** Grand View Lodge's Pines plays three nines; everyone else is a single 18 bookable as the back nine. */
const LAYOUTS: Record<string, ClubLayout> = {
    "grand-view": { nine: "9 Holes", courses: ["Lakes", "Woods", "Marsh"] },
};
export const clubLayout = (course: Course): ClubLayout => LAYOUTS[course.id] ?? { nine: "Back 9" };

/* ---------- Dates ---------- */

/** The date strip: a 7-day booking window, today through the same weekday next week minus one. */
export const WINDOW_DAYS = 7;
export const DAYS = buildDays(TODAY, WINDOW_DAYS);
export const TODAY_ID = DAYS[0].id;

/** Advance booking: some courses open their tee sheet ~3 months out (past the 7-day strip). */
export const ADVANCE_DAYS = 92;
const ADVANCE = buildDays(TODAY, ADVANCE_DAYS);
const ADVANCE_COURSES = new Set(["sagamore-spring", "sagamore-hampton", "grand-view", "woodstock"]);
/** How many days ahead this course takes bookings (7, or ~3 months for advance-booking courses). */
export const bookingWindow = (course: Course) => (ADVANCE_COURSES.has(course.id) ? ADVANCE_DAYS : WINDOW_DAYS);
/** Every bookable day for a course, today first. */
export const bookableDays = (course: Course) => (bookingWindow(course) > WINDOW_DAYS ? ADVANCE : DAYS);
/** Last bookable day for a course. */
export const lastBookableDay = (course: Course) => bookableDays(course)[bookableDays(course).length - 1].id;
/** True when the day is past the 7-day strip (picked from "More dates"). */
export const isBeyondStrip = (id: string) => !DAYS.some((d) => d.id === id);
export const dateOf = (id: string) => new Date(`${id}T12:00:00`);
export const isWeekend = (id: string) => [0, 6].includes(dateOf(id).getDay());
export const dayType = (id: string) => (isWeekend(id) ? "Weekend" : "Weekday");
export const fmtDay = (id: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) => dateOf(id).toLocaleDateString("en-US", opts);
export const fmtLongDay = (id: string) => fmtDay(id, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
/** In the booking window — the course's when given, otherwise the longest (advance) window. */
export const isBookable = (id: string, course?: Course) => (course ? bookableDays(course) : ADVANCE).some((d) => d.id === id);
/** Days from today (0 = today). */
const dayIndex = (id: string) => Math.max(0, Math.round((dateOf(id).getTime() - dateOf(TODAY_ID).getTime()) / 86_400_000));

/** One closed day in the window, so the "no times" state is reachable by clicking. */
export const CLOSED_DAY = DAYS[5].id; // Wed, Oct 14
export const closureFor = (_course: Course, id: string): { title: string; body: string } | null =>
    id === CLOSED_DAY
        ? { title: "Course closed for fall aerification", body: "Greens maintenance is underway, so there are no tee times on this day. Pick another date to keep booking." }
        : null;

/* ---------- Tee sheet ---------- */

const START = 6 * 60 + 48; // 6:48 AM — 8:54 AM lands on the 9-minute grid like the app
const END = 17 * 60 + 57;
const STEP = 9;
const SPOT_PATTERN = [4, 2, 0, 4, 1, 3, 0, 4, 2, 4, 0, 3];

const pad = (n: number) => String(n).padStart(2, "0");
export const timeLabel = (m: number) => {
    const h = Math.floor(m / 60);
    return `${((h + 11) % 12) + 1}:${pad(m % 60)} ${h < 12 ? "AM" : "PM"}`;
};
const periodOf = (m: number): Period => (m < 12 * 60 ? "morning" : m < 15 * 60 ? "afternoon" : "twilight");

/** Golf cars stop two hours before sunset (BOOKING_NOTICE) — sunset ≈ 6:15 PM in October. */
export const CART_CUTOFF = 16 * 60 + 15;
export const CART_FEE = 26;

/** Per-player green fee. Twilight is discounted; weekends cost more. */
export const greenFee = (holes: 9 | 18, minutes: number, dateId: string) => {
    const twilight = periodOf(minutes) === "twilight";
    const base = holes === 18 ? (twilight ? 38 : 53) : twilight ? 24 : 30;
    return isWeekend(dateId) ? base + (holes === 18 ? 12 : 6) : base;
};

/** 18-hole play is required before 1 PM on weekends & holidays (BOOKING_NOTICE). */
export const eighteenOnly = (minutes: number, dateId: string) => isWeekend(dateId) && minutes < 13 * 60;

/** A full day's tee sheet for a course. Deterministic per course + date. */
export const teeTimesFor = (course: Course, dateId: string): WebTeeTime[] => {
    if (closureFor(course, dateId)) return [];
    const layout = clubLayout(course);
    const offset = dayIndex(dateId) * 5 + (course.id.length % 4);
    const appSheet = dateId === TODAY_ID ? teeSheet(course) : [];
    const out: WebTeeTime[] = [];

    for (let m = START, i = 0; m <= END; m += STEP, i++) {
        const time = timeLabel(m);
        const app = appSheet.find((t) => t.time === time);
        const spots = app ? app.spots : SPOT_PATTERN[(i + offset) % SPOT_PATTERN.length];
        const reserved = app ? app.reserved : spots > 0 && spots < 4 ? 4 - spots : undefined;
        const period = periodOf(m);
        const id = `${pad(Math.floor(m / 60))}${pad(m % 60)}`;
        const weekendMorning = eighteenOnly(m, dateId);

        if (layout.courses) {
            const cs = layout.courses;
            const start = cs[(i + Math.floor(i / 3)) % cs.length];
            // Twilight: every nine runs in parallel, so each time is offered on all three.
            if (period === "twilight" && m >= 16 * 60) {
                cs.forEach((c, k) => {
                    const s = SPOT_PATTERN[(i + offset + k * 5) % SPOT_PATTERN.length];
                    out.push({ id: `${id}-${c.toLowerCase()}`, minutes: m, time, period, holes: 9, course: c, startCourse: c, price: greenFee(9, m, dateId), spots: s, reserved: s && s < 4 ? 4 - s : undefined });
                });
                continue;
            }
            const nine = !weekendMorning && i % 3 === 1;
            const next = cs[(cs.indexOf(start) + 1) % cs.length];
            out.push({ id, minutes: m, time, period, holes: nine ? 9 : 18, course: nine ? start : `${start} → ${next}`, startCourse: start, price: greenFee(nine ? 9 : 18, m, dateId), spots, reserved });
            continue;
        }

        // Single 18: some rounds are back-nine only (never on weekend mornings), more of them at twilight.
        const nine = !app && !weekendMorning && (period === "twilight" ? i % 2 === 0 : i % 5 === 2);
        const holes = app ? app.holes : nine ? 9 : 18;
        out.push({ id, minutes: m, time, period, holes, course: holes === 9 ? layout.nine : undefined, price: greenFee(holes, m, dateId), spots, reserved });
    }
    return out;
};

export const findTeeTime = (course: Course, dateId: string, id: string) => teeTimesFor(course, dateId).find((t) => t.id === id);

/** Lowest open price on a day (for the date strip), or null when nothing's open. */
export const fromPrice = (course: Course, dateId: string) => {
    const open = teeTimesFor(course, dateId).filter((t) => t.spots > 0);
    return open.length ? Math.min(...open.map((t) => t.price)) : null;
};

/** A sensible default for checkout stories: today's first afternoon time with room for `players`. */
export const defaultTeeTime = (course: Course, dateId: string, players = 1) =>
    teeTimesFor(course, dateId).find((t) => t.period === "afternoon" && t.holes === 18 && t.spots >= Math.max(players, 4)) ?? teeTimesFor(course, dateId).find((t) => t.spots >= players)!;

/** Starts inside the course's 24-hour change/cancellation window. */
export const insideCancelWindow = (dateId: string, minutes: number) => {
    const start = dateOf(dateId);
    start.setHours(Math.floor(minutes / 60), minutes % 60);
    const now = new Date(TODAY);
    now.setHours(9, 0); // prototype "now": 9:00 AM on TODAY
    return start.getTime() - now.getTime() < 24 * 3_600_000;
};

/* ---------- Players ---------- */

export interface Player {
    /** Buddy id, "me", or "guest-N". */
    id: string;
    name: string;
    email?: string;
    handicap?: number;
}

export const ME: Player = { id: "me", name: `${USER.firstName} ${USER.lastName}`, email: USER.email };
export const buddyPlayer = (id: string): Player | undefined => {
    const b = BUDDIES.find((x) => x.id === id);
    return b ? { id: b.id, name: b.name || b.email.split("@")[0], email: b.email, handicap: b.handicap } : undefined;
};
/** Seats 2–4 pre-filled from golf buddies so the 2- and 4-player stories show completed rows. */
export const seedPlayers = (count: number): (Player | null)[] => [ME, ...["u-2", "u-3", "u-4"].map((id, i) => (i + 1 < count ? buddyPlayer(id)! : null))];
export const initials = (name: string) =>
    name
        .split(/[\s.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]!.toUpperCase())
        .join("");

/* ---------- URLs (deep links carry the booking) ---------- */

export const queryOf = (path: string) => new URLSearchParams(path.split("?")[1] ?? "");

export interface CheckoutParams {
    date: string;
    teeTimeId: string;
    players: number;
}
export const checkoutPath = ({ date, teeTimeId, players }: CheckoutParams) => `/tee-times/checkout?d=${date}&t=${teeTimeId}&p=${players}`;

export interface ConfirmedRound {
    id: string;
    /** Course id when it differs from the session's course (rounds at other clubs). */
    courseId?: string;
    date: string;
    teeTimeId: string;
    players: Player[];
    holes: 9 | 18;
    transport: Transport;
}

export const confirmationPath = (r: Omit<ConfirmedRound, "id"> & { id?: string }) => {
    const id = r.id ?? String(421_292_100 + ((r.date.charCodeAt(9) * 97 + Number(r.teeTimeId.slice(0, 4))) % 900));
    const q = new URLSearchParams({ d: r.date, t: r.teeTimeId, h: String(r.holes), tr: r.transport, g: r.players.map((p) => p.id + ":" + p.name).join("|") });
    return `/tee-times/confirmation/${id}?${q.toString()}`;
};

export const parseConfirmation = (id: string, path: string, course: Course): ConfirmedRound => {
    const q = queryOf(path);
    const date = q.get("d") ?? TODAY_ID;
    const c = q.get("c") ? courseById(q.get("c")!) : course;
    const t = q.get("t") ?? defaultTeeTime(c, date, 2).id;
    const players = (q.get("g") ?? "")
        .split("|")
        .filter(Boolean)
        .map((s) => {
            const [pid, ...rest] = s.split(":");
            return buddyPlayer(pid) ?? (pid === "me" ? ME : { id: pid, name: rest.join(":") });
        });
    return {
        id,
        courseId: q.get("c") ?? undefined,
        date,
        teeTimeId: t,
        players: players.length ? players : seedPlayers(Math.min(4, Math.max(1, Number(q.get("n")) || 2))).filter((p): p is Player => !!p),
        holes: q.get("h") === "9" ? 9 : 18,
        transport: q.get("tr") === "cart" ? "cart" : "walking",
    };
};

/* ---------- Pricing ---------- */

export const priceRound = (t: WebTeeTime, dateId: string, players: number, holes: 9 | 18, transport: Transport) => {
    const fee = holes === t.holes ? t.price : greenFee(holes, t.minutes, dateId);
    const cart = transport === "cart" ? CART_FEE : 0;
    return { fee, cart, total: (fee + cart) * players };
};
export { currency };

/* ---------- My Rounds ---------- */

export interface WebRound extends Booking {
    transport?: Transport;
    total?: number;
    confirmation?: string;
    teeTimeId?: string;
}

/** The app's bookings plus a little more history so Past isn't a single row. */
export const SAMPLE_ROUNDS: WebRound[] = [
    { ...BOOKINGS[0], transport: "walking", total: 53, confirmation: "421292164", teeTimeId: "0903" },
    { id: "b-3", course: courseById("sagamore-spring"), date: new Date(2026, 9, 17), time: "8:00 AM", players: 4, holes: 18, status: "upcoming", transport: "cart", total: 404, confirmation: "421292188", teeTimeId: "0800" },
    { ...BOOKINGS[1], transport: "walking", total: 68, confirmation: "421180311", teeTimeId: "1436" },
    { id: "b-4", course: courseById("sagamore-spring"), date: new Date(2026, 8, 19), time: "4:24 PM", players: 2, holes: 9, status: "past", transport: "walking", total: 48, confirmation: "421244907", teeTimeId: "1624" },
    { id: "b-5", course: courseById("melody-hill"), date: new Date(2026, 7, 2), time: "10:06 AM", players: 3, holes: 18, status: "past", transport: "cart", total: 237, confirmation: "421150472", teeTimeId: "1006" },
];

export const playersLabel = (n: number) => `${n} ${n === 1 ? "Player" : "Players"}`;
