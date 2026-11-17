/**
 * MCG Golf Academy roster — ported from Fox Prototype 3 (`mcg-3/academy-roster.ts`), which
 * transcribed the live Academy pages on mcggolf.com (captured Sep 11, 2026).
 *
 * This is the source of truth for **instructor identity**: name, credential, title and which
 * courses they teach at. Ids are identical to Fox (`mike-kenny`, `doug-hamilton`, …) so deep
 * links carry over. Course slugs are Crane `Course` ids (`falls-road`, `sligo-creek`, …).
 *
 * Deliberately left out of the port:
 *  - **Personal contact details.** The site prints each instructor's own email and, for a few,
 *    a direct phone line. Crane shows generic Academy contact instead (`instructorContact`).
 *  - **Anything invented.** Bios exist only where the Academy publishes one (Mike Dickson).
 *    Specialisms, years teaching and real reviews are absent on purpose — see `reviews.ts`.
 *
 * The site's title "MCG Certifed Instructor" is misspelled on Doug Hamilton's cards; `role` is
 * the corrected title (render that), `roleRaw` keeps what's printed.
 */
import { courseById } from "@/data/crane";
import { COMING_SOON_PHOTO, headshotFor } from "./images";

/** The Academy's course strip, in the site's order — the order any course tab bar should use. */
export const ACADEMY_COURSE_ORDER: string[] = ["falls-road", "hampshire-greens", "laytonsville", "little-bennett", "northwest", "needwood", "crossvines", "rattlewood", "sligo-creek"];

/** Course id → display name ("Falls Road Golf Course"). */
export const courseName = (slug: string) => courseById(slug).id === slug ? courseById(slug).name : slug;
/** Course id → short name ("Falls Road"). */
export const courseShortName = (slug: string) => (courseById(slug).id === slug ? courseById(slug).shortName : slug);
/** Course id → town ("Potomac, MD"). */
export const courseLocation = (slug: string) => {
    const c = courseById(slug);
    return c.id === slug ? `${c.city}, ${c.state}` : "";
};

export type Credential = "PGA" | "Master PGA" | "LPGA" | "GM";

/** One instructor card from the MCG Golf Academy pages. */
export interface AcademyInstructor {
    /** kebab-case slug of the name, e.g. "mike-kenny". Unique across the roster. */
    id: string;
    /** Printed name without the credential suffix, e.g. "Mike Kenny". */
    name: string;
    credential: Credential | null;
    /** The instructor's title, spelling corrected. Render this one. */
    role: string;
    /** The title exactly as the site prints it. */
    roleRaw: string;
    /** Every course the card lists, in the order it lists them (Crane course ids). */
    courseSlugs: string[];
    /** The card's body copy, when it has any. Most have none. */
    bio: string | null;
    /** The card shows the grey placeholder and "Coming Soon" instead of a headshot. */
    comingSoon: boolean;
}

const i = (id: string, name: string, credential: Credential | null, role: string, courseSlugs: string[], extra: Partial<AcademyInstructor> = {}): AcademyInstructor => ({
    id,
    name,
    credential,
    role,
    roleRaw: role,
    courseSlugs,
    bio: null,
    comingSoon: false,
    ...extra,
});

/** Every instructor, in the site's order (course tab by course tab). Multi-course instructors appear once. */
export const ACADEMY_ROSTER: AcademyInstructor[] = [
    /* Falls Road — the largest staff in the county */
    i("mike-kenny", "Mike Kenny", "PGA", "Director Of Instruction", ["falls-road"]),
    i("brent-wilkerson", "Brent Wilkerson", null, "MCG Lead Instructor", ["falls-road"]),
    i("jamie-vermilye", "Jamie Vermilye", null, "MCG Certified Instructor", ["falls-road"]),
    i("john-ross", "John Ross", null, "MCG Certified Instructor", ["falls-road"]),
    i("paul-mohun", "Paul Mohun", null, "MCG Academy Instructor", ["falls-road"]),
    i("nick-fisher", "Nick Fisher", null, "MCG Academy Instructor", ["falls-road"]),
    // The county's one genuinely cross-course instructor: three courses, three calendars, one menu.
    i("doug-hamilton", "Doug Hamilton", "Master PGA", "MCG Certified Instructor", ["laytonsville", "little-bennett", "falls-road"], { roleRaw: "MCG Certifed Instructor" }),
    i("ej-dillon", "EJ Dillon", null, "MCG Academy Instructor", ["falls-road"]),
    i("kate-schanuel", "Kate Schanuel", "LPGA", "MCG Academy Instructor", ["falls-road"]),
    /* Laytonsville */
    i("brad-cameron", "Brad Cameron", null, "MCG Academy Instructor", ["laytonsville"]),
    i("shellie-ferguson", "Shellie Ferguson", "PGA", "MCG Academy Instructor", ["laytonsville"]),
    /* Little Bennett */
    i("mike-dickson", "Mike Dickson", "Master PGA", "MCG Master Instructor", ["little-bennett"], {
        // The only card on the Academy pages that carries body copy.
        bio: "MCG Golf Academy would like to congratulate Master Instructor Mike Dickson for being named one of GOLF Magazine's TOP 100 Instructors in the country. To learn more about Mike or book a lesson check out the link below.",
    }),
    i("jim-smithburger", "Jim Smithburger", null, "MCG Academy Instructor", ["little-bennett"], { comingSoon: true }),
    // As printed: his card sits on the Little Bennett tab but names Laytonsville.
    i("matt-jarvis", "Matt Jarvis", "GM", "MCG Academy Instructor", ["laytonsville"]),
    /* Northwest */
    i("martin-zadravec", "Martin Zadravec", null, "MCG Lead Instructor", ["northwest"]),
    i("billy-cullum", "Billy Cullum", "PGA", "MCG Certified Instructor", ["northwest"]),
    /* Needwood (Marty Johnson is also the whole of the Crossvines tab) */
    i("dustin-stearns", "Dustin Stearns", "PGA", "MCG Master Instructor", ["needwood"]),
    i("marty-johnson", "Marty Johnson", "PGA", "MCG Master Instructor", ["needwood", "crossvines"]),
    i("blessing-jasi", "Blessing Jasi", null, "MCG Academy Instructor", ["needwood"]),
    /* Rattlewood */
    i("terry-charlton", "Terry Charlton", null, "MCG Academy Instructor", ["rattlewood"]),
    i("bob-coope", "Bob Coope", null, "MCG Academy Instructor", ["rattlewood"]),
    i("brandon-jarvis", "Brandon Jarvis", null, "MCG Academy Instructor", ["rattlewood"]),
    /* Sligo Creek */
    i("dave-degirolamo", "Dave Degirolamo", "GM", "MCG Academy Instructor", ["sligo-creek"]),
    // Note: Fox's capture had no Hampshire Greens tab, so no instructors list Hampshire Greens.
];

/** Every instructor who teaches at a course, in roster order. */
export const academyInstructorsAt = (courseSlug: string): AcademyInstructor[] => ACADEMY_ROSTER.filter((x) => x.courseSlugs.includes(courseSlug));

export const academyInstructor = (id: string): AcademyInstructor | undefined => ACADEMY_ROSTER.find((x) => x.id === id);

/** "Mike Kenny, PGA" — the name as the Academy's card heading prints it. */
export const academyDisplayName = (x: { name: string; credential: string | null }): string => (x.credential ? `${x.name}, ${x.credential}` : x.name);

/**
 * A headshot URL, or `null` when the caller should fall back to initials (the "any available
 * instructor" card and anyone not on the roster). Coming-soon instructors get the placeholder.
 */
export const coachPhoto = (coach: { id: string; isAny?: boolean; comingSoon?: boolean }): string | null => {
    if (coach.isAny) return null;
    if (coach.comingSoon) return COMING_SOON_PHOTO;
    return headshotFor(coach.id) ?? null;
};

/** The roster's headshot (or the placeholder). */
export const instructorPhoto = (x: AcademyInstructor): string => coachPhoto(x) ?? COMING_SOON_PHOTO;

/**
 * How golfers reach the Academy — generic sample contact (555 numbers), used everywhere an
 * instructor card would print a personal email or direct line.
 */
export const ACADEMY_CONTACT = {
    name: "MCG Golf Academy",
    email: "academy@mcggolf.com",
    phone: "(301) 555-0109",
};

/** Contact line for an instructor: the Academy's email and the phone of their (first) home course. */
export const instructorContact = (x: { courseSlugs: string[] }): { email: string; phone: string; label: string } => {
    const home = x.courseSlugs[0] ? courseById(x.courseSlugs[0]) : undefined;
    const phone = home && home.id === x.courseSlugs[0] && home.phone ? home.phone : ACADEMY_CONTACT.phone;
    return { email: ACADEMY_CONTACT.email, phone, label: home && home.id === x.courseSlugs[0] ? `${home.shortName} pro shop` : ACADEMY_CONTACT.name };
};
