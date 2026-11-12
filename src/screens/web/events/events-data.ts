/**
 * Sample data for Crane Web Events, Clinics, Leagues, Activities and Calendar at Sagamore
 * Spring. Ported from Fox's events + clinics catalogs (tf-fox-ds-v1/src/components/events)
 * and re-dated around Crane's TODAY (Fri Oct 9, 2026). Leagues are new (no Fox source).
 * Mixes every state the screens need: open, few spots, full → waitlist, members only,
 * free, charity and past.
 */
import { BUDDIES, TODAY } from "@/data/crane";
import clubhouse from "./images/range-aerial.jpg";
import course17 from "./images/course-17th.jpg";
import course19 from "./images/course-19.jpg";
import courseNinth from "./images/course-ninth.jpg";
import diningRoom from "./images/dining-room.jpg";
import event1 from "./images/event-1.jpg";
import event2 from "./images/event-2.jpg";
import event3 from "./images/event-3.jpg";
import event4 from "./images/event-4.jpg";
import event5 from "./images/event-5.jpg";
import event6 from "./images/event-6.jpg";
import event7 from "./images/event-7.jpg";
import golfDay from "./images/golf-day.jpg";
import groupTeaching from "./images/group-teaching.jpg";
import simLounge from "./images/sim-lounge.jpg";

export const IMAGES = { clubhouse, course17, course19, courseNinth, diningRoom, golfDay, groupTeaching, simLounge, event1, event2, event3, event4, event5, event6, event7 };

/* ---------------------------------------------------------------- */
/* Dates                                                             */
/* ---------------------------------------------------------------- */

const pad = (n: number) => String(n).padStart(2, "0");
/** "2026-10-17" → local Date. */
export const parseIso = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
};
export const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const TODAY_ISO = toIso(TODAY);
export const isPast = (iso: string) => iso < TODAY_ISO;
/** Minutes after midnight of the first time in "4:30 PM shotgun" / "10:00 AM – 2:00 PM". */
export const timeToMinutes = (t: string) => {
    const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
    if (!m) return 0;
    const h = Number(m[1]) % 12 + (m[3] === "PM" ? 12 : 0);
    return h * 60 + Number(m[2]);
};

/** "Sat, Oct 17" */
export const fmtDay = (iso: string) => parseIso(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
/** "Saturday, October 17, 2026" */
export const fmtLong = (iso: string) => parseIso(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
/** "Oct 17" */
export const fmtShort = (iso: string) => parseIso(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
/** { month: "OCT", day: "17" } for the date badge. */
export const dateBadge = (iso: string) => {
    const d = parseIso(iso);
    return { month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(), day: String(d.getDate()), weekday: d.toLocaleDateString("en-US", { weekday: "short" }) };
};
/** "Sat, Oct 10 – Sun, Oct 11" or "Sat, Oct 17". */
export const fmtRange = (start: string, end?: string) => (end && end !== start ? `${fmtDay(start)} – ${fmtDay(end)}` : fmtDay(start));

/* ---------------------------------------------------------------- */
/* Availability                                                      */
/* ---------------------------------------------------------------- */

export type Availability = "open" | "few" | "full" | "past";

export interface Capacity {
    capacity: number;
    spotsLeft: number;
    /** People already on the waitlist when full. */
    waitlist?: number;
}

/** Few spots = 6 or fewer, or 15% or less of capacity. */
export const availability = (c: Capacity, iso?: string): Availability => {
    if (iso && isPast(iso)) return "past";
    if (c.spotsLeft <= 0) return "full";
    if (c.spotsLeft <= 6 || c.spotsLeft / c.capacity <= 0.15) return "few";
    return "open";
};

/* ---------------------------------------------------------------- */
/* Events                                                            */
/* ---------------------------------------------------------------- */

export type EventKind = "scramble" | "tournament" | "charity" | "social" | "junior" | "contest";

export const EVENT_KINDS: { id: EventKind; label: string }[] = [
    { id: "scramble", label: "Scrambles" },
    { id: "tournament", label: "Tournaments" },
    { id: "charity", label: "Charity" },
    { id: "social", label: "Social" },
    { id: "junior", label: "Juniors" },
    { id: "contest", label: "Contests & demos" },
];

export interface ClubEvent extends Capacity {
    id: string;
    title: string;
    kind: EventKind;
    /** Accent line on the card — host / organizer. */
    organizer: string;
    date: string;
    endDate?: string;
    time: string;
    location: string;
    format: string;
    image: string;
    description: string;
    included: string[];
    /** 0 = free. */
    price: number;
    /** Lower price for members when guests pay more. */
    guestPrice?: number;
    priceUnit: "per player" | "per team" | "per junior";
    /** Players per registration for team events (Member-Guest = 2). */
    teamSize?: number;
    membersOnly?: boolean;
    ageGroup?: string;
    charity?: { beneficiary: string; raised: number; goal: number };
    featured?: boolean;
}

export const EVENTS: ClubEvent[] = [
    {
        id: "oktoberfest-scramble",
        title: "Oktoberfest 2-Person Scramble",
        kind: "scramble",
        organizer: "Sagamore Spring Golf Club",
        date: "2026-10-03",
        time: "9:00 AM shotgun",
        location: "Championship Course",
        format: "2-person scramble",
        image: IMAGES.event5,
        description: "Our annual fall kickoff: 18 holes of 2-person scramble followed by brats, pretzels and local brews on the patio.",
        included: ["18 holes with cart", "Patio lunch", "Team prizes"],
        price: 70,
        priceUnit: "per player",
        capacity: 64,
        spotsLeft: 0,
    },
    {
        id: "club-championship-finals",
        title: "Club Championship Finals",
        kind: "tournament",
        organizer: "Sagamore Spring Golf Club",
        date: "2026-10-10",
        endDate: "2026-10-11",
        time: "7:30 AM tee times",
        location: "Championship Course",
        format: "36-hole stroke play · gross & net flights",
        image: IMAGES.course19,
        description:
            "Two rounds, 36 holes, one champion. The season's top qualifiers play gross and net flights from the blue tees, with the trophy presentation in the clubhouse Sunday evening.",
        included: ["36 holes with cart", "Range balls both days", "Trophy reception Sunday", "Flight prizes"],
        price: 40,
        priceUnit: "per player",
        membersOnly: true,
        capacity: 32,
        spotsLeft: 3,
    },
    {
        id: "rally-for-the-cure",
        title: "Rally for the Cure Pink Out",
        kind: "charity",
        organizer: "Sagamore Women's Golf Association",
        date: "2026-10-11",
        time: "11:00 AM shotgun",
        location: "Championship Course",
        format: "4-person scramble",
        image: IMAGES.event4,
        description:
            "Wear pink, play 18 and raise money for breast cancer research. Every registration includes lunch, on-course contests and a raffle — and 100% of contest proceeds go to the fund.",
        included: ["18 holes with cart", "Lunch & awards", "Pink ball contest", "Raffle ticket"],
        price: 75,
        priceUnit: "per player",
        capacity: 64,
        spotsLeft: 4,
        charity: { beneficiary: "North Shore Breast Cancer Fund", raised: 8420, goal: 12000 },
        featured: true,
    },
    {
        id: "twilight-nine-and-wine",
        title: "Twilight Nine & Wine",
        kind: "social",
        organizer: "Sagamore Spring Golf Club",
        date: "2026-10-16",
        time: "4:00 PM shotgun",
        location: "Front Nine · Patio",
        format: "9-hole 2-person best ball",
        image: IMAGES.clubhouse,
        description: "Play the front nine as the sun drops, then settle onto the patio for a guided tasting of four fall wines with small plates.",
        included: ["9 holes with cart", "Four-pour wine tasting", "Small plates", "Closest-to-the-pin prize"],
        price: 45,
        priceUnit: "per player",
        capacity: 40,
        spotsLeft: 0,
        waitlist: 6,
    },
    {
        id: "fall-foliage-scramble",
        title: "Fall Foliage 4-Person Scramble",
        kind: "scramble",
        organizer: "Sagamore Spring Golf Club",
        date: "2026-10-17",
        time: "8:00 AM shotgun",
        location: "Championship Course",
        format: "4-person scramble",
        image: IMAGES.event2,
        description:
            "Peak color, crisp air and a relaxed 4-person scramble. Bring a foursome or sign up solo and we'll pair you. Breakfast before, awards and cider donuts after.",
        included: ["18 holes with cart", "Continental breakfast", "Range balls", "Awards & cider donuts"],
        price: 95,
        guestPrice: 115,
        priceUnit: "per player",
        capacity: 72,
        spotsLeft: 18,
        featured: true,
    },
    {
        id: "club-fitting-demo-day",
        title: "Club Fitting Demo Day",
        kind: "contest",
        organizer: "Sagamore Pro Shop",
        date: "2026-10-18",
        time: "10:00 AM – 2:00 PM",
        location: "Practice Range",
        format: "Drop-in fitting",
        image: IMAGES.event7,
        description: "Hit the latest drivers, irons and wedges on launch monitors with our fitting team. Free to attend — reserve a 20-minute fitting slot to skip the line.",
        included: ["Launch-monitor fitting", "Range balls", "Demo-day pricing in the Pro Shop"],
        price: 0,
        priceUnit: "per player",
        capacity: 48,
        spotsLeft: 20,
    },
    {
        id: "ladies-brunch-nine",
        title: "Ladies' Fall Brunch & Nine",
        kind: "social",
        organizer: "Sagamore Women's Golf Association",
        date: "2026-10-20",
        time: "9:00 AM",
        location: "Clubhouse Dining Room",
        format: "Brunch, then 9-hole scramble",
        image: IMAGES.diningRoom,
        description: "Brunch in the dining room, then an easygoing nine with new and returning players. All abilities welcome.",
        included: ["Brunch buffet", "9 holes with cart", "Gift bag"],
        price: 55,
        priceUnit: "per player",
        capacity: 36,
        spotsLeft: 12,
    },
    {
        id: "member-guest-invitational",
        title: "Fall Member-Guest Invitational",
        kind: "tournament",
        organizer: "Sagamore Spring Golf Club",
        date: "2026-10-23",
        endDate: "2026-10-24",
        time: "10:00 AM shotgun",
        location: "Championship Course",
        format: "2-person best ball · 3 nines",
        image: IMAGES.golfDay,
        description:
            "Bring a guest for the club's marquee fall event: three nines of best ball across two days, a Friday welcome dinner and Saturday's shootout for the top flight.",
        included: ["Two rounds with cart", "Welcome dinner Friday", "Tee gifts for both players", "Shootout & awards"],
        price: 250,
        priceUnit: "per team",
        teamSize: 2,
        membersOnly: true,
        capacity: 40,
        spotsLeft: 3,
    },
    {
        id: "long-drive-ctp",
        title: "Long Drive & Closest to the Pin",
        kind: "contest",
        organizer: "Sagamore Pro Shop",
        date: "2026-10-25",
        time: "1:00 PM – 4:00 PM",
        location: "Practice Range · 17th Hole",
        format: "Skills contest",
        image: IMAGES.event3,
        description: "Six balls on the long-drive grid, three shots at the 17th green. Leaderboards update live and the winners take home Pro Shop credit.",
        included: ["6 long-drive balls", "3 closest-to-the-pin shots", "Pro Shop credit prizes"],
        price: 25,
        priceUnit: "per player",
        capacity: 60,
        spotsLeft: 31,
    },
    {
        id: "glow-ball-nine",
        title: "Halloween Glow Ball Nine",
        kind: "social",
        organizer: "Sagamore Spring Golf Club",
        date: "2026-10-30",
        time: "6:00 PM shotgun",
        location: "Front Nine",
        format: "9-hole 2-person scramble",
        image: IMAGES.event6,
        description: "LED balls, lit flags and costumes encouraged. Nine holes after dark, then a costume contest and fire pits on the patio.",
        included: ["9 holes with cart", "Glow balls & necklaces", "Costume contest", "Fire-pit s'mores"],
        price: 50,
        priceUnit: "per player",
        capacity: 48,
        spotsLeft: 0,
        waitlist: 11,
    },
    {
        id: "junior-halloween-chip-putt",
        title: "Junior Halloween Chip & Putt",
        kind: "junior",
        organizer: "Sagamore Junior Golf",
        date: "2026-10-31",
        time: "10:00 AM – 12:00 PM",
        location: "Short Game Area",
        format: "Chip & putt contest",
        image: IMAGES.event1,
        description: "A free morning of chipping and putting games for juniors. Costumes welcome — candy at every station and prizes by age group.",
        included: ["Clubs provided", "Contests by age group", "Candy & prizes"],
        price: 0,
        priceUnit: "per junior",
        ageGroup: "Ages 6–12",
        capacity: 40,
        spotsLeft: 22,
    },
    {
        id: "veterans-day-scramble",
        title: "Veterans Day Charity Scramble",
        kind: "charity",
        organizer: "Sagamore Spring Golf Club",
        date: "2026-11-11",
        time: "10:00 AM shotgun",
        location: "Championship Course",
        format: "4-person scramble",
        image: IMAGES.courseNinth,
        description: "Honor those who served. Veterans play free; every other registration supports local veterans' housing. Lunch and a flag ceremony follow play.",
        included: ["18 holes with cart", "Lunch & ceremony", "Hole-in-one prize"],
        price: 85,
        priceUnit: "per player",
        capacity: 72,
        spotsLeft: 40,
        charity: { beneficiary: "North Shore Veterans Fund", raised: 3150, goal: 10000 },
    },
    {
        id: "turkey-shoot",
        title: "Turkey Shoot Scramble",
        kind: "scramble",
        organizer: "Sagamore Spring Golf Club",
        date: "2026-11-21",
        time: "9:00 AM shotgun",
        location: "Championship Course",
        format: "2-person scramble",
        image: IMAGES.course17,
        description: "The last scramble of the season. Winning teams take home a turkey; everyone takes home pie.",
        included: ["18 holes with cart", "Turkeys for the winners", "Pie for everyone"],
        price: 60,
        priceUnit: "per player",
        capacity: 64,
        spotsLeft: 50,
    },
];

export const eventById = (id: string) => EVENTS.find((e) => e.id === id);

/* ---------------------------------------------------------------- */
/* Clinics                                                           */
/* ---------------------------------------------------------------- */

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "All levels";
export type ClinicFocus = "Full swing" | "Short game" | "Putting" | "On course" | "Junior";
export const SKILL_LEVELS: SkillLevel[] = ["Beginner", "Intermediate", "Advanced", "All levels"];
export const CLINIC_FOCUSES: ClinicFocus[] = ["Full swing", "Short game", "Putting", "On course", "Junior"];

export interface Instructor {
    name: string;
    initials: string;
    title: string;
    bio: string;
}

export const INSTRUCTORS = {
    mike: { name: "Mike Doucette", initials: "MD", title: "Head PGA Professional", bio: "18 years coaching at Sagamore. PGA-certified in short game and scoring, and a Best-in-State teacher." },
    sarah: { name: "Sarah Lin", initials: "SL", title: "PGA Teaching Professional", bio: "Full-swing and player-development coach with a background in collegiate golf and launch-monitor fitting." },
    tom: { name: "Tom Reilly", initials: "TR", title: "Assistant Professional", bio: "Runs Sagamore's junior and new-golfer programs. Patient, practical and very good at making golf fun." },
} satisfies Record<string, Instructor>;

export interface ClinicSession {
    date: string;
    time: string;
}

export interface Clinic extends Capacity {
    id: string;
    title: string;
    focus: ClinicFocus;
    level: SkillLevel;
    instructor: Instructor;
    sessions: ClinicSession[];
    location: string;
    image: string;
    description: string;
    learn: string[];
    bring: string[];
    provided: string[];
    prerequisites: string;
    price: number;
    priceUnit: "per player" | "per series" | "per junior";
    ageGroup?: string;
}

const weekly = (start: string, count: number, time: string): ClinicSession[] =>
    Array.from({ length: count }, (_, i) => ({ date: toIso(addDays(parseIso(start), i * 7)), time }));

export const CLINICS: Clinic[] = [
    {
        id: "junior-fall-academy",
        title: "Junior Fall Academy",
        focus: "Junior",
        level: "Beginner",
        instructor: INSTRUCTORS.tom,
        sessions: weekly("2026-10-10", 4, "10:30 AM – 12:00 PM"),
        location: "Learning Center",
        image: IMAGES.event1,
        description: "Four Saturday mornings of fundamentals — full swing, short game and on-course etiquette — in small, fun groups for juniors.",
        learn: ["Grip, stance and posture", "Full-swing basics", "Putting and chipping games", "Etiquette and rules on the course"],
        bring: ["Junior clubs if you have them", "Sneakers or golf shoes", "Water and a hat"],
        provided: ["Loaner junior clubs", "Range and practice balls", "End-of-series certificate"],
        prerequisites: "Ages 8–14. No experience needed.",
        price: 180,
        priceUnit: "per junior",
        ageGroup: "Ages 8–14",
        capacity: 24,
        spotsLeft: 11,
    },
    {
        id: "short-game-series",
        title: "Short Game Series",
        focus: "Short game",
        level: "Intermediate",
        instructor: INSTRUCTORS.mike,
        sessions: weekly("2026-10-13", 3, "5:30 PM – 6:45 PM"),
        location: "Short Game Area",
        image: IMAGES.course19,
        description: "Three Tuesday evenings on the scoring clubs: chipping, pitching and greenside bunkers, with reps and individual feedback every week.",
        learn: ["Consistent chipping contact", "Pitch distance windows", "Greenside bunker technique", "Reading lies around the green"],
        bring: ["Your wedges", "Golf shoes", "Water"],
        provided: ["Short-game balls", "Loaner wedges on request", "Take-home practice plan"],
        prerequisites: "Comfortable making contact from a tight lie. Not for brand-new golfers.",
        price: 120,
        priceUnit: "per series",
        capacity: 12,
        spotsLeft: 3,
    },
    {
        id: "driver-distance-clinic",
        title: "Driver Distance Clinic",
        focus: "Full swing",
        level: "All levels",
        instructor: INSTRUCTORS.sarah,
        sessions: [{ date: "2026-10-15", time: "5:00 PM – 6:00 PM" }],
        location: "Practice Range",
        image: IMAGES.event3,
        description: "Add yards off the tee. Setup, sequencing and launch conditions, with launch-monitor numbers so you can see the gains in real time.",
        learn: ["Tee height and setup for launch", "Sequencing for speed", "Reading launch-monitor numbers", "Simple speed drills"],
        bring: ["Your driver", "Golf shoes"],
        provided: ["Launch monitor", "Range balls", "Loaner driver on request"],
        prerequisites: "Open to every handicap.",
        price: 40,
        priceUnit: "per player",
        capacity: 16,
        spotsLeft: 9,
    },
    {
        id: "golf-101",
        title: "Golf 101: First Swings",
        focus: "Full swing",
        level: "Beginner",
        instructor: INSTRUCTORS.tom,
        sessions: weekly("2026-10-17", 4, "9:00 AM – 10:00 AM"),
        location: "Learning Center",
        image: IMAGES.groupTeaching,
        description: "Never played? Start here. Four relaxed Saturday sessions take you from grip to your first nine holes, with clubs provided.",
        learn: ["Grip and setup", "Making solid contact", "Putting and chipping basics", "Playing your first holes"],
        bring: ["Comfortable clothes", "Sneakers are fine"],
        provided: ["Loaner clubs", "Range balls", "A playing lesson in week 4"],
        prerequisites: "No experience needed.",
        price: 160,
        priceUnit: "per series",
        capacity: 10,
        spotsLeft: 0,
        waitlist: 4,
    },
    {
        id: "putting-lab",
        title: "Putting Lab",
        focus: "Putting",
        level: "All levels",
        instructor: INSTRUCTORS.sarah,
        sessions: [{ date: "2026-10-18", time: "3:00 PM – 4:15 PM" }],
        location: "Practice Green",
        image: IMAGES.event4,
        description: "A repeatable green-reading routine, speed-control drills and start-line fundamentals on the practice green.",
        learn: ["Green-reading routine", "Speed control", "Start-line drills", "A pre-putt routine"],
        bring: ["Your putter"],
        provided: ["Practice balls", "Alignment aids"],
        prerequisites: "Open to everyone.",
        price: 45,
        priceUnit: "per player",
        capacity: 12,
        spotsLeft: 5,
    },
    {
        id: "playing-lesson",
        title: "Playing Lesson: Course Management",
        focus: "On course",
        level: "Intermediate",
        instructor: INSTRUCTORS.mike,
        sessions: [{ date: "2026-10-25", time: "1:00 PM – 3:00 PM" }],
        location: "Championship Course",
        image: IMAGES.event2,
        description: "Play six holes with the Head Pro, who coaches club selection, targets and decision-making as you go.",
        learn: ["Picking targets", "Club selection", "Recovering from trouble", "A personal game plan"],
        bring: ["Your full bag", "Golf shoes"],
        provided: ["Cart", "Yardage book", "Written game plan"],
        prerequisites: "Comfortable playing a full round.",
        price: 85,
        priceUnit: "per player",
        capacity: 6,
        spotsLeft: 2,
    },
    {
        id: "winter-swing-tune-up",
        title: "Winter Swing Tune-Up",
        focus: "Full swing",
        level: "Advanced",
        instructor: INSTRUCTORS.sarah,
        sessions: weekly("2026-11-09", 2, "6:30 PM – 7:30 PM"),
        location: "Simulator Lounge",
        image: IMAGES.simLounge,
        description: "Keep your swing sharp through the off-season. Two simulator sessions with TrackMan data and a video breakdown.",
        learn: ["Reading your TrackMan data", "Club path and face control", "Winter practice plan"],
        bring: ["Your clubs"],
        provided: ["Simulator bay", "TrackMan report", "Swing video"],
        prerequisites: "Single-digit to mid handicaps.",
        price: 90,
        priceUnit: "per series",
        capacity: 8,
        spotsLeft: 8,
    },
];

export const clinicById = (id: string) => CLINICS.find((c) => c.id === id);
export const clinicNextSession = (c: Clinic) => c.sessions.find((s) => !isPast(s.date)) ?? c.sessions[c.sessions.length - 1];

/* ---------------------------------------------------------------- */
/* Leagues (new)                                                     */
/* ---------------------------------------------------------------- */

export type LeagueStatus = "in-season" | "registering";

export interface LeagueWeek {
    week: number;
    date: string;
    format: string;
    note?: string;
    rainout?: boolean;
}

export interface Standing {
    team: string;
    players: string[];
    points: number;
    played: number;
    /** Average net score. */
    net: number;
    you?: boolean;
}

export interface League extends Capacity {
    id: string;
    name: string;
    tagline: string;
    day: string;
    time: string;
    start: string;
    end: string;
    format: string;
    holes: 9 | 18;
    /** 1 = individual, 2 = 2-person teams. */
    teamSize: 1 | 2;
    eligibility: string;
    location: string;
    fee: number;
    feeUnit: string;
    includes: string[];
    status: LeagueStatus;
    image: string;
    description: string;
    schedule: LeagueWeek[];
    standings?: Standing[];
    coordinator: string;
    /** Signed-in user's team is in this league. */
    youAreIn?: boolean;
}

const weeksFrom = (start: string, count: number, formats: string[], extra: Partial<Record<number, Partial<LeagueWeek>>> = {}, skip: string[] = []): LeagueWeek[] => {
    const out: LeagueWeek[] = [];
    let d = parseIso(start);
    while (out.length < count) {
        const iso = toIso(d);
        if (!skip.includes(iso)) {
            const n = out.length + 1;
            out.push({ week: n, date: iso, format: formats[(n - 1) % formats.length], ...extra[n] });
        }
        d = addDays(d, 7);
    }
    return out;
};

const b = (i: number) => BUDDIES[i].name;

export const LEAGUES: League[] = [
    {
        id: "wednesday-9-and-dine",
        name: "Wednesday Night 9 & Dine",
        tagline: "Nine holes, then dinner on the patio",
        day: "Wednesdays",
        time: "4:30 PM shotgun",
        start: "2026-09-02",
        end: "2026-10-28",
        format: "9-hole 2-person best ball",
        holes: 9,
        teamSize: 2,
        eligibility: "Open to all · handicap required",
        location: "Front or back nine · Patio",
        fee: 320,
        feeUnit: "per player · season",
        includes: ["9 holes with cart each week", "Dinner & one drink each week", "Weekly skins & CTP", "Season-end banquet"],
        status: "in-season",
        image: IMAGES.clubhouse,
        description:
            "Sagamore's most popular league: a relaxed 9-hole best ball every Wednesday, followed by dinner on the patio. Teams earn points each week and the top four play off on Oct 28.",
        schedule: weeksFrom("2026-09-02", 9, ["Front 9 · Best ball", "Back 9 · Best ball", "Front 9 · Scramble", "Back 9 · Alternate shot"], {
            3: { rainout: true, note: "Rained out — made up Oct 21" },
            9: { format: "Playoffs · Top 4", note: "Banquet follows" },
        }),
        standings: [
            { team: "Callahan / Duffy", players: [b(5), b(3)], points: 41.5, played: 5, net: 33.2 },
            { team: "Sanders / Schule", players: [b(2), b(4)], points: 39, played: 5, net: 33.8 },
            { team: "Girard / Wride", players: ["Justin Girard", b(1)], points: 36.5, played: 5, net: 34.1, you: true },
            { team: "Denner / Ortiz", players: ["Ryan Denner", "Luis Ortiz"], points: 33, played: 5, net: 34.9 },
            { team: "Patel / Brooks", players: ["Dev Patel", "Owen Brooks"], points: 30.5, played: 5, net: 35.6 },
            { team: "Kim / Murphy", players: ["Grace Kim", "Sean Murphy"], points: 27, played: 5, net: 36.2 },
            { team: "Nguyen / Hale", players: ["Tri Nguyen", "Ben Hale"], points: 24.5, played: 5, net: 37.0 },
            { team: "Russo / Grant", players: ["Nick Russo", "Paul Grant"], points: 20, played: 5, net: 38.4 },
        ],
        coordinator: "leagues@tenfore.golf",
        capacity: 24,
        spotsLeft: 0,
        waitlist: 3,
        youAreIn: true,
    },
    {
        id: "winter-simulator-league",
        name: "Winter Simulator League",
        tagline: "Keep playing all winter, indoors",
        day: "Mondays",
        time: "6:30 PM",
        start: "2026-11-02",
        end: "2027-02-22",
        format: "18-hole 2-person best ball on TrackMan",
        holes: 18,
        teamSize: 2,
        eligibility: "Open to all · 21+",
        location: "Simulator Lounge",
        fee: 240,
        feeUnit: "per player · season",
        includes: ["Weekly 2-hour bay", "A new world course each week", "League night drink specials", "Playoff night & prizes"],
        status: "registering",
        image: IMAGES.simLounge,
        description:
            "Sixteen Monday nights on the simulators, with a different famous course each week. Teams of two play best ball; handicaps are tracked automatically from your rounds.",
        schedule: weeksFrom("2026-11-02", 16, ["Pebble Beach", "St Andrews Old", "TPC Sawgrass", "Bethpage Black", "Whistling Straits", "Kiawah Ocean"], { 16: { format: "Playoffs", note: "Top 8 teams" } }, [
            "2026-11-23",
            "2026-12-21",
            "2026-12-28",
        ]),
        coordinator: "leagues@tenfore.golf",
        capacity: 16,
        spotsLeft: 3,
    },
    {
        id: "senior-mens-league",
        name: "Senior Men's League",
        tagline: "Tuesday mornings, 55 and over",
        day: "Tuesdays",
        time: "8:00 AM tee times",
        start: "2026-04-14",
        end: "2026-10-27",
        format: "18-hole individual Stableford",
        holes: 18,
        teamSize: 1,
        eligibility: "Men 55+",
        location: "Championship Course",
        fee: 180,
        feeUnit: "per player · season",
        includes: ["Weekly tee times held", "Stableford points & skins", "Season-end lunch"],
        status: "in-season",
        image: IMAGES.golfDay,
        description: "A friendly, well-run Tuesday morning game. Play when you can — your best 12 weeks count toward the season points race.",
        schedule: weeksFrom("2026-09-08", 8, ["Stableford · white tees", "Stableford · gold tees"], { 8: { format: "Season finale", note: "Lunch follows" } }),
        standings: [
            { team: "Frank DeLuca", players: ["Frank DeLuca"], points: 412, played: 24, net: 71.4 },
            { team: "Walt Henning", players: ["Walt Henning"], points: 398, played: 25, net: 72.0 },
            { team: "Gary Sousa", players: ["Gary Sousa"], points: 391, played: 22, net: 72.3 },
            { team: "Ron Pelletier", players: ["Ron Pelletier"], points: 377, played: 24, net: 72.9 },
            { team: "Jim Cahill", players: ["Jim Cahill"], points: 360, played: 21, net: 73.6 },
            { team: "Bill Morrissey", players: ["Bill Morrissey"], points: 344, played: 23, net: 74.1 },
        ],
        coordinator: "leagues@tenfore.golf",
        capacity: 60,
        spotsLeft: 14,
    },
    {
        id: "ladies-9-hole-league",
        name: "Ladies 9-Hole League",
        tagline: "Thursday mornings, all abilities",
        day: "Thursdays",
        time: "9:00 AM tee times",
        start: "2026-09-10",
        end: "2026-10-29",
        format: "9-hole individual net",
        holes: 9,
        teamSize: 1,
        eligibility: "Women · all abilities",
        location: "Front nine",
        fee: 140,
        feeUnit: "per player · season",
        includes: ["9 holes each week", "Weekly game of the day", "Coffee & pastries", "Closing luncheon"],
        status: "in-season",
        image: IMAGES.courseNinth,
        description: "A welcoming Thursday nine with a different game every week. New players can join any week for a prorated fee.",
        schedule: weeksFrom("2026-09-10", 8, ["Net medal", "Low putts", "Blind partner", "Throw out 2 worst"], { 8: { format: "Closing luncheon" } }),
        standings: [
            { team: "Linda Ferraro", players: ["Linda Ferraro"], points: 88, played: 5, net: 36.1 },
            { team: "Maureen Walsh", players: ["Maureen Walsh"], points: 84, played: 5, net: 36.8 },
            { team: "Joan Castillo", players: ["Joan Castillo"], points: 79, played: 4, net: 37.2 },
            { team: "Patty O'Neil", players: ["Patty O'Neil"], points: 75, played: 5, net: 37.9 },
            { team: "Erin Sato", players: ["Erin Sato"], points: 70, played: 5, net: 38.5 },
        ],
        coordinator: "leagues@tenfore.golf",
        capacity: 40,
        spotsLeft: 5,
    },
    {
        id: "couples-twilight-league",
        name: "Couples Twilight League",
        tagline: "Alternate shot with your favorite partner",
        day: "Fridays",
        time: "5:00 PM shotgun",
        start: "2026-09-04",
        end: "2026-10-23",
        format: "9-hole alternate shot",
        holes: 9,
        teamSize: 2,
        eligibility: "Pairs · any combination",
        location: "Back nine",
        fee: 260,
        feeUnit: "per player · season",
        includes: ["9 holes with cart", "Friday dinner", "Weekly prizes"],
        status: "in-season",
        image: IMAGES.event6,
        description: "Friday evening alternate shot for pairs, followed by dinner. Full for the fall — join the waitlist for spring.",
        schedule: weeksFrom("2026-09-04", 8, ["Alternate shot", "Chapman", "Scramble"]),
        coordinator: "leagues@tenfore.golf",
        capacity: 20,
        spotsLeft: 0,
        waitlist: 5,
    },
];

export const leagueById = (id: string) => LEAGUES.find((l) => l.id === id);
export const leagueThisWeek = (l: League) => l.schedule.find((w) => w.date >= TODAY_ISO);
export const leagueWeekLabel = (l: League) => {
    const next = leagueThisWeek(l);
    if (l.status === "registering") return `Starts ${fmtShort(l.start)}`;
    if (!next) return "Season complete";
    return `Week ${next.week} of ${l.schedule.length}`;
};

/* ---------------------------------------------------------------- */
/* Activities — simulator bays (ported from Fox FloGolf) + others     */
/* ---------------------------------------------------------------- */

export interface SimBay {
    id: string;
    name: string;
    seating: string;
    capacity: number;
}

export const SIM_BAYS: SimBay[] = [
    { id: "bay-1", name: "Bay 1", seating: "Leather couch", capacity: 4 },
    { id: "bay-2", name: "Bay 2", seating: "High-top for four", capacity: 4 },
    { id: "bay-3", name: "Bay 3", seating: "6-seat sectional", capacity: 6 },
    { id: "bay-4", name: "Bay 4", seating: "Private suite", capacity: 8 },
];

export const SIM_OPEN = 10 * 60;
export const SIM_CLOSE = 22 * 60;
/** Start times, every 30 min, 10 AM → 9:30 PM. */
export const SIM_SLOTS = Array.from({ length: (SIM_CLOSE - SIM_OPEN) / 30 }, (_, i) => SIM_OPEN + i * 30);

export const fmtMinutes = (m: number) => {
    const h24 = Math.floor(m / 60);
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${pad(m % 60)} ${h24 < 12 ? "AM" : "PM"}`;
};

/** Hourly bay rate: weekday daytime $45, evenings and weekends $65. */
export const simHourlyRate = (iso: string, minutes: number) => {
    const day = parseIso(iso).getDay();
    return day === 0 || day === 6 || minutes >= 17 * 60 ? 65 : 45;
};

/** Deterministic booked blocks per bay; shifts with the date so every day looks different. */
const BLOCKS: [number, number][][] = [
    [[2, 3], [14, 4]],
    [[6, 2], [16, 3]],
    [[0, 4], [12, 2], [19, 3]],
    [[9, 4]],
];
export const simIsBooked = (iso: string, bayIndex: number, minutes: number) => {
    const shift = parseIso(iso).getDate() % 4;
    const slot = (minutes - SIM_OPEN) / 30;
    return BLOCKS[bayIndex].some(([s, len]) => slot >= s + shift && slot < s + shift + len);
};

export interface Activity {
    id: string;
    title: string;
    description: string;
    price: string;
    image: string;
    cta: string;
    href: string;
}

export const OTHER_ACTIVITIES: Activity[] = [
    { id: "range", title: "Driving Range", description: "Grass tees, target greens and lights until 8 PM through October.", price: "Buckets from $8", image: IMAGES.event3, cta: "Buy a bucket", href: "/shop" },
    { id: "lessons", title: "Private Lessons", description: "30 or 60 minutes one-on-one with a PGA professional, on the range or in the simulator.", price: "From $75", image: IMAGES.groupTeaching, cta: "See clinics", href: "/clinics" },
    { id: "juniors", title: "Junior Programs", description: "Academies, camps and chip & putt days for golfers ages 6 to 14.", price: "From free", image: IMAGES.event1, cta: "Junior Academy", href: "/clinics/junior-fall-academy" },
    { id: "outings", title: "Private Outings", description: "Host a company outing, fundraiser or celebration on the course or in the clubhouse.", price: "Custom quote", image: IMAGES.golfDay, cta: "See events", href: "/events" },
];

/* ---------------------------------------------------------------- */
/* Calendar — events, clinic sessions and league nights in one feed  */
/* ---------------------------------------------------------------- */

export type CalendarType = "event" | "clinic" | "league";

export interface CalendarItem {
    key: string;
    type: CalendarType;
    date: string;
    time: string;
    title: string;
    subtitle: string;
    href: string;
    price?: number;
    availability: Availability;
}

export const CALENDAR_ITEMS: CalendarItem[] = [
    ...EVENTS.flatMap((e) => {
        const days = e.endDate ? [e.date, e.endDate] : [e.date];
        return days.map((d, i) => ({
            key: `${e.id}-${i}`,
            type: "event" as const,
            date: d,
            time: e.time,
            title: days.length > 1 ? `${e.title} (Day ${i + 1})` : e.title,
            subtitle: e.location,
            href: `/events/${e.id}`,
            price: e.price,
            availability: availability(e, d),
        }));
    }),
    ...CLINICS.flatMap((c) =>
        c.sessions.map((s, i) => ({
            key: `${c.id}-${i}`,
            type: "clinic" as const,
            date: s.date,
            time: s.time,
            title: c.sessions.length > 1 ? `${c.title} · ${i + 1} of ${c.sessions.length}` : c.title,
            subtitle: `with ${c.instructor.name} · ${c.location}`,
            href: `/clinics/${c.id}`,
            price: c.price,
            availability: availability(c, s.date),
        })),
    ),
    ...LEAGUES.flatMap((l) =>
        l.schedule.map((w) => ({
            key: `${l.id}-${w.week}`,
            type: "league" as const,
            date: w.date,
            time: l.time,
            title: l.name,
            subtitle: `Week ${w.week} · ${w.format}`,
            href: `/leagues/${l.id}`,
            availability: (isPast(w.date) ? "past" : "open") as Availability,
        })),
    ),
].sort((a, b) => a.date.localeCompare(b.date) || timeToMinutes(a.time) - timeToMinutes(b.time));
