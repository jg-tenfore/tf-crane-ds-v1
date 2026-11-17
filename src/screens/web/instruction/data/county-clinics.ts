/**
 * MCG county clinics — the Parks-department clinic program (Get Golf Ready, First Tee, Women
 * on Course, Senior Swing & Stretch, the junior pathway, …), plus three sample formats Fox
 * Prototype 3 added to show formats MCG doesn't run yet (junior league, Op 36, a junior camp —
 * `sample: true`). Ported from Fox (`mcg-3/events-catalog.ts` → `MCG_CLINICS`); ids are
 * identical (`ggr-northwest`, `op36-little-bennett`, …).
 *
 * Dates are written in Fox's June calendar (`foxIsoDate`) and re-based onto Crane's at load
 * (`rebaseIso` from the events catalog's own today, Jun 12 → Oct 9: 17 weeks, same weekday), and the schedule line is generated from the result — so a
 * "Mondays from Jun 15" clinic becomes "Mondays from Oct 5"… shifted by whole weeks. A few
 * "Summer" titles became "Fall" to match. Instructors here are fictional county staff (not on
 * the Academy roster). Art: `programArt()` in images.ts.
 */
import { addDays, dateOfIso, fmtMonthDay, FOX_EVENTS_TODAY_ISO, parseTime, rebaseIso, runDays, sessionDates, WEEKDAYS, WEEKDAYS_SHORT, type RunPattern } from "./dates";
import { programArt } from "./images";
import type { RegistrationRules } from "./registration-rules";

export type ClinicLevel = "New to golf" | "Beginner" | "Intermediate" | "Advanced" | "All levels";
export type ClinicAudience = "Juniors" | "Teens" | "Adults" | "Seniors" | "All ages";

export const LEVELS: ClinicLevel[] = ["New to golf", "Beginner", "Intermediate", "Advanced", "All levels"];
export const AUDIENCES: ClinicAudience[] = ["Juniors", "Teens", "Adults", "Seniors", "All ages"];

/** Tag tone per skill level (Crane `Tag` tones), so the five read apart. */
export const LEVEL_TONE: Record<ClinicLevel, "success" | "brand" | "warning" | "error" | "gray"> = {
    "New to golf": "success",
    Beginner: "brand",
    Intermediate: "warning",
    Advanced: "error",
    "All levels": "gray",
};

export interface ClinicInstructor {
    name: string;
    title: string;
    initials: string;
    bio: string;
}

export interface McgClinic {
    id: string;
    title: string;
    level: ClinicLevel;
    audience: ClinicAudience;
    /** First session (ISO, re-based onto Crane's calendar). */
    isoDate: string;
    /** Last session (ISO). */
    endIso: string;
    /** Every session date (ISO). */
    sessionDates: string[];
    /** Weekdays it meets (0 = Sunday). */
    days: number[];
    pattern: RunPattern;
    /** Display time of a session, e.g. "6:00 PM – 7:30 PM". */
    time: string;
    /** Human schedule, e.g. "Mondays from Oct 5" (generated). */
    schedule: string;
    sessions: number;
    /** Crane course id. */
    courseSlug: string;
    /** Where the group meets, e.g. "Northwest learning centre". */
    location: string;
    instructor: ClinicInstructor;
    price: number;
    priceUnit: string;
    capacity: number;
    registered: number;
    description: string;
    /** "What you'll learn" bullets. */
    learn: string[];
    prerequisites: string;
    bring: string[];
    provided: string[];
    /** 3:2 card art and a 21:9 banner. */
    image: string;
    banner: string;
    rules?: RegistrationRules;
    /** How Instruction classifies it (defaults to a group clinic). */
    programFormat?: "clinic" | "junior-camp" | "junior-league" | "op36";
    /** Added by Fox Prototype 3 to demonstrate a format MCG doesn't run today. */
    sample?: boolean;
    /** Sold one session at a time (golfer picks dates); `price` is then per session. */
    perSession?: { price: number };
}

type ClinicSpec = Omit<McgClinic, "isoDate" | "endIso" | "sessionDates" | "days" | "pattern" | "schedule" | "image" | "banner"> & {
    /** First session in Fox's June calendar. */
    foxIsoDate: string;
};

const KAYLA = { name: "Kayla Ruiz", title: "MCG Program Coordinator, PGA", initials: "KR", bio: "Runs the county's beginner pathway across all nine courses. Eleven years coaching, PGA certified in Player Development, and the person who built Get Golf Ready in Montgomery County." };
const TERRENCE = { name: "Terrence Hobbs", title: "First Tee — Montgomery County, Head Coach", initials: "TH", bio: "Leads First Tee programming countywide and coaches the MCPS all-county team. Former college player; nine years running youth golf in the county." };
const DIANE = { name: "Diane Whitlock, PGA", title: "MCG Teaching Professional", initials: "DW", bio: "Teaches at Laytonsville and Needwood, with a practice built almost entirely around senior and returning golfers. Certified in golf fitness and adaptive instruction." };
const ANDRE = { name: "Andre Sills, PGA", title: "MCG Teaching Professional", initials: "AS", bio: "Hampshire Greens-based instructor working mostly with competitive juniors and tournament players. Coaches three MCPS teams in the fall." };

const CLINIC_SPECS: ClinicSpec[] = [
    {
        id: "junior-league-northwest",
        title: "MCG Junior League — Fall Season",
        level: "Beginner",
        audience: "Juniors",
        foxIsoDate: "2026-06-16",
        time: "5:30 PM – 7:00 PM",
        sessions: 8,
        courseSlug: "northwest",
        location: "Northwest learning centre",
        instructor: TERRENCE,
        price: 199,
        priceUnit: "for the season",
        capacity: 24,
        registered: 15,
        programFormat: "junior-league",
        sample: true,
        description:
            "A sample program added for Prototype 3 — MCG does not run a junior league today. Eight Tuesday evenings of two-person scramble matches against other county courses, with a coach on the course each week.",
        learn: ["Playing in a two-person scramble", "Keeping pace in a match", "Rules situations that come up in league play", "Being a teammate on a bad hole"],
        prerequisites: "Ages 8–14 who can play three holes. Teams are assigned at the first session.",
        bring: ["Your own junior clubs", "Golf shoes", "Water"],
        provided: ["League shirt", "Range balls each week", "Nine holes with a coach"],
        rules: {
            age: { min: 8, max: 14 },
            gender: "any",
            equipmentProvided: false,
            questions: [
                { id: "shirt", label: "League shirt size", type: "choice", options: ["Youth S", "Youth M", "Youth L", "Adult S"], required: true, per: "golfer" },
                { id: "emergency", label: "Emergency contact phone", type: "text", required: true, per: "booking" },
            ],
        },
    },
    {
        id: "op36-little-bennett",
        title: "Op 36 — Level 1 to 5 Pathway",
        level: "New to golf",
        audience: "Juniors",
        foxIsoDate: "2026-06-21",
        time: "1:00 PM – 2:30 PM",
        sessions: 10,
        courseSlug: "little-bennett",
        location: "Little Bennett short-game area",
        instructor: KAYLA,
        price: 249,
        priceUnit: "for the program",
        capacity: 20,
        registered: 11,
        programFormat: "op36",
        sample: true,
        description:
            "A sample program added for Prototype 3 — MCG does not run Op 36 today. The Operation 36 pathway: play nine holes from a short distance, and move the tee back a level each time you shoot 36 or better.",
        learn: ["Playing nine holes from 25 yards and moving back", "Putting and chipping under a real score", "Tracking your own level and progress", "Golf's etiquette from the first level"],
        prerequisites: "Ages 6–15, any ability. Levels are individual, so a family can share a session.",
        bring: ["Junior clubs if you have them", "Golf or athletic shoes"],
        provided: ["Loaner junior clubs", "Level tracking card", "Nine holes each session"],
        rules: {
            age: { min: 6, max: 15 },
            gender: "any",
            equipmentProvided: true,
            questions: [
                { id: "level", label: "Have they played Op 36 before?", type: "yes-no", required: true, per: "golfer" },
                { id: "emergency", label: "Emergency contact phone", type: "text", required: true, per: "booking" },
            ],
        },
    },
    {
        id: "junior-camp-needwood",
        title: "Junior Golf Camp — Needwood",
        level: "Beginner",
        audience: "Juniors",
        foxIsoDate: "2026-07-20",
        time: "9:00 AM – 12:00 PM",
        sessions: 4,
        courseSlug: "needwood",
        location: "Needwood learning centre",
        instructor: TERRENCE,
        price: 315,
        priceUnit: "for the week",
        capacity: 18,
        registered: 12,
        programFormat: "junior-camp",
        sample: true,
        description:
            "A sample program added for Prototype 3 — this camp is not on MCG's schedule today. Four mornings of instruction, games and three holes a day, with lunch on the last morning.",
        learn: ["Full swing, chipping and putting", "Playing three holes at pace", "Golf etiquette and safety", "A practice routine to take home"],
        prerequisites: "Ages 7–13, any ability. Clubs provided for anyone who needs them.",
        bring: ["Sneakers", "Water bottle and sunscreen", "A packed snack"],
        provided: ["Junior loaner clubs", "All balls and tees", "Lunch on the final day"],
        rules: {
            age: { min: 7, max: 13 },
            gender: "any",
            equipmentProvided: true,
            questions: [
                { id: "medical", label: "Allergies or medical notes", type: "text", required: false, per: "golfer" },
                { id: "emergency", label: "Emergency contact phone", type: "text", required: true, per: "booking" },
            ],
        },
    },
    {
        id: "girls-golf-needwood",
        title: "Girls Golf — Saturday Skills",
        level: "Beginner",
        audience: "Juniors",
        foxIsoDate: "2026-06-20",
        time: "10:00 AM – 11:30 AM",
        sessions: 6,
        courseSlug: "needwood",
        location: "Needwood learning centre",
        instructor: KAYLA,
        price: 45,
        priceUnit: "per session",
        capacity: 12,
        registered: 5,
        description:
            "Saturday mornings for girls, coached by women, at Needwood. Each session stands on its own — a new skill, a game, and a hole or two to finish — so families book the Saturdays that work. Choose three or more and every session is half price.",
        learn: ["Full swing, chipping and putting basics", "Games that build real scoring skills", "Playing a hole from tee to cup", "Etiquette and confidence on the course"],
        prerequisites: "Girls aged 7–16. No experience needed; clubs are provided.",
        bring: ["Sneakers or golf shoes", "Water and sunscreen"],
        provided: ["Junior clubs in every size", "All balls and tees", "A Girls Golf visor on the first session"],
        rules: {
            age: { min: 7, max: 16 },
            gender: "female",
            equipmentProvided: true,
            multiBuy: { buy: 3, percentOff: 50 },
            questions: [
                { id: "shirt", label: "Visor or T-shirt size", type: "choice", options: ["Youth S", "Youth M", "Youth L", "Adult S"], required: true, per: "golfer" },
                { id: "emergency", label: "Emergency contact phone", type: "text", required: true, per: "booking" },
            ],
        },
        perSession: { price: 45 },
    },
    {
        id: "ggr-northwest",
        title: "Get Golf Ready — Five-Week Starter",
        level: "New to golf",
        audience: "Adults",
        foxIsoDate: "2026-06-15",
        time: "6:00 PM – 7:00 PM",
        sessions: 5,
        courseSlug: "northwest",
        location: "Northwest learning centre",
        instructor: KAYLA,
        price: 139,
        priceUnit: "for the series",
        capacity: 12,
        registered: 9,
        description:
            "The county's front door to golf, and the program we point every absolute beginner at. Five weeks takes you from never having held a club to playing nine holes — the last session is on the course, with a professional walking alongside you.",
        learn: ["Grip, stance and posture that hold up", "Making contact with iron, wedge and putter", "Chipping and putting well enough to finish a hole", "Pace of play, etiquette and how a round actually works"],
        prerequisites: "For adults who have never played, or have not played in a decade. No equipment and no experience needed.",
        bring: ["Athletic shoes with a flat sole", "Water and a hat", "Nothing else"],
        provided: ["A full set of loaner clubs", "All range balls", "Nine holes on the final week, cart included"],
    },
    {
        id: "ggr-needwood",
        title: "Get Golf Ready — Five-Week Starter",
        level: "New to golf",
        audience: "Adults",
        foxIsoDate: "2026-07-08",
        time: "6:00 PM – 7:00 PM",
        sessions: 5,
        courseSlug: "needwood",
        location: "Needwood learning centre",
        instructor: KAYLA,
        price: 139,
        priceUnit: "for the series",
        capacity: 12,
        registered: 12,
        description:
            "The same five-week beginner series, run at Needwood on Wednesday evenings. This session fills first every season because Needwood is the easiest course in the county to get to on the Red Line — join the waitlist and we will call as soon as a spot opens.",
        learn: ["Grip, stance and posture that hold up", "Making contact with iron, wedge and putter", "Chipping and putting well enough to finish a hole", "Pace of play, etiquette and how a round actually works"],
        prerequisites: "For adults who have never played, or have not played in a decade. No equipment and no experience needed.",
        bring: ["Athletic shoes with a flat sole", "Water and a hat", "Nothing else"],
        provided: ["A full set of loaner clubs", "All range balls", "Nine holes on the final week, cart included"],
    },
    {
        id: "women-on-course-falls-road",
        title: "Women on Course — Play Your First Nine",
        level: "Beginner",
        audience: "Adults",
        foxIsoDate: "2026-06-18",
        time: "6:00 PM – 7:30 PM",
        sessions: 4,
        courseSlug: "falls-road",
        location: "Falls Road practice facility",
        instructor: KAYLA,
        price: 119,
        priceUnit: "for the series",
        capacity: 16,
        registered: 11,
        description:
            "Four Thursday evenings for women who can hit a ball on the range but have never felt ready to walk onto a first tee. The point of this clinic is the fourth week, when the group plays nine holes together and discovers it was never that hard.",
        learn: ["Choosing a club and committing to the shot", "Keeping a ball in play off the tee", "Picking up, dropping and moving on without panic", "Reading a scorecard and keeping pace in a group"],
        prerequisites: "You can make contact on the range. You have not played much, or any, on-course golf.",
        bring: ["Your clubs if you have them", "Golf or athletic shoes", "A friend, if it helps"],
        provided: ["Loaner clubs on request", "Range balls each week", "Nine holes on the final week, cart included"],
        rules: {
            age: { min: 18 },
            gender: "female",
            equipmentProvided: false,
            questions: [{ id: "on-course", label: "Rounds played in the last year", type: "choice", options: ["None", "1–5", "6–10", "More than 10"], required: true, per: "golfer" }],
        },
    },
    {
        id: "senior-swing-laytonsville",
        title: "Senior Swing & Stretch",
        level: "All levels",
        audience: "Seniors",
        foxIsoDate: "2026-06-16",
        time: "10:00 AM – 11:00 AM",
        sessions: 6,
        courseSlug: "laytonsville",
        location: "Laytonsville range",
        instructor: DIANE,
        price: 99,
        priceUnit: "for the series",
        capacity: 20,
        registered: 14,
        description:
            "Six Tuesday mornings built around the swing you have now rather than the one you had at forty. Fifteen minutes of mobility work, forty-five minutes of instruction, and an honest conversation about which clubs are still worth carrying.",
        learn: ["A warm-up that protects your back and hips", "Getting speed back without more effort", "Making a shorter turn work for you", "Picking a set of clubs that matches your distances"],
        prerequisites: "Age 55 and up, any ability. Every drill has a seated or reduced-range version.",
        bring: ["Your own clubs", "Comfortable shoes", "Water"],
        provided: ["Range balls each week", "Mobility bands", "A printed distance chart at the end"],
        rules: {
            age: { min: 55 },
            gender: "any",
            equipmentProvided: false,
            questions: [{ id: "mobility", label: "Anything the instructor should know about mobility or injuries?", type: "text", required: false, per: "golfer" }],
        },
    },
    {
        id: "first-tee-summer-northwest",
        title: "First Tee — Montgomery County Fall Session",
        level: "New to golf",
        audience: "Juniors",
        foxIsoDate: "2026-06-23",
        time: "4:30 PM – 6:00 PM",
        sessions: 7,
        courseSlug: "northwest",
        location: "Northwest learning centre",
        instructor: TERRENCE,
        price: 95,
        priceUnit: "for the series",
        capacity: 40,
        registered: 34,
        description:
            "Seven weeks of the national First Tee curriculum, run by county coaches at Northwest. Golf is the vehicle; the curriculum is about judgement, perseverance and how you carry yourself. Scholarships cover the full fee for any family that asks — nobody is turned away.",
        learn: ["Full-swing, chipping and putting fundamentals", "The nine First Tee core values, on and off the course", "Playing three holes safely and at pace", "Setting a goal and tracking it across the session"],
        prerequisites: "Ages 7–14. No experience or equipment necessary. Scholarships available on request at registration.",
        bring: ["Sneakers", "A water bottle", "Sunscreen"],
        provided: ["Junior loaner clubs", "All balls and tees", "A First Tee shirt and certificate"],
        rules: {
            age: { min: 7, max: 14 },
            gender: "any",
            equipmentProvided: true,
            questions: [
                { id: "shirt", label: "T-shirt size", type: "choice", options: ["Youth S", "Youth M", "Youth L", "Adult S", "Adult M"], required: true, per: "golfer" },
                { id: "medical", label: "Allergies or medical notes", type: "text", required: false, per: "golfer" },
                { id: "scholarship", label: "Would you like to apply for a scholarship?", type: "yes-no", required: true, per: "booking" },
                { id: "emergency", label: "Emergency contact phone", type: "text", required: true, per: "booking" },
            ],
        },
    },
    {
        id: "junior-pathway-little-bennett",
        title: "Junior Pathway — Level 2",
        level: "Intermediate",
        audience: "Juniors",
        foxIsoDate: "2026-06-20",
        time: "9:00 AM – 10:30 AM",
        sessions: 8,
        courseSlug: "little-bennett",
        location: "Little Bennett short-game area",
        instructor: TERRENCE,
        price: 149,
        priceUnit: "for the series",
        capacity: 18,
        registered: 12,
        description:
            "The next step for juniors who have finished First Tee or a starter clinic and can already get around a few holes. Eight Saturday mornings that move from the range to the course, ending with the group playing nine holes and keeping a real score.",
        learn: ["Shaping a reliable full swing", "Short game from three lies", "Keeping a legitimate scorecard", "Preparing for a first junior tour event"],
        prerequisites: "Ages 9–14 who have completed a beginner program or can play three holes unassisted.",
        bring: ["Your own junior clubs", "Golf shoes", "Water and a snack"],
        provided: ["Range and short-game balls", "Nine holes on weeks six and eight", "Junior tour entry guidance"],
        rules: {
            age: { min: 9, max: 14 },
            gender: "any",
            equipmentProvided: false,
            questions: [
                { id: "completed", label: "Completed First Tee or a starter clinic?", type: "yes-no", required: true, per: "golfer" },
                { id: "emergency", label: "Emergency contact phone", type: "text", required: true, per: "booking" },
            ],
        },
    },
    {
        id: "play-nine-sligo",
        title: "Play Nine — Your First Round",
        level: "New to golf",
        audience: "Adults",
        foxIsoDate: "2026-06-24",
        time: "6:00 PM – 7:30 PM",
        sessions: 4,
        courseSlug: "sligo-creek",
        location: "Sligo Creek starter's hut",
        instructor: KAYLA,
        price: 89,
        priceUnit: "for the series",
        capacity: 12,
        registered: 7,
        description:
            "The cheapest way into golf the county runs, on the course that makes it possible. Sligo Creek is nine short holes inside the Beltway — par 34, no cart, ninety minutes — so every session is played on real holes rather than a mat. Four Wednesdays takes you from the first tee to finishing a card.",
        learn: ["Getting the ball airborne with a short iron", "Chipping and putting out, every hole", "Reading a scorecard and keeping your own score", "Pace, etiquette and where to stand"],
        prerequisites: "For adults who have never played a hole. Loaner clubs provided; nothing to buy first.",
        bring: ["Flat-soled shoes", "Water", "Nothing else"],
        provided: ["Loaner clubs each week", "Green fee for all four nines", "A scorecard from the last week to keep"],
    },
    {
        id: "teen-tour-prep-hampshire",
        title: "Teen Tour Prep — Tournament Ready",
        level: "Advanced",
        audience: "Teens",
        foxIsoDate: "2026-06-28",
        time: "3:00 PM – 5:00 PM",
        sessions: 6,
        courseSlug: "hampshire-greens",
        location: "Hampshire Greens tournament tees",
        instructor: ANDRE,
        price: 189,
        priceUnit: "for the series",
        capacity: 12,
        registered: 10,
        description:
            "Six Sundays aimed squarely at the MCG Junior Tour and the MCPS fall season. Half of each session is on the course under tournament conditions — play it as it lies, hole everything out, keep an official card — because that is the part range practice never covers.",
        learn: ["Pre-round preparation and a warm-up that works", "Course management under a real card", "Rules situations juniors actually hit", "Recovering from a double without losing the round"],
        prerequisites: "Ages 13–18 shooting roughly 90 or better for 18 holes. Bring a recent scorecard to the first session.",
        bring: ["Your full set", "Golf shoes and rain gear", "A rangefinder if you own one"],
        provided: ["Range balls and practice green access", "Nine tournament holes each week", "A USGA rules pocket guide"],
        rules: {
            age: { min: 13, max: 18 },
            gender: "any",
            equipmentProvided: false,
            questions: [{ id: "score", label: "Most recent 18-hole score", type: "text", required: true, hint: "Bring the card to the first session.", per: "golfer" }],
        },
    },
    {
        id: "family-saturday-rattlewood",
        title: "Saturday Family Golf — North County",
        level: "Beginner",
        audience: "All ages",
        foxIsoDate: "2026-07-11",
        time: "9:00 AM – 10:30 AM",
        sessions: 6,
        courseSlug: "rattlewood",
        location: "Rattlewood range and short-game area",
        instructor: TERRENCE,
        price: 120,
        priceUnit: "per family, any size",
        capacity: 10,
        registered: 6,
        description:
            "One price for a whole family, six Saturday mornings at Rattlewood. Adults and kids work the same station together rather than being split up, and the last two weeks move onto the course for three holes as a group. Built for the up-county families who are furthest from everything else the department runs.",
        learn: ["A grip and swing that works at any size", "Putting and chipping as a family game", "Three holes together, at your own pace", "How to practise at home for twenty minutes a week"],
        prerequisites: "Any family with at least one child aged 6 or older. No experience needed from anybody.",
        bring: ["Sunscreen and water", "Any clubs you already own"],
        provided: ["Junior and adult loaner clubs", "All range balls", "Three holes on the final two weeks"],
        rules: {
            gender: "any",
            equipmentProvided: true,
            questions: [{ id: "family-size", label: "How many in your family will attend?", type: "choice", options: ["2", "3", "4", "5", "6+"], required: true, per: "booking" }],
        },
    },
    {
        id: "short-game-school-needwood",
        title: "Saturday Short Game School",
        level: "All levels",
        audience: "Adults",
        foxIsoDate: "2026-07-11",
        time: "9:00 AM – 11:00 AM",
        sessions: 4,
        courseSlug: "needwood",
        location: "Needwood short-game area",
        instructor: DIANE,
        price: 45,
        priceUnit: "per session",
        capacity: 16,
        registered: 6,
        description:
            "Two hours inside forty yards, which is where most county golfers give away the majority of their strokes. Every Saturday stands on its own — book one, or book three and take half off all of them — and you leave each one with a shot you can actually repeat.",
        learn: ["A single chipping motion for most lies", "The pitch you can trust from thirty yards", "Getting out of a greenside bunker every time", "Speed control on Needwood's slower greens"],
        prerequisites: "Any ability. Genuinely useful whether you shoot 78 or 118.",
        bring: ["Your wedges and putter", "Golf shoes"],
        provided: ["Short-game and bunker balls", "Loaner wedges on request", "A one-page practice plan"],
        rules: { age: { min: 16 }, gender: "any", equipmentProvided: false, multiBuy: { buy: 3, percentOff: 50 } },
        perSession: { price: 45 },
    },
    {
        id: "rules-handicap-falls-road",
        title: "Rules & Handicap Workshop",
        level: "All levels",
        audience: "All ages",
        foxIsoDate: "2026-07-22",
        time: "6:00 PM – 7:30 PM",
        sessions: 1,
        courseSlug: "falls-road",
        location: "Falls Road clubhouse meeting room",
        instructor: KAYLA,
        price: 20,
        priceUnit: "per person",
        capacity: 30,
        registered: 17,
        description:
            "Ninety minutes that will save you an argument. A county rules official walks through the situations that actually come up in league and tournament play, then shows you how to set up a GHIN handicap and post a score correctly.",
        learn: ["Relief procedures you will genuinely use", "Penalty areas, out of bounds and the provisional", "Setting up and maintaining a GHIN index", "How net scoring and flighting work in MCG events"],
        prerequisites: "Anyone playing in a county league, tournament or junior event. No golf played on the night.",
        bring: ["A notebook, if you are that sort"],
        provided: ["Printed rules reference", "GHIN sign-up help on the spot", "Coffee and dessert"],
    },
    {
        id: "adaptive-open-crossvines",
        title: "Adaptive Golf Open Clinic",
        level: "All levels",
        audience: "All ages",
        foxIsoDate: "2026-08-08",
        time: "10:00 AM – 12:00 PM",
        sessions: 1,
        courseSlug: "crossvines",
        location: "The Crossvines practice facility",
        instructor: DIANE,
        price: 0,
        priceUnit: "free",
        capacity: 24,
        registered: 9,
        description:
            "A free open clinic for golfers with a physical or cognitive disability, and for anyone curious whether golf is available to them. Adaptive carts, single-rider seats and modified clubs are on hand; coaches work one-to-one at whatever pace suits.",
        learn: ["Setups that work seated, standing or supported", "Swinging with one arm or limited rotation", "Using a single-rider adaptive cart on course", "What county adaptive league play looks like"],
        prerequisites: "Open to all abilities and all ages. Carers and family are welcome to take part or watch.",
        bring: ["Whatever equipment you already use", "Comfortable clothing"],
        provided: ["Adaptive carts and single-rider seats", "Modified and loaner clubs", "One-to-one coaching, free of charge"],
        rules: {
            gender: "any",
            equipmentProvided: true,
            questions: [{ id: "support", label: "Equipment or support we should have ready", type: "text", required: false, per: "golfer" }],
        },
    },
    {
        id: "league-ready-crossvines",
        title: "League Ready — Play Nine with a Pro",
        level: "Intermediate",
        audience: "Adults",
        foxIsoDate: "2026-07-17",
        time: "5:30 PM – 8:00 PM",
        sessions: 4,
        courseSlug: "crossvines",
        location: "The Crossvines first tee",
        instructor: ANDRE,
        price: 129,
        priceUnit: "for the series",
        capacity: 12,
        registered: 12,
        description:
            "Four Friday evenings playing nine holes with a professional in the group, aimed at golfers who want to join a county league next season and are not sure they are ready. All coaching happens on the course, in the moment, on the shot you just hit.",
        learn: ["Playing to a pace a league expects", "Managing the card when a hole goes wrong", "League formats — best ball, scramble, alternate shot", "Where your handicap actually comes from"],
        prerequisites: "You can play nine holes and finish most holes. Roughly a 100–120 scorer for 18.",
        bring: ["Your full set", "Golf shoes", "Enough balls for nine holes"],
        provided: ["Nine holes with cart each week", "On-course coaching", "A league placement recommendation at the end"],
    },
    {
        id: "hs-skills-camp-little-bennett",
        programFormat: "junior-camp",
        title: "High School Skills Camp",
        level: "Advanced",
        audience: "Teens",
        foxIsoDate: "2026-08-10",
        time: "8:00 AM – 12:00 PM",
        sessions: 4,
        courseSlug: "little-bennett",
        location: "Little Bennett range and course",
        instructor: ANDRE,
        price: 175,
        priceUnit: "for the camp",
        capacity: 20,
        registered: 13,
        description:
            "Four mornings the week before MCPS tryouts, run by the coach of three county high-school teams. Full swing and short game in the morning block, nine holes at match pace after, and a tryout-format qualifying round on the Thursday.",
        learn: ["Tryout-day nerves and how to warm up for them", "Playing nine holes at match pace", "Match play tactics against a stronger opponent", "Building a two-week practice plan for the season"],
        prerequisites: "Grades 9–12 trying out for an MCPS team. Roughly 45 or better for nine holes.",
        bring: ["Your full set", "Golf shoes and rain gear", "A packed lunch for Thursday"],
        provided: ["Range balls each morning", "Nine holes daily with cart", "A written evaluation to hand your coach"],
        rules: {
            age: { min: 14, max: 18 },
            gender: "any",
            equipmentProvided: false,
            questions: [
                { id: "school", label: "High school", type: "text", required: true, per: "golfer" },
                { id: "grade", label: "Grade this fall", type: "choice", options: ["9", "10", "11", "12"], required: true, per: "golfer" },
            ],
        },
    },
];

/** A single session → once; camps meet on consecutive days (Mon–Thu); everything else weekly. */
const patternOf = (spec: ClinicSpec): RunPattern => (spec.sessions === 1 ? "once" : spec.programFormat === "junior-camp" ? "daily" : "weekly");

const scheduleOf = (startIso: string, spec: ClinicSpec, pattern: RunPattern): string => {
    const d = dateOfIso(startIso);
    if (pattern === "once") {
        const start = parseTime(spec.time.split("–")[0]) ?? 0;
        const part = start < 12 * 60 ? "morning" : start < 17 * 60 ? "afternoon" : "evening";
        return `One ${WEEKDAYS[d.getDay()]} ${part}, ${fmtMonthDay(startIso)}`;
    }
    if (pattern === "daily") {
        const last = addDays(d, spec.sessions - 1);
        const sameMonth = last.getMonth() === d.getMonth();
        return `${WEEKDAYS_SHORT[d.getDay()]}–${WEEKDAYS_SHORT[last.getDay()]}, ${fmtMonthDay(startIso)}–${sameMonth ? last.getDate() : fmtMonthDay(sessionDates(startIso, spec.sessions, "daily").at(-1)!)}`;
    }
    return `${WEEKDAYS[d.getDay()]}s from ${fmtMonthDay(startIso)}${spec.perSession ? " — pick your dates" : ""}`;
};

const build = (spec: ClinicSpec): McgClinic => {
    const { foxIsoDate, ...rest } = spec;
    const isoDate = rebaseIso(foxIsoDate, FOX_EVENTS_TODAY_ISO);
    const pattern = patternOf(spec);
    const dates = sessionDates(isoDate, spec.sessions, pattern);
    return {
        ...rest,
        isoDate,
        endIso: dates.at(-1)!,
        sessionDates: dates,
        days: runDays(isoDate, spec.sessions, pattern),
        pattern,
        schedule: scheduleOf(isoDate, spec, pattern),
        ...programArt(spec.id),
    };
};

/** Every county clinic, re-based onto Crane's calendar. */
export const MCG_CLINICS: McgClinic[] = CLINIC_SPECS.map(build);

export const clinicById = (id: string): McgClinic | undefined => MCG_CLINICS.find((c) => c.id === id);
export const clinicSpotsLeft = (c: { capacity: number; registered: number }) => Math.max(0, c.capacity - c.registered);
export const clinicIsFull = (c: { capacity: number; registered: number }) => clinicSpotsLeft(c) === 0;
