/**
 * Sample data for Crane prototypes. Mirrors the shape of the references in
 * references/100926, with personal details swapped for safe stand-ins.
 */
import type { TeeTime } from "@/components/lists/tee-time-card";

export const APP_VERSION = "v7.1.48 (1)";

export const USER = {
    firstName: "Justin",
    lastName: "Girard",
    email: "justin.girard@tenfore.golf",
    phone: "(617) 555-0142",
    rewardsPoints: 0,
};

export interface Course {
    id: string;
    name: string;
    shortName: string;
    city: string;
    state: string;
    distanceMi?: number;
    phone?: string;
    email?: string;
    address?: string;
    /** Saved to "My Courses". */
    saved?: boolean;
}

export const COURSES: Course[] = [
    { id: "sagamore-spring", name: "Sagamore Spring Golf Club", shortName: "SSGC", city: "Lynnfield", state: "MA", distanceMi: 9.5, saved: true },
    { id: "mount-hood", name: "Mount Hood Golf Course", shortName: "Mount Hood", city: "Melrose", state: "MA", distanceMi: 2.3, saved: true },
    { id: "grand-view", name: "Grand View Lodge - The Pines", shortName: "The Pines", city: "Nisswa", state: "MN", saved: true },
    { id: "bushwood", name: "Bushwood Country Club", shortName: "Bushwood", city: "Spring Branch", state: "TX", saved: true },
    { id: "melody-hill", name: "Melody Hill Golf Club", shortName: "Melody Hill", city: "Harmony", state: "RI", distanceMi: 47, saved: true },
    { id: "wentworth", name: "Wentworth Golf Club", shortName: "Wentworth", city: "Jackson Village", state: "NH", saved: true },
    {
        id: "sagamore-hampton",
        name: "Sagamore Hampton Golf Club",
        shortName: "SHGC",
        city: "North Hampton",
        state: "NH",
        distanceMi: 41,
        phone: "(603) 555-0134",
        email: "info@sagamoregolf.com",
        address: "101 North Road, North Hampton, NH, 03862",
    },
    { id: "sagamore-center", name: "Sagamore Golf Center", shortName: "SGC", city: "North Hampton", state: "NH", distanceMi: 41 },
    { id: "raceway", name: "Raceway Golf Club", shortName: "Raceway", city: "Thompson", state: "CT", distanceMi: 50 },
    { id: "farmington", name: "Farmington Country Club", shortName: "Farmington", city: "Farmington", state: "NH", distanceMi: 67 },
    { id: "woodstock", name: "Woodstock Inn & Resort", shortName: "Woodstock", city: "Woodstock", state: "VT", distanceMi: 111 },
];

export const courseById = (id: string) => COURSES.find((c) => c.id === id) ?? COURSES[0];

/** Course sections shown as tabs under the course header. */
export const COURSE_SECTIONS = [
    { id: "tee", label: "Tee" },
    { id: "store", label: "Store" },
    { id: "activities", label: "Activities" },
    { id: "clinics", label: "Clinics" },
    { id: "restaurant", label: "Restaurant" },
];

const times = ["8:54 AM", "9:03 AM", "9:12 AM", "9:21 AM", "9:30 AM", "9:39 AM", "9:48 AM", "9:57 AM", "10:06 AM", "10:15 AM", "10:24 AM", "10:33 AM"];

/** A morning tee sheet. Mostly full with a few open times, like a busy Saturday. */
export const teeSheet = (course: Course, price = 53, holes: 9 | 18 = 18): TeeTime[] =>
    times.map((time, i) => ({
        id: `${course.id}-${i}`,
        time,
        price,
        holes,
        course: course.shortName,
        spots: [0, 1, 0, 0, 3, 0, 4, 0, 2, 4, 4, 1][i],
        reserved: [0, 3, 0, 0, 1, 0, 0, 0, 2, 0, 0, 3][i] || undefined,
    }));

export interface Booking {
    id: string;
    course: Course;
    date: Date;
    time: string;
    players: number;
    holes: 9 | 18;
    status: "upcoming" | "past";
}

export const BOOKINGS: Booking[] = [
    { id: "b-1", course: courseById("sagamore-hampton"), date: new Date(2026, 9, 11), time: "9:03 AM", players: 1, holes: 18, status: "upcoming" },
    { id: "b-2", course: courseById("mount-hood"), date: new Date(2026, 3, 27), time: "2:36 PM", players: 2, holes: 9, status: "past" },
];

export interface Purchase {
    id: string;
    orderNumber: string;
    date: Date;
    time: string;
    total: number;
    items: { name: string; detail: string; qty: number; price: number }[];
    card: { brand: string; last4: string };
}

export const PURCHASES: Purchase[] = [
    {
        id: "p-1",
        orderNumber: "4243305",
        date: new Date(2026, 3, 27),
        time: "2:18 PM",
        total: 68,
        items: [
            { name: "Weekday Non Resident", detail: "Weekday Non Resident", qty: 1, price: 34 },
            { name: "Walking", detail: "Walking", qty: 1, price: 0 },
            { name: "Weekday Non Resident", detail: "Weekday Non Resident", qty: 1, price: 34 },
            { name: "Walking", detail: "Walking", qty: 1, price: 0 },
        ],
        card: { brand: "Mastercard", last4: "1883" },
    },
];

export interface PaymentCard {
    id: string;
    brand: "Visa" | "Mastercard" | "Amex";
    last4: string;
    exp: string;
    name: string;
    zip: string;
}

export const PAYMENT_CARDS: PaymentCard[] = [{ id: "card-1", brand: "Visa", last4: "2521", exp: "03/28", name: "Justin C Girard", zip: "02149" }];

export const BUDDIES = [
    { id: "u-1", name: "Mike Callahan", email: "mike.callahan@tenfore.golf", handicap: 12.4 },
    { id: "u-2", name: "Chris Duffy", email: "chris.duffy@tenfore.golf", handicap: 8.1 },
    { id: "u-3", name: "Ryan Walsh", email: "ryan.walsh@tenfore.golf", handicap: 18.7 },
];

export const BOOKING_NOTICE = [
    "Golf Car Notice! Please know that golf cars are suspended each day two hours before sunset (we transition to walking only at that time)",
    "Weekends & Holidays: 18-hole play is required before 1 pm on weekends & holidays",
    "All greenfees are paid at the course upon check-in (we require a credit card only to cover 'No-Show Fees' should they apply)",
    "No-Show Fees (per absent player): Weekdays $15 pp / Weekends & Holidays $20 pp",
    "We require at least 24-hours notice for all tee time changes & cancellations (the easiest way to manage/cancel tee-times is via your online booking profile)",
];

export const currency = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
