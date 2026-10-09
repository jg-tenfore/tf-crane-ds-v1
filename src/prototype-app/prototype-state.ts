import type { CraneTab } from "@/components/prototype/app-shell";
import type { Route } from "@/components/prototype/stack-navigator";
import { BOOKINGS, courseById, type Booking } from "@/data/crane";
import type { AppearanceMode } from "@/screens/profile/appearance-screen";

/**
 * Everything the prototype remembers between reloads. Kept deliberately small and
 * JSON-safe: bookings store a course id + ISO date instead of objects.
 */
export interface PrototypeState {
    signedIn: boolean;
    /** Navigation stack while signed out (Welcome → Sign in …). */
    authStack: Route[];
    tab: CraneTab;
    /** One navigation stack per tab. */
    stacks: Record<CraneTab, Route[]>;
    appearance: AppearanceMode;
    courseId: string;
    savedCourseIds?: string[];
    bookings: Booking[];
    communitySeen: boolean;
}

export const TAB_ROOTS: Record<CraneTab, string> = { home: "home", bookings: "bookings", profile: "profile" };
const TABS = Object.keys(TAB_ROOTS) as CraneTab[];

export const defaultState = (): PrototypeState => ({
    signedIn: false,
    authStack: [{ name: "welcome" }],
    tab: "home",
    stacks: { home: [{ name: "home" }], bookings: [{ name: "bookings" }], profile: [{ name: "profile" }] },
    appearance: "light",
    courseId: "sagamore-hampton",
    bookings: BOOKINGS,
    communitySeen: false,
});

/* ---------- localStorage ---------- */

const KEY = "crane-prototype:v1";

type StoredBooking = Omit<Booking, "course" | "date"> & { courseId: string; date: string };
type Stored = Omit<PrototypeState, "bookings"> & { bookings: StoredBooking[] };

export const saveState = (s: PrototypeState) => {
    try {
        const stored: Stored = {
            ...s,
            bookings: s.bookings.map(({ course, date, ...b }) => ({ ...b, courseId: course.id, date: date.toISOString() })),
        };
        localStorage.setItem(KEY, JSON.stringify(stored));
    } catch {
        // Private mode / storage disabled: the prototype still works, it just won't remember.
    }
};

export const loadState = (): PrototypeState | null => {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const s = JSON.parse(raw) as Stored;
        if (!s || !s.stacks || !Array.isArray(s.bookings)) return null;
        return { ...defaultState(), ...s, bookings: s.bookings.map(({ courseId, date, ...b }) => ({ ...b, course: courseById(courseId), date: new Date(date) })) };
    } catch {
        return null;
    }
};

export const clearState = () => {
    try {
        localStorage.removeItem(KEY);
    } catch {
        /* ignore */
    }
};

/* ---------- URL hash (deep links) ----------
 *   #/auth/welcome/sign-in          signed-out stack
 *   #/profile/edit-profile          tab + its stack (root implied)
 *   #/bookings/tee-time-details:b-2 a route with an `id` param
 */

const encodeRoute = (r: Route) => (typeof r.params?.id === "string" ? `${r.name}:${r.params.id}` : r.name);
const decodeRoute = (seg: string): Route => {
    const [name, id] = decodeURIComponent(seg).split(":");
    return id ? { name, params: { id } } : { name };
};

export const toHash = (s: PrototypeState) =>
    s.signedIn ? `#/${s.tab}/${s.stacks[s.tab].slice(1).map(encodeRoute).join("/")}`.replace(/\/$/, "") : `#/auth/${s.authStack.map(encodeRoute).join("/")}`;

/** Apply a deep link on top of a base state. Unknown hashes leave the state untouched. */
export const applyHash = (base: PrototypeState, hash: string): PrototypeState => {
    const segs = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (!segs.length) return base;
    const [head, ...rest] = segs;
    if (head === "auth") {
        return { ...base, signedIn: false, authStack: (rest.length ? rest : ["welcome"]).map(decodeRoute) };
    }
    if ((TABS as string[]).includes(head)) {
        const tab = head as CraneTab;
        const routes = rest.map(decodeRoute).filter((r) => r.name !== TAB_ROOTS[tab]);
        return { ...base, signedIn: true, tab, stacks: { ...base.stacks, [tab]: [{ name: TAB_ROOTS[tab] }, ...routes] } };
    }
    return base;
};
