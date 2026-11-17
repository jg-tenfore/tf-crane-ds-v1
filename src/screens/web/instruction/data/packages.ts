/**
 * Lesson packs, credits and plans — ported from Fox Prototype 3 (`instruction-3/instruction-catalog.ts`).
 *
 * Three commercial models, all sample data (not real MCG prices):
 *  - **Model A — the credit book** (`LessonPackage`): 5 or 10 lessons with one instructor, bought
 *    up front. Credits land in the golfer's wallet (`CreditBalance`) and pay for a booking at
 *    checkout. "assigned" packs (imported Thrive balances, comps) never appear in the catalog.
 *  - **Model B — volume discount** (`VolumeProgress`): no credit book; every Nth lesson is cheaper.
 *  - **Model C — monthly plan** (`LessonSubscription`): N lessons a month, billed monthly.
 */
import { coachById, serviceById, servicePrice } from "./catalog";
import { INSTRUCTION_TODAY, MONTHS_SHORT } from "./dates";

export interface LessonPackage {
    id: string;
    coachId: string;
    /** The service each credit can be spent on. */
    appliesToServiceId: string;
    label: string;
    credits: number;
    price: number;
    /** Sum of the individual lesson prices, so the saving can be shown. */
    listPrice: number;
    perLessonPrice: number;
    savings: number;
    /** "online" packs are sold in the catalog; "assigned" packs are issued by the Academy only. */
    availability: "online" | "assigned";
    /** The term: CREDIT_TERM ("1 year after purchase"), or "No expiration". The date itself is per purchase. */
    expiration: string;
    transferable: boolean;
    badge?: string;
    howItWorks: string[];
    included: string[];
    restrictions: string[];
}

export interface CreditRelief {
    date: string;
    label: string;
    valueRelieved: number;
}

export interface CreditBalance {
    id: string;
    packageId: string;
    coachId: string;
    creditsTotal: number;
    creditsRemaining: number;
    /** Outstanding liability — what MCG still owes in lessons. */
    valueRemaining: number;
    purchasedOn: string;
    expiresOn?: string;
    history: CreditRelief[];
}

/** Model B — a discount earned by volume. */
export interface VolumeProgress {
    coachId: string;
    serviceId: string;
    lessonsTaken: number;
    lessonsRequired: number;
    /** Fraction off the lesson that follows, e.g. 0.5 = half price. */
    discount: number;
}

/** Model C — a recurring lesson plan (nothing prepaid beyond the current month). */
export interface LessonSubscription {
    id: string;
    coachId: string;
    appliesToServiceId: string;
    label: string;
    lessonsPerMonth: number;
    monthlyPrice: number;
    /** What the same lessons would cost booked one at a time. */
    listMonthly: number;
    renewalNoticeDays: number;
    perks: string[];
    obligations: string[];
}

const to5 = (n: number) => Math.round(n / 5) * 5;

/** A pack on a coach's 45-minute private, priced roughly a lesson short. */
const packFor = (coachId: string, credits: number, discount: number, badge?: string): LessonPackage => {
    const coach = coachById(coachId)!;
    const service = serviceById("private-45")!;
    const unit = servicePrice(service, coach, 1);
    const listPrice = unit * credits;
    const price = to5(listPrice * (1 - discount));
    return {
        id: `${coachId}--pack-${credits}`,
        coachId,
        appliesToServiceId: service.id,
        label: `${credits} × 45-Minute Private`,
        credits,
        price,
        listPrice,
        perLessonPrice: Math.round(price / credits),
        savings: listPrice - price,
        availability: "online",
        expiration: CREDIT_TERM,
        transferable: false,
        badge,
        howItWorks: [
            `Redeem one credit when you book a 45-minute private with ${coach.name}`,
            "Book online, or have your instructor apply a credit at the lesson tee",
            "Credits post to your MCG account immediately after purchase",
            "Your remaining balance shows in your wallet and at checkout",
        ],
        included: [
            `${credits} × 45-minute private lessons with ${coach.name}`,
            "Range balls for the lesson",
            "Written notes and drills after each session",
            ...(credits >= 10 ? ["One complimentary 9-hole playing lesson"] : []),
        ],
        restrictions: [
            "Valid with this instructor only — rates are set per instructor",
            "Credits expire 1 year after purchase — your date is on the receipt and in My credits",
            "Non-transferable between golfers",
            "Cancel at least 24 hours ahead or the credit is spent; only your instructor can move a lesson",
        ],
    };
};

/**
 * Packs expire 12 months after purchase, each with its own date (decided Nov 17, wish list #10). Admins can
 * extend one golfer's pack in Buck; nothing golfer-facing changes the date.
 */
export const CREDIT_TERM = "1 year after purchase";
/** "Sep 2, 2027": a purchase date (Date or "Sep 2, 2026") plus 12 months. */
export const expiryAfter = (purchased: Date | string) => {
    const d = typeof purchased === "string" ? new Date(purchased) : purchased;
    const e = new Date(d.getFullYear() + 1, d.getMonth(), d.getDate());
    return `${MONTHS_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
};
/** The date a pack bought today would expire. */
export const expiryIfBoughtToday = () => expiryAfter(INSTRUCTION_TODAY);

export const PACKAGES: LessonPackage[] = [
    packFor("mike-kenny", 5, 0.1),
    packFor("mike-kenny", 10, 0.14, "Best value"),
    packFor("mike-dickson", 5, 0.1),
    packFor("doug-hamilton", 5, 0.09),
    packFor("doug-hamilton", 10, 0.12, "Best value"),
    packFor("brent-wilkerson", 5, 0.09),
    packFor("kate-schanuel", 5, 0.09),
    packFor("dustin-stearns", 5, 0.08),
    packFor("brad-cameron", 5, 0.08),
    // Imported from the old Thrive system — held by specific golfers, never purchasable.
    {
        id: "doug-hamilton--thrive-import",
        coachId: "doug-hamilton",
        appliesToServiceId: "private-45",
        label: "Transferred Lesson Credits",
        credits: 4,
        price: 0,
        listPrice: 360,
        perLessonPrice: 90,
        savings: 0,
        availability: "assigned",
        expiration: "No expiration",
        transferable: true,
        howItWorks: [
            "Balance carried over from MCG's previous booking system",
            "Assigned by the Academy — it never appears in the package catalog",
            "Redeem exactly like a purchased credit, online or at the lesson tee",
        ],
        included: ["Remaining 45-minute private lessons with Doug Hamilton", "Range balls for the lesson"],
        restrictions: ["Cannot be purchased — issued by the Academy only", "Keeps the terms it was originally bought under", "Transfers between family members on request"],
    },
];

export const packageById = (id: string): LessonPackage | undefined => PACKAGES.find((p) => p.id === id);
export const onlinePackages = (): LessonPackage[] => PACKAGES.filter((p) => p.availability === "online");
export const packagesForCoach = (coachId: string): LessonPackage[] => PACKAGES.filter((p) => p.coachId === coachId && p.availability === "online");

/** Package filter chips. */
export const PACKAGE_FILTERS: { id: string; label: string }[] = [
    { id: "all", label: "All packages" },
    { id: "5", label: "5 lessons" },
    { id: "10", label: "10 lessons" },
];

export const SUBSCRIPTIONS: LessonSubscription[] = [
    {
        id: "mike-kenny--sub-2",
        coachId: "mike-kenny",
        appliesToServiceId: "private-45",
        label: "2 lessons a month",
        lessonsPerMonth: 2,
        monthlyPrice: 199,
        listMonthly: 220,
        renewalNoticeDays: 3,
        perks: ["Two 45-minute privates every month, booked whenever suits you", "A standing slot held for you, if you want one", "Range balls included, plus 10% off in the Pro Shop"],
        obligations: [
            "Billed monthly on the same date, starting the day you choose",
            "Unused lessons roll over one month, then expire",
            "Cancel anytime from your account — you're notified 3 days before each renewal",
        ],
    },
    {
        id: "doug-hamilton--sub-4",
        coachId: "doug-hamilton",
        appliesToServiceId: "private-45",
        label: "4 lessons a month",
        lessonsPerMonth: 4,
        monthlyPrice: 319,
        listMonthly: 360,
        renewalNoticeDays: 3,
        perks: ["Four 45-minute privates every month across any of Doug's three courses", "Priority booking 48 hours before general release", "Range balls included, plus 10% off in the Pro Shop"],
        obligations: [
            "Billed monthly on the same date, starting the day you choose",
            "Unused lessons roll over one month, then expire",
            "Cancel anytime from your account — you're notified 3 days before each renewal",
        ],
    },
];

export const subscriptionById = (id: string): LessonSubscription | undefined => SUBSCRIPTIONS.find((s) => s.id === id);
/** An instructor's monthly plan, if they offer one. */
export const subscriptionForCoach = (coachId: string): LessonSubscription | undefined => SUBSCRIPTIONS.find((s) => s.coachId === coachId);

/** Credit balances the demo golfer holds — one purchased pack, one assigned Thrive import. */
export const CREDIT_BALANCES: CreditBalance[] = [
    {
        id: "bal-martin-5",
        packageId: "mike-kenny--pack-5",
        coachId: "mike-kenny",
        creditsTotal: 5,
        creditsRemaining: 5,
        valueRemaining: 495,
        purchasedOn: "Sep 2, 2026",
        expiresOn: expiryAfter("Sep 2, 2026"),
        history: [],
    },
    {
        id: "bal-doug-thrive",
        packageId: "doug-hamilton--thrive-import",
        coachId: "doug-hamilton",
        creditsTotal: 4,
        creditsRemaining: 2,
        valueRemaining: 180,
        purchasedOn: "Feb 14, 2026",
        history: [
            { date: "Mar 21, 2026", label: "45-Minute Private · Laytonsville", valueRelieved: 90 },
            { date: "Apr 18, 2026", label: "45-Minute Private · Little Bennett", valueRelieved: 90 },
        ],
    },
];

/** The Mike Kenny balance one lesson later — the "after redemption" state. */
export const BALANCE_AFTER_REDEMPTION: CreditBalance = {
    ...CREDIT_BALANCES[0],
    creditsRemaining: 4,
    valueRemaining: 396,
    history: [{ date: "Oct 9, 2026", label: "45-Minute Private · Falls Road", valueRelieved: 99 }],
};

/** A spent balance and an expired one — the states the Academy fields calls about. */
export const EDGE_BALANCES: CreditBalance[] = [
    {
        id: "bal-brendan-spent",
        packageId: "brent-wilkerson--pack-5",
        coachId: "brent-wilkerson",
        creditsTotal: 5,
        creditsRemaining: 0,
        valueRemaining: 0,
        purchasedOn: "Jan 8, 2026",
        expiresOn: expiryAfter("Jan 8, 2026"),
        history: [
            { date: "Jan 24, 2026", label: "45-Minute Private · Needwood", valueRelieved: 82 },
            { date: "Feb 7, 2026", label: "45-Minute Private · Needwood", valueRelieved: 82 },
            { date: "Feb 28, 2026", label: "45-Minute Private · Needwood", valueRelieved: 82 },
            { date: "Mar 14, 2026", label: "45-Minute Private · Needwood", valueRelieved: 82 },
            { date: "Apr 4, 2026", label: "45-Minute Private · Needwood", valueRelieved: 82 },
        ],
    },
    {
        id: "bal-brad-expired",
        packageId: "brad-cameron--pack-5",
        coachId: "brad-cameron",
        creditsTotal: 5,
        creditsRemaining: 2,
        valueRemaining: 140,
        purchasedOn: "Mar 3, 2025",
        expiresOn: expiryAfter("Mar 3, 2025"),
        history: [
            { date: "Mar 29, 2025", label: "45-Minute Private · Laytonsville", valueRelieved: 70 },
            { date: "Apr 12, 2025", label: "45-Minute Private · Laytonsville", valueRelieved: 70 },
            { date: "May 3, 2025", label: "45-Minute Private · Laytonsville", valueRelieved: 70 },
        ],
    },
];

/** Model B — the demo golfer is three lessons into Doug Hamilton's volume discount. */
export const VOLUME_PROGRESS: VolumeProgress = { coachId: "doug-hamilton", serviceId: "private-45", lessonsTaken: 3, lessonsRequired: 4, discount: 0.5 };

/** Credits the golfer holds that can pay for a lesson with this coach (by service). */
export const creditsFor = (coachId: string, serviceId = "private-45", balances: CreditBalance[] = CREDIT_BALANCES): CreditBalance[] =>
    balances.filter((b) => b.coachId === coachId && b.creditsRemaining > 0 && packageById(b.packageId)?.appliesToServiceId === serviceId);

/** Total credits remaining across balances. */
export const totalCredits = (balances: CreditBalance[] = CREDIT_BALANCES) => balances.reduce((n, b) => n + b.creditsRemaining, 0);
