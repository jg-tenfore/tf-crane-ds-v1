/**
 * Club profiles for the white-label customization R&D (Nov 24, 2026 call): what a course would set in
 * Buck's "App appearance" page, for the five sample clubs Crane already has. Only the four "dials" chosen
 * for the first pass: a palette, a hero photo, the logo + name, and an announcements feed. Layout
 * presets and fonts come later, if at all.
 *
 * Sample content only: posts, dates and offers are made up.
 */
import { coursePhotos } from "@/screens/chrome/course-photos";
import foliageScrambleArt from "@/screens/web/events/images/art/fall-foliage-scramble-card.webp";
import juniorAcademyArt from "@/screens/web/events/images/art/junior-fall-academy-card.webp";
import { DEFAULT_PALETTE_ID } from "./club-themes";

export interface FeedPost {
    id: string;
    kind: "news" | "event" | "offer" | "course";
    title: string;
    body: string;
    /** Optional image (Vite asset URL). */
    image?: string;
    /** "Pinned" stays at the top until unpinned. */
    pinned?: boolean;
    /** Shown as "Posted Oct 7"; sample dates around Crane's TODAY (Oct 9, 2026). */
    postedOn: Date;
    /** Hidden after this day (e.g. an offer). */
    expiresOn?: Date;
    /** Optional call to action, e.g. "Book a tee time" → "/home". */
    cta?: { label: string; href: string };
}

export interface ClubProfile {
    /** A course id from src/data/crane.ts (its name and logo). */
    courseId: string;
    /** The name on the home header (defaults to the course name). */
    displayName?: string;
    /**
     * An organization whose logo the club uses instead of the course's own (a name courseBrandFor
     * knows, e.g. "Montgomery County Golf"). Separate from displayName, so renaming never loses the logo.
     */
    logoOrg?: string;
    /** One line under the name. */
    tagline: string;
    paletteId: string;
    /**
     * The hero photo the course uploaded (Vite asset URL). Missing → the hero falls back to the org's
     * default photo set (src/screens/web/instruction/data/default-art.ts), never a TenFore logo.
     */
    heroPhoto?: string;
    /** Where the important part of the photo is, for cropping (0–1 from the left / top). */
    heroFocus?: { x: number; y: number };
    feed: FeedPost[];
}

const d = (month: number, day: number) => new Date(2026, month - 1, day);

export const CLUB_PROFILES: ClubProfile[] = [
    {
        courseId: "sagamore-spring",
        tagline: "Lynnfield, MA · Since 1929",
        paletteId: "pine",
        feed: [
            { id: "ss-1", kind: "course", title: "Greens aeration Oct 13–14", body: "Greens will be punched and sanded Tuesday and Wednesday. Rates are reduced both days.", pinned: true, postedOn: d(10, 6) },
            { id: "ss-2", kind: "event", title: "Fall Foliage Scramble · Oct 17", body: "Four-person scramble, shotgun at 8:00 AM. Lunch on the patio after.", postedOn: d(10, 2), image: foliageScrambleArt, cta: { label: "See the event", href: "/events" } },
            { id: "ss-3", kind: "offer", title: "Twilight after 3 PM: $35", body: "18 holes with cart, weekdays through October.", postedOn: d(10, 1), expiresOn: d(10, 31), cta: { label: "Book a tee time", href: "/home" } },
            // Expired: the app hides it (still listed in Buck, marked expired).
            { id: "ss-4", kind: "offer", title: "Labor Day weekend: free cart", body: "Free cart with any 18-hole round, Sat–Mon.", postedOn: d(8, 28), expiresOn: d(9, 7) },
        ],
    },
    {
        courseId: "falls-road",
        displayName: "Montgomery County Golf",
        logoOrg: "Montgomery County Golf",
        tagline: "Nine county courses · Falls Road",
        paletteId: "fairway",
        heroPhoto: coursePhotos.fallsRoad,
        heroFocus: { x: 0.5, y: 0.6 },
        feed: [
            { id: "mcg-1", kind: "news", title: "Winter rates start Nov 1", body: "Weekday rounds drop to $29 at all nine courses.", pinned: true, postedOn: d(10, 5) },
            { id: "mcg-2", kind: "event", title: "Junior clinic sign-ups are open", body: "Saturday mornings at Needwood and Falls Road, ages 7–12.", postedOn: d(10, 3), image: juniorAcademyArt, cta: { label: "See clinics", href: "/home" } },
        ],
    },
    {
        courseId: "kettle-hills",
        tagline: "Richfield, WI · 45 holes",
        paletteId: "olive",
        heroPhoto: coursePhotos.kettleHills,
        heroFocus: { x: 0.5, y: 0.5 },
        feed: [
            { id: "kh-1", kind: "course", title: "Cart path only on Ponds", body: "After overnight rain, carts stay on paths on the Ponds course today.", pinned: true, postedOn: d(10, 9) },
            { id: "kh-2", kind: "offer", title: "Fall punch card: 10 rounds for $299", body: "Good any day after 11 AM through November.", postedOn: d(10, 4), expiresOn: d(11, 30) },
        ],
    },
    {
        courseId: "memorial-park",
        tagline: "Houston, TX · Municipal championship course",
        paletteId: "navy",
        heroPhoto: coursePhotos.memorialPark,
        heroFocus: { x: 0.5, y: 0.55 },
        feed: [
            { id: "mp-1", kind: "news", title: "New practice range hours", body: "The range opens at 6:30 AM on weekdays starting Monday.", postedOn: d(10, 7) },
            { id: "mp-2", kind: "event", title: "City Amateur qualifying", body: "Qualifying rounds Oct 24–25. Course closed to public play until 1 PM.", pinned: true, postedOn: d(10, 8) },
        ],
    },
    {
        courseId: "flogolf",
        tagline: "Indoor golf lounge · Simulators & bar",
        paletteId: "charcoal",
        heroPhoto: coursePhotos.flogolf,
        heroFocus: { x: 0.5, y: 0.5 },
        feed: [
            { id: "fg-1", kind: "offer", title: "Monday night league", body: "Two-person teams, 8 weeks, starts Oct 19. Bay time and a bucket of wings included.", pinned: true, postedOn: d(10, 6), cta: { label: "Join the league", href: "/home" } },
            { id: "fg-2", kind: "news", title: "New simulator software", body: "Every bay now has 40 more courses to play.", postedOn: d(9, 28) },
        ],
    },
];

export const clubProfileFor = (courseId: string | undefined): ClubProfile =>
    CLUB_PROFILES.find((c) => c.courseId === courseId) ?? { courseId: courseId ?? "sagamore-spring", tagline: "", paletteId: DEFAULT_PALETTE_ID, feed: [] };
