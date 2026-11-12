/**
 * Sample data for Crane Web › Profile ∕ Account that src/data/crane.ts doesn't cover yet
 * (events, buddy suggestions, membership plans, balance activity). Everything else
 * (USER, PAYMENT_CARDS, BUDDIES, PUNCH_CARDS, RAIN_CHECKS, GIFT_CARDS, MEMBERSHIPS,
 * BOOKINGS, PURCHASES) comes straight from the shared Crane data so web and mobile agree.
 */
import type { FC } from "react";
import { Calendar, Clock, CoinsStacked01, Flag06, GraduationHat01, ShoppingBag01, Trophy01, Users01, UsersPlus } from "@untitledui/icons";
import { courseById, PURCHASES, TODAY, type Course, type Purchase } from "@/data/crane";

/** Fields the web account shows that the mobile app doesn't have yet. */
export const ACCOUNT_EXTRAS = {
    handicap: "9.6",
    homeCourse: courseById("sagamore-spring"),
    memberSince: "2021",
};

/* ---------- Events & clinics ---------- */

export type AccountEventKind = "event" | "clinic" | "league";

export interface AccountEvent {
    id: string;
    kind: AccountEventKind;
    title: string;
    course: Course;
    date: Date;
    time: string;
    location: string;
    /** "2 players", "Team of 2". */
    party: string;
    price: number;
    priceUnit: string;
    description: string;
}

export const REGISTERED_EVENTS: AccountEvent[] = [
    {
        id: "ev-1",
        kind: "clinic",
        title: "Short Game Clinic",
        course: courseById("sagamore-spring"),
        date: new Date(2026, 9, 14),
        time: "5:30 PM",
        location: "Practice Green",
        party: "1 player",
        price: 45,
        priceUnit: "per player",
        description: "Ninety minutes on chipping, pitching and bunker play with the teaching staff. Bring a wedge or two; range balls are included.",
    },
    {
        id: "ev-2",
        kind: "event",
        title: "Fall Two-Person Scramble",
        course: courseById("sagamore-spring"),
        date: new Date(2026, 9, 24),
        time: "8:00 AM shotgun",
        location: "Sagamore Spring",
        party: "Team of 2",
        price: 170,
        priceUnit: "per team",
        description: "18-hole scramble with a shotgun start, cart, range balls, lunch at the turn and prizes for the top three net and gross teams.",
    },
    {
        id: "ev-3",
        kind: "league",
        title: "Thursday Twilight League",
        course: courseById("sagamore-hampton"),
        date: new Date(2026, 9, 15),
        time: "4:45 PM",
        location: "Sagamore Hampton",
        party: "1 player",
        price: 30,
        priceUnit: "per week",
        description: "Nine holes of match play every Thursday through October, followed by standings and specials in the clubhouse.",
    },
];

export const PAST_EVENTS: AccountEvent[] = [
    {
        id: "ev-p1",
        kind: "event",
        title: "Member-Guest Invitational",
        course: courseById("sagamore-spring"),
        date: new Date(2026, 7, 22),
        time: "7:30 AM shotgun",
        location: "Sagamore Spring",
        party: "Team of 2",
        price: 240,
        priceUnit: "per team",
        description: "Two days of better-ball with your guest.",
    },
];

export const EVENT_KIND_LABEL: Record<AccountEventKind, string> = { event: "Event", clinic: "Clinic", league: "League" };

/* ---------- Golf buddies: people you've played with ---------- */

export interface BuddySuggestion {
    id: string;
    name: string;
    email: string;
    note: string;
}

export const BUDDY_SUGGESTIONS: BuddySuggestion[] = [
    { id: "s-1", name: "Sam Ortiz", email: "sam.ortiz@tenfore.golf", note: "Played together Apr 27 · Mount Hood" },
    { id: "s-2", name: "Kelly Park", email: "kelly.park@tenfore.golf", note: "In your Thursday league" },
    { id: "s-3", name: "Dan Whitaker", email: "dan.whitaker@tenfore.golf", note: "2 rounds together this year" },
    { id: "s-4", name: "Nora Quinn", email: "nora.quinn@tenfore.golf", note: "Played together Aug 22 · Member-Guest" },
];

/* ---------- Account balance activity ---------- */

export const BALANCE_ACTIVITY = [
    { id: "ba-1", date: new Date(2026, 9, 2), desc: "Pro Shop · Range token pack", amount: -18.5 },
    { id: "ba-2", date: new Date(2026, 8, 28), desc: "Payment · Visa •••• 2521", amount: 64 },
    { id: "ba-3", date: new Date(2026, 8, 20), desc: "Grill · Lunch at the turn", amount: -30 },
];

/* ---------- Membership plans (Fox "Memberships" sales page) ---------- */

export interface PlanPerk {
    icon: FC<{ className?: string }>;
    title: string;
    desc: string;
}

export interface MembershipPlan {
    id: string;
    name: string;
    price: number;
    tagline: string;
    perks: PlanPerk[];
}

const perk = (icon: FC<{ className?: string }>, title: string, desc: string): PlanPerk => ({ icon, title, desc });

export const ANNUAL_PLANS: Record<"individual" | "family", MembershipPlan> = {
    individual: {
        id: "annual",
        name: "Annual",
        price: 2400,
        tagline: "Full membership for one golfer.",
        perks: [
            perk(Flag06, "Unlimited golf", "Play as much as you like, 7 days a week."),
            perk(CoinsStacked01, "Member rates", "No green fees on any round."),
            perk(Calendar, "30-day booking window", "Book tee times up to 30 days out."),
            perk(ShoppingBag01, "Shop & dining", "10% off the Pro Shop and the Grill."),
            perk(Users01, "Guest passes", "Six passes a year to bring friends."),
            perk(Trophy01, "Events & leagues", "Priority entry to clinics and scrambles."),
        ],
    },
    family: {
        id: "annual-family",
        name: "Annual Family",
        price: 3600,
        tagline: "One membership for the whole household.",
        perks: [
            perk(Users01, "Whole household", "Two adults and juniors under 18."),
            perk(Flag06, "Unlimited golf", "Everyone plays, 7 days a week."),
            perk(Calendar, "30-day booking window", "Book tee times up to 30 days out."),
            perk(ShoppingBag01, "Shop & dining", "10% off the Pro Shop and the Grill."),
            perk(GraduationHat01, "Junior programs", "Free junior clinics and camps."),
            perk(UsersPlus, "More guests", "Twelve guest passes a year."),
        ],
    },
};

export const OTHER_PLANS: MembershipPlan[] = [
    {
        id: "senior",
        name: "Senior",
        price: 1800,
        tagline: "Ages 65+, weekday-focused.",
        perks: [
            perk(Flag06, "Weekday golf", "Unlimited rounds Monday to Friday."),
            perk(Clock, "Weekend afternoons", "Play weekends after 12 PM."),
            perk(CoinsStacked01, "Member rates", "Save on every round you play."),
        ],
    },
    {
        id: "punch",
        name: "Gold Punch",
        price: 650,
        tagline: "20 green fees to use any day this season.",
        perks: [
            perk(Flag06, "20 rounds", "Punched at check-in, any day of the week."),
            perk(Calendar, "14-day booking window", "Book further out than the public."),
            perk(ShoppingBag01, "Pro Shop", "10% off gear and apparel."),
        ],
    },
];

/** Days from the prototype's fixed "today". */
export const daysFromToday = (d: Date) => Math.round((d.getTime() - TODAY.getTime()) / 86_400_000);

/* ---------- Purchases: the app's tee-time order plus two web shop orders ---------- */

export const ACCOUNT_PURCHASES: (Purchase & { source: string })[] = [
    {
        id: "p-web-2",
        orderNumber: "4251877",
        date: new Date(2026, 9, 2),
        time: "11:42 AM",
        total: 18.5,
        items: [{ name: "Range Token Pack", detail: "Large bucket × 5", qty: 1, price: 18.5 }],
        card: { brand: "Visa", last4: "2521" },
        source: "Pro Shop",
    },
    {
        id: "p-web-1",
        orderNumber: "4249016",
        date: new Date(2026, 8, 14),
        time: "8:05 PM",
        total: 112.48,
        items: [
            { name: "Titleist Pro V1 Golf Balls", detail: "Dozen · White", qty: 2, price: 54.99 },
            { name: "Ball marker", detail: "Sagamore logo", qty: 1, price: 2.5 },
        ],
        card: { brand: "Visa", last4: "2521" },
        source: "Shop · Shipped",
    },
    ...PURCHASES.map((p) => ({ ...p, source: "Tee time" })),
];
