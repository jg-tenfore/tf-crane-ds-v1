/**
 * Instruction imagery, imported as Vite assets (URLs resolve in Storybook, every prototype and
 * the Pages build).
 *
 * - Headshots: `../images/headshots/<instructor-id>.webp` (400px). These are the MCG Golf
 *   Academy's public profile photos, the same set the Fox Storybook publishes; originals are in
 *   `images/courses/mcg-academy/headshots/`. `coming-soon.webp` is the Academy's placeholder.
 * - Academy lockup, banner and two real MCG photos (`images/courses/mcg/photos/`).
 * - Program art reuses Crane Web's generated event art (`src/screens/web/events/images/art/`)
 *   instead of Fox's generic event photos.
 */
import academyBannerUrl from "../images/academy-banner.webp";
import academyLessonUrl from "../images/academy-lesson.webp";
import academyLogoUrl from "../images/academy-logo.webp";
import academyRangeUrl from "../images/academy-range.webp";

const HEADSHOTS = import.meta.glob<string>("../images/headshots/*.webp", { eager: true, import: "default" });
const EVENT_ART = import.meta.glob<string>("../../events/images/art/*.webp", { eager: true, import: "default" });

/** The MCG Golf Academy lockup (graduation cap + golfers). Full colour: show it on a white tile in dark mode. */
export const academyLogo = academyLogoUrl;
/** The Academy page banner (an aerial green, 1200 × 377). */
export const academyBanner = academyBannerUrl;
/** A real MCG lesson on the range (portrait). */
export const academyLessonPhoto = academyLessonUrl;
/** A real MCG driving range (landscape). */
export const academyRangePhoto = academyRangeUrl;

/** The Academy's placeholder for an instructor whose photo isn't published yet. */
export const COMING_SOON_PHOTO = HEADSHOTS["../images/headshots/coming-soon.webp"];

/** A headshot by instructor id, or undefined when there isn't one. */
export const headshotFor = (id: string): string | undefined => HEADSHOTS[`../images/headshots/${id}.webp`];

/** Card (3:2) and banner (21:9) art for an event-art id, e.g. "golf-101". */
export const eventArt = (artId: string): { image?: string; banner?: string } => ({
    image: EVENT_ART[`../../events/images/art/${artId}-card.webp`],
    banner: EVENT_ART[`../../events/images/art/${artId}-banner.webp`],
});

/**
 * Which piece of Crane event art stands in for each group program (Academy programs and
 * county clinics, by Fox id). Fox used a shared set of seven generic photos.
 */
const PROGRAM_ART: Record<string, string> = {
    // Academy programs
    "clinic-adult-l2": "driver-distance-clinic",
    "clinic-scoring": "short-game-series",
    "clinic-launch-lab": "club-fitting-demo-day",
    "clinic-get-golf-ready": "golf-101",
    "clinic-junior-first": "junior-fall-academy",
    "camp-junior-summer": "junior-halloween-chip-putt",
    "clinic-wedge": "putting-lab",
    // County clinics
    "junior-league-northwest": "junior-fall-academy",
    "op36-little-bennett": "junior-halloween-chip-putt",
    "junior-camp-needwood": "junior-fall-academy",
    "girls-golf-needwood": "junior-halloween-chip-putt",
    "ggr-northwest": "golf-101",
    "ggr-needwood": "golf-101",
    "women-on-course-falls-road": "ladies-9-hole-league",
    "senior-swing-laytonsville": "senior-mens-league",
    "first-tee-summer-northwest": "junior-fall-academy",
    "junior-pathway-little-bennett": "junior-halloween-chip-putt",
    "play-nine-sligo": "playing-lesson",
    "teen-tour-prep-hampshire": "club-championship-finals",
    "family-saturday-rattlewood": "golf-101",
    "short-game-school-needwood": "short-game-series",
    "rules-handicap-falls-road": "member-guest-invitational",
    "adaptive-open-crossvines": "playing-lesson",
    "league-ready-crossvines": "couples-twilight-league",
    "hs-skills-camp-little-bennett": "long-drive-ctp",
};

/** Card + banner art for a program id (falls back to the range photo). */
export const programArt = (programId: string): { image: string; banner: string } => {
    const art = eventArt(PROGRAM_ART[programId] ?? "");
    return { image: art.image ?? academyRangePhoto, banner: art.banner ?? art.image ?? academyRangePhoto };
};
