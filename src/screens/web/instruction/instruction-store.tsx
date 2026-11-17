import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CREDIT_BALANCES, CREDIT_TERM, expiryIfBoughtToday, packageById, type CreditBalance } from "./data/packages";

/**
 * Session state for Instruction — what a golfer did while clicking through the prototype:
 * lessons booked, waitlist requests, programs registered for, packs bought and credits spent.
 * Mounted above the router (in `CraneWebRoutes`), like `TeeTimeRoundsProvider`, so it survives
 * navigation; "Start over" in the prototype remounts it.
 *
 * Booking (pro-book-routes) writes `bookLesson` / `joinWaitlist` / `registerProgram` and spends
 * credits; Packages & credits (packages-routes) writes `buyPack` and reads `balances`.
 */

export interface BookedLesson {
    /** Confirmation number shown on the review page, e.g. "MCG-48213". */
    id: string;
    coachId: string;
    serviceId: string;
    courseSlug: string;
    /** ISO date (yyyy-mm-dd) and "8:00 AM" style time. */
    date: string;
    time: string;
    players: number;
    /** What was charged (0 when paid with a credit). */
    total: number;
    /** Paid with a lesson credit from this balance. */
    creditBalanceId?: string;
    bookedOn: string;
}

export interface WaitlistEntry {
    id: string;
    coachId?: string;
    serviceId: string;
    courseSlug?: string;
    /** Window the golfer asked for, e.g. "Weekday evenings" or a specific date. */
    window: string;
}

export interface ProgramRegistration {
    id: string;
    /** Group program / county clinic id. */
    serviceId: string;
    participants: number;
    total: number;
    waitlisted: boolean;
}

interface InstructionStore {
    lessons: BookedLesson[];
    waitlist: WaitlistEntry[];
    programs: ProgramRegistration[];
    /** Credit wallet, starting from the sample balances. */
    balances: CreditBalance[];
    bookLesson: (lesson: Omit<BookedLesson, "id" | "bookedOn">) => BookedLesson;
    cancelLesson: (id: string) => void;
    joinWaitlist: (entry: Omit<WaitlistEntry, "id">) => WaitlistEntry;
    leaveWaitlist: (id: string) => void;
    registerProgram: (reg: Omit<ProgramRegistration, "id">) => ProgramRegistration;
    /** Adds a fresh balance for a pack; returns it. */
    buyPack: (packageId: string) => CreditBalance | undefined;
    /** Spends one credit from a balance (no-op when empty). */
    spendCredit: (balanceId: string, label: string, value: number) => void;
    lessonById: (id: string) => BookedLesson | undefined;
    /** Instructor ids the golfer saved (the heart on a profile). Kept across reloads. */
    savedInstructors: string[];
    toggleSavedInstructor: (id: string) => void;
}

const SAVED_KEY = "crane-mcg-saved-instructors";
const readSaved = (): string[] => {
    try {
        const v = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
        return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
    } catch {
        return [];
    }
};

const TODAY_LABEL = "Oct 9, 2026";
const confirmation = (prefix: string) => `${prefix}-${Math.floor(10000 + Math.random() * 89999)}`;

const Ctx = createContext<InstructionStore | null>(null);

export const InstructionStoreProvider = ({ children, initialBalances = CREDIT_BALANCES }: { children: ReactNode; initialBalances?: CreditBalance[] }) => {
    const [lessons, setLessons] = useState<BookedLesson[]>([]);
    const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
    const [programs, setPrograms] = useState<ProgramRegistration[]>([]);
    const [balances, setBalances] = useState<CreditBalance[]>(initialBalances);
    const [savedInstructors, setSavedInstructors] = useState<string[]>(readSaved);
    const toggleSavedInstructor = useCallback((id: string) => {
        setSavedInstructors((xs) => {
            const next = xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id];
            try {
                localStorage.setItem(SAVED_KEY, JSON.stringify(next));
            } catch {
                /* private mode: keep it in memory */
            }
            return next;
        });
    }, []);

    const bookLesson = useCallback((l: Omit<BookedLesson, "id" | "bookedOn">) => {
        const lesson = { ...l, id: confirmation("MCG"), bookedOn: TODAY_LABEL };
        setLessons((xs) => [...xs, lesson]);
        return lesson;
    }, []);
    const cancelLesson = useCallback((id: string) => setLessons((xs) => xs.filter((x) => x.id !== id)), []);
    const joinWaitlist = useCallback((e: Omit<WaitlistEntry, "id">) => {
        const entry = { ...e, id: confirmation("WL") };
        setWaitlist((xs) => [...xs, entry]);
        return entry;
    }, []);
    const leaveWaitlist = useCallback((id: string) => setWaitlist((xs) => xs.filter((x) => x.id !== id)), []);
    const registerProgram = useCallback((r: Omit<ProgramRegistration, "id">) => {
        const reg = { ...r, id: confirmation("REG") };
        setPrograms((xs) => [...xs, reg]);
        return reg;
    }, []);
    const buyPack = useCallback((packageId: string) => {
        const pack = packageById(packageId);
        if (!pack) return undefined;
        const balance: CreditBalance = {
            id: confirmation("bal"),
            packageId,
            coachId: pack.coachId,
            creditsTotal: pack.credits,
            creditsRemaining: pack.credits,
            valueRemaining: pack.price,
            purchasedOn: TODAY_LABEL,
            expiresOn: pack.expiration === CREDIT_TERM ? expiryIfBoughtToday() : undefined,
            history: [],
        };
        setBalances((bs) => [balance, ...bs]);
        return balance;
    }, []);
    const spendCredit = useCallback((balanceId: string, label: string, value: number) => {
        setBalances((bs) =>
            bs.map((b) =>
                b.id === balanceId && b.creditsRemaining > 0
                    ? { ...b, creditsRemaining: b.creditsRemaining - 1, valueRemaining: Math.max(0, b.valueRemaining - value), history: [...b.history, { date: TODAY_LABEL, label, valueRelieved: value }] }
                    : b,
            ),
        );
    }, []);

    const value = useMemo<InstructionStore>(
        () => ({ lessons, waitlist, programs, balances, bookLesson, cancelLesson, joinWaitlist, leaveWaitlist, registerProgram, buyPack, spendCredit, lessonById: (id) => lessons.find((l) => l.id === id), savedInstructors, toggleSavedInstructor }),
        [lessons, waitlist, programs, balances, bookLesson, cancelLesson, joinWaitlist, leaveWaitlist, registerProgram, buyPack, spendCredit, savedInstructors, toggleSavedInstructor],
    );
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

/** Works without a provider too (stories that render one screen): falls back to a fresh store-less view. */
const noop = () => undefined;
const fallback: InstructionStore = {
    lessons: [],
    waitlist: [],
    programs: [],
    balances: CREDIT_BALANCES,
    bookLesson: (l) => ({ ...l, id: "MCG-48213", bookedOn: TODAY_LABEL }),
    cancelLesson: noop,
    joinWaitlist: (e) => ({ ...e, id: "WL-10421" }),
    leaveWaitlist: noop,
    registerProgram: (r) => ({ ...r, id: "REG-20931" }),
    buyPack: () => undefined,
    spendCredit: noop,
    lessonById: () => undefined,
    savedInstructors: [],
    toggleSavedInstructor: noop,
};
export const useInstructionStore = () => useContext(Ctx) ?? fallback;
